# Game design

Numbers live in `src/content/mars/index.ts` and `src/content/moon/index.ts`.
`npm run balance` prints the table below; `src/sim/engine.test.ts` fails the build
if a change breaks its shape.

## One sol

1. **Morning.** A crew member says what matters most today: a storm warning (only if the
   radio was on yesterday), low air or food, dust on the panels, a harvest, a finished expedition.
2. **Plan.** Share out the power between five actions, and start an expedition, a helicopter
   flight or a build. Every meter shows a live preview of where it will be at the end of the sol,
   from what the player can know (no surprise events). End sol turns red if the plan would end the mission.
3. **Time-lapse** (3D view). The Sun crosses the sky, every change pops up over what caused it,
   the sunset turns blue on Mars, and a solar storm lights up the night.
4. **Report.** What happened and why, with the real NASA event behind it and any new photo.

## Levels

| | Cadet (7–9) | Commander (10+) |
|---|---|---|
| Sols | 10 | 12 |
| ⚡ per sol | 8 | 7 |
| Event chance | 45% | 50% (Moon 45%) |
| Stars (science earned) | 14 / 26 / 38 | 16 / 28 / 40 |

## Meters

| Meter | Start | Every sol | Lose when |
|---|---|---|---|
| 🫁 Air | 6/10 | −2 | 0 |
| 🥔 Food | 6/10 | −1 | 0 |
| ☢️ Radiation | 0/10 | +0.25 Cadet, +0.3 Commander (Moon +0.3 / +0.3) | 10 |
| 🔬 Science | 0 | — | spent on upgrades; stars count all science earned |

## Actions (per tap)

| Action | ⚡ | Effect |
|---|---|---|
| 🫧 Oxygen maker | 1 | +1 air |
| 🌱 Greenhouse lights | 1 | +1.5 food two sols later |
| 🛡️ Storm shelter | 2 | −0.2 radiation, and blocks about 2 of a storm's dose |
| 🔬 Lab work | 2 | +1 science |
| 📡 Talk to Earth | 1 | +0.5 science, and storm warnings arrive a sol early |

## Balance (1000 missions per way of playing)

| Way of playing | Mars Cadet | Mars Commander | Moon Cadet | Moon Commander |
|---|---|---|---|---|
| careful | 100%, 2.9★ | 100%, 2.9★ | 100%, 2.9★ | 99%, 2.9★ |
| no expeditions | 100%, 1.2★ | 100%, 1.0★ | 100%, 1.2★ | 98%, 1.0★ |
| never shelter | 59% | 38% | 56% | 44% |
| never talk to Earth | 59% | 38% | 56% | 44% |
| greedy science | 55% | 33% | 47% | 34% |
| random taps | 38% | 9% | 31% | 7% |

New missions (free play and the teachers page) skip codes where careful play loses or
no solar storm hits (`src/content/goodMission.ts`). A typed code is always played as it is.

## Honesty rules

- Meters are game points, and the game is sped up. Real numbers are in the event and action texts.
- Every event says whether it is real (with its NASA source and year) or made up for the game.
- Live data is labelled live, with its source. It is shown, never mixed into the rules, so a
  class mission is the same for everyone.
