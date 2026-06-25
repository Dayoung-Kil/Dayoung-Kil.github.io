// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "publications",
          description: "Publications on efficient deep learning, model pruning, and vision-language models.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "Selected projects and competition work, with code.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-awards",
          title: "awards",
          description: "Honors, prizes, and competition recognitions.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/awards/";
          },
        },{id: "nav-patents",
          title: "patents",
          description: "Registered patents and software.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/patents/";
          },
        },{id: "nav-notes",
          title: "notes",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "My academic CV, covering research on efficient deep learning and large vision-language models, along with publications, awards, and service.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "post-efficient-vlm-overview",
        
          title: "Efficient VLM — Overview",
        
        description: "Cutting visual tokens to make VLMs cheaper — where it happens (encoder · bridge · LLM), text-guided selection, recover/recycle, and a map of MADTP·CrossGET·IVTP·SparseVLM·Recoverable Compression·CoViPAL.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/efficient-vlm-overview/";
          
        },
      },{id: "post-vlm-overview",
        
          title: "VLM — Overview",
        
        description: "How vision-language / multimodal LLMs are built — the 5-component architecture (encoder · projector · LLM · output projector · generator), the understanding-vs-generation taxonomy, and key models from Flamingo to Qwen2.5-VL.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/vlm-overview/";
          
        },
      },{id: "post-token-reduction-in-vits-overview",
        
          title: "Token Reduction in ViTs — Overview",
        
        description: "ViT token efficiency — Pruning · Merging · Pooling · Hybrid, with key papers at a glance.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/token-reduction-overview/";
          
        },
      },{id: "post-qwen3-vl-technical-report",
        
          title: "[Qwen3-VL] Technical Report",
        
        description: "The most capable Qwen VLM yet — native 256K interleaved context, dense (2/4/8/32B) and MoE (30B-A3B/235B-A22B) variants, and three architecture upgrades: interleaved-MRoPE, DeepStack multi-level ViT fusion, and text-based timestamp alignment for video.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/qwen3-vl/";
          
        },
      },{id: "post-internvl3-5-advancing-open-source-multimodal-models-in-versatility-reasoning-and-efficiency",
        
          title: "[InternVL3.5] Advancing Open-Source Multimodal Models in Versatility, Reasoning, and Efficiency",
        
        description: "Builds on InternVL3 with Cascade RL (offline→online) for reasoning, a Visual Resolution Router (ViR) and Decoupled Vision-Language Deployment (DvD) for efficiency — +16% reasoning and 4.05× faster inference, plus GUI/embodied agency.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/internvl3-5/";
          
        },
      },{id: "post-internvl3-exploring-advanced-training-and-test-time-recipes-for-open-source-multimodal-models",
        
          title: "[InternVL3] Exploring Advanced Training and Test-Time Recipes for Open-Source Multimodal Models",
        
        description: "Brings native multimodal pre-training to the open InternVL line — jointly learning language and vision in a single stage instead of retrofitting a text-only LLM — plus V2PE, mixed preference optimization (MPO), and test-time scaling. InternVL3-78B sets a new open MMMU SOTA (72.2).",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/internvl3/";
          
        },
      },{id: "post-qwen2-5-vl-technical-report",
        
          title: "[Qwen2.5-VL] Technical Report",
        
        description: "Refines Qwen2-VL: a from-scratch native-resolution ViT with window attention (linear cost), dynamic FPS sampling, and MRoPE aligned to absolute time — pushing document parsing, object grounding, hour-long video, and computer/mobile agents.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/qwen2-5-vl/";
          
        },
      },{id: "post-deepseek-vl2-mixture-of-experts-vision-language-models-for-advanced-multimodal-understanding",
        
          title: "[DeepSeek-VL2] Mixture-of-Experts Vision-Language Models for Advanced Multimodal Understanding",
        
        description: "Upgrades DeepSeek-VL with a dynamic tiling vision encoder (single SigLIP, any aspect ratio) and a DeepSeekMoE LLM with Multi-head Latent Attention — matching or beating dense/MoE models with only 1.0/2.8/4.5B activated parameters.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/deepseek-vl2/";
          
        },
      },{id: "post-internvl-2-5-expanding-performance-boundaries-with-model-data-and-test-time-scaling",
        
          title: "[InternVL 2.5] Expanding Performance Boundaries with Model, Data, and Test-Time Scaling",
        
        description: "Keeps InternVL 2.0&#39;s ViT-MLP-LLM architecture but pushes three scaling axes — model (6B vision encoder), data (doubled + strictly filtered), and test-time (CoT + voting) — becoming the first open MLLM to pass 70% on MMMU.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/internvl2-5/";
          
        },
      },{id: "post-pyramiddrop-accelerating-large-vision-language-models-via-pyramid-visual-redundancy-reduction",
        
          title: "[PyramidDrop] Accelerating Large Vision-Language Models via Pyramid Visual Redundancy Reduction",
        
        description: "Empirically shows visual tokens are all needed in shallow LLM layers but grow redundant in deeper ones — so it splits the LLM into stages and drops a fixed ratio of image tokens at the end of each stage (pyramid). Accelerates both training (−40%) and inference (−55% FLOPs).",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/pyramiddrop/";
          
        },
      },{id: "post-sparsevlm-visual-token-sparsification-for-efficient-vision-language-model-inference",
        
          title: "[SparseVLM] Visual Token Sparsification for Efficient Vision-Language Model Inference",
        
        description: "Training-free, text-guided visual token sparsification inside the LLM — relevant text tokens act as &#39;raters&#39; to score visual tokens via self-attention, a rank-based rule sets the per-layer ratio, and pruned tokens are recycled by clustering. 4.5× compression keeping 97% on LLaVA; beats FastV.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/sparsevlm/";
          
        },
      },{id: "post-ivtp-instruction-guided-visual-token-pruning-for-large-vision-language-models",
        
          title: "[IVTP] Instruction-guided Visual Token Pruning for Large Vision-Language Models",
        
        description: "Two-stage visual token pruning for LVLMs — a Group-wise Token Pruning (attention rollout) inside the frozen ViT, then an instruction-guided filter inside the LLM using a pseudo CLS token. Training-free: cuts 88.9% of visual tokens (FLOPs −46%) with only ~1% drop on LLaVA-1.5.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/ivtp/";
          
        },
      },{id: "post-qwen2-vl-enhancing-vision-language-model-39-s-perception-of-the-world-at-any-resolution",
        
          title: "[Qwen2-VL] Enhancing Vision-Language Model&#39;s Perception of the World at Any Resolution",
        
        description: "Upgrades Qwen-VL with Naive Dynamic Resolution (any resolution → variable visual tokens) and Multimodal RoPE (M-RoPE: temporal·height·width), unifying image and video under one spatiotemporal position scheme — scaled to 2B/7B/72B.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/qwen2-vl/";
          
        },
      },{id: "post-vltp-vision-language-guided-token-pruning-for-task-oriented-segmentation",
        
          title: "[VLTP] Vision-Language Guided Token Pruning for Task-Oriented Segmentation",
        
        description: "Accelerates ViT-based segmentation by pruning image tokens that aren&#39;t relevant to the task — a prune decoder uses MLLM guidance to score each token&#39;s task-relevance, keeping only relevant tokens in deeper ViT layers. ~25% ViT FLOPs cut with no drop (40% with 1%).",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/vltp/";
          
        },
      },{id: "post-llava-onevision-easy-visual-task-transfer",
        
          title: "[LLaVA-OneVision] Easy Visual Task Transfer",
        
        description: "The first single open LMM strong across single-image, multi-image, and video — with cross-scenario task transfer (video understanding emerges from image training) via a balanced AnyRes token budget.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/llava-onevision/";
          
        },
      },{id: "post-crossget-cross-guided-ensemble-of-tokens-for-accelerating-vision-language-transformers",
        
          title: "[CrossGET] Cross-Guided Ensemble of Tokens for Accelerating Vision-Language Transformers",
        
        description: "Reduces tokens inside vision-language Transformers by ensembling (merging) them, guided by cross-modal importance — works on both modality-independent (CLIP) and modality-dependent (BLIP-2) models via learnable cross tokens and a parallelizable complete-graph soft matching.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/crossget/";
          
        },
      },{id: "post-fastv-an-image-is-worth-1-2-tokens-after-layer-2",
        
          title: "[FastV] An Image is Worth 1/2 Tokens After Layer 2",
        
        description: "Observes that in deep LLM layers of LVLMs, visual tokens receive almost no attention — so after an early layer (e.g., layer 2) it prunes low-attention visual tokens. Training-free plug-and-play: 45% FLOPs cut on LLaVA-1.5-13B with no performance loss.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/fastv/";
          
        },
      },{id: "post-madtp-multimodal-alignment-guided-dynamic-token-pruning-for-accelerating-vision-language-transformer",
        
          title: "[MADTP] Multimodal Alignment-Guided Dynamic Token Pruning for Accelerating Vision-Language Transformer",
        
        description: "Prunes tokens inside vision-language Transformers, but guided by cross-modal alignment (MAG) so a token isn&#39;t cut in one branch while still vital in the other — plus per-layer, per-instance dynamic ratios (DTP). 80% fewer GFLOPs on BLIP/NLVR2 with &lt;4% drop.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2024/madtp/";
          
        },
      },{id: "post-internvl-scaling-up-vision-foundation-models-and-aligning-for-generic-visual-linguistic-tasks",
        
          title: "[InternVL] Scaling up Vision Foundation Models and Aligning for Generic Visual-Linguistic Tasks",
        
        description: "Argues the vision encoder is too small next to the LLM, so it scales the encoder to 6B (InternViT-6B) and bridges it with an 8B language middleware (QLLaMA) via progressive contrastive→generative alignment.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/internvl/";
          
        },
      },{id: "post-gemini-a-family-of-highly-capable-multimodal-models",
        
          title: "[Gemini] A Family of Highly Capable Multimodal Models",
        
        description: "Google&#39;s frontier family (Ultra/Pro/Nano) trained jointly across image, audio, video, and text from the beginning — natively multimodal rather than bolting a vision encoder onto a pretrained LLM.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/gemini/";
          
        },
      },{id: "post-token-cropr-token-cropr-faster-vits-for-quite-a-few-tasks",
        
          title: "[Token Cropr] Token Cropr: Faster ViTs for Quite a Few Tasks",
        
        description: "Prunes tokens by task relevance using auxiliary cross-attention heads that are thrown away after training, plus Last Layer Fusion to revive pruned tokens for dense tasks.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/token-cropr/";
          
        },
      },{id: "post-frequency-aware-tr-frequency-aware-token-reduction-for-efficient-vision-transformer",
        
          title: "[Frequency-Aware TR] Frequency-Aware Token Reduction for Efficient Vision Transformer",
        
        description: "Reads token reduction through a frequency lens: keeps high-frequency tokens (which fight rank collapse) and squeezes the low-frequency rest into a compact DC token.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/frequency-aware-token-reduction/";
          
        },
      },{id: "post-llava-1-5-improved-baselines-with-visual-instruction-tuning",
        
          title: "[LLaVA-1.5] Improved Baselines with Visual Instruction Tuning",
        
        description: "A systematic study of LLaVA&#39;s design choices — an MLP connector, a 336px CLIP encoder, and academic-task VQA data with response-format prompts — sets SOTA on 11 benchmarks with only public data.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/llava1-5/";
          
        },
      },{id: "post-mctf-multi-criteria-token-fusion-with-one-step-ahead-attention-for-efficient-vision-transformers",
        
          title: "[MCTF] Multi-criteria Token Fusion with One-step-ahead Attention for Efficient Vision Transformers",
        
        description: "Fuses tokens by a product of three criteria — similarity, informativeness, size — with one-step-ahead attention and bidirectional bipartite matching, beating the base model while cutting FLOPs.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/mctf/";
          
        },
      },{id: "post-star-synergistic-patch-pruning-for-vision-transformer-unifying-intra-amp-inter-layer-patch-importance",
        
          title: "[STAR] Synergistic Patch Pruning for Vision Transformer: Unifying Intra- &amp; Inter-Layer Patch Importance...",
        
        description: "Fuses online intra-layer [CLS] attention with offline inter-layer LRP importance, and auto-tunes per-layer retention rates from patch similarity.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/star/";
          
        },
      },{id: "post-qwen-vl-a-versatile-vision-language-model-for-understanding-localization-text-reading-and-beyond",
        
          title: "[Qwen-VL] A Versatile Vision-Language Model for Understanding, Localization, Text Reading, and Beyond",
        
        description: "Adds vision to Qwen-7B via a ViT + position-aware cross-attention adapter (256 query tokens), trained in 3 stages — and adds grounding and text-reading via box/ref special tokens.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/qwen-vl/";
          
        },
      },{id: "post-token-fusion-tofu-bridging-the-gap-between-token-pruning-and-token-merging",
        
          title: "[Token Fusion / ToFu] Bridging the Gap between Token Pruning and Token Merging...",
        
        description: "Switches between pruning (early layers) and merging (later layers) by each layer&#39;s functional linearity, with a norm-preserving MLERP merge.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/tofu/";
          
        },
      },{id: "post-p-former-bootstrapping-vision-language-learning-with-decoupled-language-pre-training",
        
          title: "[P-Former] Bootstrapping Vision-Language Learning with Decoupled Language Pre-training",
        
        description: "Flips the usual connector training: instead of asking &#39;which visual features make a good prompt&#39;, P-Former first learns — from text only — the ideal &#39;reference prompt&#39; a frozen LLM needs, then aligns visual features to it. A training-only module that boosts BLIP-2&#39;s data efficiency.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/p-former/";
          
        },
      },{id: "post-dtem-learning-to-merge-tokens-via-decoupled-embedding-for-efficient-vision-transformers",
        
          title: "[DTEM] Learning to Merge Tokens via Decoupled Embedding for Efficient Vision Transformers",
        
        description: "Learns a lightweight embedding dedicated to merging — decoupled from the ViT forward pass — via a continuously relaxed (differentiable) token merging.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/dtem/";
          
        },
      },{id: "post-zero-tprune-zero-shot-token-pruning-through-leveraging-of-the-attention-graph-in-pre-trained-transformers",
        
          title: "[Zero-TPrune] Zero-Shot Token Pruning through Leveraging of the Attention Graph in Pre-Trained Transformers...",
        
        description: "Treats the attention matrix as a directed graph and ranks tokens with a Weighted PageRank — pruning without any fine-tuning.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/zero-tprune/";
          
        },
      },{id: "post-instructblip-towards-general-purpose-vision-language-models-with-instruction-tuning",
        
          title: "[InstructBLIP] Towards General-purpose Vision-Language Models with Instruction Tuning",
        
        description: "Instruction-tunes BLIP-2 on 26 datasets, and makes the Q-Former instruction-aware — feeding the instruction to the Q-Former so it extracts visual features tailored to the task.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/instructblip/";
          
        },
      },{id: "post-token-pooling-token-pooling-in-vision-transformers",
        
          title: "[Token Pooling] Token Pooling in Vision Transformers",
        
        description: "Reframes token downsampling as minimizing reconstruction error, and solves it with simple, parameter-free clustering (K-Means / K-Medoids).",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/token-pooling/";
          
        },
      },{id: "post-minigpt-4-enhancing-vision-language-understanding-with-advanced-large-language-models",
        
          title: "[MiniGPT-4] Enhancing Vision-Language Understanding with Advanced Large Language Models",
        
        description: "Aligns a frozen vision encoder (BLIP-2&#39;s ViT+Q-Former) and a frozen Vicuna with a single linear projection layer — showing GPT-4-like abilities emerge from minimal alignment of a strong LLM.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/minigpt-4/";
          
        },
      },{id: "post-llava-visual-instruction-tuning",
        
          title: "[LLaVA] Visual Instruction Tuning",
        
        description: "Uses language-only GPT-4 to generate multimodal instruction-following data, then connects a frozen CLIP encoder to Vicuna with a single linear projection and instruction-tunes end-to-end.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/llava/";
          
        },
      },{id: "post-tps-joint-token-pruning-amp-squeezing-towards-more-aggressive-compression-of-vision-transformers",
        
          title: "[TPS] Joint Token Pruning &amp; Squeezing Towards More Aggressive Compression of Vision Transformers...",
        
        description: "Instead of throwing pruned tokens away, squeezes their information into the surviving &#39;host&#39; tokens — parameter-free matching + similarity-based fusing.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/tps/";
          
        },
      },{id: "post-eva-clip-improved-training-techniques-for-clip-at-scale",
        
          title: "[EVA-CLIP] Improved Training Techniques for CLIP at Scale",
        
        description: "Makes CLIP training cheaper and more stable at scale — EVA initialization, the LAMB optimizer, random token dropping, and flash attention — reaching 82.0% zero-shot ImageNet with far fewer samples. The vision encoder many VLMs (e.g., BLIP-2) reuse.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/eva-clip/";
          
        },
      },{id: "post-diffrate-differentiable-compression-rate-for-efficient-vision-transformers",
        
          title: "[DiffRate] Differentiable Compression Rate for Efficient Vision Transformers",
        
        description: "Makes the per-layer compression rate differentiable, and prunes + merges in one unified framework.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/diffrate/";
          
        },
      },{id: "post-kosmos-1-language-is-not-all-you-need-aligning-perception-with-language-models",
        
          title: "[Kosmos-1] Language Is Not All You Need: Aligning Perception with Language Models",
        
        description: "A multimodal LLM trained from scratch on web-scale interleaved image-text — perceiving general modalities, learning in context (few-shot), and following instructions (zero-shot), without a frozen LLM.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/kosmos-1/";
          
        },
      },{id: "post-tome-token-merging-your-vit-but-faster",
        
          title: "[ToMe] Token Merging: Your ViT But Faster",
        
        description: "Combine similar tokens (not prune) via bipartite soft matching, fast as pruning, works even without training.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/tome/";
          
        },
      },{id: "post-blip-2-bootstrapping-language-image-pre-training-with-frozen-image-encoders-and-large-language-models",
        
          title: "[BLIP-2] Bootstrapping Language-Image Pre-training with Frozen Image Encoders and Large Language Models",
        
        description: "Bridges a frozen image encoder and a frozen LLM with a lightweight Querying Transformer (Q-Former), pre-trained in two stages — representation learning then generative learning.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/blip2/";
          
        },
      },{id: "post-as-vit-adaptive-sparse-vit-learnable-adaptive-token-pruning-by-fully-exploiting-self-attention",
        
          title: "[AS-ViT] Adaptive Sparse ViT: Learnable Adaptive Token Pruning by Fully Exploiting Self-Attention",
        
        description: "Learnable thresholds replace fixed keep-ratios, scoring tokens for free from MHSA&#39;s own intermediate results.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/adaptive-sparse-vit/";
          
        },
      },{id: "post-flamingo-flamingo-a-visual-language-model-for-few-shot-learning",
        
          title: "[Flamingo] Flamingo: a Visual Language Model for Few-Shot Learning",
        
        description: "Bridges a frozen vision encoder and a frozen LLM with a Perceiver Resampler + gated cross-attention, unlocking GPT-3-style few-shot in-context learning on image/video tasks.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2022/flamingo/";
          
        },
      },{id: "post-ats-adaptive-token-sampling-for-efficient-vision-transformers",
        
          title: "[ATS] Adaptive Token Sampling for Efficient Vision Transformers",
        
        description: "Parameter-free, picks a variable number of tokens per image by sampling the attention CDF.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2022/ats/";
          
        },
      },{id: "post-evo-vit-slow-fast-token-evolution-for-dynamic-vision-transformer",
        
          title: "[Evo-ViT] Slow-Fast Token Evolution for Dynamic Vision Transformer",
        
        description: "Keep all tokens but update informative vs placeholder tokens on different paths.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2022/evo-vit/";
          
        },
      },{id: "post-evit-not-all-patches-are-what-you-need-expediting-vits-via-token-reorganizations",
        
          title: "[EViT] Not All Patches Are What You Need: Expediting ViTs via Token Reorganizations...",
        
        description: "Keep top-k attentive tokens by CLS attention, fuse the rest into one.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2022/evit/";
          
        },
      },{id: "post-blip-bootstrapping-language-image-pre-training-for-unified-vision-language-understanding-and-generation",
        
          title: "[BLIP] Bootstrapping Language-Image Pre-training for Unified Vision-Language Understanding and Generation",
        
        description: "A unified vision-language model (MED) that handles both understanding and generation, plus CapFilt — a captioner+filter that bootstraps noisy web captions into cleaner training data.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2022/blip/";
          
        },
      },{id: "post-tokenlearner-what-can-8-learned-tokens-do-for-images-and-videos",
        
          title: "[TokenLearner] What Can 8 Learned Tokens Do for Images and Videos?",
        
        description: "Learns a handful of adaptive tokens instead of a dense uniform grid.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/tokenlearner/";
          
        },
      },{id: "post-dynamicvit-efficient-vision-transformers-with-dynamic-token-sparsification",
        
          title: "[DynamicViT] Efficient Vision Transformers with Dynamic Token Sparsification",
        
        description: "Dynamically drops redundant tokens per input to speed up ViTs.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/dynamicvit/";
          
        },
      },{id: "post-clip-learning-transferable-visual-models-from-natural-language-supervision",
        
          title: "[CLIP] Learning Transferable Visual Models From Natural Language Supervision",
        
        description: "Trains an image encoder and a text encoder to match images with their captions (contrastive) on 400M web pairs — enabling open-vocabulary zero-shot transfer, and becoming the vision encoder most VLMs freeze and reuse.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/clip/";
          
        },
      },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-received-the-부총리-겸-과학기술정보통신부-장관상-at-the-2025-자율주행-인공지능-챌린지-semantic-segmentation-track",
          title: 'Received the 부총리 겸 과학기술정보통신부 장관상 at the 2025 자율주행 인공지능 챌린지 (Semantic...',
          description: "",
          section: "News",},{id: "news-the-paper-one-cycle-structured-pruning-with-stability-driven-structure-search-has-been-accepted-to-wacv-2026",
          title: 'The paper One-cycle Structured Pruning with Stability Driven Structure Search has been accepted...',
          description: "",
          section: "News",},{id: "news-team-ssuper-power-finished-2nd-place-in-track-3-ai-generated-images-detection-of-the-2026-ieee-low-power-computer-vision-challenge-held-at-the-ecv-workshop-at-cvpr-2026-denver-co-sponsored-by-qualcomm-results",
          title: 'Team SSUPER_POWER finished 2nd place in Track 3 (AI Generated Images Detection) of...',
          description: "",
          section: "News",},{id: "news-filed-two-korean-patent-applications-inference-aware-pruning-and-query-guided-reclamation-based-token-compression-system-and-method-for-vision-language-models-application-no-10-2026-0101880-and-pruning-method-for-one-cycle-based-neural-network-model-and-computing-device-for-performing-same-application-no-10-2026-0081765",
          title: 'Filed two Korean patent applications: Inference-Aware Pruning and Query-Guided Reclamation-Based Token Compression System...',
          description: "",
          section: "News",},{id: "projects-face-out",
          title: 'Face Out',
          description: "2021 · 🏆 Honorable Mention ×2 — a web app that blurs every face in a photo or video except the one you choose.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/face-out/";
            },},{id: "projects-ai-generated-image-detection-on-edge",
          title: 'AI-Generated Image Detection on Edge',
          description: "2026 · 🥈 LPCVC Track 3, 2nd Place — an on-device vision-language model that detects AI-generated images and explains why.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/lpcv-2026-aigid/";
            },},{id: "projects-lightweight-room-layout-estimation",
          title: 'Lightweight Room Layout Estimation',
          description: "2022 · ICCAS — lightweight 3D room layout estimation from a single panorama.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/room-layout-lightweight/";
            },},{id: "teachings-data-science-fundamentals",
          title: 'Data Science Fundamentals',
          description: "This course covers the foundational aspects of data science, including data collection, cleaning, analysis, and visualization. Students will learn practical skills for working with real-world datasets.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/data-science-fundamentals/";
            },},{id: "teachings-introduction-to-machine-learning",
          title: 'Introduction to Machine Learning',
          description: "This course provides an introduction to machine learning concepts, algorithms, and applications. Students will learn about supervised and unsupervised learning, model evaluation, and practical implementations.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/introduction-to-machine-learning/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%64%61%79%6F%75%6E%67%6B%69%6C@%73%6F%6F%6E%67%73%69%6C.%61%63.%6B%72", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0000-0002-1341-4734", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=UhhLl8AAAAAJ", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/Dayoung-Kil", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/dayoung-kil", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
