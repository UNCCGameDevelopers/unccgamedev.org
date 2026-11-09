---
applyTo: ".github/workflows/**,.github/dependabot.yml"
---
# GitHub Actions

- **Pin every action by full commit SHA** with a version comment (`# v4.4.0`).
- **Permissions:** `permissions: {}` at the top, then the minimum per job (`contents: write` and `pull-requests: write` only where a PR is opened).
- **Inputs:** pass `workflow_dispatch` inputs to steps through `env:`, never as `${{ inputs.x }}` inside `run:`, to avoid script injection.
- **Add redirect** opens a PR and never pushes to `main`. Merging the PR deploys it.
- **Node 22.** Install the parser with `npm install --no-save --no-package-lock @netlify/redirect-parser@16.1.1`.
