---
title: "단일 파노라마 입력의 실내 공간 레이아웃 복원 모델 경량화"
collection: publications
category: conferences
permalink: /publication/2022-10-01-Lightweight-Deep-Learning-for-Room-Layout-Estimation
excerpt: 'In this paper, we present a lightweight deep learning model for room layout estimation. In contrast to the baseline method that uses a combination of a typical residual network (ResNet) and long short-term memory (LSTM) as its principal architecture, we focus on the use of a platform-aware neural architecture search for mobile applications (MnasNet) and a gated recurrent unit (GRU) instead of conventional LSTM.'
date: 2022-10-01
venue: 'Journal of Institute of Control, Robotics and Systems (ICROS), (KCI, SCOPUS), 2022'
# slidesurl: 'http://academicpages.github.io/files/slides1.pdf'
paperurl: 'https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART002884719'
codeurl: 'https://github.com/Dayoung-Kil/Lightweight-Deep-Learning-for-Room-Layout-Estimation-with-a-Single-Panoramic-Image'
# bibtexurl: 'http://academicpages.github.io/files/bibtex1.bib'
citation: 'Dayoung Kil and Seong-heum Kim. (2022). Lightweight Deep Learning for Room Layout Estimation with a Single Panoramic Image. Journal of Institute of Control, Robotics and Systems, 28(10), 868-873.'
---
In this paper, we present a lightweight deep learning model for room layout estimation. We build on the work in HorizonNet, in which a 3D room is restored from a single panoramic picture using three steps (pre-processing, feature extraction, and post-processing) by studying the efficient computation of the feature extraction part. In contrast to the baseline method that uses a combination of a typical residual network (ResNet) and long short-term memory (LSTM) as its principal architecture, we focus on the use of a platform-aware neural architecture search for mobile applications (MnasNet) and a gated recurrent unit (GRU) instead of conventional LSTM. Subsequently, hyperparameters of the suggested architectures are selected using sampling-based optimization. In our qualitative and quantitative experiments, the lightweight model using the combination of MnasNet and GRU required approximately half as many parameters compared to the original method for competitive performance of room layout estimation. Based on the Manhattan world assumption, the proposed architecture was validated using Stanford2D3D, PanoContext, and our real-world panorama dataset collected by off-the-shelf software in RICOH THETA Z1.


