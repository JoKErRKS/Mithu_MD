// Shared helper: resolves the "target" user of a command from
// (1) a replied-to message, (2) an @mention, or (3) a raw number argument.
// Used by the fun commands and the group-management commands so the
// resolution logic lives in exactly one place.

function getMessageContent(msg) {
    return msg.message?.ephemeralMessage?.message
        || msg.message?.viewOnceMessage?.message
        || msg.message?.viewOnceMessageV2?.message
        || msg.message;
}

function getContextInfo(msg) {
    const content = getMessageContent(msg);
    if (!content) return null;
    return content.extendedTextMessage?.contextInfo
        || content.imageMessage?.contextInfo
        || content.videoMessage?.contextInfo
        || content.conversation?.contextInfo
        || null;
}

/**
 * Resolve a target JID.
 * Priority: replied-to user > @mentioned user > first numeric arg.
 * Returns null if nothing usable was found.
 */
function resolveTarget(msg, args = []) {
    try {
        const contextInfo = getContextInfo(msg);
        let jid = contextInfo?.participant || contextInfo?.mentionedJid?.[0] || null;

        if (!jid && args && args[0]) {
            const raw = String(args[0]).replace('@', '').replace(/[^0-9]/g, '');
            if (raw.length >= 6) jid = `${raw}@s.whatsapp.net`;
        }
        return jid || null;
    } catch (e) {
        return null;
    }
}

module.exports = { resolveTarget, getMessageContent, getContextInfo };
