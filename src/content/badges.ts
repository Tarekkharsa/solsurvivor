import type { Content, Game } from '../sim/types'
import { stars } from '../sim/engine'

export interface Badge {
  id: string
  icon: string
  /** True when this mission earned it. */
  test: (game: Game, content: Content, profile: { journal: string[]; wins: number }) => boolean
}

const stormsHit = (game: Game, content: Content) =>
  game.history.filter((h) => content.events.find((e) => e.id === h.event)?.storm)

export const badges: Badge[] = [
  {
    id: 'stormReady',
    icon: '🛡️',
    test: (g, c) => {
      const storms = stormsHit(g, c)
      return g.status === 'won' && storms.length > 0 && storms.every((h) => (h.plan.units[c.shelterAction] ?? 0) >= 2)
    },
  },
  {
    id: 'listened',
    icon: '📡',
    test: (g, c) => g.status === 'won' && g.history.slice(0, -1).every((h) => (h.plan.units[c.forecastAction] ?? 0) > 0),
  },
  { id: 'explorer', icon: '🚙', test: (g, c) => g.done.filter((id) => c.projects.find((p) => p.id === id)?.kind === 'expedition').length >= 3 },
  { id: 'builder', icon: '🏗️', test: (g, c) => g.done.filter((id) => c.projects.find((p) => p.id === id)?.kind === 'upgrade').length >= 2 },
  {
    id: 'dustProof',
    icon: '🌪️',
    test: (g, c) => g.status === 'won' && g.history.some((h) => c.events.find((e) => e.id === h.event)?.kind === 'dust'),
  },
  {
    id: 'steady',
    icon: '🧘',
    test: (g, c) =>
      g.status === 'won' &&
      g.history.every((h) =>
        c.resources.every((r) => {
          if (!r.critical) return true
          const f = (h.after[r.id] - r.min) / (r.max - r.min)
          return r.invert ? f < 0.7 : f > 0.3
        }),
      ),
  },
  { id: 'threeStars', icon: '⭐', test: (g, c) => stars(g, c) === 3 },
  { id: 'commander', icon: '🎖️', test: (g) => g.status === 'won' && g.level === 'commander' },
  { id: 'collector', icon: '📸', test: (_g, _c, p) => p.journal.length >= 6 },
  { id: 'firstLanding', icon: '🏁', test: (g) => g.status === 'won' },
]
