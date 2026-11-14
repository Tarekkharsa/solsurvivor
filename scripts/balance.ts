import { balanceTable } from '../src/content/balance'
import { worlds } from '../src/content'

for (const world of Object.values(worlds).filter((w, i, all) => all.indexOf(w) === i)) {
  for (const level of ['cadet', 'commander'] as const) {
    console.log(`\n${world.id} ${level}`)
    for (const r of balanceTable(world, level)) {
      console.log(`  ${r.strategy.padEnd(22)} win ${(r.win * 100).toFixed(0).padStart(3)}%   stars ${r.stars.toFixed(2)}`)
    }
  }
}
