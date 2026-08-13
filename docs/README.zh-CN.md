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
- **12+ 种脚本** — 日语、中文、韩语、西里尔文字、6 种印度系文字、泰米尔语、泰语
- **粤语支持** — 除默认普通话拼音外，还支持粤语粤拼（Jyutping）
- **轻量子路径导入** — 可仅导入脚本检测功能（以及外部脚本分类），无需引入罗马化引擎
- **惰性引擎** — 每个引擎都在首次使用时加载；在你真正开始罗马化之前，导入主入口不会产生任何开销
- **预热** — 可在第一行之前预加载某个脚本的引擎（以及日语词典）
- **Kuromoji 词典辅助** — `lyric-romanizer/dict` 定位随包装来的词典，桌面应用可以本地托管，而不走默认 CDN
- **可插拔引擎** — 可覆盖任意内置引擎，或为需要外部罗马化的脚本插入你自己的适配器
- **可观测的回退** — 逐行标志会告诉你引擎何时失败、以及某行何时作为最后手段被转写
- **乌克兰语感知西里尔文字** — 自动检测乌克兰语特有字符并应用正确的转写预设
- **可在纯 Node ESM 中运行** — 无需打包工具

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
const result = await romanizer.romanizeLines(['你好世界', '很高兴认识你']);
// { script: 'chinese', lines: ['nǐ hǎo shì jiè', 'hěn gāo xìng rèn shi nǐ'], fallbacks: [false, false] }

// 罗马化单行
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

> **检测粒度** — `romanizeLines` 会**在所有行上统一检测一次**主导脚本，并将其固定应用于每一行（这是刻意的设计：日语歌曲中仅含汉字的行也必须交由日语引擎处理，而数组中任何假名都会将脚本固定为 `japanese`）。相反，在循环中调用 `romanizeLine` 会**逐行检测**，可能将每一行路由到不同的引擎。在已固定的脚本下，纯拉丁文本的行会原样返回。参见**混合脚本数组**。

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
import {
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  NON_LATIN_SCRIPT_RE,
} from 'lyric-romanizer/detector';

// 词典辅助 — 仅限 Node / 构建期。定位 kuromoji 词典，
// 以便打包插件把它拷进应用，而不是去拉 CDN。
import {
  KUROMOJI_DICT_FILES,
  KUROMOJI_PACKAGE,
  resolveKuromojiDictDir,
} from 'lyric-romanizer/dict';
```

### 类型

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

// `dialect` 仅对 'chinese' 生效；其他所有脚本都会忽略它。
type RomanizeOptions = { script?: ScriptType; dialect?: 'mandarin' | 'cantonese' };

// `fallbacks` 与 `lines` 一一对应：当引擎失败、
// 该行作为最后手段被通用转写时，对应值为 true。
type RomanizeResult = { script: ScriptType; lines: string[]; fallbacks?: boolean[] };

// 引擎适配器：罗马化其对应脚本的一行文本。
// 抛出（或 reject）会触发通用转写回退。
type RomanizeEngine = (line: string, context: { dialect: 'mandarin' | 'cantonese' }) => string | Promise<string>;

type RomanizerOptions = {
  japaneseDictPath?: string;
  engines?: Partial<Record<ScriptType, RomanizeEngine>>;
};
```

### `createRomanizer(options?)`

工厂函数，返回 `Romanizer` 实例。每个引擎都在首次使用时惰性加载并缓存——加载失败会在下次调用时重试。

```ts
const romanizer = createRomanizer();

// 覆盖 Kuromoji 词典 CDN 路径（例如用于自托管）
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});

// 空闲时预加载引擎（日语还会解析词典）
await romanizer.warmup('japanese');
await romanizer.warmup(['chinese', 'korean']);
```

> **打包器 / Vite worker。** 惰性 `import()` 只有在打包器能做 code-split 时才惰性。Vite 默认 `worker.format` 是 `'iife'`，会把所有引擎内联进 worker。设 `worker: { format: 'es' }`，中文歌才不会去解析日语和粤语引擎。不要从 worker 或浏览器包里导入 `lyric-romanizer/dict` — 它只用于 Node。

#### `romanizer.warmup(scripts?)`

加载每个脚本的内置引擎，但不罗马化任何一行。省略 `scripts` 会预加载该实例上仍安装的全部内置本地引擎。被覆盖或注入的引擎会被跳过。拉丁文和外部脚本是空操作。加载失败会 **reject** — 与 `romanizeLines` 不同，warmup 不会回退到通用转写。

#### `lyric-romanizer/dict`

Node / 构建期辅助，供把 kuromoji 词典打进应用的消费者使用（Tauri/Electron、静态 `public/dict/`）。库的默认 `japaneseDictPath` 是 jsDelivr CDN；这个入口让默认 CDN 不必成为唯一选项。

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

#### 引擎适配器

`options.engines` 会覆盖某个脚本的内置引擎——或者为本身没有内置引擎的脚本（`arabic`、`hebrew`、`malayalam`、`bengali`、`other`）插入一个引擎，使 `romanizeLines` 能够通过统一接口处理每一种脚本。默认情况下，本库执行**零网络 I/O**；插入远程适配器是调用方的显式决定。

```ts
const romanizer = createRomanizer({
  engines: {
    // 为没有本地引擎的脚本引入你自己的外部罗马化实现。
    arabic: async (line) => myTransliterationApi(line),
    // 或替换某个内置引擎（例如在测试中用 fake 实现替换）。
    korean: (line) => myKoreanRomanizer(line),
  },
});

await romanizer.romanizeLines(['مرحبا']);
// { script: 'arabic', lines: [...], fallbacks: [false] } — 不再抛出异常
```

既没有内置引擎、也没有注入引擎的脚本仍会抛出 `UnsupportedRomanizationError`。

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

对于没有内置引擎、需要外部 API 的脚本返回 `true`。该函数可从轻量的 `lyric-romanizer/detector` 子路径导入，因此回答“是否要分流到外部服务？”这一问题不会带来任何引擎负载。

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

罗马化单行文本。省略 `script` 时，会通过 `detectScript` **逐行**自动检测——在循环中调用 `romanizeLine` 可能将每一行路由到不同的引擎，这与 `romanizeLines` 不同（后者为整个数组固定一种脚本）。拉丁文本或无字母内容原样返回。

对于中文文本，`dialect` 选项控制罗马化系统：`'mandarin'`（默认）使用拼音，`'cantonese'` 使用 [Jyutping](https://github.com/CanCLID/to-jyutping)。其他脚本会忽略 `dialect`。

对于没有引擎（内置或注入）的脚本会**抛出** `UnsupportedRomanizationError`。

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

并行罗马化多行文本。**在所有行上统一检测一次**主导脚本，并将其固定应用于每一行（参见**混合脚本数组**）。返回检测到的脚本、罗马化后的行，以及逐行的 `fallbacks` 标志——引擎失败、且该行作为最后手段被通用转写的位置为 `true`。

```ts
const { script, lines, fallbacks } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['swasdi', 'chaolok'], fallbacks: [false, false] }
```

### `UnsupportedRomanizationError`

当尝试罗马化一个没有引擎（内置引擎或通过 `options.engines` 注入的引擎）的脚本时抛出。具有 `script` 属性，便于程序化处理。

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
| 古木基文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namasate` |
| 泰卢固文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| 卡纳达文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೇ` → `namaste` |
| 奥里亚文 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| 泰米尔语 | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| 泰语 | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `swasdi` |

### 需要外部 API

| 脚本 | 方式 |
|------|------|
| 马拉雅拉姆语 | Google Translate `dt=rm` |
| 孟加拉语 | Google Translate `dt=rm` |
| 阿拉伯语 | Google Translate `dt=rm` |
| 希伯来语 | Google Translate `dt=rm` |
| 其他 | Google Translate `dt=rm` |

使用 `requiresExternalRomanization()` 检测这些脚本并分流到你偏好的 API——或者将该 API 作为**引擎适配器**一次性接入，让 `romanizeLines` 处理每一种脚本。

## 脚本专项说明

### 混合脚本数组

`romanizeLines` 会将整个数组的**主导**脚本固定应用于每一行。这是刻意的设计：日语歌曲中仅含日文汉字的行单独来看与中文无法区分（日文汉字与中文汉字共用同一 Unicode 区块），因此只有依靠整个数组的上下文才能将其路由到正确的引擎。以下是一些值得了解的影响：

- 数组中任意位置出现的假名都会将整个数组固定为 `japanese`——假名是确定性的证据。
- 数组中属于*其他*非拉丁脚本的行，仍会被送入已固定的引擎处理。
- 纯拉丁文本的行（CJK 歌曲中的英文副歌）会被**原样返回**，而不会被送入已固定的引擎。
- 逐行的 `fallbacks` 标志会报告某个引擎何时失败、以及某行何时降级为通用转写。

如果你需要真正的逐行引擎路由，请在循环中调用 `romanizeLine`——它会逐行检测。

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
