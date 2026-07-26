import type { ScriptType } from './types.js';

const LETTER_RE = /\p{L}/u;

type CodeRange = readonly [start: number, end: number];

type ScriptMeta = {
  /** Unicode BMP ranges that identify the script during detection. */
  readonly ranges: readonly CodeRange[];
  /** One matching character is proof — detection short-circuits before scoring. */
  readonly definitive?: true;
  /** No built-in engine; romanization requires an external service. */
  readonly external?: true;
};

// Single source of truth for per-script knowledge on the light (engine-free)
// side of the packaging seam: detection ranges and local/external
// classification. SCRIPT_SCORES, NON_LATIN_SCRIPT_RE, and
// requiresExternalRomanization are all derived from this table, and the
// engine table in romanizer.ts is compile-time checked against the
// classification, so adding a script here is the single detector-side edit.
//
// Entry order is load-bearing: it is the tie-break priority of detectScript —
// on an equal character count, the earlier entry wins.
const SCRIPT_METADATA = {
  // Kana is definitive: kanji shares the Han block with chinese, so any kana
  // must decide 'japanese' before Han scoring runs.
  japanese: { ranges: [[0x3040, 0x30ff]], definitive: true },
  chinese: { ranges: [[0x4e00, 0x9fff]] },
  korean: { ranges: [[0xac00, 0xd7af]] },
  cyrillic: { ranges: [[0x0400, 0x04ff]] },
  devanagari: { ranges: [[0x0900, 0x097f]] },
  gujarati: { ranges: [[0x0a80, 0x0aff]] },
  gurmukhi: { ranges: [[0x0a00, 0x0a7f]] },
  telugu: { ranges: [[0x0c00, 0x0c7f]] },
  kannada: { ranges: [[0x0c80, 0x0cff]] },
  odia: { ranges: [[0x0b00, 0x0b7f]] },
  tamil: { ranges: [[0x0b80, 0x0bff]] },
  malayalam: { ranges: [[0x0d00, 0x0d7f]], external: true },
  bengali: { ranges: [[0x0980, 0x09ff]], external: true },
  arabic: { ranges: [[0x0600, 0x06ff]], external: true },
  hebrew: { ranges: [[0x0590, 0x05ff]], external: true },
  thai: { ranges: [[0x0e00, 0x0e7f]] },
  latin: { ranges: [] },
  other: { ranges: [], external: true },
} as const satisfies Record<ScriptType, ScriptMeta>;

/**
 * Scripts classified as external in SCRIPT_METADATA. The engine table in
 * romanizer.ts excludes exactly these members, so reclassifying a script here
 * surfaces as a compile error there.
 */
export type ExternalScript = {
  [K in ScriptType]: (typeof SCRIPT_METADATA)[K] extends { external: true } ? K : never;
}[ScriptType];

function escapeCodePoint(codePoint: number): string {
  return `\\u${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
}

function characterClass(ranges: readonly CodeRange[]): string {
  return ranges
    .map(([start, end]) => (start === end ? escapeCodePoint(start) : `${escapeCodePoint(start)}-${escapeCodePoint(end)}`))
    .join('');
}

function mergeRanges(ranges: readonly CodeRange[]): CodeRange[] {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [];
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1] + 1) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}

const METADATA_ENTRIES = Object.entries(SCRIPT_METADATA) as Array<[ScriptType, ScriptMeta]>;

const DEFINITIVE_SCRIPTS: Array<readonly [ScriptType, RegExp]> = METADATA_ENTRIES.filter(
  ([, meta]) => meta.definitive
).map(([script, meta]) => [script, new RegExp(`[${characterClass(meta.ranges)}]`)] as const);

const SCRIPT_SCORES: Array<readonly [ScriptType, RegExp]> = METADATA_ENTRIES.filter(
  ([, meta]) => meta.ranges.length > 0 && !meta.definitive
).map(([script, meta]) => [script, new RegExp(`[${characterClass(meta.ranges)}]`, 'g')] as const);

// Derived union of every detectable range. Also consumed by the extension
// content script's "latin fast path" during mode switching — deriving it from
// SCRIPT_METADATA keeps it aligned with detection structurally instead of by
// comment.
export const NON_LATIN_SCRIPT_RE = new RegExp(
  `[${characterClass(mergeRanges(METADATA_ENTRIES.flatMap(([, meta]) => meta.ranges)))}]`
);

export function isLatinScript(lines: readonly string[]): boolean {
  const text = lines.join('');
  return !NON_LATIN_SCRIPT_RE.test(text) && LETTER_RE.test(text);
}

export function detectScript(lines: readonly string[]): ScriptType {
  const text = lines.join('');

  for (const [script, pattern] of DEFINITIVE_SCRIPTS) {
    if (pattern.test(text)) return script;
  }

  let best: readonly [ScriptType, number] = ['other', 0];
  for (const [script, pattern] of SCRIPT_SCORES) {
    const score = (text.match(pattern) ?? []).length;
    if (score > best[1]) best = [script, score];
  }

  if (best[1] > 0) return best[0];
  return LETTER_RE.test(text) ? 'latin' : 'other';
}

export function requiresExternalRomanization(script: ScriptType): boolean {
  // Own-property check so an out-of-contract string from untyped callers
  // (including inherited names like 'toString') returns false rather than
  // resolving up the prototype chain.
  if (!Object.hasOwn(SCRIPT_METADATA, script)) return false;
  return (SCRIPT_METADATA as Record<string, ScriptMeta>)[script].external === true;
}
