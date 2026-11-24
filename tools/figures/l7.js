/* Figure spec for Lecture 7. See tools/figures.js for how these are used.
   Each figure: file name, the lab to capture, an optional setup, and a caption.
   part: 'stage' (picture + equation, the default), 'canvas', 'main' (picture and controls) or 'lab'. */
module.exports = {
  page: '07-solving-ax-equals-0.html',
  figures: [
    { file: 'l7-free-column', lab: 'lab-rref', setup: (p, lab, h) => h.step(4),
      caption: 'Elimination on the lecture’s 3 by 4 matrix reaches column 2 and finds only zeros at and below the pivot position. The column gets no pivot, is marked free (blue), and elimination moves right instead of stopping.' },
    { file: 'l7-echelon-form', lab: 'lab-rref', setup: (p, lab, h) => h.step(8),
      caption: 'The echelon form U of the lecture’s matrix. Two circled pivots give rank 2; pivot columns 1 and 3 are red, free columns 2 and 4 are blue, and the zero row records that row 3 was row 1 plus row 2.' },
    { file: 'l7-reduced-form-and-nullspace', lab: 'lab-rref', setup: (p, lab, h) => h.step('end'),
      caption: 'The reduced row echelon form R beside the nullspace matrix N. The free columns of R, with their signs flipped, fill the pivot rows of N, so the special solutions (−2, 1, 0, 0) and (2, 0, −2, 1) are read off without any calculation.' },
    { file: 'l7-transpose-row-exchange', lab: 'lab-rref', setup: async (p, lab, h) => { await h.seg('transpose'); await h.step(5); },
      caption: 'The lecture’s second example, the transpose. A zero sits in the pivot position of column 2 but a non-zero entry lies below it, so a row exchange (amber rows) rescues the pivot. A column is free only when everything at and below the pivot position is zero.' },
    { file: 'l7-arm-jacobian-reduced', lab: 'lab-rref', setup: async (p, lab, h) => { await h.seg('arm'); await h.step('end'); },
      caption: 'The Jacobian of a four-joint arm in its staircase pose, reduced to R. Two pivots mean the hand can move in every direction on the table; the two free columns give two special solutions, the arm’s two basic self-motions.' },
    { file: 'l7-special-solution', lab: 'lab-special',
      caption: 'Building special solution 1 by hand. The free variables are set to x₂ = 1 and x₄ = 0 (blue); back-substitution forces the pivot variables x₃ = 0 and x₁ = −2 (red); and that mix of the columns of A adds up to zero.' },
    { file: 'l7-free-variables-mix', lab: 'lab-special', setup: async (p, lab, h) => { await h.slider(0, 3); await h.slider(1, -1); },
      caption: 'Any choice of the free variables gives a solution. With x₂ = 3 and x₄ = −1 the result (−8, 3, 2, −1) is 3 of the first special solution minus 1 of the second: the free variables are the mixing amounts.' },
    { file: 'l7-arm-pivot-and-free-joints', lab: 'lab-arm4',
      caption: 'A four-joint arm in the staircase pose. Elimination on its 2 by 4 Jacobian makes joints 1 and 2 the pivot joints (red) and leaves joints 3 and 4 free (blue): rank 2, with two joints to spare.' },
    { file: 'l7-arm-self-motion', lab: 'lab-arm4', motion: true, settle: 2600, setup: (p, lab, h) => h.slider(4, -0.5),
      caption: 'Special solution 1 in motion. Free joint 3 leads, pivot joints 1 and 2 counter-turn as R dictates, and the hand stays on the amber ring while the arm leaves its starting shape (grey).' },
    { file: 'l7-arm-singular', lab: 'lab-arm4', setup: async (p, lab, h) => { await h.seg('straight'); await h.wait(400); },
      caption: 'The arm stretched straight. All four columns of J are parallel, so only one pivot survives: the rank drops to 1, three joints are free, and the hand has lost the direction along the arm. A singularity is a drop in rank.' },
    { file: 'l7-thrusters-free-at-zero', lab: 'lab-thrust4', part: 'main', motion: true, settle: 1500, setup: async (p, lab, h) => { await h.slider(0, 0); await h.slider(1, 1); },
      caption: 'Four thrusters, three jobs. A 1 N side push solved with the free thruster T4 held at zero: the bow thruster pushes and the two propellers fight each other to cancel the twist, 3 N of thrust in all.' },
    { file: 'l7-thrusters-least-effort', lab: 'lab-thrust4', part: 'main', motion: true, settle: 1500,
      setup: async (p, lab, h) => { await h.slider(0, 0); await h.slider(1, 1); await h.button('Least effort'); await h.wait(900); },
      caption: 'The same side push after adding half of the special solution s = (−2, −1, 2, 1). The net force and torque are unchanged because B s = 0, but the two side thrusters now share the work and the total thrust falls from 3 N to 1 N.' },
    { file: 'l7-thrusters-one-failed', lab: 'lab-thrust4', part: 'main', motion: true, settle: 1200,
      setup: async (p, lab, h) => { await h.slider(0, 0); await h.slider(1, 1); await h.check(3, true); },
      caption: 'Thruster T4 has failed, which deletes its column. The remaining 3 by 3 matrix still has rank 3, so full control survives, but there is no free variable left: the costly 3 N answer is now the only one.' },
    { file: 'l7-thrusters-two-failed', lab: 'lab-thrust4', part: 'main', setup: async (p, lab, h) => { await h.check(0, true); await h.check(2, true); },
      caption: 'Both propellers have failed. Two columns can hold at most two pivots, so the rank is 2 and a direction is lost: no setting of the side thrusters produces the forward push that is being asked for.' },
    { file: 'l7-thruster-without-backup', lab: 'lab-thrust4', part: 'main', setup: async (p, lab, h) => { await h.seg('row'); await h.slider(1, 0.5); await h.check(3, true); },
      caption: 'A layout whose special solution is (1, −2, 1, 0). The zero entry marks T4 as the thruster with no understudy: when it fails the rank drops to 2 at once, while any one of the other three could have been lost safely.' },
    { file: 'l7-rank-of-transpose', lab: 'lab-rank',
      caption: 'The lecture’s matrix and its transpose, each reduced to echelon form. The pivots sit in different places but there are two in both: A and Aᵀ always have the same rank, here with 2 and 1 free variables.' }
  ]
};
