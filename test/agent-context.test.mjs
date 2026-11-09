// Keeps AGENTS.md, CLAUDE.md and .github agent files accurate: cited paths exist,
// frontmatter is present, and no real people or secrets appear (this repo is public).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";

const root = new URL("../", import.meta.url);
const walk = (dir) => readdirSync(new URL(dir, root)).flatMap((f) => {
  const p = `${dir}${f}`;
  return statSync(new URL(p, root)).isDirectory() ? walk(`${p}/`) : p.endsWith(".md") ? [p] : [];
});

test("agent context files cite real paths, have frontmatter, and name no real people", () => {
  const files = ["AGENTS.md", "CLAUDE.md", "DOCS.md", ".github/copilot-instructions.md", ...walk(".github/instructions/"), ...walk(".github/prompts/"), ...walk(".github/skills/"), ...walk(".github/agents/")];
  assert.ok(files.length >= 12, `found ${files.length} files`);
  for (const f of files) {
    const t = readFileSync(new URL(f, root), "utf8");
    for (const [, p] of t.matchAll(/`((?:public|scripts|test|\.github)\/[\w./-]+)`/g)) {
      if (/[*<]/.test(p) || p.endsWith("/")) continue;
      assert.ok(existsSync(new URL(p, root)), `${f}: ${p} doesn't exist`);
    }
    for (const [, p] of t.matchAll(/node (scripts\/[\w.-]+\.mjs)/g)) assert.ok(existsSync(new URL(p, root)), `${f}: ${p} doesn't exist`);
    assert.doesNotMatch(t, /\bhansel\b|darkmastermindz|hwei3/i, `${f} names a real person`);
    assert.doesNotMatch(t, /(gh[pousr]_[A-Za-z0-9]{20,}|discord(app)?\.com\/api\/webhooks\/\d)/, `${f} contains a token or webhook`);
    if (f.includes("/prompts/")) assert.match(t, /^---\ndescription: /, `${f} needs description frontmatter`);
    if (f.includes("/skills/") || f.includes("/agents/")) assert.match(t, /^---\nname: [a-z-]+\ndescription: /, `${f} needs name and description`);
    if (f.includes("/instructions/")) assert.match(t, /^---\napplyTo: "/, `${f} needs applyTo frontmatter`);
  }
});

test("reserved subdomains listed in AGENTS.md match the script", async () => {
  const src = readFileSync(new URL("scripts/add-redirect.mjs", root), "utf8");
  const reserved = JSON.parse("[" + /RESERVED_SUBDOMAINS = new Set\(\[([^\]]*)\]/.exec(src)[1] + "]");
  const agents = readFileSync(new URL("AGENTS.md", root), "utf8");
  for (const r of reserved) assert.match(agents, new RegExp("`" + r + "`"), `AGENTS.md should list reserved subdomain ${r}`);
});
