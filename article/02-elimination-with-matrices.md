# Lecture 2 · Elimination with Matrices

> **The thesis in one sentence:** elimination solves `A x = b` by removing one unknown at a time, every step of it is itself a matrix that can be stored, multiplied and undone, and a robot reads its pivots as a report on what its sensors can and cannot see.

| | |
|---|---|
| Lecture | MIT 18.06 Linear Algebra, Lecture 2, Prof. Gilbert Strang (47:42) |
| Watch | [Lecture 2 on MIT OpenCourseWare](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-2-elimination-with-matrices/) |
| Summary and problems | [18.06SC session page](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/elimination-with-matrices/) · [lecture summary PDF](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/resources/mit18_06scf11_ses1-2sum/) |
| Textbook | Strang, *Introduction to Linear Algebra*, sections 2.2 to 2.3 |
| Interactive page | [`02-elimination-with-matrices.html`](../02-elimination-with-matrices.html), Labs 2.1 to 2.4 |
| Code | [`code/l02_elimination.py`](../code/l02_elimination.py) |

---

## 1. What this lecture is really about

Lecture 1 explained what a linear system *means*. Lecture 2 explains how to *solve* one, and then changes the way the solving is written down.

The lecture has two halves.

1. **Elimination as a procedure.** Subtract multiples of one equation from the equations below it until the system is triangular, then solve it from the bottom up. Along the way: pivots, multipliers, the augmented matrix, back-substitution, and the two ways the procedure can fail.
2. **Elimination as matrix multiplication.** Each subtraction is the same as multiplying by a simple matrix. The whole procedure is a product of such matrices. This half introduces the rules of that product (brackets may move, order may not), the matrices that exchange rows, and the first inverse.

The second half is the one that gives the lecture its title, and it is the bridge to everything that follows: Lecture 3 studies the product and the inverse properly, and Lecture 4 turns the stored elimination steps into the factorization `A = LU`.

For a robotics article the lecture offers one very usable idea: **elimination is a conversation with the sensors**. Each row is a sensor, each pivot says how much that sensor knows about one unknown, and a missing pivot is a blind spot.

---

## 2. The ideas, from scratch

### 2.1 The system

Strang uses one example for the whole lecture:

```
  x + 2y +  z =  2                [ 1  2  1 ]        [  2 ]
 3x + 8y +  z = 12            A = [ 3  8  1 ]    b = [ 12 ]
      4y +  z =  2                [ 0  4  1 ]        [  2 ]
```

The third equation has no `x`, so its first coefficient is 0.

### 2.2 The one permitted move

**Subtract a multiple of one equation from another.** If two equations are true, the second minus three times the first is true as well. No information is lost, because adding the same multiple back restores the original. The unknowns do no work in this, so the method is run on the matrix of coefficients.

Three words:

- **Pivot.** The entry on the diagonal that is used to clear the entries below it. The first pivot is the top-left entry.
- **Multiplier.** How many times the pivot row is subtracted. Always *(entry to remove) ÷ (pivot)*.
- **Upper triangular.** A matrix whose entries below the diagonal are all zero. The result of elimination is called `U`.

### 2.3 Elimination on the lecture's matrix

Strang names each step by the position it clears.

| Step | Pivot | Entry to remove | Multiplier | Row operation | New row |
|---|---|---|---|---|---|
| (2,1) | 1 | 3 | 3 ÷ 1 = 3 | row 2 − 3 × row 1 | `[0 2 −2]` |
| (3,1) | 1 | 0 | 0 | nothing to do | `[0 4 1]` |
| (3,2) | 2 | 4 | 4 ÷ 2 = 2 | row 3 − 2 × row 2 | `[0 0 5]` |

```
     [ 1  2  1 ]          [ 1  2  1 ]          [ 1  2  1 ]
 A = [ 3  8  1 ]    →     [ 0  2 −2 ]    →     [ 0  2 −2 ] = U
     [ 0  4  1 ]          [ 0  4  1 ]          [ 0  0  5 ]
```

The pivots are **1, 2 and 5**. In passing, their product, 10, is the determinant of `A`. Determinants come much later in the course, so mention it only as a hint that the pivots carry real information.

### 2.4 The augmented matrix and back-substitution

The right-hand sides must go through the same subtractions as the left-hand sides. The tidy way is to attach `b` as an extra column and operate on whole rows. `[A | b]` is the **augmented matrix**.

```
 [ 1  2  1 |  2 ]        [ 1  2  1 |  2 ]        [ 1  2  1 |   2 ]
 [ 3  8  1 | 12 ]   →    [ 0  2 −2 |  6 ]   →    [ 0  2 −2 |   6 ]  = [U | c]
 [ 0  4  1 |  2 ]        [ 0  4  1 |  2 ]        [ 0  0  5 | −10 ]
```

`b = (2, 12, 2)` has become `c = (2, 6, −10)`: `12 − 3·2 = 6`, then `2 − 2·6 = −10`.

The triangular system `U x = c` reads

```
 x + 2y +  z =   2
     2y − 2z =   6
          5z = −10
```

**Back-substitution** solves it from the bottom:

1. `5z = −10`, so `z = −2`.
2. `2y − 2(−2) = 6`, so `2y = 2` and `y = 1`.
3. `x + 2(1) + (−2) = 2`, so `x = 2`.

The solution is **(2, 1, −2)**. Check in the original equations: `2 + 2 − 2 = 2`, `6 + 8 − 2 = 12`, `4 − 2 = 2`.

Every one of those three steps divides by a pivot. That is the second reason a pivot may not be zero (the first is that the multiplier divides by it).

### 2.5 When elimination fails

**Temporary failure.** A zero appears in a pivot position but an entry below it in the same column is non-zero. Exchange the two rows and carry on. Equations may be listed in any order. Example: change the 8 in `A` to a 6.

```
 [ 1  2  1 ]        [ 1  2  1 ]                     [ 1  2  1 ]
 [ 3  6  1 ]   →    [ 0  0 −2 ]   → exchange →      [ 0  4  1 ]      pivots 1, 4, −2
 [ 0  4  1 ]        [ 0  4  1 ]     rows 2, 3       [ 0  0 −2 ]
```

With the lecture's `b` this system has the solution (5/2, 5/4, −3).

**Permanent failure.** A zero in a pivot position and nothing but zeros below it. The lecture's example changes the bottom-right entry of `A` from 1 to −4:

```
 [ 1  2  1 ]        [ 1  2  1 ]        [ 1  2  1 ]
 [ 3  8  1 ]   →    [ 0  2 −2 ]   →    [ 0  2 −2 ]      only two pivots: 1, 2
 [ 0  4 −4 ]        [ 0  4 −4 ]        [ 0  0  0 ]
```

A square matrix without a full set of pivots is **singular**, or **not invertible**. What the system then says depends on `b`. With `b = (2, 12, 2)` the last row reads `0 = −10`: no solution. With `b = (2, 12, 12)` it would read `0 = 0`: infinitely many solutions. These are the two singular cases of Lecture 1 (parallel lines, repeated line), reached by arithmetic.

### 2.6 Two ways to read a product

The matrix half of the lecture rests on two readings of multiplication.

- **Matrix times column = a combination of the columns.**
  `A (2, 1, −2) = 2·(1, 3, 0) + 1·(2, 8, 4) − 2·(1, 1, 1) = (2, 12, 2)`. This is the solution, read as in Lecture 1.
- **Row times matrix = a combination of the rows.**
  `[−3 1 0] A = −3·[1 2 1] + 1·[3 8 1] + 0·[0 4 1] = [0 2 −2]`. This is the new row 2 of the first elimination step.

The second reading is the key: **a row operation is a multiplication on the left**.

### 2.7 Elimination matrices

To subtract 3 × row 1 from row 2 and leave rows 1 and 3 alone, multiply on the left by a matrix whose rows say "one of row 1", "−3 of row 1 plus one of row 2", "one of row 3":

```
       [  1  0  0 ]                [ 1  0  0 ]
 E21 = [ −3  1  0 ]          E32 = [ 0  1  0 ]
       [  0  0  1 ]                [ 0 −2  1 ]
```

Each is the **identity matrix** (the matrix that changes nothing) with one extra entry: *minus the multiplier, in the position being cleared*. Strang calls them **elimination matrices**; textbooks also say elementary matrices. Step (3,1) had multiplier 0, so `E31` is the identity.

```
 E21 A = [ 1 2 1; 0 2 −2; 0 4 1 ]          E32 (E21 A) = U
```

### 2.8 Brackets may move, order may not

**Associative law.** `E32 (E21 A) = (E32 E21) A`. So the two steps can be multiplied together first:

```
               [  1  0  0 ]
 E = E32 E21 = [ −3  1  0 ]          E A = U
               [  6 −2  1 ]
```

The 6 deserves a sentence. Row 3 of `E` says how row 3 of `U` is built from the rows of `A`: `6·row 1 − 2·row 2 + 1·row 3 = [0 0 5]`. Step (3,2) subtracted twice the *new* row 2, which already contained −3 of row 1, and `(−2)(−3) = 6`.

**Not commutative.** In the other order the product is a different matrix:

```
           [  1  0  0 ]
 E21 E32 = [ −3  1  0 ]          (E21 E32) A = [ 1 2 1; 0 2 −2; −6 −12 −1 ],  not U
           [  0 −2  1 ]
```

Strang's summary: you can move the parentheses, you cannot move the matrices.

A useful extra that falls out of the same idea: the matrix `E` that turns `A` into `U` also turns `b` into `c`. `E (2, 12, 2) = (2, 6, −10)`.

### 2.9 Permutation matrices

A row exchange is also a multiplication. The **permutation matrix** `P` is the identity with its rows re-ordered.

```
 [ 0 1 ] [ a b ]   [ c d ]                [ a b ] [ 0 1 ]   [ b a ]
 [ 1 0 ] [ c d ] = [ a b ]                [ c d ] [ 1 0 ] = [ d c ]
   P on the left exchanges ROWS             P on the right exchanges COLUMNS
```

Read the first product by rows (row 1 of `P` is `[0 1]`: none of row 1, one of row 2). Read the second by columns (column 1 of `P` is `(0, 1)`: none of column 1, one of column 2).

The rule to remember: **row operations multiply on the left, column operations multiply on the right.** Elimination uses row operations only, which is why every `E` and every `P` stands to the left of `A`.

The stuck matrix of section 2.5 is rescued by `P23`, the identity with rows 2 and 3 exchanged: `P23 [1 2 1; 0 0 −2; 0 4 1] = [1 2 1; 0 4 1; 0 0 −2]`.

### 2.10 A first inverse

`E21` subtracted 3 × row 1 from row 2. The step that undoes it adds 3 × row 1 back:

```
          [ 1  0  0 ]
 E21⁻¹ =  [ 3  1  0 ]          E21⁻¹ E21 = I
          [ 0  0  1 ]
```

That is the lecture's first **inverse**: the matrix `M⁻¹` with `M⁻¹ M = I`. For an elimination matrix, flip the sign of the multiplier. For a row exchange, do the exchange again (`P P = I`). A singular matrix has no inverse, because it destroys information. Lecture 3 continues from here.

---

## 3. The robotics connection

The sentence to carry: **elimination questions the sensors one at a time; a pivot is how much a sensor knows, and a zero pivot is a sensor with nothing to say.**

All numbers in this section are printed by `code/l02_elimination.py`.

### 3.1 A warm-up: two wheels, and what a pivot means

A two-wheeled (differential-drive) robot has wheels a distance `W` apart. Its unknowns are forward speed `v` (m/s) and turn rate `ω` (rad/s, counter-clockwise positive). Each wheel has an **encoder** that reports the speed of the wheel's rim (m/s). The left wheel sits at `y = +W/2` and the right wheel at `y = −W/2`, both rolling along `x`, so

```
 s_left  = v − (W/2) ω            [ 1  −W/2 ] [ v ]   [ s_left  ]
 s_right = v + (W/2) ω            [ 1   W/2 ] [ ω ] = [ s_right ]
```

Elimination: pivot 1, multiplier 1, and row 2 − row 1 gives `W ω = s_right − s_left`. **The second pivot is `W`.** Then `v = s_left + (W/2) ω`.

| Wheel spacing `W` | Pivots | Readings (0.5, 0.7) m/s give | A 0.01 m/s error on the right wheel changes `ω` by |
|---|---|---|---|
| 0.4 m | 1, 0.4 | `v = 0.6` m/s, `ω = 0.5` rad/s | 0.025 rad/s |
| 0.1 m | 1, 0.1 | `v = 0.6` m/s, `ω = 2.0` rad/s | 0.100 rad/s |

A quarter of the spacing, four times the error. This is the cleanest way to explain a pivot to a reader: **it measures how firmly an equation pins down its unknown**. Back-substitution divides by it, so a small pivot magnifies noise.

### 3.2 Omni-wheel odometry: deriving the matrix

An **omni wheel** has free rollers around its rim: it grips along its rolling direction and slips freely sideways. A platform with three of them can translate in any direction and rotate at the same time.

**Unknowns.** The body velocity in the robot's own frame: `v_x` (forward, m/s), `v_y` (to the left, m/s), `ω` (rad/s, counter-clockwise positive).

**Measurements.** Three rim speeds `s₁, s₂, s₃` (m/s), one per wheel. An encoder really measures wheel angle; rim speed is wheel radius times the wheel's angular rate.

**One wheel, one equation.** Put wheel *i* at angle `αᵢ` on a circle of radius `R` (m) about the robot's centre, at the point `p = (R cos αᵢ, R sin αᵢ)`, rolling along the tangent `t = (−sin αᵢ, cos αᵢ)`.

1. A point `p = (p_x, p_y)` of a rigid body moving with `(v_x, v_y, ω)` has velocity `(v_x − ω p_y, v_y + ω p_x)`.
2. An ideal omni wheel reports only the part of that velocity along its rolling direction: `sᵢ = t · (v_x − ω p_y, v_y + ω p_x)`.
3. Substitute: `sᵢ = −sin αᵢ (v_x − ω R sin αᵢ) + cos αᵢ (v_y + ω R cos αᵢ) = −sin αᵢ · v_x + cos αᵢ · v_y + R ω (sin² αᵢ + cos² αᵢ)`.

So

```
 sᵢ = −sin(αᵢ) v_x + cos(αᵢ) v_y + R ω            units: m/s = (1)(m/s) + (1)(m/s) + (m)(rad/s)
```

The script checks this formula against the direct computation in steps 1 and 2 for seven wheel angles; the largest difference is 1.1e-16 (rounding).

Three wheels give `A x = s`, **one row per wheel**: sensors write the rows, as in Lecture 1. More generally, a wheel at `(x, y)` rolling along any unit direction `(d_x, d_y)` has the row `[d_x, d_y, x d_y − y d_x]`, which is used for the two non-standard layouts below.

**Honest simplification.** The model is planar and assumes perfectly round wheels that never slip. Real odometry drifts, which is why robots correct it with sensors that look at the world.

### 3.3 The healthy layout: wheels at 90°, 210°, 330°, R = 0.2 m

```
     [ −1      0      0.2 ]
 A = [  0.5   −0.866  0.2 ]
     [  0.5    0.866  0.2 ]
```

A body velocity of `(0.3, 0, 0.5)` produces readings `(−0.20, 0.25, 0.25)` m/s. The robot's problem runs the other way. Elimination on `[A | s]`:

| Step | Multiplier | Operation |
|---|---|---|
| (2,1) | −0.5 | row 2 + 0.5 × row 1 |
| (3,1) | −0.5 | row 3 + 0.5 × row 1 |
| (3,2) | −1 | row 3 + row 2 |

```
           [ −1     0      0.2 | −0.20 ]
 [U | c] = [  0    −0.866  0.3 |  0.15 ]          pivots −1, −0.866, 0.6       no row exchange
           [  0     0      0.6 |  0.30 ]
```

Back-substitution: `ω = 0.30 / 0.6 = 0.5`, then `v_y = (0.15 − 0.3·0.5) / (−0.866) = 0`, then `v_x = (−0.20 − 0.2·0.5) / (−1) = 0.3`. The robot is driving a circle of radius `v_x / ω = 0.6` m.

Two things worth pointing out to readers:

- **The last row is `3R ω = s₁ + s₂ + s₃`.** The sum of the three readings cancels all translation and leaves only rotation. Back-substitution finds the turn rate first, then the sideways speed, then the forward speed: *known quantities first*.
- The third pivot is `3R = 0.6`. A larger robot pins down its turn rate more firmly, for the same reason as the wide two-wheeler.

### 3.4 A natural zero pivot: wheels at 0°, 120°, 240°

The same robot with its wheels numbered from a different angle:

```
     [  0      1     0.2 ]
 A = [ −0.866 −0.5   0.2 ]          first pivot position = 0
     [  0.866 −0.5   0.2 ]
```

Wheel 1 rolls exactly along `y`, so its equation contains no `v_x`. Elimination exchanges rows 1 and 2 and proceeds: pivots `−0.866, 1, 0.6`, one row exchange. With the same readings `(−0.20, 0.25, 0.25)` the body velocity is `(0, −0.3, 0.5)`.

This is Strang's **temporary failure**, with a physical meaning: *wheel 1 knows nothing about `v_x`, so ask a different wheel first.* Nothing is wrong with the machine.

### 3.5 A small pivot: nearly parallel wheels

Keep the wheels at 90°, 210°, 330° but aim them almost along `x`, fanned by only ±8°:

```
     [ 1      0      −0.2   ]
 A = [ 0.990  0.139   0.075 ]          pivots 1, 0.139, 0.546
     [ 0.990 −0.139   0.075 ]
```

The second pivot is `sin 8° = 0.139`: wheels 2 and 3 respond only weakly to sideways motion. The matrix is invertible, but the answer is fragile:

| Layout | 1 cm/s of error on encoder 2 becomes, in `v_y` |
|---|---|
| Nearly parallel (pivot 0.139) | 3.6 cm/s |
| 90°, 210°, 330° (pivot −0.866) | 0.6 cm/s |

This is the ill-conditioning of Lecture 1, now visible as a small pivot. It is also the reason real solvers use **partial pivoting**: at each step they exchange rows to put the largest available entry in the pivot position, without waiting for an exact zero.

### 3.6 A singular robot: all wheels parallel

Aim all three wheels exactly along `x`. A wheel at height `yᵢ` then reads `v_x − yᵢ ω`:

```
     [ 1  0  −0.2 ]                       [ 1  0  −0.2 | −0.20 ]
 A = [ 1  0   0.1 ]     elimination →     [ 0  0   0.3 |  0.45 ]     no pivot in column 2
     [ 1  0   0.1 ]                       [ 0  0   0.3 |  0.45 ]
```

The whole `v_y` column is zero. After step (2,1) and step (3,1) the second pivot position holds 0 and so does the entry below it. This is Strang's **permanent failure**, and the determinant is 0. Its meaning: sliding sideways at 0.3 m/s produces the readings `(0, 0, 0)`, exactly the readings of a robot standing still. **No software can recover a motion that no sensor responds to. Only re-mounting a wheel can.**

The two singular outcomes of section 2.5 both occur on this robot. If the readings of wheels 2 and 3 agree, infinitely many motions fit (any `v_y`). If they disagree, no rigid motion fits at all, which tells the robot that a wheel is slipping or a sensor is faulty.

### 3.7 Odometry: solve, step, repeat

**Odometry** (dead reckoning) is this solve repeated every control tick: readings in, body velocity out, multiply by the time step, rotate into the world frame, add to the pose. The script holds the readings at `(−0.20, 0.25, 0.25)` and integrates with a 0.01 s step:

| Time | x | y | Heading |
|---|---|---|---|
| 3.15 s | 0.601 m | 0.601 m | 90.2° |
| 6.29 s | 0.001 m | 1.200 m | 180.2° |
| 12.57 s | 0.001 m | 0.000 m | 360.1° |

A circle of radius 0.6 m, closed after one full turn.

### 3.8 Elimination matrices as recorded instructions

A robot's wheel geometry does not change while it drives, so `A` is the same every tick and only the readings change. The elimination steps for `A` are therefore the same every tick. Because each step is a matrix, the steps can be **stored**: work them out once, then replay them on each new right-hand side (`E b = c`). Lecture 4 turns this into `A = LU`, the standard way to solve repeatedly and fast.

Three more matrix facts with direct robot readings:

- **Order matters.** `E32 E21 ≠ E21 E32`, and robots feel the same thing in their motion: turn then drive is a different place from drive then turn (Lecture 3).
- **Left for rows, right for columns.** A `P` on the left re-orders equations, which is re-ordering sensors (two encoder cables swapped). A `P` on the right re-orders unknowns, which is re-labelling axes or motors. They cure different bugs.
- **Inverses.** Every elimination step can be undone, and a sequence is undone in reverse order. A robot that stores its motions as matrices backs out of them the same way.

---

## 4. Concept-to-robot table

| Lecture idea | Plain words | In a robot |
|---|---|---|
| Elimination | Subtract multiples of one row from the rows below until the entries under the diagonal are zero | Untangling sensor readings until each equation holds fewer unknowns than the one above |
| Pivot | The diagonal entry used to clear its column; never zero | How firmly a sensor's equation pins down its unknown (the wheel spacing `W`, or `3R`) |
| Multiplier | Entry to remove ÷ pivot | How much of one reading is subtracted from another |
| Upper triangular `U` | Zeros below the diagonal | A chain of equations whose last link has one unknown |
| Augmented matrix `[A \| b]` | The right-hand side carried along as an extra column | Readings processed through the same steps as the geometry |
| Back-substitution | Solve the last equation first, then work upward | Known quantities first: turn rate, then sideways speed, then forward speed |
| Row exchange | Zero in a pivot position, non-zero below: swap rows | This sensor says nothing about this unknown; ask another first |
| Singular matrix | A zero pivot with nothing to exchange in | A motion no sensor can see (sideways sliding on parallel wheels) |
| Small pivot | Dividing by a small number magnifies error | A fragile estimate; solvers pivot on the largest entry |
| Row times matrix | A combination of the rows | Why a row operation is a multiplication on the left |
| Elimination matrix `E21` | Identity with minus the multiplier in position (2,1) | One step of a procedure, stored as data |
| `E = E32 E21`, associative law | Brackets may move: one matrix does every step | Compute the steps once per wheel layout, apply to every reading: `E b = c` |
| Not commutative | Order may not change | Turn-then-drive differs from drive-then-turn |
| Permutation `P` | Left: exchanges rows. Right: exchanges columns | Re-ordering sensors; re-labelling axes or motors |
| Inverse `E21⁻¹` | The matrix that undoes a step | Retracing a motion; running a procedure backwards |
| Solving every tick | Same elimination, new right-hand side | Odometry: add up the small motions |

---

## 5. Common mistakes and misconceptions

- **Subtracting in the wrong direction.** The multiplier is *(entry to remove) ÷ (pivot)* and the operation is *row − multiplier × pivot row*. A negative multiplier therefore becomes an addition. In the omni example every multiplier is negative.
- **Forgetting the right-hand side.** Operating on `A` alone and then solving with the old `b` is the most common slip. The augmented matrix exists to prevent it.
- **"A zero pivot means no solution."** Not if a row below can be exchanged in. Only a zero with nothing below it is fatal.
- **"Singular means no solution."** It means *not exactly one*. The right-hand side decides between none (`0 = −10`) and infinitely many (`0 = 0`).
- **Using the old row in the second step.** Step (3,2) uses the *new* row 2. That is exactly why `E32 E21` has a 6 in its corner and `E21 E32` does not.
- **Reading `E32 E21` left to right.** The matrix nearest to `A` acts first. `E32 E21 A` means: do `E21`, then `E32`.
- **Mixing up left and right.** `P A` exchanges rows; `A P` exchanges columns. In robot terms: one re-orders the sensor list, the other changes the meaning of the answer.
- **Treating a pivot as an absolute measure of quality.** Pivots depend on the order and scaling of the rows, so compare them only within one consistent setup. The safe statement is the one used here: dividing by a small pivot magnifies error, and solvers avoid it by pivoting.
- **Believing software can fix a singular layout.** If no wheel responds to a motion, that motion is not in the data.

---

## 6. Analogies and sentences you can use

- **Elimination as an interview.** Ask the first sensor about the first unknown, then use its answer to remove that unknown from everyone else's statement. Repeat with the second sensor and the second unknown.
- **A pivot as a grip.** A large pivot is a firm grip on an unknown. A small one is a fingertip hold. A zero is no hold at all.
- **A row exchange as changing the order of questions.** The witness you asked first knew nothing about that topic, so you ask the next witness first. The facts are unchanged.
- **Back-substitution as dominoes.** The last equation falls by itself, and each one that falls knocks over the one above it.
- **Elimination matrices as a recipe card.** `E21` is one line of the recipe, written so that a machine can follow it, repeat it and reverse it.
- **Non-commutativity as socks and shoes.** Order matters when putting them on, and they come off in the opposite order.
- A sentence for the article: *"Elimination questions the sensors one by one; a zero pivot is a sensor with nothing to say, and a singular matrix is a motion that no sensor can see."*
- Another: *"The last row of the wheel equations says that three times the radius times the turn rate equals the sum of the three wheel speeds; back-substitution simply reads the answers off from the bottom."*
- Another: *"You can move the brackets, you cannot move the matrices, and a robot that drives then turns knows why."*

---

## 7. Figures worth including

Every figure below is already captured in `article/figures/` (see the [figure pack](figures.md)). To retake one in a different state, open the lab, set it up, and screenshot it, or edit `tools/figures/l2.js` and run `node tools/figures.js 2`.

| Figure | Ready-made file | How it was set up |
|---|---|---|
| One elimination step with its matrix | `l2-elimination-step.png` | Lab 2.1, lecture example, step 3: "Row 2 − 3 × Row 1" with `E21` beside it |
| The upper triangular result | `l2-upper-triangular.png` | Lab 2.1, lecture example, step 8: `[U \| c]` with pivots 1, 2, 5 circled |
| Back-substitution in progress | `l2-back-substitution.png` | Lab 2.1, lecture example, step 10: row 2 gives `y = 1` |
| Temporary and permanent failure | `l2-row-exchange.png`, `l2-singular.png` | Lab 2.1, "Needs a row exchange" at the exchange step; "Singular (fails)" at its last step |
| `E21` clearing an entry | `l2-e21-clears-entry.png` | Lab 2.2, view 1, ℓ = 3 |
| One matrix for the whole elimination | `l2-one-matrix-e.png` | Lab 2.2, view 3: `E32 E21 = E` and `E A = U` |
| Order matters | `l2-order-test.png` | Lab 2.2, view 4: the corner entry is 6 one way and 0 the other |
| Undoing a step | `l2-undo-step.png` | Lab 2.2, view 5: `E21⁻¹ E21 = I` |
| `P` on the left and on the right | `l2-permutation-rows.png`, `l2-permutation-columns.png` | Lab 2.3, 2 by 2 matrix, each side |
| The exchange that rescues elimination | `l2-permutation-rescue.png` | Lab 2.3, 3 by 3 matrix, `P` on the left exchanging 2 and 3 |
| Omni odometry, healthy layout | `l2-omni-odometry.png` | Lab 2.4, wheels at 90°, 210°, 330°, default readings, after a few seconds of driving |
| A zero pivot on a healthy robot | `l2-omni-row-exchange.png` | Lab 2.4, wheels at 0°, 120°, 240° |
| A fragile layout | `l2-omni-fragile.png` | Lab 2.4, "Nearly parallel" |
| A motion no encoder can see | `l2-omni-singular.png` | Lab 2.4, "All parallel", then "Sideways": three zero readings and the ghost |

---

## 8. Check questions

1. **Which multiplier clears the (2,1) entry of the lecture's matrix, and how is it found?** 3, the entry to remove divided by the pivot: 3 ÷ 1.
2. **Solve `x + 2y + z = 2`, `2y − 2z = 6`, `5z = −10`, and say why you start at the bottom.** The last equation has one unknown: `z = −2`, then `y = 1`, then `x = 2`.
3. **What happens if the (3,3) entry of `A` is −4?** Row 3 becomes all zeros; the third pivot is missing with nothing to exchange in; the matrix is singular. With the lecture's `b` the last row reads `0 = −10`: no solution.
4. **Write `E21` and its inverse.** Identity with −3 in position (2,1); identity with +3 in position (2,1).
5. **Why does `E32 E21` have a 6 in its corner while `E21 E32` has 0?** In `E32 E21` step (2,1) acts first, so row 2 already carries −3 of row 1 when twice row 2 is subtracted from row 3: `(−2)(−3) = 6`. In the other order no row 1 reaches row 3.
6. **What does `P` do on the right of a matrix, and what is that in a robot?** It exchanges columns, which re-orders the unknowns: re-labelled axes or motors. On the left it would re-order the sensors.
7. **An omni robot has wheels at 0°, 120°, 240°; the first row of `A` is `[0 1 R]`. What does the zero say and what does elimination do? What if all wheels were parallel?** Wheel 1 feels no `v_x`; exchange rows and continue. With parallel wheels the `v_y` column is all zeros, no row can supply the pivot, and sideways sliding is unobservable.

---

## 9. Practice problems with worked solutions

The same ten problems as on the page, with full solutions. All answers are reproduced by `code/l02_elimination.py` (section 14 of its output).

**P1. A first elimination.** Solve `x + 2y = 5`, `3x + 8y = 17`. Name the multiplier and both pivots.

*Solution.* Pivot 1, multiplier `3 ÷ 1 = 3`. Row 2 − 3 × row 1: `[3 8 | 17] − [3 6 | 15] = [0 2 | 2]`. Second pivot 2. Back-substitute: `y = 1`, then `x = 3`. Multiplier **3**, pivots **1 and 2**, solution **(3, 1)**.

**P2. Three by three.** Reduce `[1 1 1 | 6; 2 4 3 | 19; 3 7 8 | 41]` to `[U | c]` and solve.

*Solution.* Step (2,1), multiplier 2: row 2 → `[0 2 1 | 7]`. Step (3,1), multiplier 3: row 3 → `[0 4 5 | 23]`. Step (3,2), multiplier 2: row 3 → `[0 0 3 | 9]`.

```
           [ 1  1  1 | 6 ]
 [U | c] = [ 0  2  1 | 7 ]
           [ 0  0  3 | 9 ]
```

`3z = 9` gives `z = 3`; `2y + 3 = 7` gives `y = 2`; `x + 2 + 3 = 6` gives `x = 1`. Multipliers **2, 3, 2**; pivots **1, 2, 3**; solution **(1, 2, 3)**.

**P3. Two failures.** Run elimination on (a) `[1 2 1; 2 4 5; 0 3 1]` and (b) `[1 2 1; 2 4 5; 3 6 4]`. Which failure is temporary?

*Solution.* (a) Row 2 − 2 × row 1 = `[0 0 3]`: zero in pivot position 2, with a 3 below it. Exchange rows 2 and 3: `[1 2 1; 0 3 1; 0 0 3]`. **Temporary**, pivots 1, 3, 3. (b) Row 2 → `[0 0 3]`, row 3 − 3 × row 1 = `[0 0 1]`: zero in pivot position 2 and zero below it. **Permanent**: the matrix is singular (column 2 is twice column 1).

**P4. Elimination matrices.** For the matrix of P2 write `E21`, `E31`, `E32`, multiply them into `E = E32 E31 E21`, and check `E b = c`.

*Solution.* Each is the identity with minus its multiplier in the position it clears: −2 at (2,1), −3 at (3,1), −2 at (3,2). `E31 E21` has rows `[1 0 0]`, `[−2 1 0]`, `[−3 0 1]`. `E32` then replaces row 3 by row 3 − 2 × row 2: `[−3 0 1] − 2[−2 1 0] = [1 −2 1]`.

```
     [  1  0  0 ]
 E = [ −2  1  0 ]          E (6, 19, 41) = (6, −12 + 19, 6 − 38 + 41) = (6, 7, 9) = c
     [  1 −2  1 ]
```

The 1 in the corner is `−3 + (−2)(−2)`: the steps have mixed.

**P5. Permutation on each side.** `P` is the 3 by 3 identity with rows 1 and 2 exchanged, `A = [1 2 3; 4 5 6; 7 8 9]`. Find `PA`, `AP`, `PP`.

*Solution.* `PA = [4 5 6; 1 2 3; 7 8 9]` (rows 1 and 2 exchanged). `AP = [2 1 3; 5 4 6; 8 7 9]` (columns 1 and 2 exchanged). `PP = I`: this `P` is its own inverse.

**P6. Undoing elimination.** The lecture's steps were `E21` (multiplier 3) then `E32` (multiplier 2). Write both inverses, say in which order they rebuild `A` from `U`, and compute their product in that order.

*Solution.* `E21⁻¹` has +3 at (2,1); `E32⁻¹` has +2 at (3,2). Since `U = E32 E21 A`, the last step is undone first: `A = E21⁻¹ E32⁻¹ U`.

```
                 [ 1  0  0 ]
 E21⁻¹ E32⁻¹ =   [ 3  1  0 ]
                 [ 0  2  1 ]
```

The multipliers 3 and 2 sit untouched in their own positions, with 0 in the corner, and this matrix times `U` gives `A`. In the wrong order, `E32⁻¹ E21⁻¹ = [1 0 0; 3 1 0; 6 2 1]`: a 6 appears and `A` is not rebuilt. Lecture 4 calls the tidy matrix `L`.

**P7. Two-wheeled robot (robot).** Wheels 2 m apart; left encoder 1 m/s, right encoder 3 m/s. Find `v` and `ω`. How much does a 0.1 m/s error on the right encoder change `ω`?

*Solution.* `v − ω = 1`, `v + ω = 3`. Multiplier 1; row 2 − row 1: `2ω = 2`, so `ω = 1` rad/s, then `v = 2` m/s. Pivots 1 and 2; the second pivot is the wheel spacing. The error is divided by that pivot: **0.05 rad/s**. With wheels 0.2 m apart the pivot is 0.2 and the same error gives 0.5 rad/s, ten times as much.

**P8. Omni odometry with a zero pivot (robot).** Radius 1 m, wheels at 0°, 90°, 180°, readings `(5, 2, 1)` m/s. Find the body velocity. What must elimination do first?

*Solution.* Rows `[−sin α, cos α, R]`: `[0 1 1]`, `[−1 0 1]`, `[0 −1 1]`. The first pivot position holds 0 because wheel 1 rolls along `y` and feels no `v_x`. Exchange rows 1 and 2:

```
 [ −1  0  1 | 2 ]                               [ −1  0  1 | 2 ]
 [  0  1  1 | 5 ]    row 3 + row 2    →         [  0  1  1 | 5 ]
 [  0 −1  1 | 1 ]                               [  0  0  2 | 6 ]
```

`ω = 3`; `v_y + 3 = 5` so `v_y = 2`; `−v_x + 3 = 2` so `v_x = 1`. **(v_x, v_y, ω) = (1, 2, 3)**, after one row exchange, pivots −1, 1, 2.

**P9. Swapped cables (robot).** The robot of P8 moves in the same way, but encoder cables 1 and 2 are swapped, so the computer receives `(2, 5, 1)` and uses the old matrix. What does it report, and which matrix repairs the software?

*Solution.* With the old matrix: after the row exchange `[−1 0 1 | 5]`, `[0 1 1 | 2]`, `[0 −1 1 | 1]`; row 3 + row 2 gives `2ω = 3`. So `ω = 1.5`, `v_y = 0.5`, `v_x = 1.5 − 5 = −3.5`. It reports **(−3.5, 0.5, 1.5)**: reversing at 3.5 m/s, while the true motion is still (1, 2, 3). The readings arrive in a different order, so the equations must be listed in that order: a row exchange, **`P` on the left**. Solving `P A x = (2, 5, 1)` gives (1, 2, 3). A `P` on the right would swap the meanings of `v_x` and `v_y` instead.

**P10. Parallel wheels (robot).** Three wheels roll along `x` at heights `y = 1, 0, −1`; a wheel at height `y` reads `v_x − yω`. Which motion is invisible? Do `(1, 2, 3)` fit a rigid motion? Do `(1, 2, 4)`? Suggest a repair.

*Solution.* `A = [1 0 −1; 1 0 0; 1 0 1]`. The `v_y` column is all zeros: after steps (2,1) and (3,1) the second pivot position and the entry below it are both 0. Permanent failure; sideways motion is invisible. For `(1, 2, 3)`: row 2 − row 1 says `ω = 1`, row 3 − row 1 says `2ω = 2`. Consistent: `ω = 1`, `v_x = 2`, `v_y` unknown (infinitely many solutions). For `(1, 2, 4)`: `ω = 1` and `2ω = 3` contradict each other, so no rigid motion fits and a wheel is slipping or a sensor is faulty. Repair: turn the middle wheel to roll along `y`. Its row becomes `[0 1 0]`, the pivots become 1, 1, 2, and `(1, 2, 3)` then gives the single motion `(v_x, v_y, ω) = (2, 2, 1)`.

---

## 10. Go deeper

- Strang, *Introduction to Linear Algebra*, sections 2.2 (the idea of elimination) and 2.3 (elimination using matrices): the source for this lecture.
- Lynch and Park, *Modern Robotics*, chapter 13 (Wheeled Mobile Robots): omnidirectional and differential-drive kinematics and odometry, in full generality.
- Siegwart, Nourbakhsh and Scaramuzza, *Introduction to Autonomous Mobile Robots*: wheel kinematic constraints and how wheel layout decides which motions a robot has.
- Thrun, Burgard and Fox, *Probabilistic Robotics*: what to do about the drift of odometry when readings are noisy.
- Trefethen and Bau, *Numerical Linear Algebra*: why pivoting is needed and what small pivots do to accuracy.
- The next two lectures of this series: Lecture 3 for the full rules of multiplication and inverses, Lecture 4 for `A = LU`, where the stored multipliers become a matrix of their own.

*Lecture content follows MIT OpenCourseWare 18.06 (Gilbert Strang), licensed CC BY-NC-SA 4.0. The robotics examples, numbers and wording in this note are original to this project.*
