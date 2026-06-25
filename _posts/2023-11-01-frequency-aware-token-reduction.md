---
layout: post
title: "[Frequency-Aware TR] Frequency-Aware Token Reduction for Efficient Vision Transformer"
date: 2023-11-01
description: "Reads token reduction through a frequency lens: keeps high-frequency tokens (which fight rank collapse) and squeezes the low-frequency rest into a compact DC token."
thumbnail: assets/img/notes/freq-aware/fig2.png
categories: token-reduction-in-vits
tags: pruning
shortname: Frequency-Aware TR
venue: NeurIPS 2025
giscus_comments: false
related_posts: false
toc:
  sidebar: right
_styles: >
  .post-title { font-size: 1.6rem; line-height: 1.35; }
  .post-content { font-size: 0.92rem; line-height: 1.75; }
  .post-content h2 { font-size: 1.25rem; margin-top: 1.8rem; }
  .post-content h3 { font-size: 1.02rem; }
  .post-content blockquote { border-left-color: #659287; }
  .post-content a:not(.btn) { color: #659287; }
  .post-content table { font-size: 0.8rem; }
  .post-content figure { max-width: 620px; margin-left: auto; margin-right: auto; }
  .post-content .tr-callout { background-color: rgba(101,146,135,0.08); border-left: 4px solid #659287; }
  .post-content .tr-callout p { margin-bottom: 0; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#659287;color:#fff">Pruning</span>
  <span class="badge rounded-pill" style="background-color:#659287;color:#fff">NeurIPS 2025</span>
</div>
<p class="text-muted mb-3">Dong-Jae Lee, Jiwan Hur, Jaehyun Choi, Jaemyung Yu, Junmo Kim · KAIST / NAVER AI Lab</p>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://arxiv.org/abs/2511.21477" target="_blank" rel="noopener noreferrer">arXiv</a>
  <a class="btn btn-sm btn-outline-dark" href="https://github.com/jhtwosun/frequency-aware-token-pruning" target="_blank" rel="noopener noreferrer">GitHub</a>
</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> 기존 token reduction은 self-attention의 <strong>주파수 특성</strong>을 무시한다. self-attention은 반복되는 <strong>low-pass filter</strong>라 깊어질수록 <strong>고주파(high-frequency)가 사라지고 토큰이 같아지는 rank collapse / over-smoothing</strong>이 일어나는데, pruning·merging 모두 이를 <strong>가속</strong>한다. 이 논문은 토큰을 <strong>고주파(HF) · 저주파(LF)</strong>로 나눠, 표현력을 지키는 <strong>HF 토큰만 남기고</strong> LF 토큰들은 <strong>하나의 DC 토큰</strong>으로 뭉친다. attention map만으로 주파수 토큰을 골라(FFT 불필요) rank collapse를 완화하고, 여러 모델에서 base와 비슷하거나 더 높은 정확도를 유지한다.</p>
</div>

## 배경

token reduction을 "어떤 토큰이 중요한가"로만 보던 흐름에, 이 논문은 **주파수(frequency) 관점**을 들고 온다.

- **self-attention = 반복 low-pass filter.** attention matrix $A$는 토큰들을 평균 쪽으로 끌어당기는 저역통과 필터처럼 작동한다(Prop 2.1: $\lVert H_f[\text{SA}(X)]\rVert_F \le \lambda \lVert H_f[X]\rVert_F$). layer를 쌓을수록 **고주파 성분이 이중지수적으로 감소**해 모든 토큰이 같은 벡터(rank-1, DC 성분)로 수렴한다 — **rank collapse / over-smoothing**. 토큰 다양성이 사라지면 표현력이 죽는다.
- **token reduction이 이를 가속한다(Prop 3.1).** row-normalized 행렬 $M$으로 보면 pruning(0/1 선택)도 merging(0~1 가중합)도 모두 고주파를 줄여 rank collapse를 **앞당긴다**. merging은 토큰을 섞으니 본질적으로 고주파를 누르고, pruning도 버린 토큰이 고주파를 담고 있으면 마찬가지다.

{% include figure.liquid loading="lazy" path="assets/img/notes/freq-aware/fig1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 1. ViT self-attention의 주파수 분석. (a) layer가 깊어질수록(어두운 색) 고주파 진폭이 떨어진다. (b) 고주파(1.0π) 진폭이 depth에 따라 감소 — rank collapse의 실증. 초기 layer는 인접 토큰끼리 보는 convolution 같은 성질이라 감소가 느리다." %}

> 그렇다면 token reduction은 **고주파를 담은 토큰을 지켜야** rank collapse를 덜 부추기지 않을까?

## 핵심 아이디어

토큰을 **고주파(HF) · 저주파(LF)** 두 집합으로 나눠 다르게 다룬다.

- **HF 토큰 → 그대로 보존.** 고주파는 표현력의 핵심이라 버리면 over-smoothing이 빨라진다.
- **LF 토큰 → 하나의 DC 토큰으로 집계.** 저주파(DC)는 덜 중요하지만 완전히 버리면 손해라, **평균 한 개 토큰**으로 압축해 남긴다.

즉 "**중요한 고주파는 남기고, 덜 중요한 저주파는 통째로 요약**"하는 **pruning 계열**이다(고주파 토큰을 선택해 남긴다).

{% include figure.liquid loading="lazy" path="assets/img/notes/freq-aware/fig2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 2. HF/LF 토큰 분석. (a) HF 토큰이 LF보다 고주파를 더 많이 담는다. (b) LF 토큰은 feature의 DC 신호와 훨씬 유사 — 분리가 잘 됨. (c) 각 집합에 가우시안 노이즈(AWGN)를 줬을 때 HF를 건드리면 정확도가 크게 떨어진다 → HF가 정확도에 결정적." %}

## 방법

### 주파수 토큰 선택 — attention map만으로

전체 feature의 DC를 구해 유사도를 재는 건 비싸다. 대신 **attention map $A$ 자체를 분해**한다:

$$
A^{LP} = \frac{1}{n}\mathbf{1}\mathbf{1}^T, \qquad A^{HP} = A - A^{LP}
$$

$A^{LP}X$는 모든 토큰의 평균을 복제하는 **DC(zero-frequency) 성분**, $A^{HP}X$는 그 잔차인 **고주파 성분**이다. $A^{HP}$의 $(q,k)$ 원소는 "$k$번째 토큰이 $q$번째 출력의 고주파에 기여하는 정도"이므로, **column(=query·head) 방향으로 합**하면 각 토큰의 고주파 기여도 $\tilde A_k$가 나온다:

$$
\tilde A_k = \frac{1}{n h}\sum_{h'}\sum_{n'} A^{HP(h')}_{n',k}
$$

$\tilde A_k$ 상위 $r$개를 **HF 토큰**($N_{HF}$), 하위 $r$개를 **LF 토큰**($N_{LF}$)으로 고른다($r = \lfloor n\tau \rfloor$). **단순 평균·합만 쓰니 FFT나 코사인 유사도보다 훨씬 싸다.** 실제로 이렇게 고른 LF 토큰이 고주파가 낮고 DC와 유사함을 Fourier 분석으로 확인했다(Figure 2).

### DC 토큰 — 저주파를 압축 보존

LF 토큰을 그냥 버리면 feature의 DC 신호가 망가진다(Figure 2c에서 DC도 정확도에 영향). 그래서 LF 토큰들의 평균을 **DC 토큰** 하나로 만들어 남긴다. 다만 초기 layer의 LF 토큰엔 아직 고주파가 섞여 있을 수 있어, **공간 지역성(spatial locality)** 을 살려 토큰을 $w^2$개 그룹으로 나누고 그룹마다 **local DC 토큰**을 만든다:

$$
x^j_{DC} = \frac{1}{|N^j_{LF}|}\sum_{i \in N^j_{LF}} x_i, \quad j \in \{1,\dots,w^2\}
$$

$w=1$이면 전역 DC 토큰 하나. 여러 layer에 적용할 땐 이전 DC 토큰을 누적 평균해 정보를 이어간다. 줄어든 토큰 집합은 $\lfloor n\tau\rfloor$개의 HF 토큰 + $w^2$개의 DC 토큰. 기본 설정은 초기 layer $w=2$, 이후 $w=1$.

### Attention 재가중

사전학습 모델에 그대로 붙이면 남은 HF 토큰마저 self-attention이 다시 뭉갠다. 그래서 attention을 학습 파라미터 $\omega_1, \omega_2$로 재가중한다:

$$
\hat A = A^{LP} + (\omega_1+1)A^{HP} + (\omega_2+1)A^{N_{DC}}
$$

$\omega_1$은 고주파($A^{HP}$)를 키워 collapse를 막고, $\omega_2$는 DC 토큰에 주는 가중치를 보정한다(평균으로 만들어진 DC 토큰은 Jensen 부등식 때문에 attention을 적게 받는 경향이 있어서). FlashAttention과도 호환된다(부록).

## 결과

ImageNet-1K, DeiT-T/S/B·ViT·ViT-21K·MAE·DINO·LV-ViT. 사전학습 모델을 30 epoch fine-tune, 보통 4·7·10번째 layer에서 30%씩 reduce, self-distillation.

{% include figure.liquid loading="lazy" path="assets/img/notes/freq-aware/table1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Table 1. 여러 모델에서의 비교. 같은 MACs에서 기존 token reduction을 일관되게 능가하고, 종종 원본 모델과 같거나 더 높다 — rank collapse 완화 덕분." %}

- **base를 유지/능가** — DeiT-T 72.2→**72.3**, DeiT-S 79.8→**79.8**, DeiT-B 81.8→**81.8**(각각 MACs 약 35~40%↓). ToMe·EViT·DynamicViT가 모두 떨어지는 지점에서 손실이 0이다. rank collapse를 줄여 오히려 base를 넘기도 한다.
- **collapse에 취약한 모델일수록 이득** — ViT-S 78.8→**79.0**, ViT-S-21K 81.1→**81.2**. ViT는 DeiT보다 rank collapse가 심해 효과가 더 크고, 작은 모델(head 수·채널 적음)도 더 많이 개선된다. 반면 토큰 다양성을 이미 학습한 MAE·DINO에선 이득이 작지만 그래도 경쟁 방법보다 덜 떨어진다.
- **rank collapse 완화 실증**(Figure 4a) — 중간 layer와 마지막 layer feature의 유사도가 DeiT-S보다 낮다 = 토큰이 덜 뭉쳤다. DC 토큰은 원본 DC 신호와 잘 닮고 HF 토큰은 덜 닮아, 분리가 의도대로 작동.
- **요소 분해** — HF 토큰을 빼면(LF만 남김) 정확도가 ~20%로 급락하지만 DC 토큰을 빼는 건 영향이 작다 → **고주파가 결정적**. local window는 초기 layer에서 효과가 크다($w=2$).

{% include figure.liquid loading="lazy" path="assets/img/notes/freq-aware/fig34.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 3·4. (3) 학습 방식·모델 크기별 고주파 진폭 — ViT·작은 모델이 더 심한 collapse. (4a) 마지막 layer와의 유사도: Ours가 DeiT-S보다 낮아 collapse가 덜하다. (4b) DC 토큰은 DC 신호와, HF 토큰은 그렇지 않게 분리됨." %}

## 한 줄 정리 & 의의

- token reduction을 **주파수 도메인**으로 다시 본 Pruning 계열. "self-attention은 low-pass filter라 reduction이 rank collapse를 가속한다"는 분석 위에서, **고주파 토큰을 명시적으로 골라 남기고 저주파는 DC 토큰으로 압축**한다는 게 핵심.
- **싸고 이론적** — attention map을 $A^{LP}+A^{HP}$로 쪼개 column 합만으로 HF/LF를 가른다(FFT 불필요). pruning이지만 버린 토큰의 DC를 한 개 토큰으로 살려 merging의 정보 보존 장점도 일부 취한다.
- **위치.** 이 논문의 분석은 기존 방법을 주파수로 재해석한다 — [ToMe]({% post_url 2023-02-01-tome %}) 같은 merging은 고주파를 가장 많이 눌러 collapse를 빨리 부르고, [EViT]({% post_url 2022-02-01-evit %})의 [CLS] attention pruning은 깊은 layer에서 우연히 고주파 토큰을 남겨(그래서 이 방법의 HF 선택과 깊은 layer에서 겹친다) 잘 작동했던 것. [DiffRate]({% post_url 2023-03-01-diffrate %})·[DTEM]({% post_url 2023-07-01-dtem %}) 등과 같은 무수정·사전학습 적용 가능 계열이면서, "무엇을 남길지"의 기준을 **중요도가 아니라 주파수**로 바꿨다. → [Token Reduction 개요]({% post_url 2026-06-19-token-reduction-overview %})
