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
- **12+ 種腳本** — 日語、中文、韓語、西里爾文字、7 種印度系文字、泰米爾語、泰語
- **粵語支援** — 除咗預設普通話拼音之外，仲支援粵語粵拼（Jyutping）
- **輕量子路徑匯入** — 可以只匯入腳本檢測功能，唔使引入羅馬化引擎
- **烏克蘭語感知西里爾文字** — 自動檢測烏克蘭語特有字符並應用正確嘅轉寫預設

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
const result = await romanizer.romanizeLines(['你好世界', 'こんにちは']);
// { script: 'chinese', lines: ['nei5 hou2 sai3 gaai3', 'こんにちは'] }

// 羅馬化單行
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

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
import { detectScript, isLatinScript, NON_LATIN_SCRIPT_RE } from 'lyric-romanizer/detector';
```

### 類型

```ts
type ScriptType =
  | 'japanese' | 'chinese' | 'korean' | 'cyrillic'
  | 'devanagari' | 'gujarati' | 'gurmukhi' | 'telugu'
  | 'kannada' | 'odia' | 'tamil' | 'malayalam'
  | 'bengali' | 'arabic' | 'hebrew' | 'thai'
  | 'other';

interface Romanizer {
  romanizeLine(line: string, options?: RomanizeOptions): Promise<string>;
  romanizeLines(lines: readonly string[], options?: RomanizeOptions): Promise<RomanizeResult>;
}

type RomanizeOptions = { script?: ScriptType; dialect?: 'mandarin' | 'cantonese' };
type RomanizeResult = { script: ScriptType; lines: string[] };
type RomanizerOptions = { japaneseDictPath?: string };
```

### `createRomanizer(options?)`

工廠函數，返回 `Romanizer` 實例。Kuroshiro 引擎（日語）喺首次使用時惰性初始化同緩存。

```ts
const romanizer = createRomanizer();

// 覆蓋 Kuromoji 詞典 CDN 路徑（例如用於自託管）
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});
```

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

對於無法喺本地羅馬化、需要外部 API 嘅腳本返回 `true`。

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

羅馬化單行文本。省略 `script` 時通過 `detectScript` 自動檢測。拉丁文本或無字母內容原樣返回。

對於中文文本，`dialect` 選項控制羅馬化系統：`'mandarin'`（默認）使用拼音，`'cantonese'` 使用 [Jyutping](https://github.com/CanCLID/to-jyutping)。

**外部腳本會拋出** `UnsupportedRomanizationError`。

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

並行羅馬化多行文本。返回檢測到嘅腳本同羅馬化後嘅行。

```ts
const { script, lines } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['sawatdi', 'chaolok'] }
```

### `UnsupportedRomanizationError`

當嘗試羅馬化需要外部 API 嘅腳本時拋出。具有 `script` 屬性，方便程序化處理。

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
| 古木基文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namaste` |
| 泰盧固文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| 卡納達文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೆ` → `namaste` |
| 奧里亞文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| 泰米爾語 | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| 泰語 | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `sawatdi` |

### 需要外部 API

| 腳本 | 方式 |
|------|------|
| 馬拉雅拉姆語 | Google Translate `dt=rm` |
| 孟加拉語 | Google Translate `dt=rm` |
| 阿拉伯語 | Google Translate `dt=rm` |
| 希伯來語 | Google Translate `dt=rm` |
| 其他 | Google Translate `dt=rm` |

用 `requiresExternalRomanization()` 檢測呢啲腳本同分流到你偏好嘅 API。

## 腳本專項說明

### 西里爾文字檢測

西里爾文字會自動檢測烏克蘭語特有字符（`і`、`ї`、`є`、`ґ`）並應用烏克蘭語轉寫預設。其他西里爾文字默認按俄語處理。

### 粵語支援

中文默認使用普通話（拼音）。傳入 `dialect: 'cantonese'` 可使用粵語粵拼（[Jyutping](https://jyutping.org/)）。

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
