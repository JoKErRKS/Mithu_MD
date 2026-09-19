// .getpair — owner-only. Does NOT generate a new pairing code from an already
// active WhatsApp session (Baileys only issues pairing codes for unregistered
// sessions — see index.js's `initialize()`). Instead this reuses the existing
// pairing flow by pointing the owner back to it, and reports current session
// status, so there is exactly one pairing/auth pathway in the bot.
async function getpair(sock, from, msg, isConnected, userId) {
    try {
        const tgUsername = process.env.TELEGRAM_BOT_USERNAME || '';
        const text = `🔗 *Pairing Info*\n\n` +
            `┃ ⋄ *This session:* ${isConnected ? '✅ Connected' : '⚠️ Not connected'}\n` +
            `┃ ⋄ *Session ID:* ${userId}\n\n` +
            `To pair a *new* WhatsApp number, message the bot's Telegram pairing bot` +
            (tgUsername ? ` (@${tgUsername})` : '') +
            ` with the number (e.g. \`923001234567\`) and it will send you a pairing code.\n\n` +
            `_This bot uses a single pairing system (via Telegram) — there is no separate WhatsApp-side pairing command, to avoid conflicting sessions._`;
        await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (e) {
        try { await sock.sendMessage(from, { text: '❌ Could not load pairing info right now.' }, { quoted: msg }); } catch (_) {}
    }
}

module.exports = getpair;
