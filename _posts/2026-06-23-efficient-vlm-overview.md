---
layout: post
title: "Efficient VLM — Overview"
date: 2026-06-23
description: Cutting visual tokens to make VLMs cheaper — where it happens (encoder · bridge · LLM), text-guided selection, recover/recycle, and a map of MADTP·CrossGET·IVTP·SparseVLM·Recoverable Compression·CoViPAL.
thumbnail: assets/img/notes/efficient-vlm-overview/overview.png
categories: efficient-vlm
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
  .post-content .evlm-where .card-title { font-size: 0.95rem; font-weight: 700; }
  .post-content .evlm-where .card-text { font-size: 0.82rem; line-height: 1.6; }
  .post-content .evlm-where .card { border-left: 4px solid #6e85b7; }
  .post-content .evlm-tab table { font-size: 0.72rem !important; width: 100%; table-layout: fixed; }
  .post-content .evlm-tab th, .post-content .evlm-tab td { font-size: 0.72rem !important; line-height: 1.35; vertical-align: top; padding: 0.25rem 0.4rem; overflow-wrap: anywhere; }
  .post-content .evlm-tab tbody tr:nth-child(odd) { background-color: rgba(110,133,183,0.05); }
  .post-content .evlm-tab td:first-child, .post-content .evlm-tab td:first-child a, .post-content .evlm-tab td:first-child strong { font-weight: 700 !important; }
  .post-content .evlm-tab th:nth-child(1), .post-content .evlm-tab td:nth-child(1) { width: 14%; }
  .post-content .evlm-tab th:nth-child(2), .post-content .evlm-tab td:nth-child(2) { width: 11%; }
  .post-content .evlm-tab th:nth-child(3), .post-content .evlm-tab td:nth-child(3) { width: 16%; white-space: nowrap; }
  .post-content .evlm-tab th:nth-child(4), .post-content .evlm-tab td:nth-child(4) { width: 11%; }
  .post-content .evlm-insights .card-title { font-size: 0.95rem; color: #6e85b7; font-weight: 700; }
  .post-content .evlm-insights .card-text { font-size: 0.83rem; line-height: 1.6; }
  .post-content .tr-callout { background-color: rgba(168,118,118,0.1); border-left: 4px solid #a87676; }
  .post-content .tr-callout p { margin-bottom: 0; }
  .post-content blockquote { font-size: 0.9rem; border-left-color: #a87676; }
---

<div class="mb-2">
  <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">Survey</span>
</div>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> VLM은 <strong>시각 토큰이 텍스트보다 훨씬 많아</strong>(예: LLaVA 한 장에 576개) LLM 입력이 길어지고 연산이 토큰 수의 제곱으로 폭증한다. <strong>Efficient VLM</strong>은 이 <strong>시각 토큰을 줄여(선택·압축·복구)</strong> latency·메모리·FLOPs를 낮추는 방법들이다. 핵심은 두 가지 — ① 줄이는 <strong>위치</strong>(시각 인코더 / 브리지(projector) / LLM 내부) 가 다 다르고, ② 순수 시각만 보던 <a href="{% post_url 2026-06-19-token-reduction-overview %}">ViT의 토큰 축소</a>와 달리 대부분 <strong>텍스트(질문)를 가이드로</strong> 어떤 토큰이 답에 필요한지 본다.</p>
</div>

## 왜 Efficient VLM인가

[VLM]({% post_url 2026-06-22-vlm-overview %})은 이미지를 수백 개의 시각 토큰으로 바꿔 LLM에 넣는다. 그런데 LLM의 self-attention은 입력 길이에 **제곱**으로 비싸지므로, 긴 시각 토큰 시퀀스가 곧 비용이다.

- **LLM 단계 비용이 지배적** — ViT 토큰 축소가 비전 인코더 안의 비용을 줄였다면, VLM에선 **LLM에 들어가는 시각 토큰 수**가 전체 latency·메모리를 좌우한다.
- **순수 시각만 보면 위험** — 대형 멀티모달 모델에서 시각 정보에만 의존해 토큰을 자르면 질문에 필요한 정보를 잃는다(oversimplification). 그래서 **질문 텍스트**가 "어떤 시각 토큰이 중요한지"를 알려주는 단서가 된다.

> 즉 Efficient VLM = **"질문을 고려해, 답에 필요 없는 시각 토큰을 어느 단계에서 얼마나 줄일까"** 의 문제다.

## 어디서 줄이나 (위치별 분류)

{% include figure.liquid loading="eager" path="assets/img/notes/efficient-vlm-overview/overview.png" class="img-fluid rounded z-depth-1" zoomable=true caption="VLM 파이프라인(Input → Visual Encoder → Bridge/Projector → LLM → Output)에서 시각 토큰을 줄일 수 있는 지점. encoder-side · bridge-side · LLM-side(주로 text-guided)로 나뉜다. 효과는 latency·memory·FLOPs·throughput." %}

<div class="evlm-where">
  <div class="row row-cols-1 row-cols-md-3">
    <div class="col mb-3"><div class="card h-100" style="border-left-color:#a87676"><div class="card-body">
      <h6 class="card-title">① Encoder</h6>
      <p class="card-text mb-0">시각 인코더 <strong>안에서</strong> 토큰을 미리 줄인다. 인코더 연산도 같이 절감.</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100" style="border-left-color:#ca8787"><div class="card-body">
      <h6 class="card-title">② Bridge / Pre-LLM</h6>
      <p class="card-text mb-0">인코더와 LLM <strong>사이(projector 부근)</strong>에서 추려서 LLM에 넣는다. LLM 비용을 직접 줄임.</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100" style="border-left-color:#e1acac"><div class="card-body">
      <h6 class="card-title">③ LLM</h6>
      <p class="card-text mb-0">LLM <strong>내부 attention</strong> 계산 중에 시각 토큰을 솎아낸다. 대개 <strong>text-guided</strong>.</p>
    </div></div></div>
  </div>
</div>

> 한 방법이 여러 지점에 걸치기도 한다 — 예: **IVTP**는 시각 인코더와 LLM 양쪽에서 2-stage로 자르고, **Recoverable Compression**은 pre-LLM에서 자르되 질문 텍스트로 복구한다.

## 관련 논문 한눈에 보기

**연도순**으로 정리했다. **위치**(어디서 줄이나)는 색 태그로 표시 — <span class="badge rounded-pill" style="background-color:#a87676;color:#fff">Encoder</span> / <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff">Bridge</span>(Pre-LLM) / <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> 내부로 나뉘며, **여러 단계에 걸치면 <span class="badge rounded-pill" style="background-color:#ffd0d0;color:#1c1c1d">Encoder+LLM</span>** 으로 표기한다(예: IVTP). **학습** 열은 대부분 추가 학습 없이 끼우는 **training-free** 추세를 보여준다.

<div class="evlm-tab" markdown="1">

| Method | Venue | 위치 | 학습 | 핵심 |
| --- | --- | --- | --- | --- |
| [**ToMe**]({% post_url 2023-02-01-tome %}) | ICLR 2023 | <span class="badge rounded-pill" style="background-color:#a87676;color:#fff">Encoder</span> | training-free | bipartite soft matching으로 유사 토큰 병합 — ViT 토큰 축소의 토대 |
| [**MADTP**]({% post_url 2024-03-05-madtp %}) | CVPR 2024 | <span class="badge rounded-pill" style="background-color:#a87676;color:#fff">Encoder</span> | fine-tuning | 비전·언어 인코더에서 동적으로 토큰 가지치기(MAG 정렬 + DTP 동적비율) |
| [**CrossGET**]({% post_url 2024-06-13-crossget %}) | ICML 2024 | <span class="badge rounded-pill" style="background-color:#a87676;color:#fff">Encoder</span> | fine-tuning | cross-modal 가이드로 토큰을 매칭·**병합(ensemble)** + complete-graph soft matching |
| [**FastV**]({% post_url 2024-03-11-fastv %}) | ECCV 2024 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | training-free | 깊은 층의 시각 attention 희소성 → 초기 층(layer 2) 뒤 토큰 가지치기 |
| [**IVTP**]({% post_url 2024-09-30-ivtp %}) | ECCV 2024 | <span class="badge rounded-pill" style="background-color:#ffd0d0;color:#1c1c1d">Encoder+LLM</span> | training-free | **2단계** — 인코더 GTP(attention rollout, frozen ViT 대응) + LLM 단계 **instruction 필터**(pseudo CLS) · LLaVA-1.5 토큰 88.9%↓ |
| [**VLTP**]({% post_url 2024-09-12-vltp %}) | WACV 2025 | <span class="badge rounded-pill" style="background-color:#a87676;color:#fff">Encoder</span> | training | **MLLM 가이드**로 task 관련 토큰만 깊은 ViT 층에 통과(다단계·재활성) — task 지향 분할(TOS) 가속 |
| [**SparseVLM**]({% post_url 2024-10-06-sparsevlm %}) | ICML 2025 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | training-free | **text raters**로 self-attention 중요도 평가 → **rank 기반 적응 압축** + token recycling (FastV 능가) |
| **Recoverable Compression** | AAAI 2025 | <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff">Bridge</span> | training-free | LLM 전에 자르되 질문 텍스트로 **복구** |
| **VisionZip** | CVPR 2025 | <span class="badge rounded-pill" style="background-color:#a87676;color:#fff">Encoder</span> | training-free | 인코더 출력에서 dominant 토큰 선택 + 문맥 토큰 병합(text-agnostic) |
| **DivPrune** | CVPR 2025 | <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff">Bridge</span> | training-free | Max-Min 다양성으로 중복 최소화 선택 |
| **ATP-LLaVA** | CVPR 2025 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | training | 인스턴스·층별 적응 가지치기 비율 + 공간 보강(SAP) |
| **TopV** | CVPR 2025 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | training-free | 가지치기를 비용 최적화(특징·공간·중심거리)로, FlashAttention 호환 |
| [**PyramidDrop (PDrop)**]({% post_url 2024-10-22-pyramiddrop %}) | CVPR 2025 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | 학습·추론 | 깊을수록 중복↑ → stage별 피라미드처럼 점진 드롭(고해상도 학습도 가속) |
| **FastVLM** | CVPR 2025 | <span class="badge rounded-pill" style="background-color:#a87676;color:#fff">Encoder</span> | 사전학습 | FastViTHD **인코더 설계**로 고해상도에서 토큰을 적게 생성(가지치기 불필요) |
| **LLaVA-PruMerge** | ICCV 2025 | <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff">Bridge</span> | training-free | attention 이상치(IQR)로 핵심 선택 후 유사 토큰 병합 |
| **CDPruner** | NeurIPS 2025 | <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff">Bridge</span> | training-free | 지시문에 조건화된 다양성을 DPP로 최대화 |
| **CoViPAL** | EMNLP 2025 | <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff">Bridge</span> | training-based | PPM 분류기로 LLM 전 토큰 선별(이미지·비디오) |
| **DART** | EMNLP 2025 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | training-free | "중요 토큰보다 **중복 제거**" — 쌍별 유사도로 가지치기 |
| **G-Prune** | arXiv 2025 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | training-free | 토큰을 그래프 노드로 정보 전파해 중요 토큰 선택(전경·배경) |
| **ZOO-Prune** | CVPR 2026 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | training-free | zeroth-order gradient 추정으로 토큰 가지치기 |
| **VLM-Pruner** | CVPR 2026 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | training-free | 공간 희소성 버퍼링(centrifugal)으로 토큰 가지치기 |
| **EntropyPrune** | arXiv 2026 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | — | 엔트로피 기반 시각 토큰 선택 *(정리 예정)* |

</div>

## 발전 흐름

분야가 2년 남짓으로 짧아 "세대"로 가르긴 이르지만, **무게중심이 옮겨온 흐름**은 뚜렷하다.

<div class="evlm-where">
  <div class="row row-cols-1 row-cols-md-2">
    <div class="col mb-3"><div class="card h-100" style="border-left-color:#a87676"><div class="card-body">
      <h6 class="card-title">① 인코더에서 시작 <span class="badge rounded-pill" style="background-color:#a87676;color:#fff;font-size:0.62rem;vertical-align:1px">Encoder</span></h6>
      <p class="card-text mb-0">ViT 토큰 축소(<a href="{% post_url 2023-02-01-tome %}">ToMe</a>)를 <strong>멀티모달 인코더</strong>로 이식 — 비전·언어 양쪽을 정렬해 자르거나 병합(<a href="{% post_url 2024-03-05-madtp %}">MADTP</a>·<a href="{% post_url 2024-06-13-crossget %}">CrossGET</a>). 단, <strong>fine-tuning</strong>이 필요했다.</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100" style="border-left-color:#e1acac"><div class="card-body">
      <h6 class="card-title">② LLM-side의 발견 <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d;font-size:0.62rem;vertical-align:1px">LLM</span></h6>
      <p class="card-text mb-0"><a href="{% post_url 2024-03-11-fastv %}">FastV</a>가 <strong>"깊은 LLM 층에선 시각 토큰 attention이 거의 0"</strong>임을 관찰 → 무게중심이 <strong>LLM 내부</strong>로. 한 층 뒤 잘라내고(FastV) stage별 점진 드롭(<a href="{% post_url 2024-10-22-pyramiddrop %}">PyramidDrop</a>)까지, 게다가 <strong>training-free</strong>.</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100" style="border-left-color:#ca8787"><div class="card-body">
      <h6 class="card-title">③ 질문 가이드 · 브리지 선별 <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff;font-size:0.62rem;vertical-align:1px">Bridge</span></h6>
      <p class="card-text mb-0">순수 시각만 보면 위험 → <strong>질문(텍스트)을 단서로</strong> 답에 필요한 토큰만 남기고, LLM 전(<strong>브리지</strong>)에서 선별·<strong>복구</strong>한다(SparseVLM·Recoverable Compression·CoViPAL). plug-and-play 모듈이 폭발적으로 늘어난다.</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100" style="border-left-color:#ffd0d0"><div class="card-body">
      <h6 class="card-title">④ 기준의 정교화 <span class="badge rounded-pill" style="background-color:#ffd0d0;color:#1c1c1d;font-size:0.62rem;vertical-align:1px">혼합</span></h6>
      <p class="card-text mb-0">단순 attention을 넘어 — <strong>다양성</strong>(Max-Min·DPP: DivPrune·CDPruner), <strong>중복 제거</strong>(DART), <strong>비용 최적화</strong>(TopV), 나아가 인코더 설계 자체로 토큰을 적게 내는 길(FastVLM)까지 분화한다.</p>
    </div></div></div>
  </div>
</div>

## 공통 아이디어

<div class="evlm-insights">
  <div class="row row-cols-1 row-cols-md-2">
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">텍스트(질문) 가이드</h6>
      <p class="card-text mb-0">질문과 관련된 시각 토큰을 우선 남긴다. cross-attention으로 질문 토큰과 시각 토큰의 관련성을 재는 식(SparseVLM·Recoverable Compression).</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">적응적 축소 (중복도 기반)</h6>
      <p class="card-text mb-0">이미지마다 정보 밀도가 달라, attention의 rank 등으로 중복을 추정해 <strong>이미지별로 다른 비율</strong>로 자른다(SparseVLM).</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">복구·재활용 (recover / recycle)</h6>
      <p class="card-text mb-0">버린 토큰을 그냥 두지 않고 <strong>클러스터링해 합치거나</strong> 텍스트 단서로 <strong>되살린다</strong> — 정보 손실 최소화(Recoverable Compression·SparseVLM).</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">training-free plug-and-play</h6>
      <p class="card-text mb-0">추가 학습·파라미터 없이 추론 시 바로 끼우는 모듈이 늘어나는 추세(IVTP·SparseVLM·Recoverable Compression). 배포가 쉽다.</p>
    </div></div></div>
  </div>
</div>

## 벤치마크

평가는 대부분 **image/video understanding** 벤치마크로 한다 — MME·POPE·GQA·TextVQA·MMBench·SEED·ScienceQA 등. 각 벤치마크가 무엇을 보는지는 [VLM Overview의 주요 벤치마크]({% post_url 2026-06-22-vlm-overview %})에 정리해 두었다. 핵심 비교 지표는 **압축률(유지 토큰 수) 대비 정확도 유지 + latency**.
