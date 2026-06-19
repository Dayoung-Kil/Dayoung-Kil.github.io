---
layout: page
title: Lightweight Room Layout Estimation
description: "2022 · ICCAS — lightweight 3D room layout estimation from a single panorama."
img: assets/img/projects/room_layout.png
importance: 3
category: 2022
type: publication
github: https://github.com/Dayoung-Kil/Lightweight-Deep-Learning-for-Room-Layout-Estimation-with-a-Single-Panoramic-Image
paper: https://ieeexplore.ieee.org/document/10003901
_styles: >
  .post article strong { color: #5d5c98; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#4d5f8c;color:#fff">ICCAS 2022 · Busan</span>
  <span class="badge rounded-pill me-1" style="background-color:#4d5f8c;color:#fff">Lightweight Deep Learning</span>
  <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">Neural Architecture Search</span>
</div>
<p class="text-muted">22nd International Conference on Control, Automation and Systems (ICCAS), BEXCO, Busan &middot; Nov 2022 &middot; Indexed in IEEE Xplore</p>

<p class="mb-3"><strong>Dayoung Kil</strong>, Seong-heum Kim &middot; VIP Lab, Soongsil University</p>

<div class="p-4 my-3 rounded" style="background-color: rgba(93,92,152,0.08); border-left: 4px solid #5d5c98;">
  <p class="lead mb-2" style="font-weight:700">Can a phone-sized network rebuild the 3D layout of a room from a <em>single</em> panorama?</p>
  <p class="mb-0">We make HorizonNet lightweight: its ResNet backbone is replaced by a searched MnasNet, and its LSTM by a GRU. The result runs at less than half the parameters — with almost no loss in layout accuracy.</p>
</div>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://ieeexplore.ieee.org/document/10003901" target="_blank" rel="noopener noreferrer">IEEE Xplore</a>
  <a class="btn btn-sm btn-outline-dark" href="https://github.com/Dayoung-Kil/Lightweight-Deep-Learning-for-Room-Layout-Estimation-with-a-Single-Panoramic-Image" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github me-1"></i> View code on GitHub</a>
</p>

<div class="row justify-content-center">
  <div class="col-lg-7 col-md-9">
    {% include figure.liquid loading="eager" path="assets/img/projects/room_layout.png" class="img-fluid rounded z-depth-1" zoomable=true caption="From a single panorama to a full 3D room layout." %}
  </div>
</div>

<hr>

## The problem

Sharing the inside of a home as a single photo or panorama is everyday now — but a 2D image **distorts the real size and proportions** of a 3D space. *Room layout estimation* recovers the true 3D structure (floor, ceiling, walls) from one image, which is useful for architects, interior design, and AR.

The catch: state-of-the-art models like **HorizonNet** are heavy, and camera ISPs / embedded platforms have a tight compute budget.

> The goal: keep HorizonNet's layout quality, but make it light enough for on-device, low-power use.

<hr>

## Approach

HorizonNet recovers a layout in three stages — **pre-processing** (align the panorama, detect vanishing points), **feature extraction** (predict a 1D layout of ceiling/floor/wall boundaries), and **post-processing** (lift it to 3D under the Manhattan-world assumption). We leave this pipeline intact and only make the **feature-extraction network** lightweight.

The feature extractor in HorizonNet is **ResNet-50 + LSTM**. We replace both halves with lighter modules and **search** the configuration instead of hand-fixing it:

| Stage | HorizonNet (baseline) | Ours (lightweight) |
| --- | --- | --- |
| **Backbone** | ResNet-50 | **MnasNet** — platform-aware NAS |
| **Sequence model** | LSTM *(2 states, 3 gates)* | **GRU** *(1 state, 2 gates)* |
| **Hyperparameters** | fixed | **sampling-based search** |

### Why these swaps

- **ResNet-50 → MnasNet.** MnasNet decomposes the network into blocks and uses a *factorized hierarchical search space* — each block can differ, but layers inside a block share structure, so the search space stays small and mobile-friendly.
- **LSTM → GRU.** A GRU merges the LSTM's input/forget gates into one update gate and its cell/hidden states into a single state — fewer parameters for the same sequence modeling.

### Searching the backbone

We tune the 6 inverted-residual blocks with sampling-based optimization. Mirroring ResNet's `256·512·1024·2048` blew up the parameter count, so we use **`128 · 256 · 512 · 1024 · 36 · 24`** out-channels, and assign **fewer repeats to the wide blocks** — trading FLOPs and parameters for almost no accuracy drop.

{% include figure.liquid loading="lazy" path="assets/img/projects/room_layout_arch.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Factorized hierarchical search space of our MnasNet backbone. Each of the 6 blocks is tuned by sampling-based optimization over kernel size, stride, expansion ratio, repeat count, and output channels." %}

<hr>

## Results

Trained on a **Stanford2D3D + PanoContext** mix (817 train / 79 val / 166 test, 300 epochs), and validated on **real RICOH THETA Z1** panoramas.

| Metric | HorizonNet (ResNet-50 + LSTM) | Ours (MnasNet + GRU) |
| --- | --- | --- |
| **Parameters** | 81.6 M | **37.6 M** *(−54%)* |
| 2D IoU | 87.07 | 85.07 |
| 3D IoU | 84.53 | 81.89 |
| MSE | 0.18 | 0.21 |

<div class="row text-center g-3 my-3">
  <div class="col-6 col-md-4">
    <div class="card h-100 p-3"><h3 class="mb-0">−54%</h3><small class="text-muted">parameters (81.6M → 37.6M)</small></div>
  </div>
  <div class="col-6 col-md-4">
    <div class="card h-100 p-3"><h3 class="mb-0">−2.0</h3><small class="text-muted">2D IoU points only</small></div>
  </div>
  <div class="col-6 col-md-4">
    <div class="card h-100 p-3"><h3 class="mb-0">≈ same</h3><small class="text-muted">qualitative 3D layout</small></div>
  </div>
</div>

{% include figure.liquid loading="lazy" path="assets/img/projects/room_layout_qual.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Qualitative comparison on real RICOH THETA panoramas: (a) input, (b) 1D layout from our MnasNet-GRU, (c) our 3D estimate, (d) the original HorizonNet (ResNet-50 + LSTM). The lightweight model is visually indistinguishable from the full one." %}

On real THETA panoramas, the lightweight model's 3D reconstructions show **no significant visual difference** from the original HorizonNet.

### Ablation — where the savings come from

| Model | Parameters | FLOPs | MSE |
| --- | --- | --- | --- |
| ResNet-50 + LSTM *(baseline)* | 81.6 M | 71.83 | 0.18 |
| MnasNet + LSTM | 40.4 M | 59.19 | 0.23 |
| **MnasNet + GRU *(ours)*** | **37.6 M** | **58.48** | **0.21** |

- **MnasNet does the heavy lifting** — it alone roughly halves the parameters (81.6M → 40.4M) and cuts FLOPs (71.83 → 59.19).
- **GRU trims a bit more** (40.4M → 37.6M) and, interestingly, *improves* MSE (0.23 → 0.21): once the model is right-sized, extra under-trained parameters were hurting rather than helping.

<hr>

## Takeaways

- A searched MobileNet-style backbone + GRU makes panoramic room-layout estimation **embedded-friendly** at less than half the parameters.
- The accuracy cost is small (≈2 IoU points), and qualitatively the 3D layouts are indistinguishable from the full model.

**Future work:** add the Structured3D dataset, and use reinforcement learning to search the remaining inverted-residual hyperparameters (kernel size, expansion ratio, stride).

<hr>

## Details

<p>
  <span class="badge rounded-pill bg-light text-dark border me-1">HorizonNet</span>
  <span class="badge rounded-pill bg-light text-dark border me-1">MnasNet (NAS)</span>
  <span class="badge rounded-pill bg-light text-dark border me-1">GRU</span>
  <span class="badge rounded-pill bg-light text-dark border me-1">Stanford2D3D · PanoContext</span>
  <span class="badge rounded-pill bg-light text-dark border me-1">RICOH THETA Z1</span>
</p>
<p class="text-muted">
  Authors: Dayoung Kil, Seong-heum Kim &middot; VIP Lab, Soongsil University.<br>
  Supported by the National Research Foundation of Korea (MSIT), Grant NRF-2021R1G1A1009828.
</p>
