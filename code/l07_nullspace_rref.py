"""
Lecture 7 - Solving Ax = 0: pivot variables, special solutions, on a robot.

    python3 code/l07_nullspace_rref.py

Covers: elimination on a rectangular matrix, echelon form U, rank, pivot and
free variables, special solutions, the whole nullspace and the count n - r,
reduced row echelon form R, the blocks R = [I F; 0 0] and N = [-F; I], and the
transpose example (same rank, different number of free variables).
Robots: a four-joint planar arm (two spare joints), a four-thruster vehicle
(one spare thruster, and what happens when one fails), a repeated sensor.
"""
import math
from fractions import Fraction
from linalg import (frac, show, fmt, heading, copy, shape, transpose, column, from_columns,
                    matvec, matmul, rref, rank, nullspace, arm_points, arm_jacobian)

LECTURE_A = [[1, 2, 2, 2],
             [2, 4, 6, 8],
             [3, 6, 8, 10]]


# ------------------------------------------------------------------ helpers
def vec(v, digits=3):
    return "(" + ", ".join(fmt(x, digits) for x in v) + ")"


def names(cols):
    return ", ".join(str(c + 1) for c in cols) if cols else "none"


def exact(M):
    """Round away float dust (cos 90 degrees = 6e-17) and switch to exact fractions."""
    return [[Fraction(round(x, 9)).limit_denominator(1000) for x in row] for row in M]


def echelon(A, verbose=False, tol=1e-9):
    """
    Forward elimination on any m by n matrix, exactly as in the lecture.
    Walk across the columns. If a column has a non-zero entry at or below the
    current row, that entry is a pivot: clear everything under it and step down
    one row. If it has none, the column is FREE: stay on the same row and move
    right. Returns (U, pivot_columns).
    """
    A = copy(A)
    m, n = shape(A)
    pivot_cols, r = [], 0
    for c in range(n):
        if r == m:
            if verbose:
                print(f"  every row now holds a pivot: column(s) {', '.join(str(j + 1) for j in range(c, n))} cannot get one -> FREE")
            break
        p = next((i for i in range(r, m) if abs(A[i][c]) > tol), None)
        if p is None:
            if verbose:
                print(f"  column {c + 1}: zeros from row {r + 1} down, no pivot here -> FREE column, move right")
            continue
        if p != r:
            A[r], A[p] = A[p], A[r]
            if verbose:
                print(f"  column {c + 1}: zero in the pivot position, exchange rows {r + 1} and {p + 1}")
        if verbose:
            print(f"  column {c + 1}: pivot {fmt(A[r][c])} in row {r + 1}")
        for i in range(r + 1, m):
            if abs(A[i][c]) > tol:
                l = A[i][c] / A[r][c]
                A[i] = [a - l * b for a, b in zip(A[i], A[r])]
                if verbose:
                    print(f"      row {i + 1} <- row {i + 1} - ({fmt(l)}) * row {r + 1}   =  {vec(A[i])}")
        pivot_cols.append(c)
        r += 1
    A = [[0 if (not isinstance(a, Fraction) and abs(a) < tol) else a for a in row] for row in A]
    return A, pivot_cols


def solve_from_free(U, pivot_cols, free_values):
    """
    Back-substitution for U x = 0. free_values maps a free column to the value
    chosen for that variable. The pivot variables are then forced, last one first.
    """
    n = len(U[0])
    x = [0] * n
    for col, value in free_values.items():
        x[col] = value
    for row in range(len(pivot_cols) - 1, -1, -1):
        pc = pivot_cols[row]
        rest = sum(U[row][j] * x[j] for j in range(pc + 1, n))
        x[pc] = -rest / U[row][pc]
    return x


def blocks(R, pivot_cols):
    """The F block of R (free columns, pivot rows) and the nullspace matrix N."""
    n = len(R[0])
    free_cols = [j for j in range(n) if j not in pivot_cols]
    F = [[R[i][f] for f in free_cols] for i in range(len(pivot_cols))]
    N = from_columns(nullspace(R)) if free_cols else None
    return F, N, free_cols


def thruster_column(x, y, ang):
    """One newton from a thruster at (x, y) metres pushing along ang: [Fx, Fy, torque]."""
    return [math.cos(ang), math.sin(ang), x * math.sin(ang) - y * math.cos(ang)]


def particular(B, b):
    """One solution of B f = b: every free variable set to 0, pivot variables read off rref([B b])."""
    n = len(B[0])
    R, piv = rref([list(row) + [bi] for row, bi in zip(B, b)])
    if n in piv:
        return None                      # a pivot in the last column: 0 = non-zero, no solution
    f = [0] * n
    for i, p in enumerate(piv):
        f[p] = R[i][n]
    return f


# ------------------------------------------------------------------ the lecture
def lecture_matrix():
    heading("1. The lecture's matrix: 3 rows, 4 columns")
    A = frac(LECTURE_A)
    show(A, "A")
    print("Look before you start:")
    print("  column 2 =", vec(column(A, 1)), "= 2 * column 1 =", vec([2 * v for v in column(A, 0)]))
    print("  row 1 + row 2 =", vec([a + b for a, b in zip(A[0], A[1])]), "= row 3 =", vec(A[2]))
    print("Elimination will discover both facts without being told.\n")


def elimination():
    heading("2. Elimination on a rectangular matrix (solving A x = 0)")
    print("The right-hand side is all zeros and stays all zeros, so it is not carried along.")
    A = frac(LECTURE_A)
    U, piv = echelon(A, verbose=True)
    print()
    show(U, "U")
    print("U is in echelon (staircase) form. Row operations never change the solutions,")
    print("so the nullspace of A is the nullspace of U.\n")
    return U, piv


def rank_and_variables(U, piv):
    heading("3. Rank, pivot variables, free variables")
    n = len(U[0])
    free = [j for j in range(n) if j not in piv]
    print("pivots found:", [fmt(U[i][c]) for i, c in enumerate(piv)])
    print("rank r = number of pivots =", len(piv))
    print("pivot columns:", names(piv), "  -> pivot variables x" + ", x".join(str(c + 1) for c in piv))
    print("free columns: ", names(free), "  -> free variables  x" + ", x".join(str(c + 1) for c in free))
    print("U x = 0 written out:")
    print("   x1 + 2 x2 + 2 x3 + 2 x4 = 0")
    print("                2 x3 + 4 x4 = 0")
    print("                          0 = 0\n")
    return free


def special_solutions(U, piv, free):
    heading("4. Special solutions: one free variable = 1, the others = 0")
    A = frac(LECTURE_A)
    sols = []
    for k, f in enumerate(free):
        choice = {c: (1 if c == f else 0) for c in free}
        x = solve_from_free(U, piv, choice)
        sols.append(x)
        chosen = ", ".join(f"x{c + 1} = {v}" for c, v in choice.items())
        print(f"  choose {chosen}   ->  back-substitution gives  s{k + 1} = {vec(x)}")
        print(f"      check  A s{k + 1} = {vec(matvec(A, x))}")
    print("In words: s1 says -2*(column 1) + (column 2) = 0, which is 'column 2 = 2 * column 1'.")
    print("          s2 says 2*(column 1) - 2*(column 3) + (column 4) = 0.\n")
    return sols


def whole_nullspace(sols):
    heading("5. The whole nullspace, and the count n - r")
    A = frac(LECTURE_A)
    m, n = shape(A)
    r = rank(A)
    print(f"n - r = {n} - {r} = {n - r} free variables, so {n - r} special solutions.")
    print("Every solution is  x = c * s1 + d * s2.  A few of them:")
    for c, d in ((1, 1), (3, -2), (Fraction(1, 2), 4)):
        x = [c * a + d * b for a, b in zip(sols[0], sols[1])]
        print(f"  c = {fmt(c)}, d = {fmt(d)}:  x = {vec(x)}   A x = {vec(matvec(A, x))}")
    print("Notice x2 = c and x4 = d: the free variables ARE the two knobs.\n")


def reduced_form(U, piv):
    heading("6. Reduced row echelon form R = rref(A)")
    U = copy(U)
    print("Go further than U: zeros ABOVE the pivots too, then make every pivot 1.")
    l = U[0][2] / U[1][2]
    U[0] = [a - l * b for a, b in zip(U[0], U[1])]
    print(f"  row 1 <- row 1 - ({fmt(l)}) * row 2")
    show(U)
    U[1] = [a / U[1][2] for a in U[1]]
    print("  row 2 <- row 2 / 2")
    show(U, "R")
    R, piv2 = rref(frac(LECTURE_A))
    print("linalg.rref(A) agrees:", R == U, "  pivot columns:", names(piv2))
    print("R x = 0 has exactly the same solutions as A x = 0. Read them straight off R:")
    print("   x1 = -2 x2 + 2 x4        x3 = -2 x4\n")
    return R, piv2


def block_form(R, piv):
    heading("7. R = [I F; 0 0] and the nullspace matrix N = [-F; I]")
    F, N, free = blocks(R, piv)
    I = [[R[i][p] for p in piv] for i in range(len(piv))]
    print("pivot columns of R (columns", names(piv) + ") form the identity:")
    show(I, "I")
    print("free columns of R (columns", names(free) + ") form the block F:")
    show(F, "F")
    print("The last row of R is all zeros: row 3 of A was a combination of rows 1 and 2.\n")
    print("Nullspace matrix N: the special solutions are its columns.")
    show(N, "N")
    minusF = [[-v for v in row] for row in F]
    print("rows", names(piv), "of N (the pivot variables):", [vec(N[p]) for p in piv], " = -F =", [vec(r) for r in minusF])
    print("rows", names(free), "of N (the free variables): ", [vec(N[f]) for f in free], " = I")
    print("check R N =")
    show(matmul(R, N))
    print("So  x_pivot = -F x_free.  Example: x_free = (x2, x4) = (3, -1)")
    xf = [3, -1]
    xp = [-sum(F[i][j] * xf[j] for j in range(len(xf))) for i in range(len(F))]
    x = [xp[0], xf[0], xp[1], xf[1]]
    print("   x_pivot = (x1, x3) =", vec(xp), "  ->  x =", vec(x), "  A x =", vec(matvec(frac(LECTURE_A), x)), "\n")


def transpose_example():
    heading("8. Second example: the transpose (4 rows, 3 columns)")
    At = frac(transpose(LECTURE_A))
    show(At, "A^T")
    U, piv = echelon(At, verbose=True)
    print()
    show(U, "U")
    m, n = shape(At)
    print(f"pivot columns: {names(piv)}   rank = {len(piv)}   (A had rank {rank(frac(LECTURE_A))}: the same)")
    print(f"free variables: n - r = {n} - {len(piv)} = {n - len(piv)}")
    R, piv = rref(At)
    show(R, "R")
    F, N, free = blocks(R, piv)
    show(F, "F")
    show(N, "N")
    s = nullspace(At)[0]
    print("special solution:", vec(s), "   A^T s =", vec(matvec(At, s)))
    print("nullspace of A^T = all multiples c * (-1, -1, 1): a line in 3-D space.")
    print("It says -(column 1) - (column 2) + (column 3) = 0 for A^T, i.e. row 3 = row 1 + row 2 for A.\n")


# ------------------------------------------------------------------ robots
ARM_LINKS = [1.0, 1.0, 1.0, 1.0]                    # four links, 1 m each
STAIRCASE = [90, -90, 90, -90]                      # relative joint angles, degrees
REACHING = [110, -50, -50, -50]
STRAIGHT = [35, 0, 0, 0]


def arm_report(name, degrees, exact_numbers=False):
    q = [math.radians(d) for d in degrees]
    J = arm_jacobian(ARM_LINKS, q)
    if exact_numbers:
        J = exact(J)
    tip = arm_points(ARM_LINKS, q)[-1]
    R, piv = rref(J)
    free = [j for j in range(4) if j not in piv]
    print(f"{name}: joint angles {degrees} degrees, hand at ({tip[0]:.2f}, {tip[1]:.2f}) m")
    show(J, "J", digits=2)
    show(R, "R", digits=2)
    print(f"  rank = {len(piv)}   pivot joints: {names(piv)}   free joints: {names(free)}   redundancy n - r = {4 - len(piv)}")
    for k, s in enumerate(nullspace(J)):
        print(f"  special solution s{k + 1} = {vec(s, 2)} rad/s    J s{k + 1} = {vec(matvec(J, s), 2)} m/s")
    print()
    return J, R, piv, free


def four_joint_arm():
    heading("9. Robot: a four-joint planar arm (2 by 4 Jacobian)")
    print("Column i of J = hand velocity (m/s) when only joint i turns at 1 rad/s")
    print("            = the arrow from joint i to the hand, turned a quarter turn: (-(yh - yi), xh - xi).")
    print("Two rows (hand vx, vy), four columns (four joints).\n")
    J, R, piv, free = arm_report("Staircase pose", STAIRCASE, exact_numbers=True)

    F, N, _ = blocks(R, piv)
    print("x_pivot = -F x_free as a control rule. Choose the free joint speeds, read off the pivot ones:")
    qfree = [Fraction(2, 5), Fraction(-1, 5)]        # joints 3 and 4, rad/s
    qpiv = [-sum(F[i][j] * qfree[j] for j in range(2)) for i in range(2)]
    qdot = [qpiv[0], qpiv[1], qfree[0], qfree[1]]
    print(f"  free joints 3, 4 at {vec([float(v) for v in qfree])} rad/s  ->  pivot joints 1, 2 at {vec([float(v) for v in qpiv])} rad/s")
    print(f"  q_dot = {vec([float(v) for v in qdot])}   hand velocity J q_dot = {vec(matvec(J, qdot))} m/s\n")

    print("A self-motion that lasts: follow q_dot = 0.5 * s1(q), recomputing s1 as the arm moves (1 s, 1 ms steps).")
    for correct in (False, True):
        q = [math.radians(d) for d in STAIRCASE]
        target = arm_points(ARM_LINKS, q)[-1]
        dt = 0.001
        for _ in range(1000):
            s1 = nullspace(arm_jacobian(ARM_LINKS, q))[0]
            q = [qi + 0.5 * si * dt for qi, si in zip(q, s1)]
            if correct:
                # pull the hand back onto the target: solve (J J^T) lam = error, then q += J^T lam
                Jn = arm_jacobian(ARM_LINKS, q)
                tip = arm_points(ARM_LINKS, q)[-1]
                e = [target[0] - tip[0], target[1] - tip[1]]
                a, b_, d = (sum(x * x for x in Jn[0]), sum(x * y for x, y in zip(Jn[0], Jn[1])), sum(y * y for y in Jn[1]))
                det2 = a * d - b_ * b_
                lam = [(d * e[0] - b_ * e[1]) / det2, (a * e[1] - b_ * e[0]) / det2]
                q = [qi + Jn[0][i] * lam[0] + Jn[1][i] * lam[1] for i, qi in enumerate(q)]
        tip = arm_points(ARM_LINKS, q)[-1]
        drift = math.hypot(tip[0] - target[0], tip[1] - target[1])
        label = "with the correction step   " if correct else "plain stepping, no correction"
        print(f"  {label}: joints now at {[round(math.degrees(v), 1) for v in q]} degrees, hand moved {drift * 1000:.3f} mm")
    print("  The joints turned by tens of degrees and the hand stayed put.\n")

    arm_report("Reaching pose", REACHING)
    arm_report("Straight arm", STRAIGHT)
    print("Straight arm: all four columns are parallel, the rank drops to 1 (a singularity),")
    print("and a third special solution appears. The hand can now only move sideways.\n")


VEHICLE = {            # (x, y, direction) of each thruster in the body frame, metres and radians
    "two pairs": [(-1.3, 0.5, 0.0), (1.0, 0.0, math.pi / 2), (-1.3, -0.5, 0.0), (-1.0, 0.0, math.pi / 2)],
    "three astern, one at the bow": [(-1.3, 0.5, 0.0), (-1.3, 0.0, 0.0), (-1.3, -0.5, 0.0), (1.0, 0.0, math.pi / 2)],
}


def four_thrusters():
    heading("10. Robot: a four-thruster vehicle (3 by 4 thruster matrix)")
    print("Column i of B = [Fx, Fy, torque] from 1 N of thruster i = [cos a, sin a, x sin a - y cos a].")
    print("Rows: forward force (N), side force (N), turning torque (N m). Columns: four thrusters.\n")

    B = exact(from_columns([thruster_column(*t) for t in VEHICLE["two pairs"]]))
    print("Layout 'two pairs': T1 port propeller, T2 bow thruster, T3 starboard propeller, T4 stern thruster")
    show(B, "B")
    U, piv = echelon(B, verbose=True)
    print()
    R, piv = rref(B)
    show(R, "R")
    s = nullspace(B)[0]
    print(f"rank = {len(piv)}   pivot thrusters: {names(piv)}   free thruster: 4   n - r = {4 - len(piv)}")
    print(f"special solution s = {vec(s)} N    B s = {vec(matvec(B, s))}")
    print("  T1 and T3 at -2 and +2 N twist the hull by", fmt(B[2][0] * s[0] + B[2][2] * s[2]), "N m;")
    print("  T2 and T4 at -1 and +1 N twist it by", fmt(B[2][1] * s[1] + B[2][3] * s[3]), "N m. Net force and torque: zero.\n")

    for want in ([1, 0, 0], [0, 1, 0]):
        b = frac(want)
        p = particular(B, b)
        print(f"wanted (Fx, Fy, torque) = {want}")
        print(f"  free thruster set to 0:  f = {vec(p)}   total thrust {fmt(sum(abs(v) for v in p))} N")
        for c in (Fraction(1, 4), Fraction(1, 2), Fraction(1)):
            f = [pi + c * si for pi, si in zip(p, s)]
            effort = sum(abs(v) for v in f)
            print(f"  add {fmt(c):>3} * s:            f = {vec(f)}   total thrust {fmt(effort)} N   B f = {vec(matvec(B, f))}")
        # least total thrust: sum |p + c s| is piecewise linear in c, so the best c makes one thruster exactly zero
        cands = [-pi / si for pi, si in zip(p, s) if si != 0]
        best = min(cands, key=lambda c: (sum(abs(pi + c * si) for pi, si in zip(p, s)), abs(c)))
        f = [pi + best * si for pi, si in zip(p, s)]
        print(f"  least total thrust at c = {fmt(best)}:  f = {vec(f)}   total thrust {fmt(sum(abs(v) for v in f))} N\n")

    print("Losing thrusters (delete columns and count the pivots again):")
    for name, layout in VEHICLE.items():
        B = exact(from_columns([thruster_column(*t) for t in layout]))
        s = nullspace(B)[0]
        print(f"  layout '{name}': special solution {vec(s)}")
        for dead in range(4):
            keep = [j for j in range(4) if j != dead]
            r = rank([[row[j] for j in keep] for row in B])
            verdict = "full control survives" if r == 3 else "a direction is lost"
            print(f"     T{dead + 1} fails: rank {r}  ({verdict};  entry {dead + 1} of s is {fmt(s[dead])})")
    B = exact(from_columns([thruster_column(*t) for t in VEHICLE["two pairs"]]))
    for dead in ((0, 2), (1, 3), (0, 1)):
        keep = [j for j in range(4) if j not in dead]
        r = rank([[row[j] for j in keep] for row in B])
        print(f"  'two pairs' with T{dead[0] + 1} and T{dead[1] + 1} both failed: rank {r}")
    print("Rule: a thruster can be lost without losing control exactly when its entry in s is not zero.")
    keep = [0, 1, 2]
    p = particular([[row[j] for j in keep] for row in B], frac([0, 1, 0]))
    print(f"After T4 fails, a 1 N side push needs f = {vec(p)}: total thrust {fmt(sum(abs(v) for v in p))} N, and no choice left.\n")

    second = exact(from_columns([thruster_column(*t) for t in VEHICLE["three astern, one at the bow"]]))
    print("Layout 'three astern, one at the bow':")
    show(second, "B")
    R2, piv2 = rref(second)
    show(R2, "R")
    print(f"pivot columns {names(piv2)}, free column {names([j for j in range(4) if j not in piv2])}: the free column is not always the last one.\n")

    print("Rank is not the number of motors. Four thrusters on the centre line, all pointing forward:")
    same = exact(from_columns([thruster_column(x, 0.0, 0.0) for x in (-1.3, -0.5, 0.3, 1.0)]))
    show(same, "B")
    print(f"rank = {rank(same)}: four motors, one direction of control, n - r = {4 - rank(same)} ways to waste fuel.\n")


def repeated_sensor():
    heading("11. A zero row is a repeated equation: the sensor that adds nothing")
    W = 0.4                                         # distance between the wheels, m
    H = frac([[1, -W / 2], [1, W / 2], [1, 0]])
    print("A two-wheeled robot moves with forward speed v and turn rate w. Three sensors:")
    print("  left wheel  = v - (W/2) w      right wheel = v + (W/2) w      ground camera = v      (W = 0.4 m)")
    show(H, "H")
    U, piv = echelon(H, verbose=True)
    print()
    show(U, "U")
    print(f"rank {len(piv)}: the camera row became a zero row because it is (left + right) / 2.")
    print("It adds no new information about (v, w). The same row operations on the readings turn it into a check:")
    for left, right, cam in ((0.9, 1.1, 1.0), (0.9, 1.4, 1.0)):
        residual = cam - 0.5 * (left + right)
        note = "consistent" if abs(residual) < 1e-9 else "not zero: a wheel is slipping or a sensor is wrong"
        print(f"  readings (left, right, camera) = ({left}, {right}, {cam})  ->  0 = {fmt(residual)}   {note}")
    print()


def same_rank():
    heading("12. rank(A) = rank(A^T), read on the arm")
    for name, degrees in (("staircase pose", STAIRCASE), ("straight arm", STRAIGHT)):
        q = [math.radians(d) for d in degrees]
        J = arm_jacobian(ARM_LINKS, q)
        Jt = transpose(J)
        r, rt = rank(J), rank(Jt)
        print(f"{name}: J is 2 by 4, rank {r}, free variables n - r = {4 - r};"
              f"   J^T is 4 by 2, rank {rt}, free variables m - r = {2 - rt}")
        for s in nullspace(Jt):
            print(f"   special solution of J^T F = 0: hand force F = {vec(s, 3)} N needs joint torques {vec(matvec(Jt, s), 3)}")
    a = math.radians(STRAIGHT[0])
    along = [math.cos(a), math.sin(a)]
    Jt = transpose(arm_jacobian(ARM_LINKS, [math.radians(d) for d in STRAIGHT]))
    print(f"   that force is along the arm: (cos 35, sin 35) = {vec(along, 3)} gives torques {vec(matvec(Jt, along), 3)}")
    print("Velocities go through J, forces through J^T (Lecture 5). Both count the same r directions.\n")


def practice():
    heading("13. Practice problems (answers to P1-P10 on the page)")
    A = frac([[1, 3, 1, 2], [2, 6, 4, 8], [0, 0, 2, 4]])
    U, piv = echelon(A)
    free = [j for j in range(4) if j not in piv]
    print("P1   U =", [vec(r) for r in U], "  pivot columns", names(piv), "  free columns", names(free), "  rank", len(piv))
    sols = [solve_from_free(U, piv, {c: (1 if c == f else 0) for c in free}) for f in free]
    print("P2   special solutions by back-substitution:", [vec(x) for x in sols], "  A s =", [vec(matvec(A, x)) for x in sols])
    R, pivR = rref(A)
    F, N, _ = blocks(R, pivR)
    print("P3   R =", [vec(r) for r in R], "  F =", [vec(r) for r in F], "  columns of N:", [vec(column(N, j)) for j in range(2)])
    print("P4   (a) 3 by 5, rank 3: n - r =", 5 - 3, "  (b) 5 by 3, rank 3: n - r =", 3 - 3, "(only x = 0)",
          "  (c) 3 by 5: n - r is at least", 5 - 3, "so never only zero")
    A5 = frac([[1, 2, 1], [2, 4, 3]])
    print("P5   A: rank", rank(A5), " special solutions", [vec(x) for x in nullspace(A5)],
          "   A^T: rank", rank(transpose(A5)), " special solutions", [vec(x) for x in nullspace(transpose(A5))])
    q6 = [0, 0, math.pi / 2, 0]                     # two links along the table, then two straight up
    J = exact(arm_jacobian(ARM_LINKS, q6))
    U6, piv6 = echelon(J)
    R6, _ = rref(J)
    s6 = nullspace(J)
    print("P6   hand at", vec(arm_points(ARM_LINKS, q6)[-1]), "  J =", [vec(r) for r in J], "  U =", [vec(r) for r in U6])
    print("     R =", [vec(r) for r in R6], "  rank", len(piv6), "  pivot joints", names(piv6), "  special solutions", [vec(x) for x in s6])
    qd = [Fraction(1, 5) * v for v in s6[0]]
    print("P7   0.2 * s1 =", vec([float(v) for v in qd]), "  J q_dot =", vec(matvec(J, qd)))
    qd2 = [a + Fraction(1, 5) * b for a, b in zip(qd, s6[1])]
    print("     follow-up, joint 4 also at 0.2:", vec([float(v) for v in qd2]), "  J q_dot =", vec(matvec(J, qd2)))
    J8 = exact(arm_jacobian(ARM_LINKS, [math.pi / 2, 0, 0, 0]))
    R8, piv8 = rref(J8)
    print("P8   J =", [vec(r) for r in J8], "  R =", [vec(r) for r in R8], "  rank", len(piv8), "  n - r =", 4 - len(piv8))
    print("     special solutions", [vec(x) for x in nullspace(J8)])
    B = exact(from_columns([thruster_column(-1, 1, 0), thruster_column(-1, -1, 0),
                            thruster_column(1, 0, math.pi / 2), thruster_column(-1, 0, math.pi / 2)]))
    U9, piv9 = echelon(B)
    R9, _ = rref(B)
    s = nullspace(B)[0]
    print("P9   B =", [vec(r) for r in B], "  U =", [vec(r) for r in U9])
    print("     R =", [vec(r) for r in R9], "  rank", len(piv9), "  s =", vec(s), "  B s =", vec(matvec(B, s)))
    print("     rank with one thruster removed:", [rank([[row[j] for j in range(4) if j != dead] for row in B]) for dead in range(4)])
    p = particular(B, frac([0, 2, 0]))
    best = min((-pi / si for pi, si in zip(p, s) if si != 0), key=lambda c: (sum(abs(pi + c * si) for pi, si in zip(p, s)), abs(c)))
    f = [pi + best * si for pi, si in zip(p, s)]
    print("P10  free thruster at zero: f =", vec(p), " total", fmt(sum(abs(v) for v in p)), "N;",
          " least effort at c =", fmt(best), ": f =", vec(f), " total", fmt(sum(abs(v) for v in f)), "N;  B f =", vec(matvec(B, f)))
    print()


if __name__ == "__main__":
    lecture_matrix()
    U, piv = elimination()
    free = rank_and_variables(U, piv)
    sols = special_solutions(U, piv, free)
    whole_nullspace(sols)
    R, pivR = reduced_form(U, piv)
    block_form(R, pivR)
    transpose_example()
    four_joint_arm()
    four_thrusters()
    repeated_sensor()
    same_rank()
    practice()
