// Adds one redirect to public/_redirects in the right section, after strict validation.
// Used by .github/workflows/add-redirect.yml. Inputs come from env (never interpolated into shell).
//
//   category     subdomain | shortlink | gamejam | github
//   name         subdomain label ("youtube"), or a path under the category ("yt", "50/2027/spring/signup", "website")
//   destination  https URL (optional for "github": defaults to github.com/UNCCGameDevelopers/<name>)
//   status       302 (temporary, default) | 301 (permanent)
//   path_link    "true" to also add unccgamedev.org/<label> for a new subdomain (default true)
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export const DOMAIN = "unccgamedev.org";
const RESERVED_SUBDOMAINS = new Set(["www", "mc", "skate-vault", "api", "mail", "smtp", "imap", "ftp", "ns1", "ns2", "_domainconnect"]);

export const SECTIONS = {
  subdomain: "# --- Subdomain forwards",
  shortlink: "# --- Path short links",
  gamejam: "# --- Game jam marketing links",
  github: "# --- Public Game Dev Github Developer Redirects",
};

export class InputError extends Error {}
const fail = (msg) => { throw new InputError(msg); };

const LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const SEGMENT_RE = /^[a-z0-9][a-z0-9._-]{0,62}$/;

function validatePath(raw, { maxSegments = 5 } = {}) {
  const p = String(raw ?? "").trim().replace(/^\/+|\/+$/g, "");
  if (!p) fail("name is required");
  const segs = p.split("/");
  if (segs.length > maxSegments) fail(`name can have at most ${maxSegments} path segments`);
  for (const s of segs) {
    if (!SEGMENT_RE.test(s)) fail(`invalid path segment "${s}": use lowercase letters, digits, ".", "_" or "-"`);
    if (s === "." || s === "..") fail("path segments can't be . or ..");
  }
  return segs.join("/");
}

export function validateDestination(raw) {
  const d = String(raw ?? "").trim();
  if (!d) fail("destination is required");
  if (d.length > 2000) fail("destination is too long");
  if (/[\s<>"'`\\]/.test(d) || /[\u0000-\u001f\u007f]/.test(d)) fail("destination contains spaces or unsafe characters");
  let u;
  try { u = new URL(d); } catch { fail("destination is not a valid URL"); }
  if (u.protocol !== "https:") fail("destination must start with https://");
  if (u.username || u.password) fail("destination must not contain credentials");
  if (!u.hostname.includes(".")) fail("destination host looks invalid");
  return u.toString();
}

/** Builds the rule lines for the request. Returns { section, lines, sources, destination }. */
export function buildRules({ category, name, destination, status = "302", path_link = "true" }) {
  if (!Object.hasOwn(SECTIONS, category)) fail(`unknown category "${category}"`);
  if (status !== "301" && status !== "302") fail("status must be 301 or 302");
  const code = `${status}!`;
  const out = { section: category, lines: [], sources: [] };

  if (category === "subdomain") {
    const label = String(name ?? "").trim().toLowerCase();
    if (!LABEL_RE.test(label)) fail(`invalid subdomain "${label}": 1-63 lowercase letters, digits or "-", not starting or ending with "-"`);
    if (RESERVED_SUBDOMAINS.has(label)) fail(`"${label}" is reserved (used by another service)`);
    out.destination = validateDestination(destination);
    const src = `https://${label}.${DOMAIN}/*`;
    out.lines.push([src, out.destination, code]);
    out.sources.push(src);
    out.label = label;
    if (String(path_link) === "true") out.pathLink = [`/${label}`, `https://${label}.${DOMAIN}/`, code];
    return out;
  }

  if (category === "shortlink") {
    const p = validatePath(name);
    if (/^(gamejam|gh)(\/|$)/.test(p)) fail(`"/${p}" belongs to another category ("gamejam" or "github")`);
    out.destination = validateDestination(destination);
    out.lines.push([`/${p}`, out.destination, code]);
  } else if (category === "gamejam") {
    const p = validatePath(String(name ?? "").replace(/^\/?gamejam\/?/, ""), { maxSegments: 6 });
    out.destination = validateDestination(destination);
    out.lines.push([`/gamejam/${p}`, out.destination, code]);
  } else if (category === "github") {
    const p = validatePath(String(name ?? "").replace(/^\/?gh\/?/, ""), { maxSegments: 3 });
    const dest = String(destination ?? "").trim() || `https://github.com/UNCCGameDevelopers/${p}`;
    out.destination = validateDestination(dest);
    const host = new URL(out.destination).hostname;
    if (host !== "github.com" && !host.endsWith(".github.io")) fail("github links must point to github.com or *.github.io");
    out.lines.push([`/gh/${p}`, out.destination, code]);
  }
  out.sources.push(out.lines[0][0]);
  return out;
}

const norm = (src) => src.toLowerCase().replace(/^https?:\/\//, "").replace(/\/+(\*)?$/, "$1");

/** True if dest lands back on the rule's own source (same host for subdomain rules, same path for path rules). */
function selfRef(src, dest) {
  const d = new URL(dest);
  if (src.startsWith("https://")) return d.hostname === new URL(src.replace(/\*$/, "")).hostname;
  const onApex = d.hostname === DOMAIN || d.hostname === `www.${DOMAIN}`;
  return onApex && d.pathname.replace(/\/+$/, "").toLowerCase() === src.toLowerCase();
}

/** Existing rule sources in the file, normalised for duplicate checks. */
export function existingSources(text) {
  return new Set(
    text.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#")).map((l) => norm(l.split(/\s+/)[0])),
  );
}

function insertIntoSection(lines, header, ruleLines) {
  const start = lines.findIndex((l) => l.startsWith(header));
  if (start === -1) fail(`section "${header}" not found in _redirects`);
  let end = start + 1;
  while (end < lines.length && lines[end].trim() !== "" && !lines[end].startsWith("# ---")) end++;
  lines.splice(end, 0, ...ruleLines);
}

const fmt = ([src, dest, code]) => `${src.padEnd(36)} ${dest}    ${code}`;

/** Returns the new file text and the lines added. Throws InputError on any problem. */
export function addRedirect(text, input) {
  const r = buildRules(input);
  const have = existingSources(text);
  const all = [...r.lines, ...(r.pathLink ? [r.pathLink] : [])];
  for (const [src, dest] of all) {
    if (have.has(norm(src))) fail(`a rule for ${src} already exists`);
    if (selfRef(src, dest)) fail("destination would redirect to itself");
  }
  const lines = text.split("\n");
  insertIntoSection(lines, SECTIONS[r.section], r.lines.map(fmt));
  if (r.pathLink) insertIntoSection(lines, SECTIONS.shortlink, [fmt(r.pathLink)]);
  return { text: lines.join("\n"), added: all.map(fmt), rule: r };
}

// ---- CLI (GitHub Actions) ----
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2] ?? "public/_redirects";
  const input = {
    category: process.env.IN_CATEGORY,
    name: process.env.IN_NAME,
    destination: process.env.IN_DESTINATION,
    status: process.env.IN_STATUS || "302",
    path_link: process.env.IN_PATH_LINK || "true",
  };
  try {
    const { text, added, rule } = addRedirect(readFileSync(file, "utf8"), input);
    writeFileSync(file, text);
    const slug = (rule.label ?? rule.lines[0][0]).replace(/^https:\/\//, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").slice(0, 40);
    const outputs = { slug, destination: rule.destination, label: rule.label ?? "", added: added.join("\n") };
    console.log("Added:\n" + added.join("\n"));
    if (process.env.GITHUB_OUTPUT) {
      const lines = Object.entries(outputs).map(([k, v]) => `${k}<<__EOF__\n${v}\n__EOF__`);
      writeFileSync(process.env.GITHUB_OUTPUT, lines.join("\n") + "\n", { flag: "a" });
    }
  } catch (e) {
    console.error(`::error::${e instanceof InputError ? e.message : e}`);
    process.exit(1);
  }
}
