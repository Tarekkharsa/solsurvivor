import { describe, expect, it } from 'vitest'
import { factFor } from './facts'
import { getWorld } from './index'
import type { TurnRecord } from '../sim/types'

const record = (turn: number, units: Record<string, number>) => ({ turn, plan: { units }, before: {}, after: {}, warned: false, changes: [], finished: [] }) as TurnRecord

describe('NASA facts in the sol report', () => {
  for (const world of ['mars', 'moon'] as const)
    it(`every ${world} action has a sourced fact in both languages`, () => {
      const content = getWorld(world, 'en')
      for (const a of content.actions)
        for (const lang of ['en', 'ar'] as const) {
          const f = factFor(content, record(1, { [a.id]: 1 }), lang)
          expect(f?.text.length).toBeGreaterThan(20)
          expect(f?.url).toMatch(/^https:\/\//)
        }
    })

  it('takes turns between the jobs done, busiest first', () => {
    const content = getWorld('mars', 'en')
    const units = { oxygen: 2, lab: 1 }
    expect(factFor(content, record(1, units), 'en')?.text).toMatch(/MOXIE/)
    expect(factFor(content, record(2, units), 'en')?.text).toMatch(/Perseverance drills/)
    expect(factFor(content, record(1, {}), 'en')).toBeUndefined()
  })
})
