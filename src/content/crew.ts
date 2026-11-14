import { warning } from '../sim/engine'
import type { Content, Game } from '../sim/types'

export interface CrewMember {
  id: 'amara' | 'leo' | 'mei'
  name: string
  nameAr: string
  role: string
  face: string
  color: string
}

export const crew: CrewMember[] = [
  { id: 'amara', name: 'Amara', nameAr: 'أمارا', role: 'Commander', face: '👩🏾‍🚀', color: '#ffb36b' },
  { id: 'leo', name: 'Leo', nameAr: 'ليو', role: 'Engineer', face: '👨🏻‍🚀', color: '#8fd3ff' },
  { id: 'mei', name: 'Mei', nameAr: 'مي', role: 'Scientist', face: '👩🏻‍🔬', color: '#6fdc9a' },
]

export type Mood = 'alarm' | 'worry' | 'happy' | 'calm'

export interface CrewLine {
  who: CrewMember['id']
  mood: Mood
  /** A string key and its values, so the line can be translated. */
  key: string
  vars?: Record<string, string | number>
}

/** What the crew says in the morning. The most urgent thing wins, said by the person it matters to. */
export function morningLine(game: Game, content: Content): CrewLine {
  const level = content.levels[game.level]
  const r = game.resources
  const warn = warning(game, content)
  if (warn?.storm) return { who: 'amara', mood: 'alarm', key: 'crewStorm', vars: { title: warn.title } }
  if (warn?.power) return { who: 'leo', mood: 'worry', key: 'crewDust', vars: { title: warn.title } }
  if (r.air <= 3) return { who: 'leo', mood: 'worry', key: 'crewAirLow' }
  if (r.food <= 2) return { who: 'mei', mood: 'worry', key: 'crewFoodLow' }
  if (r.radiation >= 7) return { who: 'amara', mood: 'worry', key: 'crewRadHigh' }
  const cut = game.powerMods.filter((m) => m.turn === game.turn).reduce((s, m) => s + m.delta, 0)
  if (cut < 0) return { who: 'leo', mood: 'worry', key: 'crewPowerCut', vars: { n: -cut } }
  if (cut > 0) return { who: 'leo', mood: 'happy', key: 'crewPowerUp', vars: { n: cut } }
  const last = game.history.at(-1)
  if (last?.finished.length) {
    const p = content.projects.find((x) => x.id === last.finished[0])
    if (p) return { who: 'mei', mood: 'happy', key: 'crewFinished', vars: { name: p.label } }
  }
  const harvest = game.pending.filter((p) => p.turn === game.turn).reduce((s, p) => s + (p.effects.food ?? 0), 0)
  if (harvest > 0) return { who: 'mei', mood: 'happy', key: 'crewHarvest', vars: { n: harvest } }
  if (game.turn === level.turns) return { who: 'amara', mood: 'happy', key: 'crewLastSol' }
  if (game.turn === 1) return { who: 'amara', mood: 'calm', key: 'crewFirst' }
  const tips = ['crewTipRadio', 'crewTipPlants', 'crewTipExplore', 'crewTipBuild']
  return { who: (['amara', 'mei', 'mei', 'leo'] as const)[game.turn % 4], mood: 'calm', key: tips[game.turn % 4] }
}
