/* ==========================================================================
   capstone.js: one three-joint planar arm, seen through the seven lectures.
   All the lenses read the same 2 by 3 Jacobian J in the same pose.
   ========================================================================== */
(function () {
  'use strict';
  var C = window.PlotColors, fix = LA.fix;
  var f2 = function (v) { return fix(v, 2); };
  function slot(root, name) { return root.querySelector('[data-slot="' + name + '"]'); }
  function deg(r) { return r * 180 / Math.PI; }
  function cross3(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  /* quarter turn anticlockwise */
  function perp(v) { return [-v[1], v[0]]; }

  var LENSES = [
    { n: '01', short: 'Columns', kicker: 'Lecture 1 · the column picture', title: 'Each joint owns one column' },
    { n: '02', short: 'Eliminate', kicker: 'Lecture 2 · elimination', title: 'Two pivots, three unknowns' },
    { n: '03', short: 'Products', kicker: 'Lecture 3 · multiplication', title: 'The pose is a product of three matrices' },
    { n: '04', short: 'LU', kicker: 'Lecture 4 · factor once, solve many', title: 'Factor, then reuse every tick' },
    { n: '05', short: 'Transpose', kicker: 'Lecture 5 · the transpose', title: 'Forces come back through Jᵀ' },
    { n: '06', short: 'Subspaces', kicker: 'Lecture 6 · column space and nullspace', title: 'What the hand can do, and what it cannot feel' },
    { n: '07', short: 'Rank', kicker: 'Lecture 7 · pivots, free variables, rank', title: 'Two directions, one spare joint' }
  ];

  UI.lab('cap-lab', function (root) {
    var len = [1.6, 1.3, 1.0], START = [25, 45, 40];
    var JC = [C.s1, C.s2, C.s4];                 /* joint colours: shoulder, elbow, wrist */
    var lens = 0, vec = [0.8, 0.5], force = [0.9, -0.6];
    var following = false, tFollow = 0, selfRate = 0, elbowTrail = [], handTrail = [];
    var canvas = root.querySelector('canvas');
    var plot = new Plot2D(canvas, { cx: 0.7, cy: 1.35, w: 8.4, h: 6.3 });
    var mathEl = slot(root, 'math'), statusEl = slot(root, 'status'), textEl = slot(root, 'text');
    var out = UI.readouts(slot(root, 'readouts'), [{ k: 'rank of J', id: 'rank' }, { k: 'free joints n − r', id: 'free' }, { k: 'hand x, y', id: 'hand', c: 3 }]);

    /* ---- controls ---- */
    var S = ['Shoulder <span class="nm">θ₁</span>', 'Elbow <span class="nm">θ₂</span>', 'Wrist <span class="nm">θ₃</span>'].map(function (label, i) {
      return UI.slider(slot(root, 'sliders'), { label: label, min: i ? -170 : -30, max: i ? 170 : 200, step: 0.01, value: START[i], k: i === 2 ? 4 : i + 1, fmt: function (v) { return fix(v, 0) + '°'; }, onInput: function () { elbowTrail = []; update(); } });
    });
    var bFollow = UI.button(slot(root, 'buttons'), { label: 'Trace a path', icon: 'play', cls: 'primary', onClick: function () { setFollow(!following); } });
    var bSelf = UI.button(slot(root, 'buttons'), { label: 'Self-motion', icon: 'loop', onClick: function () { selfRate = selfRate ? 0 : 0.9; syncSelf(); } });
    UI.button(slot(root, 'buttons'), { label: 'Reset', icon: 'reset', onClick: function () {
      setFollow(false); selfRate = 0; syncSelf();
      S.forEach(function (s, i) { s.set(START[i]); }); vec = [0.8, 0.5]; force = [0.9, -0.6]; elbowTrail = []; handTrail = []; update();
    } });
    function setFollow(on) {
      following = on; if (on) { tFollow = 0; handTrail = []; }
      bFollow.innerHTML = icon(on ? 'pause' : 'play') + '<span>' + (on ? 'Stop' : 'Trace a path') + '</span>';
    }
    function syncSelf() {
      bSelf.classList.toggle('on', !!selfRate);
      bSelf.innerHTML = icon(selfRate ? 'pause' : 'loop') + '<span>' + (selfRate ? 'Stop self-motion' : 'Self-motion') + '</span>';
      if (!selfRate) elbowTrail = [];
    }

    var lensBox = slot(root, 'lenses');
    LENSES.forEach(function (L, i) {
      var b = UI.el('button', '', '<b>' + L.n + '</b><span>' + L.short + '</span>');
      b.type = 'button'; b.setAttribute('aria-pressed', String(i === 0)); b.setAttribute('data-v', String(i));
      b.title = L.kicker;
      b.addEventListener('click', function () { lens = i; UI.$$('button', lensBox).forEach(function (x, k) { x.setAttribute('aria-pressed', String(k === i)); }); update(); });
      lensBox.appendChild(b);
    });

    /* ---- the state every lens reads ---- */
    var st = {};
    function angles() { return S.map(function (s) { return LA.rad(s.get()); }); }
    function compute() {
      var q = angles(), pts = Robots.fk(len, q), J = Robots.jacobian(len, q);
      var rr = LA.rref(J, 1e-6), rank = rr.rank;
      var n = cross3(J[0], J[1]), nn = LA.norm(n);
      var nullDir = nn > 1e-9 ? LA.vscale(n, 1 / nn) : null;           /* N(J) when rank is 2 */
      var JJt = LA.mul(J, LA.T(J));
      /* smallest joint speeds that give v: q̇ = Jᵀ y with (J Jᵀ) y = v */
      var y = rank === 2 ? LA.solve(JJt, vec) : null;
      var qd = y ? LA.mv(LA.T(J), y) : null;
      st = { q: q, pts: pts, J: J, rr: rr, rank: rank, nullDir: nullDir, JJt: JJt, qd: qd, cols: [0, 1, 2].map(function (j) { return LA.col(J, j); }) };
    }

    /* ---- lens panels: text, maths, status ---- */
    function panel() {
      var L = LENSES[lens], J = st.J, html = '', text = '', status = ['', ''];
      slot(root, 'kicker').textContent = L.kicker;
      slot(root, 'title').textContent = L.title;
      var cap = function (t) { return { cap: t, fmt: f2, cls: 'sm' }; };
      if (lens === 0) {
        text = '<p>Column <i>j</i> of <b>J</b> is the hand velocity when only joint <i>j</i> turns, at 1 rad/s. It is the arrow from that joint to the hand, turned a quarter turn. Two rows (the hand moves across and up), three columns (three joints).</p><p>The wanted velocity <b>v</b> (amber) is built from the three columns, like the column picture of Lecture 1. With three columns in a plane there are many ways to do it; the arm uses the smallest joint speeds.</p>';
        html = UI.eq({ cls: 'left' },
          st.qd ? '<span class="m u c1">' + f2(st.qd[0]) + '</span>' : '?', UI.mx(st.cols[0], { cols: { 0: 'h1' }, fmt: f2, cls: 'sm' }), '+',
          st.qd ? '<span class="m u c2">' + f2(st.qd[1]) + '</span>' : '?', UI.mx(st.cols[1], { cols: { 0: 'h2' }, fmt: f2, cls: 'sm' }), '+',
          st.qd ? '<span class="m u c4">' + f2(st.qd[2]) + '</span>' : '?', UI.mx(st.cols[2], { cols: { 0: 'h4' }, fmt: f2, cls: 'sm' }), '=',
          UI.mx(vec, { cols: { 0: 'h3' }, fmt: f2, cls: 'sm' }));
        status = st.qd ? ['ok', '<b>Reachable.</b> The three columns span the plane, so any hand velocity is a combination of them.'] : ['bad', '<b>Singular pose.</b> All three columns lie on one line. Only velocities along that line can be produced.'];
      } else if (lens === 1) {
        var aug = J.map(function (r, i) { return r.concat([vec[i]]); });
        var ra = LA.rref(aug, 1e-6), elim = ra.steps.filter(function (s) { return s.kind === 'elim'; })[0];
        var U = ra.U, piv = ra.pivotCols.filter(function (c) { return c < 3; });
        text = '<p>Write <b>J q̇ = v</b> as an augmented matrix and eliminate, exactly as in Lecture 2. ' + (elim ? 'One step does it: <b>row 2 − (' + f2(elim.mult) + ') × row 1</b>.' : 'No step is needed here.') + '</p><p>Two rows give at most two pivots, but there are three unknowns. The column without a pivot belongs to a joint whose speed is not forced: choose it, and the other two follow by back-substitution.</p>';
        html = UI.eq({ cls: 'left' }, UI.mx(aug, { aug: 1, fmt: f2, cls: 'sm', cap: '[ J | v ]' }), '→',
          UI.mx(U, { aug: 1, fmt: f2, cls: 'sm', pivots: piv.map(function (c, i) { return [i, c]; }), cap: '[ U | c ]' }));
        var freeJ = [0, 1, 2].filter(function (c) { return piv.indexOf(c) < 0; });
        status = piv.length === 2 ? ['ok', '<b>Pivots in columns ' + piv.map(function (c) { return c + 1; }).join(' and ') + '.</b> Joint ' + freeJ.map(function (c) { return c + 1; }).join(', ') + ' is free.'] : ['bad', '<b>Only one pivot.</b> The second row became all zeros on the left: the arm has lost a direction.'];
      } else if (lens === 2) {
        var T = [], acc = LA.identity(3), a = 0;
        for (var i = 0; i < 3; i++) { T.push(LA.hom2(st.q[i], i === 0 ? 0 : len[i - 1], 0)); }
        var link = LA.hom2(0, len[2], 0);
        var prod = LA.mul(LA.mul(LA.mul(T[0], T[1]), T[2]), link);
        text = '<p>Each joint is a matrix that turns by its angle and moves along the previous link. Multiply them in order, as in Lecture 3, and the product holds the hand\'s whole pose. Its <b>third column</b> is the hand\'s position; its first two columns are the hand\'s own axes.</p><p>Swap the order of two factors and the hand ends up somewhere else: <b>AB ≠ BA</b>.</p>';
        html = UI.eq({ cls: 'left' }, UI.mx(T[0], cap('T₁')), UI.mx(T[1], cap('T₂')), UI.mx(T[2], cap('T₃')), UI.mx(link, cap('hand')), '=',
          UI.mx(prod, { fmt: f2, cls: 'sm', cols: { 2: 'h3' }, cap: 'pose' }));
        var tip = st.pts[3];
        status = ['ok', '<b>Check:</b> the product puts the hand at (' + f2(prod[0][2]) + ', ' + f2(prod[1][2]) + '), the same point the drawing shows (' + f2(tip[0]) + ', ' + f2(tip[1]) + ').'];
      } else if (lens === 3) {
        var lu = LA.lu(st.JJt), Jp = null;
        if (lu.ok) {
          var c1 = LA.luSolve(lu, [1, 0]), c2 = LA.luSolve(lu, [0, 1]);
          Jp = LA.mul(LA.T(st.J), LA.fromCols([c1, c2]));
        }
        text = '<p>The controller needs joint speeds for a new wanted velocity every tick. It factors the small matrix <b>JJᵀ = LU</b> once, solves twice (for the unit velocities across and up), and so builds a 3 by 2 matrix <b>J⁺</b> that turns <i>any</i> velocity into joint speeds with one cheap multiplication. Lecture 4: factor once, reuse for every right-hand side.</p>';
        html = lu.ok ? UI.eq({ cls: 'left' }, UI.mx(st.JJt, cap('J Jᵀ')), '=', UI.mx(lu.L, cap('L')), UI.mx(lu.U, cap('U'))) +
          UI.eq({ cls: 'left' }, UI.mx(Jp, { fmt: f2, cls: 'sm', cap: 'J⁺ = Jᵀ(JJᵀ)⁻¹' }), UI.mx(vec, { cols: { 0: 'h3' }, fmt: f2, cls: 'sm', cap: 'v' }), '=',
            UI.mx(LA.mv(Jp, vec), { fmt: f2, cls: 'sm', rows: { 0: 'h1', 1: 'h2', 2: 'h4' }, cap: 'q̇' })) : UI.eq(UI.mx(st.JJt, cap('J Jᵀ')));
        status = lu.ok ? ['ok', '<b>Factored once, solved twice.</b> At 1000 ticks a second the same pattern scales to arms with many joints, where it saves real time.'] : ['bad', '<b>JJᵀ is singular here</b>: a zero pivot appears, because the arm is straight. The factorization fails exactly where the robot loses a direction.'];
      } else if (lens === 4) {
        var tau = LA.mv(LA.T(st.J), force);
        text = '<p>Push on the hand with a force <b>F</b> (drag the amber arrow). The torque each motor must supply is <b>τ = JᵀF</b>, the transpose from Lecture 5. Velocity used the <b>columns</b> of J; force uses the same numbers read as <b>rows</b>.</p><p>Joint <i>i</i>\'s torque is zero when the force line passes through that joint.</p>';
        html = UI.eq({ cls: 'left' }, UI.mx(LA.T(st.J), { fmt: f2, cls: 'sm', rows: { 0: 'h1', 1: 'h2', 2: 'h4' }, cap: 'Jᵀ' }), UI.mx(force, { cols: { 0: 'h3' }, fmt: f2, cls: 'sm', cap: 'F' }), '=',
          UI.mx(tau, { fmt: f2, cls: 'sm', rows: { 0: 'h1', 1: 'h2', 2: 'h4' }, cap: 'τ' }));
        var small = Math.max(Math.abs(tau[0]), Math.abs(tau[1]), Math.abs(tau[2])) < 0.08 * LA.norm(force) * 3.9;
        status = small ? ['hot', '<b>The structure carries the load.</b> This force runs along the arm, so the motors barely need to push.'] : ['ok', '<b>Torques (' + tau.map(f2).join(', ') + ').</b> The arcs at the joints show their size and direction.'];
      } else if (lens === 5) {
        text = '<p><b>Column space C(J)</b>: every hand velocity the arm can make right now (the shaded region at the hand). <b>Nullspace N(J)</b>: joint speeds that leave the hand still. Press <b>Self-motion</b> to drive the joints along N(J): the elbow swings, the hand stays put (Lecture 6).</p>';
        html = st.nullDir ? UI.eq({ cls: 'left' }, UI.mx(st.J, { fmt: f2, cls: 'sm', cols: { 0: 'h1', 1: 'h2', 2: 'h4' }, cap: 'J' }), UI.mx(st.nullDir, { fmt: f2, cls: 'sm', cap: 'n in N(J)' }), '=', UI.mx(LA.mv(st.J, st.nullDir), { fmt: f2, cls: 'sm', cap: 'hand still' })) : UI.eq(UI.mx(st.J, { fmt: f2, cls: 'sm', cap: 'J' }));
        status = st.rank === 2 ? ['ok', '<b>C(J) is the whole plane; N(J) is a line</b> of joint motions. Dimensions: 2 + 1 = 3 joints.'] : ['bad', '<b>C(J) has collapsed to a line</b> and N(J) has grown to a plane. Dimensions: 1 + 2 = 3 joints.'];
      } else {
        var R = st.rr.R, pc = st.rr.pivotCols, fc = st.rr.freeCols, basis = LA.nullspace(st.J, 1e-6).basis;
        text = '<p>Reduce J all the way to <b>R</b>, as in Lecture 7. Pivot columns (red) are joints whose speeds are forced; the free column (blue) is the spare joint. Setting the free speed to 1 gives the <b>special solution</b>, which is the self-motion of lens 06, written another way.</p><p><b>Rank</b> = number of pivots = directions the hand truly controls.</p>';
        var colsTint = {}; pc.forEach(function (c) { colsTint[c] = 'h1'; }); fc.forEach(function (c) { colsTint[c] = 'h2'; });
        html = UI.eq({ cls: 'left' }, UI.mx(R, { fmt: f2, cls: 'sm', cols: colsTint, pivots: pc.map(function (c, i) { return [i, c]; }), cap: 'R = rref(J)' }),
          basis.map(function (s, k) { return UI.mx(s, { fmt: f2, cls: 'sm', cap: 'special ' + (k + 1) }); }).join(''));
        status = st.rank === 2 ? ['ok', '<b>Rank 2, one free joint.</b> Three motors, two independent directions, one spare.'] : ['bad', '<b>Rank dropped to 1.</b> Two free joints and two special solutions: the straight arm has lost a direction.'];
      }
      textEl.innerHTML = text;
      mathEl.innerHTML = html;
      UI.status(statusEl, status[0], status[1]);
      out.rank(String(st.rank)); out.free(String(3 - st.rank)); out.hand(f2(st.pts[3][0]) + ', ' + f2(st.pts[3][1]));
      var keys = {
        0: '<span class="key k1">shoulder column</span><span class="key k2">elbow column</span><span class="key k4">wrist column</span><span class="key k3">wanted v</span>',
        1: '<span class="key k1">pivot joint</span><span class="key k2">free joint</span><span class="key k3">wanted v</span>',
        2: '<span class="key k1">x axis of each frame</span><span class="key k2">y axis of each frame</span>',
        3: '<span class="key k3">wanted v</span><span class="key k1">resulting joint speeds, as arcs</span>',
        4: '<span class="key k3">force F on the hand</span><span>arcs: joint torques</span>',
        5: '<span class="key k3">C(J) at the hand</span><span class="key kd">elbow path during self-motion</span>',
        6: '<span class="key k1">pivot joints</span><span class="key k2">free joint</span>'
      };
      slot(root, 'keys').innerHTML = keys[lens] + '<span><i data-ic="drag"></i> drag the amber handle</span>';
      hydrateIcons(slot(root, 'keys'));
    }

    function update() { compute(); panel(); plot.draw(); }

    /* ---- drawing ---- */
    function arcArrow(p, at, value, col, rPx) {
      /* an arc around a joint whose sweep shows a signed amount */
      var sweep = LA.clamp(value, -1.6, 1.6) * 1.9;
      if (Math.abs(sweep) < 0.03) return;
      var a0 = Math.PI / 2, a1 = a0 + sweep;
      p.arc(at, rPx, Math.min(a0, a1), Math.max(a0, a1), { color: col, width: 3 });
      var c = p.px(at), ex = c[0] + rPx * Math.cos(a1), ey = c[1] - rPx * Math.sin(a1);
      var dir = sweep > 0 ? 1 : -1, tx = -Math.sin(a1) * dir, ty = -Math.cos(a1) * dir;
      var ctx = p.ctx; ctx.save(); ctx.fillStyle = col; ctx.beginPath();
      ctx.moveTo(ex + tx * 8, ey + ty * 8); ctx.lineTo(ex - ty * 5, ey + tx * 5); ctx.lineTo(ex + ty * 5, ey - tx * 5); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    plot.onDraw(function (p) {
      if (!st.pts) return;
      p.grid({ labels: false, axes: false });
      p.circle([0, 0], len[0] + len[1] + len[2], { color: C.faint, width: 1, dash: [3, 6] });
      var tip = st.pts[3];
      if (handTrail.length > 1) Robots.drawTrail(p, handTrail, { color: C.s3, dash: [1, 5], width: 1.6 });
      if (elbowTrail.length > 1) Robots.drawTrail(p, elbowTrail, { color: C.chalk, dash: [2, 4], width: 1.4 });

      /* lens-specific underlays */
      if (lens === 5) {
        if (st.rank === 2) p.circle(tip, 0.95, { color: C.s3, width: 1, fill: 'rgba(245,192,78,.10)', dash: [4, 4] });
        else { var u = LA.vscale(st.cols[0], 1 / (LA.norm(st.cols[0]) || 1)); p.line(LA.vadd(tip, LA.vscale(u, -2)), LA.vadd(tip, LA.vscale(u, 2)), { color: C.s3, width: 6, alpha: .35 }); }
      }
      var jc = JC.slice();
      if (lens === 1 || lens === 6) jc = [0, 1, 2].map(function (c) { return st.rr.pivotCols.indexOf(c) >= 0 ? C.s1 : C.s2; });
      Robots.drawArm(p, st.pts, { jointColors: jc, labels: ['θ₁', 'θ₂', 'θ₃'] });

      if (lens === 0) {
        var k = 0.45;
        st.cols.forEach(function (c, j) { p.arrow(tip, LA.vadd(tip, LA.vscale(c, k)), { color: JC[j], width: 1.6, dash: [5, 4], head: 8 }); });
        if (st.qd) {
          var pos = tip;
          st.cols.forEach(function (c, j) { var nx = LA.vadd(pos, LA.vscale(c, st.qd[j])); p.arrow(pos, nx, { color: JC[j], width: 3 }); pos = nx; });
        }
      } else if (lens === 2) {
        var Tacc = LA.identity(3);
        for (var i = 0; i < 3; i++) { Tacc = LA.mul(Tacc, LA.hom2(st.q[i], i === 0 ? 0 : len[i - 1], 0)); Robots.drawFrame(p, Tacc, { len: 0.55 }); }
        Robots.drawFrame(p, LA.mul(Tacc, LA.hom2(0, len[2], 0)), { len: 0.75, label: 'hand' });
      } else if (lens === 3 && st.qd) {
        st.qd.forEach(function (w, j) { arcArrow(p, st.pts[j], w * 0.6, JC[j], 26); });
      } else if (lens === 4) {
        var tau = LA.mv(LA.T(st.J), force);
        tau.forEach(function (t, j) { arcArrow(p, st.pts[j], t / 2.5, JC[j], 26); });
        p.lineABC(-force[1], force[0], -force[1] * tip[0] + force[0] * tip[1], { color: C.s3, width: 1, dash: [2, 6], alpha: .6 });
      } else if (lens === 5 && st.nullDir) {
        /* where each joint would move under the self-motion, drawn small at the joints */
        var Jfull = st.nullDir;
        st.pts.slice(1, 3).forEach(function (pt, j) {
          var J2 = Robots.jacobian(len.slice(0, j + 1), st.q.slice(0, j + 1));
          var v2 = LA.mv(J2, Jfull.slice(0, j + 1));
          p.arrow(pt, LA.vadd(pt, LA.vscale(v2, 0.5)), { color: C.chalk, width: 2, head: 8 });
        });
      }
      if (lens !== 2 && lens !== 4) p.arrow(tip, LA.vadd(tip, vec), { color: C.s3, width: 2.2, dash: [6, 4] });
      if (lens === 4) p.arrow(tip, LA.vadd(tip, force), { color: C.s3, width: 2.6, label: 'F' });
    });
    plot.handle({
      hidden: function () { return lens === 2; },
      get: function () { var t = st.pts ? st.pts[3] : [0, 0]; return LA.vadd(t, lens === 4 ? force : vec); },
      set: function (x, y) {
        var d = LA.vsub([x, y], st.pts[3]), nrm = LA.norm(d);
        if (nrm > 2) d = LA.vscale(d, 2 / nrm);
        if (lens === 4) force = d; else vec = d;
        update();
      }, color: C.s3
    });

    /* ---- motion: trace a figure-eight, and/or move along the nullspace ---- */
    UI.loop(canvas, function (dt) {
      if (!following && !selfRate) return;
      var q = angles(), J = Robots.jacobian(len, q), tip = Robots.fk(len, q)[3], qd = [0, 0, 0];
      var JJt = LA.mul(J, LA.T(J)), lam2 = 0.0025;
      JJt[0][0] += lam2; JJt[1][1] += lam2;                     /* a little damping near straight poses */
      if (following) {
        tFollow += dt * 0.55;
        var c = [0.9, 1.6], r = [1.25, 0.75];
        var goal = [c[0] + r[0] * Math.sin(tFollow), c[1] + r[1] * Math.sin(2 * tFollow)];
        var gdot = [r[0] * 0.55 * Math.cos(tFollow), 2 * r[1] * 0.55 * Math.cos(2 * tFollow)];
        var want = LA.vadd(gdot, LA.vscale(LA.vsub(goal, tip), 4));
        vec = LA.vscale(gdot, 0.9);
        var y = LA.solve(JJt, want);
        if (y) qd = LA.mv(LA.T(J), y);
        Robots.pushTrail(handTrail, tip, 300, 0.03);
      }
      if (selfRate) {
        var n = cross3(J[0], J[1]), nn = LA.norm(n);
        if (nn > 0.15) {
          n = LA.vscale(n, selfRate / nn);
          qd = LA.vadd(qd, n);
          if (!following) {
            /* hold the hand on its spot: small correction through the same solve */
            var hold = st.hold || (st.hold = tip.slice());
            var yc = LA.solve(JJt, LA.vscale(LA.vsub(hold, tip), 5));
            if (yc) qd = LA.vadd(qd, LA.mv(LA.T(J), yc));
          }
        } else { selfRate = -selfRate; }
        Robots.pushTrail(elbowTrail, Robots.fk(len, q)[1], 400, 0.02);
      } else st.hold = null;
      var big = Math.max(Math.abs(qd[0]), Math.abs(qd[1]), Math.abs(qd[2])), k = big > 3 ? 3 / big : 1;
      var keepHold = st.hold;
      S.forEach(function (s, i) {
        var v = s.get() + deg(qd[i] * k * dt), lo = parseFloat(s.input.min), hi = parseFloat(s.input.max);
        if (v < lo || v > hi) { if (selfRate) selfRate = -selfRate; v = LA.clamp(v, lo, hi); }
        s.set(v);
      });
      update();
      if (keepHold) st.hold = keepHold;
    });
    update();
  });
})();
