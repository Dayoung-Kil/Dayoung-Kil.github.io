---
title: "A Study of Structure Pruning for Hybrid Neural Networks"
collection: publications
category: conferences
permalink: /publication/2024-10-29-A-Study-of-Structure-Pruning
excerpt: 'In this paper, we explore the impact of structure pruning on model compression. Structured pruning, which removes specific structures within the model such as entire neurons, channels, or filters in convolutional neural networks, targets particular elements for removal.'
date: 2024-10-29
venue: '2024 24th International Conference on Control, Automation and Systems (ICCAS)'
# slidesurl: 'http://academicpages.github.io/files/slides1.pdf'
paperurl: 'https://ieeexplore.ieee.org/document/10773379'
# bibtexurl: 'http://academicpages.github.io/files/bibtex1.bib'
citation: 'D. Ghimire, D. Kil and S. -h. Kim, "A Study of Structured Pruning for Hybrid Neural Networks," 2024 24th International Conference on Control, Automation and Systems (ICCAS), Jeju, Korea, Republic of, 2024, pp. 1110-1113, doi: 10.23919/ICCAS63016.2024.10773379.'
---
In this paper, we explore the impact of structure pruning on model compression. Structured pruning, which removes specific structures within the model such as entire neurons, channels, or filters in convolutional neural networks, targets particular elements for removal. This is distinct from weight pruning, which eliminates individual weights regardless of their location in the model. On top of our previous publications, the focus of this work is to study of reducing mobile stems in CNN-transformer architectures, building upon previous publications. Here, the mobile stems often make transformer architectures more efficient for deployment on mobile devices or other resource-constrained environments. Many pruning methods for mobile stems involve a sequential process of training, pruning, and fine-tuning stages. In contrast, our approach involves automatically selecting filter pruning criteria based on magnitude or similarity from a specified pool of criteria, adjusting the specific pruning layer in each iteration based on the network’s overall loss on a small subset of training data. To alleviate sudden accuracy drops from pruning, the network undergoes brief retraining after reducing a predefined number of floating-point operations (FLOPs). Optimal pruning rates for each layer in mobile stems are automatically determined. Experiments on the VGGNet, ResNet, and MobileNet models using the CIFAR-10 and ImageNet benchmark datasets validate the effectiveness of the proposed method. Additionally, we discuss remaining tasks and ongoing research for the future.

