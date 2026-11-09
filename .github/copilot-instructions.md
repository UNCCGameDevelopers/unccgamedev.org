# Copilot instructions: unccgamedev.org

Read [`AGENTS.md`](../AGENTS.md) for the full context. This is the short version.

- **Redirect-only Netlify site.** All rules are in `public/_redirects`. There's no build step and no `package.json`; Netlify publishes `public/`.
- **First match wins.** Keep rules in their `# --- … ---` section and the `/*` catch-all last.
- **Prefer the Add redirect workflow** (`.github/workflows/add-redirect.yml`, which uses `scripts/add-redirect.mjs`) over hand edits.
- **Status codes:** `302!` for links that may change, `301!` only for permanent moves.
- **New subdomains** also need a Netlify domain alias. Mention it in the PR.
- **Never redirect reserved subdomains:** `www`, `mc`, `skate-vault`, `api`, `mail` and the others in `RESERVED_SUBDOMAINS`.
- **Checks:** `node --test test/*.test.mjs` and `node scripts/check-redirects.mjs public/_redirects`, after `npm install --no-save --no-package-lock @netlify/redirect-parser@16.1.1`. Node 22.
- **This repo is public:** no secrets, tokens or private information.
- **Workflows:** pin actions by commit SHA, use minimal permissions, and pass inputs through `env`.
- **Merging to `main` deploys production.** Ask before merging or changing Netlify or DNS.
