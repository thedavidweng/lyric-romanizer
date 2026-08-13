# lyric-romanizer

[![npm version](https://img.shields.io/npm/v/lyric-romanizer.svg)](https://www.npmjs.com/package/lyric-romanizer)
[![license](https://img.shields.io/npm/l/lyric-romanizer.svg)](https://github.com/thedavidweng/lyric-romanizer/blob/main/LICENSE)

> **哲學：唔好重複造輪子。**
> 呢個項目刻意避免由零開始構建羅馬化邏輯。相反，佢組合咗每個腳本對應嘅最佳社區維護庫——專注於編排層：腳本檢測、引擎路由、方言處理同統一 API。依賴列表中嘅每一個羅馬化引擎都係由領域專家維護嘅、經過實戰檢驗嘅庫。呢個就係本項目嘅核心理念。

歌詞腳本檢測同本地羅馬化引擎。支援日語、中文（普通話同粵語）、韓語、西里爾文字、印度系文字、泰米爾語、泰語等 12 種以上腳本——全部本地運行，零 API 呼叫。

從 [Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke) 中抽取。被 [OpenKara](https://github.com/thedavidweng/openkara) 使用。

[English](https://github.com/thedavidweng/lyric-romanizer#readme) | [日本語](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ja.md) | [中文（简体）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-CN.md) | [한국어](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ko.md) | [Русский](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ru.md) | [हिन्दी](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.hi.md) | [தமிழ்](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ta.md) | [ไทย](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.th.md)

## 特色

- **零 API 呼叫** — 所有羅馬化都係本地運行
- **自動腳本檢測** — 傳入文本，自動識別所用腳本
- **12+ 種腳本** — 日語、中文、韓語、西里爾文字、6 種印度系文字、泰米爾語、泰語
- **粵語支援** — 除咗預設普通話拼音之外，仲支援粵語粵拼（Jyutping）
- **輕量子路徑匯入** — 可以只匯入腳本檢測（同外部腳本分類），唔使引入羅馬化引擎
- **惰性引擎** — 每個引擎都喺首次使用時先至載入；喺你真正開始羅馬化之前，匯入主入口係完全零開銷
- **預熱** — 可以喺第一行之前預先載入某個文字系統嘅引擎（同埋日語詞典）
- **Kuromoji 詞典輔助** — `lyric-romanizer/dict` 定位跟住包裝嚟嘅詞典，桌面應用可以自己托管，唔使行預設 CDN
- **可插拔引擎** — 可以覆蓋任何內置引擎，或者為需要外部羅馬化嘅腳本插入你自己嘅適配器
- **可觀察嘅回退** — 逐行標誌會話你知，邊一行喺引擎失敗後、作為最後手段回退到通用轉寫
- **烏克蘭語感知西里爾文字** — 自動檢測烏克蘭語特有字符並應用正確嘅轉寫預設
- **喺純 Node ESM 下運行** — 唔使任何打包工具

## 安裝

```bash
npm install lyric-romanizer
```

```bash
yarn add lyric-romanizer
```

```bash
pnpm add lyric-romanizer
```

## 快速開始

```ts
import { createRomanizer, detectScript } from 'lyric-romanizer';

const romanizer = createRomanizer();

// 自動檢測腳本同羅馬化
const result = await romanizer.romanizeLines(['你好世界', '很高兴认识你']);
// { script: 'chinese', lines: ['nǐ hǎo shì jiè', 'hěn gāo xìng rèn shi nǐ'], fallbacks: [false, false] }

// 羅馬化單行
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

> **檢測粒度** — `romanizeLines` 會**一次過喺所有行之間**檢測主導腳本，然後將呢種腳本固定用落每一行（呢個係刻意設計嘅：日文歌入面淨係得漢字嘅行都必須去到日語引擎，而數組入面只要有任何假名就會固定為 `japanese`）。相反，喺循環入面調用 `romanizeLine` 就係**逐行**檢測，可能將每一行路由到唔同嘅引擎。喺已固定腳本下嘅純拉丁行會原樣返回。詳見**混合腳本數組**。

## API

### 匯入

```ts
// 主入口 — 完整羅馬化引擎
import {
  createRomanizer,
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  UnsupportedRomanizationError,
} from 'lyric-romanizer';

// 純檢測子路徑 — 輕量，無羅馬化依賴
import {
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  NON_LATIN_SCRIPT_RE,
} from 'lyric-romanizer/detector';

// 詞典輔助 — 淨係 Node / 構建期。定位 kuromoji 詞典，
// 等打包插件可以將佢拷進應用，而唔使去拉 CDN。
import {
  KUROMOJI_DICT_FILES,
  KUROMOJI_PACKAGE,
  resolveKuromojiDictDir,
} from 'lyric-romanizer/dict';
```

### 類型

```ts
type ScriptType =
  | 'japanese' | 'chinese' | 'korean' | 'cyrillic'
  | 'devanagari' | 'gujarati' | 'gurmukhi' | 'telugu'
  | 'kannada' | 'odia' | 'tamil' | 'malayalam'
  | 'bengali' | 'arabic' | 'hebrew' | 'thai'
  | 'latin' | 'other';

interface Romanizer {
  romanizeLine(line: string, options?: RomanizeOptions): Promise<string>;
  romanizeLines(lines: readonly string[], options?: RomanizeOptions): Promise<RomanizeResult>;
  warmup(scripts?: ScriptType | readonly ScriptType[]): Promise<void>;
}

// 只有 'chinese' 先會理會 `dialect`；其他所有腳本都會忽略佢。
type RomanizeOptions = { script?: ScriptType; dialect?: 'mandarin' | 'cantonese' };

// `fallbacks` 同 `lines` 一一對應：喺引擎失敗、該行作為
// 最後手段回退到通用轉寫嘅位置為 true。
type RomanizeResult = { script: ScriptType; lines: string[]; fallbacks?: boolean[] };

// 引擎適配器：羅馬化佢所屬腳本嘅一行。拋出異常（或
// Promise reject）都會觸發通用轉寫回退。
type RomanizeEngine = (line: string, context: { dialect: 'mandarin' | 'cantonese' }) => string | Promise<string>;

type RomanizerOptions = {
  japaneseDictPath?: string;
  engines?: Partial<Record<ScriptType, RomanizeEngine>>;
};
```

### `createRomanizer(options?)`

工廠函數，返回 `Romanizer` 實例。每個引擎都喺首次使用時惰性載入同緩存——如果載入失敗，下次調用會重試。

```ts
const romanizer = createRomanizer();

// 覆蓋 Kuromoji 詞典 CDN 路徑（例如用於自託管）
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});

// 空閒時預載引擎（日語仲會解析詞典）
await romanizer.warmup('japanese');
await romanizer.warmup(['chinese', 'korean']);
```

> **打包器 / Vite worker。** 惰性 `import()` 只有喺打包器可以 code-split 嗰陣先至惰性。Vite 預設 `worker.format` 係 `'iife'`，會將所有引擎內聯入 worker。設 `worker: { format: 'es' }`，中文歌先至唔會去解析日語同粵語引擎。唔好由 worker 或者瀏覽器包入面匯入 `lyric-romanizer/dict` — 佢淨係用喺 Node。

#### `romanizer.warmup(scripts?)`

載入每個文字系統嘅內置引擎，但唔羅馬化任何一行。省略 `scripts` 會預載呢個實例上仍然安裝嘅全部內置本地引擎。被覆蓋或者注入嘅引擎會被跳過。拉丁文同外部文字系統係空操作。載入失敗會 **reject** — 同 `romanizeLines` 唔同，warmup 唔會回退到通用轉寫。

#### `lyric-romanizer/dict`

Node / 構建期輔助，畀要把 kuromoji 詞典打入應用嘅消費者用（Tauri/Electron、靜態 `public/dict/`）。庫嘅預設 `japaneseDictPath` 係 jsDelivr CDN；呢個入口等預設 CDN 唔使成為唯一選擇。

```ts
import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  KUROMOJI_DICT_FILES,
  resolveKuromojiDictDir,
} from 'lyric-romanizer/dict';

const src = resolveKuromojiDictDir();
const dest = 'public/dict';
mkdirSync(dest, { recursive: true });
for (const file of KUROMOJI_DICT_FILES) {
  copyFileSync(join(src, file), join(dest, file));
}

const romanizer = createRomanizer({ japaneseDictPath: '/dict/' });
```

#### 引擎適配器

`options.engines` 可以覆蓋某個腳本嘅內置引擎——又或者為本身冇內置引擎嘅腳本（`arabic`、`hebrew`、`malayalam`、`bengali`、`other`）插入一個引擎，噉樣 `romanizeLines` 就可以透過同一個接口處理每一種腳本。默認情況下，本庫**零網絡 I/O**；插入遠程適配器係調用方明確作出嘅決定。

```ts
const romanizer = createRomanizer({
  engines: {
    // 為冇本地引擎嘅腳本自備外部羅馬化。
    arabic: async (line) => myTransliterationApi(line),
    // 或者替換內置引擎（例如喺測試中用假引擎）。
    korean: (line) => myKoreanRomanizer(line),
  },
});

await romanizer.romanizeLines(['مرحبا']);
// { script: 'arabic', lines: [...], fallbacks: [false] } — 唔會再拋出異常
```

冇引擎——無論係內置定係注入——嘅腳本仍然會拋出 `UnsupportedRomanizationError`。

### `detectScript(lines)`

檢測給定文本行中嘅主導腳本。首先檢查日語假名（確定性判斷），然後按字符數對其他所有腳本進行評分。

```ts
detectScript(['こんにちは']);          // 'japanese'
detectScript(['你好世界']);            // 'chinese'
detectScript(['Привет']);             // 'cyrillic'
detectScript(['Hello world']);        // 'latin'
detectScript(['123 ???']);            // 'other'
```

### `isLatinScript(lines)`

快速檢查——如果文本僅包含拉丁字母（唔含 CJK、西里爾、印度系文字等），返回 `true`。適用於完全跳過羅馬化嘅場景。

```ts
isLatinScript(['Hello world']);  // true
isLatinScript(['안녕하세요']);    // false
isLatinScript(['♪♪♪']);         // false（無字母）
```

### `requiresExternalRomanization(script)`

對於冇內置引擎、需要外部 API 嘅腳本返回 `true`。可以從輕量嘅 `lyric-romanizer/detector` 子路徑匯入，所以要回答「使唔使分流到外部服務？」呢個問題，完全唔使加載任何羅馬化引擎。

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

羅馬化單行文本。省略 `script` 時，會通過 `detectScript` **逐行**自動檢測——喺循環入面調用 `romanizeLine` 可能將每一行路由到唔同嘅引擎，唔同於 `romanizeLines`（佢會為成個數組固定一種腳本）。拉丁文本或無字母內容原樣返回。

對於中文文本，`dialect` 選項控制羅馬化系統：`'mandarin'`（默認）使用拼音，`'cantonese'` 使用 [Jyutping](https://github.com/CanCLID/to-jyutping)。其他腳本會忽略 `dialect`。

**對於冇引擎（內置或注入）嘅腳本會拋出** `UnsupportedRomanizationError`。

```ts
await romanizer.romanizeLine('你好世界');
// 'nǐ hǎo shì jiè'（默認：普通話拼音）

await romanizer.romanizeLine('你好', { dialect: 'cantonese' });
// 'nei5 hou2'（粵拼 Jyutping）

await romanizer.romanizeLine('Привет мир');
// 'Privet mir'

await romanizer.romanizeLine('Hello world');
// 'Hello world'（原樣返回）

await romanizer.romanizeLine('مرحبا');
// throws UnsupportedRomanizationError { script: 'arabic' }
```

### `romanizer.romanizeLines(lines, options?)`

並行羅馬化多行文本。會**一次過喺所有行之間**檢測主導腳本，然後將呢種腳本固定用落每一行（詳見**混合腳本數組**）。返回腳本、羅馬化後嘅行，以及逐行嘅 `fallbacks` 標誌——喺引擎失敗、該行作為最後手段回退到通用轉寫嘅位置為 `true`。

```ts
const { script, lines, fallbacks } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['swasdi', 'chaolok'], fallbacks: [false, false] }
```

### `UnsupportedRomanizationError`

當嘗試羅馬化一種冇引擎——無論係內置定係透過 `options.engines` 注入——嘅腳本時拋出。具有 `script` 屬性，方便程序化處理。

```ts
try {
  await romanizer.romanizeLine('مرحبا');
} catch (err) {
  if (err instanceof UnsupportedRomanizationError) {
    console.log(err.script); // 'arabic'
    // 回退到外部 API
  }
}
```

## 支援嘅腳本

### 本地（完全離線）

| 腳本 | 引擎 | 示例 |
|------|------|------|
| 通用（回退） | [transliteration](https://github.com/nickclaw/transliteration) | `Привет` → `Privet` |
| 日語 | [kuroshiro](https://github.com/sglkc/kuroshiro-ts) + [kuromoji](https://github.com/takuyaa/kuromoji.js) | `こんにちは` → `konnichiha` |
| 普通話 | [pinyin-pro](https://github.com/zh-lx/pinyin-pro) | `你好` → `nǐ hǎo` |
| 粵語 | [to-jyutping](https://github.com/CanCLID/to-jyutping) | `佢冇` → `keoi5 mou5` |
| 韓語 | [@romanize/korean](https://github.com/kntng/romanize) | `안녕` → `annyeong` |
| 西里爾文字 | [cyrillic-to-translit-js](https://github.com/greybax/CyrillicToTranslitJS) | `Привет` → `Privet` |
| 天城文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `नमस्ते` → `namaste` |
| 古吉拉特文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `નમસ્તે` → `namaste` |
| 古木基文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namasate` |
| 泰盧固文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| 卡納達文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೇ` → `namaste` |
| 奧里亞文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| 泰米爾語 | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| 泰語 | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `swasdi` |

### 需要外部 API

| 腳本 | 方式 |
|------|------|
| 馬拉雅拉姆語 | Google Translate `dt=rm` |
| 孟加拉語 | Google Translate `dt=rm` |
| 阿拉伯語 | Google Translate `dt=rm` |
| 希伯來語 | Google Translate `dt=rm` |
| 其他 | Google Translate `dt=rm` |

用 `requiresExternalRomanization()` 檢測呢啲腳本，然後分流到你偏好嘅 API——又或者將個 API 作為**引擎適配器**插入一次，等 `romanizeLines` 處理每一種腳本。

## 腳本專項說明

### 混合腳本數組

`romanizeLines` 會將成個數組嘅**主導**腳本固定用落每一行。呢個係刻意設計嘅：日文歌入面淨係得漢字嘅一行，單獨睇同中文係無法區分嘅（日文漢字同中文漢字共用同一個 Unicode 區塊），所以淨係靠成個數組嘅上下文先至可以將佢路由到正確嘅引擎。有幾點值得留意：

- 數組入面任何位置只要有假名，就會將成個數組固定為 `japanese`——假名係確定性嘅證據。
- 數組入面一行*唔同*嘅非拉丁腳本，仍然會交俾已固定嘅引擎處理。
- 純拉丁行（例如 CJK 歌曲入面嘅一段英文副歌）會**原樣返回**，而唔會交俾已固定嘅引擎。
- 逐行嘅 `fallbacks` 標誌會報告邊一行喺引擎失敗後、降級成通用轉寫。

如果你需要真正逐行嘅引擎路由，可以喺循環入面調用 `romanizeLine`——佢係逐行檢測嘅。

### 西里爾文字檢測

西里爾文字會自動檢測烏克蘭語特有字符（`і`、`ї`、`є`、`ґ`）並應用烏克蘭語轉寫預設。其他西里爾文字默認按俄語處理。

### 粵語支援

中文默認使用普通話（拼音）。喺 `RomanizeOptions` 入面傳入 `dialect: 'cantonese'`，就可以改為將中文文本羅馬化為粵拼（[Jyutping](https://github.com/CanCLID/to-jyutping)）。

```ts
const { lines } = await romanizer.romanizeLines(['你好世界', '食飯'], {
  script: 'chinese',
  dialect: 'cantonese',
});
// ['nei5 hou2 sai3 gaai3', 'sik6 faan6']
```

#### 粵語示例

| 粵語 | 粵拼 |
|------|------|
| 你好 | nei5 hou2 |
| 多謝 | do1 ze6 |
| 對唔住 | deoi3 m4 zyu6 |
| 我鍾意你 | ngo5 zung1 ji3 nei5 |
| 食咗飯未 | sik6 zo2 faan6 mei6 |

## 許可證

MIT
