---
title: Zero-Shot Anomaly Detection - Leveraging Text Prompt in Vision-Language Models
description: 시각-언어 모델을 활용하는 제로샷 이상 감지 방법론
author: [dayoung, junyong]
date: 2023-11-22 09:00:00 +0900 
categories: [Projects, Zero-Shot Anomaly Detection]
tags: []
pin: true
math: true
mermaid: true
---

<style>
/* ===== 반응형 미디어 그리드 ===== */
.media-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 기본 2열 */
  gap: 12px;
  margin: 0 0 1.25rem 0;
}
.media-grid.cols-3 { grid-template-columns: repeat(3, 1fr); } /* 3열 */
.media-grid figure { margin: 0; }
.media-grid img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: .6rem;
  box-shadow: 0 1px 2px rgba(0,0,0,.06);
  background: var(--bs-body-bg, #fff);
}
.media-grid figcaption {
  text-align: center;
  color: var(--bs-secondary-color, #6c757d);
  font-size: .9rem;
  margin-top: .4rem;
}
/* 모바일: 1열로 접기 */
@media (max-width: 768px) {
  .media-grid, .media-grid.cols-3 { grid-template-columns: 1fr; }
}

/* 단일 이미지도 자연스럽게 */
.post .content img,
.content img {
  max-width: 100%;
  height: auto;
}
</style>

<!-- GitHub + Paper 버튼 -->
<div style="text-align:right;">
  <a href="https://github.com/VIP-Projects/Zero-Shot-Anomaly-Detection" target="_blank" style="text-decoration:none; margin-right:10px;">
    <i class="fab fa-github fa-lg"></i> GitHub
  </a>
</div>

<!-- 구분선 -->
<hr style="border: 0; border-top: 1px solid var(--bs-border-color,#dee2e6); opacity:0.5; margin: 1.5rem 0;">

<!-- markdownlint-capture -->
<!-- markdownlint-disable -->
> 2023 산학 프로젝트 챌린지 with KOH YOUNG TECHNOLOGY <b>본선 1차 진출</b>
{: .prompt-tip }

<!-- markdownlint-restore -->


## Overview
### Koh Young Technology 요구 사항
- 제조 자동화 산업
- 이상 감지 검출 연구 및 개발의 한계
  - 제조 및 검증 과정에서 고장 부품을 학습하고 선별하는 것이 어려움.
  - 모든 고장 부품에 대한 충분한 양의 훈련 데이터셋 얻기 어려움.
  - Unseen 영상 및 고장 카테고리 변경 시 재학습이 필요함.
- 고장 카테고리를 학습하여 정확도를 1-2% 향상시키는 것보다 Zero-Shot 방법론을 통해 학습 비용 감축에 관심을 보임.

### 프로젝트 목적
- 시각-언어 모델을 이용하여 데이터셋을 훈련없이 Abnormal Detection이라는 일반적인 프레임워크 만드는 것이 목표.
- 기존 연구인 Fall Detection을 사례연구로 먼저 시도했고, 다양한 상황에서의 이상 감지로 일반화 가능성을 확인함.



<br>

## Project Details

### Preview

<img src="/assets/img/projects/fall1.gif" alt="preview" class="light w-75 shadow rounded-10" width="1212" height="668">
<figcaption style="text-align:center; font-size:0.9em;">Preview</figcaption>

```ENV
운영체제 : Linux 20.04
GPU : GeForce RTX 3090
개발언어 : Python 3.8
사용 툴 : Linux
AI 라이브러리 : Pytorch 1.8.1
```

### System Overview
<div class="media-grid">
  <figure>
    <img src="/assets/img/projects/fall2.png" alt="Rule-based">
    <figcaption><b>Rule-based</b> OpenPose, 가속도</figcaption>
  </figure>
  <figure>
    <img src="/assets/img/projects/fall3.png" alt="Zero-Shot">
    <figcaption><b>Zero-Shot</b> BLIP, GroundingDINO, Human-Object Interaction(HOI)</figcaption>
  </figure>
</div>


