// Two Days of Quiet Dread — v2
//
// A pull-request approval stamped by someone who already knows how
// the story ends. The code ships, the tests go green, and sooner or
// later an unfamiliar hand sweeps the whole thing away, never
// learning whose evenings went into it. The dread is not that the
// work is wrong. The dread is that being right changes nothing
// about being forgotten.
//
// This program does one small, exact thing: it assembles that
// single approval line and files it at
// $MAKEFUN_OUTPUT_DIR/entry.txt, byte for byte, with no trailing
// newline, then echoes it to stdout. Nothing else leaves the box:
// no network, no clock, no randomness — the same input always
// produces the same file.

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// The approval is built from its four beats, joined by single
// spaces, so each clause can be read on its own and the assembled
// line is still exactly the submitted text.
const CLAUSES = [
  "Approved.",
  "The code is correct,",
  "the tests pass,",
  "and one day some stranger will delete all of it without ever knowing my name.",
] as const;

// Gate from competition.yaml: one line, 1-140 characters.
const GATE = { min: 1, max: 140 } as const;

// Characters that would break the single-line contract: line feeds,
// carriage returns, tabs, and any other C0 control character.
const FORBIDDEN = new Set(["\n", "\r", "\t"]);

type Check = { name: string; ok: (line: string) => boolean; detail: string };

const CHECKS: readonly Check[] = [
  {
    name: "length",
    ok: (line) => {
      const count = [...line].length;
      return count >= GATE.min && count <= GATE.max;
    },
    detail: `line must be ${GATE.min}-${GATE.max} characters`,
  },
  {
    name: "single-line",
    ok: (line) => ![...line].some((ch) => FORBIDDEN.has(ch)),
    detail: "line must contain no newline, carriage return, or tab",
  },
  {
    name: "non-blank",
    ok: (line) => line.trim().length > 0,
    detail: "line must contain non-whitespace characters",
  },
  {
    name: "clean-spacing",
    ok: (line) =>
      line === line.trim() && !line.includes("  ") && !line.startsWith(" "),
    detail: "line must not start/end with a space or contain a double space",
  },
  {
    name: "no-control-chars",
    ok: (line) =>
      ![...line].some((ch) => ch.codePointAt(0)! < 0x20 || ch.codePointAt(0) === 0x7f),
    detail: "line must contain no control characters",
  },
];

function assemble(): string {
  return CLAUSES.join(" ");
}

function validate(line: string): void {
  const failures = CHECKS.filter((check) => !check.ok(line)).map(
    (check) => `${check.name}: ${check.detail}`,
  );
  if (failures.length > 0) {
    throw new Error(`entry failed validation — ${failures.join("; ")}`);
  }
}

function outputDir(): string {
  const raw = process.env.MAKEFUN_OUTPUT_DIR;
  const trimmed = raw === undefined ? "" : raw.trim();
  return trimmed === "" ? "/output" : trimmed;
}

function fileEntry(line: string): void {
  const dir = outputDir();
  mkdirSync(dir, { recursive: true });
  // Buffer.from pins the bytes down exactly; no newline is appended
  // anywhere in this path, so entry.txt ends on the final period.
  writeFileSync(resolve(dir, "entry.txt"), Buffer.from(line, "utf8"));
}

function main(): void {
  const line = assemble();
  validate(line);
  fileEntry(line);
  process.stdout.write(`${line}\n`);
}

main();
