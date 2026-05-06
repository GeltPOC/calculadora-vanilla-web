(function () {
    'use strict';

    const display = document.getElementById('display');
    const history = document.getElementById('history');
    const toggleBtn = document.getElementById('toggleScientific');
    const sciPanel = document.getElementById('scientificPanel');

    let current = '';
    let justEvaluated = false;

    function updateDisplay() {
        display.value = current === '' ? '0' : current;
    }

    function clearAll() {
        current = '';
        history.textContent = '';
        updateDisplay();
    }

    function backspace() {
        if (justEvaluated) {
            clearAll();
            return;
        }
        // Remove function names entirely if at end
        const funcs = ['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'sqrt(', 'pi'];
        for (const f of funcs) {
            if (current.endsWith(f)) {
                current = current.slice(0, -f.length);
                updateDisplay();
                return;
            }
        }
        current = current.slice(0, -1);
        updateDisplay();
    }

    function append(value) {
        if (justEvaluated) {
            // If operator, continue with result; if number/func, restart
            if (/[+\-*/^%)]/.test(value)) {
                // keep current
            } else {
                current = '';
            }
            justEvaluated = false;
        }
        current += value;
        updateDisplay();
    }

    function applyFunc(funcText) {
        if (justEvaluated) {
            current = '';
            justEvaluated = false;
        }
        current += funcText;
        updateDisplay();
    }

    function squareCurrent() {
        if (current === '') return;
        current = '(' + current + ')^2';
        updateDisplay();
    }

    function factorialCurrent() {
        if (current === '') return;
        try {
            const val = evaluate(current);
            const result = factorial(val);
            history.textContent = current + '! =';
            current = formatResult(result);
            justEvaluated = true;
            updateDisplay();
        } catch (e) {
            display.value = 'Error: ' + e.message;
            current = '';
            justEvaluated = true;
        }
    }

    function factorial(n) {
        if (!Number.isInteger(n)) throw new Error('Factorial requiere entero');
        if (n < 0) throw new Error('Factorial negativo');
        if (n > 170) throw new Error('Factorial muy grande');
        if (n === 0 || n === 1) return 1;
        let r = 1;
        for (let i = 2; i <= n; i++) r *= i;
        return r;
    }

    function formatResult(num) {
        if (!isFinite(num)) throw new Error('Resultado infinito');
        if (Number.isInteger(num)) return num.toString();
        return parseFloat(num.toFixed(10)).toString();
    }

    // ===== PARSER =====
    // Tokenize and evaluate expressions with precedence
    function evaluate(expr) {
        if (!expr || expr.trim() === '') throw new Error('Vacío');

        // Replace constants
        let s = expr.replace(/pi/g, '(' + Math.PI + ')')
                    .replace(/(?<![a-zA-Z0-9_.])e(?![a-zA-Z0-9_(])/g, '(' + Math.E + ')');

        const tokens = tokenize(s);
        const parser = new Parser(tokens);
        const result = parser.parseExpression();
        if (!parser.atEnd()) throw new Error('Sintaxis');
        return result;
    }

    function tokenize(s) {
        const tokens = [];
        let i = 0;
        while (i < s.length) {
            const c = s[i];
            if (c === ' ') { i++; continue; }
            if (/[0-9.]/.test(c)) {
                let num = '';
                while (i < s.length && /[0-9.]/.test(s[i])) { num += s[i]; i++; }
                tokens.push({ type: 'num', value: parseFloat(num) });
                continue;
            }
            if (/[a-zA-Z]/.test(c)) {
                let name = '';
                while (i < s.length && /[a-zA-Z]/.test(s[i])) { name += s[i]; i++; }
                tokens.push({ type: 'func', value: name });
                continue;
            }
            if ('+-*/^%()'.indexOf(c) !== -1) {
                tokens.push({ type: 'op', value: c });
                i++;
                continue;
            }
            throw new Error('Carácter inválido: ' + c);
        }
        return tokens;
    }

    class Parser {
        constructor(tokens) {
            this.tokens = tokens;
            this.pos = 0;
        }
        peek() { return this.tokens[this.pos]; }
        consume() { return this.tokens[this.pos++]; }
        atEnd() { return this.pos >= this.tokens.length; }

        // Expression: term (('+'|'-') term)*
        parseExpression() {
            let left = this.parseTerm();
            while (!this.atEnd()) {
                const t = this.peek();
                if (t.type === 'op' && (t.value === '+' || t.value === '-')) {
                    this.consume();
                    const right = this.parseTerm();
                    left = t.value === '+' ? left + right : left - right;
                } else break;
            }
            return left;
        }

        // Term: factor (('*'|'/'|'%') factor)*
        parseTerm() {
            let left = this.parseFactor();
            while (!this.atEnd()) {
                const t = this.peek();
                if (t.type === 'op' && (t.value === '*' || t.value === '/' || t.value === '%')) {
                    this.consume();
                    const right = this.parseFactor();
                    if (t.value === '*') left = left * right;
                    else if (t.value === '/') {
                        if (right === 0) throw new Error('División por cero');
                        left = left / right;
                    } else left = left % right;
                } else break;
            }
            return left;
        }

        // Factor: power ('^' factor)?  (right-assoc)
        parseFactor() {
            const base = this.parseUnary();
            if (!this.atEnd()) {
                const t = this.peek();
                if (t.type === 'op' && t.value === '^') {
                    this.consume();
                    const exp = this.parseFactor();
                    return Math.pow(base, exp);
                }
            }
            return base;
        }

        // Unary: ('+'|'-') unary | primary
        parseUnary() {
            const t = this.peek();
            if (t && t.type === 'op' && (t.value === '+' || t.value === '-')) {
                this.consume();
                const v = this.parseUnary();
                return t.value === '-' ? -v : v;
            }
            return this.parsePrimary();
        }

        // Primary: number | '(' expr ')' | func '(' expr ')'
        parsePrimary() {
            if (this.atEnd()) throw new Error('Expresión incompleta');
            const t = this.consume();
            if (t.type === 'num') return t.value;
            if (t.type === 'op' && t.value === '(') {
                const v = this.parseExpression();
                const next = this.consume();
                if (!next || next.value !== ')') throw new Error('Paréntesis desbalanceado');
                return v;
            }
            if (t.type === 'func') {
                const next = this.consume();
                if (!next || next.value !== '(') throw new Error('Falta ( tras ' + t.value);
                const arg = this.parseExpression();
                const close = this.consume();
                if (!close || close.value !== ')') throw new Error('Paréntesis desbalanceado');
                return applyFunction(t.value, arg);
            }
            throw new Error('Token inesperado');
        }
    }

    function applyFunction(name, x) {
        switch (name) {
            case 'sin': return Math.sin(x);
            case 'cos': return Math.cos(x);
            case 'tan': return Math.tan(x);
            case 'log': return Math.log10(x);
            case 'ln': return Math.log(x);
            case 'sqrt':
                if (x < 0) throw new Error('Raíz de negativo');
                return Math.sqrt(x);
            default: throw new Error('Función desconocida: ' + name);
        }
    }

    function calculate() {
        if (current === '') return;
        try {
            const result = evaluate(current);
            const formatted = formatResult(result);
            history.textContent = current + ' =';
            current = formatted;
            justEvaluated = true;
            updateDisplay();
        } catch (e) {
            display.value = 'Error: ' + e.message;
            current = '';
            justEvaluated = true;
        }
    }

    // ===== EVENT HANDLERS =====
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            const value = btn.dataset.value;
            switch (action) {
                case 'append': append(value); break;
                case 'clear': clearAll(); break;
                case 'backspace': backspace(); break;
                case 'equals': calculate(); break;
                case 'func': applyFunc(value); break;
                case 'square': squareCurrent(); break;
                case 'factorial': factorialCurrent(); break;
            }
        });
    });

    toggleBtn.addEventListener('click', () => {
        sciPanel.classList.toggle('hidden');
        toggleBtn.classList.toggle('active');
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        const k = e.key;
        if (/[0-9.+\-*/%()^]/.test(k)) {
            e.preventDefault();
            append(k);
        } else if (k === 'Enter' || k === '=') {
            e.preventDefault();
            calculate();
        } else if (k === 'Backspace') {
            e.preventDefault();
            backspace();
        } else if (k === 'Escape') {
            e.preventDefault();
            clearAll();
        }
    });

    updateDisplay();
})();
