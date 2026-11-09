// Validates every session file: JSON parses, links resolve, required fields exist.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
let problems = 0;
for (const mod of readdirSync("content")) {
  const dir = path.join("content", mod);
  for (const f of readdirSync(dir).filter((f) => /^s\d+\.json$/.test(f))) {
    const s = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
    const ids = new Set(s.cards.map((c) => c.id));
    const seen = new Set();
    for (const c of s.cards) {
      if (seen.has(c.id)) { console.log(`${f}: duplicate id ${c.id}`); problems++; }
      seen.add(c.id);
      for (const k of ["next", "back_to"]) if (c[k] && !ids.has(c[k])) { console.log(`${f}: ${c.id}.${k} -> ${c[k]} missing`); problems++; }
      if (c.options) for (const o of c.options) if (o.next && !ids.has(o.next)) { console.log(`${f}: ${c.id}/${o.key} -> ${o.next} missing`); problems++; }
      if (c.type === "consequence" && c.outcome === "rewind" && !c.back_to) { console.log(`${f}: ${c.id} rewind without back_to`); problems++; }
    }
    const last = s.cards[s.cards.length - 1];
    if (last.type !== "complete") { console.log(`${f}: last card is ${last.type}, not complete`); problems++; }
    console.log(`${mod}/${f}: ${s.cards.length} cards ok`);
  }
}
if (problems) { console.log(`${problems} problem(s)`); process.exit(1); }
