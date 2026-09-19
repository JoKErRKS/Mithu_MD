const { resolveTarget } = require('../lib/getTarget');

async function safeSend(sock, from, msg, text, mentions = []) {
    try {
        await sock.sendMessage(from, { text, mentions }, { quoted: msg });
    } catch (e) {
        try { await sock.sendMessage(from, { text }, { quoted: msg }); } catch (_) {}
    }
}

// .block (reply/mention/number) — owner only: blocking is an account-level
// action, not a group permission, so it's gated by ownership rather than
// group-admin status.
async function block(sock, from, msg, isBotOwner, args) {
    try {
        if (!isBotOwner) return await safeSend(sock, from, msg, '❌ Only the bot owner can use this command.');

        const target = resolveTarget(msg, args);
        if (!target) {
            return await safeSend(sock, from, msg, '❌ Reply to a user, mention them, or give a number.\nExample: `.block 923001234567`');
        }

        await sock.updateBlockStatus(target, 'block');
        await safeSend(sock, from, msg, `🚫 @${target.split('@')[0]} has been blocked.`, [target]);
    } catch (e) {
        await safeSend(sock, from, msg, `❌ Failed to block user: ${e.message || 'unknown error'}`);
    }
}

// .unblock (reply/mention/number)
async function unblock(sock, from, msg, isBotOwner, args) {
    try {
        if (!isBotOwner) return await safeSend(sock, from, msg, '❌ Only the bot owner can use this command.');

        const target = resolveTarget(msg, args);
        if (!target) {
            return await safeSend(sock, from, msg, '❌ Reply to a user, mention them, or give a number.\nExample: `.unblock 923001234567`');
        }

        await sock.updateBlockStatus(target, 'unblock');
        await safeSend(sock, from, msg, `✅ @${target.split('@')[0]} has been unblocked.`, [target]);
    } catch (e) {
        await safeSend(sock, from, msg, `❌ Failed to unblock user: ${e.message || 'unknown error'}`);
    }
}

module.exports = { block, unblock };
