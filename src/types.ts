export type ScriptType =
  | 'japanese'
  | 'chinese'
  | 'korean'
  | 'cyrillic'
  | 'devanagari'
  | 'gujarati'
  | 'gurmukhi'
  | 'telugu'
  | 'kannada'
  | 'odia'
  | 'tamil'
  | 'malayalam'
  | 'bengali'
  | 'arabic'
  | 'hebrew'
  | 'thai'
  | 'latin'
  | 'other';

export type RomanizeEngineContext = {
  /** Chinese romanization system. Every other built-in engine ignores it. */
  dialect: 'mandarin' | 'cantonese';
};

/**
 * An engine adapter: romanizes one line of its script. May be synchronous or
 * asynchronous. Throwing (or rejecting) triggers the universal transliteration
 * fallback, reported per line via `RomanizeResult.fallbacks`.
 */
export type RomanizeEngine = (line: string, context: RomanizeEngineContext) => string | Promise<string>;

export type RomanizerOptions = {
  japaneseDictPath?: string;
  /**
   * Override the built-in engine for a script, or plug an engine for a script
   * that has none built in (arabic, hebrew, malayalam, bengali, other).
   * Scripts without an engine — built-in or injected — throw
   * `UnsupportedRomanizationError`. Entries with an `undefined` value are
   * ignored, as is a `latin` entry: latin text is always returned unchanged.
   */
  engines?: Partial<Record<ScriptType, RomanizeEngine>>;
};

export type RomanizeOptions = {
  script?: ScriptType;
  /** Only honored for `chinese`; every other script ignores it. */
  dialect?: 'mandarin' | 'cantonese';
};

export type RomanizeResult = {
  script: ScriptType;
  lines: string[];
  /**
   * Aligned with `lines`: `true` where the script engine failed and the line
   * was universally transliterated as a last resort. Always populated by this
   * library; optional so existing code constructing results keeps compiling.
   */
  fallbacks?: boolean[];
};

export interface Romanizer {
  romanizeLine(line: string, options?: RomanizeOptions): Promise<string>;
  romanizeLines(lines: readonly string[], options?: RomanizeOptions): Promise<RomanizeResult>;
  /**
   * Eagerly load (and, for Japanese, initialize) the built-in engine(s) for
   * the given script(s). Omit the argument to preload every built-in local
   * engine still installed on this instance. Overridden / injected engines
   * are skipped. Latin and external scripts are no-ops. Unlike romanize, a
   * failed load rejects rather than falling back.
   */
  warmup(scripts?: ScriptType | readonly ScriptType[]): Promise<void>;
}

export class UnsupportedRomanizationError extends Error {
  public readonly script: ScriptType;

  constructor(script: ScriptType) {
    super(`Script '${script}' requires external romanization.`);
    this.name = 'UnsupportedRomanizationError';
    this.script = script;
  }
}
