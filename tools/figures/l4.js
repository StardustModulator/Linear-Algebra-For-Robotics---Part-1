/* Figure spec for Lecture 4. See tools/figures.js for how these are used.
   Each figure: file name, the lab to capture, an optional setup, and a caption.
   part: 'stage' (picture + equation, the default), 'canvas', 'main' (picture and controls) or 'lab'. */
const pick = (lab, k, as) => lab.locator('.permcard[data-k="' + k + '"] button[data-as="' + as + '"]').click();
module.exports = {
  page: '04-factorization-into-a-lu.html',
  figures: [
    { file: 'l4-lu-2x2', lab: 'lab-lu', setup: (p, lab, h) => h.step(4),
      caption: 'A = LU for the lecture’s matrix [2 1; 8 7]: L holds the multiplier 4 under a diagonal of ones, and U holds the pivots 2 and 3.' },
    { file: 'l4-ldu-2x2', lab: 'lab-lu', setup: (p, lab, h) => h.seg('ldu'),
      caption: 'The same matrix as A = LDU: the pivots are pulled out into the diagonal matrix D, so that L and U both have ones on the diagonal.' },
    { file: 'l4-lu-3x3-midway', lab: 'lab-lu', setup: async (p, lab, h) => { await h.seg('m25'); await h.step(5); },
      caption: 'A 3 by 3 elimination part-way through: the multipliers 2 and 0 are already recorded in L, and the last one, 5, has just landed while row 3 of U was being finished.' },
    { file: 'l4-lu-rebuild', lab: 'lab-lu', setup: async (p, lab, h) => { await h.seg('m25'); await h.step(8); },
      caption: 'Multiplying back: each row of L is a recipe that rebuilds one row of A from finished rows of U, which is why every multiplier appears in L unchanged.' },
    { file: 'l4-e-against-l', lab: 'lab-lu', setup: async (p, lab, h) => { await h.seg('m25'); await h.step('end'); },
      caption: 'Why L is kept and E is not: E, which takes A to U, contains a 10 that no elimination step used, while L contains only the multipliers 2, 0 and 5.' },
    { file: 'l4-rover-two-moves', lab: 'lab-socks', part: 'canvas',
      caption: 'A rover drives move A (red) and then turns and drives move B (blue). The combined motion is the matrix product AB.' },
    { file: 'l4-rover-undo-right-order', lab: 'lab-socks', setup: (p, lab, h) => h.button('Undo B first'),
      caption: 'Undoing B first and then A retraces the path and brings the rover home: the product A B B⁻¹ A⁻¹ is the identity. This is (AB)⁻¹ = B⁻¹A⁻¹.' },
    { file: 'l4-rover-undo-wrong-order', lab: 'lab-socks', setup: (p, lab, h) => h.button('Undo A first'),
      caption: 'Undoing A first and then B uses two correct inverses in the wrong order. The rover ends 3.44 m from home (amber ring) and the product is not the identity.' },
    { file: 'l4-cost-bars', lab: 'lab-cost',
      caption: 'Work for n = 100 unknowns and 1,000 right-hand sides, drawn to one scale: 343,300,000 operations when elimination is repeated every time, 10,333,300 when A is factored once.' },
    { file: 'l4-cost-tick-budget', lab: 'lab-cost', part: 'main', setup: (p, lab, h) => h.seg('500'),
      caption: 'At n = 500 one solve from scratch costs about 41.9 million operations, against 250,000 with L and U stored: 2.4 control ticks a second against 400 at the assumed processor speed.' },
    { file: 'l4-spline-path', lab: 'lab-spline',
      caption: 'A natural cubic spline through seven waypoints. The tridiagonal matrix T holds only fours and ones; the waypoints appear only in the amber right-hand side, and the blue unknowns are the accelerations at the waypoints.' },
    { file: 'l4-spline-after-drag', lab: 'lab-spline', part: 'main', setup: (p, lab, h) => h.drag(0, [0.5385, 0.4692], [0.54, 0.31]),
      caption: 'One waypoint has been dragged upward. The path and the right-hand side changed, the matrix did not: the counter still shows a single LU factorization, with only the triangular solves repeated.' },
    { file: 'l4-spline-banded-factors', lab: 'lab-spline', part: '.lab-side',
      caption: 'Dot patterns of T = LU. T has three diagonals and its factors have two each, so a solve costs about 3n operations. The pivots settle at 2 + √3 ≈ 3.7321.' },
    { file: 'l4-permutations-order-matters', lab: 'lab-perms',
      caption: 'The six 3 by 3 permutation matrices, with an exchange chosen as P and a cycle as Q. The two products PQ and QP are different members of the six, and the wiring diagrams show three motors receiving their signals in different orders.' },
    { file: 'l4-permutations-inverse-transpose', lab: 'lab-perms', part: '.permout:nth-of-type(4)',
      setup: async (p, lab, h) => { await pick(lab, 4, 'a'); await pick(lab, 5, 'b'); },
      caption: 'For a permutation matrix the inverse is the transpose: Pᵀ P = I. The two cycles are transposes of each other, so each one undoes the other.' },
    { file: 'l4-permutations-group-table', lab: 'lab-perms', part: '.ptable',
      caption: 'All 36 products of the six permutation matrices. Every entry is again one of the six, which is what makes them a group; the table is not symmetric, because order matters.' }
  ]
};
