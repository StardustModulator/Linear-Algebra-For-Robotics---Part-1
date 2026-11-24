/* ==========================================================================
   Lecture 5 labs: transposes, permutations, spaces R^n
   5.1 PA = LU stepper         5.1 (part 2) three-digit pivot experiment
   5.2 transpose flip, R^T R   5.3 joint torques, tau = J^T F
   5.4 is it a subspace?       5.5 the rover's velocity subspace
   ========================================================================== */
(function () {
  'use strict';
  var C = window.PlotColors, num = LA.num, fix = LA.fix, fmt = LA.fmt;
  var TR = '<sup class="u">T</sup>';
  function slot(root, name) { return root.querySelector('[data-slot="' + name + '"]'); }
  function mth(html, cls) { return '<span class="m' + (cls ? ' ' + cls : '') + '">' + html + '</span>'; }
  function par(s) { return s.charAt(0) === '−' ? '(' + s + ')' : s; }
  function vec(a, f) { return '(' + a.map(function (v) { return (f || num)(v); }).join(', ') + ')'; }
  function plural(n, word) { return (n === 1 ? 'one ' : n + ' ') + word + (n === 1 ? '' : 's'); }

  /* ------------------------------------------------------------------ 5.1 */
  UI.lab('lab-pivot', function (root) {
    var PRESETS = {
      zero: [[0, 1, 1], [1, 2, 1], [2, 7, 9]],
      general: [[1, 2, 1], [3, 8, 1], [0, 4, 1]],
      singular: [[1, 2, 3], [2, 4, 6], [1, 1, 1]]
    };
    var A = LA.clone(PRESETS.zero), mode = 'zero', f = null, loading = false;
    var status = slot(root, 'status'), ptp = slot(root, 'ptp');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'row exchanges', id: 'ex' }, { k: 'row order used', id: 'ord' }, { k: 'pivots', id: 'piv', c: 1 }]);
    var seg = UI.seg(slot(root, 'presets'), {
      label: 'Example matrices', value: 'zero',
      options: [{ v: 'zero', label: 'Zero pivot: exchange needed' }, { v: 'general', label: 'General matrix' }, { v: 'singular', label: 'Singular: no exchange helps' }],
      onChange: function (v) { A = LA.clone(PRESETS[v]); loading = true; input.set(A); loading = false; rebuild(); }
    });
    UI.seg(slot(root, 'mode'), {
      label: 'Pivoting rule', value: 'zero',
      options: [{ v: 'zero', label: 'Only on a zero pivot' }, { v: 'partial', label: 'Partial pivoting' }],
      onChange: function (v) { mode = v; rebuild(); }
    });
    var input = UI.mxInput(slot(root, 'input'), A, { id: 'pivA', name: 'A', onChange: function (M) { if (loading) return; A = M; seg.set('', false); rebuild(); } });

    /* LA.lu records the working matrix at every move; here we replay it and add P and L as they grow */
    function buildSteps() {
      f = LA.lu(A, { pivoting: mode });
      var n = A.length, L = LA.identity(n), perm = [], steps = [], lastSwapK = -1, q;
      for (q = 0; q < n; q++) perm.push(q);
      f.steps.forEach(function (s) {
        var t = {}, key, c0, tmp;
        for (key in s) t[key] = s[key];
        if (s.kind === 'swap') {
          tmp = perm[s.i]; perm[s.i] = perm[s.j]; perm[s.j] = tmp;
          t.moved = false;
          for (c0 = 0; c0 < s.k; c0++) {
            if (Math.abs(L[s.i][c0] - L[s.j][c0]) > 1e-12) t.moved = true;
            tmp = L[s.i][c0]; L[s.i][c0] = L[s.j][c0]; L[s.j][c0] = tmp;
          }
          lastSwapK = s.k;
        }
        if (s.kind === 'elim') L[s.i][s.k] = s.mult;
        if (s.kind === 'pivot') t.swapped = lastSwapK === s.k;
        t.L = LA.clone(L); t.P = LA.permMatrix(perm);
        steps.push(t);
      });
      if (f.ok) steps.push({ kind: 'check', M: f.U, L: f.L, P: f.P, pivots: f.pivots });
      return steps;
    }
    function title(s) {
      switch (s.kind) {
        case 'start': return 'Start: the matrix A';
        case 'swap': return 'Row exchange';
        case 'pivot': return 'Pivot ' + (s.k + 1);
        case 'elim': case 'skip': return 'Clear below pivot ' + (s.k + 1);
        case 'upper': return 'Upper triangular: this is U';
        case 'check': return 'Check: P A = L U';
        default: return 'No pivot available';
      }
    }
    function text(s) {
      var k1 = s.k + 1, r1 = s.i + 1;
      switch (s.kind) {
        case 'start':
          return 'Elimination wants a non-zero number in each diagonal position, starting at the top left. ' +
            (mode === 'zero' ? 'With the lecture\'s rule, rows change places only when that number is zero.' : 'With partial pivoting, the largest entry of each column is moved into the pivot position first.');
        case 'swap':
          var held = s.M[s.j][s.k], now = s.M[s.k][s.k];
          return (mode === 'zero'
            ? 'The pivot position (row ' + k1 + ', column ' + k1 + ') holds <b>0</b>, and a pivot cannot be zero. Row ' + (s.j + 1) + ' has a non-zero entry in that column, so <b>exchange rows ' + k1 + ' and ' + (s.j + 1) + '</b>.'
            : 'Partial pivoting looks down column ' + k1 + ' for the entry of largest size. It is <b>' + fmt(now) + '</b> in row ' + (s.j + 1) + ', against ' + fmt(held) + ' in the pivot position, so <b>exchange rows ' + k1 + ' and ' + (s.j + 1) + '</b>.') +
            ' P records the new order.' + (s.moved ? ' The multipliers already stored in L travel with their rows.' : '');
        case 'pivot':
          return 'Pivot ' + k1 + ' is <b>' + fmt(s.M[s.k][s.k]) + '</b>.' +
            (mode === 'partial' && !s.swapped && s.k < 2 ? ' It is already the largest entry in its column from here down, so no exchange is needed.' : '') +
            (s.k === 2 ? ' Nothing lies below it, so there is nothing to clear.' : ' Now clear the entries below it.');
        case 'skip':
          return 'Row ' + r1 + ' already has a 0 under the pivot. Its multiplier is 0 and the row is left alone.';
        case 'elim':
          return 'Subtract <b>' + par(fmt(s.mult)) + '</b> × row ' + k1 + ' from row ' + r1 + '. That puts a 0 under the pivot. The multiplier ' + fmt(s.mult) + ' is stored in L at row ' + r1 + ', column ' + k1 + '.';
        case 'upper':
          return 'Three pivots, with zeros below each of them. The working matrix is now <b>U</b>, and the multipliers have filled <b>L</b>.';
        case 'check':
          return 'Multiply both sides out. <b>P A</b> is A with its rows in the order elimination used. <b>L U</b> rebuilds exactly that matrix. ' +
            (f.exchanges ? 'Without P the equation would be false, because A has its rows in the old order.' : 'No exchange was made, so P is the identity and this is the plain A = LU.');
        default:
          return 'Column ' + k1 + ' has nothing but zeros from the diagonal down. No row exchange can supply a pivot. A is <b>singular</b>, so it has no factorization PA = LU with three pivots.';
      }
    }
    function render(s) {
      var pv = [], rows = {}, prow = {}, lc = {}, q, count = s.pivots ? s.pivots.length : 0;
      for (q = 0; q < count; q++) pv.push([q, q]);
      if (s.kind === 'check') {
        var PA = LA.mul(s.P, A), LU = LA.mul(s.L, s.M);
        return UI.eq(UI.mx(s.P, { cls: 'sm', cap: 'P' }), UI.mx(A, { cls: 'sm', cap: 'A' }), '=', UI.mx(PA, { cls: 'sm', cap: 'P A' })) +
          UI.eq(UI.mx(s.L, { cls: 'sm', cap: 'L' }), UI.mx(s.M, { cls: 'sm', cap: 'U', pivots: pv }), '=', UI.mx(LU, { cls: 'sm', cap: 'L U' })) +
          '<p class="step-text">' + text(s) + (LA.equal(PA, LU) ? ' The two results agree entry by entry.' : '') + '</p>';
      }
      if (s.kind === 'swap') {
        rows[s.i] = 'h3'; rows[s.j] = 'h3'; prow[s.i] = 'h3'; prow[s.j] = 'h3';
        if (s.moved) for (q = 0; q < s.k; q++) { lc[s.i + ',' + q] = 'h3'; lc[s.j + ',' + q] = 'h3'; }
      }
      if (s.kind === 'elim' || s.kind === 'skip') { rows[s.k] = 'h2'; rows[s.i] = 'h3'; lc[s.i + ',' + s.k] = 'h3'; }
      if (s.kind === 'pivot') rows[s.k] = 'h2';
      return UI.eq(
        UI.mx(s.P, { cls: 'sm', rows: prow, cap: 'P so far' }),
        UI.mx(s.M, { rows: rows, pivots: pv, cap: s.kind === 'upper' ? 'U' : (s.kind === 'start' ? 'A' : 'A, on its way to U') }),
        UI.mx(s.L, { cls: 'sm', cells: lc, cap: 'L so far' })) +
        '<p class="step-text">' + text(s) + '</p>';
    }
    var stepper = UI.stepper(slot(root, 'stepper'), { steps: buildSteps(), render: render, title: title, delay: 1900 });

    function summary() {
      var P = f.P, order = f.perm.map(function (p) { return p + 1; }).join(', ');
      out.ex(String(f.exchanges)); out.ord(order);
      out.piv(f.pivots.length ? f.pivots.map(function (p) { return fmt(p); }).join(', ') + (f.ok ? '' : ', none') : 'none');
      ptp.innerHTML = UI.eq({ cls: 'left' }, UI.mx(LA.T(P), { cls: 'sm', cap: 'P transpose' }), UI.mx(P, { cls: 'sm', cap: 'P' }), '=', UI.mx(LA.mul(LA.T(P), P), { cls: 'sm', cap: 'identity' }));
      if (!f.ok) {
        UI.status(status, 'bad', '<b>Singular: no factorization.</b> At some stage a column holds only zeros from the diagonal down, so no row exchange can supply a pivot. PA = LU needs an invertible A.');
      } else if (f.exchanges === 0) {
        UI.status(status, 'ok', '<b>No exchange needed, so P = I.</b> This is the plain A = LU of Lecture 4. ' + (mode === 'partial' ? 'Each pivot was already the largest entry in its column.' : 'Every pivot position held a non-zero number when its turn came.'));
      } else if (mode === 'zero') {
        UI.status(status, 'ok', '<b>PA = LU with ' + plural(f.exchanges, 'row exchange') + '.</b> A zero sat in a pivot position, so rows had to change places. P holds the row order that elimination used (' + order + '), and L and U are found exactly as before.');
      } else {
        var z = LA.lu(A, { pivoting: 'zero' });
        UI.status(status, 'ok', '<b>PA = LU with ' + plural(f.exchanges, 'row exchange') + ', chosen by size.</b> Partial pivoting put the largest entry of each column in the pivot position, so every multiplier in L is at most 1 in size. ' +
          (z.ok ? 'The lecture\'s rule would have made ' + (z.exchanges === 0 ? 'none' : z.exchanges) + '. Both factorizations are correct.' : ''));
      }
    }
    function rebuild() { stepper.setSteps(buildSteps()); summary(); }
    summary();
  });

  /* ------------------------------------------------------- 5.1, part 2 */
  UI.lab('lab-digits', function (root) {
    var EPS = [0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001, 0.0005, 0.0002, 0.0001, 0.00005, 0.00002, 0.00001, 0.000005, 0.000002, 0.000001];
    var cols = slot(root, 'cols'), status = slot(root, 'status');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'true x', id: 'x' }, { k: 'true y', id: 'y' }, { k: 'error, no exchange', id: 'e1', c: 1 }, { k: 'error, with exchange', id: 'e2', c: 4 }]);

    /* keep three significant digits, as a three-digit calculator would */
    function fl(x) { return x === 0 ? 0 : Number(x.toPrecision(3)); }
    /* a plain decimal string, free of floating-point dust */
    function dn(x) { var v = Number(x.toPrecision(8)); return (Math.abs(v) < 1e-12 ? '0' : String(v)).replace('-', '−'); }
    /* solve [a b; c d](x, y) = (e, f) with pivot a, rounding every result to three digits */
    function solve3(a, b, c, d, e, f) {
      var l = fl(c / a);
      var d2raw = d - fl(l * b), d2 = fl(d2raw);
      var f2raw = f - fl(l * e), f2 = fl(f2raw);
      var yraw = f2 / d2, y = fl(yraw);
      var sraw = e - fl(b * y), x = fl(fl(sraw) / a);
      return { l: l, d2raw: d2raw, d2: d2, f2raw: f2raw, f2: f2, yraw: yraw, y: y, xraw: sraw / a, x: x };
    }
    function errText(e) { return e >= 0.0995 ? fix(e, 2) : dn(Number(e.toPrecision(2))); }
    function kept(raw, k) { return dn(raw) === dn(k) ? '<b>' + dn(k) + '</b>' : dn(raw) + ' <span class="lost">kept as ' + dn(k) + '</span>'; }
    function column(name, a, b, c, d, e, f, r, err, kind) {
      return '<div class="dig-col ' + kind + '"><span class="label">' + name + '</span>' +
        UI.eq({ cls: 'left' }, UI.mx([[a, b, e], [c, d, f]], { aug: 1, pivots: [[0, 0]], fmt: dn })) +
        '<ol class="dig-steps">' +
        '<li><span class="k">multiplier</span>' + dn(c) + ' ÷ ' + dn(a) + ' = <b>' + dn(r.l) + '</b></li>' +
        '<li><span class="k">new row 2</span>' + dn(d) + ' − ' + dn(r.l) + ' × ' + dn(b) + ' = ' + kept(r.d2raw, r.d2) + '</li>' +
        '<li><span class="k">new right side</span>' + dn(f) + ' − ' + dn(r.l) + ' × ' + dn(e) + ' = ' + kept(r.f2raw, r.f2) + '</li>' +
        '<li><span class="k">then y</span>' + dn(r.f2) + ' ÷ ' + par(dn(r.d2)) + ' = ' + kept(r.yraw, r.y) + '</li>' +
        '<li><span class="k">then x</span>(' + dn(e) + ' − ' + dn(b) + ' × ' + dn(r.y) + ') ÷ ' + dn(a) + ' = ' + kept(r.xraw, r.x) + '</li>' +
        '</ol><div class="dig-ans"><span>answer (x, y)</span><b>(' + dn(r.x) + ', ' + dn(r.y) + ')</b><span>error</span><b>' + errText(err) + '</b></div></div>';
    }
    function update() {
      var eps = EPS[sl.get()], xt = 1 / (1 - eps), yt = (1 - 2 * eps) / (1 - eps);
      var r1 = solve3(eps, 1, 1, 1, 1, 2), r2 = solve3(1, 1, eps, 1, 2, 1);
      var e1 = Math.sqrt(Math.pow(r1.x - xt, 2) + Math.pow(r1.y - yt, 2)), e2 = Math.sqrt(Math.pow(r2.x - xt, 2) + Math.pow(r2.y - yt, 2));
      var broken = e1 > 0.1, slipping = !broken && e1 > 0.004 && e1 > 2.5 * e2;
      cols.innerHTML = column('No exchange · pivot ' + dn(eps), eps, 1, 1, 1, 1, 2, r1, e1, broken ? 'bad' : (slipping ? 'hot' : 'ok')) +
        column('Rows exchanged · pivot 1', 1, 1, eps, 1, 2, 1, r2, e2, 'ok');
      out.x(fix(xt, 4)); out.y(fix(yt, 4)); out.e1(errText(e1)); out.e2(errText(e2));
      if (broken) {
        UI.status(status, 'bad', '<b>The small pivot wrecked the answer.</b> Dividing by ' + dn(eps) + ' gave a multiplier of ' + dn(r1.l) + '. Next to numbers that large, row 2\'s own entries (1 and 2) fall beyond the third digit and are rounded away, and the equation x + y = 2 goes with them. The left column reports x = ' + dn(r1.x) + '. The true x is ' + fix(xt, 4) + '. The right column used the same arithmetic on the same equations and is fine.');
      } else if (slipping) {
        UI.status(status, 'hot', '<b>Starting to slip.</b> With a pivot of ' + dn(eps) + ' the multiplier is ' + dn(r1.l) + ', and one digit of row 2 is already lost. The left column gives x = ' + dn(r1.x) + ', the right column x = ' + dn(r2.x) + ', and the true x is ' + fix(xt, 4) + '.');
      } else {
        UI.status(status, 'ok', '<b>Both orders agree here.</b> With a pivot of ' + dn(eps) + ' the multiplier is ' + dn(r1.l) + ', and both columns land within ' + errText(Math.max(e1, e2)) + ' of the true answer, about as well as three digits can do. Slide right to shrink the pivot.');
      }
    }
    var sl = UI.slider(slot(root, 'slider'), {
      label: 'Size of the small pivot', min: 0, max: EPS.length - 1, step: 1, value: 9, k: 3,
      fmt: function (i) { return dn(EPS[Math.round(i)]); }, onInput: update
    });
    update();
  });

  /* ------------------------------------------------------------------ 5.2 */
  UI.lab('lab-transpose', function (root) {
    var LECT = [[1, 3], [2, 3], [4, 1]];
    var A = LA.clone(LECT), flipped = false, order = 'aat', pair = [0, 1];
    var box = slot(root, 'flip'), cap = slot(root, 'flipcap'), status = slot(root, 'status');
    var prod = slot(root, 'prod'), why = slot(root, 'why'), pairSlot = slot(root, 'pair'), pairSeg = null;

    /* the flip stage: six cells that slide across the diagonal */
    box.innerHTML = '<div class="flip-diag"></div><div class="flip-br"></div>';
    var br = box.querySelector('.flip-br'), cells = [];
    A.forEach(function (row, i) {
      row.forEach(function (v, j) {
        var cell = UI.el('div', 'flip-cell t' + (j + 1)), inp = document.createElement('input');
        inp.type = 'number'; inp.step = 'any'; inp.inputMode = 'decimal'; inp.value = v; inp.id = 'tr-' + i + '-' + j;
        cell.appendChild(inp); box.appendChild(cell);
        cells.push({ el: cell, inp: inp, i: i, j: j });
      });
    });
    function place() {
      cells.forEach(function (c) {
        c.el.style.setProperty('--x', flipped ? c.i : c.j);
        c.el.style.setProperty('--y', flipped ? c.j : c.i);
        c.inp.setAttribute('aria-label', flipped ? 'A transpose, row ' + (c.j + 1) + ' column ' + (c.i + 1) : 'A, row ' + (c.i + 1) + ' column ' + (c.j + 1));
      });
      br.style.setProperty('--r', flipped ? 2 : 3);
      br.style.setProperty('--c', flipped ? 3 : 2);
    }
    box.addEventListener('input', function () {
      cells.forEach(function (c) { var v = parseFloat(c.inp.value); A[c.i][c.j] = isFinite(v) ? v : 0; });
      update();
    });
    var bFlip = UI.button(slot(root, 'buttons'), { label: 'Flip', icon: 'transpose', cls: 'primary', onClick: function () { flipped = !flipped; place(); update(); } });
    UI.button(slot(root, 'buttons'), { label: 'Lecture numbers', icon: 'reset', onClick: function () {
      A = LA.clone(LECT); cells.forEach(function (c) { c.inp.value = A[c.i][c.j]; }); update();
    } });
    UI.seg(slot(root, 'order'), {
      label: 'Order of the product', value: 'aat',
      options: [{ v: 'aat', label: 'A times A transpose (3 by 3)' }, { v: 'ata', label: 'A transpose times A (2 by 2)' }],
      onChange: function (v) { order = v; pair = [0, 1]; buildPairs(); update(); }
    });
    function buildPairs() {
      var opts = order === 'aat' ? [[0, 1], [0, 2], [1, 2]] : [[0, 1]];
      pairSlot.innerHTML = '';
      pairSeg = UI.seg(pairSlot, {
        label: 'Mirrored pair', value: pair.join(','),
        options: opts.map(function (p) { return { v: p.join(','), label: '(' + (p[0] + 1) + ', ' + (p[1] + 1) + ') and (' + (p[1] + 1) + ', ' + (p[0] + 1) + ')' }; }),
        onChange: function (v) { pair = v.split(',').map(Number); update(); }
      });
    }
    /* tapping an off-diagonal entry of the product selects its pair */
    prod.addEventListener('click', function (e) {
      var cell = e.target.closest ? e.target.closest('.mx.pick > span') : null;
      if (!cell) return;
      var n = order === 'aat' ? 3 : 2, idx = Array.prototype.indexOf.call(cell.parentNode.children, cell), i = Math.floor(idx / n), j = idx % n;
      if (i === j) return;
      pair = [Math.min(i, j), Math.max(i, j)]; pairSeg.set(pair.join(','), false); update();
    });
    function dotText(u, v) { return u.map(function (a, k) { return par(fmt(a)) + '·' + par(fmt(v[k])); }).join(' + '); }

    function update() {
      var At = LA.T(A), i = pair[0], j = pair[1], t1 = {}, t2 = {}, S, u, v, left, right, what;
      t1[i] = 'h1'; t1[j] = 'h2'; t2[i] = 'h1'; t2[j] = 'h2';
      cap.innerHTML = flipped ? mth('A' + TR) + ' &nbsp;2 rows, 3 columns' : mth('A') + ' &nbsp;3 rows, 2 columns';
      bFlip.innerHTML = icon('transpose') + '<span>' + (flipped ? 'Flip back' : 'Flip') + '</span>';
      if (flipped) {
        UI.status(status, 'ok', '<b>This is the transpose.</b> The red column of A is now the red row, and the blue column is the blue row. Every entry crossed the dashed diagonal: the ' + fmt(A[2][0]) + ' from row 3, column 1 now sits in row 1, column 3. Flip again and you are back at A.');
      } else {
        UI.status(status, '', '<b>This is A.</b> Its first column ' + vec(LA.col(A, 0), fmt) + ' is red and its second column ' + vec(LA.col(A, 1), fmt) + ' is blue. Press <b>Flip</b> to turn every column into a row.');
      }
      if (order === 'aat') {
        S = LA.mul(A, At); u = A[i]; v = A[j]; what = 'row';
        left = UI.mx(A, { rows: t1, cap: 'A' }); right = UI.mx(At, { cols: t2, cap: 'A transpose' });
      } else {
        S = LA.mul(At, A); u = LA.col(A, i); v = LA.col(A, j); what = 'column';
        left = UI.mx(At, { rows: t1, cap: 'A transpose' }); right = UI.mx(A, { cols: t2, cap: 'A' });
      }
      var tint = {}; tint[i + ',' + j] = 'h3'; tint[j + ',' + i] = 'h3';
      prod.innerHTML = UI.eq(left, right, '=', UI.mx(S, { cls: 'pick', cells: tint, cap: 'symmetric',
        hi: function (a, b) { return (a === i && b === j) || (a === j && b === i) ? 'sel' : ''; } }));
      UI.status(why, 'ok', '<b>Entries (' + (i + 1) + ', ' + (j + 1) + ') and (' + (j + 1) + ', ' + (i + 1) + ') are both ' + fmt(S[i][j]) + '.</b> ' +
        'The first is ' + what + ' ' + (i + 1) + ' of A times ' + what + ' ' + (j + 1) + ' of A: ' + dotText(u, v) + ' = ' + fmt(S[i][j]) + '. ' +
        'The second is ' + what + ' ' + (j + 1) + ' times ' + what + ' ' + (i + 1) + ': ' + dotText(v, u) + ' = ' + fmt(S[j][i]) + '. ' +
        'The same two ' + what + 's meet in both entries, and a dot product does not care which comes first.');
    }
    buildPairs(); place(); update();
  });

  /* ------------------------------------------------------------------ 5.3 */
  UI.lab('lab-torque', function (root) {
    var len = [0.5, 0.4], FS = 0.02, FMAX = 20, TOL = 0.02;
    var CASES = {
      worked: { th: [90, -90], F: [0, 10] },
      elbow: { th: [90, -90], F: [10, 0] },
      along: { th: [90, 0], F: [0, 10] },
      across: { th: [90, 0], F: [10, 0] }
    };
    var F = CASES.worked.F.slice(), st = {};
    var canvas = root.querySelector('canvas');
    var plot = new Plot2D(canvas, { cx: 0.12, cy: 0.45, w: 2.0 });
    var status = slot(root, 'status'), eq = slot(root, 'eq'), sl = slot(root, 'sliders');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'shoulder torque', id: 't1', c: 1 }, { k: 'elbow torque', id: 't2', c: 2 }, { k: 'shoulder lever arm', id: 'd1' }, { k: 'elbow lever arm', id: 'd2' }]);
    var degf = function (x) { return fix(x, 0) + '°'; };
    var s1 = UI.slider(sl, { label: 'Shoulder angle <span class="nm">θ₁</span>', min: 0, max: 180, step: 1, value: 90, k: 1, fmt: degf, onInput: function () { seg.set('', false); update(); } });
    var s2 = UI.slider(sl, { label: 'Elbow angle <span class="nm">θ₂</span>', min: -160, max: 160, step: 1, value: -90, k: 2, fmt: degf, onInput: function () { seg.set('', false); update(); } });
    var seg = UI.seg(slot(root, 'presets'), {
      label: 'Example cases', value: 'worked',
      options: [{ v: 'worked', label: 'Worked example' }, { v: 'elbow', label: 'Force through the elbow' }, { v: 'along', label: 'Straight arm, force along it' }, { v: 'across', label: 'Straight arm, force across it' }],
      onChange: function (v) { var c = CASES[v]; s1.set(c.th[0]); s2.set(c.th[1]); F = c.F.slice(); update(); }
    });
    function turn(t) { return t > 0 ? 'counter-clockwise' : 'clockwise'; }

    function update() {
      var th = [LA.rad(s1.get()), LA.rad(s2.get())], pts = Robots.fk(len, th), J = Robots.jacobian(len, th), JT = LA.T(J);
      var tau = LA.mv(JT, F), Fn = LA.norm(F);
      var d = Fn > 0.05 ? [Math.abs(tau[0]) / Fn, Math.abs(tau[1]) / Fn] : [0, 0];
      st = { pts: pts, tau: tau };
      var f2 = function (x) { return fix(x, 2); }, f1 = function (x) { return fix(x, 1); };
      eq.innerHTML =
        UI.eq({ cls: 'left' }, mth('J'), '=', UI.mx(J, { cols: { 0: 'h1', 1: 'h2' }, fmt: f2, cap: 'J, read by columns' }),
          mth('J' + TR), '=', UI.mx(JT, { rows: { 0: 'h1', 1: 'h2' }, fmt: f2, cap: 'the same numbers as rows' })) +
        UI.eq({ cls: 'left' }, mth('τ = J' + TR + 'F'), '=', UI.mx(JT, { rows: { 0: 'h1', 1: 'h2' }, fmt: f2 }), UI.mx(F, { cols: { 0: 'h3' }, fmt: f1, cap: 'force, N' }), '=',
          UI.mx(tau, { rows: { 0: 'h1', 1: 'h2' }, fmt: f2, cap: 'torques, N·m' }));
      out.t1(fix(tau[0], 2) + ' N·m'); out.t2(fix(tau[1], 2) + ' N·m');
      out.d1(fix(d[0], 2) + ' m'); out.d2(fix(d[1], 2) + ' m');
      var Ft = fix(Fn, 1) + ' N';
      if (Fn <= 0.05) {
        UI.status(status, '', '<b>No force, no torque.</b> The hand is pushing on nothing, so the motors have nothing to hold. Drag the amber handle to push.');
      } else if (d[0] < TOL && d[1] < TOL) {
        UI.status(status, 'ok', '<b>The structure carries the load.</b> The arm is straight and the force runs along it, so the line of the force passes through both joints. Neither joint has a lever arm, and the motors hold ' + Ft + ' with almost no torque. The links take it instead.');
      } else if (d[1] < TOL) {
        UI.status(status, 'hot', '<b>The force passes through the elbow.</b> It has no lever arm there, so the elbow motor feels nothing. The shoulder holds all of it: ' + Ft + ' × ' + fix(d[0], 2) + ' m = ' + fix(Math.abs(tau[0]), 2) + ' N·m, ' + turn(tau[0]) + '.');
      } else if (d[0] < TOL) {
        UI.status(status, 'hot', '<b>The force passes through the shoulder.</b> It has no lever arm there, so the shoulder motor feels nothing. The elbow holds all of it: ' + Ft + ' × ' + fix(d[1], 2) + ' m = ' + fix(Math.abs(tau[1]), 2) + ' N·m, ' + turn(tau[1]) + '.');
      } else if (Math.max(d[0], d[1]) < 0.1) {
        UI.status(status, 'ok', '<b>Almost carried by the structure.</b> The force runs nearly along the arm, so both lever arms are short (' + fix(d[0], 2) + ' m and ' + fix(d[1], 2) + ' m). Holding ' + Ft + ' costs only ' + fix(Math.abs(tau[0]), 2) + ' and ' + fix(Math.abs(tau[1]), 2) + ' N·m.');
      } else {
        UI.status(status, 'ok', '<b>Holding ' + Ft + '.</b> Shoulder: ' + Ft + ' × ' + fix(d[0], 2) + ' m = ' + fix(Math.abs(tau[0]), 2) + ' N·m, ' + turn(tau[0]) + '. Elbow: ' + Ft + ' × ' + fix(d[1], 2) + ' m = ' + fix(Math.abs(tau[1]), 2) + ' N·m, ' + turn(tau[1]) + '. Each torque is the force times its lever arm.');
      }
      plot.draw();
    }
    plot.handle({
      get: function () { var t = st.pts ? st.pts[2] : [0, 0]; return [t[0] + F[0] * FS, t[1] + F[1] * FS]; },
      set: function (x, y) {
        var t = st.pts[2], g = [(x - t[0]) / FS, (y - t[1]) / FS], n = LA.norm(g);
        if (n > FMAX) g = LA.vscale(g, FMAX / n);
        F = [Math.round(g[0] * 10) / 10, Math.round(g[1] * 10) / 10];
        seg.set('', false); update();
      }, color: C.s3, label: 'F', math: true
    });
    /* an arc around a joint: its length shows the size of the torque, its arrow the direction */
    function gauge(p, centre, tau, color, name) {
      var ctx = p.ctx, c = p.px(centre), r = 25, a0 = Math.PI / 2;
      var sweep = LA.clamp(tau * Math.PI / 6, -5.7, 5.7);                 /* a full turn of arc = 12 N·m */
      ctx.save();
      ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineCap = 'round';
      ctx.globalAlpha = .4; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1; ctx.setLineDash([]);
      if (Math.abs(sweep) > 0.03) {
        var sg = sweep > 0 ? 1 : -1, a1 = a0 + sweep, h = Math.min(10, Math.abs(sweep) * r * .9);
        var stop = a1 - sg * (h * .75) / r;
        ctx.lineWidth = 3.4;
        ctx.beginPath(); ctx.arc(c[0], c[1], r, -a0, -stop, sg > 0); ctx.stroke();
        var ex = c[0] + r * Math.cos(a1), ey = c[1] - r * Math.sin(a1), tx = -Math.sin(a1) * sg, ty = -Math.cos(a1) * sg;
        ctx.beginPath(); ctx.moveTo(ex, ey);
        ctx.lineTo(ex - tx * h - ty * h * .55, ey - ty * h + tx * h * .55);
        ctx.lineTo(ex - tx * h + ty * h * .55, ey - ty * h - tx * h * .55);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      /* the name sits just beyond the end of the arc */
      var al = a0 + sweep;
      p.text(name, centre, { color: color, dx: Math.cos(al) * (r + 17), dy: -Math.sin(al) * (r + 17), align: 'center', math: true });
    }
    plot.onDraw(function (p) {
      if (!st.pts) return;
      p.grid({ labels: false, axes: false, step: 0.25, major: 4 });
      p.note('grid squares are 0.25 m', 10, -12, { color: C.faint });
      var tip = st.pts[2], Fn = LA.norm(F);
      if (Fn > 0.05) {
        var u = LA.vscale(F, 1 / Fn);
        p.line(LA.vadd(tip, LA.vscale(u, -4)), LA.vadd(tip, LA.vscale(u, 4)), { color: C.s3, width: 1.1, dash: [3, 6], alpha: .6 });
        [0, 1].forEach(function (i) {
          var foot = LA.vadd(tip, LA.vscale(u, LA.dot(LA.vsub(st.pts[i], tip), u))), col = i ? C.s2 : C.s1;
          p.line(st.pts[i], foot, { color: col, width: 1.5, dash: [2, 4] });
          p.point(foot, { r: 2.6, color: col });
        });
      }
      Robots.drawArm(p, st.pts, { jointColors: [C.s1, C.s2] });
      gauge(p, st.pts[0], st.tau[0], C.s1, 'τ₁');
      gauge(p, st.pts[1], st.tau[1], C.s2, 'τ₂');
      p.arrow(tip, [tip[0] + F[0] * FS, tip[1] + F[1] * FS], { color: C.s3, width: 3.2 });
    });
    update();
  });

  /* ------------------------------------------------------------------ 5.4 */
  UI.lab('lab-subspace', function (root) {
    var RAD = 2, LIM = 2.25;
    function q4(x) { return Math.round(LA.clamp(x, -LIM, LIM) * 4) / 4; }
    function q8(t) { return Math.round(t * 8) / 8; }
    var SETS = {
      line0: { v: [2, 1], w: [-1, -0.5],
        fit: function (p) { var t = LA.clamp(q8((2 * p[0] + p[1]) / 5), -1.125, 1.125); return [2 * t, t]; },
        has: function (p) { return Math.abs(p[0] - 2 * p[1]) < 1e-6; } },
      lineoff: { v: [1, 2], w: [-1, 1],
        fit: function (p) { var t = LA.clamp(q8((2 * (p[0] - 1) + (p[1] - 2)) / 5), -1.625, 0.625); return [1 + 2 * t, 2 + t]; },
        has: function (p) { return Math.abs(p[0] - 2 * p[1] + 3) < 1e-6; } },
      quad: { v: [2, 1], w: [0.5, 2],
        fit: function (p) { return [Math.max(0, q4(p[0])), Math.max(0, q4(p[1]))]; },
        has: function (p) { return p[0] > -1e-9 && p[1] > -1e-9; } },
      plane: { v: [2, 1], w: [-1, 2],
        fit: function (p) { return [q4(p[0]), q4(p[1])]; },
        has: function () { return true; } },
      zero: { v: [0, 0], w: [0, 0],
        fit: function () { return [0, 0]; },
        has: function (p) { return LA.norm(p) < 1e-9; } },
      disc: { v: [1.75, 0.75], w: [0.75, 1.5],
        fit: function (p) { var g = [q4(p[0]), q4(p[1])], n = LA.norm(g); return n > RAD ? LA.vscale(g, RAD / n) : g; },
        has: function (p) { return LA.norm(p) < RAD + 1e-6; } }
    };
    var set = 'line0', v = SETS.line0.v.slice(), w = SETS.line0.w.slice(), res = {};
    var plot = new Plot2D(root.querySelector('canvas'), { cx: 0, cy: 0, w: 10.6 });
    var status = slot(root, 'status');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'v + w', id: 'sum', c: 3 }, { k: 'is it in the set?', id: 'sumIn', c: 3 }, { k: 'c times v', id: 'cv', c: 4 }, { k: 'is it in the set?', id: 'cvIn', c: 4 }, { k: 'is the zero vector?', id: 'zero' }]);
    UI.seg(slot(root, 'sets'), {
      label: 'Sets to test', value: 'line0',
      options: [{ v: 'line0', label: 'Line through origin' }, { v: 'lineoff', label: 'Line missing the origin' }, { v: 'quad', label: 'First quadrant' },
        { v: 'plane', label: 'Whole plane' }, { v: 'zero', label: 'Only the zero vector' }, { v: 'disc', label: 'Disc (speed limit)' }],
      onChange: function (k) { set = k; v = SETS[k].v.slice(); w = SETS[k].w.slice(); update(); }
    });
    var sc = UI.slider(slot(root, 'slider'), { label: '<span class="nm">c</span> &nbsp;the number that multiplies <span class="nm"><b>v</b></span>', min: -2, max: 2, step: 0.25, value: -1.5, k: 4, onInput: update });

    function update() {
      var S = SETS[set], c = sc.get(), sum = LA.vadd(v, w), cv = LA.vscale(v, c);
      var inS = S.has(sum), inC = S.has(cv), z = S.has([0, 0]);
      res = { sum: sum, cv: cv, inS: inS, inC: inC };
      out.sum(vec(sum)); out.sumIn(inS ? 'yes' : 'no, outside');
      out.cv(vec(cv)); out.cvIn(inC ? 'yes' : 'no, outside');
      out.zero(z ? 'yes' : 'no, missing');
      var cs = num(c);
      if (set === 'line0') {
        UI.status(status, 'ok', '<b>A subspace.</b> v + w and c·v land back on the line for every v, w and c you can choose. <b>Robot:</b> a cart on a straight rail. Its velocities are all multiples of one direction: faster, slower, reversed or stopped.');
      } else if (set === 'plane') {
        UI.status(status, 'ok', '<b>A subspace: the whole space.</b> Nothing can leave the plane, so both tests pass automatically. <b>Robot:</b> the sliding velocities of an omni-wheel robot. Every direction and every speed is on the menu.');
      } else if (set === 'zero') {
        UI.status(status, 'ok', '<b>A subspace: the smallest one.</b> The set holds only the zero vector, so v and w are both stuck at the origin. 0 + 0 = 0 and c·0 = 0, so both tests pass. Strang calls it Z. <b>Robot:</b> brakes locked. Standing still is its one motion.');
      } else if (set === 'lineoff') {
        UI.status(status, 'bad', '<b>Not a subspace.</b> The line misses the origin, so the zero vector is not in the set and it fails at once. v + w lands off the line, and c·v stays on it only when c = 1. <b>Robot:</b> every pair of wheel speeds that gives exactly 1 m/s forward. Add two such pairs and you get 2 m/s.');
      } else if (set === 'quad') {
        if (!inC) UI.status(status, 'bad', '<b>Not a subspace.</b> v + w stays inside, but c = ' + cs + ' flips v out through the corner. One failure is enough. <b>Robot:</b> two one-way thrusters, each with thrust ≥ 0. They can push harder together, but the opposite push does not exist: there is no reverse.');
        else UI.status(status, 'hot', '<b>Still not a subspace, although nothing looks wrong right now.</b> Adding always stays inside, and so does multiplying by a positive c. The test must pass for every number. Slide c below zero.');
      } else {
        if (!inS || !inC) UI.status(status, 'bad', '<b>Not a subspace.</b> It contains the zero vector and the reverse of every member, yet ' + (!inS && !inC ? 'both v + w and c·v are' : (!inS ? 'v + w is' : 'c·v is')) + ' longer than the limit of ' + RAD + '. <b>Robot:</b> a speed limit. Every velocity up to top speed is allowed, but the sum or the double of two allowed velocities can break it.');
        else UI.status(status, 'hot', '<b>Still not a subspace, although nothing looks wrong right now.</b> Both results happen to be short enough. Drag v and w until they point the same way, or push c toward 2, and a result will cross the edge.');
      }
      plot.draw();
    }
    function fit(p) { return SETS[set].fit(p); }
    plot.handle({ get: function () { return v; }, set: function (x, y) { v = fit([x, y]); update(); }, color: C.s1, label: 'v', math: true });
    plot.handle({ get: function () { return w; }, set: function (x, y) { w = fit([x, y]); update(); }, color: C.s2, label: 'w', math: true });
    function mark(p, pt, inside, color, name) {
      var ctx = p.ctx, q = p.px(pt);
      if (inside) p.point(pt, { r: 6, color: color, ring: C.board, width: 2 });
      else {
        p.point(pt, { r: 8, fill: C.board, ring: color, width: 2 });
        ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
        ctx.moveTo(q[0] - 3.5, q[1] - 3.5); ctx.lineTo(q[0] + 3.5, q[1] + 3.5); ctx.moveTo(q[0] + 3.5, q[1] - 3.5); ctx.lineTo(q[0] - 3.5, q[1] + 3.5); ctx.stroke(); ctx.restore();
      }
      p.text(name + (inside ? ' inside' : ' outside'), pt, { color: color, dx: 0, dy: 20, align: 'center' });
    }
    plot.onDraw(function (p) {
      var b = p.bounds(), wash = 'rgba(244,242,238,.10)', edge = 'rgba(244,242,238,.6)';
      if (set === 'plane') p.path([[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]], { fill: wash, color: 'none', close: true });
      if (set === 'quad') p.path([[0, 0], [b.x1, 0], [b.x1, b.y1], [0, b.y1]], { fill: wash, color: 'none', close: true });
      if (set === 'disc') p.circle([0, 0], RAD, { fill: wash, color: edge, width: 1.6 });
      p.grid({ xlabel: 'x', ylabel: 'y', labelStep: 1 });
      if (set === 'line0' || set === 'lineoff') {
        var rhs = set === 'line0' ? 0 : -3;
        p.lineABC(1, -2, rhs, { color: C.chalk, width: 9, alpha: .16, cap: 'butt' });
        p.lineABC(1, -2, rhs, { color: edge, width: 1.6 });
      }
      if (set === 'quad') { p.line([0, 0], [b.x1, 0], { color: edge, width: 1.8 }); p.line([0, 0], [0, b.y1], { color: edge, width: 1.8 }); }
      if (set === 'zero') p.point([0, 0], { r: 17, fill: wash, ring: edge, width: 1.6 });
      if (!res.sum) return;
      p.line(v, res.sum, { color: C.faint, width: 1.2, dash: [3, 5] });
      p.line(w, res.sum, { color: C.faint, width: 1.2, dash: [3, 5] });
      p.arrow([0, 0], res.cv, { color: C.s4, width: 6, alpha: .5, head: 14 });
      p.arrow([0, 0], res.sum, { color: C.s3, width: 2 });
      p.arrow([0, 0], v, { color: C.s1, width: 3 });
      p.arrow([0, 0], w, { color: C.s2, width: 3 });
      mark(p, res.cv, res.inC, C.s4, 'c·v');
      mark(p, res.sum, res.inS, C.s3, 'v + w');
    });
    update();
  });

  /* ------------------------------------------------------------------ 5.5 */
  UI.lab('lab-velspace', function (root) {
    var r = 0.1, W = 0.5, ZS = 0.25, K = 2.4;        /* wheel radius, track width (m); drawing scales */
    var A2 = [[r / 2, r / 2], [0, 0], [-r / W, r / W]];
    var A3 = [[r / 2, r / 2, 0], [0, 0, r], [-r / W, r / W, 0]];
    var LEC = [[1, 3], [2, 3], [4, 1]], L1 = [1, 2, 4], L2 = [3, 3, 1];
    var mode = 'rover', vel = [0, 0, 0], comb = [0, 0, 0];
    var pose = { x: 0, y: 0, th: 0.5 }, trail = [];
    var canvases = root.querySelectorAll('canvas');
    var p3 = new Plot3D(canvases[0], { span: 3.9, yaw: -1.02, pitch: 0.33 });
    var top = new Plot2D(canvases[1], { cx: 0, cy: 0, w: 8 });
    var status = slot(root, 'status'), eq = slot(root, 'eq'), keys = slot(root, 'keys');
    var gWheels = slot(root, 'wheels'), gLect = slot(root, 'lect'), gDrive = slot(root, 'drive');
    var cl = [C.s1, C.s2, C.s4];
    var rs = function (x) { return fix(x, 1) + ' rad/s'; };
    var sL = UI.slider(gWheels, { label: 'Left wheel speed <span class="nm">ω<sub>L</sub></span>', min: -10, max: 10, step: 0.5, value: 6, k: 1, fmt: rs, onInput: update });
    var sR = UI.slider(gWheels, { label: 'Right wheel speed <span class="nm">ω<sub>R</sub></span>', min: -10, max: 10, step: 0.5, value: 9, k: 2, fmt: rs, onInput: update });
    var sS = UI.slider(gWheels, { label: 'Sideways wheel speed <span class="nm">ω<sub>S</sub></span>', min: -10, max: 10, step: 0.5, value: 5, k: 4, fmt: rs, onInput: update });
    var x1 = UI.slider(gLect, { label: '<span class="nm">x₁</span> &nbsp;of column (1, 2, 4)', min: -1, max: 1, step: 0.25, value: 1, k: 1, onInput: update });
    var x2 = UI.slider(gLect, { label: '<span class="nm">x₂</span> &nbsp;of column (3, 3, 1)', min: -1, max: 1, step: 0.25, value: 0.5, k: 2, onInput: update });
    UI.seg(slot(root, 'mode'), {
      label: 'Which matrix', value: 'rover',
      options: [{ v: 'rover', label: 'Two-wheel rover' }, { v: 'omni', label: 'Omni robot' }, { v: 'lecture', label: 'Lecture\'s matrix' }],
      onChange: function (v) { mode = v; layout(); update(); }
    });
    UI.button(slot(root, 'buttons'), { label: 'Stop the wheels', icon: 'pause', onClick: function () { sL.set(0); sR.set(0); sS.set(0); update(); } });
    UI.button(slot(root, 'buttons'), { label: 'Recentre', icon: 'reset', onClick: function () { pose = { x: 0, y: 0, th: 0.5 }; trail = []; top.draw(); } });

    function layout() {
      var lec = mode === 'lecture';
      gWheels.hidden = lec; gLect.hidden = !lec; gDrive.hidden = lec;
      sS.el.hidden = mode !== 'omni';
      p3.span = lec ? 17 : 3.9;
      keys.innerHTML = lec
        ? '<span class="key k1">x₁ × column 1</span><span class="key k2">x₂ × column 2</span><span class="key k3">their sum</span><span>drag to turn the picture</span>'
        : '<span class="key k1">left wheel\'s share</span><span class="key k2">right wheel\'s share</span>' + (mode === 'omni' ? '<span class="key k4">sideways wheel\'s share</span>' : '') + '<span class="key k3">body velocity</span><span>drag to turn the picture</span>';
    }
    function update() {
      var f2 = function (x) { return fix(x, 2); };
      if (mode === 'lecture') {
        var x = [x1.get(), x2.get()];
        comb = LA.mv(LEC, x);
        eq.innerHTML = UI.eq({ cls: 'left' }, mth(num(x[0]), 'u c1'), UI.mx(L1, { cols: { 0: 'h1' } }), '+', mth(num(x[1]), 'u c2'), UI.mx(L2, { cols: { 0: 'h2' } }), '=', UI.mx(comb, { cols: { 0: 'h3' }, fmt: function (q) { return num(q); } }));
        UI.status(status, 'ok', '<b>The column space of the lecture\'s matrix.</b> ' + num(x[0]) + ' × (1, 2, 4) + ' + num(x[1]) + ' × (3, 3, 1) = ' + vec(comb) + '. Every combination lands on one flat sheet through the origin, the plane 10x − 11y + 3z = 0. Two columns cannot fill three-dimensional space.');
      } else {
        var omni = mode === 'omni', wv = omni ? [sL.get(), sR.get(), sS.get()] : [sL.get(), sR.get()], Am = omni ? A3 : A2;
        vel = LA.mv(Am, wv);
        var tints = omni ? { 0: 'h1', 1: 'h2', 2: 'h4' } : { 0: 'h1', 1: 'h2' };
        eq.innerHTML = UI.eq({ cls: 'left' }, UI.mx(Am, { cols: tints, fmt: function (q) { return num(q); }, cap: 'A' }),
          UI.mx(wv, { rows: tints, fmt: function (q) { return fix(q, 1); }, cap: 'wheel speeds' }), '=',
          UI.mx(vel, { cols: { 0: 'h3' }, fmt: f2, cap: 'vx, vy, ω' }));
        var still = LA.norm(wv) < 1e-9;
        if (still) {
          UI.status(status, '', '<b>The zero vector.</b> All wheels are stopped, so the body velocity is (0, 0, 0): the origin of the picture. Every subspace contains it. Standing still is always one of the robot\'s options.');
        } else if (!omni) {
          UI.status(status, 'ok', '<b>On the plane.</b> ' + fix(wv[0], 1) + ' × column 1 + ' + fix(wv[1], 1) + ' × column 2 = ' + vec(vel, f2) + '. The middle entry is 0 whatever the wheels do, because the rover cannot slide sideways. Its achievable velocities are the column space of A: a plane through the origin of three-dimensional space.');
        } else if (Math.abs(vel[1]) > 1e-9) {
          UI.status(status, 'ok', '<b>Off the old plane.</b> The sideways wheel adds the column (0, 0.1, 0), which points out of the plane. Three columns now point in three independent directions, so their combinations fill all of R³. This robot can produce every body velocity, here ' + vec(vel, f2) + '.');
        } else {
          UI.status(status, 'hot', '<b>Three columns that fill R³, one of them unused.</b> The sideways wheel is still, so the velocity lies in the old plane for the moment. Move the green slider and it leaves.');
        }
      }
      p3.draw(); top.draw();
    }
    /* velocity -> picture: the turn-rate axis is drawn at one quarter scale so the plane looks square */
    function dsp(q) { return [q[0], q[1], q[2] * ZS]; }
    p3.onDraw(function (p) {
      var pos = [0, 0, 0], nx, i;
      if (mode === 'lecture') {
        var x = [x1.get(), x2.get()];
        p.plane(L1, L2, 6.4, { fill: 'rgba(244,242,238,.06)', color: 'rgba(244,242,238,.3)' });
        p.axes(6.8);
        p.arrow([0, 0, 0], L1, { color: C.s1, width: 1.3, alpha: .5 });
        p.arrow([0, 0, 0], L2, { color: C.s2, width: 1.3, alpha: .5 });
        [L1, L2].forEach(function (col, k) { nx = LA.vadd(pos, LA.vscale(col, x[k])); p.arrow(pos, nx, { color: cl[k], width: 3 }); pos = nx; });
        p.line(pos, [pos[0], pos[1], 0], { color: C.faint, width: 1, dash: [2, 4] });
        p.point(pos, { r: 6.5, color: C.s3, ring: C.board, label: 'b' });
        p.note('faint arrows: the two columns', 10, -12, { color: C.faint });
        return;
      }
      var omni = mode === 'omni', Am = omni ? A3 : A2, wv = omni ? [sL.get(), sR.get(), sS.get()] : [sL.get(), sR.get()];
      p.plane([1, 0, 0], [0, 0, 1], 1.3, { fill: 'rgba(244,242,238,.06)', color: 'rgba(244,242,238,.3)' });
      p.axes(1.6, ['vx', 'vy', 'ω']);
      for (i = 0; i < wv.length; i++) p.arrow([0, 0, 0], dsp(LA.vscale(LA.col(Am, i), 10)), { color: cl[i], width: 1.3, alpha: .5 });
      for (i = 0; i < wv.length; i++) {
        nx = LA.vadd(pos, dsp(LA.vscale(LA.col(Am, i), wv[i])));
        p.arrow(pos, nx, { color: cl[i], width: 3 });
        pos = nx;
      }
      if (omni && Math.abs(pos[1]) > 1e-6) p.line(pos, [pos[0], 0, pos[2]], { color: C.s3, width: 1.1, dash: [2, 4], alpha: .8 });
      p.point(pos, { r: 6.5, color: C.s3, ring: C.board });
      p.note('faint arrows: each column at 10 rad/s', 10, -12, { color: C.faint });
    });
    top.onDraw(function (p) {
      var dp = { x: pose.x * K, y: pose.y * K, th: pose.th }, Lb = 1.3, Wb = 1.0, y = Wb / 2 + .1, ctx = p.ctx;
      p.view.cx = dp.x; p.view.cy = dp.y;
      p.grid({ labels: false, axes: false, step: 1.2, major: 5 });
      Robots.drawTrail(p, trail, {});
      Robots.drawRover(p, dp, { L: Lb, W: Wb });
      /* wheels in the colours of their columns */
      function bar(a, b, col) {
        var pa = p.px(Robots.toWorld(dp, a)), pb = p.px(Robots.toWorld(dp, b));
        ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); ctx.stroke(); ctx.restore();
      }
      bar([-Lb * .28, y], [Lb * .28, y], C.s1);
      bar([-Lb * .28, -y], [Lb * .28, -y], C.s2);
      if (mode === 'omni') bar([-.28, -.2], [-.28, .2], C.s4);
      var g = Robots.rotate(pose.th, [vel[0], vel[1]]);
      if (LA.norm(g) > 0.02) p.arrow([dp.x, dp.y], [dp.x + g[0] * 1.9, dp.y + g[1] * 1.9], { color: C.s3, width: 2.6 });
      p.note('top view · grid squares are 0.5 m', 10, -12, { color: C.faint });
    });
    UI.loop(canvases[1], function (dt) {
      if (mode === 'lecture' || LA.norm(vel) < 1e-6) return;
      pose = Robots.step(pose, vel, dt);
      Robots.pushTrail(trail, [pose.x * K, pose.y * K], 500, 0.06);
      top.draw();
    });
    layout(); update();
  });
})();
