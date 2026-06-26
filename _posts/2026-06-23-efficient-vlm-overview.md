---
layout: post
title: "Efficient VLM — Overview"
date: 2026-06-23
description: "Cutting visual tokens to make VLMs cheaper — mapped on two axes (where: encoder·bridge·LLM, and what criterion: importance·diversity·duplication·sensitivity·spatial), the field's evolution, and a one-glance table of 20 methods."
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
  .post-content .evlm-where .card { border-left: 4px solid #a87676; }
  .post-content .evlm-tab table { font-size: 0.72rem !important; width: 100%; table-layout: fixed; }
  .post-content .evlm-tab th, .post-content .evlm-tab td { font-size: 0.72rem !important; line-height: 1.35; vertical-align: top; padding: 0.25rem 0.4rem; overflow-wrap: anywhere; }
  .post-content .evlm-tab tbody tr:nth-child(odd) { background-color: rgba(168,118,118,0.05); }
  .post-content .evlm-tab td:first-child, .post-content .evlm-tab td:first-child a, .post-content .evlm-tab td:first-child strong { font-weight: 700 !important; }
  .post-content .evlm-tab th:nth-child(1), .post-content .evlm-tab td:nth-child(1) { width: 14%; }
  .post-content .evlm-tab th:nth-child(2), .post-content .evlm-tab td:nth-child(2) { width: 11%; }
  .post-content .evlm-tab th:nth-child(3), .post-content .evlm-tab td:nth-child(3) { width: 16%; white-space: nowrap; }
  .post-content .evlm-tab th:nth-child(4), .post-content .evlm-tab td:nth-child(4) { width: 11%; }
  .post-content .evlm-insights .card-title { font-size: 0.95rem; color: #a87676; font-weight: 700; }
  .post-content .evlm-insights .card-text { font-size: 0.83rem; line-height: 1.6; }
  .post-content .tr-callout { background-color: rgba(168,118,118,0.1); border-left: 4px solid #a87676; }
  .post-content .tr-callout p { margin-bottom: 0; }
  .post-content blockquote { font-size: 0.9rem; border-left-color: #a87676; }
  .post-content a:not(.btn) { color: #a87676; }
---

<div class="mb-2">
  <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">Survey</span>
</div>

<div class="tr-callout p-3 my-3 rounded">
  <p><strong>한 줄 요약.</strong> VLM은 <strong>시각 토큰이 텍스트보다 훨씬 많아</strong>(예: LLaVA 한 장에 576개) LLM 입력이 길어지고 연산이 토큰 수의 제곱으로 폭증한다. <strong>Efficient VLM</strong>은 이 <strong>시각 토큰을 줄여(선택·압축·복구)</strong> latency·메모리·FLOPs를 낮추는 방법들이다. 이 글은 분야를 <strong>두 축</strong>으로 지도화한다 — ① <strong>어디서</strong> 줄이나(인코더 · 브리지 · LLM), ② <strong>무엇으로</strong> 고르나(중요도 · 다양성 · 중복 · 민감도 · 공간 …). 그 위에 <strong>발전 흐름</strong>과 <strong>20개 방법 한눈에 보기</strong> 표를 얹는다.</p>
</div>

## 왜 Efficient VLM인가

[VLM]({% post_url 2026-06-22-vlm-overview %})은 이미지를 수백 개의 시각 토큰으로 바꿔 LLM에 넣는다. 그런데 LLM의 self-attention은 입력 길이에 **제곱**으로 비싸지므로, 긴 시각 토큰 시퀀스가 곧 비용이다.

- **LLM 단계 비용이 지배적** — <a href="{% post_url 2026-06-19-token-reduction-overview %}">ViT 토큰 축소</a>가 비전 인코더 안의 비용을 줄였다면, VLM에선 **LLM에 들어가는 시각 토큰 수**가 전체 latency·메모리를 좌우한다.
- **순수 시각만 보면 위험** — 시각 정보에만 의존해 토큰을 자르면 질문에 필요한 정보를 잃는다(oversimplification). 그래서 많은 방법이 **질문 텍스트**를 "어떤 시각 토큰이 답에 필요한지"의 단서로 쓴다.

> 즉 Efficient VLM = **"질문을 고려해, 답에 필요 없는 시각 토큰을 — 어느 단계에서·어떤 기준으로 — 얼마나 줄일까"** 의 문제다. 아래 두 축이 그 "어느 단계"와 "어떤 기준"이다.

## 축 ①: 어디서 줄이나 (위치)

{% include figure.liquid loading="eager" path="assets/img/notes/efficient-vlm-overview/overview.png" class="img-fluid rounded z-depth-1" zoomable=true caption="VLM 파이프라인(Input → Visual Encoder → Bridge/Projector → LLM → Output)에서 시각 토큰을 줄일 수 있는 지점. encoder-side · bridge-side · LLM-side로 나뉜다. 효과는 latency·memory·FLOPs·throughput." %}

<div class="evlm-where">
  <div class="row row-cols-1 row-cols-md-3">
    <div class="col mb-3"><div class="card h-100" style="border-left-color:#a87676"><div class="card-body">
      <h6 class="card-title">① Encoder <span class="badge rounded-pill" style="background-color:#a87676;color:#fff;font-size:0.62rem;vertical-align:1px">Encoder</span></h6>
      <p class="card-text mb-0">시각 인코더 <strong>안에서</strong> 토큰을 미리 줄인다. 인코더 연산까지 함께 절감(ToMe·VisionZip). 인코더를 <strong>재설계</strong>해 애초에 토큰을 적게 내는 길도(FastVLM).</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100" style="border-left-color:#ca8787"><div class="card-body">
      <h6 class="card-title">② Bridge / Pre-LLM <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff;font-size:0.62rem;vertical-align:1px">Bridge</span></h6>
      <p class="card-text mb-0">인코더와 LLM <strong>사이(projector 부근)</strong>에서 추려 LLM에 넣는다. LLM 비용을 직접 줄인다(DivPrune·CDPruner·PruMerge·G-Prune).</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100" style="border-left-color:#e1acac"><div class="card-body">
      <h6 class="card-title">③ LLM <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d;font-size:0.62rem;vertical-align:1px">LLM</span></h6>
      <p class="card-text mb-0">LLM <strong>내부(주로 얕은 디코더 층)</strong>에서 시각 토큰을 솎아낸다. attention 관찰에서 출발(FastV·SparseVLM·PyramidDrop·DART).</p>
    </div></div></div>
  </div>
</div>

> 한 방법이 여러 단계에 걸치기도 한다 — **IVTP**는 인코더와 LLM 양쪽에서 2-stage로 자르고(<span class="badge rounded-pill" style="background-color:#ffd0d0;color:#1c1c1d;font-size:0.62rem">Encoder+LLM</span>), **Recoverable Compression**은 브리지에서 자르되 질문 텍스트로 되살린다.

## 축 ②: 무엇으로 고르나 (선택 기준)

위치가 "어디서"라면, 선택 기준은 **"어떤 신호로 남길 토큰을 정하나"** 다. 초기엔 사실상 attention 하나였지만, 그 한계(층·헤드마다 불안정, 중복 잔존)가 드러나며 기준이 분화했다.

<div class="evlm-insights">
  <div class="row row-cols-1 row-cols-md-2">
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">① 중요도 (attention)</h6>
      <p class="card-text mb-0">시각 토큰이 받는 <strong>attention</strong>으로 중요도를 매겨 낮은 걸 버린다 — 가장 기본(<a href="{% post_url 2024-03-11-fastv %}">FastV</a>·<a href="{% post_url 2024-10-22-pyramiddrop %}">PyramidDrop</a>·<a href="{% post_url 2024-11-30-atp-llava %}">ATP-LLaVA</a>). 단, attention은 불안정하고 <strong>비슷한 토큰을 함께</strong> 남겨 중복이 생긴다.</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">② 다양성 · 중복 제거</h6>
      <p class="card-text mb-0">중복을 직접 겨냥한다 — 비슷한 토큰을 <strong>병합</strong>하거나(<a href="{% post_url 2023-02-01-tome %}">ToMe</a>·<a href="{% post_url 2024-06-13-crossget %}">CrossGET</a>·<a href="{% post_url 2024-12-04-visionzip %}">VisionZip</a>·<a href="{% post_url 2024-03-22-llava-prumerge %}">PruMerge</a>), <strong>서로 다른</strong> 토큰을 고르거나(<a href="{% post_url 2025-03-04-divprune %}">DivPrune</a>·<a href="{% post_url 2025-06-13-cdpruner %}">CDPruner</a>), 아예 <strong>중복만 지운다</strong>(<a href="{% post_url 2025-02-17-dart %}">DART</a>).</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">③ attention 너머의 새 신호</h6>
      <p class="card-text mb-0">attention의 불안정·중복을 피해 더 직접적인 신호로 — <strong>그래프 정보 전파</strong>(<a href="{% post_url 2025-01-04-g-prune %}">G-Prune</a>), <strong>비용 최적화</strong>(<a href="{% post_url 2025-03-23-topv %}">TopV</a>), <strong>출력 민감도</strong>(<a href="{% post_url 2025-09-29-zoo-prune %}">ZOO-Prune</a>), <strong>공간 근접</strong>(<a href="{% post_url 2025-12-02-vlm-pruner %}">VLM-Pruner</a>).</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100"><div class="card-body">
      <h6 class="card-title">④ 질문(텍스트) 가이드</h6>
      <p class="card-text mb-0">위 기준에 <strong>질문</strong>을 더한다 — 질문과 관련된 시각 토큰을 우선 남겨 순수 시각의 과압축을 막는다(<a href="{% post_url 2024-10-06-sparsevlm %}">SparseVLM</a> raters·<a href="{% post_url 2024-09-02-recoverable-compression %}">Recoverable</a>·<a href="{% post_url 2024-09-30-ivtp %}">IVTP</a>·<a href="{% post_url 2025-08-23-covipal %}">CoViPAL</a>).</p>
    </div></div></div>
  </div>
</div>

> 게다가 대부분 버린 토큰을 그냥 두지 않고 **복구·재활용**한다 — 클러스터링해 합치거나(SparseVLM·PruMerge·VLM-Pruner의 SWA) 질문 단서로 되살린다(Recoverable). 그리고 추가 학습이 필요 없는 **training-free**로 수렴하는 추세다.

## 관련 논문 한눈에 보기

아래 표는 두 축(**위치** · 학습 유형)과 핵심을 **연도순**으로 정리한 지도다. 위치는 색 태그로 — <span class="badge rounded-pill" style="background-color:#a87676;color:#fff">Encoder</span> / <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff">Bridge</span> / <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> / 걸치면 <span class="badge rounded-pill" style="background-color:#ffd0d0;color:#1c1c1d">Encoder+LLM</span>.

<div class="evlm-tab" markdown="1">

| Method | Venue | 위치 | 학습 | 핵심 |
| --- | --- | --- | --- | --- |
| [**ToMe**]({% post_url 2023-02-01-tome %}) | ICLR 2023 | <span class="badge rounded-pill" style="background-color:#a87676;color:#fff">Encoder</span> | training-free | bipartite soft matching으로 유사 토큰 병합 — ViT 토큰 축소의 토대 |
| [**MADTP**]({% post_url 2024-03-05-madtp %}) | CVPR 2024 | <span class="badge rounded-pill" style="background-color:#a87676;color:#fff">Encoder</span> | fine-tuning | 비전·언어 인코더에서 동적으로 토큰 가지치기(MAG 정렬 + DTP 동적비율) |
| [**CrossGET**]({% post_url 2024-06-13-crossget %}) | ICML 2024 | <span class="badge rounded-pill" style="background-color:#a87676;color:#fff">Encoder</span> | fine-tuning | cross-modal 가이드로 토큰을 매칭·**병합(ensemble)** + complete-graph soft matching |
| [**FastV**]({% post_url 2024-03-11-fastv %}) | ECCV 2024 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | training-free | 깊은 층의 시각 attention 희소성 → 초기 층(layer 2) 뒤 토큰 가지치기 |
| [**IVTP**]({% post_url 2024-09-30-ivtp %}) | ECCV 2024 | <span class="badge rounded-pill" style="background-color:#ffd0d0;color:#1c1c1d">Encoder+LLM</span> | training-free | **2단계** — 인코더 GTP(attention rollout, frozen ViT 대응) + LLM 단계 **instruction 필터**(pseudo CLS) · LLaVA-1.5 토큰 88.9%↓ |
| [**VLTP**]({% post_url 2024-09-12-vltp %}) | WACV 2025 | <span class="badge rounded-pill" style="background-color:#a87676;color:#fff">Encoder</span> | training-based | **MLLM 가이드**로 task 관련 토큰만 깊은 ViT 층에 통과(다단계·재활성) — task 지향 분할(TOS) 가속 |
| [**SparseVLM**]({% post_url 2024-10-06-sparsevlm %}) | ICML 2025 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | training-free | **text raters**로 self-attention 중요도 평가 → **rank 기반 적응 압축** + token recycling (FastV 능가) |
| [**Recoverable Compression**]({% post_url 2024-09-02-recoverable-compression %}) | AAAI 2025 | <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff">Bridge</span> | training-free | CLS 1차 필터 → **질문 텍스트 유사 토큰을 복구(recover)** → 나머지 병합 · 토큰 ~10%로 |
| [**G-Prune**]({% post_url 2025-01-04-g-prune %}) | AAAI 2025 | <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff">Bridge</span> | training-free | 시각 토큰을 **그래프 노드**로 — 의미 유사도 간선 + **정보 전파**로 중요도 매겨 top-k 선택(**전경·배경 모두**) · LLM attention 불필요 |
| [**VisionZip**]({% post_url 2024-12-04-visionzip %}) | CVPR 2025 | <span class="badge rounded-pill" style="background-color:#a87676;color:#fff">Encoder</span> | training-free | 인코더 출력에서 **dominant 토큰 선택 + contextual 병합** · **text-agnostic**(멀티턴 강점) |
| [**DivPrune**]({% post_url 2025-03-04-divprune %}) | CVPR 2025 | <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff">Bridge</span> | training-free | 가지치기를 **Max-Min Diversity(MMDP)** 로 — 중요도 아닌 **다양성 최대** 부분집합 선택(LLM 입력 전 1회) |
| [**ATP-LLaVA**]({% post_url 2024-11-30-atp-llava %}) | CVPR 2025 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | training-based | **ATP 모듈**로 인스턴스·층별 적응 압축률 + **SAP**(공간 보강) · 토큰 75%↓에 1.9% |
| [**TopV**]({% post_url 2025-03-23-topv %}) | CVPR 2025 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | training-free | 가지치기를 **비용 최적화**(특징 유사도·공간·중심거리 + Sinkhorn)로 — attention 휴리스틱 대신, **prefill 1회**라 **FlashAttention·KV cache 호환**·메모리↓ |
| [**PyramidDrop (PDrop)**]({% post_url 2024-10-22-pyramiddrop %}) | CVPR 2025 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | training-free | 깊을수록 중복↑ → stage별 피라미드처럼 점진 드롭(고해상도 학습도 가속) |
| [**FastVLM**]({% post_url 2024-12-17-fastvlm %}) | CVPR 2025 | <span class="badge rounded-pill" style="background-color:#a87676;color:#fff">Encoder</span> | pretraining | **FastViTHD**(conv+transformer) **인코더 재설계**로 고해상도에서 토큰 4~16×↓·인코딩 지연↓ → **가지치기 불필요**, TTFT 3.2×↑ (Apple) |
| [**LLaVA-PruMerge**]({% post_url 2024-03-22-llava-prumerge %}) | ICCV 2025 | <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff">Bridge</span> | training-free | CLS-패치 attention 희소성 → **IQR로 적응적 선택**(입력마다 다른 개수) + **k-NN 가중 병합**(PruMerge+) · 토큰 **~5.5%**(~32개) |
| [**CDPruner**]({% post_url 2025-06-13-cdpruner %}) | NeurIPS 2025 | <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff">Bridge</span> | training-free | attention·유사도를 넘어 **질문에 조건화한 다양성**을 **DPP**로 최대화 → 다양+질문관련 토큰만 · LLaVA FLOPs 95%↓에 94% |
| [**CoViPAL**]({% post_url 2025-08-23-covipal %}) | EMNLP 2025 | <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff">Bridge</span> | training-based | 가볍고 model-agnostic한 **PPM**이 LVLM 전에 문맥 기반으로 잉여 토큰 예측·제거(얕은 층도) · training-free·based 양쪽 능가(이미지·비디오) |
| [**DART**]({% post_url 2025-02-17-dart %}) | EMNLP 2025 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | training-free | "중요도는 random보다 못하다" → **중복(duplication)** 기준 — **pivot 토큰**(≤2%)과 중복 낮은 토큰만 유지 · FlashAttention 호환·88.9%↓ |
| [**ZOO-Prune**]({% post_url 2025-09-29-zoo-prune %}) | CVPR 2026 | <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff">Bridge</span> | training-free | **민감도(sensitivity)** 기준 — projection layer에서 **zeroth-order 섭동**으로 출력 영향 추정(backprop 없이) + 다양성 결합(**Score=Div×Sens**) · 토큰 94.4%↓ |
| [**VLM-Pruner**]({% post_url 2025-12-02-vlm-pruner %}) | CVPR 2026 | <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d">LLM</span> | training-free | **중복+공간 희소성** 균형 — pivot에서 **근→원(centrifugal)** 선택(**BSS** 기준)·버린 토큰 **SWA** 회복 → 흩어짐 없이 객체 디테일 보존 · 88.9%↓ |

</div>

<p class="text-muted" style="font-size: 0.78rem; line-height: 1.7; margin-top: 0.6rem;">
<strong>「학습」 유형</strong> — 각 방법(가지치기·병합·복구·인코더 설계)을 적용하는 데 <strong>어떤 학습이 필요한가</strong>를 나타낸다.<br>
· <strong>training-free</strong> : 추가 학습 없이 사전학습된 모델에 그대로 끼운다(plug-and-play). 대부분의 추세.<br>
· <strong>fine-tuning</strong> : 가지치기를 켠 채 <strong>모델(VLM) 가중치를 미세조정</strong>해 성능을 회복·적응시킨다.<br>
· <strong>training-based</strong> : 모델 본체는 두고 <strong>가지치기용 모듈을 따로 학습</strong>한다(예: 중요도 예측기·분류기).<br>
· <strong>pretraining</strong> : 가지치기가 아니라 <strong>인코더 자체를 새로 설계·사전학습</strong>해 토큰을 적게 내놓는다(FastVLM).
</p>

## 발전 흐름

분야가 2년 남짓으로 짧아 "세대"로 가르긴 이르지만, **무게중심이 옮겨온 흐름**은 뚜렷하다 — 위치(축①)와 기준(축②)이 함께 움직였다.

<div class="evlm-where">
  <div class="row row-cols-1 row-cols-md-2">
    <div class="col mb-3"><div class="card h-100" style="border-left-color:#a87676"><div class="card-body">
      <h6 class="card-title">① 인코더에서 시작 <span class="badge rounded-pill" style="background-color:#a87676;color:#fff;font-size:0.62rem;vertical-align:1px">Encoder</span></h6>
      <p class="card-text mb-0">ViT 토큰 축소(<a href="{% post_url 2023-02-01-tome %}">ToMe</a>)를 <strong>멀티모달 인코더</strong>로 이식 — 비전·언어를 정렬해 자르거나 병합(<a href="{% post_url 2024-03-05-madtp %}">MADTP</a>·<a href="{% post_url 2024-06-13-crossget %}">CrossGET</a>). 단, <strong>fine-tuning</strong>이 필요했다.</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100" style="border-left-color:#e1acac"><div class="card-body">
      <h6 class="card-title">② LLM-side의 발견 <span class="badge rounded-pill" style="background-color:#e1acac;color:#1c1c1d;font-size:0.62rem;vertical-align:1px">LLM</span></h6>
      <p class="card-text mb-0"><a href="{% post_url 2024-03-11-fastv %}">FastV</a>가 <strong>"깊은 LLM 층에선 시각 토큰 attention이 거의 0"</strong>임을 관찰 → 무게중심이 <strong>LLM 내부</strong>로. 한 층 뒤 잘라내고(FastV) stage별 점진 드롭(<a href="{% post_url 2024-10-22-pyramiddrop %}">PyramidDrop</a>)까지, 게다가 <strong>training-free</strong>로.</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100" style="border-left-color:#ca8787"><div class="card-body">
      <h6 class="card-title">③ 질문 가이드 · 브리지 선별 <span class="badge rounded-pill" style="background-color:#ca8787;color:#fff;font-size:0.62rem;vertical-align:1px">Bridge</span></h6>
      <p class="card-text mb-0">순수 시각만 보면 위험 → <strong>질문(텍스트)을 단서로</strong> 답에 필요한 토큰만 LLM 전(<strong>브리지</strong>)에서 선별·<strong>복구</strong>한다(<a href="{% post_url 2024-10-06-sparsevlm %}">SparseVLM</a>·<a href="{% post_url 2024-09-02-recoverable-compression %}">Recoverable</a>·<a href="{% post_url 2025-08-23-covipal %}">CoViPAL</a>). plug-and-play 모듈이 폭발적으로 늘었다.</p>
    </div></div></div>
    <div class="col mb-3"><div class="card h-100" style="border-left-color:#ffd0d0"><div class="card-body">
      <h6 class="card-title">④ 선택 기준의 정교화 <span class="badge rounded-pill" style="background-color:#ffd0d0;color:#1c1c1d;font-size:0.62rem;vertical-align:1px">기준</span></h6>
      <p class="card-text mb-0">최근엔 <strong>"무엇으로 고르나"(축②)가 분화</strong>한다 — 다양성·중복(<a href="{% post_url 2025-03-04-divprune %}">DivPrune</a>·<a href="{% post_url 2025-02-17-dart %}">DART</a>)을 넘어 그래프(<a href="{% post_url 2025-01-04-g-prune %}">G-Prune</a>)·비용 최적화(<a href="{% post_url 2025-03-23-topv %}">TopV</a>)·민감도(<a href="{% post_url 2025-09-29-zoo-prune %}">ZOO-Prune</a>)·공간(<a href="{% post_url 2025-12-02-vlm-pruner %}">VLM-Pruner</a>), 나아가 인코더 설계로 토큰을 적게 내는 길(<a href="{% post_url 2024-12-17-fastvlm %}">FastVLM</a>)까지.</p>
    </div></div></div>
  </div>
</div>

## 벤치마크

평가는 대부분 **image/video understanding** 벤치마크로 한다 — MME · POPE · GQA · TextVQA · MMBench · SEED · ScienceQA · OCRBench 등. 각 벤치마크가 무엇을 보는지는 [VLM Overview의 주요 벤치마크]({% post_url 2026-06-22-vlm-overview %})에 정리해 두었다. 핵심 비교 지표는 **압축률(유지 토큰 수) 대비 정확도 유지 + latency**이며, 특히 **고압축(토큰 ~90%↓)·OCR/문서처럼 디테일이 중요한 task**에서 방법 간 차이가 크게 갈린다.
