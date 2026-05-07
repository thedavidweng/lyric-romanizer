# lyric-romanizer

[![npm version](https://img.shields.io/npm/v/lyric-romanizer.svg)](https://www.npmjs.com/package/lyric-romanizer)
[![license](https://img.shields.io/npm/l/lyric-romanizer.svg)](https://github.com/thedavidweng/lyric-romanizer/blob/main/LICENSE)

> **哲学：不要重复造轮子。**
> 这个项目刻意避免从零开始构建罗马化逻辑。相反，它组合了每个脚本对应的最佳社区维护库——专注于编排层：脚本检测、引擎路由、方言处理和统一 API。依赖列表中的每一个罗马化引擎都是由领域专家维护的、经过实战检验的库。这就是本项目的核心理念。

歌词脚本检测与本地罗马化引擎。支持日语、中文（普通话和粤语）、韩语、西里尔文字、印度系文字、泰米尔语、泰语等 12 种以上脚本——全部本地运行，零 API 调用。

从 [Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke) 中抽取。被 [OpenKara](https://github.com/thedavidweng/openkara) 使用。

[English](https://github.com/thedavidweng/lyric-romanizer#readme) | [日本語](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ja.md) | [中文（粵語）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-yue.md) | [한국어](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ko.md) | [Русский](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ru.md) | [हिन्दी](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.hi.md) | [தமிழ்](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ta.md) | [ไทย](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.th.md)

## 特性

- **零 API 调用** — 所有罗马化均在本地运行
- **自动脚本检测** — 传入文本，自动识别所用脚本
- **12+ 种脚本** — 日语、中文、韩语、西里尔文字、7 种印度系文字、泰米尔语、泰语
- **粤语支持** — 除默认普通话拼音外，还支持粤语粤拼（Jyutping）
- **轻量子路径导入** — 可仅导入脚本检测功能，无需引入罗马化引擎
- **乌克兰语感知西里尔文字** — 自动检测乌克兰语特有字符并应用正确的转写预设

## 安装

```bash
npm install lyric-romanizer
```

```bash
yarn add lyric-romanizer
```

```bash
pnpm add lyric-romanizer
```

## 快速开始

```ts
import { createRomanizer, detectScript } from 'lyric-romanizer';

const romanizer = createRomanizer();

// 自动检测脚本并罗马化
const result = await romanizer.romanizeLines(['你好世界', 'こんにちは']);
// { script: 'chinese', lines: ['nǐ hǎo shì jiè', 'こんにちは'] }

// 罗马化单行
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

## API

### 导入

```ts
// 主入口 — 完整罗马化引擎
import {
  createRomanizer,
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  UnsupportedRomanizationError,
} from 'lyric-romanizer';

// 纯检测子路径 — 轻量，无罗马化依赖
import { detectScript, isLatinScript, NON_LATIN_SCRIPT_RE } from 'lyric-romanizer/detector';
```

### 类型

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

工厂函数，返回 `Romanizer` 实例。Kuroshiro 引擎（日语）在首次使用时惰性初始化并缓存。

```ts
const romanizer = createRomanizer();

// 覆盖 Kuromoji 词典 CDN 路径（例如用于自托管）
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});
```

### `detectScript(lines)`

检测给定文本行中的主导脚本。首先检查日语假名（确定性判断），然后按字符数对其他所有脚本进行评分。

```ts
detectScript(['こんにちは']);          // 'japanese'
detectScript(['你好世界']);            // 'chinese'
detectScript(['Привет']);             // 'cyrillic'
detectScript(['Hello world']);        // 'latin'
detectScript(['123 ???']);            // 'other'
```

### `isLatinScript(lines)`

快速检查——如果文本仅包含拉丁字母（不含 CJK、西里尔、印度系文字等），返回 `true`。适用于完全跳过罗马化的场景。

```ts
isLatinScript(['Hello world']);  // true
isLatinScript(['안녕하세요']);    // false
isLatinScript(['♪♪♪']);         // false（无字母）
```

### `requiresExternalRomanization(script)`

对于无法在本地罗马化、需要外部 API 的脚本返回 `true`。

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

罗马化单行文本。省略 `script` 时通过 `detectScript` 自动检测。拉丁文本或无字母内容原样返回。

对于中文文本，`dialect` 选项控制罗马化系统：`'mandarin'`（默认）使用拼音，`'cantonese'` 使用 [Jyutping](https://github.com/CanCLID/to-jyutping)。

**外部脚本会抛出** `UnsupportedRomanizationError`。

```ts
await romanizer.romanizeLine('你好世界');
// 'nǐ hǎo shì jiè'（默认：普通话拼音）

await romanizer.romanizeLine('你好', { dialect: 'cantonese' });
// 'nei5 hou2'（粤拼 Jyutping）

await romanizer.romanizeLine('Привет мир');
// 'Privet mir'

await romanizer.romanizeLine('Hello world');
// 'Hello world'（原样返回）

await romanizer.romanizeLine('مرحبا');
// throws UnsupportedRomanizationError { script: 'arabic' }
```

### `romanizer.romanizeLines(lines, options?)`

并行罗马化多行文本。返回检测到的脚本和罗马化后的行。

```ts
const { script, lines } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['sawatdi', 'chaolok'] }
```

### `UnsupportedRomanizationError`

当尝试罗马化需要外部 API 的脚本时抛出。具有 `script` 属性，便于程序化处理。

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

## 支持的脚本

### 本地（完全离线）

| 脚本 | 引擎 | 示例 |
|------|------|------|
| 通用（回退） | [transliteration](https://github.com/nickclaw/transliteration) | `Привет` → `Privet` |
| 日语 | [kuroshiro](https://github.com/sglkc/kuroshiro-ts) + [kuromoji](https://github.com/takuyaa/kuromoji.js) | `こんにちは` → `konnichiha` |
| 普通话 | [pinyin-pro](https://github.com/zh-lx/pinyin-pro) | `你好` → `nǐ hǎo` |
| 粤语 | [to-jyutping](https://github.com/CanCLID/to-jyutping) | `佢冇` → `keoi5 mou5` |
| 韩语 | [@romanize/korean](https://github.com/kntng/romanize) | `안녕` → `annyeong` |
| 西里尔文字 | [cyrillic-to-translit-js](https://github.com/greybax/CyrillicToTranslitJS) | `Привет` → `Privet` |
| 天城文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `नमस्ते` → `namaste` |
| 古吉拉特文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `નમસ્તે` → `namaste` |
| 古木基文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namaste` |
| 泰卢固文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| 卡纳达文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೆ` → `namaste` |
| 奥里亚文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| 泰米尔语 | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| 泰语 | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `sawatdi` |

### 需要外部 API

| 脚本 | 方式 |
|------|------|
| 马拉雅拉姆语 | Google Translate `dt=rm` |
| 孟加拉语 | Google Translate `dt=rm` |
| 阿拉伯语 | Google Translate `dt=rm` |
| 希伯来语 | Google Translate `dt=rm` |
| 其他 | Google Translate `dt=rm` |

使用 `requiresExternalRomanization()` 检测这些脚本并分流到你偏好的 API。

## 脚本专项说明

### 西里尔文字检测

西里尔文字会自动检测乌克兰语特有字符（`і`、`ї`、`є`、`ґ`）并应用乌克兰语转写预设。其他西里尔文字默认按俄语处理。

### 粤语支持

中文默认使用普通话（拼音）。传入 `dialect: 'cantonese'` 可使用粤语粤拼（Jyutping）。

```ts
const { lines } = await romanizer.romanizeLines(['你好世界', '食飯'], {
  script: 'chinese',
  dialect: 'cantonese',
});
// ['nei5 hou2 sai3 gaai3', 'sik6 faan6']
```

## 许可证

MIT
