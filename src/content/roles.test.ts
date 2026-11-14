import { describe, expect, it } from 'vitest'
import { assignRoles, ownerOf, roles } from './roles'
import { mars } from './mars'

describe('team roles', () => {
  it('every job is covered exactly once for 2, 3 and 4 players', () => {
    for (const n of [2, 3, 4]) {
      const team = assignRoles(n)
      expect(team).toHaveLength(n)
      expect(team.flat().sort()).toEqual(roles.map((r) => r.id).sort())
    }
  })

  it('every action and project kind has exactly one owner', () => {
    for (const n of [2, 3, 4]) {
      const team = assignRoles(n)
      for (const a of mars.actions) expect(ownerOf(team, { action: a.id }), a.id).toBeGreaterThanOrEqual(0)
      for (const k of ['expedition', 'flight', 'upgrade']) expect(ownerOf(team, { projectKind: k }), k).toBeGreaterThanOrEqual(0)
    }
  })
})
