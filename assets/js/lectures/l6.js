/* ==========================================================================
   Lecture 6 labs: column space and nullspace
   6.1 union and intersection      6.2 is b in the column space?
   6.3 the redundant arm           6.4 solutions are a shifted nullspace
   6.5 one plane, two descriptions (rover)
   ========================================================================== */
(function () {
  'use strict';
  var C = window.PlotColors, num = LA.num, fix = LA.fix, rgba = window.plotRgba;
  function slot(root, name) { return root.querySelector('[data-slot="' + name + '"]'); }
  function deg(r) { return r * 180 / Math.PI; }
  function cross3(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  /* a vector written on one line: (1, 2, 3) */
  function tup(v, f) { return '(' + v.map(f || LA.fmt).join(', ') + ')'; }
  function f2(x) { return fix(x, 2); }
  /* run fn(k) with k easing from 0 to 1 */
  function animate(ms, fn, done) {
    var t0 = null, dur = UI.reducedMotion() ? 1 : ms;
    function frame(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      fn(k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
      if (k < 1) requestAnimationFrame(frame); else if (done) done();
    }
    requestAnimationFrame(frame);
  }
  /* ease a set of sliders to target values, firing their handlers on the way */
  function glide(sliders, targets, done) {
    var from = sliders.map(function (s) { return s.get(); });
    animate(650, function (e) {
      sliders.forEach(function (s, i) { s.set(e === 1 ? targets[i] : from[i] + (targets[i] - from[i]) * e, true); });
    }, done);
  }

  /* the lecture's matrix: 4 equations, 3 unknowns, column 3 = column 1 + column 2 */
  var A = [[1, 1, 2], [2, 1, 3], [3, 1, 4], [4, 1, 5]];
  var COLS = [LA.col(A, 0), LA.col(A, 1), LA.col(A, 2)];
  var SUB = ['₁', '₂', '₃', '₄'];

  /* ------------------------------------------------------------------ 6.1 */
  UI.lab('lab-union', function (root) {
    var canvas = root.querySelector('canvas');
    var plot = new Plot3D(canvas, { span: 8.2, yaw: -1.16, pitch: 0.36 });
    var statusU = slot(root, 'union'), statusI = slot(root, 'inter'), eq = slot(root, 'eq'), sl = slot(root, 'sliders');
    var tilt = 1;                                   /* L is all multiples of (1, 1, tilt) */
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'v + w', id: 'sum', c: 3 }, { k: 'in P?', id: 'inP' }, { k: 'in L?', id: 'inL' }]);
    var sa = UI.slider(sl, { label: '<span class="nm">v</span> &nbsp;first entry', min: -1.5, max: 1.5, step: 0.25, value: 1.5, k: 1, onInput: update });
    var sb = UI.slider(sl, { label: '<span class="nm">v</span> &nbsp;second entry', min: -1.5, max: 1.5, step: 0.25, value: -1.25, k: 1, onInput: update });
    var st = UI.slider(sl, { label: '', min: -1.5, max: 1.5, step: 0.25, value: 1.25, k: 2, onInput: update });
    var wLabel = st.el.querySelector('.slider-top span');
    function setLabel(flat) { wLabel.innerHTML = '<span class="nm">w</span> &nbsp;= this many of (1, 1, ' + (flat ? '0' : '1') + ')'; }
    setLabel(false);
    UI.seg(slot(root, 'tilt'), {
      label: 'Position of the line', value: 'out',
      options: [{ v: 'out', label: 'L sticks out of P' }, { v: 'in', label: 'L lies inside P' }],
      onChange: function (v) {
        var from = tilt, to = v === 'in' ? 0 : 1;
        setLabel(v === 'in');
        animate(600, function (e) { tilt = e === 1 ? to : from + (to - from) * e; update(); });
      }
    });

    function parts() {
      var a = sa.get(), b = sb.get(), t = st.get(), d = [1, 1, tilt];
      var v = [a, b, 0], w = LA.vscale(d, t);
      return { a: a, b: b, t: t, d: d, v: v, w: w, s: LA.vadd(v, w) };
    }
    function update() {
      var g = parts(), flat = tilt < 1e-9, s = g.s.map(LA.clean);
      var vZero = Math.abs(g.a) + Math.abs(g.b) < 1e-9, wZero = Math.abs(g.t) < 1e-9;
      var inP = Math.abs(s[2]) < 1e-9;
      var inL = flat ? Math.abs(s[0] - s[1]) < 1e-9 : vZero;
      var dec = function (x) { return num(x, 2); };
      eq.innerHTML = UI.eq(
        UI.mx(g.v, { cols: { 0: 'h1' }, fmt: dec, cap: 'v, in P' }), '+',
        UI.mx(g.w.map(LA.clean), { cols: { 0: 'h2' }, fmt: dec, cap: 'w, in L' }), '=',
        UI.mx(s, { cols: { 0: 'h3' }, fmt: dec, cap: 'v + w' }));
      out.sum(tup(s, dec)); out.inP(inP ? 'yes' : 'no'); out.inL(inL ? 'yes' : 'no');
      if (flat) {
        UI.status(statusU, 'ok', '<b>Union: a subspace, but only in this special case.</b> L now lies inside P, so P ∪ L is just P. A union of two subspaces is a subspace only when one of them contains the other.');
        UI.status(statusI, 'ok', '<b>Intersection: a subspace.</b> Every vector of L is in both sets, so P ∩ L is the whole line L.');
      } else {
        if (!vZero && !wZero) UI.status(statusU, 'bad', '<b>Union: not a subspace.</b> <b>v</b> is in P and <b>w</b> is in L, so both belong to P ∪ L. Their sum ' + tup(s, dec) + ' is off the plane (third entry ' + dec(s[2]) + ') and off the line. It has left the union.');
        else UI.status(statusU, 'hot', 'This sum stays inside the union, but only because ' + (vZero && wZero ? 'both vectors are' : (vZero ? '<b>v</b> is' : '<b>w</b> is')) + ' zero. Move both away from zero and the sum escapes.');
        UI.status(statusI, 'ok', '<b>Intersection: a subspace.</b> The only vector in both P and L is the zero vector. The zero vector alone is a subspace, the smallest one there is.');
      }
      plot.draw();
    }
    plot.onDraw(function (p) {
      var g = parts(), dn = LA.vscale(g.d, 1 / LA.norm(g.d)), v = g.v, w = g.w, s = g.s;
      p.plane([1, 0, 0], [0, 1, 0], 3.1, { fill: rgba(C.s1, .07), color: rgba(C.s1, .45), meshColor: rgba(C.s1, .13) });
      p.axes(3.5);
      p.line(LA.vscale(dn, -3.7), LA.vscale(dn, 3.7), { color: C.s2, width: 1.6, alpha: .8 });
      p.text('P', [2.75, -2.75, 0], { color: C.s1, math: true, align: 'center' });
      p.text('L', LA.vscale(dn, 3.95), { color: C.s2, math: true, align: 'center' });
      /* the parallelogram that carries v to the tip of w and w to the tip of v */
      p.line(v, s, { color: C.s2, width: 1.2, dash: [4, 4], alpha: .75 });
      p.line(w, s, { color: C.s1, width: 1.2, dash: [4, 4], alpha: .75 });
      p.arrow([0, 0, 0], v, { color: C.s1, width: 3, label: 'v' });
      p.arrow([0, 0, 0], w, { color: C.s2, width: 3, label: 'w' });
      p.arrow([0, 0, 0], s, { color: C.s3, width: 3, label: 'v + w' });
      /* how far the sum sits above or below the plane */
      if (Math.abs(s[2]) > 1e-9) {
        p.line(s, [s[0], s[1], 0], { color: C.s3, width: 1, dash: [2, 4], alpha: .85 });
        p.point([s[0], s[1], 0], { r: 2.6, color: C.s3 });
      }
    });
    update();
  });

  /* ------------------------------------------------------------------ 6.2 */
  UI.lab('lab-colspace', function (root) {
    var canvas = root.querySelector('canvas');
    var plot = new Plot3D(canvas, { span: 11, yaw: 1.1, pitch: 0.25 });
    var CEN = [1, 1.5, 2];                           /* the picture is centred here, so the columns sit mid-frame */
    function T(v) { return LA.vsub(v, CEN); }
    var status = slot(root, 'status'), eq = slot(root, 'eq'), gBuild = slot(root, 'build'), gTest = slot(root, 'test'), bv = slot(root, 'bvec');
    var mode = 'build', b = [1, 2, 3, 4], st = {};
    var cl = [C.s1, C.s2, C.s4], C3 = COLS.map(function (c) { return c.slice(0, 3); });
    var PRESETS = { c1: [1, 2, 3, 4], c2: [1, 1, 1, 1], c3: [2, 3, 4, 5], zero: [0, 0, 0, 0], out: [1, 0, 0, 0] };
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'b in C(A)?', id: 'inC' }, { k: 'row 3 reads', id: 'r3' }, { k: 'row 4 reads', id: 'r4' }]);

    UI.seg(slot(root, 'mode'), {
      label: 'Mode', value: 'build',
      options: [{ v: 'build', label: 'Build b from x' }, { v: 'test', label: 'Test any b' }],
      onChange: function (v) { mode = v; gBuild.hidden = v !== 'build'; gTest.hidden = v !== 'test'; if (v === 'test') { fill(); presets.set('', false); } update(); }
    });
    var X = [0.5, 1, 0.5].map(function (v0, i) {
      return UI.slider(gBuild, { label: '<span class="nm">x' + SUB[i] + '</span> &nbsp;of column ' + (i + 1), min: -1.5, max: 1.5, step: 0.25, value: v0, k: i === 2 ? 4 : i + 1, onInput: update });
    });
    var presets = UI.seg(slot(root, 'presets'), {
      label: 'Right-hand sides to test', value: '',
      options: [{ v: 'c1', label: '(1, 2, 3, 4)' }, { v: 'c2', label: '(1, 1, 1, 1)' }, { v: 'c3', label: '(2, 3, 4, 5)' }, { v: 'zero', label: '(0, 0, 0, 0)' }, { v: 'out', label: '(1, 0, 0, 0)' }],
      onChange: function (v) { b = PRESETS[v].slice(); fill(); update(); }
    });
    bv.innerHTML = '<span class="m"><b>b</b> = (</span>' + [0, 1, 2, 3].map(function (i) {
      return '<input class="num-in" id="cs-b' + i + '" type="number" step="any" inputmode="decimal" aria-label="entry ' + (i + 1) + ' of b">';
    }).join('<span class="m">,</span>') + '<span class="m">)</span>';
    var inputs = UI.$$('input', bv);
    function fill() { inputs.forEach(function (inp, i) { inp.value = +b[i].toFixed(4); }); }
    bv.addEventListener('input', function () {
      inputs.forEach(function (inp, i) { var v = parseFloat(inp.value); b[i] = isFinite(v) ? v : 0; });
      presets.set('', false); update();
    });
    /* the third entry of b, measured from the value that would put b back on the plane */
    var lift = UI.slider(slot(root, 'lift'), {
      label: 'Lift <span class="nm">b</span> off the plane (changes entry 3)', min: -3, max: 3, step: 0.5, value: 0, k: 3,
      fmt: function (v) { return (v > 0 ? '+' : '') + num(v); },
      onInput: function (k) { b[2] = 2 * b[1] - b[0] + k; fill(); presets.set('', false); update(); }
    });

    /* forward elimination on [A | b]; returns the reduced rows and the pivot positions */
    function reduce(M0, rhs) {
      var M = M0.map(function (r, i) { return r.concat([rhs[i]]); }), m = M.length, n = M0[0].length, piv = [], r = 0, c, i, j;
      for (c = 0; c < n && r < m; c++) {
        var p = -1;
        for (i = r; i < m; i++) if (Math.abs(M[i][c]) > 1e-9) { p = i; break; }
        if (p < 0) continue;
        if (p !== r) { var t = M[r]; M[r] = M[p]; M[p] = t; }
        for (i = r + 1; i < m; i++) {
          var l = M[i][c] / M[r][c];
          for (j = c; j <= n; j++) M[i][j] -= l * M[r][j];
          M[i][c] = 0;
        }
        piv.push([r, c]); r++;
      }
      return { M: LA.cleanM(M), piv: piv };
    }
    /* one solution, with every free variable set to zero */
    function backSolve(red, n) {
      var x = new Array(n).fill(0);
      for (var k = red.piv.length - 1; k >= 0; k--) {
        var r = red.piv[k][0], c = red.piv[k][1], s = red.M[r][n];
        for (var j = c + 1; j < n; j++) s -= red.M[r][j] * x[j];
        x[c] = LA.clean(s / red.M[r][c]);
      }
      return x;
    }
    function rowSays(v) { return '0 = ' + LA.fmt(v); }

    function update() {
      var x = null, i;
      if (mode === 'build') { x = X.map(function (s) { return s.get(); }); b = LA.mv(A, x).map(LA.clean); }
      var red = reduce(A, b), bad = [];
      for (i = red.piv.length; i < 4; i++) if (Math.abs(red.M[i][3]) > 1e-9) bad.push(i);
      var ok = !bad.length;
      if (mode === 'test' && ok) x = backSolve(red, 3);
      var k = LA.clean(b[0] - 2 * b[1] + b[2]);          /* height of b above the plane, along entry 3 */
      st = { x: x, k: k, ok: ok };
      if (mode === 'test') lift.set(LA.clamp(k, -3, 3), false);

      /* keep everything that is drawn inside the frame */
      var far = LA.norm(CEN), pos = [0, 0, 0];
      if (x) for (i = 0; i < 3; i++) { pos = LA.vadd(pos, LA.vscale(C3[i], x[i])); far = Math.max(far, LA.norm(T(pos))); }
      far = Math.max(far, LA.norm(T(b.slice(0, 3))), LA.norm(T([b[0], b[1], 2 * b[1] - b[0]])));
      plot.span = LA.clamp(2.5 * far, 10.5, 60);

      out.inC(ok ? 'yes' : 'no'); out.r3(rowSays(red.M[2][3])); out.r4(rowSays(red.M[3][3]));
      var xs = x ? tup(x) : '';
      if (mode === 'build') {
        eq.innerHTML = UI.eq(
          '<span class="m u c1">' + num(x[0]) + '</span>', UI.mx(COLS[0], { cols: { 0: 'h1' }, cls: 'sm' }), '+',
          '<span class="m u c2">' + num(x[1]) + '</span>', UI.mx(COLS[1], { cols: { 0: 'h2' }, cls: 'sm' }), '+',
          '<span class="m u c4">' + num(x[2]) + '</span>', UI.mx(COLS[2], { cols: { 0: 'h4' }, cls: 'sm' }), '=',
          UI.mx(b, { cols: { 0: 'h3' }, cls: 'sm', fmt: function (v) { return num(v); }, cap: 'b' }));
        UI.status(status, 'ok', '<b>Reachable, because you built it.</b> This <b>b</b> = ' + tup(b, function (v) { return num(v); }) + ' is ' + num(x[0]) + ' of column 1, ' + num(x[1]) + ' of column 2 and ' + num(x[2]) + ' of column 3. So A<b>x</b> = <b>b</b> has a solution: your <b>x</b>. The column space is every <b>b</b> you can make this way, and nothing else.');
      } else {
        var tint = {};
        for (i = red.piv.length; i < 4; i++) tint[i] = bad.indexOf(i) >= 0 ? 'h1' : 'h4';
        var says = bad.length === 0 ? 'Rows 3 and 4 have no unknowns left, and both read <b>0 = 0</b>. Nothing stands in the way of a solution.'
          : (bad.length === 2 ? 'Row 3 reads <b>' + rowSays(red.M[2][3]) + '</b> and row 4 reads <b>' + rowSays(red.M[3][3]) + '</b>. No choice of <b>x</b> can make either one true.'
            : 'Row ' + (bad[0] + 1) + ' reads <b>' + rowSays(red.M[bad[0]][3]) + '</b>. No choice of <b>x</b> can make that true.');
        eq.innerHTML = UI.eq(
          UI.mx(A.map(function (r, j) { return r.concat([b[j]]); }), { aug: 1, cols: { 0: 'h1', 1: 'h2', 2: 'h4', 3: 'h3' }, cls: 'sm', cap: 'A beside b' }), '→',
          UI.mx(red.M, { aug: 1, pivots: red.piv, rows: tint, cls: 'sm', cap: 'after elimination' })) +
          '<p class="step-text">' + says + '</p>';
        if (ok) {
          var zero = LA.norm(b) < 1e-9;
          UI.status(status, 'ok', '<b>Solvable: b is in the column space.</b> ' + (zero ? 'The zero vector is in every column space: take none of each column, <b>x</b> = (0, 0, 0).'
            : 'One solution is <b>x</b> = ' + xs + ', which says <b>b</b> = ' + LA.fmt(x[0]) + ' × column 1 + ' + LA.fmt(x[1]) + ' × column 2.') + ' In the picture <b>b</b> sits on the plane.');
        } else if (bad.length === 1 && bad[0] === 3) {
          UI.status(status, 'bad', '<b>No solution: b is outside the column space.</b> Row 4 ends as ' + rowSays(red.M[3][3]) + '. The picture drops entry 4, so there <b>b</b> still looks as if it is on the plane. Four entries have to agree, and the picture can only show three.');
        } else {
          UI.status(status, 'bad', '<b>No solution: b is outside the column space.</b> Elimination ends with an impossible row. In the picture <b>b</b> floats ' + LA.fmt(Math.abs(k)) + (k > 0 ? ' above' : ' below') + ' the plane, and that gap is the right-hand side of row 3.');
        }
      }
      plot.draw();
    }
    plot.onDraw(function (p) {
      var half = p.span * 0.5, i, pos = [0, 0, 0], b3 = b.slice(0, 3), O = T([0, 0, 0]), len = half * .78;
      var names = ['b₁', 'b₂', 'b₃'];
      p.plane([1, 1, 1], [-1, 0, 1], half * .72, { fill: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.26)' }, T([1.5, 1.5, 1.5]));
      for (i = 0; i < 3; i++) {
        var e = [0, 0, 0]; e[i] = len;
        p.line(LA.vsub(O, e), LA.vadd(O, e), { color: C.axis, width: 1.2 });
        p.text(names[i], LA.vadd(O, LA.vscale(e, 1.08)), { color: C.dim, math: true, align: 'center' });
      }
      for (i = 0; i < 3; i++) p.arrow(O, T(C3[i]), { color: cl[i], width: 1.5, alpha: .5 });
      if (st.x) {
        for (i = 0; i < 3; i++) {
          var nx = LA.vadd(pos, LA.vscale(C3[i], st.x[i]));
          if (LA.norm(LA.vsub(nx, pos)) > 1e-9) p.arrow(T(pos), T(nx), { color: cl[i], width: 3 });
          pos = nx;
        }
      }
      if (Math.abs(st.k) > 1e-9) {
        var foot = [b3[0], b3[1], 2 * b3[1] - b3[0]];
        p.line(T(b3), T(foot), { color: C.s3, width: 1.5, dash: [3, 4] });
        p.point(T(foot), { r: 3, color: C.chalk });
      }
      p.point(O, { r: 3, color: C.chalk });
      p.point(T(b3), { r: 6.5, color: C.s3, ring: C.board, label: 'b' });
      p.note('plane = every mix of the columns', 10, -12, { color: C.faint });
    });
    update();
  });

  /* ------------------------------------------------------------------ 6.3 */
  UI.lab('lab-redundant', function (root) {
    var len = [1.6, 1.3, 1.0], START = [70, -60, -70];
    var LIM = [[0, 180], [-180, 180], [-180, 180]], NAMES = ['Shoulder', 'Elbow', 'Wrist'];
    var canvas = root.querySelector('canvas');
    var plot = new Plot2D(canvas, { cx: 0.2, cy: 1.45, w: 8.5 });
    var status = slot(root, 'status'), eq = slot(root, 'eq'), sl = slot(root, 'sliders');
    var cl = [C.s1, C.s2, C.s4];
    var q = START.map(LA.rad), target = null, running = false, dir = 1, lastMove = null;
    var ghost = null, trailE = [], trailW = [], st = {};
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'rank of J', id: 'rank' }, { k: 'dim of C(J)', id: 'dc' }, { k: 'dim of N(J)', id: 'dn' }, { k: 'hand moved', id: 'hand', c: 3 }, { k: 'elbow moved', id: 'elbow', c: 2 }]);
    var degFmt = function (x) { return fix(x, 0) + '°'; };
    var S = [0, 1, 2].map(function (i) {
      return UI.slider(sl, { label: NAMES[i] + ' angle <span class="nm">θ' + SUB[i] + '</span>', min: LIM[i][0], max: LIM[i][1], step: 0.5, value: START[i], k: i === 2 ? 4 : i + 1, fmt: degFmt, onInput: posed });
    });
    var speed = UI.slider(slot(root, 'speed'), { label: 'Self-motion speed', min: -1, max: 1, step: 0.05, value: 0.5, fmt: function (v) { return fix(v, 2) + ' rad/s'; }, onInput: function () { update(); } });
    var bRun = UI.button(slot(root, 'buttons'), { label: 'Run self-motion', icon: 'play', cls: 'primary', onClick: function () { setRun(!running); update(); } });
    UI.button(slot(root, 'buttons'), { label: 'Straighten', icon: 'ruler', onClick: function () { setRun(false); glide([S[1], S[2]], [0, 0]); } });
    UI.button(slot(root, 'buttons'), { label: 'Reset', icon: 'reset', onClick: function () { setRun(false); S.forEach(function (s, i) { s.set(START[i]); }); speed.set(0.5); posed(); } });

    function tipOf(qq) { return Robots.fk(len, qq)[3]; }
    function syncSliders() { S.forEach(function (s, i) { s.set(deg(q[i])); }); }
    function forget() { ghost = null; trailE = []; trailW = []; }
    /* the user set a pose by hand: the hand's new place becomes the target */
    function posed() {
      setRun(false);
      q = S.map(function (s) { return LA.rad(s.get()); });
      target = tipOf(q); forget(); update();
    }
    function setRun(on) {
      if (on === running) return;
      running = on; lastMove = null;
      if (on) { ghost = Robots.fk(len, q); trailE = [ghost[1].slice()]; trailW = [ghost[2].slice()]; }
      bRun.innerHTML = icon(on ? 'pause' : 'play') + '<span>' + (on ? 'Stop' : 'Run self-motion') + '</span>';
    }
    /* pull the hand back onto the target: solve (J Jᵀ) λ = error, then add Jᵀ λ to the joints */
    function pull(qq, goal, times) {
      for (var it = 0; it < times; it++) {
        var e = LA.vsub(goal, tipOf(qq)), J = Robots.jacobian(len, qq);
        var lam = LA.solve(LA.mul(J, LA.T(J)), e);
        if (!lam) return null;
        qq = LA.vadd(qq, LA.mv(LA.T(J), lam));
      }
      return qq;
    }
    /* dragging the hand: small joint steps, the smallest that move the hand the right way */
    function reach(goal) {
      var r = LA.norm(goal), R = len[0] + len[1] + len[2] - 0.02, qq = q.slice();
      if (r > R) goal = LA.vscale(goal, R / r);
      for (var it = 0; it < 40; it++) {
        var e = LA.vsub(goal, tipOf(qq)), en = LA.norm(e);
        if (en < 1e-4) break;
        if (en > 0.2) e = LA.vscale(e, 0.2 / en);
        var J = Robots.jacobian(len, qq), M = LA.mul(J, LA.T(J));
        M[0][0] += 0.004; M[1][1] += 0.004;            /* a little damping keeps the step finite near a straight arm */
        var lam = LA.solve(M, e);
        if (!lam) break;
        var dq = LA.mv(LA.T(J), lam);
        qq = qq.map(function (v, i) { return LA.clamp(v + dq[i], LA.rad(LIM[i][0]), LA.rad(LIM[i][1])); });
      }
      q = qq; syncSliders(); target = tipOf(q); forget(); update();
    }

    function update() {
      var pts = Robots.fk(len, q), J = Robots.jacobian(len, q), tip = pts[3], i;
      if (!target) target = tip.slice();
      /* smallest stretch factor of J, from the 2 by 2 matrix J Jᵀ: zero means the columns are all parallel */
      var M = LA.mul(J, LA.T(J)), tr = M[0][0] + M[1][1], det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
      var smin = Math.sqrt(Math.max(0, (tr - Math.sqrt(Math.max(0, tr * tr - 4 * det))) / 2));
      var rank = smin < 1e-6 ? 1 : 2, n, u = null, n2 = null;
      if (rank === 2) {
        n = cross3(J[0], J[1]);                        /* at right angles to both rows, so J n = 0 */
        n = LA.vscale(n, 1 / LA.norm(n));
      } else {
        /* every column is a multiple d_i of one direction u, so N(J) is the plane d . x = 0 */
        var big = 0;
        for (i = 1; i < 3; i++) if (LA.norm(LA.col(J, i)) > LA.norm(LA.col(J, big))) big = i;
        u = LA.col(J, big); u = LA.vscale(u, 1 / LA.norm(u));
        var d = [0, 1, 2].map(function (j) { return LA.dot(LA.col(J, j), u); });
        n = [d[1], -d[0], 0]; n = LA.vscale(n, 1 / LA.norm(n));
        n2 = [d[2], 0, -d[0]]; n2 = LA.vscale(n2, 1 / LA.norm(n2));
      }
      st = { pts: pts, J: J, tip: tip, n: n, n2: n2, u: u, rank: rank, smin: smin };
      eq.innerHTML = UI.eq(
        UI.mx(J, { cols: { 0: 'h1', 1: 'h2', 2: 'h4' }, fmt: f2, cap: 'J · one column per joint' }),
        UI.mx(n, { rows: { 0: 'h1', 1: 'h2', 2: 'h4' }, fmt: f2, cap: 'joint speeds' }), '=',
        UI.mx(LA.mv(J, n), { cols: { 0: 'h3' }, fmt: f2, cap: 'hand velocity' }));
      var handMoved = LA.norm(LA.vsub(tip, target)), elbowMoved = ghost ? LA.norm(LA.vsub(pts[1], ghost[1])) : 0;
      out.rank(rank); out.dc(rank); out.dn(3 - rank);
      out.hand(fix(handMoved * 1000, 2) + ' mm'); out.elbow(fix(elbowMoved, 2) + ' m');
      var sp = speed.get();
      if (rank === 1) {
        var straight = Math.abs(q[1]) < 1e-6 && Math.abs(q[2]) < 1e-6;
        UI.status(status, 'bad', '<b>Rank 1: the arm is ' + (straight ? 'stretched out straight' : 'folded flat') + '.</b> All three columns are parallel, so C(J) has collapsed to a line: the hand can only move sideways, across the arm. N(J) has grown to a plane: two independent joint-speed patterns now leave the hand still for that instant. Bend the arm to get the full plane of hand motion back.');
      } else if (running && Math.abs(sp) < 1e-9) {
        UI.status(status, 'hot', 'The self-motion speed is zero, so nothing moves. Slide it away from zero.');
      } else if (running) {
        UI.status(status, 'ok', '<b>Self-motion.</b> The joints turn at ' + tup(LA.vscale(n, sp * dir), f2) + ' rad/s, a multiple of the nullspace vector. The elbow has travelled ' + fix(elbowMoved, 2) + ' m from the ghost pose. The hand has moved ' + fix(handMoved * 1000, 2) + ' mm.');
      } else if (smin < 0.15) {
        UI.status(status, 'hot', '<b>Rank 2, but only just.</b> The arm is nearly straight and the three columns are nearly parallel. C(J) is still the whole plane on paper, yet moving the hand along the arm would take very fast joints.');
      } else {
        UI.status(status, '', '<b>Rank 2.</b> The three columns give two independent directions, so C(J) is the whole plane: the hand can move any way you ask. Three joints minus two leaves one spare direction in joint space. That line is N(J), and following it is the self-motion.');
      }
      plot.draw();
    }
    /* a short curved arrow around a joint: which way it turns and how fast */
    function turnMark(p, c, a0, sweep, col) {
      if (Math.abs(sweep) < 0.08) return;
      var r = 25, a1 = a0 + sweep, P = p.px(c), sg = sweep > 0 ? 1 : -1, ctx = p.ctx;
      p.arc(c, r, a0, a1, { color: col, width: 2 });
      var ex = P[0] + r * Math.cos(a1), ey = P[1] - r * Math.sin(a1), tx = -Math.sin(a1) * sg, ty = -Math.cos(a1) * sg;
      ctx.save(); ctx.fillStyle = col; ctx.beginPath();
      ctx.moveTo(ex + tx * 7, ey + ty * 7); ctx.lineTo(ex - tx * 2 - ty * 4.5, ey - ty * 2 + tx * 4.5); ctx.lineTo(ex - tx * 2 + ty * 4.5, ey - ty * 2 - tx * 4.5);
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
    plot.handle({ get: function () { return st.tip || [0, 0]; }, set: function (x, y) { setRun(false); reach([x, y]); }, color: C.s3 });
    plot.onDraw(function (p) {
      if (!st.pts) return;
      var i, tip = st.tip, a = 0;
      p.grid({ labels: false, axes: false });
      p.circle([0, 0], len[0] + len[1] + len[2], { color: C.faint, width: 1, dash: [3, 6] });
      p.note('edge of reach', -12, 16, { align: 'right', color: C.faint });
      if (ghost) Robots.drawArm(p, ghost, { ghost: true, gripper: false, base: false });
      Robots.drawTrail(p, trailE, { color: C.s2, width: 1.8, dash: [2, 5] });
      Robots.drawTrail(p, trailW, { color: C.s4, width: 1.8, dash: [2, 5] });
      if (st.rank === 1) {
        p.line(LA.vadd(tip, LA.vscale(st.u, -2.4)), LA.vadd(tip, LA.vscale(st.u, 2.4)), { color: C.s3, width: 1.6, dash: [6, 5] });
        /* label the end of the line that is nearer the middle of the picture */
        var e1 = LA.vadd(tip, LA.vscale(st.u, 1.9)), e2 = LA.vadd(tip, LA.vscale(st.u, -1.9)), mid = [p.view.cx, p.view.cy];
        var end = LA.norm(LA.vsub(e1, mid)) < LA.norm(LA.vsub(e2, mid)) ? e1 : e2;
        p.text('C(J) is now this line', end, { color: C.s3, dx: end[0] > tip[0] ? 10 : -10, dy: 12, align: end[0] > tip[0] ? 'left' : 'right' });
      }
      Robots.drawArm(p, st.pts, { jointColors: cl, labels: ['θ₁', 'θ₂', 'θ₃'] });
      /* the self-motion pattern: how each joint turns, to scale */
      if (st.rank === 2) {
        var k = speed.get() * dir * 1.9;
        for (i = 0; i < 3; i++) { a += q[i]; turnMark(p, st.pts[i], a, st.n[i] * k, cl[i]); }
      }
      /* the three columns of J, drawn where they act: at the hand */
      for (i = 0; i < 3; i++) p.arrow(tip, LA.vadd(tip, LA.vscale(LA.col(st.J, i), 0.42)), { color: cl[i], width: 2.6, head: 9 });
    });
    UI.loop(canvas, function (dt) {
      if (!running) return;
      if (st.rank < 2) { setRun(false); update(); return; }
      var sp = speed.get();
      if (Math.abs(sp) < 1e-9) return;
      var move = LA.vscale(st.n, sp * dir);
      /* keep travelling the same way even if the computed nullspace vector changes sign */
      if (lastMove && LA.dot(move, lastMove) < 0) { dir = -dir; move = LA.vscale(move, -1); }
      var qn = pull(LA.vadd(q, LA.vscale(move, dt)), target, 2);
      var blocked = !qn || qn.some(function (v, i) { return v < LA.rad(LIM[i][0]) || v > LA.rad(LIM[i][1]); });
      if (blocked) { dir = -dir; lastMove = null; return; }       /* a joint limit: turn round */
      q = qn; lastMove = move; syncSliders();
      var pts = Robots.fk(len, q);
      Robots.pushTrail(trailE, pts[1], 900, 0.02); Robots.pushTrail(trailW, pts[2], 900, 0.02);
      update();
    });
    update();
  });

  /* ------------------------------------------------------------------ 6.4 */
  UI.lab('lab-shifted', function (root) {
    var canvas = root.querySelector('canvas');
    var plot = new Plot3D(canvas, { span: 8.8, yaw: 1.9, pitch: 0.6 });   /* seen from where the two lines look furthest apart */
    var status = slot(root, 'status'), eq = slot(root, 'eq'), sl = slot(root, 'sliders');
    var n = [1, 1, -1], B = [1, 2, 3, 4];
    var sc = UI.slider(sl, { label: 'Slide along both lines: <span class="nm">c</span>', min: -2, max: 2, step: 0.25, value: -1, onInput: function () { jump.set(key(), false); update(); } });
    var ss = UI.slider(sl, { label: 'Size of <span class="nm">b</span>: this many of (1, 2, 3, 4)', min: 0, max: 2, step: 0.25, value: 1, k: 3, onInput: function () { jump.set(key(), false); update(); } });
    function key() { return ss.get() !== 1 ? '' : (sc.get() === 0 ? 'a' : (sc.get() === -1 ? 'b' : '')); }
    var jump = UI.seg(slot(root, 'presets'), {
      label: 'The two solutions named in the lecture', value: 'b',
      options: [{ v: 'a', label: 'x = (1, 0, 0)' }, { v: 'b', label: 'x = (0, −1, 1)' }],
      onChange: function (v) { ss.set(1); glide([sc], [v === 'a' ? 0 : -1]); }
    });
    function parts() {
      var c = sc.get(), s = ss.get(), xp = [s, 0, 0], xn = LA.vscale(n, c);
      return { c: c, s: s, xp: xp, xn: xn, x: LA.vadd(xp, xn) };
    }
    function group() { return '<span class="eqg">' + Array.prototype.join.call(arguments, '') + '</span>'; }
    function update() {
      var g = parts(), dec = function (v) { return num(v, 2); }, op = function (t) { return '<span class="op">' + t + '</span>'; };
      var Am = UI.mx(A, { cls: 'sm' });
      plot.span = 8.8 + 1.5 * Math.max(0, g.s - 1);      /* a bigger b needs a wider view */
      eq.innerHTML = UI.eq(
        group(Am, UI.mx(g.x, { cols: { 0: 'h3' }, cls: 'sm', fmt: dec, cap: 'x' }), op('='), UI.mx(LA.mv(A, g.x).map(LA.clean), { cols: { 0: 'h3' }, cls: 'sm', fmt: dec, cap: 'b' })),
        group(Am, UI.mx(g.xn, { cols: { 0: 'h2' }, cls: 'sm', fmt: dec, cap: 'x<sub>n</sub>' }), op('='), UI.mx(LA.mv(A, g.xn).map(LA.clean), { cols: { 0: 'h2' }, cls: 'sm', fmt: dec, cap: 'zero' })));
      if (g.s < 1e-9) UI.status(status, 'ok', '<b>b = 0: the two lines are one.</b> With a zero right-hand side the solutions of A<b>x</b> = <b>b</b> are the nullspace itself. This is the only <b>b</b> whose solutions form a subspace.');
      else UI.status(status, 'hot', '<b>Two parallel lines, one subspace.</b> The blue line passes through the origin: it is the nullspace N(A), and A sends every point of it to zero. The amber line holds every solution of A<b>x</b> = ' + tup(LA.vscale(B, g.s), dec) + '. It is the blue line shifted by the red arrow, it misses the origin, and so it is not a subspace.');
      plot.draw();
    }
    plot.onDraw(function (p) {
      var g = parts(), ext = 2.75, far = LA.vscale(n, ext), near = LA.vscale(n, -ext);
      p.poly([[-3.2, -3.2, 0], [3.2, -3.2, 0], [3.2, 3.2, 0], [-3.2, 3.2, 0]], { fill: 'rgba(255,255,255,.03)', color: 'rgba(255,255,255,.13)', width: 1 });
      p.axes(3.6, ['x₁', 'x₂', 'x₃']);
      p.line(near, far, { color: C.s2, width: 2.2 });
      p.line(LA.vadd(g.xp, near), LA.vadd(g.xp, far), { color: C.s3, width: 2.2, dash: g.s > 1e-9 ? [] : [9, 9] });   /* dashed when it lies on top of the blue line */
      p.text('N(A)', LA.vscale(n, -ext), { color: C.s2, align: 'left', dx: 9 });
      if (g.s > 1e-9) p.text('all solutions', LA.vadd(g.xp, LA.vscale(n, -ext)), { color: C.s3, align: 'right', dx: -10 });
      /* the same shift, drawn at the origin and again at the moving point */
      if (g.s > 1e-9) {
        p.arrow([0, 0, 0], g.xp, { color: C.s1, width: 3 });
        if (Math.abs(g.c) > 1e-9) p.arrow(g.xn, g.x, { color: C.s1, width: 1.8, alpha: .7, dash: [5, 4] });
      }
      p.point([0, 0, 0], { r: 4.5, color: C.chalk, ring: C.board, label: '0', math: false });
      p.point(g.xn, { r: 5.5, color: C.s2, ring: C.board, label: Math.abs(g.c) > 1e-9 ? 'xₙ' : '' });
      p.point(g.x, { r: 6.5, color: C.s3, ring: C.board, label: 'x' });
    });
    update();
  });
})();
