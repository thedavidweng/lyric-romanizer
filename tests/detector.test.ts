import { describe, expect, it } from 'vitest';
import {
  NON_LATIN_SCRIPT_RE,
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
} from '../src/detector.js';

describe('detector', () => {
  it('detects japanese', () => {
    expect(detectScript(['春はあけぼの', 'やうやう白くなりゆく際'])).toBe('japanese');
  });

  it('detects chinese', () => {
    expect(detectScript(['你好，世界', '这是一个测试'])).toBe('chinese');
  });

  it('detects korean', () => {
    expect(detectScript(['안녕하세요', '세상아'])).toBe('korean');
  });

  it('detects cyrillic', () => {
    expect(detectScript(['Привет', 'мир'])).toBe('cyrillic');
  });

  it('detects devanagari', () => {
    expect(detectScript(['नमस्ते', 'दुनिया'])).toBe('devanagari');
  });

  it('detects tamil', () => {
    expect(detectScript(['வணக்கம்', 'உலகம்'])).toBe('tamil');
  });

  it('detects thai', () => {
    expect(detectScript(['สวัสดี', 'ชาวโลก'])).toBe('thai');
  });

  it('detects latin and symbols', () => {
    expect(detectScript(['Hello world', 'Café au lait'])).toBe('latin');
    expect(detectScript(['123', '??? !!!'])).toBe('other');
  });

  it('matches latin fast-path expectations', () => {
    expect(isLatinScript(['Hello world'])).toBe(true);
    expect(isLatinScript(['안녕하세요'])).toBe(false);
    expect(isLatinScript(['♪♪♪'])).toBe(false);
  });

  it('keeps kana definitive over Han scoring in mixed CJK input', () => {
    expect(detectScript(['你好世界', 'こんにちは'])).toBe('japanese');
  });

  it('preserves tie-break priority (earlier script wins an equal count)', () => {
    expect(detectScript(['你안'])).toBe('chinese');
  });
});

describe('NON_LATIN_SCRIPT_RE derivation', () => {
  // The regex used to be a hand-maintained literal with a "keep aligned"
  // comment; it is now derived from SCRIPT_METADATA. It is an external
  // contract (the extension content script's latin fast path), so assert
  // byte-for-byte behavioral identity with the legacy literal across the BMP.
  const LEGACY_RE = new RegExp(
    '[\\u3040-\\u30FF\\u4E00-\\u9FFF\\uAC00-\\uD7AF\\u0400-\\u04FF\\u0900-\\u0D7F\\u0600-\\u06FF\\u0590-\\u05FF\\u0E00-\\u0E7F]'
  );

  it('is behaviorally identical to the legacy hand-written regex', () => {
    for (let cp = 0; cp <= 0xffff; cp++) {
      const ch = String.fromCharCode(cp);
      if (LEGACY_RE.test(ch) !== NON_LATIN_SCRIPT_RE.test(ch)) {
        throw new Error(
          `Derived NON_LATIN_SCRIPT_RE diverges from legacy at U+${cp.toString(16).toUpperCase().padStart(4, '0')}`
        );
      }
    }
  });
});

describe('script metadata invariants', () => {
  it('keeps every detection range inside the BMP', () => {
    // The derived character classes use \uXXXX escapes and no `u` flag, which
    // silently misinterprets code points above U+FFFF. An astral-plane script
    // (e.g. a CJK extension block) requires \u{...} escapes plus the `u` flag —
    // which would also change NON_LATIN_SCRIPT_RE.flags, a published export.
    const astral = [...NON_LATIN_SCRIPT_RE.source.matchAll(/\\u([0-9A-F]{4})/g)];
    expect(astral.length).toBeGreaterThan(0);
    for (const [, hex] of astral) {
      expect(Number.parseInt(hex, 16)).toBeLessThanOrEqual(0xffff);
    }
    expect(NON_LATIN_SCRIPT_RE.flags).toBe('');
  });
});

describe('requiresExternalRomanization (light entry)', () => {
  it('classifies external scripts', () => {
    for (const script of ['malayalam', 'bengali', 'arabic', 'hebrew', 'other'] as const) {
      expect(requiresExternalRomanization(script)).toBe(true);
    }
  });

  it('classifies local scripts', () => {
    for (const script of [
      'japanese', 'chinese', 'korean', 'cyrillic', 'devanagari', 'gujarati',
      'gurmukhi', 'telugu', 'kannada', 'odia', 'tamil', 'thai', 'latin',
    ] as const) {
      expect(requiresExternalRomanization(script)).toBe(false);
    }
  });

  it('returns false for out-of-contract strings from untyped callers', () => {
    expect(requiresExternalRomanization('greek' as never)).toBe(false);
  });

  it('does not resolve inherited Object.prototype names', () => {
    for (const script of ['toString', 'constructor', 'valueOf', 'hasOwnProperty', '__proto__']) {
      expect(requiresExternalRomanization(script as never)).toBe(false);
    }
  });
});
