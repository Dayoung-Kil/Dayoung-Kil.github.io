---
layout: page
title: AI-Generated Image Detection on Edge
description: "2026 · 🥈 LPCVC Track 3, 2nd Place — an on-device vision-language model that detects AI-generated images and explains why."
img: assets/img/projects/lpcv_challenge.png
importance: 1
category: 2026
type: award
github: https://github.com/LPCV-SSUPER-POWER/Track3-AI-Generated-Images-Detection
_styles: >
  .post article strong { color: #6e85b7; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#e8c468;color:#1c1c1d">🥈 2nd Place</span>
  <span class="badge rounded-pill me-1" style="background-color:#4d5f8c;color:#fff">LPCVC 2026 · Track 3</span>
  <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">On-device · Snapdragon 8 Elite</span>
</div>
<p class="text-muted">ECV Workshop @ CVPR 2026, Denver &middot; Sponsored by Qualcomm</p>

<div class="p-4 my-3 rounded" style="background-color: rgba(110,133,183,0.08); border-left: 4px solid #6e85b7;">
  <p class="lead mb-2" style="font-weight:700">Can a phone tell a real photo from an AI-generated one — and <em>explain its reasoning</em>?</p>
  <p class="mb-0">Our entry in the 2026 IEEE Low-Power Computer Vision Challenge does both, fully on-device, under the contest's strict latency and power budgets.</p>
</div>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://github.com/LPCV-SSUPER-POWER/Track3-AI-Generated-Images-Detection" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github me-1"></i> View code on GitHub</a>
  <a class="btn btn-sm btn-outline-dark" href="https://huggingface.co/Dayoung-space/SSUPER-AIGID" target="_blank" rel="noopener noreferrer">🤗 Model weights</a>
</p>

<hr>

## The challenge

{% include figure.liquid loading="lazy" path="assets/img/projects/lpcv_challenge.png" class="img-fluid rounded z-depth-1" zoomable=true caption="2026 IEEE Low-Power Computer Vision Challenge — Track 3: AI Generated Images Detection." %}

Track 3 goes beyond a yes/no classifier: the model has to **decide *and* justify**.

> Saying "fake" isn't enough — the model has to point to **what** gives it away.

Every prediction therefore has two parts:

- **Detection** — is the image *Real* or *AI-Generated*?
- **Explanation** — a score and written evidence for each of **8 forensic criteria**:

<div class="row g-2 my-3">
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center"><small>Lighting &amp; Shadows</small></div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center"><small>Edges &amp; Boundaries</small></div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center"><small>Texture &amp; Resolution</small></div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center"><small>Perspective &amp; Space</small></div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center"><small>Physical / Common-Sense</small></div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center"><small>Text &amp; Symbols</small></div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center"><small>Human / Biological</small></div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center"><small>Material &amp; Object Detail</small></div></div>
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

The system comes together in three parts: building a **labeled dataset**, a **staged training curriculum**, and **on-device quantization & deployment**.

### 1 · Data & annotation

Almost none of the source images came with the 8-criteria labels the task needs — so we generated them ourselves, using **Qwen2.5-VL-7B** as a teacher model. **89,263 images** in all, balanced ~50 : 50 real / fake.

<div class="row g-3 my-3">
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <h6 class="mb-2" style="color:#6e85b7">AI-generated sources</h6>
      <p class="mb-0 text-muted">ARForensics <em>(Infinity · Janus-Pro · LlamaGen · RAR · …)</em> · GenImage <em>(ADM · BigGAN)</em> · SID-Set · SynthScars</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <h6 class="mb-2" style="color:#6e85b7">Real sources</h6>
      <p class="mb-0 text-muted">ImageNet · COCO train2017 · SID-Set <em>(real split)</em></p>
    </div>
  </div>
</div>

#### Auto-labeling — 4 questions per image

Instead of one yes/no call, we ask the teacher **three vision passes**, each scanning a slice of the 8 criteria, then **fuse them into JSON** in a final text-only pass.

<div class="row g-2 my-3">
  <div class="col-md-4"><div class="card h-100 p-3"><strong>Q1 · Vision</strong><br><small class="text-muted">edges · texture · material</small></div></div>
  <div class="col-md-4"><div class="card h-100 p-3"><strong>Q2 · Vision</strong><br><small class="text-muted">physics · text · human</small></div></div>
  <div class="col-md-4"><div class="card h-100 p-3"><strong>Q3 · Vision</strong><br><small class="text-muted">lighting · perspective</small></div></div>
</div>

<div class="card p-3 my-2" style="border-left:4px solid #6e85b7;">
  <strong>Q4 · Text-only synthesis</strong> — fold Q1–Q3 into one structured JSON: an <code>aigc score</code> + written <code>evidence</code> per criterion, plus an overall <code>Real / AI-Generated</code> verdict.
</div>

<p class="text-muted small mt-2">Fake images get a one-line hint prepended so the model looks for artifacts; real images come out all-zero with "looks authentic" evidence — yielding a fully supervised set.</p>

Each image becomes one annotation JSON *(8 criteria shown trimmed to 3)*:

```json
{
  "per_criterion": [
    { "criterion": "Lighting & Shadows Consistency",
      "evidence": "Lighting is consistent throughout; no abrupt brightness or shadow changes.",
      "aigc score": 0 },
    { "criterion": "Physical & Common Sense Logic",
      "evidence": "The fish has an unusual shape and size; the person's features look exaggerated.",
      "aigc score": 1 },
    { "criterion": "Human & Biological Structure Integrity",
      "evidence": "Unrealistic proportions and facial features; fish anatomy is inconsistent.",
      "aigc score": 1 }
    // … 8 criteria total
  ],
  "overall_likelihood": "AI-Generated"
}
```

### 2 · A staged LoRA training chain

A general VLM doesn't know what AI artifacts look like, so we adapt **Qwen2-VL-2B** over **four LoRA phases**. Each phase trains an adapter, then **merges** it into the base before the next starts — so skills stack into one deployable network *(LoRA+ won out over LoRA / DoRA / PiSSA; the 7B model overfit, so 2B won)*.

<div class="row g-3 my-3">
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <h6 class="mb-1"><span class="badge rounded-pill me-1" style="background-color:#6e85b7;color:#fff">P1</span> Detect</h6>
      <p class="mb-2 small">Emit the per-criterion + overall verdict from a single prompt.</p>
      <p class="mb-0"><code>token CE + 2.0 × BCE</code><br><small class="text-muted">aux real/fake head on vision features</small></p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <h6 class="mb-1"><span class="badge rounded-pill me-1" style="background-color:#6e85b7;color:#fff">P2</span> Stay consistent</h6>
      <p class="mb-2 small">Multi-prompt robustness (4 phrasings/image), scores tied to the written answer.</p>
      <p class="mb-0"><code>token CE + 0.1 × overall BCE + 0.05 × criterion BCE</code></p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <h6 class="mb-1"><span class="badge rounded-pill me-1" style="background-color:#6e85b7;color:#fff">P3</span> Explain</h6>
      <p class="mb-2 small">Image → free-form written <strong>evidence</strong> for each criterion.</p>
      <p class="mb-0"><code>standard SFT token CE</code></p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <h6 class="mb-1"><span class="badge rounded-pill me-1" style="background-color:#6e85b7;color:#fff">P4</span> Format</h6>
      <p class="mb-2 small">Text-only → one valid <strong>JSON</strong>; any fake criterion forces an <code>AI-Generated</code> verdict.</p>
      <p class="mb-0"><code>standard SFT token CE</code></p>
    </div>
  </div>
</div>

<div class="p-3 my-3 rounded" style="background-color: rgba(110,133,183,0.08); border-left: 4px solid #6e85b7;">
  <p class="mb-2"><strong>Vision tower</strong> — unfrozen <strong>only in P1</strong>, so the ViT itself learns to see artifacts; frozen for P2–P4. The auxiliary heads (P1, P2) are dropped after training — only the LoRA delta is merged.</p>
  <p class="mb-0"><strong>P4 runs in two passes</strong> — a warmup (lr 5e-5) then a low-lr final (lr 1e-5) to lock the JSON format without overfitting. The merged P4 model is what ships to quantization.</p>
</div>

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
