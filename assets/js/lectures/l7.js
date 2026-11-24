/* ==========================================================================
   Lecture 7 labs: solving Ax = 0
   7.1 from A to U to R, step by step     7.2 build a solution from the free variables
   7.3 four-joint arm (spare joints)      7.4 four-thruster vehicle (spare thruster)
   7.5 A and its transpose: same rank
   Colour rule on this page: red = pivot (column, variable, joint, thruster),
   blue = free, amber = the row just changed or the wanted result.
   ========================================================================== */
(function () {
  'use strict';
  var C = window.PlotColors, num = LA.num, fix = LA.fix, fmt = LA.fmt;
  var SUB = ['₁', '₂', '₃', '₄', '₅'];
  function slot(root, name) { return root.querySelector('[data-slot="' + name + '"]'); }
  function deg(r) { return r * 180 / Math.PI; }
  function f2(v) { return fix(v, 2); }
  function xvar(j) { return '<i>x</i><sub>' + (j + 1) + '</sub>'; }
  /* "1 and 3", "1, 2 and 4", "none": column numbers in words (0-based in, 1-based out) */
  function list(cols) {
    var a = cols.map(function (c) { return c + 1; });
    if (!a.length) return 'none';
    if (a.length === 1) return String(a[0]);
    return a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  }
  function named(cols, word) { return word + (cols.length === 1 ? ' ' : 's ') + list(cols); }
  function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }
  function tup(v, f) { return '(' + v.map(function (x) { return (f || num)(x); }).join(', ') + ')'; }
  function par(v, f) { var s = (f || num)(v); return v < 0 ? '(' + s + ')' : s; }
  /* ease a set of sliders to target values */
  function glide(sliders, targets, done) {
    var from = sliders.map(function (s) { return s.get(); }), t0 = null, dur = UI.reducedMotion() ? 1 : 650;
    function frame(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      sliders.forEach(function (s, i) { s.set(from[i] + (targets[i] - from[i]) * e, true); });
      if (k < 1) requestAnimationFrame(frame); else { sliders.forEach(function (s, i) { s.set(targets[i], true); }); if (done) done(); }
    }
    requestAnimationFrame(frame);
  }

  /* ----------------------------------------------------------------------
     cmx: a matrix with a name above every column and a label under it.
     o.kinds     per column: 'p' pivot (red), 'f' free (blue), 'x' switched off, '' undecided
     o.heads     html above each column          o.labels   true (pivot / free) or an array of html
     o.rowHeads  html left of each row           o.rowKinds like kinds, but tints whole rows
     o.pivots    [[i, j], ...] circled           o.rows     { i: 'h3' } tint one row
     o.dimRows   { i: 1 } fade a row             o.fmt, o.cls ('sm'), o.cap
     ---------------------------------------------------------------------- */
  var KCLS = { p: 'h1', f: 'h2', x: 'dim' }, KWORD = { p: 'pivot', f: 'free', x: 'off', '': '?' };
  function cmx(M, o) {
    o = o || {};
    var rows = Array.isArray(M[0]) ? M : M.map(function (v) { return [v]; });
    var m = rows.length, n = rows[0].length, f = o.fmt || fmt;
    var kinds = o.kinds || [], rk = o.rowKinds || [], pv = {}, i, j;
    var r0 = o.heads ? 2 : 1, c0 = o.rowHeads ? 2 : 1;
    (o.pivots || []).forEach(function (p) { pv[p[0] + ',' + p[1]] = 1; });
    function at(r, c) { return ' style="grid-area:' + r + '/' + c + '"'; }
    var h = '<span class="cmx' + (o.cls ? ' ' + o.cls : '') + '" style="--cols:' + (n + c0 - 1) + '">';
    h += '<span class="br" style="grid-area:' + r0 + '/' + c0 + '/' + (r0 + m) + '/' + (c0 + n) + '"></span>';
    if (o.heads) for (j = 0; j < n; j++) h += '<span class="hd' + (kinds[j] ? ' k' + kinds[j] : '') + '"' + at(1, c0 + j) + '>' + o.heads[j] + '</span>';
    for (i = 0; i < m; i++) {
      if (o.rowHeads) h += '<span class="rh' + (rk[i] ? ' k' + rk[i] : '') + '"' + at(r0 + i, 1) + '>' + o.rowHeads[i] + '</span>';
      for (j = 0; j < n; j++) {
        var v = rows[i][j], c = [], key = i + ',' + j;
        var tint = (o.rows && o.rows[i]) || KCLS[rk[i]] || KCLS[kinds[j]];
        if (tint) c.push(tint);
        if (pv[key]) c.push('pv');
        if (o.dimRows && o.dimRows[i] && tint !== 'dim') c.push('dim');
        h += '<span' + (c.length ? ' class="' + c.join(' ') + '"' : '') + at(r0 + i, c0 + j) + '>' + (typeof v === 'number' ? f(v) : v) + '</span>';
      }
    }
    if (o.labels) for (j = 0; j < n; j++) {
      h += '<span class="lb' + (kinds[j] ? ' k' + kinds[j] : '') + '"' + at(r0 + m, c0 + j) + '>' + (Array.isArray(o.labels) ? o.labels[j] : KWORD[kinds[j] || '']) + '</span>';
    }
    h += '</span>';
    if (o.cap) h = '<span class="mx-wrap">' + h + '<span class="mx-cap">' + o.cap + '</span></span>';
    return h;
  }
  function kindsOf(n, pivotCols, freeCols) {
    var k = [];
    for (var j = 0; j < n; j++) k.push(pivotCols.indexOf(j) >= 0 ? 'p' : (freeCols.indexOf(j) >= 0 ? 'f' : ''));
    return k;
  }
  function pivotCells(pivotCols) { return pivotCols.map(function (c, k) { return [k, c]; }); }

  /* static labelled matrices in the prose:
     <span data-cmx="1 2; 0 0" data-kinds="p f" data-heads="x1 x2" data-labels data-pivots="0.0"></span> */
  UI.ready(function () {
    UI.$$('[data-cmx]').forEach(function (node) {
      var M = node.getAttribute('data-cmx').split(';').map(function (r) {
        return r.trim().split(/\s+/).map(function (t) {
          if (/^[-+]?\d+(\.\d+)?$/.test(t)) return parseFloat(t);
          var q = /^([-+]?\d+)\/(\d+)$/.exec(t);
          return q ? parseInt(q[1], 10) / parseInt(q[2], 10) : '<i>' + t.replace(/-/g, '−') + '</i>';
        });
      });
      function words(attr) { var a = node.getAttribute(attr); return a ? a.trim().split(/\s+/) : null; }
      function name(t) { var q = /^(\D+)(\d+)$/.exec(t); return q ? '<i>' + q[1] + '</i><sub>' + q[2] + '</sub>' : '<i>' + t + '</i>'; }
      var blank = function (k) { return k === '-' ? '' : k; };
      var o = { cls: node.getAttribute('data-cls') || '', cap: node.getAttribute('data-cap') || '' };
      if (words('data-kinds')) o.kinds = words('data-kinds').map(blank);
      if (words('data-rowkinds')) o.rowKinds = words('data-rowkinds').map(blank);
      if (words('data-heads')) o.heads = words('data-heads').map(name);
      if (words('data-rowheads')) o.rowHeads = words('data-rowheads').map(name);
      if (node.hasAttribute('data-labels')) o.labels = true;
      var pv = node.getAttribute('data-pivots');
      if (pv) o.pivots = pv.split(',').map(function (s) { return s.trim().split('.').map(Number); });
      var dr = words('data-dimrows');
      if (dr) { o.dimRows = {}; dr.forEach(function (r) { o.dimRows[r] = 1; }); }
      var t = document.createElement('template');
      t.innerHTML = cmx(M, o);
      node.replaceWith(t.content.firstChild);
    });
  });

  /* a short curved arrow around a point: which way something turns and how hard */
  function turnMark(p, c, r, a0, sweep, col, width) {
    if (Math.abs(sweep) < 0.06) return;
    var a1 = a0 + sweep, P = p.px(c), sg = sweep > 0 ? 1 : -1, ctx = p.ctx;
    p.arc(c, r, a0, a1, { color: col, width: width || 2 });
    var ex = P[0] + r * Math.cos(a1), ey = P[1] - r * Math.sin(a1), tx = -Math.sin(a1) * sg, ty = -Math.cos(a1) * sg;
    ctx.save(); ctx.fillStyle = col; ctx.beginPath();
    ctx.moveTo(ex + tx * 7, ey + ty * 7); ctx.lineTo(ex - tx * 2 - ty * 4.5, ey - ty * 2 + tx * 4.5); ctx.lineTo(ex - tx * 2 + ty * 4.5, ey - ty * 2 - tx * 4.5);
    ctx.closePath(); ctx.fill(); ctx.restore();
  }

  /* ------------------------------------------------------------------ 7.1 */
  UI.lab('lab-rref', function (root) {
    var PRE = {
      lecture: { M: [[1, 2, 2, 2], [2, 4, 6, 8], [3, 6, 8, 10]], about: 'The lecture\'s matrix, 3 by 4. Column 2 is twice column 1, and row 3 is row 1 plus row 2.' },
      transpose: { M: [[1, 2, 3], [2, 4, 6], [2, 6, 8], [2, 8, 10]], about: 'The lecture\'s second example: the same numbers with rows and columns swapped, 4 by 3.' },
      square: { M: [[1, 2, 1], [3, 8, 1], [0, 4, 1]], about: 'The square matrix of Lecture 2. Three columns, three pivots.' },
      arm: { M: [[-2, -1, -1, 0], [2, 2, 1, 1]], about: 'Jacobian of a four-joint arm with 1 m links at joint angles 90°, −90°, 90°, −90°: the staircase pose of Lab 7.3, hand at (2, 2).' }
    };
    var MAXM = 4, MAXN = 5;
    var M = LA.clone(PRE.lecture.M), rr = null;
    var status = slot(root, 'status'), box = slot(root, 'matrix'), about = slot(root, 'about'), sizeRow = slot(root, 'size');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'shape', id: 'shape' }, { k: 'pivots found', id: 'piv', c: 1 }, { k: 'free columns found', id: 'free', c: 2 }, { k: 'rank r', id: 'rank', c: 3 }]);
    var seg = UI.seg(slot(root, 'presets'), {
      label: 'Example matrices', value: 'lecture',
      options: [{ v: 'lecture', label: 'Lecture matrix A' }, { v: 'transpose', label: 'Its transpose Aᵀ' }, { v: 'square', label: 'Square and invertible' }, { v: 'arm', label: 'Four-joint arm J' }],
      onChange: function (v) { M = LA.clone(PRE[v].M); about.innerHTML = '<span>' + PRE[v].about + '</span>'; buildEditor(); rebuild(); }
    });
    var bSize = [
      UI.button(sizeRow, { icon: 'minus', label: 'Row', title: 'Remove the last row', onClick: function () { resize(-1, 0); } }),
      UI.button(sizeRow, { icon: 'plus', label: 'Row', title: 'Add a row of zeros', onClick: function () { resize(1, 0); } }),
      UI.button(sizeRow, { icon: 'minus', label: 'Column', title: 'Remove the last column', onClick: function () { resize(0, -1); } }),
      UI.button(sizeRow, { icon: 'plus', label: 'Column', title: 'Add a column of zeros', onClick: function () { resize(0, 1); } })
    ];
    function custom() { seg.set('', false); about.innerHTML = '<span>Your own matrix. Any numbers will do, including decimals.</span>'; }
    function buildEditor() {
      box.innerHTML = '';
      UI.mxInput(box, M, { id: 'rref-a', name: 'matrix', onChange: function (A) { M = A; custom(); rebuild(); } });
      var m = M.length, n = M[0].length;
      bSize[0].disabled = m <= 1; bSize[1].disabled = m >= MAXM; bSize[2].disabled = n <= 1; bSize[3].disabled = n >= MAXN;
    }
    function resize(dm, dn) {
      var m = Math.max(1, Math.min(MAXM, M.length + dm)), n = Math.max(1, Math.min(MAXN, M[0].length + dn)), A = LA.zeros(m, n);
      for (var i = 0; i < m; i++) for (var j = 0; j < n; j++) A[i][j] = (M[i] && M[i][j] !== undefined) ? M[i][j] : 0;
      M = A; custom(); buildEditor(); rebuild();
    }

    /* la.js records the steps; here each one also learns which columns are known to be free so far */
    function decorate(r) {
      var outS = [], free = [], past = false;
      r.steps.forEach(function (s) {
        var t = {}, k;
        for (k in s) t[k] = s[k];
        if (s.kind === 'free') free.push(s.col);
        if (s.kind === 'echelon') {
          var rest = r.freeCols.filter(function (c) { return free.indexOf(c) < 0; });
          if (rest.length) { free = free.concat(rest); outS.push({ kind: 'rest', M: s.M, pivotCols: s.pivotCols, cols: rest, free: free.slice(), after: false }); }
          past = true;
        }
        t.free = past ? r.freeCols.slice() : free.slice();
        t.after = past;
        outS.push(t);
      });
      return outS;
    }
    function rowOp(i, k, l) {
      var a = Math.abs(l);
      return 'row ' + (i + 1) + (l < 0 ? ' + ' : ' − ') + (Math.abs(a - 1) < 1e-9 ? '' : fmt(a) + ' × ') + 'row ' + (k + 1);
    }
    var TITLES = { start: 'Start: the matrix A', pivot: 'A pivot', elim: 'Clear below the pivot', free: 'No pivot here: a free column', swap: 'Row exchange', rest: 'Out of rows: the rest are free',
      echelon: 'Echelon form U', elimUp: 'Clear above the pivot', scale: 'Make the pivot 1', done: 'Reduced row echelon form R' };
    function say(s, idx, all) {
      var m = s.M.length, n = s.M[0].length, r = s.pivotCols.length, c1 = (s.col || 0) + 1, i, below = false;
      switch (s.kind) {
        case 'start':
          return 'We want every <b>x</b> with A<b>x</b> = <b>0</b>. The right-hand side is all zeros, and row operations keep it all zeros, so it is not written down. Work across the columns from the left, looking for pivots.';
        case 'pivot':
          for (i = s.pivot[0] + 1; i < m; i++) if (Math.abs(s.M[i][s.pivot[1]]) > 1e-9) below = true;
          return 'Column ' + c1 + ': the entry in row ' + (s.pivot[0] + 1) + ' is ' + fmt(s.M[s.pivot[0]][s.pivot[1]]) + ', which is not zero. It is <b>pivot ' + r + '</b>, so column ' + c1 + ' is a <b>pivot column</b>. ' +
            (below ? 'Next, clear the entries under it.' : (s.pivot[0] === m - 1 ? 'It sits in the last row, so there is nothing under it to clear.' : 'Everything under it is already zero.'));
        case 'elim':
          return '<b>New row ' + (s.i + 1) + ' = ' + rowOp(s.i, s.k, s.mult) + '.</b> The multiplier ' + fmt(s.mult) + ' is chosen so that a zero appears under the pivot.';
        case 'free':
          return 'Column ' + c1 + ': a pivot would have to sit in row ' + (s.row + 1) + ', but that entry is zero' + (s.row < m - 1 ? ', and so is everything under it. There is nothing to exchange into place' : '') + '. <b>No pivot in this column, so it is free.</b> Stay on row ' + (s.row + 1) + ' and move one column to the right.';
        case 'swap':
          return 'Column ' + c1 + ': the pivot position in row ' + (s.i + 1) + ' holds a zero, but row ' + (s.j + 1) + ' has a non-zero entry in this column. <b>Exchange rows ' + (s.i + 1) + ' and ' + (s.j + 1) + '</b> to bring it up.';
        case 'rest':
          return 'All ' + plural(m, 'row') + ' now hold' + (m === 1 ? 's' : '') + ' a pivot, and a row can hold only one. So column' + (s.cols.length > 1 ? 's ' : ' ') + list(s.cols) + ' cannot get a pivot: <b>' + (s.cols.length > 1 ? 'they are free columns' : 'it is a free column') + '</b>.';
        case 'echelon':
          return '<b>This is the echelon form U.</b> The pivots step down to the right like a staircase, with zeros underneath. ' + plural(r, 'pivot') + ', so the <b>rank is ' + r + '</b>. ' + (r ? 'Pivot ' + named(s.pivotCols, 'column') + '. ' : '') + (s.free.length ? 'Free ' + named(s.free, 'column') + '. ' : 'No free columns. ') +
            (all[idx + 1] && all[idx + 1].kind === 'done' ? 'Nothing above the pivots needs clearing and every pivot is already 1.' : 'Next, tidy up: zeros above the pivots, then make each pivot 1.');
        case 'elimUp':
          return 'Now work upward. <b>New row ' + (s.i + 1) + ' = ' + rowOp(s.i, s.k, s.mult) + '.</b> That puts a zero above the pivot in column ' + c1 + '.';
        case 'scale':
          return '<b>Divide row ' + (s.k + 1) + ' by ' + fmt(s.div) + '.</b> Its pivot becomes 1.';
        default:
          if (r === 0) return '<b>R is all zeros.</b> No pivots, rank 0. Every variable is free, so every <b>x</b> solves A<b>x</b> = <b>0</b>.';
          if (n === r) return '<b>This is R.</b> Every column has a pivot, so there are no free variables and no special solutions. The only <b>x</b> with A<b>x</b> = <b>0</b> is <b>x</b> = <b>0</b>.';
          return '<b>This is R.</b> Every pivot is 1, with zeros above and below it. Rank ' + r + ', and <i>n</i> − <i>r</i> = ' + n + ' − ' + r + ' = ' + (n - r) + ', so there ' + (n - r === 1 ? 'is 1 special solution' : 'are ' + (n - r) + ' special solutions') +
            '. To write one, put 1 in one free position and 0 in the other free positions, then copy that free column of R into the pivot positions with the signs flipped.';
      }
    }
    function render(s, idx) {
      var m = s.M.length, n = s.M[0].length, kinds = kindsOf(n, s.pivotCols, s.free), tint = {}, heads = [], j, i;
      for (j = 0; j < n; j++) heads.push(xvar(j));
      if (s.kind === 'elim' || s.kind === 'elimUp') tint[s.i] = 'h3';
      if (s.kind === 'swap') { tint[s.i] = 'h3'; tint[s.j] = 'h3'; }
      if (s.kind === 'scale') tint[s.k] = 'h3';
      var o = { kinds: kinds, heads: heads, labels: true, pivots: pivotCells(s.pivotCols), rows: tint };
      var parts = [];
      if (s.kind === 'done') {
        o.dimRows = {}; o.cap = 'R = rref(A)';
        for (i = s.pivotCols.length; i < m; i++) o.dimRows[i] = 1;
        parts.push(cmx(s.M, o));
        if (rr.freeCols.length) {
          var basis = LA.nullspace(M).basis;
          parts.push(cmx(LA.fromCols(basis), { rowHeads: heads, rowKinds: kinds, heads: basis.map(function (_, k) { return '<i><b>s</b></i><sub>' + (k + 1) + '</sub>'; }), cap: 'N · special solutions' }));
        }
      } else parts.push(cmx(s.M, o));
      return UI.eq.apply(null, parts) + '<p class="step-text">' + say(s, idx, steps) + '</p>';
    }
    var steps = [];
    var stepper = UI.stepper(slot(root, 'stepper'), {
      steps: [], delay: 1900, render: render,
      title: function (s) { return TITLES[s.kind] + (s.kind === 'pivot' ? ' in column ' + (s.col + 1) : ''); },
      onStep: function (s) {
        var n = s.M[0].length, r = rr.rank;
        out.piv(String(s.pivotCols.length)); out.free(String(s.free.length)); out.rank(s.after ? String(r) : '…');
        if (!s.after) UI.status(status, '', '<b>Elimination under way.</b> ' + plural(s.pivotCols.length, 'pivot') + ' and ' + plural(s.free.length, 'free column') + ' found so far. The rank is known once the staircase is complete.');
        else if (r === 0) UI.status(status, 'hot', '<b>Rank 0.</b> A matrix of zeros has no pivots. All ' + n + ' variables are free.');
        else if (r === n) UI.status(status, 'ok', '<b>Rank ' + r + ', and no free columns.</b> Every column holds a pivot, so A<b>x</b> = <b>0</b> forces <b>x</b> = <b>0</b>. Nothing can be changed without an effect.');
        else UI.status(status, 'ok', '<b>Rank ' + r + '.</b> Pivot ' + named(rr.pivotCols, 'column') + ', free ' + named(rr.freeCols, 'column') + '. ' + n + ' − ' + r + ' = ' + plural(n - r, 'free variable') + ', so the nullspace is built from ' + plural(n - r, 'special solution') + '.');
      }
    });
    function rebuild() {
      rr = LA.rref(M); steps = decorate(rr);
      out.shape(M.length + ' × ' + M[0].length);
      stepper.setSteps(steps);
    }
    about.innerHTML = '<span>' + PRE.lecture.about + '</span>';
    buildEditor(); rebuild();
  });

  /* ------------------------------------------------------------------ 7.2 */
  UI.lab('lab-special', function (root) {
    var A = [[1, 2, 2, 2], [2, 4, 6, 8], [3, 6, 8, 10]], U = [[1, 2, 2, 2], [0, 0, 2, 4], [0, 0, 0, 0]], R = [[1, 2, 0, -2], [0, 0, 1, 2], [0, 0, 0, 0]];
    var S1 = [-2, 1, 0, 0], S2 = [2, 0, -2, 1], KIN = ['p', 'f', 'p', 'f'], HEADS = [0, 1, 2, 3].map(xvar);
    var status = slot(root, 'status'), sl = slot(root, 'sliders'), bs = slot(root, 'backsub'), chk = slot(root, 'check'), rowsNote = slot(root, 'rows'), mix = slot(root, 'mix');
    var s2 = UI.slider(sl, { label: 'Free variable <span class="nm">x₂</span>', min: -3, max: 3, step: 0.5, value: 1, k: 2, onInput: update });
    var s4 = UI.slider(sl, { label: 'Free variable <span class="nm">x₄</span>', min: -3, max: 3, step: 0.5, value: 0, k: 2, onInput: update });
    UI.button(slot(root, 'buttons'), { label: 'Special solution 1', icon: 'target', cls: 'primary', onClick: function () { s2.set(1); s4.set(0); update(); } });
    UI.button(slot(root, 'buttons'), { label: 'Special solution 2', icon: 'target', cls: 'primary', onClick: function () { s2.set(0); s4.set(1); update(); } });
    UI.button(slot(root, 'buttons'), { label: 'Both zero', icon: 'reset', onClick: function () { s2.set(0); s4.set(0); update(); } });

    slot(root, 'U').innerHTML = UI.eq(cmx(U, { kinds: KIN, heads: HEADS, labels: true, pivots: [[0, 0], [1, 2]], dimRows: { 2: 1 }, cap: 'U · the echelon form' }));
    slot(root, 'npanel').innerHTML =
      UI.eq(cmx(R, { kinds: KIN, heads: HEADS, pivots: [[0, 0], [1, 2]], dimRows: { 2: 1 }, cap: 'R = rref(A)' })) +
      UI.eq(cmx(LA.fromCols([S1, S2]), { rowHeads: HEADS, rowKinds: KIN, heads: ['<i><b>s</b></i><sub>1</sub>', '<i><b>s</b></i><sub>2</sub>'], cap: 'N · special solutions' }));

    function blue(v) { return '<span class="u c2">' + par(v) + '</span>'; }
    function red(v) { return '<b class="u c1">' + num(v) + '</b>'; }
    function update() {
      var a = s2.get(), b = s4.get(), x3 = -2 * b, x1 = -2 * a - 2 * x3 - 2 * b, x = [x1, a, x3, b], i;
      bs.innerHTML =
        '<div class="bs-row"><span class="label">Row 2 of U</span><div><span class="m">2x<sub>3</sub> + 4x<sub>4</sub> = 0</span>' +
        '<span class="m">x<sub>3</sub> = −2x<sub>4</sub> = −2 · ' + blue(b) + ' = ' + red(x3) + '</span></div></div>' +
        '<div class="bs-row"><span class="label">Row 1 of U</span><div><span class="m">x<sub>1</sub> + 2x<sub>2</sub> + 2x<sub>3</sub> + 2x<sub>4</sub> = 0</span>' +
        '<span class="m">x<sub>1</sub> = −2 · ' + blue(a) + ' − 2 · <span class="u c1">' + par(x3) + '</span> − 2 · ' + blue(b) + ' = ' + red(x1) + '</span></div></div>';
      UI.hydrateMath(bs);
      var parts = [{ cls: 'left' }];
      for (i = 0; i < 4; i++) {
        if (i) parts.push('+');
        parts.push('<span class="m u c' + (KIN[i] === 'p' ? 1 : 2) + '">' + par(x[i]) + '</span>');
        parts.push(UI.mx(LA.col(A, i), { cols: { 0: KIN[i] === 'p' ? 'h1' : 'h2' }, cls: 'sm' }));
      }
      parts.push('='); parts.push(UI.mx(LA.mv(A, x), { cls: 'sm', fmt: function (v) { return num(v); } }));
      chk.innerHTML = UI.eq.apply(null, parts);
      rowsNote.innerHTML = A.map(function (row, r) {
        return '<span>row ' + (r + 1) + ': ' + row.map(function (v, j) { return par(v * x[j]); }).join(' + ') + ' = ' + num(LA.dot(row, x)) + '</span>';
      }).join('');
      mix.innerHTML = UI.eq({ cls: 'left' },
        UI.mx(x, { rows: { 0: 'h1', 1: 'h2', 2: 'h1', 3: 'h2' }, cls: 'sm', fmt: function (v) { return num(v); }, cap: 'x' }), '=',
        '<span class="m u c2">' + par(a) + '</span>', UI.mx(S1, { rows: { 0: 'h1', 1: 'h2', 2: 'h1', 3: 'h2' }, cls: 'sm', cap: 's₁' }), '+',
        '<span class="m u c2">' + par(b) + '</span>', UI.mx(S2, { rows: { 0: 'h1', 1: 'h2', 2: 'h1', 3: 'h2' }, cls: 'sm', cap: 's₂' }));
      if (a === 1 && b === 0) UI.status(status, 'ok', '<b>Special solution 1.</b> Free variable x₂ is switched on, x₄ is off. Back-substitution forces x₃ = 0 and x₁ = −2, so <b>x</b> = (−2, 1, 0, 0).');
      else if (a === 0 && b === 1) UI.status(status, 'ok', '<b>Special solution 2.</b> Free variable x₄ is switched on, x₂ is off. Back-substitution forces x₃ = −2 and x₁ = 2, so <b>x</b> = (2, 0, −2, 1).');
      else if (a === 0 && b === 0) UI.status(status, 'hot', '<b>The zero solution.</b> With both free variables at 0 the pivot variables are forced to 0 as well. Every other solution needs at least one free variable switched on.');
      else UI.status(status, '', '<b>Another point of the nullspace.</b> <b>x</b> = ' + tup(x) + ' is ' + num(a) + ' of special solution 1 plus ' + num(b) + ' of special solution 2. The free variables are the mixing amounts.');
    }
    update();
  });

  /* ------------------------------------------------------------------ 7.3 */
  UI.lab('lab-arm4', function (root) {
    var len = [1, 1, 1, 1], POSES = { stair: [90, -90, 90, -90], reach: [110, -50, -50, -50], straight: [35, 0, 0, 0] };
    var LIM = 1.2, STRAIN = 4;               /* joint speed limit (rad/s); how large F may grow before the drive eases off */
    var canvas = root.querySelector('canvas');
    var plot = new Plot2D(canvas, { cx: 0.6, cy: 1.3, w: 8.6 });
    var status = slot(root, 'status'), eqJ = slot(root, 'eqJ'), eqQ = slot(root, 'eqQ');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'rank of J', id: 'rank', c: 1 }, { k: 'spare joints n − r', id: 'spare', c: 2 }, { k: 'hand has moved', id: 'drift', c: 3 }, { k: 'fastest joint', id: 'fast' }]);
    var degFmt = function (x) { return fix(x, 0) + '°'; };
    var q = POSES.stair.map(LA.rad), target = null, ghost = null, st = {}, gliding = false, moving = false, eased = 1;
    var S = [0, 1, 2, 3].map(function (i) {
      return UI.slider(slot(root, 'angles'), { label: 'Joint ' + (i + 1) + ' angle <span class="nm">θ' + SUB[i] + '</span>', min: -180, max: 180, step: 1, value: POSES.stair[i], fmt: degFmt,
        onInput: function (v) { if (!gliding) seg.set('', false); q[i] = LA.rad(v); posed(); } });
    });
    var sc = UI.slider(slot(root, 'drive'), { label: '<span class="nm">c</span> &nbsp;how much of s₁', min: -1, max: 1, step: 0.05, value: 0, k: 2, fmt: f2, onInput: function () { render(); } });
    var sd = UI.slider(slot(root, 'drive'), { label: '<span class="nm">d</span> &nbsp;how much of s₂', min: -1, max: 1, step: 0.05, value: 0, k: 2, fmt: f2, onInput: function () { render(); } });
    var seg = UI.seg(slot(root, 'presets'), {
      label: 'Arm poses', value: 'stair',
      options: [{ v: 'stair', label: 'Staircase' }, { v: 'reach', label: 'Reaching' }, { v: 'straight', label: 'Straighten the arm' }],
      onChange: function (v) { sc.set(0); sd.set(0); gliding = true; glide(S, POSES[v], function () { gliding = false; q = POSES[v].map(LA.rad); posed(); }); }
    });
    UI.button(slot(root, 'buttons'), { label: 'Stop', icon: 'pause', onClick: function () { sc.set(0); sd.set(0); render(); } });
    UI.button(slot(root, 'buttons'), { label: 'Reset', icon: 'reset', onClick: function () { seg.set('stair', true); } });

    /* how hard the pivot joints must work for the free ones: the largest entry of F */
    function strainOf(ns) {
      var big = 0;
      ns.F.forEach(function (row) { row.forEach(function (v) { big = Math.max(big, Math.abs(v)); }); });
      return big;
    }
    function compute() {
      var pts = Robots.fk(len, q), J = Robots.jacobian(len, q), ns = LA.nullspace(J, 1e-7);
      st = { pts: pts, J: J, ns: ns, tip: pts[4], kinds: kindsOf(4, ns.pivotCols, ns.freeCols), strain: strainOf(ns) };
    }
    /* the user set a pose by hand: wherever the hand is now becomes the marked point */
    function posed() { compute(); target = st.tip.slice(); ghost = null; render(); }
    /* joint speeds asked for by the two sliders, and the speeds really applied */
    function rate() {
      var c = sc.get(), d = sd.get(), b = st.ns.basis;
      if (b.length < 2) return null;
      var raw = [0, 1, 2, 3].map(function (i) { return c * b[0][i] + d * b[1][i]; });
      var big = Math.max.apply(null, raw.map(Math.abs));
      var g = (big > LIM ? LIM / big : 1) * eased;
      return { raw: raw, v: raw.map(function (x) { return x * g; }), g: g, on: Math.abs(c) + Math.abs(d) > 1e-9 };
    }
    function render() {
      var ns = st.ns, r = ns.rank, kinds = st.kinds, rt = rate(), i;
      S.forEach(function (s, k) { s.el.className = 'slider k' + (kinds[k] === 'p' ? 1 : 2); });
      var heads = [0, 1, 2, 3].map(function (k) { return '<i>q̇</i><sub>' + (k + 1) + '</sub>'; }), dimR = {};
      for (i = r; i < 2; i++) dimR[i] = 1;
      eqJ.innerHTML = UI.eq({ cls: 'left gap' },
        cmx(st.J, { kinds: kinds, heads: heads, labels: true, fmt: f2, cls: 'sm', cap: 'J · one column per joint' }),
        cmx(ns.R, { kinds: kinds, heads: heads, pivots: pivotCells(ns.pivotCols), dimRows: dimR, fmt: f2, cls: 'sm', cap: 'R = rref(J)' }));
      var rowTint = {};
      kinds.forEach(function (k, j) { rowTint[j] = k === 'p' ? 'h1' : 'h2'; });
      var parts = [{ cls: 'left' }], c = sc.get(), d = sd.get();
      if (r === 2 && rt) {
        parts.push(cmx(rt.raw, { rowHeads: heads, rowKinds: kinds, fmt: f2, cls: 'sm', cap: 'joint speeds' }));
        parts.push('=');
        ns.basis.forEach(function (s, k) {
          if (k) parts.push('+');
          parts.push('<span class="m u c2">' + par(k ? d : c, f2) + '</span>');
          parts.push(UI.mx(s, { rows: rowTint, fmt: f2, cls: 'sm', cap: 's' + SUB[k] }));
        });
      } else {
        /* a singular pose: more special solutions than sliders, so just list them */
        parts[0] = { cls: 'left gap' };
        ns.basis.forEach(function (s, k) {
          parts.push(k ? UI.mx(s, { rows: rowTint, fmt: f2, cls: 'sm', cap: 's' + SUB[k] }) : cmx(s, { rowHeads: heads, rowKinds: kinds, fmt: f2, cls: 'sm', cap: 's' + SUB[k] }));
        });
      }
      eqQ.innerHTML = UI.eq.apply(null, parts);
      var moved = LA.norm(LA.vsub(st.tip, target));
      out.rank(String(r)); out.spare(String(4 - r)); out.drift(fix(moved * 1000, 1) + ' mm');
      out.fast(rt && rt.on && r === 2 ? fix(Math.max.apply(null, rt.v.map(Math.abs)), 2) + ' rad/s' : '0.00 rad/s');
      var pj = list(ns.pivotCols), fj = list(ns.freeCols);
      if (r < 2) UI.status(status, 'bad', '<b>Rank ' + r + ': a singularity.</b> Every joint lies on one line through the hand, so all four columns of J are parallel and the hand can only move sideways. Three joints are free and there are three special solutions. They hold for this instant only: at full stretch the arm has no room to reshape, so the drive is paused.');
      else if (st.strain > STRAIN) UI.status(status, 'hot', '<b>Rank 2, but the pivot joints are a poor pair here.</b> Joints ' + pj + ' are almost in line with the hand, so their columns are nearly parallel. To cover for a free joint they need up to ' + (st.strain > 99 ? 'hundreds of' : fix(st.strain, 1)) + ' times its speed. A free joint can lead no further this way: the drive eases off. Reverse c or d and the arm runs back.');
      else if (rt && rt.on) UI.status(status, 'ok', '<b>Self-motion.</b> Free joints ' + fj + ' turn as the sliders say, pivot joints ' + pj + ' follow the rule in R, and the hand has moved ' + fix(moved * 1000, 1) + ' mm from the ring.' + (rt.g < 0.999 ? ' Speeds are scaled down to respect a joint speed limit of ' + LIM + ' rad/s.' : ''));
      else UI.status(status, 'ok', '<b>Rank 2, with ' + (4 - r) + ' joints to spare.</b> Elimination made joints ' + pj + ' the pivot joints (red) and left joints ' + fj + ' free (blue). Slide c or d: the arm reshapes and the hand stays on the amber ring.');
      plot.draw();
    }
    plot.onDraw(function (p) {
      if (!st.pts) return;
      var cols = st.kinds.map(function (k) { return k === 'p' ? C.s1 : C.s2; }), rt = rate(), a = 0, i;
      p.grid({ labels: false, axes: false });
      p.circle([0, 0], 4, { color: C.faint, width: 1, dash: [3, 6] });
      p.note('edge of reach', -12, 16, { align: 'right', color: C.faint });
      if (ghost) Robots.drawArm(p, ghost, { ghost: true, gripper: false, base: false });
      Robots.drawArm(p, st.pts, { jointColors: cols, labels: ['θ₁', 'θ₂', 'θ₃', 'θ₄'] });
      if (rt && rt.on && st.ns.rank === 2) for (i = 0; i < 4; i++) { a += q[i]; turnMark(p, st.pts[i], 24, a, LA.clamp(rt.v[i] * 1.6, -2.6, 2.6), cols[i]); }
      p.point(target, { r: 10, fill: 'none', ring: C.s3, width: 2.5 });
      p.point(st.tip, { r: 3, color: C.s3 });
    });
    UI.loop(canvas, function (dt) {
      eased = 1;
      var rt = st.ns ? rate() : null;
      if (!rt || !rt.on || st.ns.rank < 2) { if (moving) { moving = false; render(); } return; }
      if (!ghost) ghost = st.pts.map(function (pt) { return pt.slice(); });
      moving = true;
      /* if this step would line the pivot joints up with the hand even more, ease off so the arm settles there;
         a step that leads away from that line runs at full speed */
      if (st.strain > STRAIN) {
        var ahead = LA.nullspace(Robots.jacobian(len, q.map(function (v, i) { return v + rt.v[i] * dt; })), 1e-7);
        if (ahead.rank < 2 || strainOf(ahead) > st.strain) { eased = Math.pow(STRAIN / st.strain, 2); rt = rate(); }
      }
      q = q.map(function (v, i) { return v + rt.v[i] * dt; });
      /* numerical drift: pull the hand back onto the ring. Solve (J Jᵀ) λ = error, then add Jᵀ λ to the joints */
      var J = Robots.jacobian(len, q), tip = Robots.fk(len, q)[4], e = LA.vsub(target, tip);
      var a = LA.dot(J[0], J[0]) + 1e-6, b = LA.dot(J[0], J[1]), d = LA.dot(J[1], J[1]) + 1e-6, det = a * d - b * b;
      var lam = [(d * e[0] - b * e[1]) / det, (a * e[1] - b * e[0]) / det];
      q = q.map(function (v, i) { return LA.wrapAngle(v + J[0][i] * lam[0] + J[1][i] * lam[1]); });
      S.forEach(function (s, i) { s.set(deg(q[i])); });
      compute(); render();
    });
    posed();
  });

  /* ------------------------------------------------------------------ 7.4 */
  UI.lab('lab-thrust4', function (root) {
    var Q = Math.PI / 2;
    var LAYOUTS = {
      pairs: { thr: [{ x: -1.3, y: 0.5, ang: 0 }, { x: 1.0, y: 0, ang: Q }, { x: -1.3, y: -0.5, ang: 0 }, { x: -1.0, y: 0, ang: Q }],
        tag: [[-1.5, 1.02], [1.78, 0], [-1.5, -1.02], [-0.62, -0.32]] },
      row: { thr: [{ x: -1.3, y: 0.5, ang: 0 }, { x: -1.3, y: 0, ang: 0 }, { x: -1.3, y: -0.5, ang: 0 }, { x: 1.0, y: 0, ang: Q }],
        tag: [[-1.5, 1.02], [-2.0, 0], [-1.5, -1.02], [1.78, 0]] }
    };
    var NAMES = ['T1', 'T2', 'T3', 'T4'], CMAX = 2, EMAX = 10;
    var lay = LAYOUTS.pairs, failed = [false, false, false, false];
    var pose = { x: 0, y: 0, th: 0 }, vel = [0, 0, 0], trail = [], D = null;
    var canvas = root.querySelector('canvas');
    var plot = new Plot2D(canvas, { cx: 0, cy: 0, w: 11 });
    var status = slot(root, 'status'), eqB = slot(root, 'eqB'), eqF = slot(root, 'eqF'), meter = slot(root, 'meter'), sl = slot(root, 'sliders');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'working thrusters', id: 'n' }, { k: 'rank', id: 'rank', c: 1 }, { k: 'spare n − r', id: 'spare', c: 2 }, { k: 'free thruster', id: 'free', c: 2 }]);
    var f1 = function (v) { return fix(v, 1); };
    var sFx = UI.slider(sl, { label: 'Forward push <span class="nm">F<sub>x</sub></span>', min: -2, max: 2, step: 0.1, value: 1, k: 3, fmt: f1, onInput: update });
    var sFy = UI.slider(sl, { label: 'Side push <span class="nm">F<sub>y</sub></span>', min: -2, max: 2, step: 0.1, value: 0, k: 3, fmt: f1, onInput: update });
    var sT = UI.slider(sl, { label: 'Turning effort <span class="nm">τ</span>', min: -1.5, max: 1.5, step: 0.1, value: 0, k: 3, fmt: f1, onInput: update });
    var sN = UI.slider(slot(root, 'null'), { label: 'Null amount <span class="nm">c</span> &nbsp;adds c × s', min: -CMAX, max: CMAX, step: 0.05, value: 0, k: 2, fmt: f2, onInput: update });
    UI.seg(slot(root, 'presets'), {
      label: 'Thruster layouts', value: 'pairs',
      options: [{ v: 'pairs', label: 'Two pairs' }, { v: 'row', label: 'Three astern, one at the bow' }],
      onChange: function (v) { lay = LAYOUTS[v]; sN.set(0); update(); }
    });
    var checks = NAMES.map(function (nm, i) {
      return UI.check(slot(root, 'fail'), { label: 'Fail ' + nm, onChange: function (on) { failed[i] = on; sN.set(0); update(); } });
    });
    UI.button(slot(root, 'buttons'), { label: 'Least effort', icon: 'target', cls: 'primary', onClick: function () { if (D && D.s && D.solvable) glide([sN], [D.cBest]); } });
    UI.button(slot(root, 'buttons'), { label: 'Stop', icon: 'pause', onClick: function () { sFx.set(0); sFy.set(0); sT.set(0); sN.set(0); update(); } });
    UI.button(slot(root, 'buttons'), { label: 'Repair all', icon: 'reset', onClick: function () {
      failed = [false, false, false, false]; checks.forEach(function (c) { c.set(false); });
      pose = { x: 0, y: 0, th: 0 }; vel = [0, 0, 0]; trail = []; update();
    } });

    function effort(p, s, c) { var e = 0; for (var i = 0; i < 4; i++) e += Math.abs(p[i] + (s ? c * s[i] : 0)); return e; }
    function update() {
      var B = Robots.thrusterMatrix(lay.thr), act = [0, 1, 2, 3].filter(function (i) { return !failed[i]; }), k = act.length;
      var want = [sFx.get(), sFy.get(), sT.get()], c = sN.get();
      var kinds = ['x', 'x', 'x', 'x'], p = [0, 0, 0, 0], f = [0, 0, 0, 0], s = null, solvable = false, rank = 0, R = null, piv = [], free = [];
      if (k) {
        var Ba = B.map(function (row) { return act.map(function (j) { return row[j]; }); });
        /* one solution: reduce [B b], set every free variable to 0 and read the pivot variables off the last column */
        var aug = LA.rref(Ba.map(function (row, i) { return row.concat([want[i]]); }));
        var ns = LA.nullspace(Ba);
        piv = ns.pivotCols; free = ns.freeCols; rank = ns.rank; R = ns.R;
        solvable = aug.pivotCols.indexOf(k) < 0;
        piv.forEach(function (pc) { kinds[act[pc]] = 'p'; });
        free.forEach(function (fc) { kinds[act[fc]] = 'f'; });
        if (solvable) piv.forEach(function (pc, i) { p[act[pc]] = aug.R[i][k]; });
        if (ns.basis.length) { s = [0, 0, 0, 0]; ns.basis[0].forEach(function (v, j) { s[act[j]] = v; }); }
        if (solvable) f = p.map(function (v, i) { return v + (s ? c * s[i] : 0); });
      }
      /* least total thrust: sum |p + c s| is piecewise linear in c, so the best c switches one thruster off */
      var cBest = 0, eBest = effort(p, s, 0);
      if (s) [-CMAX, CMAX].concat(s.map(function (v, i) { return Math.abs(v) > 1e-9 ? LA.clamp(-p[i] / v, -CMAX, CMAX) : 0; })).forEach(function (cc) {
        var e = effort(p, s, cc);
        if (e < eBest - 1e-9) { eBest = e; cBest = cc; }
      });
      cBest = Math.round(cBest * 20) / 20;
      var E = solvable ? effort(p, s, c) : 0;
      D = { B: B, act: act, kinds: kinds, p: p, f: f, s: s, solvable: solvable, rank: rank, want: want, cBest: cBest };
      sN.input.disabled = !(s && solvable);

      /* the matrices */
      var heads = NAMES.map(function (nm) { return nm; });
      var parts = [{ cls: 'left' }, cmx(B, { kinds: kinds, heads: heads, labels: true, cls: 'sm', cap: 'B · one column per thruster' })];
      if (R) {
        var kA = act.map(function (j) { return kinds[j]; }), dimR = {};
        for (var i = rank; i < 3; i++) dimR[i] = 1;
        parts.push('→');
        parts.push(cmx(R, { kinds: kA, heads: act.map(function (j) { return NAMES[j]; }), pivots: pivotCells(piv), dimRows: dimR, cls: 'sm', cap: k === 4 ? 'R = rref(B)' : 'R of the working columns' }));
      }
      eqB.innerHTML = UI.eq.apply(null, parts);
      var q = [{ cls: 'left' }];
      if (!solvable) q.push(cmx(['?', '?', '?', '?'], { rowHeads: heads, rowKinds: kinds, cls: 'sm', cap: 'thrusts f · no solution' }));
      else {
        q.push(cmx(f, { rowHeads: heads, rowKinds: kinds, fmt: f2, cls: 'sm', cap: 'thrusts f, in N' }));
        q.push('=');
        q.push(UI.mx(p, { fmt: f2, cls: 'sm', cap: free.length ? 'free one at 0' : 'only answer', dim: function (r) { return kinds[r] === 'x'; } }));
        if (s) { q.push('+'); q.push('<span class="m u c2">' + par(c, f2) + '</span>'); q.push(UI.mx(s, { cls: 'sm', cap: 's', dim: function (r) { return kinds[r] === 'x'; } })); }
      }
      eqF.innerHTML = UI.eq.apply(null, q);

      /* effort meter */
      var push = Math.sqrt(want[0] * want[0] + want[1] * want[1]);
      meter.innerHTML = '<div class="meter-top"><span>Total thrust effort Σ|f|</span><b>' + fix(E, 2) + ' N</b></div>' +
        '<div class="meter-bar"><i style="width:' + Math.min(100, E / EMAX * 100) + '%"></i>' + (solvable ? '<em style="left:' + Math.min(100, eBest / EMAX * 100) + '%"></em>' : '') + '</div>' +
        '<div class="meter-foot">' + (solvable ? 'net push ' + fix(push, 2) + ' N, turn ' + fix(want[2], 2) + ' N m · least possible effort ' + fix(eBest, 2) + ' N (white mark)' : 'thrusters held at zero') + '</div>';

      out.n(String(k)); out.rank(String(rank)); out.spare(String(k - rank)); out.free(free.length ? NAMES[act[free[0]]] : 'none');
      var dead = [0, 1, 2, 3].filter(function (i) { return failed[i]; }).map(function (i) { return NAMES[i]; });
      var deadTxt = dead.length ? dead.join(' and ') + (dead.length > 1 ? ' have' : ' has') + ' failed. ' : '';
      var freeName = free.length ? NAMES[act[free[0]]] : '', pivNames = piv.map(function (pc) { return NAMES[act[pc]]; }).join(', ');
      if (!k) UI.status(status, 'bad', '<b>No thrusters left.</b> No columns, rank 0. The vehicle can only drift.');
      else if (rank === 3 && s && Math.abs(c) > 1e-9) UI.status(status, 'ok', '<b>Same motion, different effort.</b> You added ' + f2(c) + ' × s. The net push and turn are unchanged, because B<b>s</b> = <b>0</b>, but the total thrust is now ' + fix(E, 2) + ' N against ' + fix(effort(p, s, 0), 2) + ' N with the free thruster at zero.');
      else if (rank === 3 && s) UI.status(status, 'ok', '<b>Full control, one thruster to spare.</b> Rank 3 from 4 columns, so n − r = 1. This answer sets the free thruster ' + freeName + ' to 0 and back-substitutes for ' + pivNames + '. The null slider adds any amount of s on top.');
      else if (rank === 3) UI.status(status, 'hot', '<b>Full control survives, with nothing to spare.</b> ' + deadTxt + 'The three working columns still have rank 3, so every push and turn has exactly one answer. The null slider has nothing left to add.');
      else if (solvable) UI.status(status, 'hot', '<b>Rank ' + rank + ': a direction is lost.</b> ' + deadTxt + 'This request happens to lie where the working columns can still reach. Ask for something else and it will fail.');
      else UI.status(status, 'bad', '<b>Rank ' + rank + ': this push and turn cannot be produced.</b> ' + deadTxt + 'The working columns no longer reach every (F<sub>x</sub>, F<sub>y</sub>, τ), and this request lies outside what they can do.');
      plot.draw();
    }
    plot.onDraw(function (p) {
      if (!D) return;
      p.view.cx = pose.x; p.view.cy = pose.y;
      p.s = p.W / p.view.w;
      p.grid({ labels: false, axes: false, major: 4 });
      Robots.drawTrail(p, trail, {});
      var cols = D.kinds.map(function (k) { return k === 'p' ? C.s1 : (k === 'f' ? C.s2 : C.faint); });
      Robots.drawVehicle(p, pose, lay.thr, { forces: D.f, colors: cols, scale: .75 });
      lay.thr.forEach(function (t, i) {
        p.text(NAMES[i], Robots.toWorld(pose, lay.tag[i]), { color: cols[i], align: 'center', bg: false });
        if (D.kinds[i] === 'x') {
          var d = [Math.cos(t.ang), Math.sin(t.ang)], m = [t.x - d[0] * .17, t.y - d[1] * .17], h = .2;
          p.line(Robots.toWorld(pose, [m[0] - h, m[1] - h]), Robots.toWorld(pose, [m[0] + h, m[1] + h]), { color: C.chalk, width: 2 });
          p.line(Robots.toWorld(pose, [m[0] - h, m[1] + h]), Robots.toWorld(pose, [m[0] + h, m[1] - h]), { color: C.chalk, width: 2 });
        }
      });
      /* the wanted push and turn, drawn at the centre: solid when delivered, dashed when out of reach */
      var w = Robots.rotate(pose.th, [D.want[0], D.want[1]]), c0 = [pose.x, pose.y], dash = D.solvable ? [] : [5, 4];
      if (LA.norm(w) > 0.02) p.arrow(c0, [c0[0] + w[0] * .75, c0[1] + w[1] * .75], { color: C.s3, width: 2.4, dash: dash });
      turnMark(p, c0, 30, pose.th - D.want[2] * .55, D.want[2] * 1.1, C.s3, 2.2);
    });
    UI.loop(canvas, function (dt) {
      if (!D) return;
      /* thrust -> acceleration, with water drag so the vehicle settles at a steady speed */
      var w = LA.mv(D.B, D.f), m = [1, 1, 0.8], drag = [1.3, 1.3, 1.6];
      for (var i = 0; i < 3; i++) vel[i] += (w[i] - drag[i] * vel[i]) / m[i] * dt;
      if (Math.abs(vel[0]) + Math.abs(vel[1]) + Math.abs(vel[2]) < 1e-4) return;
      pose = Robots.step(pose, vel, dt);
      Robots.pushTrail(trail, [pose.x, pose.y], 500, 0.05);
      plot.draw();
    });
    update();
  });

  /* ------------------------------------------------------------------ 7.5 */
  UI.lab('lab-rank', function (root) {
    var PRE = {
      lecture: [[1, 2, 2, 2], [2, 4, 6, 8], [3, 6, 8, 10]],
      one: [[1, 2, 3, 4], [2, 4, 6, 8], [3, 6, 9, 12]],
      full: [[1, 0, 1, 0], [0, 1, 0, 1], [-0.5, 1, 0.5, -1]]
    };
    var status = slot(root, 'status'), uA = slot(root, 'UA'), uT = slot(root, 'UT'), aT = slot(root, 'AT'), cA = slot(root, 'countA'), cT = slot(root, 'countT');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'pivots of A', id: 'ra', c: 1 }, { k: 'pivots of Aᵀ', id: 'rt', c: 1 }, { k: 'free in A', id: 'fa', c: 2 }, { k: 'free in Aᵀ', id: 'ft', c: 2 }]);
    var quiet = false;
    var ed = UI.mxInput(slot(root, 'A'), PRE.lecture, { id: 'rank-a', name: 'A', onChange: function (M) { if (!quiet) seg.set('', false); update(M); } });
    var seg = UI.seg(slot(root, 'presets'), {
      label: 'Example matrices', value: 'lecture',
      options: [{ v: 'lecture', label: 'Lecture matrix' }, { v: 'one', label: 'Rank 1' }, { v: 'full', label: 'Thruster matrix B' }],
      onChange: function (v) { load(PRE[v]); }
    });
    UI.button(slot(root, 'buttons'), { label: 'Random whole numbers', icon: 'loop', onClick: function () {
      var M = LA.zeros(3, 4).map(function (row) { return row.map(function () { return Math.floor(Math.random() * 7) - 3; }); });
      seg.set('', false); load(M);
    } });
    function load(M) { quiet = true; ed.set(M); quiet = false; }
    function panel(node, cnt, M, name, v) {
      var rr = LA.rref(M), n = M[0].length, kinds = kindsOf(n, rr.pivotCols, rr.freeCols), heads = [], dimR = {}, i;
      for (i = 0; i < n; i++) heads.push('<i>' + v + '</i><sub>' + (i + 1) + '</sub>');
      for (i = rr.rank; i < M.length; i++) dimR[i] = 1;
      node.innerHTML = UI.eq({ cls: 'left' }, cmx(rr.U, { kinds: kinds, heads: heads, labels: true, pivots: pivotCells(rr.pivotCols), dimRows: dimR, cap: 'echelon form of ' + name }));
      cnt.innerHTML = '<span><b>' + plural(rr.rank, 'pivot') + '</b></span><span>' + n + ' columns − ' + rr.rank + ' = <b>' + plural(n - rr.rank, 'free variable') + '</b></span>';
      return rr;
    }
    function update(M) {
      var T = LA.T(M);
      aT.innerHTML = UI.eq({ cls: 'left' }, UI.mx(T));
      var a = panel(uA, cA, M, 'A', 'x'), t = panel(uT, cT, T, 'Aᵀ', 'y'), r = a.rank;
      out.ra(String(a.rank)); out.rt(String(t.rank)); out.fa(String(4 - a.rank)); out.ft(String(3 - t.rank));
      if (a.rank !== t.rank) UI.status(status, 'bad', 'The two pivot counts differ, which the theory forbids. An entry is probably so close to zero that rounding has blurred it. Try rounder numbers.');
      else if (r === 0) UI.status(status, 'hot', '<b>Rank 0 both ways.</b> A matrix of zeros has no pivots whichever way it is turned.');
      else UI.status(status, 'ok', '<b>Same rank: ' + r + '.</b> A finds ' + plural(r, 'pivot') + ' among its 4 columns, leaving 4 − ' + r + ' = ' + (4 - r) + ' free. Aᵀ finds ' + plural(r, 'pivot') + ' among its 3 columns, leaving 3 − ' + r + ' = ' + (3 - r) + ' free.' +
        (r === 3 ? ' Aᵀ has no free variables, so the rows of A are independent.' : ' The pivots sit in different places, but there are always equally many.'));
    }
    update(PRE.lecture);
  });
})();
