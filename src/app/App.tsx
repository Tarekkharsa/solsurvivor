import { t } from '../i18n'
import { useGame } from '../state/store'
import { Meters } from '../ui/Meters'
import { PlanPanel } from '../ui/PlanPanel'
import { End, Morning, Report, Title } from '../ui/Screens'

export function App() {
  const screen = useGame((s) => s.screen)
  const game = useGame((s) => s.game)
  const level = useGame((s) => s.content.levels[s.game.level])
  const quit = useGame((s) => s.quit)
  if (screen === 'title') return <Title />
  return (
    <div className="app">
      <a className="skip" href="#plan">
        Skip to the plan
      </a>
      <header className="topbar">
        <button className="link" onClick={quit} aria-label={t('quit')}>
          ✕
        </button>
        <strong className="sol">{t('solOf', { n: game.turn, total: level.turns })}</strong>
        <span className="level-tag">{t(game.level)}</span>
      </header>
      <main className="play">
        <Meters />
        <Morning />
        <PlanPanel />
      </main>
      {screen === 'report' && <Report />}
      {screen === 'end' && <End />}
    </div>
  )
}
