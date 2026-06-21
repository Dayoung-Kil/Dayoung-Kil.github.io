---
layout: post
title: "[DynamicViT] Efficient Vision Transformers with Dynamic Token Sparsification"
date: 2021-06-01
description: "Dynamically drops redundant tokens per input to speed up ViTs."
thumbnail: assets/img/notes/dynamicvit/fig1.png
categories: token-reduction-in-vits
tags: pruning
shortname: DynamicViT
venue: NeurIPS 2021
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
  .post-content .tr-callout { background-color: rgba(93,92,152,0.08); border-left: 4px solid #5d5c98; }
  .post-content .tr-callout p { margin-bottom: 0; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#e8c468;color:#1c1c1d">Pruning</span>
  <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">NeurIPS 2021</span>
</div>
<p class="text-muted mb-3">Yongming Rao, Wenliang Zhao, Benlin Liu, Jiwen Lu, Jie Zhou, Cho-Jui Hsieh · Tsinghua / UCLA / UW</p>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://arxiv.org/abs/2106.02034" target="_blank" rel="noopener noreferrer">arXiv</a>
  <a class="btn btn-sm btn-outline-dark" href="https://github.com/raoyongming/DynamicViT" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github me-1"></i> GitHub</a>
</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> ViT의 예측은 일부 informative 토큰에만 의존한다 — 그래서 입력마다 redundant 토큰을 <strong>동적으로 잘라내</strong> 연산량을 줄이는, "토큰을 버린다(pruning)" 계열의 출발점 논문.</p>
</div>

## 배경

ViT는 이미지를 패치 토큰 시퀀스로 처리하는데, **최종 예측은 모든 패치 토큰을 똑같이 필요로 하지 않는다.** 일부 informative한 토큰만으로도 정확한 분류가 가능하다 — 즉 토큰에는 큰 **redundancy**가 있고, *어떤 위치가 중요한지는 이미지마다 다르다.*

{% include figure.liquid loading="lazy" path="assets/img/notes/dynamicvit/fig1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 1. (a) CNN의 구조적 다운샘플링 vs (b) 입력에 따라 달라지는 비구조적(unstructured) 토큰 sparsification. (c) DeiT-S의 attention 시각화 — 최종 예측이 소수의 informative 토큰에 집중됨을 보여, 많은 토큰을 제거해도 성능 유지가 가능함을 시사." %}

> 배경의 잔디·하늘처럼 예측에 거의 기여하지 않는 토큰이 많다. 그렇다면 그것들을 끝까지 다 계산할 필요가 있을까?

## 핵심 아이디어

입력마다 **어느 토큰이 redundant한지 동적으로 판단**해서 제거한다.

- **CNN**은 보통 2×2 pooling이나 stride convolution처럼 *정해진 grid* 구조로 feature map을 다운샘플링한다 (structured). 반면 **ViT**는 토큰 시퀀스를 입력으로 받기 때문에 *규칙적인 위치의 토큰만 남길 필요가 없다* → **unstructured, data-dependent downsampling.**
- self-attention은 **가변 길이** 시퀀스를 받으므로, 비정형으로 토큰을 골라내도 연산이 그대로 가속된다. (반대로 CNN에서 픽셀 일부를 비정형으로 버리면 병렬 가속이 어렵다 — token pruning이 ViT에서 특히 잘 맞는 이유.)

## 방법

### 1) Prediction module — 토큰별 keep/drop 확률 예측

블록 사이에 **경량 prediction module**을 끼워, 직전 layer feature를 보고 각 토큰의 **유지/제거 확률**을 예측한다.

{% include figure.liquid loading="lazy" path="assets/img/notes/dynamicvit/fig2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 2. prediction module이 transformer 블록 사이에 삽입되어, 이전 layer feature를 조건으로 덜 중요한 토큰을 선택적으로 가지치기한다. 이후 layer는 더 적은 토큰만 처리한다." %}

- **local feature**: 각 토큰을 MLP로 투영(C → C/2) — 그 토큰 자체의 정보.
- **global feature**: 현재 살아있는 토큰들에 대한 (masked) average pooling — 이미지 전체 맥락.
- 둘을 concat → MLP → softmax로 **drop/keep 2-class 확률** 산출. 한 번 버려진 토큰은 이후로 다시 쓰이지 않는다(누적 마스크 Hadamard 곱).

### 2) Hierarchical(단계적) sparsification

한 번에 자르지 않고 **여러 단계에 걸쳐 점진적으로** 토큰을 줄인다. 본 논문은 12-layer 기준 **블록 4·7·10 앞에서 3단계(S=3)** 적용, 단계별 keep ratio를 기하수열 **[ρ, ρ², ρ³]** 로 둔다. (예: ρ=0.7 → 마지막엔 약 34%만 남아 ≈ **66% 토큰 제거**.)

### 3) End-to-end 학습 — Gumbel-Softmax + Attention Masking

- 확률 π에서 binary mask를 **샘플링하는 연산은 미분 불가** → **Gumbel-Softmax**로 미분 가능한 one-hot 마스크를 뽑아 end-to-end 학습.
- 학습 중 토큰을 **실제로 빼면** 샘플마다 남는 토큰 수가 달라져 배치 병렬화가 깨진다. 그렇다고 단순히 **0으로 만들면** softmax 분모에 여전히 영향을 준다.
- 그래서 **Attention masking**: drop된 토큰이 *다른 토큰에 기여하지 못하도록* attention 그래프에서 연결을 끊는다(자기 자신엔 self-loop 유지). 학습 땐 shape를 N×N로 고정한 채 "살아있는 토큰만 attend한 것과 동일한" 결과를 얻고, **inference 땐 실제로 토큰을 제거**해 가속.

### 4) 학습 목표

$$
\mathcal{L} = \mathcal{L}_{cls} + \lambda_{KL}\mathcal{L}_{KL} + \lambda_{distill}\mathcal{L}_{distill} + \lambda_{ratio}\mathcal{L}_{ratio}
$$

- **cls**: 일반 cross-entropy.
- **ratio**: 실제 keep 비율이 목표 ρ에 맞도록 하는 MSE 제약.
- **distill (KL + token)**: 원본(가지치기 안 한) 모델을 teacher로 두고, 예측 분포(KL)와 남은 토큰 feature(token-wise MSE)를 모방 → 가지치기로 인한 성능 저하 보완.
- 설정: λ_KL = λ_distill = 0.5, λ_ratio = 2. pretrained 백본에서 30 epoch fine-tune(첫 5 epoch 백본 freeze).

## 결과

{% include figure.liquid loading="lazy" path="assets/img/notes/dynamicvit/table1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Table 1. ImageNet 메인 결과. DeiT-S / LV-ViT-S / LV-ViT-M에 적용, 단계별 keep ratio ρ에 따른 top-1 / FLOPs / throughput." %}

- 입력 토큰의 약 **66%를 단계적으로 제거**해 **FLOPs 31~37% 감소**, **throughput 40%+ 향상**, 정확도 하락은 **0.5%p 이내**.
- DeiT-S(ρ=0.7): 79.8 → **79.3 (−0.5)**, FLOPs 4.6 → 2.9G(**−37%**), throughput **+54%**.
- DynamicViT-LV-M/0.7(83.8 @ 8.5 GFLOPs)은 **EfficientNet-B5·NFNet-F0를 능가**(둘 다 83.6, 더 큰 FLOPs).

{% include figure.liquid loading="lazy" path="assets/img/notes/dynamicvit/fig3.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 3·4. (좌) FLOPs–정확도 trade-off에서 SOTA CNN/ViT 대비 우위. (우) 동적 토큰 sparsification이 단순 width scaling보다 효율적." %}

### Ablation (DeiT-S, 동일 2.9G FLOPs · top-1 acc)

| 비교 축 | 설정 → Acc(%) |
| --- | --- |
| **선택 방식** | Random 77.5 · Attention 78.1 · **Prediction(제안) 79.3** |
| **다운샘플** | Static 73.4 · Structural 78.2 · **Dynamic(제안) 79.3** |
| **단계 수** | 1-stage 77.4 · 2-stage 79.2 · **3-stage(제안) 79.3** |

→ *학습된 prediction module*, *입력 의존 dynamic*, *progressive(다단계)* 세 가지가 모두 효과적임을 보여준다. (distillation/KL loss는 영향이 크진 않지만 일관되게 소폭 향상.)

## 한 줄 정리 & 의의

- 토큰 redundancy를 **입력별로 동적으로 제거**한다는 흐름의 *출발점*. 가지치기 결정이 점진적으로 객체에 집중되어 **해석 가능성(interpretability)** 도 덤으로 얻는다.
- **한계 / 이후 연구.** 본 논문은 **이미지 분류** 중심이고, video·dense prediction 확장은 future work로 남겼다. 또 "잘못 버리면 정보가 날아간다"는 pruning 본연의 약점이 있어, 이후 연구는 **버리는 대신 합치거나(merging) 요약(pooling)** 하는 방향으로 발전한다. → [Token Reduction 개요]({% post_url 2026-06-19-token-reduction-overview %})
