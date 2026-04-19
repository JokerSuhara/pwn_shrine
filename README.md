# Pwn.Shrine

Pwn.Shrine is an Astro-based static template for binary exploitation study logs.
It is built on top of Fuwari and adds two core workflows:

- structured Pwn note metadata
- a lightweight monthly check-in grid stored in browser localStorage

## MVP Routes

- `/` check-in page
- `/records/` note library with type filter
- `/records/[slug]/` note detail page
- `/search/` standalone search page
- `/about/` project overview

## Requirements

- Node.js 20+
- pnpm 9+

## Local Development

```sh
pnpm install
pnpm dev
```

Default dev server: `http://localhost:4321`

## Content Model

Notes live in `src/content/posts/` and must include:

```yaml
---
title: "babyheap: from unsorted bin to __free_hook"
published: 2025-03-14
description: "Heap note for GLIBC 2.27"
tags: [Pwn, Heap, GLIBC]
category: BUUCTF
type: heap
difficulty: 3
status: local
libc: "2.27-3ubuntu1"
draft: false
---
```

### Metadata

- `type`: `stack | heap | fmt | uaf | race | sandbox | integer | other`
- `difficulty`: `1` to `5`
- `status`: `pending | local | remote | archived`
- `libc`: optional string

## Check-in Data

The homepage stores check-ins in browser localStorage:

- key: `pwn-shrine-checkins`
- shape: `{ [date: string]: 0 | 1 | 2 | 3 | 4 }`

Depth levels:

- `0`: no study
- `1`: read materials
- `2`: local debugging
- `3`: solved challenge
- `4`: summarized notes

## Commands

```sh
pnpm check
pnpm build
pnpm preview
```

`pnpm build` generates the site into `dist/` and builds the Pagefind index.

## Deployment

This project is static and can be deployed to:

- GitHub Pages
- Vercel
- Cloudflare Pages

Before deploying, update `site` and `base` in `astro.config.mjs` for your target
domain or repository path.

Typical deployment flow:

1. Edit `src/config.ts`
2. Add notes under `src/content/posts/`
3. Run `pnpm build`
4. Upload or connect the generated app to your platform
