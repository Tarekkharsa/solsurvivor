import { fmt, isRtl, t } from '../i18n'
import { codeOf } from '../lib/missionCode'
import type { Resource } from '../sim/types'
import { useGame, usePreview } from '../state/store'

function HudMeter({ r }: { r: Resource }) {
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
  const changed = Math.round((next - now) * 100) !== 0
  return (
    <div
      className={`hud-meter ${danger ? 'danger' : ''} ${fail ? 'fail' : ''} ${r.invert ? 'invert' : ''}`}
      role="meter"
      aria-valuemin={r.min}
      aria-valuemax={r.max}
      aria-valuenow={now}
      aria-label={`${t('meterNow', { label: r.label, now, max: r.max })}, ${t('meterNext', { next })}`}
    >
      <span className="hm-icon" aria-hidden>
        {r.icon}
      </span>
      <span className="hm-label">{r.label}</span>
      <span className="bar" aria-hidden>
        <span className="bar-fill" style={{ width: `${pct(lo)}%` }} />
        <span className={up ? 'bar-change up' : 'bar-change down'} style={{ insetInlineStart: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }} />
      </span>
      <b className="hm-value">
        <bdi dir="ltr">{fmt(now)}</bdi>
      </b>
      <span className={`hm-next ${changed ? ((r.invert ? !up : up) ? 'good' : 'bad') : ''}`} aria-hidden>
        {isRtl() ? '←' : '→'} <bdi dir="ltr">{fmt(next)}</bdi>
      </span>
    </div>
  )
}

/** The slim top bar over the 3D base: the sol, the meters with tonight's preview, and the menus. */
export function Hud() {
  const content = useGame((s) => s.content)
  const game = useGame((s) => s.game)
  const plan = useGame((s) => s.plan)
  const journal = useGame((s) => s.profile.journal.length)
  const open = useGame((s) => s.openModal)
  const quit = useGame((s) => s.quit)
  const lang = useGame((s) => s.lang)
  const setLanguage = useGame((s) => s.setLanguage)
  const classMission = useGame((s) => s.classMission)
  const preview = usePreview()
  const level = content.levels[game.level]
  const science = content.resources.find((r) => r.id === content.scienceId)!
  const have = game.resources[content.scienceId] ?? 0
  const earned = preview?.game.earned ?? game.earned
  const stars = level.stars.filter((s) => game.earned >= s).length
  const nextStar = level.stars.find((s) => game.earned < s) ?? level.stars[2]
  const prevStar = [0, ...level.stars][stars]
  const pctStar = Math.min(100, ((earned - prevStar) / Math.max(1, nextStar - prevStar)) * 100)
  void plan
  return (
    <header className="hud">
      <div className="hud-sol">
        <button className="hud-quit" onClick={quit} aria-label={t('quit')}>
          ✕
        </button>
        <strong className="sol-badge">{t('sol', { n: game.turn })}</strong>
        <span className="sol-total">
          / <bdi dir="ltr">{level.turns}</bdi>
        </span>
        <span className="sr-only">{t('solOf', { n: game.turn, total: level.turns })}</span>
      </div>
      <div className="hud-meters">
        {content.resources
          .filter((r) => r.critical)
          .map((r) => (
            <HudMeter key={r.id} r={r} />
          ))}
        <div className="hud-meter science" aria-label={`${science.label}: ${fmt(have)}, ${t('stars', { n: stars })}`}>
          <span className="hm-icon" aria-hidden>
            {science.icon}
          </span>
          <span className="hm-label">{science.label}</span>
          <span className="hud-stars" aria-hidden>
            {level.stars.map((s, i) => (
              <span key={i} className={game.earned >= s ? 'star on' : 'star'}>
                ★
              </span>
            ))}
            <span className="star-progress">
              <span style={{ width: `${pctStar}%` }} />
            </span>
          </span>
          <b className="hm-value">
            <bdi dir="ltr">{fmt(have)}</bdi>
          </b>
        </div>
      </div>
      <nav className="hud-menu">
        {classMission && <span className="hud-code">{codeOf({ world: content.id, level: game.level, seed: game.seed })}</span>}
        <button onClick={() => open('explore')}>
          🗺️ <span className="hud-btn-label">{t('expeditions')}</span>
        </button>
        <button onClick={() => open('build')}>
          🏗️ <span className="hud-btn-label">{t('build')}</span>
        </button>
        <button onClick={() => open('journal')} aria-label={t('journal')}>
          📔 <bdi dir="ltr">{journal}</bdi>
        </button>
        <button onClick={() => setLanguage(lang === 'ar' ? 'en' : 'ar')} lang={lang === 'ar' ? 'en' : 'ar'} className="lang">
          {lang === 'ar' ? 'EN' : 'عربي'}
        </button>
        <button onClick={() => open('settings')} aria-label={t('settings')}>
          ⚙️
        </button>
      </nav>
    </header>
  )
}
