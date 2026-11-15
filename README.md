# SolSurvivor

A mission trainer for kids aged 7 to 12, made for **NASA Space Apps 2026**
("Build a Junior Astronaut Mission Trainer").

You run a small outpost on **Mars** (Jezero Crater) or at the **Moon's south pole**.
Every sol you share out a little power between air, food, a storm shelter,
science and the radio to Earth, then watch the sol play out at your 3D base.
Solar storms, dust storms, expeditions and photos all come from real NASA missions,
and the game always says what is real and what is made up.

## What's in it

- **Real trade-offs.** There is never enough power. Every meter shows a live preview
  of where it will be at the end of the sol, and End sol turns red if a plan would end the mission.
- **Real NASA data.** Storms from 2024, 2017, 2003 and 1972 (Curiosity RAD, MAVEN, LRO),
  MOXIE, Veggie, Opportunity's dust storm, InSight's dusty panels, Perseverance's route,
  Ingenuity, LCROSS ice, Artemis II. 15 NASA photos with their NASA IDs.
- **Live data.** This week's solar flares (NASA DONKI, or NOAA GOES when DONKI is down)
  and today's Earth–Mars radio delay, computed from NASA JPL orbit elements.
- **A 3D base** that reacts to the plan, a time-lapse of every sol (Mars sunsets are blue),
  and an opening shot from orbit on real NASA globes.
- **Two worlds, two levels** (Cadet 7–9, Commander 10+), a guided first sol, crew messages,
  10 badges, a science journal, a mission chart and a certificate.
- **For classrooms.** Class mission codes (`MARS-4821`: the whole class meets the same storms),
  a teachers page with a teacher's key, a 20-minute lesson and printable mission logs,
  team play for 2 to 4 kids on one computer, and discussion prompts after each class mission.
- **For everyone.** English and Arabic (right to left), read-aloud, high contrast, keyboard play,
  zero WCAG A/AA violations (axe), a simple view for weak school laptops, works offline,
  no sign-in, no names, no tracking.

## Run it

```sh
npm install
npm run dev        # http://localhost:5190
npm test           # engine, balance, codes, orbits, translations
npm run balance    # win rate and stars for six ways of playing
npx playwright test   # browser tests (uses installed Chrome)
npm run build      # static site in dist/, works on any static host
```

Useful URL options: `lang=ar`, `world=moon`, `level=commander`, `seed=1004`,
`3d=0|1`, `intro=0|1`, `live=0`, `fast=1`.

## How it works

- `src/sim/` is a small deterministic engine. A mission's events are fixed by its
  seed when it starts, so a plan never changes what happens, a class can share a
  code, and any mission can be replayed exactly.
- `src/content/` holds the two worlds, strategies for balance checks, badges, crew
  lines, team roles and the teachers page, in English and Arabic.
- `src/scene/` is the React Three Fiber base, time-lapse and opening shot, loaded
  only when the device can draw 3D smoothly.
- No backend. Progress stays in the browser.

See [CREDITS.md](CREDITS.md) for every NASA source, and [docs/](docs/) for the
submission draft, hosting steps and the playtest kit.

## Use of AI

The team used Claude Code (Anthropic) as a coding assistant to write and test the code,
draft the Arabic text and build the demo video recorder. The idea and design are the team's;
the team checked every NASA fact and source. The game has no AI-generated images, voices or
video: all photos and globes come from NASA (and one map from ESA), and the music is made by code.
