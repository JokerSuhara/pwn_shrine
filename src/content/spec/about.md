# About

Pwn.Shrine is a static learning space for binary exploitation notes.

It is built on top of [Fuwari](https://github.com/saicaca/fuwari) and keeps the parts that already work well for long-form notes:

- Markdown rendering
- dark mode
- search with Pagefind
- static deployment to common Astro platforms

The MVP adds two things on top of the original template:

- structured Pwn metadata for each note
- a lightweight monthly check-in grid stored in browser localStorage

Recommended workflow:

1. Add a note under `src/content/posts/`
2. Fill in `type`, `difficulty`, `status`, and optional `libc`
3. Review notes from `/records/`
4. Use `/` to keep daily study momentum visible
