/* ==========================================================================
   Lecture 4 labs: factorization into A = LU
   4.1 LU stepper (L fills up while A becomes U)   4.2 undo two rover moves
   4.3 cost of elimination, counted and timed      4.4 spline through waypoints
   4.5 the six 3 by 3 permutations
   ========================================================================== */
(function () {
  'use strict';
  var C = window.PlotColors, num = LA.num, fix = LA.fix, fmt = LA.fmt;
  function slot(root, name) { return root.querySelector('[data-slot="' + name + '"]'); }
  function deg(r) { return r * 180 / Math.PI; }
  /* inline maths */
  function mm(html, cls) { return '<span class="m' + (cls ? ' ' + cls : '') + '">' + html + '</span>'; }
  /* whole number with thousands separators */
  function commas(x) { return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  /* a large count in words, for narrow readouts */
  function human(x) {
    var U = [[1e12, ' trillion'], [1e9, ' billion'], [1e6, ' million']], i, v;
    for (i = 0; i < U.length; i++) if (x >= U[i][0]) { v = x / U[i][0]; return (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2)) + U[i][1]; }
    return commas(x);
  }
  function ease(k) { return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }

  /* ------------------------------------------------------------------ 4.1 */
  UI.lab('lab-lu', function (root) {
    var PRE = {
      lec: [[2, 1], [8, 7]],
      m25: [[1, 2, 1], [2, 5, 5], [0, 5, 17]],
      gen: [[2, 1, 1], [4, 3, 4], [6, 7, 14]]
    };
    var A = LA.clone(PRE.lec), form = 'lu', F = null, stepper = null;
    var status = slot(root, 'status'), box = slot(root, 'matrix');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'pivots found', id: 'piv', c: 1 }, { k: 'multipliers in L', id: 'mul', c: 3 }, { k: 'row exchanges', id: 'ex' }]);
    var seg = UI.seg(slot(root, 'presets'), {
      label: 'Example matrices', value: 'lec',
      options: [{ v: 'lec', label: 'Lecture 2 by 2' }, { v: 'm25', label: 'Multipliers 2 and 5' }, { v: 'gen', label: 'General 3 by 3' }],
      onChange: function (v) { A = LA.clone(PRE[v]); mount(); rebuild(); }
    });
    UI.seg(slot(root, 'form'), {
      label: 'Form of the answer', value: 'lu',
      options: [{ v: 'lu', label: 'A = L U' }, { v: 'ldu', label: 'A = L D U' }],
      onChange: function (v) { form = v; stepper.stop(); stepper.go(F.ok ? F.doneAt : stepper.index()); }
    });

    function rowName(i) { return 'row ' + (i + 1); }
    function copyKeys(o) { var c = {}, key; for (key in o) c[key] = o[key]; return c; }

    /* turn LA.eliminate's steps into the lab's steps, tracking L as it fills */
    function build(A0) {
      var n = A0.length, r = LA.eliminate(A0), L = LA.identity(n), known = {}, steps = [], prev = LA.clone(A0), halted = '';
      r.steps.forEach(function (s) {
        if (halted) return;
        var st = { kind: s.kind, M: s.M, k: s.k, i: s.i, mult: s.mult, npiv: s.pivots.length, before: prev };
        if (s.kind === 'swap') { halted = 'swap'; st.kind = 'needswap'; st.M = prev; st.j = s.j; }
        else if (s.kind === 'fail') halted = 'fail';
        else if (s.kind === 'elim' || s.kind === 'skip') { L[s.i][s.k] = s.mult; known[s.i + ',' + s.k] = 1; st.fresh = s.i + ',' + s.k; }
        st.L = LA.clone(L); st.known = copyKeys(known);
        steps.push(st); prev = s.M;
      });
      var ok = !halted, f = { steps: steps, ok: ok, halted: halted, n: n, A: LA.clone(A0), pivots: r.pivots, total: n * (n - 1) / 2 };
      if (ok) {
        var lu = LA.lu(A0), last = steps[steps.length - 1], E = LA.identity(n);
        r.ops.forEach(function (op) { E = LA.mul(op.M, E); });
        f.L = lu.L; f.U = lu.U; f.D = lu.D; f.Uunit = lu.Uunit; f.E = LA.cleanM(E); f.doneAt = steps.length - 1;
        ['rebuild'].concat(n === 3 ? ['evsl'] : []).forEach(function (kind) {
          steps.push({ kind: kind, M: last.M, L: last.L, known: last.known, npiv: n });
        });
      }
      return f;
    }

    function lView(st) {
      var n = F.n, rows = [], i, j;
      for (i = 0; i < n; i++) {
        rows.push([]);
        for (j = 0; j < n; j++) rows[i].push(i === j ? 1 : (j > i ? 0 : (st.known[i + ',' + j] ? st.L[i][j] : '·')));
      }
      return rows;
    }
    function lCells(st) { var c = {}, key; for (key in st.known) c[key] = 'h3'; return c; }
    function pivotList(count) { var p = [], i; for (i = 0; i < count; i++) p.push([i, i]); return p; }
    function size() { return F.n === 2 ? 'lg' : ''; }
    function par(v) { return v < 0 ? '(' + fmt(v) + ')' : fmt(v); }
    function text(html) { return '<p class="step-text">' + html + '</p>'; }
    function rowVec(v) { return '(' + v.map(function (x) { return fmt(x); }).join(', ') + ')'; }
    function multList() {
      var a = [], i, j;
      for (j = 0; j < F.n; j++) for (i = j + 1; i < F.n; i++) a.push(fmt(F.L[i][j]));
      return a;
    }
    function joinAnd(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }

    function working(st, o) {
      var cap = st.kind === 'start' ? 'A, untouched' : 'becoming U';
      return UI.eq(
        UI.mx(F.A, { cap: 'A', cls: size() }), '=',
        UI.mx(lView(st), { cap: 'L so far', cls: size(), cells: lCells(st), dim: function (i, j) { return j < i && !st.known[i + ',' + j]; }, hi: function (i, j) { return st.fresh === i + ',' + j ? 'new' : ''; } }),
        UI.mx(st.M, { cap: cap, cls: size(), pivots: pivotList(st.npiv), rows: o.rows || {}, cells: o.cells || {} }));
    }

    function render(st) {
      var n = F.n, k = st.kind, rows = {}, cells = {}, l, entry, piv, places = F.total === 1 ? 'one empty place' : F.total + ' empty places';
      if (k === 'start') {
        return working(st, {}) + text('Elimination has not started. <b>L</b> begins as the identity with ' + places + ' below the diagonal, one for each multiplier still to come. At every step of this lab, <b>L so far</b> times the matrix on its right equals <b>A</b>.');
      }
      if (k === 'pivot') {
        rows[st.k] = 'h1'; piv = st.M[st.k][st.k];
        return working(st, { rows: rows }) + text(st.k === 0
          ? 'The first pivot is <b>' + fmt(piv) + '</b>, the top-left entry. Every entry below it in column 1 has to become zero.'
          : (st.k === n - 1
            ? 'The last pivot is <b>' + fmt(piv) + '</b>. Nothing lies below it, so there is nothing left to clear.'
            : 'The next pivot is <b>' + fmt(piv) + '</b>, in row ' + (st.k + 1) + ', column ' + (st.k + 1) + '. The entry below it has to become zero.'));
      }
      if (k === 'elim') {
        rows[st.k] = 'h1'; rows[st.i] = 'h2'; l = st.mult; entry = st.before[st.i][st.k]; piv = st.before[st.k][st.k];
        return working(st, { rows: rows }) + text(
          (l > 0 ? 'Subtract <b>' + fmt(l) + ' × ' + rowName(st.k) + '</b> from ' + rowName(st.i)
                 : 'The multiplier is negative, so subtracting turns into adding: add <b>' + fmt(-l) + ' × ' + rowName(st.k) + '</b> to ' + rowName(st.i)) +
          '. A zero appears under the pivot. The multiplier <b class="c3">' + fmt(l) + '</b> is the entry ' + fmt(entry) + ' divided by the pivot ' + fmt(piv) +
          ', and it drops into L at row ' + (st.i + 1) + ', column ' + (st.k + 1) + ': the same position as the zero it made.');
      }
      if (k === 'skip') {
        rows[st.k] = 'h1'; rows[st.i] = 'h2';
        return working(st, { rows: rows }) + text('The entry in row ' + (st.i + 1) + ', column ' + (st.k + 1) + ' is already zero, so no subtraction is needed. The multiplier is <b class="c3">0</b>, and that 0 is what L records at row ' + (st.i + 1) + ', column ' + (st.k + 1) + '.');
      }
      if (k === 'needswap') {
        cells[st.k + ',' + st.k] = 'h1';
        return working(st, { cells: cells }) + text('A zero sits in the pivot position, row ' + (st.k + 1) + ', column ' + (st.k + 1) + '. A pivot cannot be zero, because the next step would divide by it. Elimination must first exchange ' + rowName(st.k) + ' with ' + rowName(st.j) + '. The plain A = L U of this lecture assumes no row exchanges. Lecture 5 puts the exchange into a permutation matrix and writes P A = L U.');
      }
      if (k === 'fail') {
        cells[st.k + ',' + st.k] = 'h1';
        return working(st, { cells: cells }) + text('Column ' + (st.k + 1) + ' has a zero in the pivot position and nothing but zeros below it, so no row exchange can help. <b>A is singular.</b> Elimination ends with fewer than ' + n + ' pivots, and no L U with ' + n + ' pivots exists.');
      }
      var pivs = joinAnd(F.pivots.map(function (p) { return fmt(p); })), mults = joinAnd(multList());
      if (k === 'upper') {
        if (form === 'ldu') {
          return UI.eq(
            UI.mx(F.A, { cap: 'A', cls: size() }), '=',
            UI.mx(F.L, { cap: 'L · multipliers', cls: size(), cells: lCells(st) }),
            UI.mx(F.D, { cap: 'D · pivots', cls: size(), pivots: pivotList(n) }),
            UI.mx(F.Uunit, { cap: 'U · ones on the diagonal', cls: size() })) +
            text('Divide each row of U by its pivot and collect the pivots in the diagonal matrix <b>D</b>. Now <b>L</b> and <b>U</b> both have ones on the diagonal, and the pivots ' + pivs + ' stand on their own in the middle. This is <b>A = L D U</b>.');
        }
        return UI.eq(
          UI.mx(F.A, { cap: 'A', cls: size() }), '=',
          UI.mx(F.L, { cap: 'L · multipliers', cls: size(), cells: lCells(st) }),
          UI.mx(F.U, { cap: 'U · pivots', cls: size(), pivots: pivotList(n) })) +
          text('Elimination is finished. <b>U</b> is upper triangular with the pivots ' + pivs + ' on its diagonal. <b>L</b> is lower triangular with ones on its diagonal and the multiplier' + (F.total > 1 ? 's ' : ' ') + '<b class="c3">' + mults + '</b> below, each in the position where it was used. This is <b>A = L U</b>.');
      }
      if (k === 'rebuild') {
        var lines = '', i, j, parts;
        for (i = 0; i < n; i++) {
          parts = [];
          for (j = 0; j < i; j++) parts.push('<b class="c3">' + par(F.L[i][j]) + '</b> × (row ' + (j + 1) + ' of U)');
          parts.push('(row ' + (i + 1) + ' of U)');
          lines += '<li>row ' + (i + 1) + ' of A = ' + parts.join(' + ') + ' = ' + rowVec(F.A[i]) + '</li>';
        }
        return UI.eq(
          UI.mx(F.L, { cap: 'L', cls: size(), cells: lCells(st) }),
          UI.mx(F.U, { cap: 'U', cls: size(), pivots: pivotList(n) }), '=',
          UI.mx(LA.cleanM(LA.mul(F.L, F.U)), { cap: 'L times U: this is A', cls: size() })) +
          text('Multiply back to check. Each row of L is a recipe that rebuilds one row of A from the rows of U:') +
          '<ul class="lu-rows">' + lines + '</ul>' +
          text('That is elimination read backwards. Every multiplier is used once, on a finished row of U, so nothing gets mixed.');
      }
      /* evsl: E against L */
      var e31 = F.E[2][0], l21 = F.L[1][0], l31 = F.L[2][0], l32 = F.L[2][1], stray = Math.abs(e31 + l31) > 1e-9, ec = {};
      if (stray) ec['2,0'] = 'h1';
      return UI.eq(
        mm('E'), '=', UI.mx(F.E, { cap: 'E takes A to U', cells: ec }),
        '<span class="op gap"></span>',
        mm('L'), '=', UI.mx(F.L, { cap: 'L takes U back to A', cells: lCells(st) })) +
        text(stray
          ? '<b>E</b> is the single matrix that does all of elimination at once: E A = U. Its entry <b class="c1">' + fmt(e31) + '</b> in row 3, column 1 is not a multiplier. The first step changed row 2 by ' + fmt(l21) + ' × row 1. A later step subtracted ' + fmt(l32) + ' × that changed row 2 from row 3, so row 3 picked up ' + fmt(l32) + ' × ' + fmt(l21) + ' = ' + fmt(l32 * l21) + ' of row 1 through row 2' + (Math.abs(l31) > 1e-9 ? ', on top of the ' + fmt(l31) + ' it lost directly: ' + fmt(l32 * l21) + ' − ' + fmt(l31) + ' = ' + fmt(e31) : '') + '. <b>L</b> runs the steps in the opposite order, so its entries are the multipliers ' + mults + ' and nothing else.'
          : '<b>E</b> is the single matrix that does all of elimination at once: E A = U. For this matrix E happens to be tidy as well, because one of the multipliers in positions (2,1) and (3,2) is zero, so row 3 never picks up row 1 through row 2. <b>L</b> is tidy for every matrix.');
    }

    function title(st) {
      switch (st.kind) {
        case 'start': return 'Start: A, and an empty L';
        case 'pivot': return 'Pivot ' + (st.k + 1);
        case 'elim': return 'Clear row ' + (st.i + 1) + ', column ' + (st.k + 1);
        case 'skip': return 'Already zero: row ' + (st.i + 1) + ', column ' + (st.k + 1);
        case 'needswap': return 'A row exchange is needed';
        case 'fail': return 'Singular: no pivot in column ' + (st.k + 1);
        case 'upper': return form === 'ldu' ? 'Finished: A = L D U' : 'Finished: A = L U';
        case 'rebuild': return 'Check: multiply L by U';
        default: return 'E against L: which one to keep';
      }
    }

    function onStep(st) {
      var got = [], i, j, nk = 0, key;
      for (key in st.known) nk++;
      for (j = 0; j < F.n; j++) for (i = j + 1; i < F.n; i++) if (st.known[i + ',' + j]) got.push(fmt(st.L[i][j]));
      out.piv(st.npiv ? F.pivots.slice(0, st.npiv).map(function (p) { return fmt(p); }).join(', ') : 'none yet');
      out.mul(got.length ? got.join(', ') : 'none yet');
      out.ex(F.halted === 'swap' ? 'needed' : (F.halted === 'fail' ? 'cannot help' : 'none needed'));
      if (st.kind === 'needswap') UI.status(status, 'hot', '<b>This matrix needs a row exchange.</b> A = L U on its own does not exist for it. Change an entry to remove the zero pivot, or meet P A = L U in Lecture 5.');
      else if (st.kind === 'fail') UI.status(status, 'bad', '<b>Singular matrix.</b> A pivot is missing, so elimination cannot finish and there is nothing to factor into.');
      else if (st.kind === 'upper' || st.kind === 'rebuild' || st.kind === 'evsl') {
        UI.status(status, 'ok', '<b>' + (form === 'ldu' ? 'A = L D U' : 'A = L U') + '.</b> No row exchanges were needed, so ' + (F.total === 1 ? 'the multiplier went' : 'all ' + F.total + ' multipliers went') + ' straight into L and the pivots sit on the diagonal of ' + (form === 'ldu' ? 'D' : 'U') + '.');
      } else {
        UI.status(status, '', '<b>' + nk + ' of ' + F.total + ' multiplier' + (F.total > 1 ? 's' : '') + ' recorded.</b> Each elimination step drops one number into L. Press <b>Next step</b>, or <b>Play</b> to watch it run.');
      }
    }

    function mount() {
      box.innerHTML = '';
      UI.mxInput(box, A, { id: 'lu-a', name: 'A', onChange: function (Mx) { A = Mx; seg.set('', false); rebuild(); } });
    }
    function rebuild() { F = build(A); stepper.setSteps(F.steps); }

    F = build(A);
    mount();
    stepper = UI.stepper(slot(root, 'stepper'), { steps: F.steps, render: render, title: title, onStep: onStep, delay: 2300 });
  });

  /* ------------------------------------------------------------------ 4.2 */
  UI.lab('lab-socks', function (root) {
    var canvas = root.querySelector('canvas');
    var plot = new Plot2D(canvas, { cx: 2.5, cy: 0, w: 11.5 });
    var status = slot(root, 'status'), eq = slot(root, 'eq'), sl = slot(root, 'sliders'), btns = slot(root, 'buttons');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'rover x', id: 'x' }, { k: 'rover y', id: 'y' }, { k: 'heading', id: 'th' }, { k: 'distance from home', id: 'd', c: 3 }]);
    var sA = UI.slider(sl, { label: 'Move A: drive', min: 1, max: 3.5, step: 0.1, value: 3, k: 1, fmt: function (v) { return fix(v, 1) + ' m'; }, onInput: reset });
    var sT = UI.slider(sl, { label: 'Move B: turn', min: -150, max: 150, step: 5, value: 70, k: 2, fmt: function (v) { return num(v, 0) + '°'; }, onInput: reset });
    var sD = UI.slider(sl, { label: 'Move B: then drive', min: 1, max: 3.5, step: 0.1, value: 2.5, k: 2, fmt: function (v) { return fix(v, 1) + ' m'; }, onInput: reset });
    UI.button(btns, { label: 'Undo B first, then A', icon: 'inverse', cls: 'primary', onClick: function () { run('right'); } });
    UI.button(btns, { label: 'Undo A first, then B', icon: 'inverse', onClick: function () { run('wrong'); } });
    UI.button(btns, { label: 'Replay A, then B', icon: 'play', onClick: function () { run('fwd'); } });

    var HOME = { x: 0, y: 0, th: 0 };
    var mode = 'idle', finished = true, pose = HOME, pose0 = HOME, queue = [], qi = 0, prog = 0, trail = [];

    function moves() {
      var a = sA.get(), th = LA.rad(sT.get()), d = sD.get();
      var A = LA.hom2(0, a, 0), B = LA.hom2(th, d * Math.cos(th), d * Math.sin(th));
      return { a: a, th: th, d: d, A: A, B: B, AB: LA.mul(A, B) };
    }
    function poseOf(T) { return { x: T[0][2], y: T[1][2], th: Math.atan2(T[1][0], T[0][0]) }; }
    function prim(type, amt, col) {
      return { type: type, amt: amt, col: col, dur: type === 'drive' ? 0.35 + Math.abs(amt) / 3.4 : 0.3 + Math.abs(amt) / 2.8 };
    }
    function apply(p, pr, f) {
      if (pr.type === 'turn') return { x: p.x, y: p.y, th: p.th + pr.amt * f };
      return { x: p.x + pr.amt * f * Math.cos(p.th), y: p.y + pr.amt * f * Math.sin(p.th), th: p.th };
    }
    function startPrim() {
      pose0 = pose; prog = 0;
      if (queue[qi].type === 'drive') trail.push({ a: [pose.x, pose.y], b: [pose.x, pose.y], col: queue[qi].col });
    }
    /* where the chosen undo really ends, straight from the matrix product */
    function result() {
      var m = moves(), iA = LA.inv(m.A), iB = LA.inv(m.B);
      if (mode === 'right') return LA.mul(m.AB, LA.mul(iB, iA));
      if (mode === 'wrong') return LA.mul(m.AB, LA.mul(iA, iB));
      return m.AB;
    }
    function reset() { mode = 'idle'; finished = true; trail = []; queue = []; pose = poseOf(moves().AB); report(); }
    function run(kind) {
      var m = moves();
      mode = kind; finished = false; trail = []; qi = 0;
      if (kind === 'fwd') { pose = HOME; queue = [prim('drive', m.a, C.s1), prim('turn', m.th, C.s2), prim('drive', m.d, C.s2)]; }
      else {
        pose = poseOf(m.AB);
        var undoB = [prim('drive', -m.d, C.s2), prim('turn', -m.th, C.s2)], undoA = [prim('drive', -m.a, C.s1)];
        queue = kind === 'right' ? undoB.concat(undoA) : undoA.concat(undoB);
      }
      startPrim();
      if (UI.reducedMotion()) { while (!finished) advance(10); }
      report();
    }
    function advance(dt) {
      var pr = queue[qi];
      prog += dt / pr.dur;
      pose = apply(pose0, pr, ease(Math.min(1, prog)));
      if (pr.type === 'drive') trail[trail.length - 1].b = [pose.x, pose.y];
      if (prog >= 1) {
        qi++;
        if (qi >= queue.length) { finished = true; pose = poseOf(result()); if (mode === 'fwd') mode = 'idle'; }
        else startPrim();
      }
    }
    function strs(T) {
      return [[fix(T[0][0], 2), fix(T[0][1], 2), fix(T[0][2], 2)], [fix(T[1][0], 2), fix(T[1][1], 2), fix(T[1][2], 2)], ['0', '0', '1']];
    }
    function report() {
      var m = moves(), dist = Math.sqrt(pose.x * pose.x + pose.y * pose.y), line2, R, tint = {};
      out.x(fix(pose.x, 2) + ' m'); out.y(fix(pose.y, 2) + ' m'); out.th(fix(deg(LA.wrapAngle(pose.th)), 0) + '°'); out.d(fix(dist, 2) + ' m');
      if (mode === 'right' && finished) {
        R = result();
        line2 = UI.eq({ cls: 'left' }, mm('A B B<sup>−1</sup> A<sup>−1</sup>'), '=', UI.mx(strs(R), { cls: 'sm', cols: { 0: 'h4', 1: 'h4', 2: 'h4' }, cap: 'the identity: home' }));
      } else if (mode === 'wrong' && finished) {
        R = result(); tint[2] = 'h3';
        line2 = UI.eq({ cls: 'left' }, mm('A B A<sup>−1</sup> B<sup>−1</sup>'), '=', UI.mx(strs(R), { cls: 'sm', cols: tint, cap: dist < 0.02 ? 'the identity, this once' : 'not the identity' }));
      } else {
        line2 = UI.eq({ cls: 'left' }, mm('A B'), '=', UI.mx(strs(m.AB), { cls: 'sm', cap: 'pose after both moves' }));
      }
      eq.innerHTML = UI.eq({ cls: 'left' },
        mm('A', 'c1'), '=', UI.mx(strs(m.A), { cls: 'sm', cap: 'drive' }),
        mm('B', 'c2'), '=', UI.mx(strs(m.B), { cls: 'sm', cap: 'turn, then drive' })) + line2;
      if (!finished) {
        UI.status(status, '', mode === 'fwd' ? 'Replaying: move <b>A</b>, then move <b>B</b>.'
          : (mode === 'right' ? 'Undoing <b>B</b> first (back up, turn back), then <b>A</b>.' : 'Undoing <b>A</b> first (back up), then <b>B</b> (back up, turn back).'));
      } else if (mode === 'right') {
        UI.status(status, 'ok', '<b>Home.</b> The last move was taken back first, so the rover retraced its own tracks. In symbols: (AB)<sup>−1</sup> = B<sup>−1</sup>A<sup>−1</sup>.');
      } else if (mode === 'wrong') {
        if (dist < 0.02) UI.status(status, 'hot', '<b>Home, but only because there is no turn.</b> Two drives along one straight line commute, so here the order of the undo moves makes no difference. Add a turn and try again.');
        else UI.status(status, 'bad', '<b>Lost: ' + fix(dist, 2) + ' m from home.</b> Each undo move was correct on its own. Doing them in the wrong order backed the rover along a line it never drove on.');
      } else {
        UI.status(status, '', 'The rover drove <b>A</b>, then turned and drove <b>B</b>. It is now ' + fix(dist, 2) + ' m from home. Both moves must be undone. Which one first?');
      }
      plot.draw();
    }
    plot.onDraw(function (p) {
      var m = moves(), P1 = [m.a, 0], E = [m.AB[0][2], m.AB[1][2]], fade = (mode === 'fwd' && !finished) ? .3 : 1;
      p.grid({ labels: false, axes: false });
      Robots.drawRover(p, HOME, { L: .95, W: .66, alpha: .32 });
      p.text('home', [0, 0], { dx: 0, dy: 30, align: 'center', color: C.dim });
      p.line([0, 0], P1, { color: C.s1, width: 2.6, alpha: fade });
      p.line(P1, E, { color: C.s2, width: 2.6, alpha: fade });
      if (Math.abs(m.th) > 0.02) {
        p.line(P1, [P1[0] + .9, 0], { color: C.faint, width: 1, dash: [2, 4] });
        p.arc(P1, 20, 0, m.th, { color: C.s2, width: 1.6, alpha: fade });
      }
      p.point(P1, { r: 3.2, color: C.chalk, alpha: fade });
      p.text('A', [m.a / 2, 0], { dx: 0, dy: -14, align: 'center', color: C.s1, math: true });
      p.text('B', [(P1[0] + E[0]) / 2, (P1[1] + E[1]) / 2], { dx: 13 * Math.sin(m.th) + (Math.abs(m.th) < .3 ? 0 : 0), dy: 13 * Math.cos(m.th) + (Math.abs(Math.cos(m.th)) < .2 ? -2 : 0), align: 'center', color: C.s2, math: true });
      trail.forEach(function (t) { p.line(t.a, t.b, { color: t.col, width: 2.4, dash: mode === 'fwd' ? [] : [5, 6] }); });
      if (finished && mode === 'right') p.point([0, 0], { r: 17, fill: 'none', ring: C.s4, width: 2.5 });
      if (finished && mode === 'wrong') {
        p.line([pose.x, pose.y], [0, 0], { color: C.s3, width: 1.4, dash: [2, 4] });
        p.point([pose.x, pose.y], { r: 17, fill: 'none', ring: C.s3, width: 2.5 });
      }
      Robots.drawRover(p, pose, { L: .95, W: .66 });
    });
    UI.loop(canvas, function (dt) {
      if (finished) return;
      advance(dt);
      report();
    });
    reset();
  });

  /* ------------------------------------------------------------------ 4.3 */
  /* tight LU on a flat Float64Array (row-major, no pivoting): the multipliers are
     stored in the places where the zeros appear, so one array holds both L and U  */
  function luFactor(a, n) {
    var k, i, j, kk, ii, piv, l;
    for (k = 0; k < n - 1; k++) {
      kk = k * n; piv = a[kk + k];
      for (i = k + 1; i < n; i++) {
        ii = i * n; l = a[ii + k] / piv; a[ii + k] = l;
        for (j = k + 1; j < n; j++) a[ii + j] -= l * a[kk + j];
      }
    }
  }
  /* L y = b going down, then U x = y coming back up; b starts at offset `at` */
  function luSolve(a, n, b, at, x) {
    var i, j, ii, s;
    for (i = 0; i < n; i++) { ii = i * n; s = b[at + i]; for (j = 0; j < i; j++) s -= a[ii + j] * x[j]; x[i] = s; }
    for (i = n - 1; i >= 0; i--) { ii = i * n; s = x[i]; for (j = i + 1; j < n; j++) s -= a[ii + j] * x[j]; x[i] = s / a[ii + i]; }
  }
  function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  /* average milliseconds per call, repeating short jobs so the clock can resolve them */
  function timeRuns(fn) {
    var t0 = now(), runs = 0, t;
    do { fn(); runs++; t = now() - t0; } while (t < 60 && runs < 4000);
    return t / runs;
  }
  function timeBoth(n, k) {
    var A0 = new Float64Array(n * n), W = new Float64Array(n * n), B = new Float64Array(n * k), x = new Float64Array(n), seed = 20240411, i, j, sums = [0, 0];
    function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 * 2 - 1; }
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) A0[i * n + j] = rnd() + (i === j ? n : 0);   /* strong diagonal: no row exchanges */
    for (i = 0; i < n * k; i++) B[i] = rnd();
    function scratch() { var r, s = 0; for (r = 0; r < k; r++) { W.set(A0); luFactor(W, n); luSolve(W, n, B, r * n, x); s += x[0] + x[n - 1]; } sums[0] = s; }
    function once() { var r, s = 0; W.set(A0); luFactor(W, n); for (r = 0; r < k; r++) { luSolve(W, n, B, r * n, x); s += x[0] + x[n - 1]; } sums[1] = s; }
    var tOnce = timeRuns(once), tScratch = timeRuns(scratch);
    /* residual of the last solve, as a check that the loops are right */
    var res = 0, s;
    for (i = 0; i < n; i++) { s = -B[(k - 1) * n + i]; for (j = 0; j < n; j++) s += A0[i * n + j] * x[j]; res = Math.max(res, Math.abs(s)); }
    return { scratch: tScratch, once: tOnce, same: Math.abs(sums[0] - sums[1]) < 1e-9, residual: res };
  }

  UI.lab('lab-cost', function (root) {
    var NS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 120, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000];
    var KS = [1, 2, 3, 5, 10, 20, 30, 50, 100, 200, 300, 500, 1000, 2000, 5000, 10000];
    var RATE = 1e8, TICK = RATE / 1000;      /* assumed operations per second, and per 1 ms tick */
    var bars = slot(root, 'bars'), eq = slot(root, 'eq'), status = slot(root, 'status'), timing = slot(root, 'timing'), sl = slot(root, 'sliders');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'speed-up', id: 'sp', c: 3 }, { k: 'work saved', id: 'sv', c: 3 }, { k: 'ticks per second, from scratch', id: 'r1', c: 1 }, { k: 'ticks per second, factored', id: 'r2', c: 2 }]);
    var presets = UI.seg(slot(root, 'presets'), {
      label: 'Sizes', value: '100',
      options: [{ v: '6', label: 'n = 6' }, { v: '50', label: 'n = 50' }, { v: '100', label: 'n = 100' }, { v: '500', label: 'n = 500' }],
      onChange: function (v) { sN.set(NS.indexOf(+v)); update(); }
    });
    var sN = UI.slider(sl, { label: 'Unknowns <span class="nm">n</span>', min: 0, max: NS.length - 1, step: 1, value: NS.indexOf(100), fmt: function (v) { return commas(NS[v]); }, onInput: function () { presets.set(String(NS[sN.get()]), false); update(); } });
    var sK = UI.slider(sl, { label: 'Right-hand sides <span class="nm">k</span>', min: 0, max: KS.length - 1, step: 1, value: KS.indexOf(1000), k: 2, fmt: function (v) { return commas(KS[v]); }, onInput: update });
    var btn = UI.button(slot(root, 'buttons'), { label: 'Time both on this device', icon: 'stopwatch', cls: 'primary', onClick: measure });

    bars.innerHTML = ['From scratch for every right-hand side', 'Factor once, then substitute'].map(function (name) {
      return '<div class="costrow"><div class="costrow-top"><span>' + name + '</span><b></b></div><div class="costbar"><i class="e1"></i><i class="e2"></i></div><div class="costrow-sub"></div></div>';
    }).join('');
    var rowsEl = UI.$$('.costrow', bars);
    function setRow(el, elim, subs, max) {
      var segs = el.querySelectorAll('i');
      segs[0].style.width = (100 * elim / max) + '%';
      segs[1].style.width = (100 * subs / max) + '%';
      el.querySelector('b').textContent = commas(elim + subs);
      el.querySelector('.costrow-sub').innerHTML = '<span class="c1">' + human(elim) + ' on A</span> + <span class="c2">' + human(subs) + ' on the right-hand sides</span>';
    }
    function rate(r) { return r >= 100 ? commas(r) : (r >= 10 ? fix(r, 1) : fix(r, 2)); }
    function counts(n, k) { var f = (n * n * n - n) / 3, s = n * n; return { f: f, s: s, scratch: k * (f + s), once: f + k * s }; }

    function update() {
      var n = NS[sN.get()], k = KS[sK.get()], c = counts(n, k), ratio = c.scratch / c.once, r1 = RATE / (c.f + c.s), r2 = RATE / c.s;
      setRow(rowsEl[0], k * c.f, k * c.s, c.scratch);
      setRow(rowsEl[1], c.f, k * c.s, c.scratch);
      eq.innerHTML = '<div class="costeq">' +
        '<span class="cost-tag">from scratch</span>' + mm('k × ((n³ − n)/3 + n²)') +
        '<span></span>' + mm('= ' + commas(k) + ' × (' + commas(c.f) + ' + ' + commas(c.s) + ') = <b class="c1">' + commas(c.scratch) + '</b>', 'u') +
        '<span class="cost-tag">factor once</span>' + mm('(n³ − n)/3 + k × n²') +
        '<span></span>' + mm('= ' + commas(c.f) + ' + ' + commas(k) + ' × ' + commas(c.s) + ' = <b class="c2">' + commas(c.once) + '</b>', 'u') + '</div>';
      out.sp(k === 1 ? 'none' : fix(ratio, ratio < 10 ? 2 : 1) + ' ×');
      out.sv(fix(100 * (1 - c.once / c.scratch), 1) + ' %');
      out.r1(rate(r1)); out.r2(rate(r2));
      var budget = 'One tick of a 1 kHz loop holds ' + commas(TICK) + ' operations at the assumed 10<sup>8</sup> per second. ';
      if (k === 1) UI.status(status, '', '<b>One right-hand side: nothing to reuse.</b> Both strategies do one elimination and one pair of substitutions, so the bars match. Raise <b>k</b>.');
      else if (r1 >= 1000) UI.status(status, 'ok', '<b>Both strategies fit a 1 kHz loop at this size.</b> ' + budget + 'From scratch a solve costs ' + commas(c.f + c.s) + ', with L and U stored it costs ' + commas(c.s) + ', which leaves the processor free for everything else.');
      else if (r2 >= 1000) UI.status(status, 'hot', '<b>Only factor-once keeps up with 1 kHz.</b> ' + budget + 'From scratch a solve costs ' + commas(c.f + c.s) + ' and overruns the tick. With L and U stored it costs ' + commas(c.s) + ' and fits.');
      else UI.status(status, 'bad', '<b>Too big for 1 kHz either way.</b> ' + budget + 'A stored L and U still manage ' + rate(r2) + ' solves a second against ' + rate(r1) + ' from scratch. The next trick is structure: Lab 4.4 solves 500 unknowns in about 1,500 operations.');
    }

    function measure() {
      var n0 = NS[sN.get()], k0 = KS[sK.get()], n = Math.min(n0, 300);
      var k = Math.max(1, Math.min(k0, Math.floor(5e7 / (n * n * n / 3 + n * n))));
      btn.disabled = true;
      UI.status(timing, '', 'Timing n = ' + n + ' with ' + commas(k) + ' right-hand side' + (k > 1 ? 's' : '') + ' …');
      setTimeout(function () {
        var r, c = counts(n, k), note = '';
        try { timeBoth(Math.min(n, 40), 2); r = timeBoth(n, k); } catch (err) { r = null; }
        btn.disabled = false;
        if (!r || !r.same || r.residual > 1e-6 || !(r.once > 0)) { UI.status(timing, 'bad', 'The timing run did not complete on this device. The operation counts above still hold.'); return; }
        if (n !== n0 || k !== k0) note = ' (The timed run is capped at n = 300 and about 50 million operations so that the page stays responsive.)';
        function ms(t) { return t >= 10 ? fix(t, 0) : (t >= 1 ? fix(t, 1) : fix(t, 2)); }
        UI.status(timing, 'ok', '<b>Measured: ' + fix(r.scratch / r.once, 1) + ' times faster.</b> For n = ' + n + ' and ' + commas(k) + ' right-hand side' + (k > 1 ? 's' : '') + ', from scratch took ' + ms(r.scratch) + ' ms and factor-once took ' + ms(r.once) + ' ms. Counting operations predicts ' + fix(c.scratch / c.once, 1) + ' times. A real processor also spends time fetching numbers from memory, so the two agree only roughly.' + note);
      }, 60);
    }
    UI.status(timing, '', 'The bars count operations. Press the button to run both strategies for real, with the sizes on the sliders, and compare.');
    update();
  });

  /* ------------------------------------------------------------------ 4.4 */
  UI.lab('lab-spline', function (root) {
    var DEFAULT = [[-5, -2.4], [-3.3, 0.4], [-1.3, 2], [0.5, 0.3], [2, -1.9], [3.8, -0.7], [5.2, 2.1]];
    var canvas = root.querySelector('canvas');
    var plot = new Plot2D(canvas, { cx: 0, cy: 0, w: 13 });
    var eq = slot(root, 'eq'), status = slot(root, 'status'), dotsEl = slot(root, 'dots'), pivEl = slot(root, 'pivots'), btns = slot(root, 'buttons');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'LU factorizations', id: 'nf', c: 1 }, { k: 'triangular solves', id: 'ns', c: 2 }, { k: 'operations per solve', id: 'ops' }, { k: 'largest acceleration', id: 'acc', c: 2 }]);
    var P = LA.clone(DEFAULT), F = null, nFactor = 0, nSolve = 0, Mx = [], My = [], rx = [], ry = [];
    var s = 0, hold = 0, playing = true, showAcc = true, event = 'load';

    /* LU of the 1, 4, 1 matrix: only two diagonals are ever non-zero, so keep just those */
    function factor(m) {
      var d = [4], l = [0], i;
      for (i = 1; i < m; i++) { l[i] = 1 / d[i - 1]; d[i] = 4 - l[i]; }
      return { m: m, l: l, d: d };
    }
    /* forward substitution with L, then back-substitution with U */
    function solve(f, r) {
      var m = f.m, y = [r[0]], x = new Array(m), i;
      for (i = 1; i < m; i++) y[i] = r[i] - f.l[i] * y[i - 1];
      x[m - 1] = y[m - 1] / f.d[m - 1];
      for (i = m - 2; i >= 0; i--) x[i] = (y[i] - x[i + 1]) / f.d[i];
      return x;
    }
    function rhs(pts, c) { var r = [], i; for (i = 1; i < pts.length - 1; i++) r.push(6 * (pts[i - 1][c] - 2 * pts[i][c] + pts[i + 1][c])); return r; }
    function accel(f, pts, c) { return [0].concat(solve(f, rhs(pts, c)), [0]); }
    /* one coordinate of the spline and its rate of change at parameter t (one time unit per gap) */
    function piece(pts, Mc, c, t) {
      var i = Math.max(0, Math.min(pts.length - 2, Math.floor(t))), u = t - i;
      var a = pts[i][c] - Mc[i] / 6, b = pts[i + 1][c] - Mc[i + 1] / 6;
      return [Mc[i] * Math.pow(1 - u, 3) / 6 + Mc[i + 1] * u * u * u / 6 + a * (1 - u) + b * u,
        -Mc[i] * (1 - u) * (1 - u) / 2 + Mc[i + 1] * u * u / 2 - a + b];
    }
    /* a fresh set of `count` waypoints taken evenly along the default path */
    function fromDefault(count) {
      if (count === DEFAULT.length) return LA.clone(DEFAULT);
      var f = factor(DEFAULT.length - 2), ax = accel(f, DEFAULT, 0), ay = accel(f, DEFAULT, 1), pts = [], j, t;
      for (j = 0; j < count; j++) {
        t = j * (DEFAULT.length - 1) / (count - 1);
        pts.push([Math.round(piece(DEFAULT, ax, 0, t)[0] * 10) / 10, Math.round(piece(DEFAULT, ay, 1, t)[0] * 10) / 10]);
      }
      return pts;
    }

    function dots(kind, m) {
      var h = '<span class="dotmx" style="--n:' + m + '">', i, j, c;
      for (i = 0; i < m; i++) for (j = 0; j < m; j++) {
        c = '';
        if (kind === 'T') c = Math.abs(i - j) <= 1 ? 'on' : '';
        else if (kind === 'L') c = i === j ? 'on' : (i - j === 1 ? 'mu' : '');
        else c = i === j ? 'pv' : (j - i === 1 ? 'on' : '');
        h += '<i' + (c ? ' class="' + c + '"' : '') + '></i>';
      }
      return h + '</span>';
    }
    function capped(html, cap) { return '<span class="mx-wrap">' + html + '<span class="mx-cap">' + cap + '</span></span>'; }
    function refactor() {
      var m = P.length - 2;
      F = factor(m); nFactor++;
      dotsEl.innerHTML = '<div class="dotrow">' + capped(dots('T', m), 'T') + '<span class="op">=</span>' + capped(dots('L', m), 'L') + capped(dots('U', m), 'U') + '</div>';
      pivEl.innerHTML = '<div class="pivline"><span>pivots of U, heading for 2 + √3 = ' + fix(2 + Math.sqrt(3), 4) + '</span><b class="c1">' + F.d.map(function (v) { return fix(v, 4); }).join('  ') + '</b></div>' +
        '<div class="pivline"><span>multipliers in L, heading for 2 − √3 = ' + fix(2 - Math.sqrt(3), 4) + '</span><b class="c3">' + F.l.slice(1).map(function (v) { return fix(v, 4); }).join('  ') + '</b></div>';
    }
    function resolve() {
      rx = rhs(P, 0); ry = rhs(P, 1);
      Mx = [0].concat(solve(F, rx), [0]); My = [0].concat(solve(F, ry), [0]);
      nSolve += 2;
      report();
    }
    function report() {
      var m = F.m, T = [], Mm = [], R = [], i, j, big = 0, f1 = function (v) { return fix(v, 1); };
      for (i = 0; i < m; i++) {
        T.push([]);
        for (j = 0; j < m; j++) T[i].push(i === j ? 4 : (Math.abs(i - j) === 1 ? 1 : 0));
        Mm.push([Mx[i + 1], My[i + 1]]); R.push([rx[i], ry[i]]);
        big = Math.max(big, Math.sqrt(Mx[i + 1] * Mx[i + 1] + My[i + 1] * My[i + 1]));
      }
      eq.innerHTML = UI.eq(
        UI.mx(T, { cls: 'sm', cap: 'T · never changes', dim: function (a, b) { return Math.abs(a - b) > 1; } }),
        UI.mx(Mm, { cls: 'sm', fmt: f1, cols: { 0: 'h2', 1: 'h2' }, cap: 'accelerations · x, y' }), '=',
        UI.mx(R, { cls: 'sm', fmt: f1, cols: { 0: 'h3', 1: 'h3' }, cap: 'from the waypoints · x, y' }));
      out.nf(String(nFactor)); out.ns(commas(nSolve)); out.ops((3 * m - 2) + ' (full: ' + (m * m) + ')'); out.acc(fix(big, 2) + ' m/s²');
      if (event === 'drag') UI.status(status, 'ok', '<b>Matrix factored once; this drag changed only the right-hand side.</b> Two quick solves with the stored L and U, one for x and one for y, redrew the whole path.');
      else if (event === 'count') UI.status(status, 'hot', '<b>The number of waypoints changed, so the matrix changed size and was factored again.</b> That is factorization number ' + nFactor + '. Now drag a waypoint: the count will not move.');
      else UI.status(status, '', '<b>Factored once.</b> T = L U was worked out when the lab loaded, before any waypoint was known to be final. Drag a waypoint and watch the counters: solves climb, factorizations stay put.');
      plot.draw();
    }

    function addHandle(i) {
      plot.handle({
        get: function () { return P[i] || [0, 0]; },
        set: function (x, y) { P[i] = [LA.clamp(x, -6.1, 6.1), LA.clamp(y, -4.45, 4.45)]; event = 'drag'; resolve(); },
        hidden: function () { return i >= P.length; },
        color: C.s3,
        label: function () { return i === 0 ? 'start' : (i === P.length - 1 ? 'end' : String(i)); }
      });
    }
    for (var h = 0; h < 8; h++) addHandle(h);

    var segCount = UI.seg(slot(root, 'count'), {
      label: 'Number of waypoints', value: '7',
      options: [{ v: '5', label: '5' }, { v: '6', label: '6' }, { v: '7', label: '7' }, { v: '8', label: '8' }],
      onChange: function (v) { P = fromDefault(+v); s = 0; hold = 0; event = 'count'; refactor(); resolve(); }
    });
    var bPlay = UI.button(btns, { label: 'Pause the rover', icon: 'pause', onClick: function () {
      playing = !playing;
      bPlay.innerHTML = icon(playing ? 'pause' : 'play') + '<span>' + (playing ? 'Pause the rover' : 'Drive the rover') + '</span>';
    } });
    UI.button(btns, { label: 'Reset waypoints', icon: 'reset', onClick: function () { P = fromDefault(P.length); s = 0; hold = 0; event = 'drag'; resolve(); segCount.set(String(P.length), false); } });
    UI.check(btns, { label: 'Show accelerations', checked: true, onChange: function (v) { showAcc = v; plot.draw(); } });

    plot.onDraw(function (p) {
      var n = P.length - 1, pts = [], i, t, x, y, v;
      p.grid({ labels: false, axes: false });
      if (!F || Mx.length !== P.length) return;
      p.path(P, { color: C.faint, width: 1.2, dash: [3, 5] });
      for (i = 0; i <= n * 24; i++) { t = i / 24; pts.push([piece(P, Mx, 0, t)[0], piece(P, My, 1, t)[0]]); }
      p.path(pts, { color: C.chalk, width: 2.6 });
      if (showAcc) for (i = 1; i < n; i++) p.arrow(P[i], [P[i][0] + Mx[i] * .3, P[i][1] + My[i] * .3], { color: C.s2, width: 2, head: 8 });
      x = piece(P, Mx, 0, s); y = piece(P, My, 1, s); v = Math.atan2(y[1], x[1]);
      Robots.drawRover(p, { x: x[0], y: y[0], th: v }, { L: .95, W: .66 });
    });
    UI.loop(canvas, function (dt) {
      if (!playing) return;
      var n = P.length - 1;
      if (hold > 0) { hold -= dt; if (hold <= 0) s = 0; }
      else { s += dt * 0.85; if (s >= n) { s = n; hold = 0.9; } }
      plot.draw();
    });
    refactor(); resolve();
  });

  /* ------------------------------------------------------------------ 4.5 */
  UI.lab('lab-perms', function (root) {
    /* p[i] = which old row becomes new row i (rows numbered from 0) */
    var PERMS = [
      { p: [0, 1, 2], html: 'I', say: 'identity' },
      { p: [1, 0, 2], html: 'P<sub>12</sub>', say: 'exchange 1, 2' },
      { p: [2, 1, 0], html: 'P<sub>13</sub>', say: 'exchange 1, 3' },
      { p: [0, 2, 1], html: 'P<sub>23</sub>', say: 'exchange 2, 3' },
      { p: [1, 2, 0], html: 'C', say: 'cycle: 2, 3, 1' },
      { p: [2, 0, 1], html: 'C<sup>2</sup>', say: 'cycle twice: 3, 1, 2' }
    ];
    var SIG = ['h1', 'h2', 'h4'];
    var a = 1, b = 4;                       /* P and Q: start with a pair that does not commute */
    var grid = slot(root, 'grid'), elPQ = slot(root, 'pq'), elQP = slot(root, 'qp'), elInv = slot(root, 'inv'), status = slot(root, 'status'), table = slot(root, 'table');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'P Q is', id: 'pq', c: 3 }, { k: 'Q P is', id: 'qp', c: 3 }, { k: 'inverse of P is', id: 'ip' }, { k: 'inverse of Q is', id: 'iq' }]);

    function find(p) { for (var k = 0; k < 6; k++) if (PERMS[k].p.join() === p.join()) return k; return -1; }
    /* index of the product (matrix i)(matrix j): new row r is old row q[p[r]] */
    function times(i, j) { var p = PERMS[i].p, q = PERMS[j].p; return find(p.map(function (v) { return q[v]; })); }
    function transposed(i) { var t = []; PERMS[i].p.forEach(function (v, r) { t[v] = r; }); return find(t); }
    function nm(k) { return mm(PERMS[k].html); }
    function pm(k) {
      var p = PERMS[k].p, cells = {};
      p.forEach(function (c, r) { cells[r + ',' + c] = SIG[c]; });
      return UI.mx(LA.permMatrix(p), { cls: 'sm', cells: cells, dim: function (i, j) { return p[i] !== j; } });
    }
    function curve(x0, y0, x1, y1, sig) {
      var dx = (x1 - x0) * .5;
      return '<path class="w' + sig + '" d="M' + x0 + ' ' + y0 + 'C' + (x0 + dx) + ' ' + y0 + ' ' + (x1 - dx) + ' ' + y1 + ' ' + x1 + ' ' + y1 + '"/>';
    }
    /* three signals pass through re-ordering `first`, then `second`, and reach three motors */
    function wires(first, second, n1, n2) {
      var Y = [38, 78, 118], xL = 28, xM = 146, xR = 244, h, i, src, sig, got = [];
      for (i = 0; i < 3; i++) got.push(first[second[i]] + 1);
      h = '<svg class="wire" viewBox="0 0 300 140" role="img" aria-label="Wiring: motors 1, 2, 3 receive signals ' + got.join(', ') + '">';
      h += '<text x="' + xL + '" y="13" text-anchor="middle">signals</text><text x="' + xM + '" y="13" text-anchor="middle">after ' + n1 + '</text><text x="298" y="13" text-anchor="end">after ' + n2 + ': motors</text>';
      for (i = 0; i < 3; i++) { src = first[i]; h += curve(xL + 10, Y[src], xM - 5, Y[i], src); }
      for (i = 0; i < 3; i++) { src = second[i]; h += curve(xM + 5, Y[src], xR - 7, Y[i], first[src]); }
      for (i = 0; i < 3; i++) {
        sig = first[second[i]];
        h += '<circle class="f' + i + '" cx="' + xL + '" cy="' + Y[i] + '" r="10"/><text class="in" x="' + xL + '" y="' + (Y[i] + 3.6) + '" text-anchor="middle">' + (i + 1) + '</text>';
        h += '<circle class="f' + first[i] + '" cx="' + xM + '" cy="' + Y[i] + '" r="5"/>';
        h += '<circle class="f' + sig + '" cx="' + (xR - 2) + '" cy="' + Y[i] + '" r="5"/>';
        h += '<rect class="mot" x="' + (xR + 6) + '" y="' + (Y[i] - 12) + '" width="44" height="24" rx="3"/><text class="mt" x="' + (xR + 28) + '" y="' + (Y[i] + 3.6) + '" text-anchor="middle">M' + (i + 1) + '</text>';
      }
      return { svg: h + '</svg>', got: got };
    }
    function panel(el, left, right, nl, nr) {
      var prod = times(left, right), w = wires(PERMS[right].p, PERMS[left].p, nr, nl);
      el.innerHTML = '<div class="permpanel"><span class="label">' + nl + ' ' + nr + ' &nbsp;·&nbsp; ' + nr + ' acts first, then ' + nl + '</span>' + w.svg +
        UI.eq(pm(left), pm(right), '=', pm(prod), '=', mm(PERMS[prod].html, 'c3')) +
        '<p class="permnote">Motors 1, 2, 3 receive signals ' + w.got.join(', ') + '.</p></div>';
    }
    function invPanel(k, letter) {
      var t = transposed(k);
      return '<div class="permpanel"><span class="label">Undo ' + letter + ' &nbsp;·&nbsp; inverse = transpose</span>' +
        UI.eq(mm(letter + '<sup class="u">T</sup> ' + letter), '=', pm(t), pm(k), '=', pm(0)) +
        '<p class="permnote">' + mm(letter + '<sup>−1</sup> = ' + letter + '<sup class="u">T</sup>') + ' is ' + nm(t) + (t === k ? ', the same matrix. An exchange undoes itself.' : (k === 0 ? '.' : ', the other cycle.')) + '</p></div>';
    }

    grid.innerHTML = PERMS.map(function (o, k) {
      return '<div class="permcard" data-k="' + k + '">' + pm(k) + '<span class="pname">' + mm(o.html) + '</span><span class="psay">' + o.say + '</span>' +
        '<span class="ppick" role="group" aria-label="Use this matrix as"><button type="button" data-as="a" data-k="' + k + '">as P</button><button type="button" data-as="b" data-k="' + k + '">as Q</button></span>' +
        '<span class="ptag"></span></div>';
    }).join('');
    grid.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('button[data-as]') : null;
      if (!t) return;
      if (t.getAttribute('data-as') === 'a') a = +t.getAttribute('data-k'); else b = +t.getAttribute('data-k');
      update();
    });
    table.innerHTML = '<table class="ptable"><thead><tr><th><span class="pcorner">P \\ Q</span></th>' + PERMS.map(function (o) { return '<th>' + mm(o.html) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      PERMS.map(function (o, i) {
        return '<tr><th>' + mm(o.html) + '</th>' + PERMS.map(function (q, j) {
          return '<td><button type="button" data-i="' + i + '" data-j="' + j + '" aria-label="Choose this pair">' + mm(PERMS[times(i, j)].html) + '</button></td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody></table>';
    table.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('button[data-i]') : null;
      if (!t) return;
      a = +t.getAttribute('data-i'); b = +t.getAttribute('data-j');
      update();
    });

    function update() {
      var pq = times(a, b), qp = times(b, a);
      UI.$$('.permcard', grid).forEach(function (card, k) {
        var tags = [];
        if (k === pq) tags.push('= P Q');
        if (k === qp) tags.push('= Q P');
        card.className = 'permcard' + (tags.length ? ' hit' : '');
        card.querySelector('.ptag').textContent = tags.join('   ');
        card.querySelector('[data-as="a"]').setAttribute('aria-pressed', k === a);
        card.querySelector('[data-as="b"]').setAttribute('aria-pressed', k === b);
      });
      UI.$$('button', table).forEach(function (cell) {
        var i = +cell.getAttribute('data-i'), j = +cell.getAttribute('data-j');
        cell.className = (i === a && j === b) ? 'cur' : ((i === b && j === a) ? 'mirror' : '');
      });
      panel(elPQ, a, b, 'P', 'Q');
      panel(elQP, b, a, 'Q', 'P');
      elInv.innerHTML = invPanel(a, 'P') + invPanel(b, 'Q');
      out.pq(nm(pq)); out.qp(nm(qp)); out.ip(nm(transposed(a))); out.iq(nm(transposed(b)));
      if (pq !== qp) UI.status(status, 'hot', '<b>Order matters for this pair.</b> ' + mm('P Q') + ' is ' + nm(pq) + ', but ' + mm('Q P') + ' is ' + nm(qp) + '. The motors end up wired differently. Both answers are still in the list of six.');
      else UI.status(status, 'ok', '<b>These two commute:</b> both orders give ' + nm(pq) + '. ' + (a === 0 || b === 0 ? 'The identity changes nothing, so it commutes with every matrix.' : (a === b ? 'A matrix always commutes with itself.' : 'Both are made from the same cycle, one turn or two, so the order does not matter.')));
    }
    update();
  });
})();
