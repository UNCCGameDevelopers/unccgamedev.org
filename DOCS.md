# unccgamedev.org: what it is and how to use it

## What this repo is for
This repo runs the **short links** for Game Developers at UNC Charlotte. It's a tiny Netlify site with no pages of its own: every address sends people somewhere else.

- `unccgamedev.org` → the main website, <https://www.unccgamedev.org> (Google Sites)
- `discord.unccgamedev.org` or `unccgamedev.org/discord` → the Discord invite
- `github.unccgamedev.org` or `unccgamedev.org/gh` → the GitHub org
- Others for itch.io, Twitch, Instagram, X/Twitter and game jams

The full, current list is the table in [README.md](README.md). Every rule lives in one file, [`public/_redirects`](public/_redirects).

## Using the links
Share the short address instead of the long one, for example on posters, slides or a club bio. If the destination ever changes, an officer updates it here, and every poster and bio keeps working.

## Adding or changing a link (officers)
You need write access to this GitHub repo.

1. Go to **Actions → Add redirect → Run workflow**.
2. Fill in the form:

   | Field | What to enter |
   |---|---|
   | **category** | `subdomain` → `name.unccgamedev.org`<br>`shortlink` → `unccgamedev.org/name`<br>`gamejam` → `unccgamedev.org/gamejam/name`<br>`github` → `unccgamedev.org/gh/name` |
   | **name** | For example `youtube`, `yt`, `50/2027/spring/signup` or `skate-vault` |
   | **destination** | The full `https://` address to send people to (for `github`, leave it empty to use the org repo of that name) |
   | **status** | `302` (default; the link can change later) or `301` (permanent) |
   | **path_link** | For `subdomain` only: also create `unccgamedev.org/name` |
   | **dry_run** | Tick it to check without changing anything |

3. Click **Run workflow**. It checks the name, rejects duplicates and unsafe addresses, and checks the destination works. Then it **opens a pull request**.
4. Open the pull request, check the change, and **merge** it. The link goes live within a minute or two.
5. **New subdomains only:** add the domain alias on the Netlify site (**Domain management → Add domain alias → `name.unccgamedev.org`**). Without it the subdomain doesn't resolve.

To change or remove a link, edit `public/_redirects` in a pull request. Keep the line in its section and above the last `/*` line.

## Rules for links
- Use **302** for anything that might change (profiles, forms, event pages). Use **301** only for permanent moves, because browsers remember them.
- Destinations must be `https://` and belong to the club. No URL shorteners or tracking links.
- These names are reserved and can't be used: `www`, `mc`, `skate-vault`, `api`, `mail`, `smtp`, `imap`, `ftp`, `ns1`, `ns2`.

## DNS
The domain's DNS is on Netlify. [DNS.md](DNS.md) lists every record and what each one is for, including the records that must be kept:
- `www`, the Google Sites website
- `mc`, the Minecraft server
- the Google verification records

## Working on the code
1. Install Node 22, then the redirect parser (this repo has no `package.json`):
   ```bash
   npm install --no-save --no-package-lock @netlify/redirect-parser@16.1.1
   ```
2. Run the tests:
   ```bash
   node --test test/*.test.mjs
   ```
3. Check the redirects file:
   ```bash
   node scripts/check-redirects.mjs public/_redirects
   ```
   It should end with `… redirects OK`.

Merging to `main` deploys to production. If you use an AI coding assistant, see [AGENTS.md](AGENTS.md).

## Where things are
| Path | What |
|---|---|
| `public/_redirects` | Every redirect rule |
| `netlify.toml` | Netlify settings and security headers |
| `scripts/add-redirect.mjs` | Adds one redirect safely (used by the workflow) |
| `scripts/check-redirects.mjs` | Checks the redirects file for mistakes |
| `.github/workflows/add-redirect.yml` | The **Add redirect** form |
| `DNS.md` | DNS records and migration notes |

This repo is **public**. Never commit passwords, tokens or private information.
