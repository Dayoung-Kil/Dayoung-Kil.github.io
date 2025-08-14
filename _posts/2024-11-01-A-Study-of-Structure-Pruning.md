---
title: A Study of Structure Pruning for Hybrid Neural Networks
description: International Conference on Control, Automation and Systems(ICCAS 2024)
author: [deepak, dayoung, kimsh]
date: 2024-11-01 09:00:00 +0900 
categories: [Publications, Survey]
tags: [Structure pruning, Hybrid neural networks, Mobile stems]
pin: true
math: true
mermaid: true
---


![light mode only](/assets/img/publications/survey_pruning.PNG){: .light .w-75 .shadow .rounded-10 w='1212' h='668' }
<figcaption style="text-align:center; font-size:0.9em;">Fig1. Improved techniques for our structure pruning</figcaption>

<br>

<!-- GitHub + Paper 버튼 -->
<div style="text-align:right;">
  <a href="https://ieeexplore.ieee.org/document/10773379" target="_blank" style="text-decoration:none; margin-left:10px;">
    <i class="fas fa-file-alt"></i> Paper Link
  </a>
</div>

<!-- 구분선 -->
<hr style="border: 0; border-top: 1px solid var(--bs-border-color,#dee2e6); opacity:0.5; margin: 1.5rem 0;">


## ABSTRACT

In this paper, we explore the impact of structure pruning on model compression. Structured pruning, which removes specific structures within the model such as entire neurons, channels, or filters in convolutional neural networks, targets particular elements for removal. This is distinct from weight pruning, which eliminates individual weights regardless of their location in the model. On top of our previous publications, the focus of this work is to study of reducing mobile stems in CNN-transformer architectures, building upon previous publications. Here, the mobile stems often make transformer architectures more efficient for deployment on mobile devices or other resource-constrained environments. Many pruning methods for mobile stems involve a sequential process of training, pruning, and fine-tuning stages. In contrast, our approach involves automatically selecting filter pruning criteria based on magnitude or similarity from a specified pool of criteria, adjusting the specific pruning layer in each iteration based on the network’s overall loss on a small subset of training data. To alleviate sudden accuracy drops from pruning, the network undergoes brief retraining after reducing a predefined number of floating-point operations (FLOPs). Optimal pruning rates for each layer in mobile stems are automatically determined. Experiments on the VGGNet, ResNet, and MobileNet models using the CIFAR-10 and ImageNet benchmark datasets validate the effectiveness of the proposed method. Additionally, we discuss remaining tasks and ongoing research for the future.

<br>
