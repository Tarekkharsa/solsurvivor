import { rng } from './random'
import type { ActiveProject, Change, Content, Effects, Game, Level, LevelId, Plan, Project, TurnRecord } from './types'

export const levelOf = (game: Game, content: Content): Level => content.levels[game.level]

/** Event schedule for a whole mission, from the seed alone. Turn 1 is always calm. */
export function scheduleFor(content: Content, level: Level, seed: number): (string | null)[] {
  const random = rng(seed)
  const total = content.events.reduce((s, e) => s + e.weight, 0)
  const out: (string | null)[] = [null, null]
  for (let t = 2; t <= level.turns; t++) {
    const roll = random()
    const pick = random() * total
    if (roll >= level.eventChance) {
      out.push(null)
      continue
    }
    let acc = 0
    const event = content.events.find((e) => (acc += e.weight) > pick) ?? content.events.at(-1)!
    // The same storm twice in a row is no fun and teaches nothing new.
    out.push(out[t - 1] === event.id ? null : event.id)
  }
  return out
}

export function createGame(content: Content, level: LevelId, seed: number): Game {
  const lv = content.levels[level]
  return {
    content: content.id,
    level,
    seed,
    turn: 1,
    resources: Object.fromEntries(content.resources.map((r) => [r.id, r.start])),
    schedule: scheduleFor(content, lv, seed),
    pending: [],
    powerMods: [],
    warned: false,
    active: [],
    done: [],
    bonusPower: 0,
    bonusPerTurn: {},
    earned: 0,
    status: 'playing',
    history: [],
  }
}

/** Power for the current turn, before anything is spent. */
export function powerFor(game: Game, content: Content): number {
  const mods = game.powerMods.filter((m) => m.turn === game.turn).reduce((s, m) => s + m.delta, 0)
  return Math.max(0, levelOf(game, content).power + game.bonusPower + mods)
}

export const projectById = (content: Content, id: string) => content.projects.find((p) => p.id === id)

/** Power already promised to projects that are running. */
export function runningCost(game: Game, content: Content): number {
  return game.active.reduce((s, a) => s + (projectById(content, a.id)?.powerPerTurn ?? 0), 0)
}

export function planCost(plan: Plan, game: Game, content: Content): number {
  let cost = runningCost(game, content)
  for (const a of content.actions) cost += (plan.units[a.id] ?? 0) * a.cost
  if (plan.start) cost += projectById(content, plan.start)?.powerPerTurn ?? 0
  return cost
}

export const powerLeft = (plan: Plan, game: Game, content: Content) => powerFor(game, content) - planCost(plan, game, content)

export type ProjectStatus = 'done' | 'running' | 'locked' | 'busy' | 'poor' | 'ready'

/** Can this project start now? Rovers, builders and the helicopter each do one thing at a time. */
export function projectStatus(project: Project, game: Game, content: Content): ProjectStatus {
  if (game.done.includes(project.id)) return 'done'
  if (game.active.some((a) => a.id === project.id)) return 'running'
  if (project.requires?.some((r) => !game.done.includes(r))) return 'locked'
  if (game.active.some((a) => projectById(content, a.id)?.kind === project.kind)) return 'busy'
  if ((project.price ?? 0) > (game.resources[content.scienceId] ?? 0)) return 'poor'
  return 'ready'
}

const add = (into: Effects, from: Effects, times = 1) => {
  for (const [k, v] of Object.entries(from)) into[k] = (into[k] ?? 0) + (v ?? 0) * times
}

export interface TurnResult {
  game: Game
  record: TurnRecord
}

/**
 * Plays one turn. With `known` the result uses only what the player can know
 * (no surprise events), which is how the live preview works.
 */
function simulate(game: Game, content: Content, plan: Plan, known: boolean): TurnResult {
  const level = levelOf(game, content)
  const turn = game.turn
  const changes: Change[] = []
  const finished: string[] = []
  const pending = game.pending.filter((p) => p.turn !== turn)
  const powerMods = game.powerMods.filter((m) => m.turn > turn)
  let active: ActiveProject[] = game.active.map((a) => ({ ...a }))
  let done = [...game.done]
  let bonusPower = game.bonusPower
  const bonusPerTurn = { ...game.bonusPerTurn }

  // Everyday needs.
  const needs: Effects = {}
  for (const r of content.resources) if (r.perTurn) needs[r.id] = r.perTurn
  if (level.perTurn) Object.assign(needs, level.perTurn)
  changes.push({ source: 'needs', effects: needs })
  if (Object.keys(bonusPerTurn).length) changes.push({ source: 'upgrades', effects: { ...bonusPerTurn } })

  // Actions.
  const shelter = plan.units[content.shelterAction] ?? 0
  for (const a of content.actions) {
    const units = Math.min(plan.units[a.id] ?? 0, a.maxUnits)
    if (!units) continue
    const fx: Effects = {}
    add(fx, a.perUnit, units)
    changes.push({ source: a.id, effects: fx })
    if (a.delayed) {
      const later: Effects = {}
      add(later, a.delayed.perUnit, units)
      pending.push({ turn: turn + a.delayed.turns, source: a.id, effects: later })
    }
  }

  // Harvests and other delayed effects due now.
  for (const p of game.pending.filter((p) => p.turn === turn)) changes.push({ source: 'harvest', effects: p.effects })

  // Starting costs science now; a project that starts this turn also works this turn.
  const price: Effects = {}
  if (plan.start) {
    const p = projectById(content, plan.start)
    if (p && projectStatus(p, game, content) === 'ready') {
      if (p.price) price[content.scienceId] = -p.price
      active.push({ id: p.id, left: p.turns })
    }
  }
  if (Object.keys(price).length) changes.push({ source: plan.start!, effects: price })

  active = active.map((a) => ({ ...a, left: a.left - 1 }))
  for (const a of active.filter((a) => a.left <= 0)) {
    const p = projectById(content, a.id)!
    finished.push(p.id)
    done = [...done, p.id]
    if (Object.keys(p.reward).length) changes.push({ source: p.id, effects: { ...p.reward } })
    if (p.forever?.power) bonusPower += p.forever.power
    if (p.forever?.perTurn) add(bonusPerTurn, p.forever.perTurn)
  }
  active = active.filter((a) => a.left > 0)

  // The day's event. The preview only shows it if Earth warned us.
  const eventId = game.schedule[turn] ?? undefined
  const event = eventId && (!known || game.warned) ? content.events.find((e) => e.id === eventId) : undefined
  if (event) {
    const fx: Effects = { ...event.effects }
    if (event.storm) {
      const rad = content.resources.find((r) => r.invert)!.id
      fx[rad] = (fx[rad] ?? 0) + Math.max(0, event.storm.dose - shelter * event.storm.shelterBlock)
    }
    if (Object.keys(fx).length) changes.push({ source: event.id, effects: fx })
    if (event.power) {
      for (let i = 1; i <= event.power.turns; i++) powerMods.push({ turn: turn + i, delta: event.power.delta, source: event.id })
    }
  }

  // Apply and clamp.
  const before = { ...game.resources }
  const after = { ...game.resources }
  let earned = game.earned
  for (const c of changes) {
    for (const [k, v = 0] of Object.entries(c.effects)) {
      after[k] = (after[k] ?? 0) + v
      if (k === content.scienceId && v > 0) earned += v
    }
  }
  let lostOn: string | undefined
  for (const r of content.resources) {
    const v = Math.round(Math.min(r.max, Math.max(r.min, after[r.id])) * 100) / 100
    after[r.id] = v
    if (!lostOn && r.critical && (r.invert ? v >= r.max : v <= r.min)) lostOn = r.id
  }

  // Next turn's warning reaches us only if someone was listening.
  const listening = (plan.units[content.forecastAction] ?? 0) > 0
  const next = game.schedule[turn + 1]
  const warned = listening && !!next && !!content.events.find((e) => e.id === next)?.forecastable

  const record: TurnRecord = { turn, plan, before, after, event: event?.id, warned: game.warned, changes, finished }
  const last = turn >= level.turns
  return {
    record,
    game: {
      ...game,
      turn: lostOn || last ? turn : turn + 1,
      resources: after,
      pending,
      powerMods,
      warned,
      active,
      done,
      bonusPower,
      bonusPerTurn,
      earned: Math.round(earned * 100) / 100,
      status: lostOn ? 'lost' : last ? 'won' : 'playing',
      lostOn,
      history: [...game.history, record],
    },
  }
}

export class PlanError extends Error {}

export function playTurn(game: Game, content: Content, plan: Plan): TurnResult {
  if (game.status !== 'playing') throw new PlanError('The mission is over')
  if (powerLeft(plan, game, content) < 0) throw new PlanError('Not enough power')
  for (const a of content.actions) if ((plan.units[a.id] ?? 0) > a.maxUnits) throw new PlanError(`Too many taps on ${a.id}`)
  return simulate(game, content, plan, false)
}

/** Where the meters will be after this plan, from what the player can know. */
export function previewTurn(game: Game, content: Content, plan: Plan): TurnResult {
  return simulate(game, content, plan, true)
}

/** Rebuilds a mission from its seed and plans. */
export function replay(content: Content, level: LevelId, seed: number, plans: Plan[]): Game {
  let game = createGame(content, level, seed)
  for (const p of plans) {
    if (game.status !== 'playing') break
    game = playTurn(game, content, p).game
  }
  return game
}

export function stars(game: Game, content: Content): 0 | 1 | 2 | 3 {
  if (game.status !== 'won') return 0
  const [a, b, c] = levelOf(game, content).stars
  return game.earned >= c ? 3 : game.earned >= b ? 2 : game.earned >= a ? 1 : 0
}

/** The event coming tomorrow, if Earth has warned us. */
export function warning(game: Game, content: Content) {
  if (!game.warned) return undefined
  return content.events.find((e) => e.id === game.schedule[game.turn])
}
