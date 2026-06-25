---
layout: post
title: "[TokenLearner] What Can 8 Learned Tokens Do for Images and Videos?"
date: 2021-06-15
description: "Learns a handful of adaptive tokens instead of a dense uniform grid."
thumbnail: assets/img/notes/tokenlearner/fig1.png
categories: token-reduction-in-vits
tags: pooling
shortname: TokenLearner
venue: NeurIPS 2021
giscus_comments: false
related_posts: false
toc:
  sidebar: right
_styles: >
  .post-title { font-size: 1.6rem; line-height: 1.35; }
  .post-content { font-size: 0.92rem; line-height: 1.75; }
  .post-content h2 { font-size: 1.25rem; margin-top: 1.8rem; }
  .post-content h3 { font-size: 1.02rem; }
  .post-content blockquote { border-left-color: #b1d3b9; }
  .post-content a:not(.btn) { color: #b1d3b9; }
  .post-content table { font-size: 0.8rem; }
  .post-content .tr-callout { background-color: rgba(177,211,185,0.08); border-left: 4px solid #b1d3b9; }
  .post-content .tr-callout p { margin-bottom: 0; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#b1d3b9;color:#1c1c1d">Pooling</span>
  <span class="badge rounded-pill" style="background-color:#b1d3b9;color:#1c1c1d">NeurIPS 2021</span>
</div>
<p class="text-muted mb-3">Michael S. Ryoo, AJ Piergiovanni, Anurag Arnab, Mostafa Dehghani, Anelia Angelova · Google Research</p>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://arxiv.org/abs/2106.11297" target="_blank" rel="noopener noreferrer">arXiv</a>
  <a class="btn btn-sm btn-outline-dark" href="https://github.com/google-research/scenic/tree/main/scenic/projects/token_learner" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github me-1"></i> GitHub</a>
</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> 이미지를 균일 grid 패치로 쪼개 수백 개 토큰을 쓰는 대신, 입력에서 <strong>소수(8~16개)의 중요한 토큰을 "학습으로 생성"</strong>한다(adaptive tokenization). 이후 layer의 토큰 수가 급감해 연산이 대폭 줄어드는 Pooling 계열 대표작.</p>
</div>

<p class="text-muted" style="font-size:0.78rem">※ 이 글이 다루는 PDF는 image+video로 확장한 저널 버전이다. (원 NeurIPS 2021 버전은 비디오 중심)</p>

## 배경

ViT/ViViT는 **너무 많은 dense 토큰**을 처리한다. 512×512 이미지는 16×16 패치 기준 1024 토큰, 비디오는 tubelet 단위로 수만 토큰에 이른다. self-attention 연산·메모리는 토큰 수에 **제곱(quadratic)** 으로 늘어난다.

> 정말 *매 layer마다* 그 많은 토큰을 다 처리해야 할까? — 소수의 토큰만 잘 뽑아도 충분하지 않을까?

## 핵심 아이디어

균일 분할(uniform split)로 고정된 토큰을 쓰는 대신, **입력에 따라 중요한 영역을 spatial attention으로 골라 소수의 토큰으로 요약(pooling)** 한다. 토큰이 *고정 위치 split*이 아니라 *입력마다 바뀌는 적응적 선택*이라는 게 핵심.

{% include figure.liquid loading="lazy" path="assets/img/notes/tokenlearner/fig1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 1. TokenLearner 모듈 — S개의 spatial attention map αᵢ(x)가 서로 다른 중요 영역을 강조하고, 각 영역을 spatial pooling해 S개의 learned token을 만든다." %}

## 방법

### 1) TokenLearner — 적응적 토큰 생성

입력 텐서 X(H×W×C)에서 S개의 토큰을 만든다.

$$
z_i = \rho\big(X_t \odot \gamma(\alpha_i(X_t))\big), \quad i = 1, \dots, S
$$

- **αᵢ(·)**: H×W×1 **spatial attention map**을 만드는 함수(conv 여러 층 또는 MLP + sigmoid).
- 이 map을 입력에 곱해 중요 영역만 가중 → **spatial global average pooling(ρ)** 으로 C차원 토큰 하나 생성.
- 이걸 S번 반복해 **S개 learned token**(기본 S = 8 또는 16). H×W = 32×32(=1024)에서 8개로 줄이면 이후 연산이 거의 무시할 수준.

### 2) TokenFuser (옵션) — 정보 혼합 + 공간 복원

TokenLearner는 토큰을 *압축*만 하므로, 이후 다시 공간 위치 정보가 필요할 수 있다. **TokenFuser**는 (1) 토큰 축에 linear를 적용해 토큰 간 패턴을 섞고, (2) S개 토큰을 다시 **원래 H×W×C 해상도로 remap**한다. → "TokenLearner–Transformer–TokenFuser"를 한 모듈로 반복.

{% include figure.liquid loading="lazy" path="assets/img/notes/tokenlearner/fig3.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 3. ViT에 적용한 두 구조 — (a) TokenLearner만 삽입, (b) TokenLearner + TokenFuser를 반복. TokenLearner 이후 토큰이 8개로 줄어 뒤쪽 Transformer 연산이 매우 작아진다." %}

### 3) 어디에 넣을까 — 삽입 위치

{% include figure.liquid loading="lazy" path="assets/img/notes/tokenlearner/fig4.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 4. TokenLearner 삽입 위치별 ImageNet 5-shot 정확도(좌)와 FLOPS(우). '0'=맨 앞, '0.5'=중간, 'Base'=미사용." %}

- **중간(1/2)** 에 넣으면 정확도는 거의 그대로인데 **연산은 약 절반**.
- **후반(3/4)** 에 넣으면 미사용 대비 *정확도가 오히려 더 높으면서* 더 빠르다 — 적응적 토큰의 힘.

## 결과

{% include figure.liquid loading="lazy" path="assets/img/notes/tokenlearner/table1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Table 1. ImageNet fine-tuning top-1 / FLOPS (괄호=transformer layer 수)." %}

- **연산 절반, 정확도 유지**: ViT B/16(55.6 GFLOPS, 84.73) → TokenLearner B/16(28.7 GFLOPS, 83.65).
- **절약한 연산을 layer로 재투자**하면 baseline을 능가: TokenLearner B/16(21층) → 47.1 GFLOPS, **85.21**.
- **Pooling이라도 "학습"이 낫다**: 단순 spatial pooling으로 토큰을 줄이면 정확도가 떨어지지만, TokenLearner는 더 적은 연산으로 baseline보다 살짝 높음.
- **대형 모델 효율화**: ViT L/8(24+11, 460M)이 ViT-G/14(1843M)에 근접하는 정확도(88.87 / ImageNet ReaL 91.05)를 훨씬 적은 파라미터로 달성.
- **비디오**: Kinetics-400/600·Charades·AViD에서 frame당 8~16 토큰만으로 당시 SOTA — 토큰 수가 폭증하는 비디오에서 특히 효과적.

## 한 줄 정리 & 의의

- 토큰을 **버리거나(pruning) 합치는(merging)** 대신, **소수의 토큰을 학습으로 생성/요약(pooling)** 하는 계열의 대표작. uniform grid라는 전제 자체를 학습으로 대체한다.
- **한계 / 이후.** spatial 토큰을 프레임 단위로 뽑는 데 초점 — 완전한 spatio-temporal 토큰 학습은 future work로 남겼다. → [Token Reduction 개요]({% post_url 2026-06-19-token-reduction-overview %})
