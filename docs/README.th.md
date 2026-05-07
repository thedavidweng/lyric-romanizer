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
- **12+ สคริปต์** — ญี่ปุ่น จีน เกาหลี ซิริลลิก 7 สคริปต์อินดิก ทมิฬ ไทย
- **รองรับกวางตุ้ง** — จ้วตึ้ง (Jyutping) นอกจากพินอินแมนดารินเริ่มต้น
- **น้ำหนักเบาสำหรับการตรวจจับ** — นำเข้าเฉพาะการตรวจจับสคริปต์โดยไม่ต้องนำเข้าเอนจินทับศัพท์
- **ตรวจจับซิริลลิกภาษายูเครน** — ตรวจจับอักขระเฉพาะภาษายูเครนและใช้พรีเซ็ตการทับศัพท์ที่ถูกต้อง

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
const result = await romanizer.romanizeLines(['你好世界', 'こんにちは']);
// { script: 'chinese', lines: ['nǐ hǎo shì jiè', 'こんにちは'] }

// ทับศัพท์บรรทัดเดียว
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

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
import { detectScript, isLatinScript, NON_LATIN_SCRIPT_RE } from 'lyric-romanizer/detector';
```

### ประเภท

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

ฟากทอรีที่คืนอินสแตนซ์ `Romanizer` เอนจิน Kuroshiro (ญี่ปุ่น) จะถูกเริ่มต้นแบบ lazy เมื่อใช้งานครั้งแรกและถูกแคช

```ts
const romanizer = createRomanizer();

// แทนที่เส้นทาง CDN ของพจนานุกรม Kuromoji (เช่น สำหรับ self-hosting)
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});
```

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

คืนค่า `true` สำหรับสคริปต์ที่ไม่สามารถทับศัพท์ภายในระบบได้และต้องการ API ภายนอก

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

ทับศัพท์บรรทัดเดียว ถ้าไม่ระบุ `script` จะตรวจจับอัตโนมัติผ่าน `detectScript` ข้อความละตินหรือเนื้อหาที่ไม่มีตัวอักษรจะถูกคืนค่าตามเดิม

สำหรับข้อความภาษาจีน ตัวเลือก `dialect` ควบคุมระบบการทับศัพท์: `'mandarin'` (ค่าเริ่มต้น) ใช้พินอิน, `'cantonese'` ใช้ [Jyutping](https://github.com/CanCLID/to-jyutping)

**โยน** `UnsupportedRomanizationError` สำหรับสคริปต์ภายนอก

```ts
await romanizer.romanizeLine('สวัสดีชาวโลก');
// 'sawatdi chaolok'

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

ทับศัพท์หลายบรรทัดแบบขนาน คืนค่าสคริปต์ที่ตรวจพบและบรรทัดที่ทับศัพท์แล้ว

```ts
const { script, lines } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['sawatdi', 'chaolok'] }
```

### `UnsupportedRomanizationError`

ถูกโยนเมื่อพยายามทับศัพท์สคริปต์ที่ต้องการ API ภายนอก มีคุณสมบัติ `script` สำหรับการจัดการเชิงโปรแกรม

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
| กุรมุขี | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namaste` |
| เตลูกู | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| กันนาดา | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೆ` → `namaste` |
| โอเดีย | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| ทมิฬ | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| ไทย | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `sawatdi` |

### ต้องการ API ภายนอก

| สคริปต์ | วิธี |
|---------|------|
| มาลายาลัม | Google Translate `dt=rm` |
| เบงกาลี | Google Translate `dt=rm` |
| อาหรับ | Google Translate `dt=rm` |
| ฮีบรู | Google Translate `dt=rm` |
| อื่นๆ | Google Translate `dt=rm` |

ใช้ `requiresExternalRomanization()` เพื่อตรวจจับและเปลี่ยนไปใช้ API ที่คุณต้องการ

## หมายเหตุเฉพาะสคริปต์

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
