/* Figure spec for Lecture 2. See tools/figures.js for how these are used.
   Each figure: file name, the lab to capture, an optional setup, and a caption.
   part: 'stage' (picture + equation, the default), 'canvas', 'main' (picture and controls) or 'lab'. */
module.exports = {
  page: '02-elimination-with-matrices.html',
  figures: [
    { file: 'l2-elimination-step', lab: 'lab-elim', setup: (p, lab, h) => h.step(2),
      caption: 'One step of elimination on the lecture’s system: row 2 − 3 × row 1. The pivot is circled, the pivot row is blue, the changed row is amber, and the matrix E21 that performs the step stands beside it.' },
    { file: 'l2-upper-triangular', lab: 'lab-elim', setup: (p, lab, h) => h.step(7),
      caption: 'Elimination finished: [A | b] has become the upper triangular [U | c], with the pivots 1, 2 and 5 on the diagonal and c = (2, 6, −10).' },
    { file: 'l2-back-substitution', lab: 'lab-elim', setup: (p, lab, h) => h.step(9),
      caption: 'Back-substitution works from the bottom up. Row 3 has already given z = −2, and row 2 now gives y = 1 because z is known.' },
    { file: 'l2-row-exchange', lab: 'lab-elim', setup: async (p, lab, h) => { await h.seg('swap'); await h.step(4); },
      caption: 'Temporary failure: with the 8 changed to a 6, a zero lands in the second pivot position. Rows 2 and 3 exchange, and the permutation matrix P23 records the exchange.' },
    { file: 'l2-singular', lab: 'lab-elim', part: 'main', setup: async (p, lab, h) => { await h.seg('singular'); await h.step('end'); },
      caption: 'Permanent failure, the lecture’s example: with −4 in the corner the third pivot position holds zero and no row is left to exchange in. The last row reads 0 = −10, so there is no solution.' },
    { file: 'l2-e21-clears-entry', lab: 'lab-emat',
      caption: 'An elimination step is a multiplication on the left. E21 is the identity with −3 in position (2,1); its second row takes −3 of row 1 plus one of row 2, which clears the entry.' },
    { file: 'l2-one-matrix-e', lab: 'lab-emat', setup: (p, lab, h) => h.seg('E'),
      caption: 'The associative law lets the two steps be multiplied first: E = E32 E21 is one matrix that takes A straight to U. The 6 in its corner shows that the steps have mixed.' },
    { file: 'l2-order-test', lab: 'lab-emat', setup: (p, lab, h) => h.seg('order'),
      caption: 'Matrix multiplication is not commutative. E32 E21 has a 6 in its corner and produces U; E21 E32 has a 0 there and leaves entries below the diagonal.' },
    { file: 'l2-undo-step', lab: 'lab-emat', setup: (p, lab, h) => h.seg('undo'),
      caption: 'A first inverse: adding 3 × row 1 back undoes subtracting it, so E21⁻¹ E21 is the identity and E21⁻¹ returns E21 A to A.' },
    { file: 'l2-permutation-rows', lab: 'lab-perm',
      caption: 'A permutation matrix on the left exchanges the rows of the matrix it multiplies. Each colour follows one row of A.' },
    { file: 'l2-permutation-columns', lab: 'lab-perm', setup: (p, lab, h) => h.seg('right'),
      caption: 'The same permutation matrix on the right exchanges columns instead. Row operations multiply on the left, column operations on the right.' },
    { file: 'l2-permutation-rescue', lab: 'lab-perm', setup: (p, lab, h) => h.seg('3'),
      caption: 'The row exchange that rescues elimination, written as a matrix: P23 moves the zero out of the second pivot position and leaves an upper triangular matrix.' },
    { file: 'l2-omni-odometry', lab: 'lab-omni', part: 'main', motion: true, settle: 2600,
      caption: 'Omni-wheel odometry. Three encoder readings form [A | s], elimination gives [U | c] with no row exchange, and back-substitution returns the body velocity that drives the robot round its circle.' },
    { file: 'l2-omni-row-exchange', lab: 'lab-omni', setup: (p, lab, h) => h.seg('swap'),
      caption: 'A natural zero pivot. With wheels at 0°, 120° and 240°, wheel 1 rolls along y and its row starts with 0, so elimination must exchange rows 1 and 2 before it can begin. The robot is healthy.' },
    { file: 'l2-omni-fragile', lab: 'lab-omni', part: 'main', setup: async (p, lab, h) => { await h.seg('fragile'); await h.button('Forward'); },
      caption: 'Nearly parallel wheels give a second pivot of only 0.14. The answer exists, but back-substitution divides by that small number, so encoder errors are magnified about six times more than in the healthy layout.' },
    { file: 'l2-omni-singular', lab: 'lab-omni', part: 'main', motion: true, settle: 900, setup: async (p, lab, h) => { await h.seg('parallel'); await h.button('Sideways'); },
      caption: 'A singular robot. With all wheels parallel the sideways column is all zeros, elimination finds no second pivot, and sliding sideways (the ghost) produces three zero readings, the same as standing still.' }
  ]
};
