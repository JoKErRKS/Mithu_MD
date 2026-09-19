const { jidNormalizedUser } = require('@whiskeysockets/baileys');

function normalizeNumber(jid) {
    if (!jid) return null;
    try {
        return jidNormalizedUser(jid).split('@')[0].split(':')[0];
    } catch (e) {
        return String(jid).split('@')[0].split(':')[0];
    }
}

/**
 * Checks whether `senderId` (optionally also known by `senderLid`) is an
 * admin/superadmin in `chatId`.
 *
 * WhatsApp groups can list a participant either by their phone-number JID
 * (`p.id`) or by a separate "LID" identity (`p.id` / `p.lid` in LID form).
 * A caller -- especially the bot checking its OWN admin status via
 * `sock.user.id` -- may only know its phone-number identity even though the
 * group lists it by LID (or vice-versa). Passing both identities when known
 * (see index.js, which also passes `sock.user.lid`) lets this function match
 * correctly either way instead of silently reporting "not admin".
 */
async function isAdmin(sock, chatId, senderId, senderLid = null) {
    if (!chatId.endsWith('@g.us')) return true;
    try {
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        // 1. Direct ID match -- covers the common case where senderId is
        //    already in the same format the group uses.
        const directMatch = participants.find(
            (p) => p.id === senderId || (senderLid && p.id === senderLid)
        );
        if (directMatch && (directMatch.admin === 'admin' || directMatch.admin === 'superadmin')) {
            return true;
        }

        // 2. Normalized-number fallback -- compare the bare phone-number
        //    portion of every identity we know (senderId's number AND
        //    senderLid's number, if given) against every identity each
        //    participant is listed under (p.id AND p.lid, if present).
        const senderNumber = normalizeNumber(senderId);
        const senderLidNumber = normalizeNumber(senderLid);

        const participant = participants.find((p) => {
            const pId = normalizeNumber(p.id);
            const pLid = p.lid ? normalizeNumber(p.lid) : null;
            return (
                (senderNumber && (pId === senderNumber || pLid === senderNumber)) ||
                (senderLidNumber && (pId === senderLidNumber || pLid === senderLidNumber))
            );
        });

        return !!(participant && (participant.admin === 'admin' || participant.admin === 'superadmin'));
    } catch (e) {
        return false;
    }
}

module.exports = { isAdmin };
