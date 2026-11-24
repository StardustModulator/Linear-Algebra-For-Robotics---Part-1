/* Figure spec for Lecture 6. See tools/figures.js for how these are used.
   Each figure: file name, the lab to capture, an optional setup, and a caption.
   part: 'stage' (picture + equation, the default), 'canvas', 'main' (picture and controls) or 'lab'.
   Slider order inside each lab:
     lab-union      0, 1 the two entries of v     2 the multiple of w
     lab-colspace   0, 1, 2 the entries of x      3 the lift slider (test mode)
     lab-redundant  0, 1, 2 the joint angles      3 the self-motion speed
     lab-shifted    0 the position c              1 the size of b                      */
module.exports = {
  page: '06-column-space-and-nullspace.html',
  figures: [
    { file: 'l6-union-escapes', lab: 'lab-union',
      caption: 'The union of a plane and a line is not a subspace. The red vector v lies in the plane P and the blue vector w lies on the line L, but their amber sum is off the plane and off the line.' },
    { file: 'l6-intersection-line', lab: 'lab-union',
      setup: async (p, lab, h) => { await h.seg('in'); await h.slider(0, -1); await h.slider(1, 1.25); await h.slider(2, 1.25); },
      caption: 'When the line L is tilted down into the plane P, every sum stays in the plane and the intersection of the two subspaces grows from the zero vector to the whole line.' },
    { file: 'l6-colspace-build', lab: 'lab-colspace',
      caption: 'Building b = A x from the columns of the lecture matrix. The three columns (cut to their first three entries) lie in one plane, so every mix of them, the amber point b, stays on that plane: the column space.' },
    { file: 'l6-colspace-solvable', lab: 'lab-colspace',
      setup: async (p, lab, h) => { await h.seg('test'); await h.seg('c3'); },
      caption: 'Testing b = (2, 3, 4, 5). Elimination leaves two rows that read 0 = 0, so b is in the column space; the solution x = (1, 1, 0) says b is column 1 plus column 2.' },
    { file: 'l6-colspace-impossible', lab: 'lab-colspace',
      setup: async (p, lab, h) => { await h.seg('test'); await h.seg('out'); },
      caption: 'Testing b = (1, 0, 0, 0). Elimination ends with the rows 0 = 1 and 0 = 2, which no x can satisfy, and in the picture b hangs off the plane of the columns: it is outside the column space.' },
    { file: 'l6-colspace-lifted', lab: 'lab-colspace', part: 'main',
      setup: async (p, lab, h) => { await h.seg('test'); await h.seg('c1'); await h.slider(3, 2); },
      caption: 'Start from b = (1, 2, 3, 4), which is column 1, and raise its third entry by 2. The point leaves the plane, and the height of the gap is exactly the 2 that appears in the impossible row 0 = 2.' },
    { file: 'l6-arm-jacobian', lab: 'lab-redundant',
      caption: 'A three-link arm and its 2 by 3 Jacobian. The three arrows at the hand are the columns of J, one per joint; the vector beside J is a set of joint speeds that J sends to zero hand velocity, a vector in the nullspace.' },
    { file: 'l6-arm-self-motion', lab: 'lab-redundant', part: 'main', settle: 200,
      setup: async (p, lab, h) => { await h.button('Run self-motion'); await h.wait(2600); await h.button('Stop'); },
      caption: 'Self-motion. The joints have moved along the nullspace of J from the ghost pose: the elbow and wrist have swung along the dotted paths, and the readouts show the hand has moved 0.00 mm.' },
    { file: 'l6-arm-self-motion-far', lab: 'lab-redundant', part: 'canvas', settle: 200,
      setup: async (p, lab, h) => { await h.slider(3, 1); await h.button('Run self-motion'); await h.wait(3000); await h.button('Stop'); },
      caption: 'The same self-motion carried further. One hand position, a whole family of arm postures: this is what a redundant joint buys.' },
    { file: 'l6-arm-other-pose', lab: 'lab-redundant', settle: 200,
      setup: async (p, lab, h) => { await h.drag(0, [0.750, 0.592], [0.33, 0.36]); await h.button('Run self-motion'); await h.wait(2200); await h.button('Stop'); },
      caption: 'After the hand is dragged to a new place the Jacobian changes, and so does its nullspace: a different pose has a different self-motion.' },
    { file: 'l6-arm-straight', lab: 'lab-redundant', part: 'main',
      setup: async (p, lab, h) => { await h.button('Straighten'); await h.wait(300); },
      caption: 'The arm stretched out straight. All three columns of J are parallel, so the column space collapses to the dashed line (the hand can only move sideways) and the nullspace grows from a line to a plane.' },
    { file: 'l6-shifted-lines', lab: 'lab-shifted',
      caption: 'The solutions of A x = (1, 2, 3, 4) form the amber line. It is the blue nullspace line shifted by one particular solution (red arrow), so it misses the origin and is not a subspace.' },
    { file: 'l6-shifted-two-solutions', lab: 'lab-shifted', part: 'canvas',
      setup: async (p, lab, h) => { await h.slider(1, 2); await h.slider(0, 1.5); },
      caption: 'Doubling b doubles the shift. The point x on the amber line is always the point on the blue nullspace line plus the same red arrow.' },
    { file: 'l6-shifted-b-zero', lab: 'lab-shifted', part: 'canvas',
      setup: async (p, lab, h) => { await h.slider(1, 0); await h.slider(0, 1); },
      caption: 'Shrink b to zero and the solution line lands on the nullspace. The solutions of A x = b form a subspace only when b = 0.' }
  ]
};
