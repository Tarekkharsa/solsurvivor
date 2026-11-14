import { useEffect } from 'react'
import { t } from '../i18n'
import { codeOf } from '../lib/missionCode'
import { readChallenge, useGame } from '../state/store'
import { Coach } from '../ui/Coach'
import { Badges, Journal } from '../ui/Collections'
import { Morning } from '../ui/Crew'
import { Meters } from '../ui/Meters'
import { PlanPanel } from '../ui/PlanPanel'
import { End, Report, Title } from '../ui/Screens'
import { TeamCheck } from '../ui/Team'
import { Teachers } from '../ui/Teachers'
import { Settings } from '../ui/Settings'
import { setMood } from '../lib/audio'
import { warning } from '../sim/engine'
import { StageSlot } from '../ui/StageSlot'
import { canDo3D } from '../lib/device'

export function App() {
  const screen = useGame((s) => s.screen)
  const game = useGame((s) => s.game)
  const level = useGame((s) => s.content.levels[s.game.level])
  const quit = useGame((s) => s.quit)
  const modal = useGame((s) => s.modal)
  const openModal = useGame((s) => s.openModal)
  const setChallenge = useGame((s) => s.setChallenge)
  const lang = useGame((s) => s.lang)
  const classMission = useGame((s) => s.classMission)
  const world = useGame((s) => s.content.id)

  useEffect(() => {
    document.body.dataset.world = world
  }, [world])
  useEffect(() => setChallenge(readChallenge(location.search)), [setChallenge])
  const contrast = useGame((s) => s.settings.contrast)
  useEffect(() => {
    document.documentElement.classList.toggle('contrast', contrast)
  }, [contrast])
  const content = useGame((s) => s.content)
  const graphics = useGame((s) => s.settings.graphics)
  const view3d = useGame((s) => s.view3d)
  const setView3d = useGame((s) => s.setView3d)
  useEffect(() => {
    setView3d(graphics === '3d' || (graphics === 'auto' && canDo3D()))
  }, [graphics, setView3d])
  // Music turns tense when a storm is coming or dust is on the panels.
  useEffect(() => {
    const storm = warning(game, content)
    const dust = game.powerMods.some((m) => m.turn === game.turn && m.delta < 0)
    setMood(storm || dust ? 'tense' : 'calm')
  }, [game, content])

  const modals = (
    <>
      {modal === 'journal' && <Journal />}
      {modal === 'badges' && <Badges />}
      {modal === 'teamcheck' && <TeamCheck />}
      {modal === 'settings' && <Settings />}
    </>
  )

  if (screen === 'teachers') return <Teachers key={lang} />
  if (screen === 'title')
    return (
      <>
        <div className="corner-tools" key={`l${lang}`}>
          <LangSwitch inline />
          <button className="icon-btn" onClick={() => openModal('settings')} aria-label={t('settings')}>
            ⚙️
          </button>
        </div>
        <Title key={lang} />
        {modals}
      </>
    )

  return (
    <div className="app" key={lang}>
      <a className="skip" href="#plan">
        {t('skipToPlan')}
      </a>
      <div className="behind" inert={(screen !== 'play' && screen !== 'lapse') || !!modal}>
        <header className="topbar">
          <button className="link" onClick={quit} aria-label={t('quit')}>
            ✕
          </button>
          <strong className="sol">{t('solOf', { n: game.turn, total: level.turns })}</strong>
          {classMission && <span className="level-tag code">{t('codeLabel', { code: codeOf({ world, level: game.level, seed: game.seed }) })}</span>}
          <span className="level-tag">{t(game.level)}</span>
          <LangSwitch inline />
          <button className="icon-btn" onClick={() => openModal('journal')} aria-label={t('journal')}>
            📔
          </button>
          <button className="icon-btn" onClick={() => openModal('settings')} aria-label={t('settings')}>
            ⚙️
          </button>
        </header>
        <main className="play">
          <Meters />
          <Morning />
          {view3d && <StageSlot />}
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

function LangSwitch({ inline }: { inline?: boolean }) {
  const lang = useGame((s) => s.lang)
  const setLanguage = useGame((s) => s.setLanguage)
  return (
    <button className={inline ? 'icon-btn lang' : 'lang'} onClick={() => setLanguage(lang === 'ar' ? 'en' : 'ar')} lang={lang === 'ar' ? 'en' : 'ar'}>
      {lang === 'ar' ? 'English' : 'عربي'}
    </button>
  )
}
