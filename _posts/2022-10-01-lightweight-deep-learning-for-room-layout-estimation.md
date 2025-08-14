---
title: 단일 파노라마 입력의 실내 공간 레이아웃 복원 모델 경량화 (Lightweight Deep Learning for Room Layout Estimation with a Single Panoramic Image)
description: Journal of Institute of Control, Robotics and Systems(ICROS) 2022 (KCI 등재, SCOPUS)
author: [dayoung, kimsh]
date: 2022-10-01 09:00:00 +0900 
categories: [Lightweight 3D Room Layout, Publications]
tags: [Room Layout Estimation, Neural Architecture Search, Lightweight Deep Learning]
pin: true
math: true
mermaid: true
---


![light mode only](/assets/img/publications/room1.PNG){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }
<figcaption style="text-align:center; font-size:0.9em;">그림1. 실내 공간 레이아웃 복원 모델 경량화 개요</figcaption>

<br>

<!-- GitHub + Paper 버튼 -->
<div style="text-align:right;">
  <a href="https://github.com/Dayoung-Kil/Lightweight-Deep-Learning-for-Room-Layout-Estimation-with-a-Single-Panoramic-Image" target="_blank" style="text-decoration:none; margin-right:10px;">
    <i class="fab fa-github fa-lg"></i> GitHub Repository
  </a>
  <a href="https://www.dbpia.co.kr/Journal/articleDetail?nodeId=NODE11142005" target="_blank" style="text-decoration:none; margin-left:10px;">
    <i class="fas fa-file-alt"></i> Paper Link
  </a>
</div>

<!-- 구분선 -->
<hr style="border: 0; border-top: 1px solid var(--bs-border-color,#dee2e6); opacity:0.5; margin: 1.5rem 0;">

## ABSTRACT

In this paper, we present a lightweight deep learning model for room layout estimation. We build on the work in HorizonNet, in which a 3D room is restored from a single panoramic picture using three steps (pre-processing, feature extraction, and post-processing) by studying the efficient computation of the feature extraction part. In contrast to the baseline method that uses a combination of a typical residual network (ResNet) and long short-term memory (LSTM) as its principal architecture, we focus on the use of a platform-aware neural architecture search for mobile applications (MnasNet) and a gated recurrent unit (GRU) instead of conventional LSTM. Subsequently, hyperparameters of the suggested architectures are selected using sampling-based optimization. In our qualitative and quantitative experiments, the lightweight model using the combination of MnasNet and GRU required approximately half as many parameters compared to the original method for competitive performance of room layout estimation. Based on the Manhattan world assumption, the proposed architecture was validated using Stanford2D3D, PanoContext, and our real-world panorama dataset collected by off-the-shelf software in RICOH THETA Z1.

<br>

### 기존 및 제안 방법의 정량적 결과 비교

| Test cases        | ResNet50-LSTM   | MnasNet-LSTM | Our MnasNet-GRU |
| :------------------ | --------------- | ------ |----|
| # Parameter (Total) | 81,570,348 |40,397,700|37,641,092|
| # FLOPs          |  71.83| 56.19|58.48|
| # 2D IoU (%) | 87.07|84.16|85.07|
| # 3D IoU (%) |  84.53|80.80 |81.89|
| # MSE |  0.18| 0.23|0.21|
| # Pixel error (%) | 2.04| 2.57|2.70|
| # Corner error (%) | 0.65| 0.80|0.84|

<br>

### MnasNet-GRU 기반의 HorizonNet 경량화 모델 구조도

The image below represents Lightweight HorizonNet using Our MnasNet-GRU Architecture.  

![light mode only](/assets/img/publications/room2.PNG){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }
