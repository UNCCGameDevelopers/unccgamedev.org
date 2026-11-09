---
applyTo: "DNS.md"
---
# DNS notes

- `DNS.md` records the domain's DNS records and the move from Squarespace to Netlify DNS. Agents can update the document, but **never change DNS or Netlify settings themselves**. A maintainer does that.
- **Keep the record table accurate:** name, type, current value and plan (Keep / Replace / Drop). Google verification, `www` (Google Sites), `mc` and the TXT verification records must be kept.
- **Order matters:** turn off DNSSEC before switching nameservers, and add the Keep records in Netlify DNS before the switch.
- Every subdomain used in `public/_redirects` must be listed as a Netlify domain alias.
