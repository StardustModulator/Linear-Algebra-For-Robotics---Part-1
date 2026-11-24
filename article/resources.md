# Sources and further reading

> Where every lecture lives online, which textbook sections go with it, and which robotics books take each idea further. Links were checked when this kit was built. Book references name chapters only where they are certain.

## 1. The lectures themselves

The lectures are from **MIT 18.06 Linear Algebra**, taught by Prof. Gilbert Strang. The videos were recorded in Fall 1999 and are published by MIT OpenCourseWare in two forms:

- **[18.06 Linear Algebra, Spring 2010](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/)**: the course site with the [video lecture gallery](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/video_galleries/video-lectures/).
- **[18.06SC Linear Algebra, Fall 2011](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/)**: the self-study version. Each session has the same lecture video plus a written **lecture summary**, a recitation video and problems with solutions. The first seven lectures are the first seven sessions of Unit I, "Ax = b and the Four Subspaces".

| # | Lecture | Video page | Session page (summary, problems) | Lecture summary |
|---|---|---|---|---|
| 1 | The Geometry of Linear Equations | [video](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-1-the-geometry-of-linear-equations/) | [session](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/the-geometry-of-linear-equations/) | [summary](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/resources/mit18_06scf11_ses1-1sum/) |
| 2 | Elimination with Matrices | [video](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-2-elimination-with-matrices/) | [session](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/elimination-with-matrices/) | [summary](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/resources/mit18_06scf11_ses1-2sum/) |
| 3 | Multiplication and Inverse Matrices | [video](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-3-multiplication-and-inverse-matrices/) | [session](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/multiplication-and-inverse-matrices/) | [summary](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/resources/mit18_06scf11_ses1-3sum/) |
| 4 | Factorization into A = LU | [video](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-4-factorization-into-a-lu/) | [session](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/factorization-into-a-lu/) | [summary](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/resources/mit18_06scf11_ses1-4sum/) |
| 5 | Transposes, Permutations, Spaces Rⁿ | [video](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-5-transposes-permutations-spaces-r-n/) | [session](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/transposes-permutations-vector-spaces/) | [summary](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/resources/mit18_06scf11_ses1-5sum/) |
| 6 | Column Space and Nullspace | [video](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-6-column-space-and-nullspace/) | [session](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/column-space-and-nullspace/) | [summary](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/resources/mit18_06scf11_ses1-6sum/) |
| 7 | Solving Ax = 0: Pivot Variables, Special Solutions | [video](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-7-solving-ax-0-pivot-variables-special-solutions/) | [session](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/solving-ax-0-pivot-variables-special-solutions/) | [summary](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/resources/mit18_06scf11_ses1-7sum/) |

If a video link ever moves, the session page in the next column carries the same video.

**Licence.** MIT OpenCourseWare publishes this material under Creative Commons BY-NC-SA. See [Start here](README.md) for how to cite it.

## 2. The textbook

**Gilbert Strang, *Introduction to Linear Algebra*, Wellesley-Cambridge Press.** The course follows this book. The [book's home page](https://math.mit.edu/linearalgebra) links to each edition's site, with sample sections and solutions. Section numbers below are those used by the 18.06SC reading assignments (4th and 5th editions).

| Lecture | Sections | What they cover |
|---|---|---|
| 1 | 1.1 to 2.1 | Vectors, linear combinations, the row and column pictures |
| 2 | 2.2 to 2.3 | The idea of elimination; elimination using matrices |
| 3 | 2.4 to 2.5 | Rules for matrix operations; inverse matrices |
| 4 | 2.6 | Elimination = factorization: `A = LU` |
| 5 | 2.7, 3.1 | Transposes and permutations; spaces of vectors |
| 6 | 3.1 to 3.2 | Column space; the nullspace of `A` |
| 7 | 3.2 | Solving `A x = 0`: pivot variables, special solutions, `R` |

## 3. Robotics books that pick up each idea

These are standard texts. Chapter numbers are given only for *Modern Robotics*, whose chapter list is well known; for the others, look up the named topic in the contents.

**Kevin M. Lynch and Frank C. Park, *Modern Robotics: Mechanics, Planning, and Control*, Cambridge University Press, 2017.** A free preprint and video lectures are on the [book's site](https://hades.mech.northwestern.edu/index.php/Modern_Robotics). The best single companion to this project.

| Topic in this project | Where in *Modern Robotics* |
|---|---|
| Rotation matrices, homogeneous transforms, composing and inverting poses (Lecture 3) | Chapter 3, Rigid-Body Motions |
| Forward kinematics as a product of transforms (Lecture 3) | Chapter 4, Forward Kinematics |
| The Jacobian, its columns, singularities, `τ = JᵀF`, manipulability (Lectures 1, 5, 6) | Chapter 5, Velocity Kinematics and Statics |
| Solving for joint motion; redundancy (Lectures 6, 7) | Chapter 6, Inverse Kinematics |
| Trajectories through via points (Lecture 4) | Chapter 9, Trajectory Generation |
| Omnidirectional and differential-drive robots, odometry (Lectures 2, 5) | Chapter 13, Wheeled Mobile Robots |

Other texts, by topic:

- **Bruno Siciliano, Lorenzo Sciavicco, Luigi Villani and Giuseppe Oriolo, *Robotics: Modelling, Planning and Control*, Springer.** Differential kinematics, statics, and a thorough treatment of redundancy and nullspace motion.
- **John J. Craig, *Introduction to Robotics: Mechanics and Control*, Pearson.** A gentle first treatment of transforms, Jacobians and static forces.
- **Mark W. Spong, Seth Hutchinson and M. Vidyasagar, *Robot Modeling and Control*, Wiley.** Kinematic chains and velocity kinematics with many worked arms.
- **Richard M. Murray, Zexiang Li and S. Shankar Sastry, *A Mathematical Introduction to Robotic Manipulation*, CRC Press.** The rigorous version, including grasping, where nullspaces appear as internal forces.
- **Roland Siegwart, Illah R. Nourbakhsh and Davide Scaramuzza, *Introduction to Autonomous Mobile Robots*, MIT Press.** Wheel kinematics, the constraints that create velocity subspaces, and localization by triangulation.
- **Sebastian Thrun, Wolfram Burgard and Dieter Fox, *Probabilistic Robotics*, MIT Press.** Odometry and localization when the measurements are noisy, which is where ill-conditioning starts to matter.
- **Thor I. Fossen, *Handbook of Marine Craft Hydrodynamics and Motion Control*, Wiley.** Control allocation: the thruster matrix, over-actuation and what to do with the nullspace.
- **Peter Corke, *Robotics, Vision and Control*, Springer.** The same ideas with runnable code throughout.

## 4. Linear algebra, other angles

- **Stephen Boyd and Lieven Vandenberghe, *Introduction to Applied Linear Algebra: Vectors, Matrices, and Least Squares*, Cambridge University Press.** Free on the [authors' site](https://web.stanford.edu/~boyd/vmls/). Application-first, very readable.
- **3Blue1Brown, *Essence of Linear Algebra*.** A short animated series, on the [3Blue1Brown site](https://www.3blue1brown.com/). Excellent for the geometric intuition behind columns, combinations and span.
- **Lloyd N. Trefethen and David Bau, *Numerical Linear Algebra*, SIAM.** Why pivoting is needed, what conditioning means, and how much elimination really costs.
- **Gene H. Golub and Charles F. Van Loan, *Matrix Computations*, Johns Hopkins University Press.** The reference for how solvers are built.

## 5. What comes next in the course

The article stops at Lecture 7. The next lectures complete the picture and are natural follow-ups:

| Lecture | Topic | Why a roboticist wants it |
|---|---|---|
| 8 | Solving `A x = b`: complete solution, rank and solvability | Every way to perform a task: one particular solution plus the nullspace |
| 9 | Independence, basis and dimension | A minimal set of directions; counting degrees of freedom properly |
| 10 | The four fundamental subspaces | Row space and left nullspace: which forces a mechanism resists by structure alone |
| 14 to 16 | Orthogonality, projections, least squares | Fitting noisy sensor data; the pseudo-inverse used in redundant control |
| 21 onward | Eigenvalues | Stability of controllers, vibration modes, principal axes |

## 6. In this repository

| Where | What |
|---|---|
| `index.html` and `01-…html` to `07-…html` | The interactive pages |
| `article/` | These notes, in Markdown |
| `kit/` | The same notes as web pages (generated) |
| `code/` | Python scripts, one per lecture, plus `linalg.py` |
| `assets/js/la.js` | The same algorithms in JavaScript, recording every step |
| `assets/icons/` | The icon set as SVG files |
| `tests/la.test.js` | Checks of the maths engine against the lecture examples |
