import type Kuroshiro from '@sglkc/kuroshiro';
import { NON_LATIN_SCRIPT_RE, detectScript } from './detector.js';
import type { ExternalScript } from './detector.js';
import type {
  RomanizeEngine,
  RomanizeEngineContext,
  RomanizeOptions,
  RomanizeResult,
  Romanizer,
  RomanizerOptions,
  ScriptType,
} from './types.js';
import { UnsupportedRomanizationError } from './types.js';

const DEFAULT_JAPANESE_DICT_PATH = 'https://cdn.jsdelivr.net/npm/kuromoji/dict';

const HAS_LETTER_RE = /\p{L}/u;
const ASCII_LETTER_RE = /[A-Za-z]/;

/** Scripts with a built-in engine: everything except the external ones and latin. */
type EngineScript = Exclude<ScriptType, ExternalScript | 'latin'>;

/**
 * Memoizes an async load; a failed load clears the cache so the next call
 * retries instead of caching the rejection.
 */
function lazy<T>(load: () => Promise<T>): () => Promise<T> {
  let cached: Promise<T> | null = null;
  return () => {
    if (!cached) {
      cached = load().catch((error) => {
        cached = null;
        throw error;
      });
    }
    return cached;
  };
}

/** Rejects the load when interop resolution finds nothing callable. */
function resolved<T>(value: T | undefined, what: string): T {
  if (value === undefined) throw new Error(`Failed to resolve ${what} from its module.`);
  return value;
}

// Every engine loads on first use so that importing this module costs nothing
// until a line of the matching script is romanized. The `?? default` chains
// bridge module shapes: bundlers surface these CJS packages' named exports,
// while plain Node ESM surfaces them only on `default`.
const loadPinyin = lazy(async () => {
  const mod = await import('pinyin-pro');
  return resolved(mod.pinyin ?? mod.default?.pinyin, 'pinyin');
});

const loadJyutping = lazy(() => import('to-jyutping'));

const loadKorean = lazy(async () => {
  const mod = await import('@romanize/korean');
  return resolved(mod.romanize ?? mod.default?.romanize, 'korean romanize');
});

const loadThai = lazy(async () => {
  const mod = await import('@dehoist/romanize-thai');
  return resolved(mod.default ?? (mod as { romanize?: typeof mod.default }).romanize, 'thai romanize');
});

const loadTamil = lazy(async () => {
  const mod = await import('tamil-romanizer');
  return resolved(mod.romanize ?? mod.default?.romanize, 'tamil romanize');
});

const loadSanscript = lazy(async () => {
  const mod = await import('@indic-transliteration/sanscript');
  return resolved(mod.default ?? (mod as { Sanscript?: typeof mod.default }).Sanscript, 'Sanscript');
});

const loadTransliterate = lazy(async () => {
  const mod = await import('transliteration');
  return resolved(mod.transliterate ?? mod.default?.transliterate, 'transliterate');
});

const loadCyrillicTranslit = lazy(async () => {
  const mod = await import('cyrillic-to-translit-js');
  const factory = resolved(mod.default ?? (mod as unknown as typeof mod.default), 'CyrillicToTranslit');
  return { ru: factory({ preset: 'ru' }), uk: factory({ preset: 'uk' }) };
});

/**
 * Ukrainian-specific characters pick the Ukrainian preset; all other Cyrillic
 * romanizes as Russian. Applied per line, so a mixed-language song switches
 * preset line by line.
 */
export function selectCyrillicPreset(line: string): 'ru' | 'uk' {
  return /[іїєґ]/i.test(line) ? 'uk' : 'ru';
}

class DefaultRomanizer implements Romanizer {
  private readonly japaneseDictPath: string;
  private readonly engines: Partial<Record<ScriptType, RomanizeEngine>>;

  private readonly loadKuroshiro = lazy(async (): Promise<Kuroshiro> => {
    const [kuroshiroModule, analyzerModule] = await Promise.all([
      import('@sglkc/kuroshiro'),
      import('@sglkc/kuroshiro-analyzer-kuromoji'),
    ]);
    const KuroshiroCtor = kuroshiroModule.default ?? (kuroshiroModule as unknown as typeof kuroshiroModule.default);
    const KuromojiAnalyzer = analyzerModule.default ?? (analyzerModule as unknown as typeof analyzerModule.default);
    const instance = new KuroshiroCtor();
    await instance.init(new KuromojiAnalyzer({ dictPath: this.japaneseDictPath }));
    return instance;
  });

  constructor(options?: RomanizerOptions) {
    this.japaneseDictPath = options?.japaneseDictPath ?? DEFAULT_JAPANESE_DICT_PATH;

    // Null-prototype: an out-of-contract script name from an untyped caller
    // (e.g. 'toString') must miss the lookup rather than resolve to an
    // inherited Object.prototype method and be invoked as an engine.
    const engines = Object.assign(
      Object.create(null) as Partial<Record<ScriptType, RomanizeEngine>>,
      this.buildDefaultEngines()
    );
    for (const [script, engine] of Object.entries(options?.engines ?? {})) {
      if (engine) engines[script as ScriptType] = engine;
    }
    this.engines = engines;
  }

  async romanizeLine(line: string, options?: RomanizeOptions): Promise<string> {
    const { text } = await this.resolveLine(line, options?.script, options);
    return text;
  }

  async romanizeLines(lines: readonly string[], options?: RomanizeOptions): Promise<RomanizeResult> {
    const script = options?.script ?? detectScript(lines);
    if (script !== 'latin' && !this.engines[script]) {
      throw new UnsupportedRomanizationError(script);
    }
    if (script === 'latin') {
      return { script, lines: [...lines], fallbacks: lines.map(() => false) };
    }

    const resolved = await Promise.all(lines.map((line) => this.resolveLine(line, script, options)));
    return {
      script,
      lines: resolved.map((r) => r.text),
      fallbacks: resolved.map((r) => r.fallback),
    };
  }

  private async resolveLine(
    line: string,
    script: ScriptType | undefined,
    options: RomanizeOptions | undefined
  ): Promise<{ text: string; fallback: boolean }> {
    if (!line.trim() || !HAS_LETTER_RE.test(line)) return { text: line, fallback: false };

    const resolved = script ?? detectScript([line]);
    if (resolved === 'latin') return { text: line, fallback: false };

    // Checked before the latin guard below so that a script with no engine
    // throws regardless of what the line contains — matching romanizeLines,
    // which rejects such a script before looking at any line.
    const engine = this.engines[resolved];
    if (!engine) throw new UnsupportedRomanizationError(resolved);

    // A pinned script (romanizeLines, or an explicit option) skips per-line
    // detection, so re-apply the latin no-op here: a line with ASCII letters
    // and no character of any detectable script has nothing the pinned engine
    // could romanize — without this, engines mangle it (pinyin-pro spaces
    // "Hello" into "H e l l o").
    if (ASCII_LETTER_RE.test(line) && !NON_LATIN_SCRIPT_RE.test(line)) {
      return { text: line, fallback: false };
    }

    const context: RomanizeEngineContext = { dialect: options?.dialect ?? 'mandarin' };
    try {
      return { text: await engine(line, context), fallback: false };
    } catch {
      // Universal-fallback policy: a failed engine (or engine load) must not
      // keep lyrics from rendering. Degrade to plain transliteration and
      // report it via RomanizeResult.fallbacks.
      try {
        const transliterate = await loadTransliterate();
        return { text: transliterate(line), fallback: true };
      } catch {
        // Even the universal engine is unavailable. Render the line as-is
        // rather than failing the whole batch; the flag reports the degradation.
        return { text: line, fallback: true };
      }
    }
  }

  // Total over EngineScript: adding a local script to ScriptType (or
  // reclassifying one in SCRIPT_METADATA) is a compile error here until the
  // engine row exists — there is no default arm to fall through silently.
  private buildDefaultEngines(): Record<EngineScript, RomanizeEngine> {
    const sanscriptEngine =
      (scheme: string): RomanizeEngine =>
      async (line) =>
        (await loadSanscript()).t(line, scheme, 'iast');

    return {
      japanese: async (line) => {
        const kuroshiro = await this.loadKuroshiro();
        return kuroshiro.convert(line, { to: 'romaji', mode: 'spaced' });
      },
      chinese: async (line, context) => {
        if (context.dialect === 'cantonese') {
          try {
            const jyutping = await loadJyutping();
            const result = jyutping.getJyutpingText(line);
            if (result) return result;
          } catch {
            // fall through to pinyin
          }
        }
        const pinyin = await loadPinyin();
        return pinyin(line, { toneType: 'symbol', type: 'string' });
      },
      korean: async (line) => (await loadKorean())(line),
      cyrillic: async (line) => {
        const translit = await loadCyrillicTranslit();
        return translit[selectCyrillicPreset(line)].transform(line);
      },
      devanagari: sanscriptEngine('devanagari'),
      gujarati: sanscriptEngine('gujarati'),
      gurmukhi: sanscriptEngine('gurmukhi'),
      telugu: sanscriptEngine('telugu'),
      kannada: sanscriptEngine('kannada'),
      odia: sanscriptEngine('oriya'),
      tamil: async (line) => (await loadTamil())(line),
      thai: async (line) => (await loadThai())(line),
    };
  }
}

export function createRomanizer(options?: RomanizerOptions): Romanizer {
  return new DefaultRomanizer(options);
}
