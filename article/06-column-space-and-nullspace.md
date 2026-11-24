# Lecture 6 · Column Space and Nullspace

> **The thesis in one sentence:** every matrix carries two subspaces, the column space (everything it can produce) and the nullspace (everything it cannot see), and for a robot arm they are what the hand can do and how the joints can move while the hand stays still.

| | |
|---|---|
| Lecture | MIT 18.06 Linear Algebra, Lecture 6, Prof. Gilbert Strang (46:01) |
| Watch | [Lecture 6 on MIT OpenCourseWare](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-6-column-space-and-nullspace/) |
| Summary and problems | [18.06SC session page](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/column-space-and-nullspace/) · [lecture summary PDF](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/resources/mit18_06scf11_ses1-6sum/) |
| Textbook | Strang, *Introduction to Linear Algebra*, sections 3.1 to 3.2 |
| Interactive page | [`06-column-space-and-nullspace.html`](../06-column-space-and-nullspace.html), Labs 6.1 to 6.4 |
| Code | [`code/l06_column_space_nullspace.py`](../code/l06_column_space_nullspace.py) |

---

## 1. What this lecture is really about

Lecture 1 closed with a question: can `A x = b` be solved for every right-hand side `b`? Lectures 2 to 5 built the machinery of elimination for square matrices that behave well. Lecture 6 comes back to the question for any matrix, square or not, and answers it with a new kind of object: a **subspace**.

The lecture does four things, all on one 4 by 3 matrix.

1. It reviews what a subspace is and tests the idea on unions and intersections.
2. It defines the **column space** `C(A)` and shows that `A x = b` is solvable exactly when `b` is in it.
3. It defines the **nullspace** `N(A)`, the solutions of `A x = 0`, and proves it is always a subspace.
4. It notes that the solutions of `A x = b` with `b ≠ 0` are *not* a subspace, and that the two subspaces were built in two opposite ways.

There is still no algorithm. The systematic way to compute a nullspace arrives in Lecture 7. Lecture 6 is about what the two sets *are*, which is why it translates so directly into robot language.

---

## 2. The ideas, from scratch

### 2.1 Vector spaces and subspaces (review)

A **vector space** is a set of vectors that is closed under the two operations of linear algebra:

- **addition:** if `v` and `w` are in the set, so is `v + w`;
- **multiplication by any number:** if `v` is in the set, so is `c v`.

Both rules together are one test: **every linear combination `c v + d w` of members stays inside.** A **subspace** is a vector space contained in a bigger one.

Taking `c = d = 0` shows that every subspace contains the zero vector. That single check disposes of most candidates.

The subspaces of `R³` are: all of `R³`; any plane through the origin (the lecture's `P`); any line through the origin (the lecture's `L`); and the zero vector alone.

The lecture draws `P` and `L` without numbers. The page and the code use a definite pair so that everything can be checked: `P` = all `(x, y, 0)` and `L` = all multiples of `(1, 1, 1)`.

```
in P:  3 (2, −1, 0) − 2 (−1, 3, 0) = (8, −9, 0)      third entry still 0
in L:  3 (1, 1, 1) − 5 (1, 1, 1)   = (−2, −2, −2)    still a multiple of (1, 1, 1)
```

### 2.2 Union: not a subspace

`P ∪ L` is all vectors in `P` or in `L` or in both. It is **not** a subspace. Take one vector from each and add:

```
v = (2, −1, 0) in P      w = (1, 1, 1) in L      v + w = (3, 0, 1)
```

The sum has a non-zero third entry, so it is not in `P`. Its entries are not all equal, so it is not in `L`. It has left the union. Closure under addition fails.

(The only way a union of two subspaces is a subspace is when one already contains the other.)

### 2.3 Intersection: always a subspace

`P ∩ L` is all vectors in both. Strang proves the general statement: **for any two subspaces `S` and `T`, the intersection `S ∩ T` is a subspace.**

*Proof.* Let `v` and `w` be in `S ∩ T`. Both are in `S`, and `S` is a subspace, so `v + w` is in `S`. Both are in `T`, and `T` is a subspace, so `v + w` is in `T`. So `v + w` is in both, that is, in `S ∩ T`. The same argument with `c v` in place of `v + w` gives the second rule.

For a plane and a line the intersection is usually just the zero vector. If `L` lies inside `P` (for example `L` = multiples of `(1, 1, 0)`) the intersection is all of `L`. The code confirms both cases by solving for the vectors that can be written both ways.

### 2.4 The column space

The lecture's matrix:

```
     [ 1  1  2 ]
     [ 2  1  3 ]
 A = [ 3  1  4 ]        4 rows, 3 columns
     [ 4  1  5 ]
```

The **column space** `C(A)` is the set of all linear combinations of the columns:

```
 C(A) = all  x₁ (1, 2, 3, 4) + x₂ (1, 1, 1, 1) + x₃ (2, 3, 4, 5)
```

It is a subspace by construction (a combination of combinations is a combination). The columns have four components, so **`C(A)` is a subspace of `R⁴`**.

### 2.5 Does `A x = b` have a solution for every `b`?

**No.** There are 4 equations and only 3 unknowns. Three columns cannot fill four-dimensional space, so most `b` are unreachable.

### 2.6 Which `b` allow a solution?

**Exactly the `b` in the column space.** The reason is one line: `A x` *is* a combination of the columns of `A`, so `A x = b` says "`b` is a combination of the columns".

> `A x = b` is solvable if and only if `b` is in `C(A)`.

Right-hand sides that work, from the lecture:

| `b` | why | a solution `x` |
|---|---|---|
| `(1, 2, 3, 4)` | it is column 1 | `(1, 0, 0)` |
| `(1, 1, 1, 1)` | it is column 2 | `(0, 1, 0)` |
| `(0, 0, 0, 0)` | the zero vector is in every subspace | `(0, 0, 0)` |
| any `A x` you compute | you built it from the columns | the `x` you used |

One that fails (this project's example, not the lecture's): `b = (1, 0, 0, 0)`. Elimination on `[A | b]` gives

```
 [ 1   1   2 |  1 ]
 [ 0  −1  −1 | −2 ]
 [ 0   0   0 |  1 ]      ← 0 = 1
 [ 0   0   0 |  2 ]      ← 0 = 2
```

For a general `b` those last two rows read `0 = b₁ − 2b₂ + b₃` and `0 = 2b₁ − 3b₂ + b₄`. So `b` is in `C(A)` exactly when both expressions vanish. Two conditions on four numbers leave a two-dimensional set, which matches the next section.

### 2.7 Independent columns and pivot columns

Are the three columns independent, meaning that each contributes a direction the others cannot make? **No:**

```
 column 1 + column 2 = (1, 2, 3, 4) + (1, 1, 1, 1) = (2, 3, 4, 5) = column 3
```

Column 3 adds nothing new. Remove it and `C(A)` is unchanged. Columns 1 and 2 are the **pivot columns**, by the convention of keeping the first columns that bring something new. (Strang notes that columns 1 and 3, or 2 and 3, would describe the same space equally well.)

So `C(A)` is all combinations of two independent vectors: **a two-dimensional subspace of `R⁴`**, a plane through the origin sitting in four-dimensional space. The code's `rref(A)` reports pivot columns 1 and 2 and rank 2.

### 2.8 The nullspace

The **nullspace** `N(A)` is the set of all solutions `x` of `A x = 0`.

Here `x` has three components (one per column), so **`N(A)` is a subspace of `R³`**. The column space lived in `R⁴`. For an `m` by `n` matrix, `C(A)` is in `R^m` and `N(A)` is in `R^n`. Keeping the two spaces apart is the first thing to get right.

For this `A`:

```
 A (0, 0, 0)  = (0, 0, 0, 0)        always
 A (1, 1, −1) = (0, 0, 0, 0)        because column 1 + column 2 − column 3 = 0
 A (c, c, −c) = (0, 0, 0, 0)        for every number c
```

`N(A)` is the line through the origin of `R³` in the direction `(1, 1, −1)`.

The dependency of 2.7 and the nullspace vector are **one fact written twice**. A relation among the columns is a non-zero vector in the nullspace, and the other way round. (Elimination in the code returns the special solution `(−1, −1, 1)`, which is the same line: it is `−1` times the lecture's vector.)

### 2.9 Why the nullspace is always a subspace

*Proof.* Suppose `A v = 0` and `A w = 0`. Then

```
 A (v + w) = A v + A w = 0 + 0 = 0
 A (c v)   = c (A v)   = c · 0 = 0
```

so `v + w` and `c v` are in the nullspace. Both lines use the linearity of matrix multiplication and nothing else, which is why the proof works for every matrix of every shape.

### 2.10 The solutions of `A x = b` are not a subspace

Take `b = (1, 2, 3, 4)`. Solutions include `(1, 0, 0)` and `(0, −1, 1)`. But:

- the zero vector is **not** a solution, since `A 0 = 0 ≠ b`;
- the sum of the two solutions, `(1, −1, 1)`, gives `A x = (2, 4, 6, 8) = 2b`, not `b`.

The solutions form a line that **does not pass through the origin**. Flat like a subspace, but in the wrong place.

**A look ahead.** The two solutions differ by `(1, 1, −1)`, the nullspace vector. Every solution is one particular solution plus anything from the nullspace:

```
 x = (1, 0, 0) + c (1, 1, −1)        c = −1 gives (0, −1, 1)
```

The lecture only hints at this. A later lecture of the course develops it (the complete solution of `A x = b`).

### 2.11 Two ways to describe a subspace

- **Build it up.** Give some vectors and take all their combinations. The column space is defined this way.
- **Cut it down.** Give some equations and keep every vector that satisfies them. The nullspace is defined this way.

The same subspace can be given both ways. The nullspace of the lecture's matrix is "all multiples of `(1, 1, −1)`" (built up) and also "all `x` with `x₁ + x₃ = 0` and `x₂ + x₃ = 0`" (cut down; these are the two non-zero rows of the reduced matrix `R` printed by the code).

---

## 3. The robotics connection

The one sentence to remember: **the column space of the Jacobian is what the hand can do; the nullspace is how the joints can move while the hand stays still.**

### 3.1 The three-link arm and its Jacobian (Lab 6.3)

**Model.** A planar arm with link lengths `l₁ = 1.6 m`, `l₂ = 1.3 m`, `l₃ = 1.0 m` and relative joint angles `θ₁, θ₂, θ₃` (each measured from the previous link). Write `a₁ = θ₁`, `a₂ = θ₁ + θ₂`, `a₃ = θ₁ + θ₂ + θ₃` for the absolute directions of the links. The hand is at

```
 x = l₁ cos a₁ + l₂ cos a₂ + l₃ cos a₃
 y = l₁ sin a₁ + l₂ sin a₂ + l₃ sin a₃
```

**Derivation of `J`.** Differentiate with respect to time. Joint `i` appears in every `a_k` with `k ≥ i`, so

```
 ∂x/∂θᵢ = − Σ_{k ≥ i} l_k sin a_k = −(y − yᵢ)
 ∂y/∂θᵢ =   Σ_{k ≥ i} l_k cos a_k =  (x − xᵢ)
```

where `(xᵢ, yᵢ)` is the position of joint `i`. In words: **column `i` of `J` is the arrow from joint `i` to the hand, turned a quarter turn anticlockwise.** It is the velocity of the hand when joint `i` alone turns at 1 rad/s and everything beyond it swings like a rigid door.

```
 v = J q̇        J is 2 by 3,  entries in metres (m per rad),
                q̇ in rad/s,  v in m/s
```

**Worked pose** (from the code): joint angles 70°, −60°, −70°. Shoulder at (0, 0), elbow at (0.547, 1.504), wrist at (1.827, 1.729), hand at (2.327, 0.863).

```
     [ −0.863   0.640   0.866 ]
 J = [  2.327   1.780   0.500 ]
```

Check column 1: the arrow from the shoulder to the hand is (2.327, 0.863); turned a quarter turn it is (−0.863, 2.327).

**This is a simplification.** A real arm works in three dimensions and usually has to orient its hand as well as place it. If the planar arm also had to control the angle of its hand, the task would need three numbers, `J` would be 3 by 3, and the spare joint would be gone.

### 3.2 `C(J)`: what the hand can do

`C(J)` is every hand velocity the arm can produce in the present pose. Here the rank is 2, so `C(J)` is all of `R²`: the code confirms that (0.2, 0.1), (−0.3, 0) and (0, 0.25) are all in it. "`A x = b` is solvable exactly when `b` is in `C(A)`" becomes:

> a commanded hand velocity is achievable exactly when it lies in `C(J)`.

**Dependent column in robot terms.** Three vectors in a plane cannot be independent. In this pose

```
 column 3 = −0.404 · column 1 + 0.808 · column 2
```

so for the purpose of moving the hand, joint 3 gives nothing that joints 1 and 2 could not already give. That is concept 2.7 on a machine. The "useless" column is exactly what creates the nullspace.

### 3.3 `N(J)`: self-motion

`N(J)` is every set of joint speeds with `J q̇ = 0`. The joints move, the elbow and wrist swing, the hand does not move. This is **self-motion**, and an arm that has it is **redundant**: more joints than the task needs. With 3 joints and a 2-dimensional task, `dim N(J) = 3 − 2 = 1` in any pose of full rank.

For the worked pose the code finds the nullspace two ways:

- by elimination, with the wrist speed set to 1: `(0.404, −0.808, 1)`;
- as the cross product of the two rows of `J`, scaled to length 1: `(−0.299, 0.600, −0.742)`.

They are the same line (their ratio is −1.348 in every component), and `J` times either one is `(0, 0)`.

*Why the cross product works.* `J q̇ = 0` says that each row of `J`, dotted with `q̇`, gives zero. So `q̇` must be at right angles to both rows. In three dimensions the cross product of two vectors is at right angles to both. This trick is special to matrices with 2 rows and 3 columns. Lecture 7 gives the general method.

*A nullspace vector is an instantaneous statement.* `J` depends on the pose, so `N(J)` changes as the arm moves. To hold the hand still over a finite motion the controller recomputes the nullspace at every step. The code does this for 3 seconds at 0.5 rad/s, with a small correction step each time (solve `(J Jᵀ) λ = error`, then add `Jᵀ λ` to the joints):

| time | joint angles | elbow position | hand position |
|---|---|---|---|
| 0.0 s | (70°, −60°, −70°) | (0.547, 1.504) | (2.327, 0.863) |
| 1.0 s | (60.8°, −42.1°, −90.3°) | (0.781, 1.396) | (2.327, 0.863) |
| 2.0 s | (50.6°, −22.5°, −108.6°) | (1.015, 1.237) | (2.327, 0.863) |
| 3.0 s | (40.1°, −0.6°, −123.7°) | (1.224, 1.031) | (2.327, 0.863) |

The largest distance of the hand from its target over the whole run is `2.3e-11` m. The shoulder turned through 30° and the elbow moved more than 80 cm.

**`N(J)` is a subspace, and that matters.** Because sums and multiples of nullspace vectors stay in the nullspace, a controller can add *any* amount of self-motion to *any* joint command without disturbing the hand. This is the basis of the standard redundancy techniques: obstacle avoidance with the elbow, staying away from joint limits, posture optimisation.

### 3.4 The straight arm: both subspaces change size

Set the angles to 40°, 0°, 0° (arm fully stretched).

```
     [ −2.507  −1.478  −0.643 ]
 J = [  2.988   1.762   0.766 ]
```

Every column is a multiple (3.9, 2.3 and 1.0 times) of `(−0.643, 0.766)`, the direction across the arm. The rank drops to 1.

- `C(J)` collapses to a line. A hand velocity along the arm, `(0.766, 0.643)`, is **not** in `C(J)`. One across the arm, `(−0.643, 0.766)`, is.
- `N(J)` grows to a plane, spanned for example by `(−0.59, 1, 0)` and `(−0.256, 0, 1)`.

The dimensions still add to the number of joints: 2 + 1 = 3 before, 1 + 2 = 3 now. (This is the counting rule that Lecture 7 states in terms of rank.) Roboticists call this pose a **singularity**. The hand loses a direction at the same moment the joints gain a useless one.

One caution for the article: at full stretch the two nullspace directions describe joint speeds that leave the hand still *at that instant*. They are not a finite family of postures, since a fully stretched arm has only one posture for that hand position.

### 3.5 The solutions of `J q̇ = v`: a shifted line

Ask the arm of 3.1 for the hand velocity `v = (0.2, 0.1)` m/s. There are infinitely many joint-speed vectors that do it: one particular solution plus any amount of self-motion.

| choice | `q̇` (rad/s) | length |
|---|---|---|
| smallest solution, `Jᵀ (J Jᵀ)⁻¹ v` | (−0.055, 0.099, 0.103) | 0.153 |
| wrist held still | (−0.096, 0.182, 0) | 0.206 |
| smallest plus 0.3 of self-motion | (−0.145, 0.279, −0.120) | 0.337 |
| smallest minus 0.3 of self-motion | (0.035, −0.081, 0.325) | 0.337 |

Every row gives `J q̇ = (0.2, 0.1)`. In joint-speed space the solutions form a straight line parallel to `N(J)` that misses the origin. It is not a subspace (concept 2.10): the zero vector, "do nothing", does not produce the wanted velocity.

The robot gets to choose a point on that line. The smallest solution is at right angles to the nullspace (the code prints their dot product as 0), which is why adding self-motion in either direction makes the vector longer. Most controllers start from the smallest solution and add a deliberate amount of self-motion to serve a second goal.

### 3.6 The 4 by 3 shape: more sensors than unknowns

The lecture's matrix is taller than it is wide. In robotics that shape is an **over-determined measurement**: more readings than unknown quantities.

A robot stands in a 6 m by 4 m room, square to the walls, with one range sensor facing each wall (west, east, south, north). Each sensor sits the same unknown distance `d` out from the robot's centre. Unknowns: `x`, `y`, `d`. Readings: `x − d`, `(6 − x) − d`, `y − d`, `(4 − y) − d`. Moving the known room size to the right-hand side:

```
     [  1   0  −1 ] [ x ]   [ west      ]
     [ −1   0  −1 ] [ y ] = [ east − 6  ]
     [  0   1  −1 ] [ d ]   [ south     ]
     [  0  −1  −1 ]         [ north − 4 ]
           S
```

`S` has rank 3, so `C(S)` is a three-dimensional subspace of `R⁴`. One condition decides membership: `b₁ + b₂ = b₃ + b₄`. Physically, the east-west pair and the north-south pair must agree about `d`.

- Readings (2.3, 3.3, 1.3, 2.3) m give `b = (2.3, −2.7, 1.3, −1.7)`, which is in `C(S)`, and `(x, y, d) = (2.5, 1.5, 0.2)`.
- Let the north sensor read 5 cm long, 2.35 m. Now `b = (2.3, −2.7, 1.3, −1.65)` is **not** in `C(S)`. No exact solution exists.

Noise pushes `b` out of the column space. Least squares, much later in the course, handles this by replacing `b` with the nearest vector that is in the column space.

Simplifications: the robot is aligned with the walls and the offset is the same for all four sensors.

### 3.7 Union against intersection: two machines

A table-top stage slides along `x` and `y`: its motions are the plane spanned by (1, 0, 0) and (0, 1, 0). A wall gantry slides along `x` and `z`: the plane spanned by (1, 0, 0) and (0, 0, 1). Each is a subspace.

- **Intersection** (motions both can make): all multiples of (1, 0, 0). A line, a subspace.
- **Union** (motions at least one can make): not a subspace. (0, 1, 0) + (0, 0, 1) = (0, 1, 1), and neither machine can perform that.

You cannot add a motion of robot A to a motion of robot B and expect either robot to perform the sum.

### 3.8 Two descriptions: the differential-drive rover

A rover with two driven wheels of radius `r`, a distance `W` apart, has body velocity `(vx, vy, ω)`: forward speed, sideways speed, turning rate. With wheel speeds `ω_L`, `ω_R` in rad/s:

```
 vx = r (ω_L + ω_R) / 2          [ vx ]   [  r/2   r/2 ] [ ω_L ]
 vy = 0                    →     [ vy ] = [   0     0  ] [ ω_R ]
 ω  = r (ω_R − ω_L) / W          [ ω  ]   [ −r/W   r/W ]
                                                 G
```

- **By generators:** the allowed velocities are `C(G)`, everything the two wheel columns can produce.
- **By constraints:** the wheels cannot slide sideways, `[0 1 0] (vx, vy, ω) = 0`. The allowed velocities are `N([0 1 0])`.

Both describe the same plane `vy = 0`. The code checks it for `r = 0.1` m and `W = 0.5` m, where `G = [0.05 0.05; 0 0; −0.2 0.2]`: both subspaces have dimension 2 and each column of `G` satisfies the constraint. A wanted velocity (0.3, 0, 0.4) is in the plane and needs wheel speeds (2, 4) rad/s. A wanted velocity (0.3, 0.1, 0) fails both descriptions at once. Ideal wheels that never skid are assumed.

---

## 4. Concept-to-robot table

| Lecture idea | Plain words | In a robot |
|---|---|---|
| Subspace | A set where every combination stays inside | The set of velocities a robot can produce at one moment |
| Union of subspaces | In one or the other; usually not a subspace | Motions at least one of two machines can make; their sums belong to neither |
| Intersection of subspaces | In both; always a subspace | Motions both machines can make |
| Column space `C(A)` | Everything `A x` can be | Every hand velocity the arm can produce in its present pose |
| `A x = b` solvable iff `b` in `C(A)` | You can only ask for what the columns can build | A commanded velocity is achievable exactly when it lies in `C(J)` |
| More equations than unknowns | Most right-hand sides are unreachable | More sensors than unknowns: readings must be consistent, and noise breaks that |
| Dependent column | A column the others can already build | A joint that gives the hand no new direction |
| Pivot columns | The columns that bring something new | A smallest set of joints that already covers the task |
| Nullspace `N(A)` | Everything `A` sends to zero | Self-motion: joints move, hand stays still |
| `N(A)` is a subspace | Sums and multiples of null vectors are null | Self-motions can be scaled, reversed and added to any command |
| Solutions of `A x = b`, `b ≠ 0` | The nullspace shifted off the origin | All joint speeds for one hand velocity: one choice plus any self-motion |
| Two descriptions of a subspace | Built up from vectors, or cut down by equations | What the actuators can produce, or what the constraints allow |

---

## 5. Common mistakes and misconceptions

- **Putting `C(A)` and `N(A)` in the same space.** For an `m` by `n` matrix the column space is in `R^m` (outputs) and the nullspace is in `R^n` (inputs). For the arm, `C(J)` is a set of hand velocities and `N(J)` is a set of joint-speed vectors. They cannot be drawn on the same axes.
- **"The union of two subspaces is a subspace."** Only if one contains the other. The correct way to combine two subspaces into a bigger one is to take all sums, which the lecture does not cover.
- **"The intersection might be empty."** Never. Every subspace contains the zero vector, so the intersection contains at least that.
- **"The solutions of `A x = b` form a subspace."** Only when `b = 0`. Otherwise the zero vector is missing. The solution set is a shifted copy of the nullspace.
- **"A dependent column is useless."** For the column space, yes. But the dependency is exactly what gives a non-zero nullspace, and in a robot that is the redundancy people pay for.
- **"Pivot columns are special vectors."** They are a convention: the first columns, left to right, that add something new. Other choices of two columns span the same space here.
- **"The nullspace of `J` is a set of postures."** It is a set of joint *speeds* at one pose. Following it over time traces out postures, but the nullspace has to be recomputed along the way.
- **"Redundant means wasteful."** In robotics redundant means having more joints than the task needs, and it is a feature.
- **Checking a subspace with only one rule.** The set of vectors with `x ≥ 0` is closed under addition but not under multiplication by −1. Both rules are needed.

---

## 6. Analogies and sentences you can use

- **Column space as a menu.** The columns are the ingredients a kitchen stocks. The column space is every dish that can be made. Ordering `b` works exactly when `b` is on the menu.
- **Nullspace as silent input.** The nullspace is everything you can feed the matrix without the output noticing.
- **Self-motion in your own arm.** Put a fingertip on the table and keep it there. Your elbow can still swing. That swing is a walk along a nullspace.
- **Shifted nullspace as a railway.** All solutions of `A x = b` lie on a track parallel to the nullspace. A particular solution tells you which track; the nullspace tells you which way the track runs.
- **Generators and constraints.** A subspace can be handed to you as a list of things you may do (generators) or as a list of things you may not violate (constraints). Actuators give the first kind of list, physics gives the second.
- A sentence for the article: *"The column space of the Jacobian is what the hand can do, and the nullspace is how the joints can move while the hand stays still."*
- Another: *"`A x = b` is solvable exactly when `b` is in the column space, so 'can the robot do it?' is a question about a subspace."*
- Another: *"A straight arm loses a direction for its hand at the same instant it gains a useless one for its joints."*

---

## 7. Figures worth including

Every figure below is already captured in `article/figures/` (see the [figure pack](figures.md)). To retake one in a different state, open the lab, set it up, and screenshot it, or edit `tools/figures/l6.js` and run `node tools/figures.js 6`.

| Figure | Ready-made file | How it was set up |
|---|---|---|
| A sum that escapes the union | `l6-union-escapes.png` | Lab 6.1 as it opens: `v` in the plane, `w` on the line, `v + w` in neither |
| The intersection growing to a line | `l6-intersection-line.png` | Lab 6.1, "L lies inside P" |
| Building `b` from the columns | `l6-colspace-build.png` | Lab 6.2 as it opens, "Build b from x" |
| A `b` inside the column space, and one outside | `l6-colspace-solvable.png`, `l6-colspace-impossible.png` | Lab 6.2, "Test any b", presets (2, 3, 4, 5) and (1, 0, 0, 0) |
| Lifting `b` off the plane | `l6-colspace-lifted.png` | Lab 6.2, preset (1, 2, 3, 4), lift slider at +2: row 3 reads 0 = 2 |
| The arm, its Jacobian and a nullspace vector | `l6-arm-jacobian.png` | Lab 6.3 as it opens |
| Self-motion: joints move, hand stays | `l6-arm-self-motion.png`, `l6-arm-self-motion-far.png` | Lab 6.3 after running self-motion for about 3 seconds, at 0.5 and at 1 rad/s |
| A different pose has a different nullspace | `l6-arm-other-pose.png` | Lab 6.3 after dragging the hand up and to the left, then running |
| The singular pose | `l6-arm-straight.png` | Lab 6.3 after "Straighten": rank 1, `C(J)` a line, `N(J)` a plane |
| Solutions as a shifted nullspace | `l6-shifted-lines.png`, `l6-shifted-two-solutions.png` | Lab 6.4 as it opens; then with `b` doubled and `c = 1` |
| The one case that is a subspace | `l6-shifted-b-zero.png` | Lab 6.4 with the size of `b` at 0: the two lines coincide |

---

## 8. Check questions

1. **A plane and a line through the origin of `R³`, the line not in the plane. Is the union a subspace? The intersection?** The union is not: a sum of one non-zero vector from each is in neither. The intersection is the zero vector alone, which is a subspace.
2. **The lecture's matrix is 4 by 3. Where do `C(A)` and `N(A)` live?** `C(A)` in `R⁴` (columns have four entries), `N(A)` in `R³` (`x` has three).
3. **Is `b = (3, 4, 5, 6)` in the column space of the lecture's matrix?** Yes: column 1 + 2·column 2, so `x = (1, 2, 0)`. The conditions agree: `3 − 8 + 5 = 0` and `6 − 12 + 6 = 0`.
4. **Column 3 = column 1 + column 2. What does that say about each subspace?** `C(A)` needs only columns 1 and 2 and is a plane in `R⁴`. `(1, 1, −1)` is in `N(A)`, which is a line in `R³`.
5. **Why can the solutions of `A x = b`, `b ≠ 0`, never form a subspace?** `A 0 = 0 ≠ b`, so the zero vector is missing.
6. **A planar three-joint arm that only places its hand: dimensions of `C(J)` and `N(J)` in an ordinary pose, and the meaning of a vector in `N(J)`?** 2 and 1. A nullspace vector is a set of joint speeds that leaves the hand still: self-motion.
7. **The same arm stretched straight?** Rank 1. `C(J)` is a line (sideways only), `N(J)` is a plane. The dimensions still add to 3.

---

## 9. Practice problems with worked solutions

The same ten problems as on the page, with full solutions. All answers are reproduced by `code/l06_column_space_nullspace.py` (section 14 of its output).

**P1. The subspace test.** Which of these sets of vectors `(x, y)` are subspaces of `R²`? (a) All multiples of (1, 2). (b) All vectors with `x + y = 1`. (c) All vectors with `x ≥ 0`.

*Solution.* (a) Sums and multiples of multiples of (1, 2) are multiples of (1, 2); for instance `3(1, 2) − 4(2, 4) = (−5, −10)`. A subspace. (b) The zero vector has `x + y = 0`, so it is missing; also `(1, 0) + (0, 1) = (1, 1)` has `x + y = 2`. Not a subspace. (c) `(1, 0)` is in the set but `−1 · (1, 0) = (−1, 0)` is not. Not a subspace. **Only (a).**

**P2. Union and intersection.** In `R³`, `S` is all `(0, y, z)` and `T` is all `(x, 0, z)`. Describe `S ∩ T` and show `S ∪ T` is not a subspace.

*Solution.* A vector in both has first entry 0 and second entry 0: `(0, 0, z)`. So **`S ∩ T` is the z axis**, all multiples of (0, 0, 1), a subspace. For the union: `(0, 1, 0) + (1, 0, 0) = (1, 1, 0)`, which is in neither plane.

**P3. A column space.** Describe the column space of `[1 2; 2 4; 3 6]`. Is (2, 4, 6) in it? Is (1, 2, 4)?

*Solution.* The columns have three entries, so `C(A)` is in `R³`. Column 2 is twice column 1, so there is one independent column and **`C(A)` is the line of multiples of (1, 2, 3)**. `(2, 4, 6) = 2(1, 2, 3)` is in it. `(1, 2, 4)` is not: matching the first entry forces the multiplier 1, which gives third entry 3.

**P4. Which `b`?** For `A = [1 0; 0 1; 1 1]`, find the condition on `b` for `A x = b` to be solvable, and solve for `b = (2, 3, 5)`.

*Solution.* The equations are `x₁ = b₁`, `x₂ = b₂`, `x₁ + x₂ = b₃`. The first two fix `x`; the third then requires **`b₃ = b₁ + b₂`**. For (2, 3, 5): `2 + 3 = 5`, so **`x = (2, 3)`**. Change the 5 to 6 and there is no solution.

**P5. A nullspace.** Find the nullspace of `B = [1 2 3; 2 4 6]`.

*Solution.* `x` has three entries, so `N(B)` is in `R³`. Row 2 is twice row 1, leaving one equation, `x₁ + 2x₂ + 3x₃ = 0`. Two unknowns are free. `x₂ = 1, x₃ = 0` gives `(−2, 1, 0)`; `x₂ = 0, x₃ = 1` gives `(−3, 0, 1)`. **`N(B)` is the plane spanned by (−2, 1, 0) and (−3, 0, 1)**, dimension 2. Each vector records a dependency: column 2 = 2·column 1 and column 3 = 3·column 1.

**P6. A shifted nullspace.** For the lecture's `A` and `b = (2, 3, 4, 5)`, find two solutions by inspection, then all solutions.

*Solution.* `b` is column 3, so `x = (0, 0, 1)`. Column 3 = column 1 + column 2, so `x = (1, 1, 0)` too. Their difference is `(1, 1, −1)`, the nullspace vector. **All solutions: `(0, 0, 1) + c (1, 1, −1)`.** Not a subspace: the sum `(1, 1, 1)` gives `A x = (4, 6, 8, 10) = 2b`.

**P7. Jacobian, column space and nullspace of an arm (robot).** Three links of length 1; shoulder at 0°, elbow bent 90°, wrist bent 90°. Joints at (0, 0), (1, 0), (1, 1); hand at (0, 1). Find `J`, `C(J)`, `N(J)`.

*Solution.* Column *i* is the arrow from joint *i* to the hand, turned a quarter turn: `(a, b) → (−b, a)`. Shoulder: (0, 1) → (−1, 0). Elbow: (−1, 1) → (−1, −1). Wrist: (−1, 0) → (0, −1).

```
     [ −1  −1   0 ]
 J = [  0  −1  −1 ]
```

Columns 1 and 3 are independent, so the rank is 2 and **`C(J)` is all of `R²`**. For the nullspace: `−q̇₁ − q̇₂ = 0` and `−q̇₂ − q̇₃ = 0`; with `q̇₃ = 1`, `q̇₂ = −1`, `q̇₁ = 1`. **`N(J)` is all multiples of (1, −1, 1).**

**P8. The same arm stretched straight (robot).** The arm lies along the x axis with the hand at (3, 0). Find `J`. Can the hand move along (1, 0)? Dimensions of `C(J)` and `N(J)`?

*Solution.* Arrows (3, 0), (2, 0), (1, 0) turn into (0, 3), (0, 2), (0, 1).

```
     [ 0  0  0 ]
 J = [ 3  2  1 ]
```

Rank 1. The top row is zero, so **no motion along (1, 0) is possible**. `C(J)` is the line of multiples of (0, 1), dimension 1. `N(J)` is the plane `3q̇₁ + 2q̇₂ + q̇₃ = 0`, dimension 2, spanned by the special solutions (−2/3, 1, 0) and (−1/3, 0, 1), or equally by (−2, 3, 0) and (−1, 0, 3). `1 + 2 = 3`.

**P9. Choosing joint speeds (robot).** For the bent arm of P7, the hand must move at (1, 0). Find the joint speeds with the wrist still, with the shoulder still, and the shortest.

*Solution.* Wrist still (`q̇₃ = 0`): row 2 gives `q̇₂ = 0`, row 1 gives `q̇₁ = −1`: **(−1, 0, 0)**. All solutions: `(−1, 0, 0) + c (1, −1, 1) = (c − 1, −c, c)`. Shoulder still: `c = 1`, **(0, −1, 1)**. Shortest: minimise `(c − 1)² + 2c² = 3c² − 2c + 1`, giving `c = 1/3` and **(−2/3, −1/3, 1/3)**, of length 0.816. All three give hand velocity (1, 0).

**P10. Sensor consistency (robot).** A cart on a rail between walls 10 m apart, at position `x`. Rear sensor reads `x + d`, front sensor reads `(10 − x) + d`, with a shared unknown offset `d`. A tape reads `x`. (a) Readings 5, 7, 4. (b) Readings 5, 7, 5.

*Solution.*

```
 [  1  1 ] [ x ]   [ rear       ]
 [ −1  1 ] [ d ] = [ front − 10 ]
 [  1  0 ]         [ tape       ]
```

Row 1 minus row 2: `2x = b₁ − b₂`. Row 3: `x = b₃`. So `b` is in the column space exactly when `b₁ − b₂ = 2b₃`. (a) `b = (5, −3, 4)`: `8 = 8`. Consistent, **`x = 4`, `d = 1`**. (b) `b = (5, −3, 5)`: `8 ≠ 10`. **No exact solution**: `b` has left the column space, at least one sensor is wrong, and these three numbers cannot say which. An extra sensor cannot promise a better answer. What it gives the robot is a way to notice a fault.

---

## 10. Go deeper

- Strang, *Introduction to Linear Algebra*, sections 3.1 and 3.2: spaces of vectors, the column space, and the nullspace.
- Lynch and Park, *Modern Robotics*, chapter 5 (velocity kinematics and statics): the Jacobian, singularities, and redundant arms.
- Siciliano, Sciavicco, Villani and Oriolo, *Robotics: Modelling, Planning and Control*, the chapter on differential kinematics: redundancy and the use of null-space motion in control.
- Siegwart, Nourbakhsh and Scaramuzza, *Introduction to Autonomous Mobile Robots*, the chapter on mobile robot kinematics: wheel constraints for differential-drive robots.
- 3Blue1Brown, *Essence of Linear Algebra*, chapter 7 (inverse matrices, column space and null space): animated intuition for both subspaces.

*Lecture content follows MIT OpenCourseWare 18.06 (Gilbert Strang), licensed CC BY-NC-SA 4.0. The robotics examples, numbers and wording in this note are original to this project.*
