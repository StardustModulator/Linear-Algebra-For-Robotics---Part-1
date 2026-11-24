# Figure pack

> Ready-made pictures of the labs for use in the article. Each one is a capture of an interactive lab in a chosen state, saved at double resolution in `article/figures/`. To change one, edit its entry in `tools/figures/` and run `node tools/figures.js`.

Every picture shows the lab exactly as the page draws it, so the colours keep their meaning: red and blue for the first and second vector or row, amber for targets and results, green for a third series.

## Lecture 1 · The Geometry of Linear Equations

![Row picture of the lecture example: the lines 2x − y = 0 (red) and −x + 2y = 3 (blue) cross at the solution (1, 2).](figures/l1-row-picture.png)

![Singular case one: parallel lines never meet, so the system has no solution.](figures/l1-rows-parallel.png)

![Singular case two: the second equation repeats the first, so every point of the line is a solution.](figures/l1-rows-same-line.png)

![Triangulation is the row picture. Each bearing puts the robot on a line; with a wide crossing, 2° of sensor error barely moves the computed position (amber ring).](figures/l1-triangulation-wide.png)

![The same sensors with a thin crossing: the same 2° error now pushes the computed position (amber ring) well away from the robot. Nearly singular means fragile.](figures/l1-triangulation-thin.png)

![Column picture of the same example: one red column plus two blue columns lands exactly on the target b = (0, 3).](figures/l1-column-picture.png)

![Parallel columns: every combination stays on one line, so a target off that line cannot be reached.](figures/l1-columns-parallel.png)

![A two-link arm. The wanted hand velocity (amber) is built from the shoulder’s share (red) plus the elbow’s share (blue): the column picture of J q̇ = v.](figures/l1-arm-columns.png)

![The arm stretched straight. Both column directions (dashed) coincide, so the hand cannot move along the arm: a singularity.](figures/l1-arm-singular.png)

![A times x by columns: the answer is a combination of the columns of A.](figures/l1-ax-by-columns.png)

![A times x by rows: each entry of the answer is one row of A dotted with x.](figures/l1-ax-by-rows.png)

![Three columns in space. The target b is the third column itself, so the solution is x = 0, y = 0, z = 1.](figures/l1-three-columns.png)

![Thrust allocation with a good layout: the three thruster columns fill (Fx, Fy, τ) space, so any push and turn can be produced.](figures/l1-thrusters-good.png)

![All thrusters aimed through the centre: the columns lie in one plane (no torque), and a request to turn has no solution.](figures/l1-thrusters-singular.png)

