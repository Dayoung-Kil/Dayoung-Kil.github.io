---
title: One-cycle Structured Pruning with Stability Driven Structure Search
description: arXiv 2025
author: [deepak, dayoung, kimsh]
date: 2025-05-01 09:00:00 +0900 
categories: [Publications, Pruning]
tags: [Structure pruning]
pin: true
math: true
mermaid: true
---


![light mode only](/assets/img/publications/onecycleprune.PNG){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }
<figcaption style="text-align:center; font-size:0.9em;">Fig1. Pruning ResNet50 on the ImageNet dataset</figcaption>

<br>

<!-- GitHub + Paper 버튼 -->
<div style="text-align:right;">
  <a href="https://arxiv.org/abs/2501.13439v1" target="_blank" style="text-decoration:none; margin-left:10px;">
    <i class="fas fa-file-alt"></i> Paper Link
  </a>
</div>

<!-- 구분선 -->
<hr style="border: 0; border-top: 1px solid var(--bs-border-color,#dee2e6); opacity:0.5; margin: 1.5rem 0;">


## ABSTRACT

Existing structured pruning typically involves multi-stage training procedures that often demand heavy computation. Pruning at initialization, which aims to address this limitation, reduces training costs but struggles with performance. To address these challenges, we propose an efficient framework for one-cycle structured pruning without compromising model performance. In this approach, we integrate pre-training, pruning, and fine-tuning into a single training cycle, referred to as the `one cycle approach'. The core idea is to search for the optimal sub-network during the early stages of network training, guided by norm-based group saliency criteria and structured sparsity regularization. We introduce a novel pruning indicator that determines the stable pruning epoch by assessing the similarity between evolving pruning sub-networks across consecutive training epochs. Also, group sparsity regularization helps to accelerate the pruning process and results in speeding up the entire process. Extensive experiments on datasets, including CIFAR-10/100, and ImageNet, using VGGNet, ResNet, MobileNet, and ViT architectures, demonstrate that our method achieves state-of-the-art accuracy while being one of the most efficient pruning frameworks in terms of training time. The source code will be made publicly available.


<br>
