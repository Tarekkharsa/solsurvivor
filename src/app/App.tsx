import { useEffect } from 'react'
import { t } from '../i18n'
import { readChallenge, useGame } from '../state/store'
import { Coach } from '../ui/Coach'
import { Badges, Journal } from '../ui/Collections'
import { Meters } from '../ui/Meters'
import { PlanPanel } from '../ui/PlanPanel'
import { Morning } from '../ui/Crew'
import { End, Report, Title } from '../ui/Screens'

export function App() {
  const screen = useGame((s) => s.screen)
  const game = useGame((s) => s.game)
  const level = useGame((s) => s.content.levels[s.game.level])
  const quit = useGame((s) => s.quit)
  const modal = useGame((s) => s.modal)
  const openModal = useGame((s) => s.openModal)
  const setChallenge = useGame((s) => s.setChallenge)
  useEffect(() => setChallenge(readChallenge(location.search)), [setChallenge])
  const modals = (
    <>
      {modal === 'journal' && <Journal />}
      {modal === 'badges' && <Badges />}
    </>
  )
  if (screen === 'title')
    return (
      <>
        <Title />
        {modals}
      </>
    )
  return (
    <div className="app">
      <a className="skip" href="#plan">
        Skip to the plan
      </a>
      <div className="behind" inert={screen !== 'play' || !!modal}>
      <header className="topbar">
        <button className="link" onClick={quit} aria-label={t('quit')}>
          ✕
        </button>
        <strong className="sol">{t('solOf', { n: game.turn, total: level.turns })}</strong>
        <span className="level-tag">{t(game.level)}</span>
        <button className="icon-btn" onClick={() => openModal('journal')} aria-label={t('journal')}>
          📔
        </button>
      </header>
      <main className="play">
        <Meters />
        <Morning />
        <PlanPanel />
      </main>
      </div>
      {screen === 'report' && <Report />}
      {screen === 'end' && <End />}
      <Coach />
      {modals}
    </div>
  )
}
