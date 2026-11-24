/* ==========================================================================
   Lecture 1 labs: the geometry of linear equations
   1.1 rows as lines        1.2 beacon triangulation   1.3 column mixing
   1.4 two-link arm         1.5 A times x two ways     1.6 columns in 3-D
   1.7 three-thruster vehicle
   ========================================================================== */
(function () {
  'use strict';
  var C = window.PlotColors, num = LA.num, fix = LA.fix;
  function slot(root, name) { return root.querySelector('[data-slot="' + name + '"]'); }
  function deg(r) { return r * 180 / Math.PI; }
  /* acute angle (degrees) between two directions given as vectors */
  function lineAngle(u, v) {
    var c = Math.abs(LA.dot(u, v)) / ((LA.norm(u) * LA.norm(v)) || 1);
    return deg(Math.acos(Math.min(1, c)));
  }
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

  /* ------------------------------------------------------------------ 1.1 */
  UI.lab('lab-rows', function (root) {
    var CASES = {
      lecture: [[2, -1, 0], [-1, 2, 3]],
      parallel: [[2, -1, 0], [2, -1, 3]],
      same: [[2, -1, 0], [-4, 2, 0]]
    };
    var M = LA.clone(CASES.lecture);
    var plot = new Plot2D(root.querySelector('canvas'), { cx: 0, cy: 1, w: 10 });
    var status = slot(root, 'status'), sys = slot(root, 'system');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'x', id: 'x', c: 3 }, { k: 'y', id: 'y', c: 3 }, { k: 'crossing angle', id: 'ang' }]);

    /* the two equations as editable rows */
    sys.innerHTML = [0, 1].map(function (i) {
      return '<div class="sysrow c' + (i + 1) + '"><input class="num-in" id="rows-a' + i + '" type="number" step="any" inputmode="decimal" aria-label="row ' + (i + 1) + ' coefficient of x"><span class="m">x&nbsp;+</span>' +
        '<input class="num-in" id="rows-b' + i + '" type="number" step="any" inputmode="decimal" aria-label="row ' + (i + 1) + ' coefficient of y"><span class="m">y&nbsp;=</span>' +
        '<input class="num-in" id="rows-c' + i + '" type="number" step="any" inputmode="decimal" aria-label="row ' + (i + 1) + ' right-hand side"></div>';
    }).join('');
    sys.className = 'lab-math sys';
    var inputs = UI.$$('input', sys);
    function fill() { inputs.forEach(function (inp, k) { inp.value = M[Math.floor(k / 3)][k % 3]; }); }
    function read() { inputs.forEach(function (inp, k) { var v = parseFloat(inp.value); M[Math.floor(k / 3)][k % 3] = isFinite(v) ? v : 0; }); }
    sys.addEventListener('input', function () { read(); seg.set('', false); update(); });
    var seg = UI.seg(slot(root, 'presets'), {
      label: 'Example systems', value: 'lecture',
      options: [{ v: 'lecture', label: 'Lecture example' }, { v: 'parallel', label: 'Parallel' }, { v: 'same', label: 'Same line' }],
      onChange: function (v) { M = LA.clone(CASES[v]); fill(); update(); }
    });

    var sol = null, kind = '';
    function update() {
      var a = M[0], b = M[1], det = a[0] * b[1] - a[1] * b[0];
      var z0 = Math.abs(a[0]) + Math.abs(a[1]) < 1e-12, z1 = Math.abs(b[0]) + Math.abs(b[1]) < 1e-12;
      sol = null;
      if (z0 || z1) {
        kind = 'empty';
        UI.status(status, 'bad', 'A row with both coefficients zero is not a line. Give row ' + (z0 ? 1 : 2) + ' at least one non-zero coefficient.');
      } else if (Math.abs(det) > 1e-9) {
        kind = 'one';
        sol = [(a[2] * b[1] - a[1] * b[2]) / det, (a[0] * b[2] - a[2] * b[0]) / det];
        UI.status(status, 'ok', '<b>One solution.</b> The lines cross at (' + num(sol[0]) + ', ' + num(sol[1]) + '). That point satisfies both rows.');
      } else if (Math.abs(a[0] * b[2] - a[2] * b[0]) < 1e-9 && Math.abs(a[1] * b[2] - a[2] * b[1]) < 1e-9) {
        kind = 'same';
        UI.status(status, 'hot', '<b>Infinitely many solutions.</b> Row 2 is a multiple of row 1, so both rows draw the same line. Singular.');
      } else {
        kind = 'none';
        UI.status(status, 'bad', '<b>No solution.</b> The lines are parallel and never meet. The two facts contradict each other. Singular.');
      }
      out.x(sol ? num(sol[0]) : '–'); out.y(sol ? num(sol[1]) : '–');
      out.ang((z0 || z1) ? '–' : num(lineAngle([-a[1], a[0]], [-b[1], b[0]]), 1) + '°');
      plot.draw();
    }
    plot.onDraw(function (p) {
      p.grid({ xlabel: 'x', ylabel: 'y' });
      var a = M[0], b = M[1];
      p.lineABC(a[0], a[1], a[2], { color: C.s1, width: 2.6 });
      p.lineABC(b[0], b[1], b[2], { color: C.s2, width: 2.6, dash: kind === 'same' ? [9, 9] : [] });
      if (sol) {
        p.point(sol, { r: 6, color: C.s3, ring: C.board, width: 2, label: '(' + num(sol[0]) + ', ' + num(sol[1]) + ')', math: false });
      }
    });
    fill(); update();
  });

  /* ------------------------------------------------------------------ 1.2 */
  UI.lab('lab-beacons', function (root) {
    var robot = [0.8, -1.3], B = [[-3.4, 2.1], [3.3, 1.7]], noise = 0;
    var plot = new Plot2D(root.querySelector('canvas'), { cx: 0, cy: 0.3, w: 11.5 });
    var status = slot(root, 'status'), sys = slot(root, 'system');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'computed x', id: 'x', c: 3 }, { k: 'computed y', id: 'y', c: 3 }, { k: 'crossing angle', id: 'ang' }, { k: 'position error', id: 'err' }]);
    UI.slider(slot(root, 'noise'), { label: 'Bearing sensor error, up to', min: 0, max: 3, step: 0.1, value: 0, k: 3, fmt: function (v) { return fix(v, 1) + '°'; }, onInput: function (v) { noise = v; update(); } });

    var st = {};
    function update() {
      var e = LA.rad(noise);
      var t1 = Math.atan2(B[0][1] - robot[1], B[0][0] - robot[0]), t2 = Math.atan2(B[1][1] - robot[1], B[1][0] - robot[0]);
      /* the two errors are signed so that they pull the crossing point along the lines (the bad direction) */
      var phi = [t1 + e, t2 - e * Math.cos(t1 - t2)];
      /* each bearing gives one row:  sin(phi) x - cos(phi) y = sin(phi) p - cos(phi) q  */
      var A = phi.map(function (f) { return [Math.sin(f), -Math.cos(f)]; });
      var b = phi.map(function (f, i) { return Math.sin(f) * B[i][0] - Math.cos(f) * B[i][1]; });
      var ang = lineAngle([Math.cos(phi[0]), Math.sin(phi[0])], [Math.cos(phi[1]), Math.sin(phi[1])]);
      var x = ang > 0.6 ? LA.solve(A, b) : null;
      st = { A: A, b: b, x: x, ang: ang };
      sys.innerHTML = UI.eq(
        UI.mx(A, { fmt: function (v) { return fix(v, 2); }, rows: { 0: 'h1', 1: 'h2' } }),
        UI.mx(['<i>x</i>', '<i>y</i>']), '=',
        UI.mx(b, { fmt: function (v) { return fix(v, 2); }, rows: { 0: 'h1', 1: 'h2' } }));
      var err = x ? Math.sqrt(Math.pow(x[0] - robot[0], 2) + Math.pow(x[1] - robot[1], 2)) : NaN;
      out.x(x ? fix(x[0], 2) : '–'); out.y(x ? fix(x[1], 2) : '–');
      out.ang(fix(ang, 1) + '°'); out.err(x ? fix(err, 2) + ' m' : '–');
      if (!x) UI.status(status, 'bad', '<b>Singular: no fix.</b> The robot is in line with both beacons, so the two bearings draw the same line. Two equations, but only one fact.');
      else if (ang < 18) UI.status(status, 'hot', '<b>Thin crossing: a fragile fix.</b> The lines are nearly parallel. ' + (noise > 0 ? 'A ' + fix(noise, 1) + '° sensor error has become ' + fix(err, 2) + ' m of position error.' : 'Add some sensor error to see how badly this geometry amplifies it.'));
      else UI.status(status, 'ok', '<b>Good fix.</b> The lines cross at ' + fix(ang, 0) + '°, so the crossing point is well pinned down' + (noise > 0 ? ' and the error stays small (' + fix(err, 2) + ' m).' : '.'));
      plot.draw();
    }
    plot.handle({ get: function () { return robot; }, set: function (x, y) { robot = [x, y]; update(); }, color: C.chalk, label: 'robot' });
    plot.handle({ get: function () { return B[0]; }, set: function (x, y) { B[0] = [x, y]; update(); }, color: C.s1 });
    plot.handle({ get: function () { return B[1]; }, set: function (x, y) { B[1] = [x, y]; update(); }, color: C.s2 });
    plot.onDraw(function (p) {
      p.grid({ labels: false, axes: false });
      if (!st.A) return;
      p.lineABC(st.A[0][0], st.A[0][1], st.b[0], { color: C.s1, width: 2, dash: [7, 6] });
      p.lineABC(st.A[1][0], st.A[1][1], st.b[1], { color: C.s2, width: 2, dash: [7, 6] });
      Robots.drawBeacon(p, B[0], { color: C.s1, label: 'beacon 1' });
      Robots.drawBeacon(p, B[1], { color: C.s2, label: 'beacon 2' });
      Robots.drawRover(p, { x: robot[0], y: robot[1], th: Math.PI / 2 }, { L: .62, W: .46 });
      if (st.x) {
        p.line(robot, st.x, { color: C.s3, width: 1.5, dash: [2, 4] });
        p.point(st.x, { r: 9, fill: 'none', ring: C.s3, width: 2.5 });
      }
    });
    update();
  });

  /* ------------------------------------------------------------------ 1.3 */
  UI.lab('lab-cols', function (root) {
    var SETS = { lecture: [[2, -1], [-1, 2]], parallel: [[2, -1], [-4, 2]] };
    var a = SETS.lecture, b = [0, 3];
    var plot = new Plot2D(root.querySelector('canvas'), { cx: 0, cy: 0.8, w: 12 });
    var status = slot(root, 'status'), eq = slot(root, 'eq'), sl = slot(root, 'sliders');
    var sx = UI.slider(sl, { label: '<span class="nm">x</span> &nbsp;how many red arrows', min: -3, max: 3, step: 0.25, value: 2, k: 1, onInput: update });
    var sy = UI.slider(sl, { label: '<span class="nm">y</span> &nbsp;how many blue arrows', min: -3, max: 3, step: 0.25, value: 0.5, k: 2, onInput: update });
    UI.seg(slot(root, 'presets'), {
      label: 'Column sets', value: 'lecture',
      options: [{ v: 'lecture', label: 'Lecture columns' }, { v: 'parallel', label: 'Parallel columns' }],
      onChange: function (v) { a = SETS[v]; update(); }
    });
    UI.button(slot(root, 'buttons'), { label: 'Show the answer', icon: 'target', cls: 'primary', onClick: function () {
      var s = answer();
      if (s) glide([sx, sy], [LA.clamp(s[0], -3, 3), LA.clamp(s[1], -3, 3)]);
    } });
    UI.button(slot(root, 'buttons'), { label: 'Reset target', icon: 'reset', onClick: function () { b = [0, 3]; update(); } });

    function det() { return a[0][0] * a[1][1] - a[0][1] * a[1][0]; }
    function onLine() { return Math.abs(a[0][0] * b[1] - a[0][1] * b[0]) < 0.06; }
    function answer() {
      if (Math.abs(det()) > 1e-9) return LA.solve(LA.fromCols(a), b);
      if (onLine()) return [LA.dot(b, a[0]) / LA.dot(a[0], a[0]), 0];
      return null;
    }
    function update() {
      var x = sx.get(), y = sy.get();
      var r = [x * a[0][0] + y * a[1][0], x * a[0][1] + y * a[1][1]];
      var d = Math.sqrt(Math.pow(r[0] - b[0], 2) + Math.pow(r[1] - b[1], 2));
      eq.innerHTML = UI.eq({ cls: 'left' },
        '<span class="m u c1">' + num(x) + '</span>', UI.mx(a[0], { cols: { 0: 'h1' } }), '+',
        '<span class="m u c2">' + num(y) + '</span>', UI.mx(a[1], { cols: { 0: 'h2' } }), '=',
        UI.mx(r, { fmt: function (v) { return num(v); } }), d < 0.02 ? '=' : '≠', UI.mx(b, { cols: { 0: 'h3' }, fmt: function (v) { return num(v); } }));
      var singular = Math.abs(det()) < 1e-9;
      if (d < 0.02) UI.status(status, 'ok', '<b>On target.</b> ' + num(x) + ' of column 1 plus ' + num(y) + ' of column 2 gives <b>b</b>. So x = ' + num(x) + ', y = ' + num(y) + ' solves the system.');
      else if (singular && !onLine()) UI.status(status, 'bad', '<b>Unreachable.</b> These columns point along the same line, so every mix stays on that line. This target is off the line: no solution.');
      else if (singular) UI.status(status, 'hot', '<b>Reachable in many ways.</b> The target sits on the line of the columns, so infinitely many mixes land on it.');
      else UI.status(status, '', 'You are ' + num(d) + ' away from the target. Drag the amber target anywhere: with these columns it is always reachable.');
      plot.draw();
    }
    plot.handle({ get: function () { return b; }, set: function (x, y) { b = [Math.round(x * 4) / 4, Math.round(y * 4) / 4]; update(); }, color: C.s3, label: 'b', math: true });
    plot.onDraw(function (p) {
      p.grid({});
      var i, j;
      for (i = -8; i <= 8; i++) for (j = -8; j <= 8; j++) p.point([i * a[0][0] + j * a[1][0], i * a[0][1] + j * a[1][1]], { r: 1.7, color: C.faint });
      p.arrow([0, 0], a[0], { color: C.s1, width: 1.4, alpha: .45, head: 8 });
      p.arrow([0, 0], a[1], { color: C.s2, width: 1.4, alpha: .45, head: 8 });
      var x = sx.get(), y = sy.get(), m = [x * a[0][0], x * a[0][1]], r = [m[0] + y * a[1][0], m[1] + y * a[1][1]];
      p.arrow([0, 0], m, { color: C.s1, width: 3.2 });
      p.arrow(m, r, { color: C.s2, width: 3.2 });
      p.point(r, { r: 4.5, color: C.chalk });
    });
    update();
  });

  /* ------------------------------------------------------------------ 1.4 */
  UI.lab('lab-arm', function (root) {
    var len = [2.2, 1.7], START = [58, -72], v = [0.9, 0.45], running = false, runT = 0;
    var canvas = root.querySelector('canvas');
    var plot = new Plot2D(canvas, { cx: 1.1, cy: 1.35, w: 9.6 });
    var status = slot(root, 'status'), eq = slot(root, 'eq'), sl = slot(root, 'sliders');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'shoulder speed', id: 'q1', c: 1 }, { k: 'elbow speed', id: 'q2', c: 2 }, { k: 'angle between columns', id: 'ang' }]);
    var s1 = UI.slider(sl, { label: 'Shoulder angle <span class="nm">θ₁</span>', min: 0, max: 180, step: 0.5, value: START[0], k: 1, fmt: function (x) { return fix(x, 0) + '°'; }, onInput: update });
    var s2 = UI.slider(sl, { label: 'Elbow angle <span class="nm">θ₂</span>', min: -160, max: 160, step: 0.5, value: START[1], k: 2, fmt: function (x) { return fix(x, 0) + '°'; }, onInput: update });
    var bRun = UI.button(slot(root, 'buttons'), { label: 'Move the hand', icon: 'play', cls: 'primary', onClick: function () { setRun(!running); } });
    UI.button(slot(root, 'buttons'), { label: 'Reset pose', icon: 'reset', onClick: function () { setRun(false); s1.set(START[0]); s2.set(START[1]); v = [0.9, 0.45]; update(); } });

    var st = {};
    function angles() { return [LA.rad(s1.get()), LA.rad(s2.get())]; }
    function setRun(on) {
      running = on; runT = 0;
      bRun.innerHTML = icon(on ? 'pause' : 'play') + '<span>' + (on ? 'Stop' : 'Move the hand') + '</span>';
    }
    function update() {
      var th = angles(), pts = Robots.fk(len, th), J = Robots.jacobian(len, th);
      var c1 = LA.col(J, 0), c2 = LA.col(J, 1), ang = lineAngle(c1, c2);
      var qd = ang > 0.4 ? LA.solve(J, v) : null;
      st = { pts: pts, J: J, c1: c1, c2: c2, qd: qd, ang: ang };
      var f2 = function (x) { return fix(x, 2); };
      eq.innerHTML = UI.eq({ cls: 'left' },
        '<span class="m u c1">' + (qd ? fix(qd[0], 2) : '?') + '</span>', UI.mx(c1, { cols: { 0: 'h1' }, fmt: f2 }), '+',
        '<span class="m u c2">' + (qd ? fix(qd[1], 2) : '?') + '</span>', UI.mx(c2, { cols: { 0: 'h2' }, fmt: f2 }), '=',
        UI.mx(v, { cols: { 0: 'h3' }, fmt: f2 }));
      out.q1(qd ? fix(qd[0], 2) + ' rad/s' : 'no answer'); out.q2(qd ? fix(qd[1], 2) + ' rad/s' : 'no answer'); out.ang(fix(ang, 1) + '°');
      var big = qd ? Math.max(Math.abs(qd[0]), Math.abs(qd[1])) : Infinity;
      if (!qd) UI.status(status, 'bad', '<b>Singular pose.</b> The arm is straight, so both joints can only swing the hand the same sideways way. The columns are parallel and this hand velocity is out of reach.');
      else if (ang < 14 || big > 4) UI.status(status, 'hot', '<b>Close to a singularity.</b> The columns are only ' + fix(ang, 0) + '° apart, so the joints must spin very fast (' + fix(big, 1) + ' rad/s) to produce a modest hand speed.');
      else UI.status(status, 'ok', '<b>Solved.</b> ' + fix(qd[0], 2) + ' of the shoulder column plus ' + fix(qd[1], 2) + ' of the elbow column adds up to the hand velocity you asked for.');
      plot.draw();
    }
    plot.handle({
      get: function () { var t = st.pts ? st.pts[2] : [0, 0]; return [t[0] + v[0], t[1] + v[1]]; },
      set: function (x, y) {
        var t = st.pts[2]; v = [x - t[0], y - t[1]];
        var n = LA.norm(v); if (n > 2.4) v = LA.vscale(v, 2.4 / n);
        update();
      }, color: C.s3
    });
    plot.onDraw(function (p) {
      if (!st.pts) return;
      p.grid({ labels: false, axes: false });
      p.circle([0, 0], len[0] + len[1], { color: C.faint, width: 1, dash: [3, 6] });
      p.note('edge of reach', -12, 16, { align: 'right', color: C.faint });
      var tip = st.pts[2], u1 = LA.vscale(st.c1, 1 / (LA.norm(st.c1) || 1)), u2 = LA.vscale(st.c2, 1 / (LA.norm(st.c2) || 1));
      p.line(LA.vadd(tip, LA.vscale(u1, -2.2)), LA.vadd(tip, LA.vscale(u1, 2.2)), { color: C.s1, width: 1.3, dash: [4, 5], alpha: .8 });
      p.line(LA.vadd(tip, LA.vscale(u2, -2.2)), LA.vadd(tip, LA.vscale(u2, 2.2)), { color: C.s2, width: 1.3, dash: [4, 5], alpha: .8 });
      Robots.drawArm(p, st.pts, { jointColors: [C.s1, C.s2], labels: ['θ₁', 'θ₂'] });
      if (st.qd) {
        var m = LA.vadd(tip, LA.vscale(st.c1, st.qd[0]));
        p.arrow(tip, m, { color: C.s1, width: 3 });
        p.arrow(m, LA.vadd(tip, v), { color: C.s2, width: 3 });
      }
      p.arrow(tip, LA.vadd(tip, v), { color: C.s3, width: 2.2, dash: [6, 4] });
    });
    UI.loop(canvas, function (dt) {
      if (!running) return;
      if (!st.qd) { setRun(false); return; }
      var qd = st.qd, big = Math.max(Math.abs(qd[0]), Math.abs(qd[1]));
      var k = big > 3 ? 3 / big : 1;                       /* joint speed limit */
      var n1 = s1.get() + deg(qd[0] * k * dt), n2 = s2.get() + deg(qd[1] * k * dt);
      runT += dt;
      if (n1 < 0 || n1 > 180 || Math.abs(n2) > 160 || runT > 2.2 || big > 12) { setRun(false); update(); return; }
      s1.set(n1); s2.set(n2); update();
    });
    update();
  });

  /* ------------------------------------------------------------------ 1.5 */
  UI.lab('lab-mv', function (root) {
    var A = [[2, 5], [1, 3]], mode = 'cols';
    var eq = slot(root, 'eq'), status = slot(root, 'status'), sl = slot(root, 'sliders');
    var ints = function (v) { return num(v, 0); };
    var s1 = UI.slider(sl, { label: 'First entry of x', min: -3, max: 3, step: 1, value: 1, k: 1, fmt: ints, onInput: update });
    var s2 = UI.slider(sl, { label: 'Second entry of x', min: -3, max: 3, step: 1, value: 2, k: 2, fmt: ints, onInput: update });
    UI.seg(slot(root, 'mode'), {
      label: 'Way of multiplying', value: 'cols',
      options: [{ v: 'cols', label: 'By columns' }, { v: 'rows', label: 'By rows' }],
      onChange: function (v) { mode = v; update(); }
    });
    function par(v) { return v < 0 ? '(' + num(v, 0) + ')' : num(v, 0); }
    function update() {
      var x = [s1.get(), s2.get()], r = LA.mv(A, x);
      if (mode === 'cols') {
        eq.innerHTML = UI.eq({ cls: 'lg' },
          UI.mx(A, { cols: { 0: 'h1', 1: 'h2' } }), UI.mx(x, { rows: { 0: 'h1', 1: 'h2' } }), '=',
          '<span class="m u c1">' + par(x[0]) + '</span>', UI.mx(LA.col(A, 0), { cols: { 0: 'h1' } }), '+',
          '<span class="m u c2">' + par(x[1]) + '</span>', UI.mx(LA.col(A, 1), { cols: { 0: 'h2' } }), '=', UI.mx(r));
        UI.status(status, '', '<b>By columns:</b> take ' + num(x[0], 0) + ' of the first column and ' + num(x[1], 0) + ' of the second, then add. The answer is a combination of the columns of A.');
      } else {
        var cell = function (i) { return A[i][0] + '·' + par(x[0]) + ' + ' + A[i][1] + '·' + par(x[1]); };
        eq.innerHTML = UI.eq({ cls: 'lg' },
          UI.mx(A, { rows: { 0: 'h3', 1: 'h4' } }), UI.mx(x), '=',
          UI.mx([cell(0), cell(1)], { rows: { 0: 'h3', 1: 'h4' } }), '=', UI.mx(r, { rows: { 0: 'h3', 1: 'h4' } }));
        UI.status(status, '', '<b>By rows:</b> each entry of the answer is one row of A multiplied into x and summed, a dot product. Same numbers, same answer.');
      }
    }
    update();
  });

  /* ------------------------------------------------------------------ 1.6 */
  UI.lab('lab-3d', function (root) {
    var cols = [[2, -1, 0], [-1, 2, -3], [0, -1, 4]], A = LA.fromCols(cols);
    var TARGETS = { b1: [0, -1, 4], b2: [1, 1, -3] }, b = TARGETS.b1;
    var plot = new Plot3D(root.querySelector('canvas'), { span: 11, yaw: -1.05, pitch: 0.36 });
    var status = slot(root, 'status'), eq = slot(root, 'eq'), sl = slot(root, 'sliders');
    var mk = function (name, k, v) { return UI.slider(sl, { label: '<span class="nm">' + name + '</span> &nbsp;of column ' + k, min: -2, max: 2, step: 0.25, value: v, k: k === 3 ? 4 : k, onInput: update }); };
    var S = [mk('x', 1, 1), mk('y', 2, 0.5), mk('z', 3, 0.5)];
    UI.seg(slot(root, 'presets'), {
      label: 'Targets', value: 'b1',
      options: [{ v: 'b1', label: 'b = (0, −1, 4)' }, { v: 'b2', label: 'b = (1, 1, −3)' }],
      onChange: function (v) { b = TARGETS[v]; update(); }
    });
    UI.button(slot(root, 'buttons'), { label: 'Show the answer', icon: 'target', cls: 'primary', onClick: function () { glide(S, LA.solve(A, b)); } });
    function update() {
      var x = S.map(function (s) { return s.get(); }), r = LA.mv(A, x);
      var d = LA.norm(LA.vsub(r, b));
      eq.innerHTML = UI.eq({ cls: 'left' },
        '<span class="m u c1">' + num(x[0]) + '</span>', UI.mx(cols[0], { cols: { 0: 'h1' }, cls: 'sm' }), '+',
        '<span class="m u c2">' + num(x[1]) + '</span>', UI.mx(cols[1], { cols: { 0: 'h2' }, cls: 'sm' }), '+',
        '<span class="m u c4">' + num(x[2]) + '</span>', UI.mx(cols[2], { cols: { 0: 'h4' }, cls: 'sm' }), '=',
        UI.mx(r, { cls: 'sm', fmt: function (v) { return num(v); } }));
      if (d < 0.02) UI.status(status, 'ok', '<b>On target.</b> x = ' + num(x[0]) + ', y = ' + num(x[1]) + ', z = ' + num(x[2]) + '. ' + (b === TARGETS.b1 ? 'The target is column 3 itself, so you need only one of column 3.' : 'This target is column 1 plus column 2, so z is not needed.'));
      else UI.status(status, '', 'You are ' + num(d) + ' away from the target (' + b.map(function (v) { return num(v); }).join(', ') + '). Hint: compare the target with the columns before you touch a slider.');
      plot.draw();
    }
    plot.onDraw(function (p) {
      var x = S.map(function (s) { return s.get(); });
      p.poly([[-4, -4, 0], [4, -4, 0], [4, 4, 0], [-4, 4, 0]], { fill: 'rgba(255,255,255,.035)', color: 'rgba(255,255,255,.14)', width: 1 });
      p.axes(4.6);
      var cl = [C.s1, C.s2, C.s4], pos = [0, 0, 0], i;
      for (i = 0; i < 3; i++) p.arrow([0, 0, 0], cols[i], { color: cl[i], width: 1.2, alpha: .4 });
      for (i = 0; i < 3; i++) {
        var nx = LA.vadd(pos, LA.vscale(cols[i], x[i]));
        p.arrow(pos, nx, { color: cl[i], width: 3 });
        pos = nx;
      }
      p.line(pos, [pos[0], pos[1], 0], { color: C.faint, width: 1, dash: [2, 4] });
      p.point(pos, { r: 4.5, color: C.chalk });
      p.line(b, [b[0], b[1], 0], { color: C.s3, width: 1, dash: [2, 4], alpha: .7 });
      p.point(b, { r: 7, color: C.s3, label: 'b' });
    });
    update();
  });

  /* ------------------------------------------------------------------ 1.7 */
  UI.lab('lab-thrust', function (root) {
    var LAYOUTS = {
      good: [{ x: -1.3, y: 0.5, ang: 0 }, { x: -1.3, y: -0.5, ang: 0 }, { x: 0.6, y: -0.7, ang: Math.PI / 2 }],
      centre: [{ x: -1.3, y: 0, ang: 0 }, { x: 0, y: -0.7, ang: Math.PI / 2 }, { x: -1.0, y: -0.6, ang: Math.atan2(0.6, 1.0) }]
    };
    var thr = LAYOUTS.good, layout = 'good';
    var pose = { x: 0, y: 0, th: 0 }, vel = [0, 0, 0], trail = [], f = [0, 0, 0], solvable = true;
    var canvases = root.querySelectorAll('canvas');
    var plot = new Plot2D(canvases[0], { cx: 0, cy: 0, w: 11 });
    var p3 = new Plot3D(canvases[1], { span: 3.6, yaw: -0.7, pitch: 0.42 });
    var status = slot(root, 'status'), eq = slot(root, 'eq'), sl = slot(root, 'sliders');
    var cl = [C.s1, C.s2, C.s4];
    var sFx = UI.slider(sl, { label: 'Forward push <span class="nm">F<sub>x</sub></span>', min: -2, max: 2, step: 0.1, value: 1, k: 3, fmt: function (v) { return fix(v, 1); }, onInput: update });
    var sFy = UI.slider(sl, { label: 'Side push <span class="nm">F<sub>y</sub></span>', min: -2, max: 2, step: 0.1, value: 0, k: 3, fmt: function (v) { return fix(v, 1); }, onInput: update });
    var sT = UI.slider(sl, { label: 'Turning effort <span class="nm">τ</span>', min: -1.5, max: 1.5, step: 0.1, value: 0, k: 3, fmt: function (v) { return fix(v, 1); }, onInput: update });
    UI.seg(slot(root, 'presets'), {
      label: 'Thruster layouts', value: 'good',
      options: [{ v: 'good', label: 'Good layout' }, { v: 'centre', label: 'All aimed at the centre' }],
      onChange: function (v) { layout = v; thr = LAYOUTS[v]; update(); }
    });
    UI.button(slot(root, 'buttons'), { label: 'Stop', icon: 'pause', onClick: function () { sFx.set(0); sFy.set(0); sT.set(0); update(); } });
    UI.button(slot(root, 'buttons'), { label: 'Recentre', icon: 'reset', onClick: function () { pose = { x: 0, y: 0, th: 0 }; vel = [0, 0, 0]; trail = []; plot.draw(); } });

    var Bm = null, want = [1, 0, 0];
    function update() {
      Bm = Robots.thrusterMatrix(thr);
      want = [sFx.get(), sFy.get(), sT.get()];
      var r = LA.eliminate(Bm, want, { pivoting: 'partial' });
      if (!r.singular) { f = r.x; solvable = true; }
      else if (Math.abs(want[2]) < 1e-9) { f = [want[0], want[1], 0]; solvable = true; }   /* torque row is all zeros */
      else { f = [0, 0, 0]; solvable = false; }
      var f2 = function (v) { return fix(v, 2); };
      eq.innerHTML = UI.eq({ cls: 'left' },
        UI.mx(Bm, { cols: { 0: 'h1', 1: 'h2', 2: 'h4' }, fmt: f2, cls: 'sm' }),
        UI.mx(solvable ? f : ['?', '?', '?'], { rows: { 0: 'h1', 1: 'h2', 2: 'h4' }, fmt: f2, cls: 'sm', cap: 'thrusts' }), '=',
        UI.mx(want, { cols: { 0: 'h3' }, fmt: function (v) { return fix(v, 1); }, cls: 'sm', cap: 'wanted' }));
      if (!solvable) UI.status(status, 'bad', '<b>No solution.</b> Every thruster pushes through the centre, so the torque row of the matrix is all zeros. No mix of these columns can turn the vehicle.');
      else if (r.singular) UI.status(status, 'hot', '<b>Solvable, but only because you asked for no turn.</b> The columns span just a plane. Any target inside that plane works and any target outside it fails.');
      else UI.status(status, 'ok', '<b>Solved.</b> Thrusts (' + f.map(function (v) { return fix(v, 2); }).join(', ') + ') combine the three columns into exactly the push and turn you asked for.');
      plot.draw(); p3.draw();
    }
    plot.onDraw(function (p) {
      p.view.cx = pose.x; p.view.cy = pose.y;
      p.s = p.W / p.view.w;
      p.grid({ labels: false, axes: false, major: 4 });
      Robots.drawTrail(p, trail, {});
      Robots.drawVehicle(p, pose, thr, { forces: f, colors: cl, scale: .75 });
    });
    p3.onDraw(function (p) {
      if (!Bm) return;
      if (layout === 'centre') p.plane([1, 0, 0], [0, 1, 0], 1.5, { fill: 'rgba(245,192,78,.10)', color: 'rgba(245,192,78,.4)' });
      p.axes(1.55, ['Fx', 'Fy', 'τ']);
      for (var i = 0; i < 3; i++) p.arrow([0, 0, 0], LA.col(Bm, i), { color: cl[i], width: 2.6 });
      var k = 1 / Math.max(1, LA.norm(want) / 1.5);
      p.arrow([0, 0, 0], LA.vscale(want, k), { color: C.s3, width: 2.2, dash: [5, 4] });
      p.note('amber dashed = wanted b', 10, -12, { color: C.faint });
    });
    UI.loop(canvases[0], function (dt) {
      /* thrust -> acceleration, with water drag so the vehicle settles at a steady speed */
      var w = LA.mv(Bm, f), m = [1, 1, 0.8], drag = [1.3, 1.3, 1.6];
      for (var i = 0; i < 3; i++) vel[i] += (w[i] - drag[i] * vel[i]) / m[i] * dt;
      if (Math.abs(vel[0]) + Math.abs(vel[1]) + Math.abs(vel[2]) < 1e-4) return;
      pose = Robots.step(pose, vel, dt);
      Robots.pushTrail(trail, [pose.x, pose.y], 500, 0.05);
      plot.draw();
    });
    update();
  });
})();
