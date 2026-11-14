import type { Content, Game, Plan } from '../sim/types'

/** Jobs for team play on one computer. Each job owns some actions and watches some meters. */
export type RoleId = 'commander' | 'engineer' | 'botanist' | 'scientist'

export interface Role {
  id: RoleId
  icon: string
  actions: string[]
  /** Project kinds this job starts. */
  projects: string[]
  meters: string[]
}

export const roles: Role[] = [
  { id: 'commander', icon: '🎖️', actions: ['shelter', 'comms'], projects: [], meters: ['radiation'] },
  { id: 'engineer', icon: '🔧', actions: ['oxygen'], projects: ['upgrade'], meters: ['air'] },
  { id: 'botanist', icon: '🌱', actions: ['greenhouse'], projects: [], meters: ['food'] },
  { id: 'scientist', icon: '🔬', actions: ['lab'], projects: ['expedition', 'flight'], meters: ['science'] },
]

export const roleById = (id: RoleId) => roles.find((r) => r.id === id)!

/** Who does what with 2, 3 or 4 players. With fewer players, jobs are doubled up. */
export function assignRoles(players: number): RoleId[][] {
  if (players <= 2) return [['commander', 'engineer'], ['botanist', 'scientist']]
  if (players === 3) return [['commander'], ['engineer'], ['botanist', 'scientist']]
  return [['commander'], ['engineer'], ['botanist'], ['scientist']]
}

export const playerIcons = ['🦊', '🐼', '🐙', '🦉']
export const playerColors = ['#ffb36b', '#8fd3ff', '#6fdc9a', '#d6a8ff']

/** The player who owns an action or a project kind. */
export function ownerOf(team: RoleId[][], what: { action?: string; projectKind?: string }): number {
  return team.findIndex((jobs) =>
    jobs.some((j) => {
      const r = roleById(j)
      return what.action ? r.actions.includes(what.action) : r.projects.includes(what.projectKind ?? '')
    }),
  )
}

/** Power a player is using in this plan. */
export function powerUsedBy(player: number, team: RoleId[][], plan: Plan, game: Game, content: Content): number {
  let used = 0
  for (const a of content.actions) if (ownerOf(team, { action: a.id }) === player) used += (plan.units[a.id] ?? 0) * a.cost
  const projects = [...game.active.map((x) => x.id), ...(plan.start ? [plan.start] : [])]
  for (const id of projects) {
    const p = content.projects.find((x) => x.id === id)
    if (p && ownerOf(team, { projectKind: p.kind }) === player) used += p.powerPerTurn
  }
  return used
}

/** The worst value each player's meters reached in a mission, for the team report. */
export function teamReport(team: RoleId[][], game: Game, content: Content) {
  return team.map((jobs) =>
    jobs.flatMap((j) => roleById(j).meters).map((id) => {
      const r = content.resources.find((x) => x.id === id)!
      const values = [r.start, ...game.history.map((h) => h.after[id])]
      return { id, worst: r.invert ? Math.max(...values) : Math.min(...values), last: values.at(-1)! }
    }),
  )
}
