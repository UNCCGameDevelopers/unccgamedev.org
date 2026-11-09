# AGENTS.md

Context for AI coding agents (Copilot, Claude Code, Codex, Cursor and others). Humans: start with [README.md](README.md). Tool-specific files are in [`.github/`](.github/): `copilot-instructions.md`, path rules in `instructions/`, reusable `prompts/`, `skills/` and `agents/`. The maintainer's standing rules are in [`.github/instructions/maintainer-rules.instructions.md`](.github/instructions/maintainer-rules.instructions.md). Read them too.

## What this is
A **redirect-only Netlify site** for the `unccgamedev.org` apex and its short-link subdomains (`github.`, `discord.`, `itch.`, `gamejam.` and others). It sends people to the club's real pages. The main website is Google Sites on `www.unccgamedev.org`, which this site does not serve.

- **Public repository:** never commit secrets, tokens or private information.
- **No build step and no `package.json`.** Netlify publishes `public/` (`netlify.toml`).
- **Rules live in `public/_redirects`.** The first match wins, and the `/*` catch-all must stay last.

## Layout
| Path | What |
|---|---|
| `public/_redirects` | All redirect rules, grouped in `# --- … ---` sections |
| `public/index.html` | Fallback page that links to `www.unccgamedev.org` |
| `netlify.toml` | Publish dir and security headers (HSTS, nosniff, referrer policy) |
| `scripts/add-redirect.mjs` | Validates one new redirect and inserts it into the right section (used by the workflow) |
| `scripts/check-redirects.mjs` | Parses `_redirects` with Netlify's parser and fails on errors or rules after the catch-all |
| `test/*.test.mjs` | `node:test` tests for `add-redirect.mjs` and these context files |
| `.github/workflows/add-redirect.yml` | **Actions → Add redirect**: validates, checks the destination responds, opens a PR |
| `.github/workflows/check-redirects.yml` | CI: tests plus the redirect parser |
| `DNS.md` | DNS records and the plan to move from Squarespace to Netlify DNS |

## Commands
Node 22 (as in CI). The parser is installed without a `package.json`:

```bash
npm install --no-save --no-package-lock @netlify/redirect-parser@16.1.1
```

```bash
node --test test/*.test.mjs
```

```bash
node scripts/check-redirects.mjs public/_redirects
```

All three must pass before you say you're done.

## Rules for redirects
- **Prefer the workflow:** Actions → Add redirect (category `subdomain`, `shortlink`, `gamejam` or `github`). It validates the input and opens a PR. To edit by hand, follow the `netlify-redirects` skill.
- **Format:** `<from>  <to>  <status>!`. Use `302!` for anything that may change (profiles, event links) and `301!` only for permanent moves. Keep the `!` (force).
- **Every host used in `_redirects`** (`https://<name>.unccgamedev.org/*`) must also be a **domain alias on the Netlify site**, or it won't resolve. Say so in the PR.
- **Destinations** are `https://` URLs to the club's own accounts or pages. No URL shorteners or tracking links, and no `javascript:` or `data:` URLs.
- **Reserved subdomains** must never be redirected: `www`, `mc`, `skate-vault`, `api`, `mail`, `smtp`, `imap`, `ftp`, `ns1`, `ns2`, `_domainconnect` (see `RESERVED_SUBDOMAINS` in `scripts/add-redirect.mjs`).
- **DNS changes** are made by a maintainer in the DNS provider. Agents only update `DNS.md`.

## Conventions
- **Scripts:** plain ESM `.mjs` with no dependencies besides `@netlify/redirect-parser`. Workflow inputs reach scripts through `env`, never interpolated into shell.
- **Tests:** `node:test` and `assert/strict`. Add a test for any new validation rule.
- **Workflows:** pin actions by full commit SHA with a version comment, and keep `permissions` minimal (`{}` at the top, then per job).
- **Docs:** short, plain sentences and numbered steps. Update the README table when a public link changes.
- **Examples:** never use a real person or account that isn't the club's. Use `alex` or `example`.

## Git
- Branch from `main` and open a PR. CI must pass. **Merging deploys to production.**
- Don't merge, push to `main`, change Netlify or DNS settings, or delete anything unless a maintainer asks you to in the conversation.
