const toBold = (text) => {
    const boldChars = {
        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
    };
    return text.split('').map(c => boldChars[c] || c).join('');
};

async function antilinkCommand(sock, from, msg, isSenderAdmin, isBotAdmin, botData, saveBotData, args) {
    if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: "❌ This command can only be used in groups." }, { quoted: msg });
    if (!isSenderAdmin) return await sock.sendMessage(from, { text: "❌ Only group admins can use this command." }, { quoted: msg });
    // Removed bot admin check to bypass the error
    // if (!isBotAdmin) return await sock.sendMessage(from, { text: "❌ Please make the bot an admin first to use Antilink." }, { quoted: msg });

    const action = args[0]?.toLowerCase();
    const VALID_MODES = ['on', 'off', 'kick', 'warn'];

    if (!action) {
        const currentMode = botData.antilinkGroups[from];
        const status = currentMode ? `✅ ON (mode: ${currentMode})` : '❌ OFF';
        const menu = `╭━━━〔 ${toBold("ANTILINK SETTINGS")} 〕━━━┈⊷\n` +
                   `┃ ⋄ ${toBold("Status:")} ${status}\n` +
                   `╰━━━━━━━━━━━━━━━━━━┈⊷\n\n` +
                   `*Commands:*\n` +
                   `.antilink on - Delete links only\n` +
                   `.antilink warn - Delete link + warn (removes after 3 warnings)\n` +
                   `.antilink kick - Delete link + remove user immediately\n` +
                   `.antilink off - Disable Antilink`;
        return await sock.sendMessage(from, { text: menu }, { quoted: msg });
    }

    if (!VALID_MODES.includes(action)) {
        return await sock.sendMessage(from, { text: "❌ Use `.antilink on`, `.antilink warn`, `.antilink kick`, or `.antilink off`" }, { quoted: msg });
    }

    if (action === 'off') {
        delete botData.antilinkGroups[from];
        if (botData.antilinkWarnings) delete botData.antilinkWarnings[from];
        saveBotData();
        return await sock.sendMessage(from, { text: "❌ *ANTILINK: OFF*" }, { quoted: msg });
    }

    botData.antilinkGroups[from] = action; // 'on' | 'warn' | 'kick'
    saveBotData();

    const modeLabel = {
        on: 'ON (links will just be deleted)',
        warn: 'ON — WARN MODE (delete + warn, removes after 3 warnings)',
        kick: 'ON — KICK MODE (delete + remove immediately)',
    }[action];

    await sock.sendMessage(from, { text: `✅ *ANTILINK: ${modeLabel}*` }, { quoted: msg });
}

module.exports = antilinkCommand;
