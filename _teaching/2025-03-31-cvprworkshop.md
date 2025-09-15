---
title: "4th, Track1 - Image classification for different lighting conditions and styles"
collection: teaching
type: "2025 IEEE LOW-POWER COMPUTER VISION CHALLENGE"
permalink: /teaching/2025-03-31-cvprworkshop
venue: "2025 CVPR Workshop"
date: 2025-03-31
# location: "City, Country"
---
[![Internet](https://img.icons8.com/?size=25&id=Zt694HAaTkB3&format=png&color=000000/Internet.png)](https://lpcv.ai/2025LPCVC/leaderboard/track1/) 

Team: VIP (길다영, 이정윤)

## Datasets
- COCO, OIDv6, Stable Diffusion


## Knowledge Distillation

- **student** = convnext_tiny.in12k
- **teacher** = convnextv2_huge.fcmae_ft_in22k_in1k_512

## Freezing : This enhances the effect of transfer learning.

- **freeze_layers :**  the early part of the model (stem and first stage) is frozen while the head and upper layers are reinitialized, stabilizing the lower layers.
- **progressive_unfreeze** : gradually unfreezes layers during training after initially keeping two stages frozen.

## Classifier Head

- A complex head structure improves performance, especially in challenging classification tasks requiring fine-grained distinctions. **Different learning rates are applied to the backbone and head**, with the head using a 10x higher learning rate to focus on improving classification performance.

## Hyperparameter

- **LR** = 1e-5
- **kd_temp** = 4.0, kd_alpha = 0.7

## Results

- **Complie Job Id :** j572wzdvp
- **Performace Score :** 0.9460580913
- **Time(Microsec) :** 1877
- **Accuracy :** 0.9460580913