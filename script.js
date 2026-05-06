(function () {
  'use strict';

  const currentEl = document.getElementById('current');
  const historyEl = document.getElementById('history');
  const buttons = document.querySelectorAll('.btn');

  const state = {
    current: '0',
    previous: null,
    operator: null,
    justEvaluated: false,
  };

  function updateDisplay() {
    currentEl.textContent = formatNumber(state.current);
    if (state.previous !== null && state.operator) {
      historyEl.textContent = `${formatNumber(state.previous)} ${opSymbol(state.operator)}`;
    } else {
      historyEl.textContent = '';
    }
    document.querySelectorAll('.btn-operator').forEach((b) => b.classList.remove('active'));
    if (state.operator && state.previous !== null && state.justEvaluated === false && state.current === '0') {
      const activeBtn = document.querySelector(`.btn-operator[data-operator="${state.operator}"]`);
      if (activeBtn) activeBtn.classList.add('active');
    }
  }

  function formatNumber(value) {
    if (value === 'Error') return value;
    const str = String(value);
    if (str.includes('e')) return str;
    const [intPart, decPart] = str.split('.');
    const formatted = Number(intPart).toLocaleString('en-US');
    return decPart !== undefined ? `${formatted}.${decPart}` : formatted;
  }

  function opSymbol(op) {
    return { '+': '+', '-': '−', '*': '×', '/': '÷' }[op] || op;
  }

  function inputNumber(num) {
    if (state.current === 'Error' || state.justEvaluated) {
      state.current = num;
      state.justEvaluated = false;
      if (state.justEvaluated) {
        state.previous = null;
        state.operator = null;
      }
    } else if (state.current === '0') {
      state.current = num;
    } else {
      if (state.current.replace('-', '').replace('.', '').length >= 15) return;
      state.current += num;
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (state.current === 'Error') return;
    if (state.justEvaluated) {
      state.current = '0.';
      state.justEvaluated = false;
      state.previous = null;
      state.operator = null;
    } else if (!state.current.includes('.')) {
      state.current += '.';
    }
    updateDisplay();
  }

  function clearAll() {
    state.current = '0';
    state.previous = null;
    state.operator = null;
    state.justEvaluated = false;
    updateDisplay();
  }

  function backspace() {
    if (state.current === 'Error' || state.justEvaluated) {
      clearAll();
      return;
    }
    if (state.current.length <= 1 || (state.current.length === 2 && state.current.startsWith('-'))) {
      state.current = '0';
    } else {
      state.current = state.current.slice(0, -1);
    }
    updateDisplay();
  }

  function percent() {
    if (state.current === 'Error') return;
    const value = parseFloat(state.current) / 100;
    state.current = String(value);
    updateDisplay();
  }

  function compute(a, b, op) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/':
        if (b === 0) return 'Error';
        return a / b;
      default: return b;
    }
  }

  function roundResult(num) {
    if (typeof num !== 'number' || !isFinite(num)) return 'Error';
    return Math.round(num * 1e10) / 1e10;
  }

  function setOperator(op) {
    if (state.current === 'Error') return;
    const currentNum = parseFloat(state.current);

    if (state.previous !== null && state.operator && !state.justEvaluated && state.current !== '0') {
      const result = compute(state.previous, currentNum, state.operator);
      if (result === 'Error') {
        state.current = 'Error';
        state.previous = null;
        state.operator = null;
        updateDisplay();
        return;
      }
      state.previous = roundResult(result);
      state.current = '0';
    } else if (state.previous === null) {
      state.previous = currentNum;
      state.current = '0';
    } else if (state.justEvaluated) {
      state.previous = currentNum;
      state.current = '0';
      state.justEvaluated = false;
    }

    state.operator = op;
    updateDisplay();
  }

  function equals() {
    if (state.current === 'Error' || state.previous === null || !state.operator) return;
    const currentNum = state.current === '0' && state.justEvaluated ? state.previous : parseFloat(state.current);
    const a = state.previous;
    const b = state.current === '0' ? a : currentNum;
    const result = compute(a, b, state.operator);

    if (result === 'Error') {
      state.current = 'Error';
    } else {
      historyEl.textContent = `${formatNumber(a)} ${opSymbol(state.operator)} ${formatNumber(b)} =`;
      state.current = String(roundResult(result));
    }
    state.previous = null;
    state.operator = null;
    state.justEvaluated = true;
    currentEl.textContent = formatNumber(state.current);
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const num = btn.dataset.number;
      const op = btn.dataset.operator;
      const action = btn.dataset.action;
      if (num !== undefined) inputNumber(num);
      else if (op !== undefined) setOperator(op);
      else if (action === 'decimal') inputDecimal();
      else if (action === 'clear') clearAll();
      else if (action === 'backspace') backspace();
      else if (action === 'percent') percent();
      else if (action === 'equals') equals();
    });
  });

  document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (/^[0-9]$/.test(key)) { inputNumber(key); e.preventDefault(); }
    else if (key === '.' || key === ',') { inputDecimal(); e.preventDefault(); }
    else if (key === '+' || key === '-' || key === '*' || key === '/') { setOperator(key); e.preventDefault(); }
    else if (key === 'Enter' || key === '=') { equals(); e.preventDefault(); }
    else if (key === 'Escape') { clearAll(); e.preventDefault(); }
    else if (key === 'Backspace') { backspace(); e.preventDefault(); }
    else if (key === '%') { percent(); e.preventDefault(); }
  });

  updateDisplay();
})();
