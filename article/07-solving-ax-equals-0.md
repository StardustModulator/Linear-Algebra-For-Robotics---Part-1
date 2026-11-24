# Lecture 7 · Solving Ax = 0: Pivot Variables, Special Solutions

> **The thesis in one sentence:** elimination on any matrix sorts its unknowns into pivot variables and free variables; the pivots count what the matrix can really do (its rank), and the free variables generate everything that can be done to no effect (its nullspace), which on a robot means true degrees of freedom and spare actuators.

| | |
|---|---|
| Lecture | MIT 18.06 Linear Algebra, Lecture 7, Prof. Gilbert Strang (43:20) |
| Watch | [Lecture 7 on MIT OpenCourseWare](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-7-solving-ax-0-pivot-variables-special-solutions/) |
| Summary and problems | [18.06SC session page](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/solving-ax-0-pivot-variables-special-solutions/) · [lecture summary PDF](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/resources/mit18_06scf11_ses1-7sum/) |
| Textbook | Strang, *Introduction to Linear Algebra*, section 3.2 |
| Interactive page | [`07-solving-ax-equals-0.html`](../07-solving-ax-equals-0.html), Labs 7.1 to 7.5 |
| Code | [`code/l07_nullspace_rref.py`](../code/l07_nullspace_rref.py) |

---

## 1. What this lecture is really about

Lecture 6 defined the nullspace: all `x` with `A x = 0`. It found one by inspection, which only works on toy matrices. Lecture 7 is the **algorithm**. It is the elimination of Lecture 2, allowed to run on a matrix of any shape, and it delivers four things in one pass:

1. the **echelon form** `U`, and from it the **rank** `r`, the number of pivots;
2. a sorting of the unknowns into **pivot variables** and **free variables**;
3. the **special solutions**, one per free variable, whose combinations are the whole nullspace;
4. the **reduced row echelon form** `R`, from which the special solutions can be read with no further work.

Two counts carry the whole lecture. A matrix with `n` columns and rank `r` has `r` pivot variables and `n − r` free variables. For a robot, `r` is how many independent directions the machine commands and `n − r` is how many actuators it has to spare. That translation is the reason to put this lecture in an article on robotics.

---

## 2. The ideas, from scratch

### 2.1 The matrix, and what to notice first

```
     [ 1  2  2   2 ]
 A = [ 2  4  6   8 ]        3 rows, 4 columns (rectangular)
     [ 3  6  8  10 ]
```

Before any arithmetic Strang points out two facts:

- **column 2 = 2 × column 1**: (2, 4, 6) against (1, 2, 3);
- **row 3 = row 1 + row 2**: (1, 2, 2, 2) + (2, 4, 6, 8) = (3, 6, 8, 10).

The columns are not all independent and neither are the rows. Elimination is not told this. It finds both.

### 2.2 Elimination on a rectangular matrix

We solve `A x = 0`. The right-hand side is zero and every row operation leaves it zero, so **no augmented column is needed**. Row operations do not change the solutions (each one is reversible), so **the nullspace of `A` is the nullspace of `U`**.

```
 column 1: pivot 1 in row 1
     row 2 − 2·row 1 = (0, 0, 2, 4)
     row 3 − 3·row 1 = (0, 0, 2, 4)
 column 2: zero in the pivot position (row 2) and zero below it → NO PIVOT, move right
 column 3: pivot 2 in row 2
     row 3 − row 2   = (0, 0, 0, 0)
 column 4: zero in the pivot position (row 3), nothing below → NO PIVOT

     [ 1  2  2  2 ]
 U = [ 0  0  2  4 ]        echelon ("staircase") form
     [ 0  0  0  0 ]
```

The one new rule compared with Lecture 2: when the pivot position holds a zero **and everything below it is zero too**, the column simply has no pivot. Do not stop, do not move down a row; move one column to the right. (If something non-zero lies below, exchange rows as before.)

**Echelon form** means the pivots step down and to the right like a staircase, with zeros beneath. A square matrix with all its pivots gives a triangle; a rectangular one gives stairs of uneven width.

Both opening facts have surfaced: column 2 got no pivot because it adds nothing after column 1, and row 3 became zeros because it adds nothing after rows 1 and 2.

### 2.3 Rank

> **Rank `r` = the number of pivots.** Here `r = 2`.

Strang calls it the number that matters most about a matrix. `A` is written as 3 equations in 4 unknowns but contains only 2 independent equations. Since a row or a column can hold at most one pivot, `r ≤ m` and `r ≤ n`.

### 2.4 Pivot variables and free variables

- **Pivot columns:** 1 and 3. **Pivot variables:** `x1`, `x3`.
- **Free columns:** 2 and 4. **Free variables:** `x2`, `x4`.

`U x = 0` written out:

```
 x1 + 2x2 + 2x3 + 2x4 = 0
            2x3 + 4x4 = 0
                    0 = 0
```

Free means free: give `x2` and `x4` **any** values. The pivot variables are then forced, found by back-substitution from the bottom equation up.

### 2.5 Special solutions

Set one free variable to 1 and the others to 0, and solve.

| Choice | Second equation | First equation | Special solution |
|---|---|---|---|
| `x2 = 1`, `x4 = 0` | `2x3 + 0 = 0` → `x3 = 0` | `x1 + 2 = 0` → `x1 = −2` | `s1 = (−2, 1, 0, 0)` |
| `x2 = 0`, `x4 = 1` | `2x3 + 4 = 0` → `x3 = −2` | `x1 = −2x3 − 2x4 = 2` | `s2 = (2, 0, −2, 1)` |

Read back in terms of the columns of `A`: `s1` says −2·(column 1) + (column 2) = 0, which is "column 2 is twice column 1". `s2` says 2·(column 1) − 2·(column 3) + (column 4) = 0, a relation nobody would see by eye.

### 2.6 The whole nullspace, and the count `n − r`

```
 x = c·(−2, 1, 0, 0) + d·(2, 0, −2, 1)        for all numbers c and d
```

Every combination is a solution (the nullspace is a subspace), and nothing is missing: a solution is decided by its free variables, and this combination has `x2 = c`, `x4 = d`. Sample points from the script: `c = 3, d = −2` gives `(−10, 3, 4, −2)`; `c = ½, d = 4` gives `(7, ½, −8, 4)`; both give `A x = (0, 0, 0)`.

> **One special solution per free variable. Number of free variables = `n − r` = 4 − 2 = 2.**

### 2.7 Reduced row echelon form `R`

Go further than `U`: eliminate **upward** so there are zeros above the pivots too, and **divide** each pivot row so the pivots are 1.

```
 [ 1 2 2 2 ]   row 1 − row 2   [ 1 2 0 −2 ]   row 2 ÷ 2   [ 1 2 0 −2 ]
 [ 0 0 2 4 ]  ─────────────►   [ 0 0 2  4 ]  ──────────►  [ 0 0 1  2 ]  = R = rref(A)
 [ 0 0 0 0 ]                   [ 0 0 0  0 ]               [ 0 0 0  0 ]
```

Still row operations, so `R x = 0` has the same solutions as `A x = 0`. Each row of `R` now holds one pivot variable and otherwise only free variables: `x1 = −2x2 + 2x4`, `x3 = −2x4`. No back-substitution.

### 2.8 `R = [I F; 0 0]` and the nullspace matrix `N = [−F; I]`

- The **pivot columns** of `R` (1 and 3) form the identity `I`, `r` by `r`: `[1 0; 0 1]`.
- The **free columns** (2 and 4) form a block `F`: `[2 −2; 0 2]`.
- With pivot columns listed first, `R = [ I F ; 0 0 ]`. The zero row records that row 3 was a combination of the others.

Put the special solutions in the columns of the **nullspace matrix**:

```
     [ −2   2 ]   ← x1 (pivot)  ┐
 N = [  1   0 ]   ← x2 (free)   │  pivot rows hold −F = [−2 2; 0 −2]
     [  0  −2 ]   ← x3 (pivot)  │  free rows hold  I  = [ 1 0; 0  1]
     [  0   1 ]   ← x4 (free)   ┘
```

`R N = 0`. In block form, pivot variables on top and free variables below, `N = [ −F ; I ]`, and the check is one line: `[I F][−F; I] = −F + F = 0`. The lecture in one formula:

> **`x_pivot = −F · x_free`**

Example: `x_free = (x2, x4) = (3, −1)` gives `x_pivot = (x1, x3) = (−8, 2)`, so `x = (−8, 3, 2, −1)` and `A x = 0`.

A point worth making explicit, because it confuses readers: the identity inside `R` and the identity inside `N` are different matrices. The first is `r` by `r` and sits in the pivot columns. The second is `(n − r)` by `(n − r)` and sits in the free rows; it is the free variables taking turns to be 1.

### 2.9 Second example: the transpose

```
       [ 1  2   3 ]              [ 1 2 3 ]              [ 1 0 1 ]
 Aᵀ =  [ 2  4   6 ]    →    U =  [ 0 2 2 ]    →    R =  [ 0 1 1 ]
       [ 2  6   8 ]              [ 0 0 0 ]              [ 0 0 0 ]
       [ 2  8  10 ]              [ 0 0 0 ]              [ 0 0 0 ]
```

Steps: subtract 2·row 1 from rows 2, 3, 4 to get (0, 0, 0), (0, 2, 2), (0, 4, 4). The pivot position in column 2 holds a zero but there is a 2 below it, so **exchange rows 2 and 3**. Then row 4 − 2·row 2 = (0, 0, 0).

- Pivots in columns 1 and 2: **rank 2 again**.
- `n − r = 3 − 2 = 1` free variable, `x3`.
- `F = (1, 1)`, so the special solution is `(−1, −1, 1)` and `N` is that single column.
- The nullspace is the line `c·(−1, −1, 1)`.

Its meaning: column 3 of `Aᵀ` = column 1 + column 2, that is, row 3 of `A` = row 1 + row 2. The fact noticed at the start, produced by the algorithm.

> **`A` and `Aᵀ` always have the same rank.** They differ in the number of free variables: `n − r` against `m − r`.

---

## 3. The robotics connection

The sentence to remember: **rank is what the machine can do, `n − r` is what it has to spare.**

### 3.1 The shape of the matrix is the shape of the machine

`n` columns = number of actuators. `m` rows = number of quantities the task controls.

| Machine | Matrix | Rows | Columns |
|---|---|---|---|
| Four-joint planar arm placing a point | Jacobian `J`, 2 by 4 | hand velocity `vx`, `vy` (m/s) | four joint speeds (rad/s) |
| Four-thruster planar vehicle | thruster matrix `B`, 3 by 4 | `Fx`, `Fy` (N), torque `τ` (N m) | four thrusts (N) |

More columns than rows is called **over-actuated** or **redundant**.

### 3.2 Rank = the directions the machine can truly command

Rank is not the number of motors. Four thrusters on the centre line, all pointing forward, give four identical columns (1, 0, 0): rank 1, one direction of control, and `n − r = 3` ways to waste fuel. A healthy planar arm has rank 2; stretched straight its columns become parallel and the rank is 1. **A singularity is a drop in rank.**

### 3.3 The four-joint arm (Lab 7.3)

**Deriving `J`.** For a planar arm, turning joint `i` alone at 1 rad/s swings the hand around that joint. The hand's velocity is the arrow from joint `i` to the hand, rotated a quarter turn: if the arrow is `(a, b)` the column is `(−b, a)`. With the hand at `(xh, yh)` and joint `i` at `(xi, yi)`, column `i` = `(−(yh − yi), xh − xi)`, in metres (m/s per rad/s).

**Staircase pose.** Four links of 1 m, relative joint angles 90°, −90°, 90°, −90° (up, right, up, right). Joints at (0, 0), (0, 1), (1, 1), (1, 2); hand at (2, 2). Arrows to the hand: (2, 2), (2, 1), (1, 1), (1, 0).

```
     [ −2  −1  −1  0 ]   row 2 + row 1   [ −2 −1 −1 0 ]          [ 1  0  1/2  −1/2 ]
 J = [  2   2   1  1 ]  ─────────────►   [  0  1  0 1 ]  →   R = [ 0  1   0     1  ]
```

- rank 2: the hand can move in every direction of the table;
- pivot joints 1 and 2, free joints 3 and 4, redundancy `n − r = 2`;
- `F = [1/2 −1/2; 0 1]`;
- special solutions `s1 = (−1/2, 0, 1, 0)` and `s2 = (1/2, −1, 0, 1)` rad/s, each giving hand velocity (0, 0).

`s1` in words: turn joint 3 at 1 rad/s, hold joint 4, turn joint 1 backwards at half that speed, leave joint 2 alone.

**`x_pivot = −F x_free` as a control law.** Choose free joint speeds (joints 3, 4) = (0.4, −0.2) rad/s. Then the pivot joints (1, 2) must turn at `−F·(0.4, −0.2) = (−0.3, 0.2)` rad/s. The full command `(−0.3, 0.2, 0.4, −0.2)` gives `J q̇ = (0, 0)`.

**A self-motion that lasts.** `J` changes as the arm moves, so the special solutions must be recomputed continually. Following `q̇ = 0.5·s1(q)` for one second in 1 ms steps moves the joints from (90, −90, 90, −90) to (68.1, −78.9, 118.6, −90.0) degrees. With plain stepping the hand drifts 0.152 mm; with a correction step each cycle (solve `(J Jᵀ) λ = error`, add `Jᵀ λ` to the joints) it stays put to 0.000 mm. Joints turn by tens of degrees; the hand does not move.

**Other poses.**

| Pose (joint angles) | `R` | Rank | Special solutions |
|---|---|---|---|
| Reaching (110°, −50°, −50°, −50°), hand at (1.91, 1.34) | `[1 0 −0.78 −0.78; 0 1 1.44 1]` | 2 | (0.78, −1.44, 1, 0), (0.78, −1, 0, 1) |
| Straight (35°, 0°, 0°, 0°), hand at (3.28, 2.29) | `[1 0.75 0.5 0.25; 0 0 0 0]` | 1 | (−0.75, 1, 0, 0), (−0.5, 0, 1, 0), (−0.25, 0, 0, 1) |

The straight arm gains a third special solution and loses a direction of hand motion: a bad trade. Note also that its three special solutions are true for that instant only. At full stretch there is exactly one arm shape that reaches the point, so no lasting self-motion exists.

**Honest caveats.** (1) Which joints are called free depends on the order of the columns: elimination gives pivots to the first columns that can take them. Renumber the joints and other joints become free. The nullspace does not change, only its description. (2) The pivot joints can be a poor choice. When joints 1 and 2 line up with the hand their columns are nearly parallel, the entries of `F` blow up, and the "compensating" joints would have to spin wildly. In Lab 7.3 the drive eases off there. Real controllers describe the same nullspace with better-balanced vectors (orthogonal ones, from the pseudo-inverse or the SVD, later in the course). (3) The model is planar, with ideal joints and no gravity.

### 3.4 The four-thruster vehicle (Lab 7.4)

**Deriving `B`.** A thruster mounted at `(x, y)` in the body frame, pushing along the unit direction `(cos a, sin a)` with 1 N, contributes force `(cos a, sin a)` and torque `x·sin a − y·cos a` about the centre. Its column is `(cos a, sin a, x sin a − y cos a)`: (N per N, N per N, metres).

**Layout "two pairs"** (metres): T1 port propeller at (−1.3, 0.5) pushing forward; T2 bow thruster at (1, 0) pushing to port; T3 starboard propeller at (−1.3, −0.5) pushing forward; T4 stern thruster at (−1, 0) pushing to port.

```
     [   1    0    1    0 ]  Fx                [ 1  0  0   2 ]
 B = [   0    1    0    1 ]  Fy       R =      [ 0  1  0   1 ]
     [ −1/2   1   1/2  −1 ]  τ                 [ 0  0  1  −2 ]
```

Elimination: row 3 + ½·row 1 = (0, 1, 1, −1); row 3 − row 2 = (0, 0, 1, −2). Three pivots, all 1. **Rank 3** (full control), **one free thruster** (T4), **one special solution**

```
 s = (−2, −1, 2, 1) N,      B s = (0, 0, 0)
```

The propellers at −2 and +2 N twist the hull by +2 N m; the side thrusters at −1 and +1 N twist it by −2 N m. Net force and torque: zero.

**Allocation = one solution + any multiple of `s`.** Set the free variable to zero and back-substitute for one answer, then add `c·s`.

| Wanted `(Fx, Fy, τ)` | Free thruster at 0 | Total thrust | Best `c` | Least-effort answer | Total thrust |
|---|---|---|---|---|---|
| (1, 0, 0) | (½, 0, ½, 0) | 1 N | 0 | (½, 0, ½, 0) | 1 N |
| (0, 1, 0) | (1, 1, −1, 0) | 3 N | ½ | (0, ½, 0, ½) | 1 N |

For the side push, the "free variable = 0" answer is legal but silly: the bow thruster pushes and the two propellers fight each other to cancel its twist. Adding half of `s` lets the two side thrusters share the push. Same motion, a third of the thrust. (Total thrust `Σ|f|` is piecewise linear in `c`, so its minimum always switches at least one thruster off.) Other uses of `c`: keep every thruster above a minimum thrust so it stays out of its dead zone, or keep thrusters away from their limits.

**Fault tolerance.** A failed thruster deletes a column.

| Layout | Special solution | T1 fails | T2 fails | T3 fails | T4 fails |
|---|---|---|---|---|---|
| Two pairs | (−2, −1, 2, 1) | rank 3 | rank 3 | rank 3 | rank 3 |
| Three astern, one at the bow | (1, −2, 1, 0) | rank 3 | rank 3 | rank 3 | **rank 2** |

> **Rule:** with rank 3 and one special solution `s`, thruster `i` can be lost without losing control exactly when entry `i` of `s` is not zero.

Reason: a non-zero entry means that column is a combination of the other three, so they span the same space without it. A zero entry means `s` is a dependency among the *other* three columns, so they cannot have rank 3 on their own. Lose two thrusters of the first layout and the rank is 2 whichever pair it is: two columns can hold at most two pivots. And after T4 fails, the 1 N side push has the single answer (1, 1, −1), 3 N, with no choice left.

The second layout, `B = [1 1 1 0; 0 0 0 1; −½ 0 ½ 1]`, reduces to `R = [1 0 −1 0; 0 1 2 0; 0 0 0 1]`: pivot columns 1, 2, 4 and free column 3. A useful reminder that the free column is not always the last one.

### 3.5 A zero row is a repeated equation

A two-wheeled robot with wheel separation 0.4 m has forward speed `v` and turn rate `ω`. Left wheel sensor: `v − 0.2ω`. Right wheel sensor: `v + 0.2ω`. A camera looking at the floor: `v`.

```
     [ 1  −1/5 ]            [ 1  −1/5 ]
 H = [ 1   1/5 ]   →   U =  [ 0   2/5 ]      rank 2
     [ 1    0  ]            [ 0    0  ]
```

The camera row is (left + right)/2, so it becomes a zero row: no new information about `(v, ω)`. But the same row operations applied to the readings give a **consistency check**: readings (0.9, 1.1, 1.0) m/s give `0 = 0`; readings (0.9, 1.4, 1.0) give `0 = −0.15`, impossible unless a wheel is slipping or a sensor is wrong. Redundant rows are how robots detect faults. (Lecture 8 turns this into the solvability condition for `A x = b`.)

### 3.6 `rank(A) = rank(Aᵀ)` on the arm

Joint speeds pass through `J` to give hand velocity; a hand force passes through `Jᵀ` to give joint torques (Lecture 5). Equal ranks mean: as many independent directions to move in as to push in.

| Pose | `J` (2 by 4) | `Jᵀ` (4 by 2) |
|---|---|---|
| Staircase | rank 2, free variables 4 − 2 = 2 | rank 2, free variables 2 − 2 = 0 |
| Straight | rank 1, free variables 4 − 1 = 3 | rank 1, free variables 2 − 1 = 1 |

At the straight pose `Jᵀ` gains a special solution: the hand force (1.428, 1), which points along the arm (the direction (0.819, 0.574) at 35°), needs joint torques (0, 0, 0, 0). The links carry it like a pole. That is why a locked-out arm can hold a heavy load with little motor effort, and also why it cannot push actively in that direction.

---

## 4. Concept-to-robot table

| Lecture idea | Plain words | In a robot |
|---|---|---|
| Rectangular matrix, `m` by `n` | `m` equations, `n` unknowns | `n` actuators, a task of `m` numbers |
| Solving `A x = 0` | Combinations of the columns that cancel | Commands that leave the task undisturbed |
| Echelon form `U` | Pivots stepping down like stairs | The machine's equations with the repeats removed |
| Zero row | A row that was a combination of others | A repeated sensor or constraint; a consistency check |
| Rank `r` | Number of pivots | Number of directions truly commanded; singularity = rank drop |
| Pivot variables | Forced once the others are chosen | The actuators that compensate |
| Free variables | May be set to anything | The actuators you command freely |
| Special solution | One free variable 1, the rest 0 | A basic self-motion: one spare actuator leads |
| Nullspace | All combinations of special solutions | Every self-motion; every self-cancelling thrust pattern |
| `n − r` | Number of free variables | Degree of redundancy |
| Reduced form `R` | Pivots 1, zeros above and below | The compensation rule, one row per pivot actuator |
| `x_pivot = −F x_free` | Read special solutions from `R` | A control law for the pivot actuators |
| `rank A = rank Aᵀ` | Independent columns = independent rows | Directions of motion = directions of force |

---

## 5. Common mistakes and misconceptions

- **Stopping when a pivot is missing.** In Lecture 2 a missing pivot meant failure. Here it means "free column, move right".
- **Calling a column free too early.** A zero in the pivot position is not enough. Look below it first; a non-zero entry there means a row exchange, not a free column (the transpose example).
- **"Free variables are zero" or "free variables do not matter".** They are the ones you choose. Setting them all to zero gives only `x = 0`.
- **Counting motors instead of pivots.** Four motors can have rank 1. The rank, not `n`, is the number of controllable directions.
- **Thinking the special solutions are the nullspace.** They are a basis for it. The nullspace is all their combinations, and other bases describe the same space.
- **Believing the pivot/free split is a property of the machine.** It depends on column order. Only the counts `r` and `n − r`, and the nullspace itself, are intrinsic.
- **Forgetting the sign.** `N = [−F; I]`, with a minus. The entries of `F` are copied into the pivot positions with signs flipped.
- **Mixing up the two identities.** The `I` in `R` is `r` by `r`; the `I` in `N` is `(n − r)` by `(n − r)`.
- **Reading extra special solutions at a singularity as a gain.** The arm gained a self-motion direction by losing a hand direction. `r + (n − r) = n` always.
- **Trusting exact rank on real data.** Near a singularity a pivot is tiny, not zero. Software needs a tolerance, and a robot behaves badly well before the rank drops on paper.

---

## 6. Analogies and sentences you can use

- **Staircase.** Echelon form is a staircase: every pivot is a step down and to the right. Wide steps are free columns.
- **Leaders and followers.** Free variables lead, pivot variables follow. Elimination decides who is who, and `R` is the rule book the followers obey.
- **Budget.** A matrix has `n` columns to spend. It spends `r` on doing things and has `n − r` left over. The books always balance.
- **Understudies.** A thruster with a non-zero entry in the special solution has understudies; one with a zero entry does not.
- **The pole.** A straight arm carries a load along its length the way a pole does: no motor effort, and no ability to push.
- A sentence for the article: *"Rank is the number of directions a machine can really command; `n − r` is the number of actuators it has to spare."*
- Another: *"A special solution is one spare actuator leading while the others cover for it."*
- Another: *"A singularity is a drop in rank: the arm gains a way to move without effect and pays for it with a direction it can no longer move in."*
- Another: *"The pattern that does nothing is the most useful one on the vehicle: add any amount of it and the motion is unchanged, so it can be spent on saving energy or surviving a failure."*

---

## 7. Figures worth including

Every figure below is already captured in `article/figures/` (see the [figure pack](figures.md)). To retake one in a different state, open the lab, set it up, and screenshot it, or edit `tools/figures/l7.js` and run `node tools/figures.js 7`.

| Figure | Ready-made file | How it was set up |
|---|---|---|
| The new rule: a column with no pivot | `l7-free-column.png` | Lab 7.1, lecture matrix, step 5: column 2 is declared free |
| Echelon form with rank and column types | `l7-echelon-form.png` | Lab 7.1, lecture matrix, step 9: `U` with pivots circled |
| `R` beside the nullspace matrix `N` | `l7-reduced-form-and-nullspace.png` | Lab 7.1, lecture matrix, last step |
| A row exchange rescuing a pivot | `l7-transpose-row-exchange.png` | Lab 7.1, "Its transpose", step 6 |
| An arm's Jacobian reduced | `l7-arm-jacobian-reduced.png` | Lab 7.1, "Four-joint arm J", last step |
| A special solution built by hand | `l7-special-solution.png` | Lab 7.2 as it opens: `x2 = 1`, `x4 = 0` |
| Free variables as mixing amounts | `l7-free-variables-mix.png` | Lab 7.2 with `x2 = 3`, `x4 = −1` |
| Pivot joints and free joints | `l7-arm-pivot-and-free-joints.png` | Lab 7.3 as it opens: staircase pose |
| A self-motion in progress | `l7-arm-self-motion.png` | Lab 7.3 with `c = −0.5`, after about 2.5 seconds |
| Singularity as a rank drop | `l7-arm-singular.png` | Lab 7.3, "Straighten the arm" |
| Allocation with the free thruster at zero | `l7-thrusters-free-at-zero.png` | Lab 7.4, `Fx = 0`, `Fy = 1`, null amount 0 |
| The same motion at a third of the effort | `l7-thrusters-least-effort.png` | Lab 7.4, same request, after "Least effort" |
| One failure survived | `l7-thrusters-one-failed.png` | Lab 7.4, same request, "Fail T4" ticked |
| Two failures: a direction lost | `l7-thrusters-two-failed.png` | Lab 7.4, default request, T1 and T3 failed |
| The thruster with no backup | `l7-thruster-without-backup.png` | Lab 7.4, "Three astern, one at the bow", T4 failed |
| Same rank for `A` and `Aᵀ` | `l7-rank-of-transpose.png` | Lab 7.5 as it opens |

Good pairs for the article: `l7-free-column` with `l7-reduced-form-and-nullspace` (the algorithm), `l7-arm-pivot-and-free-joints` with `l7-arm-self-motion` (free joints leading), and `l7-thrusters-free-at-zero` with `l7-thrusters-least-effort` (what the nullspace is good for).

---

## 8. Check questions

1. **Why is no augmented column needed for `A x = 0`?** The right-hand side is zero and row operations keep it zero.
2. **The pivot position holds a zero. Free column or not?** Only if everything below it is zero as well. Otherwise exchange rows.
3. **Four columns, pivots in columns 1 and 3. Rank, free variables, number of special solutions?** Rank 2; `x2` and `x4`; two.
4. **`R` has rows (1, 0, 1), (0, 1, 1), (0, 0, 0), (0, 0, 0). `F` and the special solution?** `F = (1, 1)`; `x = (−1, −1, 1)`.
5. **Six motors, rank 4. Directions commanded? Independent do-nothing patterns?** 4 and 2.
6. **Special solution (1, −2, 1, 0) for a four-thruster vehicle with full control. Which thruster must never fail?** The fourth: its zero entry means the other three columns are dependent.
7. **`A` is 3 by 4 with rank 2. Free variables of `A` and of `Aᵀ`?** 2 and 1.

---

## 9. Practice problems with worked solutions

The same ten problems as on the page, with full solutions. All answers are reproduced by `code/l07_nullspace_rref.py` (section 13 of its output).

**P1. Elimination.** Reduce `[1 3 1 2; 2 6 4 8; 0 0 2 4]` to echelon form. Pivot columns, free columns, rank?

*Solution.* Row 2 − 2·row 1 = (0, 0, 2, 4). Column 2 has zeros in row 2 and below: no pivot. Column 3: pivot 2 in row 2; row 3 − row 2 = (0, 0, 0, 0). `U = [1 3 1 2; 0 0 2 4; 0 0 0 0]`. **Pivot columns 1 and 3, free columns 2 and 4, rank 2.**

**P2. Special solutions.** Find the special solutions of P1 by back-substitution.

*Solution.* Equations: `x1 + 3x2 + x3 + 2x4 = 0`, `2x3 + 4x4 = 0`. With `x2 = 1, x4 = 0`: `x3 = 0`, `x1 = −3`. With `x2 = 0, x4 = 1`: `x3 = −2`, `x1 = 2 − 2 = 0`. **(−3, 1, 0, 0) and (0, 0, −2, 1).**

**P3. Reduced form.** Carry `U` on to `R`; write `F` and `N`.

*Solution.* Row 1 − ½·row 2 = (1, 3, 0, 0); row 2 ÷ 2 = (0, 0, 1, 2). `R = [1 3 0 0; 0 0 1 2; 0 0 0 0]`, `F = [3 0; 0 2]`, and `N` has columns **(−3, 1, 0, 0) and (0, 0, −2, 1)**: the same as P2, read off with signs flipped.

**P4. Counting.** (a) 3 by 5, rank 3: how many special solutions? (b) 5 by 3, rank 3: the nullspace? (c) Can a 3 by 5 matrix have only the zero vector in its nullspace?

*Solution.* (a) `5 − 3 = 2`. (b) `3 − 3 = 0` free variables: only `x = 0`. (c) No: `r ≤ 3`, so `n − r ≥ 2`. **More columns than rows always means non-zero solutions of `A x = 0`.**

**P5. Transpose.** For `A = [1 2 1; 2 4 3]`, find rank and special solutions of `A` and of `Aᵀ`.

*Solution.* `A`: row 2 − 2·row 1 = (0, 0, 1); pivots in columns 1 and 3; `x2` free; special solution (−2, 1, 0). `Aᵀ` (rows (1, 2), (2, 4), (1, 3)): row 2 − 2·row 1 = (0, 0), row 3 − row 1 = (0, 1), exchange; pivots in both columns. **Both have rank 2; `A` has one special solution, `Aᵀ` has none.**

**P6. Arm Jacobian (robot).** Four 1 m links: two along the table, then two straight up. Joints at (0, 0), (1, 0), (2, 0), (2, 1), hand at (2, 2). Find `J`, rank, pivot and free joints, special solutions.

*Solution.* Arrows to the hand: (2, 2), (1, 2), (0, 2), (0, 1); a quarter turn sends `(a, b)` to `(−b, a)`. `J = [−2 −2 −2 −1; 2 1 0 0]`. Row 2 + row 1 gives `U = [−2 −2 −2 −1; 0 −1 −2 −1]`; then `R = [1 0 −1 −½; 0 1 2 1]`. **Rank 2, pivot joints 1 and 2, free joints 3 and 4, special solutions (1, −2, 1, 0) and (½, −1, 0, 1).**

**P7. Using a special solution (robot).** In the pose of P6, joint 3 must turn at 0.2 rad/s and joint 4 must stay still. What must joints 1 and 2 do to keep the hand still?

*Solution.* Free speeds (0.2, 0) means 0.2·`s1` = **(0.2, −0.4, 0.2, 0)**: joint 1 at 0.2 rad/s, joint 2 at −0.4 rad/s. Follow-up: with joint 4 also at 0.2, add 0.2·`s2` to get (0.3, −0.6, 0.2, 0.2).

**P8. Singular pose (robot).** The same arm straight up the page: joints at (0, 0), (0, 1), (0, 2), (0, 3), hand at (0, 4). `J`, rank, `n − r`, lost motion?

*Solution.* `J = [−4 −3 −2 −1; 0 0 0 0]`, `R = [1 ¾ ½ ¼; 0 0 0 0]`. **Rank 1, `n − r = 3`**, special solutions (−¾, 1, 0, 0), (−½, 0, 1, 0), (−¼, 0, 0, 1). The zero row is the vertical row: the hand cannot move along the arm. A singularity.

**P9. Thruster matrix (robot).** Propellers at (−1, 1) and (−1, −1) pushing forward (T1, T2); side thrusters at (1, 0) and (−1, 0) pushing to the left (T3, T4). `B`, rank, special solution, which single failures are survivable?

*Solution.* `B = [1 1 0 0; 0 0 1 1; −1 1 1 −1]`. Row 3 + row 1 = (0, 2, 1, −1); exchange rows 2 and 3: `U = [1 1 0 0; 0 2 1 −1; 0 0 1 1]`; `R = [1 0 0 1; 0 1 0 −1; 0 0 1 1]`. **Rank 3, `s = (−1, 1, −1, 1)`, and since every entry of `s` is non-zero any one thruster may fail** (the rank with each column removed in turn is 3, 3, 3, 3).

**P10. Thrust allocation (robot).** For the vehicle of P9 the pilot asks for `b = (0, 2, 0)`. Thrusts with the free thruster at zero? Thrusts with least total thrust?

*Solution.* With `f4 = 0`: `f3 = 2`, `f2 = −f1`, and the torque row gives `f1 = 1`: `f = (1, −1, 2, 0)`, 4 N in total. All answers: `(1 − c, −1 + c, 2 − c, c)`. At `c = 1`: **`(0, 0, 1, 1)`, 2 N in total**, the two side thrusters sharing the push. Follow-up: if T4 has failed, `c` is stuck at 0 and the 4 N answer is the only one.

---

## 10. Go deeper

- Strang, *Introduction to Linear Algebra*, section 3.2: the nullspace, pivot and free variables, special solutions and `rref`, with the same matrices as the lecture.
- MIT 18.06 Lecture 8, "Solving Ax = b": the complete solution as one particular solution plus the nullspace, which is exactly the thrust-allocation recipe of section 3.4.
- Lynch and Park, *Modern Robotics*, chapters 5 and 6: the Jacobian, singularities as loss of rank, and redundancy in velocity and inverse kinematics.
- Siciliano, Sciavicco, Villani and Oriolo, *Robotics: Modelling, Planning and Control*, the chapter on differential kinematics: redundancy resolution and null-space motions of manipulators.
- Fossen, *Handbook of Marine Craft Hydrodynamics and Motion Control*, the chapter on control allocation: over-actuated vessels and how the spare freedom is spent.
- 3Blue1Brown, *Essence of Linear Algebra*, the chapter on inverse matrices, column space and null space: animated intuition for rank and nullspace.

*Lecture content follows MIT OpenCourseWare 18.06 (Gilbert Strang), licensed CC BY-NC-SA 4.0. The robotics examples, numbers and wording in this note are original to this project.*
