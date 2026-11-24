# Glossary

> Every term used in the first seven lectures, in plain words, with what it means for a robot and the lecture where it first appears. The wording is deliberately simple so you can quote or adapt it.

| Term | In plain words | For a robot | Lecture |
|---|---|---|---|
| **Augmented matrix** | A matrix with the right-hand side written next to it as an extra column, so both are processed together | The robot's geometry and its latest measurements carried through the solve side by side | 2 |
| **Back-substitution** | Solving a triangular system from the last equation upward, feeding each answer into the equation above | Using the quantity that is known directly to unlock the next one | 2 |
| **Block multiplication** | Multiplying matrices that have been cut into blocks, treating the blocks like numbers | How two poses multiply: rotation blocks compose, position blocks add | 3 |
| **Coefficient** | A fixed number that multiplies an unknown | A geometric constant of the machine: a length, a lever arm, the sine of a mounting angle | 1 |
| **Column picture** | Reading `A x = b` as "which mix of the columns of `A` gives `b`?" | Each actuator owns one column; solving means choosing how hard to drive each | 1 |
| **Column space `C(A)`** | The set of all combinations of the columns of `A`; everything `A x` can equal | Everything the machine can produce: every hand velocity, every net force | 5, 6 |
| **Dependent columns** | Columns where at least one is a combination of the others | An actuator that adds no new direction | 6 |
| **Dot product** | Multiply two lists entry by entry and add | One output computed as a weighted sum of the inputs | 1 |
| **Echelon form `U`** | The staircase-shaped matrix left by elimination: each pivot sits to the right of the one above | The task directions sorted out one by one | 7 |
| **Elimination** | Subtracting multiples of one equation from others to remove an unknown from them | The standard method inside every solver a robot runs | 2 |
| **Elimination matrix `E`** | The identity matrix with one extra entry; multiplying by it performs one elimination step | One step of the procedure, stored so it can be replayed or undone | 2 |
| **Forward kinematics** | Computing where the hand is from the joint angles | A product of one transform per link | 3 |
| **Forward problem** | Given the commands `x`, compute the result `A x` | Predicting motion from motor commands | 1 |
| **Free column / free variable** | A column with no pivot; its unknown can be given any value | A spare actuator the designer or controller may use as they like | 7 |
| **Gauss-Jordan elimination** | Reducing `[A I]` until it reads `[I A⁻¹]` | Solving for every unit command at the same time | 3 |
| **Homogeneous transform** | A matrix that holds a rotation and a position together, so poses can be multiplied | The standard way robot software stores "where this part is and which way it faces" | 3 |
| **Identity matrix `I`** | Ones on the diagonal, zeros elsewhere; multiplying by it changes nothing | "Do nothing" | 2 |
| **Ill-conditioned** | Nearly singular: a solution exists but changes a lot when the data changes a little | Small sensor noise becomes large error; joint speeds spike | 1 |
| **Independent columns** | Columns none of which is a combination of the others | Actuators that each add a new direction | 6 |
| **Intersection of subspaces** | The vectors that belong to both; always a subspace | The motions two robots can both perform | 6 |
| **Inverse `A⁻¹`** | The matrix that undoes `A`: `A⁻¹A = I` | Undoing a motion, or switching viewpoint between frames | 2, 3 |
| **Inverse problem** | Given the wanted result `b`, find the commands `x` with `A x = b` | Working out motor commands for a wanted motion | 1 |
| **Invertible / non-singular** | Having an inverse; `A x = b` has exactly one solution for every `b` | A machine with full authority and no blind direction | 1, 3 |
| **Jacobian `J`** | The matrix that turns joint speeds into hand velocity; column *i* is the hand velocity when only joint *i* turns | The single most used matrix in arm control | 1 |
| **`LDU`** | `A = L D U` with ones on the diagonals of `L` and `U` and the pivots in `D` | The pivots, kept separately as the "scale" of each stage | 4 |
| **Linear combination** | Multiply vectors by numbers and add the results | The combined effect of several actuators | 1 |
| **Linear equation** | An equation in which unknowns are only scaled and added | A sensor reading or a balance of forces, written as a fact about unknowns | 1 |
| **Lower triangular `L`** | A matrix with zeros above the diagonal | The record of elimination's multipliers | 4 |
| **`LU` factorization** | Writing `A = L U`: elimination saved for reuse | Prepare once, then solve each new right-hand side cheaply | 4 |
| **Matrix** | A rectangle of numbers; here, the coefficients of a system | The machine's geometry in numerical form | 1 |
| **Multiplier** | The number of times a pivot row is subtracted from a row below it | One entry of the stored recipe `L` | 2 |
| **Nullspace `N(A)`** | The set of all `x` with `A x = 0` | Everything the actuators can do that has no effect on the task: self-motion, cancelling thrusts | 6 |
| **Nullspace matrix `N`** | A matrix whose columns are the special solutions | A ready basis of self-motions | 7 |
| **Odometry** | Estimating how far a robot has moved by adding up small measured motions | Solving the wheel equations every tick and summing the results | 2 |
| **Partial pivoting** | Exchanging rows so that the largest available entry becomes the pivot | Protecting the answer from rounding error by not dividing by small numbers | 5 |
| **Permutation matrix `P`** | The identity matrix with its rows reordered | Reordering equations or relabelling motors | 2, 4, 5 |
| **Pivot** | The entry elimination divides by at each stage; it must be non-zero | How firmly an equation determines its unknown | 2 |
| **Pivot column / pivot variable** | A column that contains a pivot; its unknown is determined by the others | An actuator whose command is forced once the free ones are chosen | 6, 7 |
| **Rank `r`** | The number of pivots | The number of independent directions a machine really commands | 7 |
| **Rank one** | A matrix that is one column times one row | A one-trick machine: every output lies along one direction | 3 |
| **Redundancy** | Having more actuators than the task needs: `n − r > 0` | Spare freedom for avoiding obstacles, sharing load or surviving a failure | 6, 7 |
| **Reduced row echelon form `R`** | Echelon form taken further: pivots equal to 1, zeros above and below them | The clearest statement of which unknowns depend on which | 7 |
| **Right-hand side `b`** | The numbers on the other side of the equals sign | What was measured, or what is wanted | 1 |
| **Row exchange** | Swapping two equations to bring a usable pivot into place | Asking a different sensor first | 2 |
| **Row picture** | Reading `A x = b` one equation at a time: lines or planes that must meet | Each measurement narrows down where the robot can be | 1 |
| **Self-motion** | A joint motion that leaves the hand where it is | A vector in the nullspace of the Jacobian | 6 |
| **Singular** | Not invertible: the columns do not fill the space, so `A x = b` has no solution or infinitely many | A missing direction of motion or sensing | 1 |
| **Singularity** | A pose at which a robot's matrix becomes singular | The straight arm; the robot in line with both beacons | 1 |
| **Special solution** | A solution of `A x = 0` with one free variable set to 1 and the rest to 0 | One basic self-motion: move one spare joint, let the others compensate | 7 |
| **Subspace** | A set of vectors that contains zero and is closed under adding and scaling | The set of all motions a (linear, unconstrained-in-size) machine can make | 5 |
| **Symmetric matrix** | A matrix equal to its transpose | Inertia and covariance matrices; anything of the form `JᵀJ` | 5 |
| **Thrust allocation** | Choosing individual thruster forces that add up to a wanted net force and torque | Solving `B f = b` for the thrust vector | 1 |
| **Transpose `Aᵀ`** | The matrix with rows and columns swapped | The route forces take: `τ = Jᵀ F` | 4, 5 |
| **Triangulation** | Finding a position from the directions to known points | The row picture: each bearing is one line | 1 |
| **Union of subspaces** | The vectors that belong to either; usually not a subspace | "What robot A or robot B can do" cannot be freely combined | 6 |
| **Unknown** | A number we are solving for | A position to estimate, or a motor command to choose | 1 |
| **Upper triangular `U`** | A matrix with zeros below the diagonal | A system ready for back-substitution | 2 |
| **Vector** | A list of numbers, pictured as an arrow from the origin | A velocity, a force, a set of joint speeds | 1 |
| **Vector space** | A set of vectors in which adding and scaling never leave the set | The space of all velocities, forces or joint speeds | 5 |
| **Zero vector** | The vector of all zeros; every subspace contains it | Standing still is always an option | 5 |

## Symbols at a glance

| Symbol | Read it as |
|---|---|
| `A x = b` | "A times x equals b": the system |
| `Aᵀ` | "A transpose" |
| `A⁻¹` | "A inverse" |
| `C(A)` | "the column space of A" |
| `N(A)` | "the nullspace of A" |
| `Rⁿ` | "R n": all vectors with n real components |
| `m × n` | "m by n": m rows, n columns |
| `q̇` | "q dot": joint speeds (the dot means rate of change) |
| `τ` | "tau": joint torques |
| `S ∩ T`, `S ∪ T` | intersection, union |
