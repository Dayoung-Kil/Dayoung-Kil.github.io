---
layout: post
title: "[Token Cropr] Token Cropr: Faster ViTs for Quite a Few Tasks"
date: 2023-12-01
description: "Prunes tokens by task relevance using auxiliary cross-attention heads that are thrown away after training, plus Last Layer Fusion to revive pruned tokens for dense tasks."
thumbnail: assets/img/notes/token-cropr/fig1.png
categories: token-reduction-in-vits
tags: pruning
shortname: Token Cropr
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
  .post-content table { font-size: 0.8rem; }
  .post-content figure { max-width: 620px; margin-left: auto; margin-right: auto; }
  .post-content .tr-callout { background-color: rgba(110,133,183,0.08); border-left: 4px solid #6e85b7; }
  .post-content .tr-callout p { margin-bottom: 0; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#659287;color:#fff">Pruning</span>
  <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">CVPR 2025</span>
</div>
<p class="text-muted mb-3">Benjamin Bergner, Christoph Lippert, Aravindh Mahendran · Hasso Plattner Institute / Google DeepMind</p>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://arxiv.org/abs/2412.00965" target="_blank" rel="noopener noreferrer">arXiv</a>
  <a class="btn btn-sm btn-outline-dark" href="https://github.com/benbergner/cropr" target="_blank" rel="noopener noreferrer">GitHub</a>
</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> 토큰의 중요도를 attention 휴리스틱이 아니라 <strong>task 적합도(task relevance)</strong>로 직접 학습한다. 각 블록에 <strong>보조 예측 head + cross-attention</strong>(Cropr 모듈)을 붙여, 그 head가 task를 풀게 하면서 cross-attention score로 토큰 순위를 매겨 상위만 다음 layer로 보낸다. 학습이 끝나면 <strong>보조 head를 통째로 떼어내</strong>(추론 시 router만 남아) random pruner에 가까운 속도가 된다. dense task는 <strong>Last Layer Fusion(LLF)</strong> 으로 버린 토큰을 마지막 블록 직전에 되살린다. 분류·분할·검출에서 1.5–4× 가속, 성능 손실은 작다(ADE20k seg에서 2× 속도에 mIoU −0.1).</p>
</div>

## 배경

token pruning의 핵심 질문은 "**어떤 토큰이 이 task에 중요한가**"다. 기존 방법들은 이걸 제대로 못 풀었다.

- **attention 휴리스틱의 한계** — 대부분 [CLS] attention이 높은 토큰을 남긴다([EViT]({% post_url 2022-02-01-evit %}) 등). 하지만 이는 task 중요도를 **명시적으로 모델링하지 않고**, FlashAttention 같은 fused kernel에선 attention matrix 접근이 막혀 쓰기 어렵다. Saliency·Occlusion 같은 attribution은 정확하지만 forward를 한 번 더 돌려야 해 비싸다.
- **분류 편향** — 대부분의 연구가 분류에만 맞춰져 있다. segmentation·detection 같은 **dense task**는 픽셀 단위 예측이 필요해 "토큰을 버린다"는 발상과 정면으로 충돌한다.
- **파라미터 모듈의 부작용** — 학습형 선택 모듈([DynamicViT]({% post_url 2021-06-01-dynamicvit %}) 등)은 추가 layer·loss가 본 task의 gradient와 간섭하고, 추론 비용도 늘린다.

<div class="row justify-content-center">
  <div class="col-lg-8 col-md-10">
    {% include figure.liquid loading="lazy" path="assets/img/notes/token-cropr/fig1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 1. Cross-attention pruning(Cropr) 모듈이 블록마다 덜 중요한 토큰을 잘라내고 가장 변별력 있는 토큰만 깊은 layer로 보낸다. 분류·분할·검출에 두루 적용. heatmap은 각 블록에서 어떤 토큰이 잘렸는지를 보여준다." %}
  </div>
</div>

> task를 직접 푸는 **보조 head**가 "어떤 토큰이 중요한지" 신호를 주게 하고, 그 head는 추론 때 떼어버리면 정확도와 속도를 둘 다 잡을 수 있지 않을까?

## 핵심 아이디어

각 블록 위에 **Cropr(Cross-attention pruning) 모듈**을 얹는다. 모듈은 **router**(scorer + selector)와 **aggregator + task head**로 구성된다.

- **router** — cross-attention으로 각 토큰에 점수를 매기고(scorer), 상위 K개만 남기고 나머지 R개를 자른다(Top-K selector).
- **aggregator + 보조 head** — 같은 cross-attention으로 토큰을 가중 평균해 **중간 예측**을 만들고, 그 task loss가 scorer를 학습시킨다 → "task에 기여하는 토큰"에 높은 점수가 가도록.

**핵심 트릭 두 가지:** ① 보조 head·aggregator(Figure 2의 노란 부분)는 **학습에만 필요**하므로 추론 때 떼어낸다 → router만 남아 거의 random pruner 속도. ② dense task용 **Last Layer Fusion**으로 버린 토큰을 마지막에 되살린다.

<div class="row justify-content-center">
  <div class="col-lg-8 col-md-10">
    {% include figure.liquid loading="lazy" path="assets/img/notes/token-cropr/fig2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 2. 학습 중 Cropr 모듈. router(scorer+selector)가 keep/prune 토큰을 가른다. scorer의 attention matrix A를 aggregator가 재사용해 중간 예측을 만들고, 그 gradient(빨간 점선)가 scorer와 query를 학습시킨다. encoder로는 stop-gradient." %}
  </div>
</div>

## 방법

### Cropr 모듈

입력 토큰 $X \in \mathbb{R}^{M\times D}$에서 학습 query $Q \in \mathbb{R}^{N\times D}$로 cross-attention을 계산한다:

$$
A = Q \times K(X)^\top, \qquad a = \sum_{n=1}^{N} A_n
$$

query 축으로 합한 점수 $a$의 **상위 K개**를 keep, 나머지 R개(pruning rate)를 prune한다. scorer는 linear projection·multi-head·LayerNorm 없이 **1-head·무투영**으로 단순화해도 성능이 떨어지지 않고 더 빠르다(ablation Table 4a). aggregator는 같은 $A$로 토큰을 가중 평균($X' = \text{softmax}(A/\sqrt{D})X$)한 뒤 **MLP+LN+residual**로 표현력을 키워 보조 head에 넘긴다(이건 추론 때 제거되니 공짜다).

**stop-gradient**가 scorer·aggregator 앞에 걸려, 보조 loss가 backbone을 건드리지 않는다 — gradient 간섭을 막고 학습도 빨라진다.

### Task별 설계

flexible query 메커니즘(Perceiver IO 풍)이라 query 개수·head·loss만 바꿔 여러 task에 맞춘다.

- **분류** — query 1개, aggregated 토큰 하나를 분류 head로. softmax CE.
- **Segmentation** — patch당 query 1개($N=h\times w$)로 격자 표현, patch별 CE(라벨을 feature 해상도로 downsample해 재사용).
- **Detection/Instance seg** — Cascade Mask R-CNN은 보조 head로 쓰기엔 무거워, **multi-label 분류**를 대리(proxy) task로(이미지 내 등장 class 집합 맞히기). query 1개, sigmoid BCE.

### Last Layer Fusion (LLF)

dense task는 모든 patch 정보가 필요하다. LLF는 **모든 Cropr 모듈에서 잘린 토큰을 마지막 ViT 블록 직전에 원위치로 다시 끼워 넣는다.** 마지막 블록이 keep 토큰의 깊은 feature와 pruned 토큰을 함께 self-attention 처리해 정보를 동기화한다 — **추가 파라미터 0**. 단순 concat(`Token Concat`)·logit fusion(DToP)보다 낫고, 자체 학습 cross-attention보다도 좋다(Table 5: LLF 56.6 vs DToP 50.1 mIoU).

### 효율적 추론

추론 땐 aggregator·보조 head를 떼고 router만 남긴다. scorer의 $O(N\times M)$도, attention matrix를 만들 필요 없이 query를 미리 합친 $\bar q = \sum_n Q_n$ 하나로 줄여 $O(M)$ vector-matrix 곱이 된다:

$$
a = \Big(\sum_{n=1}^{N} Q_n\Big)K^\top = \bar q K^\top
$$

그 결과 throughput이 **random selector에 근접**한다. (참고: keep 토큰 수를 8의 배수로 맞추면 메모리 정렬 덕에 throughput이 크게 오른다 — 토큰 1개 차이로 최대 1.8× 느려지기도.)

## 결과

ImageNet-1k(MAE ViT-L, EVA-02-L), ADE20k seg, COCO det/inst seg. 블록마다 R개씩 잘라 네트워크 끝에서 대부분 제거. baseline은 random·variance·Attn Top-K(모두 LLF 장착).

{% include figure.liquid loading="lazy" path="assets/img/notes/token-cropr/table1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Table 1. ImageNet-1k(ViT-L). Cropr는 같은 throughput에서 모든 pruning baseline(random·variance·Attn Top-K)을 능가하고, ToMe·EViT 등 기존 방법과 견주어 성능·속도 모두 경쟁력. non-salient(중요 토큰을 거꾸로 자르는) 변형은 random보다 못해, scorer가 task 적합도를 제대로 학습함을 보인다." %}

- **분류** — base 대비 0.3–0.7%p 손실로 1.6–1.9× 가속. SoTA **EVA-02-L**에선 R=40+LLF로 TPR 86%에 89.9→**89.7%**(−0.2), **2.1×** 속도·FLOPs −41%. 공격적 스케줄(3번째 블록서 80% 한 번에 prune, LLF 없이)은 −1.1%p에 **4.1×**·FLOPs −76%.
- **클수록·고해상도일수록 유리** — 모델이 커질수록 성능 손실이 줄고(−0.9 ViT-B → −0.4 ViT-H) 속도 이득이 커진다(1.5×→1.9×). 해상도도 마찬가지(448px에서 손실 −0.06으로 거의 사라짐).
- **dense task로 확장** — ADE20k seg: TPR 86%에 mIoU **−0.1**(5 seed median), **2.0×** 속도. COCO det/inst: TPR 97%에 **63.0 AP**ᵇᵒˣ·54.0 AP^mask, encoder 2.4×·전체 1.9× 가속, FLOPs −54%.

<div class="row justify-content-center">
  <div class="col-lg-8 col-md-10">
    {% include figure.liquid loading="lazy" path="assets/img/notes/token-cropr/fig6.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 6. Segmentation pruning 시각화. 하늘·바닥·벽 같은 stuff class를 먼저 자르되, 각 class에서 몇 토큰은 깊은 layer까지 남긴다. pruning에도 같은 class의 인접 출력이 일관적 — LLF 덕분에 일찍 잘린 토큰이 이웃의 깊은 표현에 attend." %}
  </div>
</div>

- **ablation** — 단순 1-head scorer > MHA(성능·속도 모두), Top-K > sampling, aggregator MLP는 추론 부담 없이 +0.3%p, stop-gradient가 더 좋다(gradient 간섭 방지). LLF는 pruned 토큰 간 self-attention을 허용해 fusion 대안들을 모두 능가.

## 한 줄 정리 & 의의

- 중요도를 attention 휴리스틱이 아니라 **보조 task head로 직접 학습**하는 Pruning 계열. "**학습용 모듈은 추론 때 떼어낸다**"는 설계로, 학습형 selector의 정확도와 무학습 selector의 속도를 동시에 취한다.
- **task 범용성** — query·head·loss만 갈아끼워 분류·segmentation·detection·instance seg에 적용. 특히 **LLF**로 버린 토큰을 마지막에 되살려 dense task에서도 토큰을 공격적으로 자른다(token reduction이 분류를 넘어 dense task로 확장되는 흐름의 대표 사례).
- **위치.** [DynamicViT]({% post_url 2021-06-01-dynamicvit %})처럼 학습형이지만 보조 head를 stop-gradient로 격리하고 추론 때 제거해 간섭·오버헤드를 없앴고, [EViT]({% post_url 2022-02-01-evit %})의 [CLS]-attention 휴리스틱을 **명시적 task 학습**으로 대체했다. 버린 토큰을 한두 개로 요약(summarize)하는 대신 **원본 그대로 마지막에 재합류**시키는 점이 [Evo-ViT]({% post_url 2022-02-15-evo-vit %})·[STAR]({% post_url 2023-09-01-star %}) 등의 토큰 재활용과 결이 다르다. → [Token Reduction 개요]({% post_url 2026-06-19-token-reduction-overview %})
