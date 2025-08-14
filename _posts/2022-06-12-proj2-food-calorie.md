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
    <i class="fab fa-github fa-lg"></i> GitHub Repository
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

### WebSite

<div class="media-grid">
  <figure>
    <img src="/assets/img/projects/face2.png" alt="Prototype">
    <figcaption>Prototype</figcaption>
  </figure>
  <figure>
    <img src="/assets/img/projects/face1.png" alt="Final Implementation">
    <figcaption>Final Implementation</figcaption>
  </figure>
</div>

### System Architecture

- 서버는 Flask, DB는 MySQL로 제작.
- Flask에서 MySQL을 사용하기 위해 Flask-sqlalchemy을 사용.

<img src="/assets/img/projects/face3.png" alt="전체 시스템 구성도" class="light w-75 shadow rounded-10" width="1212" height="668">
<figcaption style="text-align:center; font-size:0.9em;">전체 시스템 구성도</figcaption>

### Results

<div class="media-grid cols-3">
  <figure>
    <img src="/assets/img/projects/input1.jpg" alt="Input 1">
    <figcaption>Input 1: 모자이크에서 제외할 인물 사진</figcaption>
  </figure>
  <figure>
    <img src="/assets/img/projects/input1_2.gif" alt="Input 2">
    <figcaption>Input 2: 모자이크 처리할 사진</figcaption>
  </figure>
  <figure>
    <img src="/assets/img/projects/output1.gif" alt="Output">
    <figcaption>Output: 모자이크 결과</figcaption>
  </figure>
</div>

<div class="media-grid cols-3">
  <figure>
    <img src="/assets/img/projects/input2.jpg" alt="Input 1">
    <figcaption>Input 1</figcaption>
  </figure>
  <figure>
    <img src="/assets/img/projects/input2_2.jpg" alt="Input 2">
    <figcaption>Input 2</figcaption>
  </figure>
  <figure>
    <img src="/assets/img/projects/output2.jpg" alt="Output">
    <figcaption>Output</figcaption>
  </figure>
</div>
