const toBold = (text) => {
    const boldChars = {
        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
    };
    return text.split('').map(c => boldChars[c] || c).join('');
};

// Default prohibited-word list. Kept intentionally short/generic; the group
// admin can extend it via `.antibad add <word>` / `.antibad remove <word>`.
const DEFAULT_BAD_WORDS = ['fuck', 'bitch', 'asshole', 'bastard', 'slut', 'whore'];

function containsBadWord(body, customWords) {
    if (!body) return null;
    const lower = body.toLowerCase();
    const words = (customWords && customWords.length) ? customWords : DEFAULT_BAD_WORDS;
    for (const w of words) {
        if (!w) continue;
        const escaped = w.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp(`\\b${escaped}\\b`, 'i').test(lower)) return w;
    }
    return null;
}

async function antibadCommand(sock, from, msg, isSenderAdmin, isBotAdmin, botData, saveBotData, args) {
    if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: "❌ This command can only be used in groups." }, { quoted: msg });
    if (!isSenderAdmin) return await sock.sendMessage(from, { text: "❌ Only group admins can use this command." }, { quoted: msg });

    if (!botData.antibadGroups) botData.antibadGroups = {};
    if (!botData.antibadWords) botData.antibadWords = {};

    const action = args[0]?.toLowerCase();
    const VALID_MODES = ['on', 'off', 'kick', 'warn'];

    if (!action) {
        const currentMode = botData.antibadGroups[from];
        const status = currentMode ? `✅ ON (mode: ${currentMode})` : '❌ OFF';
        const wordCount = (botData.antibadWords[from] || []).length || DEFAULT_BAD_WORDS.length;
        const menu = `╭━━━〔 ${toBold("ANTIBAD SETTINGS")} 〕━━━┈⊷\n` +
                   `┃ ⋄ ${toBold("Status:")} ${status}\n` +
                   `┃ ⋄ ${toBold("Word list:")} ${wordCount} word(s)\n` +
                   `╰━━━━━━━━━━━━━━━━━━┈⊷\n\n` +
                   `*Commands:*\n` +
                   `.antibad on - Delete bad-word messages only\n` +
                   `.antibad warn - Delete + warn (removes after 3 warnings)\n` +
                   `.antibad kick - Delete + remove user immediately\n` +
                   `.antibad off - Disable Antibad\n` +
                   `.antibad add <word> - Add a word to this group's list\n` +
                   `.antibad remove <word> - Remove a word from the list`;
        return await sock.sendMessage(from, { text: menu }, { quoted: msg });
    }

    if (action === 'add' || action === 'remove') {
        const word = args.slice(1).join(' ').trim().toLowerCase();
        if (!word) return await sock.sendMessage(from, { text: `❌ Provide a word.\nExample: \`.antibad ${action} example\`` }, { quoted: msg });

        if (!botData.antibadWords[from]) botData.antibadWords[from] = [...DEFAULT_BAD_WORDS];
        const list = botData.antibadWords[from];

        if (action === 'add') {
            if (!list.includes(word)) list.push(word);
            saveBotData();
            return await sock.sendMessage(from, { text: `✅ Added \`${word}\` to this group's bad-word list.` }, { quoted: msg });
        } else {
            botData.antibadWords[from] = list.filter(w => w !== word);
            saveBotData();
            return await sock.sendMessage(from, { text: `✅ Removed \`${word}\` from this group's bad-word list.` }, { quoted: msg });
        }
    }

    if (!VALID_MODES.includes(action)) {
        return await sock.sendMessage(from, { text: "❌ Use `.antibad on`, `.antibad warn`, `.antibad kick`, `.antibad off`, `.antibad add <word>`, or `.antibad remove <word>`" }, { quoted: msg });
    }

    if (action === 'off') {
        delete botData.antibadGroups[from];
        if (botData.antibadWarnings) delete botData.antibadWarnings[from];
        saveBotData();
        return await sock.sendMessage(from, { text: "❌ *ANTIBAD: OFF*" }, { quoted: msg });
    }

    botData.antibadGroups[from] = action; // 'on' | 'warn' | 'kick'
    saveBotData();

    const modeLabel = {
        on: 'ON (bad-word messages will just be deleted)',
        warn: 'ON — WARN MODE (delete + warn, removes after 3 warnings)',
        kick: 'ON — KICK MODE (delete + remove immediately)',
    }[action];

    await sock.sendMessage(from, { text: `✅ *ANTIBAD: ${modeLabel}*` }, { quoted: msg });
}

module.exports = antibadCommand;
module.exports.containsBadWord = containsBadWord;
