import fetch from 'node-fetch';
import { COMMON_KEYWORDS, STRICT_KEYWORDS, MARKED_STICKERS } from './constants.js';
import { sleep, getWordAhahRatio, isAttachmentsHasLaughStickers } from './utils.js';
import VKAPI from './vk.js';


const vk = new VKAPI({
  token: process.env.ACCESS_TOKEN || '',
  version: '5.68'
});

(async function() {
  console.log(`i know ${MARKED_STICKERS.size} meme stickers`);
  
  while(1) {
    try {
      await startLongPolling();
    } catch (e) {
      console.error(e);
      await sleep(10000);
    }
  }
}());

async function startLongPolling() {
  const { server, key, ts } = await vk.getLongPollServer();
  const response = await fetch(`https://${server}?act=a_check&key=${key}&ts=${ts}&wait=90&mode=2&version=3`, {
    method: 'GET',
    timeout: 90000
  });

  const { updates } = await response.json();

  for (const update of updates) {
    const event = update[0], flags = update[2], peerId = update[3], body = update[5], attachments = update[7];

    if (event === 4 && !(flags & 2)) {
      const hasBigHahaRatio = body.toLowerCase().split(' ').some(word => getWordAhahRatio(word) > 0.6 || STRICT_KEYWORDS.includes(word));
      const hasKeywords = COMMON_KEYWORDS.some(keyword => body.toLowerCase().includes(keyword));
      
      if (hasBigHahaRatio || hasKeywords || isAttachmentsHasLaughStickers(attachments)) {
        await vk.reply(peerId);
      }
    }
  }

  return null;
}

process.on('unhandledRejection', (reason, promise) => {
  console.error(reason, promise);
  process.exit(1);
});