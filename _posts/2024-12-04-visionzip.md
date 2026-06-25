---
layout: post
title: "[VisionZip] Longer is Better but Not Necessary in Vision Language Models"
date: 2024-12-04
description: "Vision encoders (CLIP/SigLIP) emit highly redundant visual tokens — VisionZip keeps only a few dominant tokens (high attention) plus merged contextual tokens, text-agnostic and training-free. 8× faster prefilling at 95% performance; shines in multi-turn dialogue where text-guided pruners fail."
thumbnail: assets/img/notes/visionzip/fig2.png
categories: efficient-vlm
tags: encoder-side
shortname: VisionZip
venue: CVPR 2025
giscus_comments: false
related_posts: false
toc:
  sidebar: right
_styles: >
  .post-title { font-size: 1.6rem; line-height: 1.35; }
  .post-content { font-size: 0.92rem; line-height: 1.75; }
  .post-content h2 { font-size: 1.25rem; margin-top: 1.8rem; }
  .post-content h3 { font-size: 1.02rem; }
  .post-content blockquote { border-left-color: #a87676; }
  .post-content a:not(.btn) { color: #a87676; }
  .post-content table { font-size: 0.8rem; }
  .post-content figure { max-width: 620px; margin-left: auto; margin-right: auto; }
  .post-content .tr-callout { background-color: rgba(168,118,118,0.1); border-left: 4px solid #a87676; }
  .post-content .tr-callout p { margin-bottom: 0; }
  .post-content .vz-card .card { border-left: 4px solid #a87676; }
  .post-content .vz-card .card-title { font-size: 0.95rem; font-weight: 700; }
  .post-content .vz-card .card-text { font-size: 0.82rem; line-height: 1.6; }
  .post-content .eval-tab table { width: 100%; font-size: 0.7rem; margin: 0.3rem 0; }
  .post-content .eval-tab thead { display: none; }
  .post-content .eval-tab td { font-size: 0.7rem; padding: 0.35rem 0.6rem; vertical-align: top; border: 0; border-bottom: 1px solid rgba(168,118,118,0.18); }
  .post-content .eval-tab td:first-child { white-space: nowrap; font-weight: 700; color: #1c1c1d; background: rgba(168,118,118,0.12); border-left: 3px solid #a87676; width: 22%; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#a87676;color:#fff">Encoder</span>
  <span class="badge rounded-pill" style="background-color:#a87676;color:#fff">CVPR 2025</span>
</div>
<p class="text-muted mb-3">Senqiao Yang, Yukang Chen, … Jiaya Jia · CUHK / HKUST / HITSZ</p>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://arxiv.org/abs/2412.04467" target="_blank" rel="noopener noreferrer">arXiv</a>
  <a class="btn btn-sm btn-outline-dark" href="https://github.com/dvlab-research/VisionZip" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github me-1"></i> GitHub</a>
</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> <a href="{% post_url 2021-02-26-clip %}">CLIP</a>·SigLIP 같은 비전 인코더가 내놓는 <strong>시각 토큰엔 중복이 매우 많다</strong>는 관찰("길수록 좋지만 꼭 필요하진 않다"). VisionZip은 <strong>인코더 출력에서</strong> ① attention을 많이 받아 정보를 응집한 <strong>dominant 토큰</strong> 몇 개만 고르고 ② 작은 디테일을 놓치지 않도록 나머지를 유사도로 <strong>병합한 contextual 토큰</strong>을 더해, LLM에 넣을 토큰을 확 줄인다. <strong>질문(text)을 안 보는 text-agnostic·training-free</strong>(선택적 projector fine-tune 30분). prefilling <strong>8× 가속</strong>에 성능 <strong>95% 유지</strong>(LLaVA-NeXT-7B), SOTA(FastV·SparseVLM) 대비 <strong>≥5%</strong>↑. text-agnostic이라 <strong>멀티턴 대화</strong>에서 특히 강하다.</p>
</div>

## 배경

VLM은 성능을 위해 시각 토큰을 늘렸지만(텍스트보다 훨씬 길어짐) 그만큼 비싸진다. VisionZip의 출발점은 단순한 관찰이다.

- **인코더 출력의 중복** — CLIP/SigLIP가 만든 시각 토큰은 **상당수가 중복**이다. 소수의 토큰이 이미지 정보를 대부분 응집한다.
- **text-guided의 약점** — <a href="{% post_url 2024-10-06-sparsevlm %}">SparseVLM</a>·Recoverable처럼 **질문에 맞춰** 자르는 방법은, 질문이 바뀌는 **멀티턴 대화**에선 처음 질문 기준으로 잘려 후속 질문에 약하다.

> 그럼 질문에 의존하지 말고, **인코더 단계에서 정보가 풍부한 토큰만** 골라내면(게다가 학습 없이) 어떨까?

{% include figure.liquid loading="eager" path="assets/img/notes/visionzip/fig2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 2. VisionZip. 비전 인코더 출력에서 attention을 많이 받는 dominant 토큰을 고르고(정보 응집), 남은 토큰은 유사도로 병합해 contextual 토큰으로 압축한다. 질문을 보지 않는 text-agnostic 방식." %}

## 핵심 아이디어

<div class="row g-3 my-3 vz-card">
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <div class="card-title">① Dominant Token Selection</div>
      <p class="card-text mb-0">선택한 인코더 층의 attention에서 <strong>가장 많은 주목을 받는 K개 토큰(top-K)</strong>을 고른다 — 이들이 이미지 정보를 대부분 <strong>응집</strong>한다. (CLS attention 기반, 의사코드로 간단)</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <div class="card-title">② Contextual Token Merging</div>
      <p class="card-text mb-0">dominant만 쓰면 <strong>작지만 중요한 디테일</strong>을 놓칠 수 있어, 남은 토큰을 <strong>유사도로 병합</strong>해 소수의 <strong>contextual 토큰</strong>으로 만들어 보탠다.</p>
    </div>
  </div>
</div>

- **text-agnostic** — 질문을 안 본다 → 한 번 압축한 시각 토큰을 **여러 턴에 재사용** 가능(멀티턴 강점). text-guided 방법이 약한 지점.
- **학습** — 기본 **training-free**. 토큰 수가 줄며 생기는 약간의 정렬 어긋남은, 원하면 **projector만 30분 fine-tune**해 보정(또는 from-scratch).

## 적용·평가

<div class="eval-tab" markdown="1">

| 항목 | 내용 |
| --- | --- |
| **적용 모델** | **LLaVA-1.5** · **LLaVA-NeXT**(7B/13B) · **Mini-Gemini** · **Video-LLaVA**(비디오) |
| **이미지 데이터셋** | GQA · MMBench · MME · MMVet · POPE · SEED · ScienceQA · TextVQA · VQAv2 |
| **비디오 데이터셋** | TGIF-QA · MSVD-QA · ActivityNet-QA |
| **Task** | Image·Video Understanding + **멀티턴 대화**(real-world) |
| **대표 결과** | SOTA(FastV·SparseVLM) 대비 **≥5%↑** · prefilling **8× 가속**·성능 **95% 유지**(LLaVA-NeXT-7B) · LLaVA-NeXT-13B가 7B보다 빠르고 더 정확 |

</div>

## 결과

<div class="row justify-content-center"><div class="col-lg-9 col-md-11">
{% include figure.liquid loading="lazy" path="assets/img/notes/visionzip/table1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Table 1. LLaVA-1.5에서 VisionZip 성능. 원본 시각 토큰 576개를 크게 줄여도(각 방법 윗줄=토큰 수) 정확도를 거의 유지." %}
</div></div>

- **LLaVA-1.5** — 시각 토큰 576개를 **약 10%**만 남겨도 11개 벤치 평균 **~95%** 성능, SOTA(FastV·SparseVLM) 대비 **≥5%↑**.
- **속도** — LLaVA-NeXT-7B **prefilling 8× 가속**. GPU 추론 시간이 줄어 **LLaVA-NeXT-13B가 7B보다 빠르면서 더 정확**.
- **일반화** — LLaVA-NeXT(7B/13B)·Mini-Gemini·Video-LLaVA로 확장돼도 유지.

## 한 줄 정리 & 의의

- **"시각 토큰은 길 필요 없다" — 인코더 출력에서 dominant + contextual 토큰만.** 질문을 안 보는 text-agnostic·training-free라 멀티턴에 강하다.
- **차별점.** <a href="{% post_url 2024-10-06-sparsevlm %}">SparseVLM</a>·Recoverable이 **질문 가이드**라면, VisionZip은 **text-agnostic**(인코더 단계) — 같은 시각 토큰을 여러 질문/턴에 재사용. 저자는 "토큰 길이를 늘리기보다 **더 좋은 시각 특징을 뽑자**"고 제안.
- **위치.** <strong>Encoder</strong> — 비전 인코더 출력에서 LLM에 넣기 전에 줄인다. → <a href="{% post_url 2026-06-23-efficient-vlm-overview %}">Efficient VLM 개요</a>
