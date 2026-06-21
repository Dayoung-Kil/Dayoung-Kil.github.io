---
layout: post
title: "[AS-ViT] Adaptive Sparse ViT: Learnable Adaptive Token Pruning by Fully Exploiting Self-Attention"
date: 2023-01-01
description: "Learnable thresholds replace fixed keep-ratios, scoring tokens for free from MHSA's own intermediate results."
thumbnail: assets/img/notes/adaptive-sparse-vit/fig2.png
categories: token-reduction-in-vits
tags: pruning
shortname: AS-ViT
venue: IJCAI 2023
giscus_comments: false
related_posts: false
toc:
  sidebar: left
_styles: >
  .post-title { font-size: 1.6rem; line-height: 1.35; }
  .post-content { font-size: 0.92rem; line-height: 1.75; }
  .post-content h2 { font-size: 1.25rem; margin-top: 1.8rem; }
  .post-content h3 { font-size: 1.02rem; }
  .post-content table { font-size: 0.8rem; }
  .post-content figure { max-width: 600px; margin-left: auto; margin-right: auto; }
  .post-content .tr-callout { background-color: rgba(93,92,152,0.08); border-left: 4px solid #5d5c98; }
  .post-content .tr-callout p { margin-bottom: 0; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#e8c468;color:#1c1c1d">Pruning</span>
  <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">IJCAI 2023</span>
</div>
<p class="text-muted mb-3">Xiangcheng Liu, Tianyi Wu, Guodong Guo · Peking University / Baidu</p>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://arxiv.org/abs/2209.13802" target="_blank" rel="noopener noreferrer">arXiv</a>
  <a class="btn btn-sm btn-outline-dark" href="https://www.ijcai.org/proceedings/2023/136" target="_blank" rel="noopener noreferrer">IJCAI</a>
</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> <strong>고정 keep-ratio 대신 학습 가능한 threshold</strong> 3개만 끼워 넣어 이미지마다 다른 개수를 자른다. 점수는 <strong>별도 모듈 없이</strong> MHSA가 이미 계산한 중간 결과(attention head importance × class attention)에서 공짜로 얻고, threshold와의 단순 비교로 잘라 <strong>top-k 정렬조차 생략</strong>한다.</p>
</div>

## 배경

토큰 pruning 방법들을 점수 계산에 **추가 연산이 드는지**로 나눠 보면 두 갈래다.

- **추가 모듈형** — DynamicViT(경량 predictor), IA-RED²(RL interpreter), A-ViT(halting score). 점수는 입력 적응적이지만, 점수를 내려고 **별도 계산을 더 한다.**
- **고정 비율형** — EViT·Evo-ViT는 class attention으로 점수를 공짜로 얻지만, stage마다 **keep ratio를 사람이 정해** 모든 입력에 똑같이 적용한다.

후자의 문제: 같은 비율을 강제하면 **쉬운 샘플은 덜 잘리고(under-prune), 어려운 샘플은 초반부터 과하게 잘린다(over-prune).**

{% include figure.liquid loading="lazy" path="assets/img/notes/adaptive-sparse-vit/fig2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 2. 위: 고정 비율(모든 이미지가 70%→49%→34%로 동일). 아래: AS-ViT의 적응 비율 — 단순한 새(53→45→32%)와 복잡한 잎(83→33→29%)이 서로 다른 개수를 남긴다." %}

> "점수는 공짜로 얻으면서(고정 비율형의 장점) + 개수는 입력마다 적응(추가 모듈형의 장점)" — 두 장점만 취하자.

## 핵심 아이디어

**MHSA를 끝까지 우려먹기(fully exploiting self-attention).** 새 파라미터는 stage 경계의 **threshold 3개뿐**. 점수는 MHSA의 중간 산출물에서 그대로 뽑고, threshold보다 큰 토큰만 남긴다.

{% include figure.liquid loading="lazy" path="assets/img/notes/adaptive-sparse-vit/fig4.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 4. 전체 구조 — Context의 head별 L2-norm으로 token-level head importance를 구하고(normalize 후 가중치), vanilla class attention과 Hadamard 곱(⊙)해 token score S를 만든 뒤, learnable threshold θ와 비교(>θ)해 마스크를 생성." %}

## 방법

### 1) Head importance weighted class attention score

기존 class attention 점수는 모든 head를 **단순 평균**해 head별 다양성을 무시한다. AS-ViT는 head마다 가중치를 다르게 준다.

- 각 head의 **Context**(= softmax(QKᵀ/√Dₕ)·V, MHSA가 이미 계산한 값) 벡터의 **L2-norm**을 head importance로 본다. CNN filter pruning에서 L2-norm을 중요도로 쓰던 데서 착안.

$$
\mathcal{H}^{(h,l)}(x_i) = \lVert \mathrm{Context}^{(h,l)}(x_i) \rVert_2
$$

- 이를 head들 사이에서 정규화해 가중치 $\mathcal{R}^{(h,l)}$로 만들고, vanilla class attention $A^{(h,l)}_{cls,i}$에 곱해 합산:

$$
\mathcal{S}^{l}(x_i) = \sum_{h=1}^{H} \mathcal{R}^{(h,l)}(x_i)\cdot A^{(h,l)}(x_{cls,i})
$$

- 직관: 전경 토큰과 배경 토큰이 **선호하는 head가 다르다.** 중요한 head의 attention을 더 크게 반영해 정보 토큰을 더 정확히 가려낸다. **추가 학습·모듈 전혀 없음** (intermediate 결과 재활용).

### 2) Learnable threshold 기반 적응 pruning

- transformer block을 4 stage로 나누고, 2·3·4번째 stage 앞에 **학습 가능한 threshold θₙ (n=1,2,3)** 을 끼운다. (LTP 방식 차용)
- 점수가 threshold보다 크면 유지: $M_n(x_i)=\mathbb{1}[\mathcal{S}^l(x_i)>\theta_n]$.
- 입력마다 점수 **분포가 다르므로**, 같은 threshold로 잘라도 **남는 개수는 자연히 입력마다 달라진다** → instance-wise 적응. 정렬(top-k) 없이 **비교 한 번**으로 끝.

**학습은 어떻게?** hard mask는 비교 연산이라 gradient가 막혀 threshold가 안 배운다. → **sigmoid soft mask**로 미분 가능하게:

$$
\tilde{M}_n(x_i) = \mathrm{Sigmoid}\big(T\cdot(\mathcal{S}^l(x_i)-\theta_n)\big)
$$

온도 $T$를 크게(1e4) 두면 step 함수에 근접하고, **STE(straight-through estimator)** 로 threshold를 정상 학습. 학습 중엔 토큰을 실제로 버리지 않고 **attention mask**로 연결만 끊어 batch 병렬 학습을 유지(activation mask보다 1.6%p 우수).

### 3) Budget-aware training

DynamicViT처럼 stage별 비율을 손으로 정하는 대신, **목표 연산량(budget) 하나만** 주고 threshold가 알아서 맞추게 한다.

$$
\mathcal{L}_{FLOPs} = \lVert \mathrm{FLOPs}(x,\Theta)/B - t \rVert_1
$$

- mini-batch 평균 FLOPs를 목표값 $t$에 MAE로 맞춤. 전체 loss는 **CE + λ₁·budget + λ₂·distill** (λ₁=2, λ₂=0.5). distillation은 full model을 teacher로 KL.

## 결과

{% include figure.liquid loading="lazy" path="assets/img/notes/adaptive-sparse-vit/table1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Table 1. 기존 token pruning 대비 — 같은 복잡도에서 정확도·throughput·latency 모두 우위. AS-DeiT-S는 throughput +55%에 정확도 −0.2%." %}

- **DeiT-S**: GFLOPs 4.6→3.0(−35%), top-1 79.8→**79.6(−0.2)**, throughput **+55%**. 같은 연산의 EViT(−0.3)·Evo-ViT(−0.4)·DyViT(−0.5)보다 우수.
- **강하게 압축할수록 격차↑**: 2.3 GFLOPs에서 AS-DeiT-S 78.7 vs EViT 78.5 vs DyViT 77.5 — 고정 비율은 중요한 토큰을 강제로 버리지만 적응형은 덜 그렇다.
- **threshold 비교**라 정렬이 없어 **latency가 특히 우수**(6.56ms, DyViT 7.95 / Evo-ViT 8.66 대비). 큰 모델·고해상도(DeiT-B 384²)에서도 우위.

{% include figure.liquid loading="lazy" path="assets/img/notes/adaptive-sparse-vit/fig1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 1. ImageNet 정확도 vs GFLOPs — AS-LV-ViT(별)가 budget만 바꿔(0.6~0.9) 다양한 지점에서 SOTA trade-off." %}

**Ablation.** Adaptive Sparsity Module(고정 top-k 대비 +0.2%)과 head importance weighting(+0.07%)이 각각 기여하고, 둘은 **함께 써야** 효과적. threshold 삽입 위치는 [4,7,10]이 [3,6,9]보다 나음(초기 layer의 class attention이 불안정해서). budget만 주면 토큰 수 분포가 **Gaussian**을 그리며, 쉬운 샘플은 초반에, 어려운 샘플은 후반에 더 많이 자른다.

## 한 줄 정리 & 의의

- **ATS와 비교**: 둘 다 "고정 비율 → 입력 적응 개수"를 노리지만, ATS는 attention CDF에서 **샘플링**으로, AS-ViT는 **학습된 threshold 비교**로 개수를 정한다. AS-ViT는 head importance까지 점수에 반영하고 budget loss로 압축률을 데이터 주도로 맞추는 게 차별점.
- **EViT·Evo-ViT와 비교**: 같은 class attention 계열이지만 keep ratio를 **사람이 정하지 않고 학습**한다는 점, 그리고 head 다양성을 점수에 넣은 점이 핵심.
- **한계 / 이후.** 분류 중심이고 budget·distillation 등 fine-tuning 비용이 있다. 이후 흐름은 pruning을 넘어 **merging**(정보 보존을 위해 버리는 대신 합치기)으로 확장된다. → [Token Reduction 개요]({% post_url 2026-06-19-token-reduction-overview %})
