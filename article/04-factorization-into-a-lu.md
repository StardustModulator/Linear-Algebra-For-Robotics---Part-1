# Lecture 4 · Factorization into A = LU

> **The thesis in one sentence:** elimination is work you can keep; stored as two triangular matrices `L` and `U`, it turns every later solve into two quick passes, which is how a robot's controller affords to solve the same system a thousand times a second.

| | |
|---|---|
| Lecture | MIT 18.06 Linear Algebra, Lecture 4, Prof. Gilbert Strang (48:05) |
| Watch | [Lecture 4 on MIT OpenCourseWare](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-4-factorization-into-a-lu/) |
| Summary and problems | [18.06SC session page](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/factorization-into-a-lu/) · [lecture summary PDF](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/resources/mit18_06scf11_ses1-4sum/) |
| Textbook | Strang, *Introduction to Linear Algebra*, section 2.6 and the start of 2.7 |
| Interactive page | [`04-factorization-into-a-lu.html`](../04-factorization-into-a-lu.html), Labs 4.1 to 4.5 |
| Code | [`code/l04_lu.py`](../code/l04_lu.py) |

---

## 1. What this lecture is really about

Lecture 2 taught elimination as a procedure. Lecture 3 taught matrix multiplication and inverses. Lecture 4 joins them: it rewrites the whole of elimination as one statement about matrices, `A = L U`, and then asks what that statement is worth.

The lecture has four movements:

1. **Two rules about inverses**, needed for the main argument: the inverse of a product reverses the order, and inverting commutes with transposing.
2. **`A = L U`**, first for a 2 by 2, then pulled apart further into `A = L D U`, then for a 3 by 3, where Strang shows why `L` is the right matrix to keep and `E` is not.
3. **The cost of elimination**: about `n³/3` operations for the matrix and only `n²` for each right-hand side.
4. **Permutations**, the tool for the case set aside so far, when rows have to be exchanged. This is the bridge to Lecture 5.

For an article on robotics the heart of the lecture is the third movement read together with the second. A factorization is *work saved*. A robot's controller runs against a clock, and the difference between `n³/3` and `n²` is the difference between a solve that fits inside a control tick and one that does not.

---

## 2. The ideas, from scratch

### 2.1 Inverse of a product: reverse order

If `A` and `B` are invertible, then

```
 (AB)⁻¹ = B⁻¹ A⁻¹
```

**Why.** Multiply and regroup. Brackets may move in a matrix product; factors may not change places.

```
 (AB)(B⁻¹A⁻¹) = A (B B⁻¹) A⁻¹ = A I A⁻¹ = A A⁻¹ = I
```

The inner pair cancels first, then the outer pair. The same works on the other side, `(B⁻¹A⁻¹)(AB) = I`.

**Strang's picture.** You put on socks, then shoes. To undo that, shoes come off first, then socks.

**In terms of actions.** In `ABx` the matrix next to the vector acts first: `B`, then `A`. To get back to `x`, take back the most recent action first: `A⁻¹`, then `B⁻¹`. Written as a product that is `B⁻¹A⁻¹` applied to `ABx`.

**Numbers** (ours; the lecture argues with letters). With `A = [1 3; 2 7]` (the matrix inverted in Lecture 3) and `B = [2 1; 5 3]`:

```
 AB = [ 17 10 ]     B⁻¹A⁻¹ = [  23 −10 ]     A⁻¹B⁻¹ = [  36 −13 ]
      [ 39 23 ]              [ −39  17 ]              [ −11   4 ]

 (AB)(B⁻¹A⁻¹) = I            (AB)(A⁻¹B⁻¹) = [  502 −181 ]
                                            [ 1151 −415 ]
```

Both factors of the wrong answer are correct inverses. Only the order is wrong.

The rule extends to any number of factors: `(ABC)⁻¹ = C⁻¹B⁻¹A⁻¹`. The lecture needs exactly that form with three elimination matrices.

### 2.2 Inverse of a transpose

The **transpose** `Aᵀ` turns the rows of `A` into columns. (Lecture 5 treats it fully.) The one fact needed here:

```
 (Aᵀ)⁻¹ = (A⁻¹)ᵀ
```

**Why.** Start from `A A⁻¹ = I` and transpose both sides. Transposing a product reverses its order, and `Iᵀ = I`, so `(A⁻¹)ᵀ Aᵀ = I`. That line says `(A⁻¹)ᵀ` is the inverse of `Aᵀ`.

**Check on the lecture's matrix** `A = [2 1; 8 7]`:

```
 A⁻¹ = [  7/6 −1/6 ]     Aᵀ = [ 2 8 ]     (Aᵀ)⁻¹ = [  7/6 −4/3 ]  = (A⁻¹)ᵀ
       [ −4/3  1/3 ]          [ 1 7 ]              [ −1/6  1/3 ]
```

### 2.3 `A = L U` for a 2 by 2

Vocabulary: the **diagonal** runs from top-left to bottom-right; **upper triangular** means zeros below the diagonal; **lower triangular** means zeros above it.

The lecture's matrix is `A = [2 1; 8 7]`.

1. The pivot is 2, the entry below it is 8, the multiplier is `8/2 = 4`. Subtract 4 × row 1 from row 2.
2. As a matrix product, `E₂₁ A = U`:

```
 [  1 0 ] [ 2 1 ]   [ 2 1 ]
 [ −4 1 ] [ 8 7 ] = [ 0 3 ]
```

3. Move `E₂₁` to the other side: `A = E₂₁⁻¹ U`. The inverse of "subtract 4 × row 1" is "add 4 × row 1", so `E₂₁⁻¹` has `+4` where `E₂₁` has `−4`. Call it `L`:

```
 [ 2 1 ]   [ 1 0 ] [ 2 1 ]
 [ 8 7 ] = [ 4 1 ] [ 0 3 ]
    A    =    L       U
```

- `U` is **upper** triangular with the **pivots** (2 and 3) on its diagonal.
- `L` is **lower** triangular with **ones** on its diagonal and the **multiplier** (4) below, carrying the sign of "subtract 4 times".

### 2.4 `A = L D U`

`L` has ones on its diagonal and `U` has pivots, which is unbalanced. Divide each row of `U` by its pivot and keep the pivots in a **diagonal matrix** `D`:

```
 [ 2 1 ]   [ 1 0 ] [ 2 0 ] [ 1 1/2 ]
 [ 8 7 ] = [ 4 1 ] [ 0 3 ] [ 0  1  ]
    A    =    L       D       U
```

Now both triangular factors have unit diagonals and the pivots stand alone. When `A` is symmetric, the `U` of this form is `Lᵀ`, giving `A = L D Lᵀ` (Lecture 5 introduces symmetric matrices).

### 2.5 The 3 by 3 case

With no row exchanges, elimination takes up to three steps:

```
 E₃₂ E₃₁ E₂₁ A = U
```

Move the three matrices across. The last applied is the first undone (section 2.1), so the inverses appear in reverse order:

```
 A = E₂₁⁻¹ E₃₁⁻¹ E₃₂⁻¹ U = L U
```

Two matrices now describe elimination: `E = E₃₂E₃₁E₂₁` takes `A` to `U`, and `L = E⁻¹` takes `U` back to `A`.

### 2.6 Why `L` is better than `E`

The lecture's example: subtract 2 × row 1 from row 2, later subtract 5 × row 2 from row 3, and nothing in position (3, 1), so `E₃₁ = I`.

```
       [ 1  0 0 ]          [ 1  0 0 ]                    [  1  0 0 ]
 E₂₁ = [−2  1 0 ]    E₃₂ = [ 0  1 0 ]    E = E₃₂ E₂₁ =   [ −2  1 0 ]
       [ 0  0 1 ]          [ 0 −5 1 ]                    [ 10 −5 1 ]
```

**The 10 was in neither step.** The second step subtracts 5 × row 2 from row 3 after row 2 has already had 2 × row 1 removed, so row 3 picks up `5 × 2 = 10` of row 1 *through* row 2. That stray entry is why software keeps L rather than E.

In the other direction, with the inverses in reverse order:

```
                      [ 1 0 0 ] [ 1 0 0 ]   [ 1 0 0 ]
 L = E₂₁⁻¹ E₃₂⁻¹  =   [ 2 1 0 ] [ 0 1 0 ] = [ 2 1 0 ]
                      [ 0 0 1 ] [ 0 5 1 ]   [ 0 5 1 ]
```

No 10. `L` contains the multipliers 2 and 5, each in its own place, and a 0 where no step was needed.

> **The rule:** if there are no row exchanges, the multipliers go directly into `L`.

**Why nothing mixes.** Read `A = LU` one row at a time: row 3 of `A` = `l₃₁` × (row 1 of `U`) + `l₃₂` × (row 2 of `U`) + (row 3 of `U`). That is elimination read backwards, because elimination produced row 3 of `U` by subtracting those same multiples, and the rows it subtracted were always *finished* rows of `U`. Each multiplier is used once.

**A matrix to try it on.** The lecture gives only the two `E` matrices. A matrix whose elimination uses exactly those steps (ours, built as `L` times a chosen `U`):

```
     [ 1 2  1 ]   [ 1 0 0 ] [ 1 2 1 ]
 A = [ 2 5  5 ] = [ 2 1 0 ] [ 0 1 3 ]
     [ 0 5 17 ]   [ 0 5 1 ] [ 0 0 2 ]
```

Row 3 check: `0·(1, 2, 1) + 5·(0, 1, 3) + (0, 0, 2) = (0, 5, 17)`.

**The general formula for the stray entry.** With all three multipliers in play, `E(3,1) = l₃₂·l₂₁ − l₃₁`. For `A = [2 1 1; 4 3 4; 6 7 14]` the multipliers are 2, 3, 4, so `L = [1 0 0; 2 1 0; 3 4 1]`, `U = [2 1 1; 0 1 2; 0 0 3]`, and `E(3,1) = 4·2 − 3 = 5`, a number no step used. Its `LDU` form has `D = diag(2, 1, 3)` and unit-diagonal `U = [1 1/2 1/2; 0 1 2; 0 0 1]`.

### 2.7 Solving with `L` and `U`

`A x = b` becomes `L (U x) = b`. Name the bracket `y = U x` and solve two triangular systems:

1. **Forward substitution**, `L y = b`, top row first.
2. **Back-substitution**, `U x = y`, bottom row first.

For `A = [2 1; 8 7]` and `b = (3, 15)`: forward gives `y₁ = 3`, then `4·3 + y₂ = 15` so `y₂ = 3`; back gives `3x₂ = 3` so `x₂ = 1`, then `2x₁ + 1 = 3` so `x₁ = 1`. A new right-hand side `b = (5, 23)` reuses the same factors: `y = (5, 3)`, `x = (2, 1)`. For the 3 by 3 above with `b = (4, 12, 22)`: `y = (4, 4, 2)`, `x = (1, 1, 1)`.

The vector `y` is what Lecture 2 called `c`, the right-hand side after elimination. Forward substitution *replays* elimination on a new `b`. The inverse `A⁻¹` never appears.

### 2.8 The cost of elimination

Count **operations**, where one operation is "multiply and subtract" on one entry. For an `n` by `n` matrix the first stage changes about `n²` entries, the next about `(n−1)²`, and so on:

```
 n² + (n−1)² + … + 1²  ≈  n³/3
```

Strang gets the third by comparing the sum with the integral of `x²` from 0 to `n`. For the lecture's `n = 100`: the sum of squares is 338,350 and `n³/3` is 333,333, about a third of a million.

The right-hand side costs about `n²/2` during elimination and `n²/2` in back-substitution: `n²` in total.

**Exact counts**, obtained by counting every division and multiply-subtract in a real run (`code/l04_lu.py`, section 6):

| n | factor `A` = (n³ − n)/3 | one right-hand side = n² |
|---|---|---|
| 2 | 2 | 4 |
| 3 | 8 | 9 |
| 6 | 70 | 36 |
| 10 | 330 | 100 |
| 50 | 41,650 | 2,500 |
| 100 | 333,300 | 10,000 |

Consequences:

- With `A = LU` in hand, each extra `b` costs `n²` and not `n³/3 + n²`.
- For `n = 100` and 1,000 right-hand sides: 343,300,000 operations from scratch, 10,333,300 with one factorization, a speed-up of 33.2.
- However many right-hand sides there are, the speed-up levels off at `(n³/3 + n²)/n²`, about `n/3 + 1` (34.3 for `n = 100`).
- Doubling `n` multiplies the factoring cost by 8 and the per-solve cost by 4.

### 2.9 Permutations

When a zero lands in a pivot position, rows must be exchanged, and that is done by a **permutation matrix**: the identity with its rows re-ordered. For size 3 there are six:

```
 I            P₁₂          P₁₃          P₂₃          C            C²
 [1 0 0]      [0 1 0]      [0 0 1]      [1 0 0]      [0 1 0]      [0 0 1]
 [0 1 0]      [1 0 0]      [0 1 0]      [0 0 1]      [0 0 1]      [1 0 0]
 [0 0 1]      [0 0 1]      [1 0 0]      [0 1 0]      [1 0 0]      [0 1 0]
```

The identity, three exchanges of two rows, and two cycles of all three.

- **Multiply any two and the result is in the list.** Example: `P₁₂ C = P₁₃`, while `C P₁₂ = P₂₃`. Order matters.
- **Invert any one and the result is in the list.** The exchanges are their own inverses; `C⁻¹ = C²` and `(C²)⁻¹ = C`.
- A family closed under multiplication and inversion like this is a **group**.
- **`P⁻¹ = Pᵀ`.** Each row has a single 1. A row times itself gives 1; a row times a different row gives 0. That is `P Pᵀ = I`.
- **How many:** 3·2·1 = 6 of size 3, 4·3·2·1 = 24 of size 4, and `n!` ("n factorial") of size `n`; 5! = 120, 6! = 720.

The full product table (row label times column label), from the script:

```
         I   P12  P13  P23    C   C2
   I     I   P12  P13  P23    C   C2
 P12   P12    I    C   C2   P13  P23
 P13   P13   C2    I    C   P23  P12
 P23   P23    C   C2    I   P12  P13
   C     C   P23  P12  P13   C2    I
  C2    C2   P13  P23  P12    I    C
```

Lecture 5 uses these: with row exchanges the factorization becomes `P A = L U`.

---

## 3. The robotics connection

The one sentence to remember: **a controller factors its matrix once, before the loop starts, and then each tick only replays the logbook on fresh sensor readings.**

### 3.1 Factor once, solve every tick (Lab 4.3)

A robot's controller is a loop: read sensors, compute commands, send them. One pass is a **tick**. Arms and legged robots often run at about 1 kHz, so each tick has 1 ms.

Inside the tick the controller usually solves `A x = b`. Very often the matrix (the robot's geometry, a fixed model, a spline system) is the same from tick to tick, and only the right-hand side (sensor readings, the commanded motion) changes. Then elimination on `A` is the same work every tick, and it can be done once.

**Assumption, stated plainly:** the processor performs 10⁸ simple operations per second. This is a round number for a small embedded processor, chosen for illustration. One 1 ms tick then holds 100,000 operations.

| n | factor once | one tick from scratch | one tick with `L`, `U` | loop rate from scratch | loop rate factored |
|---|---|---|---|---|---|
| 6 (a six-joint arm) | 70 | 106 | 36 | 943,396 Hz | 2,777,778 Hz |
| 50 (about fifty joints) | 41,650 | 44,150 | 2,500 | 2,265 Hz | 40,000 Hz |
| 500 (a long planned path) | 41,666,500 | 41,916,500 | 250,000 | 2.4 Hz | 400 Hz |

As a share of a 1 ms tick: 0.11% against 0.036% for `n = 6`; 44.15% against 2.5% for `n = 50`; 41,916.5% against 250% for `n = 500` (419 ticks against 2.5 ticks).

The largest system that fits inside one tick at this speed is **65 unknowns from scratch and 316 with `L` and `U` stored**.

Two honest notes for the article:

- At `n = 500` even the factored solve misses a 1 ms deadline at the assumed speed. Section 3.5 shows how structure (a banded matrix) brings 500 unknowns down to about 1,500 operations.
- An arm's Jacobian depends on its pose, so it is refactored when the pose changes. Even then, every right-hand side that belongs to the same pose shares the factors.

**Lab 4.3 also measures it.** Its button times both strategies in the browser with tight loops that store the multipliers in the zeroed entries of the matrix. Measured speed-ups agree roughly with the operation counts, never exactly, because real processors also pay for memory traffic.

### 3.2 Solve, do not invert

Solving with `L` and `U` is two triangular passes: `L y = b` going down, `U x = y` coming back up. No inverse is formed.

Why robot software avoids `A⁻¹`: building the inverse costs about `n³` operations, three times the `n³/3` of `LU` (for `n = 500`: 125,000,000 against 41,666,500), and each use of it costs `n²`, the same as the two passes. So it is slower to obtain and no faster to use. It is usually less accurate too, since every entry of the computed inverse carries rounding error into the product. When a robotics paper writes `x = A⁻¹ b`, read it as "solve `A x = b`".

Libraries go one step further and never store `L` separately: each multiplier is written into the entry it has just made zero, so a single `n` by `n` array holds `U` on and above the diagonal and `L` below it. That is only possible because the multipliers enter `L` unchanged (section 2.6).

### 3.3 Socks and shoes for a rover (Lab 4.1)

A rover on a flat floor has a pose: position `(x, y)` and heading `θ`. One 3 by 3 **homogeneous transform** holds all three:

```
     [ cos θ  −sin θ  x ]
 T = [ sin θ   cos θ  y ]
     [   0       0    1 ]
```

**Derivation of the chaining rule.** `T` maps a point written in the rover's own frame into world coordinates. If the rover is at pose `T₀` and then makes a move `A` described from its own seat ("drive 3 m forward"), a point fixed to the rover is carried first by `A` into the old rover frame and then by `T₀` into the world, so the new pose is `T₀ A`. A second move `B` gives `T₀ A B`. Moves described from the driver's seat therefore chain left to right, and starting from `T₀ = I` the pose after `A` then `B` is the product `AB`.

Worked numbers (script section 8). Move `A`: drive 3 m. Move `B`: turn 70°, then drive 2.5 m, which is `B = Rot(70°)·Trans(2.5, 0)`.

```
     [ 1 0 3 ]        [ 0.34 −0.94 0.86 ]         [ 0.34 −0.94 3.86 ]
 A = [ 0 1 0 ]    B = [ 0.94  0.34 2.35 ]    AB = [ 0.94  0.34 2.35 ]
     [ 0 0 1 ]        [  0     0    1   ]         [  0     0    1   ]
```

After both moves the rover is at (3.855, 2.349) m, heading 70°.

| Undo order | Product | Where the rover ends |
|---|---|---|
| `B⁻¹` then `A⁻¹` | `A B B⁻¹ A⁻¹ = I` | (0, 0), heading 0°: home |
| `A⁻¹` then `B⁻¹` | `A B A⁻¹ B⁻¹ ≠ I` | (1.974, −2.819), heading 0°: 3.441 m from home |

In the wrong order the heading still comes out right, because planar rotations add up in any order, but the position does not. The miss distance has a closed form, `2a·sin(θ/2)` for a first drive of length `a` and a turn `θ`: here `2·3·sin 35° = 3.441 m`. With no turn the two moves are drives along one line, they commute, and either order works.

Simplifications to state: the rover is ideal (flat floor, no wheel slip, moves executed exactly).

### 3.4 One factorization for `J` and `Jᵀ`

Velocities map through the Jacobian, `v = J q̇` (Lecture 1). Forces map through its transpose, `τ = Jᵀ F` (Lecture 5). A controller often needs both solves in one tick. The rule `(Jᵀ)⁻¹ = (J⁻¹)ᵀ` says they are one job: from `J = LU` we get `Jᵀ = Uᵀ Lᵀ`, where `Uᵀ` is lower triangular and `Lᵀ` is upper triangular, so the same two factors serve again.

Worked numbers (script section 9) for the arm of Lecture 1 (links 2.2 m and 1.7 m, shoulder 58°, elbow −72°):

```
 J = [ −1.454  0.411 ]      J q̇ = (0.9, 0.45) m/s      →  q̇ = (−0.37, 0.90) rad/s
     [  2.815  1.650 ]      Jᵀ F = (1.0, 0.5) N·m      →  F = (−0.068, 0.320) N
```

Both from one `LU`. A direct solve of `Jᵀ F = τ` gives the same force.

### 3.5 Trajectories through waypoints (Lab 4.4)

**The problem.** A planner supplies waypoints `y₀, y₁, …, yₙ` (one coordinate at a time), to be passed at times `0, h, 2h, …`. We want a path with continuous position, velocity and acceleration. A **natural cubic spline** does this with one cubic per gap.

**Derivation.** Let `Mᵢ` be the second derivative (the acceleration) at waypoint `i`. On each gap the acceleration of a cubic is a straight line from `Mᵢ` to `Mᵢ₊₁`. Integrating twice and fixing the two constants so that the piece passes through `yᵢ` and `yᵢ₊₁` gives, with `u = (t − tᵢ)/h`:

```
 S(t) = Mᵢ h² (1−u)³/6 + Mᵢ₊₁ h² u³/6 + (yᵢ − Mᵢ h²/6)(1−u) + (yᵢ₊₁ − Mᵢ₊₁ h²/6) u
```

Position and acceleration are now continuous by construction. Requiring the **velocity** to match at each interior waypoint gives

```
 Mᵢ₋₁ + 4 Mᵢ + Mᵢ₊₁ = 6 (yᵢ₋₁ − 2 yᵢ + yᵢ₊₁) / h²        i = 1 … n−1
```

and the natural end conditions are `M₀ = Mₙ = 0`. Units: with positions in metres and `h` in seconds, each `M` is an acceleration in m/s².

**The matrix.** For seven waypoints there are five unknowns:

```
     [ 4 1 0 0 0 ]
     [ 1 4 1 0 0 ]
 T = [ 0 1 4 1 0 ]      T M = r,   rᵢ = 6 (yᵢ₋₁ − 2 yᵢ + yᵢ₊₁)/h²
     [ 0 0 1 4 1 ]
     [ 0 0 0 1 4 ]
```

`T` contains no waypoint coordinates. It depends only on the *number* of waypoints. So **one `LU` serves the x coordinates, the y coordinates and every later edit of the path.**

**The factors are banded.** `T` is tridiagonal, and elimination on it creates no new non-zeros:

```
     [  1                     ]        [ 4    1                      ]
     [ 1/4   1                ]        [    15/4    1                ]
 L = [      4/15   1          ]    U = [         56/15    1          ]
     [           15/56   1    ]        [               209/56    1   ]
     [                56/209 1]        [                     780/209 ]
```

- Pivots: 4, 15/4, 56/15, 209/56, 780/209 = 4, 3.75, 3.733333, 3.732143, 3.732057.
- Multipliers: 1/4, 4/15, 15/56, 56/209 = 0.25, 0.266667, 0.267857, 0.267943.
- Each pivot is `4 − 1/(previous pivot)`. The fixed point of that rule solves `p = 4 − 1/p`, so the pivots settle at `2 + √3 = 3.732051` and the multipliers at `2 − √3 = 0.267949`.

**Cost.** For 5 unknowns the banded factorization takes 8 operations and each solve 13, against 25 for a full solve. For 500 unknowns: factor 998, each solve 1,498, against 41,666,500 and 250,000 for the full method. In general about `3n` in place of `n²`.

**Worked numbers** (script section 10), `h = 1 s`, waypoints (−5, −2.4), (−3.3, 0.4), (−1.3, 2.0), (0.5, 0.3), (2.0, −1.9), (3.8, −0.7), (5.2, 2.1):

| | values |
|---|---|
| right-hand side for x | (1.8, −1.2, −1.8, 1.8, −2.4) |
| right-hand side for y | (−7.2, −19.8, −3, 20.4, 9.6) |
| accelerations `Mx` | (0, 0.522, −0.286, −0.577, 0.794, −0.798, 0) |
| accelerations `My` | (0, −0.658, −4.569, −0.865, 5.031, 1.142, 0) |
| largest acceleration | 5.09 m/s² |
| position midway between waypoints 2 and 3 | (−0.346, 1.490) |

The script checks the spline numerically: it passes through every waypoint, and the jumps in velocity and acceleration at the joints are at the level of rounding (about 10⁻⁸).

**An edit.** Move waypoint 3 from `y = 0.3` to `y = 1.5`. `T`, `L` and `U` are unchanged. The right-hand side for y becomes (−7.2, −12.6, −17.4, 27.6, 9.6), three entries different, and the new accelerations are (0, −1.488, −1.246, −6.127, 8.354, 0.312, 0). The acceleration demanded at waypoint 4 rose from 5.03 to 8.35 m/s², which is exactly the kind of number a planner compares with the motor limits.

Simplification to state: one second per gap, to keep the matrix at 1, 4, 1. With unequal gaps the matrix is still tridiagonal and still independent of the waypoint positions.

### 3.6 `L` as a logbook

A sentence worth keeping: `U` is the finished job and `L` is the logbook. `L` records each multiplier at the place it was used, so the same steps can be replayed on any new right-hand side (forward substitution) without touching `A` again.

### 3.7 Permutations as re-labelling (Lab 4.5)

Three motors can be plugged into three controller outputs in six ways, one per permutation matrix. If the cabling applies `P`, the motors receive `P c` where the software meant `c`. The repair is to send `Pᵀ c`, since `P Pᵀ c = c`.

Worked numbers (script section 11): commands (10, 20, 30) through the cycle `C` arrive as (20, 30, 10). Sending `Cᵀ c = (30, 10, 20)` makes the motors receive (10, 20, 30). The same idea renumbers joints between a robot's hardware order and the order its model uses, and it is the same `P` that Lecture 5 puts in front of `A` in `PA = LU`.

---

## 4. Concept-to-robot table

| Lecture idea | Plain words | In a robot |
|---|---|---|
| `(AB)⁻¹ = B⁻¹A⁻¹` | Undo the last action first | Retracing a chain of moves or coordinate transforms |
| `(Aᵀ)⁻¹ = (A⁻¹)ᵀ` | Invert and transpose in either order | One factorization of `J` serves velocities and forces |
| `A = LU` | Elimination saved as two triangular matrices | Work done once, before the control loop starts |
| `L` | The multipliers, each where it was used | A logbook replayed on every new right-hand side |
| `U` | What elimination leaves; pivots on the diagonal | The system that is back-substituted each tick |
| `A = LDU` | Pivots pulled out into a diagonal matrix | For a symmetric mass matrix, `U = Lᵀ` and half the storage is saved |
| `L` against `E` | `E` mixes multipliers (the 10), `L` does not | Libraries overwrite the zeros with multipliers and never build `E` |
| Two triangular passes | `L y = b` down, `U x = y` up | Solving without forming an inverse |
| Cost `n³/3` and `n²` | Factoring is expensive, each extra `b` is cheap | Whether the solve fits in a 1 ms tick |
| Banded matrix | Non-zeros near the diagonal; factors stay thin | Splines through waypoints in about `3n` operations |
| Permutation matrix | Identity with rows re-ordered; inverse = transpose | Motor wiring and joint numbering, repaired with a transpose |

---

## 5. Common mistakes and misconceptions

- **Writing `(AB)⁻¹ = A⁻¹B⁻¹`.** True only when `A` and `B` commute. The rover in Lab 4.1 ends 3.44 m from home when you do this.
- **Putting `−4` in `L`.** `E₂₁` holds `−4`; `L = E₂₁⁻¹` holds `+4`. `L` stores multipliers with the sign of "subtract this many times".
- **Thinking `L` is `E` with the signs flipped.** That works for a single step, and fails as soon as steps interact: `E` has a 10 in the example, `L` has a 0 there.
- **"LU is a faster way to solve one system."** For a single right-hand side it is the same work as elimination. The gain is in the second, third and thousandth right-hand side.
- **Computing `A⁻¹` in a control loop.** Three times the setup cost, no saving per solve, and less accurate.
- **Forgetting the assumption.** `A = LU` as stated needs every pivot to be non-zero without row exchanges. Otherwise it is `PA = LU` (Lecture 5).
- **Reading the operation count as a time.** `n³/3` counts multiply-subtracts. Real time also depends on memory and on the processor. The count gives the scaling, and the scaling is the useful part.
- **Thinking a moved waypoint means a new matrix.** In the spline system the waypoints live entirely in the right-hand side.

---

## 6. Analogies and sentences you can use

- **Socks and shoes** (Strang's own): last on, first off.
- **The logbook.** `U` is the finished job, `L` is the record of how it was done. With the record you can redo the job on new data without the original.
- **Preparing a kitchen.** Factoring is the chopping and measuring done before service. Each order (each right-hand side) then takes minutes, not hours.
- **A lock and many keys.** The matrix is the lock, cut once. Every right-hand side is a key tried in it.
- A sentence for the article: *"A controller factors its matrix once, before the loop starts, and after that each tick only replays the logbook on fresh sensor readings."*
- Another: *"The inverse of a product is the product of the inverses in reverse order, and a rover that forgets this ends up three metres from home."*
- Another: *"Robot software solves; it does not invert."*
- On cost: *"Double the size of the system and factoring costs eight times as much, while each solve costs four times as much. The bigger the robot's problem, the more it pays to factor once."*

---

## 7. Figures worth including

Every figure below is already captured in `article/figures/` (see the [figure pack](figures.md)). To retake one in a different state, open the lab, set it up, and screenshot it, or edit `tools/figures/l4.js` and run `node tools/figures.js 4`.

| Figure | Ready-made file | How it was set up |
|---|---|---|
| `A = LU` for the lecture's 2 by 2 | `l4-lu-2x2.png` | Lab 4.2, "Lecture 2 by 2", stepped to "Finished: A = L U" |
| The same matrix as `A = LDU` | `l4-ldu-2x2.png` | Lab 4.2 with "A = L D U" selected |
| A multiplier dropping into `L` | `l4-lu-3x3-midway.png` | Lab 4.2, "Multipliers 2 and 5", step 6: the 5 has just landed |
| `L` rebuilding `A` row by row | `l4-lu-rebuild.png` | Lab 4.2, "Multipliers 2 and 5", step "Check: multiply L by U" |
| `E` against `L`, with the stray 10 | `l4-e-against-l.png` | Lab 4.2, "Multipliers 2 and 5", last step |
| The rover after two moves | `l4-rover-two-moves.png` | Lab 4.1 as it opens |
| Right order and wrong order of the undo | `l4-rover-undo-right-order.png`, `l4-rover-undo-wrong-order.png` | Lab 4.1 after each of the two undo buttons |
| The two cost bars | `l4-cost-bars.png` | Lab 4.3 at n = 100, k = 1,000 |
| The tick budget at n = 500 | `l4-cost-tick-budget.png` | Lab 4.3 after "n = 500" |
| Spline path with its system `T M = r` | `l4-spline-path.png` | Lab 4.4 as it opens |
| An edit that changes only the right-hand side | `l4-spline-after-drag.png` | Lab 4.4 after dragging waypoint 3 upward: one factorization, many solves |
| Banded factors and settling pivots | `l4-spline-banded-factors.png` | Lab 4.4, side panel |
| The six permutations, two orders of a product | `l4-permutations-order-matters.png` | Lab 4.5 as it opens (P = P₁₂, Q = C) |
| Inverse = transpose | `l4-permutations-inverse-transpose.png` | Lab 4.5 with the two cycles as P and Q |
| The group table | `l4-permutations-group-table.png` | Lab 4.5, table of all 36 products |

---

## 8. Check questions

1. **What is `(ABC)⁻¹`?** `C⁻¹B⁻¹A⁻¹`. Socks before shoes going on, shoes before socks coming off.
2. **In `A = LU`, what sits where?** Ones on the diagonal of `L`, multipliers below it, pivots on the diagonal of `U`. In `LDU` the pivots move to `D`.
3. **Multipliers `l₂₁ = 3`, `l₃₁ = 0`, `l₃₂ = 2`, no exchanges. Write `L`.** `[1 0 0; 3 1 0; 0 2 1]`, with no calculation. (`E` for the same steps has `2·3 = 6` in its corner.)
4. **Why does `E` contain a number no step used?** A later step acts on a row an earlier step already changed, so multipliers multiply. `L` rebuilds rows of `A` from finished rows of `U`, so each multiplier is used once.
5. **`n` doubles. What happens to the costs?** Factoring grows 8 times, each solve 4 times.
6. **A colleague computes `A⁻¹` once and multiplies each tick. What do you change?** Store `L` and `U` and do two triangular passes: a third of the setup cost, the same cost per tick, better accuracy.
7. **Why does dragging a waypoint in Lab 4.4 never cause a new factorization?** The spline matrix holds only fours and ones and depends only on the number of waypoints. The positions enter through the right-hand side.

---

## 9. Practice problems with worked solutions

The same ten problems as on the page, with full solutions. All answers are reproduced by `code/l04_lu.py` (section 12 of its output).

**P1. Inverses without the matrices.** `A⁻¹ = [1 2; 0 1]` and `B⁻¹ = [1 0; 3 1]`. Find `(AB)⁻¹` and `(Aᵀ)⁻¹` without finding `A` or `B`.

*Solution.* Reverse the order: `(AB)⁻¹ = B⁻¹A⁻¹ = [1 0; 3 1][1 2; 0 1] = [1 2; 3 7]` (row 2 is `3·(1, 2) + (0, 1)`). For the transpose, `(Aᵀ)⁻¹ = (A⁻¹)ᵀ = [1 0; 2 1]`. **Answer: `[1 2; 3 7]` and `[1 0; 2 1]`.** In the other order `A⁻¹B⁻¹ = [7 2; 3 1]`, which is the inverse of `BA`.

**P2. A 2 by 2 factorization.** Factor `[3 1; 6 5]` into `LU` and into `LDU`.

*Solution.* Multiplier `6/3 = 2`; row 2 − 2 × row 1 = (0, 3). **`L = [1 0; 2 1]`, `U = [3 1; 0 3]`.** For `LDU`: `D = [3 0; 0 3]` and the unit-diagonal `U = [1 1/3; 0 1]`. Check row 2: `2·(3, 1) + (0, 3) = (6, 5)`.

**P3. `L` against `E`.** Eliminate on `[1 1 1; 2 4 5; 1 5 10]`. Write `L` and `U`, and find the entry of `E = E₃₂E₃₁E₂₁` in row 3, column 1.

*Solution.* Multiplier 2: row 2 becomes (0, 2, 3). Multiplier 1: row 3 becomes (0, 4, 9). Multiplier `4/2 = 2`: row 3 becomes (0, 0, 3). **`L = [1 0 0; 2 1 0; 1 2 1]`, `U = [1 1 1; 0 2 3; 0 0 3]`.** `E = [1 0 0; −2 1 0; 3 −2 1]`: its corner is `l₃₂·l₂₁ − l₃₁ = 2·2 − 1 = 3`, where `L` has the plain multiplier 1.

**P4. Two passes.** Use the factors of P3 to solve for `b = (3, 11, 16)` and then `b = (1, 2, 1)`.

*Solution.* First `b`: forward `y = (3, 11 − 6, 16 − 3 − 10) = (3, 5, 3)`; back `x₃ = 1`, `x₂ = (5 − 3)/2 = 1`, `x₁ = 3 − 1 − 1 = 1`. Second `b`: forward `y = (1, 0, 0)`; back `x = (1, 0, 0)`. **Answers: (1, 1, 1) and (1, 0, 0).** The second `b` is the first column of `A`, so its answer could have been read off at once.

**P5. Counting.** `n = 30`. How many operations for 100 right-hand sides, from scratch and with one factorization? What happens at `n = 60`?

*Solution.* Factor `(27,000 − 30)/3 = 8,990`; one right-hand side `900`. From scratch `100 × (8,990 + 900) = 989,000`. Factor once `8,990 + 100 × 900 = 98,990`. **A ratio of 10 (9.99).** At `n = 60` the counts are 71,980 (eight times) and 3,600 (four times). The ratio at `n = 30` can never pass `(8,990 + 900)/900 = 10.99`.

**P6. A cycle.** `P = [0 1 0; 0 0 1; 1 0 0]`. Find `P²`, `P³`, `P⁻¹`, and the number of 5 by 5 permutation matrices.

*Solution.* `P` puts the rows in the order 2, 3, 1; twice gives 3, 1, 2; three times gives 1, 2, 3. **`P² = [0 0 1; 1 0 0; 0 1 0]`, `P³ = I`, `P⁻¹ = P² = Pᵀ`.** There are `5! = 120` permutation matrices of size 5.

**P7. Undoing two moves (robot).** A rover at the origin facing along x drives 2 m (move A), then turns 90° left and drives 1 m (move B). Follow both undo orders.

*Solution.* After A: (2, 0). After B: **(2, 1)**, facing along y. Undo B then A: back 1 m to (2, 0), turn right, back 2 m to **(0, 0)**. Undo A then B: back 2 m while still facing along y, to (2, −1); then back 1 m to (2, −2) and turn right. **The wrong order ends at (2, −2), 2.83 m from home**, with the right heading and the wrong position. Without the turn, either order works.

**P8. A tick budget (robot).** 20,000 operations per tick are available for the solve, the matrix is fixed, and `n = 60`.

*Solution.* From scratch: `71,980 + 3,600 = 75,580`, almost four ticks. With stored factors: `3,600`, which is 18% of the budget. **Only the factored solve fits.** Largest `n`: 141 with stored factors (`n² ≤ 20,000`), and 38 from scratch (19,722 operations; `n = 39` needs 21,281). The 71,980 operations of factoring are spent once, before the loop, when there is no deadline.

**P9. A small spline (robot).** A lifting axis passes through heights 0, 5, 5, 0 at one-second intervals with zero acceleration at both ends. Find `M₁`, `M₂`. Then the third height becomes 10.

*Solution.* `T = [4 1; 1 4] = [1 0; 1/4 1][4 1; 0 15/4]`. First case: right-hand side `6(0 − 10 + 5) = −30` and `6(5 − 10 + 0) = −30`. Forward: `y = (−30, −30 + 7.5) = (−30, −22.5)`. Back: `M₂ = −22.5 ÷ 3.75 = −6`, `M₁ = (−30 + 6)/4 = −6`. Second case: right-hand side `(0, −90)`. Forward: `y = (0, −90)`. Back: `M₂ = −24`, `M₁ = (0 + 24)/4 = 6`. **Answers: (−6, −6), then (6, −24).** The factors were reused untouched, and raising one waypoint quadrupled the acceleration demanded there.

**P10. Crossed cables (robot).** Commands (5, 7, 9) go to outputs 1, 2, 3. Motor 1 gets output 3, motor 2 gets output 1, motor 3 gets output 2. Find `P`, what the motors receive, and what to send.

*Solution.* `P = [0 0 1; 1 0 0; 0 1 0]`. The motors receive `P(5, 7, 9) = (9, 5, 7)`. Send `Pᵀ(5, 7, 9) = (7, 9, 5)`; the cables then deliver `P(7, 9, 5) = (5, 7, 9)`. **Answer: send (7, 9, 5).** For a plain exchange of two cables the repair matrix would be the mistake itself.

---

## 10. Go deeper

- Strang, *Introduction to Linear Algebra*, section 2.6 (Elimination = Factorization: `A = LU`) and section 2.7 (Transposes and Permutations).
- Trefethen and Bau, *Numerical Linear Algebra*, the lectures on Gaussian elimination, pivoting and stability: why software always pivots, and why solving beats inverting.
- Golub and Van Loan, *Matrix Computations*, the chapters on general and on special (banded, symmetric) linear systems: in-place `LU`, operation counts and banded solvers.
- Lynch and Park, *Modern Robotics*, the chapter on rigid-body motions (homogeneous transforms and their inverses) and the chapter on trajectory generation.
- de Boor, *A Practical Guide to Splines*: the standard reference for cubic splines and the tridiagonal systems behind them.
- Featherstone, *Rigid Body Dynamics Algorithms*: how the symmetric joint-space inertia matrix of a robot is factored into triangular and diagonal factors that exploit its symmetry and sparsity.

*Lecture content follows MIT OpenCourseWare 18.06 (Gilbert Strang), licensed CC BY-NC-SA 4.0. The robotics examples, numbers and wording in this note are original to this project.*
