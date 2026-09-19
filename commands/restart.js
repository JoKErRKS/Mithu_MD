// .restart — owner-only. Sends a confirmation, then exits the process so the
// hosting platform's process supervisor (Railway, PM2, etc.) restarts it.
// This does NOT stop the service permanently — it relies on the same restart
// behavior the platform already uses if the process ever crashes.
async function restart(sock, from, msg, isBotOwner) {
    try {
        if (!isBotOwner) {
            return await sock.sendMessage(from, { text: '❌ Only the bot owner can use this command.' }, { quoted: msg });
        }
        await sock.sendMessage(from, { text: '🔄 *Restarting...* The bot will reconnect shortly.' }, { quoted: msg }).catch(() => {});
        setTimeout(() => process.exit(1), 1500);
    } catch (e) {
        try { await sock.sendMessage(from, { text: '❌ Could not restart right now.' }, { quoted: msg }); } catch (_) {}
    }
}

module.exports = restart;
