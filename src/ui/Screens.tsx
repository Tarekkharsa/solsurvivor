import { useState } from 'react'
import { photoById } from '../content/photos'
import { downloadCertificate } from '../lib/certificate'
import { count, fmt, isRtl, strings, t } from '../i18n'
import { stars } from '../sim/engine'
import type { LevelId } from '../sim/types'
import { challengeLink, useGame } from '../state/store'
import { MissionChart } from './Chart'
import { BadgeGrid, PhotoCard } from './Collections'
import { EffectChips } from './PlanPanel'

export function Title() {
  const content = useGame((s) => s.content)
  const start = useGame((s) => s.start)
  const resume = useGame((s) => s.resume)
  const saved = useGame((s) => s.saved)
  const challenge = useGame((s) => s.challenge)
  const profile = useGame((s) => s.profile)
  const openModal = useGame((s) => s.openModal)
  const [level, setLevel] = useState<LevelId>(challenge?.level ?? 'cadet')
  return (
    <main className="title-screen">
      <div className="title-card">
        <h1>
          <span aria-hidden>🔴</span> {t('appName')}
        </h1>
        <p className="tagline">{t('tagline')}</p>
        {saved && (
          <button className="big resume" onClick={resume}>
            ▶ {t('resume', { n: saved.plans.length + 1 })}
          </button>
        )}
        {challenge ? (
          <div className="challenge-banner">
            <p>⚔️ {t('challengeTitle', { n: challenge.stars })}</p>
            <button className="primary big" onClick={() => start(challenge.world, challenge.level, challenge.seed)}>
              {t('start')} 🚀
            </button>
          </div>
        ) : (
          <>
            <h2>{t('chooseLevel')}</h2>
            <div className="levels" role="radiogroup" aria-label={t('chooseLevel')}>
              {(['cadet', 'commander'] as const).map((id) => {
                const lv = content.levels[id]
                return (
                  <button key={id} role="radio" aria-checked={level === id} className={level === id ? 'level on' : 'level'} onClick={() => setLevel(id)}>
                    <strong>{t(id)}</strong>
                    <span>{t(id === 'cadet' ? 'cadetAge' : 'commanderAge')}</span>
                    <span className="level-info">{t('cadetInfo', { count: count(lv.turns), power: lv.power })}</span>
                  </button>
                )
              })}
            </div>
            <button className="primary big" onClick={() => start('mars', level)}>
              {t('start')} 🚀
            </button>
          </>
        )}
        <div className="title-links">
          <button onClick={() => openModal('journal')}>
            📔 {t('journal')} <span className="count">{profile.journal.length}</span>
          </button>
          <button onClick={() => openModal('badges')}>
            🏅 {t('badges')} <span className="count">{profile.badges.length}</span>
          </button>
        </div>
      </div>
    </main>
  )
}

export function Report() {
  const content = useGame((s) => s.content)
  const record = useGame((s) => s.last)!
  const next = useGame((s) => s.next)
  const fresh = useGame((s) => s.fresh.photos)
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
  const photosNow = [...record.finished.map((id) => content.projects.find((p) => p.id === id)?.photo), event?.photo].filter(
    (p): p is string => !!p && !!photoById(p),
  )

  return (
    <div className="modal-back">
      <section className="modal report" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <h2 id="report-title" tabIndex={-1} autoFocus>{t('report', { n: record.turn })}</h2>
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
        {photosNow.map((id) => (
          <div key={id}>
            {fresh.includes(id) && <p className="new-photo">📸 {t('newPhoto')}</p>}
            <PhotoCard id={id} big />
          </div>
        ))}
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
              {r.icon}{' '}
              <bdi dir="ltr">
                {fmt(record.before[r.id])} → {fmt(record.after[r.id])}
              </bdi>
            </span>
          ))}
        </div>
        <button className="primary big" onClick={next}>
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
  const fresh = useGame((s) => s.fresh)
  const challenge = useGame((s) => s.challenge)
  const [name, setName] = useState('')
  const [copied, setCopied] = useState(false)
  const n = stars(game, content)
  const level = content.levels[game.level]
  const nextStar = level.stars.find((s) => game.earned < s)
  const won = game.status === 'won'
  const beat = challenge && challenge.seed === game.seed && won && n > challenge.stars

  const share = async () => {
    const link = challengeLink(game, content)
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      prompt(t('challenge'), link)
    }
    setCopied(true)
  }

  return (
    <div className="modal-back">
      <section className={won ? 'modal end won wide' : 'modal end lost wide'} role="dialog" aria-modal="true" aria-labelledby="end-title">
        <h2 id="end-title" tabIndex={-1} autoFocus>{won ? `🎉 ${t('won')}` : `💥 ${t('lost')}`}</h2>
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
            {beat && <p className="hint good">⚔️ {t('challengeBeat', { n: challenge.stars })}</p>}
            {nextStar !== undefined && <p className="hint">{t('nextStar', { n: Math.round((nextStar - game.earned) * 100) / 100 })}</p>}
          </>
        ) : (
          <p className="lost-text">{strings().lostText[game.lostOn ?? 'air']}</p>
        )}
        <MissionChart game={game} content={content} />
        {fresh.badges.length > 0 && (
          <>
            <h3>🏅 {t('newBadge')}</h3>
            <BadgeGrid highlight={fresh.badges} only />
          </>
        )}
        {won && (
          <div className="cert">
            <label>
              {t('certName')}
              <input value={name} onChange={(e) => setName(e.target.value.slice(0, 30))} autoComplete="off" />
            </label>
            <div className="cert-buttons">
              <button
                onClick={() =>
                  downloadCertificate({
                    title: t('certTitle'),
                    name,
                    body: t('certBody', { level: t(game.level), world: t('worldMars') }),
                    stars: n,
                    date: new Date().toLocaleDateString(),
                    rtl: isRtl(),
                  })
                }
              >
                📜 {t('certificate')}
              </button>
              <button onClick={share}>⚔️ {copied ? t('challengeCopied') : t('challenge')}</button>
            </div>
          </div>
        )}
        <div className="end-buttons">
          <button className="primary big" onClick={() => start(content.id, game.level, game.seed)}>
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
