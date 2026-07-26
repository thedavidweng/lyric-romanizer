// Verifies the PUBLISHED build under plain Node ESM — no bundler, no vitest.
// Catches engine-interop regressions (named vs default exports across the
// CJS/ESM boundary) and packaging-seam violations that unit tests cannot see,
// because tests import TypeScript source through vitest's resolver.
//
// Run after `pnpm run build`: node scripts/smoke.mjs
import { readFileSync } from 'node:fs';

const failures = [];
const check = (name, condition, detail) => {
  if (condition) return;
  failures.push(`${name}: ${detail}`);
};

// Every engine, exercised through the public interface. Japanese is excluded:
// its engine fetches a dictionary from a CDN, so it cannot run offline.
const EXPECTED = [
  ['chinese', ['你好'], undefined, ['nǐ hǎo']],
  ['chinese', ['佢冇'], 'cantonese', ['keoi5 mou5']],
  ['korean', ['안녕'], undefined, ['annyeong']],
  ['cyrillic', ['Привет'], undefined, ['Privet']],
  ['cyrillic', ['Ґанок'], undefined, ['Ganok']],
  ['devanagari', ['नमस्ते'], undefined, ['namaste']],
  ['gujarati', ['નમસ્તે'], undefined, ['namaste']],
  ['gurmukhi', ['ਨਮਸਤੇ'], undefined, ['namasate']],
  ['telugu', ['నమస్తే'], undefined, ['namaste']],
  ['kannada', ['ನಮಸ್ತೇ'], undefined, ['namaste']],
  ['odia', ['ନମସ୍ତେ'], undefined, ['namaste']],
  ['tamil', ['வணக்கம்'], undefined, ['vanakkam']],
  ['thai', ['สวัสดี'], undefined, ['swasdi']],
  ['latin', ['Hello world'], undefined, ['Hello world']],
];

const { createRomanizer, detectScript, isLatinScript, requiresExternalRomanization } = await import(
  '../dist/index.js'
);

const romanizer = createRomanizer();

for (const [script, lines, dialect, expected] of EXPECTED) {
  const result = await romanizer.romanizeLines(lines, { script, dialect });
  check(
    `engine:${script}${dialect ? `/${dialect}` : ''}`,
    JSON.stringify(result.lines) === JSON.stringify(expected),
    `expected ${JSON.stringify(expected)}, got ${JSON.stringify(result.lines)}`
  );
  check(
    `fallbacks:${script}`,
    result.fallbacks?.every((f) => f === false) === true,
    `engine degraded to the universal fallback: ${JSON.stringify(result.fallbacks)}`
  );
}

// The universal transliteration engine backs the fallback path.
const fallbackRomanizer = createRomanizer({
  engines: {
    thai: () => {
      throw new Error('forced engine failure');
    },
  },
});
const degraded = await fallbackRomanizer.romanizeLines(['สวัสดี'], { script: 'thai' });
check('fallback:reported', degraded.fallbacks?.[0] === true, `fallbacks: ${JSON.stringify(degraded.fallbacks)}`);
check(
  'fallback:transliterated',
  !/[฀-๿]/.test(degraded.lines[0]) && degraded.lines[0].length > 0,
  `got ${JSON.stringify(degraded.lines)}`
);

// Main-entry re-exports must work at value level, not just as types.
check('index:detectScript', detectScript(['สวัสดี']) === 'thai', `got ${detectScript(['สวัสดี'])}`);
check('index:isLatinScript', isLatinScript(['Hello']) === true, 'expected true');
check('index:requiresExternal', requiresExternalRomanization('arabic') === true, 'expected true');

// External scripts still throw without an injected adapter.
let threw = false;
try {
  await romanizer.romanizeLines(['مرحبا']);
} catch (error) {
  threw = error?.name === 'UnsupportedRomanizationError' && error?.script === 'arabic';
}
check('external:throws', threw, 'expected UnsupportedRomanizationError { script: "arabic" }');

// Injected adapters absorb external scripts.
const withAdapter = createRomanizer({ engines: { arabic: (line) => `api:${line}` } });
const adapted = await withAdapter.romanizeLines(['مرحبا']);
check('external:adapter', adapted.lines[0] === 'api:مرحبا', `got ${JSON.stringify(adapted.lines)}`);

// The ./detector subpath must load standalone and stay engine-free.
const detector = await import('../dist/detector.js');
check('detector:detectScript', detector.detectScript(['สวัสดี']) === 'thai', 'thai detection failed');
check('detector:classification', detector.requiresExternalRomanization('arabic') === true, 'expected true');
check('detector:regex', detector.NON_LATIN_SCRIPT_RE.test('สวัสดี') === true, 'expected true');

const detectorSource = readFileSync(new URL('../dist/detector.js', import.meta.url), 'utf8');
const detectorImports = detectorSource.match(/^\s*import[\s({]|[^.\w]import\s*\(/gm) ?? [];
check(
  'detector:engine-free',
  detectorImports.length === 0,
  `dist/detector.js must import nothing (found ${detectorImports.length}: ${detectorImports.join(', ')})`
);

if (failures.length > 0) {
  console.error(`smoke FAILED (${failures.length}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`smoke ok — ${EXPECTED.length} engines, fallback path, both entry points`);
