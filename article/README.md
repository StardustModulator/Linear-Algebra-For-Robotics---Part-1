# Start here: writing "Linear Algebra for Robotics"

> This folder is the writer's kit. The interactive pages teach the material. These notes give you the same material in a form you can lift into an article: plain explanations, the lecture's exact numbers, worked robot examples, analogies, figure ideas and sources.

## What is in the kit

| File | What it gives you |
|---|---|
| `README.md` (this page) | The storyline, a suggested outline, notation, an accuracy checklist and how to cite |
| `01-…md` to `07-…md` | In-depth notes for each lecture, all built on the same nine sections |
| [`concept-map.md`](concept-map.md) | Every concept of all seven lectures in one table, with its robot meaning and the lab that shows it |
| [`glossary.md`](glossary.md) | Every term in plain words, with its robotics reading |
| [`resources.md`](resources.md) | The OCW lectures and summaries, textbook sections and the robotics books that go deeper |
| [`../code/`](../code/linalg.py) | One runnable Python script per lecture. Every robot number quoted in the notes comes from these |
| `../assets/icons/` | The black-and-white icon set as separate SVG files |

Each lecture note has the same nine sections, so you always know where to look:

1. What the lecture is really about
2. The ideas, from scratch (every concept, every lecture example, all numbers)
3. The robotics connection (worked examples with real numbers)
4. Concept-to-robot table
5. Common mistakes and misconceptions
6. Analogies and sentences you can use
7. Figures worth including (which lab, in which state)
8. Check questions with answers
9. Go deeper

---

## The storyline in one paragraph

A robot is a machine that turns numbers into motion and motion back into numbers. Its sensors hand it equations and its motors are the unknowns, so almost everything it does comes down to one sentence: `A x = b`. Lecture 1 asks what that sentence **means** (rows are constraints, columns are capabilities). Lecture 2 shows how to **solve** it (elimination). Lecture 3 shows how to **chain and undo** such steps (multiplication and inverses). Lecture 4 shows how to solve it **fast, again and again** (A = LU). Lecture 5 turns the matrix **on its side** (transposes, for forces) and then changes the subject from single solutions to whole sets of solutions (**subspaces**). Lecture 6 names the two sets that matter: everything a matrix **can produce** (column space) and everything it **cannot see** (nullspace). Lecture 7 gives the algorithm that **counts** them: the rank says how many directions a machine truly controls, and what is left over is its redundancy.

That is a complete arc: **meaning → method → composition → speed → reach → freedom → counting.**

## Each lecture in one line, twice

| # | The mathematics | The robot |
|---|---|---|
| 1 | A linear system is rows that must agree, or columns that must add up | Sensors write the rows, motors own the columns |
| 2 | Elimination removes one unknown at a time until the system is triangular | Odometry: three encoder readings become one body velocity |
| 3 | A product does one transformation after another; an inverse undoes one | A robot's pose is a chain of matrices; changing viewpoint is an inverse |
| 4 | Elimination can be saved as `A = LU` and reused | Factor once, then solve every control tick for the price of a few multiplications |
| 5 | The transpose swaps rows and columns; a subspace is a set closed under adding and scaling | Forces travel through `Jᵀ`; a subspace is the set of motions a robot can make |
| 6 | The column space is what `A` can reach; the nullspace is what `A` sends to zero | What the hand can do, and how the elbow can move while the hand stays still |
| 7 | Rank counts the pivots; free variables give the special solutions of `A x = 0` | Rank counts the directions truly controlled; free variables are spare actuators |

---

## A suggested outline for the article

This outline is for one long article of roughly 3,000 to 4,500 words. To publish as a series instead, each numbered part becomes one post.

### 0. Opening hook (150 to 250 words)

Start with a machine, not with a matrix. Two options that work:

- **The frozen arm.** A robot arm reaching out straight suddenly cannot move its hand forward, and its joints spin wildly when asked to. Nothing is broken. It has reached a place where a matrix lost a direction. (Then promise the reader they will understand that sentence by the end.)
- **The lost robot.** A robot sees two beacons and still does not know where it is, because it is standing in line with both. Two measurements, one fact.

Then state the claim of the article: *almost everything a robot computes is `A x = b`, and seven ideas from a first course in linear algebra explain what can go right and wrong with it.*

*Figure:* Lab 1.4 with the arm bent beside the arm straight.

### 1. One equation, two pictures (Lecture 1)

- Define linear equation, unknown, coefficient in two sentences.
- Row picture with the lecture's example `2x − y = 0`, `−x + 2y = 3`: two lines crossing at (1, 2).
- Column picture of the same example: one of (2, −1) plus two of (−1, 2) lands on (0, 3).
- The robot reading: **sensors write the rows, motors own the columns.** Triangulation for rows, the arm's Jacobian for columns.
- End on the question: can we solve for every `b`? Introduce "singular".

*Figures:* Lab 1.1, Lab 1.3, Lab 1.2. *Notes:* [`01`](01-geometry-of-linear-equations.md).

### 2. Solving it the way a computer does (Lectures 2 and 4)

- Elimination on the lecture's 3 by 3 system: pivots 1, 2, 5, back-substitution to (2, 1, −2).
- What a zero pivot means, and the difference between a fixable one (exchange rows) and a fatal one (singular).
- The robot: omni-wheel odometry. Each wheel gives one row.
- Then the engineering twist: save the elimination as `L` and `U`. Cost `n³/3` once, `n²` per new right-hand side. This is why control loops can run at a kilohertz, and why robot software almost never computes an inverse.

*Figures:* the Lecture 2 stepper mid-way, the Lecture 4 cost comparison. *Notes:* [`02`](02-elimination-with-matrices.md), [`04`](04-factorization-into-a-lu.md).

### 3. Doing one thing after another, and undoing it (Lecture 3)

- Matrix multiplication is composition. Order matters: turn-then-drive is not drive-then-turn.
- A robot arm's pose is a product of link transforms (forward kinematics).
- The inverse undoes a transform, and `(AB)⁻¹ = B⁻¹A⁻¹` is socks and shoes.
- When there is no inverse: a matrix that flattens something has thrown information away.

*Figures:* the forward-kinematics chain lab and the order-matters lab from Lecture 3. *Notes:* [`03`](03-multiplication-and-inverse-matrices.md).

### 4. The same matrix, read sideways (Lecture 5, first half)

- Transpose: rows become columns.
- The payoff in robotics is short and striking: velocities go through `J`, forces come back through `Jᵀ`. `τ = Jᵀ F`.
- One paragraph on why software exchanges rows even when it does not have to (do not divide by your weakest measurement).

*Figure:* the torque lab from Lecture 5. *Notes:* [`05`](05-transposes-permutations-spaces.md).

### 5. From one answer to all possible answers (Lectures 5 and 6)

- Change of viewpoint: stop asking for one solution and ask what the whole set of reachable outputs looks like.
- Subspace, with the two tests. The rover that cannot slide sideways: its velocities form a plane through the origin.
- Column space: everything the matrix can produce. `A x = b` is solvable exactly when `b` is in it.
- Nullspace: everything the matrix sends to zero. For a redundant arm that is self-motion: the elbow moves and the hand does not.

*Figures:* the rover velocity plane (Lecture 5), the self-motion lab (Lecture 6). *Notes:* [`05`](05-transposes-permutations-spaces.md), [`06`](06-column-space-and-nullspace.md).

### 6. Counting what a machine can really do (Lecture 7)

- Elimination on a rectangular matrix gives pivots and free columns.
- Rank = number of pivots = number of directions truly controlled. Not the number of motors.
- Free variables = spare actuators. Special solutions = the basic ways to move without effect.
- Close the loop with the opening: the straight arm is a matrix whose rank dropped from 2 to 1.

*Figures:* the rref stepper on the lecture matrix, the four-thruster lab with a failed thruster. *Notes:* [`07`](07-solving-ax-equals-0.md).

### 7. Closing (100 to 200 words)

Return to the hook and restate it in the new vocabulary. A good closing line: *a robot's abilities are the column space of its matrices, its blind spots are their nullspaces, and its rank is the honest count of what it can do.* Point readers to the seven lectures and to what comes next in the course (solving `A x = b` completely, the four fundamental subspaces, least squares).

---

## Carry one robot all the way through

Articles of this kind read best when one machine reappears in every section. The **planar arm** does the most work:

| Lecture | What the arm shows |
|---|---|
| 1 | Its Jacobian's columns are what each joint contributes to the hand. A straight arm is singular |
| 2 | Solving `J q̇ = v` for the joint speeds is elimination on a small system |
| 3 | Its pose is a product of link transforms. Viewing a point from the hand is an inverse |
| 4 | The controller solves the same kind of system every millisecond, so it factors and reuses |
| 5 | A force on the hand becomes joint torques through the transpose, `τ = Jᵀ F` |
| 6 | With a third joint: column space = hand velocities available, nullspace = self-motion |
| 7 | With a fourth joint: rank 2, two free joints, two special solutions |

Use the other robots as supporting cases: beacons for rows, the omni robot for elimination, the rover for subspaces, the thruster vehicle for rank and redundancy.

---

## Notation to keep fixed

| Symbol | Meaning | First used |
|---|---|---|
| `A` | A matrix of coefficients, `m` rows by `n` columns | Lecture 1 |
| `x` | The vector of unknowns | 1 |
| `b` | The right-hand side: what we measure or what we want | 1 |
| `U`, `L` | Upper and lower triangular factors | 2, 4 |
| `E`, `P` | An elimination matrix, a permutation matrix | 2 |
| `A⁻¹`, `Aᵀ` | Inverse, transpose | 3, 5 |
| `C(A)`, `N(A)` | Column space, nullspace | 5, 6 |
| `r` | Rank: the number of pivots | 7 |
| `R` | Reduced row echelon form. (Careful: Lecture 5 also uses `R` for a rectangular matrix in `RᵀR`, and robotics uses `R` for rotation. Say which one you mean.) | 7 |
| `J` | A robot's Jacobian: joint speeds in, hand velocity out | 1 |
| `q`, `q̇` | Joint angles, joint speeds | 1 |
| `v`, `F`, `τ` | Hand velocity, hand force, joint torques | 1, 5 |
| `T` | A homogeneous transform (a pose) | 3 |

Strang writes vectors in bold and matrices as capitals. The pages follow that.

---

## Accuracy checklist before you publish

These are the points a knowledgeable reader is most likely to challenge.

- **Singular does not mean "no solution".** It means "not exactly one": none or infinitely many, depending on `b`.
- **Rank is not the number of motors.** It is the number of independent directions they produce.
- **Robots do not invert matrices.** They factor and solve. Say "solve `A x = b`", not "multiply by the inverse", unless you are explaining the idea of undoing.
- **`AB ≠ BA`.** Any sentence that reorders a product needs checking.
- **The Jacobian's columns are hand velocities**, one per joint. The joint speeds are the unknowns.
- **A subspace must contain the zero vector.** The solutions of `A x = b` with `b ≠ 0` are not a subspace.
- **The column space and the nullspace live in different spaces** when the matrix is not square: outputs for one, inputs for the other.
- **Which variables are "free" is a bookkeeping choice** that depends on column order. The nullspace itself does not depend on it.
- **Every robot here is planar and idealised**: rigid links, perfect wheels, no friction, no gravity in the torque example. Say so once. The linear algebra carries over to three dimensions unchanged; only the matrices get bigger.
- **Near-singular matters more than singular.** Real systems fail by amplifying noise long before they fail exactly.
- **Lecture attributions.** Examples marked "the lecture's example" use Strang's numbers. Every robot example is this project's own, so do not attribute those to MIT.

---

## How to cite the lectures

The lectures are published by MIT OpenCourseWare. Its standard citation form is:

> Gilbert Strang. *18.06 Linear Algebra.* Spring 2010. Massachusetts Institute of Technology: MIT OpenCourseWare, https://ocw.mit.edu. License: Creative Commons BY-NC-SA.

The lecture summaries and problems belong to the companion course *18.06SC Linear Algebra*, Fall 2011, cited the same way.

What the licence means for an article: you may link to, quote from and build on the OCW material with attribution, for non-commercial use, and anything that adapts OCW's own text or figures must carry the same licence. The explanations, robot examples, code and icons in this repository are original to this project and are yours to use. Facts and methods of mathematics are not anyone's property; the specific wording and figures are. When in doubt, write it in your own words and cite the lecture.

---

## Working with the kit

```
python3 code/l01_geometry.py      # run any lecture's examples and see every number
node tests/la.test.js             # check the maths engine against the lecture examples
node tools/build.js               # rebuild the kit pages and icon files after editing notes
```

The readable versions of these notes live in the `kit` folder as web pages. They are generated from the Markdown files here, so edit the Markdown and rebuild.
