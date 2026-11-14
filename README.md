# SolSurvivor

A mission trainer for kids aged 7 to 12, made for NASA Space Apps 2026
("Build a Junior Astronaut Mission Trainer"). You run a small outpost on Mars:
share out the power each sol between air, food, a storm shelter, science and the
radio to Earth, and keep your crew safe until the mission ends. Storms, dust and
discoveries come from real NASA missions.

## Run it

```sh
npm install
npm run dev      # http://localhost:5190
npm test         # engine and balance tests
npm run balance  # win rate and stars for different ways of playing
```

## How it works

- `src/sim/` is a small, deterministic game engine. A mission's events are fixed
  by its seed when it starts, so a plan never changes what happens and any
  mission can be replayed exactly.
- `src/content/mars/` holds the meters, actions, events and expeditions, each
  with the real NASA mission behind it.
