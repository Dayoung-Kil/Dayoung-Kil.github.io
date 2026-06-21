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
        },{id: "post-token-reduction-in-vits-overview",
        
          title: "Token Reduction in ViTs — Overview",
        
        description: "ViT token efficiency — Pruning · Merging · Pooling · Hybrid, with 17 key papers at a glance.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/token-reduction-overview/";
          
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
      },{id: "post-token-fusion-tofu-bridging-the-gap-between-token-pruning-and-token-merging",
        
          title: "[Token Fusion / ToFu] Bridging the Gap between Token Pruning and Token Merging...",
        
        description: "Switches between pruning (early layers) and merging (later layers) by each layer&#39;s functional linearity, with a norm-preserving MLERP merge.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/tofu/";
          
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
      },{id: "post-token-pooling-token-pooling-in-vision-transformers",
        
          title: "[Token Pooling] Token Pooling in Vision Transformers",
        
        description: "Reframes token downsampling as minimizing reconstruction error, and solves it with simple, parameter-free clustering (K-Means / K-Medoids).",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/token-pooling/";
          
        },
      },{id: "post-tps-joint-token-pruning-amp-squeezing-towards-more-aggressive-compression-of-vision-transformers",
        
          title: "[TPS] Joint Token Pruning &amp; Squeezing Towards More Aggressive Compression of Vision Transformers...",
        
        description: "Instead of throwing pruned tokens away, squeezes their information into the surviving &#39;host&#39; tokens — parameter-free matching + similarity-based fusing.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/tps/";
          
        },
      },{id: "post-diffrate-differentiable-compression-rate-for-efficient-vision-transformers",
        
          title: "[DiffRate] Differentiable Compression Rate for Efficient Vision Transformers",
        
        description: "Makes the per-layer compression rate differentiable, and prunes + merges in one unified framework.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/diffrate/";
          
        },
      },{id: "post-tome-token-merging-your-vit-but-faster",
        
          title: "[ToMe] Token Merging: Your ViT But Faster",
        
        description: "Combine similar tokens (not prune) via bipartite soft matching, fast as pruning, works even without training.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/tome/";
          
        },
      },{id: "post-as-vit-adaptive-sparse-vit-learnable-adaptive-token-pruning-by-fully-exploiting-self-attention",
        
          title: "[AS-ViT] Adaptive Sparse ViT: Learnable Adaptive Token Pruning by Fully Exploiting Self-Attention",
        
        description: "Learnable thresholds replace fixed keep-ratios, scoring tokens for free from MHSA&#39;s own intermediate results.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2023/adaptive-sparse-vit/";
          
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
