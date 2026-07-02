# 关于

Pwn.Shrine 是一个面向二进制利用学习者的静态学习空间，用来集中整理 Pwn 笔记与题解。

它基于 [Fuwari](https://github.com/saicaca/fuwari) 改造，保留了适合长文笔记的成熟能力：

- Markdown 渲染
- 日夜主题切换
- Pagefind 搜索
- 面向 Astro 平台的静态部署

当前 MVP 在原模板基础上新增了两部分能力：

- 为每篇笔记提供结构化的 Pwn 元数据
- 提供一个保存在浏览器 `localStorage` 中的月度打卡热力图

推荐使用方式：

1. 在 `src/content/posts/` 下新增笔记
2. 补全 `type`、`difficulty`、`status`，以及可选的 `libc`
3. 在 `/records/` 里按类型筛选并复盘题目
4. 在 `/` 页面记录每天的学习投入
