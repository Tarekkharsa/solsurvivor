import { describe, expect, it } from 'vitest'
import { earthMarsAU, marsDelayMinutes } from './orbits'

describe('Earth–Mars distance from JPL elements', () => {
  it('matches known close approaches and a solar conjunction', () => {
    // NASA: closest approach in 60,000 years, 27 Aug 2003, 55.76 million km.
    expect(earthMarsAU(new Date('2003-08-27T10:00:00Z'))).toBeCloseTo(0.3727, 2)
    // 31 Jul 2018: 57.6 million km.
    expect(earthMarsAU(new Date('2018-07-31T08:00:00Z'))).toBeCloseTo(0.385, 2)
    // Solar conjunction, 8 Oct 2021: Mars behind the Sun, about 2.6 AU.
    expect(earthMarsAU(new Date('2021-10-08T00:00:00Z'))).toBeGreaterThan(2.55)
  })

  it('gives a delay between about 3 and 22 minutes', () => {
    for (let y = 2020; y < 2035; y += 0.37) {
      const m = marsDelayMinutes(new Date(Date.UTC(Math.floor(y), Math.round((y % 1) * 12), 1)))
      expect(m).toBeGreaterThan(3)
      expect(m).toBeLessThan(22.5)
    }
  })
})
