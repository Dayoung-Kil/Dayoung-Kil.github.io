---
title: "Lightweight Room Layout Estimation using a Single Panoramic Image"
collection: publications
category: conferences
permalink: /publication/2022-11-27-lightweight-room-layout-estimation
excerpt: 'In this paper, we suggest a lightweight deep representation for room layout estimation using a single panoramic image.'
date: 2022-11-27
venue: '2022 22nd International Conference on Control, Automation and Systems (ICCAS)'
# slidesurl: 'http://academicpages.github.io/files/slides1.pdf'
paperurl: 'https://ieeexplore.ieee.org/document/10003901'
codeurl: 'https://github.com/Dayoung-Kil/Lightweight-Deep-Learning-for-Room-Layout-Estimation-with-a-Single-Panoramic-Image'
# bibtexurl: 'http://academicpages.github.io/files/bibtex1.bib'
citation: 'D. Kil and S. -H. Kim, "Lightweight Room Layout Estimation using a Single Panoramic Image," 2022 22nd International Conference on Control, Automation and Systems (ICCAS), Jeju, Korea, Republic of, 2022, pp. 1951-1953, doi: 10.23919/ICCAS55662.2022.10003901.'
---
Due to limited computational capabilities of embedded systems, the trade-off relationship between algorithm performance and its computational complexity is crucial to apply deep learning models for new camera functions. In this paper, we suggest a lightweight deep representation for room layout estimation using a single panoramic image. Based on HorizonNet [3], which typically requires a lot of computational resources at every step, we propose to replace the feature extraction networks of the residual network (ResNet) [6] and the long short-term memory (LSTM) [8] with a platform-aware neural architecture search model and an gated recurrent unit. In order to use fewer computational re-sources, the proposed architecture utilizes sampling-based optimization to select best hyperparameters. In our quantitative experiments, the lightweight network configured with the presented method uses only about 1/2 fewer parameters than the existing network. We also use real-world panorama images taken with RICOH THETA Z1 to validate its performance. In the qualitative experiments, no significant difference from the original model is observed with the same panorama inputs.

