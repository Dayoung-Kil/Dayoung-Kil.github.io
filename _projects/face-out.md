---
layout: page
title: Face Out
description: "2021 · 🏆 Honorable Mention ×2 — a web app that blurs every face in a photo or video except the one you choose."
img: assets/img/projects/face_out.png
importance: 2
category: 2021
type: award
github: https://github.com/2021-1-SSU-CapstoneDesign/Face-Out
_styles: >
  .post article strong { color: #5d5c98; }
---

<div class="mb-1">
  <span class="badge rounded-pill me-1" style="background-color:#e8c468;color:#1c1c1d"><i class="fa-solid fa-trophy me-1"></i>장려상</span>
  <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">제11회 숭실 캡스톤디자인 경진대회 &middot; 2021.09</span>
</div>
<div class="mb-2">
  <span class="badge rounded-pill me-1" style="background-color:#e8c468;color:#1c1c1d"><i class="fa-solid fa-trophy me-1"></i>장려상</span>
  <span class="badge rounded-pill" style="background-color:#4d5f8c;color:#fff">AI융합 경진대회 &middot; 2021.11</span>
</div>

<p class="text-muted">Soongsil University &middot; Capstone Design Project</p>

<div class="p-4 my-3 rounded" style="background-color: rgba(93,92,152,0.08); border-left: 4px solid #5d5c98;">
  <p class="lead mb-2" style="font-weight:700">What if you could blur everyone in a photo or video — except one person?</p>
  <p class="mb-0">Face Out is a privacy-protection web app: give it one reference photo of the person to keep, then upload a group photo or video, and every other face is automatically mosaicked.</p>
</div>

<p>
  <a class="btn btn-sm btn-outline-dark" href="https://github.com/2021-1-SSU-CapstoneDesign/Face-Out" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-github me-1"></i> View code on GitHub</a>
</p>

<hr>

## Why we built it

As creators like YouTubers exploded, more and more **bystanders ended up on camera without consent** — and manually blurring each one is tedious and easy to miss.

> The goal: protect the **portrait rights** of incidental people, automatically — keep the one person who should stay, blur everyone else.

<hr>

## See it in action

<div class="row justify-content-sm-center align-items-center mt-3">
  <div class="col-sm-5 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/projects/face_out_demo_in.gif" class="img-fluid rounded z-depth-1" zoomable=true caption="Input — original clip" %}
  </div>
  <div class="col-sm-1 text-center d-none d-sm-block">
    <i class="fa-solid fa-arrow-right fa-xl text-muted"></i>
  </div>
  <div class="col-sm-5 mt-3 mt-md-0">
    {% include figure.liquid loading="lazy" path="assets/img/projects/face_out_demo_out.gif" class="img-fluid rounded z-depth-1" zoomable=true caption="Output — everyone but the target is blurred" %}
  </div>
</div>

<hr>

## How it works

{% include figure.liquid loading="lazy" path="assets/img/projects/face_out_arch.png" class="img-fluid rounded z-depth-1" zoomable=true caption="System architecture" %}

From upload to download, the flow is four steps:

1. **Reference** — the user uploads one photo of the person to keep.
2. **Detect & encode** — every face in the target image or video is detected and turned into a face embedding.
3. **Match** — each face is compared against the reference; anyone who doesn't match is flagged.
4. **Mosaic** — flagged faces are blurred and the result is returned for download or saved to the account.

**Images vs. video.** Photos and video run through separate pipelines: video is processed **frame by frame** with a dedicated, speed-optimized path, and a **thumbnail** is generated for each clip.

<hr>

## Features

- **One-shot** — a single reference photo is enough to exclude one person
- **Batch** — handles multiple faces in a frame at once
- Works on **images *and* video**, with auto-generated thumbnails
- Fully **web-based** — nothing to install
- **Accounts** — members save results to personal folders; guests download directly
- Built-in **Q&A board** and profile management

<hr>

## Architecture

- **Frontend** — HTML / CSS / JavaScript: login, upload, processing dashboard, my-page, Q&A.
- **Backend** — **Flask** server with the face-recognition pipeline; **Flask-SQLAlchemy** over **MySQL** for users, media metadata, and Q&A.
- **Storage** — separate folders for reference faces, source media, guest downloads, member outputs, and video thumbnails.

<hr>

## Team

**Capstone team** — Soongsil University (Mar–Nov 2021):

- **Dayoung Kil (길다영)** — frontend, backend & face recognition
- Seoyoon Choi (최서윤) — frontend concept & recognition model
- Sunyoung Song (송선영) — frontend, backend & database

<hr>

## Tech stack

<p>
  <span class="badge rounded-pill bg-light text-dark border me-1">Flask</span>
  <span class="badge rounded-pill bg-light text-dark border me-1">MySQL · SQLAlchemy</span>
  <span class="badge rounded-pill bg-light text-dark border me-1">HTML / CSS / JS</span>
  <span class="badge rounded-pill bg-light text-dark border me-1">face-recognition</span>
</p>
