---
applyTo: "public/**,netlify.toml"
---
# Redirect rules

- **Format:** `<from>  <to>  <status>!`, with columns aligned using spaces like the existing lines. `!` forces the redirect even if a file exists.
- **Sections, in order:**
  1. `# --- Subdomain forwards ---` (`https://<name>.unccgamedev.org/*`)
  2. `# --- Path short links … ---` (`/<name>`)
  3. `# --- Game jam marketing links … ---` (`/gamejam/<…>`)
  4. `# --- Public Game Dev Github Developer Redirects ---` (`/gh/<name>`)
  5. The apex catch-all `/*`, **always last**. Anything after it can never match, and `check-redirects.mjs` fails.
- **Status:** `302` (temporary) for profiles, forms and event links; `301` (permanent, cached by browsers) only when the destination will never change.
- **Every host rule needs a Netlify domain alias** for that host. Say so in the PR description.
- **Destinations** are `https://` only and point to the club's own pages or accounts. Never URL shorteners, tracking links, `http:`, `javascript:` or `data:`.
- **Never** add rules for reserved hosts (`www`, `mc`, `skate-vault`, `api`, `mail`, `smtp`, `imap`, `ftp`, `ns1`, `ns2`, `_domainconnect`).
- **Keep `netlify.toml`'s security headers** (HSTS, `nosniff`, `Referrer-Policy`). Don't add a build command.
- When a public link changes, update the table in `README.md` too.
