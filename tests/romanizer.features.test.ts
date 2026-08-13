import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => {
  const analyzerCtor = vi.fn(function MockKuromojiAnalyzer(this: { opts: unknown }, opts: unknown) {
    this.opts = opts;
  });
  const mockInit = vi.fn(async () => undefined);
  const mockConvert = vi.fn(async (line: string) => `jp:${line}`);
  return { analyzerCtor, mockInit, mockConvert };
});

vi.mock('@sglkc/kuroshiro-analyzer-kuromoji', () => ({
  default: hoisted.analyzerCtor,
}));

vi.mock('@sglkc/kuroshiro', () => ({
  default: class MockKuroshiro {
    init = hoisted.mockInit;
    convert = hoisted.mockConvert;
  },
}));

import { createRomanizer, selectCyrillicPreset } from '../src/romanizer.js';
import { UnsupportedRomanizationError } from '../src/types.js';

beforeEach(() => {
  hoisted.analyzerCtor.mockClear();
  hoisted.mockInit.mockClear();
  hoisted.mockConvert.mockClear();
});

describe('engine injection seam', () => {
  it('replaces a built-in engine through createRomanizer', async () => {
    const romanizer = createRomanizer({
      engines: { korean: (line) => `fake:${line}` },
    });
    await expect(romanizer.romanizeLine('안녕', { script: 'korean' })).resolves.toBe('fake:안녕');
  });

  it('passes the dialect context to injected engines', async () => {
    const romanizer = createRomanizer({
      engines: { chinese: (line, context) => `${context.dialect}:${line}` },
    });
    await expect(romanizer.romanizeLine('你好', { script: 'chinese' })).resolves.toBe('mandarin:你好');
    await expect(
      romanizer.romanizeLine('你好', { script: 'chinese', dialect: 'cantonese' })
    ).resolves.toBe('cantonese:你好');
  });

  it('routes external scripts to an injected adapter instead of throwing', async () => {
    const romanizer = createRomanizer({
      engines: { arabic: async (line) => `api:${line}` },
    });
    const result = await romanizer.romanizeLines(['مرحبا']);
    expect(result).toEqual({ script: 'arabic', lines: ['api:مرحبا'], fallbacks: [false] });
  });

  it('still throws for external scripts without an adapter', async () => {
    const romanizer = createRomanizer();
    await expect(romanizer.romanizeLines(['مرحبا'])).rejects.toBeInstanceOf(UnsupportedRomanizationError);
    await expect(romanizer.romanizeLine('مرحبا')).rejects.toBeInstanceOf(UnsupportedRomanizationError);
  });

  it('throws for an engineless pinned script even when the line is pure latin', async () => {
    // Both methods must agree: romanizeLines rejects the script before looking
    // at any line, so romanizeLine must not silently no-op via the latin guard.
    const romanizer = createRomanizer();
    await expect(
      romanizer.romanizeLine('Hello world', { script: 'arabic' })
    ).rejects.toBeInstanceOf(UnsupportedRomanizationError);
    await expect(
      romanizer.romanizeLines(['Hello world'], { script: 'arabic' })
    ).rejects.toBeInstanceOf(UnsupportedRomanizationError);
  });

  it('ignores an injected latin engine — latin text is always returned unchanged', async () => {
    const latinEngine = vi.fn((line: string) => `latin:${line}`);
    const romanizer = createRomanizer({ engines: { latin: latinEngine } });
    await expect(romanizer.romanizeLine('Hello world')).resolves.toBe('Hello world');
    const result = await romanizer.romanizeLines(['Hello world']);
    expect(result.lines).toEqual(['Hello world']);
    expect(latinEngine).not.toHaveBeenCalled();
  });

  it('throws for out-of-contract script strings instead of silently transliterating', async () => {
    const romanizer = createRomanizer();
    await expect(
      romanizer.romanizeLine('αβγ', { script: 'greek' as never })
    ).rejects.toBeInstanceOf(UnsupportedRomanizationError);
  });

  it('does not resolve inherited Object.prototype names as engines', async () => {
    // Without a null-prototype engine table, { script: 'toString' } would
    // invoke Object.prototype.toString and return '[object Undefined]'.
    const romanizer = createRomanizer();
    for (const script of ['toString', 'constructor', 'valueOf', 'hasOwnProperty', '__proto__']) {
      await expect(
        romanizer.romanizeLine('你好', { script: script as never })
      ).rejects.toBeInstanceOf(UnsupportedRomanizationError);
      await expect(
        romanizer.romanizeLines(['你好'], { script: script as never })
      ).rejects.toBeInstanceOf(UnsupportedRomanizationError);
    }
  });

  it('ignores undefined engine entries', async () => {
    const romanizer = createRomanizer({ engines: { korean: undefined } });
    const result = await romanizer.romanizeLine('안녕', { script: 'korean' });
    expect(result).not.toMatch(/[가-힯]/);
  });
});

describe('universal-fallback observability', () => {
  it('reports per-line fallbacks when an engine fails', async () => {
    const romanizer = createRomanizer({
      engines: {
        thai: () => {
          throw new Error('engine down');
        },
      },
    });
    const result = await romanizer.romanizeLines(['สวัสดี', 'ชาวโลก'], { script: 'thai' });
    expect(result.fallbacks).toEqual([true, true]);
    expect(result.lines[0]).not.toMatch(/[฀-๿]/);
  });

  it('reports no fallbacks on the healthy path', async () => {
    const romanizer = createRomanizer();
    const result = await romanizer.romanizeLines(['안녕하세요', '세상아'], { script: 'korean' });
    expect(result.fallbacks).toEqual([false, false]);
  });

  it('reports no fallbacks for latin input', async () => {
    const romanizer = createRomanizer();
    const result = await romanizer.romanizeLines(['Hello world']);
    expect(result).toEqual({ script: 'latin', lines: ['Hello world'], fallbacks: [false] });
  });

  it('never rejects the batch when a line cannot be romanized at all', async () => {
    // The fallback policy is total: if even the universal transliteration
    // engine is unreachable, the line renders as-is with the flag set.
    vi.doMock('transliteration', () => {
      throw new Error('universal engine unavailable');
    });
    vi.resetModules();
    const { createRomanizer: freshCreate } = await import('../src/romanizer.js');
    const romanizer = freshCreate({
      engines: {
        thai: () => {
          throw new Error('engine down');
        },
      },
    });
    const result = await romanizer.romanizeLines(['สวัสดี'], { script: 'thai' });
    expect(result.lines).toEqual(['สวัสดี']);
    expect(result.fallbacks).toEqual([true]);
    vi.doUnmock('transliteration');
    vi.resetModules();
  });

  it('retries a failed lazy engine initialization on the next call', async () => {
    hoisted.mockInit.mockRejectedValueOnce(new Error('dict fetch failed'));
    const romanizer = createRomanizer({ japaneseDictPath: 'mock://dict' });

    const fallback = await romanizer.romanizeLines(['ありがとう'], { script: 'japanese' });
    expect(fallback.fallbacks).toEqual([true]);
    expect(fallback.lines[0]).not.toBe('jp:ありがとう');

    const recovered = await romanizer.romanizeLines(['ありがとう'], { script: 'japanese' });
    expect(recovered.fallbacks).toEqual([false]);
    expect(recovered.lines[0]).toBe('jp:ありがとう');
    expect(hoisted.mockInit).toHaveBeenCalledTimes(2);
  });
});

describe('cyrillic preset selection', () => {
  it('selects the Ukrainian preset only for Ukrainian-specific characters', () => {
    expect(selectCyrillicPreset('Привет мир')).toBe('ru');
    expect(selectCyrillicPreset('Привіт світ')).toBe('uk');
    expect(selectCyrillicPreset('Ґанок')).toBe('uk');
    expect(selectCyrillicPreset('Їжак')).toBe('uk');
    expect(selectCyrillicPreset('Єнот')).toBe('uk');
  });

  it('applies the preset per line through the public interface', async () => {
    const romanizer = createRomanizer();
    const { lines } = await romanizer.romanizeLines(['Привет мир', 'Привіт світ']);
    expect(lines[0]).toBe('Privet mir');
    expect(lines[1]).toBe('Pryvit svit');
  });
});

describe('warmup', () => {
  it('initializes the Japanese engine without converting a line', async () => {
    const romanizer = createRomanizer({ japaneseDictPath: 'mock://dict' });
    await romanizer.warmup('japanese');

    expect(hoisted.analyzerCtor).toHaveBeenCalledWith({ dictPath: 'mock://dict' });
    expect(hoisted.mockInit).toHaveBeenCalledTimes(1);
    expect(hoisted.mockConvert).not.toHaveBeenCalled();
  });

  it('skips a built-in loader when that engine was overridden', async () => {
    const romanizer = createRomanizer({
      japaneseDictPath: 'mock://dict',
      engines: { japanese: async (line) => line },
    });
    await romanizer.warmup('japanese');

    expect(hoisted.mockInit).not.toHaveBeenCalled();
  });

  it('is a no-op for scripts with no built-in engine', async () => {
    const romanizer = createRomanizer();
    await expect(romanizer.warmup('arabic')).resolves.toBeUndefined();
    await expect(romanizer.warmup('latin')).resolves.toBeUndefined();
  });

  it('rejects when a requested built-in engine fails to load', async () => {
    hoisted.mockInit.mockRejectedValueOnce(new Error('dict fetch failed'));
    const romanizer = createRomanizer({ japaneseDictPath: 'mock://dict' });
    await expect(romanizer.warmup('japanese')).rejects.toThrow('dict fetch failed');
  });

  it('accepts several scripts in one call', async () => {
    const romanizer = createRomanizer({ japaneseDictPath: 'mock://dict' });
    await romanizer.warmup(['japanese', 'arabic']);
    expect(hoisted.mockInit).toHaveBeenCalledTimes(1);
  });

  it('with no argument preloads every remaining built-in engine', async () => {
    const romanizer = createRomanizer({ japaneseDictPath: 'mock://dict' });
    await romanizer.warmup();
    expect(hoisted.mockInit).toHaveBeenCalledTimes(1);
  });
});

describe('latin guard under a pinned script', () => {
  it('returns pure-latin lines unchanged instead of feeding them to the pinned engine', async () => {
    const romanizer = createRomanizer();
    const result = await romanizer.romanizeLines(['Hello', '世界']);
    expect(result.script).toBe('chinese');
    expect(result.lines[0]).toBe('Hello'); // was "H e l l o" before the guard
    expect(result.lines[1]).not.toMatch(/[一-鿿]/);
  });

  it('applies to explicitly pinned single lines', async () => {
    const romanizer = createRomanizer();
    await expect(romanizer.romanizeLine('Hello world', { script: 'chinese' })).resolves.toBe('Hello world');
  });

  it('keeps letterless input as a no-op', async () => {
    const romanizer = createRomanizer();
    await expect(romanizer.romanizeLine('123 !!!', { script: 'chinese' })).resolves.toBe('123 !!!');
  });

  it('preserves the historical throw for letterless arrays', async () => {
    const romanizer = createRomanizer();
    await expect(romanizer.romanizeLines(['123', '??? !!!'])).rejects.toMatchObject({
      name: 'UnsupportedRomanizationError',
      script: 'other',
    });
  });
});
