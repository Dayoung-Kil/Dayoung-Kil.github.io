---
layout: post
title: "Efficient VLM — Overview"
date: 2026-06-23
description: Cutting visual tokens to make VLMs cheaper — where it happens (encoder · bridge · LLM), text-guided selection, recover/recycle, and a map of MADTP·CrossGET·IVTP·SparseVLM·Recoverable Compression·CoViPAL.
thumbnail: assets/img/notes/efficient-vlm-overview/overview.png
categories: efficient-vlm
tags: survey
shortname: Overview
venue: Survey
giscus_comments: false
related_posts: false
toc:
  sidebar: left
_styles: >
  .post-title { font-size: 1.8rem; }
  .post-content { font-size: 0.92rem; line-height: 1.75; }
  .post-content h2 { font-size: 1.3rem; margin-top: 1.8rem; }
  .post-content h3 { font-size: 1.05rem; }
  .post-content .evlm-where .card-title { font-size: 0.95rem; font-weight: 700; }
  .post-content .evlm-where .card-text { font-size: 0.82rem; line-height: 1.6; }
  .post-content .evlm-where .card { border-left: 4px solid #5d5c98; }
  .post-content .evlm-tab table { font-size: 0.66rem; }
  .post-content .evlm-tab th, .post-content .evlm-tab td { line-height: 1.4; vertical-align: top; padding: 0.3rem 0.4rem; }
  .post-content .evlm-tab tbody tr:nth-child(odd) { background-color: rgba(93,92,152,0.05); }
  .post-content .evlm-tab td:first-child { white-space: nowrap; font-weight: 700; }
  .post-content .evlm-insights .card-title { font-size: 0.95rem; color: #5d5c98; font-weight: 700; }
  .post-content .evlm-insights .card-text { font-size: 0.83rem; line-height: 1.6; }
  .post-content .tr-callout { background-color: rgba(93,92,152,0.08); border-left: 4px solid #5d5c98; }
  .post-content .tr-callout p { margin-bottom: 0; }
  .post-content blockquote { font-size: 0.9rem; }
---

<div class="mb-2">
  <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">Survey</span>
</div>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> VLM은 <strong>시각 토큰이 텍스트보다 훨씬 많아</strong>(예: LLaVA 한 장에 576개) LLM 입력이 길어지고 연산이 토큰 수의 제곱으로 폭증한다. <strong>Efficient VLM</strong>은 이 <strong>시각 토큰을 줄여(선택·압축·복구)</strong> latency·메모리·FLOPs를 낮추는 방법들이다. 핵심은 두 가지 — ① 줄이는 <strong>위치</strong>(시각 인코더 / 브리지(projector) / LLM 내부) 가 다 다르고, ② 순수 시각만 보던 [ViT의 토큰 축소]({% post_url 2026-06-19-token-reduction-overview %})와 달리 대부분 <strong>텍스트(질문)를 가이드로</strong> 어떤 토큰이 답에 필요한지 본다.</p>
</div>

## 왜 Efficient VLM인가

[VLM]({% post_url 2026-06-22-vlm-overview %})은 이미지를 수백 개의 시각 토큰으로 바꿔 LLM에 넣는다. 그런데 LLM의 self-attention은 입력 길이에 **제곱**으로 비싸지므로, 긴 시각 토큰 시퀀스가 곧 비용이다.

- **LLM 단계 비용이 지배적** — ViT 토큰 축소가 비전 인코더 안의 비용을 줄였다면, VLM에선 **LLM에 들어가는 시각 토큰 수**가 전체 latency·메모리를 좌우한다.
- **순수 시각만 보면 위험** — 대형 멀티모달 모델에서 시각 정보에만 의존해 토큰을 자르면 질문에 필요한 정보를 잃는다(oversimplification). 그래서 **질문 텍스트**가 "어떤 시각 토큰이 중요한지"를 알려주는 단서가 된다.

> 즉 Efficient VLM = **"질문을 고려해, 답에 필요 없는 시각 토큰을 어느 단계에서 얼마나 줄일까"** 의 문제다.

## 어디서 줄이나 (위치별 분류)

{% include figure.liquid loading="eager" path="assets/img/notes/efficient-vlm-overview/overview.png" class="img-fluid rounded z-depth-1" zoomable=true caption="VLM 파이프라인(Input → Visual Encoder → Bridge/Projector → LLM → Output)에서 시각 토큰을 줄일 수 있는 지점. encoder-side · bridge-side · LLM-side(주로 text-guided)로 나뉜다. 효과는 latency·memory·FLOPs·throughput. (직접 정리)" %}

<div class="evlm-where">
  <div class="row row-cols-1 row-cols-md-3">
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">① Encoder-side</h6>
      <p class="card-text mb-1">시각 인코더 <strong>안에서</strong> 토큰을 미리 줄인다. 인코더 연산도 같이 절감.</p>
      <p class="card-text mb-0 text-muted">VLTP · IVTP(1단계) · MADTP · CrossGET</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">② Bridge / Pre-LLM</h6>
      <p class="card-text mb-1">인코더와 LLM <strong>사이(projector 부근)</strong>에서 추려서 LLM에 넣는다. LLM 비용을 직접 줄임.</p>
      <p class="card-text mb-0 text-muted">Recoverable Compression · CoViPAL</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">③ LLM-side</h6>
      <p class="card-text mb-1">LLM <strong>내부 attention</strong> 계산 중에 시각 토큰을 솎아낸다. 대개 <strong>text-guided</strong>.</p>
      <p class="card-text mb-0 text-muted">FastV · SparseVLM</p>
    </div></div></div>
  </div>
</div>

> 한 방법이 여러 지점에 걸치기도 한다 — 예: **IVTP**는 시각 인코더와 LLM 양쪽에서 2-stage로 자르고, **Recoverable Compression**은 pre-LLM에서 자르되 질문 텍스트로 복구한다.

## 방법 한눈에

<div class="evlm-tab" markdown="1">

| Method | Venue | 위치 | 학습 | 적용 모델 | Task |
| --- | --- | --- | --- | --- | --- |
| **MADTP** | CVPR 2024 | Vision·Language 인코더 (layer 내부·브랜치 사이) | Fine-tuning (MAG+DTP) | BLIP, CLIP | Retrieval·VQA·Captioning |
| **CrossGET** | ICML 2024 | Vision·Language 인코더 (layer 내부) | Fine-tuning (cross token만) | CLIP·BLIP·BLIP-2·LLaVA | Retrieval·Reasoning·VQA |
| **VLTP** | WACV 2025 | Vision 인코더 (encoder-side) | — | task-oriented seg 모델 | Task-Oriented Segmentation |
| **IVTP** | WACV 2025 | Vision 인코더 & LLM (2-stage) | Training-free | LLaVA-1.5 | Image Understanding (12종) |
| **SparseVLM** | ICML 2025 | LLM Decoder (내부 attention) | Training-free | LLaVA·Mini-Gemini·Qwen2-VL·Video-LLaVA | Image·Video (12종) |
| **Recoverable Compression** | AAAI 2025 | Pre-LLM (Encoder–Projector 사이) | Training-free | LLaVA-1.5 | Image Understanding |
| **CoViPAL** | EMNLP 2025 | Pre-LLM (Encoder–LLM 사이) | Training-based (PPM 분류기) | LLaVA-OneVision·LLaVA-Video | Image·Video (13종) |

</div>

## 공통 아이디어 & 흐름

<div class="evlm-insights">
  <div class="row row-cols-1 row-cols-md-2">
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">텍스트(질문) 가이드</h6>
      <p class="card-text mb-0">질문과 관련된 시각 토큰을 우선 남긴다. cross-attention으로 질문 토큰과 시각 토큰의 관련성을 재는 식(SparseVLM·Recoverable Compression).</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">적응적 축소 (중복도 기반)</h6>
      <p class="card-text mb-0">이미지마다 정보 밀도가 달라, attention의 rank 등으로 중복을 추정해 <strong>이미지별로 다른 비율</strong>로 자른다(SparseVLM).</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">복구·재활용 (recover / recycle)</h6>
      <p class="card-text mb-0">버린 토큰을 그냥 두지 않고 <strong>클러스터링해 합치거나</strong> 텍스트 단서로 <strong>되살린다</strong> — 정보 손실 최소화(Recoverable Compression·SparseVLM).</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">training-free plug-and-play</h6>
      <p class="card-text mb-0">추가 학습·파라미터 없이 추론 시 바로 끼우는 모듈이 늘어나는 추세(IVTP·SparseVLM·Recoverable Compression). 배포가 쉽다.</p>
    </div></div></div>
  </div>
</div>

## 벤치마크

평가는 대부분 **image/video understanding** 벤치마크로 한다 — MME·POPE·GQA·TextVQA·MMBench·SEED·ScienceQA 등. 각 벤치마크가 무엇을 보는지는 [VLM Overview의 주요 벤치마크]({% post_url 2026-06-22-vlm-overview %})에 정리해 두었다. 핵심 비교 지표는 **압축률(유지 토큰 수) 대비 정확도 유지 + latency**.

## 위치 & 다음

- **연결.** Efficient VLM은 [Token Reduction in ViTs]({% post_url 2026-06-19-token-reduction-overview %})를 **멀티모달·텍스트 가이드**로 확장한 것이고, 그 무대인 [VLM]({% post_url 2026-06-22-vlm-overview %})의 어느 단계(encoder/bridge/LLM)에서나 일어날 수 있다.
- **다음.** 개별 논문 노트는 자료가 충분한 **SparseVLM**·**Recoverable Compression**부터 정리할 예정. (작성되는 대로 위 표에서 링크 연결)
