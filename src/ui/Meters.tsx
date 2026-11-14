import { fmt, isRtl, t } from '../i18n'
import { useGame, usePreview } from '../state/store'
import type { Resource } from '../sim/types'

/** Points from now to the end of the sol, in reading direction. */
const arrow = () => (isRtl() ? ' ← ' : ' → ')

/** One meter with today's value and a striped preview of where it ends the sol. */
function Meter({ r }: { r: Resource }) {
  const now = useGame((s) => s.game.resources[r.id] ?? 0)
  const preview = usePreview()
  const next = preview?.game.resources[r.id] ?? now
  const span = r.max - r.min || 1
  const pct = (v: number) => Math.max(0, Math.min(100, ((v - r.min) / span) * 100))
  const frac = (next - r.min) / span
  const danger = r.invert ? frac >= 0.7 : frac <= 0.3
  const fail = r.invert ? next >= r.max : next <= r.min
  const up = next > now
  const lo = Math.min(now, next)
  const hi = Math.max(now, next)
  const delta = Math.round((next - now) * 100) / 100
  return (
    <div
      className={`meter ${danger ? 'danger' : ''} ${fail ? 'fail' : ''} ${r.invert ? 'invert' : ''}`}
      role="meter"
      aria-valuemin={r.min}
      aria-valuemax={r.max}
      aria-valuenow={now}
      aria-label={`${t('meterNow', { label: r.label, now, max: r.max })}, ${t('meterNext', { next })}`}
    >
      <div className="meter-head">
        <span className="meter-icon" aria-hidden>
          {r.icon}
        </span>
        <span className="meter-label">{r.label}</span>
        <span className="meter-value">
          <bdi dir="ltr">{fmt(now)}</bdi>
          {delta !== 0 && (
            <span className={(r.invert ? !up : up) ? 'meter-arrow good' : 'meter-arrow bad'}>
              {arrow()}
              <bdi dir="ltr">{fmt(next)}</bdi>
            </span>
          )}
        </span>
      </div>
      <div className="bar" aria-hidden>
        <div className="bar-fill" style={{ width: `${pct(lo)}%` }} />
        <div className={up ? 'bar-change up' : 'bar-change down'} style={{ insetInlineStart: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }} />
      </div>
    </div>
  )
}

export function Meters() {
  const content = useGame((s) => s.content)
  const earned = useGame((s) => s.game.earned)
  const level = useGame((s) => s.content.levels[s.game.level])
  const science = content.resources.find((r) => r.id === content.scienceId)!
  const have = useGame((s) => s.game.resources[content.scienceId] ?? 0)
  const preview = usePreview()
  const next = preview?.game.resources[content.scienceId] ?? have
  const gotStars = level.stars.filter((s) => earned >= s).length
  return (
    <section className="meters" aria-label={t('metersLabel')}>
      {content.resources
        .filter((r) => r.critical)
        .map((r) => (
          <Meter key={r.id} r={r} />
        ))}
      <div className="meter science" aria-label={`${science.label}: ${fmt(have)}`}>
        <div className="meter-head">
          <span className="meter-icon" aria-hidden>
            {science.icon}
          </span>
          <span className="meter-label">{science.label}</span>
          <span className="meter-value">
            <bdi dir="ltr">{fmt(have)}</bdi>
            {next !== have && (
              <span className={next > have ? 'meter-arrow good' : 'meter-arrow bad'}>
                {arrow()}
                <bdi dir="ltr">{fmt(next)}</bdi>
              </span>
            )}
          </span>
        </div>
        <div className="stars-row" aria-label={t('stars', { n: gotStars })}>
          {level.stars.map((s, i) => (
            <span key={i} className={earned >= s ? 'star on' : 'star'} title={`${s} 🔬`}>
              ★
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
