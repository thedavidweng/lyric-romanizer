# lyric-romanizer

[![npm version](https://img.shields.io/npm/v/lyric-romanizer.svg)](https://www.npmjs.com/package/lyric-romanizer)
[![license](https://img.shields.io/npm/l/lyric-romanizer.svg)](https://github.com/thedavidweng/lyric-romanizer/blob/main/LICENSE)

> **철론: 바퀴를 다시 발명하지 마라.**
> 이 프로젝트는 로마자 변환 로직을 처음부터 구축하는 것을 의도적으로 피합니다. 대신 각 스크립트에 최적화된 커뮤니티 유지보수 라이브러리를 결합하고, 오케스트레이션 계층에 집중합니다: 스크립트 감지, 엔진 라우팅, 방언 처리, 통합 API. 의존성 목록의 모든 로마자 변환 엔진은 도메인 전문가들이 유지보수하는 검증된 라이브러리입니다. 이것이 이 프로젝트의 핵심입니다.

가사용 스크립트 감지 및 로컬 로마자 변환 엔진. 일본어, 중국어(보통화 및 광동어), 한국어, 키릴 문자, 인도계 문자, 타밀어, 태국어 등 12개 이상의 스크립트를 지원하며, 모두 API 호출 없이 로컬에서 실행됩니다.

[Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke)에서 추출. [OpenKara](https://github.com/thedavidweng/openkara)에서 사용 중.

[English](https://github.com/thedavidweng/lyric-romanizer#readme) | [日本語](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ja.md) | [中文（简体）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-CN.md) | [中文（粵語）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-yue.md) | [Русский](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ru.md) | [हिन्दी](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.hi.md) | [தமிழ்](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ta.md) | [ไทย](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.th.md)

## 특징

- **API 호출 없음** — 모든 로마자 변환이 로컬에서 실행
- **자동 스크립트 감지** — 텍스트를 전달하면 사용된 스크립트를 자동 감지
- **12개 이상 스크립트** — 일본어, 중국어, 한국어, 키릴 문자, 7개 인도계 문자, 타밀어, 태국어
- **광동어 지원** — 기본 보통화 병음 외에 광동어 윈핑(Jyutping) 지원
- **경량 감지 서브패스** — 로마자 변환 엔진 없이 스크립트 감지만 임포트 가능
- **우크라이나어 인식 키릴 문자** — 우크라이나어 고유 문자를 자동 감지하여 올바른 전사 프리셋 적용

## 설치

```bash
npm install lyric-romanizer
```

```bash
yarn add lyric-romanizer
```

```bash
pnpm add lyric-romanizer
```

## 빠른 시작

```ts
import { createRomanizer, detectScript } from 'lyric-romanizer';

const romanizer = createRomanizer();

// 스크립트 자동 감지 및 로마자 변환
const result = await romanizer.romanizeLines(['你好世界', 'こんにちは']);
// { script: 'chinese', lines: ['nǐ hǎo shì jiè', 'こんにちは'] }

// 한 줄 로마자 변환
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

## API

### 임포트

```ts
// 메인 엔트리 — 전체 로마자 변환 엔진
import {
  createRomanizer,
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  UnsupportedRomanizationError,
} from 'lyric-romanizer';

// 감지 전용 서브패스 — 경량, 로마자 변환 의존성 없음
import { detectScript, isLatinScript, NON_LATIN_SCRIPT_RE } from 'lyric-romanizer/detector';
```

### 타입

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

`Romanizer` 인스턴스를 반환하는 팩토리 함수. 일본어용 Kuroshiro 엔진은 최초 사용 시 지연 초기화되어 캐시됩니다.

```ts
const romanizer = createRomanizer();

// Kuromoji 사전 CDN 경로 재정의 (셀프 호스팅 등)
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});
```

### `detectScript(lines)`

주어진 텍스트 라인의 지배적 스크립트를 감지합니다. 먼저 일본어 가나를 확인하고(결정적), 그 다른 스크립트를 문자 수로 스코어링합니다.

```ts
detectScript(['こんにちは']);          // 'japanese'
detectScript(['你好世界']);            // 'chinese'
detectScript(['Привет']);             // 'cyrillic'
detectScript(['Hello world']);        // 'latin'
detectScript(['123 ???']);            // 'other'
```

### `isLatinScript(lines)`

빠른 확인 — 텍스트에 라틴 문자만 포함된 경우 `true` 반환 (CJK, 키릴, 인도계 문자 등 없음). 로마자 변환을 완전히 건너뛸 때 유용합니다.

```ts
isLatinScript(['Hello world']);  // true
isLatinScript(['안녕하세요']);    // false
isLatinScript(['♪♪♪']);         // false (문자 없음)
```

### `requiresExternalRomanization(script)`

로컬에서 로마자 변환할 수 없어 외부 API가 필요한 스크립트에 대해 `true` 반환.

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

한 줄을 로마자 변환합니다. `script` 생략 시 `detectScript`로 자동 감지. 라틴 텍스트나 문자 없는 콘텐츠는 그대로 반환.

중국어 텍스트의 경우 `dialect` 옵션으로 로마자 변환 시스템을 제어합니다: `'mandarin'` (기본값)은 병음, `'cantonese'`는 [Jyutping](https://github.com/CanCLID/to-jyutping)을 사용합니다.

**외부 스크립트의 경우** `UnsupportedRomanizationError`를 던집니다.

```ts
await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'

await romanizer.romanizeLine('你好', { dialect: 'cantonese' });
// 'nei5 hou2' (Jyutping)

await romanizer.romanizeLine('Привет мир');
// 'Privet mir'

await romanizer.romanizeLine('Hello world');
// 'Hello world' (그대로)

await romanizer.romanizeLine('مرح바');
// throws UnsupportedRomanizationError { script: 'arabic' }
```

### `romanizer.romanizeLines(lines, options?)`

여러 줄을 병렬로 로마자 변환. 감지된 스크립트와 로마자 변환된 줄을 반환.

```ts
const { script, lines } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['sawatdi', 'chaolok'] }
```

### `UnsupportedRomanizationError`

외부 API가 필요한 스크립트를 로마자 변환하려 할 때 던져집니다. 프로그래밍 처리를 위한 `script` 속성을 가집니다.

```ts
try {
  await romanizer.romanizeLine('مرح바');
} catch (err) {
  if (err instanceof UnsupportedRomanizationError) {
    console.log(err.script); // 'arabic'
    // 외부 API로 폴백
  }
}
```

## 지원 스크립트

### 로컬 (완전 오프라인)

| 스크립트 | 엔진 | 예시 |
|---------|------|------|
| 유니버설 *(fallback)* | [transliteration](https://github.com/nickclaw/transliteration) | `Привет` → `Privet` |
| 일본어 | [kuroshiro](https://github.com/sglkc/kuroshiro-ts) + [kuromoji](https://github.com/takuyaa/kuromoji.js) | `こんにちは` → `konnichiha` |
| 보통화 | [pinyin-pro](https://github.com/zh-lx/pinyin-pro) | `你好` → `nǐ hǎo` |
| 광동어 | [to-jyutping](https://github.com/CanCLID/to-jyutping) | `佢冇` → `keoi5 mou5` |
| 한국어 | [@romanize/korean](https://github.com/kntng/romanize) | `안녕` → `annyeong` |
| 키릴 문자 | [cyrillic-to-translit-js](https://github.com/greybax/CyrillicToTranslitJS) | `Привет` → `Privet` |
| 데바나가리 | [sanscript](https://github.com/indic-transliteration/sanscript) | `नमस्ते` → `namaste` |
| 구자라트어 | [sanscript](https://github.com/indic-transliteration/sanscript) | `નમસ્તે` → `namaste` |
| 구르무키 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namaste` |
| 텔루구어 | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| 칸나다어 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೆ` → `namaste` |
| 오디아어 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| 타밀어 | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| 태국어 | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `sawatdi` |

### 외부 API 필요

| 스크립트 | 방법 |
|---------|------|
| 말라얄람어 | Google Translate `dt=rm` |
| 벵골어 | Google Translate `dt=rm` |
| 아랍어 | Google Translate `dt=rm` |
| 히브리어 | Google Translate `dt=rm` |
| 기타 | Google Translate `dt=rm` |

`requiresExternalRomanization()`로 감지하여 원하는 API로 분기하세요.

## 스크립트별 참고 사항

### 키릴 문자 감지

키릴 문자는 우크라이나어 고유 문자(`і`, `ї`, `є`, `ґ`)를 자동 감지하여 우크라이나어 전사 프리셋을 적용합니다. 그 외 키릴 문자는 러시아어로 기본 처리됩니다.

### 광동어 지원

중국어는 기본적으로 보통화(병음)입니다. `RomanizeOptions`에서 `dialect: 'cantonese'`를 전달하면 중국어 텍스트를 [Jyutping](https://github.com/CanCLID/to-jyutping)으로 로마자 변환합니다.

```ts
const { lines } = await romanizer.romanizeLines(['你好世界', '食飯'], {
  script: 'chinese',
  dialect: 'cantonese',
});
// ['nei5 hou2 sai3 gaai3', 'sik6 faan6']
```

## 라이선스

MIT
