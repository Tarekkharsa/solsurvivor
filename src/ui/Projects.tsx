import { count, t } from '../i18n'
import { planCost, powerFor, projectStatus } from '../sim/engine'
import type { Project } from '../sim/types'
import { useGame } from '../state/store'
import { OwnerChip } from './Team'

function ProjectCard({ p }: { p: Project }) {
  const content = useGame((s) => s.content)
  const game = useGame((s) => s.game)
  const plan = useGame((s) => s.plan)
  const toggle = useGame((s) => s.toggleProject)
  const status = projectStatus(p, game, content)
  const chosen = plan.start === p.id
  const active = game.active.find((a) => a.id === p.id)
  const left = powerFor(game, content) - planCost(plan, game, content)
  const tooDear = !chosen && status === 'ready' && left < p.powerPerTurn
  const needs = p.requires?.find((r) => !game.done.includes(r))
  const reward = p.reward[content.scienceId]
  const science = content.resources.find((r) => r.id === content.scienceId)!

  let note = ''
  if (chosen) note = t('starting')
  else if (status === 'running') note = t('running', { count: count(active!.left) })
  else if (status === 'done') note = t('done')
  else if (status === 'locked') note = t('locked', { name: content.projects.find((x) => x.id === needs)?.label ?? '' })
  else if (status === 'busy') note = t('busy')
  else if (status === 'poor') note = t('poor', { n: p.price! })

  return (
    <article className={`project ${status} ${chosen ? 'chosen' : ''}`} data-project={p.id}>
      <div className="project-head">
        <span className="project-icon" aria-hidden>
          {p.icon}
        </span>
        <strong>{p.label}</strong>
        <OwnerChip projectKind={p.kind} />
        {reward ? (
          <span className="chip good">
            <bdi dir="ltr">+{reward}</bdi> {science.icon}
          </span>
        ) : null}
        {p.price ? (
          <span className="chip price">
            <bdi dir="ltr">−{p.price}</bdi> {science.icon}
          </span>
        ) : null}
      </div>
      <p className="project-text">{p.text}</p>
      <div className="project-foot">
        <span className="project-meta">{t('turnsPower', { count: count(p.turns), power: p.powerPerTurn })}</span>
        {(status === 'ready' || chosen) && (
          <button className={chosen ? 'small on' : 'small'} onClick={() => toggle(p.id)} disabled={tooDear} aria-pressed={chosen}>
            {chosen ? t('cancelProject') : t('startProject')}
          </button>
        )}
        {note && !(status === 'ready' && !chosen) && <span className="project-note">{note}</span>}
      </div>
    </article>
  )
}

export function Projects() {
  const content = useGame((s) => s.content)
  const game = useGame((s) => s.game)
  // Show what can be done now, what is running, and the next step of each chain.
  const shown = content.projects.filter((p) => {
    const s = projectStatus(p, game, content)
    if (s !== 'locked') return true
    return p.requires!.every((r) => game.done.includes(r) || game.active.some((a) => a.id === r))
  })
  const order = { running: 0, ready: 1, poor: 2, busy: 3, locked: 4, done: 5 }
  shown.sort((a, b) => order[projectStatus(a, game, content)] - order[projectStatus(b, game, content)])
  return (
    <section className="projects" aria-label={t('projects')}>
      <h2>🗺️ {t('projects')}</h2>
      <div className="project-list">
        {shown.map((p) => (
          <ProjectCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  )
}
