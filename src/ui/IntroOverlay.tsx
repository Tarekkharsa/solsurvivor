import { lazy, Suspense, useEffect } from 'react'
import { t } from '../i18n'
import { useGame } from '../state/store'

const Intro = lazy(() => import('../scene/Intro'))

/** The opening shot: from orbit down to the landing site. Once per session, skippable. */
export function IntroOverlay() {
  const done = useGame((s) => s.introDone)
  const moon = useGame((s) => s.content.id === 'moon')
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault()
        done()
      }
    }
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [done])
  return (
    <div className="intro" role="dialog" aria-modal="true" aria-label={t(moon ? 'introMoon' : 'introMars')}>
      <Suspense fallback={null}>
        <Intro moon={moon} seconds={8} onDone={done} />
      </Suspense>
      <div className="intro-text">
        <p className="intro-kicker">{t(moon ? 'introMoonKicker' : 'introMarsKicker')}</p>
        <h2>{t(moon ? 'introMoon' : 'introMars')}</h2>
        <p className="intro-coords">
          <bdi dir="ltr">{moon ? '89.5°S · 0°' : '18.4°N · 77.5°E'}</bdi>
        </p>
      </div>
      <p className="intro-credit">{t(moon ? 'introMoonCredit' : 'introMarsCredit')}</p>
      <button className="intro-skip" onClick={done} autoFocus>
        {t('skip')} ⏭
      </button>
    </div>
  )
}
