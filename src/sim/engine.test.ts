import { describe, expect, it } from 'vitest'
import { mars } from '../content/mars'
import { moon } from '../content/moon'
import { strategies } from '../content/strategies'
import { measure } from '../content/balance'
import { createGame, planCost, playTurn, PlanError, powerFor, previewTurn, projectStatus, replay, scheduleFor, stars } from './engine'
import type { Game, Plan } from './types'

const plan = (units: Plan['units'], start?: string): Plan => ({ units, start })
const seedWith = (pred: (s: (string | null)[]) => boolean) => {
  for (let seed = 1; seed < 5000; seed++) if (pred(scheduleFor(mars, mars.levels.cadet, seed))) return seed
  throw new Error('no seed')
}

describe('engine', () => {
  it('starts every meter at its start value with full power', () => {
    const g = createGame(mars, 'cadet', 1)
    expect(g.resources).toEqual({ air: 6, food: 6, radiation: 0, science: 0 })
    expect(powerFor(g, mars)).toBe(8)
    expect(powerFor(createGame(mars, 'commander', 1), mars)).toBe(7)
  })

  it('applies everyday needs and actions', () => {
    const g = playTurn(createGame(mars, 'cadet', 1), mars, plan({ oxygen: 2, lab: 1 })).game
    expect(g.resources.air).toBe(6)
    expect(g.resources.food).toBe(5)
    expect(g.resources.radiation).toBe(0.25)
    expect(g.resources.science).toBe(1)
    expect(g.turn).toBe(2)
  })

  it('grows food two turns later', () => {
    let g = createGame(mars, 'cadet', seedWith((s) => !s[2] && !s[3]))
    g = playTurn(g, mars, plan({ greenhouse: 2, oxygen: 2 })).game
    expect(g.resources.food).toBe(5)
    g = playTurn(g, mars, plan({ oxygen: 2 })).game
    expect(g.resources.food).toBe(4)
    g = playTurn(g, mars, plan({ oxygen: 2 })).game
    expect(g.resources.food).toBe(6)
  })

  it('refuses plans that cost too much power', () => {
    expect(() => playTurn(createGame(mars, 'cadet', 1), mars, plan({ lab: 3, shelter: 2 }))).toThrow(PlanError)
  })

  it('fixes events at the start: plans never change the schedule', () => {
    const a = replay(mars, 'cadet', 42, Array(10).fill(plan({ oxygen: 2, greenhouse: 1, comms: 1 })))
    const b = replay(mars, 'cadet', 42, Array(10).fill(plan({ oxygen: 2, shelter: 1 })))
    expect(a.schedule).toEqual(b.schedule)
  })

  it('replays the same mission exactly', () => {
    const plans = Array(12).fill(plan({ oxygen: 2, greenhouse: 1, comms: 1 }))
    expect(replay(mars, 'commander', 7, plans)).toEqual(replay(mars, 'commander', 7, plans))
  })

  it('warns about a storm only when the radio was on the turn before', () => {
    const seed = seedWith((s) => s[3] === 'flare2024')
    let g = createGame(mars, 'cadet', seed)
    g = playTurn(g, mars, plan({ oxygen: 2, comms: 1 })).game
    expect(g.warned).toBe(false)
    const deaf = playTurn(g, mars, plan({ oxygen: 2 })).game
    expect(deaf.warned).toBe(false)
    const heard = playTurn(g, mars, plan({ oxygen: 2, comms: 1 })).game
    expect(heard.warned).toBe(true)
  })

  it('shelter blocks most of a solar storm', () => {
    const seed = seedWith((s) => s[2] === 'flare2024')
    const g = playTurn(createGame(mars, 'cadet', seed), mars, plan({ oxygen: 2, comms: 1 })).game
    const open = playTurn(g, mars, plan({ oxygen: 2 })).game
    const safe = playTurn(g, mars, plan({ oxygen: 2, shelter: 2 })).game
    expect(open.resources.radiation).toBeCloseTo(0.25 + 0.25 + 4.5)
    expect(safe.resources.radiation).toBeCloseTo(0.25 + 0.25 + 0.5 - 0.4)
  })

  it('the preview only shows events Earth warned about', () => {
    const seed = seedWith((s) => s[2] === 'flare2024')
    const g = playTurn(createGame(mars, 'cadet', seed), mars, plan({ oxygen: 2 })).game
    expect(previewTurn(g, mars, plan({ oxygen: 2 })).record.event).toBeUndefined()
    const told = playTurn(createGame(mars, 'cadet', seed), mars, plan({ oxygen: 2, comms: 1 })).game
    expect(previewTurn(told, mars, plan({ oxygen: 2 })).record.event).toBe('flare2024')
  })

  it('loses when air runs out', () => {
    let g: Game = createGame(mars, 'cadet', seedWith((s) => s.slice(0, 5).every((e) => !e)))
    for (let i = 0; i < 3; i++) g = playTurn(g, mars, plan({})).game
    expect(g.status).toBe('lost')
    expect(g.lostOn).toBe('air')
    expect(stars(g, mars)).toBe(0)
  })

  it('runs expeditions over several turns and pays power each turn', () => {
    let g = createGame(mars, 'cadet', 3)
    g = playTurn(g, mars, plan({ oxygen: 2 }, 'landing')).game
    expect(g.done).toContain('landing')
    expect(g.resources.science).toBe(2)
    g = playTurn(g, mars, plan({ oxygen: 2 }, 'delta')).game
    expect(g.active).toEqual([{ id: 'delta', left: 1 }])
    expect(planCost(plan({}), g, mars)).toBe(1)
    expect(projectStatus(mars.projects.find((p) => p.id === 'rim')!, g, mars)).toBe('locked')
    expect(projectStatus(mars.projects.find((p) => p.id === 'testFlight')!, g, mars)).toBe('ready')
    g = playTurn(g, mars, plan({ oxygen: 2 })).game
    expect(projectStatus(mars.projects.find((p) => p.id === 'rim')!, g, mars)).toBe('ready')
    g = playTurn(g, mars, plan({ oxygen: 2 }, 'rim')).game
    expect(projectStatus(mars.projects.find((p) => p.id === 'wildcat')!, g, mars)).toBe('busy')
  })

  it('upgrades cost science and pay off every turn after', () => {
    let g = createGame(mars, 'cadet', seedWith((s) => s.slice(0, 7).every((e) => !e)))
    for (let i = 0; i < 2; i++) g = playTurn(g, mars, plan({ oxygen: 2, lab: 3 })).game
    expect(g.resources.science).toBe(6)
    g = playTurn(g, mars, plan({ oxygen: 2 }, 'solar')).game
    expect(g.resources.science).toBe(1)
    g = playTurn(g, mars, plan({ oxygen: 2 })).game
    expect(powerFor(g, mars)).toBe(10)
    expect(g.earned).toBe(6)
  })
})

describe('balance', () => {
  for (const world of [mars, moon])
    for (const level of ['cadet', 'commander'] as const) {
      it(`${world.id} ${level}: careful play wins, skipping a safety habit often loses`, () => {
        const careful = measure(world, level, strategies.careful, 300)
        expect(careful.win).toBeGreaterThanOrEqual(0.97)
        expect(careful.stars).toBeGreaterThan(2)
        expect(measure(world, level, strategies['no expeditions'], 300).stars).toBeLessThan(1.5)
        expect(measure(world, level, strategies['never shelter'], 300).win).toBeLessThan(0.8)
        expect(measure(world, level, strategies['never talk to Earth'], 300).win).toBeLessThan(0.8)
        expect(measure(world, level, strategies['random taps'], 300).win).toBeLessThan(0.5)
      })
    }
})

describe('worlds', () => {
  it('the Moon keeps Mars’s meters and actions, so lessons carry over', () => {
    expect(moon.resources.map((r) => r.id)).toEqual(mars.resources.map((r) => r.id))
    expect(moon.actions.map((a) => [a.id, a.cost, a.maxUnits])).toEqual(mars.actions.map((a) => [a.id, a.cost, a.maxUnits]))
  })

  it('every photo a world asks for exists', async () => {
    const { photoById } = await import('../content/photos')
    for (const w of [mars, moon]) {
      for (const id of [...w.projects.map((p) => p.photo), ...w.events.map((e) => e.photo)].filter(Boolean)) expect(photoById(id!), id).toBeTruthy()
    }
  })
})
