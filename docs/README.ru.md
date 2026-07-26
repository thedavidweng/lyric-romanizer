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
- **12+ скриптов** — японский, китайский, корейский, кириллица, 6 индийских скриптов, тамильский, тайский
- **Поддержка кантонского** — ютпин (Jyutping) наряду с мандаринским пиньинем
- **Лёгкий подпуть детектора** — импортируйте только определение скрипта (и классификацию внешних скриптов) без движков романизации
- **Ленивые движки** — каждый движок загружается при первом использовании; импорт основной точки входа ничего не стоит, пока вы не запустите романизацию
- **Подключаемые движки** — переопределите любой встроенный движок или подключите собственный адаптер для скриптов с внешней романизацией
- **Наблюдаемые откаты** — флаги для каждой строки сообщают, когда движок дал сбой и строка была транслитерирована в качестве крайней меры
- **Украиноориентированная кириллица** — автоопределение украинских символов и применение правильного пресета транслитерации
- **Работает в чистом Node ESM** — сборщик не требуется

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
const result = await romanizer.romanizeLines(['你好世界', '很高兴认识你']);
// { script: 'chinese', lines: ['nǐ hǎo shì jiè', 'hěn gāo xìng rèn shi nǐ'], fallbacks: [false, false] }

// Романизация одной строки
const line = await romanizer.romanizeLine('안녕하세요');
// 'annyeonghaseyo'
```

> **Гранулярность определения** — `romanizeLines` определяет доминирующий скрипт **один раз по всем строкам** и закрепляет его за каждой строкой (это сделано намеренно: строки только с кандзи внутри японской песни должны попасть в японский движок, а любая кана в массиве закрепляет `japanese`). Вызов `romanizeLine` в цикле, наоборот, определяет скрипт **для каждой строки** и может направлять каждую строку в разные движки. Строки на чистой латинице при закреплённом скрипте возвращаются без изменений. См. **Массивы со смешанными скриптами**.

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
import {
  detectScript,
  isLatinScript,
  requiresExternalRomanization,
  NON_LATIN_SCRIPT_RE,
} from 'lyric-romanizer/detector';
```

### Типы

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

// `dialect` учитывается только для 'chinese'; все остальные скрипты его игнорируют.
type RomanizeOptions = { script?: ScriptType; dialect?: 'mandarin' | 'cantonese' };

// `fallbacks` выровнен с `lines`: true там, где движок дал сбой и строка
// была транслитерирована универсальным способом в качестве крайней меры.
type RomanizeResult = { script: ScriptType; lines: string[]; fallbacks?: boolean[] };

// Адаптер движка: романизирует одну строку своего скрипта. Выброс исключения
// (или отклонение промиса) запускает откат к универсальной транслитерации.
type RomanizeEngine = (line: string, context: { dialect: 'mandarin' | 'cantonese' }) => string | Promise<string>;

type RomanizerOptions = {
  japaneseDictPath?: string;
  engines?: Partial<Record<ScriptType, RomanizeEngine>>;
};
```

### `createRomanizer(options?)`

Фабрика, возвращающая экземпляр `Romanizer`. Каждый движок лениво загружается при первом использовании и кэшируется — при неудачной загрузке повторная попытка выполняется при следующем вызове.

```ts
const romanizer = createRomanizer();

// Переопределение пути CDN словаря Kuromoji (например, для самохостинга)
const romanizer = createRomanizer({
  japaneseDictPath: 'https://my-cdn.com/kuromoji/dict',
});
```

#### Адаптеры движков

`options.engines` переопределяет встроенный движок для скрипта — или подключает движок к скрипту, для которого встроенного нет (`arabic`, `hebrew`, `malayalam`, `bengali`, `other`), чтобы `romanizeLines` мог обрабатывать любой скрипт через единый интерфейс. По умолчанию библиотека не выполняет **никакого сетевого ввода-вывода**; подключение удалённого адаптера — это явное решение вызывающей стороны.

```ts
const romanizer = createRomanizer({
  engines: {
    // Подключите свою внешнюю романизацию для скриптов без локального движка.
    arabic: async (line) => myTransliterationApi(line),
    // Или замените встроенный движок (например, подделкой в тестах).
    korean: (line) => myKoreanRomanizer(line),
  },
});

await romanizer.romanizeLines(['مرحبا']);
// { script: 'arabic', lines: [...], fallbacks: [false] } — больше не выбрасывает исключение
```

Скрипты без движка — встроенного или внедрённого — по-прежнему выбрасывают `UnsupportedRomanizationError`.

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

Возвращает `true` для скриптов, у которых нет встроенного движка и которые требуют внешнего API. Импортируется из лёгкого подпути `lyric-romanizer/detector`, поэтому ответ на вопрос «стоит ли переключаться на внешний сервис?» не требует загрузки движков.

```ts
requiresExternalRomanization('chinese');   // false
requiresExternalRomanization('arabic');    // true
requiresExternalRomanization('malayalam'); // true
```

### `romanizer.romanizeLine(line, options?)`

Романизирует одну строку. Если `script` опущен, он автоопределяется **для каждой строки** через `detectScript` — цикл по `romanizeLine` может направлять каждую строку в разные движки, в отличие от `romanizeLines`, который закрепляет один скрипт за всем массивом. Латинский текст или контент без букв возвращается без изменений.

Для китайского текста опция `dialect` управляет системой романизации: `'mandarin'` (по умолчанию) использует пиньинь, `'cantonese'` использует [Jyutping](https://github.com/CanCLID/to-jyutping). Другие скрипты игнорируют `dialect`.

**Выбрасывает** `UnsupportedRomanizationError` для скриптов без движка (встроенного или внедрённого).

```ts
await romanizer.romanizeLine('你好世界');
// 'nǐ hǎo shì jiè' (по умолчанию: мандарин/пиньинь)

await romanizer.romanizeLine('你好', { dialect: 'cantonese' });
// 'nei5 hou2' (Jyutping)

await romanizer.romanizeLine('Привет мир');
// 'Privet mir'

await romanizer.romanizeLine('Hello world');
// 'Hello world' (без изменений)

await romanizer.romanizeLine('مرحبا');
// throws UnsupportedRomanizationError { script: 'arabic' }
```

### `romanizer.romanizeLines(lines, options?)`

Параллельно романизирует несколько строк. Определяет доминирующий скрипт **один раз по всем строкам** и закрепляет его за каждой строкой (см. **Массивы со смешанными скриптами**). Возвращает скрипт, романизированные строки и флаги `fallbacks` для каждой строки — `true` там, где движок дал сбой и строка была транслитерирована универсальным способом в качестве крайней меры.

```ts
const { script, lines, fallbacks } = await romanizer.romanizeLines([
  'สวัสดี',
  'ชาวโลก',
]);
// { script: 'thai', lines: ['swasdi', 'chaolok'], fallbacks: [false, false] }
```

### `UnsupportedRomanizationError`

Выбрасывается при попытке романизовать скрипт, у которого нет движка — встроенного или внедрённого через `options.engines`. Имеет свойство `script` для программной обработки.

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
| Гурмукхи | [sanscript](https://github.com/indic-transliteration/sanscript) | `ਨਮਸਤੇ` → `namasate` |
| Телугу | [sanscript](https://github.com/indic-transliteration/sanscript) | `నమస్తే` → `namaste` |
| Каннада | [sanscript](https://github.com/indic-transliteration/sanscript) | `ನಮಸ್ತೇ` → `namaste` |
| Одия | [sanscript](https://github.com/indic-transliteration/sanscript) | `ନମସ୍ତେ` → `namaste` |
| Тамильский | [tamil-romanizer](https://github.com/haroldalan/tamil-romanizer) | `வணக்கம்` → `vanakkam` |
| Тайский | [@dehoist/romanize-thai](https://github.com/Dehoist/Open-Source) | `สวัสดี` → `swasdi` |

### Требуют внешний API

| Скрипт | Метод |
|--------|-------|
| Малаялам | Google Translate `dt=rm` |
| Бенгальский | Google Translate `dt=rm` |
| Арабский | Google Translate `dt=rm` |
| Иврит | Google Translate `dt=rm` |
| Другие | Google Translate `dt=rm` |

Используйте `requiresExternalRomanization()` для определения этих скриптов и переключения на предпочитаемый API — или подключите API один раз в виде **адаптера движка**, и `romanizeLines` обработает любой скрипт.

## Примечания по скриптам

### Массивы со смешанными скриптами

`romanizeLines` закрепляет **доминирующий** скрипт всего массива за каждой строкой. Это сделано намеренно: строка только с кандзи внутри японской песни сама по себе неотличима от китайской (кандзи и ханьцзы используют один и тот же блок Unicode), поэтому только контекст всего массива направляет её в правильный движок. Полезно знать о последствиях:

- Любая кана в любом месте массива закрепляет за всем массивом `japanese` — кана является неопровержимым доказательством.
- Строка на *другом* нелатинском скрипте внутри массива всё равно передаётся закреплённому движку.
- Строки на чистой латинице (английский припев внутри CJK-песни) **возвращаются без изменений**, а не передаются закреплённому движку.
- Флаги `fallbacks` для каждой строки сообщают, когда движок дал сбой и строка откатилась к универсальной транслитерации.

Если вам нужна настоящая маршрутизация движков для каждой строки, вызывайте `romanizeLine` в цикле — он определяет скрипт для каждой строки.

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
