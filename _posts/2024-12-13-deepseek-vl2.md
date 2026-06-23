---
layout: post
title: "[DeepSeek-VL2] Mixture-of-Experts Vision-Language Models for Advanced Multimodal Understanding"
date: 2024-12-13
description: "Upgrades DeepSeek-VL with a dynamic tiling vision encoder (single SigLIP, any aspect ratio) and a DeepSeekMoE LLM with Multi-head Latent Attention — matching or beating dense/MoE models with only 1.0/2.8/4.5B activated parameters."
thumbnail: assets/img/notes/deepseek-vl2/fig2.png
categories: vlm
tags: vlm
shortname: DeepSeek-VL2
generation: G4
venue: arXiv 2024
giscus_comments: false
related_posts: false
toc:
  sidebar: right
_styles: >
  .post-title { font-size: 1.6rem; line-height: 1.35; }
  .post-content { font-size: 0.92rem; line-height: 1.75; }
  .post-content h2 { font-size: 1.25rem; margin-top: 1.8rem; }
  .post-content h3 { font-size: 1.02rem; }
  .post-content table { font-size: 0.8rem; }
  .post-content figure { max-width: 620px; margin-left: auto; margin-right: auto; }
  .post-content .tr-callout { background-color: rgba(110,133,183,0.08); border-left: 4px solid #6e85b7; }
  .post-content .tr-callout p { margin-bottom: 0; }
  .post-content .ds-card .card { border-left: 4px solid #787bb3; }
  .post-content .ds-card .card-title { font-size: 0.95rem; font-weight: 700; }
  .post-content .ds-card .card-text { font-size: 0.82rem; line-height: 1.6; }
  .post-content .ds-table table { font-size: 0.76rem; width: 100%; }
  .post-content .ds-table th, .post-content .ds-table td { vertical-align: top; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#787bb3;color:#fff">VLM</span>
  <span class="badge rounded-pill me-1" style="background-color:#6e85b7;color:#fff">G4</span>
  <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">arXiv 2024</span>
</div>
<p class="text-muted mb-3">Zhiyu Wu, Xiaokang Chen, … Chong Ruan · DeepSeek-AI</p>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://arxiv.org/abs/2412.10302" target="_blank" rel="noopener noreferrer">arXiv</a>
  <a class="btn btn-sm btn-outline-dark" href="https://github.com/deepseek-ai/DeepSeek-VL2" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github me-1"></i> GitHub</a>
</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> DeepSeek-VL의 후속, <strong>MoE(Mixture-of-Experts) 비전-언어 모델</strong>. LLaVA식 구조(인코더+어댑터+LLM)에 두 가지를 얹었다 — ① <strong>동적 타일링(dynamic tiling)</strong> 비전 인코딩: <strong>단일 SigLIP</strong>으로 어떤 해상도·종횡비든 384 타일들 + thumbnail로 쪼개 처리(전작의 고정 1024² 한계 제거). ② <strong>DeepSeekMoE LLM + MLA</strong>(Multi-head Latent Attention): KV 캐시를 latent로 압축 + 희소(MoE) 연산 → 추론 효율↑. 그 결과 <strong>활성 파라미터 1.0/2.8/4.5B</strong>만으로 비슷하거나 적은 연산으로 dense·MoE 모델과 대등/우위. 그라운딩·GUI·문서/표/차트까지.</p>
</div>

## 배경

전작 [DeepSeek-VL](https://arxiv.org/abs/2403.05525)은 **하이브리드 비전 인코더**(SigLIP@384 + SAM-B@1024)로 풍부한 특징을 뽑았지만, **고정 1024² 해상도**에 묶여 있었다.

- **고정 해상도의 한계** — InfographicVQA·밀집 OCR·세밀한 그라운딩처럼 **초고해상도·극단 종횡비** 입력에 약하다.
- **효율** — 큰 dense LLM은 추론 비용이 크다.

> 비전은 **해상도에 적응**하고(타일링), 언어는 **희소(MoE) + KV 압축(MLA)** 으로 효율을 챙기면, 적은 활성 파라미터로도 강해지지 않을까?

{% include figure.liquid loading="eager" path="assets/img/notes/deepseek-vl2/fig2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 2. DeepSeek-VL2 개요. LLaVA식 구조 — 비전 인코더 + VL 어댑터(2-layer MLP) + MoE 기반 LLM. 전작 대비 ①동적 타일링과 ②DeepSeekMoE(MLA)가 핵심 변경점." %}

## 핵심 아이디어

<div class="row g-3 my-3 ds-card">
  <div class="col-md-4">
    <div class="card h-100 p-3">
      <div class="card-title">① 동적 타일링 (Dynamic Tiling)</div>
      <p class="card-text mb-0"><strong>단일 SigLIP-SO400M-384</strong>로 모든 해상도 처리. 입력을 padding이 최소가 되는 후보 해상도로 맞춰 <strong>384×384 로컬 타일들 + 글로벌 thumbnail</strong>로 분할(타일당 27×27=729 임베딩). 전작의 <strong>고정 1024² 인코더</strong>를 대체.</p>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card h-100 p-3">
      <div class="card-title">② DeepSeekMoE + MLA</div>
      <p class="card-text mb-0">LLM은 <strong>희소 MoE</strong>(전문가 일부만 활성) + <strong>MLA</strong>가 <strong>KV 캐시를 latent 벡터로 압축</strong> → 추론 속도·처리량↑. 적은 <strong>활성 파라미터</strong>로 큰 모델 효과.</p>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card h-100 p-3">
      <div class="card-title">③ 데이터 + 새 능력</div>
      <p class="card-text mb-0">VL 데이터를 품질·양·다양성 모두 강화. <strong>visual grounding</strong>(<code>&lt;|ref|&gt;</code>·<code>&lt;|det|&gt;</code> 토큰)·<strong>GUI 인식</strong>·문서/표/차트·밀집 OCR 능력 추가.</p>
    </div>
  </div>
</div>

### 동적 타일링은 어떻게 — 단일 인코더로 초고해상도

전작의 두 인코더(SigLIP@384 + SAM@1024) 대신 **SigLIP 하나**로 통일하되, 이미지를 **타일로 쪼개** 고해상도를 감당한다.

- 후보 해상도 집합에서 **padding이 가장 작은** (m·384, n·384)을 골라 리사이즈 → **m×n개 로컬 타일 + 1개 글로벌 thumbnail**.
- 각 타일을 **공유 ViT**로 처리(로컬 attention 유지) → 해상도가 커져도 **제곱 폭증 없이** 세밀한 특징 추출.
- 멀티이미지(>2장)일 땐 컨텍스트 관리를 위해 타일링을 끈다. 시각 토큰은 2-layer MLP로 LLM 공간에 투영.

{% include figure.liquid loading="lazy" path="assets/img/notes/deepseek-vl2/fig3.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 3. 동적 타일링 전략. 이미지를 여러 타일로 나눠, 전작 DeepSeek-VL보다 세밀한(fine-grained) 이해를 얻는다." %}

## 모델 패밀리

<div class="ds-table" markdown="1">

| 변형 | MoE LLM | 활성 파라미터 |
| --- | --- | --- |
| DeepSeek-VL2-Tiny | 3B | **1.0B** |
| DeepSeek-VL2-Small | 16B | **2.8B** |
| DeepSeek-VL2 | 27B | **4.5B** |

</div>

- 총 파라미터는 MoE라 크지만, 실제 연산에 쓰는 **활성 파라미터는 1~4.5B**으로 작다(효율의 핵심).

## 결과

{% include figure.liquid loading="lazy" path="assets/img/notes/deepseek-vl2/fig1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 1. 활성 파라미터 대비 평균 성능(MMBench v1.1·MMStar·MMMU·MathVista·AI2D·OCRBench 평균). DeepSeek-VL2는 비슷하거나 적은 활성 파라미터로 오픈 dense·MoE 모델과 대등/우위." %}

- **효율-성능 프런티어** — 비슷하거나 **적은 활성 파라미터**로 기존 오픈 dense·MoE 모델과 대등하거나 SOTA.
- **강점 영역** — VQA·OCR·문서/표/차트 이해·시각 추론, 그리고 새로 얻은 **visual grounding·GUI 인식**.

## 한 줄 정리 & 의의

- **MoE로 효율을 챙긴 동적 고해상도 VLM.** ① 단일 SigLIP + **동적 타일링**(고정 해상도 탈피) ② **DeepSeekMoE + MLA**(희소 연산 + KV 압축) → **활성 파라미터 1~4.5B**로 강력.
- **차별점.** <a href="{% post_url 2024-12-06-internvl2-5 %}">InternVL 2.5</a>가 *큰 dense ViT + 타일링*으로 스케일했다면, DeepSeek-VL2는 **LLM 쪽을 MoE+MLA로 희소화**해 *활성 파라미터당 효율*을 노린다. <a href="{% post_url 2024-09-18-qwen2-vl %}">Qwen2-VL</a>의 네이티브 동적 해상도와 목표(고해상도)는 같되, **수단이 타일링+MoE**.
- **위치(세대).** G4(Native Multimodal) — 동적 고해상도 + 효율(MoE) 노선. → <a href="{% post_url 2026-06-22-vlm-overview %}">VLM 개요</a>
