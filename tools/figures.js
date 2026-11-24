#!/usr/bin/env node
/* ==========================================================================
   tools/figures.js: captures article-ready pictures of the labs.

       node tools/figures.js            every lecture
       node tools/figures.js 1 4        only lectures 1 and 4

   Each lecture has a spec in tools/figures/l<N>.js that lists its figures:
   which lab, what to click or drag first, and a caption. The pictures are
   saved at double resolution in article/figures/, and article/figures.md is
   rewritten as a captioned gallery of all of them.

   Needs Playwright with Chromium (npm i playwright). Nothing else.
   ========================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const SPEC_DIR = path.join(__dirname, 'figures');
const OUT = path.join(ROOT, 'article', 'figures');
const TITLES = {
  1: 'The Geometry of Linear Equations', 2: 'Elimination with Matrices', 3: 'Multiplication and Inverse Matrices',
  4: 'Factorization into A = LU', 5: 'Transposes, Permutations, Spaces Rⁿ', 6: 'Column Space and Nullspace',
  7: 'Solving Ax = 0', 8: 'Capstone: one robot, seven lectures'
};

/* small helpers handed to every figure's setup(page, lab, h) */
function helpers(page, lab) {
  const h = {
    wait: ms => page.waitForTimeout(ms),
    /* click a segmented-control button by its data-v value, inside this lab */
    seg: async v => { await lab.locator('.seg button[data-v="' + v + '"]').first().click(); },
    /* click a button by its visible text, inside this lab */
    button: async text => { await lab.locator('.btn', { hasText: text }).first().click(); },
    /* set the k-th slider of this lab (0-based) to a value */
    slider: async (k, value) => {
      await lab.locator('input[type=range]').nth(k).evaluate((el, v) => {
        el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
      }, value);
    },
    /* type into a number input chosen by CSS selector inside this lab */
    fill: async (sel, value) => { await lab.locator(sel).first().fill(String(value)); },
    check: async (k, on) => { const c = lab.locator('input[type=checkbox]').nth(k); if ((await c.isChecked()) !== on) await c.click(); },
    /* drag on the k-th canvas of this lab; points are fractions of its width and height, from the top-left */
    drag: async (k, from, to) => {
      const cv = lab.locator('canvas').nth(k);
      await cv.scrollIntoViewIfNeeded();
      const b = await cv.boundingBox();
      const p = f => [b.x + f[0] * b.width, b.y + f[1] * b.height];
      const [a, z] = [p(from), p(to)];
      await page.mouse.move(a[0], a[1]); await page.mouse.down();
      await page.mouse.move((a[0] + z[0]) / 2, (a[1] + z[1]) / 2, { steps: 6 });
      await page.mouse.move(z[0], z[1], { steps: 6 }); await page.mouse.up();
    },
    /* press "Next step" on this lab's stepper n times (or to the end with n = 'end') */
    step: async n => {
      const next = lab.locator('.stepper .btn.primary').first();
      for (let i = 0; i < (n === 'end' ? 200 : n); i++) { if (await next.isDisabled()) break; await next.click(); }
    }
  };
  return h;
}

(async () => {
  const only = process.argv.slice(2).map(Number).filter(Boolean);
  const specs = fs.readdirSync(SPEC_DIR).filter(f => /^l\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))
    .map(f => Object.assign({ n: parseInt(f.slice(1), 10) }, require(path.join(SPEC_DIR, f))));
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  let made = 0, failed = 0;

  for (const spec of specs) {
    if (only.length && !only.includes(spec.n)) continue;
    for (const fig of spec.figures) {
      const ctx = await browser.newContext({ viewport: { width: fig.width || 1180, height: 950 }, deviceScaleFactor: 2, colorScheme: 'light', reducedMotion: fig.motion ? 'no-preference' : 'reduce' });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      try {
        await page.goto('file://' + path.join(ROOT, spec.page));
        await page.waitForTimeout(700);
        const lab = page.locator('#' + fig.lab);
        await lab.scrollIntoViewIfNeeded();
        if (fig.setup) await fig.setup(page, lab, helpers(page, lab));
        await page.waitForTimeout(fig.settle === undefined ? 500 : fig.settle);
        const part = fig.part || 'stage';
        const target = part === 'lab' ? lab : part === 'canvas' ? lab.locator('canvas').first() : part === 'main' ? lab.locator('.lab-main') : part === 'stage' ? lab.locator('.lab-stage') : lab.locator(part).first();
        /* hide the sticky top bar so it never covers the picture */
        await page.addStyleTag({ content: '.topbar{display:none!important}' });
        await target.scrollIntoViewIfNeeded();
        await target.screenshot({ path: path.join(OUT, fig.file + '.png') });
        if (errors.length) throw new Error(errors[0]);
        made++;
      } catch (e) {
        failed++;
        console.error('  ! ' + fig.file + ': ' + e.message.split('\n')[0]);
      }
      await ctx.close();
    }
  }
  await browser.close();

  /* gallery of everything that exists on disk, in spec order */
  let md = '# Figure pack\n\n> Ready-made pictures of the labs for use in the article. Each one is a capture of an interactive lab in a chosen state, saved at double resolution in `article/figures/`. To change one, edit its entry in `tools/figures/` and run `node tools/figures.js`.\n\n';
  md += 'Every picture shows the lab exactly as the page draws it, so the colours keep their meaning: red and blue for the first and second vector or row, amber for targets and results, green for a third series.\n';
  for (const spec of specs) {
    const have = spec.figures.filter(f => fs.existsSync(path.join(OUT, f.file + '.png')));
    if (!have.length) continue;
    md += '\n## ' + (spec.n <= 7 ? 'Lecture ' + spec.n + ' · ' : '') + TITLES[spec.n] + '\n\n';
    for (const f of have) md += '![' + f.caption.replace(/[\[\]]/g, '') + '](figures/' + f.file + '.png)\n\n';
  }
  fs.writeFileSync(path.join(ROOT, 'article', 'figures.md'), md);
  console.log('figures written: ' + made + (failed ? '   failed: ' + failed : ''));
  process.exit(failed ? 1 : 0);
})();
