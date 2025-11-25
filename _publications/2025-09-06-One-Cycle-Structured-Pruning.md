---
title: "One-cycle Structured Pruning with Stability Driven Structure Search"
collection: publications
category: conferences
permalink: /publication/2025-09-06-One-Cycle-Structured-Pruning
excerpt: 'The key idea is to identify the optimal sub-network early in training, guided by norm-based group saliency criteria and structured sparsity regularization. We further introduce a novel pruning indicator that determines the stable pruning epoch by measuring the similarity between evolving sub-networks across consecutive epochs. The group sparsity regularization accelerates pruning, further reducing training time.'
date: 2025-09-06
venue: 'The IEEE/CVF Winter Conference on Applications of Computer Vision 2026 (WACV)'
paperurl: 'https://arxiv.org/abs/2501.13439'
codeurl: 'https://github.com/ghimiredhikura/OCSPruner'
citation: 'Ghimire, D., Kil, D., Jeong, S., Park, J., & Kim, S. H. (2025). One-cycle Structured Pruning with Stability Driven Structure Search. arXiv preprint arXiv:2501.13439.'
---

Existing structured pruning typically involves multi-stage training procedures that often demand heavy computation. Pruning at initialization, which aims to address this limitation, reduces training costs but struggles with performance. To address these challenges, we propose an efficient framework for one-cycle structured pruning without compromising model performance. In this approach, we integrate pre-training, pruning, and fine-tuning into a single training cycle, referred to as the `one cycle approach'. The core idea is to search for the optimal sub-network during the early stages of network training, guided by norm-based group saliency criteria and structured sparsity regularization. We introduce a novel pruning indicator that determines the stable pruning epoch by assessing the similarity between evolving pruning sub-networks across consecutive training epochs. Also, group sparsity regularization helps to accelerate the pruning process and results in speeding up the entire process. Extensive experiments on datasets, including CIFAR-10/100, and ImageNet, using VGGNet, ResNet, MobileNet, and ViT architectures, demonstrate that our method achieves state-of-the-art accuracy while being one of the most efficient pruning frameworks in terms of training time. The source code will be made publicly available.
