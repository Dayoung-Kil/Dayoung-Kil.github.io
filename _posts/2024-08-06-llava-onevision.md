---
layout: post
title: "[LLaVA-OneVision] Easy Visual Task Transfer"
date: 2024-08-06
description: "The first single open LMM strong across single-image, multi-image, and video — with cross-scenario task transfer (video understanding emerges from image training) via a balanced AnyRes token budget."
thumbnail: assets/img/notes/llava-onevision/fig1.png
categories: vlm
tags: vlm
shortname: LLaVA-OneVision
generation: G4
venue: arXiv 2024
giscus_comments: false
related_posts: false
toc:
  sidebar: right
_styles: >
  .post-title { font-size: 1.6rem; line-height: 1.35; }
  .post-content { font-size: 0.92rem; line-height: 1.75; }
  .post-content h2 { font-size: 1.25rem; margin-top: 1.8rem; }
  .post-content h3 { font-size: 1.02rem; }
  .post-content blockquote { border-left-color: #787bb3; }
  .post-content table { font-size: 0.8rem; }
  .post-content figure { max-width: 620px; margin-left: auto; margin-right: auto; }
  .post-content .tr-callout { background-color: rgba(120,123,179,0.08); border-left: 4px solid #787bb3; }
  .post-content .tr-callout p { margin-bottom: 0; }
  .post-content .ov-card .card { border-left: 4px solid #787bb3; }
  .post-content .ov-card .card-title { font-size: 0.95rem; font-weight: 700; }
  .post-content .ov-card .card-text { font-size: 0.82rem; line-height: 1.6; }
  .post-content .ov-table table { font-size: 0.72rem; width: 100%; }
  .post-content .ov-table th, .post-content .ov-table td { font-size: 0.72rem; line-height: 1.45; padding: 0.3rem 0.45rem; vertical-align: top; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#787bb3;color:#fff">VLM</span>
  <span class="badge rounded-pill me-1" style="background-color:#787bb3;color:#fff">G4</span>
  <span class="badge rounded-pill" style="background-color:#787bb3;color:#fff">arXiv 2024</span>
</div>
<p class="text-muted mb-3">Bo Li, Yuanhan Zhang, Dong Guo, … Chunyuan Li · ByteDance / S-Lab NTU 외</p>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://arxiv.org/abs/2408.03326" target="_blank" rel="noopener noreferrer">arXiv</a>
  <a class="btn btn-sm btn-outline-dark" href="https://llava-vl.github.io/blog/llava-onevision" target="_blank" rel="noopener noreferrer">Project</a>
</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> <a href="{% post_url 2023-04-17-llava %}">LLaVA</a> 계보(LLaVA→1.5→NeXT→OneVision)를 모은 오픈 LMM. <strong>한 모델이 single-image·multi-image·video 세 시나리오를 모두</strong> 잘하는 <strong>첫 오픈 모델</strong>이다. 핵심은 <strong>시나리오 간 task transfer</strong> — 비디오를 따로 많이 안 배워도, <strong>이미지로 학습한 능력이 비디오로 전이(창발)</strong> 된다. 비결은 <strong>AnyRes로 모든 시각 신호를 "이미지 시퀀스"로 통일</strong>하고 시나리오별 <strong>토큰 예산을 비슷하게 맞춘</strong> 표현 설계. 아키텍처는 <strong>SigLIP + 2-layer MLP + Qwen-2</strong>(0.5B~72B), curriculum 3단계 학습. 세 시나리오 모두 SOTA.</p>
</div>

## 배경

오픈 커뮤니티는 보통 **시나리오마다 따로** 모델을 만든다 — 대부분 single-image에 집중하고, multi-image는 일부, video 모델은 비디오엔 강해도 **이미지 성능을 희생**한다.

- **한 모델이 셋 다** 잘하는 오픈 모델은 드물었다(상용 GPT-4o·Gemini는 다 잘하지만 비공개).

> 그러면 **single-image·multi-image·video를 한 모델로** 다루고, 한 시나리오에서 배운 걸 **다른 시나리오로 전이**시킬 수 없을까?

{% include figure.liquid loading="eager" path="assets/img/notes/llava-onevision/fig1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 1. LLaVA-OneVision 구조. SigLIP 인코더 + 2-layer MLP projector + Qwen-2 LLM. 단일 이미지(crop)·멀티이미지·비디오(프레임)를 모두 '이미지(들)의 시퀀스'로 통일해 입력한다." %}

## 핵심 아이디어

<div class="row g-3 my-3 ov-card">
  <div class="col-md-4">
    <div class="card h-100 p-3">
      <div class="card-title">한 모델, 세 시나리오</div>
      <p class="card-text mb-0">single-image · multi-image · video를 <strong>하나의 모델</strong>로. 모든 시각 신호를 <strong>이미지 시퀀스</strong>로 통일.</p>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card h-100 p-3">
      <div class="card-title">Cross-scenario transfer</div>
      <p class="card-text mb-0"><strong>이미지로 배운 능력이 비디오로 전이</strong>(창발). 비디오 데이터에 덜 의존하고도 강한 비디오 이해.</p>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card h-100 p-3">
      <div class="card-title">균형 잡힌 토큰 예산 (AnyRes)</div>
      <p class="card-text mb-0">시나리오별 <strong>최대 시각 토큰 수를 비슷하게</strong> 맞춰 표현을 균형화 → 전이가 잘 일어난다.</p>
    </div>
  </div>
</div>

### 비디오는 어떻게 확장했나 — 모든 걸 "이미지 시퀀스"로

핵심은 **비디오 전용 아키텍처가 없다**는 것. AnyRes로 **모든 시각 신호를 "이미지(들)의 시퀀스"로 통일**한다.

<div class="ov-table" markdown="1">

| 시나리오 | AnyRes 표현 |
| --- | --- |
| 고해상도 단일 이미지 | grid로 쪼갠 **crop 여러 장**의 시퀀스 |
| 멀티이미지 | **이미지 여러 장**의 시퀀스 |
| **비디오** | **프레임 여러 장**의 시퀀스 |

</div>

즉 비디오 = "프레임이라는 이미지들의 시퀀스" → **이미지용 파이프라인을 그대로 재사용**한다(특수 비디오 모듈 없음).

그래서 **② 전이**가 일어난다 — AnyRes로 보면 *고해상도 단일 이미지(crop 여러 장) ≈ 비디오(프레임 여러 장)* 로 **구조가 비슷**하고, 시나리오별 **토큰 예산을 비슷하게** 맞춰(예: SigLIP 384²=729 토큰 기준) 표현을 균형화했기 때문에, **이미지(시퀀스)에서 배운 능력이 비디오(시퀀스)로 자연스럽게 전이**된다. (논문: *"AnyRes가 어떤 시각 신호든 이미지 시퀀스로 소화하기에, 이미지로만 학습한 모델이 비디오에 surprisingly 강하다"*)

> **한 줄.** AnyRes가 비디오를 *"프레임 = 이미지들의 시퀀스"* 로 바꿔 **이미지 파이프라인에 그대로 태운다** → 비디오 전용 학습 없이도 이미지 학습이 비디오로 전이된다.

{% include figure.liquid loading="lazy" path="assets/img/notes/llava-onevision/fig3.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 3. 시나리오별 토큰 배분 전략. 시나리오 간 최대 토큰 수를 비슷하게 맞춰 표현을 균형화 → cross-scenario 능력 전이를 돕는다." %}

## 방법 — Curriculum 3단계

쉬운 것 → 어려운 것 순으로 단계적으로 학습한다.

<div class="ov-table" markdown="1">

| 단계 | 무엇을 | 학습 모듈 |
| --- | --- | --- |
| **Stage-1** Language-Image Alignment | 시각 특징을 LLM 단어 공간에 정렬 | **projector만** |
| **Stage-1.5** High-Quality Knowledge | 고품질 지식 주입 | full model |
| **Stage-2** Visual Instruction Tuning | 다양한 시각 task를 지시로 풀게 | full model |

</div>

- 단계가 진행될수록 **해상도·토큰 수를 점진 증가**(Stage-1 기본 729 → 1.5/2에서 AnyRes로 5×·10×). 비전 인코더 lr은 LLM의 1/5.
- 데이터: 직접 큐레이션한 **OneVision 1.6M**(single/multi-image/video).

## 결과

{% include figure.liquid loading="lazy" path="assets/img/notes/llava-onevision/table2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Table 2. 0.5B~72B LLaVA-OneVision의 여러 모달리티·벤치마크 성능. 오픈 모델 중 세 시나리오 모두 SOTA급이며 상용 모델과도 경쟁." %}

- **세 시나리오 SOTA** — single-image·multi-image·video 전반에서 오픈 SOTA, 상용(GPT-4V 등)과도 경쟁.
- **전이로 얻는 창발** — 이미지 중심 학습만으로도 강한 **비디오 이해**가 나타난다(cross-scenario transfer).
- **스케일** — 0.5B / 7B / 72B 패밀리.

## 한 줄 정리 & 의의

- **"한 모델로 이미지·멀티이미지·비디오"** 를 처음 제대로 해낸 오픈 LMM. 비결은 **모든 시각 신호를 이미지 시퀀스로 통일 + 시나리오별 토큰 예산 균형** → 시나리오 간 **task transfer**(이미지→비디오 창발).
- **차별점.** [LLaVA-1.5]({% post_url 2023-10-05-llava1-5 %}) 등 기존 오픈 모델이 **한 시나리오(주로 이미지)** 에 특화됐다면, OneVision은 **셋 다 + 전이**. connector·인코더는 여전히 단순(SigLIP+MLP)하되 **입력 표현(AnyRes)·데이터·curriculum**으로 확장.
- **위치(세대).** G4(Native/스케일) — 입력을 **비디오·멀티이미지·고해상도**로 넓힌 노선. 네이티브 동적 해상도·에이전트까지 가는 [VLM 개요]({% post_url 2026-06-22-vlm-overview %})의 Qwen2.5-VL과 같은 흐름의 선배 격.
