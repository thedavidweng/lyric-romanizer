# lyric-romanizer

[![npm version](https://img.shields.io/npm/v/lyric-romanizer.svg)](https://www.npmjs.com/package/lyric-romanizer)
[![license](https://img.shields.io/npm/l/lyric-romanizer.svg)](https://github.com/thedavidweng/lyric-romanizer/blob/main/LICENSE)

> **철학: 바퀴를 다시 발명하지 마라.**
> 이 프로젝트는 로마자 변환 로직을 처음부터 구축하는 것을 의도적으로 피합니다. 대신 각 스크립트에 최적화된 커뮤니티 유지보수 라이브러리를 결합하고, 오케스트레이션 계층에 집중합니다: 스크립트 감지, 엔진 라우팅, 방언 처리, 통합 API. 의존성 목록의 모든 로마자 변환 엔진은 도메인 전문가들이 유지보수하는 검증된 라이브러리입니다. 이것이 이 프로젝트의 핵심입니다.

가사용 스크립트 감지 및 로컬 로마자 변환 엔진. 일본어, 중국어(보통화 및 광동어), 한국어, 키릴 문자, 인도계 문자, 타밀어, 태국어 등 12개 이상의 스크립트를 지원하며, 모두 API 호출 없이 로컬에서 실행됩니다.

[Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke)에서 추출. [OpenKara](https://github.com/thedavidweng/openkara)에서 사용 중.

[English](https://github.com/thedavidweng/lyric-romanizer#readme) | [日本語](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ja.md) | [中文（简体）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-CN.md) | [中文（粵語）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-yue.md) | [Русский](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ru.md) | [हिन्दी](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.hi.md) | [தமிழ்](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ta.md) | [ไทย](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.th.md)

## 특징

- **API 호출 없음** — 모든 로마자 변환이 로컬에서 실행
- **자동 스크립트 감지** — 텍스트를 전달하면 사용된 스크립트를 자동 감지
- **12개 이상 스크립트** — 일본어, 중국어, 한국어, 키릴 문자, 6개 인도계 문자, 타밀어, 태국어
- **광동어 지원** — 기본 보통화 병음 외에 광동어 윈핑(Jyutping) 지원
- **경량 감지 서브패스** — 로마자 변환 엔진을 가져오지 않고 스크립트 감지(및 외부 스크립트 분류)만 임포트 가능
- **지연 로딩 엔진** — 모든 엔진이 최초 사용 시 로드되며, 로마자 변환 전까지 메인 엔트리 임포트 비용 없음
- **워밍업** — 첫 줄 전에 해당 스크립트 엔진(및 일본어 사전)을 미리 로드할 수 있음
- **Kuromoji 사전 헬퍼** — `lyric-romanizer/dict`가 포함된 사전을 찾으므로 데스크톱 앱이 기본 CDN 대신 로컬로 호스팅할 수 있음
- **플러그 가능한 엔진** — 기본 제공 엔진을 재정의하거나 외부에서 로마자 변환되는 스크립트용 어댑터를 직접 연결
- **관찰 가능한 폴백** — 엔진 실패로 한 줄이 최후의 수단으로 전사된 경우를 줄별 플래그로 표시
- **우크라이나어 인식 키릴 문자** — 우크라이나어 고유 문자를 자동 감지하여 올바른 전사 프리셋 적용
- **순수 Node ESM 실행** — 번들러 불필요

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
const result = await romanizer.romanizeLines(['你好世界', '很高兴认识你']);
// { script: 'chinese', lines: ['nǐ hǎo shì jiè', 'hěn gāo xìng rèn shi nǐ'], fallbacks: [false, false] }

// 한 줄 로마자 변환
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

> **감지 단위** — `romanizeLines`는 배열 **전체에서 한 번** 지배적 스크립트를 감지하여 모든 줄에 고정합니다(의도적: 일본어 노래 안의 한자로만 된 줄도 반드시 일본어 엔진에 도달해야 하며, 배열에 가나가 하나라도 있으면 `japanese`로 고정됩니다). 대신 `romanizeLine`을 반복 호출하면 **줄별로** 감지하여 각 줄을 서로 다른 엔진으로 라우팅할 수 있습니다. 고정된 스크립트 아래의 순수 라틴 줄은 그대로 반환됩니다. **혼합 스크립트 배열** 섹션을 참고하세요.

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
import {
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  NON_LATIN_SCRIPT_RE,
} from 'lyric-romanizer/detector';

// 사전 헬퍼 — Node / 빌드 타임 전용. kuromoji 사전을 찾아
// 번들러 플러그인이 CDN 대신 앱으로 복사할 수 있게 합니다.
import {
  KUROMOJI_DICT_FILES,
  KUROMOJI_PACKAGE,
  resolveKuromojiDictDir,
} from 'lyric-romanizer/dict';
```

### 타입

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

// `dialect`는 'chinese'에서만 적용되며, 그 외 모든 스크립트는 무시합니다.
type RomanizeOptions = { script?: ScriptType; dialect?: 'mandarin' | 'cantonese' };

// `fallbacks`는 `lines`와 정렬됩니다: 엔진이 실패하여 해당 줄이 최후의 수단으로
// 유니버설 전사로 처리된 경우 true입니다.
type RomanizeResult = { script: ScriptType; lines: string[]; fallbacks?: boolean[] };

// 엔진 어댑터: 해당 스크립트의 한 줄을 로마자 변환합니다. 예외를 던지면(또는
// 거부하면) 유니버설 전사 폴백이 트리거됩니다.
type RomanizeEngine = (line: string, context: { dialect: 'mandarin' | 'cantonese' }) => string | Promise<string>;

type RomanizerOptions = {
  japaneseDictPath?: string;
  engines?: Partial<Record<ScriptType, RomanizeEngine>>;
};
```

### `createRomanizer(options?)`

`Romanizer` 인스턴스를 반환하는 팩토리 함수. 모든 엔진은 최초 사용 시 지연 로딩되어 캐시되며, 로드에 실패하면 다음 호출에서 다시 시도합니다.

```ts
const romanizer = createRomanizer();

// Kuromoji 사전 CDN 경로 재정의 (셀프 호스팅 등)
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});

// 유휴 시간에 엔진 미리 로드 (일본어는 사전도 파싱)
await romanizer.warmup('japanese');
await romanizer.warmup(['chinese', 'korean']);
```

> **번들러 / Vite worker.** 지연 `import()`는 번들러가 코드 분할을 할 수 있을 때만 지연입니다. Vite 기본 `worker.format`은 `'iife'`이며, 모든 엔진을 worker에 인라인합니다. `worker: { format: 'es' }`로 설정해야 중국어 곡이 일본어·광동어 엔진을 파싱하지 않습니다. worker나 브라우저 번들에서 `lyric-romanizer/dict`를 import하지 마세요. Node 전용입니다.

#### `romanizer.warmup(scripts?)`

각 스크립트의 기본 제공 엔진을 한 줄도 로마자 변환하지 않고 로드합니다. `scripts`를 생략하면 이 인스턴스에 남아 있는 모든 기본 제공 로컬 엔진을 미리 로드합니다. 재정의되거나 주입된 엔진은 건너뜁니다. 라틴 문자와 외부 스크립트는 no-op입니다. 로드 실패는 **reject**합니다. `romanizeLines`와 달리 warmup은 범용 전사로 폴백하지 않습니다.

#### `lyric-romanizer/dict`

kuromoji 사전을 앱에 넣는 소비자를 위한 Node / 빌드 타임 헬퍼(Tauri/Electron, 정적 `public/dict/`). 라이브러리의 기본 `japaneseDictPath`는 jsDelivr CDN입니다. 이 엔트리가 있으면 그것이 유일한 선택일 필요가 없습니다.

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

#### 엔진 어댑터

`options.engines`는 특정 스크립트의 기본 제공 엔진을 재정의하거나, 기본 제공 엔진이 없는 스크립트(`arabic`, `hebrew`, `malayalam`, `bengali`, `other`)에 엔진을 연결하여 `romanizeLines`가 하나의 인터페이스로 모든 스크립트를 처리할 수 있게 합니다. 라이브러리는 기본적으로 **네트워크 I/O를 전혀 수행하지 않습니다**. 원격 어댑터를 연결하는 것은 호출자의 명시적인 결정입니다.

```ts
const romanizer = createRomanizer({
  engines: {
    // 로컬 엔진이 없는 스크립트에 직접 외부 로마자 변환을 제공하세요.
    arabic: async (line) => myTransliterationApi(line),
    // 또는 기본 제공 엔진을 교체하세요 (예: 테스트에서 가짜 엔진으로).
    korean: (line) => myKoreanRomanizer(line),
  },
});

await romanizer.romanizeLines(['مرحبا']);
// { script: 'arabic', lines: [...], fallbacks: [false] } — 더 이상 예외를 던지지 않음
```

기본 제공이든 주입된 것이든 엔진이 없는 스크립트는 여전히 `UnsupportedRomanizationError`를 던집니다.

### `detectScript(lines)`

주어진 텍스트 라인의 지배적 스크립트를 감지합니다. 먼저 일본어 가나를 확인하고(결정적), 그다음 다른 모든 스크립트를 문자 수로 스코어링합니다.

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

기본 제공 엔진이 없어 외부 API가 필요한 스크립트에 대해 `true`를 반환합니다. 경량 `lyric-romanizer/detector` 서브패스에서 임포트할 수 있으므로 "외부 서비스로 분기해야 하는가?"라는 질문에 답하는 데 엔진 페이로드가 전혀 들지 않습니다.

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

한 줄을 로마자 변환합니다. `script`를 생략하면 `detectScript`를 통해 **줄별로** 자동 감지됩니다 — `romanizeLine`을 반복 호출하면 각 줄이 서로 다른 엔진으로 라우팅될 수 있으며, 이는 배열 전체에 하나의 스크립트를 고정하는 `romanizeLines`와 다릅니다. 라틴 텍스트나 문자가 없는 콘텐츠는 원본 줄을 그대로 반환합니다.

중국어 텍스트의 경우 `dialect` 옵션으로 로마자 변환 시스템을 제어합니다: `'mandarin'` (기본값)은 병음, `'cantonese'`는 [Jyutping](https://github.com/CanCLID/to-jyutping)을 사용합니다. 다른 스크립트는 `dialect`를 무시합니다.

엔진이 없는(기본 제공이든 주입된 것이든) 스크립트의 경우 `UnsupportedRomanizationError`를 **던집니다**.

```ts
await romanizer.romanizeLine('你好世界');
// 'nǐ hǎo shì jiè' (기본값: 보통화/병음)

await romanizer.romanizeLine('你好', { dialect: 'cantonese' });
// 'nei5 hou2' (Jyutping)

await romanizer.romanizeLine('Привет мир');
// 'Privet mir'

await romanizer.romanizeLine('Hello world');
// 'Hello world' (그대로)

await romanizer.romanizeLine('مرحبا');
// throws UnsupportedRomanizationError { script: 'arabic' }
```

### `romanizer.romanizeLines(lines, options?)`

여러 줄을 병렬로 로마자 변환합니다. 배열 **전체에서 한 번** 지배적 스크립트를 감지하여 모든 줄에 고정합니다(**혼합 스크립트 배열** 참고). 스크립트, 로마자 변환된 줄, 그리고 줄별 `fallbacks` 플래그를 반환합니다 — 엔진이 실패하여 해당 줄이 최후의 수단으로 유니버설 전사로 처리된 경우 `true`입니다.

```ts
const { script, lines, fallbacks } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['swasdi', 'chaolok'], fallbacks: [false, false] }
```

### `UnsupportedRomanizationError`

엔진이 없는 — 기본 제공이든 `options.engines`를 통해 주입된 것이든 — 스크립트를 로마자 변환하려 할 때 던져집니다. 프로그래밍 처리를 위한 `script` 속성을 가집니다.

```ts
try {
  await romanizer.romanizeLine('مرحبا');
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
| 구르무키 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namasate` |
| 텔루구어 | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| 칸나다어 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೇ` → `namaste` |
| 오디아어 | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| 타밀어 | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| 태국어 | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `swasdi` |

### 외부 API 필요

| 스크립트 | 방법 |
|---------|------|
| 말라얄람어 | Google Translate `dt=rm` |
| 벵골어 | Google Translate `dt=rm` |
| 아랍어 | Google Translate `dt=rm` |
| 히브리어 | Google Translate `dt=rm` |
| 기타 | Google Translate `dt=rm` |

`requiresExternalRomanization()`로 이들을 감지하여 원하는 API로 분기하거나, API를 **엔진 어댑터**로 한 번만 연결하여 `romanizeLines`가 모든 스크립트를 처리하도록 하세요.

## 스크립트별 참고 사항

### 혼합 스크립트 배열

`romanizeLines`는 배열 전체의 **지배적** 스크립트를 모든 줄에 고정합니다. 이는 의도적입니다: 일본어 노래에 포함된 한자로만 된 줄은 그 자체만으로는 중국어와 구별되지 않으므로(일본어의 한자와 중국어의 한자는 동일한 유니코드 블록을 공유합니다), 배열 전체의 문맥만이 이를 올바른 엔진으로 라우팅할 수 있습니다. 알아두면 좋은 결과는 다음과 같습니다:

- 배열 어디에든 가나가 있으면 배열 전체가 `japanese`로 고정됩니다 — 가나는 결정적 증거입니다.
- 배열 안에 *다른* 비라틴 스크립트로 된 줄이 있어도 여전히 고정된 엔진으로 전달됩니다.
- 순수 라틴 줄(CJK 노래 안의 영어 후렴구)은 고정된 엔진으로 전달되지 않고 **그대로 반환됩니다**.
- 줄별 `fallbacks` 플래그는 엔진이 실패하여 해당 줄이 유니버설 전사로 격하된 경우를 알려줍니다.

진정한 줄별 엔진 라우팅이 필요하면 `romanizeLine`을 반복 호출하세요 — 줄별로 감지합니다.

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
