/* ==========================================================================
   la.js: linear algebra written from scratch, no dependencies.
   Every routine that teaches something also returns its `steps`, so the
   pages can replay the algorithm one move at a time.
   Exposed as window.LA (and module.exports under Node, for the tests).
   ========================================================================== */
(function (root) {
  'use strict';

  var EPS = 1e-10;
  var LA = { EPS: EPS };

  /* ---------- basics ---------- */
  LA.clone = function (A) { return A.map(function (r) { return r.slice(); }); };
  LA.zeros = function (m, n) {
    var A = [];
    for (var i = 0; i < m; i++) { A.push(new Array(n).fill(0)); }
    return A;
  };
  LA.identity = function (n) {
    var I = LA.zeros(n, n);
    for (var i = 0; i < n; i++) I[i][i] = 1;
    return I;
  };
  LA.shape = function (A) { return [A.length, A.length ? A[0].length : 0]; };
  LA.T = function (A) {
    var m = A.length, n = A[0].length, B = LA.zeros(n, m);
    for (var i = 0; i < m; i++) for (var j = 0; j < n; j++) B[j][i] = A[i][j];
    return B;
  };
  LA.add = function (A, B) { return A.map(function (r, i) { return r.map(function (a, j) { return a + B[i][j]; }); }); };
  LA.sub = function (A, B) { return A.map(function (r, i) { return r.map(function (a, j) { return a - B[i][j]; }); }); };
  LA.scale = function (A, c) { return A.map(function (r) { return r.map(function (a) { return a * c; }); }); };
  LA.mul = function (A, B) {
    var m = A.length, n = B[0].length, p = B.length, C = LA.zeros(m, n);
    for (var i = 0; i < m; i++) for (var j = 0; j < n; j++) {
      var s = 0;
      for (var k = 0; k < p; k++) s += A[i][k] * B[k][j];
      C[i][j] = s;
    }
    return C;
  };
  /* matrix times vector */
  LA.mv = function (A, x) {
    return A.map(function (r) { var s = 0; for (var j = 0; j < r.length; j++) s += r[j] * x[j]; return s; });
  };
  LA.col = function (A, j) { return A.map(function (r) { return r[j]; }); };
  LA.row = function (A, i) { return A[i].slice(); };
  LA.fromCols = function (cols) { return LA.T(cols); };
  LA.dot = function (a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };
  LA.norm = function (a) { return Math.sqrt(LA.dot(a, a)); };
  LA.vadd = function (a, b) { return a.map(function (x, i) { return x + b[i]; }); };
  LA.vsub = function (a, b) { return a.map(function (x, i) { return x - b[i]; }); };
  LA.vscale = function (a, c) { return a.map(function (x) { return x * c; }); };
  LA.isZero = function (x, tol) { return Math.abs(x) < (tol || EPS); };
  LA.clean = function (x) { return Math.abs(x) < EPS ? 0 : x; };
  LA.cleanM = function (A) { return A.map(function (r) { return r.map(LA.clean); }); };
  LA.equal = function (A, B, tol) {
    tol = tol || 1e-8;
    if (A.length !== B.length || A[0].length !== B[0].length) return false;
    for (var i = 0; i < A.length; i++) for (var j = 0; j < A[0].length; j++) if (Math.abs(A[i][j] - B[i][j]) > tol) return false;
    return true;
  };

  /* ---------- number formatting ---------- */
  var MINUS = '−';
  /* x as a small fraction [n, d], or null */
  LA.frac = function (x, maxDen) {
    if (!isFinite(x)) return null;
    maxDen = maxDen || 24;
    var s = x < 0 ? -1 : 1, a = Math.abs(x);
    for (var d = 1; d <= maxDen; d++) {
      var n = Math.round(a * d);
      if (Math.abs(a - n / d) < 1e-9) return [s * n, d];
    }
    return null;
  };
  function trimZeros(s) { return s.indexOf('.') >= 0 ? s.replace(/\.?0+$/, '') : s; }
  /* decimal with a real minus sign */
  LA.num = function (x, digits) {
    if (!isFinite(x)) return x > 0 ? '∞' : (x < 0 ? MINUS + '∞' : '?');
    if (digits === undefined) digits = 2;
    var s = trimZeros(x.toFixed(digits));
    if (s === '-0' || s === '0') return '0';
    return s.replace('-', MINUS);
  };
  /* fixed decimals (no trimming) for readouts that should not jitter */
  LA.fix = function (x, digits) {
    if (!isFinite(x)) return '?';
    if (digits === undefined) digits = 2;
    var s = x.toFixed(digits);
    if (parseFloat(s) === 0) s = (0).toFixed(digits);
    return s.replace('-', MINUS);
  };
  /* exact-looking: integers and small fractions stay exact, else decimals */
  LA.fmt = function (x, digits) {
    if (typeof x === 'string') return x;
    if (!isFinite(x)) return '?';
    if (Math.abs(x) < 1e-9) return '0';
    var f = LA.frac(x);
    if (f) return (f[0] < 0 ? MINUS : '') + Math.abs(f[0]) + (f[1] === 1 ? '' : '/' + f[1]);
    return LA.num(x, digits === undefined ? 3 : digits);
  };
  LA.deg = function (rad) { return rad * 180 / Math.PI; };
  LA.rad = function (deg) { return deg * Math.PI / 180; };

  /* ---------- elementary matrices ---------- */
  /* E subtracts l times row j from row i (entry (i, j) = -l) */
  LA.elimMatrix = function (n, i, j, l) { var E = LA.identity(n); E[i][j] = -l; return E; };
  /* P exchanges rows i and j */
  LA.swapMatrix = function (n, i, j) {
    var P = LA.identity(n);
    P[i][i] = 0; P[j][j] = 0; P[i][j] = 1; P[j][i] = 1;
    return P;
  };
  LA.permMatrix = function (perm) {
    var n = perm.length, P = LA.zeros(n, n);
    for (var i = 0; i < n; i++) P[i][perm[i]] = 1;
    return P;
  };
  LA.permutations = function (n) {
    var out = [];
    (function rec(cur, rest) {
      if (!rest.length) { out.push(cur); return; }
      for (var i = 0; i < rest.length; i++) rec(cur.concat(rest[i]), rest.slice(0, i).concat(rest.slice(i + 1)));
    })([], Array.from({ length: n }, function (_, i) { return i; }));
    return out;
  };

  /* ---------- Gaussian elimination on a square system, with every step ----------
     opts.pivoting: 'zero'    exchange rows only when the pivot is zero (as in lecture)
                    'partial' always bring the largest entry up (as software does)
     Returns { steps, U, c, x, pivots, singular, exchanges, ops, L, perm }           */
  LA.eliminate = function (A0, b0, opts) {
    opts = opts || {};
    var pivoting = opts.pivoting || 'zero';
    var n = A0.length;
    var A = LA.clone(A0), b = b0 ? b0.slice() : null;
    var L = LA.identity(n), perm = [];
    for (var q = 0; q < n; q++) perm.push(q);
    var steps = [], ops = [], pivots = [], exchanges = 0, singular = false;

    function snap(extra) {
      var s = { M: LA.cleanM(A), rhs: b ? b.map(LA.clean) : null, pivots: pivots.slice() };
      for (var key in extra) s[key] = extra[key];
      steps.push(s);
    }
    snap({ kind: 'start' });

    for (var k = 0; k < n && !singular; k++) {
      /* choose the pivot row */
      var p = k;
      if (pivoting === 'partial') {
        for (var r = k + 1; r < n; r++) if (Math.abs(A[r][k]) > Math.abs(A[p][k]) + EPS) p = r;
      } else if (LA.isZero(A[k][k])) {
        p = -1;
        for (var r2 = k + 1; r2 < n; r2++) if (!LA.isZero(A[r2][k])) { p = r2; break; }
      }
      if (p === -1 || LA.isZero(A[p][k])) {
        singular = true;
        snap({ kind: 'fail', k: k });
        break;
      }
      if (p !== k) {
        var t = A[k]; A[k] = A[p]; A[p] = t;
        if (b) { var tb = b[k]; b[k] = b[p]; b[p] = tb; }
        var tp = perm[k]; perm[k] = perm[p]; perm[p] = tp;
        for (var c0 = 0; c0 < k; c0++) { var tl = L[k][c0]; L[k][c0] = L[p][c0]; L[p][c0] = tl; }
        exchanges++;
        var P = LA.swapMatrix(n, k, p);
        ops.push({ type: 'P', M: P, i: k, j: p });
        snap({ kind: 'swap', k: k, i: k, j: p, E: P });
      }
      pivots.push(A[k][k]);
      snap({ kind: 'pivot', k: k, pivot: [k, k] });
      for (var i = k + 1; i < n; i++) {
        var l = A[i][k] / A[k][k];
        L[i][k] = l;
        if (LA.isZero(l)) {
          A[i][k] = 0;
          snap({ kind: 'skip', k: k, i: i, mult: 0, pivot: [k, k] });
          continue;
        }
        for (var j = k; j < n; j++) A[i][j] -= l * A[k][j];
        A[i][k] = 0;
        if (b) b[i] -= l * b[k];
        var E = LA.elimMatrix(n, i, k, l);
        ops.push({ type: 'E', M: E, i: i, j: k, l: l });
        snap({ kind: 'elim', k: k, i: i, mult: l, pivot: [k, k], E: E });
      }
    }

    var x = null;
    if (!singular) {
      snap({ kind: 'upper' });
      if (b) {
        x = new Array(n).fill(null);
        for (var i2 = n - 1; i2 >= 0; i2--) {
          var s = b[i2];
          for (var j2 = i2 + 1; j2 < n; j2++) s -= A[i2][j2] * x[j2];
          x[i2] = LA.clean(s / A[i2][i2]);
          snap({ kind: 'back', i: i2, x: x.slice(), pivot: [i2, i2] });
        }
        snap({ kind: 'done', x: x.slice() });
      }
    }
    return {
      steps: steps, U: LA.cleanM(A), c: b ? b.map(LA.clean) : null, x: x, pivots: pivots, singular: singular,
      exchanges: exchanges, ops: ops, L: LA.cleanM(L), perm: perm, P: LA.permMatrix(perm)
    };
  };

  /* ---------- triangular solves ---------- */
  LA.forwardSub = function (L, b) {
    var n = L.length, y = new Array(n).fill(0);
    for (var i = 0; i < n; i++) {
      var s = b[i];
      for (var j = 0; j < i; j++) s -= L[i][j] * y[j];
      y[i] = s / L[i][i];
    }
    return y;
  };
  LA.backSub = function (U, c) {
    var n = U.length, x = new Array(n).fill(0);
    for (var i = n - 1; i >= 0; i--) {
      var s = c[i];
      for (var j = i + 1; j < n; j++) s -= U[i][j] * x[j];
      x[i] = s / U[i][i];
    }
    return x;
  };

  /* ---------- LU: PA = LU (P = I when no exchange is needed) ---------- */
  LA.lu = function (A, opts) {
    var r = LA.eliminate(A, null, opts);
    var n = A.length, D = LA.zeros(n, n), U1 = LA.clone(r.U);
    if (!r.singular) {
      for (var i = 0; i < n; i++) {
        D[i][i] = r.U[i][i];
        for (var j = 0; j < n; j++) U1[i][j] = LA.clean(r.U[i][j] / r.U[i][i]);
      }
    }
    return { ok: !r.singular, L: r.L, U: r.U, P: r.P, perm: r.perm, D: D, Uunit: U1, steps: r.steps, ops: r.ops, exchanges: r.exchanges, pivots: r.pivots };
  };
  /* solve with factors already in hand: L y = P b, then U x = y */
  LA.luSolve = function (f, b) {
    var pb = f.perm.map(function (p) { return b[p]; });
    return LA.backSub(f.U, LA.forwardSub(f.L, pb));
  };
  LA.solve = function (A, b) {
    var r = LA.eliminate(A, b, { pivoting: 'partial' });
    return r.singular ? null : r.x;
  };
  LA.det = function (A) {
    var r = LA.eliminate(A, null, { pivoting: 'partial' });
    if (r.singular) return 0;
    var d = r.exchanges % 2 ? -1 : 1;
    for (var i = 0; i < A.length; i++) d *= r.U[i][i];
    return d;
  };

  /* ---------- Gauss-Jordan inverse: [A I] -> [I inverse], with steps ---------- */
  LA.inverse = function (A0) {
    var n = A0.length, W = A0.map(function (r, i) { return r.concat(LA.identity(n)[i]); });
    var steps = [], singular = false;
    function snap(extra) { var s = { M: LA.cleanM(W) }; for (var key in extra) s[key] = extra[key]; steps.push(s); }
    snap({ kind: 'start' });
    for (var k = 0; k < n; k++) {
      var p = -1;
      for (var r = k; r < n; r++) if (!LA.isZero(W[r][k])) { p = r; break; }
      if (p === -1) { singular = true; snap({ kind: 'fail', k: k }); break; }
      if (p !== k) { var t = W[k]; W[k] = W[p]; W[p] = t; snap({ kind: 'swap', k: k, i: k, j: p }); }
      snap({ kind: 'pivot', k: k, pivot: [k, k] });
      for (var i = k + 1; i < n; i++) {
        var l = W[i][k] / W[k][k];
        if (LA.isZero(l)) continue;
        for (var j = 0; j < 2 * n; j++) W[i][j] -= l * W[k][j];
        W[i][k] = 0;
        snap({ kind: 'elim', k: k, i: i, mult: l, pivot: [k, k] });
      }
    }
    if (!singular) {
      snap({ kind: 'upper' });
      for (var k2 = n - 1; k2 >= 0; k2--) {
        for (var i2 = k2 - 1; i2 >= 0; i2--) {
          var l2 = W[i2][k2] / W[k2][k2];
          if (LA.isZero(l2)) continue;
          for (var j2 = 0; j2 < 2 * n; j2++) W[i2][j2] -= l2 * W[k2][j2];
          W[i2][k2] = 0;
          snap({ kind: 'elimUp', k: k2, i: i2, mult: l2, pivot: [k2, k2] });
        }
      }
      for (var k3 = 0; k3 < n; k3++) {
        var d = W[k3][k3];
        if (Math.abs(d - 1) > EPS) {
          for (var j3 = 0; j3 < 2 * n; j3++) W[k3][j3] /= d;
          snap({ kind: 'scale', k: k3, div: d, pivot: [k3, k3] });
        }
      }
      snap({ kind: 'done' });
    }
    var inv = singular ? null : LA.cleanM(W.map(function (r) { return r.slice(n); }));
    return { inv: inv, steps: steps, singular: singular };
  };
  LA.inv = function (A) { return LA.inverse(A).inv; };

  /* ---------- reduced row echelon form of any m by n matrix, with steps ----------
     Returns { R, U, pivotCols, freeCols, rank, steps, F }                          */
  LA.rref = function (A0, tol) {
    tol = tol || 1e-9;
    var m = A0.length, n = A0[0].length, A = LA.clone(A0);
    var steps = [], pivotCols = [], pivotRows = [];
    function snap(extra) {
      var s = { M: LA.cleanM(A), pivotCols: pivotCols.slice() };
      for (var key in extra) s[key] = extra[key];
      steps.push(s);
    }
    function clean() { for (var i = 0; i < m; i++) for (var j = 0; j < n; j++) if (Math.abs(A[i][j]) < tol) A[i][j] = 0; }
    snap({ kind: 'start' });
    var r = 0;
    for (var c = 0; c < n && r < m; c++) {
      var p = -1;
      for (var i = r; i < m; i++) if (Math.abs(A[i][c]) > tol) { p = i; break; }
      if (p === -1) { snap({ kind: 'free', col: c, row: r }); continue; }
      if (p !== r) { var t = A[r]; A[r] = A[p]; A[p] = t; snap({ kind: 'swap', i: r, j: p, col: c }); }
      pivotCols.push(c); pivotRows.push(r);
      snap({ kind: 'pivot', pivot: [r, c], col: c });
      for (var i2 = r + 1; i2 < m; i2++) {
        var l = A[i2][c] / A[r][c];
        if (Math.abs(l) < tol) { A[i2][c] = 0; continue; }
        for (var j = c; j < n; j++) A[i2][j] -= l * A[r][j];
        A[i2][c] = 0; clean();
        snap({ kind: 'elim', pivot: [r, c], i: i2, k: r, mult: l, col: c });
      }
      r++;
    }
    var rank = pivotCols.length;
    var freeCols = [];
    for (var c2 = 0; c2 < n; c2++) if (pivotCols.indexOf(c2) < 0) freeCols.push(c2);
    var U = LA.cleanM(A);
    snap({ kind: 'echelon', freeCols: freeCols.slice() });
    for (var k = rank - 1; k >= 0; k--) {
      var pr = pivotRows[k], pc = pivotCols[k];
      for (var i3 = pr - 1; i3 >= 0; i3--) {
        var l2 = A[i3][pc] / A[pr][pc];
        if (Math.abs(l2) < tol) continue;
        for (var j2 = 0; j2 < n; j2++) A[i3][j2] -= l2 * A[pr][j2];
        A[i3][pc] = 0; clean();
        snap({ kind: 'elimUp', pivot: [pr, pc], i: i3, k: pr, mult: l2, col: pc });
      }
    }
    for (var k2 = 0; k2 < rank; k2++) {
      var pr2 = pivotRows[k2], pc2 = pivotCols[k2], d = A[pr2][pc2];
      if (Math.abs(d - 1) > tol) {
        for (var j3 = 0; j3 < n; j3++) A[pr2][j3] /= d;
        clean();
        snap({ kind: 'scale', pivot: [pr2, pc2], k: pr2, div: d, col: pc2 });
      }
    }
    var R = LA.cleanM(A);
    snap({ kind: 'done', freeCols: freeCols.slice() });
    /* F: the free-column block of R (rank rows by n - rank columns) */
    var F = [];
    for (var a = 0; a < rank; a++) { F.push(freeCols.map(function (fc) { return R[a][fc]; })); }
    return { R: R, U: U, pivotCols: pivotCols, freeCols: freeCols, rank: rank, steps: steps, F: F };
  };
  LA.rank = function (A, tol) { return LA.rref(A, tol).rank; };

  /* special solutions of Ax = 0: one per free column */
  LA.nullspace = function (A, tol) {
    var rr = LA.rref(A, tol), n = A[0].length, basis = [];
    rr.freeCols.forEach(function (fc) {
      var x = new Array(n).fill(0);
      x[fc] = 1;
      rr.pivotCols.forEach(function (pc, i) { x[pc] = LA.clean(-rr.R[i][fc]); });
      basis.push(x);
    });
    return { basis: basis, pivotCols: rr.pivotCols, freeCols: rr.freeCols, rank: rr.rank, R: rr.R, F: rr.F, rref: rr };
  };

  /* is b in the column space of A? (compare ranks of A and [A b]) */
  LA.inColumnSpace = function (A, b, tol) {
    var Ab = A.map(function (r, i) { return r.concat([b[i]]); });
    return LA.rank(Ab, tol) === LA.rank(A, tol);
  };

  /* ---------- 2-D robot geometry helpers ---------- */
  LA.rot2 = function (t) { var c = Math.cos(t), s = Math.sin(t); return [[c, -s], [s, c]]; };
  /* homogeneous transform: rotate by t, then translate by (x, y) */
  LA.hom2 = function (t, x, y) { var c = Math.cos(t), s = Math.sin(t); return [[c, -s, x], [s, c, y], [0, 0, 1]]; };
  LA.clamp = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  LA.lerp = function (a, b, t) { return a + (b - a) * t; };
  LA.wrapAngle = function (a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

  root.LA = LA;
  if (typeof module !== 'undefined' && module.exports) module.exports = LA;
})(typeof window !== 'undefined' ? window : globalThis);
