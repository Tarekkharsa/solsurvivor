import { describe, expect, it } from 'vitest'
import { flareSize, summarize } from './liveSpaceWeather'

describe('live flares', () => {
  it('finds the biggest flare by class', () => {
    const f = summarize(
      [
        { cls: 'C4.2', when: '2026-11-07T08:23:00Z' },
        { cls: 'M1.5', when: '2026-11-09T01:00:00Z' },
        { cls: 'M12', when: '2026-11-10T01:00:00Z' },
        { cls: 'X1.1', when: '2026-11-11T02:00:00Z' },
        { cls: '', when: '2026-11-11T02:00:00Z' },
      ],
      'NOAA GOES',
    )
    expect(f.count).toBe(4)
    expect(f.biggest?.cls).toBe('X1.1')
    expect(flareSize('X1.1')).toBe('big')
    expect(flareSize('M2')).toBe('medium')
  })
})
