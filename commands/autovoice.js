// .autovoice on/off — bot-account-wide setting (owner only).
// When enabled, the bot sends a "recording audio..." presence update before
// replying to any command, mirroring how .autotyping shows "composing...".

async function autovoiceCommand(sock, from, msg, isBotOwner, botData, saveBotData, userId, args) {
    try {
        if (!isBotOwner) {
            return await sock.sendMessage(from, { text: '❌ Only the bot owner can use this command.' }, { quoted: msg });
        }

        if (!botData.autoVoice) botData.autoVoice = {};
        const action = (args?.[0] || '').toLowerCase();

        if (!action) {
            const status = botData.autoVoice[userId] ? '✅ ON' : '❌ OFF';
            return await sock.sendMessage(
                from,
                { text: `🎙️ *Auto Voice:* ${status}\n\nUse \`.autovoice on\` or \`.autovoice off\`` },
                { quoted: msg }
            );
        }

        if (action === 'on') {
            botData.autoVoice[userId] = true;
            saveBotData();
            return await sock.sendMessage(from, { text: '✅ *Auto Voice enabled.* I\'ll show "recording audio..." before replying.' }, { quoted: msg });
        }

        if (action === 'off') {
            botData.autoVoice[userId] = false;
            saveBotData();
            return await sock.sendMessage(from, { text: '❌ *Auto Voice disabled.*' }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: '❌ Use `.autovoice on` or `.autovoice off`' }, { quoted: msg });
    } catch (e) {
        try { await sock.sendMessage(from, { text: '❌ Could not update auto voice setting.' }, { quoted: msg }); } catch (_) {}
    }
}

module.exports = autovoiceCommand;
