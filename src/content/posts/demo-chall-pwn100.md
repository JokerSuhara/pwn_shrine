---
title: "babyheap：从 unsorted bin 到 __free_hook"
published: 2025-03-14
description: "一篇围绕 unsorted bin 泄漏与 __free_hook 覆写的 GLIBC 2.27 堆题笔记。"
tags: [Pwn, Heap, GLIBC, Writeup]
category: BUUCTF
type: heap
difficulty: 3
status: local
libc: "2.27-3ubuntu1"
draft: false
---

## 目标环境

- 架构：amd64
- RELRO：Partial RELRO
- Canary：无
- NX：开启
- PIE：关闭

## 攻击面

程序提供 `add`、`edit`、`show` 和 `delete` 操作。释放后的指针没有清空，因此能稳定形成一条 UAF 利用路径。

## 泄漏

先把大块 chunk 放入 unsorted bin，再通过 `show` 读回 main arena 指针，从而恢复 libc 基址。

```python
libc_base = leak - 0x3EBCA0
free_hook = libc_base + 0x3ED8E8
system = libc_base + 0x4F440
```

## 控制流劫持

拿到 libc 之后，把 `__free_hook` 改写为 `system`，再释放一个存放 `/bin/sh` 的 chunk。

1. 通过 tcache poisoning 重定向下一次分配。
2. 将 `system` 写入 `__free_hook`。
3. 触发 `free("/bin/sh")`。

## 复盘要点

- 适合作为 GLIBC 2.27 初学者的堆利用复盘模板。
- 建议把泄漏链和写入链分开整理，后续复现会更快。
