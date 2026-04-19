# Pwn.Shrine Guide

Pwn.Shrine is a static Astro template for Pwn study notes.

## Quick Start

```sh
pnpm install
pnpm dev
```

Open `http://localhost:4321` during local development.

## Required Frontmatter

```yaml
---
title: "example"
published: 2025-03-14
description: "short summary"
tags: [Pwn]
category: Notes
type: stack
difficulty: 2
status: local
libc: "2.31"
draft: false
---
```

## Main Pages

- `/` monthly check-in grid
- `/records/` note list and type filter
- `/records/[slug]/` note detail
- `/search/` standalone search page

## Deployment Notes

- GitHub Pages: set `site` and `base` in `astro.config.mjs`
- Vercel: keep static output and deploy directly
- Cloudflare Pages: build command `pnpm build`, output directory `dist`

## Data Ownership

- Notes are stored in the repository
- Check-in data is stored in browser localStorage
- Clearing browser data removes local check-in history
