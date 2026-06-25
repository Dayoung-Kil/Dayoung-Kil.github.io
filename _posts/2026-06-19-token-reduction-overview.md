---
layout: post
title: "Token Reduction in ViTs — Overview"
date: 2026-06-19
description: ViT token efficiency — Pruning · Merging · Pooling · Hybrid, with key papers at a glance.
thumbnail: assets/img/notes/token-reduction-types.png
categories: token-reduction-in-vits
tags: survey
shortname: Overview
venue: Survey
giscus_comments: false
related_posts: false
toc:
  sidebar: right
_styles: >
  .post-title { font-size: 1.8rem; }
  .post-content { font-size: 0.92rem; line-height: 1.75; }
  .post-content h2 { font-size: 1.3rem; margin-top: 1.8rem; }
  .post-content h3 { font-size: 1.05rem; }
  .post-content table { font-size: 0.85rem; }
  .post-content .tr-insights .card-title { font-size: 0.95rem; color: #6e85b7; font-weight: 700; }
  .post-content .tr-insights .card-text { font-size: 0.83rem; line-height: 1.6; }
  .post-content .tr-types .card-text { font-size: 0.83rem; line-height: 1.6; }
  .post-content .tr-axes .card-title { font-size: 0.95rem; font-weight: 700; }
  .post-content .tr-axes .card-text { font-size: 0.83rem; line-height: 1.6; }
  .post-content .tr-papers table { font-size: 0.68rem; }
  .post-content .tr-papers th, .post-content .tr-papers td { font-size: 0.68rem; line-height: 1.35; vertical-align: middle; padding: 0.3rem 0.5rem; }
  .post-content .tr-papers .badge { font-size: 0.62rem; }
  .post-content .tr-papers tbody tr:nth-child(odd) { background-color: rgba(110,133,183,0.05); }
  .post-content .tr-papers .badge { font-weight: 600; white-space: nowrap; }
  .post-content .tr-gen .gen-stage { border-left: 5px solid #6e85b7; }
  .post-content .tr-gen .gen-stage .card-title { font-size: 0.98rem; font-weight: 700; line-height: 1.4; }
  .post-content .tr-gen .gen-stage .card-text { font-size: 0.83rem; line-height: 1.6; margin-bottom: 0.4rem; }
  .post-content .tr-gen .gen-limit { font-size: 0.8rem; color: #b05a6e; }
  .post-content .tr-gen .gen-goal { font-size: 0.82rem; color: #6e85b7; font-weight: 600; }
  .post-content .tr-gen .gen-arrow { text-align: center; color: #93a4c8; font-size: 1rem; line-height: 1; margin: 0.15rem 0; }
  .post-content blockquote { font-size: 0.9rem; border-left-color: #659287; }
---

<p class="text-muted mb-4">Pruning · Merging · Pooling · Hybrid</p>

이 글은 **Token Reduction** 분야의 큰 그림을 잡기 위한 개요 노트다. 개별 논문 노트로 들어가기 전에, *무엇을 줄이는 것인지 · 어떤 방식들이 있는지 · 논문들이 어떻게 발전해 왔는지*를 한눈에 정리한다.

## Token Reduction이란?

Vision Transformer(ViT)는 이미지를 패치 단위 **토큰 시퀀스**로 만들어 처리한다. 그런데 토큰 수 N이 늘어나면 self-attention 비용이 O(N²), MLP 비용이 O(N)으로 커진다. **Token Reduction**은 *덜 중요한 토큰을 버리거나, 비슷한 토큰을 합치거나, 소수의 대표 토큰으로 요약*해서 $N$을 줄이고 연산량을 낮추는 기법들을 통칭한다.

> 핵심 관찰: ViT의 최종 예측은 모든 패치 토큰을 똑같이 필요로 하지 않는다. 일부 informative한 토큰만으로도 충분한 경우가 많다.

### Channel Pruning vs Token Pruning

흔히 헷갈리는 두 축을 먼저 구분하자.

<div class="tr-axes">
  <div class="row row-cols-1 row-cols-md-2">
    <div class="col mb-3">
      <div class="card h-100">
        <div class="card-body">
          <h6 class="card-title">Channel pruning</h6>
          <p class="card-text mb-1">줄이는 축: <strong>feature 차원 C</strong></p>
          <p class="card-text mb-0 text-muted">모든 위치는 보되, 덜 중요한 <strong>특징 검출기</strong>를 없앰</p>
        </div>
      </div>
    </div>
    <div class="col mb-3">
      <div class="card h-100" style="border-color:#6e85b7">
        <div class="card-body">
          <h6 class="card-title" style="color:#6e85b7">Token pruning <span class="badge rounded-pill" style="background-color:#6e85b7;color:#fff;font-size:0.65rem;vertical-align:middle">이 노트</span></h6>
          <p class="card-text mb-1">줄이는 축: <strong>토큰/패치 길이 N</strong></p>
          <p class="card-text mb-0 text-muted">이미지에서 덜 중요한 <strong>위치</strong>를 안 봄</p>
        </div>
      </div>
    </div>
  </div>
</div>

즉, 이 노트가 다루는 건 후자 — **토큰(위치) 축**을 줄이는 방법들이다.

## 4가지 타입 (택소노미)

{% include figure.liquid loading="lazy" path="assets/img/notes/token-reduction-types.png" class="img-fluid rounded z-depth-1" zoomable=true caption="토큰 압축 방식 비교 — Pruning(제거) · Merging(병합) · Pooling(요약/학습)의 동작 원리와 핵심 기여." %}

<div class="tr-types">
  <div class="row row-cols-1 row-cols-md-2">
    <div class="col mb-3">
      <div class="card h-100">
        <div class="card-body">
          <span class="badge rounded-pill mb-2" style="background-color:#659287;color:#fff">Pruning · 제거</span>
          <p class="card-text mb-1">중요도 점수가 낮은 토큰을 <strong>버린다</strong>. 가장 직관적이지만, 잘못 버리면 정보 손실(특히 dense task)이 크다.</p>
          <p class="card-text mb-0 text-muted" style="font-size:0.78rem">예: DynamicViT, EViT, ATS, STAR</p>
        </div>
      </div>
    </div>
    <div class="col mb-3">
      <div class="card h-100">
        <div class="card-body">
          <span class="badge rounded-pill mb-2" style="background-color:#88bda4;color:#1c1c1d">Merging · 병합</span>
          <p class="card-text mb-1">비슷한 토큰끼리 <strong>합친다</strong>. 버리는 것보다 정보 손실이 적고 training-free로도 가능.</p>
          <p class="card-text mb-0 text-muted" style="font-size:0.78rem">예: ToMe, DTEM, MCTF</p>
        </div>
      </div>
    </div>
    <div class="col mb-3">
      <div class="card h-100">
        <div class="card-body">
          <span class="badge rounded-pill mb-2" style="background-color:#b1d3b9;color:#1c1c1d">Pooling · 요약/학습</span>
          <p class="card-text mb-1">전체 토큰을 <strong>소수의 대표/학습 토큰으로 요약</strong>한다.</p>
          <p class="card-text mb-0 text-muted" style="font-size:0.78rem">예: TokenLearner, Token Pooling</p>
        </div>
      </div>
    </div>
    <div class="col mb-3">
      <div class="card h-100">
        <div class="card-body">
          <span class="badge rounded-pill mb-2" style="background-color:#e6f2dd;color:#1c1c1d">Hybrid · 결합</span>
          <p class="card-text mb-1">Pruning과 Merging을 <strong>함께</strong> 쓴다. 버릴 건 버리고, 남길 것 중 비슷한 건 합친다.</p>
          <p class="card-text mb-0 text-muted" style="font-size:0.78rem">예: DiffRate, Token Fusion(ToFu)</p>
        </div>
      </div>
    </div>
  </div>
</div>

> 경계는 칼같지 않다. "pruned merging"(이름은 merging이지만 사실상 하나를 버림)처럼 한 방법 안에서 여러 전략이 섞이기도 한다.

## 관련 논문 한눈에 보기

<div class="tr-papers" markdown="1">

| # | 논문 | Venue | Type | 핵심 아이디어 |
| --- | --- | --- | --- | --- |
| 1 | [**DynamicViT**]({% post_url 2021-06-01-dynamicvit %}) | NeurIPS 2021 | <span class="badge rounded-pill" style="background-color:#659287;color:#fff">Pruning</span> | 입력마다 prediction module로 redundant 토큰을 동적으로 제거 |
| 2 | [**TokenLearner**]({% post_url 2021-06-15-tokenlearner %}) | NeurIPS 2021 | <span class="badge rounded-pill" style="background-color:#b1d3b9;color:#1c1c1d">Pooling</span> | attention map으로 소수(8~16개)의 learned 토큰을 생성 |
| 3 | [**EViT**]({% post_url 2022-02-01-evit %}) | ICLR 2022 | <span class="badge rounded-pill" style="background-color:#659287;color:#fff">Pruning</span> | CLS attention 상위 토큰은 유지, 나머지는 1개로 fusion |
| 4 | [**Evo-ViT**]({% post_url 2022-02-15-evo-vit %}) | AAAI 2022 | <span class="badge rounded-pill" style="background-color:#659287;color:#fff">Pruning</span> | 안 버리고 informative/placeholder로 나눠 slow-fast 업데이트 |
| 5 | [**ATS**]({% post_url 2022-03-01-ats %}) | ECCV 2022 | <span class="badge rounded-pill" style="background-color:#659287;color:#fff">Pruning</span> | 입력·stage마다 토큰 수를 적응적으로(attention 기반 샘플링) |
| 6 | [**Adaptive Sparse ViT**]({% post_url 2023-01-01-adaptive-sparse-vit %}) | IJCAI 2023 | <span class="badge rounded-pill" style="background-color:#659287;color:#fff">Pruning</span> | learned threshold로 keep/prune, head importance 반영 |
| 7 | [**ToMe**]({% post_url 2023-02-01-tome %}) | ICLR 2023 | <span class="badge rounded-pill" style="background-color:#88bda4;color:#1c1c1d">Merging</span> | Bipartite Soft Matching으로 비슷한 토큰 r개 합침, training-free |
| 8 | [**DiffRate**]({% post_url 2023-03-01-diffrate %}) | ICCV 2023 | <span class="badge rounded-pill" style="background-color:#e6f2dd;color:#1c1c1d">Hybrid</span> | pruning·merging rate를 미분가능하게 자동 학습 |
| 9 | [**TPS**]({% post_url 2023-04-01-tps %}) | CVPR 2023 | <span class="badge rounded-pill" style="background-color:#659287;color:#fff">Pruning</span> | pruned 토큰을 가장 비슷한 kept 토큰에 squeeze(정보 보존) |
| 10 | [**Token Pooling**]({% post_url 2023-05-01-token-pooling %}) | WACV 2023 | <span class="badge rounded-pill" style="background-color:#b1d3b9;color:#1c1c1d">Pooling</span> | k-means/K-medoids로 대표 토큰 근사(top-k 편향 보완) |
| 11 | [**Zero-TPrune**]({% post_url 2023-06-01-zero-tprune %}) | CVPR 2024 | <span class="badge rounded-pill" style="background-color:#659287;color:#fff">Pruning</span> | attention graph + Weighted PageRank로 학습 없이(zero-shot) pruning |
| 12 | [**DTEM**]({% post_url 2023-07-01-dtem %}) | NeurIPS 2024 | <span class="badge rounded-pill" style="background-color:#88bda4;color:#1c1c1d">Merging</span> | merging 전용 decoupled embedding을 따로 학습 |
| 13 | [**Token Fusion (ToFu)**]({% post_url 2023-08-01-tofu %}) | WACV 2024 | <span class="badge rounded-pill" style="background-color:#e6f2dd;color:#1c1c1d">Hybrid</span> | functional linearity에 따라 layer별 pruning↔merging 전환(MLERP) |
| 14 | [**STAR**]({% post_url 2023-09-01-star %}) | ICLR 2024 | <span class="badge rounded-pill" style="background-color:#659287;color:#fff">Pruning</span> | intra-layer + inter-layer(LRP) importance 결합 |
| 15 | [**MCTF**]({% post_url 2023-10-01-mctf %}) | CVPR 2024 | <span class="badge rounded-pill" style="background-color:#88bda4;color:#1c1c1d">Merging</span> | similarity × informativeness × size 다기준 fusion + one-step-ahead attention |
| 16 | [**Frequency-Aware TR**]({% post_url 2023-11-01-frequency-aware-token-reduction %}) | NeurIPS 2025 | <span class="badge rounded-pill" style="background-color:#659287;color:#fff">Pruning</span> | high-freq는 보존, low-freq는 DC 토큰으로 aggregate |
| 17 | [**Token Cropr**]({% post_url 2023-12-01-token-cropr %}) | CVPR 2025 | <span class="badge rounded-pill" style="background-color:#659287;color:#fff">Pruning</span> | task-specific aux head로 dense task(seg/det)까지 학습 기반 pruning |

</div>

## Evolution

위 논문들을 발표순이 아니라 **문제→해결의 사슬**로 다시 늘어놓으면 분야가 한 줄기로 읽힌다. 각 단계는 앞 단계가 남긴 한계를 풀고, 또 새 한계를 남긴다.

<div class="tr-gen">

  <div class="card gen-stage" style="border-left-color:#659287">
    <div class="card-body">
      <h6 class="card-title">① Pruning — 덜 중요한 토큰을 버린다 <span class="badge rounded-pill" style="background-color:#659287;color:#fff">Pruning</span></h6>
      <p class="card-text">중요도 점수로 토큰을 골라 버린다. 점수는 prediction module(<strong>DynamicViT</strong>)·<strong>CLS</strong> attention(<strong>EViT</strong>, <strong>Evo-ViT</strong>)·적응적 샘플링(<strong>ATS</strong>)·learned threshold(<strong>Adaptive Sparse ViT</strong>)로 매긴다. 가장 직관적이고 빠르다.</p>
      <p class="gen-limit mb-0">↳ 한계: 한 번 버린 토큰은 복구 불가 → 정보 손실. 중요도를 대개 <strong>한 layer 시야</strong>로만 판단.</p>
    </div>
  </div>
  <div class="gen-arrow">▼</div>

  <div class="card gen-stage" style="border-left-color:#88bda4">
    <div class="card-body">
      <h6 class="card-title">② Merging · 정보 보존 — 버리지 말고 합치거나 짜낸다 <span class="badge rounded-pill me-1" style="background-color:#88bda4;color:#1c1c1d">Merging</span><span class="badge rounded-pill" style="background-color:#b1d3b9;color:#1c1c1d">Pooling</span></h6>
      <p class="card-text">손실을 줄이려 버리는 대신 합친다. 비슷한 토큰을 BSM으로 병합(<strong>ToMe</strong>, training-free), pruned 토큰을 가장 닮은 kept 토큰에 squeeze(<strong>TPS</strong>), 클러스터 대표로 요약(<strong>Token Pooling</strong>, <strong>TokenLearner</strong>), 병합 전용 임베딩을 따로 학습(<strong>DTEM</strong>).</p>
      <p class="gen-limit mb-0">↳ 한계: 평균 병합이 feature <strong>norm·고주파</strong>를 깎는다. 합칠지/버릴지는 layer마다 다른데 <strong>한 전략</strong>으로 고정.</p>
    </div>
  </div>
  <div class="gen-arrow">▼</div>

  <div class="card gen-stage" style="border-left-color:#e6f2dd">
    <div class="card-body">
      <h6 class="card-title">③ Hybrid — layer·비율로 갈아 쓴다 <span class="badge rounded-pill" style="background-color:#e6f2dd;color:#1c1c1d">Hybrid</span></h6>
      <p class="card-text">prune과 merge를 한 모델에서 함께. 압축 비율을 미분가능하게 자동 학습(<strong>DiffRate</strong>), layer의 functional linearity로 초기=prune·후기=merge 전환(<strong>ToFu</strong>, norm 보존 MLERP).</p>
      <p class="gen-limit mb-0">↳ 한계: 합칠/버릴 토큰을 <strong>고르는 기준 자체</strong>는 여전히 단일(유사도 <em>또는</em> 중요도).</p>
    </div>
  </div>
  <div class="gen-arrow">▼</div>

  <div class="card gen-stage" style="border-left-color:#659287">
    <div class="card-body">
      <h6 class="card-title">④ 다기준 · 전역 신호 — 여러 단서를 결합한다 <span class="badge rounded-pill me-1" style="background-color:#88bda4;color:#1c1c1d">Merging</span><span class="badge rounded-pill" style="background-color:#659287;color:#fff">Pruning</span></h6>
      <p class="card-text">한 기준의 약점을 여러 신호로 메운다. 유사도×중요도×크기 다기준 fusion(<strong>MCTF</strong>), intra-layer + inter-layer(LRP) 중요도 결합(<strong>STAR</strong>), attention graph + PageRank로 전역 중요도를 학습 없이(<strong>Zero-TPrune</strong>).</p>
      <p class="gen-limit mb-0">↳ 한계: <strong>왜</strong> 토큰이 망가지는지 근본 원인 설명은 부족하고, 여전히 분류 위주.</p>
    </div>
  </div>
  <div class="gen-arrow">▼</div>

  <div class="card gen-stage" style="border-left-color:#659287">
    <div class="card-body">
      <h6 class="card-title">⑤ 근본 원인 · 범용성 — 주파수와 task로 다시 본다 <span class="badge rounded-pill" style="background-color:#659287;color:#fff">Pruning</span></h6>
      <p class="card-text">무엇을 남길지의 기준을 휴리스틱에서 <strong>원리</strong>로 옮긴다. self-attention의 low-pass·rank collapse를 주파수로 설명하고 high-freq 토큰을 보존(<strong>Frequency-Aware TR</strong>), 중요도를 <strong>task 적합도</strong>로 직접 학습하고 LLF로 dense task(seg/det)까지 확장(<strong>Token Cropr</strong>).</p>
      <p class="gen-goal mb-0">→ 도달점: '무엇을 남길지'가 중요도 휴리스틱에서 <strong>근본 원리(주파수)·task 신호</strong>로. 다음 무대는 VLM 등 멀티모달.</p>
    </div>
  </div>

</div>

<p class="text-muted" style="font-size:0.76rem;margin-top:1rem">물론 발표 시점이 단계 순서와 똑같진 않다(예: Pooling 계열 TokenLearner는 2021, Zero-TPrune은 2024). 이 흐름은 <strong>연도가 아니라 문제의식</strong>의 흐름이다.</p>

## 큰 흐름 & 인사이트

<div class="tr-insights">
  <div class="row row-cols-1 row-cols-md-2">
    <div class="col mb-3">
      <div class="card h-100">
        <div class="card-body">
          <h6 class="card-title">중요도 기준의 진화</h6>
          <p class="card-text mb-0">prediction module(DynamicViT)·CLS attention(EViT, Evo-ViT) → head importance(Adaptive Sparse ViT), attention graph + PageRank(Zero-TPrune), inter-layer relevance(STAR) 등 <strong>더 전역적인</strong> 신호로.</p>
        </div>
      </div>
    </div>
    <div class="col mb-3">
      <div class="card h-100">
        <div class="card-body">
          <h6 class="card-title">버리기 → 합치기 → 결합</h6>
          <p class="card-text mb-0">"버리면 정보가 날아간다" → Merging(ToMe)·squeeze(TPS) → 둘을 함께 쓰는 <strong>Hybrid</strong>(DiffRate, ToFu)로 수렴.</p>
        </div>
      </div>
    </div>
    <div class="col mb-3">
      <div class="card h-100">
        <div class="card-body">
          <h6 class="card-title">heuristic → learnable</h6>
          <p class="card-text mb-0">keep ratio·compression rate를 사람이 정하던 것에서 → threshold·rate를 <strong>학습</strong>으로(Adaptive Sparse ViT, DiffRate).</p>
        </div>
      </div>
    </div>
    <div class="col mb-3">
      <div class="card h-100">
        <div class="card-body">
          <h6 class="card-title">training-free</h6>
          <p class="card-text mb-0">ToMe·Zero-TPrune은 <strong>재학습 없이</strong> 바로 적용 → edge·여러 압축비 환경에 유리.</p>
        </div>
      </div>
    </div>
    <div class="col mb-3">
      <div class="card h-100">
        <div class="card-body">
          <h6 class="card-title">classification → dense task</h6>
          <p class="card-text mb-0">분류 중심에서 seg/det로 확장(DiffRate, DTEM, Frequency-Aware, Token Cropr). dense task는 토큰 제거가 <strong>더 위험</strong>.</p>
        </div>
      </div>
    </div>
    <div class="col mb-3">
      <div class="card h-100">
        <div class="card-body">
          <h6 class="card-title">frequency 관점</h6>
          <p class="card-text mb-0">ViT는 깊어질수록 over-smoothing → Frequency-Aware TR은 <strong>high-frequency 정보를 보존</strong>하며 축소.</p>
        </div>
      </div>
    </div>
  </div>
</div>
