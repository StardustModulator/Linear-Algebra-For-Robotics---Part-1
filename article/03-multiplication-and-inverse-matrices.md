# Lecture 3 · Multiplication and Inverse Matrices

> **The thesis in one sentence:** a matrix product is one action followed by another, an inverse is the action that takes it back, and a robot's whole sense of "where things are" is built from those two operations.

| | |
|---|---|
| Lecture | MIT 18.06 Linear Algebra, Lecture 3, Prof. Gilbert Strang (46:49) |
| Watch | [Lecture 3 on MIT OpenCourseWare](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-3-multiplication-and-inverse-matrices/) |
| Summary and problems | [18.06SC session page](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/multiplication-and-inverse-matrices/) · [lecture summary PDF](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/resources/mit18_06scf11_ses1-3sum/) |
| Textbook | Strang, *Introduction to Linear Algebra*, sections 2.4 to 2.5 |
| Interactive page | [`03-multiplication-and-inverse-matrices.html`](../03-multiplication-and-inverse-matrices.html), Labs 3.1 to 3.6 |
| Code | [`code/l03_multiplication_inverses.py`](../code/l03_multiplication_inverses.py) |

---

## 1. What this lecture is really about

Lecture 1 multiplied a matrix by a vector. Lecture 2 quietly multiplied matrices by matrices to carry out elimination. Lecture 3 stops and asks what a matrix product **is**, then asks how to reverse one.

It has two halves.

1. **Multiplication.** Strang computes `AB` five different ways: an entry at a time, a column at a time, a row at a time, as a sum of columns times rows, and block by block. The numbers never change. What changes is what you can see. The column way and the row way are the ones the rest of the course depends on.
2. **Inverses.** For a square matrix, `A⁻¹` is the matrix with `A⁻¹A = I = AA⁻¹`. Strang shows a matrix that has no inverse and gives the reason that matters (it sends a non-zero vector to zero). Then he finds an inverse by **Gauss-Jordan elimination** and explains in one line why the method works.

A fact used throughout, and worth stating early in any article: **`AB` is usually not `BA`**.

For robotics this is the lecture where matrices stop being tables of coefficients and become **actions**: turn, shift, convert from one frame to another. Chaining actions is multiplication. Reversing an action, or looking at the world from the robot's seat instead of the map's, is inversion.

---

## 2. The ideas, from scratch

Throughout, the page and this note use one pair:

```
     [ 2  7 ]                         [  9  26 ]
 A = [ 3  8 ]     B = [ 1  6 ]   AB = [ 11  34 ]
     [ 4  9 ]         [ 1  2 ]        [ 13  42 ]
```

`A` and the top row of `B` are the numbers Strang writes on the board for his column-times-row example. His second row of `B` is `0 0`. Here it is `1 2`, so that every way of multiplying has something to show.

### 2.1 Way 1: an entry at a time

Write `AB = C`. The entry in row `i`, column `j` of `C` is **row `i` of `A` times column `j` of `B`**: multiply matching numbers and add (a dot product).

The lecture's entry:

```
 c₃₄ = (row 3 of A) · (column 4 of B) = a₃₁b₁₄ + a₃₂b₂₄ + a₃₃b₃₄ + …
```

Strang picks row 3 and column 4 so the pattern cannot be mistaken for something about a corner. The first subscript of every `a` is the row, 3. The second subscript of every `b` is the column, 4. The inner subscripts run together: 1, 2, 3, …

For the pair above: `c₃₂ = 4·6 + 9·2 = 24 + 18 = 42`.

### 2.2 The size rule

A row of `A` has as many entries as `A` has columns. A column of `B` has as many entries as `B` has rows. Row times column needs those to be equal.

> If `A` is `m` by `n` and `B` is `n` by `p`, then `AB` is `m` by `p`. The inner sizes must match and drop out. The outer sizes give the shape of the answer.

| Product | Result |
|---|---|
| (3 × 2)(2 × 2) | 3 × 2 |
| (2 × 2)(3 × 2) | not defined, inner sizes 2 and 3 |
| (3 × 2)(2 × 4) | 3 × 4 |
| (1 × 3)(3 × 1), row times column | 1 × 1, a number |
| (3 × 1)(1 × 2), column times row | 3 × 2, a full matrix |

The second line is the first hint that order matters: for the page's pair `AB` exists and `BA` does not.

### 2.3 Way 2: a column at a time

Column `j` of `AB` is `A` times column `j` of `B`. From Lecture 1, `A` times a vector is a combination of the columns of `A`. So:

> **The columns of `AB` are combinations of the columns of `A`.** Column `j` of `B` holds the amounts.

```
 column 1 of AB = 1·(2, 3, 4) + 1·(7, 8, 9) = ( 9, 11, 13)
 column 2 of AB = 6·(2, 3, 4) + 2·(7, 8, 9) = (26, 34, 42)
```

This way also explains why the rule is what it is. Matrix multiplication is defined so that `A(Bx) = (AB)x`: doing `B` then `A` equals doing `AB` once. With `x = (1, 1)`: `Bx = (7, 3)`, `A(Bx) = (35, 45, 55)`, and `(AB)x = (35, 45, 55)`.

### 2.4 Way 3: a row at a time

Row `i` of `AB` is row `i` of `A` times `B`, and a row times a matrix is a combination of the matrix's rows.

> **The rows of `AB` are combinations of the rows of `B`.** Row `i` of `A` holds the amounts.

```
 row 1 of AB = 2·[1 6] + 7·[1 2] = [ 9 26]
 row 2 of AB = 3·[1 6] + 8·[1 2] = [11 34]
 row 3 of AB = 4·[1 6] + 9·[1 2] = [13 42]
```

This is what elimination matrices did in Lecture 2: multiplying on the left by a matrix with second row (−2, 1) replaces row 2 by −2·(row 1) + 1·(row 2).

### 2.5 Way 4: columns times rows

A row times a column is a number. A column times a row is a matrix. The lecture's example:

```
 [ 2 ]             [ 2  12 ]
 [ 3 ] [ 1  6 ]  = [ 3  18 ]
 [ 4 ]             [ 4  24 ]
```

Every row is a multiple of `[1 6]`. Every column is a multiple of `(2, 3, 4)`. Strang calls it a very special matrix. Later in the course it is called **rank one**: one independent row, one independent column.

The fourth way: `AB` is the sum of (column `k` of `A`)(row `k` of `B`) over all `k`.

```
 Lecture:    [2 7; 3 8; 4 9][1 6; 0 0] = (2,3,4)[1 6] + (7,8,9)[0 0] = [2 12; 3 18; 4 24]

 This page:  (2,3,4)[1 6] + (7,8,9)[1 2] = [2 12; 3 18; 4 24] + [7 14; 8 16; 9 18] = [9 26; 11 34; 13 42]
```

### 2.6 Way 5: blocks

Cut `A` and `B` into blocks whose sizes fit, then multiply the blocks as if they were numbers, keeping the order of every product:

```
 [ A₁  A₂ ] [ B₁  B₂ ]   [ A₁B₁ + A₂B₃   A₁B₂ + A₂B₄ ]
 [ A₃  A₄ ] [ B₃  B₄ ] = [ A₃B₁ + A₄B₃   A₃B₂ + A₄B₄ ]
```

The cuts fit when the column cuts of `A` match the row cuts of `B`. The script checks the rule on a 4 by 4 pair cut into 2 by 2 blocks: the top-left block `A₁B₁ + A₂B₃` comes out as `[8 6; 10 13]`, which is the top-left corner of the full product.

Ways 2 and 3 are block multiplication with special cuts: cut `B` into columns for way 2, cut `A` into rows for way 3.

### 2.7 `AB` is usually not `BA`

Three things can happen when you swap the order: `BA` may not exist, it may have a different size, or it may have the same size and different entries. With the lecture's `A = [1 3; 2 7]` and the exchange matrix `P = [0 1; 1 0]`:

```
 PA = [2 7; 1 3]     (P on the left acts on rows: the rows are exchanged)
 AP = [3 1; 7 2]     (P on the right acts on columns: the columns are exchanged)
```

What does survive is the freedom to move brackets: `(AB)C = A(BC)`.

### 2.8 The inverse

The identity matrix `I` (ones on the diagonal, zeros elsewhere) changes nothing: `Ix = x`. The inverse of a square matrix `A` is the matrix `A⁻¹` with

```
 A⁻¹ A = I = A A⁻¹
```

Because order matters, those are two statements. Strang states, without proving it here, that **for square matrices a left inverse is also a right inverse**. A matrix that has an inverse is called **invertible** or **non-singular**.

The lecture's invertible matrix, checked both ways by the script:

```
 A = [1 3; 2 7]     A⁻¹ = [7 −3; −2 1]     A⁻¹A = [1 0; 0 1] = AA⁻¹
```

### 2.9 The singular case

```
 A = [ 1  3 ]
     [ 2  6 ]
```

**Reason one.** Column 2 is 3 times column 1. Both columns lie on one line, so every combination of them lies on that line. `AA⁻¹ = I` would need the combination (1, 0), which is off the line.

**Reason two, the important one.** There is a non-zero `x` with `Ax = 0`: take `x = (3, −1)`, since `3(1, 2) − 1(3, 6) = (0, 0)`. If `A⁻¹` existed, multiplying `Ax = 0` by it would give `x = A⁻¹0 = 0`. But `x` is not zero. Contradiction.

> A matrix that sends a non-zero vector to zero cannot be undone.

In plain words: the matrix sends both (3, −1) and (0, 0) to the same output. No machine can run it backwards, because that output does not say which input it came from.

### 2.10 Gauss-Jordan elimination

Finding `A⁻¹` means solving `AA⁻¹ = I`. By way 2 that is one system per column, all with the same `A`:

```
 A · (column 1 of A⁻¹) = (1, 0)   →   (7, −2)
 A · (column 2 of A⁻¹) = (0, 1)   →   (−3, 1)
```

Gauss-Jordan solves them together. Put both right-hand sides next to `A`, which makes `[A | I]`, and row-reduce until the left half is `I`:

```
 [ 1  3 | 1  0 ]      [ 1  3 |  1  0 ]      [ 1  0 |  7  −3 ]
 [ 2  7 | 0  1 ]  →   [ 0  1 | −2  1 ]  →   [ 0  1 | −2   1 ]
     row 2 − 2·row 1       row 1 − 3·row 2
```

The first step is Gauss: clear below the pivot. The second is Jordan: keep going upward and clear above the pivot. (If a pivot is not 1, divide its row by it at the end.) The right half is now `A⁻¹ = [7 −3; −2 1]`.

### 2.11 Why Gauss-Jordan works

Every row step is a multiplication on the left by an elimination matrix. All the steps together are one matrix `E`:

```
 E = E₁₂ E₂₁ = [1 −3; 0 1] [1 0; −2 1] = [7 −3; −2 1]
```

Block multiplication on the augmented matrix gives

```
 E [ A | I ] = [ EA | EI ] = [ I | E ]
```

The steps were chosen so that `EA = I`. That equation says `E` is `A⁻¹`. And the right half, which began as `I`, has become `E`. The inverse appears where the identity used to be. Gauss-Jordan does not search for the inverse. It builds it, by doing to `I` everything it does to `A`.

A 3 by 3 run in the script uses the −1, 2, −1 matrix `K = [2 −1 0; −1 2 −1; 0 −1 2]` and ends with `K⁻¹ = [3/4 1/2 1/4; 1/2 1 1/2; 1/4 1/2 3/4]`, after two downward steps, two upward steps and three divisions.

---

## 3. The robotics connection

The one sentence to remember: **forward kinematics multiplies, changing viewpoint inverts, and a singular matrix is a sensor or a joint that has lost a direction.**

All robots here are planar, which keeps the matrices 3 by 3. Three-dimensional robots use the same block structure with 4 by 4 matrices.

### 3.1 A pose is a matrix

A **frame** is an origin plus an `x` axis and a `y` axis. The world frame is fixed to the floor. A robot frame is fixed to the robot, with `x` forward and `y` to the left. If the robot is at world position `(x, y)` with heading `θ` (anticlockwise from the world `x` axis), a point at `(a, b)` in the robot frame is at

```
 x_world = cos θ · a − sin θ · b + x
 y_world = sin θ · a + cos θ · b + y
```

Appending a 1 to every point turns "rotate, then shift" into one multiplication:

```
     [ cos θ  −sin θ   x ]
 T = [ sin θ   cos θ   y ]        (x, y in metres, θ in radians or degrees)
     [   0       0     1 ]
```

`T` is a **homogeneous transform**. It converts robot coordinates into world coordinates, and it *is* the pose.

Worked numbers: a rover at (3, 1) facing 90° has `T = [0 −1 3; 1 0 1; 0 0 1]`. A rock 2 m straight ahead is `(2, 0)` in the rover frame and `T(2, 0, 1) = (3, 3, 1)`, so it is at (3, 3) in the world.

### 3.2 Product = one transform after another: forward kinematics (Lab 3.2)

A two-link arm, links `l₁ = 2 m` and `l₂ = 1.5 m`, joint angles `θ₁` (shoulder) and `θ₂` (elbow, measured from link 1). Attach a frame to each link at its near joint, `x` along the link, and one to the hand.

| Transform | Meaning | Matrix |
|---|---|---|
| `T₁` | link 1 seen from the world: turn by `θ₁` at the shoulder | rotation `θ₁`, position (0, 0) |
| `T₂` | link 2 seen from link 1: go `l₁` along link 1, turn by `θ₂` | rotation `θ₂`, position (`l₁`, 0) |
| `T₃` | hand seen from link 2: go `l₂` along link 2 | no rotation, position (`l₂`, 0) |

The pose of the hand in the world is `T = T₁T₂T₃`. With `θ₁ = 30°`, `θ₂ = 60°`:

```
      [ 0.87 −0.50  0 ]        [ 0.50 −0.87  2 ]        [ 1  0  1.5 ]
 T₁ = [ 0.50  0.87  0 ]   T₂ = [ 0.87  0.50  0 ]   T₃ = [ 0  1   0  ]
      [  0     0    1 ]        [  0     0    1 ]        [ 0  0   1  ]

         [ 0  −1  1.73 ]              [ 0  −1  1.73 ]
 T₁T₂ =  [ 1   0  1.00 ]   T₁T₂T₃ =   [ 1   0  2.50 ]
         [ 0   0   1   ]              [ 0   0   1   ]
```

**Read the product by columns** (way 2):

- column 1, (0, 1): the direction of the hand's `x` axis in the world, straight up, because `θ₁ + θ₂ = 90°`;
- column 2, (−1, 0): the direction of the hand's `y` axis;
- column 3, (1.73, 2.50): the position of the hand.

Trigonometry gives the same hand position, `(l₁cos θ₁ + l₂cos(θ₁+θ₂), l₁sin θ₁ + l₂sin(θ₁+θ₂)) = (1.73, 2.50)`. The matrix product is that formula with the bookkeeping done for you, and it scales to any number of joints.

Stopping one matrix early is meaningful too: `T₁T₂` is the pose of link 2, and its third column (1.73, 1.00) is the elbow.

### 3.3 Size rule = frames must chain

Label every transform with the frame it converts **to** and the frame it converts **from**: `T(world ← rover)`, `T(rover ← camera)`. Then

```
 T(world ← rover) · T(rover ← camera) = T(world ← camera)
```

The inner frames must match and drop out, exactly as inner sizes do. `T(world ← rover) · T(world ← camera)` passes the size rule (both are 3 by 3) and is still meaningless. In the arm, `T₁ = T(world ← link 1)`, `T₂ = T(link 1 ← link 2)`, `T₃ = T(link 2 ← hand)`, and the chain collapses to `T(world ← hand)`.

For matrices that are not square the plain size rule does the same job: a matrix that turns a 3-number body velocity into 4 wheel speeds is 4 by 3 and can only be fed by something with 3 rows, so (4 × 3)(3 × 2) gives a 4 × 2 map.

### 3.4 Blocks: how robot code multiplies poses

Cut a pose into a 2 by 2 rotation `R`, a 2 by 1 position `p`, and the fixed bottom row:

```
 [ R  p ] [ R′  p′ ]   [ RR′   Rp′ + p ]
 [ 0  1 ] [ 0   1  ] = [  0       1    ]
```

- **Rotations compose with rotations**: the new rotation is `RR′`.
- **Positions add after being rotated**: `p′` is expressed in the first frame, so it is turned by `R` before being added to `p`.

Check on the arm: `R₁R₂` is the 90° rotation `[0 −1; 1 0]`, and `R₁p₂ + p₁ = R(30°)(2, 0) + (0, 0) = (1.73, 1.00)`, the elbow. The script confirms that the block formula reproduces the full 3 by 3 product. Robot libraries store only `R` and `p` and apply this formula. The bottom row is never multiplied out.

### 3.5 `AB ≠ BA`: turn then drive, or drive then turn (Lab 3.3)

Two commands, each written as the pose reached from the origin: `R` = turn 90° on the spot, `D` = drive 2 m straight ahead.

```
 R = [0 −1 0; 1 0 0; 0 0 1]        D = [1 0 2; 0 1 0; 0 0 1]

 R D = [0 −1 0; 1 0 2; 0 0 1]      turn, then drive: ends at (0, 2), facing 90°
 D R = [0 −1 2; 1 0 0; 0 0 1]      drive, then turn: ends at (2, 0), facing 90°
```

Same commands, same final heading, end points 2.83 m apart. In general the gap is `2 d sin(φ/2)` for a turn `φ` and a distance `d`: zero when either is zero, largest (`2d`) at 180°. Two turns on the spot do commute, which is special to the plane. Rotations in three dimensions do not.

**Two ways to read a chain, both correct.** Left to right, each matrix is a move made in the frame the robot has just reached: in `RD` the rover turns, then drives along its new heading. Right to left, each matrix converts coordinates: `D` takes a point from the final frame to the frame before the drive, then `R` takes it to the world. That is the "`B` first, then `A`" reading of `AB`. An article should say this once, clearly, because readers trip on it.

### 3.6 The row way: wheel mixing

A differential-drive rover with wheels `b = 0.5 m` apart. For a body velocity `(v, ω)`, forward speed in m/s and turn rate in rad/s:

```
 v_left  = v − (b/2) ω              W = [ 1  −0.25 ]
 v_right = v + (b/2) ω                  [ 1   0.25 ]
```

Each **row** is one wheel's recipe: a weighted mix of the body velocities. Put a joystick map in front, `G = [0.8 0; 0 2]` (full forward stick is 0.8 m/s, full turn stick is 2 rad/s):

```
 W G = [ 0.8  −0.5 ]      left wheel:  1·(row 1 of G) − 0.25·(row 2 of G) = (0.8, −0.5)
       [ 0.8   0.5 ]      right wheel: 1·(row 1 of G) + 0.25·(row 2 of G) = (0.8,  0.5)
```

The rows of `WG` are combinations of the rows of `G`, which is way 3. Full forward stick with half turn stick gives wheel speeds (0.55, 1.05) m/s. The model assumes ideal wheels with no slip.

### 3.7 Column times row: a one-trick machine

`K = d wᵀ` (a column `d` times a row `w`) can only ever output multiples of `d`: `K e = d (w · e)`. With `d = (1, 2)` and `w = (1, 3)`:

```
 K = [ 1  3 ]        e = (2, 1):   w·e = 5   →  K e = (5, 10) = 5d
     [ 2  6 ]        e = (0, 1):   w·e = 3   →  K e = (3, 6)  = 3d
                     e = (3, −1):  w·e = 0   →  K e = (0, 0)
```

As a controller gain, `K` listens along one direction (`w`) and pushes along one direction (`d`). It is blind to the error (3, −1) and can never push off the line of `d`. This `K` is exactly the lecture's singular matrix `[1 3; 2 6]`, and the error it cannot hear is exactly Strang's `x = (3, −1)`. Rank one, singular, and "one-trick" are three views of one fact.

### 3.8 Inverse = undo, or change viewpoint (Lab 3.5)

**Undo.** `D⁻¹ = [1 0 −2; 0 1 0; 0 0 1]` drives 2 m backward. A chain is undone in reverse order, `(RD)⁻¹ = D⁻¹R⁻¹` (checked numerically; the rule belongs to Lecture 4).

**Change viewpoint.** `T` converts robot coordinates to world coordinates. `T⁻¹` converts world coordinates to robot coordinates: *where is that landmark, as seen from me?* Block multiplication gives the inverse in closed form:

```
 [ R  p ]⁻¹   [ Rᵀ   −Rᵀp ]            check:  [ Rᵀ  −Rᵀp ] [ R  p ]   [ RᵀR   Rᵀp − Rᵀp ]   [ I  0 ]
 [ 0  1 ]   = [ 0     1   ]                    [ 0    1   ] [ 0  1 ] = [  0        1      ] = [ 0  1 ]
```

`Rᵀ` is `R` with rows and columns swapped. For a rotation matrix that is its inverse (Lecture 5 explains why). In words: to undo "turn, then shift by `p`", shift back by `−p` and turn back.

| Rover pose | `T⁻¹` | Landmark on the map | Seen from the rover |
|---|---|---|---|
| (3, 1), facing 90° | `[0 1 −1; −1 0 3; 0 0 1]` | (1, 4) | (3, 2): 3.00 m ahead, 2.00 m to the left |
| (1, 2), facing 30° | `[0.866 0.5 −1.866; −0.5 0.866 −1.232; 0 0 1]` | (4, 3) | (3.098, −0.634): 3.10 m ahead, 0.63 m to the right |

In both cases the script confirms that the block formula equals the Gauss-Jordan inverse and that `T⁻¹T = I`. Distance is the same from both viewpoints (3.606 m and 3.162 m), as it must be: changing frame does not move anything.

The **rows** of `T⁻¹` explain it. Row 1 holds the rover's own `x` axis, so it measures how far along that axis the landmark is: the "ahead" number. Row 2 does the same for the `y` axis: the "left" number. The columns of `R` have become the rows of `Rᵀ`.

### 3.9 Singular = information destroyed (Lab 3.6)

The flattening map `F = [1 0; 0 0]` keeps `x` and drops `y`. Think of a camera looking along `y` that records sideways position and loses depth.

```
 F (2, 1) = (2, 0)        F (2, 5) = (2, 0)        F (0, 1) = (0, 0)
```

Two different points give one image, so no inverse can exist. The vector sent to zero, (0, 1), is motion straight toward or away from the lens: **the `x` with `Ax = 0` is exactly the motion the sensor cannot see.** (A real camera divides by depth, which is not linear. The loss of depth is the same.)

The same thing happens to an arm. Lecture 1's two-link arm (links 2.2 and 1.7, shoulder at 58°) stretched straight has Jacobian `J = [−3.31 −1.44; 2.07 0.90]`, with parallel columns. Joint speeds (1.7, −3.9) rad/s give hand velocity (0, 0): a non-zero `x` with `Jx = 0`. So `J⁻¹` does not exist and the controller cannot turn a wanted hand velocity into joint speeds.

Lab 3.6 slides between a healthy matrix and the lecture's singular one with `A(t) = [1  −2+5t; 2  1+5t]`:

| `t` | Angle between columns | `A x` for `x = (3, −1)` | Largest entry of `A⁻¹` |
|---|---|---|---|
| 0 | 90.0° | (5, 5) | 0.4 |
| 0.5 | 18.4° | (2.5, 2.5) | 1.4 |
| 0.9 | 2.1° | (0.5, 0.5) | 11.0 |
| 0.98 | 0.4° | (0.1, 0.1) | 59.0 |
| 1 | 0.0° | (0, 0) | no inverse |

At `t = 1` the matrix is `[1 3; 2 6]`. On the way there the inverse exists but grows without limit, which is the practical warning: a nearly singular matrix can be inverted on paper, and the inverse will magnify any error in its input.

### 3.10 Gauss-Jordan = every unit command at once

The same rover, read the other way. From wheel speeds to body velocity: `v = (v_left + v_right)/2`, `ω = (v_right − v_left)/b`.

```
 F = [ 1/2  1/2 ]         Gauss-Jordan on [F | I]:        F⁻¹ = [ 1  −1/4 ]
     [ −2    2  ]                                               [ 1   1/4 ]
```

- Column 1 of `F⁻¹`, (1, 1): the wheel speeds for 1 m/s forward and no turn.
- Column 2 of `F⁻¹`, (−1/4, 1/4): the wheel speeds for 1 rad/s of turn and no advance.

That is what the right-hand sides (1, 0) and (0, 1) asked for. **Column `j` of an inverse answers "which input gives one unit of output `j` and nothing else?"** Every other command is a combination of those columns: `(v, ω) = (0.6, 2)` needs `0.6(1, 1) + 2(−1/4, 1/4) = (0.1, 1.1)` m/s. And `F⁻¹` is the wheel matrix `W` of section 3.6, as it should be.

---

## 4. Concept-to-robot table

| Lecture idea | Plain words | In a robot |
|---|---|---|
| Matrix product `AB` | One machine after another: `B` first, then `A` | A chain of transforms, or of signal stages from joystick to wheels |
| Entry rule | One number of `AB` is a row of `A` times a column of `B` | How strongly one input channel reaches one output channel through all the stages between |
| Size rule | Inner sizes match, outer sizes give the shape | Frames must chain: the frame one matrix delivers is the frame the next expects |
| Columns way | Columns of `AB` are combinations of columns of `A` | The columns of a pose are the body's `x` axis, `y` axis and position |
| Rows way | Rows of `AB` are combinations of rows of `B` | Each wheel speed is a weighted mix of the body velocities |
| Column times row | Every output lies along one column | A one-trick controller: listens along `w`, pushes along `d` |
| Block multiplication | Multiply blocks as if they were numbers | `[R p; 0 1][R′ p′; 0 1] = [RR′  Rp′+p; 0 1]` |
| `AB ≠ BA` | Order matters | Turn then drive ends elsewhere than drive then turn |
| Inverse | The matrix that undoes `A` | Reverse a move; convert map coordinates into the robot's view |
| Singular | A non-zero `x` has `Ax = 0` | Lost information: a camera that drops depth, a straight arm |
| Gauss-Jordan | Reduce `[A | I]` to `[I | A⁻¹]` | Solve for every unit command at once |

---

## 5. Common mistakes and misconceptions

- **"Matrix multiplication is entry-by-entry."** Multiplying matching entries is a different operation. The matrix product is rows against columns, chosen so that `A(Bx) = (AB)x`.
- **"`AB` and `BA` are the same."** They usually differ, and one of them may not exist. The exceptions (identity, a matrix with its inverse, planar rotations with each other) are worth listing because they are exceptions.
- **Reading a chain in two directions at once.** `T₁T₂T₃` can be read left to right as moves in the moving frame, or right to left as coordinate conversions. Mixing the two in one calculation produces the wrong order.
- **Chaining frames that do not match.** `T(world ← rover) · T(world ← camera)` multiplies without complaint. Write the frame names and make the inner ones agree.
- **"The columns of a pose are positions."** Only the last column is a position. The first two are directions (the body's axes), which is why their third entry is 0 and the position's is 1.
- **"Singular means the entries are zero or the matrix is small."** `[1 3; 2 6]` has no zero entries. Singular means some non-zero vector is sent to zero, which is the same as the columns lying in too few directions.
- **Inverting a transform by negating its numbers.** The inverse of `[R p; 0 1]` has position `−Rᵀp`, which is `−p` only when there is no rotation.
- **Computing `A⁻¹` to solve one system.** Elimination is cheaper and more accurate. Compute an inverse when the inverse itself has a meaning or a closed form.
- **Trusting the inverse of a nearly singular matrix.** It exists and it amplifies noise. The table in section 3.9 shows the entries growing from 0.4 to 59 as the columns line up.

---

## 6. Analogies and sentences you can use

- **Matrices as machines.** A product is two machines bolted together, output to input. An inverse is the machine run backwards.
- **Socks and shoes.** You put on socks, then shoes. To undo it, shoes come off first. That is `(AB)⁻¹ = B⁻¹A⁻¹`, and it is also why order matters in the first place.
- **Parking a car.** Turn then drive is a different manoeuvre from drive then turn. Every driver already knows that matrix multiplication does not commute.
- **Plugs and sockets.** The size rule is a wiring check: the frame one matrix delivers has to be the frame the next expects.
- **A one-trick machine.** A column times a row can only ever say one thing, louder or quieter.
- **A shadow.** A singular matrix turns an object into its shadow. Many objects cast the same shadow, so the shadow cannot be turned back into the object.
- A sentence for the article: *"Forward kinematics multiplies, changing viewpoint inverts, and a singular matrix is a sensor or a joint that has lost a direction."*
- Another: *"The columns of a pose matrix are the robot's own axes and position, written in the world's language."*
- Another: *"Gauss-Jordan does not search for the inverse. It builds it, by doing to the identity everything it does to A."*

---

## 7. Figures worth including

Every figure below is already captured in `article/figures/` (see the [figure pack](figures.md)). To retake one in a different state, open the lab, set it up, and screenshot it, or edit `tools/figures/l3.js` and run `node tools/figures.js 3`.

| Figure | Ready-made file | How it was set up |
|---|---|---|
| The entry rule | `l3-entry-rule.png` | Lab 3.1, "Entries", last step: row 3 of `A` times column 2 of `B` gives 42 |
| A product by columns and by rows | `l3-by-columns.png`, `l3-by-rows.png` | Lab 3.1, "Columns" and "Rows", last step of each |
| A column times a row | `l3-column-times-row.png` | Lab 3.1, "Column × row", first step: the lecture's `(2, 3, 4)[1 6]` |
| A product as a sum of rank-one pieces | `l3-sum-of-pieces.png` | Lab 3.1, "Column × row", last step |
| The size rule failing | `l3-size-rule.png` | Lab 3.1 size checker with `B` given 3 rows |
| Forward kinematics as a product | `l3-arm-chain.png` | Lab 3.2 in its default pose (30°, 60°): hand at (1.73, 2.50) |
| A partial product is an intermediate frame | `l3-arm-chain-elbow.png` | Lab 3.2 with "T₁ T₂" selected: the amber ring is on the elbow |
| `AB ≠ BA` on a rover | `l3-order-matters.png` | Lab 3.3 default: 90° and 2 m, end points 2.83 m apart |
| A pair that does commute | `l3-order-commutes.png` | Lab 3.3 with the turn at 0° |
| Gauss-Jordan in progress and finished | `l3-gauss-jordan-step.png`, `l3-gauss-jordan-done.png` | Lab 3.4, "Lecture", after 2 and after 6 presses of Next step |
| Gauss-Jordan on a singular matrix | `l3-gauss-jordan-singular.png` | Lab 3.4, "Singular", last step: no second pivot, and `x = (3, −1)` |
| The inverse as a change of viewpoint | `l3-viewpoint.png`, `l3-viewpoint-turned.png` | Lab 3.5 default, then with the heading at 30° |
| Invertible, nearly singular, singular | `l3-flatten-invertible.png`, `l3-flatten-nearly.png`, `l3-flatten-singular.png` | Lab 3.6 with Undo ticked at 0%, 90% and 100% |

---

## 8. Check questions

1. **`A` is 3 by 2 and `B` is 2 by 4. What size is `AB`? Does `BA` exist?** `AB` is 3 by 4. `BA` would be (2 × 4)(3 × 2), inner sizes 4 and 3, so it does not exist.
2. **The columns of `AB` are combinations of the columns of which matrix? The rows?** Columns of `A`; rows of `B`.
3. **Why is every row of `(2, 3, 4)[1 6]` a multiple of `[1 6]`, and what does such a matrix do?** Row `i` is the `i`-th entry of the column times the row. As a machine it reduces any input to one number and scales the column by it, so every output lies along (2, 3, 4).
4. **Turn 90° then drive 2 m, against drive 2 m then turn 90°: where does each rover end?** At (0, 2) and at (2, 0), both facing 90°. `RD ≠ DR`.
5. **Give two reasons `[1 3; 2 6]` has no inverse.** Its columns lie on one line, so (1, 0) is never a combination of them. And it sends (3, −1) to zero, which an invertible matrix cannot do.
6. **Why does the right half of `[A | I]` end up as `A⁻¹`?** The row steps together are one matrix `E` with `E[A | I] = [EA | E]`. Making the left half `I` means `EA = I`, so `E = A⁻¹`, and the right half is `E`.
7. **A rover is at (3, 1) facing 90°. A landmark is at (5, 1). Where is it for the rover?** `T⁻¹ = [0 1 −1; −1 0 3; 0 0 1]` gives (0, −2): level with the rover, 2 m to its right.

---

## 9. Practice problems with worked solutions

The same ten problems as on the page, with full solutions. All answers are reproduced by `code/l03_multiplication_inverses.py` (section 24 of its output).

**P1. Size rule.** `A` is 2 by 3, `B` is 3 by 4, `C` is 4 by 2. Which of `AB`, `BA`, `BC`, `CA`, `ABC` exist, and what size is each?

*Solution.* Compare inner sizes. `AB`: (2 × 3)(3 × 4) is **2 × 4**. `BA`: (3 × 4)(2 × 3), inner 4 and 2, **does not exist**. `BC`: (3 × 4)(4 × 2) is **3 × 2**. `CA`: (4 × 2)(2 × 3) is **4 × 3**. `ABC`: (2 × 4)(4 × 2) is **2 × 2**.

**P2. Three ways and the other order.** For `A = [1 2; 3 4]`, `B = [2 0; 1 3]`, find `AB` by entries, check column 2 by columns and row 2 by rows, then find `BA`.

*Solution.* Entries: `1·2 + 2·1 = 4`, `1·0 + 2·3 = 6`, `3·2 + 4·1 = 10`, `3·0 + 4·3 = 12`, so **`AB = [4 6; 10 12]`**. Column 2 by columns: `0·(1, 3) + 3·(2, 4) = (6, 12)`. Row 2 by rows: `3·[2 0] + 4·[1 3] = [10 12]`. The other order: **`BA = [2 4; 10 14]`**. They differ.

**P3. Column times row.** Write `[4 2; 6 3]` as one column times one row. Find a non-zero `x` it sends to zero. Does it have an inverse?

*Solution.* `(2, 3)[2 1] = [4 2; 6 3]`. The matrix sends `x` to `(2, 3)` times `2x₁ + x₂`, which is zero for **`x = (1, −2)`**. A matrix that sends a non-zero vector to zero has **no inverse**. Every multiple of (1, −2) is sent to zero too.

**P4. Gauss-Jordan, 2 by 2.** Invert `[1 2; 3 7]`.

*Solution.*

```
 [ 1  2 | 1  0 ]      [ 1  2 |  1  0 ]      [ 1  0 |  7  −2 ]
 [ 3  7 | 0  1 ]  →   [ 0  1 | −3  1 ]  →   [ 0  1 | −3   1 ]
```

Subtract 3·row 1 from row 2, then 2·row 2 from row 1. **Inverse `[7 −2; −3 1]`.** Check: `1·7 + 2·(−3) = 1`, `1·(−2) + 2·1 = 0`. Follow-up: with 6 in place of 7 the first step leaves a zero row, the matrix is singular, and it sends (2, −1) to zero.

**P5. Gauss-Jordan, 3 by 3.** Invert `[1 1 0; 0 1 1; 0 0 1]`. Which half of the method does the work?

*Solution.* It is already upper triangular with pivots 1, so only Jordan's upward pass is needed: subtract row 3 from row 2, then the new row 2 from row 1. **Inverse `[1 −1 1; 0 1 −1; 0 0 1]`**, also upper triangular.

**P6. A pose and a point (robot).** A rover is at (2, 1) facing 90°. It sees a cone 3 m ahead and 1 m to its left. Where is the cone in the world?

*Solution.* `T = [0 −1 2; 1 0 1; 0 0 1]`. `T(3, 1, 1)`: top entry `0·3 − 1·1 + 2 = 1`, middle entry `1·3 + 0·1 + 1 = 4`. The cone is at **(1, 4)**. Check by picture: 3 m up the page from (2, 1) is (2, 4), then 1 m to the left is (1, 4).

**P7. Order of commands (robot).** The same rover drives 3 m forward, then turns 90° left. Find its pose with the block rule. Then swap the commands.

*Solution.* New rotation `RR′`, new position `Rp′ + p`. Drive then turn: `R(3, 0) + (2, 1) = (0, 3) + (2, 1) = (2, 4)`, then the heading becomes 180°. Turn then drive: heading 180° first, then `R(180°)(3, 0) + (2, 1) = (−3, 0) + (2, 1) = (−1, 1)`. **Drive-then-turn ends at (2, 4), turn-then-drive at (−1, 1), both facing 180°**, 4.24 m apart.

**P8. Forward kinematics (robot).** Two links of length 1, shoulder at 90°, elbow at −90°. Multiply `T₁T₂T₃` and read off the hand.

*Solution.* `T₁ = [0 −1 0; 1 0 0; 0 0 1]`, `T₂ = [0 1 1; −1 0 0; 0 0 1]`, `T₃ = [1 0 1; 0 1 0; 0 0 1]`. By blocks, `T₁T₂` has rotation `I` (90° and −90° cancel) and position `R₁(1, 0) = (0, 1)`. Then `T₁T₂T₃` has rotation `I` and position `(1, 0) + (0, 1) = (1, 1)`. **`T = [1 0 1; 0 1 1; 0 0 1]`: the hand is at (1, 1) with its `x` axis along the world `x` axis.** The arm goes straight up, then straight across.

**P9. Change of viewpoint (robot).** A rover is at (4, 2) facing 180°. Its map shows a charging dock at (1, 3). Where is the dock for the rover?

*Solution.* `R = [−1 0; 0 −1]`, so `Rᵀ = R` and `−Rᵀp = (4, 2)`. `T⁻¹ = [−1 0 4; 0 −1 2; 0 0 1]`, and `T⁻¹(1, 3, 1) = (−1 + 4, −3 + 2, 1) = (3, −1, 1)`. The dock is **3 m ahead and 1 m to the right**. Check: the rover faces along −`x`; the dock is 3 m that way and 1 m up the page, which is on its right.

**P10. Diagnose a mixer (robot).** A joystick mixer sends (forward, turn) to wheel speeds (left, right) through `[1 1; 1 1]`. The rover will not turn. Diagnose, repair, and find the stick position that gives left wheel 1 and right wheel 0.

*Solution.* `[1 1; 1 1] = (1, 1)[1 1]` is a column times a row: every output lies along (1, 1), so the wheels always get the same speed. It sends the stick position (1, −1) to zero and is singular. Repair: the turn stick must enter with opposite signs, `[1 −1; 1 1]`. Gauss-Jordan:

```
 [ 1 −1 | 1 0 ]     [ 1 −1 |  1 0 ]     [ 1 0 | 1/2 1/2 ]     [ 1 0 |  1/2 1/2 ]
 [ 1  1 | 0 1 ]  →  [ 0  2 | −1 1 ]  →  [ 0 2 | −1   1  ]  →  [ 0 1 | −1/2 1/2 ]
```

Column 1 of the inverse answers "left wheel 1, right wheel 0": **stick at forward 1/2, turn −1/2**. Check: left = `1/2 + 1/2 = 1`, right = `1/2 − 1/2 = 0`.

---

## 10. Go deeper

- Strang, *Introduction to Linear Algebra*, sections 2.4 (rules for matrix operations, including block multiplication) and 2.5 (inverse matrices and Gauss-Jordan).
- Lynch and Park, *Modern Robotics*, chapter 3 (rigid-body motions: rotation matrices, homogeneous transforms and their inverses) and chapter 4 (forward kinematics as a product).
- Craig, *Introduction to Robotics: Mechanics and Control*, the chapters on spatial descriptions and transformations and on manipulator kinematics: the frame-subscript bookkeeping used in section 3.3.
- Siegwart, Nourbakhsh and Scaramuzza, *Introduction to Autonomous Mobile Robots*, the chapter on mobile robot kinematics: the differential-drive wheel equations of section 3.6.
- 3Blue1Brown, *Essence of Linear Algebra*, the chapters on matrix multiplication as composition and on inverse matrices, column space and null space.

*Lecture content follows MIT OpenCourseWare 18.06 (Gilbert Strang), licensed CC BY-NC-SA 4.0. The robotics examples, numbers and wording in this note are original to this project.*
