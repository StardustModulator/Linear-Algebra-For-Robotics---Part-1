"""
linalg.py - linear algebra from scratch, in plain Python.

No NumPy, no imports beyond the standard library. A matrix is a list of rows,
a vector is a list of numbers. Entries may be ints, floats or Fractions; use
frac(A) to switch a matrix to exact fractions so that 1/3 prints as 1/3.

Each routine follows the method taught in MIT 18.06 (Strang), lectures 1-7:

    matmul, matvec, transpose          lectures 1, 3, 5
    eliminate, back_substitute, solve  lecture 2
    inverse (Gauss-Jordan)             lecture 3
    lu, lu_solve                       lectures 4, 5  (PA = LU)
    rref, rank, nullspace              lectures 6, 7

Run any lecture script in this folder to see them used on a robot.
"""
from fractions import Fraction
import math

EPS = 1e-10


# ----------------------------------------------------------------- basics
def frac(A):
    """Copy of a matrix or vector with every entry as an exact Fraction."""
    if A and isinstance(A[0], (list, tuple)):
        return [[Fraction(x).limit_denominator(10**6) for x in row] for row in A]
    return [Fraction(x).limit_denominator(10**6) for x in A]


def copy(A):
    return [list(row) for row in A]


def zeros(m, n):
    return [[0] * n for _ in range(m)]


def identity(n):
    return [[1 if i == j else 0 for j in range(n)] for i in range(n)]


def shape(A):
    return len(A), len(A[0])


def transpose(A):
    return [[A[i][j] for i in range(len(A))] for j in range(len(A[0]))]


def column(A, j):
    return [row[j] for row in A]


def from_columns(cols):
    return transpose(cols)


def matvec(A, x):
    """A times x. Each entry is a row of A dotted with x (the row way)."""
    return [sum(a * xi for a, xi in zip(row, x)) for row in A]


def combine(cols, weights):
    """Linear combination of column vectors (the column way of A times x)."""
    out = [0] * len(cols[0])
    for col, w in zip(cols, weights):
        out = [o + w * c for o, c in zip(out, col)]
    return out


def matmul(A, B):
    """C = AB, entry by entry: c_ij = (row i of A) . (column j of B)."""
    m, p, n = len(A), len(B), len(B[0])
    assert len(A[0]) == p, "columns of A must match rows of B"
    return [[sum(A[i][k] * B[k][j] for k in range(p)) for j in range(n)] for i in range(m)]


def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def norm(a):
    return math.sqrt(dot(a, a))


def is_zero(x):
    return abs(x) < EPS


def close(A, B, tol=1e-8):
    return all(abs(a - b) < tol for ra, rb in zip(A, B) for a, b in zip(ra, rb))


# ----------------------------------------------------------------- printing
def fmt(x, digits=3):
    """Format one number: exact for ints and Fractions, rounded for floats."""
    if isinstance(x, Fraction):
        return str(x.numerator) if x.denominator == 1 else f"{x.numerator}/{x.denominator}"
    if isinstance(x, int):
        return str(x)
    if abs(x) < 5 * 10 ** (-digits - 1):
        return "0"
    s = f"{x:.{digits}f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def show(A, name=None, aug=0, digits=3):
    """Print a matrix (or vector) with brackets. aug = number of augmented columns."""
    rows = A if isinstance(A[0], (list, tuple)) else [[x] for x in A]
    cells = [[fmt(x, digits) for x in row] for row in rows]
    width = max(len(c) for row in cells for c in row)
    n = len(cells[0])
    pad = " " * (len(name) + 3) if name else ""
    for i, row in enumerate(cells):
        parts = []
        for j, c in enumerate(row):
            if aug and j == n - aug:
                parts.append("|")
            parts.append(c.rjust(width))
        lead = f"{name} = " if (name and i == len(cells) // 2) else pad
        print(f"{lead}[ {' '.join(parts)} ]")
    print()


# ----------------------------------------------------------------- lecture 2
def eliminate(A, b=None, verbose=False, partial_pivoting=False):
    """
    Gaussian elimination on a square system. Returns a dict with
        U, c          the upper triangular system U x = c
        pivots        the pivots, in order
        L             the multipliers, stored as a lower triangular matrix
        perm          row order after exchanges (perm[i] = original row now in row i)
        exchanges     how many row exchanges were needed
        singular      True if a pivot position could not be filled
    Rows are exchanged only when a pivot is zero (as in the lecture), unless
    partial_pivoting=True, which always brings up the largest entry (as software does).
    """
    A = copy(A)
    n = len(A)
    b = list(b) if b is not None else None
    L = identity(n)
    perm = list(range(n))
    pivots, exchanges = [], 0

    for k in range(n):
        p = k
        if partial_pivoting:
            p = max(range(k, n), key=lambda r: abs(A[r][k]))
        elif is_zero(A[k][k]):
            below = [r for r in range(k + 1, n) if not is_zero(A[r][k])]
            p = below[0] if below else k
        if is_zero(A[p][k]):
            if verbose:
                print(f"  no pivot available in column {k + 1}: the matrix is singular\n")
            return dict(U=A, c=b, pivots=pivots, L=L, perm=perm, exchanges=exchanges, singular=True)
        if p != k:
            A[k], A[p] = A[p], A[k]
            perm[k], perm[p] = perm[p], perm[k]
            if b is not None:
                b[k], b[p] = b[p], b[k]
            for j in range(k):
                L[k][j], L[p][j] = L[p][j], L[k][j]
            exchanges += 1
            if verbose:
                print(f"  exchange rows {k + 1} and {p + 1}")
        pivots.append(A[k][k])
        for i in range(k + 1, n):
            l = A[i][k] / A[k][k]
            L[i][k] = l
            if is_zero(l):
                continue
            for j in range(k, n):
                A[i][j] = A[i][j] - l * A[k][j]
            if b is not None:
                b[i] = b[i] - l * b[k]
            if verbose:
                print(f"  row {i + 1}  <-  row {i + 1} - ({fmt(l)}) * row {k + 1}")
    return dict(U=A, c=b, pivots=pivots, L=L, perm=perm, exchanges=exchanges, singular=False)


def back_substitute(U, c):
    """Solve U x = c for upper triangular U, from the last equation upward."""
    n = len(U)
    x = [0] * n
    for i in range(n - 1, -1, -1):
        s = c[i] - sum(U[i][j] * x[j] for j in range(i + 1, n))
        x[i] = s / U[i][i]
    return x


def forward_substitute(L, b):
    """Solve L y = b for lower triangular L, from the first equation downward."""
    n = len(L)
    y = [0] * n
    for i in range(n):
        s = b[i] - sum(L[i][j] * y[j] for j in range(i))
        y[i] = s / L[i][i]
    return y


def solve(A, b):
    """Solve A x = b by elimination and back substitution. None if singular."""
    r = eliminate(A, b, partial_pivoting=not isinstance(A[0][0], Fraction))
    return None if r["singular"] else back_substitute(r["U"], r["c"])


def det(A):
    """Determinant = product of the pivots, with a sign flip per row exchange."""
    r = eliminate(A, partial_pivoting=not isinstance(A[0][0], Fraction))
    if r["singular"]:
        return 0
    d = -1 if r["exchanges"] % 2 else 1
    for p in r["pivots"]:
        d = d * p
    return d


# ----------------------------------------------------------------- lecture 3
def inverse(A, verbose=False):
    """Gauss-Jordan: row-reduce [A I] until it reads [I A^-1]. None if singular."""
    n = len(A)
    W = [list(row) + identity(n)[i] for i, row in enumerate(A)]
    for k in range(n):
        p = next((r for r in range(k, n) if not is_zero(W[r][k])), None)
        if p is None:
            return None
        W[k], W[p] = W[p], W[k]
        for i in range(n):
            if i != k and not is_zero(W[i][k]):
                l = W[i][k] / W[k][k]
                W[i] = [a - l * bk for a, bk in zip(W[i], W[k])]
        if verbose:
            show(W, aug=n)
    for k in range(n):
        d = W[k][k]
        W[k] = [a / d for a in W[k]]
    return [row[n:] for row in W]


# ----------------------------------------------------------------- lectures 4-5
def lu(A, partial_pivoting=False):
    """
    Factor PA = LU. Returns (P, L, U, perm). With no row exchanges P is the identity
    and this is the plain A = LU of lecture 4. Returns None if A is singular.
    """
    r = eliminate(A, partial_pivoting=partial_pivoting)
    if r["singular"]:
        return None
    n = len(A)
    P = [[1 if r["perm"][i] == j else 0 for j in range(n)] for i in range(n)]
    return P, r["L"], r["U"], r["perm"]


def lu_solve(factors, b):
    """Solve A x = b from stored factors: L y = P b, then U x = y. Cost about n^2."""
    P, L, U, perm = factors
    pb = [b[p] for p in perm]
    return back_substitute(U, forward_substitute(L, pb))


def ldu(A):
    """A = L D U with ones on both diagonals of L and U. No row exchanges."""
    P, L, U, perm = lu(A)
    n = len(A)
    D = [[U[i][i] if i == j else 0 for j in range(n)] for i in range(n)]
    U1 = [[U[i][j] / U[i][i] for j in range(n)] for i in range(n)]
    return L, D, U1


def permutation_matrix(perm):
    n = len(perm)
    return [[1 if perm[i] == j else 0 for j in range(n)] for i in range(n)]


# ----------------------------------------------------------------- lectures 6-7
def rref(A, tol=1e-9):
    """
    Reduced row echelon form of any m by n matrix.
    Returns (R, pivot_columns). Rank = len(pivot_columns).
    """
    A = copy(A)
    m, n = shape(A)
    pivot_cols, r = [], 0
    for c in range(n):
        if r == m:
            break
        p = next((i for i in range(r, m) if abs(A[i][c]) > tol), None)
        if p is None:
            continue                      # no pivot here: column c is a free column
        A[r], A[p] = A[p], A[r]
        piv = A[r][c]
        A[r] = [a / piv for a in A[r]]
        for i in range(m):
            if i != r and abs(A[i][c]) > tol:
                l = A[i][c]
                A[i] = [a - l * b for a, b in zip(A[i], A[r])]
        pivot_cols.append(c)
        r += 1
    A = [[0 if (not isinstance(a, Fraction) and abs(a) < tol) else a for a in row] for row in A]
    return A, pivot_cols


def rank(A):
    return len(rref(A)[1])


def nullspace(A):
    """
    Special solutions of A x = 0: one for each free column.
    Set that free variable to 1, the other free variables to 0, and read the
    pivot variables off the reduced matrix R (they are minus the free column).
    """
    R, pivot_cols = rref(A)
    n = len(A[0])
    free_cols = [j for j in range(n) if j not in pivot_cols]
    basis = []
    for f in free_cols:
        x = [0] * n
        x[f] = 1
        for i, p in enumerate(pivot_cols):
            x[p] = -R[i][f]
        basis.append(x)
    return basis


def in_column_space(A, b):
    """A x = b is solvable exactly when b adds no new direction to the columns."""
    Ab = [list(row) + [bi] for row, bi in zip(A, b)]
    return rank(Ab) == rank(A)


# ----------------------------------------------------------------- robot helpers
def rot2(theta):
    c, s = math.cos(theta), math.sin(theta)
    return [[c, -s], [s, c]]


def hom2(theta, x, y):
    """Planar homogeneous transform: rotate by theta, then translate by (x, y)."""
    c, s = math.cos(theta), math.sin(theta)
    return [[c, -s, x], [s, c, y], [0, 0, 1]]


def arm_points(lengths, angles):
    """Joint positions of a planar arm. angles are relative joint angles in radians."""
    x = y = a = 0.0
    pts = [(x, y)]
    for L, q in zip(lengths, angles):
        a += q
        x, y = x + L * math.cos(a), y + L * math.sin(a)
        pts.append((x, y))
    return pts


def arm_jacobian(lengths, angles):
    """2 by n Jacobian: column i is the hand velocity when only joint i turns at 1 rad/s."""
    pts = arm_points(lengths, angles)
    tx, ty = pts[-1]
    n = len(lengths)
    return [[-(ty - pts[i][1]) for i in range(n)], [tx - pts[i][0] for i in range(n)]]


def heading(title):
    print("\n" + title)
    print("-" * len(title))
