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
        },{id: "post-token-reduction-overview",
        
          title: "Token Reduction — Overview",
        
        description: "ViT token efficiency — Pruning · Merging · Pooling · Hybrid, with 17 key papers at a glance.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/token-reduction-overview/";
          
        },
      },{id: "post-evo-vit-slow-fast-token-evolution-for-dynamic-vision-transformer",
        
          title: "[Evo-ViT] Slow-Fast Token Evolution for Dynamic Vision Transformer",
        
        description: "AAAI 2022 · Pruning — keep all tokens but update informative vs placeholder tokens on different paths.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2022/evo-vit/";
          
        },
      },{id: "post-evit-not-all-patches-are-what-you-need-expediting-vits-via-token-reorganizations",
        
          title: "[EViT] Not All Patches Are What You Need: Expediting ViTs via Token Reorganizations...",
        
        description: "ICLR 2022 · Pruning — keep top-k attentive tokens by CLS attention, fuse the rest into one.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2022/evit/";
          
        },
      },{id: "post-tokenlearner-what-can-8-learned-tokens-do-for-images-and-videos",
        
          title: "[TokenLearner] What Can 8 Learned Tokens Do for Images and Videos?",
        
        description: "NeurIPS 2021 · Pooling — learns a handful of adaptive tokens instead of a dense uniform grid.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2021/tokenlearner/";
          
        },
      },{id: "post-dynamicvit-efficient-vision-transformers-with-dynamic-token-sparsification",
        
          title: "[DynamicViT] Efficient Vision Transformers with Dynamic Token Sparsification",
        
        description: "NeurIPS 2021 · Pruning — dynamically drops redundant tokens per input to speed up ViTs.",
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
