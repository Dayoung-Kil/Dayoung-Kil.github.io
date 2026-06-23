---
layout: default
permalink: /blog/
title: notes
nav: true
nav_order: 6
pagination:
  enabled: false
---

<style>
  .post .post-list li { margin-bottom: 0.55rem; padding-top: 1rem; padding-bottom: 0; border-bottom: none; }
  .post .post-list h3 + p { font-size: 0.82rem; line-height: 1.5; margin-bottom: 0.35rem; }
  .post .post-list .post-meta { font-size: 0.72rem; margin-bottom: 0.2rem; }
  .post .post-list .post-tags { font-size: 0.72rem; margin-bottom: 0; }
  /* notes 목록 제목: 테마 전역 h3 대문자 규칙을 이 페이지에서만 정상 대소문자로 되돌림 */
  .post .post-list .post-title { text-transform: none; font-weight: 700; letter-spacing: -0.005em; }
  /* Contents 사이드바: 항목 간 간격 축소 */
  nav.sticky-top .list-unstyled li { margin-bottom: 0.2rem; line-height: 1.3; }
  nav.sticky-top p.mb-1 { margin-bottom: 0.1rem; margin-top: 0.4rem; }
  /* Contents 펼침/접힘 caret 회전 */
  nav.sticky-top a[data-toggle="collapse"] .fa-caret-down { transition: transform 0.2s ease; }
  nav.sticky-top a[data-toggle="collapse"].collapsed .fa-caret-down { transform: rotate(-90deg); }
  /* 카테고리 칩(pill) */
  .post a.cat-chip { display: inline-block; padding: 0.05rem 0.5rem; border-radius: 999px; background-color: rgba(110,133,183,0.12); color: #6e85b7; font-weight: 600; line-height: 1.4; text-decoration: none; }
  .post a.cat-chip:hover { background-color: rgba(110,133,183,0.22); }
  /* 메서드 태그 칩(pill) */
  .post .post-list .post-tags a.tag-chip { display: inline-block; padding: 0.05rem 0.5rem; border-radius: 999px; font-weight: 600; line-height: 1.4; text-decoration: none; }
  .post .post-list .post-tags a.tag-chip:hover { filter: brightness(0.94); }
  .post .post-list .post-tags a.tag-chip .fa-hashtag { opacity: 0.65; }
  /* Contents 사이드바: 방법 계열 헤더 칩 */
  nav.sticky-top .ct-type { display:inline-block; padding:0.02rem 0.5rem; border-radius:999px; font-size:0.66rem; font-weight:700; letter-spacing:0.02em; }
  /* Contents 사이드바: 글씨 검정 (venue 회색은 유지) */
  nav.sticky-top a { color:#1c1c1d; }
  nav.sticky-top a:hover { color:#6e85b7; }
  nav.sticky-top a.cat-chip { color:#1c1c1d; background-color:rgba(0,0,0,0.05); }
  /* featured 핵심 논문 카드 — extra compact */
  .post .featured-posts .card-body { padding:0.5rem 0.65rem; }
  .post .featured-posts .card-title { text-transform:none; font-weight:700; font-size:0.82rem; letter-spacing:-0.01em; margin-bottom:0.25rem; }
  .post .featured-posts .card-text { font-size:0.68rem; line-height:1.45; margin-bottom:0; color:var(--global-text-color); }
  .post .featured-posts .badge { font-size:0.52rem; font-weight:600; }
  .post .feat-cat { font-weight:600; color:#93a4c8; font-size:0.8rem; margin:0.7rem 0 0.3rem; }
  /* 메인 랜딩: 카테고리 섹션 헤더 */
  .post h2.cat-section { font-size:1.15rem; font-weight:800; color:#6e85b7; margin:1.8rem 0 0.2rem; padding-bottom:0.3rem; border-bottom:2px solid rgba(110,133,183,0.25); text-transform:none; }
  .post h2.cat-section:first-of-type { margin-top:0.4rem; }
  .post h2.cat-section .cat-count { font-size:0.8rem; font-weight:600; color:#93a4c8; }
  .post .cat-more { font-size:0.8rem; }
</style>

<div class="post">

<div class="row">
  {% if site.categories.size > 0 %}
  <div class="col-lg-3 mb-4 order-2 order-lg-1">
    {% include notes_contents.liquid %}
  </div>
  {% endif %}
  <div class="col-lg-9 order-1 order-lg-2">

  {% comment %} 랜딩: 카테고리별 Overview + Key papers만 (전체 목록은 카테고리 페이지에서) {% endcomment %}
  {% for cat in site.categories %}
    {% assign cat_slug = cat[0] %}
    {% assign cat_fallback = cat_slug | replace: '-', ' ' | capitalize %}
    {% assign cat_name = site.data.note_categories[cat_slug].name | default: cat_fallback %}
    {% assign overviews = cat[1] | where_exp: "p", "p.tags contains 'survey'" %}
    {% assign keypapers = cat[1] | where: "featured", "true" | sort: "date" %}
    {% assign total = cat[1] | size %}

    <h2 class="cat-section"><a href="{{ cat_slug | slugify | prepend: '/blog/category/' | relative_url }}" style="color:inherit;text-decoration:none">{{ cat_name }}</a> <span class="cat-count">({{ total }})</span></h2>

    {% comment %} Overview 카드 {% endcomment %}
    {% if overviews.size > 0 %}
    <ul class="post-list mb-1">
      {% for post in overviews %}
      <li>
        {% if post.thumbnail %}<div class="row"><div class="col-sm-9">{% endif %}
        <h3><a class="post-title" href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
        <p>{{ post.description }}</p>
        <p class="post-tags mb-0"><a class="cat-chip" href="{{ post.url | relative_url }}"><i class="fa-solid fa-book-open fa-sm"></i> Overview</a></p>
        {% if post.thumbnail %}</div><div class="col-sm-3"><img class="card-img" src="{{ post.thumbnail | relative_url }}" style="object-fit: cover; height: 90%" alt="image"></div></div>{% endif %}
      </li>
      {% endfor %}
    </ul>
    {% endif %}

    {% comment %} Key papers {% endcomment %}
    {% if keypapers.size > 0 %}
    <p class="feat-cat">Key papers</p>
    <div class="container featured-posts px-0">
      <div class="row row-cols-1 row-cols-md-3">
        {% for post in keypapers %}
        <div class="col mb-2">
          <a href="{{ post.url | relative_url }}" class="text-decoration-none">
            <div class="card hoverable h-100">
              {% if post.thumbnail %}<img class="card-img-top" src="{{ post.thumbnail | relative_url }}" style="height:110px;object-fit:contain;background-color:#f5f5f7;padding:3px" alt="">{% endif %}
              <div class="card-body">
              <h3 class="card-title">{{ post.shortname | default: post.title }}</h3>
              <div class="mb-2">
                {% for tag in post.tags %}{% assign tc = site.data.note_tags[tag] %}{% if tc %}<span class="badge rounded-pill me-1" style="background-color:{{ tc.bg }};color:{{ tc.fg }}">{{ tag | capitalize }}</span>{% endif %}{% endfor %}
                {% if post.venue %}<span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">{{ post.venue }}</span>{% endif %}
              </div>
              <p class="card-text">{{ post.description }}</p>
            </div></div>
          </a>
        </div>
        {% endfor %}
      </div>
    </div>
    {% endif %}

    <p class="cat-more mt-2 mb-4"><a class="cat-chip" href="{{ cat_slug | slugify | prepend: '/blog/category/' | relative_url }}">{{ cat_name }} 전체 {{ total }}개 보기 →</a></p>
  {% endfor %}

  </div>
</div>
</div>
