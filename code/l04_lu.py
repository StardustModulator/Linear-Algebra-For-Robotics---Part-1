"""
Lecture 4 - Factorization into A = LU, on a robot.

    python3 code/l04_lu.py

Covers: inverse of a product, inverse of a transpose, A = LU for a 2 by 2 and
a 3 by 3, A = LDU, why L is tidier than E, the cost of elimination (n^3/3 for
the matrix, n^2 for each right-hand side) and the six 3 by 3 permutations.
Robots: undoing two rover moves, a control loop that factors once and solves
every tick, one factorization shared by J and J transpose, and a smooth path
through waypoints (a natural cubic spline, which is a tridiagonal system).
"""
import math
from itertools import permutations
from linalg import (frac, show, fmt, heading, matmul, matvec, transpose, identity, inverse,
                    lu, lu_solve, ldu, forward_substitute, back_substitute, solve,
                    hom2, arm_jacobian, permutation_matrix, close)


def row(v, digits=3):
    """One vector on one line."""
    return "(" + ", ".join(fmt(x, digits) for x in v) + ")"


# ------------------------------------------------------------------ the lecture
def inverse_of_a_product():
    heading("1. Inverse of a product: (AB)^-1 = B^-1 A^-1")
    A = frac([[1, 3], [2, 7]])          # the matrix inverted in Lecture 3
    B = frac([[2, 1], [5, 3]])
    AB = matmul(A, B)
    show(AB, "AB")
    right = matmul(inverse(B), inverse(A))
    wrong = matmul(inverse(A), inverse(B))
    show(right, "B^-1 A^-1")
    show(matmul(AB, right), "(AB)(B^-1 A^-1)")
    show(wrong, "A^-1 B^-1")
    show(matmul(AB, wrong), "(AB)(A^-1 B^-1)")
    print("Reverse order gives the identity. The same order does not.")
    print("Socks, then shoes. To undo: shoes off first, then socks.\n")


def inverse_of_a_transpose():
    heading("2. Inverse of a transpose: (A^T)^-1 = (A^-1)^T")
    A = frac([[2, 1], [8, 7]])
    show(transpose(A), "A^T")
    show(inverse(A), "A^-1")
    show(inverse(transpose(A)), "(A^T)^-1")
    show(transpose(inverse(A)), "(A^-1)^T")
    print("same matrix:", inverse(transpose(A)) == transpose(inverse(A)), "\n")


def lu_two_by_two():
    heading("3. A = LU and A = LDU for the lecture's 2 by 2")
    A = frac([[2, 1], [8, 7]])
    E21 = frac([[1, 0], [-4, 1]])
    show(A, "A")
    show(E21, "E21")
    show(matmul(E21, A), "E21 A = U")
    P, L, U, perm = lu(A)
    show(L, "L = E21^-1")
    print("L U == A:", matmul(L, U) == A)
    L, D, U1 = ldu(A)
    show(D, "D")
    show(U1, "U (ones on the diagonal)")
    print("L D U == A:", matmul(L, matmul(D, U1)) == A, "\n")


def lu_three_by_three():
    heading("4. The 3 by 3 case: E carries a stray 10, L does not")
    E21 = frac([[1, 0, 0], [-2, 1, 0], [0, 0, 1]])
    E32 = frac([[1, 0, 0], [0, 1, 0], [0, -5, 1]])
    E = matmul(E32, E21)
    show(E, "E = E32 E21")
    L = matmul(inverse(E21), inverse(E32))
    show(L, "L = E21^-1 E32^-1")
    print("L is the inverse of E:", matmul(L, E) == frac(identity(3)))
    print("E(3,1) = 5 * 2 = 10: row 3 picks up row 1 through row 2. L(3,1) stays 0.\n")

    A = frac([[1, 2, 1], [2, 5, 5], [0, 5, 17]])     # built so that elimination uses exactly those steps
    P, L2, U, perm = lu(A)
    show(A, "A")
    show(L2, "L")
    show(U, "U")
    print("multipliers went straight into L:", L2 == L, "   L U == A:", matmul(L2, U) == A)
    print("row 3 of A = 0*(row 1 of U) + 5*(row 2 of U) + (row 3 of U):",
          row([5 * a + b for a, b in zip(U[1], U[2])]), "\n")

    G = frac([[2, 1, 1], [4, 3, 4], [6, 7, 14]])      # all three multipliers in use
    P, L3, U3, perm = lu(G)
    l21, l31, l32 = L3[1][0], L3[2][0], L3[2][1]
    E21 = frac([[1, 0, 0], [-l21, 1, 0], [0, 0, 1]])
    E31 = frac([[1, 0, 0], [0, 1, 0], [-l31, 0, 1]])
    E32 = frac([[1, 0, 0], [0, 1, 0], [0, -l32, 1]])
    E3 = matmul(E32, matmul(E31, E21))
    show(G, "A (general)")
    show(L3, "L")
    show(U3, "U")
    show(E3, "E = E32 E31 E21")
    print(f"E(3,1) = l32*l21 - l31 = {fmt(l32)}*{fmt(l21)} - {fmt(l31)} = {fmt(E3[2][0])}, a number no step used.")
    Lg, Dg, Ug = ldu(G)
    show(Dg, "D")
    show(Ug, "U (ones on the diagonal)")


def two_triangular_passes():
    heading("5. Solving with L and U: forward, then back")
    A = frac([[2, 1], [8, 7]])
    factors = lu(A)
    P, L, U, perm = factors
    for b in ([3, 15], [5, 23]):
        y = forward_substitute(L, frac(b))        # L y = b, top down
        x = back_substitute(U, y)                 # U x = y, bottom up
        print(f"b = {row(b)}:  L y = b gives y = {row(y)},  U x = y gives x = {row(x)},  check A x = {row(matvec(A, x))}")
    A3 = frac([[1, 2, 1], [2, 5, 5], [0, 5, 17]])
    f3 = lu(A3)
    b3 = frac([4, 12, 22])
    y3 = forward_substitute(f3[1], b3)
    print(f"3 by 3, b = {row(b3)}:  y = {row(y3)},  x = {row(back_substitute(f3[2], y3))}")
    print("The same L and U served every right-hand side. No inverse was formed.\n")


# ------------------------------------------------------------------ cost
def counted_lu(A):
    """Elimination with a counter: one operation per division and per multiply-subtract."""
    A = [list(r) for r in A]
    n, ops = len(A), 0
    for k in range(n - 1):
        for i in range(k + 1, n):
            l = A[i][k] / A[k][k]
            ops += 1                                   # the multiplier
            A[i][k] = l                                # keep it where the zero would go: this is L
            for j in range(k + 1, n):
                A[i][j] -= l * A[k][j]
                ops += 1                               # one multiply-subtract
    return A, ops


def counted_solve(LU, b):
    """Forward then back substitution on the packed factors, with the same counter."""
    n, ops = len(LU), 0
    y = list(b)
    for i in range(n):
        for j in range(i):
            y[i] -= LU[i][j] * y[j]
            ops += 1
    x = y[:]
    for i in range(n - 1, -1, -1):
        for j in range(i + 1, n):
            x[i] -= LU[i][j] * x[j]
            ops += 1
        x[i] /= LU[i][i]
        ops += 1
    return x, ops


def test_matrix(n):
    """A full matrix that needs no row exchanges (large diagonal)."""
    return [[(n + 1.0) if i == j else 1.0 / (1 + abs(i - j)) for j in range(n)] for i in range(n)]


def factor_ops(n):
    return (n ** 3 - n) // 3


def cost_of_elimination():
    heading("6. The cost of elimination")
    print("Strang's estimate: n^2 + (n-1)^2 + ... + 1 is about n^3/3 (the area under x^2).")
    n = 100
    exact_sum = sum(k * k for k in range(1, n + 1))
    print(f"n = {n}: sum of squares = {exact_sum:,}   n^3/3 = {n ** 3 / 3:,.0f}\n")
    print("Counting every division and multiply-subtract in a real run:")
    print("    n    factor A (counted)   (n^3 - n)/3    one right-hand side (counted)    n^2")
    for n in (2, 3, 6, 10, 50, 100):
        A = test_matrix(n)
        b = [float(i + 1) for i in range(n)]
        LU, f = counted_lu(A)
        x, s = counted_solve(LU, b)
        assert max(abs(v - w) for v, w in zip(matvec(A, x), b)) < 1e-8
        print(f"{n:5d} {f:17,d} {factor_ops(n):15,d} {s:22,d} {n * n:16,d}")
    print("So: about n^3/3 to factor A, exactly n^2 for each right-hand side.")
    n, k = 100, 1000
    scratch = k * (factor_ops(n) + n * n)
    once = factor_ops(n) + k * n * n
    print(f"n = {n}, {k} right-hand sides: from scratch {scratch:,}, factor once {once:,}, "
          f"speed-up {scratch / once:.1f} times")
    print(f"With many right-hand sides the speed-up levels off at (n^3/3 + n^2)/n^2, about n/3 + 1 = {n / 3 + 1:.1f}.\n")


def control_loop():
    heading("7. Robot: factor once, solve every tick")
    rate = 1e8                      # ASSUMPTION: simple operations per second on the robot's computer
    budget = rate * 1e-3            # operations that fit in one 1 ms tick (a 1 kHz loop)
    print(f"Assumed speed {rate:.0e} operations per second, so one 1 ms tick holds {budget:,.0f} operations.")
    print("    n   factor once   per tick, from scratch   per tick, factored   loop rate from scratch   loop rate factored")
    for n in (6, 50, 500):
        f, s = factor_ops(n), n * n
        print(f"{n:5d} {f:13,d} {f + s:24,d} {s:20,d} {rate / (f + s):20,.1f} Hz {rate / s:17,.0f} Hz")
    for n in (6, 50, 500):
        f, s = factor_ops(n), n * n
        print(f"n = {n:3d}: share of a 1 ms tick: from scratch {100 * (f + s) / budget:,.2f} %, factored {100 * s / budget:,.3f} %")
    big_scratch = max(n for n in range(1, 2000) if factor_ops(n) + n * n <= budget)
    big_once = max(n for n in range(1, 2000) if n * n <= budget)
    print(f"Largest n that fits in one tick: from scratch {big_scratch}, with L and U stored {big_once}.")
    n = 500
    print(f"Explicit inverse instead: about n^3 = {n ** 3:,} to build it (3 times the LU), then n^2 per tick anyway.\n")


# ------------------------------------------------------------------ robots
def pose_of(T):
    return T[0][2], T[1][2], math.degrees(math.atan2(T[1][0], T[0][0]))


def socks_and_shoes_rover():
    heading("8. Robot: undo two moves in reverse order")
    a, turn, d = 3.0, math.radians(70), 2.5
    A = hom2(0.0, a, 0.0)                                   # move A: drive 3 m straight ahead
    B = hom2(turn, d * math.cos(turn), d * math.sin(turn))  # move B: turn 70 degrees, then drive 2.5 m
    AB = matmul(A, B)
    show(A, "A", digits=2)
    show(B, "B", digits=2)
    show(AB, "A B", digits=2)
    print("pose after A then B:      x = %.3f  y = %.3f  heading = %.0f deg" % pose_of(AB))
    right = matmul(AB, matmul(inverse(B), inverse(A)))
    wrong = matmul(AB, matmul(inverse(A), inverse(B)))
    print("undo B first, then A:     x = %.3f  y = %.3f  heading = %.0f deg   (home)" % pose_of(right))
    x, y, th = pose_of(wrong)
    print("undo A first, then B:     x = %.3f  y = %.3f  heading = %.0f deg" % (x, y, th))
    print("miss distance: %.3f m   (formula 2 a sin(turn/2) = %.3f m)" % (math.hypot(x, y), 2 * a * math.sin(turn / 2)))
    straight = hom2(0.0, d, 0.0)
    both = matmul(matmul(A, straight), matmul(inverse(A), inverse(straight)))
    print("with no turn in B the two moves commute and either order works: x = %.3f  y = %.3f\n" % pose_of(both)[:2])


def one_factorization_for_J_and_JT():
    heading("9. Robot: one factorization serves J and J transpose")
    J = arm_jacobian([2.2, 1.7], [math.radians(58), math.radians(-72)])    # the arm pose of Lecture 1
    P, L, U, perm = lu(J)
    show(J, "J", digits=3)
    v = [0.9, 0.45]                                 # wanted hand velocity, m/s
    qdot = lu_solve((P, L, U, perm), v)
    print("J qdot = v      ->  joint speeds qdot =", row(qdot, 2), "rad/s")
    tau = [1.0, 0.5]                                # joint torques, N m
    # J = L U, so J^T = U^T L^T: U^T is lower triangular, L^T is upper triangular
    z = forward_substitute(transpose(U), tau)
    F = back_substitute(transpose(L), z)
    print("J^T F = tau     ->  hand force F =", row(F, 3), "N, from the same L and U")
    print("direct solve of J^T F = tau gives", row(solve(transpose(J), tau), 3), "\n")


def tridiagonal(m):
    return [[4 if i == j else (1 if abs(i - j) == 1 else 0) for j in range(m)] for i in range(m)]


def banded_factor(m):
    """LU of the 1, 4, 1 matrix keeping only the two diagonals that are not zero."""
    d, l, ops = [4.0], [0.0], 0
    for i in range(1, m):
        l.append(1.0 / d[i - 1])
        d.append(4.0 - l[i])
        ops += 2
    return l, d, ops


def banded_solve(l, d, r):
    m, ops = len(d), 0
    y = [r[0]]
    for i in range(1, m):
        y.append(r[i] - l[i] * y[i - 1])
        ops += 1
    x = [0.0] * m
    x[m - 1] = y[m - 1] / d[m - 1]
    ops += 1
    for i in range(m - 2, -1, -1):
        x[i] = (y[i] - x[i + 1]) / d[i]
        ops += 2
    return x, ops


def spline_rhs(y, h=1.0):
    return [6 * (y[i - 1] - 2 * y[i] + y[i + 1]) / h ** 2 for i in range(1, len(y) - 1)]


def spline_eval(y, M, t):
    """Natural cubic spline with knots at t = 0, 1, 2, ... (h = 1). M includes both end zeros."""
    i = min(int(t), len(y) - 2)
    u = t - i
    a, b = y[i] - M[i] / 6, y[i + 1] - M[i + 1] / 6
    pos = M[i] * (1 - u) ** 3 / 6 + M[i + 1] * u ** 3 / 6 + a * (1 - u) + b * u
    vel = -M[i] * (1 - u) ** 2 / 2 + M[i + 1] * u ** 2 / 2 - a + b
    acc = M[i] * (1 - u) + M[i + 1] * u
    return pos, vel, acc


def spline_path():
    heading("10. Robot: a smooth path through waypoints")
    pts = [(-5.0, -2.4), (-3.3, 0.4), (-1.3, 2.0), (0.5, 0.3), (2.0, -1.9), (3.8, -0.7), (5.2, 2.1)]
    m = len(pts) - 2                                  # unknown accelerations: one per interior waypoint
    T = frac(tridiagonal(m))
    show(T, "T")
    P, L, U, perm = lu(T)
    show(L, "L")
    show(U, "U")
    piv = [U[i][i] for i in range(m)]
    print("pivots:     ", ", ".join(fmt(p) for p in piv), " = ", ", ".join(f"{float(p):.6f}" for p in piv))
    print("multipliers:", ", ".join(fmt(L[i][i - 1]) for i in range(1, m)), " = ",
          ", ".join(f"{float(L[i][i - 1]):.6f}" for i in range(1, m)))
    print(f"limits: pivots -> 2 + sqrt(3) = {2 + math.sqrt(3):.6f}, multipliers -> 2 - sqrt(3) = {2 - math.sqrt(3):.6f}\n")

    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    factors = lu([[float(v) for v in r] for r in T])      # factored ONCE
    rx, ry = spline_rhs(xs), spline_rhs(ys)
    Mx = [0.0] + lu_solve(factors, rx) + [0.0]            # the same factors serve x ...
    My = [0.0] + lu_solve(factors, ry) + [0.0]            # ... and y
    print("right-hand side for x:", row(rx, 1))
    print("right-hand side for y:", row(ry, 1))
    print("accelerations Mx:", row(Mx, 3))
    print("accelerations My:", row(My, 3))
    print("largest acceleration: %.2f m/s^2" % max(math.hypot(a, b) for a, b in zip(Mx, My)))

    # check the spline: hits every waypoint, velocity and acceleration continuous at every joint
    e = 1e-9
    hit = max(abs(spline_eval(xs, Mx, i)[0] - xs[i]) for i in range(len(xs)))
    jump_v = max(abs(spline_eval(ys, My, i - e)[1] - spline_eval(ys, My, i + e)[1]) for i in range(1, len(ys) - 1))
    jump_a = max(abs(spline_eval(ys, My, i - e)[2] - spline_eval(ys, My, i + e)[2]) for i in range(1, len(ys) - 1))
    print(f"passes through waypoints (largest miss {hit:.1e}); velocity jump at joints {jump_v:.1e}; "
          f"acceleration jump {jump_a:.1e}")
    print("midway between waypoints 2 and 3 the robot is at (%.3f, %.3f)"
          % (spline_eval(xs, Mx, 2.5)[0], spline_eval(ys, My, 2.5)[0]))

    # the banded version gives the same answer for a handful of operations
    l, d, f_ops = banded_factor(m)
    bx, s_ops = banded_solve(l, d, rx)
    print("banded solve agrees with the full one:", close([bx], [Mx[1:-1]]))
    print(f"banded cost for {m} unknowns: factor {f_ops} operations, each solve {s_ops} (a full solve needs n^2 = {m * m})")
    big = 500
    print(f"banded cost for {big} unknowns: factor {2 * (big - 1):,}, each solve {3 * big - 2:,} (full: factor "
          f"{factor_ops(big):,}, each solve {big * big:,})")

    # drag one waypoint: the matrix is untouched, only three right-hand side entries change
    ys2 = ys[:]
    ys2[3] = 1.5
    ry2 = spline_rhs(ys2)
    My2 = [0.0] + lu_solve(factors, ry2) + [0.0]
    print("\nmove waypoint 3 from y = 0.3 to y = 1.5:")
    print("new right-hand side for y:", row(ry2, 1), "  (T, L and U unchanged)")
    print("new accelerations My:     ", row(My2, 3), "\n")


def six_permutations():
    heading("11. Permutations")
    names = {(0, 1, 2): "I", (1, 0, 2): "P12", (2, 1, 0): "P13", (0, 2, 1): "P23", (1, 2, 0): "C", (2, 0, 1): "C2"}
    order = list(names)
    mats = {p: permutation_matrix(list(p)) for p in order}
    key = {tuple(map(tuple, M)): p for p, M in mats.items()}
    for p in order:
        print(f"{names[p]:>3}: rows {mats[p]}")
    print("\nproduct table (row label times column label):")
    print("      " + " ".join(f"{names[q]:>4}" for q in order))
    for p in order:
        cells = [names[key[tuple(map(tuple, matmul(mats[p], mats[q])))]] for q in order]
        print(f"{names[p]:>4}  " + " ".join(f"{c:>4}" for c in cells))
    print("Every product is one of the six.")
    a, b = mats[(1, 0, 2)], mats[(1, 2, 0)]
    print("P12 C =", names[key[tuple(map(tuple, matmul(a, b)))]], "  but  C P12 =",
          names[key[tuple(map(tuple, matmul(b, a)))]], "  (order matters)")
    for p in order:
        assert matmul(transpose(mats[p]), mats[p]) == identity(3)
    print("inverse = transpose for all six:",
          ", ".join(f"{names[p]}^-1 = {names[key[tuple(map(tuple, transpose(mats[p])))]]}" for p in order))
    print("how many: 3 by 3 ->", len(list(permutations(range(3)))), "  4 by 4 ->", len(list(permutations(range(4)))),
          "  n by n -> n!  (5! =", math.factorial(5), ", 6! =", math.factorial(6), ")")

    commands = [10, 20, 30]                         # what the controller sends on outputs 1, 2, 3
    C = mats[(1, 2, 0)]
    got = matvec(C, commands)
    print("\nmotors wired through C receive", got, "instead of", commands)
    print("sending C^T times the commands first repairs it:", matvec(C, matvec(transpose(C), commands)), "\n")


if __name__ == "__main__":
    inverse_of_a_product()
    inverse_of_a_transpose()
    lu_two_by_two()
    lu_three_by_three()
    two_triangular_passes()
    cost_of_elimination()
    control_loop()
    socks_and_shoes_rover()
    one_factorization_for_J_and_JT()
    spline_path()
    six_permutations()
