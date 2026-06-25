---
layout: post
title: "[PyramidDrop] Accelerating Large Vision-Language Models via Pyramid Visual Redundancy Reduction"
date: 2024-10-22
description: "Empirically shows visual tokens are all needed in shallow LLM layers but grow redundant in deeper ones — so it splits the LLM into stages and drops a fixed ratio of image tokens at the end of each stage (pyramid). Accelerates both training (−40%) and inference (−55% FLOPs)."
thumbnail: assets/img/notes/pdrop/fig2.png
categories: efficient-vlm
tags: llm-side
shortname: PyramidDrop
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
  .post-content blockquote { border-left-color: #e1acac; }
  .post-content table { font-size: 0.8rem; }
  .post-content figure { max-width: 620px; margin-left: auto; margin-right: auto; }
  .post-content .tr-callout { background-color: rgba(225,172,172,0.18); border-left: 4px solid #e1acac; }
  .post-content .tr-callout p { margin-bottom: 0; }
  .post-content .pd-card .card { border-left: 4px solid #e1acac; }
  .post-content .pd-card .card-title { font-size: 0.95rem; font-weight: 700; }
  .post-content .pd-card .card-text { font-size: 0.82rem; line-height: 1.6; }
  .post-content .eval-tab table { width: 100%; font-size: 0.7rem; margin: 0.3rem 0; }
  .post-content .eval-tab thead { display: none; }
  .post-content .eval-tab td { font-size: 0.7rem; padding: 0.35rem 0.6rem; vertical-align: top; border: 0; border-bottom: 1px solid rgba(225,172,172,0.25); }
  .post-content .eval-tab td:first-child { white-space: nowrap; font-weight: 700; color: #1c1c1d; background: rgba(225,172,172,0.18); border-left: 3px solid #e1acac; width: 22%; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#e1acac;color:#1c1c1d">LLM</span>
  <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">CVPR 2025</span>
</div>
<p class="text-muted mb-3">Long Xing, Qidong Huang, … Dahua Lin · USTC / Shanghai AI Lab / CUHK</p>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://arxiv.org/abs/2410.17247" target="_blank" rel="noopener noreferrer">arXiv</a>
  <a class="btn btn-sm btn-outline-dark" href="https://github.com/Cooperx521/PyramidDrop" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github me-1"></i> GitHub</a>
</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> <strong>얕은 층에선 모든 시각 토큰이 필요</strong>하지만 <strong>깊을수록 중복이 커진다</strong>는 실증 관찰에서 출발. LLM을 <strong>여러 stage로 나눠</strong> 각 stage 끝에서 <strong>일정 비율씩 점진적으로</strong> 시각 토큰을 버린다(피라미드 모양). 어느 토큰을 남길지는 <strong>가벼운 attention 유사도</strong>로 랭킹(오버헤드 거의 없음). <a href="{% post_url 2023-10-05-llava1-5 %}">LLaVA</a>-NeXT에서 <strong>학습 시간 40%↓, 추론 FLOPs 55%↓</strong>(성능 유지) — <strong>학습·추론 모두</strong> 가속하고, plug-and-play 추론으로 쓰면 <a href="{% post_url 2024-03-11-fastv %}">FastV</a>보다 우수.</p>
</div>

## 배경

LVLM은 고해상도·긴 비디오일수록 시각 토큰이 **제곱으로 늘어** 학습·추론이 비싸다. 기존 축소는 **LLM 이전 또는 초기 층에서** 잘라 중요한 정보를 잃기 쉬웠다.

- **실증 관찰** — 시각 토큰을 여러 층에서 비율을 바꿔 제거해보니, **얕은 층은 토큰 제거에 민감**(많이 자르면 성능 급락)하지만 **깊은 층은 점점 둔감**해진다. LVLM은 이미지를 **층을 거치며 점진적으로** 이해한다.

> 그렇다면 얕은 층은 다 살리고, **깊어질수록 더 많이** 버리는 게 맞지 않을까?

{% include figure.liquid loading="eager" path="assets/img/notes/pdrop/fig2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 2. PyramidDrop 파이프라인. LLM forward를 여러 stage로 나누고, 얕은 stage엔 시각 토큰을 많이 남기되 각 stage 끝에서 일정 비율씩 버려, 깊은 층에선 거의 사라지는 '피라미드' 형태." %}

## 핵심 아이디어

<div class="row g-3 my-3 pd-card">
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <div class="card-title">① 단계별 점진 드롭 (Pyramid)</div>
      <p class="card-text mb-0">LLM을 여러 <strong>stage</strong>로 분할, 각 stage <strong>끝</strong>에서 미리 정한 비율만큼 시각 토큰을 버린다. 얕은 층=다 유지(정보 손실 방지), 깊은 층=거의 제거(효율 극대화).</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <div class="card-title">② 가벼운 랭킹</div>
      <p class="card-text mb-0">각 stage에서 <strong>가벼운 attention 모듈</strong>로 텍스트가 주목하는 중요한 시각 토큰을 랭킹해 남긴다. 추가 오버헤드가 거의 없다.</p>
    </div>
  </div>
</div>

- **학습·추론 모두** — 학습 가속(중복 토큰을 학습 단계부터 제거)과 추론 가속을 동시에. **plug-and-play**로 추론에만 끼울 수도 있다(이때 FastV보다 좋은 성능·낮은 비용).
- **고해상도 친화** — 같은 비용으로 LLaVA-NeXT를 **2배 해상도**로 학습 가능 → DocVQA·InfoVQA 같은 고해상도 벤치마크에서 향상.

## 적용·평가

<div class="eval-tab" markdown="1">

| 항목 | 내용 |
| --- | --- |
| **적용 모델** | **LLaVA-1.5** · **LLaVA-NeXT-7B** (Vicuna 백본) |
| **데이터셋** | **16개** VL 벤치마크 — TextVQA · GQA · VQAv2 · MME · MMBench · SEED · POPE · ScienceQA · AI2D · ChartQA · VizWiz + 고해상도 **DocVQA · InfoVQA** |
| **Task** | 일반 VQA · 문서/고해상도 이해 · 환각(POPE) · 종합(MME·SEED) — **학습·추론 양쪽 가속** |
| **대표 결과** | LLaVA-NeXT-7B **학습 시간 40%↓ · 추론 FLOPs 55%↓**(성능 유지) · plug-and-play 추론 시 FastV 능가 |

</div>

## 결과

### 정량

<div class="row justify-content-center"><div class="col-lg-9 col-md-11">
{% include figure.liquid loading="lazy" path="assets/img/notes/pdrop/table2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Table 2. 같은 image-token 예산에서 효율적 추론 전략 비교. 평균 토큰을 적게 남기고도(Ratio) PyramidDrop이 ToMe·FastV·SparseVLM보다 높은 평균 성능을 유지." %}
</div></div>

- **학습·추론 양쪽 가속** — LLaVA-NeXT-7B에서 **추론 FLOPs 55%↓·학습시간 40%↓**, 성능 유지.
- **동급 대비 우수** — 같은 토큰 예산에서 ToMe·FastV·SparseVLM보다 높은 평균(Table 2), plug-and-play 추론으로도 FastV 능가(Table 1).
- **고해상도 이득** — 같은 비용으로 2배 해상도 학습이 가능 → DocVQA·InfoVQA 향상.

### 정성

<div class="row justify-content-center"><div class="col-lg-8 col-md-10">
{% include figure.liquid loading="lazy" path="assets/img/notes/pdrop/fig1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 1. 층별 시각 중복 관찰. (왼쪽) 깊은 층에서 시각 토큰을 많이 줄여도 TextVQA 성능이 유지된다. (오른쪽) 깊은 층일수록 attention이 소수 핵심 영역에 집중 — 깊을수록 더 버려도 된다는 피라미드 설계의 근거." %}
</div></div>

- **층이 깊을수록 중복↑(Fig 1).** 얕은 층은 attention이 넓게 퍼져 많은 토큰이 필요하지만, 깊은 층일수록 핵심 영역에 집중돼 대부분 토큰이 잉여가 된다 — 단계별 점진 드롭의 직접 근거.

## 한 줄 정리 & 의의

- **층이 깊을수록 더 버리는 "피라미드" 토큰 축소.** 얕은 층은 보존, stage마다 점진 드롭 → **학습·추론 모두** 가속.
- **차별점.** <a href="{% post_url 2024-03-11-fastv %}">FastV</a>가 한 층에서 한 번 자른다면, PyramidDrop은 **여러 stage에 걸쳐 점진적으로** 자르고 **학습까지** 가속(고해상도 학습을 싸게).
- **위치.** <strong>LLM</strong> — LLM 디코더 내부 단계별로 줄인다. → <a href="{% post_url 2026-06-23-efficient-vlm-overview %}">Efficient VLM 개요</a>
