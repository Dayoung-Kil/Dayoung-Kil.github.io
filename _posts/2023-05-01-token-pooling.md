---
layout: post
title: "[Token Pooling] Token Pooling in Vision Transformers"
date: 2023-05-01
description: "Reframes token downsampling as minimizing reconstruction error, and solves it with simple, parameter-free clustering (K-Means / K-Medoids)."
thumbnail: assets/img/notes/token-pooling/fig1.png
categories: token-reduction-in-vits
tags: pooling
shortname: Token Pooling
venue: WACV 2023
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
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#b1d3b9;color:#1c1c1d">Pooling</span>
  <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">WACV 2023</span>
</div>
<p class="text-muted mb-3">Dmitrii Marin, Jen-Hao Rick Chang, Anurag Ranjan, Anish Prabhu, Mohammad Rastegari, Oncel Tuzel · University of Waterloo / Apple</p>

<p>
  <a class="btn btn-sm btn-outline-dark" href="https://arxiv.org/abs/2110.03860" target="_blank" rel="noopener noreferrer">arXiv</a>
</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> 토큰 다운샘플링을 "버린 뒤 <strong>복원 오차(reconstruction error)를 최소화</strong>하는 문제"로 다시 정의하고, 이 문제가 곧 <strong>클러스터링</strong>임을 보인다. 학습 파라미터 없이 <strong>K-Means / K-Medoids</strong>로 토큰을 K개 군집으로 묶고 그 중심을 출력 — score 기반 top-k가 비슷한 토큰을 한꺼번에 살리거나 버리는 편향을 피한다. DeiT 기준 <strong>같은 정확도를 42% 적은 연산</strong>으로 달성.</p>
</div>

## 배경

이 논문은 먼저 **"무엇을 줄여야 빨라지는가"**를 따진다. NLP에서는 attention의 $O(N^2)$가 병목이라 efficient-attention 연구가 많았지만, **vision transformer에서는 다르다.**

{% include figure.liquid loading="lazy" path="assets/img/notes/token-pooling/fig1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 1. (a) Token Pooling은 transformer block 사이에 끼우는 다운샘플링 연산. (b) 정확도-연산 trade-off에서 SOTA — DeiT-Ti 기준 같은 정확도를 42% 적은 flops로. (c) DeiT-S 6번째 layer의 토큰 군집 시각화: 비슷한 영역(배경·물체 표면)이 자동으로 한 클러스터로 묶인다." %}

- **병목은 attention이 아니라 FC layer다.** ViT·DeiT의 연산을 분해하면 softmax-attention은 전체의 **15% 이하**, MLP와 QKV·O projection 같은 **fully-connected layer가 80% 이상**을 차지한다. attention만 빨라져 봐야 소용이 적다.
- **토큰 수 $N$을 줄이면 모든 layer가 빨라진다.** FC layer 비용은 $O(NM^2)$ — 토큰 수에 비례한다. 차원 $M$을 줄이면 모델 용량이 깎여 정확도가 급락하지만, **토큰 수를 줄이는 건 그보다 나은 trade-off**를 준다.
- **왜 줄여도 되나? — attention이 곧 low-pass filter다.** key·query를 정규화하면 softmax-attention은 value에 대한 **고차원 가우시안 필터링(low-pass)**과 같음을 보인다. 즉 attention의 출력 토큰들은 본질적으로 **매끄럽고 서로 비슷(redundant)** 해, 표본을 줄여도 정보 손실이 작다 (Nyquist-Shannon).

> 줄여도 되는 건 알겠는데, **어떻게 골라야** 정보를 가장 적게 잃을까?

## 핵심 아이디어

기존 **score 기반(top-k) 다운샘플링**(PoWER-BERT, DynamicViT)의 약점을 짚는다. score 함수는 연속적이라 **feature가 비슷한 토큰은 점수도 비슷**해진다 → 그 결과 비슷한 토큰들이 **한꺼번에 살아남거나(중복)**, **한꺼번에 버려진다(정보 손실)**. 한쪽 봉우리(lobe)는 통째로 남고 다른 쪽은 통째로 사라지는 식이다.

Token Pooling은 발상을 바꾼다 — 토큰을 점수로 고르는 대신, **버린 뒤 원본을 가장 잘 복원하도록** 대표 토큰을 정한다. 출력 집합 $\hat{\mathcal{F}}=\{\hat f_1,\dots,\hat f_K\}$ 가 원본 $\mathcal{F}$ 를 근사할 때의 **복원 오차**를 최소화한다:

$$
\ell(\mathcal{F}, \hat{\mathcal{F}}) = \sum_{f_i \in \mathcal{F}} \| f_i - u(f_i; \hat{\mathcal{F}}) \|^2
$$

복원 $u$ 로 **nearest-neighbor interpolation**을 쓰면, 이 손실은 곧

$$
\ell(\mathcal{F}, \hat{\mathcal{F}}) = \sum_{f_i \in \mathcal{F}} \min_{\hat f_j \in \hat{\mathcal{F}}} \| f_i - \hat f_j \|^2
$$

즉 $\mathcal{F}$ 와 $\hat{\mathcal{F}}$ 사이의 **asymmetric Chamfer divergence**가 되고, 이는 정확히 **K-Means가 최소화하는 목적함수**다. 다시 말해 **"정보를 가장 적게 잃는 다운샘플링 = 토큰을 K개로 클러스터링하고 그 중심을 쓰는 것"**.

## 방법

토큰을 $K$개 군집으로 묶고 각 군집 중심(weighted mean)을 출력한다. **학습 파라미터가 전혀 없고**, 각 transformer block 뒤에 끼운다. 군집 중심 초기화에는 둔감(robust)하다.

### K-Means vs K-Medoids

- **K-Means** — 할당과 중심 갱신을 반복. 복잡도 $O(TKNM)$ 으로 매 iteration마다 토큰-중심 거리를 다시 계산해 비싸다.
- **K-Medoids** — 중심을 **실제 토큰 중 하나**로 제약($\hat{\mathcal{F}} \subseteq \mathcal{F}$). 거리 행렬을 **한 번만** 계산하면 되어 $O(TKN + N^2M)$ 으로 훨씬 싸고, 보통 **5 iteration 이내 수렴**한다. 클러스터링이 더하는 연산은 다른 layer에 비해 무시할 수준.

### Weighted clustering

복원 오차는 모든 토큰을 동등하게 보지만, 토큰마다 출력에 대한 기여가 다르다. 그래서 **significance score**(각 토큰이 받는 attention의 총합, PoWER-BERT의 그 점수)를 가중치 $w_i$ 로 써서 중요한 토큰을 더 정밀하게 근사한다 → **WK-Means / WK-Medoids**.

$$
\ell(\mathcal{F}, \hat{\mathcal{F}}; w) = \sum_{f_i \in \mathcal{F}} \min_{\hat f_j \in \hat{\mathcal{F}}} w_i \| f_i - \hat f_j \|^2
$$

> score 기반 방법은 그 점수로 **토큰을 고르는 데** 썼지만, Token Pooling은 같은 점수를 **클러스터링의 가중치로** 쓴다 — 버리지 않고 근사 품질을 높이는 방향.

## 결과

DeiT에 적용(KD 없이, block마다 다운샘플링 layer 삽입). 비용=flops, 성능=ImageNet top-1.

{% include figure.liquid loading="lazy" path="assets/img/notes/token-pooling/fig3.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 3. (a) DeiT-S에 여러 다운샘플링을 적용 — random·importance·convolution·PoWER-BERT를 모두 누르고 WK-Medoids가 전 구간 최고. (b) SOTA 비교(DynamicViT, HVT, ConViT 등) — 모든 연산 구간에서 가장 높은 정확도." %}

- **모든 baseline·구간에서 최고** — random selection ≈ 차원 축소 수준, importance selection은 그보다 낫고, PoWER-BERT가 그다음, **WK-Medoids가 전 구간 최상**. convolution(grid) 다운샘플링은 저연산 구간만 잠깐 좋고 고연산에서 무너진다.
- **헤드라인** — DeiT에 적용 시 **같은 ImageNet 정확도를 42% 적은 연산으로**. 같은 flops 기준 DeiT-Ti는 **+3.3%p**.
- **clustering 변형 ablation** — weighted > 비가중, 그리고 K-Medoids가 K-Means보다 비용 효율적(곡선이 왼쪽). 모든 변형이 baseline을 상회.
- **fine-tuning 없이도 동작** — 복원 오차를 직접 최소화하기 때문에, 사전학습 모델에 Token Pooling layer를 그냥 끼워도 정확도를 상당히 보존(Appendix E).
- **단, $K$는 정해줘야 한다** — 군집 수 $K=[K_1,\dots,K_L]$ 는 PoWER-BERT의 탐색 절차로 결정. mean-shift처럼 $K$를 자동으로 정하는 방법은 추론 중 토큰 수가 변동해 배포가 어려워 쓰지 않는다.

## 한 줄 정리 & 의의

- 토큰 다운샘플링을 **복원 오차 최소화 = 클러스터링**으로 재정의한 **Pooling 계열**. 학습 파라미터 없이 K-Medoids 한 번으로, score 기반 top-k의 "비슷한 토큰을 통째로 살리거나 버리는" 편향을 정면으로 해결한다.
- **두 가지 분석적 기여**가 핵심 — (1) ViT의 병목은 attention이 아니라 FC layer라 **토큰 수를 줄여야** 전체가 빨라진다, (2) attention ≈ low-pass filter라 출력 토큰엔 **줄여도 되는 redundancy**가 있다. 이후 모든 token reduction 연구의 동기를 깔끔히 정리해 준다.
- **위치.** 점수로 **고르는**(DynamicViT·[EViT]({% post_url 2022-02-01-evit %})) 대신 군집 중심으로 **대표**한다는 점에서, 비슷한 토큰을 **짝지어 합치는** [ToMe]({% post_url 2023-02-01-tome %})의 merging과 사상이 맞닿는다 — 다만 ToMe가 가벼운 bipartite matching이라면 Token Pooling은 본격적인 clustering. 같은 significance score를 [TPS]({% post_url 2023-04-01-tps %})는 squeeze 대상 선택에, 여기서는 군집 가중치에 쓴다. → [Token Reduction 개요]({% post_url 2026-06-19-token-reduction-overview %})
