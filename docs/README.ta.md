# lyric-romanizer

[![npm version](https://img.shields.io/npm/v/lyric-romanizer.svg)](https://www.npmjs.com/package/lyric-romanizer)
[![license](https://img.shields.io/npm/l/lyric-romanizer.svg)](https://github.com/thedavidweng/lyric-romanizer/blob/main/LICENSE)

> **தத்துவம்: சக்கரத்தை மீண்டும் கண்டுபிடிக்க வேண்டாம்.**
> இந்த திட்டம் புனைவு மொழியாக்க தர்க்கத்தை புதிதாக உருவாக்குவதை திட்டமிட்டு தவிர்க்கிறது. அதற்கு பதிலாக, ஒவ்வொரு எழுத்துக்கும் சிறந்த சமூக பராமரிப்பு நூலகங்களை இணைக்கிறது — இசையமைப்பு அடுக்கில் கவனம் செலுத்துகிறது: எழுத்து கண்டறிதல், இயந்திர வழிமாற்று, பேச்சுமொழி செயலாக்கம், மற்றும் ஒருங்கிணைந்த API. சார்பு பட்டியலில் உள்ள ஒவ்வொரு புனைவு மொழியாக்க இயந்திரமும் துறை நிபுணர்களால் பராமரிக்கப்படும், சோதிக்கப்பட்ட நூலகம். இதுவே இந்த திட்டத்தின் மைய கருத்து.

பாடல் வரிகளுக்கான எழுத்து கண்டறிதல் மற்றும் உள்ளூர் புனைவு மொழியாக்க இயந்திரம். ஜப்பானிய, சீன (மாண்டரின் மற்றும் காண்டோனீஸ்), கொரியன், சிரிலிலிக், இந்திய எழுத்துகள், தமிழ், மற்றும் தாய் உள்ளிட்ட 12+ எழுத்துகளை ஆதரிக்கிறது — அனைத்தும் உள்ளூராக, API அழைப்புகள் இல்லாமல் இயங்குகின்றன.

[Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke) இருந்து பிரிக்கப்பட்டது. [OpenKara](https://github.com/thedavidweng/openkara) ஆல் பயன்படுத்தப்படுகிறது.

[English](https://github.com/thedavidweng/lyric-romanizer#readme) | [日本語](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ja.md) | [中文（简体）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-CN.md) | [中文（粵語）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-yue.md) | [한국어](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ko.md) | [Русский](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ru.md) | [हिन्दी](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.hi.md) | [ไทย](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.th.md)

## அம்சங்கள்

- **பூஜ்ஜிய API அழைப்புகள்** — அனைத்து புனைவு மொழியாக்கமும் உள்ளூராக இயங்குகிறது
- **தானியங்கி எழுத்து கண்டறிதல்** — உரையை அனுப்புங்கள், பயன்படுத்தப்பட்ட எழுத்து கிடைக்கும்
- **12+ எழுத்துகள்** — ஜப்பானிய, சீன, கொரியன், சிரிலிலிக், 6 இந்திய எழுத்துகள், தமிழ், தாய்
- **காண்டோனீஸ் ஆதரவு** — இயல்புநிலை மாண்டரின் பின்யின் கூடுதலாக காண்டோனீஸ் ஜூட்பிங் (Jyutping)
- **இலகுரக கண்டறிதல் துணைப்பாதை** — புனைவு மொழியாக்க இயந்திரங்களை இழுக்காமல் எழுத்து கண்டறிதல் (மற்றும் வெளி-எழுத்து வகைப்பாடு) மட்டும் இறக்குமதி செய்யுங்கள்
- **சோம்பேறி இயந்திரங்கள்** — ஒவ்வொரு இயந்திரமும் முதல் பயன்பாட்டில் ஏற்றப்படுகிறது; நீங்கள் புனைவு மொழியாக்கம் செய்யும் வரை முக்கிய நுழைவை இறக்குமதி செய்வது எதுவும் செலவாகாது
- **செருகக்கூடிய இயந்திரங்கள்** — எந்த உள்ளமைந்த இயந்திரத்தையும் மேலெழுதுங்கள், அல்லது வெளியில் புனைவு மொழியாக்கம் செய்யப்படும் எழுத்துகளுக்கு உங்கள் சொந்த அடாப்டரை செருகுங்கள்
- **கவனிக்கத்தக்க fallbacks** — ஒரு இயந்திரம் தோல்வியடைந்து ஒரு வரி கடைசி முயற்சியாக ஒலிபெயர்க்கப்பட்டபோது, ஒவ்வொரு வரிக்குமான கொடிகள் அதை உங்களுக்குத் தெரிவிக்கின்றன
- **உக்ரேனிய-விழிப்புணர்வு சிரிலிலிக்** — உக்ரேனிய சிறப்பு எழுத்துகளை தானாக கண்டறிதல் மற்றும் சரியான ஒலிபெயர்ப்பு முன்அமைப்பை பயன்படுத்துதல்
- **எளிய Node ESM இல் இயங்குகிறது** — எந்த bundler-ம் தேவையில்லை

## நிறுவல்

```bash
npm install lyric-romanizer
```

```bash
yarn add lyric-romanizer
```

```bash
pnpm add lyric-romanizer
```

## விரைவு தொடக்கம்

```ts
import { createRomanizer, detectScript } from 'lyric-romanizer';

const romanizer = createRomanizer();

// எழுத்து தானாக கண்டறிதல் மற்றும் புனைவு மொழியாக்கம்
const result = await romanizer.romanizeLines(['你好世界', '很高兴认识你']);
// { script: 'chinese', lines: ['nǐ hǎo shì jiè', 'hěn gāo xìng rèn shi nǐ'], fallbacks: [false, false] }

// ஒரு வரியை புனைவு மொழியாக்கம் செய்தல்
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

> **கண்டறிதல் நுண்மை** — `romanizeLines` ஆதிக்க எழுத்தை **அனைத்து வரிகளிலும் ஒரேமுறை** கண்டறிந்து அதை ஒவ்வொரு வரிக்கும் நிலைநிறுத்துகிறது (வேண்டுமென்றே: ஒரு ஜப்பானிய பாடலில் உள்ள கான்ஜி-மட்டும் வரிகள் ஜப்பானிய இயந்திரத்தை அடைய வேண்டும், மேலும் அணியில் உள்ள எந்த கானாவும் `japanese` ஐ நிலைநிறுத்துகிறது). அதற்குப் பதிலாக `romanizeLine` ஐ ஒரு சுழற்சியில் அழைப்பது **ஒவ்வொரு வரிக்கும் தனித்தனியாக** கண்டறிந்து ஒவ்வொரு வரியையும் வெவ்வேறு இயந்திரத்திற்கு அனுப்பக்கூடும். நிலைநிறுத்தப்பட்ட எழுத்தின் கீழ் தூய-லத்தீன் வரிகள் அப்படியே வழங்கப்படும். **கலப்பு-எழுத்து அணிகள்** பகுதியைப் பார்க்கவும்.

## API

### இறக்குமதி

```ts
// முக்கிய நுழைவு — முழு புனைவு மொழியாக்க இயந்திரம்
import {
  createRomanizer,
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  UnsupportedRomanizationError,
} from 'lyric-romanizer';

// கண்டறிதல் மட்டும் துணைப்பாதை — இலகுரக, புனைவு மொழியாக்க சார்புகள் இல்லாமல்
import {
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  NON_LATIN_SCRIPT_RE,
} from 'lyric-romanizer/detector';
```

### வகைகள்

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
}

// `dialect` என்பது 'chinese' க்கு மட்டுமே செல்லுபடியாகும்; மற்ற ஒவ்வொரு எழுத்தும் அதை புறக்கணிக்கிறது.
type RomanizeOptions = { script?: ScriptType; dialect?: 'mandarin' | 'cantonese' };

// `fallbacks` என்பது `lines` உடன் ஒத்திசைக்கப்படுகிறது: இயந்திரம் தோல்வியடைந்து
// அந்த வரி கடைசி முயற்சியாக யூனிவர்சலாக ஒலிபெயர்க்கப்பட்ட இடத்தில் true.
type RomanizeResult = { script: ScriptType; lines: string[]; fallbacks?: boolean[] };

// ஒரு இயந்திர அடாப்டர்: அதன் எழுத்தின் ஒரு வரியை புனைவு மொழியாக்கம் செய்கிறது. எறிதல் (அல்லது
// நிராகரித்தல்) யூனிவர்சல் ஒலிபெயர்ப்பு fallback ஐ தூண்டுகிறது.
type RomanizeEngine = (line: string, context: { dialect: 'mandarin' | 'cantonese' }) => string | Promise<string>;

type RomanizerOptions = {
  japaneseDictPath?: string;
  engines?: Partial<Record<ScriptType, RomanizeEngine>>;
};
```

### `createRomanizer(options?)`

`Romanizer` நிகழ்வை வழங்கும் தொழிற்சாலை. ஒவ்வொரு இயந்திரமும் முதல் பயன்பாட்டில் சோம்பேறியாக ஏற்றப்பட்டு தேக்கமாக்கப்படும் — தோல்வியடைந்த ஏற்றம் அடுத்த அழைப்பில் மீண்டும் முயற்சிக்கும்.

```ts
const romanizer = createRomanizer();

// Kuromoji அகராதி CDN பாதையை மேலெழுத (சுய-ஹோஸ்டிங் போன்றவற்றுக்கு)
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});
```

#### இயந்திர அடாப்டர்கள்

`options.engines` ஒரு எழுத்துக்கான உள்ளமைந்த இயந்திரத்தை மேலெழுதுகிறது — அல்லது உள்ளமைந்த இயந்திரம் இல்லாத ஒரு எழுத்தில் (`arabic`, `hebrew`, `malayalam`, `bengali`, `other`) ஒரு இயந்திரத்தை செருகுகிறது, இதனால் `romanizeLines` ஒரே இடைமுகம் வழியாக ஒவ்வொரு எழுத்தையும் கையாள முடியும். இயல்பாக இந்த நூலகம் **பூஜ்ஜிய நெட்வொர்க் I/O** செய்கிறது; ஒரு தொலை அடாப்டரை செருகுவது அழைப்பாளரின் வெளிப்படையான முடிவாகும்.

```ts
const romanizer = createRomanizer({
  engines: {
    // உள்ளூர் இயந்திரம் இல்லாத எழுத்துகளுக்கு உங்கள் சொந்த வெளி புனைவு மொழியாக்கத்தை கொண்டு வாருங்கள்.
    arabic: async (line) => myTransliterationApi(line),
    // அல்லது ஒரு உள்ளமைந்த இயந்திரத்தை மாற்றவும் (எ.கா. சோதனைகளில் ஒரு போலியுடன்).
    korean: (line) => myKoreanRomanizer(line),
  },
});

await romanizer.romanizeLines(['مرحبا']);
// { script: 'arabic', lines: [...], fallbacks: [false] } — இனி எறியாது
```

இயந்திரம் இல்லாத எழுத்துகள் — உள்ளமைந்ததோ அல்லது உட்செலுத்தப்பட்டதோ — இன்னும் `UnsupportedRomanizationError` ஐ எறியும்.

### `detectScript(lines)`

கொடுக்கப்பட்ட உரை வரிகளில் ஆதிக்க எழுத்தை கண்டறியும். முதலில் ஜப்பானிய கானாவை சரிபார்க்கும் (தீர்மானகரமான), பிறகு மற்ற எழுத்துகளை எழுத்து எண்ணிக்கையால் மதிப்பிடும்.

```ts
detectScript(['こんにちは']);          // 'japanese'
detectScript(['你好世界']);            // 'chinese'
detectScript(['Привет']);             // 'cyrillic'
detectScript(['Hello world']);        // 'latin'
detectScript(['123 ???']);            // 'other'
```

### `isLatinScript(lines)`

விரைவு சரிபார்ப்பு — உரையில் லத்தீன் எழுத்துகள் மட்டும் இருந்தால் (CJK, சிரிலிலிக், இந்திய எழுத்துகள் போன்றவை இல்லாமல்) `true` வழங்கும். புனைவு மொழியாக்கத்தை முழுமையாக தவிர்க்க பயனுள்ளதாக இருக்கும்.

```ts
isLatinScript(['Hello world']);  // true
isLatinScript(['안녕하세요']);    // false
isLatinScript(['♪♪♪']);         // false (எழுத்துகள் இல்லை)
```

### `requiresExternalRomanization(script)`

உள்ளமைந்த இயந்திரம் இல்லாத, வெளி API தேவைப்படும் எழுத்துகளுக்கு `true` வழங்கும். இலகுரக `lyric-romanizer/detector` துணைப்பாதையிலிருந்து இறக்குமதி செய்யக்கூடியது, எனவே "ஒரு வெளி சேவைக்கு கிளைபிரிய வேண்டுமா?" என்பதற்கு பதிலளிப்பதற்கு எந்த இயந்திர சுமையும் தேவையில்லை.

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

ஒரு வரியை புனைவு மொழியாக்கம் செய்யும். `script` தவிர்க்கப்பட்டால், அது `detectScript` மூலம் **ஒவ்வொரு வரிக்கும் தனித்தனியாக** தானாக கண்டறியப்படும் — `romanizeLine` மேல் சுழற்சி செய்வது ஒவ்வொரு வரியையும் வெவ்வேறு இயந்திரத்திற்கு அனுப்பக்கூடும், முழு அணிக்கும் ஒரே எழுத்தை நிலைநிறுத்தும் `romanizeLines` போலல்லாமல். லத்தீன் உரை அல்லது எழுத்து இல்லாத உள்ளடக்கத்திற்கு அசல் வரி அப்படியே வழங்கப்படும்.

சீன உரைக்கு `dialect` விருப்பம் புனைவு மொழியாக்க அமைப்பைக் கட்டுப்படுத்துகிறது: `'mandarin'` (இயல்புநிலை) பின்யின் பயன்படுத்துகிறது, `'cantonese'` [Jyutping](https://github.com/CanCLID/to-jyutping) பயன்படுத்துகிறது. மற்ற எழுத்துகள் `dialect` ஐ புறக்கணிக்கின்றன.

இயந்திரம் இல்லாத எழுத்துகளுக்கு (உள்ளமைந்ததோ அல்லது உட்செலுத்தப்பட்டதோ) `UnsupportedRomanizationError` **எறியப்படும்**.

```ts
await romanizer.romanizeLine('你好世界');
// 'nǐ hǎo shì jiè' (இயல்புநிலை: மாண்டரின்/பின்யின்)

await romanizer.romanizeLine('你好', { dialect: 'cantonese' });
// 'nei5 hou2' (Jyutping)

await romanizer.romanizeLine('Привет мир');
// 'Privet mir'

await romanizer.romanizeLine('Hello world');
// 'Hello world' (அப்படியே)

await romanizer.romanizeLine('مرحبا');
// throws UnsupportedRomanizationError { script: 'arabic' }
```

### `romanizer.romanizeLines(lines, options?)`

பல வரிகளை இணையாக புனைவு மொழியாக்கம் செய்யும். ஆதிக்க எழுத்தை **அனைத்து வரிகளிலும் ஒரேமுறை** கண்டறிந்து அதை ஒவ்வொரு வரிக்கும் நிலைநிறுத்துகிறது (**கலப்பு-எழுத்து அணிகள்** பகுதியைப் பார்க்கவும்). எழுத்து, புனைவு மொழியாக்கம் செய்யப்பட்ட வரிகள், மற்றும் ஒவ்வொரு வரிக்குமான `fallbacks` கொடிகளை வழங்கும் — இயந்திரம் தோல்வியடைந்து ஒரு வரி கடைசி முயற்சியாக யூனிவர்சலாக ஒலிபெயர்க்கப்பட்ட இடத்தில் `true`.

```ts
const { script, lines, fallbacks } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['swasdi', 'chaolok'], fallbacks: [false, false] }
```

### `UnsupportedRomanizationError`

இயந்திரம் இல்லாத — உள்ளமைந்ததோ அல்லது `options.engines` வழியாக உட்செலுத்தப்பட்டதோ — ஒரு எழுத்தை புனைவு மொழியாக்கம் செய்ய முயற்சிக்கும் போது எறியப்படும். நிரலாக்க செயலாக்கத்திற்கு `script` பண்பு உள்ளது.

```ts
try {
  await romanizer.romanizeLine('مرحبا');
} catch (err) {
  if (err instanceof UnsupportedRomanizationError) {
    console.log(err.script); // 'arabic'
    // வெளி API க்கு மாற்று
  }
}
```

## ஆதரிக்கப்படும் எழுத்துகள்

### உள்ளூர் (முழுமையாக ஆஃப்லைன்)

| எழுத்து | இயந்திரம் | உதாரணம் |
|---------|----------|---------|
| யூனிவர்சல் *(fallback)* | [transliteration](https://github.com/nickclaw/transliteration) | `Привет` → `Privet` |
| ஜப்பானிய | [kuroshiro](https://github.com/sglkc/kuroshiro-ts) + [kuromoji](https://github.com/takuyaa/kuromoji.js) | `こんにちは` → `konnichiha` |
| மாண்டரின் | [pinyin-pro](https://github.com/zh-lx/pinyin-pro) | `你好` → `nǐ hǎo` |
| காண்டோனீஸ் | [to-jyutping](https://github.com/CanCLID/to-jyutping) | `佢冇` → `keoi5 mou5` |
| கொரியன் | [@romanize/korean](https://github.com/kntng/romanize) | `안녕` → `annyeong` |
| சிரிலிலிக் | [cyrillic-to-translit-js](https://github.com/greybax/CyrillicToTranslitJS) | `Привет` → `Privet` |
| தேவநாகரி | [sanscript](https://github.com/indic-transliteration/sanscript) | `नमस्ते` → `namaste` |
| குஜராத்தி | [sanscript](https://github.com/indic-transliteration/sanscript) | `નમસ્તે` → `namaste` |
| குர்முகி | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namasate` |
| தெலுங்கு | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| கன்னடம் | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೇ` → `namaste` |
| ஒடியா | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| தமிழ் | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| தாய் | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `swasdi` |

### வெளி API தேவை

| எழுத்து | முறை |
|---------|------|
| மலையாளம் | Google Translate `dt=rm` |
| வங்காளம் | Google Translate `dt=rm` |
| அரபு | Google Translate `dt=rm` |
| ஹிப்ரு | Google Translate `dt=rm` |
| மற்றவை | Google Translate `dt=rm` |

இவற்றை கண்டறிந்து உங்கள் விருப்பமான API க்கு கிளைபிரிய `requiresExternalRomanization()` பயன்படுத்துங்கள் — அல்லது API ஐ ஒரே முறை ஒரு **இயந்திர அடாப்டராக** செருகி `romanizeLines` ஒவ்வொரு எழுத்தையும் கையாள விடுங்கள்.

## எழுத்து-குறிப்பு குறிப்புகள்

### கலப்பு-எழுத்து அணிகள்

`romanizeLines` முழு அணியின் **ஆதிக்க** எழுத்தை ஒவ்வொரு வரிக்கும் நிலைநிறுத்துகிறது. இது வேண்டுமென்றே செய்யப்படுகிறது: ஒரு ஜப்பானிய பாடலில் உள்ள கான்ஜி-மட்டும் வரி தனியாக இருக்கும்போது சீனத்திலிருந்து வேறுபடுத்த முடியாதது (கான்ஜியும் ஹான்சியும் ஒரே யூனிகோட் தொகுதியைப் பகிர்ந்துகொள்கின்றன), எனவே முழு-அணி சூழல் மட்டுமே அதை சரியான இயந்திரத்திற்கு வழிநடத்துகிறது. தெரிந்துகொள்ள வேண்டிய விளைவுகள்:

- அணியில் எங்கேனும் உள்ள எந்த கானாவும் முழு அணியையும் `japanese` க்கு நிலைநிறுத்துகிறது — கானா தீர்மானகரமான சான்று.
- அணிக்குள் ஒரு *வேறுபட்ட* லத்தீன்-அல்லாத எழுத்தின் வரி இன்னும் நிலைநிறுத்தப்பட்ட இயந்திரத்திற்கே அளிக்கப்படுகிறது.
- தூய-லத்தீன் வரிகள் (ஒரு CJK பாடலுக்குள் ஒரு ஆங்கில கோரஸ்) நிலைநிறுத்தப்பட்ட இயந்திரத்திற்கு அளிக்கப்படுவதற்குப் பதிலாக **அப்படியே வழங்கப்படும்**.
- ஒரு இயந்திரம் தோல்வியடைந்து ஒரு வரி யூனிவர்சல் ஒலிபெயர்ப்பாக தரமிறங்கியபோது ஒவ்வொரு வரிக்குமான `fallbacks` கொடிகள் தெரிவிக்கின்றன.

உண்மையான ஒவ்வொரு-வரி இயந்திர வழிநடத்தல் உங்களுக்குத் தேவைப்பட்டால், `romanizeLine` ஐ ஒரு சுழற்சியில் அழைக்கவும் — அது ஒவ்வொரு வரிக்கும் தனித்தனியாக கண்டறிகிறது.

### சிரிலிலிக் கண்டறிதல்

சிரிலிலிக் தானாகவே உக்ரேனிய சிறப்பு எழுத்துகளை (`і`, `ї`, `є`, `ґ`) கண்டறிந்து உக்ரேனிய ஒலிபெயர்ப்பு முன்அமைப்பைப் பயன்படுத்துகிறது. மற்ற அனைத்து சிரிலிலிக் உரையும் இயல்பாக ரஷ்யமாக செயலாக்கப்படுகிறது.

### காண்டோனீஸ் ஆதரவு

சீன உரை இயல்பாக மாண்டரின் (பின்யின்) ஆகும். `RomanizeOptions` இல் `dialect: 'cantonese'` அனுப்புவதன் மூலம் சீன உரையை [Jyutping](https://github.com/CanCLID/to-jyutping) இல் புனைவு மொழியாக்கம் செய்யலாம்.

```ts
const { lines } = await romanizer.romanizeLines(['你好世界', '食飯'], {
  script: 'chinese',
  dialect: 'cantonese',
});
// ['nei5 hou2 sai3 gaai3', 'sik6 faan6']
```

## உரிமம்

MIT
