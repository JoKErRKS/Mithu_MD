const { resolveTarget, getContextInfo } = require('../lib/getTarget');

async function safeSend(sock, from, msg, text, mentions = []) {
    try {
        await sock.sendMessage(from, { text, mentions }, { quoted: msg });
    } catch (e) {
        try { await sock.sendMessage(from, { text }, { quoted: msg }); } catch (_) {}
    }
}

const NOT_GROUP = '❌ This command can only be used in a group.';
const NOT_SENDER_ADMIN = '❌ Only group admins can use this command.';
const NOT_BOT_ADMIN = '❌ I need administrator permission to perform this action.';

// .jid — show current chat ID (works in groups and DMs)
async function jid(sock, from, msg) {
    try {
        await sock.sendMessage(from, { text: `🆔 *Chat ID:*\n\`${from}\`` }, { quoted: msg });
    } catch (e) {
        try { await sock.sendMessage(from, { text: '❌ Could not fetch the chat ID.' }, { quoted: msg }); } catch (_) {}
    }
}

// .add <number>
async function add(sock, from, msg, isSenderAdmin, isBotAdmin, args) {
    try {
        if (!from.endsWith('@g.us')) return await safeSend(sock, from, msg, NOT_GROUP);
        if (!isSenderAdmin) return await safeSend(sock, from, msg, NOT_SENDER_ADMIN);
        if (!isBotAdmin) return await safeSend(sock, from, msg, NOT_BOT_ADMIN);

        const number = (args?.[0] || '').replace(/[^0-9]/g, '');
        if (!number || number.length < 6) {
            return await safeSend(sock, from, msg, '❌ Please provide a valid phone number.\nExample: `.add 923001234567`');
        }

        const targetJid = `${number}@s.whatsapp.net`;
        const result = await sock.groupParticipantsUpdate(from, [targetJid], 'add').catch((e) => {
            throw e;
        });
        const status = result?.[0]?.status;

        if (status === '200') {
            await safeSend(sock, from, msg, `✅ Successfully added @${number} to the group.`, [targetJid]);
        } else if (status === '403') {
            await safeSend(sock, from, msg, `⚠️ Could not add @${number} directly — their privacy settings block direct adds. Try sending them an invite link instead.`, [targetJid]);
        } else if (status === '408' || status === '409') {
            await safeSend(sock, from, msg, `⚠️ @${number} is already in the group or the request timed out.`, [targetJid]);
        } else {
            await safeSend(sock, from, msg, `⚠️ Could not add @${number}. WhatsApp restrictions may apply.`, [targetJid]);
        }
    } catch (e) {
        await safeSend(sock, from, msg, `❌ Failed to add user: ${e.message || 'unknown error'}`);
    }
}

// .mute (reply to user) — soft mute: bot auto-deletes their future messages while it has admin rights
async function mute(sock, from, msg, isSenderAdmin, isBotAdmin, botData, saveBotData) {
    try {
        if (!from.endsWith('@g.us')) return await safeSend(sock, from, msg, NOT_GROUP);
        if (!isSenderAdmin) return await safeSend(sock, from, msg, NOT_SENDER_ADMIN);
        if (!isBotAdmin) return await safeSend(sock, from, msg, NOT_BOT_ADMIN);

        const contextInfo = getContextInfo(msg);
        const target = contextInfo?.participant || contextInfo?.mentionedJid?.[0];

        if (!target) {
            return await safeSend(sock, from, msg, '❌ Reply to the message of the user you want to mute.');
        }

        if (!botData.mutedUsers) botData.mutedUsers = {};
        if (!botData.mutedUsers[from]) botData.mutedUsers[from] = [];
        if (!botData.mutedUsers[from].includes(target)) {
            botData.mutedUsers[from].push(target);
            saveBotData();
        }

        await safeSend(
            sock, from, msg,
            `🔇 @${target.split('@')[0]} has been muted.\n_Their messages will be auto-removed while I have admin rights._`,
            [target]
        );
    } catch (e) {
        await safeSend(sock, from, msg, `❌ Failed to mute user: ${e.message || 'unknown error'}`);
    }
}

// .unmute (reply to user)
async function unmute(sock, from, msg, isSenderAdmin, isBotAdmin, botData, saveBotData) {
    try {
        if (!from.endsWith('@g.us')) return await safeSend(sock, from, msg, NOT_GROUP);
        if (!isSenderAdmin) return await safeSend(sock, from, msg, NOT_SENDER_ADMIN);

        const contextInfo = getContextInfo(msg);
        const target = contextInfo?.participant || contextInfo?.mentionedJid?.[0];

        if (!target) {
            return await safeSend(sock, from, msg, '❌ Reply to the message of the user you want to unmute.');
        }

        if (botData.mutedUsers && botData.mutedUsers[from]) {
            const before = botData.mutedUsers[from].length;
            botData.mutedUsers[from] = botData.mutedUsers[from].filter((j) => j !== target);
            if (botData.mutedUsers[from].length !== before) saveBotData();
        }

        await safeSend(sock, from, msg, `🔊 @${target.split('@')[0]} has been unmuted.`, [target]);
    } catch (e) {
        await safeSend(sock, from, msg, `❌ Failed to unmute user: ${e.message || 'unknown error'}`);
    }
}

// .promote (reply or mention)
async function promote(sock, from, msg, isSenderAdmin, isBotAdmin, args) {
    try {
        if (!from.endsWith('@g.us')) return await safeSend(sock, from, msg, NOT_GROUP);
        if (!isSenderAdmin) return await safeSend(sock, from, msg, NOT_SENDER_ADMIN);
        if (!isBotAdmin) return await safeSend(sock, from, msg, NOT_BOT_ADMIN);

        const target = resolveTarget(msg, args);
        if (!target) return await safeSend(sock, from, msg, '❌ Reply to or mention the user you want to promote.');

        await sock.groupParticipantsUpdate(from, [target], 'promote');
        await safeSend(sock, from, msg, `⬆️ @${target.split('@')[0]} is now an admin.`, [target]);
    } catch (e) {
        await safeSend(sock, from, msg, `❌ Failed to promote user: ${e.message || 'unknown error'}`);
    }
}

// .demote (reply or mention)
async function demote(sock, from, msg, isSenderAdmin, isBotAdmin, args) {
    try {
        if (!from.endsWith('@g.us')) return await safeSend(sock, from, msg, NOT_GROUP);
        if (!isSenderAdmin) return await safeSend(sock, from, msg, NOT_SENDER_ADMIN);
        if (!isBotAdmin) return await safeSend(sock, from, msg, NOT_BOT_ADMIN);

        const target = resolveTarget(msg, args);
        if (!target) return await safeSend(sock, from, msg, '❌ Reply to or mention the user you want to demote.');

        await sock.groupParticipantsUpdate(from, [target], 'demote');
        await safeSend(sock, from, msg, `⬇️ @${target.split('@')[0]} is no longer an admin.`, [target]);
    } catch (e) {
        await safeSend(sock, from, msg, `❌ Failed to demote user: ${e.message || 'unknown error'}`);
    }
}

// .admins — list group admins
async function admins(sock, from, msg) {
    try {
        if (!from.endsWith('@g.us')) return await safeSend(sock, from, msg, NOT_GROUP);

        const metadata = await sock.groupMetadata(from);
        const adminList = metadata.participants.filter((p) => p.admin === 'admin' || p.admin === 'superadmin');

        if (!adminList.length) {
            return await safeSend(sock, from, msg, 'ℹ️ No admins found for this group.');
        }

        const text = `👮 *Group Admins — ${metadata.subject}*\n\n` +
            adminList.map((a, i) => `${i + 1}. @${a.id.split('@')[0]}${a.admin === 'superadmin' ? ' (owner)' : ''}`).join('\n');

        await safeSend(sock, from, msg, text, adminList.map((a) => a.id));
    } catch (e) {
        await safeSend(sock, from, msg, `❌ Could not fetch group admins: ${e.message || 'unknown error'}`);
    }
}

// .info — group info
async function info(sock, from, msg) {
    try {
        if (!from.endsWith('@g.us')) return await safeSend(sock, from, msg, NOT_GROUP);

        const metadata = await sock.groupMetadata(from);
        const createdDate = metadata.creation ? new Date(metadata.creation * 1000).toDateString() : 'Unknown';
        const adminCount = metadata.participants.filter((p) => p.admin === 'admin' || p.admin === 'superadmin').length;

        const text = `ℹ️ *Group Info*\n\n` +
            `┃ ⋄ *Name:* ${metadata.subject}\n` +
            `┃ ⋄ *ID:* ${metadata.id}\n` +
            `┃ ⋄ *Members:* ${metadata.participants.length}\n` +
            `┃ ⋄ *Admins:* ${adminCount}\n` +
            `┃ ⋄ *Created:* ${createdDate}\n` +
            `┃ ⋄ *Description:* ${metadata.desc || 'No description'}`;

        await safeSend(sock, from, msg, text);
    } catch (e) {
        await safeSend(sock, from, msg, `❌ Could not fetch group info: ${e.message || 'unknown error'}`);
    }
}

module.exports = { jid, add, mute, unmute, promote, demote, admins, info };
