import { describe, expect, it } from 'vitest'
import { codeOf, levelOf, newMission, parseCode } from './missionCode'
import { isGoodMission, pickMission } from '../content/goodMission'
import { createGame, playTurn } from '../sim/engine'
import { worlds } from '../content'
import { rng } from '../sim/random'

describe('mission codes', () => {
  it('reads codes typed loosely', () => {
    const want = { world: 'mars', level: 'cadet', seed: 4821 }
    for (const s of ['MARS-4821', 'mars 4821', 'Mars4821', ' mars–4821 ', 'MARS-٤٨٢١', 'مريخ-4821', 'المريخ ٤٨٢١']) expect(parseCode(s), s).toEqual(want)
    expect(parseCode('MOON-2002')).toEqual({ world: 'moon', level: 'commander', seed: 2002 })
    expect(parseCode('قمر 2002')?.world).toBe('moon')
  })

  it('rejects things that are not codes', () => {
    for (const s of ['', 'MARS', 'PLUTO-4821', 'MARS-48', 'MARS-0123', 'MARS-48211']) expect(parseCode(s), s).toBeUndefined()
  })

  it('odd numbers are Cadet, even numbers Commander', () => {
    expect(levelOf(4821)).toBe('cadet')
    expect(levelOf(4822)).toBe('commander')
    for (let i = 0; i < 50; i++) {
      const m = newMission('moon', 'commander')
      expect(m.seed % 2).toBe(0)
      expect(parseCode(codeOf(m))).toEqual(m)
    }
  })

  it('the same code gives every student the same storms, whatever they plan', () => {
    const content = worlds.mars
    const r = rng(3)
    let a = createGame(content, 'cadet', 4821)
    let b = createGame(content, 'cadet', 4821)
    for (let i = 0; i < 4; i++) {
      a = playTurn(a, content, { units: { oxygen: 2 } }).game
      b = playTurn(b, content, { units: { oxygen: 2, comms: 1, lab: Math.floor(r() * 2) } }).game
    }
    expect(a.history.map((h) => h.event)).toEqual(b.history.map((h) => h.event))
  })

  it('new missions are fair and have a solar storm', () => {
    for (const world of ['mars', 'moon'] as const)
      for (const level of ['cadet', 'commander'] as const) {
        const random = rng(world.length * 10 + level.length)
        for (let i = 0; i < 25; i++) expect(isGoodMission(pickMission(world, level, random))).toBe(true)
      }
  })
})
