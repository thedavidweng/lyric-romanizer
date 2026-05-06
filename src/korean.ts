const HANGUL_SYLLABLE_START = 0xac00;
const HANGUL_SYLLABLE_END = 0xd7a3;
const LEADING_CONSONANT_START = 0x1100;
const VOWEL_START = 0x1161;
const TRAILING_CONSONANT_START = 0x11a7;
const VOWEL_COUNT = 21;
const TRAILING_CONSONANT_COUNT = 28;
const SYLLABLES_PER_LEADING_CONSONANT = VOWEL_COUNT * TRAILING_CONSONANT_COUNT;

type RomanizationRule = {
  base: string;
  next?: Readonly<Record<string, string>>;
};

const REVISED_ROMANIZATION: Readonly<Record<string, RomanizationRule>> = {
  ᄀ: { base: 'g' },
  ᄁ: { base: 'kk' },
  ᄂ: { base: 'n' },
  ᄃ: { base: 'd' },
  ᄄ: { base: 'tt' },
  ᄅ: { base: 'r' },
  ᄆ: { base: 'm' },
  ᄇ: { base: 'b' },
  ᄈ: { base: 'pp' },
  ᄉ: { base: 's' },
  ᄊ: { base: 'ss' },
  ᄋ: { base: '' },
  ᄌ: { base: 'j' },
  ᄍ: { base: 'jj' },
  ᄎ: { base: 'ch' },
  ᄏ: { base: 'k' },
  ᄐ: { base: 't' },
  ᄑ: { base: 'p' },
  ᄒ: { base: 'h' },
  ᅡ: { base: 'a' },
  ᅢ: { base: 'ae' },
  ᅣ: { base: 'ya' },
  ᅤ: { base: 'yae' },
  ᅥ: { base: 'eo' },
  ᅦ: { base: 'e' },
  ᅧ: { base: 'yeo' },
  ᅨ: { base: 'ye' },
  ᅩ: { base: 'o' },
  ᅪ: { base: 'wa' },
  ᅫ: { base: 'wae' },
  ᅬ: { base: 'oe' },
  ᅭ: { base: 'yo' },
  ᅮ: { base: 'u' },
  ᅯ: { base: 'wo' },
  ᅰ: { base: 'we' },
  ᅱ: { base: 'wi' },
  ᅲ: { base: 'yu' },
  ᅳ: { base: 'eu' },
  ᅴ: { base: 'ui' },
  ᅵ: { base: 'i' },
  ᆨ: { base: 'k', next: { ᄋ: 'g', ᄂ: 'ngn', ᄅ: 'ngn', ᄆ: 'ngm', ᄒ: 'k' } },
  ᆩ: { base: 'k', next: { ᄋ: 'kk' } },
  ᆪ: { base: 'k', next: { ᄋ: 'ks', ᄂ: 'ngn', ᄅ: 'ngn', ᄆ: 'ngm', ᄒ: 'k' } },
  ᆫ: { base: 'n', next: { ᄅ: 'll' } },
  ᆬ: { base: 'n', next: { ᄋ: 'nj', ᄂ: 'nn', ᄅ: 'nn', ᄆ: 'nm', ᄒ: 'ch' } },
  ᆭ: { base: 'n', next: { ᄋ: 'nh', ᄀ: 'nk', ᄂ: 'nn', ᄅ: 'nn', ᄆ: 'nm', ᄇ: 'nb', ᄒ: 'ch' } },
  ᆮ: { base: 't', next: { ᄋ: 'j', ᄂ: 'nn', ᄅ: 'nn', ᄆ: 'nm', ᄒ: 'ch' } },
  ᆯ: { base: 'l', next: { ᄋ: 'r' } },
  ᆰ: { base: 'l', next: { ᄋ: 'lg' } },
  ᆱ: { base: 'l', next: { ᄋ: 'lm' } },
  ᆲ: { base: 'l', next: { ᄋ: 'lb' } },
  ᆳ: { base: 'l', next: { ᄋ: 'ls' } },
  ᆴ: { base: 'l', next: { ᄋ: 'lt' } },
  ᆵ: { base: 'l', next: { ᄋ: 'lp' } },
  ᆶ: { base: 'l', next: { ᄋ: 'lh' } },
  ᆷ: { base: 'm' },
  ᆸ: { base: 'p', next: { ᄋ: 'b', ᄂ: 'mn', ᄅ: 'mn', ᄆ: 'mm', ᄒ: 'p' } },
  ᆹ: { base: 'p', next: { ᄋ: 'ps' } },
  ᆺ: { base: 't', next: { ᄋ: 's', ᄂ: 'nn', ᄅ: 'nn', ᄆ: 'nm' } },
  ᆻ: { base: 't', next: { ᄋ: 'ss' } },
  ᆼ: { base: 'ng' },
  ᆽ: { base: 't', next: { ᄋ: 'j', ᄂ: 'nn', ᄅ: 'nn', ᄆ: 'nm', ᄒ: 'ch' } },
  ᆾ: { base: 't', next: { ᄋ: 'ch', ᄂ: 'nn', ᄅ: 'nn', ᄆ: 'nm', ᄒ: 'ch' } },
  ᆿ: { base: 'k' },
  ᇀ: { base: 't', next: { ᄂ: 'nn', ᄅ: 'nn', ᄆ: 'nm', ᄒ: 'ch' } },
  ᇁ: { base: 'p' },
  ᇂ: {
    base: 't',
    next: {
      ᄋ: 'h',
      ᄀ: 'k',
      ᄁ: 'kk',
      ᄂ: 'nn',
      ᄃ: 't',
      ᄄ: 'tt',
      ᄅ: 'nn',
      ᄆ: 'nm',
      ᄇ: 'p',
      ᄈ: 'pp',
      ᄉ: 's',
      ᄊ: 'ss',
      ᄌ: 'ch',
      ᄍ: 'jj',
      ᄐ: 't',
      ᄒ: 'h',
    },
  },
};

function decomposeHangulSyllable(character: string): string[] {
  const codePoint = character.codePointAt(0);
  if (codePoint === undefined || codePoint < HANGUL_SYLLABLE_START || codePoint > HANGUL_SYLLABLE_END) {
    return [character];
  }

  const syllableOffset = codePoint - HANGUL_SYLLABLE_START;
  const leadingConsonantIndex = Math.floor(syllableOffset / SYLLABLES_PER_LEADING_CONSONANT);
  const vowelIndex = Math.floor((syllableOffset % SYLLABLES_PER_LEADING_CONSONANT) / TRAILING_CONSONANT_COUNT);
  const trailingConsonantIndex = syllableOffset % TRAILING_CONSONANT_COUNT;

  const jamo = [
    String.fromCodePoint(LEADING_CONSONANT_START + leadingConsonantIndex),
    String.fromCodePoint(VOWEL_START + vowelIndex),
  ];

  if (trailingConsonantIndex > 0) {
    jamo.push(String.fromCodePoint(TRAILING_CONSONANT_START + trailingConsonantIndex));
  }

  return jamo;
}

export function romanizeKorean(text: string): string {
  const jamo = [...text].flatMap(decomposeHangulSyllable);
  let romanized = '';

  for (let index = 0; index < jamo.length; index += 1) {
    const character = jamo[index];
    const rule = REVISED_ROMANIZATION[character];
    if (!rule) {
      romanized += character;
      continue;
    }

    const nextCharacter = jamo[index + 1];
    const nextRomanization = nextCharacter ? rule.next?.[nextCharacter] : undefined;
    if (nextRomanization !== undefined) {
      romanized += nextRomanization;
      index += 1;
      continue;
    }

    romanized += rule.base;
  }

  return romanized;
}
