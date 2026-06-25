---
layout: post
title: "[SparseVLM] Visual Token Sparsification for Efficient Vision-Language Model Inference"
date: 2024-10-06
description: "Training-free, text-guided visual token sparsification inside the LLM — relevant text tokens act as 'raters' to score visual tokens via self-attention, a rank-based rule sets the per-layer ratio, and pruned tokens are recycled by clustering. 4.5× compression keeping 97% on LLaVA; beats FastV."
thumbnail: assets/img/notes/sparsevlm/fig2.png
categories: efficient-vlm
tags: llm-side
shortname: SparseVLM
venue: ICML 2025
giscus_comments: false
related_posts: false
toc:
  sidebar: right
_styles: >
  .post-title { font-size: 1.6rem; line-height: 1.35; }
  .post-content { font-size: 0.92rem; line-height: 1.75; }
  .post-content h2 { font-size: 1.25rem; margin-top: 1.8rem; }
  .post-content h3 { font-size: 1.02rem; }
  .post-content blockquote { border-left-color: #e1acac; }
  .post-content a:not(.btn) { color: #e1acac; }
  .post-content table { font-size: 0.8rem; }
  .post-content figure { max-width: 620px; margin-left: auto; margin-right: auto; }
  .post-content .tr-callout { background-color: rgba(225,172,172,0.18); border-left: 4px solid #e1acac; }
  .post-content .tr-callout p { margin-bottom: 0; }
  .post-content .sv-card .card { border-left: 4px solid #e1acac; }
  .post-content .sv-card .card-title { font-size: 0.95rem; font-weight: 700; }
  .post-content .sv-card .card-text { font-size: 0.82rem; line-height: 1.6; }
  .post-content .eval-tab table { width: 100%; font-size: 0.7rem; margin: 0.3rem 0; }
  .post-content .eval-tab thead { display: none; }
  .post-content .eval-tab td { font-size: 0.7rem; padding: 0.35rem 0.6rem; vertical-align: top; border: 0; border-bottom: 1px solid rgba(225,172,172,0.25); }
  .post-content .eval-tab td:first-child { white-space: nowrap; font-weight: 700; color: #1c1c1d; background: rgba(225,172,172,0.18); border-left: 3px solid #e1acac; width: 22%; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#e1acac;color:#1c1c1d">LLM</span>
  <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">ICML 2025</span>
</div>
<p class="text-muted mb-3">Yuan Zhang, Chun-Kai Fan, … Shanghang Zhang 외 · Peking University 외</p>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://arxiv.org/abs/2410.04417" target="_blank" rel="noopener noreferrer">arXiv</a>
  <a class="btn btn-sm btn-outline-dark" href="https://github.com/Gumpest/SparseVLMs" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github me-1"></i> GitHub</a>
</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> 시각 토큰을 <strong>질문(text) 가이드로, 학습 없이</strong> 솎아내는 LLM-side 방법. 기존엔 별도 가지치기 네트워크를 <strong>학습</strong>했지만, SparseVLM은 <strong>training-free</strong>(추가 파라미터·fine-tuning 0). 네 단계 — ① 관련 <strong>텍스트 토큰을 "평가자(raters)"</strong> 로 고르고 ② VLM의 <strong>self-attention</strong>으로 시각 토큰 중요도를 매긴 뒤 ③ attention 행렬의 <strong>rank(중복도)로 층마다 적응적 압축률</strong>을 정하고 ④ 버린 토큰은 <strong>클러스터링해 재활용(recycle)</strong>. LLaVA에서 <strong>4.5× 압축에 성능 97% 유지</strong>(지연 −37%·정확도 −0.9%), <a href="{% post_url 2024-03-11-fastv %}">FastV</a>를 <strong>11~20%p</strong> 능가. 이미지·비디오 모두.</p>
</div>

## 배경

VLM에서 시각 토큰은 텍스트보다 정보 밀도가 낮은데도 **연산을 크게 차지**한다 — 예: LLaVA에서 **672×672 이미지 한 장이 2304 토큰**으로 컨텍스트의 절반 이상을 먹는다. 기존 방법들엔 두 가지 결이 있었다.

- **학습형 가지치기** — 대개 **가지치기 네트워크를 학습 데이터로 훈련**(추가 파라미터·fine-tuning). 비용이 들고 모델에 결합돼 이식이 어렵다.
- **디코딩 단계 축소인데 텍스트를 무시** — <a href="{% post_url 2024-03-11-fastv %}">FastV</a> 등 LLM 내부에서 자르는 방법도 있지만 **언어 토큰의 가이드를 안 쓴다** → 멀티모달 패러다임에 어긋난다. **질문에 따라** 모델이 주목하는 영역(전경/배경)이 달라지는데, 고정 기준으로 자르면 그 질문에 필요한 토큰을 잃는다.

> 그럼 **질문(text)을 가이드로, 학습 없이, 게다가 이미지마다·층마다 적응적으로** 시각 토큰을 솎아낼 수 없을까? (참고: 사용자 정리 *Lightweight LVLM*·*VLM Summary*의 SparseVLM 항목과 동일한 4단계 구조.)

{% include figure.liquid loading="eager" path="assets/img/notes/sparsevlm/fig2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 2. SparseVLM 개요. 관련 텍스트 토큰(raters)으로 self-attention 상에서 시각 토큰 중요도를 매기고, 층마다 attention rank로 적응적 압축률을 정해 가지치기 + 버린 토큰을 재활용한다. FlashAttention과 호환되도록 attention 행렬을 추출." %}

## 방법 — 4단계

<div class="row g-3 my-3 sv-card">
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <div class="card-title">① Select Raters (평가자 선택)</div>
      <p class="card-text mb-0">질문 토큰 전부를 기준으로 쓰면 안 된다 — <strong>시각과 무관한 토큰이 많다</strong>(예: 약 이름 "Tylenol·Advil"이나 "sticker·fridge"만 시각 관련). 그래서 <strong>cross-attention으로 "시각 신호와 강하게 연관된" 텍스트 토큰</strong>만 골라 <strong>raters(평가자)</strong> 로 삼는다.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <div class="card-title">② Significance Estimation (중요도 추정)</div>
      <p class="card-text mb-0">raters와 시각 토큰의 <strong>self-attention</strong> 점수로 각 시각 토큰이 <strong>질문에 얼마나 관련</strong> 있는지 평가. (FlashAttention 환경에서도 attention 행렬을 추출해 호환)</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <div class="card-title">③ Rank-based Sparsification (적응적 압축)</div>
      <p class="card-text mb-0">고정 비율이 아니다. attention 행렬 P가 <strong>full-rank면 행들이 독립</strong>(중복 없음)이라는 점을 이용 — <strong>차원 − rank(P) = 중복도</strong>로 보고, 그 차이에 scaling factor를 곱해 <strong>층마다·이미지마다 자를 개수</strong>를 적응적으로 정한다.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <div class="card-title">④ Token Recycling (재활용)</div>
      <p class="card-text mb-0">버린 토큰을 바로 버리지 않고 <strong>KNN으로 묶어(cluster) 소수의 토큰으로 aggregate·재구성(reconstruct)</strong> → 시각 디테일을 적은 토큰에 보존, 정보 손실 최소화.</p>
    </div>
  </div>
</div>

- **training-free plug-and-play** — 추가 파라미터·fine-tuning 없이 기존 VLM에 바로 끼운다. 한 Transformer 층당 약 6(N−C)D² + 2(N−C)²D FLOPs 절감(N=가지친 수, C=재활용 수).

{% include figure.liquid loading="lazy" path="assets/img/notes/sparsevlm/fig3.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 3. raters 선택의 근거 — 프롬프트와 이미지의 상관. 질문 토큰 상당수는 시각 관련이 거의 없어(연한 빨강), 시각과 강하게 연관된 토큰만 raters로 골라야 평가가 안정적이다." %}

### FlashAttention 호환 — dual-flash attention

- **문제.** attention 점수로 토큰을 골라야 하는데, **FlashAttention은 속도를 위해 attention 행렬을 내놓지 않는다.**
- **해법 = forward 2번(dual-flash).**
  - **1차** — 일반 FlashAttention 그대로 → 은닉상태 생성.
  - **2차** — **rater 행만 `1/(rater 수)`로 채운 특수 V 행렬**을 넣으면, attention map과의 내적이 곧 **rater 평균 attention 점수**를 FlashAttention 안에서 바로 돌려준다.
- **결과.** 그 점수로 **top-k 시각 토큰만 남기고** 나머지는 mask 처리 → **FlashAttention 속도를 그대로 유지**하며 가지치기.

## 적용·평가

<div class="eval-tab" markdown="1">

| 항목 | 내용 |
| --- | --- |
| **적용 모델** | **LLaVA-1.5** · **Mini-Gemini** · **Qwen2-VL** · **Video-LLaVA** (이미지+비디오) |
| **이미지 데이터셋** | GQA · MMBench · MME · MMVet · POPE · SEED · ScienceQA · TextVQA · VQAv2 · VizWiz |
| **비디오 데이터셋** | TGIF-QA · MSVD-QA · MSRVTT-QA · ActivityNet-QA · NExT-QA |
| **Task** | Image·Video Understanding (VQA·OCR·환각·종합·비디오 QA) |
| **대표 결과** | LLaVA **4.5× 압축에 성능 97% 유지**(지연 **−37%**, −0.9%) · **FastV 대비 +11.2~17.3%**(LLaVA)·+9.2~20.4%(Mini-Gemini)·+14.7%(Video-LLaVA) |

</div>

## 결과

<div class="row justify-content-center"><div class="col-lg-9 col-md-11">
{% include figure.liquid loading="lazy" path="assets/img/notes/sparsevlm/table1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Table 1. SparseLLaVA를 여러 시각 토큰 설정(원본 576개)에서 비교. 토큰을 크게 줄여도 정확도를 유지하며, 같은 토큰 수에서 기존 방법을 앞선다." %}
</div></div>

- **압축·정확도** — LLaVA-1.5에서 **4.5× 압축에 성능 97% 유지**(지연 −37%, 평균 −0.9%).
- **동급 대비** — 같은 설정에서 **FastV 대비 +11.2~17.3%p**(LLaVA), Mini-Gemini +9.2~20.4%, Video-LLaVA +14.7% — Qwen2-VL(Table 2)·Video-LLaVA(Table 3)·MGM(Fig 4)로도 일반화.

## 한 줄 정리 & 의의

- **질문 가이드 · 학습 없는 시각 토큰 희소화.** ①raters ②self-attention 중요도 ③rank 기반 적응 압축 ④재활용 — 4단계로 정보 손실을 줄이며 줄인다.
- **차별점.** 가지치기 네트워크를 학습하던 방식과 달리 **training-free**. <a href="{% post_url 2024-03-11-fastv %}">FastV</a>가 attention 점수로 한 층에서 자른다면, SparseVLM은 **질문 관련 raters + rank 기반 적응 비율 + 재활용**으로 같은 지연에서 더 높은 정확도(FastV +11~20%p).
- **위치.** <strong>LLM</strong> — LLM 내부 self-attention 단계에서 질문을 보고 줄인다. → <a href="{% post_url 2026-06-23-efficient-vlm-overview %}">Efficient VLM 개요</a>
