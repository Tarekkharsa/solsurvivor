import { useState } from 'react'
import { assignRoles, ownerOf, playerColors, playerIcons, powerUsedBy, roleById, teamReport, type RoleId } from '../content/roles'
import { count, fmt, t, tk } from '../i18n'
import type { Content, LevelId } from '../sim/types'
import { useGame, usePreview } from '../state/store'
import { Dialog } from './Collections'

export function PlayerTag({ player, short }: { player: number; short?: boolean }) {
  const team = useGame((s) => s.team)
  if (!team || player < 0) return null
  return (
    <span className="player-tag" style={{ ['--p' as string]: playerColors[player] }} title={t('playerN', { n: player + 1 })}>
      {playerIcons[player]}
      {!short && <span> {t('playerN', { n: player + 1 })}</span>}
    </span>
  )
}

/** Shows whose job a plan row or project is in team play. */
export function OwnerChip({ action, projectKind }: { action?: string; projectKind?: string }) {
  const team = useGame((s) => s.team)
  if (!team) return null
  return <PlayerTag player={ownerOf(team, { action, projectKind })} short />
}

export function TeamSetup({ world, level }: { world: Content['id']; level: LevelId }) {
  const start = useGame((s) => s.start)
  const close = useGame((s) => s.openModal)
  const [n, setN] = useState(2)
  const team = assignRoles(n)
  return (
    <Dialog title={`👥 ${t('teamSetup')}`} onClose={() => close(null)} className="wide">
      <p className="muted">{t('teamHow')}</p>
      <div className="seg" role="radiogroup" aria-label={t('team')}>
        {[2, 3, 4].map((k) => (
          <button key={k} role="radio" aria-checked={n === k} className={n === k ? 'on' : ''} onClick={() => setN(k)}>
            {count(k, 'player')}
          </button>
        ))}
      </div>
      <ul className="team-list">
        {team.map((jobs, i) => (
          <li key={i} style={{ ['--p' as string]: playerColors[i] }}>
            <span className="team-face" aria-hidden>
              {playerIcons[i]}
            </span>
            <div>
              <strong>{t('playerN', { n: i + 1 })}</strong>
              {jobs.map((j) => (
                <p key={j}>
                  {roleById(j).icon} <b>{tk(`job_${j}`)}</b>: {tk(`jobDo_${j}`)}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <button className="primary big wide-btn" onClick={() => start(world, level, undefined, { team })}>
        {t('startTeam')} 🚀
      </button>
    </Dialog>
  )
}

/** Before a sol ends, every player checks their own meters and taps Ready. */
export function TeamCheck() {
  const team = useGame((s) => s.team)!
  const content = useGame((s) => s.content)
  const game = useGame((s) => s.game)
  const plan = useGame((s) => s.plan)
  const endTurn = useGame((s) => s.endTurn)
  const close = useGame((s) => s.openModal)
  const preview = usePreview()
  const [ready, setReady] = useState<boolean[]>(team.map(() => false))
  const all = ready.every(Boolean)
  return (
    <Dialog title={`👥 ${t('teamCheck')}`} onClose={() => close(null)} className="wide">
      <p className="muted">{t('teamCheckHow')}</p>
      <ul className="team-list check">
        {team.map((jobs: RoleId[], i) => (
          <li key={i} className={ready[i] ? 'ready' : ''} style={{ ['--p' as string]: playerColors[i] }}>
            <span className="team-face" aria-hidden>
              {playerIcons[i]}
            </span>
            <div className="team-body">
              <strong>
                {t('playerN', { n: i + 1 })} · {jobs.map((j) => tk(`job_${j}`)).join(' + ')}
              </strong>
              <div className="team-meters">
                {jobs
                  .flatMap((j) => roleById(j).meters)
                  .map((id) => {
                    const r = content.resources.find((x) => x.id === id)!
                    const now = game.resources[id]
                    const next = preview?.game.resources[id] ?? now
                    const bad = r.invert ? next > now : next < now
                    return (
                      <span key={id} className={bad && r.critical ? 'chip bad' : 'chip good'}>
                        {r.icon} {r.label}{' '}
                        <bdi dir="ltr">
                          {fmt(now)} → {fmt(next)}
                        </bdi>
                      </span>
                    )
                  })}
                <span className="chip">{t('yourPower', { n: powerUsedBy(i, team, plan, game, content) })}</span>
              </div>
            </div>
            <button className={ready[i] ? 'small on' : 'small'} aria-pressed={ready[i]} onClick={() => setReady((r) => r.map((v, k) => (k === i ? !v : v)))}>
              {ready[i] ? `✓ ${t('ready')}` : t('ready')}
            </button>
          </li>
        ))}
      </ul>
      {all && <p className="end-ready">{t('everyoneReady')}</p>}
      <button className="primary big wide-btn" disabled={!all} onClick={endTurn}>
        {t('endTurn')}
      </button>
    </Dialog>
  )
}

export function TeamReport() {
  const team = useGame((s) => s.team)
  const game = useGame((s) => s.game)
  const content = useGame((s) => s.content)
  if (!team) return null
  const report = teamReport(team, game, content)
  return (
    <section className="team-report">
      <h3>👥 {t('teamReport')}</h3>
      <ul className="team-list">
        {report.map((rows, i) => (
          <li key={i} style={{ ['--p' as string]: playerColors[i] }}>
            <span className="team-face" aria-hidden>
              {playerIcons[i]}
            </span>
            <div>
              <strong>{t('playerN', { n: i + 1 })}</strong>
              <p>
                {rows
                  .filter((r) => r.id !== content.scienceId)
                  .map((r) => {
                    const res = content.resources.find((x) => x.id === r.id)!
                    return (
                      <span key={r.id} className="chip">
                        {res.icon} {t(res.invert ? 'teamWorstHigh' : 'teamWorst', { label: res.label, n: r.worst })}
                      </span>
                    )
                  })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
