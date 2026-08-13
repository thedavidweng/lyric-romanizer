# lyric-romanizer

[![npm version](https://img.shields.io/npm/v/lyric-romanizer.svg)](https://www.npmjs.com/package/lyric-romanizer)
[![license](https://img.shields.io/npm/l/lyric-romanizer.svg)](https://github.com/thedavidweng/lyric-romanizer/blob/main/LICENSE)

> **दर्शन: पहिया दोबारा न इजाद करो।**
> इस परियोजना में जानबूझकर रोमनाइज़ेशन तर्क को शुरू से बनाने से बचा गया है। इसके बजाय, यह प्रत्येक लिपि के लिए समुदाय-अनुरक्षित बेहतरीन लाइब्रेरियों को जोड़ता है — ऑर्केस्ट्रेशन परत पर ध्यान केंद्रित करते हुए: लिपि पहचान, इंजन रूटिंग, बोली प्रसंस्करण, और एकीकृत API। निर्भता सूची में प्रत्येक रोमनाइज़ेशन इंजन डोमेन विशेषज्ञों द्वारा अनुरक्षित, परीक्षित लाइब्रेरी है। यही इस परियोजना का मूल विचार है।

गीतों के लिए लिपि पहचान और स्थानीय रोमनाइज़ेशन इंजन। जापानी, चीनी (मंदारिन और कैंटोनीज़), कोरियाई, सिरिलिक, भारतीय लिपियाँ, तमिल, और थाई सहित 12 लिपियों का समर्थन करता है — सब स्थानीय रूप से, बिना किसी API कॉल के।

[Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke) से निकाला गया। [OpenKara](https://github.com/thedavidweng/openkara) द्वारा उपयोग किया जाता है।

[English](https://github.com/thedavidweng/lyric-romanizer#readme) | [日本語](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ja.md) | [中文（简体）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-CN.md) | [中文（粵語）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-yue.md) | [한국어](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ko.md) | [Русский](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ru.md) | [தமிழ்](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ta.md) | [ไทย](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.th.md)

## विशेषताएँ

- **शून्य API कॉल** — सभी रोमनाइज़ेशन स्थानीय रूप से चलता है
- **स्वचालित लिपि पहचान** — पाठ दें, उपयोग की गई लिपि मिलेगी
- **12+ लिपियाँ** — जापानी, चीनी, कोरियाई, सिरिलिक, 6 भारतीय लिपियाँ, तमिल, थाई
- **कैंटोनीज़ समर्थन** — डिफ़ॉल्ट मंदारिन पिनयिन के साथ-साथ कैंटोनीज़ ज्युटपिंग (Jyutping)
- **हल्का पहचान उपपथ** — रोमनाइज़ेशन इंजन शामिल किए बिना केवल लिपि पहचान (और बाहरी-लिपि वर्गीकरण) आयात करें
- **आलसी इंजन** — प्रत्येक इंजन पहले उपयोग पर लोड होता है; जब तक आप रोमनाइज़ न करें, मुख्य प्रविष्टि आयात करने की कोई लागत नहीं
- **वार्मअप** — पहली पंक्ति से पहले किसी लिपि का इंजन (और जापानी शब्दकोश) पहले से लोड किया जा सकता है
- **Kuromoji शब्दकोश सहायक** — `lyric-romanizer/dict` शिप किया गया शब्दकोश ढूँढता है, ताकि डेस्कटॉप ऐप उसे डिफ़ॉल्ट CDN के बजाय स्थानीय रूप से होस्ट कर सके
- **प्लग-योग्य इंजन** — किसी भी अंतर्निर्मित इंजन को ओवरराइड करें, या बाहरी रूप से रोमनाइज़ की जाने वाली लिपियों के लिए अपना स्वयं का एडाप्टर प्लग करें
- **अवलोकनीय फ़ॉलबैक** — प्रति-पंक्ति फ़्लैग बताते हैं कि कब कोई इंजन विफल हुआ और किसी पंक्ति को अंतिम उपाय के रूप में लिप्यंतरित किया गया
- **यूक्रेनी-सचेत सिरिलिक** — यूक्रेनी विशिष्ट वर्णों की स्वचालित पहचान और सही लिप्यंतरण प्रीसेट लागू करें
- **सादे Node ESM में चलता है** — किसी बंडलर की आवश्यकता नहीं

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
const result = await romanizer.romanizeLines(['你好世界', '很高兴认识你']);
// { script: 'chinese', lines: ['nǐ hǎo shì jiè', 'hěn gāo xìng rèn shi nǐ'], fallbacks: [false, false] }

// एक पंक्ति का रोमनाइज़ेशन
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

> **पहचान की सूक्ष्मता** — `romanizeLines` **सभी पंक्तियों में एक बार** प्रमुख लिपि का पता लगाता है और उसे हर पंक्ति के लिए पिन कर देता है (जानबूझकर: किसी जापानी गीत के भीतर केवल-कांजी वाली पंक्तियों को जापानी इंजन तक पहुँचना ज़रूरी है, और सरणी में कोई भी काना `japanese` को पिन कर देता है)। इसके बजाय `romanizeLine` को लूप में कॉल करने पर **प्रति पंक्ति** पहचान होती है और यह प्रत्येक पंक्ति को अलग इंजन पर रूट कर सकता है। पिन की गई लिपि के अंतर्गत शुद्ध-लैटिन पंक्तियाँ जैसी की वैसी लौटाई जाती हैं। देखें **मिश्रित-लिपि सरणियाँ**।

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
import {
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  NON_LATIN_SCRIPT_RE,
} from 'lyric-romanizer/detector';

// शब्दकोश सहायक — केवल Node / बिल्ड-समय। kuromoji शब्दकोश ढूँढता है
// ताकि बंडलर प्लगिन उसे CDN के बजाय ऐप में कॉपी कर सके।
import {
  KUROMOJI_DICT_FILES,
  KUROMOJI_PACKAGE,
  resolveKuromojiDictDir,
} from 'lyric-romanizer/dict';
```

### प्रकार

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

// `dialect` केवल 'chinese' के लिए लागू होता है; बाकी हर लिपि इसे अनदेखा करती है।
type RomanizeOptions = { script?: ScriptType; dialect?: 'mandarin' | 'cantonese' };

// `fallbacks` `lines` के साथ संरेखित है: true वहाँ जहाँ इंजन विफल हुआ और
// पंक्ति को अंतिम उपाय के रूप में यूनिवर्सल रूप से लिप्यंतरित किया गया।
type RomanizeResult = { script: ScriptType; lines: string[]; fallbacks?: boolean[] };

// एक इंजन एडाप्टर: अपनी लिपि की एक पंक्ति को रोमनाइज़ करता है। फेंकना (या
// अस्वीकार करना) यूनिवर्सल लिप्यंतरण फ़ॉलबैक को ट्रिगर करता है।
type RomanizeEngine = (line: string, context: { dialect: 'mandarin' | 'cantonese' }) => string | Promise<string>;

type RomanizerOptions = {
  japaneseDictPath?: string;
  engines?: Partial<Record<ScriptType, RomanizeEngine>>;
};
```

### `createRomanizer(options?)`

फ़ैक्टरी जो `Romanizer` इंस्टेंस लौटाता है। प्रत्येक इंजन पहले उपयोग पर आलसी रूप से लोड होता है और कैश होता है — विफल लोड अगली कॉल पर पुनः प्रयास करता है।

```ts
const romanizer = createRomanizer();

// Kuromoji शब्दकोश CDN पथ ओवरराइड (सेल्फ-होस्टिंग आदि के लिए)
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});

// खाली समय में इंजन पहले से लोड करें (जापानी के लिए शब्दकोश भी पार्स होता है)
await romanizer.warmup('japanese');
await romanizer.warmup(['chinese', 'korean']);
```

> **बंडलर / Vite worker.** आलसी `import()` तभी आलसी रहता है जब बंडलर कोड-स्प्लिट कर सके। Vite का डिफ़ॉल्ट `worker.format` `'iife'` है, जो हर इंजन को worker में इनलाइन कर देता है। `worker: { format: 'es' }` सेट करें ताकि एक चीनी गाना जापानी और कैंटोनीज़ इंजन पार्स न करे। `lyric-romanizer/dict` को worker या ब्राउज़र बंडल से आयात न करें — यह केवल Node के लिए है।

#### `romanizer.warmup(scripts?)`

प्रत्येक लिपि का अंतर्निर्मित इंजन लोड करता है, बिना किसी पंक्ति को रोमनाइज़ किए। `scripts` छोड़ने पर इस इंस्टेंस पर बचे सभी अंतर्निर्मित स्थानीय इंजन पहले से लोड होते हैं। ओवरराइड या इंजेक्ट किए गए इंजन छोड़ दिए जाते हैं। लैटिन और बाहरी लिपियाँ no-op हैं। लोड विफल होने पर **reject** होता है। `romanizeLines` के विपरीत, warmup सार्वभौमिक लिप्यंतरण पर नहीं गिरता।

#### `lyric-romanizer/dict`

उन उपभोक्ताओं के लिए Node / बिल्ड-समय सहायक जो kuromoji शब्दकोश को ऐप में रखते हैं (Tauri/Electron, स्थिर `public/dict/`)। लाइब्रेरी का डिफ़ॉल्ट `japaneseDictPath` jsDelivr CDN है; यह प्रविष्टि उसे एकमात्र विकल्प नहीं रहने देती।

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

#### इंजन एडाप्टर

`options.engines` किसी लिपि के लिए अंतर्निर्मित इंजन को ओवरराइड करता है — या ऐसी लिपि में इंजन प्लग करता है जिसमें कोई अंतर्निर्मित इंजन नहीं है (`arabic`, `hebrew`, `malayalam`, `bengali`, `other`), ताकि `romanizeLines` हर लिपि को एक ही इंटरफ़ेस के माध्यम से संभाल सके। डिफ़ॉल्ट रूप से लाइब्रेरी **शून्य नेटवर्क I/O** करती है; रिमोट एडाप्टर प्लग करना कॉलर का स्पष्ट निर्णय है।

```ts
const romanizer = createRomanizer({
  engines: {
    // स्थानीय इंजन रहित लिपियों के लिए अपना स्वयं का बाहरी रोमनाइज़ेशन लाएँ।
    arabic: async (line) => myTransliterationApi(line),
    // या किसी अंतर्निर्मित इंजन को बदलें (उदा. परीक्षणों में नकली इंजन से)।
    korean: (line) => myKoreanRomanizer(line),
  },
});

await romanizer.romanizeLines(['مرحبا']);
// { script: 'arabic', lines: [...], fallbacks: [false] } — अब और नहीं फेंकता
```

बिना किसी इंजन वाली लिपियाँ — अंतर्निर्मित या इंजेक्ट की गई — अब भी `UnsupportedRomanizationError` फेंकती हैं।

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

उन लिपियों के लिए `true` लौटाता है जिनमें कोई अंतर्निर्मित इंजन नहीं है और जिन्हें बाहरी API की आवश्यकता है। हल्के `lyric-romanizer/detector` उपपथ से आयात करने योग्य, इसलिए "क्या मुझे किसी बाहरी सेवा की ओर शाखा बनानी चाहिए?" का उत्तर देने में शून्य इंजन पेलोड लगता है।

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

एक पंक्ति का रोमनाइज़ेशन करता है। यदि `script` छोड़ दिया जाए, तो `detectScript` के माध्यम से **प्रति पंक्ति** स्वचालित रूप से पहचाना जाता है — `romanizeLine` पर लूप करने से प्रत्येक पंक्ति अलग इंजन पर रूट हो सकती है, `romanizeLines` के विपरीत, जो पूरी सरणी के लिए एक ही लिपि पिन करता है। लैटिन पाठ या बिना अक्षर वाली सामग्री के लिए मूल पंक्ति जैसी की वैसी लौटाता है।

चीनी पाठ के लिए `dialect` विकल्प रोमनाइज़ेशन प्रणाली को नियंत्रित करता है: `'mandarin'` (डिफ़ॉल्ट) पिनयिन का उपयोग करता है, `'cantonese'` [Jyutping](https://github.com/CanCLID/to-jyutping) का उपयोग करता है। अन्य लिपियाँ `dialect` को अनदेखा करती हैं।

बिना किसी इंजन (अंतर्निर्मित या इंजेक्ट की गई) वाली लिपियों के लिए `UnsupportedRomanizationError` **फेंकता है**।

```ts
await romanizer.romanizeLine('你好世界');
// 'nǐ hǎo shì jiè' (डिफ़ॉल्ट: मंदारिन/पिनयिन)

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

कई पंक्तियों का समानांतर में रोमनाइज़ेशन करता है। **सभी पंक्तियों में एक बार** प्रमुख लिपि का पता लगाता है और उसे हर पंक्ति के लिए पिन करता है (देखें **मिश्रित-लिपि सरणियाँ**)। लिपि, रोमनाइज़ की गई पंक्तियाँ, और प्रति-पंक्ति `fallbacks` फ़्लैग लौटाता है — `true` वहाँ जहाँ इंजन विफल हुआ और पंक्ति को अंतिम उपाय के रूप में यूनिवर्सल रूप से लिप्यंतरित किया गया।

```ts
const { script, lines, fallbacks } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['swasdi', 'chaolok'], fallbacks: [false, false] }
```

### `UnsupportedRomanizationError`

जब ऐसी लिपि का रोमनाइज़ेशन करने का प्रयास किया जाता है जिसमें कोई इंजन नहीं है — न अंतर्निर्मित और न ही `options.engines` के माध्यम से इंजेक्ट किया गया — तब फेंका जाता है। प्रोग्रामेटिक प्रसंस्करण के लिए `script` गुण है।

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
| गुरमुखी | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namasate` |
| तेलुगु | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| कन्नड़ | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೇ` → `namaste` |
| ओडिया | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| तमिल | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| थाई | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `swasdi` |

### बाहरी API आवश्यक

| लिपि | विधि |
|------|------|
| मलयालम | Google Translate `dt=rm` |
| बंगाली | Google Translate `dt=rm` |
| अरबी | Google Translate `dt=rm` |
| हिब्रू | Google Translate `dt=rm` |
| अन्य | Google Translate `dt=rm` |

इनका पता लगाने और अपने पसंदीदा API पर स्विच करने के लिए `requiresExternalRomanization()` का उपयोग करें — या API को एक बार **इंजन एडाप्टर** के रूप में प्लग करें और `romanizeLines` को हर लिपि संभालने दें।

## लिपि-विशिष्ट नोट्स

### मिश्रित-लिपि सरणियाँ

`romanizeLines` पूरी सरणी की **प्रमुख** लिपि को हर पंक्ति पर पिन करता है। यह जानबूझकर है: किसी जापानी गीत के भीतर केवल-कांजी वाली पंक्ति अपने आप में चीनी से अप्रभेद्य होती है (कांजी और हान्ज़ी एक ही Unicode ब्लॉक साझा करते हैं), इसलिए केवल पूरी-सरणी का संदर्भ ही उसे सही इंजन पर रूट करता है। जानने योग्य परिणाम:

- सरणी में कहीं भी कोई भी काना पूरी सरणी को `japanese` पर पिन कर देता है — काना निर्णायक प्रमाण है।
- सरणी के भीतर किसी *भिन्न* गैर-लैटिन लिपि की पंक्ति को भी पिन किए गए इंजन को ही दिया जाता है।
- शुद्ध-लैटिन पंक्तियाँ (किसी CJK गीत के भीतर अंग्रेज़ी कोरस) को पिन किए गए इंजन को देने के बजाय **जैसी की वैसी लौटाया जाता है**।
- प्रति-पंक्ति `fallbacks` फ़्लैग बताते हैं कि कब कोई इंजन विफल हुआ और कोई पंक्ति यूनिवर्सल लिप्यंतरण पर फ़ॉलबैक हो गई।

यदि आपको सच्ची प्रति-पंक्ति इंजन रूटिंग चाहिए, तो `romanizeLine` को लूप में कॉल करें — यह प्रति पंक्ति पहचान करता है।

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
