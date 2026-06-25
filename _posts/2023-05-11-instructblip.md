---
layout: post
title: "[InstructBLIP] Towards General-purpose Vision-Language Models with Instruction Tuning"
date: 2023-05-11
description: "Instruction-tunes BLIP-2 on 26 datasets, and makes the Q-Former instruction-aware — feeding the instruction to the Q-Former so it extracts visual features tailored to the task."
thumbnail: assets/img/notes/instructblip/fig3.png
categories: vlm
tags: vlm
shortname: InstructBLIP
generation: G3
venue: NeurIPS 2023
giscus_comments: false
related_posts: false
toc:
  sidebar: right
_styles: >
  .post-title { font-size: 1.6rem; line-height: 1.35; }
  .post-content { font-size: 0.92rem; line-height: 1.75; }
  .post-content h2 { font-size: 1.25rem; margin-top: 1.8rem; }
  .post-content h3 { font-size: 1.02rem; }
  .post-content blockquote { border-left-color: #787bb3; }
  .post-content table { font-size: 0.8rem; }
  .post-content figure { max-width: 620px; margin-left: auto; margin-right: auto; }
  .post-content .tr-callout { background-color: rgba(120,123,179,0.08); border-left: 4px solid #787bb3; }
  .post-content .tr-callout p { margin-bottom: 0; }
  .post-content .ib-card .card { border-left: 4px solid #787bb3; }
  .post-content .ib-card .card-title { font-size: 0.95rem; font-weight: 700; }
  .post-content .ib-card .card-text { font-size: 0.82rem; line-height: 1.6; }
---

<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#787bb3;color:#fff">VLM</span>
  <span class="badge rounded-pill me-1" style="background-color:#787bb3;color:#fff">G3</span>
  <span class="badge rounded-pill" style="background-color:#787bb3;color:#fff">NeurIPS 2023</span>
</div>
<p class="text-muted mb-3">Wenliang Dai, Junnan Li, Dongxu Li, … Steven Hoi · Salesforce Research</p>

<p>
  <a class="btn btn-sm btn-outline-dark me-1" href="https://arxiv.org/abs/2305.06500" target="_blank" rel="noopener noreferrer">arXiv</a>
  <a class="btn btn-sm btn-outline-dark" href="https://github.com/salesforce/LAVIS/tree/main/projects/instructblip" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github me-1"></i> GitHub</a>
</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> <a href="{% post_url 2023-01-30-blip2 %}">BLIP-2</a>를 <strong>instruction tuning</strong>한 후속. 두 가지가 핵심 — ① <strong>26개 공개 데이터셋을 instruction 형식으로 변환</strong>해 13개(held-in)로 튜닝, 13개(held-out)로 zero-shot 평가. ② <strong>instruction-aware Q-Former</strong>: 지시문을 LLM뿐 아니라 <strong>Q-Former에도 입력</strong>해, 그 지시에 <strong>맞춤화된 시각 특징</strong>을 뽑게 한다(BLIP-2는 지시와 무관한 고정 특징). 이미지 인코더·LLM은 freeze, <strong>Q-Former만</strong> 학습. 그 결과 held-out 13개 전부 <strong>zero-shot SOTA</strong>, BLIP-2와 더 큰 Flamingo도 능가.</p>
</div>

## 배경

NLP에선 **instruction tuning**(다양한 task를 자연어 지시로 fine-tune)이 범용 모델을 만드는 길을 열었다. 그런데 **비전-언어 instruction tuning은 덜 탐구**됐다.

- [BLIP-2]({% post_url 2023-01-30-blip2 %})는 frozen LLM에 시각을 붙여 지시를 *어느 정도* 따랐지만, **본격적 instruction tuning은 아니었다.**
- 핵심 난점: 시각 입력 때문에 **입력 분포·task 다양성**이 훨씬 크다 → 일반화가 어렵다.

> BLIP-2를 토대로, **많은 task를 instruction 형식으로** 학습시키고, **시각 특징도 지시에 맞게** 뽑게 하면 일반화가 좋아지지 않을까?

{% include figure.liquid loading="lazy" path="assets/img/notes/instructblip/fig2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 2. instruction tuning에 쓴 task·데이터셋. 11개 task 범주, 26개 데이터셋 — 노랑=held-in(학습), 흰색=held-out(zero-shot 평가). 4개 task 범주는 통째로 held-out." %}

## 핵심 ① — Instruction-aware Q-Former

가장 중요한 변경점. **"지시를 보고 시각 특징을 맞춤 추출"** 한다.

<div class="row g-3 my-3 ib-card">
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <div class="card-title">이전 (BLIP-2) — instruction-agnostic</div>
      <p class="card-text mb-0">Q-Former가 <strong>무슨 지시인지 모른 채</strong> 항상 <strong>똑같은(static) 시각 특징</strong>을 뽑아 LLM에 넘김. 지시문은 LLM에만. → 같은 이미지에 "개 품종?" vs "배경 색?"이 와도 같은 특징만.</p>
    </div>
  </div>
  <div class="col-md-6">
    <div class="card h-100 p-3">
      <div class="card-title">InstructBLIP — instruction-aware</div>
      <p class="card-text mb-0">지시문을 <strong>Q-Former에도 입력</strong> → learnable query가 지시문과 self-attention으로 상호작용해 <strong>지시에 맞춤화된 시각 특징</strong>을 추출(어디를 볼지 지시에 따라 바뀜).</p>
    </div>
  </div>
</div>

{% include figure.liquid loading="eager" path="assets/img/notes/instructblip/fig3.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 3. InstructBLIP 구조. BLIP-2처럼 frozen 이미지 인코더 + Q-Former + frozen LLM이지만, instruction을 LLM뿐 아니라 Q-Former에도 넣어 instruction-aware 시각 특징을 뽑는다. 학습은 Q-Former만." %}

- **효과** — 지시에 맞는 정보를 뽑으니, 같은 이미지에 다양한 지시가 와도 유연하게 대응 → **zero-shot 일반화 대폭 향상.**

## 핵심 ② — 26개 데이터셋 instruction tuning

- **데이터** — 캡셔닝·VQA·지식 VQA·OCR·시각 추론·비디오 QA·대화 QA·분류 등 **11개 task 범주, 26개 데이터셋**을 instruction 형식으로 변환(각 task마다 10~15개 지시 템플릿). LLaVA-Instruct-150K도 포함.
- **분할** — **13 held-in**(학습) / **13 held-out**(zero-shot), 게다가 **4개 task 범주는 통째로 held-out** → "안 본 task" 일반화까지 평가.
- **학습** — 이미지 인코더·LLM은 freeze, **Q-Former만** language modeling loss로 튜닝. dataset 간 **balanced sampling**으로 학습 속도 동기화.
- **두 LLM 계열** — Flan-T5(encoder-decoder)·Vicuna(decoder).

## 결과

{% include figure.liquid loading="lazy" path="assets/img/notes/instructblip/table1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Table 1. held-out zero-shot 비교. InstructBLIP이 13개 held-out 전부에서 BLIP-2와 (훨씬 큰) Flamingo를 능가하며 SOTA." %}

- **zero-shot SOTA** — 13개 held-out 전부에서 **BLIP-2와 더 큰 Flamingo를 큰 폭으로 능가.**
- **finetune SOTA** — 개별 downstream에 미세조정 시에도 최고(예: **ScienceQA(이미지) 90.7%**).
- **정성** — 복잡한 장면 이해·추론, 지식 기반 묘사, 다중 턴 대화 등.

{% include figure.liquid loading="lazy" path="assets/img/notes/instructblip/fig1.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 1. InstructBLIP(Vicuna) 예시 — 복잡한 시각 추론, 지식 기반 묘사, 다중 턴 시각 대화 등 다양한 능력." %}

## 한 줄 정리 & 의의

- **BLIP-2의 instruction-tuned 후속.** 두 축 — ① **instruction-aware Q-Former**(지시를 Q-Former에도 줘 맞춤 시각 특징), ② **26개 학술 데이터 instruction tuning** + held-in/held-out 설계.
- **차별점.** [BLIP-2]({% post_url 2023-01-30-blip2 %})는 "지시와 무관한 고정 시각 특징"이었는데, InstructBLIP은 **"지시를 보고 시각 특징을 바꾼다."** [LLaVA]({% post_url 2023-04-17-llava %})가 raw CLIP + GPT-4 데이터로 LLM까지 튜닝했다면, InstructBLIP은 **Q-Former만 instruction-aware하게** 튜닝.
- **위치.** G3(Visual Instruction Tuning) 세대의 "Q-Former 노선" — BLIP-2 → InstructBLIP. → [VLM 개요]({% post_url 2026-06-22-vlm-overview %})
