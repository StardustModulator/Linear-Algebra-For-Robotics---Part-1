/* Figure spec for Lecture 1. See tools/figures.js for how these are used.
   Each figure: file name, the lab to capture, an optional setup, and a caption.
   part: 'stage' (picture + equation, the default), 'canvas', 'main' (picture and controls) or 'lab'. */
module.exports = {
  page: '01-geometry-of-linear-equations.html',
  figures: [
    { file: 'l1-row-picture', lab: 'lab-rows', part: 'canvas',
      caption: 'Row picture of the lecture example: the lines 2x − y = 0 (red) and −x + 2y = 3 (blue) cross at the solution (1, 2).' },
    { file: 'l1-rows-parallel', lab: 'lab-rows', part: 'canvas', setup: (p, lab, h) => h.seg('parallel'),
      caption: 'Singular case one: parallel lines never meet, so the system has no solution.' },
    { file: 'l1-rows-same-line', lab: 'lab-rows', part: 'canvas', setup: (p, lab, h) => h.seg('same'),
      caption: 'Singular case two: the second equation repeats the first, so every point of the line is a solution.' },
    { file: 'l1-triangulation-wide', lab: 'lab-beacons', part: 'canvas', setup: (p, lab, h) => h.slider(0, 2),
      caption: 'Triangulation is the row picture. Each bearing puts the robot on a line; with a wide crossing, 2° of sensor error barely moves the computed position (amber ring).' },
    { file: 'l1-triangulation-thin', lab: 'lab-beacons', part: 'canvas',
      setup: async (p, lab, h) => { await h.slider(0, 2); await h.drag(0, [0.5696, 0.6855], [0.5, 0.34]); },
      caption: 'The same sensors with a thin crossing: the same 2° error now pushes the computed position (amber ring) well away from the robot. Nearly singular means fragile.' },
    { file: 'l1-column-picture', lab: 'lab-cols', setup: async (p, lab, h) => { await h.button('Show the answer'); await h.wait(900); },
      caption: 'Column picture of the same example: one red column plus two blue columns lands exactly on the target b = (0, 3).' },
    { file: 'l1-columns-parallel', lab: 'lab-cols', part: 'canvas', setup: (p, lab, h) => h.seg('parallel'),
      caption: 'Parallel columns: every combination stays on one line, so a target off that line cannot be reached.' },
    { file: 'l1-arm-columns', lab: 'lab-arm',
      caption: 'A two-link arm. The wanted hand velocity (amber) is built from the shoulder’s share (red) plus the elbow’s share (blue): the column picture of J q̇ = v.' },
    { file: 'l1-arm-singular', lab: 'lab-arm', setup: (p, lab, h) => h.slider(1, 0),
      caption: 'The arm stretched straight. Both column directions (dashed) coincide, so the hand cannot move along the arm: a singularity.' },
    { file: 'l1-ax-by-columns', lab: 'lab-mv', part: '.lab-math',
      caption: 'A times x by columns: the answer is a combination of the columns of A.' },
    { file: 'l1-ax-by-rows', lab: 'lab-mv', part: '.lab-math', setup: (p, lab, h) => h.seg('rows'),
      caption: 'A times x by rows: each entry of the answer is one row of A dotted with x.' },
    { file: 'l1-three-columns', lab: 'lab-3d', setup: async (p, lab, h) => { await h.button('Show the answer'); await h.wait(900); },
      caption: 'Three columns in space. The target b is the third column itself, so the solution is x = 0, y = 0, z = 1.' },
    { file: 'l1-thrusters-good', lab: 'lab-thrust', part: 'main', motion: true, settle: 1600, setup: (p, lab, h) => h.slider(2, 1),
      caption: 'Thrust allocation with a good layout: the three thruster columns fill (Fx, Fy, τ) space, so any push and turn can be produced.' },
    { file: 'l1-thrusters-singular', lab: 'lab-thrust', part: 'main', setup: async (p, lab, h) => { await h.seg('centre'); await h.slider(2, 1); },
      caption: 'All thrusters aimed through the centre: the columns lie in one plane (no torque), and a request to turn has no solution.' }
  ]
};
