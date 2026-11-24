# Lecture 1 · The Geometry of Linear Equations

> **The thesis in one sentence:** a system of linear equations can be read across, as constraints that must all agree, or down, as building blocks that must add up to a goal, and a robot needs both readings.

| | |
|---|---|
| Lecture | MIT 18.06 Linear Algebra, Lecture 1, Prof. Gilbert Strang (39:49) |
| Watch | [Lecture 1 on MIT OpenCourseWare](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/resources/lecture-1-the-geometry-of-linear-equations/) |
| Summary and problems | [18.06SC session page](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/ax-b-and-the-four-subspaces/the-geometry-of-linear-equations/) · [lecture summary PDF](https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/resources/mit18_06scf11_ses1-1sum/) |
| Textbook | Strang, *Introduction to Linear Algebra*, sections 1.1 to 2.1 |
| Interactive page | [`01-geometry-of-linear-equations.html`](../01-geometry-of-linear-equations.html), Labs 1.1 to 1.7 |
| Code | [`code/l01_geometry.py`](../code/l01_geometry.py) |

---

## 1. What this lecture is really about

The course opens with the most ordinary problem in applied mathematics: *n* linear equations in *n* unknowns. Strang does not start by solving it. He starts by asking how to **look** at it, and gives three views of the same system:

1. the **row picture**, one equation at a time;
2. the **column picture**, one unknown at a time;
3. the **matrix form**, `A x = b`, which holds both.

He then asks the question that the next several lectures answer: *can I solve `A x = b` for every right-hand side `b`?* The lecture contains no algorithm. Elimination arrives in Lecture 2. Lecture 1 is entirely about meaning, which makes it the right place to start an article.

---

## 2. The ideas, from scratch

### 2.1 Linear equations, unknowns, coefficients

A **linear equation** combines unknown numbers using only two operations: multiply an unknown by a fixed number, and add. `2x − y = 0` is linear. Anything containing `x²`, `x·y`, `sin x` or `1/x` is not.

- **Unknowns:** the numbers we want (`x`, `y`, `z`).
- **Coefficients:** the fixed numbers that multiply the unknowns.
- **Right-hand side:** the number after the equals sign.
- **Solution:** values of the unknowns that make *every* equation true at once.

The lecture's running example:

```
 2x −  y = 0
 −x + 2y = 3          solution: x = 1, y = 2
```

Check: `2(1) − 2 = 0` and `−1 + 2(2) = 3`.

### 2.2 The row picture

Take one equation at a time. In two unknowns, the points satisfying one linear equation form a **straight line**. Two equations give two lines. The solution is the point lying on both: **the intersection**.

- `2x − y = 0` passes through (0, 0) and (1, 2).
- `−x + 2y = 3` passes through (−3, 0) and (1, 2).
- They cross at (1, 2).

Two lines in a plane can do exactly three things:

| Geometry | Algebra | Name |
|---|---|---|
| Cross at one point | exactly one solution | non-singular (the good case) |
| Parallel, never meet | no solution | singular |
| The same line | infinitely many solutions | singular |

In three unknowns each equation is a **plane**. Two planes meet in a line, and a third plane meets that line in a point. Strang admits on camera that this is hard to draw, which is his argument for the next picture.

### 2.3 The column picture

Regroup the same equations by unknown instead of by equation:

```
   [ 2 ]       [ −1 ]     [ 0 ]
 x [   ]  +  y [    ]  =  [   ]
   [−1 ]       [  2 ]     [ 3 ]
```

Each stack is a **vector**, an arrow from the origin. The left side is a **linear combination** of the two columns: stretch each by a number, then add head to tail. The question changes from "where do the lines meet?" to:

> *How much of column 1 and how much of column 2 do I need to produce `b`?*

One of (2, −1) plus two of (−1, 2) is (2 − 2, −1 + 4) = (0, 3). Same answer, `x = 1`, `y = 2`, from a different picture.

Strang calls the linear combination the fundamental operation of the whole subject. If your article has room for only one definition, use this one.

### 2.4 The matrix form `A x = b`

Pack the coefficients into a matrix `A`, the unknowns into a vector `x` and the right-hand sides into a vector `b`:

```
     [  2  −1 ] [ x ]   [ 0 ]
     [ −1   2 ] [ y ] = [ 3 ]
          A       x   =   b
```

The **rows** of `A` are the equations (row picture). The **columns** of `A` are the vectors being combined (column picture).

### 2.5 Multiplying a matrix by a vector, two ways

Lecture example: `A = [2 5; 1 3]`, `x = (1, 2)`.

- **By columns (preferred):** `A x = 1·(2, 1) + 2·(5, 3) = (12, 7)`. *`A x` is a combination of the columns of `A`.*
- **By rows:** first entry `(2, 5)·(1, 2) = 12`, second entry `(1, 3)·(1, 2) = 7`. Each entry is a **dot product** of a row with `x`.

Both always agree. The column way is the one that builds intuition.

### 2.6 The 3 by 3 example

```
 2x −  y       =  0
 −x + 2y −  z  = −1
     −3y + 4z  =  4
```

Column picture: `x(2, −1, 0) + y(−1, 2, −3) + z(0, −1, 4) = (0, −1, 4)`.

The right-hand side **is** the third column, so the answer is visible without any algebra: `x = 0, y = 0, z = 1`. Change `b` to (1, 1, −3), which is column 1 plus column 2, and the answer becomes (1, 1, 0). This is a good trick to show readers: sometimes the column picture hands you the solution for free.

### 2.7 The big question: can we solve `A x = b` for every `b`?

Two phrasings of one question:

- *Algebra:* is `A x = b` solvable for every right-hand side?
- *Geometry:* do the linear combinations of the columns **fill the whole space**?

For the 3 by 3 matrix above the answer is **yes**: the three columns point in three independent directions. The matrix is **non-singular** (also called **invertible**).

The answer is **no** when one column lies in the plane of the other two. Then all combinations stay in that plane, and any `b` outside it is unreachable. That is a **singular** matrix. The same question in nine dimensions is identical in kind: do nine columns give nine independent directions?

---

## 3. The robotics connection

The one sentence to remember: **sensors write the rows, motors own the columns.**

### 3.1 Rows are measurements: triangulation (Lab 1.2)

A robot measures the compass bearing `φ` to a beacon at a known position `(p, q)`. One bearing does not locate the robot. It places the robot **on a line** through the beacon:

```
 (sin φ) x − (cos φ) y = (sin φ) p − (cos φ) q
```

That is a linear equation in the unknown position `(x, y)`. Two beacons give two lines, and the robot is at the crossing. This is the row picture with nothing added.

Worked numbers (from `code/l01_geometry.py`): robot truly at (0.8, −1.3), beacons at (−3.4, 2.1) and (3.3, 1.7).

```
     [ 0.629   0.777 ] [ x ]   [ −0.507 ]
     [ 0.768  −0.640 ] [ y ] = [  1.447 ]        →  (x, y) = (0.8, −1.3)
```

**The singular case in the field.** If the robot stands on the straight line through both beacons, both bearings describe that same line. Two equations, one fact, no fix.

**The near-singular case, which matters more in practice.** With one degree of bearing error:

| Geometry | Crossing angle | Position error |
|---|---|---|
| Lines cross almost at right angles | 89° | 0.09 m |
| Lines cross at a thin angle | 10° | 0.66 m |

Same sensor, same error, seven times worse result. A nearly singular system is **ill-conditioned**: it has a solution, but the solution cannot be trusted. This is why navigation systems care about the geometry of their landmarks (GPS receivers report it as "dilution of precision").

### 3.2 Columns are actuators: the two-link arm (Lab 1.4)

Turn only the shoulder of a two-joint arm and the hand moves in one direction. Turn only the elbow and it moves in another. Stack those two hand-velocity vectors side by side and you have the arm's **Jacobian** `J`. For joint speeds `q̇₁`, `q̇₂` the hand velocity is

```
 v = q̇₁ · (column 1) + q̇₂ · (column 2) = J q̇
```

Controlling the hand means solving `J q̇ = v` for the joint speeds: *how much of each column produces the velocity I want?*

A geometric fact worth stating: column *i* is the vector from joint *i* to the hand, rotated by 90°. A joint can only swing the hand **sideways** around itself.

Worked numbers: link lengths 2.2 and 1.7, shoulder at 58°, wanted hand velocity (0.9, 0.45).

| Elbow angle | Column 1 | Column 2 | Joint speeds needed |
|---|---|---|---|
| −72° (well bent) | (−1.45, 2.82) | (0.41, 1.65) | (−0.37, 0.90) rad/s |
| −10° (nearly straight) | (−3.13, 2.30) | (−1.26, 1.14) | (−2.45, 5.36) rad/s |
| 0° (straight) | (−3.31, 2.07) | (−1.44, 0.90) | no solution |

At 0° the two columns are parallel (one is 2.3 times the other). The arm is at a **singularity**: it cannot move its hand along its own length, and near that pose the joint speeds blow up.

### 3.3 Three unknowns: thrust allocation (Lab 1.7)

A planar underwater vehicle needs three things: forward force `Fx`, side force `Fy` and turning torque `τ`. It has three thrusters. One newton from a thruster mounted at `(x, y)` and pointing along angle `a` contributes the column

```
 [ cos a,  sin a,  x·sin a − y·cos a ]  =  [Fx, Fy, τ]
```

The pilot asks for `b = (Fx, Fy, τ)`. The computer solves `B f = b` for the three thrusts. Marine robotics calls this **thrust allocation**.

```
 Good layout:                           All three aimed through the centre:
     [  1     1     0   ]                   [ 1   0   0.86 ]
 B = [  0     0     1   ]               B = [ 0   1   0.51 ]
     [ −0.5   0.5   0.6 ]                   [ 0   0   0    ]

 b = (1, 0, 1)  →  f = (−0.5, 1.5, 0)   b = (1, 0, 1)  →  no solution
```

In the second layout no thruster has a lever arm, so every column has zero torque. The three columns lie in the plane `τ = 0`. That is exactly Strang's singular case, where the columns fail to fill three-dimensional space, and its physical meaning is plain: **the vehicle cannot turn**, whatever the software commands.

### 3.4 "Solvable for every b" is a design requirement

Read by an engineer, the lecture's closing question becomes:

- for **actuators**: can my motors, between them, produce every motion I need? (full actuation, controllability)
- for **sensors**: do my measurements pin down every quantity I need? (observability)

A singular matrix means a missing direction. No controller can supply it. Only changing the hardware, or leaving the singular configuration, can.

---

## 4. Concept-to-robot table

| Lecture idea | Plain words | In a robot |
|---|---|---|
| Linear equation | A fact mixing unknowns by scaling and adding only | One sensor reading, or one force balance |
| Row picture | Each equation is a line or plane; the solution is where all meet | Triangulation: each measurement narrows where the robot can be |
| Column picture | Combine the columns to reach `b` | Each actuator contributes one column |
| Linear combination | Stretch vectors and add them | The net effect of several motors running together |
| Matrix `A` | Table of coefficients | The robot's geometry |
| `A x` | The combination of columns that `x` asks for | Forward problem: commands in, motion out |
| Solve `A x = b` | Find the combination that gives `b` | Inverse problem: wanted motion in, commands out |
| Singular | Columns do not fill the space | Singularity: a motion that cannot be made, or a state that cannot be sensed |
| Nearly singular | Lines cross at a thin angle | Ill-conditioning: noise is amplified, joint speeds spike |

---

## 5. Common mistakes and misconceptions

- **"The row picture and the column picture are two different problems."** They are the same numbers read in two directions. Show them side by side early.
- **"Singular means there is no solution."** Not always. Singular means *not exactly one*: there may be none, or infinitely many. Which one depends on `b`.
- **"If a solution exists, the job is done."** In robotics a solution that swings wildly under small noise is not usable. Near-singular is a practical failure before singular is a mathematical one.
- **"Vectors are just lists of numbers."** For this lecture a vector is an arrow you can stretch and add. The list is how you write the arrow down.
- **Mixing up `A x` by rows and by columns.** Both are correct. Readers who learned only "row times column" usually have not seen that `A x` is a combination of columns, and that single idea is what makes the Jacobian readable.
- **Calling the Jacobian's columns "joint velocities".** The columns are *hand* velocities, one per joint. The joint velocities are the unknowns that multiply them.

---

## 6. Analogies and sentences you can use

- **Rows as witnesses.** Each equation is a witness saying "the answer is somewhere on my line." With enough independent witnesses, one point remains.
- **Columns as ingredients.** The columns are ingredients, `x` is the recipe, `b` is the dish. Solving `A x = b` is working out the recipe from the dish.
- **Columns as joysticks.** Each motor is a joystick that moves the robot along one fixed arrow. The unknowns are how far to push each joystick.
- **Singular as two witnesses with the same story.** A second witness who repeats the first adds nothing.
- A sentence for the article: *"Sensors write the rows, motors own the columns, and a singular matrix is a robot that has run out of directions."*
- Another: *"The row picture asks where my facts agree. The column picture asks whether my building blocks can make what I want."*

---

## 7. Figures worth including

| Figure | How to capture it |
|---|---|
| Row picture of the lecture example | Lab 1.1, "Lecture example": two lines crossing at (1, 2) |
| The three cases of two lines | Lab 1.1 three times: Lecture example, Parallel, Same line |
| Column picture of the same example | Lab 1.3 after "Show the answer": one red arrow, two blue arrows, landing on `b` |
| Good fix against fragile fix | Lab 1.2 with sensor error at 2°: robot placed for a wide crossing, then for a thin one |
| Arm with its two columns | Lab 1.4 in the default pose: red and blue steps adding up to the amber velocity |
| Singularity | Lab 1.4 with the elbow at 0°: the dashed column lines coincide |
| Columns that fail to fill space | Lab 1.7, "All aimed at the centre", turning effort not zero: `b` leaves the plane |

---

## 8. Check questions

1. **What does one linear equation in two unknowns look like, and what is the solution of two of them?** A line; the solution is the crossing point.
2. **Write `2x − y = 0`, `−x + 2y = 3` in the column picture.** `x(2, −1) + y(−1, 2) = (0, 3)`, solved by `x = 1`, `y = 2`.
3. **Find `x` without algebra when `b` equals the second column of `A`.** A 1 in the second position, zeros elsewhere.
4. **Why can a straight two-link arm not move its hand outward?** Both Jacobian columns are perpendicular to the arm, so they are parallel, and every combination of them is perpendicular to the arm too.
5. **Three thrusters all push through the centre of mass. Which row of the matrix shows the problem?** The torque row is all zeros, so no combination produces torque.
6. **Two bearing lines cross at 5°. Why distrust the fix?** A small bearing error moves the crossing a long way. The system is ill-conditioned.

---

## 9. Go deeper

- Strang, *Introduction to Linear Algebra*, chapter 1 and section 2.1: vectors, linear combinations and the two pictures.
- Lynch and Park, *Modern Robotics*, chapter 5 (velocity kinematics): the Jacobian, its columns and singularities, in full generality.
- Fossen, *Handbook of Marine Craft Hydrodynamics and Motion Control*, the chapter on control allocation: the thruster matrix used on real vessels.
- Siegwart, Nourbakhsh and Scaramuzza, *Introduction to Autonomous Mobile Robots*, the localization chapter: triangulation and why landmark geometry matters.
- 3Blue1Brown, *Essence of Linear Algebra*, chapters 1 to 3: animated intuition for vectors, combinations and span.

*Lecture content follows MIT OpenCourseWare 18.06 (Gilbert Strang), licensed CC BY-NC-SA 4.0. The robotics examples, numbers and wording in this note are original to this project.*
