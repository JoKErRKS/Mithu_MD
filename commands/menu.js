const settings = require('../settings');

const MENU_IMAGE = 'https://h.uguu.se/feWEufPC.jpg';

async function menu(sock, from, msg, isBotOwner) {
    try {
        const botName = settings.botName || 'Mithu_MD MINI';
        let text = `${botName} — 𝗕𝗢𝗧 𝗔𝗖𝗧𝗜𝗩𝗘\n\n`;

        text += `╭━━━〔 𝗚𝗘𝗡𝗘𝗥𝗔𝗟 〕━━━┈⊷\n` +
                `┃ ⋄ .help\n` +
                `┃ ⋄ .menu\n` +
                `┃ ⋄ .repo\n` +
                `┃ ⋄ .ping / .alive / .botstatus\n` +
                `╰━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

        text += `╭━━━〔 𝗙𝗨𝗡 〕━━━┈⊷\n` +
                `┃ ⋄ .kiss / .hug / .slap / .pat\n` +
                `┃ ⋄ .love / .highfive / .ship\n` +
                `┃ ⋄ .wife / .rate / .roast\n` +
                `┃ ⋄ .joke / .fact / .truth / .dare\n` +
                `┃ ⋄ .8ball <question>\n` +
                `╰━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

        text += `╭━━━〔 𝗚𝗥𝗢𝗨𝗣 〕━━━┈⊷\n` +
                `┃ ⋄ .jid / .info / .admins\n` +
                `┃ ⋄ .add <number>\n` +
                `┃ ⋄ .kick (reply)\n` +
                `┃ ⋄ .mute / .unmute (reply)\n` +
                `┃ ⋄ .promote / .demote (reply)\n` +
                `┃ ⋄ .gc-setting\n` +
                `┃ ⋄ .antibad on/warn/kick/off\n` +
                `┃ ⋄ .antilink on/warn/kick/off\n` +
                `┃ ⋄ .welcome on/off\n` +
                `╰━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

        text += `╭━━━〔 𝗧𝗢𝗢𝗟𝗦 〕━━━┈⊷\n` +
                `┃ ⋄ .tts <text>\n` +
                `┃ ⋄ .calculator <expr>\n` +
                `┃ ⋄ .time / .date [timezone]\n` +
                `┃ ⋄ .song / .video [name]\n` +
                `┃ ⋄ .ytmp3 / .ytmp4 [url]\n` +
                `┃ ⋄ .dp / .vv\n` +
                `╰━━━━━━━━━━━━━━━━━━┈⊷`;

        if (isBotOwner) {
            text += `\n\n╭━━━〔 𝗔𝗨𝗧𝗢 〕━━━┈⊷\n` +
                    `┃ ⋄ .autotype on/off\n` +
                    `┃ ⋄ .autovoice on/off\n` +
                    `┃ ⋄ .autoreacts on/off\n` +
                    `┃ ⋄ .antidelete on/off\n` +
                    `┃ ⋄ .anticall on/off\n` +
                    `┃ ⋄ .status on/off\n` +
                    `╰━━━━━━━━━━━━━━━━━━┈⊷\n\n` +
                    `╭━━━〔 𝗦𝗬𝗦𝗧𝗘𝗠 〕━━━┈⊷\n` +
                    `┃ ⋄ .public / .private\n` +
                    `┃ ⋄ .block / .unblock (reply)\n` +
                    `┃ ⋄ .getpair\n` +
                    `┃ ⋄ .restart\n` +
                    `╰━━━━━━━━━━━━━━━━━━┈⊷`;
        }

        await sock.sendMessage(from, {
            image: { url: MENU_IMAGE },
            caption: text
        }, { quoted: msg }).catch(() => {});
    } catch (e) {
        try {
            await sock.sendMessage(from, { text: '❌ Could not load the menu right now. Try .help instead.' }, { quoted: msg });
        } catch (_) {}
    }
}

module.exports = { menu, MENU_IMAGE };
