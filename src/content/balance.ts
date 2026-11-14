import { createGame, playTurn, stars } from '../sim/engine'
import { rng } from '../sim/random'
import type { Content, LevelId } from '../sim/types'
import { strategies, type Strategy } from './strategies'

export interface BalanceRow {
  strategy: string
  win: number
  stars: number
}

/** Plays a strategy on many seeds and reports the win rate and average stars of the wins. */
export function measure(content: Content, level: LevelId, strategy: Strategy, runs = 1000, from = 1): { win: number; stars: number } {
  let wins = 0
  let starSum = 0
  for (let seed = from; seed < from + runs; seed++) {
    const rand = rng(seed * 7919)
    let game = createGame(content, level, seed)
    while (game.status === 'playing') game = playTurn(game, content, strategy(game, content, rand)).game
    if (game.status === 'won') {
      wins++
      starSum += stars(game, content)
    }
  }
  return { win: wins / runs, stars: wins ? starSum / wins : 0 }
}

export function balanceTable(content: Content, level: LevelId, runs = 1000): BalanceRow[] {
  return Object.entries(strategies).map(([name, s]) => ({ strategy: name, ...measure(content, level, s, runs) }))
}
