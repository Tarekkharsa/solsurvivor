import { useLayoutEffect, useState } from 'react'
import { t, tk } from '../i18n'
import { useGame } from '../state/store'

const steps = [
  { target: 'oxygen', key: 'coach1' },
  { target: 'greenhouse', key: 'coach2' },
  { target: 'comms', key: 'coach3' },
  { target: 'end', key: 'coach4' },
]

/** The guided first sol: a bubble pointing at the next thing to tap. */
export function Coach() {
  const step = useGame((s) => s.coach)
  const screen = useGame((s) => s.screen)
  const skip = useGame((s) => s.skipCoach)
  const [box, setBox] = useState<DOMRect | null>(null)
  const s = step === null ? undefined : steps[step]

  useLayoutEffect(() => {
    if (!s || screen !== 'play') return
    const el = document.querySelector(`[data-coach="${s.target}"]`)
    if (!el) return
    el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    const measure = () => setBox(el.getBoundingClientRect())
    measure()
    const id = setInterval(measure, 250)
    addEventListener('scroll', measure, true)
    addEventListener('resize', measure)
    return () => {
      clearInterval(id)
      removeEventListener('scroll', measure, true)
      removeEventListener('resize', measure)
    }
  }, [s, screen])

  if (!s || !box || screen !== 'play') return null
  const below = box.bottom + 150 < innerHeight
  const width = Math.min(320, innerWidth - 24)
  const left = Math.max(12, Math.min(innerWidth - width - 12, box.left + box.width / 2 - width / 2))
  return (
    <>
      <div className="coach-ring" style={{ top: box.top - 6, left: box.left - 6, width: box.width + 12, height: box.height + 12 }} aria-hidden />
      <div className={below ? 'coach-bubble below' : 'coach-bubble above'} role="status" style={below ? { top: box.bottom + 14, left, width } : { top: box.top - 14, left, width, transform: 'translateY(-100%)' }}>
        <span className="coach-step">{t('coachStep', { n: step! + 1, total: steps.length })}</span>
        <p>{tk(s.key)}</p>
        <button className="link" onClick={skip}>
          {t('coachSkip')}
        </button>
      </div>
    </>
  )
}
