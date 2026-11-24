/* ==========================================================================
   Lecture 3 labs: multiplication and inverse matrices
   3.1 four ways to multiply, size rule   3.2 forward kinematics as a product
   3.3 AB against BA with a rover         3.4 Gauss-Jordan stepper
   3.5 the inverse as a change of view    3.6 flattening: no way back
   ========================================================================== */
(function () {
  'use strict';
  var C = window.PlotColors, num = LA.num, fix = LA.fix;
  function slot(root, name) { return root.querySelector('[data-slot="' + name + '"]'); }
  function f2(v) { return fix(v, 2); }
  function n2(v) { return num(v, 2); }
  function int(v) { return num(v, 0); }
  function degs(v) { return fix(v, 0) + '°'; }
  function deg(r) { return r * 180 / Math.PI; }
  function pair(p) { return '(' + f2(p[0]) + ', ' + f2(p[1]) + ')'; }
  function one(k, v) { var o = {}; o[k] = v; return o; }
  function all() { return true; }
  /* an upright number for live inline maths, optionally in a series colour */
  function mu(v, c) { return '<span class="m u' + (c ? ' c' + c : '') + '">' + (typeof v === 'number' ? num(v) : v) + '</span>'; }
  /* a 3 by 3 planar transform as text: two decimals on top, a plain 0 0 1 underneath */
  function homStr(T) { return [T[0].map(f2), T[1].map(f2), ['0', '0', '1']]; }
  /* a name set in the maths face, for labels beside live equations */
  function nm(html) { return '<span class="m eq-name">' + html + '</span>'; }
  var INV = 'A<sup>−1</sup>', LC = function (t) { return '<span class="lc">' + t + '</span>'; };
  function ease(k) { return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  /* ease a set of sliders to target values */
  function glide(sliders, targets, done) {
    var from = sliders.map(function (s) { return s.get(); }), t0 = null, dur = UI.reducedMotion() ? 1 : 900;
    function frame(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = ease(k);
      sliders.forEach(function (s, i) { s.set(from[i] + (targets[i] - from[i]) * e, true); });
      if (k < 1) requestAnimationFrame(frame); else { sliders.forEach(function (s, i) { s.set(targets[i], true); }); if (done) done(); }
    }
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------------ 3.1 */
  UI.lab('lab-ways', function (root) {
    var A = [[2, 7], [3, 8], [4, 9]], B = [[1, 6], [1, 2]], P = LA.mul(A, B);
    function outer(c, r) { return c.map(function (x) { return r.map(function (y) { return x * y; }); }); }
    var P1 = outer(LA.col(A, 0), B[0]), P2 = outer(LA.col(A, 1), B[1]);
    var mode = 'entry';
    var STEPS = {
      entry: [0, 1, 2, 3, 4, 5].map(function (k) { return { i: Math.floor(k / 2), j: k % 2 }; }),
      cols: [{ j: 0 }, { j: 1 }],
      rows: [{ i: 0 }, { i: 1 }, { i: 2 }],
      outer: [{ k: 0 }, { k: 1 }, { k: 2 }]
    };
    function sub(letter, idx) { return '<span class="m">' + letter + '<sub class="u">' + idx + '</sub></span>'; }
    function tap(html, go) { return '<span class="tap"' + (go === undefined ? '' : ' data-go="' + go + '"') + '>' + html + '</span>'; }
    function lbl(t) { return '<span class="eq-lbl">' + t + '</span>'; }
    function text(t) { return '<p class="step-text">' + t + '</p>'; }
    var CAP = { A: 'A · 3 by 2', B: 'B · 2 by 2', C: 'C = AB · 3 by 2' };

    function title(s) {
      if (mode === 'entry') return 'Way 1 · row ' + (s.i + 1) + ' of A times column ' + (s.j + 1) + ' of B';
      if (mode === 'cols') return 'Way 2 · A times column ' + (s.j + 1) + ' of B';
      if (mode === 'rows') return 'Way 3 · row ' + (s.i + 1) + ' of A times B';
      return s.k < 2 ? 'Way 4 · column ' + (s.k + 1) + ' of A times row ' + (s.k + 1) + ' of B' : 'Way 4 · add the pieces';
    }
    function render(s, k) {
      var top, work, say;
      if (mode === 'entry') {
        var i = s.i, j = s.j, a = A[i], b = LA.col(B, j);
        top = UI.eq({ cls: 'lg' },
          UI.mx(A, { rows: one(i, 'h1'), cap: CAP.A }), UI.mx(B, { cols: one(j, 'h2'), cap: CAP.B }), '=',
          tap(UI.mx(P, { cells: one(i + ',' + j, 'h3'), dim: function (r, c) { return r * 2 + c > k; }, cap: CAP.C })));
        work = UI.eq({ cls: 'arith' }, sub('c', '' + (i + 1) + (j + 1)), '=',
          mu(a[0], 1), '·', mu(b[0], 2), '+', mu(a[1], 1), '·', mu(b[1], 2), '=',
          mu(a[0] * b[0]), '+', mu(a[1] * b[1]), '=', mu(P[i][j], 3));
        say = 'The entry in <b>row ' + (i + 1) + '</b>, <b>column ' + (j + 1) + '</b> of C uses row ' + (i + 1) + ' of A and column ' + (j + 1) + ' of B and nothing else. Multiply the matching pairs, then add.';
      } else if (mode === 'cols') {
        var jc = s.j, cb = {};
        cb['0,' + jc] = 'h1'; cb['1,' + jc] = 'h2';
        top = UI.eq({ cls: 'lg' },
          UI.mx(A, { cols: { 0: 'h1', 1: 'h2' }, cap: CAP.A }),
          UI.mx(B, { cells: cb, dim: function (r, c) { return c !== jc; }, cap: CAP.B }), '=',
          tap(UI.mx(P, { cols: one(jc, 'h3'), dim: function (r, c) { return c > jc; }, cap: CAP.C })));
        work = UI.eq({ cls: 'arith' }, lbl('column ' + (jc + 1) + ' of C'), '=',
          mu(B[0][jc], 1), UI.mx(LA.col(A, 0), { cols: { 0: 'h1' } }), '+',
          mu(B[1][jc], 2), UI.mx(LA.col(A, 1), { cols: { 0: 'h2' } }), '=', UI.mx(LA.col(P, jc), { cols: { 0: 'h3' } }));
        say = 'Column ' + (jc + 1) + ' of B holds the amounts <b>' + B[0][jc] + '</b> and <b>' + B[1][jc] + '</b>. Take that much of the first and second columns of A and add. Every column of C is a combination of the <b>columns of A</b>.';
      } else if (mode === 'rows') {
        var ir = s.i, ca = {};
        ca[ir + ',0'] = 'h1'; ca[ir + ',1'] = 'h2';
        top = UI.eq({ cls: 'lg' },
          UI.mx(A, { cells: ca, dim: function (r) { return r !== ir; }, cap: CAP.A }),
          UI.mx(B, { rows: { 0: 'h1', 1: 'h2' }, cap: CAP.B }), '=',
          tap(UI.mx(P, { rows: one(ir, 'h3'), dim: function (r) { return r > ir; }, cap: CAP.C })));
        work = UI.eq({ cls: 'arith' }, lbl('row ' + (ir + 1) + ' of C'), '=',
          mu(A[ir][0], 1), UI.mx([B[0]], { rows: { 0: 'h1' } }), '+',
          mu(A[ir][1], 2), UI.mx([B[1]], { rows: { 0: 'h2' } }), '=', UI.mx([P[ir]], { rows: { 0: 'h3' } }));
        say = 'Row ' + (ir + 1) + ' of A holds the amounts <b>' + A[ir][0] + '</b> and <b>' + A[ir][1] + '</b>. Take that much of the first and second rows of B and add. Every row of C is a combination of the <b>rows of B</b>.';
      } else if (s.k < 2) {
        var q = s.k, h = q === 0 ? 'h1' : 'h2', piece = q === 0 ? P1 : P2;
        top = UI.eq({ cls: 'lg' },
          UI.mx(A, { cols: one(q, h), dim: function (r, c) { return c !== q; }, cap: CAP.A }),
          UI.mx(B, { rows: one(q, h), dim: function (r) { return r !== q; }, cap: CAP.B }), '=',
          tap(UI.mx(P, { dim: all, cap: CAP.C }), 2));
        work = UI.eq({ cls: 'arith' },
          UI.mx(LA.col(A, q), { cols: { 0: h } }), UI.mx([B[q]], { rows: { 0: h } }), '=',
          UI.mx(piece, { cols: { 0: h, 1: h }, cap: 'piece ' + (q + 1) + ' · 3 by 2' }));
        say = q === 0
          ? 'A 3 by 1 column times a 1 by 2 row is a full 3 by 2 matrix. Every row of it is a multiple of <b>[1 6]</b> and every column is a multiple of <b>(2, 3, 4)</b>. This is the special matrix from the lecture.'
          : 'The second column of A times the second row of B gives a second piece of the same special kind: every row is a multiple of <b>[1 2]</b> and every column is a multiple of <b>(7, 8, 9)</b>.';
      } else {
        top = UI.eq({ cls: 'lg' },
          UI.mx(A, { cols: { 0: 'h1', 1: 'h2' }, cap: CAP.A }), UI.mx(B, { rows: { 0: 'h1', 1: 'h2' }, cap: CAP.B }), '=',
          tap(UI.mx(P, { cols: { 0: 'h3', 1: 'h3' }, cap: CAP.C }), 2));
        work = UI.eq({ cls: 'arith' },
          tap(UI.mx(P1, { cols: { 0: 'h1', 1: 'h1' }, cap: 'piece 1' }), 0), '+',
          tap(UI.mx(P2, { cols: { 0: 'h2', 1: 'h2' }, cap: 'piece 2' }), 1), '=',
          UI.mx(P, { cols: { 0: 'h3', 1: 'h3' }, cap: 'AB' }));
        say = 'Add the two pieces entry by entry and the product is complete. Check one entry: <b>12 + 14 = 26</b>. AB is the sum of (column of A) times (row of B), one piece for each column of A.';
      }
      return top + work + text(say);
    }

    var view = slot(root, 'stepper');
    var stepper = UI.stepper(view, { steps: STEPS.entry, title: title, render: render, delay: 1900 });
    UI.seg(slot(root, 'mode'), {
      label: 'Way of multiplying', value: 'entry',
      options: [{ v: 'entry', label: 'Entries' }, { v: 'cols', label: 'Columns' }, { v: 'rows', label: 'Rows' }, { v: 'outer', label: 'Column × row' }],
      onChange: function (v) { mode = v; stepper.setSteps(STEPS[v]); }
    });
    /* tap an entry of C (or a piece) to jump to the step that makes it */
    view.addEventListener('click', function (e) {
      var box = e.target.closest ? e.target.closest('.tap') : null;
      if (!box) return;
      var cell = e.target.closest('.mx > span'), go = box.getAttribute('data-go');
      if (go === null) {
        if (!cell) return;
        var idx = Array.prototype.indexOf.call(cell.parentNode.children, cell);
        go = mode === 'entry' ? idx : (mode === 'cols' ? idx % 2 : Math.floor(idx / 2));
      }
      stepper.stop();
      stepper.go(+go);
    });

    /* ---- the size rule checker ---- */
    var sizes = slot(root, 'sizes'), shape = slot(root, 'shape'), status = slot(root, 'status');
    function mk(label, v, k) { return UI.slider(sizes, { label: label, min: 1, max: 4, step: 1, value: v, k: k, fmt: int, onInput: check }); }
    var S = [
      mk('Rows of A &nbsp;<span class="nm">m</span>', 3, 3), mk('Columns of A &nbsp;<span class="nm">n</span>', 2, 1),
      mk('Rows of B', 2, 2), mk('Columns of B &nbsp;<span class="nm">p</span>', 2, 3)
    ];
    function dots(r, c, kind) {
      var h = '<span class="mx dots" style="--cols:' + c + '">';
      for (var i = 0; i < r; i++) for (var j = 0; j < c; j++) {
        var cls = kind === 'A' && i === 0 ? 'r' : (kind === 'B' && j === 0 ? 'c' : (kind === 'C' ? 'y' : ''));
        h += '<i' + (cls ? ' class="' + cls + '"' : '') + '></i>';
      }
      return h + '</span>';
    }
    function capd(html, cap) { return '<span class="mx-wrap">' + html + '<span class="mx-cap">' + cap + '</span></span>'; }
    function count(k) { return k + (k === 1 ? ' number' : ' numbers'); }
    function check() {
      var m = S[0].get(), n = S[1].get(), nb = S[2].get(), p = S[3].get(), ok = n === nb;
      shape.innerHTML = UI.eq({ cls: 'left' },
        capd(dots(m, n, 'A'), 'A · ' + m + ' by ' + n), capd(dots(nb, p, 'B'), 'B · ' + nb + ' by ' + p), ok ? '=' : '→',
        ok ? capd(dots(m, p, 'C'), 'AB · ' + m + ' by ' + p) : '<span class="nope">no product</span>');
      if (ok) {
        UI.status(status, 'ok', '<b>AB exists and is ' + m + ' by ' + p + '.</b> A row of A holds ' + count(n) + ' and so does a column of B, so row times column works. The inner sizes match and drop out. The outer sizes, ' + m + ' and ' + p + ', give the shape of the answer. ' +
          (p === m ? 'The other order, BA, also exists here and is ' + nb + ' by ' + n + '.' : 'The other order, BA, does not exist: its inner sizes would be ' + p + ' and ' + m + '.'));
      } else {
        UI.status(status, 'bad', '<b>AB does not exist.</b> A row of A (red) holds ' + count(n) + ' but a column of B (blue) holds ' + count(nb) + '. Row times column needs the same count in both, so the inner sizes must match.');
      }
    }
    check();
  });

  /* ------------------------------------------------------------------ 3.2 */
  UI.lab('lab-chain', function (root) {
    var len = [2, 1.5], START = [30, 60], upto = 3;
    var canvas = root.querySelector('canvas');
    var plot = new Plot2D(canvas, { cx: 0, cy: 1.2, w: 9.6 });
    var status = slot(root, 'status'), eq = slot(root, 'eq'), sl = slot(root, 'sliders');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'frame origin x', id: 'x', c: 3 }, { k: 'frame origin y', id: 'y', c: 3 }, { k: 'its x axis points at', id: 'a', c: 1 }]);
    var s1 = UI.slider(sl, { label: 'Shoulder angle <span class="nm">θ₁</span>', min: 0, max: 180, step: 1, value: START[0], fmt: degs, onInput: update });
    var s2 = UI.slider(sl, { label: 'Elbow angle <span class="nm">θ₂</span>', min: -150, max: 150, step: 1, value: START[1], fmt: degs, onInput: update });
    UI.seg(slot(root, 'upto'), {
      label: 'How much of the chain to multiply', value: '3',
      options: [{ v: '1', label: 'T₁' }, { v: '2', label: 'T₁ T₂' }, { v: '3', label: 'T₁ T₂ T₃' }],
      onChange: function (v) { upto = +v; update(); }
    });
    UI.button(slot(root, 'buttons'), { label: 'Reset pose', icon: 'reset', onClick: function () { glide([s1, s2], START); } });

    var st = null;
    function update() {
      var a1 = s1.get(), a2 = s2.get(), t1 = LA.rad(a1), t2 = LA.rad(a2);
      var T1 = LA.hom2(t1, 0, 0);             /* link 1 seen from the world: turn by θ₁ at the shoulder */
      var T2 = LA.hom2(t2, len[0], 0);        /* link 2 seen from link 1: go along link 1, turn by θ₂   */
      var T3 = LA.hom2(0, len[1], 0);         /* hand seen from link 2: go along link 2                */
      var T12 = LA.mul(T1, T2), T123 = LA.mul(T12, T3);
      var Pm = upto === 1 ? T1 : (upto === 2 ? T12 : T123);
      var org = [Pm[0][2], Pm[1][2]], ax = deg(Math.atan2(Pm[1][0], Pm[0][0]));
      st = { T: [T1, T12, T123], org: org, pts: Robots.fk(len, [t1, t2]) };
      var name = ['T<sub>1</sub>', 'T<sub>1</sub>T<sub>2</sub>', 'T<sub>1</sub>T<sub>2</sub>T<sub>3</sub>'][upto - 1], what = ['link 1', 'link 2', 'hand'][upto - 1];
      eq.innerHTML = UI.eq(
        UI.mx(homStr(T1), { cls: 'tight', cap: 'T₁<br>world ← link 1' }),
        UI.mx(homStr(T2), { cls: 'tight', cap: 'T₂<br>link 1 ← link 2', dim: upto < 2 ? all : null }),
        UI.mx(homStr(T3), { cls: 'tight', cap: 'T₃<br>link 2 ← hand', dim: upto < 3 ? all : null })) +
        UI.eq(nm(name), '=', UI.mx(homStr(Pm), { cols: { 0: 'h1', 1: 'h2', 2: 'h3' }, cap: 'world ← ' + what }));
      out.x(f2(org[0]) + ' m'); out.y(f2(org[1]) + ' m'); out.a(fix(ax, 0) + '°');
      if (upto === 3) {
        var sum = a1 + a2, wrapped = Math.abs(sum - ax) > 0.5;
        UI.status(status, 'ok', '<b>The whole product is the pose of the hand.</b> Column 3 says the hand is at ' + pair(org) + '. Column 1 says its x axis points at ' + fix(ax, 0) + '°. That is the two joint angles added, ' + fix(a1, 0) + '° + ' + (a2 < 0 ? '(' + fix(a2, 0) + '°)' : fix(a2, 0) + '°') + (wrapped ? ' = ' + fix(sum, 0) + '°, the same direction as ' + fix(ax, 0) + '°.' : '.'));
      } else if (upto === 2) {
        UI.status(status, '', '<b>T₁T₂ is the pose of link 2,</b> the frame at the elbow. Its origin is at ' + pair(org) + ' and it is turned by both joint angles. One more matrix on the right carries you out to the hand.');
      } else {
        UI.status(status, '', '<b>T₁ alone is the pose of link 1.</b> Its frame sits at the shoulder, the world origin, turned by θ₁ = ' + fix(a1, 0) + '°. Nothing in it knows about the elbow yet.');
      }
      plot.draw();
    }
    plot.onDraw(function (p) {
      if (!st) return;
      p.grid({ xlabel: 'x', ylabel: 'y' });
      p.circle([0, 0], len[0] + len[1], { color: C.faint, width: 1, dash: [3, 6] });
      /* drop lines from the chosen frame's origin to the world axes */
      p.line(st.org, [st.org[0], 0], { color: C.s3, width: 1.2, dash: [3, 4], alpha: .8 });
      p.line(st.org, [0, st.org[1]], { color: C.s3, width: 1.2, dash: [3, 4], alpha: .8 });
      Robots.drawArm(p, st.pts, { width: 9 });
      var names = ['link 1', 'link 2', 'hand'];
      for (var i = 0; i < 3; i++) {
        var T = st.T[i], on = i < upto;
        Robots.drawFrame(p, T, { len: .8, alpha: on ? 1 : .28, color: on ? C.chalk : C.faint });
        /* name each frame on the side away from both of its axes */
        p.text(names[i], [T[0][2] - .46 * (T[0][0] + T[0][1]), T[1][2] - .46 * (T[1][0] + T[1][1])], { color: on ? C.chalk : C.faint, align: 'center' });
      }
      p.point(st.org, { r: 10, fill: 'none', ring: C.s3, width: 2.5 });
      p.text(pair(st.org), st.org, { color: C.s3, dx: 15, dy: -17 });
    });
    update();
  });

  /* ------------------------------------------------------------------ 3.3 */
  UI.lab('lab-order', function (root) {
    var canvas = root.querySelector('canvas');
    var plot = new Plot2D(canvas, { cx: 0, cy: 0, w: 10.4 });
    var status = slot(root, 'status'), eq = slot(root, 'eq'), sl = slot(root, 'sliders');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'turn, then drive ends at', id: 'a', c: 1 }, { k: 'drive, then turn ends at', id: 'b', c: 2 }, { k: 'gap between them', id: 'g', c: 3 }]);
    var clock = 2, playing = false;           /* 0..1 first command, 1..2 second command */
    function settle() { clock = 2; playing = false; update(); }
    var sA = UI.slider(sl, { label: 'Turn angle', min: -180, max: 180, step: 5, value: 90, fmt: degs, onInput: settle });
    var sD = UI.slider(sl, { label: 'Drive distance', min: 0, max: 3, step: 0.25, value: 2, fmt: function (v) { return f2(v) + ' m'; }, onInput: settle });
    UI.button(slot(root, 'buttons'), { label: 'Play both orders', icon: 'play', cls: 'primary', onClick: function () {
      if (UI.reducedMotion()) { settle(); return; }
      clock = 0; playing = true; plot.draw();
    } });
    UI.button(slot(root, 'buttons'), { label: 'Reset', icon: 'reset', onClick: function () { sA.set(90); sD.set(2); settle(); } });

    var st = { gap: 0 };
    function update() {
      var phi = LA.rad(sA.get()), d = sD.get();
      var R = LA.hom2(phi, 0, 0), D = LA.hom2(0, d, 0), RD = LA.mul(R, D), DR = LA.mul(D, R);
      var a = [RD[0][2], RD[1][2]], b = [DR[0][2], DR[1][2]];
      var gap = Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)), same = gap < 1e-9;
      st = { phi: phi, d: d, a: a, b: b, gap: gap, same: same };
      eq.innerHTML = UI.eq(
        UI.mx(homStr(R), { cls: 'tight', cap: 'R<br>turn ' + degs(sA.get()) }), '<span class="eq-gap"></span>',
        UI.mx(homStr(D), { cls: 'tight', cap: 'D<br>drive ' + f2(d) + ' m' })) +
        UI.eq(UI.mx(homStr(RD), { cls: 'tight', cols: { 2: 'h1' }, cap: 'R D<br>turn, then drive' }), same ? '=' : '≠',
          UI.mx(homStr(DR), { cls: 'tight', cols: { 2: 'h2' }, cap: 'D R<br>drive, then turn' }));
      out.a(pair(a)); out.b(pair(b)); out.g(f2(gap) + ' m');
      if (same) UI.status(status, 'ok', '<b>These two commute.</b> ' + (d === 0 ? 'With no distance to drive, both orders are just the turn.' : 'With no turn, both orders are just the drive.') + ' A command that does nothing can go first or last, so here R D = D R.');
      else UI.status(status, 'hot', '<b>Order matters: R D ≠ D R.</b> The same two commands leave the rovers ' + f2(gap) + ' m apart. They face the same way, because the turning blocks of the two products agree. Only the position columns differ.');
      plot.draw();
    }
    plot.onDraw(function (p) {
      if (st.phi === undefined) return;
      p.grid({ xlabel: 'x', ylabel: 'y' });
      var phi = st.phi, d = st.d, u = ease(Math.min(clock, 1)), v = ease(Math.max(clock - 1, 0));
      var red = { x: v * d * Math.cos(phi), y: v * d * Math.sin(phi), th: u * phi };       /* turn, then drive */
      var blue = { x: u * d, y: 0, th: v * phi };                                          /* drive, then turn */
      var size = { L: .95, W: .62 };
      Robots.drawRover(p, { x: 0, y: 0, th: 0 }, { L: size.L, W: size.W, color: C.faint, alpha: .9 });
      p.line([0, 0], [blue.x, blue.y], { color: C.s2, width: 2.6 });
      p.line([0, 0], [red.x, red.y], { color: C.s1, width: 2.6, dash: st.same ? [7, 7] : [] });
      if (Math.abs(red.th) > 1e-3) p.arc([0, 0], 34, 0, red.th, { color: C.s1, width: 2 });
      if (Math.abs(blue.th) > 1e-3) p.arc([blue.x, blue.y], 34, 0, blue.th, { color: C.s2, width: 2 });
      if (clock >= 2 && !st.same) {
        p.line([red.x, red.y], [blue.x, blue.y], { color: C.s3, width: 1.6, dash: [5, 5] });
        /* label the gap on the side of the dashed line that faces away from the start */
        var mid = [(red.x + blue.x) / 2, (red.y + blue.y) / 2], nx = -(blue.y - red.y) / st.gap, ny = (blue.x - red.x) / st.gap;
        if (mid[0] * nx + mid[1] * ny < -1e-9 || (Math.abs(mid[0] * nx + mid[1] * ny) < 1e-9 && ny < 0)) { nx = -nx; ny = -ny; }
        p.text(f2(st.gap) + ' m apart', mid, { color: C.s3, align: 'center', dx: nx * 48, dy: -ny * 22 });
      }
      Robots.drawRover(p, blue, { L: size.L, W: size.W, color: C.s2 });
      Robots.drawRover(p, red, { L: size.L, W: size.W, color: C.s1, alpha: st.same && clock >= 2 ? .75 : 1 });
      p.text('start', [0, 0], { color: C.dim, align: 'right', dx: -10, dy: 26 });
      p.note(clock < 1 ? 'first command' : (clock < 2 ? 'second command' : 'both commands done'), 10, 16, { color: C.faint });
    });
    UI.loop(canvas, function (dt) {
      if (!playing) return;
      clock = Math.min(2, clock + dt / 1.15);
      if (clock >= 2) playing = false;
      plot.draw();
    });
    update();
  });

  /* ------------------------------------------------------------------ 3.4 */
  UI.lab('lab-gj', function (root) {
    var PRE = {
      lecture: [[1, 3], [2, 7]],
      singular: [[1, 3], [2, 6]],
      three: [[2, -1, 0], [-1, 2, -1], [0, -1, 2]],
      rover: [[0.5, 0.5], [-2, 2]]
    };
    var A = LA.clone(PRE.lecture), res = null;
    var inBox = slot(root, 'input'), status = slot(root, 'status'), result = slot(root, 'result');
    var F = LA.fmt;
    function ordinal(k) { return ['first', 'second', 'third', 'fourth'][k] || (k + 1) + 'th'; }
    function times(l) { var a = Math.abs(l); return Math.abs(a - 1) < 1e-12 ? '' : F(a) + ' times '; }
    /* a whole-number vector on the line of solutions of A x = 0, first non-zero entry positive */
    function killer(M) {
      var ns = LA.nullspace(M).basis;
      if (!ns.length) return null;
      var x = ns[0].slice(), den = 1, i, f;
      for (i = 0; i < x.length; i++) { f = LA.frac(x[i]); if (f) den = den * f[1] / gcd(den, f[1]); }
      if (den > 1 && den < 1000) x = x.map(function (v) { return Math.round(v * den * 1e9) / 1e9; });
      for (i = 0; i < x.length; i++) if (Math.abs(x[i]) > 1e-12) { if (x[i] < 0) x = x.map(function (v) { return -v; }); break; }
      return x.map(LA.clean);
    }
    function gcd(a, b) { return b ? gcd(b, a % b) : a; }

    function title(s, i, n) {
      var t = { start: 'Start · write [ A | I ]', swap: 'Exchange rows', pivot: 'Find the pivot', elim: 'Gauss · clear below the pivot', upper: 'Half way · upper triangular',
        elimUp: 'Jordan · clear above the pivot', scale: 'Make the pivot 1', done: 'Done · read off [ I | A⁻¹ ]', check: 'Check · multiply', fail: 'Stop · no pivot' };
      return t[s.kind] || '';
    }
    function render(s) {
      var n = A.length, o = { aug: n, cls: n > 2 ? '' : 'lg', rows: {} }, say = '', extra = '';
      if (s.pivot) o.pivots = [s.pivot];
      var k = s.k, r1 = (s.i === undefined ? 0 : s.i) + 1, rk = (k === undefined ? 0 : k) + 1;
      if (s.kind === 'start') {
        say = 'Put <b>A</b> on the left and the identity <b>I</b> on the right. Every row step from here on is done to the whole row, across both halves. The aim is to turn the left half into I.';
      } else if (s.kind === 'swap') {
        o.rows[s.i] = 'h3'; o.rows[s.j] = 'h3';
        say = 'The pivot position in row ' + (s.i + 1) + ' holds a zero, so <b>exchange rows ' + (s.i + 1) + ' and ' + (s.j + 1) + '</b> to bring a non-zero number up.';
      } else if (s.kind === 'pivot') {
        o.rows[k] = 'h2';
        var below = 0;
        for (var r = k + 1; r < n; r++) if (Math.abs(s.M[r][k]) > 1e-12) below++;
        say = 'The ' + ordinal(k) + ' pivot is the circled <b>' + F(s.M[k][k]) + '</b>. ' + (k === n - 1 ? 'It is the last one, so the downward pass is finished.' : (below ? 'Use its row to clear what lies below it.' : 'Everything below it is already zero.'));
      } else if (s.kind === 'elim' || s.kind === 'elimUp') {
        o.rows[k] = 'h2'; o.rows[s.i] = 'h3';
        say = (s.mult > 0 ? '<b>Subtract ' + times(s.mult) + 'row ' + rk + ' from row ' + r1 + '.</b>' : '<b>Add ' + times(s.mult) + 'row ' + rk + ' to row ' + r1 + '.</b>') +
          ' That puts a zero ' + (s.kind === 'elim' ? 'below' : 'above') + ' the pivot. The right half took the same step, so it keeps a record of everything done so far.';
      } else if (s.kind === 'upper') {
        say = 'The left half is upper triangular. Lecture 2 would stop here and back-substitute. Gauss-Jordan carries on <b>upward</b> and clears the entries above the pivots as well.';
      } else if (s.kind === 'scale') {
        o.rows[k] = 'h3';
        say = '<b>Divide row ' + rk + ' by its pivot, ' + F(s.div) + '.</b> The pivot becomes 1, which is what the identity needs on its diagonal.';
      } else if (s.kind === 'done') {
        o.cols = {};
        for (var c = n; c < 2 * n; c++) o.cols[c] = 'h3';
        delete o.rows;
        say = 'The left half is I, so the right half is <b>A⁻¹</b>. The row steps did to I exactly what it takes to undo A.';
      } else if (s.kind === 'check') {
        var inv = res.inv;
        var sz = n > 2 ? 'sm' : '';
        return UI.eq({ cls: n > 2 ? 'left' : 'lg' }, UI.mx(A, { cls: sz, cap: 'A' }), UI.mx(inv, { cls: sz, cols: allCols(n, 'h3'), cap: 'A⁻¹' }), '=', UI.mx(LA.cleanM(LA.mul(A, inv)), { cls: sz, cap: 'I' })) +
          '<p class="step-text">Multiply to check: <b>A times A⁻¹ is the identity.</b> For a square matrix the other order, A⁻¹ times A, gives the identity too.</p>';
      } else if (s.kind === 'fail') {
        var x = killer(A);
        say = 'Column ' + rk + ' of the left half has nothing left at or below row ' + rk + ' to use as a pivot. The left half can never become I. <b>A is singular: it has no inverse.</b>';
        if (x) {
          extra = UI.eq(UI.mx(A, { cap: 'A' }), UI.mx(x, { cols: { 0: 'h4' }, cap: LC('x') }), '=', UI.mx(LA.cleanM([LA.mv(A, x)])[0], { cap: 'zero' })) +
            '<p class="step-text">The reason, without any elimination: A sends the non-zero vector <b>x = (' + x.map(function (v) { return F(v); }).join(', ') + ')</b> to zero. If A⁻¹ existed, x would equal A⁻¹ times zero, which is zero. It is not.</p>';
        }
      }
      if (o.rows && !Object.keys(o.rows).length) delete o.rows;
      return UI.eq(UI.mx(s.M, o)) + '<div class="halves"><span>left · the steps done to A</span><span>right · the same steps done to I</span></div>' +
        '<p class="step-text">' + say + '</p>' + extra;
    }
    function allCols(n, h) { var o = {}; for (var c = 0; c < n; c++) o[c] = h; return o; }

    var stepper = UI.stepper(slot(root, 'stepper'), { steps: [], title: title, render: render, delay: 2200 });
    var seg = UI.seg(slot(root, 'presets'), {
      label: 'Example matrices', value: 'lecture',
      options: [{ v: 'lecture', label: 'Lecture' }, { v: 'singular', label: 'Singular' }, { v: 'three', label: '3 by 3' }, { v: 'rover', label: 'Rover wheels' }],
      onChange: function (v) { A = LA.clone(PRE[v]); buildInput(); run(); }
    });
    function buildInput() {
      inBox.innerHTML = '';
      UI.mxInput(inBox, A, { id: 'gj', name: 'A', cls: 'lg', onChange: function (M) { A = M; seg.set('', false); run(); } });
    }
    function run() {
      res = LA.inverse(A);
      var steps = res.steps.slice();
      if (!res.singular) steps.push({ kind: 'check', M: steps[steps.length - 1].M });
      stepper.setSteps(steps);
      var rowSteps = res.steps.filter(function (s) { return /^(elim|elimUp|scale|swap)$/.test(s.kind); }).length;
      if (res.singular) {
        UI.status(status, 'bad', '<b>Singular: no inverse.</b> Elimination runs out of pivots. Go to the last step to see the vector that A sends to zero.');
        result.innerHTML = '<span class="nope">A⁻¹ does not exist</span>';
      } else {
        UI.status(status, 'ok', '<b>Invertible.</b> ' + rowSteps + ' row step' + (rowSteps === 1 ? '' : 's') + ' turn [ A | I ] into [ I | A⁻¹ ]. Step through and watch the inverse build up in the right half.');
        result.innerHTML = UI.eq({ cls: 'left' }, nm(INV), '=', UI.mx(res.inv, { cols: allCols(A.length, 'h3') }));
      }
    }
    buildInput(); run();
  });

  /* ------------------------------------------------------------------ 3.5 */
  UI.lab('lab-frames', function (root) {
    var rover = [3, 1], lm = [1, 4];
    var canvas = root.querySelector('canvas');
    var plot = new Plot2D(canvas, { cx: 2.25, cy: 2.2, w: 12 });
    var status = slot(root, 'status'), eq = slot(root, 'eq'), pose = slot(root, 'pose');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'landmark on the map', id: 'w', c: 4 }, { k: 'seen from the rover', id: 'r' }, { k: 'distance, either way', id: 'd' }]);
    var sH = UI.slider(slot(root, 'sliders'), { label: 'Rover heading <span class="nm">θ</span>', min: -180, max: 180, step: 5, value: 90, k: 3, fmt: degs, onInput: update });
    UI.button(slot(root, 'buttons'), { label: 'Reset', icon: 'reset', onClick: function () { rover = [3, 1]; lm = [1, 4]; sH.set(90); update(); } });
    function snap(v) { return Math.round(v * 4) / 4; }

    var st = null;
    function update() {
      var th = LA.rad(sH.get()), T = LA.hom2(th, rover[0], rover[1]);
      /* block formula: the inverse of [R p; 0 1] is [R' -R'p; 0 1], with R' the transpose of R */
      var Rt = LA.T(LA.rot2(th)), q = LA.mv(Rt, rover);
      var Ti = [[Rt[0][0], Rt[0][1], -q[0]], [Rt[1][0], Rt[1][1], -q[1]], [0, 0, 1]];
      var seen = LA.mv(Ti, [lm[0], lm[1], 1]), agrees = LA.equal(Ti, LA.inv(T), 1e-9);
      st = { T: T, seen: seen, ex: [T[0][0], T[1][0]], ey: [T[0][1], T[1][1]] };
      eq.innerHTML = UI.eq(
        UI.mx(homStr(Ti), { cls: 'tight', rows: { 0: 'h1', 1: 'h2' }, cap: 'T⁻¹<br>rover ← world' }),
        UI.mx([f2(lm[0]), f2(lm[1]), '1'], { cls: 'tight', cols: { 0: 'h4' }, cap: 'landmark<br>on the map' }), '=',
        UI.mx([f2(seen[0]), f2(seen[1]), '1'], { cls: 'tight', rows: { 0: 'h1', 1: 'h2' }, cap: 'ahead<br>left' }));
      pose.innerHTML = UI.eq({ cls: 'left' }, nm('T'), '=', UI.mx(homStr(T), { cls: 'tight', cols: { 0: 'h1', 1: 'h2', 2: 'h3' }, cap: 'world ← rover' }));
      var dist = Math.sqrt(seen[0] * seen[0] + seen[1] * seen[1]);
      out.w(pair(lm)); out.r(pair(seen)); out.d(f2(dist) + ' m');
      var fwd = Math.abs(seen[0]) < 0.005 ? 'level with the rover' : f2(Math.abs(seen[0])) + ' m ' + (seen[0] > 0 ? 'ahead' : 'behind');
      var side = Math.abs(seen[1]) < 0.005 ? 'dead in line' : f2(Math.abs(seen[1])) + ' m to its ' + (seen[1] > 0 ? 'left' : 'right');
      if (dist < 0.005) UI.status(status, 'hot', '<b>The rover is standing on the landmark.</b> Seen from the rover it is at (0, 0), whatever the heading.');
      else UI.status(status, agrees ? 'ok' : 'bad', '<b>Seen from the rover,</b> the landmark is ' + fwd + ' and ' + side + '. Count the ticks along the red axis and then the blue one to check. ' +
        (agrees ? 'Gauss-Jordan on T gives the same T⁻¹ as the block formula.' : 'The block formula and Gauss-Jordan disagree, which should never happen.'));
      plot.draw();
    }
    plot.handle({ get: function () { return rover; }, set: function (x, y) { rover = [snap(x), snap(y)]; update(); }, color: C.s3 });
    plot.handle({ get: function () { return lm; }, set: function (x, y) { lm = [snap(x), snap(y)]; update(); }, color: C.s4 });
    plot.onDraw(function (p) {
      if (!st) return;
      p.grid({ xlabel: 'x', ylabel: 'y' });
      p.text('world frame', [0, 0], { color: C.faint, align: 'right', dx: -8, dy: -13 });
      var ex = st.ex, ey = st.ey, far = 20, i;
      function at(a, b) { return [rover[0] + a * ex[0] + b * ey[0], rover[1] + a * ex[1] + b * ey[1]]; }
      /* the rover's own axes, drawn long, with a tick every metre */
      p.line(at(-far, 0), at(far, 0), { color: C.s1, width: 1.2, alpha: .45, dash: [5, 5] });
      p.line(at(0, -far), at(0, far), { color: C.s2, width: 1.2, alpha: .45, dash: [5, 5] });
      for (i = -12; i <= 12; i++) {
        if (!i) continue;
        p.line(at(i, -.09), at(i, .09), { color: C.s1, width: 1.4, alpha: .8 });
        p.line(at(-.09, i), at(.09, i), { color: C.s2, width: 1.4, alpha: .8 });
      }
      p.line(rover, lm, { color: C.faint, width: 1.2, dash: [2, 5] });
      Robots.drawRover(p, { x: rover[0], y: rover[1], th: LA.rad(sH.get()) }, { L: 1.0, W: .66 });
      /* walk ahead along red, then sideways along blue, to reach the landmark */
      var a = st.seen[0], b = st.seen[1], corner = at(a, 0);
      p.line(rover, corner, { color: C.s1, width: 3.6 });
      p.line(corner, lm, { color: C.s2, width: 3.6 });
      Robots.drawFrame(p, st.T, { len: 1.25 });
      if (Math.abs(a) > .45) p.text(f2(a), at(a / 2, b >= 0 ? -.42 : .42), { color: C.s1, align: 'center' });
      if (Math.abs(b) > .45) p.text(f2(b), at(a + (a >= 0 ? .62 : -.62), b / 2), { color: C.s2, align: 'center' });
      Robots.drawBeacon(p, lm, { color: C.s4, label: 'landmark' });
    });
    update();
  });

  /* ------------------------------------------------------------------ 3.6 */
  UI.lab('lab-flat', function (root) {
    var cvs = root.querySelectorAll('canvas');
    var pin = new Plot2D(cvs[0], { cx: 0.8, cy: 0, w: 6.2 }), pout = new Plot2D(cvs[1], { cx: 0, cy: 0, w: 18.5 });
    var status = slot(root, 'status'), eq = slot(root, 'eq');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'angle between columns', id: 'ang' }, { k: 'length of A x', id: 'len', c: 4 }, { k: 'largest entry of A⁻¹', id: 'big', c: 3 }]);
    var X = [3, -1];                                             /* the lecture's vector: A x = 0 once the columns line up */
    var Pp = [-0.9, 0.9], Qp = [0.9, 0.3];                       /* Q - P is 0.6 x, so P and Q merge at the end */
    var HULL = [[-1.1, -0.7], [0.7, -0.7], [1.2, 0], [0.7, 0.7], [-1.1, 0.7]], DOTS = [], i, j;
    for (i = -2; i <= 2; i++) for (j = -2; j <= 2; j++) DOTS.push([i / 2, j / 2]);
    var undo = false;
    var sT = UI.slider(slot(root, 'sliders'), { label: 'Slide column 2 onto the line of column 1', min: 0, max: 1, step: 0.01, value: 0.3, k: 2, fmt: function (v) { return Math.round(v * 100) + '%'; }, onInput: update });
    UI.check(slot(root, 'undo'), { label: 'Undo: send the output back through A⁻¹', checked: false, onChange: function (v) { undo = v; update(); } });
    UI.button(slot(root, 'buttons'), { label: 'Flatten fully', icon: 'squeeze', cls: 'primary', onClick: function () { glide([sT], [1]); } });
    UI.button(slot(root, 'buttons'), { label: 'Reset', icon: 'reset', onClick: function () { glide([sT], [0.3]); } });

    var st = null;
    function ap(M, v) { return [M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]]; }
    function update() {
      var t = sT.get();
      if (t > 0.9999) t = 1;
      var A = [[1, -2 + 5 * t], [2, 1 + 5 * t]];                 /* column 2 slides from (-2, 1) to (3, 6) */
      var inv = LA.inv(A), c1 = LA.col(A, 0), c2 = LA.col(A, 1), AX = ap(A, X);
      var cosang = LA.dot(c1, c2) / (LA.norm(c1) * LA.norm(c2)), ang = deg(Math.acos(Math.max(-1, Math.min(1, cosang))));
      var big = inv ? Math.max.apply(null, inv[0].concat(inv[1]).map(Math.abs)) : Infinity;
      st = { A: A, inv: inv, AX: AX, c1: c1, c2: c2 };
      eq.innerHTML = UI.eq(
        UI.mx(A, { cols: { 0: 'h1', 1: 'h2' }, fmt: n2, cap: 'A' }), UI.mx(X, { cols: { 0: 'h4' }, cap: LC('x') }), '=',
        UI.mx(AX, { cols: { 0: 'h4' }, fmt: n2, cap: 'A ' + LC('x') }), '<span class="eq-gap"></span>',
        inv ? nm(INV) : '', inv ? '=' : '',
        inv ? UI.mx(inv, { fmt: n2, cols: undo ? { 0: 'h3', 1: 'h3' } : null, cap: 'the undo matrix' }) : '<span class="nope">A⁻¹ does not exist</span>');
      out.ang(fix(ang, 1) + '°'); out.len(f2(LA.norm(AX))); out.big(inv ? num(big, 1) : 'none');
      if (!inv) {
        UI.status(status, 'bad', '<b>Flat: no inverse.</b> Both columns lie on one line, so every output lies on it too. P and Q land on the same point, and x = (3, −1) is sent to zero. ' +
          (undo ? 'Undo has nothing to work with: every input on the amber line gives the same output as P.' : 'The output can no longer say which input made it.'));
      } else if (big >= 4) {
        UI.status(status, 'hot', '<b>Nearly flat.</b> An inverse still exists, but it has to stretch a sliver back into a full shape, so its entries are large (up to ' + num(big, 1) + '). A small error in the output would come back magnified by about that much.');
      } else {
        UI.status(status, 'ok', '<b>Invertible.</b> The columns point in different directions, so different inputs stay different. ' +
          (undo ? 'A⁻¹ sends every output point back to exactly where it started: the amber outline sits on the original.' : 'Tick Undo to send the output back through A⁻¹.'));
      }
      pin.draw(); pout.draw();
    }
    function small(p) { return p.W < 260; }
    pin.onDraw(function (p) {
      if (!st) return;
      p.grid({ labels: !small(p), labelStep: 1 });
      var k, far = 12, d = [X[0] / LA.norm(X), X[1] / LA.norm(X)];
      /* the line of x through the origin */
      p.line([-far * d[0], -far * d[1]], [far * d[0], far * d[1]], { color: C.s4, width: 1.1, alpha: .5, dash: [4, 5] });
      for (k = 0; k < DOTS.length; k++) p.point(DOTS[k], { r: 1.8, color: C.faint });
      p.path(HULL, { color: C.chalk, width: 2, close: true, fill: 'rgba(244,242,238,.06)' });
      p.arrow([0, 0], [1, 0], { color: C.s1, width: 2.6, head: 9 });
      p.arrow([0, 0], [0, 1], { color: C.s2, width: 2.6, head: 9 });
      p.arrow([0, 0], X, { color: C.s4, width: 2.4, head: 10, label: 'x' });
      p.line(Pp, Qp, { color: C.s4, width: 1.3, dash: [3, 4] });
      if (undo && st.inv) {
        var back = HULL.map(function (v) { return ap(st.inv, ap(st.A, v)); });
        p.path(back, { color: C.s3, width: 2.4, close: true, dash: [7, 5] });
      } else if (undo) {
        p.line([Pp[0] - far * d[0], Pp[1] - far * d[1]], [Pp[0] + far * d[0], Pp[1] + far * d[1]], { color: C.s3, width: 2.2, dash: [7, 5] });
      }
      p.point(Pp, { r: 5, fill: C.board, ring: C.s4, width: 2, label: 'P', labelColor: C.s4, math: true, dx: -16, dy: -12 });
      p.point(Qp, { r: 5, fill: C.board, ring: C.s4, width: 2, label: 'Q', labelColor: C.s4, math: true, dx: 9, dy: -12 });
    });
    pout.onDraw(function (p) {
      if (!st) return;
      var A = st.A, k, sm = small(p);
      p.grid({ step: sm ? 5 : 1, major: sm ? 1 : 5, labels: !sm, labelStep: 5 });
      p.line([-12 * st.c1[0], -12 * st.c1[1]], [12 * st.c1[0], 12 * st.c1[1]], { color: C.s1, width: 1.1, alpha: .5, dash: [4, 5] });
      for (k = 0; k < DOTS.length; k++) p.point(ap(A, DOTS[k]), { r: 1.8, color: C.faint });
      p.path(HULL.map(function (v) { return ap(A, v); }), { color: C.chalk, width: 2, close: true, fill: 'rgba(244,242,238,.06)' });
      p.arrow([0, 0], st.c2, { color: C.s2, width: 2.6, head: 9 });
      p.arrow([0, 0], st.c1, { color: C.s1, width: 2.6, head: 9 });
      p.arrow([0, 0], st.AX, { color: C.s4, width: 2.4, head: 10, label: LA.norm(st.AX) > 1.2 ? 'A x' : '', math: false });
      var a = ap(A, Pp), b = ap(A, Qp), pa = p.px(a), pb = p.px(b), near = Math.abs(pa[0] - pb[0]) + Math.abs(pa[1] - pb[1]) < 16;
      p.line(a, b, { color: C.s4, width: 1.3, dash: [3, 4] });
      p.point(a, { r: 5, fill: C.board, ring: C.s4, width: 2, label: near ? 'P and Q' : 'P', labelColor: C.s4, math: !near, dx: near ? 10 : -16, dy: -12 });
      p.point(b, { r: 5, fill: C.board, ring: C.s4, width: 2, label: near ? '' : 'Q', labelColor: C.s4, math: true, dx: 9, dy: 14 });
    });
    update();
  });
})();
