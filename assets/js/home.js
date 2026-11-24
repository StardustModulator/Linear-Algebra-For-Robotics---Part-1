/* ==========================================================================
   home.js: the landing page. A live two-link arm in the hero, the lecture
   list, the notes list and the icon wall.
   ========================================================================== */
(function () {
  'use strict';
  var C = window.PlotColors;

  function progressBadge(n) {
    var p = UI.progress && UI.progress.summary(n);
    if (!p) return '<span class="prog"></span>';
    var full = p.done === p.total;
    return '<span class="prog' + (full ? ' full' : '') + '" title="Sections marked as understood in this browser">' + (full ? icon('check') : '') + p.done + '/' + p.total + '</span>';
  }

  /* ---------- lecture list ---------- */
  UI.ready(function () {
    var list = document.getElementById('lec-list');
    if (list) {
      list.innerHTML = UI.LECTURES.map(function (L) {
        return '<a class="lec-row" href="' + L.file + '">' +
          '<span class="n">' + UI.pad(L.n) + '</span>' +
          '<span><h3>' + L.title + '</h3><div class="ideas">' + L.ideas + '</div></span>' +
          '<span class="robot">' + icon(L.robotIcon) + '<span><b>' + L.robot + '</b><span>' + L.robotNote + '</span></span></span>' +
          progressBadge(L.n) + icon('arrow-right', 'go') + '</a>';
      }).join('');
    }
    var notes = document.getElementById('notes-list');
    if (notes) {
      notes.innerHTML = '<div class="label">In-depth notes, one per lecture</div><div class="notes-grid">' + UI.LECTURES.map(function (L) {
        return '<a href="kit/notes-' + UI.pad(L.n) + '.html"><span class="n">' + UI.pad(L.n) + '</span><span>' + L.title + '</span>' + icon('arrow-right') + '</a>';
      }).join('') + '</div>';
    }
    var wall = document.getElementById('iconwall');
    if (wall) {
      wall.innerHTML = Object.keys(ICONS).map(function (k) { return '<div>' + icon(k) + '<span>' + k + '</span></div>'; }).join('');
    }
  });

  /* ---------- hero: the matrix is the robot ---------- */
  UI.ready(function () {
    var root = document.getElementById('hero-lab');
    if (!root) return;
    var canvas = root.querySelector('canvas'), eq = root.querySelector('[data-slot="eq"]');
    var len = [2.0, 1.6], target = [1.7, 2.0], auto = !UI.reducedMotion(), t = 0.9, trail = [];
    var plot = new Plot2D(canvas, { cx: 0.5, cy: 1.2, w: 8.4, h: 6.6 });
    var st = {};

    function update() {
      var q = Robots.ik2(len[0], len[1], target[0], target[1], -1);
      var pts = Robots.fk(len, q), J = Robots.jacobian(len, q);
      st = { pts: pts, J: J };
      var f = function (v) { return LA.fix(v, 2); };
      eq.innerHTML = UI.eq(
        '<span class="m">J</span>', '=',
        UI.mx(J, { cols: { 0: 'h1', 1: 'h2' }, fmt: f, cap: 'one column per joint' }),
        '<span class="m">hand</span>', '=',
        UI.mx(pts[2], { cols: { 0: 'h3' }, fmt: f, cap: 'position' }));
      plot.draw();
    }
    plot.handle({
      get: function () { return target; },
      set: function (x, y) { auto = false; target = [x, y]; update(); },
      color: C.s3
    });
    plot.onDraw(function (p) {
      p.grid({ labels: false, axes: false });
      p.circle([0, 0], len[0] + len[1], { color: C.faint, width: 1, dash: [3, 6] });
      if (!st.pts) return;
      Robots.drawTrail(p, trail, { color: C.s3, dash: [1, 5], width: 1.6 });
      Robots.drawArm(p, st.pts, { jointColors: [C.s1, C.s2] });
      var tip = st.pts[2], k = 0.42;
      p.arrow(tip, LA.vadd(tip, LA.vscale(LA.col(st.J, 0), k)), { color: C.s1, width: 2.6 });
      p.arrow(tip, LA.vadd(tip, LA.vscale(LA.col(st.J, 1), k)), { color: C.s2, width: 2.6 });
    });
    UI.loop(canvas, function (dt) {
      if (!auto) return;
      t += dt * 0.55;
      target = [1.15 + 1.75 * Math.sin(t), 1.75 + 1.05 * Math.sin(2 * t)];
      Robots.pushTrail(trail, target, 260, 0.04);
      update();
    });
    /* draw one complete frame at rest, with part of the path already traced */
    for (var i = 0; i < 90; i++) { var tt = t - (90 - i) * 0.03; trail.push([1.15 + 1.75 * Math.sin(tt), 1.75 + 1.05 * Math.sin(2 * tt)]); }
    target = [1.15 + 1.75 * Math.sin(t), 1.75 + 1.05 * Math.sin(2 * t)];
    update();
  });
})();
