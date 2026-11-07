// Fails if public/_redirects has syntax errors (Netlify only warns and deploys anyway)
// or contains rules that can never match because they come after the /* catch-all.
import { parseAllRedirects } from "@netlify/redirect-parser";

const file = process.argv[2] ?? "public/_redirects";
const { redirects, errors } = await parseAllRedirects({ redirectsFiles: [file], netlifyConfigPath: "netlify.toml", minimal: false });

const problems = errors.map((e) => String(e.message ?? e));
const catchAll = redirects.findIndex((r) => !r.host && r.path === "/*");
if (catchAll !== -1) {
  for (const r of redirects.slice(catchAll + 1)) {
    problems.push(`Unreachable rule after the /* catch-all: ${r.host ? `${r.scheme}://${r.host}` : ""}${r.path} -> ${r.to}`);
  }
}

for (const r of redirects) console.log(`${String(r.status ?? 301).padEnd(3)}${r.force ? "!" : " "} ${r.host ? `${r.scheme}://${r.host}` : ""}${r.path}  ->  ${r.to}`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`\n${redirects.length} redirects OK`);
