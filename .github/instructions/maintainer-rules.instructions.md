---
applyTo: "**"
---
# Maintainer rules

Standing decisions from the maintainer, exported from Claude Code sessions. They apply on top of [`AGENTS.md`](../../AGENTS.md). If something here conflicts with the code, fix whichever one is wrong in the same PR.

1. **One change per PR.** Unrelated work gets its own PR. Branch from `main`.
2. **Review security before merging:** inputs reach shell only through `env`, actions are pinned by SHA, permissions are minimal, redirect destinations are safe. **Merge only when a maintainer says so** in the conversation.
3. **Free and open-source software only.**
4. **Pin dependencies to an exact version at least 2 weeks old** (for example `@netlify/redirect-parser@16.1.1`).
5. **This repo is public.** No secrets, tokens, private information or internal details of other club systems.
6. **Never use a real person** in examples, placeholders or tests. Use `alex` or `example`.
7. **Docs give clear step-by-step instructions:** numbered steps with one command per block, saying what the reader will see.
8. **Ask before anything outward-facing or hard to undo:** merging, pushing to `main`, changing Netlify, DNS or GitHub settings, deleting anything.
