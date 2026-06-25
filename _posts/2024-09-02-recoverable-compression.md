---
layout: post
title: "[Recoverable Compression] A Multimodal Vision Token Recovery Mechanism Guided by Text Information"
date: 2024-09-02
description: "Beyond pruning: after an initial CLS-based filter, it recovers visual tokens that are similar to the question text (reclaiming wrongly-dropped but answer-relevant ones) and merges the rest — training-free, compressing visual tokens to ~10% with competitive accuracy on LLaVA-1.5."
thumbnail: assets/img/notes/recoverable/fig2.png
categories: efficient-vlm
tags: bridge
shortname: Recoverable Compression
venue: AAAI 2025
giscus_comments: false
related_posts: false
toc:
  sidebar: right
_styles: >
  .post-title { font-size: 1.6rem; line-height: 1.35; }
  .post-content { font-size: 0.92rem; line-height: 1.75; }
  .post-content h2 { font-size: 1.25rem; margin-top: 1.8rem; }
  .post-content h3 { font-size: 1.02rem; }
  .post-content blockquote { border-left-color: #ca8787; }
  .post-content table { font-size: 0.8rem; }
  .post-content figure { max-width: 620px; margin-left: auto; margin-right: auto; }
  .post-content .tr-callout { background-color: rgba(202,135,135,0.12); border-left: 4px solid #ca8787; }
  .post-content .tr-callout p { margin-bottom: 0; }
  .post-content .rc-card .card { border-left: 4px solid #ca8787; }
  .post-content .rc-card .card-title { font-size: 0.95rem; font-weight: 700; }
  .post-content .rc-card .card-text { font-size: 0.82rem; line-height: 1.6; }
  .post-content .eval-tab table { width: 100%; font-size: 0.7rem; margin: 0.3rem 0; }
  .post-content .eval-tab thead { display: none; }
  .post-content .eval-tab td { font-size: 0.7rem; padding: 0.35rem 0.6rem; vertical-align: top; border: 0; border-bottom: 1px solid rgba(202,135,135,0.22); }
  .post-content .eval-tab td:first-child { white-space: nowrap; font-weight: 700; color: #1c1c1d; background: rgba(202,135,135,0.16); border-left: 3px solid #ca8787; width: 22%; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#ca8787;color:#fff">Bridge</span>
  <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff">AAAI 2025</span>
</div>
<p class="text-muted mb-3">Yi Chen, Jian Xu, … Cheng-Lin Liu · UCAS / CASIA (MAIS)</p>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://arxiv.org/abs/2409.01179" target="_blank" rel="noopener noreferrer">arXiv</a>
  <a class="btn btn-sm btn-outline-dark" href="https://github.com/banjiuyufen/RecoverableCompression" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github me-1"></i> GitHub</a>
</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> <strong>순수 시각만 보고 자르면</strong> 답에 필요한 토큰을 과하게 버린다(oversimplification). Recoverable Compression은 LLM에 넣기 전(<strong>브리지</strong>) 단계에서 <strong>"버린 뒤 되살리는"</strong> 3단계 — ① ViT의 <strong>CLS 토큰 유사도</strong>로 1차 필터링 ② 버려진 토큰 중 <strong>질문 텍스트와 유사도가 높은 것</strong>을 다시 <strong>복구(recover)</strong> ③ 남은 덜 중요한 토큰은 <strong>병합</strong>. 동적 스케일 필터링으로 토큰 수를 정한다. <strong>training-free</strong>. 시각 토큰을 평균 <strong>원본의 ~10%</strong>로 줄이면서 성능은 원모델과 대등. (가지치기를 넘어 <strong>2차 복구</strong>를 넣은 게 정체성.)</p>
</div>

## 배경

LMM은 시각 특징을 LLM에 넣어 쓰므로 **시각 토큰 수가 곧 속도**다. ViT 토큰 가지치기는 많지만, LMM에 그대로 쓰면 문제가 있다.

- **순수 시각 기반의 위험** — 시각 정보만으로 자르면 **질문에 꼭 필요한 토큰까지** 버리는 과압축이 생긴다.
- **질문엔 단서가 있다** — 질문(텍스트)은 "무엇을 봐야 하는지"에 대한 **추가 지식**을 담고 있다. 이를 쓰면 어떤 시각 토큰을 살려야 할지 알 수 있다.

> 그럼 일단 줄이되, **질문과 관련된 토큰은 다시 되살리고(recover)** 나머지는 합치면, 적은 토큰으로도 답에 필요한 정보를 지킬 수 있지 않을까?

{% include figure.liquid loading="eager" path="assets/img/notes/recoverable/fig2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 2. Recoverable Compression. CLS 유사도로 1차 필터 → 질문 텍스트와 유사한 토큰을 버려진 것들 중에서 복구 → 남은 토큰 병합. 학습 없이 질문을 단서로 '버리고 되살린다'." %}

## 핵심 — 3단계

<div class="row g-3 my-3 rc-card">
  <div class="col-md-4">
    <div class="card h-100 p-3">
      <div class="card-title">① CLS 기반 1차 필터</div>
      <p class="card-text mb-0">ViT의 <strong>CLS 토큰</strong>(이미지 전역 표현)과 각 시각 토큰의 <strong>유사도</strong>로 일단 중요한 토큰을 추린다.</p>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card h-100 p-3">
      <div class="card-title">② 텍스트 가이드 복구(recover)</div>
      <p class="card-text mb-0">1차에서 <strong>버려진 토큰</strong> 중, <strong>질문 텍스트와 유사도가 높은</strong> 토큰을 <strong>다시 되살린다</strong> — 순수 시각 기준이 놓친 "답에 필요한" 토큰을 회수.</p>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card h-100 p-3">
      <div class="card-title">③ 나머지 병합 (merge)</div>
      <p class="card-text mb-0">끝까지 덜 중요한 토큰은 버리지 않고 <strong>병합</strong>해 정보 손실을 줄인다. 동적 스케일 필터링으로 유지 개수를 정함.</p>
    </div>
  </div>
</div>

- **학습** — 추가 파라미터·fine-tuning 없는 **training-free**(plug-and-play).
- **정체성** — 다른 가지치기와 달리 **버린 뒤 2차로 되살리는(recover)** 단계를 둔 게 핵심. (텍스트 가이드라는 점에서 <a href="{% post_url 2024-10-06-sparsevlm %}">SparseVLM</a>과 한 계열.)

## 적용·평가

<div class="eval-tab" markdown="1">

| 항목 | 내용 |
| --- | --- |
| **적용 모델** | **LLaVA-1.5** |
| **데이터셋** | GQA · MMBench · MME · POPE · ScienceQA · TextVQA · VQAv2 · VizWiz |
| **Task** | Image Understanding (VQA · OCR · 환각 · 종합) |
| **대표 결과** | 시각 토큰 평균 **원본의 ~10%로 압축**하면서 원모델과 **대등한 성능** |

</div>

## 결과

### 정량

<div class="row justify-content-center"><div class="col-lg-9 col-md-11">
{% include figure.liquid loading="lazy" path="assets/img/notes/recoverable/table4.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Table 4. LLaVA-1.5에서 토큰을 평균 ~10%까지 압축해도 8개 벤치(GQA·MMB·MME·POPE·SQA·TextVQA·VQAv2·VizWiz) 정확도가 원모델과 대등." %}
</div></div>

- **압축률** — 시각 토큰을 평균 **원본의 ~10%**로 줄여도 원모델과 **대등**.
- **같은 비율 비교(Table 2)** — 비슷한 토큰 수에서 기존 가지치기 대비 우수 — 특히 **질문 단서가 중요한** OCR형(TextVQA)·ScienceQA에서 복구 효과가 두드러진다.

### 정성

<div class="row justify-content-center"><div class="col-lg-7 col-md-9">
{% include figure.liquid loading="lazy" path="assets/img/notes/recoverable/fig3.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 3. 시각 분석. 순수 시각(CLS) 필터가 버린 토큰 중 질문과 관련된 영역이 복구되어 남는 모습 — 답에 필요한 토큰이 회수된다." %}
</div></div>

- **복구의 효과(Fig 3).** CLS 기반 1차 필터가 놓친 **질문 관련 영역의 토큰**이 2차 복구로 되살아남을 시각적으로 확인 — "버린 뒤 되살린다"가 실제로 답 영역을 지켜낸다.

## 한 줄 정리 & 의의

- **"버리고 되살린다" — 질문 가이드 복구로 과압축을 막는 토큰 압축.** ①CLS 1차 필터 ②텍스트 유사 토큰 복구 ③나머지 병합, 학습 없이 ~10%까지.
- **차별점.** 대부분 *버리기만* 하는데, Recoverable은 **2차 복구**로 답에 필요한 토큰을 회수한다. LLM 전(**브리지**)에서 동작하며 질문을 단서로 쓴다(텍스트 가이드 계열 = SparseVLM과 유사, 다만 *복구* 중심).
- **위치.** <strong>Bridge</strong> — 인코더와 LLM 사이에서 줄이되 텍스트로 복구. → <a href="{% post_url 2026-06-23-efficient-vlm-overview %}">Efficient VLM 개요</a>
