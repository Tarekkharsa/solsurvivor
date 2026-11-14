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

  const modals = (
    <>
      {modal === 'journal' && <Journal />}
      {modal === 'badges' && <Badges />}
      {modal === 'teamcheck' && <TeamCheck />}
    </>
  )

  if (screen === 'teachers') return <Teachers key={lang} />
  if (screen === 'title')
    return (
      <>
        <LangSwitch key={`l${lang}`} />
        <Title key={lang} />
        {modals}
      </>
    )

  return (
    <div className="app" key={lang}>
      <a className="skip" href="#plan">
        {t('skipToPlan')}
      </a>
      <div className="behind" inert={screen !== 'play' || !!modal}>
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

function LangSwitch({ inline }: { inline?: boolean }) {
  const lang = useGame((s) => s.lang)
  const setLanguage = useGame((s) => s.setLanguage)
  return (
    <button className={inline ? 'icon-btn lang' : 'lang corner'} onClick={() => setLanguage(lang === 'ar' ? 'en' : 'ar')} lang={lang === 'ar' ? 'en' : 'ar'}>
      {lang === 'ar' ? 'English' : 'عربي'}
    </button>
  )
}
