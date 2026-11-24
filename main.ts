import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// One code review comment: a single line that approves a pull request
// while carrying quiet existential dread.
const entry =
  "LGTM. The tests pass and the diff is clean; someday this will all be legacy code and so will we. Ship it.";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

try {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), entry, "utf8");
} catch {
  // A failed write must never break the run.
}

console.log(entry);
