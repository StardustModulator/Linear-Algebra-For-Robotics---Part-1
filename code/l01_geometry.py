"""
Lecture 1 - The Geometry of Linear Equations, on a robot.

    python3 code/l01_geometry.py

Covers: row picture, column picture, A x = b, A times x two ways, the 3 by 3
example, and the question "can we solve A x = b for every b?".
Robots: triangulation from two beacons, a two-link arm, a three-thruster vehicle.
"""
import math
from fractions import Fraction
from linalg import (frac, show, fmt, heading, solve, matvec, combine, column, from_columns,
                    transpose, arm_jacobian, det)


def lecture_example():
    heading("1. The lecture's 2 by 2 example")
    A = frac([[2, -1], [-1, 2]])
    b = frac([0, 3])
    show(A, "A")
    show(b, "b")
    x = solve(A, b)
    print("Row picture:    the lines 2x - y = 0 and -x + 2y = 3 cross at", tuple(fmt(v) for v in x))
    c1, c2 = column(A, 0), column(A, 1)
    print("Column picture: x*col1 + y*col2 =", [fmt(v) for v in combine([c1, c2], x)], " which is b\n")


def two_ways_to_multiply():
    heading("2. A times x, two ways")
    A, x = [[2, 5], [1, 3]], [1, 2]
    by_cols = combine([column(A, 0), column(A, 1)], x)      # 1*(2,1) + 2*(5,3)
    by_rows = matvec(A, x)                                   # (2,5).(1,2) and (1,3).(1,2)
    print("by columns:", by_cols, "   by rows:", by_rows, "\n")


def three_by_three():
    heading("3. The lecture's 3 by 3 example")
    A = frac([[2, -1, 0], [-1, 2, -1], [0, -3, 4]])
    for b in ([0, -1, 4], [1, 1, -3]):
        x = solve(A, frac(b))
        print(f"b = {b}  ->  x = {[fmt(v) for v in x]}")
    print("The first b is column 3 itself; the second is column 1 + column 2.\n")


def triangulation():
    heading("4. Robot: triangulation is the row picture")
    robot = (0.8, -1.3)                       # the truth, unknown to the robot
    beacons = [(-3.4, 2.1), (3.3, 1.7)]
    A, b = [], []
    for (p, q) in beacons:
        phi = math.atan2(q - robot[1], p - robot[0])        # the bearing the robot measures
        # the robot lies on the line through the beacon in direction phi:
        #     sin(phi) x - cos(phi) y = sin(phi) p - cos(phi) q
        A.append([math.sin(phi), -math.cos(phi)])
        b.append(math.sin(phi) * p - math.cos(phi) * q)
    show(A, "A")
    show(b, "b")
    print("computed position:", [fmt(v) for v in solve(A, b)], " true position:", robot)

    # the same fix with a 1 degree bearing error, at a wide and at a thin crossing
    eps = math.radians(1.0)
    for name, rb in (("wide crossing", (0.8, -1.3)), ("thin crossing", (0.0, 1.6))):
        true = [math.atan2(q - rb[1], p - rb[0]) for (p, q) in beacons]
        # sign the two errors so they pull the crossing point along the lines (the bad direction)
        measured = [true[0] + eps, true[1] - eps * math.cos(true[0] - true[1])]
        A = [[math.sin(phi), -math.cos(phi)] for phi in measured]
        b = [math.sin(phi) * p - math.cos(phi) * q for phi, (p, q) in zip(measured, beacons)]
        crossing = math.degrees(abs(true[0] - true[1])) % 180
        crossing = min(crossing, 180 - crossing)
        err = math.dist(solve(A, b), rb)
        print(f"{name} ({crossing:.0f} degrees): 1 degree of sensor error becomes {err:.2f} m of position error")
    print()


def arm_columns():
    heading("5. Robot: a two-link arm is the column picture")
    lengths = [2.2, 1.7]
    want = [0.9, 0.45]                         # hand velocity we ask for
    for elbow_deg in (-72, -10, 0):
        q = [math.radians(58), math.radians(elbow_deg)]
        J = arm_jacobian(lengths, q)
        qdot = solve(J, want) if abs(det(J)) > 1e-9 else None
        print(f"elbow at {elbow_deg:4d} deg   columns {[round(v, 2) for v in column(J, 0)]} and "
              f"{[round(v, 2) for v in column(J, 1)]}   joint speeds:",
              "no solution (singular)" if qdot is None else [round(v, 2) for v in qdot])
    print("As the arm straightens the columns line up and the joint speeds blow up.\n")


def thrust_allocation():
    heading("6. Robot: three thrusters, three unknowns")

    def column_of(x, y, ang):                  # one newton at (x, y) pushing along ang
        return [math.cos(ang), math.sin(ang), x * math.sin(ang) - y * math.cos(ang)]

    good = [(-1.3, 0.5, 0.0), (-1.3, -0.5, 0.0), (0.6, -0.7, math.pi / 2)]
    centre = [(-1.3, 0.0, 0.0), (0.0, -0.7, math.pi / 2), (-1.0, -0.6, math.atan2(0.6, 1.0))]
    want = [1.0, 0.0, 1.0]                     # push forward and turn
    for name, layout in (("good layout", good), ("all aimed at the centre", centre)):
        B = from_columns([column_of(*t) for t in layout])
        print(name)
        show(B, "B", digits=2)
        f = solve(B, want) if abs(det(B)) > 1e-9 else None
        print("  thrusts for (Fx, Fy, torque) =", want, ":",
              "no solution, the torque row is all zeros" if f is None else [round(v, 2) for v in f], "\n")


def practice():
    heading("7. Practice problems (answers to P1-P9 on the page)")
    print("P1/P2  x + y = 5, x - y = 1          ->", [fmt(v) for v in solve(frac([[1, 1], [1, -1]]), frac([5, 1]))])
    print("P3     [1 2; 3 4] times (2, -1)      ->", matvec([[1, 2], [3, 4]], [2, -1]),
          " by columns:", combine([[1, 3], [2, 4]], [2, -1]))
    print("P4     k = 4 makes the rows proportional: det [1 2; 2 4] =", det(frac([[1, 2], [2, 4]])))
    A = frac([[2, -1, 0], [-1, 2, -1], [0, -3, 4]])
    for b in ([2, -1, 0], [-1, 1, 1], [4, -1, -4]):
        print(f"P5     b = {b}".ljust(38), "->", [fmt(v) for v in solve(A, frac(b))])
    # P6: beacon A (4, 6) at 45 degrees gives x - y = -2; beacon B (7, 1) at 0 degrees gives y = 1
    robot = solve(frac([[1, -1], [0, 1]]), frac([-2, 1]))
    print("P6     robot position                ->", [fmt(v) for v in robot])
    bearings = [math.degrees(math.atan2(q - float(robot[1]), p - float(robot[0]))) for p, q in ((4, 6), (7, 1))]
    print("       check: bearings from there    ->", [round(v, 6) for v in bearings])
    J = arm_jacobian([1, 1], [0, math.pi / 2])
    print("P7     J =", [[round(v, 6) for v in row] for row in J],
          " joint speeds for (0, 1):", [round(v, 6) for v in solve(J, [0, 1])])
    Jstraight = arm_jacobian([1, 1], [0, 0])
    print("       straight arm columns:", [round(v, 6) for v in column(Jstraight, 0)], [round(v, 6) for v in column(Jstraight, 1)])
    B = frac([[1, 1, 0], [0, 0, 1], [-1, 1, 0]])
    print("P8     thrusts for (2, 1, 1)          ->", [fmt(v) for v in solve(B, frac([2, 1, 1]))], " det B =", fmt(det(B)))
    for rhs in ("2.01", "2.02"):
        x = solve([[Fraction(1), Fraction(1)], [Fraction(1), Fraction("1.01")]], [Fraction(2), Fraction(rhs)])
        print(f"P9     second right-hand side {rhs}   ->", [fmt(v) for v in x])
    print()


if __name__ == "__main__":
    lecture_example()
    two_ways_to_multiply()
    three_by_three()
    triangulation()
    arm_columns()
    thrust_allocation()
    practice()
