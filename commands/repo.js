const settings = require('../settings');

// .repo — shows the repository info already configured for this bot.
// Never invents a URL; if none is configured, says so plainly.
async function repo(sock, from, msg) {
    try {
        const botName = settings.botName || 'Mithu_MD MINI';
        let text = `📦 *${botName} — Repository Info*\n\n`;

        if (settings.repoUrl) {
            text += `┃ ⋄ *Repo:* ${settings.repoUrl}\n`;
        } else {
            text += `┃ ⋄ *Repo:* Not configured on this deployment.\n` +
                    `┃    _(set REPO_URL in the environment to enable this)_\n`;
        }

        text += `┃ ⋄ *Owner:* ${settings.ownerName}\n` +
                `┃ ⋄ *Channel:* ${settings.channelLink}`;

        await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (e) {
        try { await sock.sendMessage(from, { text: '❌ Could not load repository info right now.' }, { quoted: msg }); } catch (_) {}
    }
}

module.exports = repo;
