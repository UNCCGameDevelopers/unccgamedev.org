---
name: netlify-redirects
description: How to add, change or remove redirects in public/_redirects for unccgamedev.org safely. Use for any redirect or short-link change.
---
# Netlify redirects for unccgamedev.org

## Prefer the workflow
**Actions → Add redirect → Run workflow** with:
- `category`: `subdomain`, `shortlink`, `gamejam` or `github`
- `name`: for example `youtube`, `yt`, `50/2027/spring/signup` or `skate-vault`
- `destination`: an `https://` URL (for `github` it defaults to the org repo)
- `status`: `302` (default) or `301`
- `path_link`: for subdomains, also adds `unccgamedev.org/<name>`
- `dry_run`: preview without opening a PR

The workflow validates the input, runs the parser, checks the destination responds and opens a PR.

## By hand
1. Find the section (`# --- Subdomain forwards ---`, `# --- Path short links`, `# --- Game jam marketing links`, `# --- Public Game Dev Github Developer Redirects ---`).
2. Add one line, `<from>  <to>  302!`, aligned with its neighbours, **above** the `/*` catch-all.
3. Subdomain: `https://<name>.unccgamedev.org/*  <to>  302!`. Usually also add a `/<name>` path link.
4. Run:
   ```bash
   node --test test/*.test.mjs
   ```
   ```bash
   node scripts/check-redirects.mjs public/_redirects
   ```
5. In the PR: new subdomains need a **Netlify domain alias**. Update the README table for public links.

## Never
Redirect reserved hosts (`www`, `mc`, `skate-vault`, `api`, `mail`, `smtp`, `imap`, `ftp`, `ns1`, `ns2`, `_domainconnect`). Never use `http:`, URL shorteners, tracking links, or rules after the catch-all.
