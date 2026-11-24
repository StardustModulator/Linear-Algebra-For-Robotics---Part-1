# Formula sheet

> Every rule and equation from the first seven lectures on one page, each next to what it means on a robot. Numbers in brackets are lecture numbers. Use it to revise before writing, or to check a formula while writing.

## The one sentence behind everything

```
A x = b        A: the machine (m rows by n columns)
               x: what we choose or do not know (n numbers)
               b: what we measure or want (m numbers)
```

On a robot: **sensors write the rows, motors own the columns.** [1]

---

## Lecture 1 · Seeing A x = b

| Rule | Robot reading |
|---|---|
| **Row picture:** row *i* of `A x = b` is one line (2-D) or plane (3-D); the solution is where all of them meet | Each sensor reading confines the robot to a line; the fix is the crossing |
| **Column picture:** `x₁ a₁ + x₂ a₂ + … + xₙ aₙ = b`, where `aⱼ` is column *j* | Each actuator contributes its column; `xⱼ` is how hard to drive it |
| **`A x` by columns:** a combination of the columns of `A` | Forward problem: commands in, motion out |
| **`A x` by rows:** entry *i* is `(row i) · x` | Each output is a weighted sum of all inputs |
| **Solvable for every `b`** ⇔ the columns fill `Rᵐ` | The actuators can produce every required motion |
| **Singular:** the columns do not fill the space; 0 or infinitely many solutions | A singularity: a missing direction of motion or sensing |

Bearing `φ` to a beacon at `(p, q)`:  `(sin φ) x − (cos φ) y = (sin φ) p − (cos φ) q`

Planar arm Jacobian, column *i*: the vector from joint *i* to the hand, turned 90° anticlockwise: `(a, b) → (−b, a)`

Thruster at `(x, y)` pushing along angle `a`: column `(cos a, sin a, x sin a − y cos a)` in `(Fx, Fy, τ)`

---

## Lecture 2 · Elimination

| Rule | Robot reading |
|---|---|
| **Multiplier** `ℓᵢⱼ = (entry to remove) / (pivot)`; then row *i* ← row *i* − `ℓᵢⱼ` × pivot row | One recorded step of the solve |
| **Pivots** must be non-zero. Zero pivot with a non-zero below: exchange rows. Zero with nothing below: singular | That sensor says nothing about this unknown: ask another, or the quantity is unobservable |
| **Back-substitution:** solve the last equation of `U x = c` first, then move up | Use the directly measured quantity first |
| **Elimination matrix** `Eᵢⱼ`: the identity with `−ℓᵢⱼ` in position (i, j) | A stored, replayable instruction |
| `E₃₂ (E₂₁ A) = (E₃₂ E₂₁) A = U` | One matrix does all of elimination |
| **Associative:** `(AB)C = A(BC)`.  **Not commutative:** `AB ≠ BA` in general | The order of operations matters |
| **Permutation** `P` on the **left** reorders rows; on the **right** reorders columns | Reorder sensors (left) or relabel motors (right) |
| Inverse of `E₂₁` (subtract `ℓ` × row 1): **add** `ℓ` × row 1 back | Undoing one instruction |

The lecture's example: `A = [1 2 1; 3 8 1; 0 4 1]`, `b = (2, 12, 2)` → pivots 1, 2, 5 → `U = [1 2 1; 0 2 −2; 0 0 5]`, `c = (2, 6, −10)` → `x = (2, 1, −2)`.

Omni wheel *i* at angle `αᵢ`, body radius `R`: rim speed `sᵢ = −sin(αᵢ) vₓ + cos(αᵢ) v_y + R ω`

---

## Lecture 3 · Multiplication and inverses

| Rule | Robot reading |
|---|---|
| `cᵢⱼ = (row i of A) · (column j of B) = Σₖ aᵢₖ bₖⱼ` | One entry of a combined transform |
| **Sizes:** `(m × n)(n × p) = (m × p)` | Frames must chain: output of one is input of the next |
| **Columns of `AB`** = `A` × (columns of `B`) | Where each axis of the far frame ends up |
| **Rows of `AB`** = (rows of `A`) × `B` | Each output row as a mix of input rows |
| `AB = Σₖ (column k of A)(row k of B)` | A sum of one-direction pieces |
| **Column × row** is a rank-one matrix | A machine whose output always points one way |
| **Blocks:** `[A₁ A₂; A₃ A₄][B₁ B₂; B₃ B₄]` has top-left block `A₁B₁ + A₂B₃` | `[R p; 0 1][R′ p′; 0 1] = [RR′  Rp′ + p; 0 1]` |
| **Inverse:** `A⁻¹A = I = AA⁻¹` (square) | Undo a motion; switch viewpoint |
| **No inverse** if some `x ≠ 0` has `A x = 0` | Information destroyed: a motion the sensor cannot see |
| **Gauss-Jordan:** `[A I] → [I A⁻¹]`, because `E[A I] = [EA E] = [I E]` | Solve for every unit command at once |
| 2 × 2: `[a b; c d]⁻¹ = (1/(ad − bc)) [d −b; −c a]` (if `ad − bc ≠ 0`) | Quick check by hand |

The lecture's example: `[1 3; 2 7]⁻¹ = [7 −3; −2 1]`. `[1 3; 2 6]` has no inverse: `[1 3; 2 6](3, −1) = 0`.

Planar pose: `T = [cos θ  −sin θ  x;  sin θ  cos θ  y;  0 0 1]`.  Inverse: `[R p; 0 1]⁻¹ = [Rᵀ  −Rᵀp; 0 1]`.

---

## Lecture 4 · A = LU

| Rule | Robot reading |
|---|---|
| `(AB)⁻¹ = B⁻¹ A⁻¹` | Undo the last move first (socks, then shoes) |
| `(Aᵀ)⁻¹ = (A⁻¹)ᵀ` | One factorization serves velocities and forces |
| `A = L U`: `L` lower triangular with 1s on the diagonal and the multipliers below; `U` has the pivots | Factor the robot's matrix once and keep it |
| `A = L D U`: pivots pulled into the diagonal `D` | The scale of each stage, kept apart |
| No row exchanges ⇒ **the multipliers go straight into `L`** | `L` is a clean log of the elimination |
| `E = E₃₂E₃₁E₂₁` can mix multipliers; `L = E₂₁⁻¹E₃₁⁻¹E₃₂⁻¹` never does | Why software stores `L`, not `E` |
| **Cost of factoring:** about `n³/3` multiply-subtracts | Paid once |
| **Cost per right-hand side:** about `n²` (`L y = b` downward, `U x = y` upward) | Paid every control tick |
| **Permutations of size n:** `n!` of them; `P⁻¹ = Pᵀ` | Ways to wire `n` motors to `n` outputs |

The lecture's example: `[2 1; 8 7] = [1 0; 4 1][2 1; 0 3] = [1 0; 4 1][2 0; 0 3][1 ½; 0 1]`.

---

## Lecture 5 · Transposes, permutations, spaces

| Rule | Robot reading |
|---|---|
| `PA = LU` for every invertible `A` | The general-purpose solver in every library |
| **Partial pivoting:** bring the largest available entry up as the pivot | Never divide by your weakest measurement |
| `(Aᵀ)ᵢⱼ = Aⱼᵢ` | Rows become columns |
| `(AB)ᵀ = BᵀAᵀ` | Reverse order, as for inverses |
| **Symmetric:** `Aᵀ = A` | Inertia and covariance matrices |
| `RᵀR` is always symmetric: `(RᵀR)ᵀ = RᵀR` | `JᵀJ` and `JJᵀ` are always symmetric |
| `τ = Jᵀ F` (from `τ · q̇ = F · v` for every `q̇`) | Hand force to joint torques: the transpose |
| **Vector space:** closed under `v + w` and `c v` | All velocities, all forces, all joint speeds |
| **Subspace:** a vector space inside another; **must contain 0** | The set of motions a constrained robot can make |
| Subspaces of R²: R², lines through 0, {0}. Of R³: R³, planes through 0, lines through 0, {0} | Every possible shape of a linear "motion set" |
| **Column space** `C(A)`: all combinations of the columns | Every velocity the actuators can produce |

Differential drive (wheel radius `r`, track `W`): `(vₓ, v_y, ω) = [r/2 r/2; 0 0; −r/W r/W] (ω_L, ω_R)`, so `v_y = 0` always.

The lecture's example: `R = [1 3; 2 3; 4 1]` times its transpose `[1 2 4; 3 3 1]` gives `[10 11 7; 11 13 11; 7 11 17]`, which is symmetric (it is `RRᵀ`, the same rule with `Rᵀ` in the role of `R`).

---

## Lecture 6 · Column space and nullspace

| Rule | Robot reading |
|---|---|
| `S ∩ T` is a subspace; `S ∪ T` usually is not | What both robots can do / what either can do |
| **`A x = b` is solvable ⇔ `b ∈ C(A)`** | A command is feasible only inside `C(J)` |
| `C(A)` lives in `Rᵐ` (outputs); `N(A)` lives in `Rⁿ` (inputs) | Hand velocities / joint speeds |
| **Nullspace** `N(A) = {x : A x = 0}` | Self-motion: the joints move, the hand does not |
| `A(v + w) = Av + Aw = 0`, `A(cv) = c·Av = 0` ⇒ `N(A)` is a subspace | Self-motions can be mixed and scaled freely |
| Solutions of `A x = b` (b ≠ 0) are **not** a subspace: they are `x_p + N(A)` | One way to do the task, plus any self-motion |
| Describe a subspace by **generators** (`C(A)`) or by **constraints** (`N(A)`) | "What these actuators produce" / "what obeys this rule" |

The lecture's example: `A = [1 1 2; 2 1 3; 3 1 4; 4 1 5]`. Column 3 = column 1 + column 2. `C(A)` is a plane in R⁴. `N(A) = c(1, 1, −1)`.

---

## Lecture 7 · Solving A x = 0

| Rule | Robot reading |
|---|---|
| Elimination does not change the nullspace: `N(A) = N(U) = N(R)` | Re-arranging equations does not change what is invisible |
| **Rank** `r` = number of pivots | Directions truly controlled (not the number of motors) |
| **Pivot variables** (r of them) are forced; **free variables** (n − r) are chosen | Actuators that compensate / spare actuators |
| **Special solution:** one free variable = 1, the others = 0, solve for the pivots | One basic self-motion |
| **`N(A)` = all combinations of the `n − r` special solutions** | Every self-motion is a mix of the basic ones |
| `R = [I F; 0 0]` (pivot columns first) | The cleanest form of who depends on whom |
| `N = [−F; I]`, and `R N = 0` | `x_pivot = −F x_free`: the compensation rule |
| `rank(A) = rank(Aᵀ)` | Velocities and forces lose the same number of directions |
| A zero row in `U` | A redundant sensor or constraint |

The lecture's example: `A = [1 2 2 2; 2 4 6 8; 3 6 8 10]` → `U = [1 2 2 2; 0 0 2 4; 0 0 0 0]` → `R = [1 2 0 −2; 0 0 1 2; 0 0 0 0]`. Rank 2; pivot columns 1, 3; free columns 2, 4. Special solutions `(−2, 1, 0, 0)` and `(2, 0, −2, 1)`. Its transpose has rank 2 and nullspace `c(−1, −1, 1)`.

---

## Counting at a glance

For an `m × n` matrix of rank `r`:

| Quantity | Value | Robot reading |
|---|---|---|
| Pivots | `r` | Independent directions commanded |
| Free variables, special solutions | `n − r` | Redundancy: spare ways to move |
| Zero rows in `U` | `m − r` | Redundant equations (sensors or constraints) |
| `A x = b` solvable for every `b` | when `r = m` | Full authority over the task |
| `A x = b` has at most one solution | when `r = n` | No self-motion, no spare actuators |
| `A` invertible | when `r = m = n` | Exactly enough, all independent |
