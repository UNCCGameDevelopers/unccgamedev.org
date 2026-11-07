# unccgamedev.org DNS: moving from Squarespace to Netlify DNS

This Netlify site replaces **Squarespace Domain Forwarding**. The redirect rules are in [`public/_redirects`](public/_redirects).
Snapshot of the current records: 2026-11-07 (nameservers `ns-cloud-b{1..4}.googledomains.com`, managed in Squarespace).

## Records

| Name | Type | Current value | Netlify DNS plan |
|---|---|---|---|
| `@` | A | `198.49.23.145` (Squarespace forwarding) | **Replace:** add `unccgamedev.org` to this Netlify site (Netlify creates the record) |
| `github`, `discord`, `itch`, `gamejam`, `twitter`, `twitch`, `instagram` | CNAME | `ext-sq.squarespace.com` | **Replace:** add each as a domain alias on this Netlify site |
| `ggj2023` | CNAME | `https://globalgamejam.org/2023/…` (**invalid**: a URL isn't a hostname) | **Replace:** add as a domain alias. `_redirects` handles it. |
| `www` | CNAME | `ghs.googlehosted.com` | **Keep**: main website (Google Sites) |
| `n2yyoli7fhrb.www` | CNAME | `gv-imlvkvmbiod4q5.dv.googlehosted.com` | **Keep**: Google certificate validation for `www` |
| `l25t5pdze5kv` | CNAME | `gv-chti6dmq4n6ixm.dv.googlehosted.com` | **Keep**: Google domain verification |
| `nxtgko5awyna` | CNAME | `gv-pldb7gela7ale7.dv.googlehosted.com` | **Keep**: Google domain verification |
| `mc` | A | `129.213.101.78` | **Keep**: Minecraft server |
| `@` | TXT | `google-site-verification=TnxahhQELtc0wPhZaA2QcvhkDwPJu8ytq7ZBK2Q0xkg` | **Keep** |
| `skate-vault` | – | (none yet) | Add `skate-vault.unccgamedev.org` to the **skate-vault-unccgamedev** Netlify site, which creates the record |
| `_domainconnect` | CNAME | `_domainconnect.domains.squarespace.com` | **Drop**: Squarespace-only |

There are no MX records, so no email depends on this domain.

## Order of operations (no downtime)
1. **Create the Netlify site** from this repo. Use "Import from Git" or the CLI. It has no build step and publishes `public/`.
   Because this repo is **public**, turn off deploy previews if you don't want PRs from forks to get preview URLs. This site holds no secrets, so it's low risk.
2. **Add domains to the site:** `unccgamedev.org` (primary) plus aliases `github`, `discord`, `itch`, `gamejam`, `twitter`, `twitch`, `instagram` and `ggj2023` `.unccgamedev.org`.
   Do **not** add `www`: it stays on Google Sites.
3. **Set up Netlify DNS** for `unccgamedev.org` (Domains → Add or register domain). Then add the **Keep** records above by hand, exactly as listed.
4. **Before switching:** if **DNSSEC** is on in Squarespace (DNS → DNSSEC), turn it off and wait ~24 h. Changing nameservers with stale DNSSEC records makes the domain unreachable.
5. **Switch nameservers** in Squarespace (DNS → Domain Nameservers → *Use custom nameservers*) to the four `dns*.p0*.nsone.net` servers Netlify shows you.
6. **Wait for propagation.** The current TTL is 4 h, so allow up to ~48 h. Netlify issues HTTPS certificates automatically once DNS points to it.
7. **Check:**
   ```bash
   for h in unccgamedev.org github discord itch gamejam twitter twitch instagram ggj2023; do
     [[ $h == *.* ]] || h="$h.unccgamedev.org"
     printf '%-32s ' "$h"; curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' "https://$h/"
   done
   dig +short www.unccgamedev.org CNAME   # ghs.googlehosted.com.
   dig +short mc.unccgamedev.org A        # 129.213.101.78
   ```
8. Remove the Squarespace forwarding rules once everything resolves through Netlify.

## Behaviour changes from Squarespace
- `https://github.unccgamedev.org` now redirects. Squarespace served a "Coming Soon" page over HTTPS and only redirected plain HTTP.
- `gamejam.` goes straight to `https://www.unccgamedev.org/gamejam` instead of hopping through the apex.
- `ggj2023.` works for the first time. Its old CNAME held a URL and never resolved.
  ⚠️ As of 2026-11-07 its destination (the Global Game Jam v3 archive) says it's "temporarily unavailable". Change the rule if you'd rather point it at `/gamejam`.
- Paths are dropped for external forwards, the same as Squarespace did. Paths on the apex carry over to `www` (`/foo` → `www…/foo`).
