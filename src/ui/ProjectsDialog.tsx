import { photoById } from '../content/photos'
import { count, t, tk } from '../i18n'
import { projectStatus } from '../sim/engine'
import type { Content, Project } from '../sim/types'
import { useGame } from '../state/store'
import { Dialog } from './Collections'
import { ProjectCard } from './Projects'

/**
 * A real map of the landing area from orbit, with each site where it really is.
 * Mars: Jezero Crater from ESA's Mars Express; the old river enters from the left and spreads into the delta.
 * Moon: the south pole from NASA's Clementine, with the pole at the centre and the near side (Earth) at the top.
 */
type Label = { x: number; y: number; anchor: 'start' | 'middle' | 'end' }

/** Puts each site's name above its dot, or below or beside it when that would cover another name. */
function placeLabels(sites: Project[], base?: [number, number], baseText = '') {
  // Every dot, and the base label, are taken before any name is placed.
  const boxes: [number, number, number, number][] = sites.map((p) => [p.map![0] - 2.2, p.map![1] - 2.2, p.map![0] + 2.2, p.map![1] + 2.2])
  if (base) boxes.push([base[0] + 2.6, base[1] + 3.2, base[0] + 5 + baseText.length * 1.7, base[1] + 6.6])
  const out: Record<string, Label> = {}
  for (const p of sites) {
    const [x, y] = p.map!
    const w = p.label.length * 1.6 + 1
    const tries: [Label, [number, number, number, number]][] = [
      [{ x, y: y - 3.4, anchor: 'middle' }, [x - w / 2, y - 6.2, x + w / 2, y - 2.6]],
      [{ x, y: y + 5.6, anchor: 'middle' }, [x - w / 2, y + 2.8, x + w / 2, y + 6.4]],
      [{ x: x + 3, y: y + 1, anchor: 'start' }, [x + 2.6, y - 1.8, x + 3 + w, y + 1.8]],
      [{ x: x - 3, y: y + 1, anchor: 'end' }, [x - 3 - w, y - 1.8, x - 2.6, y + 1.8]],
    ]
    const own = (b: [number, number, number, number]) => boxes.filter((o) => !(o[0] === x - 2.2 && o[1] === y - 2.2)).some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1])
    const pick = tries.find(([, b]) => !own(b) && b[0] > 0 && b[2] < 100) ?? tries[0]
    boxes.push(pick[1])
    out[p.id] = pick[0]
  }
  return out
}

function SiteMap({ content, projects }: { content: Content; projects: Project[] }) {
  const game = useGame((s) => s.game)
  const plan = useGame((s) => s.plan)
  const moon = content.id === 'moon'
  const sites = projects.filter((p) => p.map)
  const at = (id: string) => sites.find((p) => p.id === id)?.map
  const base = at('landing')
  const labels = placeLabels(sites, base, t('baseLabel'))
  return (
    <figure className="site-map">
      <svg viewBox="0 0 100 100" role="img" aria-label={t(moon ? 'mapMoon' : 'mapMars')}>
        <defs>
          <clipPath id="map-frame">
            <rect x="1" y="1" width="98" height="98" rx="6" />
          </clipPath>
          <radialGradient id="map-fade" cx="50%" cy="50%" r="72%">
            <stop offset="0.6" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.55" />
          </radialGradient>
        </defs>
        <g clipPath="url(#map-frame)">
          <image href={`${import.meta.env.BASE_URL}maps/${moon ? 'moon-pole' : 'jezero'}.jpg`} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid slice" />
          <rect x="0" y="0" width="100" height="100" fill="url(#map-fade)" />
        </g>
        <rect x="1" y="1" width="98" height="98" rx="6" fill="none" stroke="#00000088" strokeWidth="1.5" />
        {moon && (
          <text x="50" y="6.5" textAnchor="middle" fontSize="3" fill="#cfe3ff" stroke="#000" strokeWidth="0.45" paintOrder="stroke">
            ↑ {t('towardEarth')}
          </text>
        )}
        {sites
          .filter((p) => p.requires?.length)
          .map((p) =>
            p.requires!.map((r) => {
              const a = at(r)
              if (!a || !p.map) return null
              return <line key={p.id + r} x1={a[0]} y1={a[1]} x2={p.map[0]} y2={p.map[1]} stroke="#fff" strokeOpacity="0.7" strokeDasharray="1.4 1.4" strokeWidth="0.6" />
            }),
          )}
        {base && (
          <text x={base[0] + 3} y={base[1] + 6} fontSize="3.2" fill="#ffd166" stroke="#000" strokeWidth="0.45" paintOrder="stroke" fontWeight="700">
            🏠 {t('baseLabel')}
          </text>
        )}
        {sites.map((p) => {
          const s = projectStatus(p, game, content)
          const chosen = plan.start === p.id
          const fill = s === 'done' ? '#6fdc9a' : chosen || s === 'running' ? '#ffb36b' : s === 'locked' ? '#ffffff88' : '#fff'
          return (
            <g key={p.id}>
              <circle cx={p.map![0]} cy={p.map![1]} r={chosen || s === 'running' ? 2.6 : 2} fill={fill} stroke="#2a0f04" strokeWidth="0.6" />
              <text x={labels[p.id].x} y={labels[p.id].y} textAnchor={labels[p.id].anchor} fontSize="3" fontWeight="800" fill="#fff" stroke="#000" strokeWidth="0.5" paintOrder="stroke">
                {p.label}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(moon ? 'mapCreditMoon' : 'mapCreditMars')}</figcaption>
    </figure>
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
