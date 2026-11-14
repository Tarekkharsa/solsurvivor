import { useMemo } from 'react'
import { create } from 'zustand'
import { worlds } from '../content'
import { createGame, playTurn, powerLeft, previewTurn, projectStatus } from '../sim/engine'
import type { Content, Game, LevelId, Plan, TurnRecord } from '../sim/types'

export type Screen = 'title' | 'play' | 'report' | 'end'

interface State {
  screen: Screen
  content: Content
  game: Game
  plan: Plan
  plans: Plan[]
  /** The last sol's record, shown on the report screen. */
  last?: TurnRecord
  start: (world: Content['id'], level: LevelId, seed?: number) => void
  setUnits: (id: string, units: number) => void
  toggleProject: (id: string) => void
  repeatPlan: () => void
  endTurn: () => void
  next: () => void
  quit: () => void
}

const emptyPlan = (): Plan => ({ units: {} })
export const randomSeed = () => 1000 + Math.floor(Math.random() * 9000)

export const useGame = create<State>((set, get) => ({
  screen: 'title',
  content: worlds.mars,
  game: createGame(worlds.mars, 'cadet', 1),
  plan: emptyPlan(),
  plans: [],

  start: (world, level, seed = randomSeed()) => {
    const content = worlds[world]
    set({ screen: 'play', content, game: createGame(content, level, seed), plan: emptyPlan(), plans: [], last: undefined })
  },

  setUnits: (id, units) => {
    const { plan, game, content } = get()
    const a = content.actions.find((x) => x.id === id)
    if (!a) return
    const next: Plan = { ...plan, units: { ...plan.units, [id]: Math.max(0, Math.min(a.maxUnits, units)) } }
    if (!next.units[id]) delete next.units[id]
    if (powerLeft(next, game, content) < 0) return
    set({ plan: next })
  },

  toggleProject: (id) => {
    const { plan, game, content } = get()
    if (plan.start === id) return set({ plan: { ...plan, start: undefined } })
    const p = content.projects.find((x) => x.id === id)
    if (!p || projectStatus(p, game, content) !== 'ready') return
    const next = { ...plan, start: id }
    if (powerLeft(next, game, content) < 0) return
    set({ plan: next })
  },

  repeatPlan: () => {
    const { content, game, plans } = get()
    const last = plans.at(-1)
    if (!last) return
    const next: Plan = { units: {} }
    for (const a of content.actions) {
      for (let u = 0; u < Math.min(last.units[a.id] ?? 0, a.maxUnits); u++) {
        const more: Plan = { units: { ...next.units, [a.id]: (next.units[a.id] ?? 0) + 1 } }
        if (powerLeft(more, game, content) < 0) break
        next.units = more.units
      }
    }
    if (Object.keys(next.units).length) set({ plan: next })
  },

  endTurn: () => {
    const { game, content, plan, plans } = get()
    if (game.status !== 'playing') return
    const { game: after, record } = playTurn(game, content, plan)
    set({ game: after, plans: [...plans, plan], plan: emptyPlan(), last: record, screen: 'report' })
  },

  next: () => set({ screen: get().game.status === 'playing' ? 'play' : 'end' }),
  quit: () => set({ screen: 'title' }),
}))

/** The live preview of the plan being made. */
export const usePreview = () => {
  const game = useGame((s) => s.game)
  const content = useGame((s) => s.content)
  const plan = useGame((s) => s.plan)
  return useMemo(() => (game.status === 'playing' ? previewTurn(game, content, plan) : undefined), [game, content, plan])
}
