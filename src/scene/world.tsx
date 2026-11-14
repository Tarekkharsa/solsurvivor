import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/** Small, fast value noise for the ground. */
function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return s - Math.floor(s)
}
function noise(x: number, y: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash(xi, yi)
  const b = hash(xi + 1, yi)
  const c = hash(xi, yi + 1)
  const d = hash(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
const fbm = (x: number, y: number) => noise(x, y) * 0.55 + noise(x * 2.1, y * 2.1) * 0.28 + noise(x * 4.3, y * 4.3) * 0.17

export function heightAt(x: number, z: number, moon: boolean) {
  const r = Math.hypot(x, z)
  const flat = Math.min(1, Math.max(0, (r - 7) / 10))
  let h = (fbm(x * 0.06, z * 0.06) - 0.45) * 7 * flat
  if (moon) {
    // A few craters: a bowl with a raised rim.
    for (const [cx, cz, cr] of [
      [-22, -14, 7],
      [18, -26, 9],
      [30, 12, 5],
      [-12, 28, 6],
    ]) {
      const d = Math.hypot(x - cx, z - cz) / cr
      if (d < 1.4) h += d < 1 ? -2.4 * (1 - d * d) : 1.2 * Math.cos(((d - 1) / 0.4) * (Math.PI / 2))
    }
  }
  return h
}

export function Ground({ moon }: { moon: boolean }) {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(160, 160, 180, 180)
    g.rotateX(-Math.PI / 2)
    const pos = g.attributes.position
    const colors: number[] = []
    const base = new THREE.Color(moon ? '#8e8e8c' : '#b0532a')
    const dark = new THREE.Color(moon ? '#55565a' : '#6e2d14')
    const light = new THREE.Color(moon ? '#b9b9b4' : '#d17a45')
    const c = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = pos.getZ(i)
      pos.setY(i, heightAt(x, z, moon))
      const n = fbm(x * 0.2 + 5, z * 0.2 - 3)
      c.copy(base).lerp(n > 0.5 ? light : dark, Math.abs(n - 0.5) * 1.6)
      colors.push(c.r, c.g, c.b)
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    g.computeVertexNormals()
    return g
  }, [moon])
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} metalness={0} />
    </mesh>
  )
}

export function Rocks({ moon, count = 140 }: { moon: boolean; count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const matrices = useMemo(() => {
    const m: THREE.Matrix4[] = []
    const o = new THREE.Object3D()
    for (let i = 0; i < count; i++) {
      const a = hash(i, 1) * Math.PI * 2
      const r = 9 + hash(i, 2) * 40
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r
      const s = 0.12 + Math.pow(hash(i, 3), 3) * 0.9
      o.position.set(x, heightAt(x, z, moon) + s * 0.3, z)
      o.rotation.set(hash(i, 4) * 3, hash(i, 5) * 3, hash(i, 6) * 3)
      o.scale.set(s, s * 0.7, s)
      o.updateMatrix()
      m.push(o.matrix.clone())
    }
    return m
  }, [moon, count])
  return (
    <instancedMesh
      ref={(r) => {
        ref.current = r
        if (r) matrices.forEach((m, i) => r.setMatrixAt(i, m))
      }}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={moon ? '#77777a' : '#5e2a17'} roughness={1} flatShading />
    </instancedMesh>
  )
}

const skyVertex = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`

const skyFragment = /* glsl */ `
uniform vec3 sunDir;
uniform float day;
uniform float moon;
uniform float dust;
uniform float storm;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  float h = clamp(d.y, 0.0, 1.0);
  vec3 dayTop = mix(vec3(0.76, 0.52, 0.34), vec3(0.0), moon);
  vec3 dayHor = mix(vec3(0.86, 0.64, 0.44), vec3(0.02), moon);
  vec3 col = mix(dayHor, dayTop, pow(h, 0.45));
  col = mix(col, vec3(0.55, 0.33, 0.18), dust * (1.0 - moon));
  vec3 s = normalize(sunDir);
  float sd = max(dot(d, s), 0.0);
  float low = 1.0 - smoothstep(-0.05, 0.35, s.y);
  // Mars sunsets are blue: fine dust scatters blue light forward, around the Sun.
  col = mix(col, vec3(0.38, 0.58, 0.9), pow(sd, 6.0) * low * (1.0 - moon) * 0.95);
  vec3 night = vec3(0.008, 0.01, 0.025);
  col = mix(night, col, day * (1.0 - moon) + moon * 0.0);
  // The Sun itself.
  col += vec3(1.0, 0.92, 0.78) * smoothstep(0.9993, 0.9998, sd) * step(-0.03, s.y);
  col += vec3(1.0, 0.8, 0.6) * pow(sd, 60.0) * 0.35 * step(-0.03, s.y) * (1.0 - dust);
  // A solar storm tints the night sky.
  // Mars auroras are real: MAVEN saw them light up the whole planet in 2017.
  float wave = 0.5 + 0.5 * sin(d.x * 9.0 + d.z * 5.0);
  col += mix(vec3(0.1, 0.6, 0.4), vec3(0.5, 0.2, 0.7), wave) * storm * smoothstep(0.02, 0.5, h) * (1.0 - day) * 0.9;
  gl_FragColor = vec4(col, 1.0);
}`

export function Sky({ sun, day, moon, dust, storm }: { sun: THREE.Vector3; day: number; moon: boolean; dust: number; storm: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({ sunDir: { value: new THREE.Vector3() }, day: { value: 1 }, moon: { value: 0 }, dust: { value: 0 }, storm: { value: 0 } }),
    [],
  )
  useFrame(() => {
    const u = mat.current?.uniforms
    if (!u) return
    u.sunDir.value.copy(sun)
    u.day.value += (day - u.day.value) * 0.15
    u.moon.value = moon ? 1 : 0
    u.dust.value += (dust - u.dust.value) * 0.05
    u.storm.value += (storm - u.storm.value) * 0.1
  })
  return (
    <mesh scale={300} renderOrder={-1}>
      <sphereGeometry args={[1, 48, 24]} />
      <shaderMaterial ref={mat} side={THREE.BackSide} depthWrite={false} fog={false} uniforms={uniforms} vertexShader={skyVertex} fragmentShader={skyFragment} />
    </mesh>
  )
}

/** Earth hanging in the black lunar sky. */
export function Earth() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.05
  })
  return (
    <group position={[-120, 70, -160]}>
      <mesh ref={ref}>
        <sphereGeometry args={[9, 48, 32]} />
        <meshStandardMaterial color="#3a78d6" emissive="#1a3a80" emissiveIntensity={0.5} roughness={0.6} />
      </mesh>
      <mesh scale={1.02}>
        <sphereGeometry args={[9, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.35]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}
