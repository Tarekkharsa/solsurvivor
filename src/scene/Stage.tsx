import { Html, OrbitControls, PerformanceMonitor, Stars } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { fmt } from '../i18n'
import { warning } from '../sim/engine'
import type { Change, Content } from '../sim/types'
import { useGame } from '../state/store'
import { Building, Comms, Crew, Flyer, Greenhouse, Hab, IceDrill, Lab, OxygenMaker, Rover, Shield, SolarPanels, spots, Walls } from './base'
import { Earth, Ground, Rocks, Sky } from './world'
import { Ingenuity, Perseverance } from './models'
import { crew } from '../content/crew'
import { isRtl } from '../i18n'

type Vec = readonly [number, number, number]

/** Where a change in the report came from, so its label pops up in the right place. */
function spotFor(source: string, content: Content): Vec {
  if (source in spots) return spots[source as keyof typeof spots]
  if (source === 'needs') return spots.hab
  if (source === 'harvest') return spots.greenhouse
  if (source === 'upgrades') return [spots.hab[0], spots.hab[1] + 1.2, spots.hab[2]]
  const p = content.projects.find((x) => x.id === source)
  if (p?.kind === 'expedition') return spots.rover
  if (p?.kind === 'flight') return [5.6, 4.6, -1.4]
  if (p?.kind === 'upgrade') return (spots as Record<string, Vec>)[p.id] ?? spots.hab
  return spots.sky
}

function Pop({ change, content, at }: { change: Change; content: Content; at: Vec }) {
  return (
    <Html position={at as unknown as THREE.Vector3Tuple} center distanceFactor={24} zIndexRange={[20, 0]}>
      <div className="pop3d" aria-hidden>
        {Object.entries(change.effects).map(([id, v = 0]) => {
          const r = content.resources.find((x) => x.id === id)
          if (!r || !v) return null
          const good = r.invert ? v < 0 : v > 0
          return (
            <span key={id} className={good ? 'chip good' : 'chip bad'}>
              {r.icon} <bdi dir="ltr">{(v > 0 ? '+' : '−') + fmt(Math.abs(v))}</bdi>
            </span>
          )
        })}
      </div>
    </Html>
  )
}

/** Falling sparks: solar storm particles at night, or dust in a dust storm. */
function Particles({ kind, on }: { kind: 'storm' | 'dust'; on: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const n = kind === 'storm' ? 1400 : 900
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const p = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      p[i * 3] = (Math.random() - 0.5) * 50
      p[i * 3 + 1] = Math.random() * 30
      p[i * 3 + 2] = (Math.random() - 0.5) * 50
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3))
    return g
  }, [n])
  useFrame((_, dt) => {
    const pts = ref.current
    if (!pts) return
    const m = pts.material as THREE.PointsMaterial
    m.opacity += ((on ? (kind === 'storm' ? 0.9 : 0.5) : 0) - m.opacity) * 0.08
    pts.visible = m.opacity > 0.01
    if (!pts.visible) return
    const a = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < n; i++) {
      if (kind === 'storm') {
        a.array[i * 3 + 1] -= dt * 18
        if (a.array[i * 3 + 1] < 0) a.array[i * 3 + 1] = 30
      } else {
        a.array[i * 3] += dt * 6
        a.array[i * 3 + 1] = (a.array[i * 3 + 1] + dt * Math.sin(i) * 0.5 + 30) % 8
        if (a.array[i * 3] > 25) a.array[i * 3] = -25
      }
    }
    a.needsUpdate = true
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        color={kind === 'storm' ? '#9effc8' : '#c98a5a'}
        size={kind === 'storm' ? 0.22 : 0.18}
        transparent
        opacity={0}
        depthWrite={false}
        blending={kind === 'storm' ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  )
}

function Lights({ sun, day, moon, fast }: { sun: THREE.Vector3; day: number; moon: boolean; fast: boolean }) {
  const dir = useRef<THREE.DirectionalLight>(null)
  const amb = useRef<THREE.AmbientLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  useFrame(() => {
    if (dir.current) {
      dir.current.position.copy(sun).multiplyScalar(30)
      dir.current.intensity += ((sun.y > -0.02 ? (moon ? 3.2 : 2.9) : 0) - dir.current.intensity) * 0.1
      dir.current.color.set(sun.y < 0.25 && !moon ? '#ffc890' : '#fff4e6')
    }
    if (amb.current) amb.current.intensity += ((moon ? 0.25 : 0.06 + day * 0.45) - amb.current.intensity) * 0.1
    if (hemi.current) hemi.current.intensity += ((moon ? 0.3 : 0.05 + day * 1.1) - hemi.current.intensity) * 0.1
  })
  return (
    <>
      <ambientLight ref={amb} intensity={0.6} color={moon ? '#9fb0d0' : '#ffd9c0'} />
      <hemisphereLight ref={hemi} args={[moon ? '#334' : '#ffe6cc', moon ? '#111' : '#9a5534', 0.4]} />
      <directionalLight ref={dir} castShadow={!fast} shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-normalBias={0.02} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} />
    </>
  )
}

function FogControl({ color, near, far }: { color: string; near: number; far: number }) {
  useFrame(({ scene }) => {
    if (!scene.fog) scene.fog = new THREE.Fog(color, near, far)
    const f = scene.fog as THREE.Fog
    f.color.lerp(new THREE.Color(color), 0.05)
    f.near += (near - f.near) * 0.05
    f.far += (far - f.far) * 0.05
  })
  return null
}

const TARGET = new THREE.Vector3(0, 1.1, 0.4)

/**
 * A low, three-quarter view of the base with the horizon in shot, like a photo taken nearby.
 * The picture is shifted up so the base sits in the open space between the top bar and the dock.
 */
function CameraRig({ mode }: { mode: 'title' | 'play' | 'lapse' }) {
  const { camera, size } = useThree()
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const aspect = size.width / size.height
    const phone = aspect < 0.8
    const lift = mode === 'play' ? (phone ? 0.27 : 0.28) : mode === 'lapse' ? (phone ? 0.3 : 0.08) : 0.12
    const full = size.height * (1 + lift)
    cam.aspect = size.width / full
    cam.setViewOffset(size.width, full, 0, full - size.height, size.width, size.height)
    const dist = (phone ? 40 : aspect < 1.3 ? 36 : 30) * (mode === 'lapse' && !phone ? 0.86 : mode === 'title' ? 0.72 : 1)
    const dir = new THREE.Vector3(0.4, phone ? 0.42 : 0.34, 0.85).normalize()
    cam.position.copy(TARGET).addScaledVector(dir, dist)
    cam.lookAt(TARGET)
    cam.updateProjectionMatrix()
  }, [camera, size.width, size.height, mode])
  return null
}

/** The time-lapse clock: 0 is morning, 1 is the end of the night. */
function useLapse(active: boolean, seconds: number, onDone: () => void) {
  const [t, setT] = useState(0)
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    if (!active) return setT(0)
    let raf = 0
    const start = performance.now()
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / (seconds * 1000))
      setT(p)
      if (p < 1) raf = requestAnimationFrame(tick)
      else done.current()
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, seconds])
  return t
}

export default function Stage({ seconds, fast: wantFast }: { seconds: number; fast: boolean }) {
  // Auto graphics: drop to the fast look if the frame rate sags on this device.
  const [slow, setSlow] = useState(false)
  const fast = wantFast || slow
  const content = useGame((s) => s.content)
  const game = useGame((s) => s.game)
  const plan = useGame((s) => s.plan)
  const screen = useGame((s) => s.screen)
  useGame((s) => s.lang) // crew name tags follow the language
  const last = useGame((s) => s.last)
  const lapseDone = useGame((s) => s.lapseDone)
  const moon = content.id === 'moon'
  const lapse = screen === 'lapse' && !!last
  const t = useLapse(lapse, seconds, lapseDone)

  const units = lapse ? last.plan.units : plan.units
  const event = lapse ? content.events.find((e) => e.id === last.event) : undefined
  const isProject = (kind: string) =>
    [...game.active.map((a) => a.id), ...(lapse ? (last.plan.start ? [last.plan.start] : []) : plan.start ? [plan.start] : [])].some(
      (id) => content.projects.find((p) => p.id === id)?.kind === kind,
    )
  const building = [...game.active.map((a) => a.id), ...(plan.start && !lapse ? [plan.start] : [])].filter(
    (id) => content.projects.find((p) => p.id === id)?.kind === 'upgrade',
  )
  const done = new Set(game.done)

  // The Sun: mid-morning while planning; crosses the sky in the time-lapse. On the Moon it stays low.
  const angle = lapse ? -0.15 + t * Math.PI * 1.35 : 0.9
  const sun = useMemo(() => {
    const elev = moon ? Math.sin(angle) * 0.18 + (lapse ? 0 : 0.05) : Math.sin(angle)
    return new THREE.Vector3(Math.cos(angle) * (moon ? 1 : 0.9), elev, moon ? Math.sin(angle * 0.7) : -0.35).normalize()
  }, [angle, moon, lapse])
  const day = moon ? 0 : Math.max(0, Math.min(1, sun.y * 5 + 0.3))
  const night = lapse && t > 0.62
  const storm = event?.kind === 'solar' && night ? 1 : 0
  const warned = !lapse && warning(game, content)?.storm ? 0.25 : 0
  const dustNow = !moon && ((lapse && event?.kind === 'dust') || (!lapse && game.powerMods.some((m) => m.turn === game.turn && m.delta < 0 && content.events.find((e) => e.id === m.source)?.kind === 'dust')))

  // Labels pop up one after another through the day.
  const shown = lapse ? last.changes.filter((c) => Object.values(c.effects).some(Boolean)) : []
  const visible = shown.filter((c, i) => {
    const isEvent = c.source === last?.event
    const at = isEvent ? 0.7 : 0.08 + (i / Math.max(1, shown.length)) * 0.5
    return t >= at
  })

  const job = (id: string, fallback: Vec): Vec => (units[id] ? spots[id as keyof typeof spots] : fallback)
  const jobs: [number, number, number][] = [
    [...job('comms', job('shelter', spots.hab))] as [number, number, number],
    [...job('oxygen', spots.solar)] as [number, number, number],
    [...job('greenhouse', job('lab', spots.hab))] as [number, number, number],
  ]

  return (
    <Canvas
      shadows={!fast}
      dpr={fast ? 1 : [1, 1.75]}
      camera={{ position: [8, 7, 17], fov: 46, near: 0.1, far: 800 }}
      gl={{ antialias: !fast, powerPreference: 'high-performance' }}
      frameloop="always"
    >
      <CameraRig mode={lapse ? 'lapse' : screen === 'title' ? 'title' : 'play'} />
      <PerformanceMonitor onDecline={() => setSlow(true)} />
      <Sky sun={sun} day={day} moon={moon} dust={dustNow ? 0.8 : 0} storm={storm + warned} />
      {(moon || night || day < 0.4) && <Stars radius={200} depth={40} count={moon ? 4000 : 2500} factor={4} fade speed={0.3} />}
      {moon && <Earth />}
      <FogControl color={moon ? '#000000' : dustNow ? '#a8673d' : day > 0.3 ? '#e2b48e' : '#140a08'} near={moon ? 60 : dustNow ? 6 : 22} far={moon ? 260 : dustNow ? 40 : 95} />
      <Lights sun={sun} day={day} moon={moon} fast={fast} />
      <Ground moon={moon} />
      <Rocks moon={moon} count={fast ? 60 : 140} />
      <Hab />
      <OxygenMaker units={units.oxygen ?? 0} />
      <Greenhouse units={units.greenhouse ?? 0} harvest={game.pending.reduce((s, p) => s + (p.effects.food ?? 0), 0)} />
      {done.has('biggerGreenhouse') && <Greenhouse units={1} position={[6.2, 0, 2.6]} harvest={3} r={1.2} />}
      <Lab units={units.lab ?? 0} />
      <Comms on={!!units[content.forecastAction]} />
      <SolarPanels extra={done.has('solar')} />
      {done.has('iceDrill') && <IceDrill />}
      {done.has('walls') && <Walls moon={moon} />}
      {building.map((id) => (
        <Building key={id} at={(spots as Record<string, Vec>)[id] ?? spots.solar} />
      ))}
      <Shield units={units[content.shelterAction] ?? 0} hit={storm} />
      {moon ? <Rover out={isProject('expedition')} moon /> : <Perseverance out={isProject('expedition')} />}
      {moon ? <Flyer on={isProject('flight')} moon /> : <Ingenuity flying={isProject('flight')} />}
      <Crew jobs={jobs} names={crew.map((c) => (isRtl() ? c.nameAr : c.name))} />
      {!fast && <Particles kind="storm" on={!!storm} />}
      {!fast && !moon && <Particles kind="dust" on={dustNow} />}
      {visible.map((c, i) => (
        <Pop key={`${c.source}${i}`} change={c} content={content} at={spotFor(c.source, content)} />
      ))}
      <OrbitControls enablePan={false} minDistance={8} maxDistance={60} maxPolarAngle={1.45} target={TARGET.toArray()} autoRotate={lapse || screen === 'title'} autoRotateSpeed={screen === 'title' ? 0.35 : 0.6} enableDamping />
    </Canvas>
  )
}
