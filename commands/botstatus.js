const os = require('os');

function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts = [];
    if (d) parts.push(`${d}d`);
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
}

// .botstatus — detailed health/status snapshot for this session
async function botstatus(sock, from, msg, isConnected) {
    try {
        const mem = process.memoryUsage();
        const usedMB = (mem.rss / 1024 / 1024).toFixed(1);
        const text = `📊 *𝐉𝐨𝐊𝐄𝐑_𝐑𝐊𝐒 𝗠𝗗 — 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦*\n\n` +
            `┃ ⋄ *Connection:* ${isConnected ? '✅ Connected' : '⚠️ Reconnecting'}\n` +
            `┃ ⋄ *Uptime:* ${formatUptime(process.uptime())}\n` +
            `┃ ⋄ *Memory Used:* ${usedMB} MB\n` +
            `┃ ⋄ *Platform:* ${os.platform()}\n` +
            `┃ ⋄ *Node:* ${process.version}`;
        await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (e) {
        try { await sock.sendMessage(from, { text: '✅ Bot is online.' }, { quoted: msg }); } catch (_) {}
    }
}

module.exports = botstatus;
