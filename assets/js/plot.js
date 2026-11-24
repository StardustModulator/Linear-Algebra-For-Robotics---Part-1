/* ==========================================================================
   plot.js: two small canvas helpers, written from scratch.
     Plot2D  a world-coordinate drawing surface with draggable handles
     Plot3D  an orbitable 3-D sketch (orthographic) for vectors and planes
   Both redraw crisply on any screen and keep the page scrollable on phones.
   ========================================================================== */
(function () {
  'use strict';

  /* chalkboard palette, read from the CSS tokens so there is one source of truth */
  var css = getComputedStyle(document.documentElement);
  function tok(name, fallback) { var v = css.getPropertyValue(name).trim(); return v || fallback; }
  var C = {
    chalk: tok('--chalk', '#f4f2ee'), dim: tok('--chalk-2', '#b3b1ad'), faint: tok('--chalk-3', '#74757a'),
    s1: tok('--s1', '#ff5a70'), s2: tok('--s2', '#62b6f0'), s3: tok('--s3', '#f5c04e'), s4: tok('--s4', '#6fd39a'),
    accent: '#c9283f', board: '#0d0e10',
    grid: 'rgba(255,255,255,.055)', grid2: 'rgba(255,255,255,.11)', axis: 'rgba(255,255,255,.42)'
  };
  var FONT = '500 12px "IBM Plex Mono", ui-monospace, Menlo, monospace';
  var FONT_MATH = 'italic 600 16px "STIX Two Text", "Times New Roman", serif';
  function rgba(hex, a) {
    if (hex.charAt(0) !== '#') return hex;
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  function sizeCanvas(p) {
    var cv = p.canvas, dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    var W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return false;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    }
    p.W = W; p.H = H; p.dpr = dpr;
    p.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }
  function watch(p) {
    if ('ResizeObserver' in window) new ResizeObserver(function () { p.draw(); }).observe(p.canvas);
    else window.addEventListener('resize', function () { p.draw(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { p.draw(); });
  }
  function localXY(cv, e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }

  /* ======================================================================
     Plot2D(canvas, { cx, cy, w, h })
       cx, cy  world point at the centre of the canvas
       w       world width that must stay visible   (h: optional world height)
     Units are equal on both axes, y points up.
     ====================================================================== */
  function Plot2D(canvas, o) {
    o = o || {};
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.view = { cx: o.cx || 0, cy: o.cy || 0, w: o.w || 10, h: o.h || 0 };
    this.handles = []; this.active = null; this.drawFn = null; this.s = 40;
    this.C = C;
    var self = this;

    canvas.addEventListener('pointerdown', function (e) {
      var h = self.hit(localXY(canvas, e), e.pointerType === 'touch' ? 30 : 18);
      if (!h) return;
      self.active = h;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
      self.dragTo(e); e.preventDefault();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (self.active) { self.dragTo(e); e.preventDefault(); return; }
      canvas.style.cursor = self.hit(localXY(canvas, e), 18) ? 'grab' : '';
    });
    function end() { if (self.active) { self.active = null; self.draw(); } }
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    /* a touch that starts on a handle must not scroll the page */
    canvas.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1 && self.hit(localXY(canvas, e.touches[0]), 30)) e.preventDefault();
    }, { passive: false });
    watch(this);
  }
  Plot2D.prototype.onDraw = function (fn) { this.drawFn = fn; this.draw(); return this; };
  Plot2D.prototype.draw = function () {
    if (!sizeCanvas(this)) return;
    var v = this.view;
    this.s = v.h ? Math.min(this.W / v.w, this.H / v.h) : this.W / v.w;
    this.ctx.clearRect(0, 0, this.W, this.H);
    if (this.drawFn) this.drawFn(this);
    this.drawHandles();
  };
  Plot2D.prototype.px = function (p) { return [this.W / 2 + (p[0] - this.view.cx) * this.s, this.H / 2 - (p[1] - this.view.cy) * this.s]; };
  Plot2D.prototype.world = function (q) { return [this.view.cx + (q[0] - this.W / 2) / this.s, this.view.cy - (q[1] - this.H / 2) / this.s]; };
  Plot2D.prototype.bounds = function () {
    var a = this.world([0, this.H]), b = this.world([this.W, 0]);
    return { x0: a[0], y0: a[1], x1: b[0], y1: b[1] };
  };
  function stroke(ctx, st) {
    ctx.strokeStyle = st.color || C.chalk; ctx.lineWidth = st.width || 2;
    ctx.setLineDash(st.dash || []); ctx.lineCap = st.cap || 'round'; ctx.lineJoin = 'round';
    ctx.globalAlpha = st.alpha === undefined ? 1 : st.alpha;
  }
  /* light grid with axes; o.step grid spacing, o.labels false to hide numbers */
  Plot2D.prototype.grid = function (o) {
    o = o || {};
    var ctx = this.ctx, b = this.bounds(), step = o.step || 1, i, p;
    ctx.save(); ctx.lineWidth = 1; ctx.setLineDash([]);
    for (i = Math.ceil(b.x0 / step); i * step <= b.x1; i++) {
      p = this.px([i * step, 0]);
      ctx.strokeStyle = i === 0 ? C.axis : (i % (o.major || 5) === 0 ? C.grid2 : C.grid);
      if (i === 0 && o.axes === false) ctx.strokeStyle = C.grid2;
      ctx.beginPath(); ctx.moveTo(Math.round(p[0]) + .5, 0); ctx.lineTo(Math.round(p[0]) + .5, this.H); ctx.stroke();
    }
    for (i = Math.ceil(b.y0 / step); i * step <= b.y1; i++) {
      p = this.px([0, i * step]);
      ctx.strokeStyle = i === 0 ? C.axis : (i % (o.major || 5) === 0 ? C.grid2 : C.grid);
      if (i === 0 && o.axes === false) ctx.strokeStyle = C.grid2;
      ctx.beginPath(); ctx.moveTo(0, Math.round(p[1]) + .5); ctx.lineTo(this.W, Math.round(p[1]) + .5); ctx.stroke();
    }
    if (o.labels !== false && o.axes !== false) {
      var ls = o.labelStep || step * (this.s * step < 26 ? 2 : 1);
      ctx.font = '400 10.5px "IBM Plex Mono", monospace'; ctx.fillStyle = C.faint;
      var org = this.px([0, 0]);
      var ox = Math.max(4, Math.min(this.W - 16, org[0] + 5)), oy = Math.max(12, Math.min(this.H - 5, org[1] + 13));
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      for (i = Math.ceil(b.x0 / ls); i * ls <= b.x1; i++) { if (i === 0) continue; p = this.px([i * ls, 0]); ctx.fillText(String(+(i * ls).toFixed(6)).replace('-', '−'), p[0], oy); }
      ctx.textAlign = 'left';
      for (i = Math.ceil(b.y0 / ls); i * ls <= b.y1; i++) { if (i === 0) continue; p = this.px([0, i * ls]); ctx.fillText(String(+(i * ls).toFixed(6)).replace('-', '−'), ox, p[1] + 3.5); }
      if (o.xlabel) { ctx.font = FONT_MATH; ctx.fillStyle = C.dim; ctx.textAlign = 'right'; ctx.fillText(o.xlabel, this.W - 8, Math.max(16, Math.min(this.H - 8, org[1] - 8))); }
      if (o.ylabel) { ctx.font = FONT_MATH; ctx.fillStyle = C.dim; ctx.textAlign = 'left'; ctx.fillText(o.ylabel, Math.max(8, Math.min(this.W - 30, org[0] + 9)), 18); }
    }
    ctx.restore();
  };
  Plot2D.prototype.line = function (a, b, st) {
    st = st || {}; var ctx = this.ctx, p = this.px(a), q = this.px(b);
    ctx.save(); stroke(ctx, st); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); ctx.restore();
  };
  Plot2D.prototype.path = function (pts, st) {
    st = st || {}; if (pts.length < 2) return;
    var ctx = this.ctx, p = this.px(pts[0]);
    ctx.save(); stroke(ctx, st); ctx.beginPath(); ctx.moveTo(p[0], p[1]);
    for (var i = 1; i < pts.length; i++) { p = this.px(pts[i]); ctx.lineTo(p[0], p[1]); }
    if (st.close) ctx.closePath();
    if (st.fill) { ctx.fillStyle = st.fill; ctx.fill(); }
    if (st.color !== 'none') ctx.stroke();
    ctx.restore();
  };
  /* the whole line a x + b y = c, clipped to the view */
  Plot2D.prototype.lineABC = function (a, b, c, st) {
    var B = this.bounds(), L = Math.max(B.x1 - B.x0, B.y1 - B.y0) * 2, n = Math.sqrt(a * a + b * b);
    if (n < 1e-12) return;
    var x0 = a * c / (n * n), y0 = b * c / (n * n), dx = -b / n, dy = a / n;
    var mx = (B.x0 + B.x1) / 2, my = (B.y0 + B.y1) / 2, t = (mx - x0) * dx + (my - y0) * dy;
    x0 += t * dx; y0 += t * dy;
    this.line([x0 - L * dx, y0 - L * dy], [x0 + L * dx, y0 + L * dy], st);
  };
  /* arrow from a to b (world). st.head size in px, st.label text near the tip */
  Plot2D.prototype.arrow = function (a, b, st) {
    st = st || {};
    var ctx = this.ctx, p = this.px(a), q = this.px(b), dx = q[0] - p[0], dy = q[1] - p[1], len = Math.sqrt(dx * dx + dy * dy);
    ctx.save(); stroke(ctx, st);
    if (len < 1.5) { ctx.fillStyle = st.color || C.chalk; ctx.beginPath(); ctx.arc(p[0], p[1], 2.5, 0, 7); ctx.fill(); ctx.restore(); return; }
    var ux = dx / len, uy = dy / len, h = Math.min(st.head || 11, len * .6), w = h * .5;
    ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0] - ux * h * .8, q[1] - uy * h * .8); ctx.stroke();
    ctx.setLineDash([]); ctx.fillStyle = st.color || C.chalk;
    ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] - ux * h - uy * w, q[1] - uy * h + ux * w); ctx.lineTo(q[0] - ux * h + uy * w, q[1] - uy * h - ux * w); ctx.closePath(); ctx.fill();
    ctx.restore();
    if (st.label) this.text(st.label, b, { color: st.color, dx: ux * 14 - (ux < -.3 ? 6 : 0), dy: uy * 14, align: ux < -.3 ? 'right' : (ux > .3 ? 'left' : 'center'), math: st.math !== false });
  };
  Plot2D.prototype.point = function (a, st) {
    st = st || {}; var ctx = this.ctx, p = this.px(a), r = st.r || 4.5;
    ctx.save(); ctx.globalAlpha = st.alpha === undefined ? 1 : st.alpha; ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
    if (st.fill !== 'none') { ctx.fillStyle = st.fill || st.color || C.chalk; ctx.fill(); }
    if (st.ring) { ctx.strokeStyle = st.ring; ctx.lineWidth = st.width || 2; ctx.stroke(); }
    ctx.restore();
    if (st.label) this.text(st.label, a, { color: st.labelColor || st.color, dx: st.dx === undefined ? 9 : st.dx, dy: st.dy === undefined ? -9 : st.dy, math: st.math });
  };
  /* circle with a radius in world units */
  Plot2D.prototype.circle = function (a, rWorld, st) {
    st = st || {}; var ctx = this.ctx, p = this.px(a);
    ctx.save(); stroke(ctx, st); ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(0, rWorld * this.s), 0, Math.PI * 2);
    if (st.fill) { ctx.fillStyle = st.fill; ctx.fill(); }
    if (st.color !== 'none') ctx.stroke(); ctx.restore();
  };
  /* arc from angle a0 to a1 (radians, counter-clockwise, world sense), radius in px */
  Plot2D.prototype.arc = function (a, rPx, a0, a1, st) {
    st = st || {}; var ctx = this.ctx, p = this.px(a);
    ctx.save(); stroke(ctx, st); ctx.beginPath(); ctx.arc(p[0], p[1], rPx, -a0, -a1, a1 > a0); ctx.stroke(); ctx.restore();
  };
  Plot2D.prototype.text = function (str, a, st) {
    st = st || {}; var ctx = this.ctx, p = this.px(a);
    ctx.save();
    ctx.font = st.font || (st.math ? FONT_MATH : FONT);
    ctx.textAlign = st.align || 'left'; ctx.textBaseline = st.baseline || 'middle';
    var x = p[0] + (st.dx || 0), y = p[1] + (st.dy || 0);
    if (st.bg !== false) {
      var m = ctx.measureText(str), wd = m.width, x0 = ctx.textAlign === 'center' ? x - wd / 2 : (ctx.textAlign === 'right' ? x - wd : x);
      ctx.fillStyle = st.bg || 'rgba(13,14,16,.72)'; ctx.fillRect(x0 - 3, y - 9, wd + 6, 18);
    }
    ctx.fillStyle = st.color || C.chalk; ctx.fillText(str, x, y);
    ctx.restore();
  };
  /* text pinned to the canvas in pixels (for corner captions) */
  Plot2D.prototype.note = function (str, x, y, st) {
    st = st || {}; var ctx = this.ctx;
    ctx.save(); ctx.font = st.font || FONT; ctx.fillStyle = st.color || C.dim; ctx.textAlign = st.align || 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(str, x < 0 ? this.W + x : x, y < 0 ? this.H + y : y); ctx.restore();
  };

  /* ----- draggable handles -----
     plot.handle({ get: function () { return [x, y]; }, set: function (x, y) {}, color, label })  */
  Plot2D.prototype.handle = function (h) { this.handles.push(h); return h; };
  Plot2D.prototype.hit = function (q, radius) {
    var best = null, bd = radius;
    for (var i = 0; i < this.handles.length; i++) {
      var h = this.handles[i];
      if (h.hidden && h.hidden()) continue;
      var p = this.px(h.get()), d = Math.sqrt((p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]));
      if (d <= bd) { bd = d; best = h; }
    }
    return best;
  };
  Plot2D.prototype.dragTo = function (e) {
    var q = localXY(this.canvas, e);
    q[0] = Math.max(4, Math.min(this.W - 4, q[0])); q[1] = Math.max(4, Math.min(this.H - 4, q[1]));
    var w = this.world(q);
    this.active.set(w[0], w[1]);
    this.canvas.style.cursor = 'grabbing';
    this.draw();
  };
  Plot2D.prototype.drawHandles = function () {
    var ctx = this.ctx;
    for (var i = 0; i < this.handles.length; i++) {
      var h = this.handles[i];
      if (h.hidden && h.hidden()) continue;
      var p = this.px(h.get()), col = h.color || C.chalk, on = this.active === h;
      ctx.save(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(p[0], p[1], on ? 15 : 12, 0, Math.PI * 2); ctx.fillStyle = rgba(col, on ? .3 : .16); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(p[0], p[1], 4, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
      ctx.restore();
      if (h.label) this.text(typeof h.label === 'function' ? h.label() : h.label, h.get(), { color: col, dx: 16, dy: -14, math: h.math });
    }
  };

  /* ======================================================================
     Plot3D(canvas, { span, yaw, pitch })
       span  world size that fits across the smaller side
     World z points up. Drag to orbit (sideways drag on touch screens).
     Queue shapes between begin() and end(); they are painted back to front.
     ====================================================================== */
  function Plot3D(canvas, o) {
    o = o || {};
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.span = o.span || 8; this.yaw = o.yaw === undefined ? -0.9 : o.yaw; this.pitch = o.pitch === undefined ? 0.42 : o.pitch;
    this.q = []; this.drawFn = null; this.C = C; this.dragging = false;
    var self = this, last = null;
    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', function (e) {
      last = [e.clientX, e.clientY]; self.dragging = true; self.touched = true;
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      canvas.style.cursor = 'grabbing';
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!self.dragging) return;
      self.yaw -= (e.clientX - last[0]) * 0.009;
      if (e.pointerType !== 'touch') self.pitch = Math.max(-1.45, Math.min(1.45, self.pitch + (e.clientY - last[1]) * 0.007));
      last = [e.clientX, e.clientY]; self.draw();
    });
    function end() { self.dragging = false; canvas.style.cursor = 'grab'; }
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    watch(this);
  }
  Plot3D.prototype.onDraw = function (fn) { this.drawFn = fn; this.draw(); return this; };
  Plot3D.prototype.draw = function () {
    if (!sizeCanvas(this)) return;
    this.s = Math.min(this.W, this.H) / this.span;
    var cy = Math.cos(this.yaw), sy = Math.sin(this.yaw), cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    this.R = [-sy, cy, 0]; this.U = [-sp * cy, -sp * sy, cp]; this.F = [cp * cy, cp * sy, sp];
    this.ctx.clearRect(0, 0, this.W, this.H);
    this.q = [];
    if (this.drawFn) this.drawFn(this);
    this.end();
  };
  Plot3D.prototype.proj = function (p) {
    var R = this.R, U = this.U, F = this.F;
    return [this.W / 2 + (p[0] * R[0] + p[1] * R[1] + p[2] * R[2]) * this.s, this.H / 2 - (p[0] * U[0] + p[1] * U[1] + p[2] * U[2]) * this.s, p[0] * F[0] + p[1] * F[1] + p[2] * F[2]];
  };
  Plot3D.prototype.line = function (a, b, st) { this.q.push({ t: 'line', a: a, b: b, st: st || {} }); };
  Plot3D.prototype.arrow = function (a, b, st) { this.q.push({ t: 'arrow', a: a, b: b, st: st || {} }); };
  Plot3D.prototype.point = function (a, st) { this.q.push({ t: 'point', a: a, b: a, st: st || {} }); };
  Plot3D.prototype.text = function (str, a, st) { st = st || {}; st.str = str; this.q.push({ t: 'text', a: a, b: a, st: st, bias: 1e6 }); };
  Plot3D.prototype.poly = function (pts, st) { this.q.push({ t: 'poly', pts: pts, st: st || {} }); };
  /* parallelogram patch of the plane through `origin` spanned by u and v */
  Plot3D.prototype.plane = function (u, v, size, st, origin) {
    var o = origin || [0, 0, 0];
    function unit(a) { var n = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) || 1; return [a[0] / n, a[1] / n, a[2] / n]; }
    var e1 = unit(u), d = v[0] * e1[0] + v[1] * e1[1] + v[2] * e1[2];
    var e2 = unit([v[0] - d * e1[0], v[1] - d * e1[1], v[2] - d * e1[2]]);
    var pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(function (c) {
      return [o[0] + size * (c[0] * e1[0] + c[1] * e2[0]), o[1] + size * (c[0] * e1[1] + c[1] * e2[1]), o[2] + size * (c[0] * e1[2] + c[1] * e2[2])];
    });
    this.poly(pts, st || {});
    if (!st || st.mesh !== false) {
      for (var k = -3; k <= 3; k++) {
        var t = k / 4 * size, col = { color: (st && st.meshColor) || 'rgba(255,255,255,.1)', width: 1 };
        this.line([o[0] + t * e1[0] - size * e2[0], o[1] + t * e1[1] - size * e2[1], o[2] + t * e1[2] - size * e2[2]], [o[0] + t * e1[0] + size * e2[0], o[1] + t * e1[1] + size * e2[1], o[2] + t * e1[2] + size * e2[2]], col);
        this.line([o[0] + t * e2[0] - size * e1[0], o[1] + t * e2[1] - size * e1[1], o[2] + t * e2[2] - size * e1[2]], [o[0] + t * e2[0] + size * e1[0], o[1] + t * e2[1] + size * e1[1], o[2] + t * e2[2] + size * e1[2]], col);
      }
    }
  };
  Plot3D.prototype.axes = function (len, labels) {
    labels = labels || ['x', 'y', 'z'];
    var st = { color: C.axis, width: 1.2 };
    this.line([-len, 0, 0], [len, 0, 0], st); this.line([0, -len, 0], [0, len, 0], st); this.line([0, 0, -len], [0, 0, len], st);
    this.text(labels[0], [len * 1.07, 0, 0], { color: C.dim, math: true, align: 'center' });
    this.text(labels[1], [0, len * 1.07, 0], { color: C.dim, math: true, align: 'center' });
    this.text(labels[2], [0, 0, len * 1.07], { color: C.dim, math: true, align: 'center' });
  };
  Plot3D.prototype.end = function () {
    var self = this, ctx = this.ctx;
    this.q.forEach(function (it) {
      if (it.t === 'poly') { it.P = it.pts.map(function (p) { return self.proj(p); }); it.d = it.P.reduce(function (s, p) { return s + p[2]; }, 0) / it.P.length - 0.02; }
      else { it.pa = self.proj(it.a); it.pb = self.proj(it.b); it.d = (it.pa[2] + it.pb[2]) / 2 + (it.bias || 0) + (it.t === 'arrow' ? 0.01 : 0); }
    });
    this.q.sort(function (x, y) { return x.d - y.d; });
    this.q.forEach(function (it) {
      var st = it.st, i;
      ctx.save();
      ctx.globalAlpha = st.alpha === undefined ? 1 : st.alpha;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash(st.dash || []);
      if (it.t === 'poly') {
        ctx.beginPath(); ctx.moveTo(it.P[0][0], it.P[0][1]);
        for (i = 1; i < it.P.length; i++) ctx.lineTo(it.P[i][0], it.P[i][1]);
        ctx.closePath();
        ctx.fillStyle = st.fill || 'rgba(255,255,255,.08)'; ctx.fill();
        if (st.color) { ctx.strokeStyle = st.color; ctx.lineWidth = st.width || 1.2; ctx.stroke(); }
      } else if (it.t === 'line') {
        ctx.strokeStyle = st.color || C.chalk; ctx.lineWidth = st.width || 2;
        ctx.beginPath(); ctx.moveTo(it.pa[0], it.pa[1]); ctx.lineTo(it.pb[0], it.pb[1]); ctx.stroke();
      } else if (it.t === 'arrow') {
        var dx = it.pb[0] - it.pa[0], dy = it.pb[1] - it.pa[1], len = Math.sqrt(dx * dx + dy * dy);
        ctx.strokeStyle = ctx.fillStyle = st.color || C.chalk; ctx.lineWidth = st.width || 2.4;
        if (len < 2) { ctx.beginPath(); ctx.arc(it.pa[0], it.pa[1], 3, 0, 7); ctx.fill(); }
        else {
          var ux = dx / len, uy = dy / len, h = Math.min(11, len * .6), w = h * .5;
          ctx.beginPath(); ctx.moveTo(it.pa[0], it.pa[1]); ctx.lineTo(it.pb[0] - ux * h * .8, it.pb[1] - uy * h * .8); ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath(); ctx.moveTo(it.pb[0], it.pb[1]); ctx.lineTo(it.pb[0] - ux * h - uy * w, it.pb[1] - uy * h + ux * w); ctx.lineTo(it.pb[0] - ux * h + uy * w, it.pb[1] - uy * h - ux * w); ctx.closePath(); ctx.fill();
          if (st.label) {
            ctx.font = FONT_MATH; ctx.textBaseline = 'middle'; ctx.textAlign = ux < -.3 ? 'right' : (ux > .3 ? 'left' : 'center');
            ctx.fillText(st.label, it.pb[0] + ux * 13, it.pb[1] + uy * 13);
          }
        }
      } else if (it.t === 'point') {
        ctx.fillStyle = st.color || C.chalk; ctx.beginPath(); ctx.arc(it.pa[0], it.pa[1], st.r || 4.5, 0, Math.PI * 2); ctx.fill();
        if (st.ring) { ctx.strokeStyle = st.ring; ctx.lineWidth = 2; ctx.stroke(); }
        if (st.label) { ctx.font = st.math === false ? FONT : FONT_MATH; ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillText(st.label, it.pa[0] + 9, it.pa[1] - 10); }
      } else if (it.t === 'text') {
        ctx.font = st.math ? FONT_MATH : FONT; ctx.fillStyle = st.color || C.chalk; ctx.textAlign = st.align || 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(st.str, it.pa[0] + (st.dx || 0), it.pa[1] + (st.dy || 0));
      }
      ctx.restore();
    });
  };
  Plot3D.prototype.note = Plot2D.prototype.note;

  window.Plot2D = Plot2D;
  window.Plot3D = Plot3D;
  window.PlotColors = C;
  window.plotRgba = rgba;
})();
