/**
 * Returns true if the last Hangul syllable of the word ends with a final consonant (받침).
 */
export function hasBatchim(word: string): boolean {
  const trimmed = word.trim();
  if (!trimmed) return false;

  const lastChar = trimmed[trimmed.length - 1];
  const code = lastChar.charCodeAt(0);

  // Hangul Syllables block: U+AC00 ~ U+D7A3
  if (code >= 0xac00 && code <= 0xd7a3) {
    return (code - 0xac00) % 28 !== 0;
  }

  // Digits spoken in Korean: 0(영), 1(일), 3(삼), 6(육), 7(칠), 8(팔) have batchim
  if (/[013678]/.test(lastChar)) {
    return true;
  }

  return false;
}

export function withEulReul(word: string): string {
  return `${word}${hasBatchim(word) ? '을' : '를'}`;
}

export function withIGa(word: string): string {
  return `${word}${hasBatchim(word) ? '이' : '가'}`;
}
