---
layout: post
title: "VLM — Overview"
date: 2026-06-22
description: How vision-language / multimodal LLMs are built — the 5-component architecture (encoder · projector · LLM · output projector · generator), the understanding-vs-generation taxonomy, and key models from Flamingo to Qwen2.5-VL.
thumbnail: assets/img/notes/vlm-overview/teaser.png
categories: vlm
tags: survey
shortname: Overview
venue: Survey
giscus_comments: false
related_posts: false
toc:
  sidebar: left
_styles: >
  .post-title { font-size: 1.8rem; }
  .post-content { font-size: 0.92rem; line-height: 1.75; }
  .post-content h2 { font-size: 1.3rem; margin-top: 1.8rem; }
  .post-content h3 { font-size: 1.05rem; }
  .post-content table { font-size: 0.8rem; }
  .post-content .vlm-comp .card-title { font-size: 0.95rem; font-weight: 700; }
  .post-content .vlm-comp .card-text { font-size: 0.82rem; line-height: 1.6; }
  .post-content .vlm-comp .card { border-left: 4px solid #5d5c98; }
  .post-content .vlm-tax .card-title { font-size: 0.95rem; font-weight: 700; }
  .post-content .vlm-tax .card-text { font-size: 0.82rem; line-height: 1.6; }
  .post-content .vlm-insights .card-title { font-size: 0.95rem; color: #5d5c98; font-weight: 700; }
  .post-content .vlm-insights .card-text { font-size: 0.83rem; line-height: 1.6; }
  .post-content .vlm-models table { font-size: 0.72rem; }
  .post-content .vlm-models th, .post-content .vlm-models td { line-height: 1.4; vertical-align: middle; padding: 0.35rem 0.5rem; }
  .post-content .vlm-models tbody tr:nth-child(odd) { background-color: rgba(93,92,152,0.05); }
  .post-content .tr-callout { background-color: rgba(93,92,152,0.08); border-left: 4px solid #5d5c98; }
  .post-content .tr-callout p { margin-bottom: 0; }
  .post-content blockquote { font-size: 0.9rem; }
---

<div class="mb-2">
  <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">Survey</span>
</div>
<p class="text-muted mb-3">참고: Zhang et al., "MM-LLMs: Recent Advances in Multimodal Large Language Models." ACL 2024 (+ Flamingo·BLIP-2·LLaVA·Qwen2.5-VL)</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> VLM(넓게는 멀티모달 LLM)은 <strong>이미 잘 학습된 단일 모달 foundation 모델</strong>(특히 LLM)을 그대로 가져와, 다른 모달리티(이미지·비디오·오디오)를 <strong>LLM이 알아듣는 토큰 공간으로 정렬(connector)</strong> 해 붙인 모델이다. 처음부터 학습하지 않으니 싸고, LLM의 추론·ICL·instruction following 능력을 물려받는다. 구조는 <strong>5개 부품</strong>(Modality Encoder → Input Projector → LLM Backbone → Output Projector → Modality Generator)으로 일반화되며, <strong>이해(understanding)</strong> 만 하면 앞 3개, <strong>생성(generation)</strong> 까지 하면 5개를 쓴다. 보통 <strong>encoder·LLM·generator는 freeze</strong>하고 가벼운 projector만 학습해 학습 파라미터가 전체의 약 2%뿐이다.</p>
</div>

{% include figure.liquid loading="eager" path="assets/img/notes/vlm-overview/teaser.png" class="img-fluid rounded z-depth-1" zoomable=true caption="VLM 한눈에 보기 — Modality Encoder → Adapter(Connector) → LLM Backbone → (Adapter → Generator)의 5단계 파이프라인과 부품별 선택지, 그리고 이해(Understanding)·생성(Generation) 분기. (직접 정리)" %}

## VLM이란?

멀티모달 모델을 처음부터(from scratch) 학습하면 비용이 폭발한다. 그래서 **이미 강력한 단일 모달 모델을 재활용**하는 흐름이 등장했다 — 특히 **LLM을 "인지 엔진(cognitive engine)"** 으로 두고, 비전·오디오 등 다른 모달리티의 사전학습 인코더를 거기에 연결한다.

- **왜 LLM 중심인가** — LLM은 강한 언어 생성, zero-shot 전이, In-Context Learning(ICL), CoT, instruction following을 이미 갖췄다. 이걸 버리지 않고 그대로 쓴다.
- **핵심 난제** — 서로 따로 사전학습된 모달리티 모델들을 **어떻게 연결(align)해 함께 추론**하게 하느냐. 그래서 대부분의 연구가 **모달리티 정렬 + 사람 의도 정렬(MM PT + MM IT)** 에 집중한다.

> 즉 VLM은 "새 모델을 만든다"기보다 **"freeze된 비전 인코더와 freeze된 LLM 사이에 얇은 다리(connector)를 학습으로 놓는다"** 에 가깝다.

## 5개 구성요소 (general architecture)

VLM 구조는 5개 부품으로 일반화된다. **이해만** 하는 모델은 앞 3개(Encoder·Projector·LLM)만, **생성까지** 하는 모델은 뒤 2개(Output Projector·Generator)를 더 붙인다.

{% include figure.liquid loading="lazy" path="assets/img/notes/vlm-overview/fig2.png" class="img-fluid rounded z-depth-1" zoomable=true caption="Figure 2 (Zhang et al., ACL 2024). VLM의 일반 구조와 부품별 구현 선택지. 왼쪽 3개(Encoder→Input Projector→LLM)가 Multimodal Understanding, 오른쪽 2개(Output Projector→Generator)를 더하면 Multimodal Generation. 눈송이=freeze, 불꽃=학습." %}

<div class="vlm-comp">
  <div class="row row-cols-1 row-cols-md-2">
    <div class="col mb-3">
      <div class="card h-100"><div class="card-body">
        <h6 class="card-title">① Modality Encoder (ME)</h6>
        <p class="card-text mb-1">이미지/비디오/오디오를 각 도메인 인코더로 <strong>특징 $F_X$</strong> 로 변환. 보통 <strong>freeze</strong>.</p>
        <p class="card-text mb-0 text-muted">예: CLIP ViT, EVA-CLIP ViT, NFNet-F6 (비전) · HuBERT, BEATs, C-Former (오디오) · ImageBind (통합)</p>
      </div></div>
    </div>
    <div class="col mb-3">
      <div class="card h-100"><div class="card-body">
        <h6 class="card-title">② Input Projector (Connector) $\Theta_{X\to T}$</h6>
        <p class="card-text mb-1">$F_X$ 를 <strong>LLM의 텍스트 토큰 공간으로 정렬</strong>해 prompt $P_X$ 로 만든다. <strong>학습 대상</strong>(가벼움).</p>
        <p class="card-text mb-0 text-muted">예: Linear / MLP · Cross-attention(Perceiver Resampler) · Q-Former · P-Former · MQ-Former</p>
      </div></div>
    </div>
    <div class="col mb-3">
      <div class="card h-100"><div class="card-body">
        <h6 class="card-title">③ LLM Backbone</h6>
        <p class="card-text mb-1">정렬된 멀티모달 표현 + 텍스트를 받아 <strong>이해·추론·생성</strong>. 보통 <strong>freeze</strong>(또는 LoRA 등 PEFT). 출력은 텍스트 $t$, 그리고 (생성 시) <strong>신호 토큰 $S_X$</strong>.</p>
        <p class="card-text mb-0 text-muted">예: LLaMA/LLaMA-2, Vicuna, Flan-T5, Qwen, OPT, PaLM, Chinchilla, ChatGLM</p>
      </div></div>
    </div>
    <div class="col mb-3">
      <div class="card h-100"><div class="card-body">
        <h6 class="card-title">④ Output Projector $\Theta_{T\to X}$ <span class="badge rounded-pill" style="background-color:#9a99c0;color:#fff;font-size:0.6rem;vertical-align:middle">생성 전용</span></h6>
        <p class="card-text mb-1">LLM의 신호 토큰 $S_X$ 를 <strong>생성기가 알아듣는 조건 특징 $H_X$</strong> 로 매핑. <strong>학습 대상</strong>.</p>
        <p class="card-text mb-0 text-muted">예: Tiny Transformer · MLP</p>
      </div></div>
    </div>
    <div class="col mb-3">
      <div class="card h-100"><div class="card-body">
        <h6 class="card-title">⑤ Modality Generator (MG) <span class="badge rounded-pill" style="background-color:#9a99c0;color:#fff;font-size:0.6rem;vertical-align:middle">생성 전용</span></h6>
        <p class="card-text mb-1">$H_X$ 를 조건으로 <strong>off-the-shelf 생성기</strong>가 최종 산출물을 만든다. 보통 <strong>freeze</strong>.</p>
        <p class="card-text mb-0 text-muted">예: Stable Diffusion(이미지) · Zeroscope(비디오) · AudioLDM(오디오)</p>
      </div></div>
    </div>
  </div>
</div>

> **학습 비중이 작다.** encoder·LLM·generator를 freeze하고 **projector만** 학습하므로, 학습 파라미터가 전체의 **약 2%**(PEFT까지 쓰면 0.1% 미만)에 불과하다. 그래서 적은 비용으로 다양한 MM task를 켤 수 있다.

## 무엇을 입출력하나 — Understanding vs Generation

모달리티 표기: **I**=Image, **V**=Video, **A/S**=Audio/Speech, **T**=Text. `+`=입력(또는 출력)에 모달리티가 복수, `→`=입력→출력 변환 방향.

<div class="vlm-tax">
  <div class="row row-cols-1 row-cols-md-2">
    <div class="col mb-3">
      <div class="card h-100" style="border-top:3px solid #4d5f8c"><div class="card-body">
        <h6 class="card-title">Multimodal Understanding</h6>
        <p class="card-text mb-2">멀티모달 입력 → <strong>"의미·판단·설명"</strong>(대개 텍스트 결과). 앞 3개 부품만 사용.</p>
        <p class="card-text mb-1"><strong>I+T→T</strong> (이미지 이해/VQA/대화): BLIP-2, LLaVA, MiniGPT-4, Kosmos-1, PaLM-E, Qwen-VL</p>
        <p class="card-text mb-1"><strong>V+T→T</strong> (비디오 이해): VideoChat, Video-ChatGPT</p>
        <p class="card-text mb-1"><strong>A+T→T</strong> (오디오/음성 이해): SALMONN, Qwen-Audio</p>
        <p class="card-text mb-0"><strong>Many→T</strong> (다중 모달 입력→텍스트): Flamingo, InstructBLIP, Video-LLaMA, AnyMAL</p>
      </div></div>
    </div>
    <div class="col mb-3">
      <div class="card h-100" style="border-top:3px solid #c0566e"><div class="card-body">
        <h6 class="card-title">Multimodal Generation</h6>
        <p class="card-text mb-2">조건(텍스트 등) → <strong>"새 미디어 합성"</strong>(이미지·비디오·오디오 결과). 5개 부품 모두 사용.</p>
        <p class="card-text mb-1"><strong>I+T→I+T</strong> (이미지 생성 포함): GILL, Emu-2, DreamLLM, MiniGPT-5, Visual ChatGPT</p>
        <p class="card-text mb-1"><strong>V+T→V+T</strong>: Video-LaVIT</p>
        <p class="card-text mb-1"><strong>A/S+T→A/S+T</strong>: SpeechGPT, AudioPaLM</p>
        <p class="card-text mb-0"><strong>Many→Many</strong> (any-to-any): NExT-GPT, CoDi-2, GPT-4, Gemini, HuggingGPT</p>
      </div></div>
    </div>
  </div>
</div>

## 학습 파이프라인 (MM PT → MM IT)

freeze된 텍스트 전용 LLM을 멀티모달로 키우는 과정은 두 단계다.

- **MM PT (Pre-Training)** — X-Text 데이터(이미지-텍스트 쌍, interleaved 코퍼스 등)로 **projector를 학습해 모달리티를 정렬**. 이해 모델은 입력 projector만, 생성 모델은 출력 projector·생성 손실까지 함께 최적화.
- **MM IT (Instruction-Tuning)** — instruction 형식 데이터로 fine-tune해 **새 지시에 일반화**(zero-shot↑). **SFT**(지도 미세조정) + **RLHF**(사람 피드백 강화학습)로 사람 의도와 대화 능력을 맞춘다.

## 대표 모델 한눈에

같은 5-부품 틀 위에서 **무엇을 connector로 쓰고, 어떻게 학습하느냐**가 모델을 가른다.

<div class="vlm-models" markdown="1">

| 모델 | I→O | Encoder | Connector | LLM | 학습 단계 |
| --- | --- | --- | --- | --- | --- |
| **Flamingo** <span class="text-muted">(NeurIPS 2022)</span> | I+V+T→T | NFNet-F6 | Cross-attention (Perceiver Resampler) + gated cross-attn | Chinchilla | 1단계: ViT·LLM freeze, resampler·gated cross-attn만 학습 |
| **BLIP-2** <span class="text-muted">(ICML 2023)</span> | I+T→T | CLIP / EVA-CLIP ViT | **Q-Former** (+ Linear) | Flan-T5 / OPT | 2단계: ①표현학습(인코더 freeze+Q-Former) ②생성학습(LLM freeze+Q-Former) |
| **LLaVA** <span class="text-muted">(NeurIPS 2023)</span> | I+T→T | CLIP ViT-L/14 | **Linear** projection | Vicuna 7B/13B | 2단계: ①정렬(인코더·LLM freeze, projection만) ②지시튜닝(projection+LLM) |
| **LLaVA-1.5** <span class="text-muted">(CVPR 2024)</span> | I+T→T | CLIP ViT-L@336 | **MLP** projection | Vicuna-1.5 7B/13B | LLaVA + MLP 커넥터·고해상도(336)·학술 VQA/포맷 프롬프트 데이터 |
| **Qwen2.5-VL** <span class="text-muted">(arXiv 2025)</span> | I+V+T→T | native dynamic-resolution ViT | MLP merger | Qwen2.5 | 4단계: 인코더 → V-L 정렬 → end-to-end 멀티모달 PT(비디오/에이전트) → SFT |

</div>

- **Connector의 진화** — Flamingo의 cross-attention, BLIP-2의 **Q-Former**(학습 query가 이미지 특징에서 텍스트에 유용한 정보만 압축 추출)처럼 복잡하던 것이, LLaVA에서 **단순 Linear/MLP**로도 충분함이 드러났다(VILA 등도 동일 결론).
- **Qwen2.5-VL** — 이미지·문서·장시간 비디오를 **네이티브 해상도/시간축 그대로** 다루도록 dynamic resolution·dynamic FPS + absolute time encoding을 도입하고, RMSNorm·SwiGLU·**M-RoPE**(멀티모달 회전 위치 임베딩)로 확장.

## 발전 흐름 & 다음 주제

<div class="vlm-insights">
  <div class="row row-cols-1 row-cols-md-2">
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">이해 → 생성 → any-to-any</h6>
      <p class="card-text mb-0">텍스트 결과만 내던 이해 모델에서 → 특정 모달 생성 → 임의 모달 변환으로(예: MiniGPT-4 → MiniGPT-5 → NExT-GPT).</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">PT → SFT → RLHF</h6>
      <p class="card-text mb-0">정렬만 하던 학습이 지시튜닝·사람 피드백으로 정교화(예: BLIP-2 → InstructBLIP → DRESS).</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">복잡한 connector → 단순 projector</h6>
      <p class="card-text mb-0">Q-/P-Former 같은 무거운 모듈에서 → 단순 linear/MLP로도 강력(BLIP-2·DLP → LLaVA·VILA).</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">고해상도 & 경량 배포</h6>
      <p class="card-text mb-0">디테일을 위해 해상도↑(336·448), 동시에 모바일/엣지용 경량화(MobileVLM 등)도 활발.</p>
    </div></div></div>
  </div>
</div>

> **다음 주제 — Efficient / Lightweight VLM.** VLM은 시각 토큰이 텍스트보다 훨씬 많아(예: LLaVA 576개) LLM 입력이 길어지고 연산이 제곱으로 폭증한다. 그래서 **시각 토큰을 줄이는** 흐름(SparseVLM·IVTP·VLTP·Recoverable Compression 등)이 나온다 — [Token Reduction in ViTs]({% post_url 2026-06-19-token-reduction-overview %})를 **텍스트(질문)까지 고려하는 멀티모달 버전**으로 확장한 것이다. 별도 카테고리로 정리 예정.
