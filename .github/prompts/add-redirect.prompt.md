---
description: "Add a redirect or short link to public/_redirects"
agent: "agent"
---
Add a `${input:category:subdomain | shortlink | gamejam | github}` link named `${input:name:e.g. youtube, yt, 50/2027/spring/signup}` going to `${input:destination:https:// URL}`.

1. Follow `.github/skills/netlify-redirects/SKILL.md`. Prefer telling the maintainer to run **Actions → Add redirect** with these inputs; edit by hand only if asked.
2. Put the rule in the right section with the right status (`302!` unless it's permanent).
3. Run `node --test test/*.test.mjs` and `node scripts/check-redirects.mjs public/_redirects`.
4. If it's a new subdomain, remind the maintainer to add the Netlify domain alias, and update the README table.
