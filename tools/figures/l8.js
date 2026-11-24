/* Figure spec for the capstone page: the same arm, in the same pose, through each of the seven lenses. */
const lens = i => async (p, lab, h) => { await lab.locator('[data-slot="lenses"] button').nth(i).click(); await h.wait(150); };
module.exports = {
  page: 'capstone.html',
  figures: [
    { file: 'cap-01-columns', lab: 'cap-lab', part: 'main', setup: lens(0),
      caption: 'Lens 01, the column picture: each joint owns one column of J, and the wanted hand velocity (amber) is a combination of the three.' },
    { file: 'cap-02-elimination', lab: 'cap-lab', part: 'main', setup: lens(1),
      caption: 'Lens 02, elimination: [J | v] reduces to two pivots. The joint without a pivot is free, so many joint speeds do the same job.' },
    { file: 'cap-03-products', lab: 'cap-lab', part: 'main', setup: lens(2),
      caption: 'Lens 03, multiplication: the hand pose is the product of the link transforms, and its third column is the hand position.' },
    { file: 'cap-04-lu', lab: 'cap-lab', part: 'main', setup: lens(3),
      caption: 'Lens 04, LU: JJᵀ is factored once and reused for every wanted velocity, giving joint speeds with one multiplication.' },
    { file: 'cap-05-transpose', lab: 'cap-lab', part: 'main', setup: lens(4),
      caption: 'Lens 05, the transpose: a force on the hand becomes joint torques through Jᵀ.' },
    { file: 'cap-06-subspaces', lab: 'cap-lab', part: 'main', motion: true, settle: 1800,
      setup: async (p, lab, h) => { await lens(5)(p, lab, h); await h.button('Self-motion'); },
      caption: 'Lens 06, column space and nullspace: during self-motion the elbow swings (dashed path) while the hand does not move.' },
    { file: 'cap-07-rank', lab: 'cap-lab', part: 'main', setup: lens(6),
      caption: 'Lens 07, rank: two pivot joints (red), one free joint (blue), one special solution.' },
    { file: 'cap-07-rank-straight', lab: 'cap-lab', part: 'main',
      setup: async (p, lab, h) => { await lens(6)(p, lab, h); await h.slider(1, 0); await h.slider(2, 0); },
      caption: 'The straight arm through lens 07: the rank drops from 2 to 1 and a second special solution appears. Every lens reports the same event in its own words.' }
  ]
};
