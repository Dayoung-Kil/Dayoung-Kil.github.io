---
title: Face Out - A Website that Mosaic People's Faces through face recognition
description: Face Out - 얼굴 인식을 통한 사람 얼굴 모자이크 처리 웹
author: [dayoung, sunyoung, seoyun]
date: 2021-11-14 09:00:00 +0900 
categories: [Projects, Face Out (Website)]
tags: [Website, face recognition]
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

## Overview
- Face Recognition을 통해 지정된 사람을 제외한 다른 사람들의 얼굴을 모자이크 처리하는 시스템.
- 사용자들이 모자이크 처리 시스템을 이용할 수 있도록 웹 서비스 제작
- 촬영된 영상에서 특정 인물 이외의 인물들을 모자이크 가능
- 유튜버와 같은 크리에이터들이 많이 생겨나면서 미처 모자이크 처리되지 못한 사람들의 초상권 보호

<br>

## Participant Role

최서윤  
: Web FrontEnd 구상 & Face Recognition Model

길다영  
: Web Front-End & Back-End & Face Recognition Model Request

송선영  
: Web Front-End & Back-End & DataBase

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
