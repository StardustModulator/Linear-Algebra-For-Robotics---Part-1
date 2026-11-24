#!/usr/bin/env node
/* ==========================================================================
   tools/build.js: regenerates everything that is derived from other files.

       node tools/build.js              (add --no-relink to leave lecture pages untouched)

   1. article/*.md   ->  kit/*.html      the article kit as readable pages
   2. code/*.py      ->  kit/code.html   every script with its real output
   3. icons.js       ->  assets/icons/*.svg   one file per glyph
   4. lecture pages: links to the notes and code point at the kit pages

   No dependencies. The Markdown reader below handles the subset the notes
   use: headings, paragraphs, lists, tables, block quotes, code fences, rules,
   links, bold, italic and inline code.
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const ART = path.join(ROOT, 'article');
const KIT = path.join(ROOT, 'kit');
const CODE = path.join(ROOT, 'code');
const { ICONS, iconFile } = require(path.join(ROOT, 'assets/js/icons.js'));

const LECTURES = [
  [1, '01-geometry-of-linear-equations', 'The Geometry of Linear Equations'],
  [2, '02-elimination-with-matrices', 'Elimination with Matrices'],
  [3, '03-multiplication-and-inverse-matrices', 'Multiplication and Inverse Matrices'],
  [4, '04-factorization-into-a-lu', 'Factorization into A = LU'],
  [5, '05-transposes-permutations-spaces', 'Transposes, Permutations, Spaces Rⁿ'],
  [6, '06-column-space-and-nullspace', 'Column Space and Nullspace'],
  [7, '07-solving-ax-equals-0', 'Solving Ax = 0']
];
const pad = n => String(n).padStart(2, '0');

/* which kit page each Markdown file becomes */
const PAGES = [{ md: 'README.md', out: 'index.html', nav: 'Start here: the outline', tag: 'kit' }];
LECTURES.forEach(([n, slug, title]) => PAGES.push({ md: slug + '.md', out: 'notes-' + pad(n) + '.html', nav: title, tag: pad(n) }));
PAGES.push({ md: 'concept-map.md', out: 'concept-map.html', nav: 'Complete concept map', tag: 'map' });
PAGES.push({ md: 'cheat-sheet.md', out: 'cheat-sheet.html', nav: 'Formula sheet', tag: 'f(x)' });
PAGES.push({ md: 'figures.md', out: 'figures.html', nav: 'Figure pack', tag: 'fig' });
PAGES.push({ md: 'glossary.md', out: 'glossary.html', nav: 'Glossary', tag: 'a–z' });
PAGES.push({ md: 'resources.md', out: 'resources.html', nav: 'Sources and further reading', tag: 'src' });
const CODE_PAGE = { out: 'code.html', nav: 'Runnable code', tag: 'py' };

/* ---------- Markdown to HTML ---------- */
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const slugify = s => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function rewriteLink(href) {
  if (/^(https?:|#|mailto:)/.test(href)) return href;
  const [file, hash] = href.split('#');
  const base = path.basename(file);
  const page = PAGES.find(p => p.md === base);
  if (page && !file.includes('/')) return page.out + (hash ? '#' + hash : '');
  if (/\.py$/.test(base)) return 'code.html#' + base.replace(/\.py$/, '');
  return href;
}
function inline(text) {
  const keep = [];
  const stash = html => { keep.push(html); return '\u0000' + (keep.length - 1) + '\u0000'; };
  let s = text.replace(/`([^`]+)`/g, (_, c) => stash('<code>' + esc(c) + '</code>'));
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const url = rewriteLink(href), ext = /^https?:/.test(url);
    return stash('<a href="' + url + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>') + label + stash('</a>');
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?=[^*\w]|$)/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => keep[+i]);
}
function splitRow(line) {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|') && !t.endsWith('\\|')) t = t.slice(0, -1);
  const cells = []; let cur = '', inCode = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (ch === '`') inCode = !inCode;
    if (ch === '\\' && t[i + 1] === '|') { cur += '|'; i++; continue; }
    if (ch === '|' && !inCode) { cells.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  cells.push(cur.trim());
  return cells;
}
function listBlock(lines) {
  /* lines: [{ indent, ordered, text }] with continuation text already merged */
  let html = '', i = 0;
  const baseIndent = lines[0].indent, ordered = lines[0].ordered;
  html += ordered ? '<ol>' : '<ul>';
  while (i < lines.length) {
    const item = lines[i]; i++;
    const kids = [];
    while (i < lines.length && lines[i].indent > baseIndent) { kids.push(lines[i]); i++; }
    html += '<li>' + inline(item.text) + (kids.length ? listBlock(kids) : '') + '</li>';
  }
  return html + (ordered ? '</ol>' : '</ul>');
}
function markdown(src) {
  const lines = src.replace(/\r/g, '').split('\n');
  let out = '', i = 0, title = '';
  const isBlockStart = l => /^(#{1,6} |```|> ?|\s*([-*+]|\d+\.) |\|)/.test(l) || /^\s*(-{3,}|\*{3,})\s*$/.test(l);
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m;
    if ((m = line.match(/^```(\w*)/))) {
      const buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      out += '<pre><code>' + esc(buf.join('\n')) + '</code></pre>\n';
      continue;
    }
    if ((m = line.match(/^(#{1,6}) +(.*)$/))) {
      const level = m[1].length, text = inline(m[2].replace(/\s+#+\s*$/, ''));
      if (level === 1 && !title) title = m[2]; else out += '<h' + level + ' id="' + slugify(m[2]) + '">' + text + '</h' + level + '>\n';
      i++; continue;
    }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { out += '<hr>\n'; i++; continue; }
    if ((m = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)\s*$/))) {
      /* a picture on its own line becomes a captioned figure; paths are relative to article/ */
      const src = /^(https?:|\.\.\/)/.test(m[2]) ? m[2] : '../article/' + m[2];
      out += '<figure><img src="' + src + '" alt="' + esc(m[1]).replace(/"/g, '&quot;') + '" loading="lazy"><figcaption>' + inline(m[1]) + '</figcaption></figure>\n';
      i++; continue;
    }
    if (/^> ?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^> ?/.test(lines[i])) { buf.push(lines[i].replace(/^> ?/, '')); i++; }
      out += '<blockquote>' + markdown(buf.join('\n')).html + '</blockquote>\n';
      continue;
    }
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const head = splitRow(line); i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(splitRow(lines[i])); i++; }
      const blankHead = head.every(c => !c);
      out += '<div class="tablewrap"><table class="t' + (blankHead ? ' kv' : '') + '">' +
        (blankHead ? '' : '<thead><tr>' + head.map(c => '<th>' + inline(c) + '</th>').join('') + '</tr></thead>') +
        '<tbody>' + rows.map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>\n';
      continue;
    }
    if (/^\s*([-*+]|\d+\.) /.test(line)) {
      const items = [];
      while (i < lines.length) {
        const l = lines[i];
        const mm = l.match(/^(\s*)([-*+]|\d+\.) +(.*)$/);
        if (mm) { items.push({ indent: mm[1].length, ordered: /\d/.test(mm[2]), text: mm[3] }); i++; continue; }
        if (l.trim() && /^\s{2,}/.test(l) && items.length) { items[items.length - 1].text += ' ' + l.trim(); i++; continue; }
        if (!l.trim() && i + 1 < lines.length && /^\s*([-*+]|\d+\.) /.test(lines[i + 1])) { i++; continue; }
        break;
      }
      out += listBlock(items) + '\n';
      continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !(buf.length && isBlockStart(lines[i]))) { buf.push(lines[i].trim()); i++; }
    out += '<p>' + inline(buf.join(' ')) + '</p>\n';
  }
  return { html: out, title };
}

/* ---------- page template ---------- */
const FONTS = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=STIX+Two+Text:ital,wght@0,400;0,600;1,400;1,600&display=swap';
function navHtml(current) {
  const all = PAGES.concat([CODE_PAGE]);
  return '<nav class="toc kit-nav" aria-label="Article kit"><details open><summary class="toc-title label">Article kit: all pages</summary><ol>' +
    all.map(p => '<li><a href="' + p.out + '"' + (p.out === current ? ' class="on" aria-current="page"' : '') + '><span class="n">' + p.tag + '</span><span>' + p.nav + '</span></a></li>').join('') +
    '</ol></details></nav>';
}
function page({ out, title, kicker, body }) {
  const plain = title.replace(/[*`]/g, '');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(plain)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS.replace(/&/g, '&amp;')}">
<link rel="stylesheet" href="../assets/css/mit.css">
</head>
<body>
<!-- Generated by tools/build.js. Edit the source in article/ or code/, then run: node tools/build.js -->
<main data-page="kit" data-base="../">
<section class="kit-hero">
  <div class="wrap">
    <div class="label"><span class="bars"></span><span>${esc(kicker)}</span></div>
    <h1>${inline(title)}</h1>
  </div>
</section>
<div class="wrap lec-layout">
${navHtml(out)}
<article class="doc">
${body}
</article>
</div>
</main>
<script src="../assets/js/icons.js"></script>
<script src="../assets/js/la.js"></script>
<script src="../assets/js/ui.js"></script>
</body>
</html>
`;
}

/* ---------- 1. article notes ---------- */
fs.mkdirSync(KIT, { recursive: true });
let made = 0;
const missing = [];
PAGES.forEach(p => {
  const file = path.join(ART, p.md);
  if (!fs.existsSync(file)) { missing.push(p.md); return; }
  const { html, title } = markdown(fs.readFileSync(file, 'utf8'));
  const kicker = /^notes-/.test(p.out) ? 'Article kit · lecture notes' : 'Article kit';
  fs.writeFileSync(path.join(KIT, p.out), page({ out: p.out, title: title || p.nav, kicker, body: html }));
  made++;
});

/* ---------- 2. code page ---------- */
const scripts = fs.existsSync(CODE) ? fs.readdirSync(CODE).filter(f => f.endsWith('.py')).sort((a, b) => (a === 'linalg.py' ? -1 : b === 'linalg.py' ? 1 : a.localeCompare(b))) : [];
let codeBody = '<p class="lead">One plain Python script per lecture. Each reproduces the lecture\'s worked examples and then the robot examples from the matching page, printing every number. They use only the standard library and the small from-scratch module <code>linalg.py</code>, so nothing needs installing.</p>' +
  '<pre><code>python3 code/l01_geometry.py</code></pre>' +
  '<p>Open a script to read its source and the exact output it prints. Numbers quoted in the lecture notes come from these outputs.</p>\n';
scripts.forEach(f => {
  const src = fs.readFileSync(path.join(CODE, f), 'utf8');
  const doc = (src.match(/^"""\s*\n?([^\n]+)/) || [])[1] || '';
  let output = '';
  if (f !== 'linalg.py') {
    try { output = execFileSync('python3', [path.join(CODE, f)], { cwd: ROOT, encoding: 'utf8', timeout: 60000 }); }
    catch (e) { output = 'This script failed to run:\n' + (e.stderr || e.message); console.error('  ! ' + f + ' failed'); }
  }
  codeBody += '<h2 id="' + f.replace(/\.py$/, '') + '">code/' + f + '</h2>\n<p>' + inline(doc.trim()) + '</p>\n' +
    '<details><summary>Source</summary><pre><code>' + esc(src) + '</code></pre></details>\n' +
    (output ? '<details open><summary>Output</summary><pre><code>' + esc(output.replace(/\s+$/, '')) + '</code></pre></details>\n' : '');
});
fs.writeFileSync(path.join(KIT, CODE_PAGE.out), page({ out: CODE_PAGE.out, title: 'Runnable code', kicker: 'Article kit', body: codeBody }));

/* ---------- 3. icons ---------- */
const ICON_DIR = path.join(ROOT, 'assets/icons');
fs.mkdirSync(ICON_DIR, { recursive: true });
Object.keys(ICONS).forEach(name => fs.writeFileSync(path.join(ICON_DIR, name + '.svg'), iconFile(name)));

/* ---------- 4. point lecture-page links at the kit ---------- */
let relinked = 0;
(process.argv.includes('--no-relink') ? [] : LECTURES).forEach(([n, slug]) => {
  const file = path.join(ROOT, slug + '.html');
  if (!fs.existsSync(file)) return;
  const before = fs.readFileSync(file, 'utf8');
  const after = before
    .replace(/href="article\/([^"#]+)\.md(#[^"]*)?"/g, (all, name, hash) => {
      const p = PAGES.find(q => q.md === name + '.md');
      return p ? 'href="kit/' + p.out + (hash || '') + '"' : all;
    })
    .replace(/href="code\/([^"#]+)\.py"/g, (all, name) => 'href="kit/code.html#' + name + '"');
  if (after !== before) { fs.writeFileSync(file, after); relinked++; }
});

console.log('kit pages: ' + made + (missing.length ? '  (missing sources: ' + missing.join(', ') + ')' : ''));
console.log('code scripts: ' + scripts.length + '   icons: ' + Object.keys(ICONS).length + '   lecture pages relinked: ' + relinked);
