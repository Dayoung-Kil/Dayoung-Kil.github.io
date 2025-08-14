---
title: Lightweight Room Layout Estimation using a Single Panoramic Image
description: International Conference on Control, Automation and Systems (ICCAS 2022)
author: [dayoung, kimsh]
date: 2022-11-01 09:00:00 +0900 
categories: [Publications, Lightweight 3D Room Layout]
tags: [Lightweight Deep Learning, Room Layout Estimation, Neural Architecture Search]
pin: true
math: true
mermaid: true
---


![light mode only](/assets/img/publications/room_1.PNG){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }
<figcaption style="text-align:center; font-size:0.9em;">그림1. 실내 공간 레이아웃 복원 모델 경량화 개요</figcaption>


## ABSTRACT

Recently, we are increasingly sharing structures and interiors of our own houses through simple photo shots or its panoramas. In 2D images, however, the actual size or ratio of the 3D space may look different with severe projective transformations depending on camera view points. Starting with this motivation, room layout estimation can help architects and interior designers by allowing to check the entire 3D structure of the room at once without such distortions. As deep neural networks being standard techniques for almost all the cognitive functions, they also require more memory and computational resources than those of conventional rule-based operations. Hence, neural network architectures and operations must be optimized for mobile and low-power platforms such as these embedded applications involved with camera ISPs[10][11][13]. In this paper, we present a way to optimize the feature extraction network used in HorizonNet[3] in order to create a lighter model that recovers the indoor 3D layout from a single panorama image. We replace the LSTM[8] used in the existing network with a relatively simple structure GRU[9], and use MnasNet[7] instead of the ResNet[6]-based backbone. After that, we optimize the hyperparameters of the presented model using a sampling-based methodology. While reducing the computation complexity, performance degradation is minimized in our experiments. We believe lightweight models would become essential topics for designing deep structures that are friendly to practical applications.
<br>


###  Qualitative Comparison

The image below represents Qualitative Comparison between the Previous Method and Ours with Images taken from RICOH THETA Z.  

![light mode only](/assets/img/publications/room_2.PNG){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }

<!-- markdownlint-capture -->
<!-- markdownlint-disable -->

> GitHub ['url'](https://github.com/Dayoung-Kil/Lightweight-Deep-Learning-for-Room-Layout-Estimation-with-a-Single-Panoramic-Image)
{: .prompt-info }

> Link: ['url'](https://ieeexplore.ieee.org/document/10003901)
{: .prompt-warning }

<!-- markdownlint-restore -->
