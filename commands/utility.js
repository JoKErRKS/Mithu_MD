// --- Safe arithmetic evaluator (no eval/Function — avoids code injection) ---
// Supports: + - * / % ^ ( ) unary minus, integers and decimals.
function evaluateExpression(expr) {
    if (expr.length > 200) throw new Error('Expression is too long.');

    const compact = expr.replace(/\s+/g, '');
    const tokens = compact.match(/(\d+(\.\d+)?|\+|-|\*|\/|%|\^|\(|\))/g);

    if (!tokens || tokens.join('') !== compact) {
        throw new Error('Only numbers and + - * / % ^ ( ) are allowed.');
    }
    if (tokens.length > 200) throw new Error('Expression is too long.');

    let pos = 0;
    const peek = () => tokens[pos];
    const next = () => tokens[pos++];

    function parseExpression() {
        let value = parseTerm();
        while (peek() === '+' || peek() === '-') {
            const op = next();
            const rhs = parseTerm();
            value = op === '+' ? value + rhs : value - rhs;
        }
        return value;
    }

    function parseTerm() {
        let value = parseFactor();
        while (peek() === '*' || peek() === '/' || peek() === '%') {
            const op = next();
            const rhs = parseFactor();
            if ((op === '/' || op === '%') && rhs === 0) throw new Error('Division by zero.');
            value = op === '*' ? value * rhs : op === '/' ? value / rhs : value % rhs;
        }
        return value;
    }

    function parseFactor() {
        const base = parseBase();
        if (peek() === '^') {
            next();
            const exponent = parseFactor(); // right-associative
            return Math.pow(base, exponent);
        }
        return base;
    }

    function parseBase() {
        if (peek() === '-') {
            next();
            return -parseBase();
        }
        if (peek() === '(') {
            next();
            const value = parseExpression();
            if (next() !== ')') throw new Error('Mismatched parentheses.');
            return value;
        }
        const token = next();
        if (token === undefined || isNaN(Number(token))) throw new Error('Invalid expression.');
        return Number(token);
    }

    const result = parseExpression();
    if (pos !== tokens.length) throw new Error('Invalid expression.');
    if (!isFinite(result)) throw new Error('Result is not a finite number.');
    return result;
}

// .calculator <expression>
async function calculator(sock, from, msg, args) {
    try {
        const expr = (args || []).join('');
        if (!expr) {
            return await sock.sendMessage(from, { text: '❌ Provide an expression.\nExample: `.calculator (2+3)*4`' }, { quoted: msg });
        }
        const result = evaluateExpression(expr);
        await sock.sendMessage(from, { text: `🧮 *Calculator*\n${expr} = *${result}*` }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ ${e.message || 'Invalid expression.'}` }, { quoted: msg });
    }
}

function safeFormat(date, options, timeZone) {
    try {
        return new Intl.DateTimeFormat('en-US', { ...options, timeZone }).format(date);
    } catch (e) {
        throw new Error('Invalid timezone. Example: `.time Asia/Karachi`, `.time UTC`, `.time America/New_York`');
    }
}

// .time [timezone]
async function time(sock, from, msg, args) {
    try {
        const tz = args?.[0] || 'Asia/Karachi';
        const formatted = safeFormat(new Date(), { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }, tz);
        await sock.sendMessage(from, { text: `🕐 *Current Time (${tz})*\n${formatted}` }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ ${e.message || 'Could not fetch time.'}` }, { quoted: msg });
    }
}

// .date [timezone]
async function date(sock, from, msg, args) {
    try {
        const tz = args?.[0] || 'Asia/Karachi';
        const formatted = safeFormat(new Date(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }, tz);
        await sock.sendMessage(from, { text: `📅 *Current Date (${tz})*\n${formatted}` }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: `❌ ${e.message || 'Could not fetch date.'}` }, { quoted: msg });
    }
}

module.exports = { calculator, time, date, evaluateExpression };
