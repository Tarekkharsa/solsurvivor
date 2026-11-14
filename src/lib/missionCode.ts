import type { Content, LevelId } from '../sim/types'

/**
 * Class mission codes like MARS-4821. The word is the world, the number is the
 * seed, and an odd number means Cadet, an even number Commander. The whole
 * class types the same code and meets the same storms.
 */
export interface Mission {
  world: Content['id']
  level: LevelId
  seed: number
}

export const levelOf = (seed: number): LevelId => (seed % 2 ? 'cadet' : 'commander')

export const codeOf = (m: Mission) => `${m.world.toUpperCase()}-${m.seed}`

const worldWords: Record<string, Content['id']> = {
  mars: 'mars',
  moon: 'moon',
  مريخ: 'mars',
  المريخ: 'mars',
  قمر: 'moon',
  القمر: 'moon',
}

/** Reads a code typed loosely: any case, a space or no dash, Arabic digits, the Arabic world name. */
export function parseCode(raw: string): Mission | undefined {
  const s = raw
    .trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .toLowerCase()
  const m = s.match(/^([a-z\u0600-\u06ff]+)[\s\-_–—]*(\d{4})$/)
  if (!m) return undefined
  const [, word, digits] = m
  const world = worldWords[word]
  const seed = Number(digits)
  if (!world || seed < 1000) return undefined
  return { world, level: levelOf(seed), seed }
}

/** A random code for a world and level. */
export function newMission(world: Content['id'], level: LevelId, random = Math.random): Mission {
  let seed = 1000 + Math.floor(random() * 9000)
  if (levelOf(seed) !== level) seed = seed === 9999 ? 9998 : seed + 1
  return { world, level, seed }
}
