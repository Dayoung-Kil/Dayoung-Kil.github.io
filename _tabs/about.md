---
# the default layout is 'page'
icon: fas fa-info-circle
order: 4
---

<style>
/* --- Page-scoped tweaks (Chirpy 톤 유지) --- */
.about-hero {
  border: 1px solid var(--bs-border-color, #dee2e6);
  border-radius: 1rem;
  background:
    radial-gradient(60% 100% at 100% 0%, color-mix(in srgb, var(--bs-primary, #0d6efd) 7%, transparent) 0%, transparent 60%),
    var(--bs-body-bg, #fff);
  padding: 1.5rem 1.6rem;
  margin: 0 0 1rem 0;
}
.about-hero h1 {
  font-weight: 800;
  font-size: clamp(1.4rem, 1.1rem + 1vw, 1.8rem);
  margin: 0 0 .4rem 0;
}
.about-hero p {
  margin: .4rem 0 0 0;
  color: var(--bs-secondary-color, #6c757d);
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: .9rem;
  margin: 1rem 0 1.25rem 0;
}
@media (min-width: 768px) {
  .about-grid { grid-template-columns: repeat(3, 1fr); }
}
.about-card {
  border: 1px solid var(--bs-border-color, #dee2e6);
  border-radius: .85rem;
  background: var(--bs-body-bg, #fff);
  box-shadow: 0 1px 2px rgba(0,0,0,.04);
  padding: 1rem 1.1rem;
}
.about-card h3 {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 .5rem 0;
  display: flex; align-items: center; gap: .45rem;
}
.about-card ul { margin: 0; padding-left: 1.1rem; }
.about-card li { margin: .25rem 0; }

.cta {
  display: flex; gap: .5rem; flex-wrap: wrap;
  margin-top: .4rem;
}
.cta a {
  border: 1px solid var(--bs-border-color, #dee2e6);
  border-radius: 999px;
  padding: .45rem .75rem;
  text-decoration: none;
  color: var(--bs-body-color, #212529);
  transition: transform .08s ease, border-color .2s ease, background-color .2s ease;
}
.cta a:hover {
  transform: translateY(-1px);
  border-color: var(--bs-primary, #0d6efd);
  background: color-mix(in srgb, var(--bs-primary, #0d6efd) 8%, transparent);
}

.hr-soft {
  border: 0; border-top: 1px solid var(--bs-border-color, #dee2e6);
  opacity: .6; margin: 1.25rem 0;
}
</style>

<section class="about-hero">
  <h1><i class="fas fa-info-circle"></i> About this site</h1>
  <p>
    This site is where I document my research journey, share technical notes, and explore ideas in
    <strong>computer vision</strong>, <strong>efficient deep learning</strong>, and <strong>multimodal AI</strong>.
    I care about <em>hardware/energy efficiency</em> and turning models into <em>deployable, real-world systems</em>.
  </p>
</section>

<div class="about-grid">
  <div class="about-card">
    <h3><i class="fas fa-lightbulb"></i> What I work on</h3>
    <ul>
      <li>Vision & Vision-Language models (LVLMs, MM-LLMs)</li>
      <li>Model compression &amp; pruning, NAS, distillation</li>
      <li>On-device &amp; hardware-aware optimization</li>
    </ul>
  </div>

  <div class="about-card">
    <h3><i class="fas fa-compass"></i> Current focus</h3>
    <ul>
      <li>Latency/throughput–aware training &amp; scheduling</li>
      <li>Memory-efficient inference under tight budgets</li>
      <li>Reliable evaluation for real deployments</li>
    </ul>
  </div>

  <div class="about-card">
    <h3><i class="fas fa-toolbox"></i> Tools I use</h3>
    <ul>
      <li>PyTorch, TensorRT / ONNX Runtime</li>
      <li>OpenMMLab, Detectron2, YOLO family</li>
      <li>Python, C/C++, GitHub Actions</li>
    </ul>
  </div>
</div>

<hr class="hr-soft">

<section class="about-card">
  <h3><i class="fas fa-hands-helping"></i> Open to</h3>
  <ul>
    <li>Collaborations on efficient vision &amp; multimodal models</li>
    <li>Benchmarking &amp; deployment of compact architectures</li>
    <li>Student mentoring and research discussions</li>
  </ul>

  <div class="cta" aria-label="quick links">
    <a href="mailto:dayoungkil@soongsil.ac.kr"><i class="fas fa-envelope"></i> Email</a>
    <a href="https://www.linkedin.com/in/dayoung-kil/" target="_blank" rel="noopener">
      <i class="fab fa-linkedin"></i> LinkedIn
    </a>
    <a href="https://scholar.google.com/citations?user=UhhLl8AAAAAJ&hl=ko" target="_blank" rel="noopener">
      <i class="fas fa-graduation-cap"></i> Google Scholar
    </a>
    <a href="https://github.com/dayoung-kil" target="_blank" rel="noopener">
      <i class="fab fa-github"></i> GitHub
    </a>
  </div>
</section>

