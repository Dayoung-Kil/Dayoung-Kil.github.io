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
  sidebar: right
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
  .post-content .vlm-models table { font-size: 0.8rem; width: 100%; }
  .post-content .vlm-models th, .post-content .vlm-models td { font-size: 0.8rem; line-height: 1.4; vertical-align: middle; padding: 0.35rem 0.5rem; }
  .post-content .vlm-models tbody tr:nth-child(odd) { background-color: rgba(93,92,152,0.05); }
  .post-content .vlm-models tr.gen td { background-color: rgba(38,152,186,0.12); color:#1c1c1d; font-weight: 700; font-size: 0.76rem; border-top: 2px solid #2698ba; padding: 0.3rem 0.5rem; }
  .post-content .vlm-bench table { font-size: 0.72rem; }
  .post-content .vlm-bench th, .post-content .vlm-bench td { font-size: 0.7rem; line-height: 1.4; vertical-align: top; padding: 0.3rem 0.45rem; }
  .post-content .vlm-bench tbody tr:nth-child(odd) { background-color: rgba(93,92,152,0.05); }
  .post-content .vlm-adapt table { font-size: 0.72rem; }
  .post-content .vlm-adapt th, .post-content .vlm-adapt td { font-size: 0.72rem; line-height: 1.45; padding: 0.3rem 0.45rem; vertical-align: top; }
  .post-content .vlm-bench td:first-child { white-space: nowrap; font-weight: 700; }
  .post-content .tr-callout { background-color: rgba(93,92,152,0.08); border-left: 4px solid #5d5c98; }
  .post-content .tr-callout p { margin-bottom: 0; }
  .post-content blockquote { font-size: 0.9rem; }
---

<div class="mb-2">
  <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">Survey</span>
</div>
<p class="text-muted mb-3">참고: Zhang et al., "MM-LLMs: Recent Advances in Multimodal Large Language Models." ACL 2024 (+ Flamingo·BLIP-2·LLaVA·Qwen2.5-VL)</p>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> VLM(넓게는 멀티모달 LLM)은 <strong>새 모델을 처음부터 만들지 않는다.</strong> 이미 잘 학습된 <strong>비전 인코더와 LLM을 그대로(freeze) 가져와</strong>, 그 사이에 <strong>얇은 connector만 학습</strong>해 이미지·비디오·오디오를 LLM이 알아듣는 토큰으로 정렬한다. 그래서 싸게 만들면서 LLM의 추론·ICL·instruction-following 능력을 물려받는다. 이 노트는 그 구조를 <strong>5개 부품</strong>으로 정리하고, 입출력 분류·학습 방식·대표 모델(Flamingo → BLIP-2 → LLaVA → …)이 어떻게 갈라지는지 따라간다.</p>
</div>

{% include figure.liquid loading="eager" path="assets/img/notes/vlm-overview/teaser.png" class="img-fluid rounded z-depth-1" zoomable=true caption="VLM 한눈에 보기 — Modality Encoder → Adapter(Connector) → LLM Backbone → (Adapter → Generator)의 5단계 파이프라인과 부품별 선택지, 그리고 이해(Understanding)·생성(Generation) 분기." %}

## VLM이란?

조금 더 풀어보자. 핵심은 **LLM을 "인지 엔진(cognitive engine)"** 으로 두는 것이다 — 비전·오디오 등 다른 모달리티의 사전학습 인코더를 LLM에 연결해, **추론·판단은 LLM이 맡게** 한다.

- **왜 LLM 중심인가** — LLM은 강한 언어 생성, zero-shot 전이, In-Context Learning(ICL), CoT, instruction following을 이미 갖췄다. 처음부터 다시 배우는 대신 이걸 그대로 물려받는다.

<div class="tr-callout p-3 my-3 rounded">
  <p class="mb-2"><strong>물려받는 핵심 능력 3가지</strong></p>
  <ul class="mb-0">
    <li><strong>추론(Reasoning)</strong> — 여러 단계를 거쳐 논리적 결론을 도출(예: CoT, "단계별로 생각"). VLM에선 이미지+상식을 결합해 답을 유도.</li>
    <li><strong>ICL(In-Context Learning)</strong> — <strong>재학습 없이</strong> 프롬프트 속 예시 몇 개만 보고 추론 시점에 즉석으로 task를 학습(few-/zero-shot).</li>
    <li><strong>Instruction following</strong> — 자연어 지시를 이해·수행하고 <strong>새 지시에도 일반화</strong>. Instruction Tuning(SFT+RLHF)으로 사람 의도에 정렬.</li>
  </ul>
</div>

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

## 관련 논문 한눈에 보기

먼저 **태그(부품·유형)별로**, 풀 모델인 **VLM**은 다시 **세대(G1→G4)별**로 본다.

### <span class="badge rounded-pill" style="background-color:#3a7ca5;color:#fff;font-size:0.9rem">Modality Encoder</span>

<div class="vlm-models" markdown="1">

| 모델 | 핵심 |
| --- | --- |
| [**CLIP**]({% post_url 2021-02-26-clip %}) <span class="text-muted">(ICML 2021)</span> | 이미지-텍스트 **contrastive**(웹 4억 쌍), open-vocab **zero-shot**. 대부분 VLM이 freeze해 쓰는 **①번 부품** |

</div>

### <span class="badge rounded-pill" style="background-color:#2698ba;color:#fff;font-size:0.9rem">VLM</span> <span class="text-muted" style="font-size:0.9rem;font-weight:400">풀 멀티모달 모델</span>

<div class="row g-2 my-3 vlm-gen">
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center">
    <div><span class="badge rounded-pill" style="background-color:#2698ba;color:#fff">G1</span></div>
    <div class="mt-1" style="font-weight:700;font-size:0.82rem">Foundations</div>
    <small class="text-muted" style="font-size:0.72rem">LLM 이전 · 통합 VL</small>
  </div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center">
    <div><span class="badge rounded-pill" style="background-color:#2698ba;color:#fff">G2</span></div>
    <div class="mt-1" style="font-weight:700;font-size:0.82rem">Frozen LLM + Connector</div>
    <small class="text-muted" style="font-size:0.72rem">frozen LLM에 다리 놓기</small>
  </div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center">
    <div><span class="badge rounded-pill" style="background-color:#2698ba;color:#fff">G3</span></div>
    <div class="mt-1" style="font-weight:700;font-size:0.82rem">Visual Instruction Tuning</div>
    <small class="text-muted" style="font-size:0.72rem">지시 따르는 어시스턴트</small>
  </div></div>
  <div class="col-6 col-md-3"><div class="card h-100 p-2 text-center">
    <div><span class="badge rounded-pill" style="background-color:#2698ba;color:#fff">G4</span></div>
    <div class="mt-1" style="font-weight:700;font-size:0.82rem">Native Multimodal</div>
    <small class="text-muted" style="font-size:0.72rem">네이티브 해상도·비디오</small>
  </div></div>
</div>

<div class="vlm-models">
<table>
<thead><tr><th>모델</th><th>Encoder</th><th>Connector</th><th>LLM</th><th>핵심</th></tr></thead>
<tbody>
<tr class="gen"><td colspan="5">G1 · Foundations <span class="text-muted">— LLM 이전</span></td></tr>
<tr><td><a href="{% post_url 2022-01-28-blip %}">BLIP</a> <span class="text-muted">'22</span></td><td>ViT-B/L</td><td>MED <span class="text-muted">(cross-attn 내장)</span></td><td>—</td><td>ITC·ITM·LM 통합 + <strong>CapFilt</strong></td></tr>
<tr class="gen"><td colspan="5">G2 · Frozen LLM + Connector <span class="text-muted">— 다리 놓기</span></td></tr>
<tr><td><a href="{% post_url 2022-04-29-flamingo %}">Flamingo</a> <span class="text-muted">'22</span></td><td>NFNet-F6</td><td><strong>Cross-attention</strong></td><td>Chinchilla</td><td>connector만 학습 → <strong>few-shot ICL</strong></td></tr>
<tr><td><a href="{% post_url 2023-01-30-blip2 %}">BLIP-2</a> <span class="text-muted">'23</span></td><td>CLIP / EVA ViT</td><td><strong>Q-Former</strong></td><td>Flan-T5 / OPT</td><td>2단계(표현→생성), 극도로 효율적</td></tr>
<tr class="gen"><td colspan="5">G3 · Visual Instruction Tuning <span class="text-muted">— 어시스턴트</span></td></tr>
<tr><td><a href="{% post_url 2023-04-17-llava %}">LLaVA</a> <span class="text-muted">'23</span></td><td>CLIP ViT-L/14</td><td><strong>Linear</strong></td><td>Vicuna</td><td><strong>visual instruction tuning</strong></td></tr>
<tr><td><a href="{% post_url 2023-10-05-llava1-5 %}">LLaVA-1.5</a> <span class="text-muted">'24</span></td><td>CLIP @336</td><td><strong>MLP</strong></td><td>Vicuna-1.5</td><td>+ 고해상도·학술 VQA·포맷 프롬프트</td></tr>
<tr class="gen"><td colspan="5">G4 · Native Multimodal <span class="text-muted">— 스케일·비디오·에이전트</span></td></tr>
<tr><td>Qwen2.5-VL <span class="text-muted">'25</span></td><td>dynamic-res ViT</td><td>MLP merger</td><td>Qwen2.5</td><td>dynamic res/FPS · <strong>M-RoPE</strong></td></tr>
</tbody>
</table>
</div>

### 큰 흐름 — 두 축으로 읽기

**① Connector의 진화 (무엇으로 잇나)** — Flamingo의 cross-attention → BLIP-2의 **Q-Former**(학습 query가 텍스트에 유용한 시각 정보만 압축 추출)처럼 복잡하던 것이, **LLaVA의 단순 Linear/MLP**로도 충분함이 드러났다(VILA 등 동일 결론).

**② 적응 방식의 진화 (어떻게 학습하나)** — 결과는 셋 다 *사진+질문→답*으로 비슷해 보여도, 거기에 이르는 방법이 다르다. 이게 *"LLaVA가 instruction tuning을 멀티모달로 가져온 첫 모델"* 이라는 말의 뜻:

<div class="vlm-adapt" markdown="1">

| 모델 | 적응 방식 | 핵심 |
| --- | --- | --- |
| **Flamingo** | few-shot 프롬프팅 (ICL) | 추론 때 프롬프트에 **예시 몇 개**를 넣어 적응(가중치 변경 X). 지시 데이터로 튜닝한 게 아님 |
| **BLIP-2** | VL 사전학습 / 정렬 | Q-Former로 **그림↔글 정렬**. 지시를 따르는 능력은 뒤의 frozen LLM(예: Flan-T5)의 몫 |
| **LLaVA** | **visual instruction tuning** | GPT-4가 만든 멀티모달 (지시,응답)으로 **직접 fine-tune** → 멀티모달 IT를 **처음 도입**(이후 표준 레시피) |

</div>
## 주요 벤치마크

VLM 성능은 대부분 **VQA 계열 벤치마크**로 잰다. 자주 쓰이는 것들을 묶으면:

<div class="vlm-bench" markdown="1">

| 벤치마크 | 무엇을 보나 | 특징 |
| --- | --- | --- |
| **VQAv2** | 일반 시각 인식 + 상식 추론 | 이미지+질문→짧은 답(COCO 기반). 비슷한 이미지쌍으로 언어 편향 완화. 가장 표준적 지표 |
| **GQA** | 조합적·논리적 추론 | scene graph 기반, and/or/not·비교·관계가 얽힌 질문 |
| **VizWiz** | 현실 강건성(robustness) | 시각장애인이 찍은 저품질 실사진 + 거친 질문 |
| **ScienceQA (SQA)** | 지식 기반 멀티모달 추론 | 과학 객관식(이미지+텍스트+선택지+해설 chain) |
| **TextVQA** | OCR + 시각-언어 정렬 | 이미지 속 문자(간판·메뉴·표지판) 인식·이해 |
| **POPE** | 환각(hallucination) 억제 | "없는 객체를 있다고 답하나" Yes/No 프로빙. "아는 척" 여부 |
| **MME** | 종합 성능 | Perception(객체·색·위치·수량) + Cognition(추론·상식·계산)을 분리 채점 |
| **MMBench** | 인식+추론+지식 종합 | 객관식(MCQ), 자동평가·재현성↑, 모델 랭킹용 (영/중 MMBench-CN) |
| **SEED-Bench** | 이미지+비디오 이해 | 시간적 추론(temporal) 포함, 정적 VQA를 넘어서는 능력 |
| **LLaVA-Bench (in the Wild)** | 실사용 체감 품질 | 자유형식 대화, 주관적 평가(창의성·설명력·자연스러움) |

</div>

> **한계.** 많은 벤치마크가 학습(PT/IT) 데이터에 일부 노출돼 변별력이 떨어질 수 있다. 그래서 MMMU·MathVista처럼 더 어렵고 전문적인(수학·다학제) 벤치마크가 등장하는 추세다.

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
      <h6 class="card-title">고해상도 & 경량 배포</h6>
      <p class="card-text mb-0">디테일을 위해 해상도↑(336·448), 동시에 모바일/엣지용 경량화(MobileVLM 등)도 활발.</p>
    </div></div></div>
  </div>
</div>

> **다음 주제 — Efficient / Lightweight VLM.** VLM은 시각 토큰이 텍스트보다 훨씬 많아(예: LLaVA 576개) LLM 입력이 길어지고 연산이 제곱으로 폭증한다. 그래서 **시각 토큰을 줄이는** 흐름(SparseVLM·IVTP·VLTP·Recoverable Compression 등)이 나온다 — [Token Reduction in ViTs]({% post_url 2026-06-19-token-reduction-overview %})를 **텍스트(질문)까지 고려하는 멀티모달 버전**으로 확장한 것이다. 별도 카테고리로 정리 예정.
