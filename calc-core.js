// calc-core.js
// Pure evaluation and sanitization functions. Works in browser and Node.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.calcCore = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function _normalizeVisualOperators(expr) {
    return expr.replace(/x|×/g, '*').replace(/÷/g, '/');
  }

  function sanitizeForEval(expr) {
    if (typeof expr !== 'string') return null;
    expr = _normalizeVisualOperators(expr);
    // Allow digits, decimal, parentheses, + - * / and spaces
    if (!/^[0-9+\-*/().\s]+$/.test(expr)) return null;
    return expr;
  }

  function evaluateExpressionString(expr) {
    const sanitized = sanitizeForEval(expr);
    if (sanitized === null) throw new Error('Invalid expression');
    // Evaluate using Function constructor
    // eslint-disable-next-line no-new-func
    const result = Function('return (' + sanitized + ')')();
    if (result === Infinity || result === -Infinity || Number.isNaN(result)) {
      throw new Error('Math error');
    }
    return result;
  }

  function formatResult(result) {
    if (typeof result === 'number' && !Number.isInteger(result)) {
      return Number(result.toPrecision(12)).toString();
    }
    return String(result);
  }

  return {
    sanitizeForEval: sanitizeForEval,
    evaluateExpressionString: evaluateExpressionString,
    formatResult: formatResult,
  };
});
