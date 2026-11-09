---
applyTo: "scripts/**,test/**"
---
# Scripts and tests

- **Plain ESM (`.mjs`)** on Node 22. The only dependency is `@netlify/redirect-parser@16.1.1`, installed with `--no-save --no-package-lock`.
- **`scripts/add-redirect.mjs`** reads workflow inputs from `env` (`IN_CATEGORY`, `IN_NAME`, `IN_DESTINATION`, `IN_STATUS`, `IN_PATH_LINK`) and exports `addRedirect(text, input)` and `InputError` for tests.
  - It rejects duplicates, reserved subdomains, bad labels and paths, and non-https or unsafe URLs. Keep the messages clear, because people see them in the Actions log.
- **`scripts/check-redirects.mjs`** must keep failing on parser errors and on rules after the `/*` catch-all.
- **Tests:** `node --test test/*.test.mjs`, using `node:test` and `assert/strict`. Every new validation rule gets a test that it's rejected (`InputError` plus the message) and one that valid input passes. No network calls.
