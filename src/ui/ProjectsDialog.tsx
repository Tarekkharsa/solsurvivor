import { photoById } from '../content/photos'
import { count, t, tk } from '../i18n'
import { projectStatus } from '../sim/engine'
import type { Content, Project } from '../sim/types'
import { useGame } from '../state/store'
import { Dialog } from './Collections'
import { ProjectCard } from './Projects'

/** A sketch map of the landing area: the crater, the old river delta, and each site. */
function SiteMap({ content, projects }: { content: Content; projects: Project[] }) {
  const game = useGame((s) => s.game)
  const plan = useGame((s) => s.plan)
  const moon = content.id === 'moon'
  const sites = projects.filter((p) => p.map)
  const at = (id: string) => sites.find((p) => p.id === id)?.map
  return (
    <svg className="site-map" viewBox="0 0 100 100" role="img" aria-label={t(moon ? 'mapMoon' : 'mapMars')}>
      <defs>
        <radialGradient id="crater" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={moon ? '#7b7d82' : '#c9733f'} />
          <stop offset="0.85" stopColor={moon ? '#5d5f64' : '#a7552a'} />
          <stop offset="1" stopColor={moon ? '#3a3b3f' : '#6e2d14'} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="47" fill="url(#crater)" stroke={moon ? '#2a2b2e' : '#5a2410'} strokeWidth="2" />
      {moon ? (
        <>
          {[
            [50, 46, 9],
            [26, 62, 7],
            [64, 34, 8],
            [78, 22, 10],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#2c2d31" opacity="0.75" />
          ))}
          <text x="50" y="47.5" textAnchor="middle" fontSize="3.2" fill="#bfc3ca">
            ✛ {t('southPole')}
          </text>
        </>
      ) : (
        <>
          <path d="M8 32 C 20 30, 30 36, 40 44 C 34 52, 22 54, 14 48 Z" fill="#8a4a2a" opacity="0.65" />
          <path d="M2 30 C 8 31, 12 31, 16 33" stroke="#6fa8d8" strokeWidth="1.6" fill="none" opacity="0.7" />
          <text x="22" y="45" fontSize="3.4" fill="#f3d2b8" fontStyle="italic">
            {t('delta')}
          </text>
        </>
      )}
      {sites
        .filter((p) => p.requires?.length)
        .map((p) =>
          p.requires!.map((r) => {
            const a = at(r)
            if (!a || !p.map) return null
            return <line key={p.id + r} x1={a[0]} y1={a[1]} x2={p.map[0]} y2={p.map[1]} stroke="#fff" strokeOpacity="0.55" strokeDasharray="1.4 1.4" strokeWidth="0.6" />
          }),
        )}
      <text x={(at('landing')?.[0] ?? 50) + 3} y={(at('landing')?.[1] ?? 50) + 6} fontSize="3.2" fill="#ffd166">
        🏠 {t('baseLabel')}
      </text>
      {sites.map((p) => {
        const s = projectStatus(p, game, content)
        const chosen = plan.start === p.id
        const fill = s === 'done' ? '#6fdc9a' : chosen || s === 'running' ? '#ffb36b' : s === 'locked' ? '#ffffff55' : '#fff'
        return (
          <g key={p.id}>
            <circle cx={p.map![0]} cy={p.map![1]} r={chosen || s === 'running' ? 2.6 : 2} fill={fill} stroke="#2a0f04" strokeWidth="0.6" />
            <text x={p.map![0]} y={p.map![1] - 3.4} textAnchor="middle" fontSize="3" fontWeight="800" fill="#fff" stroke="#000" strokeWidth="0.5" paintOrder="stroke">
              {p.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function ProjectsDialog({ kind }: { kind: 'explore' | 'build' }) {
  const content = useGame((s) => s.content)
  const close = useGame((s) => s.openModal)
  const explore = kind === 'explore'
  const projects = content.projects.filter((p) => (explore ? p.kind !== 'upgrade' : p.kind === 'upgrade'))
  const moon = content.id === 'moon'
  return (
    <Dialog
      title={explore ? `🗺️ ${t(moon ? 'exploreMoon' : 'exploreMars')}` : `🏗️ ${t('buildTitle')}`}
      onClose={() => close(null)}
      className={explore ? 'wide projects-dialog explore' : 'wide projects-dialog'}
    >
      <p className="muted">{tk(explore ? (moon ? 'exploreHowMoon' : 'exploreHow') : 'buildHow')}</p>
      <div className="projects-layout">
        {explore && <SiteMap content={content} projects={projects} />}
        <div className="project-list column">
          {projects.map((p) => (
            <ProjectCard key={p.id} p={p} thumb={p.photo && photoById(p.photo) ? p.photo : undefined} />
          ))}
        </div>
      </div>
    </Dialog>
  )
}

/** Two status rows in the dock: what the rover is doing, and what is being built. */
export function Slots() {
  const content = useGame((s) => s.content)
  const game = useGame((s) => s.game)
  const plan = useGame((s) => s.plan)
  const open = useGame((s) => s.openModal)
  const busy = (kinds: string[]) => {
    const running = game.active.map((a) => ({ p: content.projects.find((x) => x.id === a.id)!, left: a.left })).filter((x) => kinds.includes(x.p.kind))
    const starting = plan.start ? content.projects.find((x) => x.id === plan.start && kinds.includes(x.kind)) : undefined
    return { running, starting }
  }
  const rover = busy(['expedition', 'flight'])
  const build = busy(['upgrade'])
  const canExplore = content.projects.some((p) => p.kind !== 'upgrade' && projectStatus(p, game, content) === 'ready')
  const canBuild = content.projects.some((p) => p.kind === 'upgrade' && projectStatus(p, game, content) === 'ready')
  const line = (b: ReturnType<typeof busy>, idle: string) =>
    b.starting
      ? `${b.starting.icon} ${t('startingNamed', { name: b.starting.label })}`
      : b.running.length
        ? b.running.map((r) => `${r.p.icon} ${t('runningNamed', { name: r.p.label, count: count(r.left) })}`).join(' · ')
        : idle
  return (
    <div className="slots">
      <button className={`slot ${canExplore && !rover.starting ? 'invite' : ''}`} onClick={() => open('explore')} data-coach="explore">
        <span aria-hidden>🗺️</span>
        <span>{line(rover, t(content.id === 'moon' ? 'roverIdleMoon' : 'roverIdle'))}</span>
      </button>
      <button className={`slot ${canBuild && !build.starting ? 'invite' : ''}`} onClick={() => open('build')}>
        <span aria-hidden>🏗️</span>
        <span>{line(build, t(canBuild ? 'buildIdleCan' : 'buildIdle'))}</span>
      </button>
    </div>
  )
}
