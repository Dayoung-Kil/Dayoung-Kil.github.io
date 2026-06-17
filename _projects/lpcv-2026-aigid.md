---
layout: page
title: AI-Generated Image Detection on Edge
description: "2026 · 🥈 LPCVC Track 3, 2nd Place — an on-device vision-language model that detects AI-generated images and explains why."
img: assets/img/projects/lpcv_challenge.png
importance: 1
category: 2026
mermaid:
  enabled: true
  zoomable: true
github: https://github.com/LPCV-SSUPER-POWER/Track3-AI-Generated-Images-Detection
_styles: >
  .post article strong { color: #5d5c98; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#e8c468;color:#1c1c1d">🥈 2nd Place</span>
  <span class="badge rounded-pill me-1" style="background-color:#4d5f8c;color:#fff">LPCVC 2026 · Track 3</span>
  <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">On-device · Snapdragon 8 Elite</span>
</div>
<p class="text-muted">ECV Workshop @ CVPR 2026, Denver &middot; Sponsored by Qualcomm</p>

<p class="lead">Can a phone tell a real photo from an AI-generated one — and <em>explain its reasoning</em>? Our entry to the 2026 IEEE Low-Power Computer Vision Challenge does both, <strong>fully on-device</strong>, under the contest's strict latency and power budgets.</p>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://github.com/LPCV-SSUPER-POWER/Track3-AI-Generated-Images-Detection" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github me-1"></i> View code on GitHub</a>
  <a class="btn btn-sm btn-outline-dark" href="https://huggingface.co/Dayoung-space/SSUPER-AIGID" target="_blank" rel="noopener noreferrer">🤗 Model weights</a>
</p>

<hr>

## The challenge

{% include figure.liquid loading="lazy" path="assets/img/projects/lpcv_challenge.png" class="img-fluid rounded z-depth-1" zoomable=true caption="2026 IEEE Low-Power Computer Vision Challenge — Track 3: AI Generated Images Detection." %}

Track 3 raises the bar past a yes/no classifier: the model has to **decide *and* justify**.

> Saying "fake" isn't enough — the model has to point to **what** gives it away.

Every prediction therefore has two parts:

- **Detection** — is the image *Real* or *AI-Generated*?
- **Explanation** — a score and written evidence for each of **8 forensic criteria**:

<div class="row g-2 my-3">
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center"><small>💡 Lighting &amp; Shadows</small></div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center"><small>✂️ Edges &amp; Boundaries</small></div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center"><small>🧵 Texture &amp; Resolution</small></div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center"><small>📐 Perspective &amp; Space</small></div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center"><small>⚖️ Physical / Common-Sense</small></div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center"><small>🔤 Text &amp; Symbols</small></div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center"><small>🧍 Human / Biological</small></div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center"><small>🧱 Material &amp; Object Detail</small></div></div>
</div>

The organizers grade the submitted binary in **two stages**: first the model reads the image and writes a free-form analysis across the 8 criteria *(Stage 1)*, then it folds that analysis into one structured **JSON** — per-criterion score, evidence, and final verdict *(Stage 2)*.

### How it's scored

Two constraints drive every design decision:

<div class="row g-3 my-3">
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <h6 class="mb-1">⏱️ Speed gate</h6>
      <p class="mb-0 text-muted">Inference must run <strong>faster than 15 tokens/s</strong> on the phone — miss it and the entry is disqualified.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <h6 class="mb-1">🎯 Accuracy</h6>
      <p class="mb-0 text-muted">A per-image score rewarding both the <strong>verdict</strong> and the <strong>explanation</strong>.</p>
    </div>
  </div>
</div>

The accuracy score combines three measurements:

| Component | How it's measured |
| --- | --- |
| **Detection** | accuracy of the overall Real / AI-Generated call |
| **Criterion** | exact-match accuracy of each per-criterion judgment |
| **Evidence** | semantic similarity of the written evidence to ground truth |

$$
\text{Explanation} = 0.5\,(\text{Criterion}) + 0.5\,(\text{Evidence})
$$

$$
\text{Image score} =
\begin{cases}
\text{Detection} & \text{Real} \\[2pt]
0.5\,(\text{Detection}) + 0.5\,(\text{Explanation}) & \text{AI-Generated}
\end{cases}
\qquad
\text{Final} = \frac{\sum \text{Image score}}{\#\,\text{images}}
$$

<hr>

## Approach

```mermaid
flowchart LR
  A["~788K images<br/>ADM · BigGAN · SID<br/>SynthScars · ImageNet · COCO"] -->|"Qwen2.5-VL auto-annotation<br/>8 criteria · evidence · domain"| B["SFT splits"]
  B -->|"Step 0 → 1 → 2<br/>LoRA+ on Qwen2-VL-2B"| C["Merged detector"]
  C -->|"AIMET W4A16<br/>ONNX → QNN"| D["On-device<br/>Snapdragon 8 Elite"]
```

### 1 · Data & annotation

The hard part: almost none of the source images came with the 8-criteria labels the task needs.

- **Sources** — fakes from **GenImage (ADM, BigGAN)**, **SID-Set**, and **SynthScars**; real photos from **ImageNet** and **COCO**.
- **Auto-labeling** — **Qwen2.5-VL** annotates every image with a domain tag, text/person flags, and a 0–2 score + evidence per criterion.
- **Real images** get all-zero scores and a "no artifacts" note — turning a pile of unlabeled images into a fully supervised set.

### 2 · A 3-step training curriculum

A general VLM doesn't know what AI artifacts look like, so we taught **Qwen2-VL-2B** in stages with **LoRA+** *(LoRA, DoRA and PiSSA were also tried; the 7B model overfit, so 2B won)*:

- **Step 0 — learn to *analyze.*** Free-form "real or fake, and why" reasoning, so the model learns to *see* artifacts.
- **Step 1 — learn the *format.*** Compress that reasoning into the contest's compact template (~300 tokens) — token budget is part of the speed gate.
- **Step 2 — learn the *JSON.*** Emit valid structured output, with a consistency rule so any fake-criterion forces an `AI-Generated` verdict.

The trained adapter is then **merged** into the base model to give a single deployable network.

### 3 · Quantization & deployment

- Quantize the merged model with **AIMET (W4A16)** — both vision encoder and language model.
- Export through **ONNX → QNN binary** for the Snapdragon NPU.
- Match **calibration data** to the real inference distribution; a mismatch quietly wrecks quantized accuracy.

<hr>

## Results

<div class="row text-center g-3 my-3">
  <div class="col-6 col-md-3">
    <div class="card h-100 p-3"><h3 class="mb-0">2nd</h3><small class="text-muted">of all teams</small></div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card h-100 p-3"><h3 class="mb-0">0.72</h3><small class="text-muted">challenge score</small></div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card h-100 p-3"><h3 class="mb-0">31.2</h3><small class="text-muted">tokens/s · 2× the floor</small></div>
  </div>
  <div class="col-6 col-md-3">
    <div class="card h-100 p-3"><h3 class="mb-0">2.6 GB</h3><small class="text-muted">QNN binary</small></div>
  </div>
</div>

{% include figure.liquid loading="lazy" path="assets/img/projects/lpcv_leaderboard.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Official LPCVC 2026 leaderboard — SSUPER_POWER placed 2nd in Track 3, behind OptimAI (KETI) and ahead of teams from UC Irvine and Clemson." %}

<hr>

## Team

**Team SSUPER_POWER** — VIP Lab, Soongsil University:

- **Dayoung Kil**
- Doeon Kim
- Junyoon Lee

<hr>

## Tech stack

<p>
  <span class="badge rounded-pill bg-light text-dark border me-1">Qwen2.5-VL-7B</span>
  <span class="badge rounded-pill bg-light text-dark border me-1">Qwen2-VL-2B</span>
  <span class="badge rounded-pill bg-light text-dark border me-1">LoRA+ / DoRA / PiSSA</span>
  <span class="badge rounded-pill bg-light text-dark border me-1">PyTorch 2.10</span>
  <span class="badge rounded-pill bg-light text-dark border me-1">LLaMA-Factory 0.9.1</span>
  <span class="badge rounded-pill bg-light text-dark border me-1">AIMET Pro 1.34 (W4A16)</span>
  <span class="badge rounded-pill bg-light text-dark border me-1">QAIRT 2.31 · QNN</span>
</p>
<p class="text-muted">
  Datasets: GenImage (ADM · BigGAN) · SID-Set · SynthScars · ImageNet · COCO · ARForensics.<br>
  <i class="fa-solid fa-scale-balanced me-1"></i> Code released under the MIT License.
</p>
