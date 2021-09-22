import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';

import { sleep } from './utils.js';
import { VK } from 'vk-call';

class VKAPI {
  constructor(config) {
    this.api = new VK(config);
  }
  
  async reply(peerId) {
    await sleep(1000 + Math.random() * 1000 | 0);
    await this.setTypingActivity(peerId);
    await sleep(2000);
    
    const [{ id, owner_id }] = await this.uploadFile(peerId);

    return this.api.call('messages.send', {
      attachment: `doc${owner_id}_${id}`,
      peer_id: peerId,
      tags: 'tabakovlaugh'
    });
  }

  async setTypingActivity(peerId) {
    return this.api.call('messages.setActivity', {
      type: 'audiomessage',
      peer_id: peerId
    });
  }

  async getLongPollServer() {
    return this.api.call('messages.getLongPollServer', {
      lp_version: 3
    });
  }

  async uploadFile(peerId) {
    const form = new FormData();
    const { upload_url } = await this.api.call('docs.getMessagesUploadServer', {
      type: 'audio_message',
      peer_id: peerId
    });

    form.append('file', fs.readFileSync('./audio_msg.ogg'), {
      contentType: 'audio/ogg',
      name: 'file',
      filename: 'audio_msg.ogg'
    });

    const response = await fetch(upload_url, {
      method: 'POST',
      body: form
    });

    const { file } = await response.json();

    return this.api.call('docs.save', {
      file,
      title: 'audio_msg.ogg'
    });
  }
}

export default VKAPI;