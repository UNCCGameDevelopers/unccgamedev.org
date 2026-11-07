import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { addRedirect, InputError } from "../scripts/add-redirect.mjs";

const base = readFileSync(new URL("../public/_redirects", import.meta.url), "utf8");
const add = (input) => addRedirect(base, input);
const rejects = (input, re) => assert.throws(() => add(input), (e) => e instanceof InputError && re.test(e.message), JSON.stringify(input));
const sectionOf = (text, line) => {
  const lines = text.split("\n");
  const i = lines.findIndex((l) => l.startsWith(line));
  for (let j = i; j >= 0; j--) if (lines[j].startsWith("# ---")) return lines[j];
};

test("subdomain: adds host rule in its section plus a path link", () => {
  const { text, added } = add({ category: "subdomain", name: "YouTube", destination: "https://www.youtube.com/@unccgamedev" });
  assert.match(added[0], /^https:\/\/youtube\.unccgamedev\.org\/\*\s+https:\/\/www\.youtube\.com\/@unccgamedev\s+302!$/);
  assert.match(added[1], /^\/youtube\s+https:\/\/youtube\.unccgamedev\.org\/\s+302!$/);
  assert.equal(sectionOf(text, "https://youtube."), "# --- Subdomain forwards ---");
  assert.match(sectionOf(text, "/youtube "), /^# --- Path short links/);
  assert.ok(text.indexOf("\n/youtube ") < text.indexOf("\n/* "), "above catch-all");
});

test("subdomain: path link can be skipped; 301 supported", () => {
  const { added } = add({ category: "subdomain", name: "yt", destination: "https://youtube.com/x", status: "301", path_link: "false" });
  assert.equal(added.length, 1);
  assert.match(added[0], /301!$/);
});

test("shortlink, gamejam, github go to their sections", () => {
  assert.match(sectionOf(add({ category: "shortlink", name: "/linktree/", destination: "https://linktr.ee/x" }).text, "/linktree "), /^# --- Path short links/);
  const gj = add({ category: "gamejam", name: "gamejam/50/2027/spring/signup", destination: "https://forms.gle/abc" });
  assert.match(gj.added[0], /^\/gamejam\/50\/2027\/spring\/signup\s/);
  assert.match(sectionOf(gj.text, "/gamejam/50"), /^# --- Game jam/);
  const gh = add({ category: "github", name: "skate-vault" });
  assert.match(gh.added[0], /^\/gh\/skate-vault\s+https:\/\/github\.com\/UNCCGameDevelopers\/skate-vault\s+302!$/);
  assert.match(sectionOf(gh.text, "/gh/skate-vault"), /^# --- Public Game Dev Github/);
});

test("rejects duplicates, including case and trailing-slash variants", () => {
  rejects({ category: "subdomain", name: "discord", destination: "https://x.example" }, /already exists/);
  rejects({ category: "shortlink", name: "GG/", destination: "https://x.example" }, /invalid path segment|already exists/);
  rejects({ category: "shortlink", name: "itch", destination: "https://x.example" }, /already exists/);
  rejects({ category: "github", name: "website" }, /already exists/);
});

test("rejects unsafe or invalid destinations", () => {
  for (const d of ["", "http://x.example", "javascript:alert(1)", "https://user:pw@x.example", "https://x.example/a b", "https://x.example/\"><script>", "https://localhost", "ftp://x.example", "https://x.example/" + "a".repeat(2000)]) {
    rejects({ category: "shortlink", name: "ok", destination: d }, /destination/);
  }
});

test("rejects bad names, reserved subdomains, traversal and newline injection", () => {
  rejects({ category: "subdomain", name: "www", destination: "https://x.example" }, /reserved/);
  rejects({ category: "subdomain", name: "skate-vault", destination: "https://x.example" }, /reserved/);
  rejects({ category: "subdomain", name: "-bad", destination: "https://x.example" }, /invalid subdomain/);
  rejects({ category: "subdomain", name: "a.b", destination: "https://x.example" }, /invalid subdomain/);
  rejects({ category: "shortlink", name: "../etc", destination: "https://x.example" }, /invalid path segment|can't be/);
  rejects({ category: "shortlink", name: "ok\n/* https://evil.example 301!", destination: "https://x.example" }, /invalid path segment/);
  rejects({ category: "shortlink", name: "gamejam/x", destination: "https://x.example" }, /another category/);
  rejects({ category: "github", name: "x", destination: "https://evil.example" }, /github\.com/);
  rejects({ category: "nope", name: "x", destination: "https://x.example" }, /unknown category/);
  rejects({ category: "shortlink", name: "x", destination: "https://x.example", status: "307" }, /status/);
});

test("rejects a redirect to itself", () => {
  rejects({ category: "subdomain", name: "loop", destination: "https://loop.unccgamedev.org/" }, /itself/);
  rejects({ category: "shortlink", name: "loop", destination: "https://unccgamedev.org/loop/" }, /itself/);
  // pointing at a *different* subdomain is fine
  assert.doesNotThrow(() => add({ category: "shortlink", name: "chat", destination: "https://discord.unccgamedev.org/" }));
});
