---
layout: default
permalink: /blog/
title: notes
nav: true
nav_order: 6
pagination:
  enabled: true
  collection: posts
  permalink: /page/:num/
  per_page: 5
  sort_field: date
  sort_reverse: true
  trail:
    before: 1 # The number of links before the current page
    after: 3 # The number of links after the current page
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
  /* 카테고리 칩(pill) — 상단 목록 + 각 노트 하단 공통 */
  .post a.cat-chip {
    display: inline-block; padding: 0.05rem 0.5rem; border-radius: 999px;
    background-color: rgba(93,92,152,0.12); color: #5d5c98; font-weight: 600;
    line-height: 1.4; text-decoration: none;
  }
  .post a.cat-chip:hover { background-color: rgba(93,92,152,0.22); }
  /* 메서드 태그 칩(pill) — 색은 분류 배지와 동일 */
  .post .post-list .post-tags a.tag-chip {
    display: inline-block; padding: 0.05rem 0.5rem; border-radius: 999px;
    font-weight: 600; line-height: 1.4; text-decoration: none;
  }
  .post .post-list .post-tags a.tag-chip:hover { filter: brightness(0.94); }
  .post .post-list .post-tags a.tag-chip .fa-hashtag { opacity: 0.65; }
  /* Contents 사이드바: 방법 계열 헤더 칩 */
  nav.sticky-top .ct-type { display:inline-block; padding:0.02rem 0.5rem; border-radius:999px; font-size:0.66rem; font-weight:700; letter-spacing:0.02em; }
  /* featured 핵심 논문 카드 — extra compact */
  .post .featured-posts .card-body { padding:0.5rem 0.65rem; }
  .post .featured-posts .card-title { text-transform:none; font-weight:700; font-size:0.82rem; letter-spacing:-0.01em; margin-bottom:0.25rem; }
  .post .featured-posts .card-text { font-size:0.68rem; line-height:1.45; margin-bottom:0; color:var(--global-text-color); }
  .post .featured-posts .badge { font-size:0.52rem; font-weight:600; }
</style>

<div class="post">

{% comment %} notes 페이지 상단 제목/부제(header-bar) 제거 — 깔끔한 목록만 표시 {% endcomment %}

<div class="row">
  {% if site.categories.size > 0 %}
  <div class="col-lg-3 mb-4 order-2 order-lg-1">
    <nav class="sticky-top" style="top:5rem;font-size:0.85rem;">
      <h6 class="mb-2" style="font-weight:700;color:#5d5c98">Contents</h6>
      {% for cat in site.categories %}
        {% assign survey_count = cat[1] | where_exp: "p", "p.tags contains 'survey'" | size %}
        {% assign paper_count = cat[1] | size | minus: survey_count %}
        {% assign cat_slug = cat[0] %}
        {% assign cat_fallback = cat_slug | replace: '-', ' ' | capitalize %}
        {% assign cat_name = site.data.note_categories[cat_slug].name | default: cat_fallback %}
        <p class="mb-1 mt-2">
          <a data-toggle="collapse" href="#contents-{{ forloop.index }}" role="button" aria-expanded="true" class="d-block text-decoration-none" style="font-weight:700;color:#5d5c98">
            <i class="fa-solid fa-caret-down fa-xs mr-1"></i>{{ cat_name }} <span style="font-weight:600;color:#9a99c0">({{ paper_count }})</span>
          </a>
        </p>
        <div class="collapse show" id="contents-{{ forloop.index }}">
          <ul class="list-unstyled mb-3" style="padding-left:0.9rem;font-size:0.78rem">
            {% comment %} survey/overview 먼저 고정 {% endcomment %}
            {% for post in cat[1] %}{% if post.tags contains 'survey' %}
              <li class="mb-2"><a href="{{ post.url | relative_url }}">{{ post.shortname | default: post.title }}</a></li>
            {% endif %}{% endfor %}
            {% comment %} 방법 계열별 그룹 (그룹 내 연도순) {% endcomment %}
            {% assign type_order = "pruning,merging,pooling,hybrid" | split: "," %}
            {% for t in type_order %}
              {% assign group = cat[1] | where_exp: "p", "p.tags contains t" | sort: "date" %}
              {% if group.size > 0 %}
                {% assign tc = site.data.note_tags[t] %}
                <li class="mt-2 mb-1"><span class="ct-type" style="background-color:{{ tc.bg }};color:{{ tc.fg }}">{{ t | capitalize }}</span></li>
                {% for post in group %}
                <li class="mb-1" style="padding-left:0.25rem"><a href="{{ post.url | relative_url }}">{{ post.shortname | default: post.title }}</a>{% if post.venue %} <span class="text-muted" style="font-size:0.66rem">{{ post.venue }}</span>{% endif %}</li>
                {% endfor %}
              {% endif %}
            {% endfor %}
          </ul>
        </div>
      {% endfor %}
    </nav>
  </div>
  {% endif %}
  <div class="col-lg-9 order-1 order-lg-2">

{% if site.display_tags and site.display_tags.size > 0 or site.display_categories and site.display_categories.size > 0 %}

  <div class="tag-category-list">
    <ul class="p-0 m-0">
      {% for tag in site.display_tags %}
        <li>
          <i class="fa-solid fa-hashtag fa-sm"></i> <a href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}">{{ tag }}</a>
        </li>
        {% unless forloop.last %}
          <p>&bull;</p>
        {% endunless %}
      {% endfor %}
      {% if site.display_categories.size > 0 and site.display_tags.size > 0 %}
        <p>&bull;</p>
      {% endif %}
      {% for category in site.display_categories %}
        {% assign cat_fallback = category | replace: '-', ' ' | capitalize %}
        {% assign cat_name = site.data.note_categories[category].name | default: cat_fallback %}
        <li>
          <a class="cat-chip" href="{{ category | slugify | prepend: '/blog/category/' | relative_url }}"><i class="fa-solid fa-tag fa-sm"></i> {{ cat_name }}</a>
        </li>
        {% unless forloop.last %}
          <p>&bull;</p>
        {% endunless %}
      {% endfor %}
    </ul>
  </div>
  {% endif %}

{% assign featured_posts = site.posts | where: "featured", "true" | sort: "date" %}
{% if featured_posts.size > 0 %}

<p class="mb-2" style="font-weight:700;color:#5d5c98">Key papers <span style="font-weight:600;color:#9a99c0;font-size:0.85rem">— start here to follow the storyline</span></p>

<div class="container featured-posts px-0">
<div class="row row-cols-1 row-cols-md-3">
{% for post in featured_posts %}
<div class="col mb-2">
<a href="{{ post.url | relative_url }}" class="text-decoration-none">
<div class="card hoverable h-100">
<div class="card-body">
<h3 class="card-title">{{ post.shortname | default: post.title }}</h3>
<div class="mb-2">
{% for tag in post.tags %}{% assign tc = site.data.note_tags[tag] %}{% if tc %}<span class="badge rounded-pill me-1" style="background-color:{{ tc.bg }};color:{{ tc.fg }}">{{ tag | capitalize }}</span>{% endif %}{% endfor %}
{% if post.venue %}<span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">{{ post.venue }}</span>{% endif %}
</div>
<p class="card-text">{{ post.description }}</p>
</div>
</div>
</a>
</div>
{% endfor %}
</div>
</div>
<hr>

{% endif %}

  <ul class="post-list">

    {% if page.pagination.enabled %}
      {% assign postlist = paginator.posts %}
    {% else %}
      {% assign postlist = site.posts %}
    {% endif %}

    {% for post in postlist %}

    {% if post.external_source == blank %}
      {% assign read_time = post.content | number_of_words | divided_by: 180 | plus: 1 %}
    {% else %}
      {% assign read_time = post.feed_content | strip_html | number_of_words | divided_by: 180 | plus: 1 %}
    {% endif %}
    {% assign year = post.date | date: "%Y" %}
    {% assign tags = post.tags | join: "" %}
    {% assign categories = post.categories | join: "" %}

    <li>

{% if post.thumbnail %}

<div class="row">
          <div class="col-sm-9">
{% endif %}
        <h3>
        {% if post.redirect == blank %}
          <a class="post-title" href="{{ post.url | relative_url }}">{{ post.title }}</a>
        {% elsif post.redirect contains '://' %}
          <a class="post-title" href="{{ post.redirect }}" target="_blank">{{ post.title }}</a>
          <svg width="2rem" height="2rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
        {% else %}
          <a class="post-title" href="{{ post.redirect | relative_url }}">{{ post.title }}</a>
        {% endif %}
      </h3>
      <p>{{ post.description }}</p>
      <p class="post-meta">
        {{ read_time }} min read &nbsp; &middot; &nbsp;
        {% if post.venue %}{{ post.venue }}{% else %}{{ post.date | date: '%B %d, %Y' }}{% endif %}
        {% if post.external_source %}
        &nbsp; &middot; &nbsp; {{ post.external_source }}
        {% endif %}
      </p>
      <p class="post-tags">
        <a href="{{ year | prepend: '/blog/' | relative_url }}">
          <i class="fa-solid fa-calendar fa-sm"></i> {{ year }} </a>

          {% if tags != "" %}
          &nbsp; &middot; &nbsp;
            {% for tag in post.tags %}
            {% assign tag_color = site.data.note_tags[tag] %}
            {% if tag_color %}
            <a class="tag-chip" href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}" style="background-color:{{ tag_color.bg }};color:{{ tag_color.fg }}"><i class="fa-solid fa-hashtag fa-sm"></i> {{ tag }}</a>
            {% else %}
            <a href="{{ tag | slugify | prepend: '/blog/tag/' | relative_url }}"><i class="fa-solid fa-hashtag fa-sm"></i> {{ tag }}</a>
            {% endif %}
              {% unless forloop.last %}
                &nbsp;
              {% endunless %}
              {% endfor %}
          {% endif %}

          {% if categories != "" %}
          &nbsp; &middot; &nbsp;
            {% for category in post.categories %}
            {% assign cat_fallback = category | replace: '-', ' ' | capitalize %}
            {% assign cat_name = site.data.note_categories[category].name | default: cat_fallback %}
            <a class="cat-chip" href="{{ category | slugify | prepend: '/blog/category/' | relative_url }}">
              <i class="fa-solid fa-tag fa-sm"></i> {{ cat_name }}</a>
              {% unless forloop.last %}
                &nbsp;
              {% endunless %}
              {% endfor %}
          {% endif %}
    </p>

{% if post.thumbnail %}

</div>

  <div class="col-sm-3">
    <img class="card-img" src="{{ post.thumbnail | relative_url }}" style="object-fit: cover; height: 90%" alt="image">
  </div>
</div>
{% endif %}
    </li>

    {% endfor %}

  </ul>

{% if page.pagination.enabled %}
{% include pagination.liquid %}
{% endif %}

  </div>
</div>
</div>
