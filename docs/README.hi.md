# lyric-romanizer

[![npm version](https://img.shields.io/npm/v/lyric-romanizer.svg)](https://www.npmjs.com/package/lyric-romanizer)
[![license](https://img.shields.io/npm/l/lyric-romanizer.svg)](https://github.com/thedavidweng/lyric-romanizer/blob/main/LICENSE)

> **दर्शन: पहिया दोबारा न इजाद करो।**
> इस परियोजना में जानबूझकर रोमनाइज़ेशन तर्क को शुरू से बनाने से बचा गया है। इसके बजाय, यह प्रत्येक लिपि के लिए समुदाय-अनुरक्षित बेहतरीन लाइब्रेरियों को जोड़ता है — ऑर्केस्ट्रेशन परत पर ध्यान केंद्रित करते हुए: लिपि पहचान, इंजन रूटिंग, बोली प्रसंस्करण, और एकीकृत API। निर्भता सूची में प्रत्येक रोमनाइज़ेशन इंजन डोमेन विशेषज्ञों द्वारा अनुरक्षित, परीक्षित लाइब्रेरी है। यही इस परियोजना का मूल विचार है।

गीतों के लिए लिपि पहचान और स्थानीय रोमनाइज़ेशन इंजन। जापानी, चीनी (मंदारिन और कैंटोनीज़), कोरियाई, सिरिलिक, भारतीय लिपियाँ, तमिल, और थाई सहित 12+ लिपियों का समर्थन करता है — सब स्थानीय रूप से, बिना किसी API कॉल के।

[Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke) से निकाला गया। [OpenKara](https://github.com/thedavidweng/openkara) द्वारा उपयोग किया जाता है।

[English](https://github.com/thedavidweng/lyric-romanizer#readme) | [日本語](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ja.md) | [中文（简体）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-CN.md) | [中文（粵語）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-yue.md) | [한국어](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ko.md) | [Русский](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ru.md) | [தமிழ்](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ta.md) | [ไทย](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.th.md)

## विशेषताएँ

- **शून्य API कॉल** — सभी रोमनाइज़ेशन स्थानीय रूप से चलता है
- **स्वचालित लिपि पहचान** — पाठ दें, उपयोग की गई लिपि मिलेगी
- **12+ लिपियाँ** — जापानी, चीनी, कोरियाई, सिरिलिक, 7 भारतीय लिपियाँ, तमिल, थाई
- **कैंटोनीज़ समर्थन** — डिफ़ॉल्ट मंदारिन पिनयिन के साथ-साथ कैंटोनीज़ ज्युटपिंग (Jyutping)
- **हल्का पहचान उपपथ** — रोमनाइज़ेशन इंजन के बिना केवल लिपि पहचान आयात करें
- **यूक्रेनी-सचेत सिरिलिक** — यूक्रेनी विशिष्ट वर्णों की स्वचालित पहचान और सही लिप्यंतरण प्रीसेट लागू करें

## स्थापना

```bash
npm install lyric-romanizer
```

```bash
yarn add lyric-romanizer
```

```bash
pnpm add lyric-romanizer
```

## त्वरित प्रारंभ

```ts
import { createRomanizer, detectScript } from 'lyric-romanizer';

const romanizer = createRomanizer();

// लिपि स्वचालित पहचान और रोमनाइज़ेशन
const result = await romanizer.romanizeLines(['你好世界', 'こんにちは']);
// { script: 'chinese', lines: ['nǐ hǎo shì jiè', 'こんにちは'] }

// एक पंक्ति का रोमनाइज़ेशन
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

## API

### आयात

```ts
// मुख्य प्रविष्टि — पूर्ण रोमनाइज़ेशन इंजन
import {
  createRomanizer,
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  UnsupportedRomanizationError,
} from 'lyric-romanizer';

// केवल पहचान उपपथ — हल्का, रोमनाइज़ेशन निर्भता रहित
import { detectScript, isLatinScript, NON_LATIN_SCRIPT_RE } from 'lyric-romanizer/detector';
```

### प्रकार

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

फ़ैक्टरी जो `Romanizer` इंस्टेंस लौटाता है। Kuroshiro इंजन (जापानी) पहले उपयोग पर आलसी प्रारंभ होता है और कैश होता है।

```ts
const romanizer = createRomanizer();

// Kuromoji शब्दकोश CDN पथ ओवरराइड (सेल्फ-होस्टिंग आदि के लिए)
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});
```

### `detectScript(lines)`

दी गई पाठ पंक्तियों में प्रमुख लिपि का पता लगाता है। पहले जापानी काना की जाँच करता है (निर्धारक), फिर अन्य सभी लिपियों को वर्ण गणना से स्कोर करता है।

```ts
detectScript(['こんにちは']);          // 'japanese'
detectScript(['你好世界']);            // 'chinese'
detectScript(['Привет']);             // 'cyrillic'
detectScript(['Hello world']);        // 'latin'
detectScript(['123 ???']);            // 'other'
```

### `isLatinScript(lines)`

त्वरित जाँच — यदि पाठ में केवल लैटिन अक्षर हैं (CJK, सिरिलिक, भारतीय लिपियाँ आदि के बिना) तो `true` लौटाता है। रोमनाइज़ेशन को पूरी तरह छोड़ने के लिए उपयोगी।

```ts
isLatinScript(['Hello world']);  // true
isLatinScript(['안녕하세요']);    // false
isLatinScript(['♪♪♪']);         // false (कोई अक्षर नहीं)
```

### `requiresExternalRomanization(script)`

उन लिपियों के लिए `true` लौटाता है जिन्हें स्थानीय रूप से रोमनाइज़ नहीं किया जा सकता और जिन्हें बाहरी API की आवश्यकता है।

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

एक पंक्ति का रोमनाइज़ेशन करता है। `script` छोड़ने पर `detectScript` से स्वचालित पहचान होती है। लैटिन पाठ या बिना अक्षर वाली सामग्री जैसी की वैसी लौटती है।

चीनी पाठ के लिए `dialect` विकल्प रोमनाइज़ेशन प्रणाली को नियंत्रित करता है: `'mandarin'` (डिफ़ॉल्ट) पिनयिन का उपयोग करता है, `'cantonese'` [Jyutping](https://github.com/CanCLID/to-jyutping) का उपयोग करता है।

**बाहरी लिपियों के लिए** `UnsupportedRomanizationError` फेंकता है।

```ts
await romanizer.romanizeLine('नमस्ते दुनिया');
// 'namaste duniya'

await romanizer.romanizeLine('你好', { dialect: 'cantonese' });
// 'nei5 hou2' (Jyutping)

await romanizer.romanizeLine('Привет мир');
// 'Privet mir'

await romanizer.romanizeLine('Hello world');
// 'Hello world' (जैसी की वैसी)

await romanizer.romanizeLine('مرحبا');
// throws UnsupportedRomanizationError { script: 'arabic' }
```

### `romanizer.romanizeLines(lines, options?)`

कई पंक्तियों का समानांतर रोमनाइज़ेशन करता है। पहचानी गई लिपि और रोमनाइज़ की गई पंक्तियाँ लौटाता है।

```ts
const { script, lines } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['sawatdi', 'chaolok'] }
```

### `UnsupportedRomanizationError`

जब बाहरी API की आवश्यकता वाली लिपि का रोमनाइज़ेशन करने का प्रयास किया जाता है तो फेंका जाता है। प्रोग्रामेटिक प्रसंस्करण के लिए `script` गुण है।

```ts
try {
  await romanizer.romanizeLine('مرحبا');
} catch (err) {
  if (err instanceof UnsupportedRomanizationError) {
    console.log(err.script); // 'arabic'
    // बाहरी API पर फ़ॉलबैक
  }
}
```

## समर्थित लिपियाँ

### स्थानीय (पूर्णतः ऑफ़लाइन)

| लिपि | इंजन | उदाहरण |
|------|------|--------|
| यूनिवर्सल *(fallback)* | [transliteration](https://github.com/nickclaw/transliteration) | `Привет` → `Privet` |
| जापानी | [kuroshiro](https://github.com/sglkc/kuroshiro-ts) + [kuromoji](https://github.com/takuyaa/kuromoji.js) | `こんにちは` → `konnichiha` |
| मंदारिन | [pinyin-pro](https://github.com/zh-lx/pinyin-pro) | `你好` → `nǐ hǎo` |
| कैंटोनीज़ | [to-jyutping](https://github.com/CanCLID/to-jyutping) | `佢冇` → `keoi5 mou5` |
| कोरियाई | [@romanize/korean](https://github.com/kntng/romanize) | `안녕` → `annyeong` |
| सिरिलिक | [cyrillic-to-translit-js](https://github.com/greybax/CyrillicToTranslitJS) | `Привет` → `Privet` |
| देवनागरी | [sanscript](https://github.com/indic-transliteration/sanscript) | `नमस्ते` → `namaste` |
| गुजराती | [sanscript](https://github.com/indic-transliteration/sanscript) | `નમસ્તે` → `namaste` |
| गुरमुखी | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namaste` |
| तेलुगु | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| कन्नड़ | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೆ` → `namaste` |
| ओडिया | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| तमिल | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| थाई | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `sawatdi` |

### बाहरी API आवश्यक

| लिपि | विधि |
|------|------|
| मलयालम | Google Translate `dt=rm` |
| बंगाली | Google Translate `dt=rm` |
| अरबी | Google Translate `dt=rm` |
| हिब्रू | Google Translate `dt=rm` |
| अन्य | Google Translate `dt=rm` |

इनका पता लगाने और अपने पसंदीदा API पर स्विच करने के लिए `requiresExternalRomanization()` का उपयोग करें।

## लिपि-विशिष्ट नोट्स

### सिरिलिक पहचान

सिरिलिक स्वचालित रूप से यूक्रेनी विशिष्ट वर्णों (`і`, `ї`, `є`, `ґ`) की पहचान करता है और यूक्रेनी लिप्यंतरण प्रीसेट लागू करता है। अन्य सभी सिरिलिक पाठ डिफ़ॉल्ट रूप से रूसी के रूप में संसाधित होता है।

### कैंटोनीज़ समर्थन

चीनी पाठ डिफ़ॉल्ट रूप से मंदारिन (पिनयिन) है। `RomanizeOptions` में `dialect: 'cantonese'` पास करें ताकि चीनी पाठ को [Jyutping](https://github.com/CanCLID/to-jyutping) में रोमनाइज़ किया जा सके।

```ts
const { lines } = await romanizer.romanizeLines(['你好世界', '食飯'], {
  script: 'chinese',
  dialect: 'cantonese',
});
// ['nei5 hou2 sai3 gaai3', 'sik6 faan6']
```

## लाइसेंस

MIT
