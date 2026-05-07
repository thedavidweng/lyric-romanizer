# lyric-romanizer

[![npm version](https://img.shields.io/npm/v/lyric-romanizer.svg)](https://www.npmjs.com/package/lyric-romanizer)
[![license](https://img.shields.io/npm/l/lyric-romanizer.svg)](https://github.com/thedavidweng/lyric-romanizer/blob/main/LICENSE)

> **Философия: Не изобретайте велосипед.**
> Этот проект намеренно избегает создания логики романизации с нуля. Вместо этого он объединяет лучшие библиотеки, поддерживаемые сообществом — по одной на каждый скрипт — и фокусируется на слое оркестрации: определение скрипта, маршрутизация движков, обработка диалектов и единый API. Каждый движок романизации в списке зависимостей — это специализированная, проверенная библиотека, поддерживаемая экспертами в данной области. В этом суть проекта.

Движок определения скрипта и локальной романизации для текстов песен. Поддерживает 12+ скриптов: японский, китайский (мандарин и кантонский), корейский, кириллица, индийские скрипты, тамильский, тайский — всё работает локально, без вызовов API.

Извлечён из [Spotify Karaoke](https://github.com/haroldalan/spotify-karaoke). Используется в [OpenKara](https://github.com/thedavidweng/openkara).

[English](https://github.com/thedavidweng/lyric-romanizer#readme) | [日本語](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ja.md) | [中文（简体）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-CN.md) | [中文（粵語）](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.zh-yue.md) | [한국어](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ko.md) | [हिन्दी](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.hi.md) | [தமிழ்](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.ta.md) | [ไทย](https://github.com/thedavidweng/lyric-romanizer/blob/main/docs/README.th.md)

## Возможности

- **Без вызовов API** — вся романизация выполняется локально
- **Автоопределение скрипта** — передайте текст, получите определённый скрипт
- **12+ скриптов** — японский, китайский, корейский, кириллица, 7 индийских скриптов, тамильский, тайский
- **Поддержка кантонского** — ютпин (Jyutping) наряду с мандаринским пиньинем
- **Лёгкий подпуть детектора** — импортируйте только определение скрипта без движков романизации
- **Украиноориентированная кириллица** — автоопределение украинских символов и применение правильного пресета транслитерации

## Установка

```bash
npm install lyric-romanizer
```

```bash
yarn add lyric-romanizer
```

```bash
pnpm add lyric-romanizer
```

## Быстрый старт

```ts
import { createRomanizer, detectScript } from 'lyric-romanizer';

const romanizer = createRomanizer();

// Автоопределение скрипта и романизация
const result = await romanizer.romanizeLines(['你好世界', 'こんにちは']);
// { script: 'chinese', lines: ['nǐ hǎo shì jiè', 'こんにちは'] }

// Романизация одной строки
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

## API

### Импорт

```ts
// Основная точка входа — полный движок романизации
import {
  createRomanizer,
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  UnsupportedRomanizationError,
} from 'lyric-romanizer';

// Подпуть только детектора — лёгкий, без зависимостей романизации
import { detectScript, isLatinScript, NON_LATIN_SCRIPT_RE } from 'lyric-romanizer/detector';
```

### Типы

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

Фабрика, возвращающая экземпляр `Romanizer`. Движок Kuroshiro (японский) лениво инициализируется при первом использовании и кэшируется.

```ts
const romanizer = createRomanizer();

// Переопределение пути CDN словаря Kuromoji (например, для самохостинга)
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});
```

### `detectScript(lines)`

Определяет доминирующий скрипт в данных строках. Сначала проверяет японские каны (определённо), затем оценивает все остальные скрипты по количеству символов.

```ts
detectScript(['こんにちは']);          // 'japanese'
detectScript(['你好世界']);            // 'chinese'
detectScript(['Привет']);             // 'cyrillic'
detectScript(['Hello world']);        // 'latin'
detectScript(['123 ???']);            // 'other'
```

### `isLatinScript(lines)`

Быстрая проверка — возвращает `true`, если текст содержит только латинские буквы (без CJK, кириллицы, индийских и т.д.). Полезно для полного пропуска романизации.

```ts
isLatinScript(['Hello world']);  // true
isLatinScript(['안녕하세요']);    // false
isLatinScript(['♪♪♪']);         // false (нет букв)
```

### `requiresExternalRomanization(script)`

Возвращает `true` для скриптов, которые нельзя романизовать локально и требуют внешнего API.

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

Романизирует одну строку. Если `script` опущен, он автоопределяется через `detectScript`. Латинский текст или контент без букв возвращается без изменений.

Для китайского текста опция `dialect` управляет системой романизации: `'mandarin'` (по умолчанию) использует пиньинь, `'cantonese'` использует [Jyutping](https://github.com/CanCLID/to-jyutping).

**Выбрасывает** `UnsupportedRomanizationError` для внешних скриптов.

```ts
await romanizer.romanizeLine('Привет мир');
// 'Privet mir'

await romanizer.romanizeLine('你好', { dialect: 'cantonese' });
// 'nei5 hou2' (Jyutping)

await romanizer.romanizeLine('Hello world');
// 'Hello world' (без изменений)

await romanizer.romanizeLine('مرحبا');
// throws UnsupportedRomanizationError { script: 'arabic' }
```

### `romanizer.romanizeLines(lines, options?)`

Параллельно романизирует несколько строк. Возвращает определённый скрипт и романизированные строки.

```ts
const { script, lines } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['sawatdi', 'chaolok'] }
```

### `UnsupportedRomanizationError`

Выбрасывается при попытке романизовать скрипт, требующий внешнего API. Имеет свойство `script` для программной обработки.

```ts
try {
  await romanizer.romanizeLine('مرحبا');
} catch (err) {
  if (err instanceof UnsupportedRomanizationError) {
    console.log(err.script); // 'arabic'
    // откат к внешнему API
  }
}
```

## Поддерживаемые скрипты

### Локальные (полностью оффлайн)

| Скрипт | Движок | Пример |
|--------|--------|--------|
| Универсальный *(fallback)* | [transliteration](https://github.com/nickclaw/transliteration) | `Привет` → `Privet` |
| Японский | [kuroshiro](https://github.com/sglkc/kuroshiro-ts) + [kuromoji](https://github.com/takuyaa/kuromoji.js) | `こんにちは` → `konnichiha` |
| Мандарин | [pinyin-pro](https://github.com/zh-lx/pinyin-pro) | `你好` → `nǐ hǎo` |
| Кантонский | [to-jyutping](https://github.com/CanCLID/to-jyutping) | `佢冇` → `keoi5 mou5` |
| Корейский | [@romanize/korean](https://github.com/kntng/romanize) | `안녕` → `annyeong` |
| Кириллица | [cyrillic-to-translit-js](https://github.com/greybax/CyrillicToTranslitJS) | `Привет` → `Privet` |
| Деванагари | [sanscript](https://github.com/indic-transliteration/sanscript) | `नमस्ते` → `namaste` |
| Гуджарати | [sanscript](https://github.com/indic-transliteration/sanscript) | `નમસ્તે` → `namaste` |
| Гурмукхи | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namaste` |
| Телугу | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| Каннада | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೆ` → `namaste` |
| Одия | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| Тамильский | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| Тайский | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `sawatdi` |

### Требуют внешний API

| Скрипт | Метод |
|--------|-------|
| Малаялам | Google Translate `dt=rm` |
| Бенгальский | Google Translate `dt=rm` |
| Арабский | Google Translate `dt=rm` |
| Иврит | Google Translate `dt=rm` |
| Другие | Google Translate `dt=rm` |

Используйте `requiresExternalRomanization()` для определения и переключения на предпочитаемый API.

## Примечания по скриптам

### Определение кириллицы

Кириллица автоматически определяет украиноспецифические символы (`і`, `ї`, `є`, `ґ`) и применяет украинский пресет транслитерации. Вся остальная кириллица по умолчанию обрабатывается как русская.

### Поддержка кантонского

Китайский текст по умолчанию использует мандарин (пиньинь). Передайте `dialect: 'cantonese'` в `RomanizeOptions`, чтобы романизировать китайский текст в [Jyutping](https://github.com/CanCLID/to-jyutping).

```ts
const { lines } = await romanizer.romanizeLines(['你好世界', '食飯'], {
  script: 'chinese',
  dialect: 'cantonese',
});
// ['nei5 hou2 sai3 gaai3', 'sik6 faan6']
```

## Лицензия

MIT
