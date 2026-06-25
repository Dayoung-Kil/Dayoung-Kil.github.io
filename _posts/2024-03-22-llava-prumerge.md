---
layout: post
title: "[LLaVA-PruMerge] Adaptive Token Reduction for Efficient Large Multimodal Models"
date: 2024-03-22
description: "The CLS-to-patch attention in the vision encoder is sparse — only a few visual tokens matter. PruMerge exploits this: it uses IQR outlier detection to adaptively keep the important tokens (more on text-rich images, fewer on simple ones), then merges the rest into them via k-NN weighted averaging. Training-free; ~5.5% of tokens (~32 of 576) keeps LLaVA-1.5 performance."
thumbnail: assets/img/notes/prumerge/fig2.png
categories: efficient-vlm
tags: bridge
shortname: LLaVA-PruMerge
venue: ICCV 2025
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
  .post-content .pm-card .card { border-left: 4px solid #ca8787; }
  .post-content .pm-card .card-title { font-size: 0.95rem; font-weight: 700; }
  .post-content .pm-card .card-text { font-size: 0.82rem; line-height: 1.6; }
  .post-content .eval-tab table { width: 100%; font-size: 0.7rem; margin: 0.3rem 0; }
  .post-content .eval-tab thead { display: none; }
  .post-content .eval-tab td { font-size: 0.7rem; padding: 0.35rem 0.6rem; vertical-align: top; border: 0; border-bottom: 1px solid rgba(202,135,135,0.22); }
  .post-content .eval-tab td:first-child { white-space: nowrap; font-weight: 700; color: #1c1c1d; background: rgba(202,135,135,0.16); border-left: 3px solid #ca8787; width: 22%; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#ca8787;color:#fff">Bridge</span>
  <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff">ICCV 2025</span>
</div>
<p class="text-muted mb-3">Yuzhang Shang, Mu Cai, Bingxin Xu, Yong Jae Lee, Yan Yan · UCF / UW-Madison / USC / UIC</p>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://arxiv.org/abs/2403.15388" target="_blank" rel="noopener noreferrer">arXiv</a>
  <a class="btn btn-sm btn-outline-dark" href="https://github.com/42Shawn/LLaVA-PruMerge" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github me-1"></i> GitHub</a>
</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> 비전 인코더의 <strong>CLS 토큰 ↔ 패치 토큰 attention이 희소(sparse)</strong>하다 — 소수 토큰만 핵심 정보를 갖는다는 관찰. PruMerge는 이를 이용해 LLM에 넣기 전(<strong>브리지</strong>) 토큰을 <strong>적응적으로 줄인다</strong> — ① <strong>IQR(사분위 범위) 이상치 탐지</strong>로 중요 토큰을 <strong>입력마다 다른 개수</strong>로 선택(글자 많은 복잡한 이미지엔 더 많이, 단순한 이미지엔 더 적게), ② 버릴 토큰을 <strong>k-NN으로 묶어</strong> 남은 토큰에 <strong>가중 평균으로 병합</strong>해 정보를 보충. 공간적으로 균일하게 토큰을 더 보태는 <strong>PruMerge+</strong>도 제안. <strong>training-free</strong>(추론만으로 적용). LLaVA-1.5에서 시각 토큰의 <strong>약 5.5%</strong>(평균 576→~32개)만으로 원본과 대등, prefill FLOPs <strong>4~10×↓</strong>.</p>
</div>

## 배경

LMM은 CLIP 인코더의 시각 토큰(예: 576개)을 prefix로 통째로 받아 쓰는데, 고해상도·비디오로 갈수록 토큰이 급증하고 비용은 토큰 수에 **제곱으로** 늘어난다.

- **공간적 중복** — 시각 토큰 상당수가 중복이라, 대부분을 버려도 성능 손실이 작다.
- **희소한 CLS attention** — 인코더 self-attention에서 **CLS 토큰과 패치 토큰의 유사도(attention)가 희소**하다 — 소수의 패치만 핵심 시각 정보와 연결돼 있다. 이 희소성이 "어떤 토큰이 중요한가"의 단서가 된다.

> 그럼 고정 개수로 자르지 말고, **CLS attention의 희소성**을 읽어 **입력마다 중요한 만큼만** 남기고 나머지는 합치면 되지 않을까?

{% include figure.liquid loading="eager" path="assets/img/notes/prumerge/fig2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 2. PruMerge 3단계. ① CLS-패치 attention 유사도로 중요 토큰을 적응적으로 샘플(PruMerge+는 공간 균일 샘플 추가) → ② k-NN으로 클러스터링 → ③ 가중 평균으로 병합해 남은 토큰을 보강. 인코더 출력 단계에서만 작동하고 LLM의 나머지는 그대로." %}

## 핵심 아이디어

<div class="row g-3 my-3 pm-card">
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <div class="card-title">① IQR로 적응적 선택 (Prune)</div>
      <p class="card-text mb-0">CLS-패치 attention 점수에 <strong>IQR(Interquartile Range) 이상치 탐지</strong>를 적용 — 분포에서 튀는(중요한) 토큰을 <strong>입력마다 다른 개수</strong>로 고른다. 고정 비율이 아니라 <strong>정보 밀도에 따라</strong> 복잡한 이미지엔 더 많이, 단순한 이미지엔 더 적게 남는다.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <div class="card-title">② k-NN 가중 병합 (Merge)</div>
      <p class="card-text mb-0">버릴 토큰을 그냥 버리지 않고, <strong>key 유사도로 k-NN 클러스터링</strong>해 가까운 <strong>중요 토큰에 가중 평균으로 합친다</strong> → 남은 토큰의 정보를 보충·강화. <strong>PruMerge+</strong>는 여기에 <strong>공간 균일 샘플</strong>을 더해 커버리지를 높인다(성능 하락 최소화).</p>
    </div>
  </div>
</div>

- **학습** — 추가 파라미터·fine-tuning 없는 **training-free**. 추론 단계에서만 적용해 Video-LLaVA에도 그대로 확장.

## 적용·평가

<div class="eval-tab" markdown="1">

| 항목 | 내용 |
| --- | --- |
| **적용 모델** | **LLaVA-1.5**(7B/13B) · **Video-LLaVA**(비디오) |
| **데이터셋** | GQA · VizWiz · ScienceQA · TextVQA · POPE · MME · MMBench · VQAv2 등 |
| **Task** | Image·Video Understanding (VQA · OCR · 환각 · 종합) |
| **대표 결과** | 시각 토큰 **~5.5%**(평균 576→**~32개**)로 원본과 대등 · prefill FLOPs **4~10×↓** · **PruMerge+**는 하락을 더 줄임 |

</div>

## 결과

### 정량

<div class="row justify-content-center"><div class="col-lg-9 col-md-11">
{% include figure.liquid loading="lazy" path="assets/img/notes/prumerge/table1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Table 1. LMM 토큰 축소 비교. PruMerge·PruMerge+는 LLaVA-1.5에서 토큰을 ~5.5%만 남겨도 GQA·SQA·TextVQA·POPE·MME·MMBench 등에서 원모델과 대등하거나 더 좋다." %}
</div></div>

- **극단 압축에 대등** — LLaVA-1.5에서 평균 **~32개 토큰(5.5%)**으로 576개 전부 유지와 **대등한 성능**, prefill FLOPs **4~10×↓**.
- **PruMerge+** — 공간 균일 샘플을 더해 성능 하락을 더 줄이며, 후속 연구의 **강력한 baseline**(<a href="{% post_url 2024-11-30-atp-llava %}">ATP-LLaVA</a>·<a href="{% post_url 2025-03-04-divprune %}">DivPrune</a> 등이 비교 대상으로 사용).

### 정성

<div class="row justify-content-center"><div class="col-lg-7 col-md-9">
{% include figure.liquid loading="lazy" path="assets/img/notes/prumerge/fig1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 1. 선택된 토큰 시각화. PruMerge는 정보 밀도에 따라 토큰을 적응적으로 샘플 — 글자가 많은 복잡한 이미지엔 더 많은 토큰을, 단순한 이미지엔 더 적은 토큰을 남기고, 정보가 밀집한 영역에 토큰이 모인다." %}
</div></div>

- **적응적 샘플링(Fig 1).** 같은 모델이라도 **이미지의 정보 밀도**에 따라 남기는 토큰 수가 달라진다 — 텍스트·디테일이 많은 이미지엔 더 많이, 단조로운 이미지엔 더 적게. 남는 토큰은 **정보가 밀집한 영역**에 집중된다.

## 한 줄 정리 & 의의

- **CLS attention 희소성으로 "적응적으로 줄이고(IQR) 합치는(k-NN)" 토큰 축소.** 고정 비율이 아니라 입력마다 다른 개수 → ~5.5% 토큰으로 대등, training-free.
- **차별점.** 토큰을 *버리기만* 하는 가지치기와 달리 **prune + merge**로 정보를 보존하고, **IQR 적응 선택**으로 입력 난이도에 맞춘다. 초기 LMM 토큰 축소의 대표작으로, 이후 다수 방법의 비교 기준이 됐다.
- **위치.** <strong>Bridge</strong> — 인코더 출력과 LLM 사이에서 줄인다. → <a href="{% post_url 2026-06-23-efficient-vlm-overview %}">Efficient VLM 개요</a>
