// Minimal, dependency-free arithmetic evaluator.
// Deliberately does NOT use eval()/Function() to avoid executing arbitrary
// code from user input. Supports + - * / % ^ (power), parentheses,
// decimals, and unary +/-.

class CalcError extends Error {}

function tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
        const c = expr[i];
        if (/\s/.test(c)) { i++; continue; }
        if (/[0-9.]/.test(c)) {
            let num = '';
            while (i < expr.length && /[0-9.]/.test(expr[i])) { num += expr[i]; i++; }
            if ((num.match(/\./g) || []).length > 1) throw new CalcError('Invalid number format.');
            tokens.push({ type: 'num', value: parseFloat(num) });
            continue;
        }
        if ('+-*/%^()'.includes(c)) {
            tokens.push({ type: 'op', value: c });
            i++;
            continue;
        }
        throw new CalcError(`Unexpected character: "${c}"`);
    }
    return tokens;
}

function parse(tokens) {
    let pos = 0;
    const peek = () => tokens[pos];
    const next = () => tokens[pos++];

    function parseExpression() {
        let left = parseTerm();
        while (peek() && (peek().value === '+' || peek().value === '-')) {
            const op = next().value;
            const right = parseTerm();
            left = op === '+' ? left + right : left - right;
        }
        return left;
    }

    function parseTerm() {
        let left = parsePower();
        while (peek() && (peek().value === '*' || peek().value === '/' || peek().value === '%')) {
            const op = next().value;
            const right = parsePower();
            if (op === '*') left = left * right;
            else if (op === '/') {
                if (right === 0) throw new CalcError('Division by zero.');
                left = left / right;
            } else {
                if (right === 0) throw new CalcError('Division by zero.');
                left = left % right;
            }
        }
        return left;
    }

    function parsePower() {
        let left = parseUnary();
        if (peek() && peek().value === '^') {
            next();
            const right = parsePower(); // right-associative
            left = Math.pow(left, right);
        }
        return left;
    }

    function parseUnary() {
        if (peek() && (peek().value === '+' || peek().value === '-')) {
            const op = next().value;
            const val = parseUnary();
            return op === '-' ? -val : val;
        }
        return parseAtom();
    }

    function parseAtom() {
        const token = peek();
        if (!token) throw new CalcError('Unexpected end of expression.');
        if (token.type === 'num') {
            next();
            return token.value;
        }
        if (token.value === '(') {
            next();
            const val = parseExpression();
            if (!peek() || peek().value !== ')') throw new CalcError('Missing closing parenthesis.');
            next();
            return val;
        }
        throw new CalcError(`Unexpected token: "${token.value}"`);
    }

    const result = parseExpression();
    if (pos !== tokens.length) throw new CalcError('Unexpected trailing characters.');
    return result;
}

/**
 * Evaluates a plain arithmetic expression string.
 * Throws CalcError with a human-readable message on invalid input.
 */
function evaluate(expr) {
    if (!expr || typeof expr !== 'string') throw new CalcError('No expression provided.');
    const tokens = tokenize(expr);
    if (!tokens.length) throw new CalcError('No expression provided.');
    const result = parse(tokens);
    if (!Number.isFinite(result)) throw new CalcError('Result is not a finite number.');
    return result;
}

module.exports = { evaluate, CalcError };
