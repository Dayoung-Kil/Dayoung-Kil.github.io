---
title: "One-Cycle Structured Pruning via Stability-Driven Subnetwork Search"
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

Structured pruning methods often rely on multi-stage training procedures that incur heavy computational costs. Pruning at initialization reduces training overhead but typically sacrifices performance. To address these challenges, we propose an efficient one-cycle structured pruning framework that preserves model accuracy. Our approach integrates pre-training, pruning, and fine-tuning into a single training cycle, referred to as the one-cycle approach.

The key idea is to identify the optimal sub-network early in training, guided by norm-based group saliency criteria and structured sparsity regularization. We further introduce a novel pruning indicator that determines the stable pruning epoch by measuring the similarity between evolving sub-networks across consecutive epochs. The group sparsity regularization accelerates pruning, further reducing training time.

Extensive experiments on CIFAR-10/100 and ImageNet with VGGNet, ResNet, and MobileNet demonstrate that our method achieves state-of-the-art accuracy while being among the most efficient pruning frameworks in terms of training cost.
