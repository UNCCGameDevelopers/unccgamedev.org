---
description: "Audit public/_redirects for broken, unreachable or unsafe rules"
agent: "agent"
---
Audit `public/_redirects`:

1. Run `node scripts/check-redirects.mjs public/_redirects` (after installing the parser) and fix any errors or unreachable rules.
2. List every destination. Flag `http:` URLs, URL shorteners, tracking parameters, accounts that don't look like the club's, and `301` on links that may change.
3. Check that every `https://<name>.unccgamedev.org` host is listed in `DNS.md` as a domain alias.
4. Report findings. Don't remove links without the maintainer's OK.
