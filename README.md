# Linear Algebra for Robotics · Part 1

The first seven lectures of **MIT 18.06 Linear Algebra** (Prof. Gilbert Strang), rebuilt as hands-on robotics labs, together with a writer's kit for an article on linear algebra in robotics.

Every concept in each lecture is explained from scratch, worked with the lecture's own numbers, made interactive, and then tied to a robot that runs on the same mathematics.

| # | Lecture | The robot | Page |
|---|---|---|---|
| 01 | The Geometry of Linear Equations | Beacon triangulation, a two-link arm, a three-thruster vehicle | [`01-geometry-of-linear-equations.html`](01-geometry-of-linear-equations.html) |
| 02 | Elimination with Matrices | Omni-wheel odometry | [`02-elimination-with-matrices.html`](02-elimination-with-matrices.html) |
| 03 | Multiplication and Inverse Matrices | Transform chains and frames | [`03-multiplication-and-inverse-matrices.html`](03-multiplication-and-inverse-matrices.html) |
| 04 | Factorization into A = LU | Real-time control loops, trajectories through waypoints | [`04-factorization-into-a-lu.html`](04-factorization-into-a-lu.html) |
| 05 | Transposes, Permutations, Spaces Rⁿ | Force and motion duality, a rover's velocity subspace | [`05-transposes-permutations-spaces.html`](05-transposes-permutations-spaces.html) |
| 06 | Column Space and Nullspace | A redundant three-link arm | [`06-column-space-and-nullspace.html`](06-column-space-and-nullspace.html) |
| 07 | Solving Ax = 0: Pivot Variables, Special Solutions | A four-joint arm and a four-thruster vehicle | [`07-solving-ax-equals-0.html`](07-solving-ax-equals-0.html) |

## Open it

There is nothing to install and nothing to build.

- **On your computer:** download the repository and open `index.html` in a browser.
- **As a website:** turn on GitHub Pages for this branch (repository Settings → Pages) and visit the address it gives you.

The pages are plain HTML, CSS and JavaScript with no libraries. The only thing fetched from the network is the typefaces, and the pages still work without them.

## What is here

```
index.html                      home page
01-…html  to  07-…html          one interactive page per lecture
assets/css/mit.css              the design system (cardinal red, black, white, chalkboard labs)
assets/js/la.js                 linear algebra from scratch; every algorithm records its steps
assets/js/plot.js               2-D and 3-D drawing on canvas, with draggable handles
assets/js/robots.js             planar arm, omni robot, rover, thruster vehicle
assets/js/icons.js              the custom black-and-white icon set
assets/js/lectures/l1.js …      the labs for each lecture
assets/icons/*.svg              every icon as its own file
article/                        the article kit, in Markdown (start with article/README.md)
kit/                            the same kit as readable web pages (generated)
code/                           one Python script per lecture + linalg.py, standard library only
tests/la.test.js                checks the maths engine against the lecture examples
tools/build.js                  regenerates kit/ and assets/icons/
```

## For writing the article

Start at [`article/README.md`](article/README.md). It gives the storyline across the seven lectures, a section-by-section outline, fixed notation, an accuracy checklist and how to cite the lectures. Then:

- [`article/01-…md`](article/01-geometry-of-linear-equations.md) to `07-…md`: in-depth notes per lecture (ideas from scratch, the lecture's numbers, worked robot examples, common mistakes, analogies, figure suggestions, check questions, further reading).
- [`article/concept-map.md`](article/concept-map.md): every concept, its robot meaning and the lab that shows it.
- [`article/glossary.md`](article/glossary.md): every term in plain words.
- [`article/resources.md`](article/resources.md): the OCW lectures and summaries, textbook sections and robotics books.

## Run the code

```
python3 code/l01_geometry.py     # any lecture: prints the lecture examples and the robot examples
node tests/la.test.js            # checks la.js against Strang's worked examples
node tools/build.js              # rebuilds kit/ and assets/icons/ after editing notes or icons
```

## Design

The look takes its cues from the lecture hall: white pages on a strict grid, black chalkboard panels for every lab, and one cardinal red accent. Colour has a fixed meaning throughout: red and blue for the first and second vector or row, amber for targets and results, green for a third series, and a red circle for a pivot. Icons are drawn for this project in black and white; there is no emoji. Pages follow the reader's light or dark setting and work on a phone.

## Credits and licence

- The lectures are by Prof. Gilbert Strang, published by [MIT OpenCourseWare](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/) under Creative Commons BY-NC-SA. Examples described as "the lecture's example" use his numbers.
- This is an independent study companion. It is not affiliated with or endorsed by MIT.
- The explanations, robot examples, code and icons in this repository are original to this project. Code is released under the licence in [`LICENSE`](LICENSE).
