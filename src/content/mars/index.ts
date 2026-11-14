import type { Content } from '../../sim/types'

/**
 * Mars, Jezero Crater. One turn is one sol (a Mars day, 24 h 39 min).
 * Meters are game points and the game is sped up; real numbers live on fact cards.
 */
export const mars: Content = {
  id: 'mars',
  scienceId: 'science',
  forecastAction: 'comms',
  shelterAction: 'shelter',
  resources: [
    { id: 'air', label: 'Air', icon: '🫁', start: 6, min: 0, max: 10, perTurn: -2, critical: true, explain: 'Three crew breathe 2 points of oxygen every sol.' },
    { id: 'food', label: 'Food', icon: '🥔', start: 6, min: 0, max: 10, perTurn: -1, critical: true, explain: 'The crew eats 1 point of food every sol.' },
    { id: 'radiation', label: 'Radiation', icon: '☢️', start: 0, min: 0, max: 10, perTurn: 0.3, critical: true, invert: true, explain: 'Mars has a thin atmosphere and no global magnetic field, so space radiation reaches the ground. Keep it below 10.' },
    { id: 'science', label: 'Science', icon: '🔬', start: 0, min: 0, max: Infinity, perTurn: 0, explain: 'What you learn. Spend it on upgrades. Stars come from all the science you earn.' },
  ],
  actions: [
    { id: 'oxygen', label: 'Oxygen maker', icon: '🫧', cost: 1, maxUnits: 4, perUnit: { air: 1 }, explain: 'Splits Mars air (carbon dioxide) to make oxygen, like NASA’s MOXIE on Perseverance.' },
    { id: 'greenhouse', label: 'Greenhouse lights', icon: '🌱', cost: 1, maxUnits: 3, perUnit: {}, delayed: { turns: 2, perUnit: { food: 1.5 } }, explain: 'Plants need light and time. Food arrives 2 sols later, like lettuce grown on the space station.' },
    { id: 'shelter', label: 'Storm shelter', icon: '🛡️', cost: 2, maxUnits: 2, perUnit: { radiation: -0.2 }, explain: 'Thick walls and water tanks block radiation. Most useful on the night a solar storm hits.' },
    { id: 'lab', label: 'Lab work', icon: '🔬', cost: 2, maxUnits: 3, perUnit: { science: 1 }, explain: 'Study rocks and soil in the base lab. Slow and safe science.' },
    { id: 'comms', label: 'Talk to Earth', icon: '📡', cost: 1, maxUnits: 1, perUnit: { science: 0.5 }, explain: 'Send results home. Earth warns you about solar storms only when the radio is on.' },
  ],
  events: [
    {
      id: 'flare2024', kind: 'solar', icon: '☀️', title: 'Solar storm (May 2024)', weight: 3, forecastable: true, real: true, year: 2024,
      text: 'A huge solar storm reached Mars. Curiosity measured the biggest radiation jump it had ever seen on the ground.',
      effects: {}, storm: { dose: 4.5, shelterBlock: 2 }, source: 'NASA: Curiosity and MAVEN, May 2024',
    },
    {
      id: 'flare2017', kind: 'solar', icon: '☀️', title: 'Solar storm (September 2017)', weight: 2, forecastable: true, real: true, year: 2017,
      text: 'A solar storm lit up auroras over the whole planet and doubled the radiation on the ground.',
      effects: {}, storm: { dose: 3.5, shelterBlock: 1.8 }, source: 'NASA: MAVEN and Curiosity, September 2017',
    },
    {
      id: 'flare2003', kind: 'solar', icon: '☀️', title: 'Halloween solar storms (2003)', weight: 1, forecastable: true, real: true, year: 2003,
      text: 'Some of the strongest solar storms ever measured. Mars Odyssey’s radiation instrument was knocked out.',
      effects: {}, storm: { dose: 5, shelterBlock: 2.2 }, source: 'NASA: Mars Odyssey MARIE, October 2003',
    },
    {
      id: 'dust2018', kind: 'dust', icon: '🌪️', title: 'Planet-wide dust storm (2018)', weight: 2, forecastable: true, real: true, year: 2018,
      text: 'Dust covers the sky. Solar panels get less light for the next 3 sols. This storm ended the Opportunity rover’s mission.',
      effects: {}, power: { delta: -2, turns: 3 }, source: 'NASA: Opportunity, June 2018',
    },
    {
      id: 'dustyPanels', kind: 'bad', icon: '🟫', title: 'Dusty solar panels', weight: 2, real: true, year: 2022,
      text: 'Dust settled on the panels, like it did on the InSight lander. 1 less ⚡ for the next 2 sols.',
      effects: {}, power: { delta: -1, turns: 2 }, source: 'NASA: InSight, 2022',
    },
    {
      id: 'windClean', kind: 'good', icon: '🌬️', title: 'A gust cleans the panels', weight: 2, real: true, year: 2005,
      text: 'A lucky wind blew the dust off, like it did for the Spirit rover. 1 extra ⚡ for the next 2 sols.',
      effects: {}, power: { delta: 1, turns: 2 }, source: 'NASA: Spirit rover, 2005',
    },
    {
      id: 'moxieRecord', kind: 'good', icon: '🫧', title: 'Oxygen record', weight: 1, real: true, year: 2023,
      text: 'The oxygen maker beat its record, like MOXIE did. +1 air.',
      effects: { air: 1 }, source: 'NASA: MOXIE, 2023',
    },
    {
      id: 'lettuce', kind: 'good', icon: '🥬', title: 'Space lettuce', weight: 1, real: true, year: 2015,
      text: 'A surprise crop is ready, like the first lettuce astronauts ate in space. +1 food.',
      effects: { food: 1 }, source: 'NASA: Veggie on the ISS, 2015',
    },
    {
      id: 'blueSunset', kind: 'wonder', icon: '🌅', title: 'Blue sunset', weight: 1, real: true, year: 2015,
      text: 'On Mars, sunsets are blue! Fine dust scatters blue light forward. The crew takes a photo for the journal. +0.5 science.',
      effects: { science: 0.5 }, source: 'NASA: Curiosity, sol 956 (2015)', photo: 'blue-sunset',
    },
    {
      id: 'filter', kind: 'bad', icon: '🧯', title: 'Clogged air filter', weight: 1, real: false,
      text: 'Made up for the game: an air filter clogged with dust. −1 air.',
      effects: { air: -1 },
    },
  ],
  projects: [
    { id: 'landing', kind: 'expedition', label: 'Landing site', icon: '🚙', turns: 1, powerPerTurn: 1, reward: { science: 2 }, real: true, photo: 'landing', text: 'Drive around Octavia E. Butler Landing, where Perseverance touched down in 2021.' },
    { id: 'delta', kind: 'expedition', label: 'The river delta', icon: '🚙', turns: 2, powerPerTurn: 1, requires: ['landing'], reward: { science: 4 }, real: true, photo: 'delta', text: 'An old river dropped sand and mud here billions of years ago. A great place to look for signs of past life.' },
    { id: 'wildcat', kind: 'expedition', label: 'Wildcat Ridge', icon: '🚙', turns: 2, powerPerTurn: 1, requires: ['delta'], reward: { science: 5 }, real: true, photo: 'wildcat', text: 'Rocks made in an old lake, holding the kinds of molecules life uses.' },
    { id: 'depot', kind: 'expedition', label: 'Three Forks depot', icon: '🚙', turns: 2, powerPerTurn: 1, requires: ['delta'], reward: { science: 3 }, real: true, photo: 'depot', text: 'Leave rock samples in tubes on the ground, for a future mission to bring home.' },
    { id: 'rim', kind: 'expedition', label: 'Crater rim', icon: '🚙', turns: 3, powerPerTurn: 1, requires: ['delta'], reward: { science: 5 }, real: true, photo: 'rim', text: 'A long climb up the crater wall to some of the oldest rocks on Mars.' },
    { id: 'cheyava', kind: 'expedition', label: 'Cheyava Falls', icon: '🚙', turns: 2, powerPerTurn: 1, requires: ['wildcat'], reward: { science: 7 }, real: true, photo: 'cheyava', text: 'An arrowhead-shaped rock with “leopard spots”, possible signs of ancient life found in 2024.' },
    { id: 'testFlight', kind: 'flight', label: 'First flight', icon: '🚁', turns: 1, powerPerTurn: 2, reward: { science: 2 }, real: true, photo: 'flight', text: 'Fly a small helicopter in air 100 times thinner than Earth’s, like Ingenuity did in 2021.' },
    { id: 'seitah', kind: 'flight', label: 'Scout Séítah', icon: '🚁', turns: 1, powerPerTurn: 2, requires: ['testFlight'], reward: { science: 2 }, real: true, photo: 'seitah', text: 'Fly over sand ripples the rover cannot cross and photograph the way.' },
    { id: 'solar', kind: 'upgrade', label: 'More solar panels', icon: '🔆', turns: 2, powerPerTurn: 1, price: 5, reward: {}, forever: { power: 2 }, real: true, text: '+2 ⚡ every sol once built.' },
    { id: 'biggerGreenhouse', kind: 'upgrade', label: 'Bigger greenhouse', icon: '🏡', turns: 2, powerPerTurn: 1, price: 3, reward: {}, forever: { perTurn: { food: 0.5 } }, real: true, text: '+0.5 food every sol once built.' },
    { id: 'iceDrill', kind: 'upgrade', label: 'Ice drill', icon: '🧊', turns: 2, powerPerTurn: 1, price: 5, reward: {}, forever: { perTurn: { air: 0.75 } }, real: true, text: 'Dig up ice and split the water for oxygen: +0.75 air every sol. The Phoenix lander found ice under Mars soil in 2008.' },
    { id: 'walls', kind: 'upgrade', label: 'Soil shield walls', icon: '🧱', turns: 2, powerPerTurn: 1, price: 3, reward: {}, forever: { perTurn: { radiation: -0.15 } }, real: true, text: 'Pile Mars soil on the walls: −0.15 radiation every sol.' },
  ],
  levels: {
    cadet: { id: 'cadet', turns: 10, power: 8, eventChance: 0.45, stars: [14, 26, 38], perTurn: { radiation: 0.25 } },
    commander: { id: 'commander', turns: 12, power: 7, eventChance: 0.5, stars: [16, 28, 40] },
  },
}
