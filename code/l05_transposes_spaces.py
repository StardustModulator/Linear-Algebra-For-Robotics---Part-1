"""
Lecture 5 - Transposes, Permutations, Spaces R^n, on a robot.

    python3 code/l05_transposes_spaces.py

Covers: permutation matrices and PA = LU, partial pivoting (with a three-digit
arithmetic experiment), transposes, symmetric matrices and R^T R, vector spaces,
subspaces, and the column space of the lecture's 3 by 2 matrix.
Robots: joint torques from a hand force (tau = J^T F) on a two-link arm, and the
velocity subspace of a differential-drive rover.
"""
import math
from decimal import Decimal, ROUND_HALF_UP
from fractions import Fraction
from itertools import permutations

from linalg import (frac, show, fmt, heading, matmul, matvec, transpose, identity, column,
                    from_columns, combine, dot, norm, lu, permutation_matrix, close, rank,
                    in_column_space, solve, rot2, arm_points, arm_jacobian)


# ---------------------------------------------------------------- 1. permutations
def permutation_matrices():
    heading("1. Permutation matrices: the identity with its rows re-ordered")
    for n in (2, 3, 4):
        Ps = [permutation_matrix(p) for p in permutations(range(n))]
        ok = all(matmul(transpose(P), P) == identity(n) for P in Ps)
        print(f"n = {n}: {len(Ps):2d} permutation matrices (n! = {math.factorial(n)});"
              f"  P^T P = I for every one of them: {ok}")
    print("\nThe six 3 by 3 permutation matrices, written as the new row order:")
    for p in permutations(range(3)):
        print("  rows", tuple(i + 1 for i in p), " ", permutation_matrix(p))
    P = permutation_matrix((1, 2, 0))
    print("\nOne of them and its transpose:")
    show(P, "P")
    show(transpose(P), "P^T")
    show(matmul(transpose(P), P), "P^T P")


# ---------------------------------------------------------------- 2. PA = LU
def pa_equals_lu():
    heading("2. PA = LU: elimination with a row exchange")
    A = frac([[0, 1, 1], [1, 2, 1], [2, 7, 9]])
    show(A, "A")
    print("The first pivot position holds 0, so A = LU is impossible as it stands.\n")
    for label, partial in (("exchange only on a zero pivot (the lecture's rule)", False),
                           ("partial pivoting (the largest entry becomes the pivot)", True)):
        P, L, U, perm = lu(A, partial_pivoting=partial)
        print(label, "- row order used:", tuple(i + 1 for i in perm))
        show(P, "P")
        show(L, "L")
        show(U, "U")
        print("   P A == L U :", matmul(P, A) == matmul(L, U),
              "  largest multiplier in L:", fmt(max(abs(L[i][j]) for i in range(3) for j in range(i))), "\n")
    G = frac([[1, 2, 1], [3, 8, 1], [0, 4, 1]])
    print("A matrix that needs no exchange (the one from Lecture 2), factored both ways:")
    show(G, "A")
    for label, partial in (("lecture's rule", False), ("partial pivoting", True)):
        P, L, U, perm = lu(G, partial_pivoting=partial)
        print(f"{label}: row order {tuple(i + 1 for i in perm)}, pivots {[fmt(U[i][i]) for i in range(3)]},"
              f" P A == L U: {matmul(P, G) == matmul(L, U)}")
    S = frac([[1, 2, 3], [2, 4, 6], [1, 1, 1]])
    print("\nA singular matrix (row 2 = 2 x row 1):", "no PA = LU with three pivots"
          if lu(S) is None else "factored", "\n")


# ---------------------------------------------------------------- 3. tiny pivots
def sig(x, digits=3):
    """Round x to `digits` significant digits, halves away from zero (as a calculator does)."""
    if x == 0:
        return 0.0
    d = Decimal(x)                                   # the exact value of the float
    q = Decimal(1).scaleb(d.adjusted() - digits + 1)
    return float(d.quantize(q, rounding=ROUND_HALF_UP))


def solve_3_digits(a, b, c, d, e, f, digits=3):
    """Solve [a b; c d] (x, y) = (e, f) by elimination, pivot a, rounding every result to `digits` digits."""
    r = lambda v: sig(v, digits)
    l = r(c / a)                                     # the multiplier
    d2 = r(d - r(l * b))                             # new entry of row 2
    f2 = r(f - r(l * e))                             # new right-hand side of row 2
    y = r(f2 / d2)
    x = r(r(e - r(b * y)) / a)
    return x, y, dict(l=l, d2_exact=d - r(l * b), d2=d2, f2_exact=f - r(l * e), f2=f2)


def tiny_pivot():
    heading("3. Why software pivots: three-digit arithmetic and a tiny pivot")
    eps = 0.0001
    print(f"Solve  {eps} x + y = 1,   x + y = 2   keeping three significant digits at every step.")
    xt, yt = 1 / (1 - eps), (1 - 2 * eps) / (1 - eps)
    print(f"True answer: x = {xt:.6f}, y = {yt:.6f}\n")

    x, y, s = solve_3_digits(eps, 1, 1, 1, 1, 2)
    print("No exchange (pivot 0.0001):")
    print(f"   multiplier = 1 / 0.0001 = {s['l']:g}")
    print(f"   new row 2:   1 - 10000 x 1 = {s['d2_exact']:g}, stored as {s['d2']:g}")
    print(f"   right side:  2 - 10000 x 1 = {s['f2_exact']:g}, stored as {s['f2']:g}")
    print(f"   answer (x, y) = ({x:g}, {y:g})    error = {math.hypot(x - xt, y - yt):.3g}\n")

    x, y, s = solve_3_digits(1, 1, eps, 1, 2, 1)
    print("Rows exchanged first (pivot 1):")
    print(f"   multiplier = 0.0001 / 1 = {s['l']:g}")
    print(f"   new row 2:   1 - 0.0001 x 1 = {s['d2_exact']:g}, stored as {s['d2']:g}")
    print(f"   right side:  1 - 0.0001 x 2 = {s['f2_exact']:g}, stored as {s['f2']:g}")
    print(f"   answer (x, y) = ({x:g}, {y:g})    error = {math.hypot(x - xt, y - yt):.3g}\n")

    print("The same experiment for a range of pivot sizes:")
    print("   pivot        no exchange (x, y)    error      with exchange (x, y)   error")
    for eps in (0.1, 0.05, 0.02, 0.01, 0.005, 0.002, 0.001, 0.0005, 0.0002, 0.0001,
                0.00005, 0.00002, 0.00001, 0.000005, 0.000002, 0.000001):
        xt, yt = 1 / (1 - eps), (1 - 2 * eps) / (1 - eps)
        x1, y1, _ = solve_3_digits(eps, 1, 1, 1, 1, 2)
        x2, y2, _ = solve_3_digits(1, 1, eps, 1, 2, 1)
        name = f"{eps:.6f}".rstrip("0")
        print(f"   {name:<10}   ({x1:<5g}, {y1:<5g})        {math.hypot(x1 - xt, y1 - yt):<8.2g}   "
              f"({x2:<4g}, {y2:<5g})          {math.hypot(x2 - xt, y2 - yt):.2g}")
    n1, n2 = (0.0001, 1), (1, 1)
    ang = math.degrees(math.acos(abs(dot(n1, n2)) / (norm(n1) * norm(n2))))
    print(f"\nThe two lines cross at {ang:.0f} degrees, so the problem itself is healthy."
          "\nOnly the order of the rows was bad.\n")


# ---------------------------------------------------------------- 4. transposes
def transposes():
    heading("4. Transposes: rows become columns")
    A = frac([[1, 3], [2, 3], [4, 1]])
    show(A, "A")
    show(transpose(A), "A^T")
    print("Entry (3, 1) of A is", A[2][0], "and entry (1, 3) of A^T is", transpose(A)[0][2], "\n")
    B = frac([[2, 0], [1, 5]])
    left, right = transpose(matmul(A, B)), matmul(transpose(B), transpose(A))
    print("Transpose of a product, reverse order: (A B)^T == B^T A^T :", left == right, "\n")


# ---------------------------------------------------------------- 5. symmetric
def symmetric():
    heading("5. Symmetric matrices, and R^T R")
    S = frac([[3, 1, 7], [1, 2, 9], [7, 9, 4]])
    show(S, "S")
    print("S^T == S :", transpose(S) == S, "\n")
    A = frac([[1, 3], [2, 3], [4, 1]])
    AAt, AtA = matmul(A, transpose(A)), matmul(transpose(A), A)
    print("The lecture's product: the 3 by 2 matrix times its transpose")
    show(AAt, "A A^T")
    print("symmetric:", transpose(AAt) == AAt, "\n")
    print("The other order gives a 2 by 2 matrix, also symmetric")
    show(AtA, "A^T A")
    print("symmetric:", transpose(AtA) == AtA)
    print("Entry (1, 2) of A A^T = row 1 . row 2 =", dot(A[0], A[1]),
          "  entry (2, 1) = row 2 . row 1 =", dot(A[1], A[0]), "\n")


# ---------------------------------------------------------------- 6. rotations
def rotation_inverse():
    heading("6. Robot: undoing a rotation is a transpose")
    R = rot2(math.radians(30))
    show(R, "R(30 deg)")
    show(matmul(transpose(R), R), "R^T R")
    v_body = [1.0, 0.0]
    v_world = matvec(R, v_body)
    back = matvec(transpose(R), v_world)
    print("body vector (1, 0) -> world", [round(v, 3) for v in v_world],
          "-> back to body with R^T:", [round(v, 3) for v in back], "\n")


# ---------------------------------------------------------------- 7. tau = J^T F
def arm_statics():
    heading("7. Robot: joint torques from a hand force, tau = J^T F")
    lengths = [0.5, 0.4]                               # metres

    def report(name, deg, F):
        q = [math.radians(a) for a in deg]
        J = arm_jacobian(lengths, q)
        tau = matvec(transpose(J), F)
        pts = arm_points(lengths, q)
        hand = pts[-1]
        # the same torques as "moment of F about each joint": r x F with r = hand - joint
        moments = [(hand[0] - p[0]) * F[1] - (hand[1] - p[1]) * F[0] for p in pts[:-1]]
        size = norm(F)
        arms = [abs(t) / size for t in tau]
        print(f"{name}: joints {deg} deg, hand at ({hand[0]:.3f}, {hand[1]:.3f}) m, F = {F} N")
        print(f"   tau = J^T F = ({tau[0]:.2f}, {tau[1]:.2f}) N m"
              f"   moments about the joints = ({moments[0]:.2f}, {moments[1]:.2f}) N m"
              f"   lever arms = ({arms[0]:.2f}, {arms[1]:.2f}) m")
        return J, tau

    J, tau = report("Worked example (forearm level)", (90, -90), [0.0, 10.0])
    show(J, "J", digits=2)
    show(transpose(J), "J^T", digits=2)
    qdot = [1.0, 2.0]                                   # any joint speeds, rad/s
    v = matvec(J, qdot)
    print(f"Power check with joint speeds {qdot} rad/s: hand velocity v = J qdot = "
          f"({v[0]:.2f}, {v[1]:.2f}) m/s")
    print(f"   hand power F . v = {dot([0.0, 10.0], v):.2f} W     motor power tau . qdot = {dot(tau, qdot):.2f} W\n")

    report("Force along the forearm (through the elbow)", (90, -90), [10.0, 0.0])
    report("Straight arm, force along it", (90, 0), [0.0, 10.0])
    report("Straight arm, force across it", (90, 0), [10.0, 0.0])
    report("Elbow bent by only 10 degrees, same upward force", (90, -10), [0.0, 10.0])

    print("\nSymmetric matrices built from the worked-example Jacobian:")
    q = [math.radians(90), math.radians(-90)]
    J = arm_jacobian(lengths, q)
    JJt, JtJ = matmul(J, transpose(J)), matmul(transpose(J), J)
    show(JJt, "J J^T", digits=2)
    show(JtJ, "J^T J", digits=2)
    print("J J^T symmetric:", close(JJt, transpose(JJt)), "   J^T J symmetric:", close(JtJ, transpose(JtJ)), "\n")


# ---------------------------------------------------------------- 8. subspace tests
def subspace_tests():
    heading("8. Vector spaces and subspaces: the two tests")

    def on_line(a, b, c):                               # the line a x + b y = c
        return lambda p: abs(a * p[0] + b * p[1] - c) < 1e-9

    sets = [
        ("line through the origin  x - 2y = 0", on_line(1, -2, 0), (2, 1), (-1, -0.5)),
        ("line missing the origin  x - 2y = -3", on_line(1, -2, -3), (1, 2), (-1, 1)),
        ("first quadrant  x >= 0, y >= 0", lambda p: p[0] >= 0 and p[1] >= 0, (2, 1), (0.5, 2)),
        ("whole plane R^2", lambda p: True, (2, 1), (-1, 2)),
        ("only the zero vector", lambda p: p[0] == 0 and p[1] == 0, (0, 0), (0, 0)),
        ("disc of radius 2 (a speed limit)", lambda p: math.hypot(*p) <= 2, (1.75, 0.75), (0.75, 1.5)),
    ]
    c = -1.5
    print(f"Each set is tested with one pair v, w from the set and the scalar c = {c}.")
    print("A single failure proves a set is not a subspace. Passing one trial proves nothing by itself;")
    print("the sets marked 'subspace' pass for every choice, by the argument in the article note.\n")
    for name, inside, v, w in sets:
        s = (v[0] + w[0], v[1] + w[1])
        cv = (c * v[0] + 0.0, c * v[1] + 0.0)
        verdict = "subspace" if name.startswith(("line through", "whole", "only")) else "NOT a subspace"
        print(f"{name}\n   contains 0: {str(inside((0, 0))):5}  v + w = {s} inside: {str(inside(s)):5}"
              f"  c v = {cv} inside: {str(inside(cv)):5}  ->  {verdict}")
    print("\nFirst quadrant with a positive scalar: 2 x (2, 1) = (4, 2) is inside. It is only")
    print("negative scalars that leave, which is why the set can fool you.\n")


# ---------------------------------------------------------------- 9. column space
def column_space():
    heading("9. The column space of the lecture's 3 by 2 matrix")
    A = frac([[1, 3], [2, 3], [4, 1]])
    show(A, "A")
    c1, c2 = column(A, 0), column(A, 1)
    print("rank =", rank(A), " so the two columns are not on one line and C(A) is a plane through 0.")
    n = [c1[1] * c2[2] - c1[2] * c2[1], c1[2] * c2[0] - c1[0] * c2[2], c1[0] * c2[1] - c1[1] * c2[0]]
    print("A vector at right angles to both columns:", [fmt(v) for v in n],
          " so the plane is 10x - 11y + 3z = 0")
    for b in ([4, 5, 5], [-1, 1, 7], [0, 0, 0], [1, 0, 0]):
        b = frac(b)
        print(f"   b = {[fmt(v) for v in b]}: in C(A)? {str(in_column_space(A, b)):5}"
              f"   10x - 11y + 3z = {fmt(10 * b[0] - 11 * b[1] + 3 * b[2])}")
    print("   (4, 5, 5) = col 1 + col 2 and (-1, 1, 7) = 2 col 1 - col 2:",
          [fmt(v) for v in combine([c1, c2], [1, 1])], [fmt(v) for v in combine([c1, c2], [2, -1])], "\n")


# ---------------------------------------------------------------- 10. the rover
def rover_velocity_space():
    heading("10. Robot: the velocity subspace of a differential-drive rover")
    r, W = 0.1, 0.5                                     # wheel radius and track width, metres
    A = [[r / 2, r / 2], [0.0, 0.0], [-r / W, r / W]]
    print(f"wheel radius r = {r} m, track width W = {W} m")
    print("body velocity (vx, vy, w) = A (wL, wR), wheel speeds in rad/s")
    show(A, "A", digits=3)
    for wheels in ([6, 9], [8, 12], [10, 10], [-5, 5], [9, 3], [0, 0]):
        v = matvec(A, wheels)
        print(f"   wheels {wheels} rad/s  ->  vx = {v[0]:.2f} m/s, vy = {v[1]:.2f} m/s, w = {v[2]:.2f} rad/s")
    print("rank of A =", rank(A), ": the achievable velocities form a plane, the plane vy = 0.")
    for b in ([0.6, 0.0, -1.2], [0.0, 0.3, 0.0]):
        ok = in_column_space(A, b)
        how = ""
        if ok:
            wl_wr = solve([A[0], A[2]], [b[0], b[2]])
            how = f"  with wheel speeds ({wl_wr[0]:.0f}, {wl_wr[1]:.0f}) rad/s"
        print(f"   is {b} achievable? {ok}{how}")
    v1, v2 = matvec(A, [8, 12]), matvec(A, [9, 3])
    total = [a + b for a, b in zip(v1, v2)]
    print("   closed under addition: A(8, 12) + A(9, 3) =", [round(x, 2) for x in total],
          "= A(17, 15) =", [round(x, 2) for x in matvec(A, [17, 15])])
    print("   closed under scaling:  -2 x A(8, 12) =", [round(-2 * x, 2) + 0.0 for x in v1],
          "= A(-16, -24) =", [round(x, 2) for x in matvec(A, [-16, -24])])

    print("\nAdd a sideways wheel under the centre (and omni wheels all round): a third column.")
    B = [row + [extra] for row, extra in zip(A, [0.0, r, 0.0])]
    show(B, "A_omni", digits=3)
    print("rank =", rank(B), ": three independent columns fill all of R^3.")
    want = [0.0, 0.3, 0.0]
    w3 = solve(B, want)
    print(f"   pure sideways slide {want}: wheel speeds {tuple(int(round(w)) for w in w3)} rad/s")

    print("\nA set that is NOT a subspace: wheel speeds that give exactly vx = 1 m/s.")
    a, b = [8, 12], [15, 5]
    print(f"   {a} gives vx = {matvec(A, a)[0]:.1f}, {b} gives vx = {matvec(A, b)[0]:.1f},"
          f" but their sum {[x + y for x, y in zip(a, b)]} gives vx = {matvec(A, [x + y for x, y in zip(a, b)])[0]:.1f}")
    print("   and (0, 0), standing still, gives vx = 0.0, so the zero vector is not in that set.\n")


# ---------------------------------------------------------------- 11. practice
def practice():
    heading("11. Practice problems (answers to P1-P10 on the page)")
    P = permutation_matrix((2, 0, 1))                 # rows in the order 3, 1, 2
    print("P1   P =", P, "  P^-1 = P^T =", transpose(P))
    print("     P^T P = I:", matmul(transpose(P), P) == identity(3),
          "  P sends (1, 2, 3) to", matvec(P, [1, 2, 3]), "  5! =", math.factorial(5))

    A = frac([[1, 1, 1], [2, 2, 5], [4, 6, 8]])
    Pm, L, U, perm = lu(A)
    f = lambda M: [[fmt(v) for v in row] for row in M]
    print("P2   P =", f(Pm), " L =", f(L), " U =", f(U))
    print("     P A == L U:", matmul(Pm, A) == matmul(L, U),
          "  with the 5 changed to 2:", "singular" if lu(frac([[1, 1, 1], [2, 2, 2], [4, 6, 8]])) is None else "factors")

    R = [[1, 2, 0], [0, 1, 1]]
    print("P3   R^T R =", matmul(transpose(R), R), "  R R^T =", matmul(R, transpose(R)))

    print("P4   (a) y = 3x: subspace   (d) x + y + z = 0: subspace")
    print("     (b) y = 3x + 1: (0, 0) gives 0 = 1, zero vector missing")
    print("     (c) xy = 0: (1, 0) + (0, 1) = (1, 1) and 1 x 1 =", 1 * 1, "not 0, adding fails")
    print("     (e) x + y + z = 1: (1, 0, 0) + (0, 1, 0) has components adding to", sum([1, 1, 0]))

    A = frac([[1, 0], [2, 1], [3, 1]])
    print("P5   (2, 5, 7) in C(A):", in_column_space(A, frac([2, 5, 7])),
          " as", [fmt(v) for v in solve([A[0], A[1]], frac([2, 5]))], "of the columns;",
          " (1, 1, 1) in C(A):", in_column_space(A, frac([1, 1, 1])))
    print("     with second column (2, 4, 6) the rank is", rank(frac([[1, 2], [2, 4], [3, 6]])))

    x1, y1, _ = solve_3_digits(0.001, 1, 1, 1, 1, 2, digits=2)
    x2, y2, _ = solve_3_digits(1, 1, 0.001, 1, 2, 1, digits=2)
    print(f"P6   two digits, no exchange: ({x1:g}, {y1:g})   rows exchanged: ({x2:g}, {y2:g})"
          f"   true: ({1 / 0.999:.3f}, {0.998 / 0.999:.3f})")

    P = permutation_matrix((1, 2, 0))                 # the computer sees encoders 2, 3, 1
    print("P7   scrambling P =", P, "  true readings = P^T (5, 7, 2) =", matvec(transpose(P), [5, 7, 2]))

    J = arm_jacobian([1, 1], [0, math.pi / 2])
    Jr = [[round(v) for v in row] for row in J]
    print("P8   J =", Jr, "  torques for F = (0, -6):", matvec(transpose(Jr), [0, -6]),
          "  for F = (4, 0):", matvec(transpose(Jr), [4, 0]))
    Js = [[round(v) for v in row] for row in arm_jacobian([1, 1], [0, 0])]
    print("     straight arm J =", Js, "  torques for F = (9, 0):", matvec(transpose(Js), [9, 0]))

    r, W = Fraction(1, 5), Fraction(2, 5)
    A = [[r / 2, r / 2], [Fraction(0), Fraction(0)], [-r / W, r / W]]
    w = solve([A[0], A[2]], [Fraction(1), Fraction(1)])
    print("P9   A =", [[fmt(v) for v in row] for row in A], "  wheel speeds (wL, wR) =", [fmt(v) for v in w],
          "  (0, 0.5, 0) achievable:", in_column_space(A, [Fraction(0), Fraction(1, 2), Fraction(0)]))

    thrusters = [[1, 0], [0, 1], [-1, -1]]
    print("P10  thrusts (0, 3, 2) give the force", combine(thrusters, [0, 3, 2]),
          "  and no thrust is negative")
    print()


if __name__ == "__main__":
    permutation_matrices()
    pa_equals_lu()
    tiny_pivot()
    transposes()
    symmetric()
    rotation_inverse()
    arm_statics()
    subspace_tests()
    column_space()
    rover_velocity_space()
    practice()
