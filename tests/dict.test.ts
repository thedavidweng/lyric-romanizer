import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { KUROMOJI_DICT_FILES, KUROMOJI_PACKAGE, resolveKuromojiDictDir } from '../src/dict.js';

describe('kuromoji dict packaging contract', () => {
  it('names the package OpenKara currently resolves by hand', () => {
    expect(KUROMOJI_PACKAGE).toBe('@sglkc/kuromoji');
  });

  it('lists the dictionary files the Japanese engine fetches', () => {
    expect([...KUROMOJI_DICT_FILES]).toEqual([
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
    ]);
  });

  it('resolves the installed dictionary directory', () => {
    const dir = resolveKuromojiDictDir();
    expect(dir).toMatch(/kuromoji[/\\]dict$/);
    for (const file of KUROMOJI_DICT_FILES) {
      expect(existsSync(join(dir, file)), `${file} missing from ${dir}`).toBe(true);
    }
  });
});
