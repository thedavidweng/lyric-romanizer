import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

/**
 * The kuromoji package that ships the Japanese dictionary. Consumers that
 * already resolve modules themselves can use this instead of hard-coding the
 * name; everyone else should call `resolveKuromojiDictDir`.
 */
export const KUROMOJI_PACKAGE = '@sglkc/kuromoji' as const;

/**
 * Files the Japanese engine fetches from `japaneseDictPath`. A desktop
 * consumer that vendors the dictionary (instead of hitting the default CDN)
 * must copy exactly this set.
 */
export const KUROMOJI_DICT_FILES = [
  'base.dat.gz',
  'cc.dat.gz',
  'check.dat.gz',
  'tid.dat.gz',
  'tid_map.dat.gz',
  'tid_pos.dat.gz',
  'unk.dat.gz',
  'unk_char.dat.gz',
  'unk_compat.dat.gz',
  'unk_invoke.dat.gz',
  'unk_map.dat.gz',
  'unk_pos.dat.gz',
] as const;

/**
 * Absolute path of the kuromoji `dict/` directory in this installation.
 *
 * Node / build-time only: uses `node:module` so it must not be imported from
 * the main entry or a browser/worker bundle. Resolve from the analyzer
 * package rather than this package so pnpm's strict layout still finds the
 * transitive `@sglkc/kuromoji` dependency.
 */
export function resolveKuromojiDictDir(): string {
  const local = createRequire(import.meta.url);
  let analyzerEntry: string;
  try {
    analyzerEntry = local.resolve('@sglkc/kuroshiro-analyzer-kuromoji');
  } catch (error) {
    throw new Error(
      `Failed to resolve @sglkc/kuroshiro-analyzer-kuromoji while locating the kuromoji dictionary.`,
      { cause: error }
    );
  }

  const fromAnalyzer = createRequire(analyzerEntry);
  let kuromojiEntry: string;
  try {
    kuromojiEntry = fromAnalyzer.resolve(KUROMOJI_PACKAGE);
  } catch (error) {
    throw new Error(`Failed to resolve ${KUROMOJI_PACKAGE} while locating the kuromoji dictionary.`, {
      cause: error,
    });
  }

  // Package main is `src/kuromoji.js`; the gzip dictionary lives at `dict/`
  // next to `src/`, matching what OpenKara already copies by hand.
  const dictDir = resolve(dirname(kuromojiEntry), '..', 'dict');
  const missing = KUROMOJI_DICT_FILES.filter((file) => !existsSync(join(dictDir, file)));
  if (missing.length > 0) {
    throw new Error(
      `Kuromoji dictionary at ${dictDir} is missing: ${missing.join(', ')}.`
    );
  }
  return dictDir;
}
