---
title: '3D Room Reconstruction Using HorizonNet'
date: 2021-06-07
permalink: /posts/2021/06/3D-Room-Reconstruction/
tags:
  - 3D Room Reconstruction
  - Lightweighting
  - HorizenNet
---

[![GitHub](https://img.icons8.com/ios-glyphs/30/000000/github.png)](https://github.com/2021-1-SSU-Computer-Vision/3D_Room_Reconstruction)

Date|Participants
--|--
2021.05 - 2021.06|길다영, 김현우



## Overview
- HorizonNet 연구 분석 후, 모델을 훈련시키고 직접 촬영한 이미지를 적용하여 3D Room 복원.
- 한 장의 파노라마 이미지만을 사용해서 방을 3D로 복원 가능.
- HorizonNet은 Manhattan World 가정을 기반으로 하여 짧은 시간에 방의 구조를 추측하는 방법으로 HorizonNet을 통해 기존 SFM(Structure From Motion) 방법에서의 다양한 문제점(조명에 영향 받음, 많은 시간 소요, 무수히 많은 이미지 필요, 유리 인식 불가 등)들을 해결할 수 있을 거라 판단함.

<br>

## Expected effects
- 기존 3D room 복원은 왜곡이 심한 부분이 많고 방 크기나 비율이 실제와 달라 보이는 경우가 많은데, 이러한 문제점을 개선하여 건축가 및 인테리어 디자이너, 혹은 이사를 위해 집 구조를 알아보는 사람들에게 도움이 될 수 있음.
- 일반적인 RGB 카메라로 촬영된 파노라마 사진 한장으로 쉽게 3D Room을 구현할 수 있어 많은 분야에 있어 용이할 것임.
- 만약 구현된 3D 모델에서 가구와 같은 디테일한 요소들을 보완할 수 있다면, 온라인 박람회나 온라인 집들이 등 가상현실의 배경을 구축하는 것에 도움이 될 것임.