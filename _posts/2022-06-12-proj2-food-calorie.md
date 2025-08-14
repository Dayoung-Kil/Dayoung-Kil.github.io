---
title: Food Calorie Estimation
description: Food Detection 및 Volume Estimation을 통해, 이미지 내 음식의 칼로리 계산하는 프로젝트
author: [dayoung, junyong]
date: 2022-06-12 09:00:00 +0900 
categories: [Projects, Food Calorie Estimation]
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
  <a href="https://github.com/Dayoung-Kil/Food_Calorie_Estimation" target="_blank" style="text-decoration:none; margin-right:10px;">
    <i class="fab fa-github fa-lg"></i> GitHub
  </a>

</div>

<!-- 구분선 -->
<hr style="border: 0; border-top: 1px solid var(--bs-border-color,#dee2e6); opacity:0.5; margin: 1.5rem 0;">


## Overview
- Food Detection 및 Volume Estimation을 통해, 이미지 내 음식 인식 후 칼로리 계산.
- 음식 종류와 g수에 따른 칼로리, 영양성분 표시.

<br>

## Participant Role

길다영  
: Volume Estimation

김준용  
: Food Detection

<br>

## Project Details

### Work Flow
- Input Img → Food Detection → Volume Estimation → Calorie Calculation → Results

<img src="/assets/img/projects/food1.png" alt="전체 시스템 구성도" class="light w-75 shadow rounded-10" width="1212" height="668">
<figcaption style="text-align:center; font-size:0.9em;">전체 시스템 구성도</figcaption>

### Food Detection

- 3개의 Convolution layer와 Pooling layer로 구성
- Keras를 통한 이미지 로드 및 전처리 방법 : image.ImageDataGenerator
- Batch_size는 150, epochs는 100으로 설정
- 결과 Loss: 108.18%, ACC : 73.42%가 나옴

### Volume Estimation

- Reference: [AlexGraikos-food_volume_estimation](https://github.com/AlexGraikos/food_volume_estimation)

<img src="/assets/img/projects/food2.png" alt="Volume Estimation Overview" class="light w-75 shadow rounded-10" width="1212" height="668">
<figcaption style="text-align:center; font-size:0.9em;">volume Estimation Overview</figcaption>

### Calorie Estimation
- Food 101 데이터 셋의 음식 종류와 g수에 따른 칼로리, 영양성분을 나타내기 위해 dict = {'food' : [g, kcal, 탄수화물, 단백질, 지방, 당류]} 형태의 딕셔너리 생성
- (추정한 volume / g) * kcal 로 input image의 최종 칼로리 계산

<img src="/assets/img/projects/food3.png" alt="Calorie Estimation Method" class="light w-75 shadow rounded-10" width="1212" height="668">
<figcaption style="text-align:center; font-size:0.9em;">Calorie Estimation Method</figcaption>

<br>

## Results
- 음식 종류와 g수에 따른 칼로리, 영양성분 나타남.

<img src="/assets/img/projects/food4.png" alt="Results" class="light w-75 shadow rounded-10" width="1212" height="668">
<figcaption style="text-align:center; font-size:0.9em;">Results</figcaption>

