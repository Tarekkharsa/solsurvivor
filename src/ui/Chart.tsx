import { t } from '../i18n'
import type { Content, Game } from '../sim/types'

/** Air, food and radiation over every sol, with a marker where storms hit. */
export function MissionChart({ game, content }: { game: Game; content: Content }) {
  const W = 480
  const H = 180
  const pad = { l: 26, r: 10, t: 12, b: 24 }
  const lines = content.resources.filter((r) => r.critical)
  const n = game.history.length
  const x = (i: number) => pad.l + (i / Math.max(1, n)) * (W - pad.l - pad.r)
  const y = (v: number, max: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b)
  const colors: Record<string, string> = { air: '#8fd3ff', food: '#6fdc9a', radiation: '#c9a3ff' }
  return (
    <figure className="chart">
      <figcaption>{t('chart')}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t('chart')}>
        {[0, 5, 10].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v, 10)} y2={y(v, 10)} stroke="#ffffff22" />
            <text x={pad.l - 6} y={y(v, 10) + 4} textAnchor="end" fontSize="11" fill="#d4b8a8">
              {v}
            </text>
          </g>
        ))}
        {game.history.map((h, i) => {
          const e = content.events.find((x) => x.id === h.event)
          if (!e || (e.kind !== 'solar' && e.kind !== 'dust')) return null
          return (
            <g key={i}>
              <rect x={x(i)} y={pad.t} width={x(i + 1) - x(i)} height={H - pad.t - pad.b} fill={e.kind === 'solar' ? '#ffb02e22' : '#c58a5a22'} />
              <text x={(x(i) + x(i + 1)) / 2} y={pad.t + 12} textAnchor="middle" fontSize="13">
                {e.icon}
              </text>
            </g>
          )
        })}
        {lines.map((r) => {
          const pts = [game.history[0]?.before[r.id] ?? r.start, ...game.history.map((h) => h.after[r.id])]
          return <polyline key={r.id} fill="none" stroke={colors[r.id] ?? '#fff'} strokeWidth="3" strokeLinejoin="round" points={pts.map((v, i) => `${x(i)},${y(v, r.max)}`).join(' ')} />
        })}
        {game.history.map((h, i) => (
          <text key={i} x={x(i + 1)} y={H - 6} textAnchor="middle" fontSize="11" fill="#d4b8a8">
            {h.turn}
          </text>
        ))}
      </svg>
      <div className="legend">
        {lines.map((r) => (
          <span key={r.id}>
            <i style={{ background: colors[r.id] }} /> {r.icon} {r.label}
          </span>
        ))}
      </div>
    </figure>
  )
}
