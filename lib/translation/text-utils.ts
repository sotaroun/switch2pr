const JAPANESE_CHAR_PATTERN = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF\uFF66-\uFF9D\u3400-\u4DBF\u4E00-\u9FFF]/;

export function isLikelyJapanese(text: string | null | undefined): boolean {
  if (!text) return false;
  return JAPANESE_CHAR_PATTERN.test(text);
}
