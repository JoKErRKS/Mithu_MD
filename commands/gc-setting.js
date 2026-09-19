const antilinkCommand = require('./antilink');
const antibadCommand = require('./antibad');
const welcomeCommand = require('./welcome');
const { isWelcomeOn } = require('../lib/index.js');

// .gc-setting — a group-settings hub. With no args, shows a status overview
// of every group-level toggle. With a known sub-feature name, it routes to
// that feature's existing command handler instead of reimplementing it, so
// there is exactly one implementation per setting.
async function gcSetting(sock, from, msg, isSenderAdmin, isBotAdmin, botData, saveBotData, args) {
    try {
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: "❌ This command can only be used in groups." }, { quoted: msg });
        }
        if (!isSenderAdmin) {
            return await sock.sendMessage(from, { text: "❌ Only group admins can use this command." }, { quoted: msg });
        }

        const sub = args[0]?.toLowerCase();

        // Route to the real, existing handler for a given feature.
        if (sub === 'antilink') {
            return await antilinkCommand(sock, from, msg, isSenderAdmin, isBotAdmin, botData, saveBotData, args.slice(1));
        }
        if (sub === 'antibad') {
            return await antibadCommand(sock, from, msg, isSenderAdmin, isBotAdmin, botData, saveBotData, args.slice(1));
        }
        if (sub === 'welcome') {
            return await welcomeCommand(sock, from, msg, isSenderAdmin, botData, saveBotData, args.slice(1));
        }

        // No sub-feature given: show a combined status overview.
        const antilinkMode = botData.antilinkGroups?.[from];
        const antibadMode = botData.antibadGroups?.[from];
        const welcomeOn = await isWelcomeOn(from).catch(() => false);
        const mutedCount = (botData.mutedUsers?.[from] || []).length;

        const text = `⚙️ *𝗚𝗿𝗼𝘂𝗽 𝗦𝗲𝘁𝘁𝗶𝗻𝗴𝘀*\n\n` +
            `┃ ⋄ *Antilink:* ${antilinkMode ? `✅ ON (${antilinkMode})` : '❌ OFF'}\n` +
            `┃ ⋄ *Antibad:* ${antibadMode ? `✅ ON (${antibadMode})` : '❌ OFF'}\n` +
            `┃ ⋄ *Welcome:* ${welcomeOn ? '✅ ON' : '❌ OFF'}\n` +
            `┃ ⋄ *Muted users:* ${mutedCount}\n\n` +
            `*Manage a setting:*\n` +
            `.gc-setting antilink on/warn/kick/off\n` +
            `.gc-setting antibad on/warn/kick/off\n` +
            `.gc-setting welcome on/off\n\n` +
            `_(Each also works directly, e.g. \`.antilink on\`)_`;

        await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (e) {
        try { await sock.sendMessage(from, { text: '❌ Could not load group settings right now.' }, { quoted: msg }); } catch (_) {}
    }
}

module.exports = gcSetting;
