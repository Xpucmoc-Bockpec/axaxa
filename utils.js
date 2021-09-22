import { MARKED_STICKERS, COMMON_KEYWORDS, STRICT_KEYWORDS } from './constants.js';
import stickerKeywords from './sticker-keywords.json';


export function isAttachmentsHasLaughStickers(attachments) {
  if (!attachments?.attachments) return false;
  
  try {
    console.log(JSON.parse(attachments?.attachments));
    return JSON.parse(attachments.attachments).some(({ type, sticker }) => (type === 'sticker' && MARKED_STICKERS.has(sticker.sticker_id)));
  } catch (e) {
    console.warn('failed to parse attachments:', e);
  }
  
  return false;
}

export function getWordAhahRatio(word) {
  if (!word.length || word.length < 4 || ['ваззап'].includes(word)) return 0;

  const wordCharacters = Array.from(word);
  const ahahCharacters = ['a', 'x', 'а', 'х', 'a', 'h', 'z', 'з'];
  const uniqueAhahCharUsedCount = wordCharacters.reduce((acc, char) => (ahahCharacters.includes(char) ? acc.add(char) : acc), new Set());

  return uniqueAhahCharUsedCount.size >= 2 ? (wordCharacters.reduce((acc, char) => (acc += ahahCharacters.includes(char.toLowerCase()) ? 1 : 0), 0) / word.length) : 0;
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getLaughStickerIds() {
  const result = new Set([ 58095, 89, 128, 107, 60523 ]);
  
  for (const { words, user_stickers, promoted_stickers } of stickerKeywords) {
    const isSuggestionHasCommonKeyword = words.some(w => (getWordAhahRatio(w) > 0.6 || COMMON_KEYWORDS.some(common => w.includes(common)) || STRICT_KEYWORDS.some(specialWord => specialWord === w)));
    
    if (isSuggestionHasCommonKeyword) {
      user_stickers.forEach(s => result.add(s));
      promoted_stickers.forEach(s => result.add(s));
    }
  }
  
  return result;
}