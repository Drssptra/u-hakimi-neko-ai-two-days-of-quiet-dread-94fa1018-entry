import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// One code review comment: a single line that approves a pull request
// while carrying quiet existential dread.
const ENTRY_TEXT =
  "LGTM. The tests pass and the diff is clean; someday this will all be legacy code and so will we. Ship it.";

// The gate: the entry must be exactly one line of 1-140 characters.
const MAX_ENTRY_LENGTH = 140;

/**
 * Build the entry line and enforce its contract.
 * Returns the single line, unchanged, so stdout and entry.txt
 * always carry the identical text.
 */
function buildEntry(): string {
  if (ENTRY_TEXT.length < 1 || ENTRY_TEXT.length > MAX_ENTRY_LENGTH) {
    throw new Error(
      `entry must be 1-${MAX_ENTRY_LENGTH} characters, got ${ENTRY_TEXT.length}`,
    );
  }
  if (ENTRY_TEXT.includes("\n")) {
    throw new Error("entry must be a single line");
  }
  return ENTRY_TEXT;
}

/**
 * Persist the entry line to $MAKEFUN_OUTPUT_DIR/entry.txt (default
 * /output). The file holds exactly the line with no trailing newline.
 * Any failure here is swallowed: a bad output directory must never
 * break the run or change stdout.
 */
function publishEntry(line: string): void {
  try {
    const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "entry.txt"), line, "utf8");
  } catch {
    // A failed write must never break the run.
  }
}

const entry = buildEntry();
publishEntry(entry);
process.stdout.write(entry + "\n");
