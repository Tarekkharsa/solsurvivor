import { useEffect, useState } from 'react'
import { getLang, t, tk } from '../i18n'
import { fetchFlares, flareSize, type Flares } from '../lib/liveSpaceWeather'

let cached: Promise<Flares | undefined> | undefined
const liveOff = () => new URLSearchParams(location.search).get('live') === '0'

/** This week's real solar flares, on the title screen. Only shown when live data arrives. */
export function LiveSun() {
  const [flares, setFlares] = useState<Flares>()
  useEffect(() => {
    if (liveOff() || !navigator.onLine) return
    cached ??= fetchFlares()
    let alive = true
    cached.then((f) => alive && setFlares(f)).catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  if (!flares) return null
  const b = flares.biggest
  const date = b?.when.toLocaleDateString(getLang() === 'ar' ? 'ar' : 'en', { day: 'numeric', month: 'short' })
  return (
    <aside className={`live ${b ? flareSize(b.cls) : ''}`} aria-label={t('liveTitle')}>
      <strong>
        <span className="live-dot" aria-hidden /> ☀️ {t('liveTitle')}
      </strong>
      <p>
        {flares.count ? t('liveFlares', { n: flares.count }) : t('liveNone')}{' '}
        {b && tk('liveBiggest', { cls: b.cls, date: date ?? '', size: tk(`size_${flareSize(b.cls)}`) })}
      </p>
      <small>{t('liveSource', { source: flares.source })}</small>
    </aside>
  )
}
