import { Component, lazy, Suspense, useEffect, type ReactNode } from 'react'
import { t } from '../i18n'
import { fastLapse } from '../lib/device'
import { useGame } from '../state/store'

const Stage = lazy(() => import('../scene/Stage'))

class Guard extends Component<{ onFail: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFail()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** The 3D base. In the time-lapse it fills the screen; Space, Enter or Skip end it. */
export function StageSlot() {
  const screen = useGame((s) => s.screen)
  const last = useGame((s) => s.last)
  const lapseDone = useGame((s) => s.lapseDone)
  const setView3d = useGame((s) => s.setView3d)
  const graphics = useGame((s) => s.settings.graphics)
  const world = useGame((s) => s.content.id)
  const lapse = screen === 'lapse'
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const seconds = fastLapse() || reduced ? 2.2 : 6.5

  useEffect(() => {
    if (!lapse) return
    const key = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault()
        lapseDone()
      }
    }
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [lapse, lapseDone])

  return (
    <section className={lapse ? 'stage lapse' : 'stage'} aria-label={lapse ? t('lapseLabel') : t('stageLabel', { world: t(world === 'moon' ? 'worldMoon' : 'worldMars') })}>
      <Guard onFail={() => setView3d(false)}>
        <Suspense fallback={<div className="stage-loading" aria-hidden />}>
          <Stage seconds={seconds} fast={graphics === 'simple'} />
        </Suspense>
      </Guard>
      {lapse && (
        <div className="lapse-bar">
          <strong>{t('sol', { n: last?.turn ?? 1 })}</strong>
          <span className="lapse-progress" style={{ animationDuration: `${seconds}s` }} aria-hidden />
          <button onClick={lapseDone} autoFocus>
            {t('skip')} ⏭
          </button>
        </div>
      )}
    </section>
  )
}
