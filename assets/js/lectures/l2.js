/* ==========================================================================
   Lecture 2 labs: elimination with matrices
   2.1 elimination stepper      2.2 elimination matrices
   2.3 permutation matrices     2.4 omni-wheel odometry
   ========================================================================== */
(function () {
  'use strict';
  var C = window.PlotColors, num = LA.num, fix = LA.fix, fmt = LA.fmt;
  var VARS = ['x', 'y', 'z'], COUNT = ['no', 'one', 'two', 'three'];
  function slot(root, name) { return root.querySelector('[data-slot="' + name + '"]'); }
  /* an upright number (or short expression) inside running text, optionally in a series colour */
  function mu(html, c) { return '<span class="m u' + (c ? ' c' + c : '') + '">' + html + '</span>'; }
  function sub(i, j) { return '<sub>' + (i + 1) + (j + 1) + '</sub>'; }
  function augment(M, rhs) { return M.map(function (r, i) { return r.concat([rhs[i]]); }); }
  /* brackets around negatives and fractions so that products read cleanly */
  function par(v, f) { var s = (f || fmt)(v); return (v < 0 || s.indexOf('/') >= 0) ? '(' + s + ')' : s; }
  /* one row written out in running text: [3  8  1 | 12] */
  function rowText(row, rhs, f, c) {
    f = f || fmt;
    var body = row.map(function (v) { return f(v); }).join('&nbsp;&nbsp;');
    if (rhs !== undefined && rhs !== null) body += '&nbsp;|&nbsp;' + f(rhs);
    return mu('[' + body + ']', c);
  }
  /* "Row 2 − 3 × Row 1", written with a plus sign when the multiplier is negative */
  function opWords(i, k, l, f) {
    var a = Math.abs(l);
    return 'Row ' + (i + 1) + (l < 0 ? ' + ' : ' − ') + (Math.abs(a - 1) < 1e-9 ? '' : (f || fmt)(a) + ' × ') + 'Row ' + (k + 1);
  }
  /* a row of U read back as an equation: 2y − 2z = 6 */
  function equation(row, rhs, names, f) {
    f = f || fmt;
    var out = '', first = true;
    row.forEach(function (a, j) {
      if (LA.isZero(a)) return;
      var mag = Math.abs(a), coef = Math.abs(mag - 1) < 1e-9 ? '' : f(mag);
      out += (first ? (a < 0 ? '−' : '') : (a < 0 ? ' − ' : ' + ')) + coef + '<i>' + names[j] + '</i>';
      first = false;
    });
    return mu((first ? '0' : out) + ' = ' + f(rhs));
  }

  /* ------------------------------------------------------------------ 2.1 */
  UI.lab('lab-elim', function (root) {
    var CASES = {
      lecture: [[1, 2, 1, 2], [3, 8, 1, 12], [0, 4, 1, 2]],
      swap: [[1, 2, 1, 2], [3, 6, 1, 12], [0, 4, 1, 2]],
      singular: [[1, 2, 1, 2], [3, 8, 1, 12], [0, 4, -4, 2]]
    };
    var n = 3, res = null, A0 = null, b0 = null, quiet = false, stepper = null;
    var status = slot(root, 'status');
    var out = UI.readouts(slot(root, 'readouts'), [
      { k: 'pivots so far', id: 'piv', c: 1 }, { k: 'multipliers so far', id: 'mul' }, { k: 'solution so far', id: 'sol', c: 3 }]);

    function title(s) {
      switch (s.kind) {
        case 'start': return 'Start · the augmented matrix [ A | b ]';
        case 'pivot': return 'Pivot ' + (s.k + 1);
        case 'elim': return opWords(s.i, s.k, s.mult);
        case 'skip': return 'Row ' + (s.i + 1) + ' · nothing to remove';
        case 'swap': return 'Exchange rows ' + (s.i + 1) + ' and ' + (s.j + 1);
        case 'fail': return 'Elimination stops';
        case 'upper': return 'Upper triangular · [ U | c ]';
        case 'back': return 'Back-substitution · row ' + (s.i + 1) + ' gives ' + VARS[s.i];
        case 'done': return 'Solved · check the answer';
      }
      return '';
    }

    function render(s, idx) {
      var prev = idx > 0 ? res.steps[idx - 1] : s, j, text = '', side = '';
      var o = { aug: 1, cls: 'lg', pivots: [], rows: {}, cells: {} };
      for (j = 0; j < s.pivots.length; j++) o.pivots.push([j, j]);

      if (s.kind === 'start') {
        text = 'Three equations written as one table. Each row is one equation. The numbers before the bar are the coefficients of <i>x</i>, <i>y</i> and <i>z</i>, and the number after the bar is the right-hand side. Every move from here on is done to a <b>whole row</b>, bar and all.';
      } else if (s.kind === 'pivot') {
        text = '<b>Pivot ' + (s.k + 1) + ' is ' + fmt(s.M[s.k][s.k]) + '.</b> It sits in row ' + (s.k + 1) + ', column ' + (s.k + 1) + '. ' +
          (s.k === n - 1 ? 'No row lies below it, so there is nothing left to clear.' : 'Its job is to clear every entry below it in column ' + (s.k + 1) + '.');
      } else if (s.kind === 'elim') {
        o.rows[s.k] = 'h2'; o.rows[s.i] = 'h3';
        var ec = {}; ec[s.i + ',' + s.k] = 'h3';
        side = UI.mx(s.E, { cells: ec, cap: 'E' + sub(s.i, s.k) + ' · this step as a matrix' });
        text = '<b>' + opWords(s.i, s.k, s.mult) + '.</b> The multiplier is ' + mu(fmt(s.mult)) + ': the entry to remove, ' + mu(fmt(prev.M[s.i][s.k])) +
          ', divided by the pivot, ' + mu(fmt(s.M[s.k][s.k])) + '. Row ' + (s.i + 1) + ' was ' + rowText(prev.M[s.i], prev.rhs[s.i]) +
          '. Subtract ' + mu(par(s.mult)) + ' × ' + rowText(s.M[s.k], s.rhs[s.k], null, 2) + ' and ' + rowText(s.M[s.i], s.rhs[s.i], null, 3) + ' is left.';
      } else if (s.kind === 'skip') {
        o.rows[s.k] = 'h2'; o.cells[s.i + ',' + s.k] = 'h3';
        side = UI.mx(LA.identity(n), { cap: 'E' + sub(s.i, s.k) + ' · changes nothing', dim: function (a, b) { return a !== b; } });
        text = '<b>Row ' + (s.i + 1) + ' needs no work.</b> Its entry under the pivot is already ' + mu('0') + ', so the multiplier is ' + mu('0') + ' and the step is skipped.';
      } else if (s.kind === 'swap') {
        o.rows[s.i] = 'h3'; o.rows[s.j] = 'h3';
        side = UI.mx(s.E, { cap: 'P' + sub(s.i, s.j) + ' · this step as a matrix', dim: function (a, b) { return !s.E[a][b]; } });
        text = '<b>Rows ' + (s.i + 1) + ' and ' + (s.j + 1) + ' have changed places.</b> The pivot position in row ' + (s.k + 1) + ', column ' + (s.k + 1) +
          ' held ' + mu('0') + ', and nobody can divide by zero. Row ' + (s.j + 1) + ' had a non-zero entry in that column, so it moved up. Equations may be listed in any order, so the solution is untouched.';
      } else if (s.kind === 'fail') {
        o.cells[s.k + ',' + s.k] = 'h1';
        text = '<b>Zero in pivot position ' + (s.k + 1) + '.</b> ' +
          (s.k === n - 1 ? 'No row lies below it, so there is nothing to exchange with.' : 'Every entry below it is zero as well, so no row exchange can help.') +
          ' Only ' + COUNT[s.pivots.length] + ' pivot' + (s.pivots.length === 1 ? ' was' : 's were') + ' found where three are needed. The matrix is <b>singular</b>.';
        if (s.k === n - 1) {
          text += LA.isZero(s.rhs[s.k])
            ? ' The last row reads ' + mu('0 = 0') + ', which is always true. One equation has vanished, so there are infinitely many solutions.'
            : ' The last row reads ' + mu('0 = ' + fmt(s.rhs[s.k])) + ', which no numbers can satisfy. This system has no solution.';
        } else {
          text += ' No remaining equation can pin down <i>' + VARS[s.k] + '</i>.';
        }
      } else if (s.kind === 'upper') {
        text = '<b>This is U.</b> Everything below the diagonal is zero, the shape called upper triangular. The pivots are ' +
          s.pivots.map(function (v) { return fmt(v); }).join(', ') + '. The right-hand side has turned from <b>b</b> into <b>c</b> = (' +
          s.rhs.map(function (v) { return fmt(v); }).join(', ') + '). Elimination is finished. The remaining steps solve this triangle from the bottom row up.';
      } else if (s.kind === 'back') {
        var r = s.i, known = 0, subs = [], xc = {};
        o.rows[r] = 'h3';
        for (j = r + 1; j < n; j++) if (!LA.isZero(s.M[r][j])) { known += s.M[r][j] * s.x[j]; subs.push('<i>' + VARS[j] + '</i> = ' + fmt(s.x[j])); }
        s.x.forEach(function (v, q) { if (v !== null) xc[q + ',0'] = 'h3'; });
        side = UI.mx(s.x.map(function (v) { return v === null ? '?' : v; }), { cells: xc, cap: 'x, y, z so far' });
        var lead = '<b>Row ' + (r + 1) + ' reads ' + equation(s.M[r], s.rhs[r], VARS) + '.</b> ';
        var one = Math.abs(s.M[r][r] - 1) < 1e-9, piv = fmt(s.M[r][r]);
        if (!subs.length) {
          text = lead + 'It holds a single unknown' + (one ? ', so ' : ', so divide by the pivot ' + mu(piv) + ': ') +
            mu('<i>' + VARS[r] + '</i> = ' + (one ? '' : fmt(s.rhs[r]) + ' ÷ ' + par(s.M[r][r]) + ' = ') + fmt(s.x[r])) + '.';
        } else {
          text = lead + 'Put in what is already known (' + mu(subs.join(', ')) + '). Those terms add up to ' + mu(fmt(known)) + ', which leaves ' +
            mu((one ? '' : piv) + '<i>' + VARS[r] + '</i> = ' + fmt(s.rhs[r]) + ' − ' + par(known) + ' = ' + fmt(s.rhs[r] - known)) +
            (one ? '.' : '. Divide by the pivot ' + mu(piv) + ': ' + mu('<i>' + VARS[r] + '</i> = ' + fmt(s.x[r])) + '.');
        }
      } else if (s.kind === 'done') {
        var check = A0[0].map(function (a, q) { return LA.isZero(a) ? null : par(a) + '·' + par(s.x[q]); }).filter(function (t) { return t; }).join(' + ');
        return UI.eq({ cls: 'left' },
            UI.mx(A0, { cls: 'lg', cap: 'A · original' }), UI.mx(s.x, { cls: 'lg', cols: { 0: 'h3' }, cap: 'x, y, z' }), '=', UI.mx(b0, { cls: 'lg', cap: 'b · original' })) +
          '<p class="step-text"><b>Solved:</b> ' + mu(s.x.map(function (v, q) { return '<i>' + VARS[q] + '</i> = ' + fmt(v); }).join(', ')) +
          '. Put the three numbers back into the original equations and every one comes out right. The first row, for instance: ' +
          mu((check || '0') + ' = ' + fmt(b0[0])) + '.</p>';
      }
      o.cap = s.kind === 'start' ? '[ A | b ]' : (s.kind === 'upper' || s.kind === 'back') ? '[ U | c ]' : s.kind === 'fail' ? 'stuck' : 'work in progress';
      var parts = [{ cls: 'left' }, UI.mx(augment(s.M, s.rhs), o)];
      if (side) parts.push(side);
      return UI.eq.apply(null, parts) + '<p class="step-text">' + text + '</p>';
    }

    function onStep(s, idx) {
      var mul = [], q, t;
      for (q = 0; q <= idx; q++) { t = res.steps[q]; if (t.kind === 'elim' || t.kind === 'skip') mul.push(fmt(t.mult)); }
      out.piv(s.pivots.length ? s.pivots.map(function (v) { return fmt(v); }).join(', ') : '–');
      out.mul(mul.length ? mul.join(', ') : '–');
      out.sol(s.x ? '(' + s.x.map(function (v) { return v === null ? '?' : fmt(v); }).join(', ') + ')' : '–');
    }

    function verdict() {
      var pv = res.pivots.map(function (v) { return fmt(v); }).join(', ');
      if (res.singular) {
        var f = res.steps[res.steps.length - 1];
        UI.status(status, 'bad', '<b>Permanent failure.</b> Pivot position ' + (f.k + 1) + ' holds a zero and no row below can replace it. This matrix is singular, so there is no single solution.');
      } else if (res.exchanges) {
        UI.status(status, 'hot', '<b>Temporary failure, cured by a row exchange.</b> A zero turned up in a pivot position, but a non-zero entry was waiting below it. Pivots ' + pv + ', one solution.');
      } else {
        UI.status(status, 'ok', '<b>Elimination runs straight through.</b> Three non-zero pivots (' + pv + ') and no row exchange, so there is exactly one solution.');
      }
    }

    function run(M) {
      A0 = M.map(function (r) { return r.slice(0, n); });
      b0 = M.map(function (r) { return r[n]; });
      res = LA.eliminate(A0, b0);
      verdict();
      if (stepper) stepper.setSteps(res.steps);
    }

    run(CASES.lecture);
    stepper = UI.stepper(slot(root, 'stepper'), { steps: res.steps, render: render, title: title, onStep: onStep, delay: 2600 });
    var seg = UI.seg(slot(root, 'presets'), {
      label: 'Example systems', value: 'lecture',
      options: [{ v: 'lecture', label: 'Lecture example' }, { v: 'swap', label: 'Needs a row exchange' }, { v: 'singular', label: 'Singular (fails)' }],
      onChange: function (v) { quiet = true; input.set(CASES[v]); quiet = false; }
    });
    var input = UI.mxInput(slot(root, 'input'), CASES.lecture, {
      aug: 1, id: 'elim', name: 'augmented matrix',
      onChange: function (M) { if (!quiet) seg.set('', false); run(M); }
    });
  });

  /* ------------------------------------------------------------------ 2.2 */
  UI.lab('lab-emat', function (root) {
    var A = [[1, 2, 1], [3, 8, 1], [0, 4, 1]], E32 = LA.elimMatrix(3, 2, 1, 2);
    var view = 'one', eq = slot(root, 'eq'), status = slot(root, 'status');
    var f = function (v) { return num(v); };
    var E21n = 'E<sub>21</sub>', E32n = 'E<sub>32</sub>';
    var sl = UI.slider(slot(root, 'slider'), {
      label: 'Multiplier <span class="nm">ℓ</span> &nbsp;written inside E<sub>21</sub>', min: 0, max: 5, step: 0.5, value: 3, k: 3,
      fmt: function (v) { return 'ℓ = ' + num(v); }, onInput: update
    });
    UI.seg(slot(root, 'view'), {
      label: 'What to show', value: 'one',
      options: [{ v: 'one', label: '1 · One step' }, { v: 'two', label: '2 · Both steps' }, { v: 'E', label: '3 · One matrix E' }, { v: 'order', label: '4 · Order test' }, { v: 'undo', label: '5 · Undo' }],
      onChange: function (v) { view = v; update(); }
    });
    /* tint every non-zero entry below the diagonal */
    function below(M, cls) {
      var c = {};
      M.forEach(function (r, i) { r.forEach(function (v, j) { if (i > j && !LA.isZero(v)) c[i + ',' + j] = cls; }); });
      return c;
    }
    function isUpper(M) { return !Object.keys(below(M, 'x')).length; }
    function one(cellKey, cls) { var c = {}; c[cellKey] = cls; return c; }

    function update() {
      var l = sl.get(), E21 = LA.elimMatrix(3, 1, 0, l), lec = Math.abs(l - 3) < 1e-9, ls = num(l);
      var M1 = LA.mul(E21, A), html = '';
      if (view === 'one') {
        var zero = LA.isZero(M1[1][0]);
        html = UI.eq({ cls: 'lg' },
          UI.mx(E21, { fmt: f, cells: { '1,0': 'h2', '1,1': 'h3' }, cap: E21n }),
          UI.mx(A, { rows: { 0: 'h2', 1: 'h3' }, cap: 'A' }), '=',
          UI.mx(M1, { fmt: f, rows: { 1: 'h3' }, cells: one('1,0', zero ? 'h4' : 'h1'), cap: E21n + ' A' })) +
          '<p class="step-text">Row 2 of the product = ' + mu(par(-l, f), 2) + ' × ' + rowText(A[0], null, f, 2) + ' + ' + mu('1', 3) + ' × ' +
          rowText(A[1], null, f, 3) + ' = ' + rowText(M1[1], null, f, 3) + '</p>';
        if (lec) UI.status(status, 'ok', '<b>ℓ = 3 clears the entry.</b> The (2,1) entry of the product is 3 − 3 × 1 = 0. This is the lecture\'s E<sub>21</sub>: the identity matrix with −3 in row 2, column 1. Three is the only value that works, because it is the entry to remove divided by the pivot, 3 ÷ 1.');
        else if (LA.isZero(l)) UI.status(status, '', '<b>ℓ = 0 turns E<sub>21</sub> into the identity matrix.</b> Nothing is subtracted, so the product is A itself and the 3 in position (2,1) is still there.');
        else UI.status(status, 'hot', '<b>Not zero yet.</b> With ℓ = ' + ls + ' the (2,1) entry is 3 − ' + ls + ' × 1 = ' + num(M1[1][0]) + ', so row 2 still contains <i>x</i>. Slide ℓ until that entry is 0.');
      } else if (view === 'two') {
        var U = LA.mul(E32, M1), up = isUpper(U);
        html = UI.eq({ cls: 'lg' },
          UI.mx(E32, { cells: { '2,1': 'h2', '2,2': 'h3' }, cap: E32n }),
          UI.mx(M1, { fmt: f, rows: { 1: 'h2', 2: 'h3' }, cap: E21n + ' A · after step one' }), '=',
          UI.mx(U, { fmt: f, rows: { 2: 'h3' }, cells: below(U, 'h1'), pivots: up ? [[0, 0], [1, 1], [2, 2]] : [], cap: up ? 'U · upper triangular' : 'not upper triangular' })) +
          '<p class="step-text">In symbols: ' + mu(E32n + ' (' + E21n + ' <i>A</i>) = ' + (up ? '<i>U</i>' : '?')) + '. The bracket is done first, so ' + mu(E21n) + ' acts before ' + mu(E32n) + '.</p>';
        if (up) UI.status(status, 'ok', '<b>Two matrices, one after the other, turn A into U.</b> E<sub>32</sub> subtracts 2 × row 2 from row 3 and clears position (3,2). The pivots 1, 2 and 5 are left on the diagonal.');
        else UI.status(status, 'hot', '<b>Step one did not finish its job.</b> E<sub>21</sub> was built with ℓ = ' + ls + ', so column 1 was never cleared and the red entries are left below the diagonal. Set ℓ back to 3.');
      } else if (view === 'E') {
        var E = LA.mul(E32, E21), U2 = LA.mul(E, A), up2 = isUpper(U2);
        html = UI.eq(
          UI.mx(E32, { cells: { '2,1': 'h2' }, cap: E32n }), UI.mx(E21, { fmt: f, cells: { '1,0': 'h2' }, cap: E21n }), '=',
          UI.mx(E, { fmt: f, cells: { '2,0': 'h3' }, cap: 'E = ' + E32n + ' ' + E21n })) +
          UI.eq(
          UI.mx(E, { fmt: f, cells: { '2,0': 'h3' }, cap: 'E' }), UI.mx(A, { cap: 'A' }), '=',
          UI.mx(U2, { fmt: f, cells: below(U2, 'h1'), pivots: up2 ? [[0, 0], [1, 1], [2, 2]] : [], cap: up2 ? 'U' : 'not upper triangular' }));
        var corner = 'The ' + num(2 * l) + ' in the corner is (−2) × (−' + ls + '): step two subtracts twice a row that step one had already changed.';
        if (lec) UI.status(status, 'ok', '<b>One matrix does the whole elimination.</b> (E<sub>32</sub> E<sub>21</sub>) A = E<sub>32</sub> (E<sub>21</sub> A). The brackets moved and the order stayed, which the associative law allows. ' + corner);
        else UI.status(status, 'hot', '<b>The brackets still move freely.</b> E<sub>32</sub> E<sub>21</sub> is one matrix for any ℓ. ' + (LA.isZero(l) ? '' : corner + ' ') + 'It only produces U when ℓ = 3.');
      } else if (view === 'order') {
        var X = LA.mul(E32, E21), Y = LA.mul(E21, E32), XA = LA.mul(X, A), YA = LA.mul(Y, A), same = LA.equal(X, Y), upX = isUpper(XA);
        html = UI.eq(
          UI.mx(X, { fmt: f, cells: { '2,0': 'h3' }, cap: E32n + ' ' + E21n + ' · step one acts first' }), same ? '=' : '≠',
          UI.mx(Y, { fmt: f, cells: { '2,0': same ? 'h3' : 'h1' }, cap: E21n + ' ' + E32n + ' · step two acts first' })) +
          UI.eq(
          UI.mx(XA, { fmt: f, cells: below(XA, 'h1'), pivots: upX ? [[0, 0], [1, 1], [2, 2]] : [], cap: '(' + E32n + ' ' + E21n + ') A' }), same ? '=' : '≠',
          UI.mx(YA, { fmt: f, cells: below(YA, 'h1'), pivots: isUpper(YA) ? [[0, 0], [1, 1], [2, 2]] : [], cap: '(' + E21n + ' ' + E32n + ') A' }));
        if (same) UI.status(status, 'ok', '<b>Equal, but only because ℓ = 0.</b> With ℓ = 0, E<sub>21</sub> is the identity matrix, and the identity may stand on either side of any matrix. Every other ℓ breaks the tie.');
        else UI.status(status, 'hot', '<b>Same two matrices, different products.</b> The corner entry is ' + num(2 * l) + ' in one order and 0 in the other. In the second order, step two runs first and uses the old row 2' +
          (lec ? ', so the result is not U.' : '.') + ' Matrix multiplication is not commutative: the order may not be swapped.');
      } else {
        var Einv = LA.elimMatrix(3, 1, 0, -l);
        html = UI.eq(
          UI.mx(Einv, { fmt: f, cells: { '1,0': 'h2' }, cap: E21n + '<sup>−1</sup> · adds' }),
          UI.mx(E21, { fmt: f, cells: { '1,0': 'h3' }, cap: E21n + ' · subtracts' }), '=',
          UI.mx(LA.mul(Einv, E21), { fmt: f, cap: 'I · identity' })) +
          UI.eq(
          UI.mx(Einv, { fmt: f, cells: { '1,0': 'h2' }, cap: E21n + '<sup>−1</sup>' }),
          UI.mx(M1, { fmt: f, rows: { 1: 'h3' }, cap: E21n + ' A' }), '=',
          UI.mx(LA.mul(Einv, M1), { fmt: f, rows: { 1: 'h3' }, cap: 'A · back again' }));
        UI.status(status, 'ok', '<b>E<sub>21</sub><sup>−1</sup> E<sub>21</sub> = I.</b> Subtract ' + ls + ' × row 1 from row 2, then add ' + ls + ' × row 1 back, and every row is as it was. The inverse of an elimination matrix is the same matrix with the sign of its multiplier flipped.');
      }
      eq.innerHTML = html;
    }
    update();
  });

  /* ------------------------------------------------------------------ 2.3 */
  UI.lab('lab-perm', function (root) {
    var A2 = [['a', 'b'], ['c', 'd']], A3 = [[1, 2, 1], [0, 0, -2], [0, 4, 1]];
    var TINT = ['h1', 'h2', 'h4'], KEY = ['k1', 'k2', 'k4'], ORD = ['first', 'second', 'third'];
    var side = 'left', size = 2, pair = [1, 2];
    var eq = slot(root, 'eq'), status = slot(root, 'status'), keys = slot(root, 'keys'), pairGroup = slot(root, 'pair-group');
    UI.seg(slot(root, 'side'), {
      label: 'Side on which P multiplies', value: 'left',
      options: [{ v: 'left', label: 'P · A &nbsp;(P on the left)' }, { v: 'right', label: 'A · P &nbsp;(P on the right)' }],
      onChange: function (v) { side = v; update(); }
    });
    UI.seg(slot(root, 'size'), {
      label: 'Matrix', value: '2',
      options: [{ v: '2', label: '2 by 2, from the lecture' }, { v: '3', label: '3 by 3, stuck in Lab 2.1' }],
      onChange: function (v) { size = parseInt(v, 10); update(); }
    });
    UI.seg(slot(root, 'pair'), {
      label: 'Which two does P exchange', value: '1-2',
      options: [{ v: '0-1', label: '1 and 2' }, { v: '0-2', label: '1 and 3' }, { v: '1-2', label: '2 and 3' }],
      onChange: function (v) { pair = v.split('-').map(Number); update(); }
    });

    function update() {
      var n = size, A = n === 2 ? A2 : A3, p = n === 2 ? [0, 1] : pair, perm = [], i;
      for (i = 0; i < n; i++) perm.push(i);
      perm[p[0]] = p[1]; perm[p[1]] = p[0];
      var P = LA.swapMatrix(n, p[0], p[1]);
      var Ad = A.map(function (r) { return r.map(function (v) { return typeof v === 'string' ? '<i>' + v + '</i>' : v; }); });
      var tint = {}, moved = {}, ones = {};
      for (i = 0; i < n; i++) { tint[i] = TINT[i]; moved[i] = TINT[perm[i]]; }
      P.forEach(function (r, a) { r.forEach(function (v, b) { if (v) ones[a + ',' + b] = 'h3'; }); });
      var Pm = UI.mx(P, { cells: ones, dim: function (a, b) { return !P[a][b]; }, cap: 'P · exchanges ' + (p[0] + 1) + ' and ' + (p[1] + 1) });
      var what = side === 'left' ? 'row' : 'column', a1 = p[0] + 1, a2 = p[1] + 1;
      pairGroup.hidden = n === 2;
      if (side === 'left') {
        var PA = perm.map(function (src) { return Ad[src]; });
        eq.innerHTML = UI.eq({ cls: 'lg' }, Pm, UI.mx(Ad, { rows: tint, cap: 'A' }), '=', UI.mx(PA, { rows: moved, cap: 'P A · rows exchanged' }));
        UI.status(status, 'ok', '<b>P on the left exchanges rows.</b> Read P one row at a time. Row ' + a1 + ' of P has its 1 in position ' + a2 + ', which says: take none of the other rows and one of row ' + a2 +
          '. So the new row ' + a1 + ' is the old row ' + a2 + ', and the other way round. The columns stay in order.' +
          (n === 3 && p[0] === 1 && p[1] === 2 ? ' This is the exchange that rescued elimination in Lab 2.1: the zero has left the pivot position.' : ''));
      } else {
        var AP = Ad.map(function (r) { return perm.map(function (src) { return r[src]; }); });
        eq.innerHTML = UI.eq({ cls: 'lg' }, UI.mx(Ad, { cols: tint, cap: 'A' }), Pm, '=', UI.mx(AP, { cols: moved, cap: 'A P · columns exchanged' }));
        UI.status(status, 'hot', '<b>P on the right exchanges columns.</b> Now read P one column at a time. Column ' + a1 + ' of P has its 1 in position ' + a2 + ', which says: take one of column ' + a2 +
          ' and none of the others. So the new column ' + a1 + ' is the old column ' + a2 + ', and the other way round. Every row keeps its place.' +
          (n === 3 ? ' In a system of equations this re-orders the unknowns: <i>' + VARS[p[0]] + '</i> and <i>' + VARS[p[1]] + '</i> have traded columns.' : ''));
      }
      keys.innerHTML = perm.map(function (_, q) { return '<span class="key ' + KEY[q] + '">' + ORD[q] + ' ' + what + ' of A</span>'; }).join('') + '<span class="key k3">the 1s of P</span>';
    }
    update();
  });

  /* ------------------------------------------------------------------ 2.4 */
  UI.lab('lab-omni', function (root) {
    var Rb = 0.2, D = Math.PI / 180, POS = Robots.OMNI3;
    function tangent(a) { return [-Math.sin(a), Math.cos(a)]; }
    function aim(deg) { return [Math.cos(deg * D), Math.sin(deg * D)]; }
    var LAYOUTS = {
      good: { omni: true, alphas: POS, dirs: POS.map(tangent) },
      swap: { omni: true, alphas: [0, 120 * D, 240 * D], dirs: [0, 120 * D, 240 * D].map(tangent) },
      fragile: { alphas: POS, dirs: [aim(0), aim(8), aim(-8)] },
      parallel: { alphas: POS, dirs: [aim(0), aim(0), aim(0)] }
    };
    /* one row per wheel. A wheel at (x, y) rolling along the unit direction d reads
         s = d . (velocity of its contact point) = d . (vx - w y, vy + w x)
       so its row is [ dx, dy, x dy - y dx ]. For a tangent wheel on a circle of radius Rb
       this is the standard omni row [ -sin a, cos a, Rb ] that Robots.omniMatrix builds. */
    function wheelMatrix(L) {
      if (L.omni) return LA.cleanM(Robots.omniMatrix(L.alphas, Rb));
      return LA.cleanM(L.alphas.map(function (a, i) {
        var x = Rb * Math.cos(a), y = Rb * Math.sin(a), d = L.dirs[i];
        return [d[0], d[1], x * d[1] - y * d[0]];
      }));
    }

    var layout = 'good', s = [-0.2, 0.25, 0.25], vel = null, r = null, A = null;
    var pose = { x: 0, y: 0, th: 0 }, trail = [], ghostT = 0;
    var canvas = root.querySelector('canvas');
    var plot = new Plot2D(canvas, { cx: 0, cy: 0, w: 2.1 });
    var status = slot(root, 'status'), eq = slot(root, 'eq'), ops = slot(root, 'ops'), sl = slot(root, 'sliders');
    var cl = [C.s1, C.s2, C.s4], f2 = function (v) { return fix(v, 2); };
    var out = UI.readouts(slot(root, 'readouts'), [
      { k: 'forward speed', id: 'vx', c: 3 }, { k: 'sideways speed', id: 'vy', c: 3 }, { k: 'turn rate', id: 'w', c: 3 },
      { k: 'odometry x', id: 'px' }, { k: 'odometry y', id: 'py' }, { k: 'heading', id: 'th' }]);
    var S = [0, 1, 2].map(function (i) {
      return UI.slider(sl, {
        label: 'Encoder ' + (i + 1) + ' &nbsp;<span class="nm">s<sub>' + (i + 1) + '</sub></span>', min: -0.6, max: 0.6, step: 0.01, value: s[i], k: [1, 2, 4][i],
        fmt: function (v) { return fix(v, 2) + ' m/s'; }, onInput: function (v) { s[i] = v; update(); }
      });
    });
    UI.seg(slot(root, 'layout'), {
      label: 'Wheel layouts', value: 'good',
      options: [{ v: 'good', label: 'Wheels at 90°, 210°, 330°' }, { v: 'swap', label: 'Wheels at 0°, 120°, 240°' }, { v: 'fragile', label: 'Nearly parallel' }, { v: 'parallel', label: 'All parallel' }],
      onChange: function (v) { layout = v; update(); }
    });
    /* set the readings that a chosen body velocity would produce with the current wheels */
    function drive(twist) {
      s = LA.mv(wheelMatrix(LAYOUTS[layout]), twist);
      S.forEach(function (x, i) { x.set(s[i]); });
      update();
    }
    var bt = slot(root, 'buttons');
    UI.button(bt, { label: 'Forward', icon: 'arrow-right', onClick: function () { drive([0.3, 0, 0]); } });
    UI.button(bt, { label: 'Sideways', icon: 'arrow-left', onClick: function () { drive([0, 0.3, 0]); } });
    UI.button(bt, { label: 'Spin', icon: 'loop', onClick: function () { drive([0, 0, 1.5]); } });
    UI.button(bt, { label: 'Stop', icon: 'pause', onClick: function () { drive([0, 0, 0]); } });
    UI.button(bt, { label: 'Recentre', icon: 'reset', onClick: function () { pose = { x: 0, y: 0, th: 0 }; trail = []; showPose(); plot.draw(); } });

    function showPose() {
      out.px(fix(pose.x, 2) + ' m'); out.py(fix(pose.y, 2) + ' m'); out.th(fix(LA.deg(LA.wrapAngle(pose.th)), 0) + '°');
    }

    function update() {
      var L = LAYOUTS[layout], tint = { 0: 'h1', 1: 'h2', 2: 'h4' }, i;
      A = wheelMatrix(L);
      r = LA.eliminate(A, s);
      vel = r.singular ? null : r.x;

      /* the elimination, as a static display of the current numbers */
      var parts = [UI.mx(augment(A, s), { aug: 1, rows: tint, fmt: f2, cls: 'sm', cap: '[ A | s ] · one row per wheel' })], chips = [];
      r.steps.forEach(function (t) {
        if (t.kind === 'swap') {
          var moved = { 0: 'h1', 1: 'h2', 2: 'h4' }, tmp = moved[t.i]; moved[t.i] = moved[t.j]; moved[t.j] = tmp;
          parts.push('→', UI.mx(augment(t.M, t.rhs), { aug: 1, rows: moved, fmt: f2, cls: 'sm', cap: 'rows ' + (t.i + 1) + ' and ' + (t.j + 1) + ' exchanged' }));
          chips.push('<b>Exchange rows ' + (t.i + 1) + ' and ' + (t.j + 1) + '</b>');
        } else if (t.kind === 'elim') chips.push(opWords(t.i, t.k, t.mult, f2));
        else if (t.kind === 'skip') chips.push('Row ' + (t.i + 1) + ': already 0');
        else if (t.kind === 'fail') chips.push('<b>No pivot in column ' + (t.k + 1) + ': stop</b>');
        else if (t.kind === 'upper') chips.push('Back-substitute: ω, then v<sub>y</sub>, then v<sub>x</sub>');
      });
      if (!r.singular) {
        parts.push('→', UI.mx(augment(r.U, r.c), { aug: 1, pivots: [[0, 0], [1, 1], [2, 2]], fmt: f2, cls: 'sm', cap: '[ U | c ] · pivots circled' }), '→',
          UI.mx(r.x, { cols: { 0: 'h3' }, fmt: f2, cls: 'sm', cap: 'body velocity' }));
      } else {
        var fl = r.steps[r.steps.length - 1], bad = {}, pv = [];
        for (i = fl.k; i < 3; i++) bad[i + ',' + fl.k] = 'h1';
        for (i = 0; i < fl.pivots.length; i++) pv.push([i, i]);
        parts.push('→', UI.mx(augment(fl.M, fl.rhs), { aug: 1, pivots: pv, cells: bad, fmt: f2, cls: 'sm', cap: 'stuck · no pivot in column ' + (fl.k + 1) }), '→',
          UI.mx(['?', '?', '?'], { cols: { 0: 'h3' }, cls: 'sm', cap: 'body velocity' }));
      }
      eq.innerHTML = UI.eq.apply(null, [{ cls: 'left' }].concat(parts));
      ops.innerHTML = chips.map(function (c) { return '<span>' + c + '</span>'; }).join('');

      /* readouts and status */
      out.vx(vel ? f2(vel[0]) + ' m/s' : '?'); out.vy(vel ? f2(vel[1]) + ' m/s' : '?'); out.w(vel ? f2(vel[2]) + ' rad/s' : '?');
      var pvs = r.pivots.map(f2).join(', ');
      if (r.singular) {
        var still = Math.abs(s[0]) + Math.abs(s[1]) + Math.abs(s[2]) < 1e-9;
        if (still) UI.status(status, 'bad', '<b>Three zeros, and the robot still cannot tell.</b> It may be standing still. It may be sliding sideways at any speed. The readings are the same either way, because the v<sub>y</sub> column is all zeros and elimination finds no second pivot.');
        else if (LA.inColumnSpace(A, s, 1e-7)) UI.status(status, 'bad', '<b>Permanent failure: infinitely many answers.</b> All three wheels roll the same way, so the v<sub>y</sub> column is all zeros and there is no second pivot. Sideways sliding turns no wheel. These readings fit every value of v<sub>y</sub>.');
        else UI.status(status, 'bad', '<b>Permanent failure: no answer at all.</b> There is no second pivot, and wheels 2 and 3 are mounted at the same height and roll the same way, so a rigid robot must give them equal readings. These two disagree. A wheel is slipping, or a sensor is wrong.');
      } else if (r.exchanges) {
        UI.status(status, 'hot', '<b>Solved after a row exchange.</b> Wheel 1 rolls straight along <i>y</i>, so its row starts with 0: it says nothing about v<sub>x</sub>. Elimination moves the row of wheel 2 to the top and carries on. Pivots ' + pvs + '. The robot is fine.');
      } else if (Math.min.apply(null, r.pivots.map(Math.abs)) < 0.3) {
        var gain = Math.abs(LA.inv(A)[1][1]);
        UI.status(status, 'hot', '<b>Solved, but fragile.</b> The second pivot is only ' + f2(r.pivots[1]) + ', because wheels 2 and 3 barely respond to sideways motion. Back-substitution divides by it, so an error of 1 cm/s on encoder 2 becomes ' + num(gain, 1) + ' cm/s of error in v<sub>y</sub>. With the first layout it would be 0.6 cm/s.');
      } else {
        UI.status(status, 'ok', '<b>Solved with no row exchange.</b> Pivots ' + pvs + '. The last row reads ' + f2(r.U[2][2]) + ' ω = ' + f2(r.c[2]) + ', and that right-hand side is s<sub>1</sub> + s<sub>2</sub> + s<sub>3</sub>. The turn rate comes out first, then v<sub>y</sub>, then v<sub>x</sub>.');
      }
      showPose();
      plot.draw();
    }

    plot.onDraw(function (p) {
      var L = LAYOUTS[layout], c = [pose.x, pose.y], k;
      p.view.cx = pose.x; p.view.cy = pose.y;
      p.grid({ labels: false, axes: false, step: 0.25, major: 4 });
      p.point([0, 0], { r: 3, color: C.faint });
      if (Math.abs(pose.x) + Math.abs(pose.y) > 0.3) p.text('start', [0, 0], { color: C.faint, dx: 8, dy: 11, bg: false });
      Robots.drawTrail(p, trail, {});
      if (!vel) {
        /* the unseen direction: a ghost sliding along the body's y axis */
        var off = 0.3 * Math.sin(1.7 * ghostT), yb = Robots.rotate(pose.th, [0, 1]);
        p.arrow(LA.vadd(c, LA.vscale(yb, 0.26)), LA.vadd(c, LA.vscale(yb, 0.62)), { color: C.s3, width: 2, dash: [5, 4] });
        p.arrow(LA.vadd(c, LA.vscale(yb, -0.26)), LA.vadd(c, LA.vscale(yb, -0.62)), { color: C.s3, width: 2, dash: [5, 4] });
        p.text('sideways speed = ?', LA.vadd(c, LA.vscale(yb, 0.62)), { color: C.s3, dx: 12, dy: -4 });
        Robots.drawOmni(p, { x: c[0] + yb[0] * off, y: c[1] + yb[1] * off, th: pose.th }, { Rb: Rb, alphas: L.alphas, wheelDirs: L.dirs, alpha: 0.28 });
      }
      Robots.drawOmni(p, pose, { Rb: Rb, alphas: L.alphas, wheelDirs: L.dirs, speeds: s, colors: cl, scale: 0.55 });
      if (vel) {
        var v = Robots.rotate(pose.th, [vel[0], vel[1]]), len = LA.norm(v);
        k = len > 1e-6 ? Math.min(0.9, 0.95 / len) : 0;
        if (len > 0.004) p.arrow(c, LA.vadd(c, LA.vscale(v, k)), { color: C.s3, width: 3, head: 11 });
        if (Math.abs(vel[2]) > 0.02) {
          var a0 = pose.th, a1 = pose.th + LA.clamp(vel[2] * 0.75, -5.4, 5.4), rr = Rb * 0.52, sg = vel[2] > 0 ? 1 : -1;
          var e = [c[0] + rr * Math.cos(a1), c[1] + rr * Math.sin(a1)], tg = [-Math.sin(a1) * sg, Math.cos(a1) * sg];
          p.arc(c, rr * p.s, a0, a1, { color: C.s3, width: 2 });
          p.arrow(LA.vsub(e, LA.vscale(tg, 0.05)), LA.vadd(e, LA.vscale(tg, 0.012)), { color: C.s3, width: 2, head: 8 });
        }
      }
    });

    UI.loop(canvas, function (dt) {
      if (!vel) { if (!UI.reducedMotion()) { ghostT += dt; plot.draw(); } return; }
      if (Math.abs(vel[0]) + Math.abs(vel[1]) + Math.abs(vel[2]) < 1e-4) return;
      pose = Robots.step(pose, vel, dt);
      Robots.pushTrail(trail, [pose.x, pose.y], 700, 0.02);
      showPose();
      plot.draw();
    });
    update();
  });
})();
