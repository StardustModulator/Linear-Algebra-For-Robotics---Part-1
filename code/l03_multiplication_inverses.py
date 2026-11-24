"""
Lecture 3 - Multiplication and Inverse Matrices, on a robot.

    python3 code/l03_multiplication_inverses.py

Covers: the five ways to multiply (entries, columns, rows, columns times rows,
blocks), the size rule, AB against BA, inverses, the singular case, Gauss-Jordan
and why it works.
Robots: a pose as a 3 by 3 transform, forward kinematics of a two-link arm as a
product, turn-then-drive against drive-then-turn, wheel mixing, a one-trick
controller, change of viewpoint with the inverse transform, lost information.
"""
import math
from linalg import (frac, show, fmt, heading, matmul, matvec, transpose, identity, column, combine,
                    inverse, solve, nullspace, close, is_zero, dot, norm, hom2, rot2,
                    arm_points, arm_jacobian)

# The pair used on the page and in Lab 3.1. Column 1 of A times row 1 of B is the
# lecture's own column-times-row example.
A = [[2, 7], [3, 8], [4, 9]]          # 3 by 2
B = [[1, 6], [1, 2]]                  # 2 by 2


def r2(v):
    """A vector or matrix rounded to two decimals, with no negative zeros."""
    if isinstance(v[0], (list, tuple)):
        return [r2(row) for row in v]
    return [round(x, 2) + 0.0 for x in v]


def outer(col, row):
    """A column times a row: every entry is (entry of the column) * (entry of the row)."""
    return [[c * r for r in row] for c in col]


def add(X, Y):
    return [[x + y for x, y in zip(rx, ry)] for rx, ry in zip(X, Y)]


def product_shape(shape_a, shape_b):
    """Shape of AB, or None when the inner sizes do not match."""
    (m, n), (n2, p) = shape_a, shape_b
    return (m, p) if n == n2 else None


# ----------------------------------------------------------------- the lecture
def way_1_entries():
    heading("1. Way one: an entry at a time (row times column)")
    show(A, "A")
    show(B, "B")
    C = matmul(A, B)
    show(C, "AB")
    print("Lecture: c_34 = (row 3 of A).(column 4 of B) = a_31 b_14 + a_32 b_24 + ...")
    i, j = 2, 1                                  # row 3, column 2 (counting from zero)
    terms = [f"{A[i][k]}*{B[k][j]}" for k in range(len(B))]
    print(f"Here:    c_32 = (row 3 of A).(column 2 of B) = {' + '.join(terms)} = {C[i][j]}\n")


def size_rule():
    heading("2. The size rule: (m by n)(n by p) = (m by p)")
    for sa, sb in (((3, 2), (2, 2)), ((2, 2), (3, 2)), ((3, 2), (2, 4)), ((1, 3), (3, 1)), ((3, 1), (1, 2)),
                   ((4, 3), (3, 2))):
        s = product_shape(sa, sb)
        print(f"  {sa[0]} by {sa[1]}  times  {sb[0]} by {sb[1]}   ->  ",
              f"{s[0]} by {s[1]}" if s else f"not defined (inner sizes {sa[1]} and {sb[0]} differ)")
    print()


def way_2_columns():
    heading("3. Way two: a column at a time (columns of AB are combinations of columns of A)")
    C = matmul(A, B)
    cols_a = [column(A, 0), column(A, 1)]
    for j in range(2):
        w = column(B, j)
        print(f"  column {j + 1} of AB = {w[0]}*{cols_a[0]} + {w[1]}*{cols_a[1]} = {combine(cols_a, w)}"
              f"   (matmul gives {column(C, j)})")
    x = [1, 1]
    print(f"  Why the rule is what it is: A(Bx) = (AB)x.  With x = {x}:  Bx = {matvec(B, x)},"
          f"  A(Bx) = {matvec(A, matvec(B, x))},  (AB)x = {matvec(C, x)}\n")


def way_3_rows():
    heading("4. Way three: a row at a time (rows of AB are combinations of rows of B)")
    C = matmul(A, B)
    for i in range(3):
        mix = [A[i][0] * b0 + A[i][1] * b1 for b0, b1 in zip(B[0], B[1])]
        print(f"  row {i + 1} of AB = {A[i][0]}*{B[0]} + {A[i][1]}*{B[1]} = {mix}   (matmul gives {C[i]})")
    print()


def way_4_columns_times_rows():
    heading("5. Way four: columns times rows")
    print("Lecture: a column times a row is a full matrix.")
    show(outer([2, 3, 4], [1, 6]), "[2 3 4]^T [1 6]")
    print("Every row is a multiple of [1 6]; every column is a multiple of (2, 3, 4).\n")

    print("Lecture example: [2 7; 3 8; 4 9][1 6; 0 0] = (col 1)(row 1) + (col 2)(row 2)")
    B0 = [[1, 6], [0, 0]]
    p1, p2 = outer(column(A, 0), B0[0]), outer(column(A, 1), B0[1])
    show(p1, "piece 1")
    show(p2, "piece 2")
    print("sum equals the ordinary product:", add(p1, p2) == matmul(A, B0), "\n")

    print("The page's pair, B = [1 6; 1 2]:")
    p1, p2 = outer(column(A, 0), B[0]), outer(column(A, 1), B[1])
    show(p1, "piece 1")
    show(p2, "piece 2")
    show(add(p1, p2), "sum")
    print("sum equals AB:", add(p1, p2) == matmul(A, B), "\n")


def way_5_blocks():
    heading("6. Way five: block multiplication")
    M = [[1, 2, 0, 1], [3, 4, 1, 0], [0, 1, 2, 3], [1, 0, 4, 5]]
    N = [[2, 0, 1, 1], [1, 3, 0, 2], [0, 1, 1, 0], [4, 0, 2, 1]]

    def block(X, r, c):                          # the 2 by 2 block starting at row r, column c
        return [row[c:c + 2] for row in X[r:r + 2]]

    A1, A2, A3, A4 = block(M, 0, 0), block(M, 0, 2), block(M, 2, 0), block(M, 2, 2)
    B1, B2, B3, B4 = block(N, 0, 0), block(N, 0, 2), block(N, 2, 0), block(N, 2, 2)
    top_left = add(matmul(A1, B1), matmul(A2, B3))
    top_right = add(matmul(A1, B2), matmul(A2, B4))
    bot_left = add(matmul(A3, B1), matmul(A4, B3))
    bot_right = add(matmul(A3, B2), matmul(A4, B4))
    glued = [a + b for a, b in zip(top_left, top_right)] + [a + b for a, b in zip(bot_left, bot_right)]
    show(top_left, "A1 B1 + A2 B3")
    show(matmul(M, N), "full product")
    print("blocks glued together equal the full 4 by 4 product:", glued == matmul(M, N), "\n")


def order_matters():
    heading("7. AB is usually not BA")
    L = [[1, 3], [2, 7]]
    P = [[0, 1], [1, 0]]
    show(matmul(P, L), "PA")
    show(matmul(L, P), "AP")
    print("P on the left exchanges the rows of A. P on the right exchanges its columns.\n")


def inverses():
    heading("8. The inverse: A^-1 A = I = A A^-1")
    L = frac([[1, 3], [2, 7]])
    Linv = frac([[7, -3], [-2, 1]])
    show(matmul(Linv, L), "A^-1 A")
    show(matmul(L, Linv), "A A^-1")


def singular_case():
    heading("9. The singular case: A = [1 3; 2 6] has no inverse")
    S = frac([[1, 3], [2, 6]])
    show(S, "A")
    print("Reason one: column 2 =", fmt(S[0][1] / S[0][0]), "* column 1, so every combination stays on one line.")
    x = frac([3, -1])
    print("Reason two: x =", [fmt(v) for v in x], " gives A x =", [fmt(v) for v in matvec(S, x)])
    print("            nullspace() finds the same line:", [[fmt(v) for v in b] for b in nullspace(S)])
    print("Gauss-Jordan result:", inverse(S), " (None means no inverse)\n")


def gauss_jordan(M):
    """
    Reduce [M | I] to [I | M^-1], printing every row step, in the lecture's order:
    clear below the pivots (Gauss), clear above them (Jordan), divide by the pivots.
    Returns (inverse or None, the list of step matrices in the order they were applied).
    """
    n = len(M)
    W = [list(row) + identity(n)[i] for i, row in enumerate(M)]
    steps = []

    def record(E, what):
        steps.append(E)
        print("  " + what)
        show(W, aug=n)

    print("  start with [A | I]")
    show(W, aug=n)
    for k in range(n):                                   # Gauss: downward
        if is_zero(W[k][k]):
            p = next((r for r in range(k + 1, n) if not is_zero(W[r][k])), None)
            if p is None:
                print(f"  no pivot can be found in column {k + 1}: the matrix is singular\n")
                return None, steps
            W[k], W[p] = W[p], W[k]
            E = identity(n)
            E[k], E[p] = E[p], E[k]
            record(E, f"exchange rows {k + 1} and {p + 1}")
        for i in range(k + 1, n):
            l = W[i][k] / W[k][k]
            if is_zero(l):
                continue
            W[i] = [a - l * b for a, b in zip(W[i], W[k])]
            E = identity(n)
            E[i][k] = -l
            record(E, f"row {i + 1}  <-  row {i + 1} - ({fmt(l)}) * row {k + 1}")
    for k in range(n - 1, -1, -1):                       # Jordan: upward
        for i in range(k - 1, -1, -1):
            l = W[i][k] / W[k][k]
            if is_zero(l):
                continue
            W[i] = [a - l * b for a, b in zip(W[i], W[k])]
            E = identity(n)
            E[i][k] = -l
            record(E, f"row {i + 1}  <-  row {i + 1} - ({fmt(l)}) * row {k + 1}")
    for k in range(n):                                   # make every pivot 1
        d = W[k][k]
        if not is_zero(d - 1):
            W[k] = [a / d for a in W[k]]
            E = identity(n)
            E[k][k] = 1 / d
            record(E, f"row {k + 1}  <-  row {k + 1} / ({fmt(d)})")
    return [row[n:] for row in W], steps


def gauss_jordan_lecture():
    heading("10. Finding the inverse: two systems with the same A")
    L = frac([[1, 3], [2, 7]])
    for j, e in enumerate(([1, 0], [0, 1])):
        print(f"  A * (column {j + 1} of A^-1) = {e}   ->   column {j + 1} = {[fmt(v) for v in solve(L, frac(e))]}")
    print()

    heading("11. Gauss-Jordan: [A | I] -> [I | A^-1]")
    Linv, steps = gauss_jordan(L)
    show(Linv, "A^-1")
    print("check A A^-1 = I:", matmul(L, Linv) == identity(2), "   library inverse() agrees:", inverse(L) == Linv, "\n")

    heading("12. Why it works: all the row steps together are one matrix E")
    E = identity(2)
    for k, S in enumerate(steps):
        show(S, f"step {k + 1}")
        E = matmul(S, E)                         # a later step multiplies on the left
    show(E, "E = (last step) ... (first step)")
    print("E A = I:", matmul(E, L) == identity(2), "   so E is A^-1, and E [A | I] = [I | E].\n")

    heading("13. A 3 by 3 Gauss-Jordan (the -1, 2, -1 matrix)")
    K = frac([[2, -1, 0], [-1, 2, -1], [0, -1, 2]])
    Kinv, _ = gauss_jordan(K)
    show(Kinv, "K^-1")
    print("check K K^-1 = I:", matmul(K, Kinv) == identity(3), "\n")


# ----------------------------------------------------------------- the robots
def pose_as_matrix():
    heading("14. Robot: a pose is a 3 by 3 matrix")
    T = hom2(math.radians(90), 3, 1)             # rover at (3, 1), facing 90 degrees (north)
    show(T, "T", digits=2)
    rock = [2, 0, 1]                             # 2 m straight ahead of the rover, with the extra 1
    print("a rock 2 m ahead of the rover, (2, 0) in the rover frame, is at world",
          r2(matvec(T, rock)[:2]), "\n")


def forward_kinematics():
    heading("15. Robot: forward kinematics is a product T1 T2 T3")
    l1, l2 = 2.0, 1.5                            # link lengths in metres
    q1, q2 = math.radians(30), math.radians(60)  # shoulder and elbow angles
    T1 = hom2(q1, 0, 0)                          # link 1 frame seen from the world: turn by q1 at the shoulder
    T2 = hom2(q2, l1, 0)                         # link 2 frame seen from link 1: go l1 along the link, turn by q2
    T3 = hom2(0, l2, 0)                          # hand frame seen from link 2: go l2 along the link
    show(T1, "T1", digits=2)
    show(T2, "T2", digits=2)
    show(T3, "T3", digits=2)
    T12 = matmul(T1, T2)
    T = matmul(T12, T3)
    show(T12, "T1 T2", digits=2)
    show(T, "T1 T2 T3", digits=2)
    print("hand x axis in the world (column 1):", r2(column(T, 0)[:2]))
    print("hand y axis in the world (column 2):", r2(column(T, 1)[:2]))
    print("hand position in the world (column 3):", r2(column(T, 2)[:2]))
    print("trigonometry gives the same hand position:", r2(arm_points([l1, l2], [q1, q2])[-1]))
    print("brackets may move, (T1 T2) T3 = T1 (T2 T3):", close(T, matmul(T1, matmul(T2, T3))), "\n")
    return T1, T2


def block_rule(T1, T2):
    heading("16. Robot: poses multiply by blocks, [R p; 0 1][R' p'; 0 1] = [RR' Rp'+p; 0 1]")
    R, p = [row[:2] for row in T1[:2]], [T1[0][2], T1[1][2]]
    R2, p2 = [row[:2] for row in T2[:2]], [T2[0][2], T2[1][2]]
    RR = matmul(R, R2)
    pos = [a + b for a, b in zip(matvec(R, p2), p)]
    show(RR, "R R'", digits=2)
    print("R p' + p =", r2(pos), "  (the elbow position)")
    built = [RR[0] + [pos[0]], RR[1] + [pos[1]], [0, 0, 1]]
    print("block formula equals the full 3 by 3 product T1 T2:", close(built, matmul(T1, T2)), "\n")


def order_on_a_rover():
    heading("17. Robot: turn then drive is not drive then turn")
    R = hom2(math.radians(90), 0, 0)             # turn 90 degrees on the spot
    D = hom2(0, 2, 0)                            # drive 2 m straight ahead
    RD, DR = matmul(R, D), matmul(D, R)
    show(RD, "R D (turn, then drive)", digits=2)
    show(DR, "D R (drive, then turn)", digits=2)
    a, b = column(RD, 2)[:2], column(DR, 2)[:2]
    print("turn then drive ends at", r2(a), "  drive then turn ends at", r2(b))
    print(f"gap between the two end points: {math.dist(a, b):.2f} m   (2 d sin(angle / 2) = "
          f"{2 * 2 * math.sin(math.radians(90) / 2):.2f})")
    R30, R45 = hom2(math.radians(30), 0, 0), hom2(math.radians(45), 0, 0)
    print("two turns on the spot do commute:", close(matmul(R30, R45), matmul(R45, R30)), "\n")


def wheel_mixing():
    heading("18. Robot: the row way is wheel mixing")
    b = 0.5                                      # distance between the two wheels, in metres
    W = [[1, -b / 2], [1, b / 2]]                # wheel speeds (left, right) from body velocity (v, w)
    G = [[0.8, 0], [0, 2.0]]                     # body velocity from joystick (forward stick, turn stick)
    C = matmul(W, G)
    show(W, "W (body -> wheels)")
    show(G, "G (stick -> body)")
    show(C, "W G (stick -> wheels)")
    for i, name in enumerate(("left wheel", "right wheel")):
        mix = [W[i][0] * g0 + W[i][1] * g1 for g0, g1 in zip(G[0], G[1])]
        print(f"  {name}: row {i + 1} of WG = {W[i][0]}*(row 1 of G) + ({W[i][1]})*(row 2 of G) = {r2(mix)}")
    stick = [1.0, 0.5]
    print("  full forward stick with half turn stick -> wheel speeds", r2(matvec(C, stick)), "m/s\n")


def one_trick_controller():
    heading("19. Robot: a column times a row is a one-trick machine, K = d w^T")
    d, w = [1, 2], [1, 3]                        # pushes only along d, listens only along w
    K = outer(d, w)
    show(K, "K")
    for e in ([2, 1], [0, 1], [-1, 4], [3, -1]):
        print(f"  error {e}:  w.e = {dot(w, e):3d}   K e = {matvec(K, e)}   = {dot(w, e)} * d")
    print("Every output lies along d = (1, 2). The error (3, -1) produces no push at all.")
    print("K is the lecture's singular matrix [1 3; 2 6].\n")


def change_of_viewpoint():
    heading("20. Robot: the inverse transform changes viewpoint, T^-1 = [R^T  -R^T p; 0 1]")

    def block_inverse(T):
        Rt = transpose([row[:2] for row in T[:2]])
        q = matvec(Rt, [T[0][2], T[1][2]])
        return [Rt[0] + [-q[0]], Rt[1] + [-q[1]], [0, 0, 1]]

    for (x, y, deg), lm in (((3, 1, 90), (1, 4)), ((1, 2, 30), (4, 3))):
        T = hom2(math.radians(deg), x, y)
        Ti = block_inverse(T)
        print(f"rover at ({x}, {y}) facing {deg} degrees, landmark at world {lm}")
        show(T, "T", digits=3)
        show(Ti, "T^-1", digits=3)
        seen = matvec(Ti, [lm[0], lm[1], 1])[:2]
        print("  block formula equals Gauss-Jordan inverse:", close(Ti, inverse(T)),
              "   T^-1 T = I:", close(matmul(Ti, T), identity(3)))
        side = "left" if seen[1] >= 0 else "right"
        print(f"  landmark seen from the rover: {[round(v, 3) for v in seen]}"
              f"  ->  {seen[0]:.2f} m ahead, {abs(seen[1]):.2f} m to the {side}")
        print(f"  distance is the same from both viewpoints: {math.dist((x, y), lm):.3f} and {norm(seen):.3f}\n")

    R = hom2(math.radians(90), 0, 0)
    D = hom2(0, 2, 0)
    show(inverse(D), "D^-1 (drive 2 m backward)", digits=2)
    print("undo a chain in reverse order, (R D)^-1 = D^-1 R^-1:",
          close(inverse(matmul(R, D)), matmul(inverse(D), inverse(R))), "\n")


def lost_information():
    heading("21. Robot: singular means information was destroyed")
    F = [[1, 0], [0, 0]]                         # a sensor that keeps x and drops depth
    for p in ([2, 1], [2, 5]):
        print(f"  point {p}  ->  image {matvec(F, p)}")
    print("  two different points, one image. x = (0, 1) gives F x =", matvec(F, [0, 1]),
          "; inverse(F) =", inverse(F))

    lengths, q = [2.2, 1.7], [math.radians(58), 0.0]         # Lecture 1's arm, stretched straight
    J = arm_jacobian(lengths, q)
    show(J, "J (straight arm)", digits=2)
    still = [lengths[1], -(lengths[0] + lengths[1])]         # joint speeds that cancel at the hand
    print("  inverse(J) =", inverse(J), "  joint speeds", r2(still), "rad/s give hand velocity",
          r2(matvec(J, still)), "\n")


def unit_commands():
    heading("22. Robot: Gauss-Jordan solves for every unit command at once")
    b = 0.5                                      # distance between the wheels, in metres
    F = frac([[0.5, 0.5], [-1 / b, 1 / b]])      # body velocity (v, w) from wheel speeds (left, right)
    show(F, "F (wheels -> body)")
    Finv, _ = gauss_jordan(F)
    show(Finv, "F^-1 (body -> wheels)")
    print("  column 1 of F^-1:", [fmt(v) for v in column(Finv, 0)], " wheel speeds for 1 m/s forward and no turn")
    print("  column 2 of F^-1:", [fmt(v) for v in column(Finv, 1)], " wheel speeds for 1 rad/s of turn and no advance")
    want = [0.6, 2.0]
    print("  any command is a mix of those columns: (v, w) =", want, "-> wheels",
          r2(matvec([[float(v) for v in row] for row in Finv], want)), "m/s\n")


def flattening_family():
    heading("23. Lab 3.6: sliding column 2 onto the line of column 1")
    x = [3, -1]
    print("  A(t) = [1  -2+5t; 2  1+5t].  At t = 1 it is the lecture's singular matrix [1 3; 2 6].")
    for t in (0.0, 0.5, 0.9, 0.98, 1.0):
        M = [[1, -2 + 5 * t], [2, 1 + 5 * t]]
        c1, c2 = column(M, 0), column(M, 1)
        cosang = max(-1.0, min(1.0, dot(c1, c2) / (norm(c1) * norm(c2))))
        Mi = inverse(M)
        biggest = "no inverse" if Mi is None else f"largest entry of inverse {max(abs(v) for r in Mi for v in r):.1f}"
        print(f"  t = {t:4.2f}   angle between columns {math.degrees(math.acos(cosang)):5.1f} deg"
              f"   A x = {r2(matvec(M, x))}   {biggest}")
    print()


if __name__ == "__main__":
    way_1_entries()
    size_rule()
    way_2_columns()
    way_3_rows()
    way_4_columns_times_rows()
    way_5_blocks()
    order_matters()
    inverses()
    singular_case()
    gauss_jordan_lecture()
    pose_as_matrix()
    t1, t2 = forward_kinematics()
    block_rule(t1, t2)
    order_on_a_rover()
    wheel_mixing()
    one_trick_controller()
    change_of_viewpoint()
    lost_information()
    unit_commands()
    flattening_family()
