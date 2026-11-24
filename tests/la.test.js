/* Checks la.js against the worked examples from 18.06 lectures 1-7.  Run: node tests/la.test.js */
const LA = require('../assets/js/la.js');
let pass = 0, fail = 0;
function ok(name, cond) { if (cond) pass++; else { fail++; console.log('FAIL  ' + name); } }
const veq = (a, b) => a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) < 1e-8);

// Lecture 1: 2x - y = 0, -x + 2y = 3  ->  (1, 2);  3 by 3 example -> (0, 0, 1)
ok('L1 2x2', veq(LA.solve([[2, -1], [-1, 2]], [0, 3]), [1, 2]));
ok('L1 3x3', veq(LA.solve([[2, -1, 0], [-1, 2, -1], [0, -3, 4]], [0, -1, 4]), [0, 0, 1]));

// Lecture 2: pivots 1, 2, 5; multipliers 3 and 2; x = (2, 1, -2)
const e2 = LA.eliminate([[1, 2, 1], [3, 8, 1], [0, 4, 1]], [2, 12, 2]);
ok('L2 pivots', veq(e2.pivots, [1, 2, 5]));
ok('L2 U', LA.equal(e2.U, [[1, 2, 1], [0, 2, -2], [0, 0, 5]]));
ok('L2 c', veq(e2.c, [2, 6, -10]));
ok('L2 x', veq(e2.x, [2, 1, -2]));
ok('L2 L', LA.equal(e2.L, [[1, 0, 0], [3, 1, 0], [0, 2, 1]]));
ok('L2 E32 E21 A = U', LA.equal(LA.mul(e2.ops[1].M, LA.mul(e2.ops[0].M, [[1, 2, 1], [3, 8, 1], [0, 4, 1]])), e2.U));
ok('L2 zero pivot needs exchange', LA.eliminate([[0, 1], [1, 1]], [1, 2]).exchanges === 1);
ok('L2 singular detected', LA.eliminate([[1, 2, 1], [3, 8, 1], [0, 4, -4]], [2, 12, 2]).singular);

// Lecture 3: Gauss-Jordan on [1 3; 2 7] -> [7 -3; -2 1]; [1 3; 2 6] is singular
ok('L3 inverse', LA.equal(LA.inv([[1, 3], [2, 7]]), [[7, -3], [-2, 1]]));
ok('L3 singular', LA.inverse([[1, 3], [2, 6]]).singular);
ok('L3 A inv(A) = I', LA.equal(LA.mul([[2, 1, 0], [1, 3, 1], [0, 1, 4]], LA.inv([[2, 1, 0], [1, 3, 1], [0, 1, 4]])), LA.identity(3)));

// Lecture 4: [2 1; 8 7] = [1 0; 4 1][2 1; 0 3], and LDU
const f4 = LA.lu([[2, 1], [8, 7]]);
ok('L4 L', LA.equal(f4.L, [[1, 0], [4, 1]]));
ok('L4 U', LA.equal(f4.U, [[2, 1], [0, 3]]));
ok('L4 D', LA.equal(f4.D, [[2, 0], [0, 3]]));
ok('L4 Uunit', LA.equal(f4.Uunit, [[1, 0.5], [0, 1]]));
ok('L4 luSolve', veq(LA.luSolve(LA.lu([[1, 2, 1], [3, 8, 1], [0, 4, 1]]), [2, 12, 2]), [2, 1, -2]));
ok('L4 six permutations', LA.permutations(3).length === 6);

// Lecture 5: PA = LU with a row exchange; P inverse = P transpose
const A5 = [[0, 1, 1], [1, 2, 1], [2, 7, 9]];
const f5 = LA.lu(A5);
ok('L5 PA = LU', LA.equal(LA.mul(f5.P, A5), LA.mul(f5.L, f5.U)));
ok('L5 P^T P = I', LA.equal(LA.mul(LA.T(f5.P), f5.P), LA.identity(3)));
const f5p = LA.lu([[1e-4, 1, 3], [2, 5, 1], [4, -1, 2]], { pivoting: 'partial' });
ok('L5 partial pivoting PA = LU', LA.equal(LA.mul(f5p.P, [[1e-4, 1, 3], [2, 5, 1], [4, -1, 2]]), LA.mul(f5p.L, f5p.U)));
const R5 = [[1, 3], [2, 3], [4, 1]];
ok('L5 R^T R symmetric', LA.equal(LA.mul(LA.T(R5), R5), LA.T(LA.mul(LA.T(R5), R5))));

// Lecture 6: A = [1 1 2; 2 1 3; 3 1 4; 4 1 5], nullspace = c (1, 1, -1)
const A6 = [[1, 1, 2], [2, 1, 3], [3, 1, 4], [4, 1, 5]];
const n6 = LA.nullspace(A6);
ok('L6 rank 2', n6.rank === 2);
ok('L6 nullspace', n6.basis.length === 1 && veq(n6.basis[0], [-1, -1, 1]));
ok('L6 b in C(A)', LA.inColumnSpace(A6, [1, 2, 3, 4]));
ok('L6 b not in C(A)', !LA.inColumnSpace(A6, [1, 0, 0, 0]));

// Lecture 7: A = [1 2 2 2; 2 4 6 8; 3 6 8 10]
const A7 = [[1, 2, 2, 2], [2, 4, 6, 8], [3, 6, 8, 10]];
const r7 = LA.rref(A7);
ok('L7 U', LA.equal(r7.U, [[1, 2, 2, 2], [0, 0, 2, 4], [0, 0, 0, 0]]));
ok('L7 R', LA.equal(r7.R, [[1, 2, 0, -2], [0, 0, 1, 2], [0, 0, 0, 0]]));
ok('L7 pivot cols', veq(r7.pivotCols, [0, 2]) && veq(r7.freeCols, [1, 3]) && r7.rank === 2);
ok('L7 F', LA.equal(r7.F, [[2, -2], [0, 2]]));
const n7 = LA.nullspace(A7);
ok('L7 special solutions', veq(n7.basis[0], [-2, 1, 0, 0]) && veq(n7.basis[1], [2, 0, -2, 1]));
ok('L7 A s = 0', n7.basis.every(s => veq(LA.mv(A7, s), [0, 0, 0])));
const n7t = LA.nullspace(LA.T(A7));
ok('L7 transpose: rank 2, one special solution (-1, -1, 1)', n7t.rank === 2 && veq(n7t.basis[0], [-1, -1, 1]));
ok('L7 transpose R', LA.equal(n7t.R, [[1, 0, 1], [0, 1, 1], [0, 0, 0], [0, 0, 0]]));

// formatting
ok('fmt', LA.fmt(0.5) === '1/2' && LA.fmt(-3) === '−3' && LA.fmt(1 / 3) === '1/3' && LA.fmt(0) === '0' && LA.num(-1.5) === '−1.5');
ok('det', Math.abs(LA.det([[2, -1], [-1, 2]]) - 3) < 1e-9 && Math.abs(LA.det([[0, 1], [1, 0]]) + 1) < 1e-9);

console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
