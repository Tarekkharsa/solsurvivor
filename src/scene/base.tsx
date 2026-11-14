import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { NameTag } from './models'

/** Where each part of the base stands. Labels in the time-lapse pop up over these. */
export const spots = {
  hab: [0, 2.9, 0],
  oxygen: [-3.1, 1.2, 1.2],
  greenhouse: [3.6, 1.9, 1.3],
  shelter: [0, 4.4, 0],
  lab: [0.6, 1.5, -3.0],
  comms: [-2.6, 2.8, -2.4],
  solar: [-6.4, 1.4, -2.4],
  rover: [-6, 2.4, 3.4],
  sky: [0, 6, 0],
  biggerGreenhouse: [6.2, 1.6, 2.6],
  iceDrill: [-5.2, 2.2, -0.6],
  walls: [0, 1, 4.6],
} as const satisfies Record<string, readonly [number, number, number]>

const white = '#eae4dc'

export function Hab() {
  const beacon = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (beacon.current) beacon.current.emissiveIntensity = 0.5 + (Math.sin(clock.elapsedTime * 3) > 0.6 ? 2.5 : 0)
  })
  return (
    <group>
      {/* Wall, then the dome on top. */}
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[1.95, 2.05, 0.7, 48]} />
        <meshStandardMaterial color="#d9d2c6" roughness={0.6} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
        <sphereGeometry args={[1.95, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={white} roughness={0.5} metalness={0.08} />
      </mesh>
      {[0.95, 1.55, 2.1].map((y, i) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[Math.sqrt(Math.max(0.1, 1.95 ** 2 - (y - 0.7) ** 2)) + 0.01, 0.035, 8, 64]} />
          <meshStandardMaterial color={i === 0 ? '#8b8f96' : '#b9b3a8'} metalness={0.4} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 2.7, 0]}>
        <cylinderGeometry args={[0.32, 0.4, 0.12, 24]} />
        <meshStandardMaterial color="#b9b3a8" />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1, 6]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[0, 3.72, 0]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshStandardMaterial ref={beacon} color="#ff5040" emissive="#ff2a1a" />
      </mesh>
      {/* Windows that glow at night, and a door with an airlock. */}
      {[0.4, 1.3, 2.2, 3.1, 4.0, 4.9].map((a) => (
        <mesh key={a} position={[Math.cos(a) * 1.98, 0.42, Math.sin(a) * 1.98]} rotation={[0, -a + Math.PI / 2, 0]}>
          <boxGeometry args={[0.42, 0.2, 0.05]} />
          <meshStandardMaterial color="#ffd89a" emissive="#ffb54a" emissiveIntensity={1.2} />
        </mesh>
      ))}
      <group position={[1.15, 0, 1.75]} rotation={[0, 0.58, 0]}>
        <mesh castShadow position={[0, 0.55, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 1.1, 24]} />
          <meshStandardMaterial color="#cfc8be" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.5, 0.86]}>
          <boxGeometry args={[0.5, 0.75, 0.04]} />
          <meshStandardMaterial color="#5a6470" metalness={0.5} />
        </mesh>
      </group>
      {/* A tunnel to the lab. */}
      <mesh castShadow position={[0.4, 0.45, -2.1]} rotation={[Math.PI / 2, 0, 0.1]}>
        <cylinderGeometry args={[0.42, 0.42, 1.1, 16]} />
        <meshStandardMaterial color="#cfc8be" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function OxygenMaker({ units }: { units: number }) {
  const glow = useRef<THREE.MeshStandardMaterial>(null)
  const bubbles = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (glow.current) glow.current.emissiveIntensity = units ? 0.8 + Math.sin(clock.elapsedTime * 4) * 0.3 * units : 0.05
    bubbles.current?.children.forEach((b, i) => {
      const t = (clock.elapsedTime * (0.5 + units * 0.25) + i / 4) % 1
      b.position.y = 1 + t * 1.6
      b.scale.setScalar(units ? 0.12 * (1 - t) + 0.02 : 0)
    })
  })
  return (
    <group position={[-3.1, 0, 1.2]}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.55, 0.65, 1, 20]} />
        <meshStandardMaterial color="#c9c3bb" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.32, 20, 12]} />
        <meshStandardMaterial ref={glow} color="#bfefff" emissive="#59d0ff" />
      </mesh>
      <group ref={bubbles}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[Math.sin(i * 2) * 0.2, 1, Math.cos(i * 2) * 0.2]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color="#d8f6ff" transparent opacity={0.7} emissive="#7fd8ff" emissiveIntensity={0.6} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function Greenhouse({ units, position = [3.6, 0, 1.3] as [number, number, number], harvest = 0, r = 1.55 }: { units: number; position?: [number, number, number]; harvest?: number; r?: number }) {
  const light = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    if (light.current) light.current.intensity = units ? 3 + units * 3 + Math.sin(clock.elapsedTime * 2) : 0.4
  })
  const dome = useMemo(() => new THREE.SphereGeometry(r, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), [r])
  const edges = useMemo(() => new THREE.EdgesGeometry(dome, 1), [dome])
  const plants = useMemo(() => {
    const out: [number, number, number][] = []
    for (let i = 0; i < 40; i++) {
      const a = i * 2.399
      const d = Math.sqrt(i / 40) * (r - 0.35)
      out.push([Math.cos(a) * d, 0.26, Math.sin(a) * d])
    }
    return out
  }, [r])
  const grow = 0.55 + Math.min(1, harvest / 4) * 0.5
  return (
    <group position={position}>
      <mesh receiveShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[r + 0.12, r + 0.18, 0.2, 40]} />
        <meshStandardMaterial color="#2c2a2a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.21, 0]}>
        <cylinderGeometry args={[r - 0.1, r - 0.1, 0.04, 40]} />
        <meshStandardMaterial color="#4a3020" roughness={1} />
      </mesh>
      {plants.map((p, i) => (
        <mesh key={i} position={p} scale={grow * (0.8 + (i % 3) * 0.15)}>
          <sphereGeometry args={[0.11, 8, 6]} />
          <meshStandardMaterial color={i % 4 ? '#4fbf5a' : '#7ad86a'} emissive="#1e6a26" emissiveIntensity={units ? 0.6 : 0.15} roughness={0.8} />
        </mesh>
      ))}
      <mesh geometry={dome} position={[0, 0.2, 0]}>
        <meshPhysicalMaterial color="#e6f7ff" transparent opacity={0.16} roughness={0.05} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments geometry={edges} position={[0, 0.2, 0]}>
        <lineBasicMaterial color="#f2f2f2" transparent opacity={0.85} />
      </lineSegments>
      <pointLight ref={light} position={[0, 0.9, 0]} color="#ff70d8" distance={4.5} />
    </group>
  )
}

export function Lab({ units }: { units: number }) {
  const screen = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (screen.current) screen.current.emissiveIntensity = units ? 0.6 + 0.4 * Math.sin(clock.elapsedTime * 6) : 0.1
  })
  return (
    <group position={[0.6, 0, -3.0]}>
      <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[2.2, 1.2, 1.6]} />
        <meshStandardMaterial color={white} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.8, 0.8, 2.2, 20, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#d8d2c8" />
      </mesh>
      <mesh position={[0, 0.7, 0.81]}>
        <boxGeometry args={[1.2, 0.4, 0.02]} />
        <meshStandardMaterial ref={screen} color="#9ff" emissive="#4ff" />
      </mesh>
    </group>
  )
}

export function Comms({ on }: { on: boolean }) {
  const dish = useRef<THREE.Group>(null)
  const beam = useRef<THREE.Mesh>(null)
  useFrame(({ clock }, dt) => {
    if (dish.current) dish.current.rotation.y += dt * (on ? 0.6 : 0.05)
    if (beam.current) {
      const m = beam.current.material as THREE.MeshBasicMaterial
      m.opacity = on ? 0.25 + 0.15 * Math.sin(clock.elapsedTime * 5) : 0
    }
  })
  return (
    <group position={[-2.6, 0, -2.4]}>
      <mesh castShadow position={[0, 1, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 2, 8]} />
        <meshStandardMaterial color="#9aa0a8" metalness={0.6} />
      </mesh>
      <group ref={dish} position={[0, 2.1, 0]}>
        <mesh rotation={[-0.9, 0, 0]} castShadow>
          <sphereGeometry args={[0.75, 24, 8, 0, Math.PI * 2, 0, 0.9]} />
          <meshStandardMaterial color="#f2efe9" side={THREE.DoubleSide} metalness={0.3} roughness={0.4} />
        </mesh>
      </group>
      <group position={[0, 2.2, 0]} rotation={[-0.35, 0, 0.3]}>
        <mesh ref={beam} position={[0, 15, 0]}>
          <cylinderGeometry args={[0.7, 0.08, 30, 12, 1, true]} />
          <meshBasicMaterial color="#7fe8ff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
    </group>
  )
}

/** The radiation shield: a glowing dome over the base when the shelter is on. */
export function Shield({ units, hit }: { units: number; hit: number }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (!mat.current) return
    const target = units ? 0.12 + units * 0.08 : 0
    const flash = hit * (0.25 + 0.25 * Math.sin(clock.elapsedTime * 18))
    mat.current.opacity += (target + (units ? flash : 0) - mat.current.opacity) * 0.15
    mat.current.emissiveIntensity = 0.6 + flash * 3
  })
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[5.4, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial ref={mat} color="#8fd3ff" emissive="#3aa0ff" transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

function usePanelTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 96
    const g = c.getContext('2d')!
    g.fillStyle = '#16245a'
    g.fillRect(0, 0, 128, 96)
    g.strokeStyle = '#8fa6d8'
    g.lineWidth = 1.5
    for (let x = 0; x <= 128; x += 16) g.strokeRect(x, 0, 0, 96)
    for (let y = 0; y <= 96; y += 16) g.strokeRect(0, y, 128, 0)
    g.strokeStyle = '#d8dde6'
    g.lineWidth = 4
    g.strokeRect(0, 0, 128, 96)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
}

export function SolarPanels({ extra }: { extra: boolean }) {
  const tex = usePanelTexture()
  const rows = extra ? 4 : 2
  return (
    <group position={[-6.4, 0, -2.4]} rotation={[0, 0.5, 0]}>
      {Array.from({ length: rows * 3 }, (_, i) => {
        const r = Math.floor(i / 3)
        const c = i % 3
        return (
          <group key={i} position={[(c - 1) * 1.5, 0, r * 1.3 - 1]}>
            <mesh position={[0, 0.35, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.7, 6]} />
              <meshStandardMaterial color="#888" />
            </mesh>
            <mesh castShadow position={[0, 0.72, 0]} rotation={[-0.6, 0, 0]}>
              <boxGeometry args={[1.35, 0.04, 1]} />
              <meshStandardMaterial map={tex} metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function IceDrill() {
  const bit = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (bit.current) bit.current.rotation.y += dt * 4
  })
  return (
    <group position={[-5.2, 0, -0.6]}>
      <mesh castShadow position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.12, 0.5, 2.8, 4]} />
        <meshStandardMaterial color="#d97a2b" wireframe />
      </mesh>
      <mesh ref={bit} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.15, 0.02, 1, 8]} />
        <meshStandardMaterial color="#bfefff" metalness={0.8} />
      </mesh>
    </group>
  )
}

export function Walls({ moon }: { moon: boolean }) {
  return (
    <group>
      {Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2
        return (
          <mesh key={i} castShadow position={[Math.cos(a) * 6.4, 0.3, Math.sin(a) * 6.4]} rotation={[0, -a, 0]}>
            <boxGeometry args={[1.5, 0.6, 0.5]} />
            <meshStandardMaterial color={moon ? '#7d7d7f' : '#8a3d1c'} roughness={1} />
          </mesh>
        )
      })}
    </group>
  )
}

/** Scaffolding where an upgrade is being built. */
export function Building({ at }: { at: readonly [number, number, number] }) {
  return (
    <mesh position={[at[0], 0.8, at[2]]}>
      <boxGeometry args={[1.4, 1.6, 1.4]} />
      <meshStandardMaterial color="#ffb02e" wireframe />
    </mesh>
  )
}

/** The rover: home by the base, or out on an expedition. */
export function Rover({ out, moon }: { out: boolean; moon: boolean }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }, dt) => {
    if (!ref.current) return
    const target = out ? new THREE.Vector3(-16, 0, 10) : new THREE.Vector3(-5.6, 0, 3.6)
    ref.current.position.lerp(target, Math.min(1, dt * 0.6))
    ref.current.position.y = 0.05 + (out ? Math.abs(Math.sin(clock.elapsedTime * 6)) * 0.03 : 0)
    ref.current.lookAt(out ? -30 : -2, 0, out ? 20 : -2)
  })
  return (
    <group ref={ref} position={[-5.6, 0, 3.6]}>
      <mesh castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[1.1, 0.35, 1.6]} />
        <meshStandardMaterial color="#f1ede6" />
      </mesh>
      <mesh castShadow position={[0, 1.15, 0.55]}>
        <cylinderGeometry args={[0.05, 0.05, 0.9, 6]} />
        <meshStandardMaterial color="#999" />
      </mesh>
      <mesh position={[0, 1.6, 0.55]}>
        <boxGeometry args={[0.3, 0.2, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {[-0.6, 0, 0.6].flatMap((z) =>
        [-0.62, 0.62].map((x) => (
          <mesh key={`${x}${z}`} position={[x, 0.22, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.2, 0.2, 0.16, 12]} />
            <meshStandardMaterial color={moon ? '#555' : '#333'} />
          </mesh>
        )),
      )}
    </group>
  )
}

/** Mars: a little helicopter. The Moon: an orbiter crossing the sky. */
export function Flyer({ on, moon }: { on: boolean; moon: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const rotor = useRef<THREE.Group>(null)
  useFrame(({ clock }, dt) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    if (moon) {
      ref.current.visible = on
      ref.current.position.set(Math.cos(t * 0.3) * 40, 35, Math.sin(t * 0.3) * 40 - 20)
    } else {
      const y = on ? 4 + Math.sin(t * 1.5) * 0.4 : 0.25
      ref.current.position.y += (y - ref.current.position.y) * Math.min(1, dt * 1.5)
      ref.current.position.x = -6.5 + (on ? Math.sin(t * 0.4) * 3 : 0)
      if (rotor.current) rotor.current.rotation.y += dt * (on ? 40 : 0)
    }
  })
  if (moon)
    return (
      <group ref={ref}>
        <mesh>
          <sphereGeometry args={[0.6, 8, 8]} />
          <meshBasicMaterial color="#fff6c0" />
        </mesh>
      </group>
    )
  return (
    <group ref={ref} position={[-6.5, 0.25, -4.5]}>
      <mesh castShadow>
        <boxGeometry args={[0.35, 0.3, 0.35]} />
        <meshStandardMaterial color="#d7d2c8" />
      </mesh>
      <group ref={rotor} position={[0, 0.45, 0]}>
        <mesh>
          <boxGeometry args={[1.8, 0.02, 0.1]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 0.08, 0]}>
          <boxGeometry args={[1.8, 0.02, 0.1]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos(i * 1.57) * 0.3, -0.25, Math.sin(i * 1.57) * 0.3]} rotation={[Math.sin(i * 1.57) * 0.4, 0, -Math.cos(i * 1.57) * 0.4]}>
          <cylinderGeometry args={[0.015, 0.015, 0.4, 4]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      ))}
    </group>
  )
}

const suit = ['#ffb36b', '#8fd3ff', '#6fdc9a']

/** The crew walks between the hab and the jobs they are doing today. */
export function Crew({ jobs, names }: { jobs: [number, number, number][]; names: string[] }) {
  const refs = useRef<(THREE.Group | null)[]>([])
  useFrame(({ clock }) => {
    refs.current.forEach((g, i) => {
      if (!g) return
      const target = jobs[i] ?? spots.hab
      const t = (Math.sin(clock.elapsedTime * 0.35 + i * 2.1) + 1) / 2
      const door = new THREE.Vector3(Math.cos(i * 2.1) * 2.2, 0, Math.sin(i * 2.1) * 2.2 + 0.5)
      const goal = new THREE.Vector3(target[0] * 0.8, 0, target[2] * 0.8 + 0.9)
      const p = door.lerp(goal, t)
      const prev = g.position.clone()
      g.position.set(p.x, 0.02 + Math.abs(Math.sin(clock.elapsedTime * 7 + i)) * 0.05, p.z)
      if (prev.distanceTo(g.position) > 0.001) g.lookAt(g.position.x + (g.position.x - prev.x), g.position.y, g.position.z + (g.position.z - prev.z))
    })
  })
  return (
    <>
      {suit.map((c, i) => (
        <group key={i} ref={(r) => void (refs.current[i] = r)}>
          <mesh castShadow position={[0, 0.5, 0]}>
            <capsuleGeometry args={[0.2, 0.45, 4, 10]} />
            <meshStandardMaterial color="#f4f1ec" />
          </mesh>
          <mesh position={[0, 0.95, 0]}>
            <sphereGeometry args={[0.22, 16, 12]} />
            <meshStandardMaterial color="#f4f1ec" />
          </mesh>
          <mesh position={[0, 0.96, 0.13]}>
            <sphereGeometry args={[0.15, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.62, -0.2]}>
            <boxGeometry args={[0.3, 0.35, 0.14]} />
            <meshStandardMaterial color={c} />
          </mesh>
          <NameTag name={names[i]} color={c} />
        </group>
      ))}
    </>
  )
}
