// .autotyping on/off — bot-account-wide setting (owner only).
// When enabled, the bot sends a "composing..." presence update before
// replying to any command, simulating a human typing.

async function autotypingCommand(sock, from, msg, isBotOwner, botData, saveBotData, userId, args) {
    try {
        if (!isBotOwner) {
            return await sock.sendMessage(from, { text: '❌ Only the bot owner can use this command.' }, { quoted: msg });
        }

        if (!botData.autoTyping) botData.autoTyping = {};
        const action = (args?.[0] || '').toLowerCase();

        if (!action) {
            const status = botData.autoTyping[userId] ? '✅ ON' : '❌ OFF';
            return await sock.sendMessage(
                from,
                { text: `⌨️ *Auto Typing:* ${status}\n\nUse \`.autotyping on\` or \`.autotyping off\`` },
                { quoted: msg }
            );
        }

        if (action === 'on') {
            botData.autoTyping[userId] = true;
            saveBotData();
            return await sock.sendMessage(from, { text: '✅ *Auto Typing enabled.* I\'ll show "typing..." before replying.' }, { quoted: msg });
        }

        if (action === 'off') {
            botData.autoTyping[userId] = false;
            saveBotData();
            return await sock.sendMessage(from, { text: '❌ *Auto Typing disabled.*' }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: '❌ Use `.autotyping on` or `.autotyping off`' }, { quoted: msg });
    } catch (e) {
        try { await sock.sendMessage(from, { text: '❌ Could not update auto typing setting.' }, { quoted: msg }); } catch (_) {}
    }
}

module.exports = autotypingCommand;
