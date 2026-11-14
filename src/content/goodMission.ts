import { worlds } from '.'
import { createGame, playTurn } from '../sim/engine'
import { rng } from '../sim/random'
import type { Content, LevelId } from '../sim/types'
import { newMission, type Mission } from '../lib/missionCode'
import { strategies } from './strategies'

/** A good mission is fair (careful play wins) and teaches something (a solar storm hits). */
export function isGoodMission(m: Mission): boolean {
  const content = worlds[m.world]
  let game = createGame(content, m.level, m.seed)
  const r = rng(1)
  while (game.status === 'playing') game = playTurn(game, content, strategies.careful(game, content, r)).game
  return game.status === 'won' && game.history.some((h) => content.events.find((e) => e.id === h.event)?.kind === 'solar')
}

/** New missions skip dull or unfair codes. A code someone types is always played as it is. */
export function pickMission(world: Content['id'], level: LevelId, random = Math.random): Mission {
  let m = newMission(world, level, random)
  for (let i = 0; i < 40 && !isGoodMission(m); i++) m = newMission(world, level, random)
  return m
}
