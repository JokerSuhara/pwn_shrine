---
title: "babyheap: from unsorted bin to __free_hook"
published: 2025-03-14
description: "A GLIBC 2.27 heap note focused on unsorted bin leak and __free_hook overwrite."
tags: [Pwn, Heap, GLIBC, Writeup]
category: BUUCTF
type: heap
difficulty: 3
status: local
libc: "2.27-3ubuntu1"
draft: false
---

## Target

- Arch: amd64
- RELRO: Partial RELRO
- Canary: No
- NX: Enabled
- PIE: No PIE

## Attack Surface

The binary exposes add, edit, show, and delete operations. Freed pointers are
not cleared, which creates a reliable UAF path.

## Leak

Push a large chunk into the unsorted bin and read the main arena pointer back
through `show` to recover the libc base.

```python
libc_base = leak - 0x3EBCA0
free_hook = libc_base + 0x3ED8E8
system = libc_base + 0x4F440
```

## Control Flow Hijack

After libc is known, overwrite `__free_hook` with `system` and free a chunk
that stores `/bin/sh`.

1. Use tcache poisoning to redirect the next allocation.
2. Write `system` into `__free_hook`.
3. Trigger `free("/bin/sh")`.

## Notes

- Good template for GLIBC 2.27 beginner heap review.
- Keep the leak chain and the write chain in separate sections for faster replay.
