"""
Lecture 2 - Elimination with Matrices, on a robot.

    python3 code/l02_elimination.py

Covers: elimination with pivots and multipliers, the augmented matrix and
back-substitution, temporary and permanent failure, reading a product by rows
and by columns, elimination matrices E21 and E32, the associative law and the
order test, permutation matrices on the left and on the right, and a first inverse.
Robots: a two-wheeled robot, and three-wheel omni odometry in four wheel layouts.
"""
import math
from linalg import (frac, show, fmt, heading, eliminate, back_substitute, solve, matmul, matvec, combine,
                    column, identity, inverse, det, close)

A_LECTURE = [[1, 2, 1], [3, 8, 1], [0, 4, 1]]
B_LECTURE = [2, 12, 2]


# ----------------------------------------------------------------- helpers
def elim_matrix(n, i, j, l):
    """E_ij: the identity with -l in row i, column j (1-based). It subtracts l * row j from row i."""
    E = identity(n)
    E[i - 1][j - 1] = -l
    return E


def exchange_matrix(n, i, j):
    """P_ij: the identity with rows i and j exchanged (1-based)."""
    P = identity(n)
    P[i - 1], P[j - 1] = P[j - 1], P[i - 1]
    return P


def augmented(A, b):
    return [list(row) + [bi] for row, bi in zip(A, b)]


def walk(A, b, digits=3):
    """
    Lecture-style elimination on [A | b], printing every step.
    Rows are exchanged only when a pivot position holds zero.
    Returns (U, c, pivots, multipliers, exchanges) or None if elimination fails.
    """
    M = augmented(A, b)
    n = len(A)
    pivots, multipliers, exchanges = [], [], 0
    show(M, "[A|b]", aug=1, digits=digits)
    for k in range(n):
        if abs(M[k][k]) < 1e-10:
            below = [r for r in range(k + 1, n) if abs(M[r][k]) > 1e-10]
            if not below:
                print(f"  zero in pivot position {k + 1} and nothing below to exchange in: PERMANENT FAILURE (singular)")
                print(f"  pivots found: {[fmt(p, digits) for p in pivots]}\n")
                return None
            r = below[0]
            M[k], M[r] = M[r], M[k]
            exchanges += 1
            print(f"  zero in pivot position {k + 1}: exchange rows {k + 1} and {r + 1}")
            show(M, aug=1, digits=digits)
        pivots.append(M[k][k])
        for i in range(k + 1, n):
            l = M[i][k] / M[k][k]
            multipliers.append(l)
            if abs(l) < 1e-10:
                print(f"  step ({i + 1},{k + 1}): entry is already 0, multiplier 0, nothing to do")
                continue
            M[i] = [a - l * p for a, p in zip(M[i], M[k])]
            M[i][k] = M[i][k] * 0
            print(f"  step ({i + 1},{k + 1}): pivot {fmt(M[k][k], digits)}, multiplier {fmt(l, digits)}:  "
                  f"row {i + 1} <- row {i + 1} - ({fmt(l, digits)}) * row {k + 1}")
            show(M, aug=1, digits=digits)
    U = [row[:n] for row in M]
    c = [row[n] for row in M]
    return U, c, pivots, multipliers, exchanges


def back_sub_verbose(U, c, names):
    n = len(U)
    x = [0] * n
    for i in range(n - 1, -1, -1):
        known = sum(U[i][j] * x[j] for j in range(i + 1, n))
        x[i] = (c[i] - known) / U[i][i]
        print(f"  row {i + 1}: {names[i]} = ({fmt(c[i])} - ({fmt(known)})) / {fmt(U[i][i])} = {fmt(x[i])}")
    return x


def r2(v):
    """Round a vector for printing."""
    return [round(float(x), 3) + 0.0 for x in v]


# ----------------------------------------------------------------- the lecture
def lecture_elimination():
    heading("1. Elimination on the lecture's system (pivots 1, 2, 5)")
    A, b = frac(A_LECTURE), frac(B_LECTURE)
    U, c, pivots, multipliers, _ = walk(A, b)
    print("U:")
    show(U)
    print("pivots     :", [fmt(p) for p in pivots])
    print("multipliers:", [fmt(l) for l in multipliers], " (steps (2,1), (3,1), (3,2))")
    print("c          :", [fmt(v) for v in c])
    print("product of the pivots (the determinant, a later topic):", fmt(pivots[0] * pivots[1] * pivots[2]), "\n")
    return U, c


def lecture_back_substitution(U, c):
    heading("2. Back-substitution: solve U x = c from the bottom up")
    x = back_sub_verbose(U, c, "xyz")
    print("solution (x, y, z) =", tuple(fmt(v) for v in x))
    print("check A x =", [fmt(v) for v in matvec(frac(A_LECTURE), x)], " which is b\n")
    return x


def failures():
    heading("3. When elimination fails")
    print("Temporary: change the 8 to a 6. A zero lands in pivot position 2, with a 4 below it.\n")
    out = walk(frac([[1, 2, 1], [3, 6, 1], [0, 4, 1]]), frac(B_LECTURE))
    U, c, pivots, _, exchanges = out
    print("pivots:", [fmt(p) for p in pivots], " row exchanges:", exchanges,
          " solution:", [fmt(v) for v in back_substitute(U, c)], "\n")
    print("Permanent (the lecture's example): change the bottom-right 1 to -4.\n")
    walk(frac([[1, 2, 1], [3, 8, 1], [0, 4, -4]]), frac(B_LECTURE))
    print("With b = (2, 12, 2) the last row reads 0 = -10: no solution.")
    print("With b = (2, 12, 12) the last row would read 0 = 0: infinitely many solutions.\n")


def two_readings_of_a_product():
    heading("4. Matrix times column, row times matrix")
    A = A_LECTURE
    x = [2, 1, -2]
    cols = [column(A, j) for j in range(3)]
    print("A times (2, 1, -2) = 2*col1 + 1*col2 - 2*col3 =", combine(cols, x), "  (a combination of the columns)")
    r = [-3, 1, 0]
    by_rows = combine(A, r)                    # -3*row1 + 1*row2 + 0*row3
    print("(-3, 1, 0) times A = -3*row1 + 1*row2 + 0*row3 =", by_rows, "  (a combination of the rows)")
    print("That is the new row 2 after the first elimination step.\n")


def elimination_matrices():
    heading("5. Elimination matrices, the associative law, and the order test")
    A = A_LECTURE
    E21, E32 = elim_matrix(3, 2, 1, 3), elim_matrix(3, 3, 2, 2)
    show(E21, "E21")
    show(E32, "E32")
    step1 = matmul(E21, A)
    U = matmul(E32, step1)
    show(step1, "E21 A")
    show(U, "E32 (E21 A)")
    E = matmul(E32, E21)
    show(E, "E = E32 E21")
    print("associative law: (E32 E21) A equals E32 (E21 A):", matmul(E, A) == U)
    print("row 3 of E says: 6*row1 - 2*row2 + 1*row3 of A =", combine(A, E[2]))
    wrong = matmul(E21, E32)
    show(wrong, "E21 E32")
    print("not commutative: E32 E21 equals E21 E32?", E == wrong, "  (corner entries", E[2][0], "and", wrong[2][0], ")")
    show(matmul(wrong, A), "(E21 E32) A")
    print("E applied to b gives c: E b =", matvec(E, B_LECTURE), "\n")


def permutations():
    heading("6. Permutation matrices: rows on the left, columns on the right")
    P = exchange_matrix(2, 1, 2)
    show(P, "P")
    M = [["a", "b"], ["c", "d"]]
    PA = [M[1], M[0]]                                          # row 1 of P picks row 2, row 2 picks row 1
    AP = [[row[1], row[0]] for row in M]                       # column 1 of P picks column 2
    print("P [a b; c d] =", PA, "  rows exchanged")
    print("[a b; c d] P =", AP, "  columns exchanged")
    N = [[1, 2], [3, 4]]
    print("with numbers: P N =", matmul(P, N), "   N P =", matmul(N, P))
    stuck = [[1, 2, 1], [0, 0, -2], [0, 4, 1]]
    P23 = exchange_matrix(3, 2, 3)
    print("\nThe stuck matrix of section 3, rescued by P23 on the left:")
    show(matmul(P23, stuck), "P23 M")
    print("P23 on the right exchanges columns 2 and 3 instead:")
    show(matmul(stuck, P23), "M P23")


def first_inverse():
    heading("7. Undoing a step: the first inverse")
    E21 = elim_matrix(3, 2, 1, 3)
    E21_inv = elim_matrix(3, 2, 1, -3)
    show(E21_inv, "E21 inverse")
    print("E21 inverse times E21 is the identity:", matmul(E21_inv, E21) == identity(3))
    print("Gauss-Jordan (lecture 3) agrees:", inverse(frac(E21)) == frac(E21_inv))
    P = exchange_matrix(3, 2, 3)
    print("a row exchange is its own inverse: P P = I:", matmul(P, P) == identity(3), "\n")


# ----------------------------------------------------------------- robots
def two_wheel_robot():
    heading("8. Robot: two wheels, two encoders (a pivot is the wheel spacing)")
    # left wheel at y = +W/2, right wheel at y = -W/2, both rolling along x:
    #     s_left = v - (W/2) w        s_right = v + (W/2) w
    for W in (0.4, 0.1):
        A = [[1, -W / 2], [1, W / 2]]
        s = [0.5, 0.7]
        r = eliminate(A, s)
        v, w = back_substitute(r["U"], r["c"])
        noisy = eliminate(A, [0.5, 0.71])
        v2, w2 = back_substitute(noisy["U"], noisy["c"])
        print(f"W = {W} m: pivots {r2(r['pivots'])}, readings {s} m/s -> v = {v:.3f} m/s, w = {w:.3f} rad/s;"
              f"  a 0.01 m/s error on the right wheel changes w by {w2 - w:.3f} rad/s")
    print("The second pivot is W. A quarter of the spacing, four times the error.\n")


R = 0.2                                        # wheel circle radius, metres
D = math.pi / 180


def omni_row(alpha):
    """Tangent wheel at angle alpha on a circle of radius R:  s = -sin(a) vx + cos(a) vy + R w."""
    return [-math.sin(alpha), math.cos(alpha), R]


def wheel_row(x, y, beta):
    """Any wheel at (x, y) rolling along the unit direction (cos beta, sin beta)."""
    dx, dy = math.cos(beta), math.sin(beta)
    return [dx, dy, x * dy - y * dx]


def clean(A):
    return [[0.0 if abs(v) < 1e-12 else v for v in row] for row in A]


def omni_derivation_check():
    heading("9. Robot: the omni wheel equation, checked from first principles")
    twist = (0.37, -0.21, 0.9)                 # an arbitrary body velocity (vx, vy, w)
    vx, vy, w = twist
    worst = 0.0
    for deg in (90, 210, 330, 0, 120, 240, 17):
        a = deg * D
        px, py = R * math.cos(a), R * math.sin(a)          # where the wheel touches the floor
        point_velocity = (vx - w * py, vy + w * px)         # velocity of that point of a rigid body
        rolling = (-math.sin(a), math.cos(a))               # the wheel's rolling direction (the tangent)
        direct = rolling[0] * point_velocity[0] + rolling[1] * point_velocity[1]
        formula = sum(c * t for c, t in zip(omni_row(a), twist))
        worst = max(worst, abs(direct - formula))
    print("largest difference between the formula and the direct computation, over 7 wheel angles:", f"{worst:.1e}")
    print("general wheel row agrees with the tangent formula:",
          close([wheel_row(R * math.cos(a), R * math.sin(a), a + math.pi / 2) for a in (0.3, 2.0)],
                [omni_row(a) for a in (0.3, 2.0)]), "\n")


def omni_good_layout():
    heading("10. Robot: omni odometry, wheels at 90, 210, 330 degrees (R = 0.2 m)")
    A = clean([omni_row(d * D) for d in (90, 210, 330)])
    twist = [0.3, 0.0, 0.5]
    s = matvec(A, twist)
    print("a body velocity of (vx, vy, w) =", twist, "gives encoder readings", r2(s), "m/s")
    print("\nNow the robot's problem: from the readings back to the body velocity.\n")
    s = [-0.20, 0.25, 0.25]
    U, c, pivots, multipliers, exchanges = walk(A, s, digits=3)
    print("pivots:", r2(pivots), " multipliers:", r2(multipliers), " row exchanges:", exchanges)
    print(f"last row: {U[2][2]:.2f} w = {c[2]:.2f}, and s1 + s2 + s3 = {sum(s):.2f}  (3R = {3 * R:.2f})")
    x = back_sub_verbose(U, c, ["vx", "vy", "w "])
    print("body velocity (vx, vy, w) =", r2(x), " -> a circle of radius vx / w =", round(x[0] / x[2], 3), "m\n")
    return A


def omni_zero_pivot():
    heading("11. Robot: wheels at 0, 120, 240 degrees (a zero pivot, cured by a row exchange)")
    A = clean([omni_row(d * D) for d in (0, 120, 240)])
    s = [-0.20, 0.25, 0.25]
    U, c, pivots, _, exchanges = walk(A, s, digits=3)
    x = back_substitute(U, c)
    print("pivots:", r2(pivots), " row exchanges:", exchanges, " body velocity:", r2(x))
    print("Wheel 1 rolls along y, so its row starts with 0: it says nothing about vx.\n")


def omni_fragile_and_singular(A_good):
    heading("12. Robot: nearly parallel wheels (small pivot) and parallel wheels (no pivot)")
    pos = [(R * math.cos(d * D), R * math.sin(d * D)) for d in (90, 210, 330)]

    fragile = clean([wheel_row(x, y, b * D) for (x, y), b in zip(pos, (0, 8, -8))])
    show(fragile, "A fragile", digits=3)
    r = eliminate(fragile)
    print("pivots:", r2(r["pivots"]), " (the second one is sin 8 degrees =", round(math.sin(8 * D), 3), ")")
    s = [0.30, 0.30, 0.30]
    base, bumped = solve(fragile, s), solve(fragile, [0.30, 0.31, 0.30])
    print("readings", s, "->", r2(base), ";  with +0.01 m/s on encoder 2 ->", r2(bumped))
    print(f"  fragile layout: 1 cm/s of encoder error becomes {abs(bumped[1] - base[1]) * 100:.1f} cm/s of error in vy")
    g0, g1 = solve(A_good, s), solve(A_good, [0.30, 0.31, 0.30])
    print(f"  good layout:    1 cm/s of encoder error becomes {abs(g1[1] - g0[1]) * 100:.1f} cm/s of error in vy\n")

    parallel = clean([wheel_row(x, y, 0.0) for (x, y) in pos])
    show(parallel, "A parallel", digits=3)
    print("elimination on [A | s] with readings (-0.20, 0.25, 0.25):\n")
    walk(parallel, [-0.20, 0.25, 0.25], digits=3)
    print("the vy column is all zeros; sliding sideways at 0.3 m/s gives readings", r2(matvec(parallel, [0, 0.3, 0])))
    print("determinant:", round(det(parallel), 12), "\n")


def odometry():
    heading("13. Robot: odometry = solve every tick and add up the motion")
    A = clean([omni_row(d * D) for d in (90, 210, 330)])
    s = [-0.20, 0.25, 0.25]                    # constant readings
    x = y = th = 0.0
    dt, t = 0.01, 0.0
    period = 2 * math.pi / 0.5                 # time for one full turn at 0.5 rad/s
    marks = [period / 4, period / 2, period]
    for _ in range(int(round(period / dt))):
        vx, vy, w = solve(A, s)                # elimination and back-substitution, every tick
        x += (math.cos(th) * vx - math.sin(th) * vy) * dt      # body velocity turned into the world frame
        y += (math.sin(th) * vx + math.cos(th) * vy) * dt
        th += w * dt
        t += dt
        if marks and t >= marks[0] - 1e-9:
            print(f"  t = {t:5.2f} s   x = {x:6.3f} m   y = {y:6.3f} m   heading = {math.degrees(th):6.1f} deg")
            marks.pop(0)
    print("The robot drives a circle of radius 0.6 m and returns (nearly) to its start.\n")


# ----------------------------------------------------------------- practice
def practice():
    heading("14. Practice problems (answers to P1-P10 on the page)")
    # P1
    r = eliminate(frac([[1, 2], [3, 8]]), frac([5, 17]))
    print("P1   x + 2y = 5, 3x + 8y = 17: multiplier", fmt(r["L"][1][0]), " pivots", [fmt(p) for p in r["pivots"]],
          " (x, y) =", [fmt(v) for v in back_substitute(r["U"], r["c"])])
    # P2
    A2, b2 = frac([[1, 1, 1], [2, 4, 3], [3, 7, 8]]), frac([6, 19, 41])
    r = eliminate(A2, b2)
    print("P2   multipliers", [fmt(r["L"][1][0]), fmt(r["L"][2][0]), fmt(r["L"][2][1])], " pivots", [fmt(p) for p in r["pivots"]],
          " U =", [[fmt(v) for v in row] for row in r["U"]], " c =", [fmt(v) for v in r["c"]],
          " x =", [fmt(v) for v in back_substitute(r["U"], r["c"])])
    # P3
    ra = eliminate(frac([[1, 2, 1], [2, 4, 5], [0, 3, 1]]))
    rb = eliminate(frac([[1, 2, 1], [2, 4, 5], [3, 6, 4]]))
    print("P3   (a) row exchanges", ra["exchanges"], " pivots", [fmt(p) for p in ra["pivots"]],
          "  (b) singular:", rb["singular"], " pivots found", [fmt(p) for p in rb["pivots"]])
    # P4
    E21, E31, E32 = elim_matrix(3, 2, 1, 2), elim_matrix(3, 3, 1, 3), elim_matrix(3, 3, 2, 2)
    E = matmul(E32, matmul(E31, E21))
    print("P4   E = E32 E31 E21 =", E, "  E A = U:", matmul(E, [[1, 1, 1], [2, 4, 3], [3, 7, 8]]),
          "  E b =", matvec(E, [6, 19, 41]))
    # P5
    P12, N = exchange_matrix(3, 1, 2), [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    print("P5   P A =", matmul(P12, N), "  A P =", matmul(N, P12), "  P P = I:", matmul(P12, P12) == identity(3))
    # P6
    F21, F32 = elim_matrix(3, 2, 1, -3), elim_matrix(3, 3, 2, -2)       # the two inverses
    back = matmul(F21, F32)
    U = [[1, 2, 1], [0, 2, -2], [0, 0, 5]]
    print("P6   E21^-1 E32^-1 =", back, "  times U gives A:", matmul(back, U) == A_LECTURE,
          "  wrong order E32^-1 E21^-1 =", matmul(F32, F21))
    # P7: wheels 2 m apart, left reads 1, right reads 3
    r = eliminate(frac([[1, -1], [1, 1]]), frac([1, 3]))
    v, w = back_substitute(r["U"], r["c"])
    w_err = solve([[1, -1], [1, 1]], [1, 3.1])[1] - float(w)
    w_err_narrow = solve([[1, -0.1], [1, 0.1]], [1, 3.1])[1] - solve([[1, -0.1], [1, 0.1]], [1, 3])[1]
    print("P7   pivots", [fmt(p) for p in r["pivots"]], " v =", fmt(v), "m/s  w =", fmt(w), "rad/s;",
          f" a 0.1 m/s error changes w by {w_err:.2f} rad/s (W = 2 m) or {w_err_narrow:.2f} rad/s (W = 0.2 m)")
    # P8: tangent wheels at 0, 90, 180 degrees on a circle of radius 1
    A8 = frac([[0, 1, 1], [-1, 0, 1], [0, -1, 1]])
    r = eliminate(A8, frac([5, 2, 1]))
    print("P8   row exchanges", r["exchanges"], " pivots", [fmt(p) for p in r["pivots"]],
          " (vx, vy, w) =", [fmt(v) for v in back_substitute(r["U"], r["c"])])
    # P9: cables of wheels 1 and 2 swapped
    seen = frac([2, 5, 1])
    wrong = solve(A8, seen)
    right = solve(matmul(exchange_matrix(3, 1, 2), A8), seen)
    print("P9   readings in swapped order with the old matrix ->", [fmt(v) for v in wrong],
          "  with P A (rows 1 and 2 exchanged) ->", [fmt(v) for v in right])
    # P10: three wheels rolling along x at heights y = 1, 0, -1
    A10 = frac([[1, 0, -1], [1, 0, 0], [1, 0, 1]])
    print("P10  singular:", eliminate(A10)["singular"], " det =", fmt(det(A10)),
          "  sideways (0, 1, 0) reads", [fmt(v) for v in matvec(A10, frac([0, 1, 0]))])
    for s in ([1, 2, 3], [1, 2, 4]):
        # rows 2 - 1 and 3 - 1 give  w = s2 - s1  and  2w = s3 - s1
        w_a, w_b = s[1] - s[0], (s[2] - s[0]) / 2
        if w_a == w_b:
            print(f"     readings {s}: consistent, w = {w_a}, vx = {s[1]}, vy unknown")
        else:
            print(f"     readings {s}: rows 2 and 3 demand w = {w_a} and w = {fmt(w_b)}: contradiction, no rigid motion fits")
    fixed = frac([[1, 0, -1], [0, 1, 0], [1, 0, 1]])
    r = eliminate(fixed, frac([1, 2, 3]))
    print("     middle wheel turned to roll along y: pivots", [fmt(p) for p in r["pivots"]],
          " and readings (1, 2, 3) give", [fmt(v) for v in back_substitute(r["U"], r["c"])])
    print()


if __name__ == "__main__":
    U, c = lecture_elimination()
    lecture_back_substitution(U, c)
    failures()
    two_readings_of_a_product()
    elimination_matrices()
    permutations()
    first_inverse()
    two_wheel_robot()
    omni_derivation_check()
    A_good = omni_good_layout()
    omni_zero_pivot()
    omni_fragile_and_singular(A_good)
    odometry()
    practice()
