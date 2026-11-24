/* Figure spec for Lecture 3. See tools/figures.js for how these are used.
   Each figure: file name, the lab to capture, an optional setup, and a caption.
   part: 'stage' (picture + equation, the default), 'canvas', 'main' (picture and controls), 'lab', or a CSS selector inside the lab. */
module.exports = {
  page: '03-multiplication-and-inverse-matrices.html',
  figures: [
    { file: 'l3-entry-rule', lab: 'lab-ways', setup: (p, lab, h) => h.step('end'),
      caption: 'Way 1, one entry at a time: the bottom-right entry of C is row 3 of A times column 2 of B, 4·6 + 9·2 = 42.' },
    { file: 'l3-by-columns', lab: 'lab-ways', setup: async (p, lab, h) => { await h.seg('cols'); await h.step('end'); },
      caption: 'Way 2, a column at a time: column 2 of AB is 6 of the first column of A plus 2 of the second. Every column of AB is a combination of the columns of A.' },
    { file: 'l3-by-rows', lab: 'lab-ways', setup: async (p, lab, h) => { await h.seg('rows'); await h.step('end'); },
      caption: 'Way 3, a row at a time: row 3 of AB is 4 of the first row of B plus 9 of the second. Every row of AB is a combination of the rows of B.' },
    { file: 'l3-column-times-row', lab: 'lab-ways', setup: (p, lab, h) => h.seg('outer'),
      caption: 'A column times a row is a full matrix, and a very special one: every row is a multiple of [1 6] and every column is a multiple of (2, 3, 4). This is the lecture’s example.' },
    { file: 'l3-sum-of-pieces', lab: 'lab-ways', setup: async (p, lab, h) => { await h.seg('outer'); await h.step('end'); },
      caption: 'Way 4, columns times rows: AB is the sum of (column of A)(row of B), one special piece for each column of A.' },
    { file: 'l3-size-rule', lab: 'lab-ways', part: '.lab-side', setup: (p, lab, h) => h.slider(2, 3),
      caption: 'The size rule failing: a row of A holds 2 numbers and a column of B holds 3, so row times column cannot be formed and the product does not exist.' },
    { file: 'l3-arm-chain', lab: 'lab-chain',
      caption: 'Forward kinematics as a product. The three transforms multiply into the pose of the hand, and its columns are the hand’s x axis (red), y axis (blue) and position (amber).' },
    { file: 'l3-arm-chain-elbow', lab: 'lab-chain', setup: (p, lab, h) => h.seg('2'),
      caption: 'Stopping the product one matrix early gives the pose of link 2: the amber ring sits on the elbow. Each extra matrix on the right reaches one frame further down the arm.' },
    { file: 'l3-order-matters', lab: 'lab-order',
      caption: 'AB is not BA. Turn 90° then drive 2 m (red) ends at (0, 2). Drive then turn (blue) ends at (2, 0). The two products differ only in their position columns.' },
    { file: 'l3-order-commutes', lab: 'lab-order', setup: (p, lab, h) => h.slider(0, 0),
      caption: 'With no turn the two orders agree and the ≠ sign becomes =. A command that does nothing commutes with everything.' },
    { file: 'l3-gauss-jordan-step', lab: 'lab-gj', setup: (p, lab, h) => h.step(2),
      caption: 'Gauss-Jordan on the lecture’s matrix, first row step: subtracting 2 times row 1 from row 2 clears the entry under the pivot, and the right half records the step.' },
    { file: 'l3-gauss-jordan-done', lab: 'lab-gj', setup: (p, lab, h) => h.step(6),
      caption: 'Gauss-Jordan finished: the left half has become I, so the right half is the inverse, with rows (7, −3) and (−2, 1).' },
    { file: 'l3-gauss-jordan-singular', lab: 'lab-gj', setup: async (p, lab, h) => { await h.seg('singular'); await h.step('end'); },
      caption: 'The singular matrix [1 3; 2 6]: elimination finds no second pivot and stops. The reason is the non-zero vector (3, −1), which the matrix sends to zero.' },
    { file: 'l3-viewpoint', lab: 'lab-frames',
      caption: 'The inverse transform changes viewpoint. The map puts the landmark at (1, 4); seen from the rover at (3, 1) facing 90° it is 3 m ahead (red) and 2 m to the left (blue).' },
    { file: 'l3-viewpoint-turned', lab: 'lab-frames', setup: (p, lab, h) => h.slider(0, 30),
      caption: 'Turn the rover to 30° and the landmark has not moved on the map, but the rover’s view of it has: T⁻¹ now reports it almost directly to the left.' },
    { file: 'l3-flatten-invertible', lab: 'lab-flat', setup: async (p, lab, h) => { await h.slider(0, 0); await h.check(0, true); },
      caption: 'An invertible matrix. The unit arrows on the left become the columns of A on the right, the shape is turned and stretched, and A⁻¹ puts it back exactly (amber outline).' },
    { file: 'l3-flatten-nearly', lab: 'lab-flat', setup: async (p, lab, h) => { await h.slider(0, 0.9); await h.check(0, true); },
      caption: 'Nearly singular. The columns are 2° apart, the shape is a sliver, and the inverse needs entries as large as 11 to stretch it back: any small error would be magnified.' },
    { file: 'l3-flatten-singular', lab: 'lab-flat', setup: async (p, lab, h) => { await h.slider(0, 1); await h.check(0, true); },
      caption: 'Singular: A is now the lecture’s [1 3; 2 6]. The shape is flattened onto a line, P and Q land on the same point, x = (3, −1) goes to zero, and a whole line of inputs (amber) gives the same output.' }
  ]
};
