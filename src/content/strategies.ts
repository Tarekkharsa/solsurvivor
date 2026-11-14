import { powerLeft, previewTurn, projectStatus, warning } from '../sim/engine'
import type { Content, Game, Plan } from '../sim/types'

/** A way of playing, for balance checks and for the demo recorder. */
export type Strategy = (game: Game, content: Content, random: () => number) => Plan

interface Habits {
  shelter: boolean
  listen: boolean
  explore: boolean
  build: boolean
  /** Air and food the player tries to keep after every turn. */
  margin: number
}

/** Adds one tap if there is power and room. */
function tap(plan: Plan, game: Game, content: Content, id: string): boolean {
  const a = content.actions.find((x) => x.id === id)!
  const units = plan.units[id] ?? 0
  if (units >= a.maxUnits) return false
  const next: Plan = { ...plan, units: { ...plan.units, [id]: units + 1 } }
  if (powerLeft(next, game, content) < 0) return false
  plan.units = next.units
  return true
}

function habit(h: Habits): Strategy {
  return (game, content) => {
    const plan: Plan = { units: {} }
    const level = content.levels[game.level]
    const last = game.turn >= level.turns
    const storm = warning(game, content)?.storm

    if (h.shelter && storm) {
      tap(plan, game, content, content.shelterAction)
      tap(plan, game, content, content.shelterAction)
    }
    // Keep air and food above the margin, judged by the live preview.
    for (let guard = 0; guard < 8; guard++) {
      const after = previewTurn(game, content, plan).game.resources
      if (after.air >= h.margin) break
      if (!tap(plan, game, content, 'oxygen')) break
    }
    const turnsLeft = level.turns - game.turn
    if (turnsLeft >= 2) {
      tap(plan, game, content, 'greenhouse')
      if ((game.resources.food ?? 0) < h.margin + 1) tap(plan, game, content, 'greenhouse')
    }
    if (h.listen && !last) tap(plan, game, content, content.forecastAction)

    const start = (kind: string) =>
      content.projects.find((p) => p.kind === kind && projectStatus(p, game, content) === 'ready')
    if (!plan.start && h.build && turnsLeft >= 3) {
      const up = content.projects.find((p) => p.kind === 'upgrade' && p.forever?.power && projectStatus(p, game, content) === 'ready')
      if (up) plan.start = up.id
    }
    if (!plan.start && h.explore) {
      const ex = start('expedition') ?? start('flight')
      if (ex && ex.turns <= turnsLeft + 1) plan.start = ex.id
    }
    if (plan.start && powerLeft(plan, game, content) < 0) plan.start = undefined

    while (tap(plan, game, content, 'lab'));
    if (h.listen && !last) tap(plan, game, content, content.forecastAction)
    while (tap(plan, game, content, 'oxygen'));
    return plan
  }
}

const random: Strategy = (game, content, rand) => {
  const plan: Plan = { units: {} }
  for (let i = 0; i < 12; i++) tap(plan, game, content, content.actions[Math.floor(rand() * content.actions.length)].id)
  return plan
}

export const strategies: Record<string, Strategy> = {
  careful: habit({ shelter: true, listen: true, explore: true, build: true, margin: 3 }),
  'no expeditions': habit({ shelter: true, listen: true, explore: false, build: false, margin: 3 }),
  'never shelter': habit({ shelter: false, listen: true, explore: true, build: true, margin: 3 }),
  'never talk to Earth': habit({ shelter: true, listen: false, explore: true, build: true, margin: 3 }),
  'greedy science': habit({ shelter: false, listen: false, explore: true, build: false, margin: 1 }),
  'random taps': random,
}
