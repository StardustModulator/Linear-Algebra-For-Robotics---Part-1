"""
Lecture 6 - Column Space and Nullspace, on a robot.

    python3 code/l06_column_space_nullspace.py

Covers: the subspace test, union against intersection, the column space C(A),
"A x = b is solvable exactly when b is in C(A)", dependent columns and pivot
columns, the nullspace N(A), why N(A) is always a subspace, why the solutions
of A x = b (b not zero) are not a subspace, and the two ways to describe a
subspace (build it from vectors, or cut it out with equations).
Robots: a three-link planar arm (one joint more than it needs), four range
sensors measuring a three-number state, two machines with different motion
sets, and a differential-drive rover.
"""
import math
from linalg import (frac, show, fmt, heading, matvec, matmul, transpose, column, from_columns,
                    combine, rref, rank, nullspace, in_column_space, solve, dot, norm,
                    arm_points, arm_jacobian)


# ----------------------------------------------------------------- small helpers
def tup(v, digits=3):
    """A vector on one line: (1, 2, 3)."""
    return "(" + ", ".join(fmt(x, digits) for x in v) + ")"


def dec(v, digits=2):
    """A vector of exact fractions printed as decimals: (2.3, 3.3)."""
    return tup([float(x) for x in v], digits)


def vadd(a, b):
    return [x + y for x, y in zip(a, b)]


def vscale(a, c):
    return [c * x for x in a]


def cross3(a, b):
    """Cross product in three dimensions: a vector at right angles to both a and b."""
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]


def forward_eliminate(A, b):
    """
    Forward elimination on the augmented matrix [A | b] of any shape.
    Returns the reduced rows [U | c] and the list of pivot positions.
    A row of U that is all zeros reads 0 = c_i: fine if c_i is 0, impossible otherwise.
    """
    M = [list(row) + [bi] for row, bi in zip(A, b)]
    m, n = len(A), len(A[0])
    pivots, r = [], 0
    for c in range(n):
        if r == m:
            break
        p = next((i for i in range(r, m) if abs(M[i][c]) > 1e-9), None)
        if p is None:
            continue
        M[r], M[p] = M[p], M[r]
        for i in range(r + 1, m):
            l = M[i][c] / M[r][c]
            M[i] = [a - l * k for a, k in zip(M[i], M[r])]
        pivots.append((r, c))
        r += 1
    return M, pivots


def one_solution(A, b):
    """One solution of A x = b with every free variable set to 0, or None if there is none."""
    n = len(A[0])
    R, piv = rref([list(row) + [bi] for row, bi in zip(A, b)])
    if n in piv:                      # a pivot in the b column means a row 0 = non-zero
        return None
    x = [0] * n
    for i, p in enumerate(piv):
        x[p] = R[i][n]
    return x


def intersection(S, T):
    """
    Vectors that lie in both span(S) and span(T), S and T being lists of vectors.
    A vector is in both when  S c = T d,  that is  [S  -T] (c, d) = 0:  a nullspace.
    """
    M = from_columns(S + [vscale(t, -1) for t in T])
    return [combine(S, z[:len(S)]) for z in nullspace(M)]


A = frac([[1, 1, 2],
          [2, 1, 3],
          [3, 1, 4],
          [4, 1, 5]])


# ----------------------------------------------------------------- 1
def subspace_test():
    heading("1. What makes a subspace: every combination c v + d w stays inside")
    print("P = the plane of all (x, y, 0).   L = the line of all multiples of (1, 1, 1).")
    v, v2 = frac([2, -1, 0]), frac([-1, 3, 0])
    print(f"In P:  3*{tup(v)} + (-2)*{tup(v2)} = {tup(vadd(vscale(v, 3), vscale(v2, -2)))}"
          "   third entry still 0, still in P")
    w = frac([1, 1, 1])
    print(f"In L:  3*{tup(w)} + (-5)*{tup(w)} = {tup(vadd(vscale(w, 3), vscale(w, -5)))}"
          "   still a multiple of (1, 1, 1), still in L")
    print("Both contain the zero vector (take c = d = 0). Both are subspaces of R^3.\n")


# ----------------------------------------------------------------- 2
def union_and_intersection():
    heading("2. Union is not a subspace, intersection is")
    v, w = frac([2, -1, 0]), frac([1, 1, 1])
    s = vadd(v, w)
    in_P = s[2] == 0
    in_L = s[0] == s[1] == s[2]
    print(f"v = {tup(v)} is in P.   w = {tup(w)} is in L.   Both are in the union P u L.")
    print(f"v + w = {tup(s)}   in P? {in_P}   in L? {in_L}")
    print("The sum has left the union, so P u L is not closed under addition: not a subspace.\n")

    P = [frac([1, 0, 0]), frac([0, 1, 0])]
    both = intersection(P, [w])
    print("Vectors in both P and L (line sticking out of the plane):",
          "only the zero vector" if not both else ", ".join(tup(x) for x in both))
    tilted = frac([1, 1, 0])
    both = intersection(P, [tilted])
    print("Tilt L into the plane, L = multiples of (1, 1, 0). Vectors in both:",
          "all multiples of", ", ".join(tup(x) for x in both))
    print("Either way the intersection is a subspace: {0} in the first case, the whole line in the second.\n")


# ----------------------------------------------------------------- 3
def column_space():
    heading("3. The lecture's matrix and its column space")
    show(A, "A")
    c1, c2, c3 = column(A, 0), column(A, 1), column(A, 2)
    print("columns:", tup(c1), tup(c2), tup(c3))
    print("Each column has 4 entries, so C(A) is a subspace of R^4.")
    print("column 1 + column 2 =", tup(vadd(c1, c2)), "  equals column 3?", vadd(c1, c2) == c3)
    R, piv = rref(A)
    show(R, "R")
    print("pivot columns:", [p + 1 for p in piv], "  number of independent columns (rank):", len(piv))
    print("So C(A) is all combinations of columns 1 and 2: a 2-dimensional plane through the origin of R^4.\n")


# ----------------------------------------------------------------- 4
def which_b():
    heading("4. Which right-hand sides b can be reached?")
    print("4 equations, 3 unknowns: three columns cannot fill four-dimensional space.")
    for b in ([1, 2, 3, 4], [1, 1, 1, 1], [2, 3, 4, 5], [0, 0, 0, 0], [1, 0, 0, 0], [1, 2, 4, 4]):
        b = frac(b)
        ok = in_column_space(A, b)
        x = one_solution(A, b)
        print(f"b = {tup(b):<14} in C(A)? {str(ok):<5}  ", "one solution x = " + tup(x) if ok else "no solution")
    print()
    print("Elimination on [A | b] for b = (1, 0, 0, 0):")
    M, piv = forward_eliminate(A, frac([1, 0, 0, 0]))
    show(M, aug=1)
    print("Rows 3 and 4 read 0 = 1 and 0 = 2. No x can satisfy them.")
    print("In general those two rows read")
    print("    0 = b1 - 2 b2 + b3     and     0 = 2 b1 - 3 b2 + b4")
    print("and b is in C(A) exactly when both right-hand sides are zero. Check with the vectors y that satisfy y.A = 0:")
    for y in nullspace(transpose(A)):
        print("    y =", tup(y), "  y . column 1, 2, 3 =", ", ".join(fmt(dot(y, column(A, j))) for j in range(3)))
    print()


# ----------------------------------------------------------------- 5
def the_nullspace():
    heading("5. The nullspace: all x with A x = 0")
    special = nullspace(A)
    print("x has 3 entries, so N(A) is a subspace of R^3 (the column space lived in R^4).")
    print("special solution from elimination:", ", ".join(tup(s) for s in special))
    n = frac([1, 1, -1])
    print(f"The lecture writes it as {tup(n)}, which is -1 times that.   A {tup(n)} = {tup(matvec(A, n))}")
    print("It says: column 1 + column 2 - column 3 = 0, the same dependency as before.")
    for c in (-2, 0, 3):
        x = vscale(n, c)
        print(f"   c = {c:2d}:  x = {tup(x):<12}  A x = {tup(matvec(A, x))}")
    v, w = vscale(n, 2), vscale(n, -5)
    print("Always a subspace:")
    print(f"   A(v + w) = {tup(matvec(A, vadd(v, w)))}   and   A v + A w = {tup(vadd(matvec(A, v), matvec(A, w)))}")
    print(f"   A(7 v)   = {tup(matvec(A, vscale(v, 7)))}   and   7 (A v)   = {tup(vscale(matvec(A, v), 7))}")
    print("N(A) is the line through the origin of R^3 in the direction (1, 1, -1).\n")


# ----------------------------------------------------------------- 6
def solutions_are_not_a_subspace():
    heading("6. The solutions of A x = b (b not zero) are not a subspace")
    b = frac([1, 2, 3, 4])
    x1, x2, zero = frac([1, 0, 0]), frac([0, -1, 1]), frac([0, 0, 0])
    print(f"b = {tup(b)}")
    print(f"A {tup(x1)} = {tup(matvec(A, x1))}      a solution")
    print(f"A {tup(x2)} = {tup(matvec(A, x2))}     another solution")
    print(f"A {tup(zero)} = {tup(matvec(A, zero))}      the zero vector is NOT a solution")
    s = vadd(x1, x2)
    print(f"sum of the two solutions {tup(s)}:  A x = {tup(matvec(A, s))} = 2b, not b")
    print("No zero vector, not closed under addition: not a subspace.\n")
    print("A look ahead (the lecture only hints at this): every solution is one particular")
    print("solution plus something from the nullspace,  x = (1, 0, 0) + c (1, 1, -1):")
    n = frac([1, 1, -1])
    for c in (-2, -1, 0, 1, 2):
        x = vadd(x1, vscale(n, c))
        print(f"   c = {c:2d}:  x = {tup(x):<12}  A x = {tup(matvec(A, x))}")
    print("A line parallel to the nullspace that misses the origin.\n")


# ----------------------------------------------------------------- 7
LENGTHS = [1.6, 1.3, 1.0]                       # link lengths in metres
POSE = [math.radians(a) for a in (70, -60, -70)]


def unit(v):
    k = norm(v)
    return [x / k for x in v]


def self_motion(J):
    """Unit nullspace vector of a 2 by 3 Jacobian: the cross product of its two rows."""
    return unit(cross3(J[0], J[1]))


def arm_column_space_and_nullspace():
    heading("7. Robot: the three-link arm, C(J) and N(J)")
    pts = arm_points(LENGTHS, POSE)
    J = arm_jacobian(LENGTHS, POSE)
    print("link lengths 1.6, 1.3, 1.0 m;  joint angles 70, -60, -70 degrees")
    print("shoulder, elbow, wrist at", ", ".join(tup(p, 3) for p in pts[:3]), "  hand at", tup(pts[3], 3))
    show(J, "J", digits=3)
    print("3 joint speeds in (rad/s), 2 hand-velocity components out (m/s):  v = J qdot")
    print("independent columns (rank):", rank(J), "  so dim C(J) = 2 and dim N(J) = 3 - 2 = 1")
    for v in ([0.2, 0.1], [-0.3, 0.0], [0.0, 0.25]):
        print(f"   wanted hand velocity {tup(v)} in C(J)? {in_column_space(J, v)}")
    special = nullspace(J)[0]
    print("nullspace by elimination (wrist speed set to 1):", tup(special, 3))
    n = self_motion(J)
    print("the same line, scaled to length 1 (cross product of the two rows of J):", tup(n, 3))
    print("J times that vector =", tup(matvec(J, n), 6), " the hand does not move")
    print("ratio check, special / unit =", tup([s / k for s, k in zip(special, n)], 3), " one number, so one line\n")
    # joint 3 adds nothing new: its column is a combination of columns 1 and 2
    c = solve([row[:2] for row in J], column(J, 2))
    print(f"column 3 = {fmt(c[0])} * column 1 + {fmt(c[1])} * column 2:",
          tup(combine([column(J, 0), column(J, 1)], c), 3), "against", tup(column(J, 2), 3))
    print("So the wrist gives the hand nothing that the shoulder and elbow could not already give.\n")


def arm_self_motion_run():
    heading("8. Robot: follow the nullspace and the hand stays put")
    q = list(POSE)
    target = arm_points(LENGTHS, q)[3]
    dt, speed, worst = 0.01, 0.5, 0.0
    print("  time    joint angles (degrees)        elbow position     hand position")
    for step in range(301):
        pts = arm_points(LENGTHS, q)
        worst = max(worst, math.dist(pts[3], target))
        if step % 100 == 0:
            print(f"  {step * dt:3.1f} s   {tup([math.degrees(a) for a in q], 1):<28}  {tup(pts[1], 3):<17}  {tup(pts[3], 3)}")
        J = arm_jacobian(LENGTHS, q)
        q = vadd(q, vscale(self_motion(J), speed * dt))            # move along N(J)
        # a first-order step drifts slightly; pull the hand back: solve (J J^T) lam = error, add J^T lam
        J = arm_jacobian(LENGTHS, q)
        err = [t - h for t, h in zip(target, arm_points(LENGTHS, q)[3])]
        lam = solve(matmul(J, transpose(J)), err)
        q = vadd(q, matvec(transpose(J), lam))
    print(f"largest distance of the hand from its target over the run: {worst:.1e} m")
    print("The joints turned through tens of degrees, the elbow travelled, and the hand stayed where it was.\n")


def arm_straight():
    heading("9. Robot: stretch the arm straight and the two subspaces change size")
    q = [math.radians(40), 0.0, 0.0]
    J = arm_jacobian(LENGTHS, q)
    show(J, "J", digits=3)
    print("independent columns (rank):", rank(J), "  dim C(J) = 1 (a line),  dim N(J) = 3 - 1 = 2 (a plane)")
    along = [math.cos(q[0]), math.sin(q[0])]
    across = [-math.sin(q[0]), math.cos(q[0])]
    print(f"every column is a multiple of {tup(across, 3)}, the direction across the arm:",
          tup([norm(column(J, j)) for j in range(3)], 2), "times it")
    print(f"   hand velocity along the arm  {tup(along, 3)} in C(J)? {in_column_space(J, along)}")
    print(f"   hand velocity across the arm {tup(across, 3)} in C(J)? {in_column_space(J, across)}")
    for s in nullspace(J):
        print("   nullspace vector", tup(s, 3), "  J times it =", tup(matvec(J, s), 6))
    print("Two independent joint-speed patterns now leave the hand still (for that instant).\n")


def arm_all_solutions():
    heading("10. Robot: all joint speeds that give one wanted hand velocity")
    J = arm_jacobian(LENGTHS, POSE)
    v = [0.2, 0.1]
    n = self_motion(J)
    # particular solution of smallest length: qdot = J^T (J J^T)^-1 v
    particular = matvec(transpose(J), solve(matmul(J, transpose(J)), v))
    print("wanted hand velocity v =", tup(v), "m/s")
    print(f"   smallest solution      {tup(particular, 3):<26} length {norm(particular):.3f} rad/s   J qdot = {tup(matvec(J, particular), 3)}")
    for c in (0.3, -0.3):
        qd = vadd(particular, vscale(n, c))
        print(f"   plus {c:+.1f} of self-motion {tup(qd, 3):<26} length {norm(qd):.3f} rad/s   J qdot = {tup(matvec(J, qd), 3)}")
    locked = solve([row[:2] for row in J], v) + [0.0]
    print(f"   wrist held still       {tup(locked, 3):<26} length {norm(locked):.3f} rad/s   J qdot = {tup(matvec(J, locked), 3)}")
    print("Same hand velocity every time. The solutions form a line parallel to N(J) that misses the origin.")
    print("smallest solution . self-motion =", fmt(dot(particular, n), 6), " (they are at right angles)\n")


# ----------------------------------------------------------------- 11
def range_sensors():
    heading("11. Robot: four range readings, three unknowns")
    print("A robot in a 6 m by 4 m room, square to the walls, has four range sensors (west, east,")
    print("south, north). Each sits an unknown distance d out from the robot's centre.")
    print("Unknowns: x, y, d.   Readings: x - d,  (6 - x) - d,  y - d,  (4 - y) - d")
    S = frac([[1, 0, -1], [-1, 0, -1], [0, 1, -1], [0, -1, -1]])
    show(S, "S")
    print("independent columns (rank):", rank(S), "  so C(S) is a 3-dimensional subspace of R^4")
    for name, r in (("consistent readings", ["2.3", "3.3", "1.3", "2.3"]),
                    ("north sensor 5 cm off", ["2.3", "3.3", "1.3", "2.35"])):
        r = frac(r)
        b = [r[0], r[1] - 6, r[2], r[3] - 4]
        ok = in_column_space(S, b)
        x = one_solution(S, b)
        print(f"{name}: readings {dec(r)} m  ->  b = {dec(b)}")
        print("   b in C(S)?", ok, "  " + ("(x, y, d) = " + dec(x) if ok else "no exact solution: the readings contradict each other"))
    y = nullspace(transpose(S))[0]
    print("The one condition b must meet:", tup(y), ". b = 0, that is, b1 + b2 = b3 + b4.")
    print("Noise pushes b out of the column space. Least squares, later in the course, finds the nearest b that is in it.\n")


# ----------------------------------------------------------------- 12
def two_machines():
    heading("12. Robot: motions two machines can make")
    table = [frac([1, 0, 0]), frac([0, 1, 0])]          # a table-top stage: slides along x and y
    wall = [frac([1, 0, 0]), frac([0, 0, 1])]           # a wall gantry: slides along x and z
    print("table stage moves in the plane spanned by", " and ".join(tup(t) for t in table))
    print("wall gantry moves in the plane spanned by", " and ".join(tup(t) for t in wall))
    both = intersection(table, wall)
    print("motions both can make (intersection): all multiples of", ", ".join(tup(x) for x in both), "  a line, a subspace")
    a, b = frac([0, 1, 0]), frac([0, 0, 1])
    s = vadd(a, b)
    print(f"a motion of the table {tup(a)} plus a motion of the gantry {tup(b)} = {tup(s)}")
    print("   can the table do it?", in_column_space(from_columns(table), s),
          "  can the gantry do it?", in_column_space(from_columns(wall), s))
    print("The union of the two motion sets is not closed under addition: not a subspace.\n")


# ----------------------------------------------------------------- 13
def rover_two_ways():
    heading("13. Robot: one subspace, described two ways (differential-drive rover)")
    r, W = 0.1, 0.5                                # wheel radius and distance between the wheels, metres
    G = [[r / 2, r / 2], [0.0, 0.0], [-r / W, r / W]]
    N = [[0.0, 1.0, 0.0]]
    print("body velocity (vx, vy, w) = G (left wheel speed, right wheel speed)")
    show(G, "G", digits=3)
    print("no sideways slip:  [0 1 0] (vx, vy, w) = 0")
    print("Built up:   C(G), all combinations of the two wheel columns.   dim =", rank(G))
    print("Cut down:   N([0 1 0]), all velocities with vy = 0.            dim =", 3 - rank(N))
    print("[0 1 0] times each wheel column:", ", ".join(fmt(matvec(N, column(G, j))[0]) for j in range(2)), "  both columns satisfy the constraint")
    print("Same dimension and one inside the other, so they are the same plane.")
    for v in ([0.3, 0.0, 0.4], [0.3, 0.1, 0.0]):
        wheels = one_solution(G, v)
        print(f"   wanted {tup(v)}:  in C(G)? {in_column_space(G, v)}   vy = 0? {abs(matvec(N, v)[0]) < 1e-12}",
              "  wheel speeds " + tup(wheels, 2) + " rad/s" if wheels else "  no wheel speeds produce it")
    print()


# ----------------------------------------------------------------- 14
def practice():
    heading("14. Practice problems (answers to P1-P10 on the page)")
    # P1: three sets in R^2
    print("P1  (a) multiples of (1, 2): 3*(1, 2) + (-4)*(2, 4) =", tup(vadd(vscale([1, 2], 3), vscale([2, 4], -4))), " still a multiple -> subspace")
    s = vadd([1, 0], [0, 1])
    print(f"    (b) x + y = 1: (1, 0) + (0, 1) = {tup(s)}, x + y = {s[0] + s[1]}; zero vector gives 0 -> not a subspace")
    print(f"    (c) x >= 0: (-1)*(1, 0) = {tup(vscale([1, 0], -1))}, x < 0 -> not a subspace")
    # P2: two planes in R^3
    S, T = [frac([0, 1, 0]), frac([0, 0, 1])], [frac([1, 0, 0]), frac([0, 0, 1])]
    print("P2  S n T = all multiples of", ", ".join(tup(x) for x in intersection(S, T)),
          "  and (0, 1, 0) + (1, 0, 0) =", tup(vadd([0, 1, 0], [1, 0, 0])), "has x and y both non-zero: in neither")
    # P3: a 3 by 2 matrix with parallel columns
    A3 = frac([[1, 2], [2, 4], [3, 6]])
    print("P3  independent columns:", rank(A3), " C(A) = multiples of", tup(column(A3, 0)),
          "  (2, 4, 6) in C(A)?", in_column_space(A3, frac([2, 4, 6])), "  (1, 2, 4) in C(A)?", in_column_space(A3, frac([1, 2, 4])))
    # P4: solvability condition
    A4 = frac([[1, 0], [0, 1], [1, 1]])
    y = nullspace(transpose(A4))[0]
    print("P4  condition:", tup(y), ". b = 0, that is b3 = b1 + b2.   b = (2, 3, 5): x =", tup(one_solution(A4, frac([2, 3, 5]))),
          "  b = (2, 3, 6) solvable?", in_column_space(A4, frac([2, 3, 6])))
    # P5: a nullspace that is a plane
    B = frac([[1, 2, 3], [2, 4, 6]])
    ns = nullspace(B)
    print("P5  N(B) is spanned by", " and ".join(tup(x) for x in ns), "  B times each:", ", ".join(tup(matvec(B, x)) for x in ns),
          "  dimension", len(ns))
    # P6: all solutions for b = column 3 of the lecture's matrix
    b = frac([2, 3, 4, 5])
    x1, x2 = frac([0, 0, 1]), frac([1, 1, 0])
    print("P6  A (0, 0, 1) =", tup(matvec(A, x1)), "  A (1, 1, 0) =", tup(matvec(A, x2)),
          "  difference", tup(vadd(x2, vscale(x1, -1))), "  A (sum) =", tup(matvec(A, vadd(x1, x2))), "= 2b")
    # P7: unit three-link arm at 0, 90, 90 degrees
    q = [0.0, math.pi / 2, math.pi / 2]
    J = [[round(v) for v in row] for row in arm_jacobian([1, 1, 1], q)]
    print("P7  hand at", tup([round(v, 6) for v in arm_points([1, 1, 1], q)[3]]), "  J =", J, "  rank", rank(J))
    n = [1, -1, 1]
    print("    J (1, -1, 1) =", tup(matvec(J, n)), "  special solution from elimination:", tup(nullspace(frac(J))[0]))
    # P8: the same arm stretched straight
    Js = [[round(v) for v in row] for row in arm_jacobian([1, 1, 1], [0.0, 0.0, 0.0])]
    print("P8  J =", Js, "  rank", rank(Js), "  (1, 0) in C(J)?", in_column_space(Js, [1, 0]), "  (0, 1) in C(J)?", in_column_space(Js, [0, 1]))
    print("    N(J) is spanned by", " and ".join(tup(x) for x in nullspace(frac(Js))), "  dim C(J) + dim N(J) =", rank(Js), "+", 3 - rank(Js))
    # P9: all joint speeds for one hand velocity, arm of P7
    v = frac([1, 0])
    Jf = frac(J)
    locked = one_solution(Jf, v)
    still = vadd(locked, n)
    short = matvec(transpose(Jf), solve(matmul(Jf, transpose(Jf)), v))
    print("P9  wrist still:", tup(locked), "  shoulder still:", tup(still), "  shortest:", tup(short),
          " length", fmt(norm([float(c) for c in short])))
    print("    J times each:", tup(matvec(Jf, locked)), tup(matvec(Jf, still)), tup(matvec(Jf, short)))
    # P10: rail cart with three sensors
    S10 = frac([[1, 1], [-1, 1], [1, 0]])
    y = nullspace(transpose(S10))[0]
    for r in ([5, 7, 4], [5, 7, 5]):
        b = frac([r[0], r[1] - 10, r[2]])
        x = one_solution(S10, b)
        print(f"P10 readings {tup(r)}: b = {tup(b)}  check {tup(y)} . b = {fmt(dot(y, b))}  ->",
              "(x, d) = " + tup(x) if x else "no exact solution, the readings disagree")
    print()


if __name__ == "__main__":
    subspace_test()
    union_and_intersection()
    column_space()
    which_b()
    the_nullspace()
    solutions_are_not_a_subspace()
    arm_column_space_and_nullspace()
    arm_self_motion_run()
    arm_straight()
    arm_all_solutions()
    range_sensors()
    two_machines()
    rover_two_ways()
    practice()
