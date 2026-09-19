const os = require('os');

function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    let parts = [];
    if (d) parts.push(`${d}d`);
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
}

// .ping — status + latency
async function ping(sock, from, msg) {
    try {
        const start = Date.now();
        const sent = await sock.sendMessage(from, { text: '🏓 Pinging...' }, { quoted: msg }).catch(() => null);
        const latency = Date.now() - start;
        const text = `🏓 *Pong!*\n⚡ *Speed:* ${latency} ms\n🤖 *Bot:* Online ✅`;
        await sock.sendMessage(from, { text }, sent ? { quoted: sent } : { quoted: msg }).catch(() => {});
    } catch (e) {
        try {
            await sock.sendMessage(from, { text: '❌ Could not measure ping right now, but the bot is online.' }, { quoted: msg });
        } catch (_) {}
    }
}

// .alive — simple online check
async function alive(sock, from, msg) {
    try {
        const uptime = formatUptime(process.uptime());
        const text = `✅ *𝐌𝐢𝐭𝐡𝐮_𝐌𝐃 𝗠𝗜𝗡𝗜-𝗕𝗢𝗧 𝗜𝗦 𝗔𝗟𝗜𝗩𝗘*\n\n` +
                     `┃ ⋄ 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptime}\n` +
                     `┃ ⋄ 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${os.platform()}\n` +
                     `┃ ⋄ 𝗦𝘁𝗮𝘁𝘂𝘀: 𝗢𝗻𝗹𝗶𝗻𝗲 ✅\n\n` +
                     `> _Use .menu or .help to see all commands_`;
        await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (e) {
        try { await sock.sendMessage(from, { text: '✅ Bot is online.' }, { quoted: msg }); } catch (_) {}
    }
}

// .help — plain text command list (no image, complements .menu)
async function help(sock, from, msg, isBotOwner) {
    try {
        let text = `📖 *𝐌𝐢𝐭𝐡𝐮_𝐌𝐃 𝐌𝐈𝐍𝐈 — 𝗛𝗘𝗟𝗣 𝗠𝗘𝗡𝗨*\n\n`;

        text += `╭━━━〔 𝗕𝗔𝗦𝗜𝗖 〕━━━┈⊷\n` +
                `┃ ⋄ .ping\n` +
                `┃ ⋄ .alive\n` +
                `┃ ⋄ .menu\n` +
                `┃ ⋄ .help\n` +
                `┃ ⋄ .repo\n` +
                `╰━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

        text += `╭━━━〔 𝗙𝗨𝗡 〕━━━┈⊷\n` +
                `┃ ⋄ .kiss / .hug / .slap / .pat\n` +
                `┃ ⋄ .love / .highfive / .ship\n` +
                `┃ ⋄ .wife / .rate / .roast\n` +
                `┃ ⋄ .joke / .fact / .truth / .dare\n` +
                `┃ ⋄ .8ball <question>\n` +
                `╰━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

        text += `╭━━━〔 𝗚𝗥𝗢𝗨𝗣 〕━━━┈⊷\n` +
                `┃ ⋄ .jid\n` +
                `┃ ⋄ .info\n` +
                `┃ ⋄ .admins\n` +
                `┃ ⋄ .add <number>\n` +
                `┃ ⋄ .kick (reply)\n` +
                `┃ ⋄ .mute / .unmute (reply)\n` +
                `┃ ⋄ .promote / .demote (reply)\n` +
                `┃ ⋄ .gc-setting\n` +
                `┃ ⋄ .antibad on/warn/kick/off\n` +
                `╰━━━━━━━━━━━━━━━━━━┈⊷\n\n`;

        text += `╭━━━〔 𝗨𝗧𝗜𝗟𝗜𝗧𝗬 〕━━━┈⊷\n` +
                `┃ ⋄ .botstatus\n` +
                `┃ ⋄ .tts <text>\n` +
                `┃ ⋄ .calculator <expr>\n` +
                `┃ ⋄ .time [timezone]\n` +
                `┃ ⋄ .date [timezone]\n` +
                `╰━━━━━━━━━━━━━━━━━━┈⊷`;

        if (isBotOwner) {
            text += `\n\n╭━━━〔 𝗢𝗪𝗡𝗘𝗥 〕━━━┈⊷\n` +
                    `┃ ⋄ .public / .private\n` +
                    `┃ ⋄ .antilink on/warn/kick/off\n` +
                    `┃ ⋄ .antidelete on/off\n` +
                    `┃ ⋄ .status on/off\n` +
                    `┃ ⋄ .anticall on/off\n` +
                    `┃ ⋄ .autoreacts on/off\n` +
                    `┃ ⋄ .autotype on/off\n` +
                    `┃ ⋄ .autovoice on/off\n` +
                    `┃ ⋄ .welcome on/off\n` +
                    `┃ ⋄ .block / .unblock (reply)\n` +
                    `┃ ⋄ .getpair\n` +
                    `┃ ⋄ .restart\n` +
                    `┃ ⋄ .song / .video / .ytmp3 / .ytmp4 / .dp / .vv\n` +
                    `╰━━━━━━━━━━━━━━━━━━┈⊷`;
        }

        await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (e) {
        try { await sock.sendMessage(from, { text: '❌ Could not load the help menu right now.' }, { quoted: msg }); } catch (_) {}
    }
}

module.exports = { ping, alive, help };
