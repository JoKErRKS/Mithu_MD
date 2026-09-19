const isOwner = require('../lib/isOwner');

// .public — allow non-owner senders to use publicCommands
async function goPublic(sock, from, msg, sender, botData, saveBotData) {
    try {
        if (!isOwner(sender) && !msg.key.fromMe) return;
        botData.isPublic = true;
        saveBotData();
        await sock.sendMessage(from, { text: '✅ *Bot is now in PUBLIC mode.*' }, { quoted: msg }).catch(() => {});
    } catch (e) {
        try { await sock.sendMessage(from, { text: '❌ Could not change bot mode.' }, { quoted: msg }); } catch (_) {}
    }
}

// .private — restrict the bot back to owner-only use
async function goPrivate(sock, from, msg, sender, botData, saveBotData) {
    try {
        if (!isOwner(sender) && !msg.key.fromMe) return;
        botData.isPublic = false;
        saveBotData();
        await sock.sendMessage(from, { text: '✅ *Bot is now in PRIVATE mode.*' }, { quoted: msg }).catch(() => {});
    } catch (e) {
        try { await sock.sendMessage(from, { text: '❌ Could not change bot mode.' }, { quoted: msg }); } catch (_) {}
    }
}

module.exports = { goPublic, goPrivate };
