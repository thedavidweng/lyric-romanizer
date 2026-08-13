# ADR-0006: Kuromoji dictionary resolution is a third, Node-only packaging seam

## Status

Accepted (2026-08-13)

## Context

The Japanese engine's default `japaneseDictPath` is a jsDelivr CDN. OpenKara, a Tauri desktop app, cannot depend on that: it copies the twelve `*.dat.gz` files out of `@sglkc/kuromoji/dict` into `public/dict/` at build time and passes `japaneseDictPath: '/dict/'`. That copy step hard-coded the package name, the `src/kuromoji.js` → `../dict` layout, and the file list — knowledge that belongs to this library, not every consumer.

Putting the helper on the main entry would pull `node:module` into every browser/worker bundle. Putting it on `./detector` would violate the light-side rule (nothing on the light side may import an engine, and the detector must stay import-free).

## Decision

Add a third packaging entry, `lyric-romanizer/dict`, that is Node / build-time only:

- `KUROMOJI_PACKAGE` and `KUROMOJI_DICT_FILES` are the data OpenKara currently duplicates.
- `resolveKuromojiDictDir()` locates the installed `dict/` directory, resolving `@sglkc/kuromoji` *from* `@sglkc/kuroshiro-analyzer-kuromoji` so pnpm's strict layout still finds the transitive dependency.
- The main entry does **not** re-export it. Importing `lyric-romanizer/dict` from a worker or the browser is a consumer bug.

`romanizer.warmup` is a separate, in-process hook on the heavy side: it loads a built-in engine without romanizing, so a desktop app can pay the dictionary-parse cost at idle instead of on the first Japanese line. It is not a packaging concern and does not belong on `./dict`.

## Consequences

OpenKara can delete its hand-maintained file list and `@sglkc/kuromoji` devDependency once it consumes `lyric-romanizer@0.3.1`. A consumer that never vendors the dictionary never imports `./dict`. Adding a second Node-only helper (if one appears) extends this entry rather than growing a fourth seam.
