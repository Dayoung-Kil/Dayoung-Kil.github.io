---
layout: page
title: projects
permalink: /projects/
description: Selected projects and competition work, with code.
nav: true
nav_order: 3
horizontal: false
---

<!-- pages/projects.md -->

<style>
  .projects .card-img-top { height: 150px; object-fit: contain; background-color: #f5f5f7; }
  .projects .card-body { padding: 0.6rem 0.9rem; }
  .projects .card-title { font-size: 1rem; margin-bottom: 0.3rem; }
  .projects .card-text { font-size: 0.85rem; margin-bottom: 0.4rem; }
</style>

<div class="projects">
{% if site.enable_project_categories and page.display_categories %}
  <!-- Display categorized projects -->
  {% for category in page.display_categories %}
  <a id="{{ category }}" href=".#{{ category }}">
    <h2 class="category">{{ category }}</h2>
  </a>
  {% assign categorized_projects = site.projects | where: "category", category %}
  {% assign sorted_projects = categorized_projects | sort: "importance" %}
  <!-- Generate cards for each project -->
  {% if page.horizontal %}
  <div class="container">
    <div class="row row-cols-1">
    {% for project in sorted_projects %}
      {% include projects_horizontal.liquid %}
    {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for project in sorted_projects %}
      {% include projects.liquid %}
    {% endfor %}
  </div>
  {% endif %}
  {% endfor %}

{% else %}

<!-- Display projects without categories -->
<!-- Award/competition write-ups (type: award) are excluded here — they are linked from the Awards timeline. -->

{% assign sorted_projects = site.projects | where_exp: "project", "project.type != 'award'" | sort: "importance" %}

  <!-- Generate cards for each project -->

{% if sorted_projects.size == 0 %}
  <p class="text-muted">Detailed write-ups of selected publications are coming soon.</p>
{% elsif page.horizontal %}

  <div class="container">
    <div class="row row-cols-1">
    {% for project in sorted_projects %}
      {% include projects_horizontal.liquid %}
    {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3">
    {% for project in sorted_projects %}
      {% include projects.liquid %}
    {% endfor %}
  </div>
  {% endif %}
{% endif %}
</div>
