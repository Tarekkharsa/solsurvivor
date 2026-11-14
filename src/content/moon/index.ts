import type { Content } from '../../sim/types'
import { mars } from '../mars'

const action = (id: string) => mars.actions.find((a) => a.id === id)!
const resource = (id: string) => mars.resources.find((r) => r.id === id)!

/**
 * The Moon's south pole. One turn is one Earth day. Same meters and actions as
 * Mars, so every lesson carries over, but a harsher, different world: no air at
 * all, no magnetic field, long shadows, moonquakes and sticky dust.
 */
export const moon: Content = {
  id: 'moon',
  scienceId: 'science',
  forecastAction: 'comms',
  shelterAction: 'shelter',
  resources: [
    { ...resource('air'), explain: 'The Moon has no air at all. Three crew breathe 2 points of oxygen every day.' },
    resource('food'),
    { ...resource('radiation'), perTurn: 0.35, explain: 'The Moon has no air and no magnetic field, so radiation from space hits the ground. Keep it below 10.' },
    resource('science'),
  ],
  actions: [
    { ...action('oxygen'), explain: 'Bakes oxygen out of moon rock. Lunar soil is almost half oxygen, locked in minerals.' },
    { ...action('greenhouse'), explain: 'Plants grow under lamps in a sealed room. Food arrives 2 days later. In 2022, scientists grew plants in real Apollo moon soil.' },
    { ...action('shelter'), explain: 'Hide under walls of moon soil and water tanks. Solar storms are worse here: nothing in the sky blocks them.' },
    { ...action('lab'), explain: 'Study moon rocks in the base lab, like the Apollo samples still studied today.' },
    { ...action('comms'), explain: 'Earth is only 1.3 light-seconds away. Earth warns you about solar storms only when the radio is on.' },
  ],
  events: [
    {
      id: 'flare2024', kind: 'solar', icon: '☀️', title: 'Solar storm (May 2024)', weight: 3, forecastable: true, real: true, year: 2024,
      text: 'The biggest solar storm in 20 years. With no air or magnetic field, the Moon’s surface takes the full blast.',
      effects: {}, storm: { dose: 5.5, shelterBlock: 2.4 }, source: 'NASA: Space Weather, May 2024',
    },
    {
      id: 'flare1972', kind: 'solar', icon: '☀️', title: 'Solar storm (August 1972)', weight: 2, forecastable: true, real: true, year: 1972,
      text: 'A huge storm hit between Apollo 16 and Apollo 17. Astronauts on the Moon that week would have needed shelter fast.',
      effects: {}, storm: { dose: 6, shelterBlock: 2.6 }, source: 'NASA: Apollo-era solar storm, August 1972',
    },
    {
      id: 'flare2017', kind: 'solar', icon: '☀️', title: 'Solar storm (September 2017)', weight: 1, forecastable: true, real: true, year: 2017,
      text: 'A strong solar storm measured by NASA spacecraft all over the solar system, including the Lunar Reconnaissance Orbiter.',
      effects: {}, storm: { dose: 4.5, shelterBlock: 2.2 }, source: 'NASA: LRO CRaTER, September 2017',
    },
    {
      id: 'longShadow', kind: 'dust', icon: '🌑', title: 'Long shadow', weight: 2, forecastable: true, real: true, year: 2009,
      text: 'At the south pole the Sun stays low, so crater walls cast shadows for days. Panels get less light for the next 3 days.',
      effects: {}, power: { delta: -2, turns: 3 }, source: 'NASA: LRO maps of light at the lunar poles',
    },
    {
      id: 'stickyDust', kind: 'bad', icon: '🟫', title: 'Sticky moon dust', weight: 2, real: true, year: 1972,
      text: 'Moon dust is sharp and clings to everything, as Apollo 17 astronauts found. 1 less ⚡ for the next 2 days.',
      effects: {}, power: { delta: -1, turns: 2 }, source: 'NASA: Apollo 17, 1972',
    },
    {
      id: 'moonquake', kind: 'bad', icon: '〰️', title: 'Moonquake', weight: 1, real: true, year: 1973,
      text: 'The ground shakes and an air seal leaks. Apollo seismometers recorded moonquakes for 8 years. −1 air.',
      effects: { air: -1 }, source: 'NASA: Apollo seismometers, 1969–1977',
    },
    {
      id: 'micrometeorite', kind: 'bad', icon: '☄️', title: 'Micrometeorite', weight: 1, real: true, year: 2016,
      text: 'A grain of space rock hits the base. NASA’s LRO has spotted hundreds of brand-new craters. −1 air while you patch it.',
      effects: { air: -1 }, source: 'NASA: LRO new craters, 2016',
    },
    {
      id: 'brightRim', kind: 'good', icon: '🔆', title: 'Sunny crater rim', weight: 2, real: true, year: 2009,
      text: 'Some rims near the pole get sunlight almost all the time. Your panels catch it: 1 extra ⚡ for the next 2 days.',
      effects: {}, power: { delta: 1, turns: 2 }, source: 'NASA: LRO, peaks of near-constant light',
    },
    {
      id: 'iceFind', kind: 'good', icon: '🧊', title: 'Ice in the dark', weight: 1, real: true, year: 2009,
      text: 'You find ice in a crater the Sun never reaches, like NASA’s LCROSS did in 2009. Melt it and split it: +1 air.',
      effects: { air: 1 }, source: 'NASA: LCROSS, October 2009',
    },
    {
      id: 'earthrise', kind: 'wonder', icon: '🌍', title: 'Earth in the black sky', weight: 1, real: true, year: 2015,
      text: 'Earth hangs over the horizon, blue and white. The crew takes a photo for the journal. +0.5 science.',
      effects: { science: 0.5 }, source: 'NASA: Lunar Reconnaissance Orbiter, 2015', photo: 'lro-earth',
    },
  ],
  projects: [
    { id: 'landing', kind: 'expedition', label: 'Landing zone', icon: '🚙', turns: 1, powerPerTurn: 1, reward: { science: 2 }, real: true, photo: 'moon-landing', text: 'Drive around the south pole region NASA picked for Artemis landings.' },
    { id: 'malapert', kind: 'expedition', label: 'Malapert Mountain', icon: '🚙', turns: 2, powerPerTurn: 1, requires: ['landing'], reward: { science: 4 }, real: true, photo: 'malapert', text: 'A 5 km high mountain that can see Earth. Its slopes show soil slowly creeping downhill.' },
    { id: 'shackleton', kind: 'expedition', label: 'Shackleton rim', icon: '🚙', turns: 2, powerPerTurn: 1, requires: ['malapert'], reward: { science: 5 }, real: true, photo: 'moon-pole', text: 'The rim of a 21 km crater almost exactly at the south pole. Its floor has not seen sunlight in billions of years.' },
    { id: 'cabeus', kind: 'expedition', label: 'Cabeus ice crater', icon: '🚙', turns: 2, powerPerTurn: 1, requires: ['malapert'], reward: { science: 3 }, real: true, photo: 'lcross', text: 'Where NASA crashed the LCROSS rocket stage in 2009 and found water ice in the plume.' },
    { id: 'haworth', kind: 'expedition', label: 'Haworth crater', icon: '🚙', turns: 3, powerPerTurn: 1, requires: ['malapert'], reward: { science: 5 }, real: true, text: 'A long drive to a deep crater whose floor is always in shadow and may hold ice.' },
    { id: 'aitken', kind: 'expedition', label: 'Aitken basin edge', icon: '🚙', turns: 2, powerPerTurn: 1, requires: ['shackleton'], reward: { science: 7 }, real: true, photo: 'aitken', text: 'The edge of the biggest, oldest impact basin on the Moon, photographed by the Artemis II crew in 2026.' },
    { id: 'testFlight', kind: 'flight', label: 'Orbiter photo', icon: '🛰️', turns: 1, powerPerTurn: 2, reward: { science: 2 }, real: true, text: 'Ask the Lunar Reconnaissance Orbiter for a close-up of tomorrow’s route.' },
    { id: 'seitah', kind: 'flight', label: 'Orbiter ice map', icon: '🛰️', turns: 1, powerPerTurn: 2, requires: ['testFlight'], reward: { science: 2 }, real: true, text: 'Use the orbiter’s instruments to map where ice may hide in the shadows.' },
    { id: 'solar', kind: 'upgrade', label: 'Solar tower on the rim', icon: '🔆', turns: 2, powerPerTurn: 1, price: 5, reward: {}, forever: { power: 2 }, real: true, text: '+2 ⚡ every day once built. Tall panels catch the low Sun.' },
    { id: 'biggerGreenhouse', kind: 'upgrade', label: 'Bigger greenhouse', icon: '🏡', turns: 2, powerPerTurn: 1, price: 3, reward: {}, forever: { perTurn: { food: 0.5 } }, real: true, text: '+0.5 food every day once built.' },
    { id: 'iceDrill', kind: 'upgrade', label: 'Ice miner', icon: '🧊', turns: 2, powerPerTurn: 1, price: 5, reward: {}, forever: { perTurn: { air: 0.75 } }, real: true, text: 'Mine ice from a shadowed crater and split the water: +0.75 air every day.' },
    { id: 'walls', kind: 'upgrade', label: 'Moon soil walls', icon: '🧱', turns: 2, powerPerTurn: 1, price: 3, reward: {}, forever: { perTurn: { radiation: -0.15 } }, real: true, text: 'Pile moon soil over the base: −0.15 radiation every day.' },
  ],
  levels: {
    cadet: { id: 'cadet', turns: 10, power: 8, eventChance: 0.45, stars: [14, 26, 38], perTurn: { radiation: 0.3 } },
    commander: { id: 'commander', turns: 12, power: 7, eventChance: 0.45, stars: [16, 28, 40], perTurn: { radiation: 0.3 } },
  },
}
