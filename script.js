// Calculator logic
(function () {
  const display = document.querySelector('input[type="text"]');
  const buttons = Array.from(document.querySelectorAll('.buttons button'));
  const MAX_LENGTH = 24;
  const MAX_DIGITS = 20; // maximum numeric digits allowed on the display

  function isOperator(ch) {
    return ['+', '-', '*', '/', 'x', '×', '÷'].includes(ch);
  }

  // rely on calcCore.sanitizeForEval when evaluating

  function trimDisplay(text) {
    if (text.length <= MAX_LENGTH) return text;
    // try to shorten floats while preserving precision
    if (text.includes('.')) {
      // keep up to reasonable decimal places
      const n = Math.max(0, MAX_LENGTH - (text.split('.')[0].length + 1));
      return parseFloat(text).toFixed(n).slice(0, MAX_LENGTH);
    }
    return text.slice(0, MAX_LENGTH);
  }

  function updateDisplay(value) {
    let s = String(value);
    // If the display is a single number (no operators), enforce digit limit on results
    const hasOperator = /[+\-*/×÷]/.test(s);
    if (!hasOperator) {
      const digitCount = (s.match(/\d/g) || []).length;
      if (digitCount > MAX_DIGITS) {
        const num = Number(s);
        if (Number.isFinite(num)) {
          // Use significant digits up to MAX_DIGITS to keep numeric meaning
          s = Number(num.toPrecision(MAX_DIGITS)).toString();
        } else {
          // fallback: trim to MAX_LENGTH
          s = s.slice(0, MAX_LENGTH);
        }
      }
    }
    display.value = trimDisplay(s);
  }

  function appendValue(val) {
    const cur = display.value;
    if (cur === '0' && val !== '.' && !isOperator(val)) {
      updateDisplay(val);
      return;
    }

    // Prevent adding more numeric digits than MAX_DIGITS
    if (/^[0-9]$/.test(val)) {
      const digitCount = (cur === '0') ? 0 : (cur.match(/\d/g) || []).length;
      if (digitCount >= MAX_DIGITS) return; // ignore extra digits
    }

    // If we're appending an operator
    if (isOperator(val)) {
      // don't let display end with an operator (replace it instead)
      if (isOperator(cur.slice(-1))) {
        updateDisplay(cur.slice(0, -1) + val);
        return;
      }
    }

    // Decimal handling: only one decimal per number segment
    if (val === '.') {
      // find last operator to get current number segment
      const lastOpIdx = Math.max(
        cur.lastIndexOf('+'),
        cur.lastIndexOf('-'),
        cur.lastIndexOf('*'),
        cur.lastIndexOf('/'),
        cur.lastIndexOf('x'),
        cur.lastIndexOf('×')
      );
      const segment = cur.slice(lastOpIdx + 1);
      if (segment.includes('.')) return; // ignore additional decimals
    }

    updateDisplay(cur + val);
  }

  function backspace() {
    const cur = display.value;
    if (cur.length <= 1) return updateDisplay('0');
    updateDisplay(cur.slice(0, -1));
  }

  function allClear() {
    updateDisplay('0');
  }

  function evaluateExpression() {
    if (typeof calcCore === 'undefined') {
      updateDisplay('Error');
      return;
    }

    const expr = display.value.trim();
    try {
      const result = calcCore.evaluateExpressionString(expr);
      updateDisplay(calcCore.formatResult(result));
    } catch (e) {
      updateDisplay('Error');
    }
  }

  // Attach click handlers
  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const val = btn.textContent.trim();
      if (!val) return;

      if (val === 'AC' || btn.classList.contains('Clear')) {
        allClear();
        return;
      }

      if (val === 'DEL') {
        backspace();
        return;
      }

      if (val === '=') {
        evaluateExpression();
        return;
      }

      // map operator buttons to visual calculator symbols
      if (val === 'x' || val === '×') {
        appendValue('×');
        return;
      }
      if (val === '/') {
        // show division sign visually
        appendValue('÷');
        return;
      }

      // For other buttons (numbers, operators, decimal)
      appendValue(val);
    });
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    // Allow numbers
    if (/^[0-9]$/.test(key)) {
      appendValue(key);
      e.preventDefault();
      return;
    }

    if (key === '.' || key === ',') {
      appendValue('.');
      e.preventDefault();
      return;
    }

    if (key === 'Backspace') {
      backspace();
      e.preventDefault();
      return;
    }

    if (key === 'Escape') {
      allClear();
      e.preventDefault();
      return;
    }

    if (key === 'Enter' || key === '=') {
      evaluateExpression();
      e.preventDefault();
      return;
    }

    // Accept operator keys and show visual symbols for * and /
    if (['+', '-'].includes(key)) {
      appendValue(key);
      e.preventDefault();
      return;
    }

    if (key === '*' || key.toLowerCase() === 'x') {
      appendValue('×');
      e.preventDefault();
      return;
    }

    if (key === '/') {
      appendValue('÷');
      e.preventDefault();
      return;
    }
  });

  // Ensure input cannot be edited directly by user (optional)
  display.addEventListener('keydown', (e) => e.preventDefault());

  // Initial display
  updateDisplay(display.value || '0');
})();
