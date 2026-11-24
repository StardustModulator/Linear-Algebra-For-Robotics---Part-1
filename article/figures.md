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


## Lecture 2 · Elimination with Matrices

![One step of elimination on the lecture’s system: row 2 − 3 × row 1. The pivot is circled, the pivot row is blue, the changed row is amber, and the matrix E21 that performs the step stands beside it.](figures/l2-elimination-step.png)

![Elimination finished: A | b has become the upper triangular U | c, with the pivots 1, 2 and 5 on the diagonal and c = (2, 6, −10).](figures/l2-upper-triangular.png)

![Back-substitution works from the bottom up. Row 3 has already given z = −2, and row 2 now gives y = 1 because z is known.](figures/l2-back-substitution.png)

![Temporary failure: with the 8 changed to a 6, a zero lands in the second pivot position. Rows 2 and 3 exchange, and the permutation matrix P23 records the exchange.](figures/l2-row-exchange.png)

![Permanent failure, the lecture’s example: with −4 in the corner the third pivot position holds zero and no row is left to exchange in. The last row reads 0 = −10, so there is no solution.](figures/l2-singular.png)

![An elimination step is a multiplication on the left. E21 is the identity with −3 in position (2,1); its second row takes −3 of row 1 plus one of row 2, which clears the entry.](figures/l2-e21-clears-entry.png)

![The associative law lets the two steps be multiplied first: E = E32 E21 is one matrix that takes A straight to U. The 6 in its corner shows that the steps have mixed.](figures/l2-one-matrix-e.png)

![Matrix multiplication is not commutative. E32 E21 has a 6 in its corner and produces U; E21 E32 has a 0 there and leaves entries below the diagonal.](figures/l2-order-test.png)

![A first inverse: adding 3 × row 1 back undoes subtracting it, so E21⁻¹ E21 is the identity and E21⁻¹ returns E21 A to A.](figures/l2-undo-step.png)

![A permutation matrix on the left exchanges the rows of the matrix it multiplies. Each colour follows one row of A.](figures/l2-permutation-rows.png)

![The same permutation matrix on the right exchanges columns instead. Row operations multiply on the left, column operations on the right.](figures/l2-permutation-columns.png)

![The row exchange that rescues elimination, written as a matrix: P23 moves the zero out of the second pivot position and leaves an upper triangular matrix.](figures/l2-permutation-rescue.png)

![Omni-wheel odometry. Three encoder readings form A | s, elimination gives U | c with no row exchange, and back-substitution returns the body velocity that drives the robot round its circle.](figures/l2-omni-odometry.png)

![A natural zero pivot. With wheels at 0°, 120° and 240°, wheel 1 rolls along y and its row starts with 0, so elimination must exchange rows 1 and 2 before it can begin. The robot is healthy.](figures/l2-omni-row-exchange.png)

![Nearly parallel wheels give a second pivot of only 0.14. The answer exists, but back-substitution divides by that small number, so encoder errors are magnified about six times more than in the healthy layout.](figures/l2-omni-fragile.png)

![A singular robot. With all wheels parallel the sideways column is all zeros, elimination finds no second pivot, and sliding sideways (the ghost) produces three zero readings, the same as standing still.](figures/l2-omni-singular.png)


## Lecture 3 · Multiplication and Inverse Matrices

![Way 1, one entry at a time: the bottom-right entry of C is row 3 of A times column 2 of B, 4·6 + 9·2 = 42.](figures/l3-entry-rule.png)

![Way 2, a column at a time: column 2 of AB is 6 of the first column of A plus 2 of the second. Every column of AB is a combination of the columns of A.](figures/l3-by-columns.png)

![Way 3, a row at a time: row 3 of AB is 4 of the first row of B plus 9 of the second. Every row of AB is a combination of the rows of B.](figures/l3-by-rows.png)

![A column times a row is a full matrix, and a very special one: every row is a multiple of 1 6 and every column is a multiple of (2, 3, 4). This is the lecture’s example.](figures/l3-column-times-row.png)

![Way 4, columns times rows: AB is the sum of (column of A)(row of B), one special piece for each column of A.](figures/l3-sum-of-pieces.png)

![The size rule failing: a row of A holds 2 numbers and a column of B holds 3, so row times column cannot be formed and the product does not exist.](figures/l3-size-rule.png)

![Forward kinematics as a product. The three transforms multiply into the pose of the hand, and its columns are the hand’s x axis (red), y axis (blue) and position (amber).](figures/l3-arm-chain.png)

![Stopping the product one matrix early gives the pose of link 2: the amber ring sits on the elbow. Each extra matrix on the right reaches one frame further down the arm.](figures/l3-arm-chain-elbow.png)

![AB is not BA. Turn 90° then drive 2 m (red) ends at (0, 2). Drive then turn (blue) ends at (2, 0). The two products differ only in their position columns.](figures/l3-order-matters.png)

![With no turn the two orders agree and the ≠ sign becomes =. A command that does nothing commutes with everything.](figures/l3-order-commutes.png)

![Gauss-Jordan on the lecture’s matrix, first row step: subtracting 2 times row 1 from row 2 clears the entry under the pivot, and the right half records the step.](figures/l3-gauss-jordan-step.png)

![Gauss-Jordan finished: the left half has become I, so the right half is the inverse, with rows (7, −3) and (−2, 1).](figures/l3-gauss-jordan-done.png)

![The singular matrix 1 3; 2 6: elimination finds no second pivot and stops. The reason is the non-zero vector (3, −1), which the matrix sends to zero.](figures/l3-gauss-jordan-singular.png)

![The inverse transform changes viewpoint. The map puts the landmark at (1, 4); seen from the rover at (3, 1) facing 90° it is 3 m ahead (red) and 2 m to the left (blue).](figures/l3-viewpoint.png)

![Turn the rover to 30° and the landmark has not moved on the map, but the rover’s view of it has: T⁻¹ now reports it almost directly to the left.](figures/l3-viewpoint-turned.png)

![An invertible matrix. The unit arrows on the left become the columns of A on the right, the shape is turned and stretched, and A⁻¹ puts it back exactly (amber outline).](figures/l3-flatten-invertible.png)

![Nearly singular. The columns are 2° apart, the shape is a sliver, and the inverse needs entries as large as 11 to stretch it back: any small error would be magnified.](figures/l3-flatten-nearly.png)

![Singular: A is now the lecture’s 1 3; 2 6. The shape is flattened onto a line, P and Q land on the same point, x = (3, −1) goes to zero, and a whole line of inputs (amber) gives the same output.](figures/l3-flatten-singular.png)


## Lecture 4 · Factorization into A = LU

![A = LU for the lecture’s matrix 2 1; 8 7: L holds the multiplier 4 under a diagonal of ones, and U holds the pivots 2 and 3.](figures/l4-lu-2x2.png)

![The same matrix as A = LDU: the pivots are pulled out into the diagonal matrix D, so that L and U both have ones on the diagonal.](figures/l4-ldu-2x2.png)

![A 3 by 3 elimination part-way through: the multipliers 2 and 0 are already recorded in L, and the last one, 5, has just landed while row 3 of U was being finished.](figures/l4-lu-3x3-midway.png)

![Multiplying back: each row of L is a recipe that rebuilds one row of A from finished rows of U, which is why every multiplier appears in L unchanged.](figures/l4-lu-rebuild.png)

![Why L is kept and E is not: E, which takes A to U, contains a 10 that no elimination step used, while L contains only the multipliers 2, 0 and 5.](figures/l4-e-against-l.png)

![A rover drives move A (red) and then turns and drives move B (blue). The combined motion is the matrix product AB.](figures/l4-rover-two-moves.png)

![Undoing B first and then A retraces the path and brings the rover home: the product A B B⁻¹ A⁻¹ is the identity. This is (AB)⁻¹ = B⁻¹A⁻¹.](figures/l4-rover-undo-right-order.png)

![Undoing A first and then B uses two correct inverses in the wrong order. The rover ends 3.44 m from home (amber ring) and the product is not the identity.](figures/l4-rover-undo-wrong-order.png)

![Work for n = 100 unknowns and 1,000 right-hand sides, drawn to one scale: 343,300,000 operations when elimination is repeated every time, 10,333,300 when A is factored once.](figures/l4-cost-bars.png)

![At n = 500 one solve from scratch costs about 41.9 million operations, against 250,000 with L and U stored: 2.4 control ticks a second against 400 at the assumed processor speed.](figures/l4-cost-tick-budget.png)

![A natural cubic spline through seven waypoints. The tridiagonal matrix T holds only fours and ones; the waypoints appear only in the amber right-hand side, and the blue unknowns are the accelerations at the waypoints.](figures/l4-spline-path.png)

![One waypoint has been dragged upward. The path and the right-hand side changed, the matrix did not: the counter still shows a single LU factorization, with only the triangular solves repeated.](figures/l4-spline-after-drag.png)

![Dot patterns of T = LU. T has three diagonals and its factors have two each, so a solve costs about 3n operations. The pivots settle at 2 + √3 ≈ 3.7321.](figures/l4-spline-banded-factors.png)

![The six 3 by 3 permutation matrices, with an exchange chosen as P and a cycle as Q. The two products PQ and QP are different members of the six, and the wiring diagrams show three motors receiving their signals in different orders.](figures/l4-permutations-order-matters.png)

![For a permutation matrix the inverse is the transpose: Pᵀ P = I. The two cycles are transposes of each other, so each one undoes the other.](figures/l4-permutations-inverse-transpose.png)

![All 36 products of the six permutation matrices. Every entry is again one of the six, which is what makes them a group; the table is not symmetric, because order matters.](figures/l4-permutations-group-table.png)


## Lecture 5 · Transposes, Permutations, Spaces Rⁿ

![A zero sits in the first pivot position, so rows 1 and 2 change places (amber). The permutation matrix P on the left records the exchange while L waits for its multipliers.](figures/l5-row-exchange.png)

![The check at the end of elimination: P A and L U are the same matrix. With the rows in the right order, every invertible matrix factors as PA = LU.](figures/l5-pa-equals-lu.png)

![Partial pivoting on a matrix that needs no exchange on paper: the largest entry of the column, 4, is moved into the pivot position, and the multipliers already stored in L travel with their rows.](figures/l5-partial-pivoting.png)

![The same two equations solved with three significant digits. Using 0.0001 as the pivot (left) rounds the second equation away and returns x = 0; exchanging the rows first (right) returns the correct x = 1.](figures/l5-tiny-pivot.png)

![The lecture's 3 by 2 matrix after the flip across its diagonal: the red column (1, 2, 4) has become the red row and the blue column (3, 3, 1) the blue row.](figures/l5-transpose-flipped.png)

![A matrix times its own transpose is always symmetric. The highlighted entries (1, 3) and (3, 1) are both 7 because each is row 1 dotted with row 3. These are the lecture's numbers.](figures/l5-symmetric-product.png)

![Force to torque through the transpose. The hand pushes up with 10 N (amber); each joint is 0.4 m to the side of that force, so each motor supplies 4 N·m, as the product of J transpose and F shows.](figures/l5-torque-worked.png)

![A force aimed along the forearm passes through the elbow, so the elbow motor needs no torque at all. The shoulder, 0.5 m from the line of the force (dotted red), carries everything.](figures/l5-torque-through-elbow.png)

![A straight arm pushing along its own length: the force line runs through both joints, both torque arcs are empty, and the links carry the load.](figures/l5-torque-straight-along.png)

![The same straight arm and the same 10 N, turned to act across the arm: the lever arms are now 0.9 m and 0.4 m, and the motors must supply 9 and 4 N·m.](figures/l5-torque-straight-across.png)

![A line through the origin is a subspace: the sum v + w (amber) and the multiple c·v (green) both land back on the line, whatever v, w and c are.](figures/l5-subspace-line.png)

![The first quadrant is not a subspace. The sum v + w stays inside, but multiplying v by −1.5 throws it out through the corner (crossed ring). One-way thrusters have exactly this gap: no reverse.](figures/l5-not-subspace-quadrant.png)

![A speed limit is a disc, and a disc is not a subspace: it contains the zero vector, yet both the sum and the multiple of allowed velocities end up outside it.](figures/l5-not-subspace-disc.png)

![The velocity subspace of a two-wheel rover. Whatever the wheel speeds, the body velocity (amber dot) stays on the plane where the sideways speed is zero: the column space of the wheel matrix A.](figures/l5-rover-velocity-plane.png)

![Add a sideways wheel and a third column (green) points out of the plane. Three independent columns reach every point of the space, so an omni robot can produce any body velocity.](figures/l5-omni-fills-space.png)

![The lecture's own column space: all combinations of (1, 2, 4) and (3, 3, 1) form a plane through the origin of three-dimensional space.](figures/l5-column-space-lecture.png)


## Lecture 6 · Column Space and Nullspace

![The union of a plane and a line is not a subspace. The red vector v lies in the plane P and the blue vector w lies on the line L, but their amber sum is off the plane and off the line.](figures/l6-union-escapes.png)

![When the line L is tilted down into the plane P, every sum stays in the plane and the intersection of the two subspaces grows from the zero vector to the whole line.](figures/l6-intersection-line.png)

![Building b = A x from the columns of the lecture matrix. The three columns (cut to their first three entries) lie in one plane, so every mix of them, the amber point b, stays on that plane: the column space.](figures/l6-colspace-build.png)

![Testing b = (2, 3, 4, 5). Elimination leaves two rows that read 0 = 0, so b is in the column space; the solution x = (1, 1, 0) says b is column 1 plus column 2.](figures/l6-colspace-solvable.png)

![Testing b = (1, 0, 0, 0). Elimination ends with the rows 0 = 1 and 0 = 2, which no x can satisfy, and in the picture b hangs off the plane of the columns: it is outside the column space.](figures/l6-colspace-impossible.png)

![Start from b = (1, 2, 3, 4), which is column 1, and raise its third entry by 2. The point leaves the plane, and the height of the gap is exactly the 2 that appears in the impossible row 0 = 2.](figures/l6-colspace-lifted.png)

![A three-link arm and its 2 by 3 Jacobian. The three arrows at the hand are the columns of J, one per joint; the vector beside J is a set of joint speeds that J sends to zero hand velocity, a vector in the nullspace.](figures/l6-arm-jacobian.png)

![Self-motion. The joints have moved along the nullspace of J from the ghost pose: the elbow and wrist have swung along the dotted paths, and the readouts show the hand has moved 0.00 mm.](figures/l6-arm-self-motion.png)

![The same self-motion carried further. One hand position, a whole family of arm postures: this is what a redundant joint buys.](figures/l6-arm-self-motion-far.png)

![After the hand is dragged to a new place the Jacobian changes, and so does its nullspace: a different pose has a different self-motion.](figures/l6-arm-other-pose.png)

![The arm stretched out straight. All three columns of J are parallel, so the column space collapses to the dashed line (the hand can only move sideways) and the nullspace grows from a line to a plane.](figures/l6-arm-straight.png)

![The solutions of A x = (1, 2, 3, 4) form the amber line. It is the blue nullspace line shifted by one particular solution (red arrow), so it misses the origin and is not a subspace.](figures/l6-shifted-lines.png)

![Doubling b doubles the shift. The point x on the amber line is always the point on the blue nullspace line plus the same red arrow.](figures/l6-shifted-two-solutions.png)

![Shrink b to zero and the solution line lands on the nullspace. The solutions of A x = b form a subspace only when b = 0.](figures/l6-shifted-b-zero.png)


## Lecture 7 · Solving Ax = 0

![Elimination on the lecture’s 3 by 4 matrix reaches column 2 and finds only zeros at and below the pivot position. The column gets no pivot, is marked free (blue), and elimination moves right instead of stopping.](figures/l7-free-column.png)

![The echelon form U of the lecture’s matrix. Two circled pivots give rank 2; pivot columns 1 and 3 are red, free columns 2 and 4 are blue, and the zero row records that row 3 was row 1 plus row 2.](figures/l7-echelon-form.png)

![The reduced row echelon form R beside the nullspace matrix N. The free columns of R, with their signs flipped, fill the pivot rows of N, so the special solutions (−2, 1, 0, 0) and (2, 0, −2, 1) are read off without any calculation.](figures/l7-reduced-form-and-nullspace.png)

![The lecture’s second example, the transpose. A zero sits in the pivot position of column 2 but a non-zero entry lies below it, so a row exchange (amber rows) rescues the pivot. A column is free only when everything at and below the pivot position is zero.](figures/l7-transpose-row-exchange.png)

![The Jacobian of a four-joint arm in its staircase pose, reduced to R. Two pivots mean the hand can move in every direction on the table; the two free columns give two special solutions, the arm’s two basic self-motions.](figures/l7-arm-jacobian-reduced.png)

![Building special solution 1 by hand. The free variables are set to x₂ = 1 and x₄ = 0 (blue); back-substitution forces the pivot variables x₃ = 0 and x₁ = −2 (red); and that mix of the columns of A adds up to zero.](figures/l7-special-solution.png)

![Any choice of the free variables gives a solution. With x₂ = 3 and x₄ = −1 the result (−8, 3, 2, −1) is 3 of the first special solution minus 1 of the second: the free variables are the mixing amounts.](figures/l7-free-variables-mix.png)

![A four-joint arm in the staircase pose. Elimination on its 2 by 4 Jacobian makes joints 1 and 2 the pivot joints (red) and leaves joints 3 and 4 free (blue): rank 2, with two joints to spare.](figures/l7-arm-pivot-and-free-joints.png)

![Special solution 1 in motion. Free joint 3 leads, pivot joints 1 and 2 counter-turn as R dictates, and the hand stays on the amber ring while the arm leaves its starting shape (grey).](figures/l7-arm-self-motion.png)

![The arm stretched straight. All four columns of J are parallel, so only one pivot survives: the rank drops to 1, three joints are free, and the hand has lost the direction along the arm. A singularity is a drop in rank.](figures/l7-arm-singular.png)

![Four thrusters, three jobs. A 1 N side push solved with the free thruster T4 held at zero: the bow thruster pushes and the two propellers fight each other to cancel the twist, 3 N of thrust in all.](figures/l7-thrusters-free-at-zero.png)

![The same side push after adding half of the special solution s = (−2, −1, 2, 1). The net force and torque are unchanged because B s = 0, but the two side thrusters now share the work and the total thrust falls from 3 N to 1 N.](figures/l7-thrusters-least-effort.png)

![Thruster T4 has failed, which deletes its column. The remaining 3 by 3 matrix still has rank 3, so full control survives, but there is no free variable left: the costly 3 N answer is now the only one.](figures/l7-thrusters-one-failed.png)

![Both propellers have failed. Two columns can hold at most two pivots, so the rank is 2 and a direction is lost: no setting of the side thrusters produces the forward push that is being asked for.](figures/l7-thrusters-two-failed.png)

![A layout whose special solution is (1, −2, 1, 0). The zero entry marks T4 as the thruster with no understudy: when it fails the rank drops to 2 at once, while any one of the other three could have been lost safely.](figures/l7-thruster-without-backup.png)

![The lecture’s matrix and its transpose, each reduced to echelon form. The pivots sit in different places but there are two in both: A and Aᵀ always have the same rank, here with 2 and 1 free variables.](figures/l7-rank-of-transpose.png)


## Capstone: one robot, seven lectures

![Lens 01, the column picture: each joint owns one column of J, and the wanted hand velocity (amber) is a combination of the three.](figures/cap-01-columns.png)

![Lens 02, elimination: J | v reduces to two pivots. The joint without a pivot is free, so many joint speeds do the same job.](figures/cap-02-elimination.png)

![Lens 03, multiplication: the hand pose is the product of the link transforms, and its third column is the hand position.](figures/cap-03-products.png)

![Lens 04, LU: JJᵀ is factored once and reused for every wanted velocity, giving joint speeds with one multiplication.](figures/cap-04-lu.png)

![Lens 05, the transpose: a force on the hand becomes joint torques through Jᵀ.](figures/cap-05-transpose.png)

![Lens 06, column space and nullspace: during self-motion the elbow swings (dashed path) while the hand does not move.](figures/cap-06-subspaces.png)

![Lens 07, rank: two pivot joints (red), one free joint (blue), one special solution.](figures/cap-07-rank.png)

![The straight arm through lens 07: the rank drops from 2 to 1 and a second special solution appears. Every lens reports the same event in its own words.](figures/cap-07-rank-straight.png)

