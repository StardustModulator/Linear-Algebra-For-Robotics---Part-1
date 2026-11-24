/* ==========================================================================
   robots.js: the robots that appear in the labs, as kinematics plus drawing.
   Everything is planar and written from scratch so the linear algebra stays
   visible. Drawing functions take a Plot2D. Exposed as window.Robots.
   ========================================================================== */
(function () {
  'use strict';
  var R = {};
  var C = window.PlotColors;

  /* ------------------------------------------------------------------
     Planar serial arm. angles are RELATIVE joint angles (radians):
     link i points along angles[0] + ... + angles[i].
     ------------------------------------------------------------------ */
  /* joint positions: [base, joint 2, ..., tip] */
  R.fk = function (lengths, angles, base) {
    var p = base ? base.slice() : [0, 0], pts = [p.slice()], a = 0;
    for (var i = 0; i < lengths.length; i++) {
      a += angles[i];
      p = [p[0] + lengths[i] * Math.cos(a), p[1] + lengths[i] * Math.sin(a)];
      pts.push(p);
    }
    return pts;
  };
  /* Jacobian J (2 by n): column i is the tip velocity when only joint i turns at 1 rad/s.
     It is the vector from joint i to the tip, rotated a quarter turn.              */
  R.jacobian = function (lengths, angles, base) {
    var pts = R.fk(lengths, angles, base), tip = pts[pts.length - 1], n = lengths.length;
    var J = [new Array(n), new Array(n)];
    for (var i = 0; i < n; i++) {
      J[0][i] = -(tip[1] - pts[i][1]);
      J[1][i] = tip[0] - pts[i][0];
    }
    return J;
  };
  /* closed-form inverse kinematics of a two-link arm; clamps unreachable targets */
  R.ik2 = function (l1, l2, x, y, elbow) {
    var d = Math.sqrt(x * x + y * y), lo = Math.abs(l1 - l2) + 1e-4, hi = l1 + l2 - 1e-4;
    if (d < 1e-9) { x = lo; y = 0; d = lo; }
    if (d > hi) { x *= hi / d; y *= hi / d; d = hi; }
    if (d < lo) { x *= lo / d; y *= lo / d; d = lo; }
    var c2 = (d * d - l1 * l1 - l2 * l2) / (2 * l1 * l2);
    c2 = Math.max(-1, Math.min(1, c2));
    var t2 = (elbow === -1 ? -1 : 1) * Math.acos(c2);
    var t1 = Math.atan2(y, x) - Math.atan2(l2 * Math.sin(t2), l1 + l2 * Math.cos(t2));
    return [t1, t2];
  };
  /* draw the arm from its joint positions.
     o: { color, width, ghost, gripper, base, alpha, labels: ['θ₁', ...] }      */
  R.drawArm = function (plot, pts, o) {
    o = o || {};
    var ctx = plot.ctx, col = o.color || C.chalk, w = o.width || 11, i, p, q;
    ctx.save();
    ctx.globalAlpha = o.alpha === undefined ? (o.ghost ? .28 : 1) : o.alpha;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([]);
    if (o.base !== false) {
      p = plot.px(pts[0]);
      ctx.fillStyle = C.faint; ctx.beginPath();
      ctx.moveTo(p[0] - 16, p[1] + 20); ctx.lineTo(p[0] - 9, p[1] + 2); ctx.lineTo(p[0] + 9, p[1] + 2); ctx.lineTo(p[0] + 16, p[1] + 20); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p[0] - 26, p[1] + 20.5); ctx.lineTo(p[0] + 26, p[1] + 20.5); ctx.stroke();
    }
    /* links: hollow capsules */
    for (i = 0; i < pts.length - 1; i++) {
      p = plot.px(pts[i]); q = plot.px(pts[i + 1]);
      ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      ctx.strokeStyle = C.board; ctx.lineWidth = w - 4; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
    }
    /* gripper */
    if (o.gripper !== false && pts.length > 1) {
      var a = pts[pts.length - 2], b = pts[pts.length - 1];
      p = plot.px(a); q = plot.px(b);
      var dx = q[0] - p[0], dy = q[1] - p[1], L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L;
      ctx.strokeStyle = col; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(q[0] + ux * 12 - uy * 5, q[1] + uy * 12 + ux * 5); ctx.lineTo(q[0] + ux * 3 - uy * 8, q[1] + uy * 3 + ux * 8); ctx.lineTo(q[0] + ux * 3 + uy * 8, q[1] + uy * 3 - ux * 8); ctx.lineTo(q[0] + ux * 12 + uy * 5, q[1] + uy * 12 - ux * 5);
      ctx.stroke();
    }
    /* joints */
    for (i = 0; i < pts.length - 1; i++) {
      p = plot.px(pts[i]);
      ctx.beginPath(); ctx.arc(p[0], p[1], w * .68, 0, Math.PI * 2); ctx.fillStyle = C.board; ctx.fill();
      ctx.strokeStyle = (o.jointColors && o.jointColors[i]) || col; ctx.lineWidth = 2.2; ctx.stroke();
      ctx.beginPath(); ctx.arc(p[0], p[1], 2.2, 0, Math.PI * 2); ctx.fillStyle = (o.jointColors && o.jointColors[i]) || col; ctx.fill();
    }
    ctx.restore();
    if (o.labels) {
      for (i = 0; i < pts.length - 1 && i < o.labels.length; i++) {
        plot.text(o.labels[i], pts[i], { color: (o.jointColors && o.jointColors[i]) || C.dim, dx: -13, dy: -13, align: 'right', math: true });
      }
    }
  };

  /* ------------------------------------------------------------------
     Rigid body pose helpers. pose = { x, y, th }
     ------------------------------------------------------------------ */
  R.toWorld = function (pose, p) {
    var c = Math.cos(pose.th), s = Math.sin(pose.th);
    return [pose.x + c * p[0] - s * p[1], pose.y + s * p[0] + c * p[1]];
  };
  R.rotate = function (th, v) { var c = Math.cos(th), s = Math.sin(th); return [c * v[0] - s * v[1], s * v[0] + c * v[1]]; };
  /* move a pose by a body-frame twist (vx, vy, w) for dt seconds */
  R.step = function (pose, twist, dt) {
    var v = R.rotate(pose.th, [twist[0], twist[1]]);
    return { x: pose.x + v[0] * dt, y: pose.y + v[1] * dt, th: pose.th + twist[2] * dt };
  };
  function bodyPath(plot, pose, pts) {
    var ctx = plot.ctx, p = plot.px(R.toWorld(pose, pts[0]));
    ctx.beginPath(); ctx.moveTo(p[0], p[1]);
    for (var i = 1; i < pts.length; i++) { p = plot.px(R.toWorld(pose, pts[i])); ctx.lineTo(p[0], p[1]); }
    ctx.closePath();
  }

  /* ------------------------------------------------------------------
     Omni-wheel robot: wheel i sits at angle alphas[i] on a circle of radius Rb
     and rolls along the tangent. Its rim speed for a body twist (vx, vy, w):
          s_i = -sin(a_i) vx + cos(a_i) vy + Rb w
     ------------------------------------------------------------------ */
  R.OMNI3 = [Math.PI / 2, Math.PI * 7 / 6, Math.PI * 11 / 6];
  R.omniMatrix = function (alphas, Rb) {
    return alphas.map(function (a) { return [-Math.sin(a), Math.cos(a), Rb]; });
  };
  /* o: { Rb, alphas, speeds, colors, scale, alpha, wheelDirs } */
  R.drawOmni = function (plot, pose, o) {
    o = o || {};
    var ctx = plot.ctx, Rb = o.Rb || 1, alphas = o.alphas || R.OMNI3, c = plot.px([pose.x, pose.y]);
    ctx.save(); ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha; ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(c[0], c[1], Rb * plot.s, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244,242,238,.07)'; ctx.fill(); ctx.strokeStyle = C.chalk; ctx.lineWidth = 2; ctx.stroke();
    /* heading mark */
    var hd = plot.px(R.toWorld(pose, [Rb * .62, 0]));
    ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(hd[0], hd[1]); ctx.stroke();
    ctx.beginPath(); ctx.arc(c[0], c[1], 3, 0, Math.PI * 2); ctx.fillStyle = C.chalk; ctx.fill();
    ctx.restore();
    alphas.forEach(function (a, i) {
      var dir = o.wheelDirs ? o.wheelDirs[i] : [-Math.sin(a), Math.cos(a)];
      var pos = [Rb * Math.cos(a), Rb * Math.sin(a)], half = Rb * .3;
      var col = (o.colors && o.colors[i]) || C.chalk;
      var p1 = plot.px(R.toWorld(pose, [pos[0] - dir[0] * half, pos[1] - dir[1] * half]));
      var p2 = plot.px(R.toWorld(pose, [pos[0] + dir[0] * half, pos[1] + dir[1] * half]));
      ctx.save(); ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
      ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
      ctx.restore();
      if (o.speeds) {
        var k = o.scale || .6, out = [pos[0] * 1.32, pos[1] * 1.32];
        var a0 = R.toWorld(pose, out), a1 = R.toWorld(pose, [out[0] + dir[0] * o.speeds[i] * k, out[1] + dir[1] * o.speeds[i] * k]);
        plot.arrow(a0, a1, { color: col, width: 2.4, head: 9 });
      }
    });
  };

  /* differential-drive rover, drawn nose along +x of its pose. o: { L, W, color } */
  R.drawRover = function (plot, pose, o) {
    o = o || {};
    var ctx = plot.ctx, L = o.L || 1.2, W = o.W || .9, col = o.color || C.chalk;
    ctx.save(); ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha; ctx.setLineDash([]); ctx.lineJoin = 'round';
    bodyPath(plot, pose, [[-L / 2, -W / 2], [L / 2 - .18, -W / 2], [L / 2, -W / 4], [L / 2, W / 4], [L / 2 - .18, W / 2], [-L / 2, W / 2]]);
    ctx.fillStyle = 'rgba(244,242,238,.07)'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
    ctx.lineCap = 'round'; ctx.lineWidth = 7;
    [[-1, 1], [1, 1]].forEach(function (sg) {
      var y = sg[0] * (W / 2 + .1), a = plot.px(R.toWorld(pose, [-L * .28, y])), b = plot.px(R.toWorld(pose, [L * .28, y]));
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    });
    var c = plot.px([pose.x, pose.y]);
    ctx.beginPath(); ctx.arc(c[0], c[1], 3, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    ctx.restore();
  };

  /* ------------------------------------------------------------------
     Thruster vehicle. thruster = { x, y, ang }: mounted at (x, y) in the body
     frame, pushing the hull along the unit direction (cos ang, sin ang).
     One newton from thruster i contributes the column
          [ cos ang,  sin ang,  x sin ang - y cos ang ]   = [Fx, Fy, torque]
     ------------------------------------------------------------------ */
  R.thrusterMatrix = function (thr) {
    var B = [[], [], []];
    thr.forEach(function (t) {
      var c = Math.cos(t.ang), s = Math.sin(t.ang);
      B[0].push(c); B[1].push(s); B[2].push(t.x * s - t.y * c);
    });
    return B;
  };
  /* o: { hull: [[x, y], ...], forces, colors, scale, alpha } */
  R.drawVehicle = function (plot, pose, thr, o) {
    o = o || {};
    var ctx = plot.ctx, hull = o.hull || [[-1.3, -.7], [.9, -.7], [1.4, 0], [.9, .7], [-1.3, .7]];
    ctx.save(); ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha; ctx.setLineDash([]); ctx.lineJoin = 'round';
    bodyPath(plot, pose, hull);
    ctx.fillStyle = 'rgba(244,242,238,.07)'; ctx.fill(); ctx.strokeStyle = C.chalk; ctx.lineWidth = 2; ctx.stroke();
    var c = plot.px([pose.x, pose.y]);
    ctx.beginPath(); ctx.arc(c[0], c[1], 3.2, 0, Math.PI * 2); ctx.fillStyle = C.chalk; ctx.fill();
    ctx.beginPath(); ctx.arc(c[0], c[1], 7, 0, Math.PI * 2); ctx.strokeStyle = C.faint; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
    thr.forEach(function (t, i) {
      var d = [Math.cos(t.ang), Math.sin(t.ang)], col = (o.colors && o.colors[i]) || C.chalk;
      /* nozzle: a short bar behind the mount point */
      var a = plot.px(R.toWorld(pose, [t.x - d[0] * .34, t.y - d[1] * .34])), b = plot.px(R.toWorld(pose, [t.x, t.y]));
      ctx.save(); ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha; ctx.lineCap = 'butt'; ctx.strokeStyle = col; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
      if (o.forces) {
        var f = o.forces[i], k = o.scale || .7;
        if (Math.abs(f) > 1e-3) {
          plot.arrow(R.toWorld(pose, [t.x, t.y]), R.toWorld(pose, [t.x + d[0] * f * k, t.y + d[1] * f * k]), { color: col, width: 2.6, head: 10 });
          /* exhaust plume on the other side */
          var n = 3, sgn = f > 0 ? -1 : 1;
          for (var j = 0; j < n; j++) {
            var off = (j - 1) * .1, len = Math.min(.9, Math.abs(f) * k * .6) * (j === 1 ? 1 : .6);
            var px0 = [t.x + sgn * d[0] * .38 - d[1] * off, t.y + sgn * d[1] * .38 + d[0] * off];
            var px1 = [px0[0] + sgn * d[0] * len, px0[1] + sgn * d[1] * len];
            plot.line(R.toWorld(pose, px0), R.toWorld(pose, px1), { color: col, width: 1.3, alpha: .45, dash: [2, 4] });
          }
        }
      }
    });
  };

  /* a landmark tower with signal rings */
  R.drawBeacon = function (plot, p, o) {
    o = o || {};
    var ctx = plot.ctx, q = plot.px(p), col = o.color || C.chalk;
    ctx.save(); ctx.setLineDash([]); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(q[0] - 7, q[1] + 15); ctx.lineTo(q[0], q[1]); ctx.lineTo(q[0] + 7, q[1] + 15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(q[0] - 4.5, q[1] + 9.5); ctx.lineTo(q[0] + 4.5, q[1] + 9.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(q[0], q[1], 4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .55;
    ctx.beginPath(); ctx.arc(q[0], q[1], 10, -Math.PI * .8, -Math.PI * .2); ctx.stroke();
    ctx.beginPath(); ctx.arc(q[0], q[1], 16, -Math.PI * .8, -Math.PI * .2); ctx.stroke();
    ctx.restore();
    if (o.label) plot.text(o.label, p, { color: col, dx: 0, dy: 28, align: 'center' });
  };

  /* coordinate frame from a 3 by 3 homogeneous transform T. o: { len, label, colors } */
  R.drawFrame = function (plot, T, o) {
    o = o || {};
    var len = o.len || 1, org = [T[0][2], T[1][2]];
    var cx = (o.colors && o.colors[0]) || C.s1, cy = (o.colors && o.colors[1]) || C.s2;
    plot.arrow(org, [org[0] + T[0][0] * len, org[1] + T[1][0] * len], { color: cx, width: 2.4, head: 9, alpha: o.alpha });
    plot.arrow(org, [org[0] + T[0][1] * len, org[1] + T[1][1] * len], { color: cy, width: 2.4, head: 9, alpha: o.alpha });
    plot.point(org, { r: 3.5, color: o.color || C.chalk, alpha: o.alpha });
    if (o.label) plot.text(o.label, org, { color: o.color || C.chalk, dx: -10, dy: 14, align: 'right' });
  };

  /* a fading trail of past positions. trail = [[x, y], ...] */
  R.drawTrail = function (plot, trail, o) {
    o = o || {};
    if (trail.length < 2) return;
    plot.path(trail, { color: o.color || C.faint, width: o.width || 1.5, dash: o.dash || [3, 5] });
  };
  R.pushTrail = function (trail, p, max, minDist) {
    var last = trail[trail.length - 1];
    if (!last || Math.abs(last[0] - p[0]) + Math.abs(last[1] - p[1]) > (minDist || .03)) {
      trail.push([p[0], p[1]]);
      if (trail.length > (max || 400)) trail.shift();
    }
  };

  window.Robots = R;
})();
