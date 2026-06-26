---
layout: post
title: "[VLM-Pruner] Buffering for Spatial Sparsity in a Centrifugal Token Pruning Paradigm"
date: 2025-12-02
description: "Importance-only pruning keeps duplicate tokens; redundancy/diversity-aware pruning ignores spatial layout and scatters the retained tokens so they miss object regions. VLM-Pruner balances both with a 'centrifugal' near-to-far selection: start from pivot tokens, expand to spatially adjacent low-redundancy tokens (Buffering for Spatial Sparsity), then recover discarded tokens via similarity-weighted aggregation. Training-free; beats baselines across 5 VLMs at 88.9% pruning."
thumbnail: assets/img/notes/vlm-pruner/fig3.png
categories: efficient-vlm
tags: llm-side
shortname: VLM-Pruner
venue: CVPR 2026
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
  .post-content figure { max-width: 660px; margin-left: auto; margin-right: auto; }
  .post-content .tr-callout { background-color: rgba(225,172,172,0.18); border-left: 4px solid #e1acac; }
  .post-content .tr-callout p { margin-bottom: 0; }
  .post-content .vp-card .card { border-left: 4px solid #e1acac; }
  .post-content .vp-card .card-title { font-size: 0.95rem; font-weight: 700; }
  .post-content .vp-card .card-text { font-size: 0.82rem; line-height: 1.6; }
  .post-content .eval-tab table { width: 100%; font-size: 0.7rem; margin: 0.3rem 0; }
  .post-content .eval-tab thead { display: none; }
  .post-content .eval-tab td { font-size: 0.7rem; padding: 0.35rem 0.6rem; vertical-align: top; border: 0; border-bottom: 1px solid rgba(225,172,172,0.25); }
  .post-content .eval-tab td:first-child { white-space: nowrap; font-weight: 700; color: #1c1c1d; background: rgba(225,172,172,0.18); border-left: 3px solid #e1acac; width: 22%; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#e1acac;color:#1c1c1d">LLM</span>
  <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">CVPR 2026</span>
</div>
<p class="text-muted mb-3">Zhenkai Wu, Xiaowen Ma, Zhenliang Ni, … Xinghao Chen · Zhejiang University / Huawei</p>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://arxiv.org/abs/2512.02700" target="_blank" rel="noopener noreferrer">arXiv</a>
  <a class="btn btn-sm btn-outline-dark" href="https://github.com/Casey-bit/VLMPruner" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github me-1"></i> GitHub</a>
</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> <strong>중요도만</strong> 보는 가지치기는 토큰 간 <strong>중복</strong>을 놓쳐 비슷한 토큰을 잔뜩 남기고, <strong>중복(다양성)을 보는</strong> 방법은 <strong>공간 관계</strong>를 무시해 남은 토큰이 <strong>여기저기 흩어져</strong> 정작 객체 영역을 못 덮는다. VLM-Pruner는 둘을 함께 — <strong>중복과 공간 희소성을 균형</strong>잡는 <strong>"centrifugal(원심)" 근→원(near-to-far) 선택</strong>. ① <strong>pivot 토큰</strong>(max-min 거리로 서로 다른 주제를 거칠게 대표)에서 시작해 ② <strong>BSS(Buffering for Spatial Sparsity)</strong> 기준으로 <strong>공간적으로 가까운</strong> 저중복 토큰부터 차례로 고르고(먼 토큰은 뒤로 미룸) ③ 버린 토큰은 <strong>SWA(Similarity-Weighted Aggregation)</strong>로 남은 토큰에 합쳐 회복한다. <strong>LLM 디코더 2층</strong>에서 동작, <strong>training-free</strong>. 5개 VLM에서 <strong>88.9% 가지치기</strong>에도 baseline 능가, 최대 <strong>1.6× 가속</strong>·FLOPs 최대 <strong>77.91%↓</strong>.</p>
</div>

## 배경

VLM은 시각 토큰이 많아 모바일 배포가 어렵다. 가지치기로 줄이는데, 기존 두 갈래 모두 약점이 있다.

- **중요도만 보면(예: FastV)** — 토큰 간 **중복(inter-token redundancy)** 을 무시해, 내용이 겹치는 토큰을 여러 개 남겨 용량을 낭비한다.
- **중복(다양성)을 봐도(예: DivPrune·DART)** — 토큰의 **공간 관계**를 고려하지 않아, 남은 토큰이 이미지 전역에 **흩어진다(scattered)**. 결과적으로 **객체 영역을 충분히 덮지 못해** 세밀한 디테일을 놓친다.

<div class="row justify-content-center"><div class="col-lg-7 col-md-9">
{% include figure.liquid loading="eager" path="assets/img/notes/vlm-pruner/fig1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 1. 5개 VLM(Qwen2-VL-7B·LLaVA-1.5-7B/13B·LLaVA-Next-7B·LLaVA-Video-7B-Qwen2)에서 가지치기율(66.7/77.8/88.9%) 대비 성능. 중요도 기반 FastV·중복 기반 DART·DivPrune을 모두 능가." %}
</div></div>

> 그럼 "중복도 줄이고, 공간적으로도 객체를 빠짐없이 덮게" 토큰을 **순서 있게** 고를 수 없을까? — 무작위로 흩뿌리지 말고 **가까운 곳에서 먼 곳으로**.

## 핵심 아이디어 — Centrifugal 3단계

{% include figure.liquid loading="eager" path="assets/img/notes/vlm-pruner/fig3.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 3. VLM-Pruner의 원심(centrifugal) 가지치기. (a) LLM 디코더 i층에서 근→원 순서로, (b) pivot 토큰에서 시작 → (c) 이웃으로 확장(BSS 기준: 공간적으로 가까운 후보 우선, 초록→빨강은 선택확률 감소) → (d) 버린 토큰을 SWA로 회복. BSS 적용 후 가까운 C2가 C1보다 우선된다." %}

<div class="row g-3 my-3 vp-card">
  <div class="col-md-4">
    <div class="card h-100 p-3">
      <div class="card-title">① Pivot 초기화</div>
      <p class="card-text mb-0"><strong>max-min 거리</strong>로 서로 최대한 떨어진 <strong>최소 pivot 토큰 집합</strong>을 먼저 잡아, 이미지 속 <strong>서로 다른 주제</strong>를 거칠게 대표한다(선택의 출발점).</p>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card h-100 p-3">
      <div class="card-title">② BSS 기준 greedy 선택</div>
      <p class="card-text mb-0"><strong>Buffering for Spatial Sparsity</strong> — 후보와 선택집합의 <strong>최소 공간 거리</strong>를 반영해, <strong>공간적으로 가까운</strong> 저중복 토큰을 우선 선택하고 <strong>먼 토큰은 뒤로 미룬다</strong>. 유사도 오름차순으로 <strong>병렬 greedy</strong> 처리(가속).</p>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card h-100 p-3">
      <div class="card-title">③ SWA 회복</div>
      <p class="card-text mb-0">끝까지 버려진 <strong>바깥쪽 토큰</strong>을 최대 유사도 기준으로 남은 토큰에 매칭, <strong>Similarity-Weighted Aggregation</strong>으로 합쳐 정보 손실을 줄인다.</p>
    </div>
  </div>
</div>

- **왜 근→원인가** — 공간 근접을 우선하면 흩어짐을 막고 **객체의 세밀한 디테일을 더 완전하게 재구성**한다(near-to-far = locality부터 바깥으로).
- **학습** — 추가 학습 없는 **training-free**. LLM 디코더 **2층**에서 한 번 수행.

## 적용·평가

<div class="eval-tab" markdown="1">

| 항목 | 내용 |
| --- | --- |
| **적용 모델** | **5개 VLM** — LLaVA-1.5(7B/13B) · LLaVA-Next-7B · LLaVA-Video-7B-Qwen2 · Qwen2-VL-7B |
| **데이터셋** | GQA · MMBench · MME · POPE · ScienceQA · TextVQA · **OCRBench** · SEED · OK-VQA |
| **Task** | Image Understanding (VQA · OCR · 환각 · 종합) |
| **대표 결과** | **88.9% 가지치기**에서 5개 VLM 모두 baseline 능가 · 최대 **1.6× 가속** · FLOPs 최대 **77.91%↓** |

</div>

## 결과

### 정량

<div class="row justify-content-center"><div class="col-lg-10 col-md-12">
{% include figure.liquid loading="lazy" path="assets/img/notes/vlm-pruner/table1-2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Table 1·2. LLaVA-1.5-7B(192/128/64 유지)·LLaVA-1.5-13B·LLaVA-Next-7B 비교. VLM-Pruner(Ours)가 FastV·SparseVLM·PDrop·DART·DivPrune 대비 평균 최고, 특히 고압축(88.9%↓)·OCR에서 우위." %}
</div></div>

- **고압축·디테일 task에 강함** — 토큰 64개(88.9%↓)에서도 평균 최고. 공간 근접 우선 덕에 **OCRBench·세밀한 VQA**에서 흩어지는 방법(DART·DivPrune)보다 객체 영역을 잘 덮는다.

### 정성

<div class="row justify-content-center"><div class="col-lg-8 col-md-10">
{% include figure.liquid loading="lazy" path="assets/img/notes/vlm-pruner/fig2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 2. 실제 가지치기 결과 비교(FastV·DART·VLM-Pruner). 초록=정답·빨강=오답 응답. VLM-Pruner는 트럭의 차체·타이어·앞유리처럼 객체 디테일을 빠짐없이 덮어 정답을 낸다." %}
</div></div>

- **객체를 빠짐없이 덮는다(Fig 2).** FastV·DART가 흩어진 토큰으로 디테일을 놓쳐 틀리는 사례에서, VLM-Pruner는 **객체 주변을 조밀하게** 남겨(예: 트럭의 차체·타이어·앞유리) 정확히 답한다.

## 한 줄 정리 & 의의

- **"중복 + 공간 희소성"을 함께 — 근→원(centrifugal) 순서로 고른다.** pivot에서 시작해 BSS로 가까운 토큰부터 선택, 버린 건 SWA로 회복 → 흩어짐 없이 객체 디테일 보존, training-free.
- **차별점.** 중요도 기반 <a href="{% post_url 2024-03-11-fastv %}">FastV</a>·중복(다양성) 기반 <a href="{% post_url 2025-02-17-dart %}">DART</a>·<a href="{% post_url 2025-03-04-divprune %}">DivPrune</a>이 **공간 관계를 무시**해 토큰이 흩어지는 문제를, **공간 근접 우선**으로 푼다.
- **위치.** <strong>LLM</strong> — LLM 디코더 2층에서 줄인다. → <a href="{% post_url 2026-06-23-efficient-vlm-overview %}">Efficient VLM 개요</a>
