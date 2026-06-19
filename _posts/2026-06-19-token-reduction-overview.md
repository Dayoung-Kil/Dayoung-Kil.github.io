---
layout: post
title: "Token Reduction — Overview"
date: 2026-06-19
description: ViT token efficiency — Pruning · Merging · Pooling · Hybrid, with 17 key papers at a glance.
thumbnail: assets/img/notes/token-reduction-types.png
categories: token-reduction
tags: survey
shortname: Overview
venue: 전체 정리
giscus_comments: false
related_posts: false
toc:
  sidebar: left
_styles: >
  .post-title { font-size: 1.8rem; }
  .post-content { font-size: 0.92rem; line-height: 1.75; }
  .post-content h2 { font-size: 1.3rem; margin-top: 1.8rem; }
  .post-content h3 { font-size: 1.05rem; }
  .post-content table { font-size: 0.85rem; }
  .post-content .tr-insights .card-title { font-size: 0.95rem; color: #5d5c98; font-weight: 700; }
  .post-content .tr-insights .card-text { font-size: 0.83rem; line-height: 1.6; }
  .post-content .tr-types .card-text { font-size: 0.83rem; line-height: 1.6; }
  .post-content .tr-axes .card-title { font-size: 0.95rem; font-weight: 700; }
  .post-content .tr-axes .card-text { font-size: 0.83rem; line-height: 1.6; }
  .post-content .tr-papers table { font-size: 0.68rem; }
  .post-content .tr-papers th, .post-content .tr-papers td { font-size: 0.68rem; line-height: 1.35; vertical-align: middle; padding: 0.3rem 0.5rem; }
  .post-content .tr-papers .badge { font-size: 0.62rem; }
  .post-content .tr-papers tbody tr:nth-child(odd) { background-color: rgba(93,92,152,0.05); }
  .post-content .tr-papers .badge { font-weight: 600; white-space: nowrap; }
  .post-content blockquote { font-size: 0.9rem; }
---

<p class="text-muted mb-4">Pruning · Merging · Pooling · Hybrid · 관련 논문 17편</p>

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
      <div class="card h-100" style="border-color:#5d5c98">
        <div class="card-body">
          <h6 class="card-title" style="color:#5d5c98">Token pruning <span class="badge rounded-pill" style="background-color:#5d5c98;color:#fff;font-size:0.65rem;vertical-align:middle">이 노트</span></h6>
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
          <span class="badge rounded-pill mb-2" style="background-color:#e8c468;color:#1c1c1d">Pruning · 제거</span>
          <p class="card-text mb-1">중요도 점수가 낮은 토큰을 <strong>버린다</strong>. 가장 직관적이지만, 잘못 버리면 정보 손실(특히 dense task)이 크다.</p>
          <p class="card-text mb-0 text-muted" style="font-size:0.78rem">예: DynamicViT, EViT, ATS, STAR</p>
        </div>
      </div>
    </div>
    <div class="col mb-3">
      <div class="card h-100">
        <div class="card-body">
          <span class="badge rounded-pill mb-2" style="background-color:#4d5f8c;color:#fff">Merging · 병합</span>
          <p class="card-text mb-1">비슷한 토큰끼리 <strong>합친다</strong>. 버리는 것보다 정보 손실이 적고 training-free로도 가능.</p>
          <p class="card-text mb-0 text-muted" style="font-size:0.78rem">예: ToMe, DTEM, MCTF</p>
        </div>
      </div>
    </div>
    <div class="col mb-3">
      <div class="card h-100">
        <div class="card-body">
          <span class="badge rounded-pill mb-2" style="background-color:#7e57c2;color:#fff">Pooling · 요약/학습</span>
          <p class="card-text mb-1">전체 토큰을 <strong>소수의 대표/학습 토큰으로 요약</strong>한다.</p>
          <p class="card-text mb-0 text-muted" style="font-size:0.78rem">예: TokenLearner, Token Pooling</p>
        </div>
      </div>
    </div>
    <div class="col mb-3">
      <div class="card h-100">
        <div class="card-body">
          <span class="badge rounded-pill mb-2" style="background-color:#5a9e6f;color:#fff">Hybrid · 결합</span>
          <p class="card-text mb-1">Pruning과 Merging을 <strong>함께</strong> 쓴다. 버릴 건 버리고, 남길 것 중 비슷한 건 합친다.</p>
          <p class="card-text mb-0 text-muted" style="font-size:0.78rem">예: DiffRate, Token Fusion(ToFu)</p>
        </div>
      </div>
    </div>
  </div>
</div>

> 경계는 칼같지 않다. "pruned merging"(이름은 merging이지만 사실상 하나를 버림)처럼 한 방법 안에서 여러 전략이 섞이기도 한다.

## 관련 논문 17편 한눈에 보기

<div class="tr-papers" markdown="1">

| # | 논문 | Venue | Type | 핵심 아이디어 |
| --- | --- | --- | --- | --- |
| 1 | [**DynamicViT**]({% post_url 2021-06-01-dynamicvit %}) | NeurIPS 2021 | <span class="badge rounded-pill" style="background-color:#e8c468;color:#1c1c1d">Pruning</span> | 입력마다 prediction module로 redundant 토큰을 동적으로 제거 |
| 2 | [**TokenLearner**]({% post_url 2021-06-15-tokenlearner %}) | NeurIPS 2021 | <span class="badge rounded-pill" style="background-color:#7e57c2;color:#fff">Pooling</span> | attention map으로 소수(8~16개)의 learned 토큰을 생성 |
| 3 | [**EViT**]({% post_url 2022-02-01-evit %}) | ICLR 2022 | <span class="badge rounded-pill" style="background-color:#e8c468;color:#1c1c1d">Pruning</span> | CLS attention 상위 토큰은 유지, 나머지는 1개로 fusion |
| 4 | [**Evo-ViT**]({% post_url 2022-02-15-evo-vit %}) | AAAI 2022 | <span class="badge rounded-pill" style="background-color:#e8c468;color:#1c1c1d">Pruning</span> | 안 버리고 informative/placeholder로 나눠 slow-fast 업데이트 |
| 5 | **ATS** | ECCV 2022 | <span class="badge rounded-pill" style="background-color:#e8c468;color:#1c1c1d">Pruning</span> | 입력·stage마다 토큰 수를 적응적으로(attention 기반 샘플링) |
| 6 | **Adaptive Sparse ViT** | IJCAI 2023 | <span class="badge rounded-pill" style="background-color:#e8c468;color:#1c1c1d">Pruning</span> | learned threshold로 keep/prune, head importance 반영 |
| 7 | **ToMe** | ICLR 2023 | <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">Merging</span> | Bipartite Soft Matching으로 비슷한 토큰 r개 합침, training-free |
| 8 | **DiffRate** | ICCV 2023 | <span class="badge rounded-pill" style="background-color:#5a9e6f;color:#fff">Hybrid</span> | pruning·merging rate를 미분가능하게 자동 학습 |
| 9 | **TPS** | CVPR 2023 | <span class="badge rounded-pill" style="background-color:#e8c468;color:#1c1c1d">Pruning</span> | pruned 토큰을 가장 비슷한 kept 토큰에 squeeze(정보 보존) |
| 10 | **Token Pooling** | WACV 2023 | <span class="badge rounded-pill" style="background-color:#7e57c2;color:#fff">Pooling</span> | k-means/K-medoids로 대표 토큰 근사(top-k 편향 보완) |
| 11 | **Zero-TPrune** | CVPR 2024 | <span class="badge rounded-pill" style="background-color:#e8c468;color:#1c1c1d">Pruning</span> | attention graph + Weighted PageRank로 학습 없이(zero-shot) pruning |
| 12 | **DTEM** | NeurIPS 2024 | <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">Merging</span> | merging 전용 decoupled embedding을 따로 학습 |
| 13 | **Token Fusion (ToFu)** | WACV 2024 | <span class="badge rounded-pill" style="background-color:#5a9e6f;color:#fff">Hybrid</span> | functional linearity에 따라 layer별 pruning↔merging 전환(MLERP) |
| 14 | **STAR** | ICLR 2024 | <span class="badge rounded-pill" style="background-color:#e8c468;color:#1c1c1d">Pruning</span> | intra-layer + inter-layer(LRP) importance 결합 |
| 15 | **MCTF** | CVPR 2024 | <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">Merging</span> | similarity × informativeness × size 다기준 fusion + one-step-ahead attention |
| 16 | **Frequency-Aware TR** | NeurIPS 2025 | <span class="badge rounded-pill" style="background-color:#e8c468;color:#1c1c1d">Pruning</span> | high-freq는 보존, low-freq는 DC 토큰으로 aggregate |
| 17 | **Token Cropr** | CVPR 2025 | <span class="badge rounded-pill" style="background-color:#e8c468;color:#1c1c1d">Pruning</span> | task-specific aux head로 dense task(seg/det)까지 학습 기반 pruning |

</div>

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

---

이후 각 논문의 *배경 · 핵심 아이디어 · 방법 · 결과*는 개별 노트로 정리한다. (작성되는 대로 이 표의 논문명에서 링크를 연결할 예정.)
