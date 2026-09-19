const { resolveTarget } = require('../lib/getTarget');

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const tag = (jid) => `@${jid.split('@')[0]}`;

async function safeSend(sock, from, msg, text, mentions = []) {
    try {
        await sock.sendMessage(from, { text, mentions }, { quoted: msg });
    } catch (e) {
        try { await sock.sendMessage(from, { text: '❌ Something went wrong sending that.' }, { quoted: msg }); } catch (_) {}
    }
}

// Generic helper for two-person "action" commands (kiss/hug/slap/pat/highfive/love)
function makeActionCommand(templates, noTargetMsg) {
    return async function (sock, from, msg, sender, args) {
        try {
            const target = resolveTarget(msg, args);
            if (!target) {
                return await safeSend(sock, from, msg, noTargetMsg);
            }
            if (target === sender) {
                return await safeSend(sock, from, msg, `🤔 You can't do that to yourself, ${tag(sender)}!`, [sender]);
            }
            const template = pick(templates);
            const text = template(tag(sender), tag(target));
            await safeSend(sock, from, msg, text, [sender, target]);
        } catch (e) {
            await safeSend(sock, from, msg, '❌ Could not run that command right now.');
        }
    };
}

const kiss = makeActionCommand(
    [
        (a, b) => `💋 ${a} plants a sweet kiss on ${b}!`,
        (a, b) => `😘 ${a} kisses ${b} out of nowhere!`,
        (a, b) => `💞 ${a} gives ${b} a gentle kiss on the cheek!`,
    ],
    '❌ Reply to someone\'s message or mention them: `.kiss @user`'
);

const hug = makeActionCommand(
    [
        (a, b) => `🤗 ${a} wraps ${b} in a big warm hug!`,
        (a, b) => `🫂 ${a} gives ${b} a comforting hug!`,
        (a, b) => `💕 ${a} hugs ${b} tightly!`,
    ],
    '❌ Reply to someone\'s message or mention them: `.hug @user`'
);

const love = makeActionCommand(
    [
        (a, b) => `❤️ ${a} sends love to ${b}!`,
        (a, b) => `💘 ${a} has a crush on ${b}... maybe 👀`,
        (a, b) => `💖 ${a} adores ${b} so much!`,
    ],
    '❌ Reply to someone\'s message or mention them: `.love @user`'
);

const slap = makeActionCommand(
    [
        (a, b) => `👋 ${a} slaps ${b} across the room!`,
        (a, b) => `💥 ${a} gives ${b} a big slap!`,
        (a, b) => `😤 ${a} slaps some sense into ${b}!`,
    ],
    '❌ Reply to someone\'s message or mention them: `.slap @user`'
);

const pat = makeActionCommand(
    [
        (a, b) => `🖐️ ${a} pats ${b} gently on the head!`,
        (a, b) => `🥰 ${a} gives ${b} a soft headpat!`,
        (a, b) => `😌 ${a} pats ${b}, well done!`,
    ],
    '❌ Reply to someone\'s message or mention them: `.pat @user`'
);

const highfive = makeActionCommand(
    [
        (a, b) => `🙌 ${a} high-fives ${b}!`,
        (a, b) => `✋ ${a} and ${b} share an epic high five!`,
        (a, b) => `🖐️🙌 ${a} slaps hands with ${b}!`,
    ],
    '❌ Reply to someone\'s message or mention them: `.highfive @user`'
);

// .wife — playful, clearly not a real relationship claim
async function wife(sock, from, msg, sender, args) {
    try {
        const target = resolveTarget(msg, args);
        const solo = [
            '💍 Marriage module still loading... try again later 😅',
            '🤔 System says: still single and thriving.',
            '💔 No wife found in database. Please insert coin to try again.',
            '😂 You proposed to thin air. Bold move.',
        ];

        if (!target || target === sender) {
            return await safeSend(sock, from, msg, pick(solo), sender && target === sender ? [sender] : []);
        }

        const text = `🎉 *Congratulations!* ${tag(sender)} is now (playfully) married to ${tag(target)} 💍\n` +
                     `_This union is purely for fun and lasts exactly until someone forgets about it._`;
        await safeSend(sock, from, msg, text, [sender, target]);
    } catch (e) {
        await safeSend(sock, from, msg, '❌ Could not run that command right now.');
    }
}

// .ship — funny compatibility percentage
async function ship(sock, from, msg, sender, args) {
    try {
        const target = resolveTarget(msg, args);
        if (!target) {
            return await safeSend(sock, from, msg, '❌ Reply to someone\'s message or mention them: `.ship @user`');
        }
        const percent = Math.floor(Math.random() * 101);
        let verdict;
        if (percent >= 90) verdict = '💯 Soulmates!';
        else if (percent >= 70) verdict = '💖 Great match!';
        else if (percent >= 40) verdict = '🙂 Could work out.';
        else if (percent >= 15) verdict = '😅 It\'s complicated.';
        else verdict = '💀 Please don\'t.';

        const text = `💘 *Ship Calculator*\n${tag(sender)} 💞 ${tag(target)}\n\n` +
                     `❤️ Compatibility: *${percent}%*\n${verdict}`;
        await safeSend(sock, from, msg, text, [sender, target]);
    } catch (e) {
        await safeSend(sock, from, msg, '❌ Could not run that command right now.');
    }
}

// .rate — rate target (or self) out of 10, playful
async function rate(sock, from, msg, sender, args) {
    try {
        const target = resolveTarget(msg, args) || sender;
        const score = Math.floor(Math.random() * 11);
        const comments = [
            'not bad at all!', 'pretty solid.', 'legendary tier.', 'room for improvement 😅',
            'certified vibe.', 'chaotic but lovable.', 'absolutely iconic.',
        ];
        const text = `⭐ *Rating* ${tag(target)}: *${score}/10*\n_${pick(comments)}_`;
        await safeSend(sock, from, msg, text, [target]);
    } catch (e) {
        await safeSend(sock, from, msg, '❌ Could not run that command right now.');
    }
}

// .roast — harmless, playful roast
async function roast(sock, from, msg, sender, args) {
    try {
        const target = resolveTarget(msg, args) || sender;
        const roasts = [
            'you bring everyone so much joy... when you leave the chat 😂',
            'you\'re not stupid, you just have bad luck thinking 😆',
            'your WiFi has better connection than your excuses.',
            'you\'re proof that even bots can\'t fix everything 😅',
            'you\'re the reason the "reply all" button has trust issues.',
            'you\'re like a software update — nobody asked for you right now 😹',
        ];
        const text = `🔥 ${tag(target)}, ${pick(roasts)}`;
        await safeSend(sock, from, msg, text, [target]);
    } catch (e) {
        await safeSend(sock, from, msg, '❌ Could not run that command right now.');
    }
}

// .joke
async function joke(sock, from, msg) {
    try {
        const jokes = [
            'Why do programmers prefer dark mode? Because light attracts bugs.',
            'I told my computer I needed a break, and it said "no problem, I\'ll go to sleep."',
            'Why did the phone go to therapy? Too many hang-ups.',
            'I\'m reading a book about anti-gravity — it\'s impossible to put down.',
            'Why don\'t skeletons fight each other? They don\'t have the guts.',
            'Parallel lines have so much in common. It\'s a shame they\'ll never meet.',
        ];
        await safeSend(sock, from, msg, `😂 ${pick(jokes)}`);
    } catch (e) {
        await safeSend(sock, from, msg, '❌ Could not fetch a joke right now.');
    }
}

// .fact
async function fact(sock, from, msg) {
    try {
        const facts = [
            'Bananas are berries, but strawberries aren\'t.',
            'Honey never spoils — archaeologists found 3000-year-old honey that was still edible.',
            'Octopuses have three hearts.',
            'A day on Venus is longer than a year on Venus.',
            'Sharks existed before trees.',
            'The first computer bug was an actual moth stuck in a relay.',
        ];
        await safeSend(sock, from, msg, `📚 *Did you know?*\n${pick(facts)}`);
    } catch (e) {
        await safeSend(sock, from, msg, '❌ Could not fetch a fact right now.');
    }
}

// .truth
async function truth(sock, from, msg) {
    try {
        const truths = [
            'What\'s the most embarrassing thing you\'ve ever done?',
            'What\'s a secret you\'ve never told anyone in this chat?',
            'What\'s the pettiest reason you\'ve ever been mad at someone?',
            'What\'s your most irrational fear?',
            'What\'s the last lie you told?',
            'What\'s a habit you\'re trying to break?',
        ];
        await safeSend(sock, from, msg, `❓ *Truth:* ${pick(truths)}`);
    } catch (e) {
        await safeSend(sock, from, msg, '❌ Could not fetch a truth question right now.');
    }
}

// .dare
async function dare(sock, from, msg) {
    try {
        const dares = [
            'Send the last photo in your gallery to the group (safe for work only!).',
            'Text someone "I found your diary" and post their reaction.',
            'Type your next 3 messages using only emojis.',
            'Change your profile status to something silly for 10 minutes.',
            'Message the group your most-used emoji 10 times in a row.',
            'Compliment the last person who messaged in this chat.',
        ];
        await safeSend(sock, from, msg, `🎯 *Dare:* ${pick(dares)}`);
    } catch (e) {
        await safeSend(sock, from, msg, '❌ Could not fetch a dare right now.');
    }
}

// .8ball <question>
async function eightball(sock, from, msg, args) {
    try {
        const question = (args || []).join(' ').trim();
        if (!question) {
            return await safeSend(sock, from, msg, '❌ Ask a question! Example: `.8ball Will it rain today?`');
        }
        const answers = [
            'Yes, definitely.', 'It is certain.', 'Without a doubt.', 'Ask again later.',
            'Cannot predict now.', 'Don\'t count on it.', 'My sources say no.', 'Very doubtful.',
            'Signs point to yes.', 'Outlook not so good.', 'Most likely.',
        ];
        await safeSend(sock, from, msg, `🎱 *Question:* ${question}\n*Answer:* ${pick(answers)}`);
    } catch (e) {
        await safeSend(sock, from, msg, '❌ Could not consult the magic 8-ball right now.');
    }
}

module.exports = {
    kiss, hug, love, slap, pat, highfive,
    wife, ship, rate, roast,
    joke, fact, truth, dare, eightball,
};
