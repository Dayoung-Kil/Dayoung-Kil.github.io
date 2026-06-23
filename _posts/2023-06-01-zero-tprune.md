---
layout: post
title: "[Zero-TPrune] Zero-Shot Token Pruning through Leveraging of the Attention Graph in Pre-Trained Transformers"
date: 2023-06-01
description: "Treats the attention matrix as a directed graph and ranks tokens with a Weighted PageRank — pruning without any fine-tuning."
thumbnail: assets/img/notes/zero-tprune/fig2.png
categories: token-reduction-in-vits
tags: pruning
shortname: Zero-TPrune
venue: CVPR 2024
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
  .post-content .tr-callout { background-color: rgba(93,92,152,0.08); border-left: 4px solid #5d5c98; }
  .post-content .tr-callout p { margin-bottom: 0; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#659287;color:#fff">Pruning</span>
  <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">CVPR 2024</span>
</div>
<p class="text-muted mb-3">Hongjie Wang, Bhishma Dedhia, Niraj K. Jha · Princeton University</p>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://arxiv.org/abs/2305.17328" target="_blank" rel="noopener noreferrer">arXiv</a>
  <a class="btn btn-sm btn-outline-dark" href="https://jha-lab.github.io/zerotprune" target="_blank" rel="noopener noreferrer">Project</a>
</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> 대부분의 token pruning은 점수 예측 모듈을 백본과 함께 <strong>fine-tuning</strong>해야 한다(예: DynamicViT는 DeiT-S에 A100 150시간). Zero-TPrune은 사전학습 모델의 <strong>attention matrix를 directed graph로 보고</strong>, <strong>Weighted PageRank(WPR)</strong>로 토큰 중요도를 매겨 <strong>학습 없이(zero-shot)</strong> pruning한다. 중요도(I-stage)와 유사도(S-stage)를 함께 고려하며, fine-tuning 없이 DeiT-S의 FLOPs를 34.7% 줄이고 throughput을 45.3% 높이면서 정확도 손실은 0.4%뿐이다.</p>
</div>

## 배경

이 노트의 핵심 문제의식은 **"pruning에 드는 학습 비용"** 이다. DynamicViT·A-ViT 같은 SOTA pruning은 토큰을 고를 점수 예측 모듈을 백본과 함께 학습해야 한다 — DeiT-S 하나 가지치기에 **A100 GPU 150시간**, DeiT-B·L이면 **수천 GPU-시간**이 든다.

- **엣지 배포에서 치명적이다.** 기기마다 메모리·연산·throughput 요구가 제각각이라, 압축률(retention ratio) 하나 바꿀 때마다 모델을 **다시 학습**해야 한다. 사용 가능한 자원이 부족한 엣지 환경에서는 비현실적이다.
- **큰 모델일수록 불가능에 가깝다.** 가지치기 후 재학습 비용 자체가 모델 크기에 비례해 폭증한다.

{% include figure.liquid loading="lazy" path="assets/img/notes/zero-tprune/fig1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 1. 기존 방법(위)은 압축률 ρ를 바꿀 때마다 모델을 재학습해야 해 라인업(노트북·폰·IoT)마다 비용이 따로 든다. Zero-TPrune(아래)은 training-free라서, 사전학습 모델에 pruning layer만 끼우면 추가 학습 비용 없이 어떤 압축률로도 전환된다. 이는 attention matrix를 directed complete graph로 보는 그래프 기반 알고리즘 덕분이다." %}

> 학습 없이 토큰을 가지치기하려면, **어떤 토큰이 중요한지**를 사전학습 모델 안에서 그냥 읽어낼 수는 없을까?

## 핵심 아이디어

soft attention은 **토큰을 노드로, attention 값을 엣지 가중치로** 하는 directed graph를 만든다. 저자들은 이 **attention graph가 "중요한 토큰"의 정보를 이미 충분히 담고 있다**고 보고, 두 가지를 끌어낸다.

- **중요도 (importance)** — "중요한 토큰은 다른 중요한 토큰들로부터 attention을 받는다"는 가정. 이는 검색엔진이 웹페이지를 정렬하던 **PageRank**와 정확히 같은 구조다 → 이를 가중·방향 그래프로 일반화한 **WPR**로 토큰 중요도를 반복적으로 매긴다.
- **유사도 (similarity)** — 토큰들은 비슷한 추상을 학습해 **중복(redundant)** 된 복사본이 많다. 같은 feature의 사본은 손실 없이 버릴 수 있다.

ATS는 CLS 토큰의 attention만 쓰고 유사도를 무시했고, [ToMe]({% post_url 2023-02-01-tome %})는 유사도만 보고 attention 전체를 활용하지 못했다. Zero-TPrune은 **attention matrix 전체 + embedding을 모두 써서 중요도와 유사도를 동시에** 고려하는 첫 zero-shot 방법이다.

{% include figure.liquid loading="lazy" path="assets/img/notes/zero-tprune/fig2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 2. 전체 프레임워크. pruning layer는 transformer block 사이 어디든 끼울 수 있고 I-stage와 S-stage로 구성된다 — I-stage는 배경 같은 '안 중요한' 토큰을(b), S-stage는 반복 텍스처처럼 '서로 너무 비슷한' 토큰을(c) 제거한다. 둘을 합치면 토큰 중복을 최대로 활용한다(d)." %}

## 방법

### I-stage: Weighted PageRank로 중요도 매기기

attention matrix $A^{(h,l)}$ 를 directed complete graph의 **인접행렬(adjacency matrix)** 로 본다. 각 노드의 그래프 신호(=토큰 중요도)를 균등하게 초기화한 뒤, 인접행렬을 **Graph Shifting Operator**로 반복 적용한다. 각 토큰은 자신이 주는 attention 가중치만큼 다른 토큰에 "투표"하고, 더 중요한 토큰의 투표일수록 더 큰 영향력을 갖는다:

$$
s^{(h,l)}(x_i) = \frac{1}{N}\sum_{j=1}^{N} A^{(h,l)}(x_i, x_j)\, s^{(h,l)}(x_j)
$$

수렴할 때까지 $s^t \leftarrow A^\top s^{t-1}$ 를 반복(Algorithm 1)하면, 의미적으로 중요한 토큰에 높은 점수가 쌓이고 약한 토큰의 노이즈는 줄어든다. 그렇게 얻은 분포에서 **top-k 토큰만 남긴다**. ablation 결과 수렴에 필요한 iteration은 **얕은 layer 30–50, 중간 5–10, 깊은 layer 1회**로, 미리 정해 둘 수 있다.

단순 평균만으로는 부족해 두 보정 기법을 더한다.

- **EIR (Emphasizing Informative Region)** — head마다 보는 영역이 달라, 점수를 head 전체로 그냥 평균 내면 "한두 head에서 매우 중요한 토큰"이 "모든 head에서 어중간한 토큰"에 밀린다. 그래서 head 점수를 **제곱합의 제곱근(root-mean of squares)** 으로 합쳐 informative한 영역을 부각한다.
- **VHF (Variance-based Head Filter)** — 일부 head는 가장자리 토큰에만 높은 점수를 주거나(분포 분산 과대) 거의 균등한 분포로 수렴(분산 과소)해 오히려 방해가 된다. 분포 분산이 $[v_{min}, v_{max}]$(기본 [0.01, 0.7]) 밖인 head는 집계에서 제외한다:

$$
s^{(l)}(x_i) = \sqrt{ \frac{\sum_{h=1}^{N_h} s^{(h,l)}(x_i)^2 \cdot \eta(v_{min}\le Var_h \le v_{max})}{\sum_{h=1}^{N_h} \eta(v_{min}\le Var_h \le v_{max})} }
$$

I-stage 전체 복잡도는 $O(N^2)$. 분류 태스크에서는 CLS 토큰이 훨씬 중요하다는 점을 살려, 초기화 때 CLS에 다른 토큰의 $\sqrt{N}$ 배 점수를 준다(이 설정을 "Zero-TPrune", 균등 초기화 버전을 "Zero-TPrune-uni"라 부른다).

### S-stage: 유사도 기반 pruning

중요한 토큰들 사이에도 중복은 있으니, 유사도로 한 번 더 쳐낸다. 모든 쌍을 비교하면 비싸므로 토큰을 **두 그룹으로 분할(partition)** 한다.

{% include figure.liquid loading="lazy" path="assets/img/notes/zero-tprune/fig5.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 5. ImageNet 검증셋에서의 가지치기 과정 시각화. 압축률이 공격적이고 물체가 화면을 거의 채울 때는 배경만 지워서는 부족하다 — Zero-TPrune은 물체 내부의 비슷한(중복) 토큰까지 골라 제거한다." %}

- **(1–2) Partition** — 중요도 순으로 정렬해 비슷한 크기의 그룹 A·B로 가른다. ablation상 **Sequential-U**(덜 중요한 절반을 A로, 그 A에서 가지치기)가 alternate·random·no-partition을 모두 누른다.
- **(3) Match** — A의 각 토큰에 대해 B에서 **가장 비슷한 토큰**을 찾는다. feature는 **Key 행렬** 벡터, 유사도는 **cosine similarity**가 최적(둘 다 ablation으로 선택).
- **(4–5) Prune** — top-r 유사 쌍에서 A 쪽 토큰을 **버린다**. 합치지 않고 버리는 이유: ① 이미 비슷해 손실이 미미하고, ② merge는 합친 토큰에 큰 가중치를 줘야 해(ToMe) Sparse Transformer 같은 특정 백본과 호환되지 않는다.

S-stage 복잡도는 $O(N^2 d)$.

### 순서: I′ → S → I

I-stage와 S-stage를 단순히 이어 붙이면(I→S), 배경처럼 **안 중요한 토큰이 다수일 때 자기들끼리 투표를 주고받아** 중요도를 부풀리는 "다수 그룹의 점령(overwhelming of the major group)" 현상이 생긴다(부록 A: 물고기 사진에서 배경이 물고기보다 중요하게 잡힘). 그래서 순서를 뒤집어, **S-stage를 먼저** 두어 비슷한 배경 토큰을 미리 제거한다. 분할에 쓸 중요도를 위해 **1회 투표만 하는 pre-ranking I′-stage**(여기선 아무것도 안 버림)를 앞에 붙여, 최종 pruning layer는 **I′ → S → I** 순서가 된다.

## 결과

평가는 ImageNet, 백본은 DeiT·LV-ViT·AugReg·MAE·SWAG 등. throughput은 A100 1장 기준.

{% include figure.liquid loading="lazy" path="assets/img/notes/zero-tprune/fig7.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 7. fine-tuning-free 방법 비교(DeiT-S). Zero-TPrune(빨강)이 전 구간에서 ATS·ToMe를 상회 — 3 GFLOPs에서 정확도 손실을 33% 줄인다." %}

- **fine-tuning-free SOTA** — DeiT-S 3 GFLOPs 예산에서 ATS·ToMe 대비 정확도 손실을 **33%** 줄인다. 대표 설정(Zero-TP-a): **−0.4% 정확도, FLOPs −34.7%, throughput +45.3%**. FLOPs를 13% 줄이는 건 거의 무손실(−0.0%).
- **fine-tuning-required 방법과 동급** — 가지치기 후 학습이 **전혀 없는데도**, fine-tuning을 한 DynamicViT·A-ViT와 맞먹는다(3.5 GFLOPs에서 최고 대비 정확도 손실 0.1%). 학습을 추가하면 둘을 능가.
- **중간 크기 모델에서 큰 격차** — AugReg·LV-ViT-S에서 baseline 대비 정확도 손실을 **최대 49%** 줄인다.
- **공격적 압축 + 큰 모델은 예외** — 큰 모델을 50%씩 공격적으로 줄이면 ToMe에 밀린다. 다만 저자들은 "큰 모델을 공격적으로 자르느니 **애초에 작은 모델을 쓰는 게 낫다**"고 짚는다(LV-ViT-S+Zero-TPrune이 LV-ViT-M+ToMe를 60% FLOPs로 거의 따라잡음).
- **기여도 분해** — random drop(−3.0%) 대비 WPR만으로 +1.8%p 회복, EIR·VHF로 +0.3%p, S-stage로 +0.5%p 추가(표 1). transfer learning(downstream 7개 데이터셋)에서도 baseline 우위.

## 한 줄 정리 & 의의

- **학습이 필요 없는(zero-shot) pruning**의 대표작. 점수 예측 모듈을 따로 학습하던 흐름([DynamicViT]·EViT, 그 손실을 보강한 [TPS]({% post_url 2023-04-01-tps %}))과 정반대로, **사전학습 모델의 attention graph에 이미 들어 있는 신호**를 PageRank로 읽어내 곧바로 가지치기한다.
- **중요도 × 유사도를 한 layer에 통합** — ATS(CLS attention만)와 [ToMe]({% post_url 2023-02-01-tome %})(유사도만)의 한계를 동시에 메운다. I-stage(WPR)는 배경을, S-stage(분할+매칭)는 중복을 제거하며, 순서(I′-S-I)로 다수 그룹의 점령 문제까지 다룬다.
- **위치.** 같은 "학습 없이" 계열인 [Token Pooling]({% post_url 2023-05-01-token-pooling %})이 복원 오차=클러스터링으로 접근했다면, Zero-TPrune은 **그래프 신호 전파(PageRank)** 라는 전혀 다른 도구로 같은 목표에 닿는다. 가지치기 비용 자체를 0으로 만든다는 점에서, 압축률을 학습한 [DiffRate]({% post_url 2023-03-01-diffrate %})와 대척점에 선다. → [Token Reduction 개요]({% post_url 2026-06-19-token-reduction-overview %})
