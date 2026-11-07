# unccgamedev.org

Redirect-only Netlify site for the `unccgamedev.org` apex and its short-link subdomains:

| Link | Goes to |
|---|---|
| unccgamedev.org | https://www.unccgamedev.org (Google Sites) |
| github.unccgamedev.org | https://github.com/UNCCGameDevelopers |
| discord.unccgamedev.org | https://discord.gg/FapBcQY |
| itch.unccgamedev.org | https://unccgamedev.itch.io |
| gamejam.unccgamedev.org | https://www.unccgamedev.org/gamejam |
| twitter.unccgamedev.org | https://www.twitter.com/@GameDevAtUNCC |
| twitch.unccgamedev.org | https://www.twitch.tv/unccgamedev |
| instagram.unccgamedev.org | https://www.instagram.com/UNCCGameDev |
| ggj2023.unccgamedev.org | Global Game Jam 2023 UNCC jam site |

## Adding a link
Use **Actions → Add redirect → Run workflow** (needs write access to the repo):

| Category | Creates | Example name |
|---|---|---|
| `subdomain` | `https://<name>.unccgamedev.org` (+ `unccgamedev.org/<name>` unless unticked) | `youtube` |
| `shortlink` | `https://unccgamedev.org/<name>` | `yt` |
| `gamejam` | `https://unccgamedev.org/gamejam/<name>` | `50/2027/spring/signup` |
| `github` | `https://unccgamedev.org/gh/<name>` (destination defaults to the org repo) | `skate-vault` |

The workflow validates the input, rejects duplicates and unsafe URLs, runs Netlify's redirect parser, checks the destination responds, and **opens a PR**. Merging the PR deploys it. Tick **dry_run** to preview without a PR.
New **subdomains** also need a domain alias on the Netlify site, as the PR explains.

You can also edit [`public/_redirects`](public/_redirects) by hand. Every host used there must also be added as a domain alias on the Netlify site.
Moving DNS from Squarespace: see [DNS.md](DNS.md).
