# Lecture 5 · Transposes, Permutations, Spaces Rⁿ

> **The thesis in one sentence:** the lecture finishes elimination with one re-ordering matrix and one flip, then changes the question from "what is the answer?" to "what is the set of everything that can be reached?", and for a robot that set is everything it can do.

| | |
|---|---|
| Lecture | MIT 18.06 Linear Algebra, Lecture 5, Prof. Gilbert Strang (47:42) |
| Watch | [Lecture 5 on MIT OpenCourseWare](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-5-transposes-permutations-spaces-r-n/) |
| Summary and problems | [18.06SC session page](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/transposes-permutations-vector-spaces/) · [lecture summary PDF](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/resources/mit18_06scf11_ses1-5sum/) |
| Textbook | Strang, *Introduction to Linear Algebra*, sections 2.7 and 3.1 |
| Interactive page | [`05-transposes-permutations-spaces.html`](../05-transposes-permutations-spaces.html), Labs 5.1 to 5.5 |
| Code | [`code/l05_transposes_spaces.py`](../code/l05_transposes_spaces.py) |

---

## 1. What this lecture is really about

Lecture 5 is a hinge. Its first half closes the chapter on solving `A x = b`. Its second half opens the chapter that the rest of the course is built on.

**The first half** deals with the one loose end of elimination. Lectures 2 and 4 assumed that every pivot came out non-zero. When a zero turns up in a pivot position, rows must be exchanged, and a row exchange is a multiplication by a **permutation matrix** `P`. The clean statement `A = LU` becomes `PA = LU`, and in that form it holds for every invertible matrix. Two small tools arrive with it: the **transpose** and the **symmetric matrix**.

**The second half** steps back from single systems to whole sets of vectors. A **vector space** is a set you can add and scale inside without leaving. A **subspace** is a vector space inside a bigger one. The lecture lists every subspace of the plane and of three-dimensional space, and ends by building a subspace from the columns of a matrix: the **column space**.

For an article on robotics, both halves pay off. The transpose is the bridge between motion and force. Subspaces are the right language for "what can this machine do?".

---

## 2. The ideas, from scratch

### 2.1 Permutation matrices

The **identity matrix** `I` has ones on the diagonal and zeros elsewhere, and multiplying by it changes nothing. A **permutation matrix** `P` is the identity with its rows re-ordered. Multiplying `P A` re-orders the rows of `A` in the same way.

```
     [ 0 1 0 ] [ 0 1 1 ]   [ 1 2 1 ]
     [ 1 0 0 ] [ 1 2 1 ] = [ 0 1 1 ]        rows 1 and 2 exchanged
     [ 0 0 1 ] [ 2 7 9 ]   [ 2 7 9 ]
```

**How many are there?** For `n` rows there are `n` choices for the first row, `n − 1` for the second, and so on: `n!` in all. There are 6 of size 3 and 24 of size 4.

```
 [1 0 0]  [0 1 0]  [0 0 1]  [1 0 0]  [0 1 0]  [0 0 1]
 [0 1 0]  [1 0 0]  [0 1 0]  [0 0 1]  [0 0 1]  [1 0 0]
 [0 0 1]  [0 0 1]  [1 0 0]  [0 1 0]  [1 0 0]  [0 1 0]
```

The first is the identity. The next three swap one pair of rows. The last two cycle all three. The product of any two of them is again one of the six.

**The inverse is the transpose.** `P⁻¹ = Pᵀ`, or equivalently `PᵀP = I`. The reason: each row of `P` holds a single 1. A row dotted with itself gives 1. Two different rows have their ones in different places and give 0. Those dot products are exactly the entries of `PᵀP` (the script checks all 2, 6 and 24 matrices of sizes 2, 3 and 4).

### 2.2 PA = LU

With row exchanges, `A = LU` becomes

```
 P A = L U
```

`P` holds the row exchanges, `L` the multipliers, `U` the upper triangular result. It works for **every invertible `A`**. If no exchange is needed, `P = I`.

The lecture states this without a numerical example. Here is one (it is the first preset of Lab 5.1):

```
     [ 0 1 1 ]        The first pivot position holds 0. Exchange rows 1 and 2.
 A = [ 1 2 1 ]        Row 2 then already has 0 in column 1 (multiplier 0).
     [ 2 7 9 ]        Row 3 − 2·row 1 = (0, 3, 7).  Row 3 − 3·row 2 = (0, 0, 4).

     [ 0 1 0 ]        [ 1 0 0 ]        [ 1 2 1 ]
 P = [ 1 0 0 ]    L = [ 0 1 0 ]    U = [ 0 1 1 ]      pivots 1, 1, 4
     [ 0 0 1 ]        [ 2 3 1 ]        [ 0 0 4 ]
```

Check the last row of `LU`: `2·(1, 2, 1) + 3·(0, 1, 1) + (0, 0, 4) = (2, 7, 9)`.

If `A` is singular, some column eventually has nothing but zeros from the diagonal down, and no exchange can help. Example: `[1 2 3; 2 4 6; 1 1 1]` (row 2 is twice row 1) has no `PA = LU` with three pivots.

### 2.3 Partial pivoting: exchanging rows when you do not have to

Strang remarks that software such as Matlab exchanges rows even when the pivot is not zero, if it is small. The habit has a name, **partial pivoting**: before clearing a column, bring the entry of largest size into the pivot position. Every multiplier then has size at most 1.

Why it matters: a computer keeps a fixed number of significant digits and rounds after every operation. A tiny pivot makes a huge multiplier, and a huge multiple of the pivot row swamps the row it is subtracted from.

The classic demonstration, with every result rounded to **three significant digits**:

```
 0.0001 x + y = 1
      x + y = 2                 true answer: x = 1.0001, y = 0.9999
```

| | No exchange (pivot 0.0001) | Rows exchanged first (pivot 1) |
|---|---|---|
| Multiplier | 1 / 0.0001 = 10000 | 0.0001 / 1 = 0.0001 |
| New row 2 | 1 − 10000 = −9999, stored as −10000 | 1 − 0.0001 = 0.9999, stored as 1 |
| New right side | 2 − 10000 = −9998, stored as −10000 | 1 − 0.0002 = 0.9998, stored as 1 |
| y | −10000 / −10000 = 1 | 1 / 1 = 1 |
| x | (1 − 1) / 0.0001 = **0** | (2 − 1) / 1 = **1** |
| Error | 1 | 0.00014 |

The rounding in the left column threw away the 1 and the 2, which were everything the equation `x + y = 2` had to say. What is left of row 2 is `−10000 y = −10000`, a copy of row 1. One equation has been erased.

The full sweep (from the script, and reproduced live in Lab 5.1, part 2):

| Pivot | No exchange (x, y) | Error | With exchange (x, y) | Error |
|---|---|---|---|---|
| 0.1 | (1.11, 0.889) | 0.0011 | (1.11, 0.889) | 0.0011 |
| 0.01 | (1, 0.99) | 0.01 | (1.01, 0.99) | 0.00014 |
| 0.001 | (1, 0.999) | 0.001 | (1, 0.999) | 0.001 |
| 0.0005 | (0, 1) | 1 | (1, 0.999) | 0.00071 |
| 0.0001 | (0, 1) | 1 | (1, 1) | 0.00014 |
| 0.000001 | (0, 1) | 1 | (1, 1) | 0.0000014 |

Without the exchange the answer collapses once the multiplier passes 1000, and it stays collapsed. With the exchange the error only shrinks.

A point worth making in an article: **this problem is not ill-conditioned.** The two lines cross at 45°. Lecture 1's nearly parallel lines were a bad problem; this is a good problem solved in a bad order, and an exchange cures it completely.

### 2.4 Transposes

The transpose `Aᵀ` turns rows into columns: `(Aᵀ)ᵢⱼ = Aⱼᵢ`.

```
     [ 1 3 ]
 A = [ 2 3 ]         Aᵀ = [ 1 2 4 ]          (the lecture's example)
     [ 4 1 ]              [ 3 3 1 ]
```

A 3 by 2 matrix becomes 2 by 3. Geometrically it is a flip across the main diagonal: diagonal entries stay put, every other entry trades places with its mirror image. The 4 in row 3, column 1 moves to row 1, column 3. Flipping twice restores the matrix: `(Aᵀ)ᵀ = A`.

**Rule for products:** `(AB)ᵀ = BᵀAᵀ`, in reverse order, for the same reason that inverses reverse (socks, then shoes; undoing it starts with the shoes).

### 2.5 Symmetric matrices

A matrix is **symmetric** when `Aᵀ = A`. It must be square, and its entries mirror across the diagonal. The lecture's example:

```
 [ 3 1 7 ]
 [ 1 2 9 ]
 [ 7 9 4 ]
```

### 2.6 RᵀR is always symmetric

For **any** matrix `R`, even a rectangular one, `RᵀR` is symmetric. Proof by transposing:

```
 (RᵀR)ᵀ = Rᵀ (Rᵀ)ᵀ = RᵀR
```

The lecture's numbers: the 3 by 2 matrix above times its transpose.

```
 [ 1 3 ]               [ 10 11  7 ]
 [ 2 3 ] [ 1 2 4 ]  =  [ 11 13 11 ]
 [ 4 1 ] [ 3 3 1 ]     [  7 11 17 ]
```

Here `R` is the wide matrix and `Rᵀ` the tall one. The other order gives a 2 by 2 matrix, also symmetric: `[21 13; 13 19]`.

The down-to-earth reason: entry (1, 2) is row 1 dotted with row 2, `1·2 + 3·3 = 11`. Entry (2, 1) is row 2 dotted with row 1, `2·1 + 3·3 = 11`. A dot product does not care about order.

### 2.7 Vector spaces

A **vector space** is a set of vectors in which you can add any two members and multiply any member by any number and stay inside the set. Equivalently, every **linear combination** of members is a member. The set is said to be **closed** under addition and scalar multiplication.

- `R²`: all vectors with two real components, the whole x-y plane.
- `R³`: all vectors with three real components.
- `Rⁿ`: all vectors with `n` real components.

**The zero vector is in every vector space**, because you may multiply any member by 0.

(The formal definition lists eight rules of arithmetic. For vectors of numbers they hold automatically, so the working test is closure.)

**Not a vector space:** the first quadrant of `R²`, all vectors with both components ≥ 0. Adding two of them stays inside. Multiplying by a negative number leaves: `−1 · (2, 1) = (−2, −1)`.

### 2.8 Subspaces

A **subspace** is a vector space inside a bigger one. Two tests, both for every choice:

1. `v + w` stays in the set.
2. `c v` stays in the set, for every number `c`.

A fast first check: the zero vector must be in the set.

- A line through the origin in `R²` **is** a subspace.
- A line that misses the origin is **not**: it lacks the zero vector, and `2v` leaves the line.

Checked numerically in the script with `v`, `w` from each set and `c = −1.5`:

| Set | Contains 0 | v + w inside | c v inside | Verdict |
|---|---|---|---|---|
| Line through origin, `x − 2y = 0` | yes | yes | yes | subspace |
| Line missing origin, `x − 2y = −3` | no | no | no | not a subspace |
| First quadrant | yes | yes | no | not a subspace |
| Whole plane | yes | yes | yes | subspace |
| Zero vector alone | yes | yes | yes | subspace |
| Disc of radius 2 | yes | no | no | not a subspace |

One failure proves a set is not a subspace. One success proves nothing: the first quadrant passes the scaling test for every positive `c`.

### 2.9 Every subspace of R² and R³

**Subspaces of `R²`:** (1) all of `R²`; (2) any line through (0, 0); (3) the zero vector alone, which Strang calls `Z`.

**Subspaces of `R³`:** (1) all of `R³`; (2) any plane through the origin; (3) any line through the origin; (4) the zero vector alone.

Nothing curved, nothing bounded, nothing that misses the origin.

### 2.10 The column space

Take the lecture's matrix once more:

```
     [ 1 3 ]
 A = [ 2 3 ]
     [ 4 1 ]
```

Its columns (1, 2, 4) and (3, 3, 1) are two vectors in `R³`. All their linear combinations form a subspace, the **column space** `C(A)`. Sums of combinations are combinations, and multiples of combinations are combinations, so both tests pass.

Because the two columns are not on the same line, `C(A)` is **a plane through the origin**. A vector at right angles to both columns is (−10, 11, −3), so the plane is `10x − 11y + 3z = 0`. Members: (4, 5, 5) = column 1 + column 2, and (−1, 1, 7) = 2·column 1 − column 2. A non-member: (1, 0, 0), for which `10x − 11y + 3z = 10`.

This is where Lecture 6 starts: `A x = b` can be solved exactly when `b` is in `C(A)`.

---

## 3. The robotics connection

The sentence to remember: **motion goes out through `J`, force comes back through `Jᵀ`, and a subspace is everything a mechanism can do before its limits are counted.**

### 3.1 Permutations: ordering and labelling

Each row of a robot's system comes from one sensor reading or one force balance. A row exchange chooses which of them the solver handles first. The robot is unchanged; only the paperwork is re-ordered.

Permutation matrices also describe wiring. If three wheel encoders reach the computer in the order (2, 3, 1), the readings have been multiplied by `P = [0 1 0; 0 0 1; 1 0 0]`. To restore them, multiply by `Pᵀ`. No inverse is computed. (Practice problem P7 does this with numbers.)

### 3.2 Partial pivoting: do not divide by your weakest measurement

Read `0.0001 x + y = 1` and `x + y = 2` as two sensors measuring the same two unknowns. The first sensor barely responds to `x` (gain 0.0001). The second responds at full strength. Using row 1 as the pivot row means computing `x` from the sensor that can hardly see it, by dividing a small leftover by 0.0001, which multiplies any rounding in that leftover by ten thousand.

Partial pivoting is the numerical version of common sense: pin a quantity down with the equation that sees it best. Robot controllers solve small systems thousands of times a second using numbers that come from real sensors and from finite-precision arithmetic, so their solvers always pivot. A real controller keeps about 16 digits, not 3, so the failure appears at much smaller pivots, but the mechanism is identical.

### 3.3 Undoing a rotation is a transpose

A robot's rotation matrix `R` turns body-frame directions into world-frame directions. Like a permutation matrix, its inverse is its transpose. For a 30° turn:

```
 R = [ 0.866 −0.5   ]      Rᵀ R = [ 1 0 ]
     [ 0.5    0.866 ]             [ 0 1 ]
```

The body vector (1, 0) becomes (0.866, 0.5) in the world, and `Rᵀ` sends it back to (1, 0). Converting between frames never needs elimination.

### 3.4 Force and motion duality: τ = Jᵀ F (Lab 5.3)

Lecture 1 introduced the Jacobian `J` of a two-link arm: joint speeds `q̇` in, hand velocity `v = J q̇` out. Column *i* of `J` is the hand velocity produced by joint *i* alone, in metres per second for each radian per second.

Now the hand must push on the world with a force `F` (newtons). What torques `τ` (newton metres) must the motors supply? Use power. The motors deliver `τ · q̇` watts. The hand delivers `F · v` watts. With no friction and nothing being accelerated, the two are equal **for every possible `q̇`**:

```
 τ₁q̇₁ + τ₂q̇₂ = F · (q̇₁ c₁ + q̇₂ c₂) = q̇₁ (c₁ · F) + q̇₂ (c₂ · F)
```

where `c₁`, `c₂` are the columns of `J`. Matching what multiplies each joint speed gives `τ₁ = c₁ · F` and `τ₂ = c₂ · F`. Stack the columns as rows:

```
 τ = Jᵀ F
```

In matrix language the same derivation is one line: `τᵀq̇ = Fᵀ(J q̇) = (JᵀF)ᵀ q̇` for all `q̇`. Units check: `J` is in metres, `F` in newtons, `τ` in newton metres.

**The geometric meaning.** Column *i* is the arrow from joint *i* to the hand, turned a quarter turn. Dotting it with `F` gives the moment of `F` about joint *i*: force times lever arm, where the lever arm is the distance from the joint to the line along which the force acts. The script computes the torques both ways and they agree.

**Worked numbers.** Links 0.5 m and 0.4 m. Upper link straight up (shoulder at 90°), forearm level (elbow at −90°), like a waiter's arm under a tray. Hand at (0.4, 0.5).

```
 J = [ −0.5   0   ]       Jᵀ = [ −0.5  0.4 ]
     [  0.4   0.4 ]            [  0    0.4 ]
```

| Case | Pose | Hand force F (N) | Torques τ (N·m) | Lever arms (m) |
|---|---|---|---|---|
| Worked example | forearm level | (0, 10) up | (4, 4) | (0.40, 0.40) |
| Force through the elbow | forearm level | (10, 0) along the forearm | (−5, 0) | (0.50, 0.00) |
| Straight arm, force along it | arm straight up | (0, 10) | (0, 0) | (0.00, 0.00) |
| Straight arm, force across it | arm straight up | (10, 0) | (−9, −4) | (0.90, 0.40) |
| Elbow bent 10° only | nearly straight | (0, 10) | (0.69, 0.69) | (0.07, 0.07) |

Power check on the worked example with joint speeds (1, 2) rad/s: hand velocity (−0.5, 1.2) m/s, hand power `F · v` = 12 W, motor power `τ · q̇` = 12 W.

Three things to draw out:

- **A force aimed through a joint costs that joint nothing.** Second row of the table: the push runs along the forearm, so the elbow torque is zero.
- **A force along a straight arm costs both joints nothing.** The line of the force passes through the elbow and the shoulder. The links carry the load and the motors rest. A weightlifter locks the arms out for this reason, and a person standing with straight knees is doing the same.
- **The same 10 N costs anything from 0 to 9 N·m** depending only on pose and direction. Posture is a design variable.

**The duality with Lecture 1.** A straight arm is at a singularity: it cannot move its hand along its own length. The force result is the other face of the same fact: along that direction it can resist any force with no torque. If `u` is a direction with `Jᵀu = 0`, then no joint motion produces velocity along `u`, and a force along `u` needs no torque.

**Honesty about the model.** Planar arm, held still, no friction, no weight in the links. A real controller adds the torques that hold up the arm itself (gravity compensation) and those needed to accelerate it.

**Why engineers care.** `τ = JᵀF` lets an arm apply a chosen force with no force sensor in the hand: the controller computes `JᵀF` and commands those torques.

### 3.5 Symmetric matrices in a robot

`JᵀJ` and `JJᵀ` are of the `RᵀR` form, so both are symmetric for every pose. For the worked-example pose:

```
 J Jᵀ = [  0.25 −0.2  ]        Jᵀ J = [ 0.41 0.16 ]
        [ −0.2   0.32 ]               [ 0.16 0.16 ]
```

Two more symmetric matrices sit at the centre of robotics:

- the **inertia (mass) matrix**, which says how hard each joint is to accelerate; the coupling between joints 1 and 2 is the same in both directions;
- the **covariance matrix** of sensor noise; how sensor 1's error varies with sensor 2's is the same as the reverse.

Practical use: if software prints one of these and two mirrored entries differ, there is a bug.

### 3.6 Vector space: the space of body velocities

A robot on a flat floor has, at any instant, a forward speed `vx`, a sideways speed `vy` and a turn rate `ω`. Its **body velocity** `(vx, vy, ω)` is a vector in `R³`. Motions add (drive while turning) and scale (faster, slower, reversed), so the set of all body velocities is the vector space `R³`. An omni-wheel robot can produce all of it.

"The zero vector is in every vector space" reads, for a robot: **standing still is always one of the options.**

### 3.7 Subspace: what a rover can do (Lab 5.5)

A differential-drive rover has two powered wheels of radius `r`, a track width `W` apart, turning at `ωL` and `ωR` rad/s. Their rims move over the ground at `r ωL` and `r ωR` m/s.

- Forward speed is the average: `vx = r(ωL + ωR)/2`.
- Turn rate comes from the difference across the track: `ω = r(ωR − ωL)/W`.
- Ideal wheels do not slide along their axle: `vy = 0`.

```
 [ vx ]   [  r/2   r/2 ]            with r = 0.1 m, W = 0.5 m:      [  0.05  0.05 ]
 [ vy ] = [  0     0   ] [ ωL ]                                 A = [  0     0    ]
 [ ω  ]   [ −r/W   r/W ] [ ωR ]                                     [ −0.2   0.2  ]
```

| Wheel speeds (rad/s) | Body velocity (vx m/s, vy m/s, ω rad/s) |
|---|---|
| (6, 9) | (0.75, 0, 0.60) |
| (8, 12) | (1.00, 0, 0.80) |
| (10, 10) | (1.00, 0, 0) straight ahead |
| (−5, 5) | (0, 0, 2.00) spinning on the spot |
| (9, 3) | (0.60, 0, −1.20) |
| (0, 0) | (0, 0, 0) the zero vector |

The set of achievable velocities is every combination of the two columns: the column space `C(A)`. `A` has rank 2, so it is a plane through the origin of `R³`, the plane `vy = 0`. The script confirms closure: `A(8, 12) + A(9, 3) = (1.6, 0, −0.4) = A(17, 15)`, and `−2 · A(8, 12) = (−2, 0, −1.6) = A(−16, −24)`.

The velocity (0.6, 0, −1.2) is in the subspace (wheel speeds 9 and 3). The sideways slide (0, 0.3, 0) is not, and no wheel command will produce it.

**Adding a column.** Fit omni wheels (which roll freely sideways) and add a third wheel across the centre, rolling sideways. It contributes the column (0, r, 0) = (0, 0.1, 0):

```
          [  0.05  0.05  0   ]
 A_omni = [  0     0     0.1 ]        rank 3: the columns fill R³
          [ −0.2   0.2   0   ]
```

Now the slide (0, 0.3, 0) is available with wheel speeds (0, 0, 3). This is Lecture 1's closing question answered in pictures: two columns span a plane, three independent columns fill the space.

Simplification stated once: ideal wheels that never slip. Real rovers skid a little, especially on loose ground.

### 3.8 Sets that are not subspaces: limits

Real robots also have limits, and limits are never subspaces.

| Limit | Shape of the allowed set | Which test fails |
|---|---|---|
| One-way thrusters (thrust ≥ 0) | a cone, like the first quadrant | scaling by a negative number: no reverse |
| A speed limit | a disc or ball | scaling by a large number |
| Joint limits | a box | scaling by a large number |
| A fixed non-zero target, e.g. "exactly 1 m/s forward" | a line or plane missing the origin | the zero vector is absent |

For the last row, with the rover above: wheel speeds (8, 12) and (15, 5) both give `vx = 1.0`, but their sum (23, 17) gives `vx = 2.0`, and (0, 0) gives 0.

The same thing happens with arms. For an arm with more joints than it needs, the joint speeds that produce one particular non-zero hand velocity form a line that misses the origin. The joint speeds that produce zero hand velocity form a line through the origin, a true subspace. Lecture 6 names it the nullspace.

This division of labour is worth saying plainly in an article: **linear algebra gives complete answers for the subspace, the set of motions the mechanism allows. Real controllers then lay the limits on top.**

---

## 4. Concept-to-robot table

| Lecture idea | Plain words | In a robot |
|---|---|---|
| Permutation matrix `P` | The identity with its rows re-ordered | Choosing which sensor's equation comes first; re-labelling motors or ports |
| `P⁻¹ = Pᵀ` | Undo a re-ordering by transposing | Restoring scrambled channels with no inverse to compute |
| `PA = LU` | Order the rows well, then factor | A solver that never stalls on a zero in the wrong place |
| Partial pivoting | Use the largest entry as the pivot | Do not divide by the weakest measurement |
| Transpose | Rows become columns | Hand force to joint torques, `τ = JᵀF`; undoing a rotation |
| Symmetric matrix | Unchanged by transposing | Inertia matrix, covariance of sensor noise |
| `RᵀR` | Always symmetric | `JᵀJ` and `JJᵀ`; a quick bug check |
| Vector space | Closed under adding and scaling | All body velocities `(vx, vy, ω)`: `R³` |
| Zero vector | In every space and subspace | Standing still is always an option |
| Subspace | A vector space inside a bigger one | The motions one mechanism can make |
| Not a subspace | Quadrant, disc, box, shifted line | One-way thrusters, speed limits, joint limits, a fixed non-zero target |
| Column space `C(A)` | All combinations of the columns | Every velocity the wheels can produce |

---

## 5. Common mistakes and misconceptions

- **"A zero pivot means the matrix is singular."** Not until you have looked below it. A zero with a non-zero entry underneath only asks for a row exchange. The matrix is singular when the whole column from the diagonal down is zero.
- **"Row exchanges change the solution."** They change the order of the equations and nothing else.
- **"A small pivot is fine as long as it is not zero."** On paper, yes. In a computer, a small pivot can erase an equation. Pivot on size.
- **"Partial pivoting fixes ill-conditioning."** It fixes a bad ordering of a good problem. A genuinely ill-conditioned problem (nearly parallel lines) stays fragile whatever the order.
- **Mixing up `RᵀR` and `RRᵀ`.** Both are symmetric, but they have different sizes: for a 3 by 2 matrix one is 2 by 2 and the other 3 by 3.
- **Forgetting the reverse order in `(AB)ᵀ = BᵀAᵀ`.**
- **"`τ = JᵀF` needs `J` to be square or invertible."** It needs neither. The transpose always exists. That is exactly why force mapping still works at a singularity, where the velocity problem `J q̇ = v` fails.
- **Sign confusion about `F`.** Here `F` is the force the hand applies to the world. If the world pushes on the hand with `F_ext`, the hand must push back with `−F_ext`.
- **"It contains the zero vector, so it is a subspace."** The first quadrant and the disc both contain it. The zero test can only rule sets out.
- **"A line in `R³` is `R¹`."** A line through the origin in `R³` is a subspace of `R³`. Its vectors still have three components.
- **"The two columns are the column space."** The column space is all their combinations: infinitely many vectors, a whole plane.
- **Calling a robot's reachable set with limits a subspace.** The mechanism's motion set is a subspace. Once speed or torque limits are included it is a bounded piece of one.

---

## 6. Analogies and sentences you can use

- **Permutation as a seating plan.** Nobody leaves the room; they change chairs. To undo it, read the plan the other way round, which is the transpose.
- **The weak witness.** Partial pivoting says: when two witnesses saw the same event, do not build your case on the one who was looking the other way.
- **The transpose as a two-way street.** Velocity drives outward from the joints to the hand along `J`. Force drives back from the hand to the joints along `Jᵀ`. Same road, opposite direction.
- **Locked knees.** Standing with straight legs is restful because the load runs along the bones through the joints. Bend the knees and the same weight needs muscle. That is `τ = JᵀF` with shrinking and growing lever arms.
- **A subspace as a flat sheet through home.** It is flat, it never ends, and it always passes through the point "do nothing".
- **Limits as fences.** The subspace is the terrain a mechanism can cross. Speed and torque limits are fences put up on that terrain afterwards.
- A sentence for the article: *"Velocity reads the Jacobian by columns; force reads the same numbers by rows."*
- Another: *"A rover's wheel matrix has two columns, so everything the rover can do lies on one flat sheet in the space of motions, and sliding sideways is off the sheet."*
- Another: *"The direction an arm cannot move in is the direction it can hold without effort."*
- Another: *"Every subspace contains the zero vector, which for a robot means that standing still is always on the menu."*

---

## 7. Figures worth including

Every figure below is already captured in `article/figures/` (see the [figure pack](figures.md)). To retake one in a different state, open the lab, set it up, and screenshot it, or edit `tools/figures/l5.js` and run `node tools/figures.js 5`.

| Figure | Ready-made file | How it was set up |
|---|---|---|
| A row exchange, with P recording it | `l5-row-exchange.png` | Lab 5.1, "Zero pivot" preset, one step forward |
| The check PA = LU | `l5-pa-equals-lu.png` | Lab 5.1, "Zero pivot" preset, stepped to the end |
| Partial pivoting, multipliers travelling with their rows | `l5-partial-pivoting.png` | Lab 5.1, "General matrix" with "Partial pivoting", five steps forward |
| A tiny pivot erasing an equation | `l5-tiny-pivot.png` | Lab 5.1 part 2 at rest: pivot 0.0001, three-digit arithmetic, both orders side by side |
| The transpose as a flip | `l5-transpose-flipped.png` | Lab 5.2 after "Flip" |
| A matrix times its transpose is symmetric | `l5-symmetric-product.png` | Lab 5.2, pair (1, 3) and (3, 1) lit |
| Force to torque through `Jᵀ` | `l5-torque-worked.png` | Lab 5.3 at rest: the worked example with its equation |
| A force through a joint costs it nothing | `l5-torque-through-elbow.png` | Lab 5.3, "Force through the elbow" |
| The structure carrying the load, and the contrast | `l5-torque-straight-along.png`, `l5-torque-straight-across.png` | Lab 5.3, "Straight arm, force along it" and "force across it" |
| A subspace | `l5-subspace-line.png` | Lab 5.4 at rest: line through the origin |
| Sets that fail | `l5-not-subspace-quadrant.png`, `l5-not-subspace-disc.png` | Lab 5.4, "First quadrant" and "Disc", with c = −1.5 |
| The rover's velocity plane | `l5-rover-velocity-plane.png` | Lab 5.5 at rest, with the rover driving |
| Three columns that fill the space | `l5-omni-fills-space.png` | Lab 5.5, "Omni robot" |
| The lecture's column space | `l5-column-space-lecture.png` | Lab 5.5, "Lecture's matrix" |

---

## 8. Check questions

1. **What is a permutation matrix, how many are there of size 4, and what is its inverse?** The identity with its rows re-ordered; 4! = 24; the inverse is the transpose.
2. **Why `PA = LU` and not `A = LU`?** A zero in a pivot position stops plain elimination. `P` puts the rows in an order with no zero pivots. It works for every invertible matrix.
3. **The pivot is 0.0001, not zero. Why exchange rows anyway?** The multiplier would be 10000, and rounding would erase the other row's own entries. With three digits the answer came out as `x = 0` instead of `x = 1`.
4. **Transpose `[1 3; 2 3; 4 1]`. Why is a matrix times its transpose symmetric?** `[1 2 4; 3 3 1]`. Because `(RᵀR)ᵀ = Rᵀ(Rᵀ)ᵀ = RᵀR`; entry (i, j) and entry (j, i) are the same dot product.
5. **A straight arm pushes along its own length. What torques are needed?** None. The force line passes through both joints, so both lever arms are zero; in matrix terms `JᵀF = 0`.
6. **Is the first quadrant a subspace?** No. It is closed under addition but not under multiplication by a negative number.
7. **List the subspaces of `R³` and a wheeled machine for each.** The zero vector (parked), a line through the origin (cart on a rail), a plane through the origin (two-wheel rover), all of `R³` (omni robot).

---

## 9. Practice problems with worked solutions

The same ten problems as on the page, with full solutions. All answers are reproduced by `code/l05_transposes_spaces.py` (section 11 of its output).

**P1. Permutations.** Write the permutation matrix `P` that puts the rows of a 3-row matrix in the order (row 3, row 1, row 2). Find its inverse. How many permutation matrices of size 5 are there?

*Solution.* Re-order the rows of the identity as 3, 1, 2: `P = [0 0 1; 1 0 0; 0 1 0]`. The inverse is the transpose: `P⁻¹ = Pᵀ = [0 1 0; 0 0 1; 1 0 0]`. `P` sends (1, 2, 3) to (3, 1, 2) and `Pᵀ` sends it back. There are **5! = 120** of size 5.

**P2. PA = LU.** Factor `A = [1 1 1; 2 2 5; 4 6 8]`.

*Solution.* Pivot 1. Row 2 − 2·row 1 = (0, 0, 3). Row 3 − 4·row 1 = (0, 2, 4). The second pivot position holds 0 with a 2 below it, so exchange rows 2 and 3. The result is already upper triangular (last multiplier 0). The multipliers travel with their rows.

```
     [ 1 0 0 ]        [ 1 0 0 ]        [ 1 1 1 ]
 P = [ 0 0 1 ]    L = [ 4 1 0 ]    U = [ 0 2 4 ]
     [ 0 1 0 ]        [ 2 0 1 ]        [ 0 0 3 ]
```

Check the last row of `LU`: `2·(1, 1, 1) + (0, 0, 3) = (2, 2, 5)`. Follow-up: change the 5 to 2 and row 2 is twice row 1; the matrix is singular and no exchange helps.

**P3. Symmetric products.** For `R = [1 2 0; 0 1 1]`, compute `RᵀR` and `RRᵀ`.

*Solution.* Columns of `R`: (1, 0), (2, 1), (0, 1). Rows: (1, 2, 0), (0, 1, 1). Dotting them in pairs:

```
        [ 1 2 0 ]
 RᵀR =  [ 2 5 1 ]         RRᵀ = [ 5 2 ]
        [ 0 1 1 ]               [ 2 2 ]
```

A 3 by 3 and a 2 by 2, **both symmetric**. Follow-up: a program that prints `[5 2; 3 2]` for the second one has a bug, visible without redoing any sums.

**P4. Subspace or not?** (a) `y = 3x`; (b) `y = 3x + 1`; (c) `xy = 0`, the two axes together; (d) `x + y + z = 0`; (e) `x + y + z = 1`.

*Solution.* (a) **Yes**, a line through the origin. (b) **No**, (0, 0) gives 0 = 1. (c) **No**: it contains 0 and passes scaling, but (1, 0) + (0, 1) = (1, 1) and 1·1 ≠ 0. (d) **Yes**, a plane through the origin. (e) **No**, the zero vector is missing, and (1, 0, 0) + (0, 1, 0) has components adding to 2. Compare (c) with the first quadrant, which passes adding and fails scaling: both tests are needed.

**P5. Column space.** `A = [1 0; 2 1; 3 1]`. Describe `C(A)`. Are (2, 5, 7) and (1, 1, 1) in it?

*Solution.* The columns (1, 2, 3) and (0, 1, 1) are not on one line, so `C(A)` is a plane through the origin. In both columns the third component is the sum of the first two, so the plane is **`z = x + y`**. (2, 5, 7) is on it, as **2·column 1 + 1·column 2**. (1, 1, 1) is **not** (1 + 1 ≠ 1), so `A x = (1, 1, 1)` has no solution. Follow-up: with second column (2, 4, 6) the rank drops to 1 and the column space is a line.

**P6. Pivoting with two digits.** Keeping two significant digits, solve `0.001x + y = 1`, `x + y = 2` without and with a row exchange.

*Solution.* Without: multiplier 1000; row 2 becomes 1 − 1000 = −999, kept as −1000; right side 2 − 1000 = −998, kept as −1000; `y = 1`, `x = (1 − 1)/0.001 = 0`. With: multiplier 0.001; 1 − 0.001 = 0.999 kept as 1; 1 − 0.002 = 0.998 kept as 1; `y = 1`, `x = (2 − 1)/1 = 1`. Answers **(0, 1)** and **(1, 1)**; the truth is (1.001, 0.999).

**P7. Scrambled encoders (robot).** The computer receives encoder readings in the order (encoder 2, encoder 3, encoder 1) and sees (5, 7, 2). Find the scrambling matrix, the fix, and the true readings.

*Solution.* Scrambled = `P`·true with `P = [0 1 0; 0 0 1; 1 0 0]`. The fix is `Pᵀ = [0 0 1; 1 0 0; 0 1 0]`, and `Pᵀ(5, 7, 2) =` **(2, 5, 7)**.

**P8. Torques from a hand force (robot).** Two links of 1 m; first link along the x axis, elbow bent 90°, hand at (1, 1); `J = [−1 −1; 1 0]`. Find the torques for a push of 6 N straight down and for 4 N along +x.

*Solution.* `Jᵀ = [−1 1; −1 0]`. For `F = (0, −6)`: `τ = (−6, 0)` N·m. For `F = (4, 0)`: `τ = (−4, −4)` N·m. In the first case the elbow does nothing, because the forearm is vertical and so is the force: the push passes through the elbow. The shoulder is 1 m to the side and carries 6 N·m, clockwise. Follow-up: with the arm straight along x, `J = [0 0; 2 1]` and any push along +x gives `τ = (0, 0)`.

**P9. A rover's matrix (robot).** Wheel radius 0.2 m, track width 0.4 m. Write `A`. Find wheel speeds for 1 m/s forward with a turn of 1 rad/s. Can it produce (0, 0.5, 0)?

*Solution.* `r/2 = 0.1`, `r/W = 0.5`, so `A = [0.1 0.1; 0 0; −0.5 0.5]`. Row 1: `ωL + ωR = 10`. Row 3: `ωR − ωL = 2`. So **`ωL = 4`, `ωR = 6` rad/s**. The velocity (0, 0.5, 0) is impossible: the middle row of `A` is zero, so the column space is the plane `vy = 0`.

**P10. One-way thrusters (robot).** Two one-way thrusters push a boat along (1, 0) and (0, 1). (a) Which forces can it produce? Is that a subspace? (b) Add a third one-way thruster along (−1, −1). What now? Find thrusts for the force (−2, 1).

*Solution.* (a) `t₁(1, 0) + t₂(0, 1)` with `t₁, t₂ ≥ 0` is the first quadrant: not a subspace, since (1, 1) is in it and −(1, 1) is not. (b) The third thruster contributes `(−t₃, −t₃)`, which can make both components as negative as needed, and the first two add back the rest. Every force in the plane is reachable: the subspace `R²`. For (−2, 1): `t₃ = 2` gives (−2, −2), then `t₂ = 3` gives (−2, 1). Thrusts **(0, 3, 2)**. Design lesson: actuators that only push need one more than the number of directions to be covered.

---

## 10. Go deeper

- Strang, *Introduction to Linear Algebra*, section 2.7 (transposes and permutations) and section 3.1 (spaces of vectors).
- Trefethen and Bau, *Numerical Linear Algebra*, the lectures on Gaussian elimination, pivoting and stability: why partial pivoting works so well in practice.
- Higham, *Accuracy and Stability of Numerical Algorithms*: the full story of rounding error in elimination.
- Lynch and Park, *Modern Robotics*, chapter 5 (velocity kinematics and statics) for `τ = JᵀF` in full generality, and the chapter on wheeled mobile robots for the kinematics of differential-drive and omnidirectional bases.
- Craig, *Introduction to Robotics: Mechanics and Control*, the chapter on Jacobians, velocities and static forces.
- Siegwart, Nourbakhsh and Scaramuzza, *Introduction to Autonomous Mobile Robots*, the chapter on mobile robot kinematics: wheel constraints and the motions each wheel layout allows.
- 3Blue1Brown, *Essence of Linear Algebra*, the chapter on linear combinations, span and basis vectors: animated intuition for the set of all combinations.

*Lecture content follows MIT OpenCourseWare 18.06 (Gilbert Strang), licensed CC BY-NC-SA 4.0. The robotics examples, numbers and wording in this note are original to this project.*
