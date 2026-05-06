/* ====== TEMA DÍA/NOCHE ====== */
(function initTheme() {
  const STORAGE_KEY = 'calc-theme';
  const saved = localStorage.getItem(STORAGE_KEY);
  let theme;

  if (saved === 'light' || saved === 'dark') {
    theme = saved;
  } else {
    // Fallback a prefers-color-scheme
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    theme = prefersLight ? 'light' : 'dark';
  }

  applyTheme(theme);

  document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const current = document.body.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        applyTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
      });
    }
  });

  function applyTheme(t) {
    if (t === 'light') {
      document.body.setAttribute('data-theme', 'light');
    } else {
      document.body.removeAttribute('data-theme');
    }
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = t === 'light' ? '☀️' : '🌙';
  }
})();

/* ====== CALCULADORA ====== */
(function initCalculator() {
  let expression = '';
  let lastResult = null;

  const outputEl = () => document.getElementById('output');
  const historyEl = () => document.getElementById('history');

  function render() {
    const out = outputEl();
    const hist = historyEl();
    if (out) out.textContent = expression || '0';
    if (hist && lastResult !== null) hist.textContent = lastResult;
  }

  function clearAll() {
    expression = '';
    lastResult = null;
    const hist = historyEl();
    if (hist) hist.textContent = '';
    render();
  }

  function backspace() {
    // Si el último token es una función tipo "sin(", borrar todo el token
    const funcMatch = expression.match(/(sin|cos|tan|log|ln|sqrt)\($/);
    if (funcMatch) {
      expression = expression.slice(0, -funcMatch[0].length);
    } else {
      expression = expression.slice(0, -1);
    }
    render();
  }

  function appendNum(n) {
    expression += n;
    render();
  }

  function appendDot() {
    // Evitar dobles puntos en el número actual
    const parts = expression.split(/[+\-*/^()]/);
    const last = parts[parts.length - 1];
    if (last.includes('.')) return;
    if (last === '') expression += '0';
    expression += '.';
    render();
  }

  function appendOp(op) {
    if (expression === '' && op === '-') {
      expression = '-';
      render();
      return;
    }
    if (expression === '') return;
    const lastChar = expression.slice(-1);
    if ('+-*/^'.includes(lastChar)) {
      expression = expression.slice(0, -1) + op;
    } else {
      expression += op;
    }
    render();
  }

  function appendParen(p) {
    expression += p;
    render();
  }

  function appendFunc(fn) {
    expression += fn + '(';
    render();
  }

  function appendConst(c) {
    if (c === 'pi') expression += String(Math.PI);
    else if (c === 'e') expression += String(Math.E);
    render();
  }

  function applySquare() {
    expression += '^2';
    render();
  }

  function applyPower() {
    expression += '^';
    render();
  }

  function applySqrt() {
    expression += 'sqrt(';
    render();
  }

  function applyFactorial() {
    // Calcular factorial del último número
    const match = expression.match(/(\d+(?:\.\d+)?)$/);
    if (!match) return;
    const num = parseFloat(match[1]);
    if (!Number.isInteger(num) || num < 0 || num > 170) {
      lastResult = 'Error: factorial inválido';
      render();
      return;
    }
    let f = 1;
    for (let i = 2; i <= num; i++) f *= i;
    expression = expression.slice(0, -match[1].length) + String(f);
    render();
  }

  /* ====== PARSER (sin eval) ======
     Algoritmo Shunting-Yard + evaluación de RPN.
     Soporta: + - * / ^ , paréntesis, funciones sin/cos/tan/log/ln/sqrt, números. */

  const FUNCTIONS = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    log: Math.log10,
    ln: Math.log,
    sqrt: Math.sqrt,
  };

  const OPERATORS = {
    '+': { prec: 1, assoc: 'L', fn: (a, b) => a + b },
    '-': { prec: 1, assoc: 'L', fn: (a, b) => a - b },
    '*': { prec: 2, assoc: 'L', fn: (a, b) => a * b },
    '/': { prec: 2, assoc: 'L', fn: (a, b) => a / b },
    '^': { prec: 4, assoc: 'R', fn: (a, b) => Math.pow(a, b) },
  };

  function tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
      const c = expr[i];
      if (c === ' ') { i++; continue; }

      // Número
      if (/[0-9.]/.test(c)) {
        let num = '';
        while (i < expr.length && /[0-9.]/.test(expr[i])) {
          num += expr[i];
          i++;
        }
        tokens.push({ type: 'num', value: parseFloat(num) });
        continue;
      }

      // Función o identificador
      if (/[a-zA-Z]/.test(c)) {
        let id = '';
        while (i < expr.length && /[a-zA-Z]/.test(expr[i])) {
          id += expr[i];
          i++;
        }
        if (FUNCTIONS[id]) {
          tokens.push({ type: 'func', value: id });
        } else {
          throw new Error('Identificador desconocido: ' + id);
        }
        continue;
      }

      // Operadores
      if ('+-*/^'.includes(c)) {
        // Detectar unario menos / más
        const prev = tokens[tokens.length - 1];
        if ((c === '-' || c === '+') &&
            (!prev || prev.type === 'op' || prev.type === 'lparen' || prev.type === 'func')) {
          // Unario: convertir a (0 - x) usando truco: emitir 0 y operador
          tokens.push({ type: 'num', value: 0 });
          tokens.push({ type: 'op', value: c });
          i++;
          continue;
        }
        tokens.push({ type: 'op', value: c });
        i++;
        continue;
      }

      if (c === '(') { tokens.push({ type: 'lparen' }); i++; continue; }
      if (c === ')') { tokens.push({ type: 'rparen' }); i++; continue; }

      throw new Error('Carácter inválido: ' + c);
    }
    return tokens;
  }

  function toRPN(tokens) {
    const output = [];
    const stack = [];
    for (const t of tokens) {
      if (t.type === 'num') output.push(t);
      else if (t.type === 'func') stack.push(t);
      else if (t.type === 'op') {
        while (stack.length) {
          const top = stack[stack.length - 1];
          if (top.type === 'func') {
            output.push(stack.pop());
          } else if (top.type === 'op') {
            const o1 = OPERATORS[t.value];
            const o2 = OPERATORS[top.value];
            if ((o1.assoc === 'L' && o1.prec <= o2.prec) ||
                (o1.assoc === 'R' && o1.prec < o2.prec)) {
              output.push(stack.pop());
            } else break;
          } else break;
        }
        stack.push(t);
      } else if (t.type === 'lparen') {
        stack.push(t);
      } else if (t.type === 'rparen') {
        while (stack.length && stack[stack.length - 1].type !== 'lparen') {
          output.push(stack.pop());
        }
        if (!stack.length) throw new Error('Paréntesis desbalanceados');
        stack.pop(); // descartar lparen
        if (stack.length && stack[stack.length - 1].type === 'func') {
          output.push(stack.pop());
        }
      }
    }
    while (stack.length) {
      const top = stack.pop();
      if (top.type === 'lparen' || top.type === 'rparen') {
        throw new Error('Paréntesis desbalanceados');
      }
      output.push(top);
    }
    return output;
  }

  function evalRPN(rpn) {
    const stack = [];
    for (const t of rpn) {
      if (t.type === 'num') stack.push(t.value);
      else if (t.type === 'op') {
        const b = stack.pop();
        const a = stack.pop();
        if (a === undefined || b === undefined) throw new Error('Expresión inválida');
        stack.push(OPERATORS[t.value].fn(a, b));
      } else if (t.type === 'func') {
        const a = stack.pop();
        if (a === undefined) throw new Error('Argumento faltante');
        stack.push(FUNCTIONS[t.value](a));
      }
    }
    if (stack.length !== 1) throw new Error('Expresión inválida');
    return stack[0];
  }

  function evaluate() {
    if (!expression) return;
    try {
      const tokens = tokenize(expression);
      const rpn = toRPN(tokens);
      const result = evalRPN(rpn);
      if (!isFinite(result)) throw new Error('Resultado no finito');
      lastResult = expression + ' =';
      // Redondear flotantes con tolerancia
      const rounded = Math.round(result * 1e12) / 1e12;
      expression = String(rounded);
      render();
    } catch (err) {
      lastResult = 'Error';
      const hist = historyEl();
      if (hist) hist.textContent = 'Error: ' + err.message;
      const out = outputEl();
      if (out) out.textContent = '0';
      expression = '';
    }
  }

  /* ====== EVENT LISTENERS ====== */
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.key').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        switch (action) {
          case 'num': appendNum(btn.dataset.num); break;
          case 'dot': appendDot(); break;
          case 'op': appendOp(btn.dataset.op); break;
          case 'paren': appendParen(btn.dataset.paren); break;
          case 'func': appendFunc(btn.dataset.func); break;
          case 'const': appendConst(btn.dataset.const); break;
          case 'square': applySquare(); break;
          case 'power': applyPower(); break;
          case 'sqrt': applySqrt(); break;
          case 'factorial': applyFactorial(); break;
          case 'clear': clearAll(); break;
          case 'backspace': backspace(); break;
          case 'equals': evaluate(); break;
        }
      });
    });

    // Soporte teclado
    document.addEventListener('keydown', (e) => {
      const k = e.key;
      if (/[0-9]/.test(k)) appendNum(k);
      else if (k === '.') appendDot();
      else if ('+-*/^'.includes(k)) appendOp(k);
      else if (k === '(' || k === ')') appendParen(k);
      else if (k === 'Enter' || k === '=') { e.preventDefault(); evaluate(); }
      else if (k === 'Backspace') backspace();
      else if (k === 'Escape') clearAll();
    });

    render();
  });
})();
