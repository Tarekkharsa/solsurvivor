/** A change to some meters, by meter id. */
export type Effects = Partial<Record<string, number>>

export type LevelId = 'cadet' | 'commander'

export interface Resource {
  id: string
  label: string
  icon: string
  start: number
  min: number
  /** Infinity for meters with no ceiling (science). */
  max: number
  /** What happens every turn without any help (breathing, eating, background radiation). */
  perTurn: number
  /** Reaching the danger end ends the mission. */
  critical?: boolean
  /** True when high is bad (radiation). The danger end is then `max`. */
  invert?: boolean
  explain: string
}

export interface Action {
  id: string
  label: string
  icon: string
  /** Power per tap. */
  cost: number
  maxUnits: number
  perUnit: Effects
  /** Effects that land some turns later (plants take time to grow). */
  delayed?: { turns: number; perUnit: Effects }
  explain: string
}

export type EventKind = 'solar' | 'dust' | 'good' | 'bad' | 'wonder'

export interface EventDef {
  id: string
  kind: EventKind
  icon: string
  title: string
  /** What the crew sees when it hits. */
  text: string
  effects: Effects
  /** Radiation the storm adds before shelter. Each shelter tap blocks `shelterBlock`. */
  storm?: { dose: number; shelterBlock: number }
  /** A power change for the next few turns (dust on panels, wind cleaning them). */
  power?: { delta: number; turns: number }
  /** Earth can warn about it a turn ahead, if someone is listening. */
  forecastable?: boolean
  weight: number
  /** Real past event (with year), or made up for the game. */
  real: boolean
  year?: number
  source?: string
  /** A journal photo it unlocks. */
  photo?: string
}

export type ProjectKind = 'expedition' | 'flight' | 'upgrade'

export interface Project {
  id: string
  kind: ProjectKind
  label: string
  icon: string
  /** Turns it takes. Power is paid every one of them. */
  turns: number
  powerPerTurn: number
  /** Science paid up front (upgrades). */
  price?: number
  requires?: string[]
  /** Given when it finishes. */
  reward: Effects
  /** Lasting gifts from an upgrade. */
  forever?: { power?: number; perTurn?: Effects }
  text: string
  /** A discovery photo shown when it finishes. */
  photo?: string
  real: boolean
}

export interface Level {
  id: LevelId
  turns: number
  power: number
  eventChance: number
  /** Science earned for one, two and three stars. */
  stars: [number, number, number]
  /** Per-level tweaks to the everyday change of a meter. */
  perTurn?: Effects
}

export interface Content {
  id: 'mars' | 'moon'
  resources: Resource[]
  actions: Action[]
  events: EventDef[]
  projects: Project[]
  levels: Record<LevelId, Level>
  /** The action that lets Earth's warnings through. */
  forecastAction: string
  /** The action that blocks storm radiation. */
  shelterAction: string
  /** The meter that counts toward stars. */
  scienceId: string
}

/** Taps per action, and at most one new project to start. */
export interface Plan {
  units: Partial<Record<string, number>>
  start?: string
}

export interface Change {
  /** An action id, a project id, an event id, 'needs', 'upgrades' or 'harvest'. */
  source: string
  effects: Effects
}

export interface TurnRecord {
  turn: number
  plan: Plan
  before: Record<string, number>
  after: Record<string, number>
  event?: string
  warned: boolean
  changes: Change[]
  finished: string[]
}

export interface ActiveProject {
  id: string
  left: number
}

export interface Game {
  content: Content['id']
  level: LevelId
  seed: number
  /** The turn being planned, from 1. */
  turn: number
  resources: Record<string, number>
  /** The event that hits on each turn (index = turn). Fixed at the start, so plans never change it. */
  schedule: (string | null)[]
  /** Delayed effects waiting to land at the end of a turn. */
  pending: { turn: number; source: string; effects: Effects }[]
  /** Power changes for coming turns. */
  powerMods: { turn: number; delta: number; source: string }[]
  /** Earth warned us about this turn's event. */
  warned: boolean
  active: ActiveProject[]
  done: string[]
  bonusPower: number
  bonusPerTurn: Effects
  earned: number
  status: 'playing' | 'won' | 'lost'
  lostOn?: string
  history: TurnRecord[]
}
