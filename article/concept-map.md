# The complete concept map

> Every concept from the first seven lectures of MIT 18.06, what it means in plain words, what it is in a robot, and which lab on the interactive pages shows it. Use it to check that the article leaves nothing out, or to find the right figure quickly.

How to read the last column: "Lab 3.2" means the second lab on the Lecture 3 page.

## Lecture 1 · The Geometry of Linear Equations

| Concept | In plain words | In a robot | See it |
|---|---|---|---|
| Linear equation | A fact that combines unknowns using only scaling and adding | One sensor reading, or one balance of forces | Lab 1.1 |
| Row picture | Each equation is a line (or a plane); the solution is where they all meet | Triangulation: each bearing puts the robot on a line | Labs 1.1, 1.2 |
| Column picture | Scale the columns and add them to reach the right-hand side | Each actuator contributes one column of effect | Labs 1.3, 1.4 |
| Linear combination | Stretch some vectors and add them | The net effect of several motors running together | Lab 1.3 |
| Matrix form `A x = b` | The whole system in three boxes | Geometry `A`, commands `x`, wanted result `b` | Lab 1.5 |
| `A x` by columns | A combination of the columns of `A` | Forward problem: commands in, motion out | Lab 1.5 |
| `A x` by rows | Each entry is a row dotted with `x` | Each output is a weighted mix of all the inputs | Lab 1.5 |
| Three equations, three unknowns | Three planes meeting at a point, or three columns combined | Thrust allocation for a three-thruster vehicle | Labs 1.6, 1.7 |
| Solvable for every `b`? | Do the columns fill the whole space? | Can the actuators produce every motion required? | Lab 1.7 |
| Singular matrix | The columns do not fill the space | A singularity: a motion that cannot be made or sensed | Labs 1.2, 1.4, 1.7 |
| Nearly singular | Lines crossing at a thin angle | Ill-conditioning: small noise, large error | Lab 1.2 |

## Lecture 2 · Elimination with Matrices

| Concept | In plain words | In a robot | See it |
|---|---|---|---|
| Elimination | Subtract multiples of one equation from the others to remove an unknown | The standard way a robot's computer solves `A x = b` | Lab 2.1 |
| Pivot | The number you divide by at each stage; it must not be zero | How firmly one equation pins down one unknown | Lab 2.1 |
| Multiplier | How many times the pivot row is subtracted | The recorded recipe of the solve | Lab 2.1 |
| Upper triangular `U` | What is left: each equation has one unknown fewer than the last | A system that can be solved from the bottom up | Lab 2.1 |
| Back-substitution | Solve the last equation first and work upward | Use the directly known quantity first, then feed it back | Lab 2.1 |
| Augmented matrix | The matrix with the right-hand side carried along as an extra column | Geometry and measurements processed together | Lab 2.1 |
| Zero pivot, fixable | A zero where a pivot should be, with a non-zero below | That sensor says nothing about that unknown: ask another first | Labs 2.1, 2.4 |
| Zero pivot, fatal | No row can supply a pivot: the matrix is singular | A quantity the sensors cannot observe at all | Labs 2.1, 2.4 |
| Elimination matrix `E` | One elimination step, written as a matrix | A stored, replayable instruction | Lab 2.2 |
| Associative, not commutative | Brackets may move; order may not | The order of operations on a robot matters | Lab 2.2 |
| Permutation matrix `P` | Reorders rows (on the left) or columns (on the right) | Reordering sensors, or relabelling motors | Lab 2.3 |
| Inverse of a step | The matrix that undoes an elimination step | Undoing an instruction | Lab 2.2 |
| Omni-wheel odometry | (application) | Three wheel speeds give one body velocity, every tick | Lab 2.4 |

## Lecture 3 · Multiplication and Inverse Matrices

| Concept | In plain words | In a robot | See it |
|---|---|---|---|
| Row times column | One entry of `AB` is a row of `A` dotted with a column of `B` | One number of the combined transform | Lab 3.1 |
| Size rule | `m×n` times `n×p` gives `m×p`; the inner sizes must match | Coordinate frames must chain | Lab 3.1 |
| Columns of `AB` | Each is `A` times a column of `B` | Where each axis of the far frame ends up | Labs 3.1, 3.2 |
| Rows of `AB` | Each is a row of `A` times `B` | Each output as a mix of the inputs | Lab 3.1 |
| Column times row | A full matrix whose rows are all multiples of one row | A one-trick machine: output always along one direction | Lab 3.1 |
| Block multiplication | Multiply blocks as if they were numbers | How poses multiply: rotations compose, positions add | Lab 3.2 |
| `AB ≠ BA` | Order matters | Turn then drive is not drive then turn | Lab 3.3 |
| Inverse `A⁻¹` | The matrix that undoes `A` | Changing viewpoint: world to robot and back | Lab 3.5 |
| Singular: no inverse | Some non-zero `x` has `A x = 0` | Information destroyed; a motion the sensor cannot see | Lab 3.6 |
| Gauss-Jordan | Reduce `[A I]` to `[I A⁻¹]` | Answer every unit command at once | Lab 3.4 |
| Forward kinematics | (application) | A pose is a product of link transforms | Lab 3.2 |

## Lecture 4 · Factorization into A = LU

| Concept | In plain words | In a robot | See it |
|---|---|---|---|
| `(AB)⁻¹ = B⁻¹A⁻¹` | Undo in reverse order | To retrace two moves, undo the last one first | Lab 4.1 |
| `(Aᵀ)⁻¹ = (A⁻¹)ᵀ` | Transposing and inverting can be done in either order | One factorization serves velocities and forces | page text |
| `A = LU` | Elimination saved as two triangular matrices | Factor the robot's matrix once and keep it | Lab 4.2 |
| `L` holds the multipliers | No mixing, each multiplier in its own place | A clean log of what elimination did | Lab 4.2 |
| `A = LDU` | Pivots pulled out into a diagonal | The scale of each stage, kept separately | Lab 4.2 |
| Cost `n³/3` | The work of elimination on an `n` by `n` matrix | The one-off price of preparing a solver | Lab 4.3 |
| Cost `n²` per right-hand side | The work for each new `b` | The price paid every control tick | Lab 4.3 |
| Two triangular solves | `L y = b` going down, `U x = y` going up | How robot code solves without ever forming an inverse | Lab 4.3 |
| Banded matrices | Zeros stay zeros in `L` and `U` | Splines through waypoints cost only about `n` | Lab 4.4 |
| Permutations of size 3 | Six of them; products and inverses stay in the family; `P⁻¹ = Pᵀ` | Six ways to wire three motors | Lab 4.5 |

## Lecture 5 · Transposes, Permutations, Spaces Rⁿ

| Concept | In plain words | In a robot | See it |
|---|---|---|---|
| `PA = LU` | LU with row exchanges recorded in `P` | The general-purpose solver in every numerical library | Lab 5.1 |
| Partial pivoting | Exchange rows to avoid small pivots too | Do not divide by your weakest measurement | Lab 5.1 |
| Transpose `Aᵀ` | Rows become columns | Forces go through the transpose: `τ = Jᵀ F` | Labs 5.2, 5.3 |
| Symmetric matrix | Equal to its own transpose | Inertia matrices, covariance matrices | Lab 5.2 |
| `RᵀR` is symmetric | Always, for any `R` | `JᵀJ` and `JJᵀ` appear all over robotics | Lab 5.2 |
| Vector space | A set where adding and scaling never leave the set | The space of all body velocities | Lab 5.4 |
| Subspace | A vector space inside a bigger one; it contains zero | The motions a constrained robot can make | Labs 5.4, 5.5 |
| Not a subspace | First quadrant, a line missing the origin | One-way thrusters, speed limits, joint limits | Lab 5.4 |
| Subspaces of R² and R³ | The whole space, planes and lines through zero, zero alone | A full list of the "motion sets" a linear robot can have | Lab 5.4 |
| Column space `C(A)` | All combinations of the columns | Every velocity the wheels can produce | Lab 5.5 |

## Lecture 6 · Column Space and Nullspace

| Concept | In plain words | In a robot | See it |
|---|---|---|---|
| Union of subspaces | Usually not a subspace | "What A or B can do" cannot be added together | Lab 6.1 |
| Intersection of subspaces | Always a subspace | What both robots can do | Lab 6.1 |
| Column space of a 4 by 3 matrix | A subspace of R⁴ spanned by three columns | Four sensor readings explained by three unknowns | Lab 6.2 |
| `A x = b` solvable ⇔ `b` in `C(A)` | Only combinations of the columns can be reached | A commanded velocity is feasible only inside `C(J)` | Labs 6.2, 6.3 |
| Dependent columns | A column that is a combination of the others adds nothing | A joint that gives the hand nothing new | Lab 6.2 |
| Pivot columns | The columns that do add something | The actuators that carry the task | Lab 6.2 |
| Nullspace `N(A)` | All `x` with `A x = 0` | Self-motion: joints move, hand stays still | Lab 6.3 |
| The nullspace is a subspace | Sums and multiples of null vectors are null vectors | Self-motions can be mixed and scaled freely | Lab 6.3 |
| Solutions of `A x = b`, `b ≠ 0` | A shifted copy of the nullspace; not a subspace | One way to do the task, plus any self-motion | Lab 6.4 |
| Two ways to describe a subspace | Build it from vectors, or cut it out with equations | "What these actuators produce" or "what obeys this constraint" | page text |

## Lecture 7 · Solving Ax = 0: Pivot Variables, Special Solutions

| Concept | In plain words | In a robot | See it |
|---|---|---|---|
| Elimination on a rectangular matrix | Same steps; some columns get no pivot | A machine with more actuators than tasks | Lab 7.1 |
| Echelon form `U` | The staircase left after elimination | The task directions, sorted out | Lab 7.1 |
| Rank `r` | The number of pivots | The directions the machine truly controls | Labs 7.1, 7.4 |
| Pivot columns and variables | Columns with a pivot; their unknowns are forced | Actuators that must compensate | Labs 7.1, 7.3 |
| Free columns and variables | Columns without a pivot; their unknowns are yours to choose | Spare actuators | Labs 7.2, 7.3 |
| Special solutions | Set one free variable to 1, the rest to 0, and solve | The basic self-motions | Labs 7.2, 7.3 |
| `n − r` | The number of special solutions | The degree of redundancy | Labs 7.3, 7.4 |
| Reduced form `R` | Pivots equal to 1, zeros above and below them | The cleanest statement of who depends on whom | Lab 7.1 |
| `R = [I F; 0 0]` | Identity in the pivot columns, `F` in the free columns | `x_pivot = −F x_free`: the compensation rule | Lab 7.2 |
| Nullspace matrix `N = [−F; I]` | Special solutions as columns | A ready-made basis of self-motions | Lab 7.2 |
| `rank(A) = rank(Aᵀ)` | Rows and columns give the same count | Velocities and forces lose the same number of directions | Lab 7.5 |
| Zero row in `U` | An equation that repeated the others | A sensor or constraint that adds nothing | Lab 7.1 |

---

## The same map, sorted by robot

| Robot | Lectures | What it teaches |
|---|---|---|
| Beacons and bearings | 1 | Rows as measurements; singular and ill-conditioned geometry |
| Two-link arm | 1, 3, 5 | Columns as joint contributions; pose as a product; force through the transpose |
| Three-thruster vehicle | 1 | Three columns filling, or failing to fill, three dimensions |
| Omni-wheel robot | 2, 5 | Elimination as odometry; a robot that owns all of R³ |
| Rover (differential drive) | 3, 4, 5, 6 | Order of motions; undoing motions; a velocity subspace |
| Waypoint trajectory | 4 | One factorization, many right-hand sides; banded systems |
| Three-link arm | 6 | Column space and nullspace of a redundant machine |
| Four-joint arm | 7 | Pivot joints, free joints, special solutions |
| Four-thruster vehicle | 7 | Rank, redundancy and losing an actuator |
