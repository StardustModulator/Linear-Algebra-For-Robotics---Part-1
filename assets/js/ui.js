/* ==========================================================================
   ui.js: page shell and the small widgets every lab uses.
   Needs icons.js and la.js loaded first. Exposed as window.UI.
   ========================================================================== */
(function () {
  'use strict';
  var UI = {};
  var OCW = 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/';
  var SC = 'https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/';
  UI.OCW = OCW;
  UI.SC = SC;

  /* ---------- the seven lectures ---------- */
  UI.LECTURES = [
    { n: 1, file: '01-geometry-of-linear-equations.html', title: 'The Geometry of Linear Equations', icon: 'rows', mins: '39:49',
      ideas: 'Row picture, column picture, Ax = b, singular cases',
      robot: 'Beacon triangulation, arm, thrusters', robotNote: 'Where am I, and can I move every way?', robotIcon: 'beacon',
      sc: 'the-geometry-of-linear-equations', sum: 'mit18_06scf11_ses1-1sum', video: 'lecture-1-the-geometry-of-linear-equations' },
    { n: 2, file: '02-elimination-with-matrices.html', title: 'Elimination with Matrices', icon: 'stairs', mins: '47:42',
      ideas: 'Pivots, multipliers, back-substitution, elimination and permutation matrices',
      robot: 'Omni-wheel odometry', robotNote: 'Turn three encoder readings into one body velocity', robotIcon: 'omni',
      sc: 'elimination-with-matrices', sum: 'mit18_06scf11_ses1-2sum', video: 'lecture-2-elimination-with-matrices' },
    { n: 3, file: '03-multiplication-and-inverse-matrices.html', title: 'Multiplication and Inverse Matrices', icon: 'multiply', mins: '46:49',
      ideas: 'Five ways to multiply, AB ≠ BA, inverses, Gauss-Jordan',
      robot: 'Transform chains', robotNote: 'Forward kinematics is a product; undoing it is an inverse', robotIcon: 'frame',
      sc: 'multiplication-and-inverse-matrices', sum: 'mit18_06scf11_ses1-3sum', video: 'lecture-3-multiplication-and-inverse-matrices' },
    { n: 4, file: '04-factorization-into-a-lu.html', title: 'Factorization into A = LU', icon: 'lu', mins: '48:05',
      ideas: 'A = LU, A = LDU, cost of elimination, inverse of a product',
      robot: 'Real-time control loops', robotNote: 'Factor once, then solve a thousand times a second', robotIcon: 'stopwatch',
      sc: 'factorization-into-a-lu', sum: 'mit18_06scf11_ses1-4sum', video: 'lecture-4-factorization-into-a-lu' },
    { n: 5, file: '05-transposes-permutations-spaces.html', title: 'Transposes, Permutations, Spaces Rⁿ', icon: 'transpose', mins: '47:42',
      ideas: 'PA = LU, transposes, symmetric matrices, vector spaces, subspaces',
      robot: 'Force and motion duality', robotNote: 'τ = JᵀF, and the set of motions a robot can make', robotIcon: 'bolt',
      sc: 'transposes-permutations-vector-spaces', sum: 'mit18_06scf11_ses1-5sum', video: 'lecture-5-transposes-permutations-spaces-r-n' },
    { n: 6, file: '06-column-space-and-nullspace.html', title: 'Column Space and Nullspace', icon: 'plane', mins: '46:01',
      ideas: 'Subspaces, column space C(A), nullspace N(A), when Ax = b is solvable',
      robot: 'Redundant arm', robotNote: 'What the hand can do, and how the elbow moves for free', robotIcon: 'arm',
      sc: 'column-space-and-nullspace', sum: 'mit18_06scf11_ses1-6sum', video: 'lecture-6-column-space-and-nullspace' },
    { n: 7, file: '07-solving-ax-equals-0.html', title: 'Solving Ax = 0: Pivot Variables, Special Solutions', icon: 'nullspace', mins: '43:20',
      ideas: 'Echelon form, rank, pivot and free variables, special solutions, rref',
      robot: 'Over-actuated machines', robotNote: 'Count the true degrees of freedom and the spare ones', robotIcon: 'thruster',
      sc: 'solving-ax-0-pivot-variables-special-solutions', sum: 'mit18_06scf11_ses1-7sum', video: 'lecture-7-solving-ax-0-pivot-variables-special-solutions' }
  ];
  UI.links = function (n) {
    var L = UI.LECTURES[n - 1];
    return {
      session: SC + 'pages/ax-b-and-the-four-subspaces/' + L.sc + '/',
      summary: SC + 'resources/' + L.sum + '/',
      video: OCW + 'resources/' + L.video + '/',
      gallery: OCW + 'video_galleries/video-lectures/'
    };
  };

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  UI.el = el;
  UI.$ = function (sel, scope) { return (scope || document).querySelector(sel); };
  UI.$$ = function (sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  UI.pad = pad;

  /* ---------- theme ---------- */
  function storedTheme() { try { return localStorage.getItem('la-theme'); } catch (e) { return null; } }
  function isDark() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t) return t === 'dark';
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  UI.isDark = isDark;
  function applyStoredTheme() {
    var t = storedTheme();
    if (t === 'dark' || t === 'light') document.documentElement.setAttribute('data-theme', t);
  }
  applyStoredTheme();
  function toggleTheme() {
    var next = isDark() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('la-theme', next); } catch (e) { /* storage may be blocked */ }
    syncThemeButton();
    window.dispatchEvent(new Event('themechange'));
  }
  function syncThemeButton() {
    var b = document.getElementById('theme-btn');
    if (b) { b.innerHTML = icon(isDark() ? 'sun' : 'moon'); b.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme'); }
  }

  /* ---------- shell: top bar, table of contents, pager, footer ---------- */
  var MARK = '<svg class="brand-mark" viewBox="0 0 30 22" aria-hidden="true"><path d="M6 1.2H1.5v19.6H6M24 1.2h4.500v19.600H24" fill="none" stroke="#f4f2ee" stroke-width="2"/><rect x="8" y="4.500" width="5.500" height="5.500" fill="#c9283f"/><rect x="16.500" y="4.500" width="5.500" height="5.500" fill="#f4f2ee"/><rect x="16.500" y="12" width="5.500" height="5.500" fill="#f4f2ee"/><rect x="8.700" y="12.700" width="4.100" height="4.100" fill="none" stroke="#5c5b5e" stroke-width="1.400"/></svg>';

  UI.shell = function () {
    var main = document.querySelector('[data-lecture], [data-page]');
    var cur = main && main.getAttribute('data-lecture') ? parseInt(main.getAttribute('data-lecture'), 10) : 0;
    var base = (main && main.getAttribute('data-base')) || '';   /* '../' for pages one folder down */

    /* top bar */
    var bar = el('header', 'topbar');
    var nav = UI.LECTURES.map(function (L) {
      return '<a href="' + base + L.file + '" title="Lecture ' + L.n + ': ' + L.title + '"' + (L.n === cur ? ' aria-current="page"' : '') + '>' + pad(L.n) + '</a>';
    }).join('');
    bar.innerHTML = '<div class="wrap"><a class="brand" href="' + base + 'index.html" aria-label="Linear Algebra for Robotics, home">' + MARK +
      '<span class="brand-text">Linear Algebra for Robotics <span>/ Part 1</span></span></a>' +
      '<nav class="lecnav" aria-label="Lectures">' + nav + '</nav>' +
      '<button class="iconbtn" id="theme-btn" type="button"></button></div>';
    document.body.insertBefore(bar, document.body.firstChild);
    document.getElementById('theme-btn').addEventListener('click', toggleTheme);
    syncThemeButton();

    /* lecture extras */
    if (cur) {
      var L = UI.LECTURES[cur - 1], links = UI.links(cur);
      UI.$$('.bars').forEach(function (b) {
        var h = [10, 18, 14, 24, 16, 20, 26];
        b.innerHTML = UI.LECTURES.map(function (x, i) { return '<span style="height:' + h[i] + 'px"' + (x.n === cur ? ' class="on"' : '') + '></span>'; }).join('');
      });
      UI.$$('[data-ocw]').forEach(function (a) { a.href = links[a.getAttribute('data-ocw')] || links.session; a.target = '_blank'; a.rel = 'noopener'; });
      buildToc();
      buildProgress(cur);
      buildPager(cur);
      if (!document.title) document.title = 'Lecture ' + cur + ' · ' + L.title;
    } else {
      UI.$$('.bars').forEach(function (b) {
        var h = [10, 18, 14, 24, 16, 20, 26];
        b.innerHTML = h.map(function (x, i) { return '<span style="height:' + x + 'px"' + (i === 0 ? ' class="on"' : '') + '></span>'; }).join('');
      });
    }

    /* footer */
    var f = el('footer', 'footer');
    f.innerHTML = '<div class="wrap"><div><h4>About this companion</h4><p>An independent study companion that follows the first seven lectures of MIT 18.06 Linear Algebra (Prof. Gilbert Strang) and ties every idea to a robot. It is not affiliated with or endorsed by MIT. The lectures themselves are published by MIT OpenCourseWare under a Creative Commons BY-NC-SA licence.</p></div>' +
      '<div><h4>Go to the source</h4><ul><li><a href="' + OCW + 'video_galleries/video-lectures/" target="_blank" rel="noopener">18.06 video lectures on MIT OpenCourseWare</a></li><li><a href="' + SC + '" target="_blank" rel="noopener">18.06SC, with lecture summaries and problems</a></li><li><a href="' + base + 'index.html#kit">Article kit, notes and code in this repository</a></li></ul></div></div>';
    document.body.appendChild(f);

    UI.$$('.kit-nav').forEach(collapseOnPhones);
    hydrateIcons(document);
    UI.hydrateMath(document);
  };

  /* ---------- matrices written in HTML ----------
     <span data-mx="2 -1; -1 2"></span>              a matrix (rows split by ;)
     <span data-mx="0; 3"></span>                    a column vector
     optional attributes:
       data-aug="1"            last column sits behind a separator
       data-rows="0:h1,1:h2"   tint rows      data-cols="0:h1"   tint columns
       data-cells="0.1:h3"     tint one cell (row.col)
       data-pivots="0.0,1.1"   circle entries
       data-cls="sm|lg"        size           data-cap="caption"                  */
  UI.hydrateMath = function (scope) {
    UI.$$('[data-mx]', scope).forEach(function (node) {
      var rows = node.getAttribute('data-mx').split(';').map(function (r) {
        return r.trim().split(/\s+/).map(function (t) {
          if (/^[-+]?[\d./]+$/.test(t)) return t.replace('-', '−');
          return '<i>' + t.replace(/-/g, '−').replace(/_/g, ' ') + '</i>';
        });
      });
      var o = { cls: node.getAttribute('data-cls') || '', cap: node.getAttribute('data-cap') || '' };
      if (node.hasAttribute('data-aug')) o.aug = parseInt(node.getAttribute('data-aug'), 10) || 1;
      ['rows', 'cols', 'cells'].forEach(function (k) {
        var a = node.getAttribute('data-' + k);
        if (!a) return;
        o[k] = {};
        a.split(',').forEach(function (pair) { var kv = pair.trim().split(':'); o[k][kv[0].trim().replace('.', ',')] = kv[1].trim(); });
      });
      var pv = node.getAttribute('data-pivots');
      if (pv) o.pivots = pv.split(',').map(function (s) { return s.trim().split('.').map(Number); });
      var t = document.createElement('template');
      t.innerHTML = UI.mx(rows, o);
      node.replaceWith(t.content.firstChild);
    });
    /* numerals inside inline maths stand upright, as in print */
    UI.$$('.m', scope).forEach(function (m) {
      var walker = document.createTreeWalker(m, NodeFilter.SHOW_TEXT, null), nodes = [], n;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(function (tn) {
        if (!/[0-9]/.test(tn.nodeValue) || (tn.parentNode.classList && tn.parentNode.classList.contains('u'))) return;
        var frag = document.createDocumentFragment();
        tn.nodeValue.split(/([0-9]+(?:[.][0-9]+)?)/).forEach(function (part, i) {
          if (!part) return;
          if (i % 2) { var sp = document.createElement('span'); sp.className = 'u'; sp.textContent = part; frag.appendChild(sp); }
          else frag.appendChild(document.createTextNode(part));
        });
        tn.parentNode.replaceChild(frag, tn);
      });
    });
  };

  /* a contents list starts closed on small screens so the page opens on its content */
  function collapseOnPhones(node) {
    var d = node.querySelector('details');
    if (d && window.matchMedia && window.matchMedia('(max-width: 980px)').matches) d.open = false;
  }

  /* ---------- progress: a "Got it" mark per section, kept in this browser only ---------- */
  var PKEY = 'la-progress-v1';
  UI.progress = {
    load: function () { try { return JSON.parse(localStorage.getItem(PKEY) || '{}') || {}; } catch (e) { return {}; } },
    save: function (p) { try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch (e) { /* storage may be blocked */ } },
    /* { done, total } for one lecture, or null if never opened */
    summary: function (n) {
      var p = UI.progress.load(), total = p[n + ':total'];
      if (!total) return null;
      var done = 0;
      Object.keys(p).forEach(function (k) { if (k.indexOf(n + ':') === 0 && k !== n + ':total' && p[k] === true) done++; });
      return { done: Math.min(done, total), total: total };
    }
  };
  function buildProgress(n) {
    var secs = UI.$$('.concept[id]');
    if (!secs.length) return;
    var p = UI.progress.load();
    p[n + ':total'] = secs.length;
    UI.progress.save(p);
    function paint() {
      var q = UI.progress.load(), done = 0;
      secs.forEach(function (sec) {
        var on = q[n + ':' + sec.id] === true;
        if (on) done++;
        var b = sec.querySelector('.got-it');
        if (b) { b.setAttribute('aria-pressed', String(on)); b.innerHTML = icon(on ? 'check' : 'plus') + '<span>' + (on ? 'Understood' : 'Mark as understood') + '</span>'; }
        var link = document.querySelector('.toc a[href="#' + sec.id + '"]');
        if (link) link.classList.toggle('done', on);
      });
      var meter = document.querySelector('.toc .toc-meter');
      if (meter) meter.innerHTML = '<b>' + done + ' of ' + secs.length + ' sections understood</b><span class="bar"><span style="width:' + Math.round(100 * done / secs.length) + '%"></span></span>';
    }
    secs.forEach(function (sec) {
      var head = sec.querySelector('.concept-head');
      if (!head) return;
      var b = el('button', 'got-it');
      b.type = 'button';
      b.title = 'Saved in this browser only';
      b.addEventListener('click', function () {
        var q = UI.progress.load(), k = n + ':' + sec.id;
        q[k] = !(q[k] === true);
        UI.progress.save(q);
        paint();
      });
      head.appendChild(b);
    });
    var tocList = document.querySelector('.toc details');
    if (tocList) tocList.appendChild(el('div', 'toc-meter'));
    paint();
  }

  function buildToc() {
    var toc = document.querySelector('.toc');
    var secs = UI.$$('.concept[id]');
    if (!toc || !secs.length) return;
    var items = secs.map(function (s) {
      var no = s.querySelector('.concept-no'), h = s.querySelector('h2');
      return '<li><a href="#' + s.id + '"><span class="n">' + (no ? no.textContent : '') + '</span><span>' + (s.getAttribute('data-toc') || (h ? h.textContent : s.id)) + '</span></a></li>';
    }).join('');
    toc.innerHTML = '<details open><summary class="toc-title label">In this lecture</summary><ol>' + items + '</ol></details>';
    collapseOnPhones(toc);
    toc.setAttribute('aria-label', 'In this lecture');
    if (!('IntersectionObserver' in window)) return;
    var links = UI.$$('a', toc), seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { seen[en.target.id] = en.isIntersecting; });
      var first = null;
      secs.forEach(function (s) { if (first === null && seen[s.id]) first = s.id; });
      if (first) links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + first); });
    }, { rootMargin: '-80px 0px -55% 0px' });
    secs.forEach(function (s) { io.observe(s); });
  }

  function buildPager(cur) {
    var body = document.querySelector('.lec-body');
    if (!body) return;
    var prev = UI.LECTURES[cur - 2], next = UI.LECTURES[cur];
    var p = el('nav', 'pager');
    p.setAttribute('aria-label', 'Previous and next lecture');
    p.innerHTML =
      (prev ? '<a href="' + prev.file + '"><span class="label">' + icon('arrow-left') + ' Lecture ' + pad(prev.n) + '</span><b>' + prev.title + '</b></a>'
            : '<a href="index.html"><span class="label">' + icon('arrow-left') + ' Home</span><b>All seven lectures</b></a>') +
      (next ? '<a class="next" href="' + next.file + '"><span class="label">Lecture ' + pad(next.n) + ' ' + icon('arrow-right') + '</span><b>' + next.title + '</b></a>'
            : '<a class="next" href="capstone.html"><span class="label">Capstone ' + icon('arrow-right') + '</span><b>One robot, seven lectures</b></a>');
    body.appendChild(p);
  }

  /* ---------- matrix rendering ----------
     UI.mx(M, opts) returns HTML for a matrix (2-D array) or a column vector (1-D array).
       opts.aug     number of trailing columns drawn after a separator (augmented part)
       opts.rows    { rowIndex: 'h1' }   tint a whole row    (h1 red, h2 blue, h3 amber, h4 green)
       opts.cols    { colIndex: 'h2' }   tint a whole column
       opts.cells   { 'i,j': 'h3' }      tint single cells (wins over rows / cols)
       opts.pivots  [[i, j], ...]        circle these entries
       opts.dim     function (i, j)      fade entries
       opts.fmt     number formatter     (default LA.fmt, exact fractions)
       opts.cls     'sm' | 'lg' | 'paren'
       opts.cap     small caption under the matrix                                  */
  UI.mx = function (M, o) {
    o = o || {};
    var rows = Array.isArray(M[0]) ? M : M.map(function (v) { return [v]; });
    var m = rows.length, n = rows[0].length, f = o.fmt || LA.fmt;
    var augFrom = o.aug ? n - o.aug : -1;
    var pv = {};
    (o.pivots || []).forEach(function (p) { if (p) pv[p[0] + ',' + p[1]] = 1; });
    var html = '<span class="mx' + (o.cls ? ' ' + o.cls : '') + '" style="--cols:' + n + '">';
    for (var i = 0; i < m; i++) {
      for (var j = 0; j < n; j++) {
        var v = rows[i][j], c = [];
        var key = i + ',' + j;
        if (j === augFrom) c.push('sep');
        var tint = (o.cells && o.cells[key]) || (o.rows && o.rows[i]) || (o.cols && o.cols[j]);
        if (tint) c.push(tint);
        if (pv[key]) c.push('pv');
        if (o.dim && o.dim(i, j)) c.push('dim');
        if (o.hi) { var extra = o.hi(i, j, v); if (extra) c.push(extra); }
        html += '<span' + (c.length ? ' class="' + c.join(' ') + '"' : '') + '>' + (typeof v === 'number' ? f(v) : v) + '</span>';
      }
    }
    html += '</span>';
    if (o.cap) html = '<span class="mx-wrap">' + html + '<span class="mx-cap">' + o.cap + '</span></span>';
    return html;
  };
  /* join pieces into one centred equation row; plain strings become operators */
  UI.eq = function () {
    var parts = Array.prototype.slice.call(arguments), cls = 'eq';
    if (parts.length && parts[0] && typeof parts[0] === 'object' && !Array.isArray(parts[0])) { var opt = parts.shift(); if (opt.cls) cls += ' ' + opt.cls; }
    return '<div class="' + cls + '">' + parts.map(function (p) {
      return /^</.test(p) ? p : '<span class="op">' + p + '</span>';
    }).join('') + '</div>';
  };

  /* an editable matrix; returns { get(), set(M), el } */
  UI.mxInput = function (parent, M, o) {
    o = o || {};
    var m = M.length, n = M[0].length, augFrom = o.aug ? n - o.aug : -1;
    var box = el('span', 'mx' + (o.cls ? ' ' + o.cls : ''));
    box.style.setProperty('--cols', n);
    var inputs = [];
    for (var i = 0; i < m; i++) {
      inputs.push([]);
      for (var j = 0; j < n; j++) {
        var cell = el('span', j === augFrom ? 'sep' : '');
        var inp = document.createElement('input');
        inp.type = 'number'; inp.step = 'any'; inp.value = M[i][j]; inp.inputMode = 'decimal';
        inp.id = (o.id || 'mx') + '-' + i + '-' + j;
        inp.setAttribute('aria-label', (o.name || 'entry') + ' row ' + (i + 1) + ' column ' + (j + 1));
        cell.appendChild(inp); box.appendChild(cell); inputs[i].push(inp);
      }
    }
    parent.appendChild(box);
    function get() { return inputs.map(function (r) { return r.map(function (x) { var v = parseFloat(x.value); return isFinite(v) ? v : 0; }); }); }
    box.addEventListener('input', function () { if (o.onChange) o.onChange(get()); });
    return { el: box, get: get, set: function (A) { A.forEach(function (r, i) { r.forEach(function (v, j) { inputs[i][j].value = v; }); }); if (o.onChange) o.onChange(get()); } };
  };

  /* ---------- controls ---------- */
  var uid = 0;
  /* UI.slider(parent, { label, min, max, step, value, fmt, k, onInput }) -> { get, set, input } */
  UI.slider = function (parent, c) {
    var id = c.id || ('sl-' + (++uid));
    var fmt = c.fmt || function (v) { return LA.num(v, 2); };
    var w = el('label', 'slider' + (c.k ? ' k' + c.k : ''));
    w.setAttribute('for', id);
    w.innerHTML = '<span class="slider-top"><span>' + c.label + '</span><b></b></span><input type="range" id="' + id + '" min="' + c.min + '" max="' + c.max + '" step="' + (c.step || 'any') + '" value="' + c.value + '">';
    var input = w.querySelector('input'), out = w.querySelector('.slider-top > b');
    function show() { out.innerHTML = fmt(parseFloat(input.value)); }
    input.addEventListener('input', function () { show(); if (c.onInput) c.onInput(parseFloat(input.value)); });
    show();
    parent.appendChild(w);
    return { input: input, el: w, get: function () { return parseFloat(input.value); },
      set: function (v, fire) { input.value = v; show(); if (fire && c.onInput) c.onInput(parseFloat(input.value)); } };
  };
  /* UI.seg(parent, { options: [{ v, label }], value, onChange }) -> { get, set } */
  UI.seg = function (parent, c) {
    var w = el('div', 'seg'), val = c.value;
    w.setAttribute('role', 'group');
    if (c.label) w.setAttribute('aria-label', c.label);
    c.options.forEach(function (o) {
      var b = el('button', '', o.label);
      b.type = 'button'; b.setAttribute('data-v', o.v); b.setAttribute('aria-pressed', String(o.v) === String(val));
      b.addEventListener('click', function () { set(o.v, true); });
      w.appendChild(b);
    });
    function set(v, fire) {
      val = v;
      UI.$$('button', w).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-v') === String(v)); });
      if (fire && c.onChange) c.onChange(v);
    }
    parent.appendChild(w);
    return { el: w, get: function () { return val; }, set: set };
  };
  /* UI.check(parent, { label, checked, onChange }) */
  UI.check = function (parent, c) {
    var id = c.id || ('ck-' + (++uid));
    var w = el('label', 'check', '<input type="checkbox" id="' + id + '"' + (c.checked ? ' checked' : '') + '><span>' + c.label + '</span>');
    w.setAttribute('for', id);
    var input = w.querySelector('input');
    input.addEventListener('change', function () { if (c.onChange) c.onChange(input.checked); });
    parent.appendChild(w);
    return { input: input, get: function () { return input.checked; }, set: function (v) { input.checked = !!v; } };
  };
  /* UI.button(parent, { label, icon, cls, onClick }) */
  UI.button = function (parent, c) {
    var b = el('button', 'btn' + (c.cls ? ' ' + c.cls : ''), (c.icon ? icon(c.icon) : '') + (c.label ? '<span>' + c.label + '</span>' : ''));
    b.type = 'button';
    if (c.title) { b.title = c.title; b.setAttribute('aria-label', c.title); }
    if (c.onClick) b.addEventListener('click', c.onClick);
    parent.appendChild(b);
    return b;
  };
  /* status line with an icon: kind is 'ok' | 'bad' | 'hot' | '' */
  UI.status = function (node, kind, html) {
    var ic = kind === 'ok' ? 'check' : kind === 'bad' ? 'warn' : kind === 'hot' ? 'spark' : 'idea';
    node.className = 'status' + (kind ? ' ' + kind : '');
    node.innerHTML = icon(ic) + '<span>' + html + '</span>';
  };
  /* UI.readouts(parent, [{ k: 'label', id: 'name', c: 1 }]) -> { name: function (text) } */
  UI.readouts = function (parent, items) {
    var w = el('div', 'readouts'), api = {};
    items.forEach(function (it) {
      var r = el('div', 'readout', '<span class="k">' + it.k + '</span><span class="v' + (it.c ? ' c' + it.c : '') + '">–</span>');
      var v = r.querySelector('.v');
      api[it.id] = function (t) { if (v.textContent !== String(t)) v.innerHTML = t; };
      w.appendChild(r);
    });
    parent.appendChild(w);
    return api;
  };

  /* ---------- stepper: replay an algorithm one move at a time ----------
     UI.stepper(root, { steps, render(step, i, n) -> html, title(step, i) -> text, delay })
     returns { go(i), setSteps(steps), index() }                                           */
  UI.stepper = function (rootEl, c) {
    var steps = c.steps || [], i = 0, timer = null;
    rootEl.innerHTML = '';
    var w = el('div', 'stepper');
    var track = el('div', 'stepper-track');
    var view = el('div', 'stepper-view');
    var bar = el('div', 'stepper-bar');
    w.appendChild(track); w.appendChild(view); w.appendChild(bar);
    rootEl.appendChild(w);
    var bReset = UI.button(bar, { icon: 'reset', title: 'Back to the start', onClick: function () { stop(); go(0); } });
    var bPrev = UI.button(bar, { icon: 'prev', title: 'Previous step', onClick: function () { stop(); go(i - 1); } });
    var bPlay = UI.button(bar, { icon: 'play', label: 'Play', onClick: function () { if (timer) stop(); else play(); } });
    var bNext = UI.button(bar, { icon: 'next', label: 'Next step', cls: 'primary', onClick: function () { stop(); go(i + 1); } });
    var count = el('span', 'stepper-count');
    bar.appendChild(count);

    function buildTrack() {
      track.innerHTML = '';
      steps.forEach(function (_, k) {
        var b = el('button');
        b.type = 'button'; b.setAttribute('aria-label', 'Go to step ' + (k + 1));
        b.addEventListener('click', function () { stop(); go(k); });
        track.appendChild(b);
      });
    }
    function go(k) {
      if (!steps.length) { view.innerHTML = ''; return; }
      i = Math.max(0, Math.min(steps.length - 1, k));
      var s = steps[i];
      var t = c.title ? c.title(s, i, steps.length) : '';
      view.innerHTML = (t ? '<div class="step-title">' + t + '</div>' : '') + c.render(s, i, steps.length);
      UI.$$('button', track).forEach(function (b, k2) { b.className = k2 < i ? 'done' : (k2 === i ? 'cur' : ''); });
      count.textContent = 'Step ' + (i + 1) + ' / ' + steps.length;
      bPrev.disabled = i === 0; bReset.disabled = i === 0; bNext.disabled = i === steps.length - 1;
      if (c.onStep) c.onStep(s, i, steps.length);
    }
    function play() {
      if (i >= steps.length - 1) go(0);
      bPlay.innerHTML = icon('pause') + '<span>Pause</span>';
      timer = setInterval(function () { if (i >= steps.length - 1) stop(); else go(i + 1); }, c.delay || 1500);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      bPlay.innerHTML = icon('play') + '<span>Play</span>';
    }
    buildTrack(); go(0);
    return {
      go: go, index: function () { return i; }, stop: stop,
      setSteps: function (s) { stop(); steps = s || []; buildTrack(); go(0); }
    };
  };

  /* ---------- animation loop that sleeps when the lab is off screen ---------- */
  UI.loop = function (node, fn) {
    var visible = false, running = true, raf = null, last = 0;
    function tick(t) {
      raf = null;
      if (!visible || !running || document.hidden) return;
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
      last = t;
      fn(dt, t / 1000);
      raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf && visible && running && !document.hidden) { last = 0; raf = requestAnimationFrame(tick); } }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; kick(); }, { rootMargin: '80px' }).observe(node);
    } else { visible = true; kick(); }
    document.addEventListener('visibilitychange', kick);
    return { stop: function () { running = false; }, start: function () { running = true; kick(); }, isRunning: function () { return running; } };
  };
  UI.reducedMotion = function () { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); };

  /* run once the DOM is ready */
  UI.ready = function (fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn();
  };
  /* isolate each lab so one failure cannot blank the page */
  UI.lab = function (id, fn) {
    UI.ready(function () {
      var node = document.getElementById(id);
      if (!node) return;
      try { fn(node); } catch (err) {
        if (window.console) console.error('Lab ' + id + ' failed:', err);
        var msg = el('div', 'status bad', icon('warn') + '<span>This lab could not start. Reload the page to try again.</span>');
        node.appendChild(msg);
      }
    });
  };

  UI.ready(UI.shell);
  window.UI = UI;
})();
