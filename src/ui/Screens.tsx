import { useState } from 'react'
import { count, fmt, strings, t } from '../i18n'
import { stars, warning } from '../sim/engine'
import type { LevelId } from '../sim/types'
import { useGame } from '../state/store'
import { EffectChips } from './PlanPanel'

export function Title() {
  const content = useGame((s) => s.content)
  const start = useGame((s) => s.start)
  const [level, setLevel] = useState<LevelId>('cadet')
  return (
    <main className="title-screen">
      <div className="title-card">
        <h1>
          <span aria-hidden>🔴</span> {t('appName')}
        </h1>
        <p className="tagline">{t('tagline')}</p>
        <h2>{t('chooseLevel')}</h2>
        <div className="levels" role="radiogroup" aria-label={t('chooseLevel')}>
          {(['cadet', 'commander'] as const).map((id) => {
            const lv = content.levels[id]
            return (
              <button key={id} role="radio" aria-checked={level === id} className={level === id ? 'level on' : 'level'} onClick={() => setLevel(id)}>
                <strong>{t(id)}</strong>
                <span>{t(id === 'cadet' ? 'cadetAge' : 'commanderAge')}</span>
                <span className="level-info">{t('cadetInfo', { count: count(lv.turns, 'sol'), power: lv.power })}</span>
              </button>
            )
          })}
        </div>
        <button className="primary big" onClick={() => start('mars', level)}>
          {t('start')} 🚀
        </button>
      </div>
    </main>
  )
}

/** The morning message: a storm warning, a power change, or a calm sol. */
export function Morning() {
  const content = useGame((s) => s.content)
  const game = useGame((s) => s.game)
  const warn = warning(game, content)
  return (
    <section className={warn ? 'morning warn' : 'morning'} aria-live="polite">
      {warn ? (
        <>
          <strong>
            {warn.icon} {t('warning', { title: warn.title })}
          </strong>
          {warn.storm && <span>{t('warningShelter')}</span>}
        </>
      ) : (
        <span>{t('noNews')}</span>
      )}
    </section>
  )
}

export function Report() {
  const content = useGame((s) => s.content)
  const record = useGame((s) => s.last)!
  const next = useGame((s) => s.next)
  const event = content.events.find((e) => e.id === record.event)
  const name = (source: string) =>
    content.actions.find((a) => a.id === source)?.label ??
    content.projects.find((p) => p.id === source)?.label ??
    content.events.find((e) => e.id === source)?.title ??
    (source === 'needs' ? t('needs') : source === 'harvest' ? t('harvest') : t('upgrades'))
  const icon = (source: string) =>
    content.actions.find((a) => a.id === source)?.icon ??
    content.projects.find((p) => p.id === source)?.icon ??
    content.events.find((e) => e.id === source)?.icon ??
    (source === 'needs' ? '🧑‍🚀' : source === 'harvest' ? '🧺' : '🔧')
  const shelter = record.plan.units[content.shelterAction] ?? 0
  const blocked = event?.storm ? Math.min(event.storm.dose, shelter * event.storm.shelterBlock) : 0

  return (
    <div className="modal-back">
      <section className="modal report" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <h2 id="report-title">{t('report', { n: record.turn })}</h2>
        {event && (
          <div className={`event-card ${event.kind}`}>
            <div className="event-head">
              <span className="event-icon" aria-hidden>
                {event.icon}
              </span>
              <strong>{event.title}</strong>
            </div>
            <p>{event.text}</p>
            {event.storm && !record.warned && <p className="hint">{t('surprise')}</p>}
            {blocked > 0 && <p className="hint good">{t('sheltered', { n: blocked })}</p>}
            <p className="source">{event.real ? t('real', { source: event.source ?? '' }) : t('madeUp')}</p>
          </div>
        )}
        {record.finished.map((id) => {
          const p = content.projects.find((x) => x.id === id)!
          return (
            <div key={id} className="finished">
              <strong>{t('finished', { icon: p.icon, name: p.label })}</strong>
              <p>{p.text}</p>
            </div>
          )
        })}
        <h3>{t('whatHappened')}</h3>
        <ul className="changes">
          {record.changes.map((c, i) =>
            Object.values(c.effects).some(Boolean) ? (
              <li key={i}>
                <span aria-hidden>{icon(c.source)}</span> <span className="change-name">{name(c.source)}</span>
                <span className="change-fx">
                  <EffectChips effects={c.effects} />
                </span>
              </li>
            ) : null,
          )}
        </ul>
        <div className="totals">
          {content.resources.map((r) => (
            <span key={r.id} className="total">
              {r.icon} <bdi dir="ltr">{fmt(record.before[r.id])} → {fmt(record.after[r.id])}</bdi>
            </span>
          ))}
        </div>
        <button className="primary big" onClick={next} autoFocus>
          {t('continue')}
        </button>
      </section>
    </div>
  )
}

export function End() {
  const content = useGame((s) => s.content)
  const game = useGame((s) => s.game)
  const start = useGame((s) => s.start)
  const quit = useGame((s) => s.quit)
  const n = stars(game, content)
  const level = content.levels[game.level]
  const nextStar = level.stars.find((s) => game.earned < s)
  const won = game.status === 'won'
  return (
    <div className="modal-back">
      <section className={won ? 'modal end won' : 'modal end lost'} role="dialog" aria-modal="true" aria-labelledby="end-title">
        <h2 id="end-title">{won ? `🎉 ${t('won')}` : `💥 ${t('lost')}`}</h2>
        {won ? (
          <>
            <div className="big-stars" aria-label={t('stars', { n })}>
              {[1, 2, 3].map((i) => (
                <span key={i} className={i <= n ? 'star on' : 'star'} style={{ animationDelay: `${i * 0.25}s` }}>
                  ★
                </span>
              ))}
            </div>
            <p>{t('wonText', { n: game.earned })}</p>
            {nextStar !== undefined && <p className="hint">{t('nextStar', { n: Math.round((nextStar - game.earned) * 100) / 100 })}</p>}
          </>
        ) : (
          <p>{strings().lostText[game.lostOn ?? 'air']}</p>
        )}
        <div className="end-buttons">
          <button className="primary big" onClick={() => start(content.id, game.level, game.seed)} autoFocus>
            {t('playAgain')}
          </button>
          <button className="big" onClick={() => start(content.id, game.level)}>
            {t('newMission')}
          </button>
          <button className="link" onClick={quit}>
            {t('quit')}
          </button>
        </div>
      </section>
    </div>
  )
}
