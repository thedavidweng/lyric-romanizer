# lyric-romanizer

[![npm version](https://img.shields.io/npm/v/lyric-romanizer.svg)](https://www.npmjs.com/package/lyric-romanizer)
[![license](https://img.shields.io/npm/l/lyric-romanizer.svg)](https://github.com/thedavidweng/lyric-romanizer/blob/main/LICENSE)

> **ปรัชญา: อย่าประดิษฐ์ล้อใหม่**
> โปรเจกต์นี้ตั้งใจหลีกเลี่ยงการสร้างตรรกะการทับศัพท์ขึ้นใหม่ตั้งแต่ต้น แทนที่จะทำเช่นนั้น มันรวมไลบรารีที่ดีที่สุดในแต่ละสคริปต์ที่ดูแลโดยชุมชน — โดยมุ่งเน้นไปที่ชั้นการประสาน: การตรวจจับสคริปต์ การกำหนดเส้นทางเอนจิน การจัดการภาษาถิ่น และ API แบบรวม เอนจินการทับศัพท์ทุกตัวในรายการ dependency เป็นไลบรารีที่ผ่านการทดสอบ ดูแลโดยผู้เชี่ยวชาญในสาขา นี่คือแก่นแท้ของโปรเจกต์

เอนจินตรวจจับสคริปต์และทับศัพท์ภายในระบบสำหรับเนื้อเพลง รองรับ 12+ สคริปต์ ได้แก่ ญี่ปุ่น จีน (แมนดารินและกวางตุ้ง) เกาหลี ซิริลลิก อินดิก ทมิฬ และไทย — ทั้งหมดทำงานภายในระบบ ไม่มีการเรียก API

แยกออกมาจาก [Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke) ใช้โดย [OpenKara](https://github.com/thedavidweng/openkara)

[English](https://github.com/thedavidweng/lyric-romanizer#readme) | [日本語](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ja.md) | [中文（简体）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-CN.md) | [中文（粵語）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-yue.md) | [한국어](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ko.md) | [Русский](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ru.md) | [हिन्दी](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.hi.md) | [தமிழ்](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ta.md)

## คุณสมบัติ

- **ไม่มีการเรียก API** — การทับศัพท์ทั้งหมดทำงานภายในระบบ
- **ตรวจจับสคริปต์อัตโนมัติ** — ส่งข้อความเข้ามา ระบบจะตรวจจับสคริปต์ที่ใช้
- **12+ สคริปต์** — ญี่ปุ่น จีน เกาหลี ซิริลลิก 6 สคริปต์อินดิก ทมิฬ ไทย
- **รองรับกวางตุ้ง** — จ้วตึ้ง (Jyutping) นอกจากพินอินแมนดารินเริ่มต้น
- **น้ำหนักเบาสำหรับการตรวจจับ** — นำเข้าเฉพาะการตรวจจับสคริปต์ (และการจำแนกสคริปต์ภายนอก) โดยไม่ต้องนำเข้าเอนจินทับศัพท์
- **เอนจินแบบ lazy** — เอนจินทุกตัวจะโหลดเมื่อใช้งานครั้งแรก การนำเข้ารายการหลักไม่มีต้นทุนใดๆ จนกว่าคุณจะเริ่มทับศัพท์
- **เอนจินแบบเสียบต่อได้** — แทนที่เอนจินในตัวใดก็ได้ หรือเสียบอะแดปเตอร์ของคุณเองสำหรับสคริปต์ที่ทับศัพท์จากภายนอก
- **fallback ที่สังเกตได้** — แฟล็กรายบรรทัดจะบอกคุณเมื่อเอนจินล้มเหลวและบรรทัดถูกทับศัพท์เป็นทางเลือกสุดท้าย
- **ตรวจจับซิริลลิกภาษายูเครน** — ตรวจจับอักขระเฉพาะภาษายูเครนและใช้พรีเซ็ตการทับศัพท์ที่ถูกต้อง
- **ทำงานบน Node ESM ล้วนๆ** — ไม่ต้องใช้ bundler

## การติดตั้ง

```bash
npm install lyric-romanizer
```

```bash
yarn add lyric-romanizer
```

```bash
pnpm add lyric-romanizer
```

## เริ่มต้นอย่างรวดเร็ว

```ts
import { createRomanizer, detectScript } from 'lyric-romanizer';

const romanizer = createRomanizer();

// ตรวจจับสคริปต์และทับศัพท์อัตโนมัติ
const result = await romanizer.romanizeLines(['你好世界', '很高兴认识你']);
// { script: 'chinese', lines: ['nǐ hǎo shì jiè', 'hěn gāo xìng rèn shi nǐ'], fallbacks: [false, false] }

// ทับศัพท์บรรทัดเดียว
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

> **ความละเอียดของการตรวจจับ** — `romanizeLines` จะตรวจจับสคริปต์หลัก **เพียงครั้งเดียวจากทุกบรรทัด** และตรึงไว้กับทุกบรรทัด (โดยเจตนา: บรรทัดที่มีแต่คันจิภายในเพลงญี่ปุ่นต้องไปถึงเอนจินญี่ปุ่น และกานาใดๆ ในอาร์เรย์จะตรึงเป็น `japanese`) การเรียก `romanizeLine` แบบวนซ้ำจะตรวจจับ **รายบรรทัด** แทน และอาจกำหนดเส้นทางแต่ละบรรทัดไปยังเอนจินคนละตัว บรรทัดที่เป็นละตินล้วนภายใต้สคริปต์ที่ตรึงไว้จะถูกคืนค่าตามเดิม ดู **อาร์เรย์ที่ผสมหลายสคริปต์**

## API

### การนำเข้า

```ts
// รายการหลัก — เอนจินทับศัพท์เต็มรูปแบบ
import {
  createRomanizer,
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  UnsupportedRomanizationError,
} from 'lyric-romanizer';

// เส้นทางย่อยสำหรับการตรวจจับเท่านั้น — น้ำหนักเบา ไม่มี dependency ทับศัพท์
import {
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  NON_LATIN_SCRIPT_RE,
} from 'lyric-romanizer/detector';
```

### ประเภท

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

// `dialect` มีผลเฉพาะกับ 'chinese' เท่านั้น สคริปต์อื่นๆ ทั้งหมดจะไม่สนใจค่านี้
type RomanizeOptions = { script?: ScriptType; dialect?: 'mandarin' | 'cantonese' };

// `fallbacks` เรียงตรงกับ `lines`: เป็น true ตรงบรรทัดที่เอนจินล้มเหลวและ
// บรรทัดถูกทับศัพท์แบบสากลเป็นทางเลือกสุดท้าย
type RomanizeResult = { script: ScriptType; lines: string[]; fallbacks?: boolean[] };

// อะแดปเตอร์เอนจิน: ทับศัพท์หนึ่งบรรทัดของสคริปต์นั้น การโยน (หรือ
// reject) จะกระตุ้น fallback การทับศัพท์แบบสากล
type RomanizeEngine = (line: string, context: { dialect: 'mandarin' | 'cantonese' }) => string | Promise<string>;

type RomanizerOptions = {
  japaneseDictPath?: string;
  engines?: Partial<Record<ScriptType, RomanizeEngine>>;
};
```

### `createRomanizer(options?)`

ฟากทอรีที่คืนอินสแตนซ์ `Romanizer` เอนจินทุกตัวจะถูกโหลดแบบ lazy เมื่อใช้งานครั้งแรกและถูกแคช — หากการโหลดล้มเหลวจะลองใหม่ในการเรียกครั้งถัดไป

```ts
const romanizer = createRomanizer();

// แทนที่เส้นทาง CDN ของพจนานุกรม Kuromoji (เช่น สำหรับ self-hosting)
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});
```

#### อะแดปเตอร์เอนจิน

`options.engines` จะแทนที่เอนจินในตัวสำหรับสคริปต์หนึ่งๆ — หรือเสียบเอนจินให้กับสคริปต์ที่ไม่มีเอนจินในตัว (`arabic`, `hebrew`, `malayalam`, `bengali`, `other`) เพื่อให้ `romanizeLines` จัดการทุกสคริปต์ผ่านอินเทอร์เฟซเดียวได้ โดยค่าเริ่มต้น ไลบรารีจะ**ไม่มี network I/O เลย** การเสียบอะแดปเตอร์ระยะไกลเป็นการตัดสินใจของผู้เรียกอย่างชัดเจน

```ts
const romanizer = createRomanizer({
  engines: {
    // นำการทับศัพท์ภายนอกของคุณเองมาใช้กับสคริปต์ที่ไม่มีเอนจินในระบบ
    arabic: async (line) => myTransliterationApi(line),
    // หรือแทนที่เอนจินในตัว (เช่น ด้วยตัวปลอมในการทดสอบ)
    korean: (line) => myKoreanRomanizer(line),
  },
});

await romanizer.romanizeLines(['مرحبا']);
// { script: 'arabic', lines: [...], fallbacks: [false] } — ไม่โยนข้อผิดพลาดอีกต่อไป
```

สคริปต์ที่ไม่มีเอนจิน — ไม่ว่าจะเป็นเอนจินในตัวหรือที่เสียบเข้ามา — จะยังคงโยน `UnsupportedRomanizationError`

### `detectScript(lines)`

ตรวจจับสคริปต์หลักในบรรทัดข้อความที่กำหนด ตรวจกานาญี่ปุ่นก่อน (แน่นอน) จากนั้นให้คะแนนสคริปต์อื่นๆ ตามจำนวนอักขระ

```ts
detectScript(['こんにちは']);          // 'japanese'
detectScript(['你好世界']);            // 'chinese'
detectScript(['Привет']);             // 'cyrillic'
detectScript(['Hello world']);        // 'latin'
detectScript(['123 ???']);            // 'other'
```

### `isLatinScript(lines)`

ตรวจสอบอย่างรวดเร็ว — คืนค่า `true` ถ้าข้อความมีเฉพาะอักษรละติน (ไม่มี CJK ซิริลลิก อินดิก ฯลฯ) มีประโยชน์สำหรับข้ามการทับศัพท์ทั้งหมด

```ts
isLatinScript(['Hello world']);  // true
isLatinScript(['안녕하세요']);    // false
isLatinScript(['♪♪♪']);         // false (ไม่มีตัวอักษร)
```

### `requiresExternalRomanization(script)`

คืนค่า `true` สำหรับสคริปต์ที่ไม่มีเอนจินในตัวและต้องการ API ภายนอก สามารถนำเข้าได้จากเส้นทางย่อย `lyric-romanizer/detector` ที่มีน้ำหนักเบา ดังนั้นการตอบคำถามว่า "ควรแยกไปใช้บริการภายนอกหรือไม่" จึงมีต้นทุน payload ของเอนจินเป็นศูนย์

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

ทับศัพท์บรรทัดเดียว ถ้าไม่ระบุ `script` จะตรวจจับอัตโนมัติ **รายบรรทัด** ผ่าน `detectScript` — การวนซ้ำเรียก `romanizeLine` อาจกำหนดเส้นทางแต่ละบรรทัดไปยังเอนจินคนละตัว ต่างจาก `romanizeLines` ที่ตรึงสคริปต์เดียวให้กับทั้งอาร์เรย์ ข้อความละตินหรือเนื้อหาที่ไม่มีตัวอักษรจะถูกคืนค่าตามเดิม

สำหรับข้อความภาษาจีน ตัวเลือก `dialect` ควบคุมระบบการทับศัพท์: `'mandarin'` (ค่าเริ่มต้น) ใช้พินอิน, `'cantonese'` ใช้ [Jyutping](https://github.com/CanCLID/to-jyutping) สคริปต์อื่นๆ จะไม่สนใจ `dialect`

**โยน** `UnsupportedRomanizationError` สำหรับสคริปต์ที่ไม่มีเอนจิน (ทั้งในตัวหรือที่เสียบเข้ามา)

```ts
await romanizer.romanizeLine('你好世界');
// 'nǐ hǎo shì jiè' (ค่าเริ่มต้น: แมนดาริน/พินอิน)

await romanizer.romanizeLine('你好', { dialect: 'cantonese' });
// 'nei5 hou2' (Jyutping)

await romanizer.romanizeLine('Привет мир');
// 'Privet mir'

await romanizer.romanizeLine('Hello world');
// 'Hello world' (ตามเดิม)

await romanizer.romanizeLine('مرحبا');
// throws UnsupportedRomanizationError { script: 'arabic' }
```

### `romanizer.romanizeLines(lines, options?)`

ทับศัพท์หลายบรรทัดแบบขนาน ตรวจจับสคริปต์หลัก **เพียงครั้งเดียวจากทุกบรรทัด** และตรึงไว้กับทุกบรรทัด (ดู **อาร์เรย์ที่ผสมหลายสคริปต์**) คืนค่าสคริปต์ บรรทัดที่ทับศัพท์แล้ว และแฟล็ก `fallbacks` รายบรรทัด — เป็น `true` ตรงบรรทัดที่เอนจินล้มเหลวและบรรทัดถูกทับศัพท์แบบสากลเป็นทางเลือกสุดท้าย

```ts
const { script, lines, fallbacks } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['swasdi', 'chaolok'], fallbacks: [false, false] }
```

### `UnsupportedRomanizationError`

ถูกโยนเมื่อพยายามทับศัพท์สคริปต์ที่ไม่มีเอนจิน — ไม่ว่าจะเป็นเอนจินในตัวหรือที่เสียบเข้ามาผ่าน `options.engines` มีคุณสมบัติ `script` สำหรับการจัดการเชิงโปรแกรม

```ts
try {
  await romanizer.romanizeLine('مرحبا');
} catch (err) {
  if (err instanceof UnsupportedRomanizationError) {
    console.log(err.script); // 'arabic'
    // ถอยไปใช้ API ภายนอก
  }
}
```

## สคริปต์ที่รองรับ

### ภายในระบบ (ออฟไลน์เต็มรูปแบบ)

| สคริปต์ | เอนจิน | ตัวอย่าง |
|---------|--------|---------|
| สากล *(fallback)* | [transliteration](https://github.com/nickclaw/transliteration) | `Привет` → `Privet` |
| ญี่ปุ่น | [kuroshiro](https://github.com/sglkc/kuroshiro-ts) + [kuromoji](https://github.com/takuyaa/kuromoji.js) | `こんにちは` → `konnichiha` |
| แมนดาริน | [pinyin-pro](https://github.com/zh-lx/pinyin-pro) | `你好` → `nǐ hǎo` |
| กวางตุ้ง | [to-jyutping](https://github.com/CanCLID/to-jyutping) | `佢冇` → `keoi5 mou5` |
| เกาหลี | [@romanize/korean](https://github.com/kntng/romanize) | `안녕` → `annyeong` |
| ซิริลลิก | [cyrillic-to-translit-js](https://github.com/greybax/CyrillicToTranslitJS) | `Привет` → `Privet` |
| เทวนาครี | [sanscript](https://github.com/indic-transliteration/sanscript) | `नमस्ते` → `namaste` |
| คุชราต | [sanscript](https://github.com/indic-transliteration/sanscript) | `નમસ્તે` → `namaste` |
| กุรมุขี | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namasate` |
| เตลูกู | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| กันนาดา | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೇ` → `namaste` |
| โอเดีย | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| ทมิฬ | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| ไทย | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `swasdi` |

### ต้องการ API ภายนอก

| สคริปต์ | วิธี |
|---------|------|
| มาลายาลัม | Google Translate `dt=rm` |
| เบงกาลี | Google Translate `dt=rm` |
| อาหรับ | Google Translate `dt=rm` |
| ฮีบรู | Google Translate `dt=rm` |
| อื่นๆ | Google Translate `dt=rm` |

ใช้ `requiresExternalRomanization()` เพื่อตรวจจับสคริปต์เหล่านี้และแยกไปใช้ API ที่คุณต้องการ — หรือเสียบ API เข้าเพียงครั้งเดียวในรูปแบบ **อะแดปเตอร์เอนจิน** แล้วให้ `romanizeLines` จัดการทุกสคริปต์

## หมายเหตุเฉพาะสคริปต์

### อาร์เรย์ที่ผสมหลายสคริปต์

`romanizeLines` จะตรึงสคริปต์ **หลัก** ของทั้งอาร์เรย์ให้กับทุกบรรทัด นี่เป็นไปโดยเจตนา: บรรทัดที่มีแต่คันจิภายในเพลงญี่ปุ่นนั้นแยกไม่ออกจากภาษาจีนหากดูโดยลำพัง (คันจิและฮั่นจื้อใช้บล็อก Unicode เดียวกัน) ดังนั้นมีเพียงบริบทของทั้งอาร์เรย์เท่านั้นที่จะกำหนดเส้นทางไปยังเอนจินที่ถูกต้องได้ ผลที่ตามมาที่ควรรู้:

- กานาที่ปรากฏที่ใดก็ตามในอาร์เรย์จะตรึงทั้งอาร์เรย์เป็น `japanese` — กานาเป็นหลักฐานที่แน่นอน
- บรรทัดที่เป็นสคริปต์ที่ไม่ใช่ละติน *ต่างชนิด* ภายในอาร์เรย์จะยังคงถูกป้อนให้กับเอนจินที่ตรึงไว้
- บรรทัดที่เป็นละตินล้วน (เช่น ท่อนคอรัสภาษาอังกฤษในเพลง CJK) จะ**ถูกคืนค่าตามเดิม** แทนที่จะถูกป้อนให้กับเอนจินที่ตรึงไว้
- แฟล็ก `fallbacks` รายบรรทัดจะรายงานเมื่อเอนจินล้มเหลวและบรรทัดถูกลดระดับไปใช้การทับศัพท์แบบสากล

หากคุณต้องการกำหนดเส้นทางเอนจินแบบรายบรรทัดจริงๆ ให้เรียก `romanizeLine` แบบวนซ้ำ — มันจะตรวจจับแบบรายบรรทัด

### การตรวจจับซิริลลิก

ซิริลลิกตรวจจับอักขระเฉพาะภาษายูเครน (`і`, `ї`, `є`, `ґ`) โดยอัตโนมัติและใช้พรีเซ็ตการทับศัพท์ภาษายูเครน ซิริลลิกอื่นๆ ทั้งหมดค่าเริ่มต้นจะถูกประมวลผลเป็นภาษารัสเซีย

### การรองรับกวางตุ้ง

ข้อความภาษาจีนค่าเริ่มต้นใช้แมนดาริน (พินอิน) ส่ง `dialect: 'cantonese'` ใน `RomanizeOptions` เพื่อทับศัพท์ข้อความภาษาจีนเป็น [Jyutping](https://github.com/CanCLID/to-jyutping)

```ts
const { lines } = await romanizer.romanizeLines(['你好世界', '食飯'], {
  script: 'chinese',
  dialect: 'cantonese',
});
// ['nei5 hou2 sai3 gaai3', 'sik6 faan6']
```

## ใบอนุญาต

MIT
