/* Figure spec for Lecture 5. See tools/figures.js for how these are used.
   Each figure: file name, the lab to capture, an optional setup, and a caption.
   part: 'stage' (picture + equation, the default), 'canvas', 'main' (picture and controls), 'lab', or a CSS selector inside the lab. */
module.exports = {
  page: '05-transposes-permutations-spaces.html',
  figures: [
    { file: 'l5-row-exchange', lab: 'lab-pivot', part: '.stepper-view', setup: (p, lab, h) => h.step(1),
      caption: 'A zero sits in the first pivot position, so rows 1 and 2 change places (amber). The permutation matrix P on the left records the exchange while L waits for its multipliers.' },
    { file: 'l5-pa-equals-lu', lab: 'lab-pivot', part: '.stepper-view', setup: (p, lab, h) => h.step('end'),
      caption: 'The check at the end of elimination: P A and L U are the same matrix. With the rows in the right order, every invertible matrix factors as PA = LU.' },
    { file: 'l5-partial-pivoting', lab: 'lab-pivot', part: '.stepper-view',
      setup: async (p, lab, h) => { await h.seg('general'); await h.seg('partial'); await h.step(5); },
      caption: 'Partial pivoting on a matrix that needs no exchange on paper: the largest entry of the column, 4, is moved into the pivot position, and the multipliers already stored in L travel with their rows.' },
    { file: 'l5-tiny-pivot', lab: 'lab-digits',
      caption: 'The same two equations solved with three significant digits. Using 0.0001 as the pivot (left) rounds the second equation away and returns x = 0; exchanging the rows first (right) returns the correct x = 1.' },
    { file: 'l5-transpose-flipped', lab: 'lab-transpose', part: '.tr-top', setup: async (p, lab, h) => { await h.button('Flip'); await h.wait(900); },
      caption: 'The lecture\'s 3 by 2 matrix after the flip across its diagonal: the red column (1, 2, 4) has become the red row and the blue column (3, 3, 1) the blue row.' },
    { file: 'l5-symmetric-product', lab: 'lab-transpose', part: '.lab-math', setup: (p, lab, h) => h.seg('0,2'),
      caption: 'A matrix times its own transpose is always symmetric. The highlighted entries (1, 3) and (3, 1) are both 7 because each is row 1 dotted with row 3. These are the lecture\'s numbers.' },
    { file: 'l5-torque-worked', lab: 'lab-torque',
      caption: 'Force to torque through the transpose. The hand pushes up with 10 N (amber); each joint is 0.4 m to the side of that force, so each motor supplies 4 N·m, as the product of J transpose and F shows.' },
    { file: 'l5-torque-through-elbow', lab: 'lab-torque', part: 'canvas', setup: (p, lab, h) => h.seg('elbow'),
      caption: 'A force aimed along the forearm passes through the elbow, so the elbow motor needs no torque at all. The shoulder, 0.5 m from the line of the force (dotted red), carries everything.' },
    { file: 'l5-torque-straight-along', lab: 'lab-torque', part: 'canvas', setup: (p, lab, h) => h.seg('along'),
      caption: 'A straight arm pushing along its own length: the force line runs through both joints, both torque arcs are empty, and the links carry the load.' },
    { file: 'l5-torque-straight-across', lab: 'lab-torque', part: 'canvas', setup: (p, lab, h) => h.seg('across'),
      caption: 'The same straight arm and the same 10 N, turned to act across the arm: the lever arms are now 0.9 m and 0.4 m, and the motors must supply 9 and 4 N·m.' },
    { file: 'l5-subspace-line', lab: 'lab-subspace', part: 'canvas',
      caption: 'A line through the origin is a subspace: the sum v + w (amber) and the multiple c·v (green) both land back on the line, whatever v, w and c are.' },
    { file: 'l5-not-subspace-quadrant', lab: 'lab-subspace', part: 'canvas', setup: (p, lab, h) => h.seg('quad'),
      caption: 'The first quadrant is not a subspace. The sum v + w stays inside, but multiplying v by −1.5 throws it out through the corner (crossed ring). One-way thrusters have exactly this gap: no reverse.' },
    { file: 'l5-not-subspace-disc', lab: 'lab-subspace', part: 'canvas', setup: (p, lab, h) => h.seg('disc'),
      caption: 'A speed limit is a disc, and a disc is not a subspace: it contains the zero vector, yet both the sum and the multiple of allowed velocities end up outside it.' },
    { file: 'l5-rover-velocity-plane', lab: 'lab-velspace', part: 'main', motion: true, settle: 1700,
      caption: 'The velocity subspace of a two-wheel rover. Whatever the wheel speeds, the body velocity (amber dot) stays on the plane where the sideways speed is zero: the column space of the wheel matrix A.' },
    { file: 'l5-omni-fills-space', lab: 'lab-velspace', part: 'canvas', setup: (p, lab, h) => h.seg('omni'),
      caption: 'Add a sideways wheel and a third column (green) points out of the plane. Three independent columns reach every point of the space, so an omni robot can produce any body velocity.' },
    { file: 'l5-column-space-lecture', lab: 'lab-velspace', setup: (p, lab, h) => h.seg('lecture'),
      caption: 'The lecture\'s own column space: all combinations of (1, 2, 4) and (3, 3, 1) form a plane through the origin of three-dimensional space.' }
  ]
};
