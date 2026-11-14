import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { NameTag } from './models'

/** Where each part of the base stands. Labels in the time-lapse pop up over these. */
export const spots = {
  hab: [0, 4.3, 0],
  oxygen: [-3.4, 1.6, 1.0],
  greenhouse: [4.3, 2.0, 1.9],
  shelter: [0, 5.4, 0],
  lab: [2.9, 2.2, -2.9],
  comms: [-2.6, 2.8, -2.4],
  solar: [-6.6, 2.0, -2.6],
  rover: [-6, 2.4, 3.4],
  sky: [0, 6, 0],
  biggerGreenhouse: [7.0, 1.6, 3.2],
  iceDrill: [-5.2, 2.2, -0.6],
  walls: [0, 1, 9.2],
} as const satisfies Record<string, readonly [number, number, number]>


/** A horizontal module joined to the hab: a tube with rings, windows and a round hatch at the end. */
function Module({ angle, from, length, r, windows }: { angle: number; from: number; length: number; r: number; windows?: React.Ref<THREE.MeshStandardMaterial> }) {
  return (
    <group rotation={[0, -angle, 0]}>
      <group position={[from + length / 2, r + 0.12, 0]}>
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[r, r, length, 32]} />
          <meshStandardMaterial color="#e3ddd3" roughness={0.55} />
        </mesh>
        {[-0.5, 0, 0.5].map((k) => (
          <mesh key={k} position={[k * (length - 0.3), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[r + 0.01, 0.045, 8, 40]} />
            <meshStandardMaterial color="#9da2a8" metalness={0.5} roughness={0.35} />
          </mesh>
        ))}
        {/* The round end cap and its hatch. */}
        <mesh position={[length / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
          <sphereGeometry args={[r, 32, 12, 0, Math.PI * 2, 0, Math.PI / 5]} />
          <meshStandardMaterial color="#d6d0c6" roughness={0.5} />
        </mesh>
        <mesh position={[length / 2 + r * 0.2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[r * 0.55, 0.07, 10, 32]} />
          <meshStandardMaterial color="#3a3f47" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[length / 2 + r * 0.19, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[r * 0.5, 32]} />
          <meshStandardMaterial color="#20252c" metalness={0.7} roughness={0.25} />
        </mesh>
        {[-0.22, 0.22].map((k) => (
          <mesh key={k} position={[k * length, r * 0.35, r * 0.94]} rotation={[-0.35, 0, 0]}>
            <boxGeometry args={[0.5, 0.26, 0.04]} />
            <meshStandardMaterial ref={k < 0 ? windows : undefined} color="#ffe2a8" emissive="#ffb54a" emissiveIntensity={0.9} />
          </mesh>
        ))}
        {/* Little feet so it sits on the ground. */}
        {[-0.3, 0.3].map((k) => (
          <mesh key={k} position={[k * length, -r + 0.02, 0]}>
            <boxGeometry args={[0.18, 0.28, r * 1.4]} />
            <meshStandardMaterial color="#6c6f74" metalness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function Hab() {
  const beacon = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (beacon.current) beacon.current.emissiveIntensity = 0.5 + (Math.sin(clock.elapsedTime * 3) > 0.6 ? 2.5 : 0)
  })
  const R = 2.35
  const wall = 1.25
  return (
    <group>
      {/* A footing, the wall with a ring of windows, then the dome on top. */}
      <mesh receiveShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[R + 0.35, R + 0.45, 0.12, 48]} />
        <meshStandardMaterial color="#5f5a55" roughness={0.9} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, wall / 2 + 0.1, 0]}>
        <cylinderGeometry args={[R, R + 0.05, wall, 48]} />
        <meshStandardMaterial color="#d8d1c5" roughness={0.6} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, wall + 0.1, 0]}>
        <sphereGeometry args={[R, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f1ece4" roughness={0.45} metalness={0.05} />
      </mesh>
      {[0, 0.55, 1.15, 1.7].map((dy, i) => {
        const y = wall + 0.1 + dy
        return (
          <mesh key={dy} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[Math.sqrt(Math.max(0.05, R ** 2 - dy ** 2)) + 0.012, i === 0 ? 0.07 : 0.03, 8, 64]} />
            <meshStandardMaterial color={i === 0 ? '#8b8f96' : '#c7c0b4'} metalness={0.4} roughness={0.4} />
          </mesh>
        )
      })}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + 0.2
        return (
          <mesh key={a} position={[Math.cos(a) * (R + 0.03), 0.72, Math.sin(a) * (R + 0.03)]} rotation={[0, -a + Math.PI / 2, 0]}>
            <boxGeometry args={[0.55, 0.32, 0.05]} />
            <meshStandardMaterial color="#ffe2a8" emissive="#ffb54a" emissiveIntensity={1} />
          </mesh>
        )
      })}
      <mesh position={[0, wall + R + 0.12, 0]}>
        <cylinderGeometry args={[0.38, 0.48, 0.16, 24]} />
        <meshStandardMaterial color="#b9b3a8" />
      </mesh>
      <mesh position={[0, wall + R + 0.75, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[0, wall + R + 1.38, 0]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshStandardMaterial ref={beacon} color="#ff5040" emissive="#ff2a1a" />
      </mesh>
      {/* The airlock module faces the landing pad; a second module leads to the lab. */}
      <Module angle={1.95} from={R - 0.3} length={1.9} r={0.72} />
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
    <group position={[-3.4, 0, 1.0]}>
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

export function Greenhouse({ units, position = [4.3, 0, 1.9] as [number, number, number], harvest = 0, r = 1.55 }: { units: number; position?: [number, number, number]; harvest?: number; r?: number }) {
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
    if (screen.current) screen.current.emissiveIntensity = units ? 1.2 + 0.6 * Math.sin(clock.elapsedTime * 6) : 0.5
  })
  return <Module angle={-0.78} from={2.0} length={2.6} r={0.8} windows={screen} />
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

const shieldVertex = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`
const shieldFragment = /* glsl */ `
uniform float strength;
uniform float flash;
varying vec3 vN;
varying vec3 vV;
void main() {
  float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.2);
  vec3 col = mix(vec3(0.45, 0.85, 1.0), vec3(0.75, 1.0, 0.9), flash);
  gl_FragColor = vec4(col, min(0.9, strength * (0.05 + rim * 0.9) + flash * rim * 0.5));
}`

/** The radiation shield: a clear bubble with a glowing edge while the crew shelters. */
export function Shield({ units, hit }: { units: number; hit: number }) {
  const uniforms = useMemo(() => ({ strength: { value: 0 }, flash: { value: 0 } }), [])
  const ref = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.ShaderMaterial>(null)
  useFrame(({ clock }) => {
    // The material keeps its own copy of the uniforms, so change them there.
    const u = mat.current?.uniforms
    if (!u) return
    const target = units ? 0.45 + units * 0.2 : 0
    u.strength.value += (target - u.strength.value) * 0.1
    u.flash.value = units ? hit * (0.5 + 0.5 * Math.sin(clock.elapsedTime * 18)) : 0
    if (ref.current) ref.current.visible = u.strength.value > 0.01
  })
  return (
    <mesh ref={ref} renderOrder={2}>
      <sphereGeometry args={[5.6, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={shieldVertex} fragmentShader={shieldFragment} transparent depthWrite={false} side={THREE.FrontSide} />
    </mesh>
  )
}

function usePanelTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 160
    const g = c.getContext('2d')!
    const grad = g.createLinearGradient(0, 0, 256, 160)
    grad.addColorStop(0, '#2f5be0')
    grad.addColorStop(1, '#1a3196')
    g.fillStyle = grad
    g.fillRect(0, 0, 256, 160)
    // Cells, each with a faint shine.
    for (let x = 0; x < 256; x += 32)
      for (let y = 0; y < 160; y += 32) {
        g.fillStyle = 'rgba(255,255,255,0.06)'
        g.fillRect(x + 3, y + 3, 26, 12)
      }
    g.strokeStyle = '#b8c8f0'
    g.lineWidth = 2
    for (let x = 0; x <= 256; x += 32) g.strokeRect(x, 0, 0, 160)
    for (let y = 0; y <= 160; y += 32) g.strokeRect(0, y, 256, 0)
    g.strokeStyle = '#e6e9ee'
    g.lineWidth = 8
    g.strokeRect(0, 0, 256, 160)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    return t
  }, [])
}

/** Rows of solar arrays tilted toward the Sun, with a battery box and a cable to the hab. */
export function SolarPanels({ extra }: { extra: boolean }) {
  const tex = usePanelTexture()
  const rows = extra ? 3 : 2
  return (
    <group position={[-6.9, 0, -2.6]} rotation={[0, 0.45, 0]} scale={1.25}>
      {Array.from({ length: rows }, (_, r) => (
        <group key={r} position={[0, 0, r * 2.1 - 1.6]}>
          {[-1.4, 1.4].map((x) => (
            <mesh key={x} castShadow position={[x, 0.55, 0]}>
              <cylinderGeometry args={[0.06, 0.08, 1.1, 8]} />
              <meshStandardMaterial color="#8d9196" metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
          {[-1.25, 0, 1.25].map((x) => (
            <mesh key={x} castShadow receiveShadow position={[x, 1.15, 0]} rotation={[-0.55, 0, 0]}>
              <boxGeometry args={[1.2, 0.05, 1.7]} />
              <meshStandardMaterial map={tex} emissive="#1a2f80" emissiveIntensity={0.25} metalness={0.35} roughness={0.28} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh castShadow receiveShadow position={[2.6, 0.4, 1.4]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#e2dccf" roughness={0.6} />
      </mesh>
      <mesh position={[2.6, 0.55, 1.81]}>
        <boxGeometry args={[0.5, 0.12, 0.02]} />
        <meshStandardMaterial color="#6fdc9a" emissive="#2fa860" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[3.8, 0.05, 2.0]} rotation={[0, 0.35, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 2.4, 6]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
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

/** Low berms of packed soil around the base. They leave gaps for the solar field and the rover. */
export function Walls({ moon }: { moon: boolean }) {
  const keepClear = [
    [-6.6, -2.6, 4.6],
    [-5.8, 3.4, 2.4],
  ]
  const blocks = Array.from({ length: 36 }, (_, i) => (i / 36) * Math.PI * 2).filter((a) => {
    const x = Math.cos(a) * 9.2
    const z = Math.sin(a) * 9.2
    return keepClear.every(([cx, cz, r]) => Math.hypot(x - cx, z - cz) > r)
  })
  return (
    <group>
      {blocks.map((a) => (
        <mesh key={a} castShadow receiveShadow position={[Math.cos(a) * 9.2, 0.25, Math.sin(a) * 9.2]} rotation={[0, -a, 0]}>
          <boxGeometry args={[0.9, 0.55, 1.6]} />
          <meshStandardMaterial color={moon ? '#7d7d7f' : '#a85a33'} roughness={1} />
        </mesh>
      ))}
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
const suitWhite = '#f3f0ea'

/** One astronaut: boots, legs, a suit with a coloured stripe, a backpack and a helmet with a gold visor. */
function Astronaut({ color }: { color: string }) {
  const legs = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    legs.current?.children.forEach((l, i) => (l.rotation.x = Math.sin(clock.elapsedTime * 7 + i * Math.PI) * 0.35))
  })
  return (
    <group>
      <group ref={legs}>
        {[-0.11, 0.11].map((x) => (
          <group key={x} position={[x, 0.42, 0]}>
            <mesh castShadow position={[0, -0.2, 0]}>
              <capsuleGeometry args={[0.085, 0.24, 4, 10]} />
              <meshStandardMaterial color={suitWhite} roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.39, 0.03]}>
              <boxGeometry args={[0.17, 0.08, 0.24]} />
              <meshStandardMaterial color="#5b5e63" />
            </mesh>
          </group>
        ))}
      </group>
      <mesh castShadow position={[0, 0.66, 0]}>
        <capsuleGeometry args={[0.2, 0.26, 6, 14]} />
        <meshStandardMaterial color={suitWhite} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.205, 0.205, 0.07, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.72, 0.19]}>
        <boxGeometry args={[0.16, 0.1, 0.04]} />
        <meshStandardMaterial color="#9aa0a8" metalness={0.5} />
      </mesh>
      {[-0.27, 0.27].map((x) => (
        <mesh key={x} castShadow position={[x, 0.66, 0]} rotation={[0, 0, x > 0 ? 0.2 : -0.2]}>
          <capsuleGeometry args={[0.07, 0.26, 4, 8]} />
          <meshStandardMaterial color={suitWhite} roughness={0.7} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.72, -0.2]}>
        <boxGeometry args={[0.34, 0.4, 0.16]} />
        <meshStandardMaterial color="#d9d4cc" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.85, -0.285]}>
        <boxGeometry args={[0.2, 0.06, 0.01]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      <mesh castShadow position={[0, 1.08, 0]}>
        <sphereGeometry args={[0.2, 20, 14]} />
        <meshStandardMaterial color={suitWhite} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.08, 0.06]} rotation={[0.15, 0, 0]}>
        <sphereGeometry args={[0.17, 20, 14, -1.1, 2.2, 0.9, 1.25]} />
        <meshStandardMaterial color="#e0a63a" metalness={0.95} roughness={0.12} />
      </mesh>
      <mesh position={[0, 0.94, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.03, 8, 20]} />
        <meshStandardMaterial color="#a3a8ae" metalness={0.5} />
      </mesh>
    </group>
  )
}

/** Where a crew member stands for a job: outside the walls, a step toward the camera. */
function standAt(spot: readonly [number, number, number]) {
  const v = new THREE.Vector2(spot[0], spot[2])
  if (v.length() < 3.4) v.setLength(3.4)
  else v.y += 1.4
  if (v.length() < 3.2) v.setLength(3.2)
  return new THREE.Vector3(v.x, 0, v.y)
}

/** The crew walks between the hab and the jobs they are doing today. */
export function Crew({ jobs, names }: { jobs: [number, number, number][]; names: string[] }) {
  const refs = useRef<(THREE.Group | null)[]>([])
  useFrame(({ clock }) => {
    refs.current.forEach((g, i) => {
      if (!g) return
      const t = (Math.sin(clock.elapsedTime * 0.3 + i * 2.1) + 1) / 2
      const door = new THREE.Vector3(Math.cos(1.95) * 4.2 + (i - 1) * 0.9, 0, Math.sin(1.95) * 4.2 + 0.6)
      const p = door.lerp(standAt(jobs[i] ?? spots.hab), t)
      const prev = g.position.clone()
      g.position.set(p.x, 0, p.z)
      const moved = prev.distanceTo(g.position)
      if (moved > 0.0005) g.rotation.y = Math.atan2(g.position.x - prev.x, g.position.z - prev.z)
      else g.rotation.y += (0.4 - g.rotation.y) * 0.05
    })
  })
  return (
    <>
      {suit.map((c, i) => (
        <group key={i} ref={(r) => void (refs.current[i] = r)} scale={1.45}>
          <Astronaut color={c} />
          <NameTag name={names[i]} color={c} />
        </group>
      ))}
    </>
  )
}
