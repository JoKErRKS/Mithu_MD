const axios = require('axios');

const MAX_LEN = 200; // unofficial endpoint truncates/fails on very long input

// .tts <text> — converts text to a spoken voice note.
// No existing TTS implementation/dependency was found in this project, so this
// uses the free, keyless Google Translate TTS endpoint via axios (already a
// dependency) rather than installing a new package.
async function tts(sock, from, msg, args) {
    try {
        const text = (args || []).join(' ').trim();
        if (!text) {
            return await sock.sendMessage(from, { text: '❌ Provide text to speak.\nExample: `.tts Hello there`' }, { quoted: msg });
        }
        if (text.length > MAX_LEN) {
            return await sock.sendMessage(from, { text: `❌ Text is too long (max ${MAX_LEN} characters).` }, { quoted: msg });
        }

        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(text)}`;
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 15000
        });

        await sock.sendMessage(from, {
            audio: Buffer.from(response.data),
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: msg });
    } catch (e) {
        try {
            await sock.sendMessage(from, { text: '❌ Could not generate speech right now. Try shorter text or try again later.' }, { quoted: msg });
        } catch (_) {}
    }
}

module.exports = tts;
