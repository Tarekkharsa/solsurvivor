import { Stars, useTexture } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

/** A point on a globe of radius 1 from latitude and longitude, matching three's sphere UVs. */
export function latLon(lat: number, lon: number) {
  const phi = ((lon + 180) / 360) * Math.PI * 2
  const theta = ((90 - lat) / 180) * Math.PI
  return new THREE.Vector3(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta))
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

function Globe({ moon, seconds, onDone }: { moon: boolean; seconds: number; onDone: () => void }) {
  const tex = useTexture(import.meta.env.BASE_URL + (moon ? 'moon-globe.jpg' : 'mars-globe.jpg'))
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const { camera } = useThree()
  const phobos = useRef<THREE.Mesh>(null)
  const start = useRef<number | null>(null)
  const done = useRef(false)
  // Jezero Crater, 18.4°N 77.5°E; or the lunar south pole.
  const target = moon ? latLon(-80, 0).normalize() : latLon(18.4, 77.5).normalize()
  const from = target.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -1.2).add(new THREE.Vector3(0, 0.25, 0)).normalize()
  useFrame(({ clock }) => {
    if (start.current === null) start.current = clock.elapsedTime
    const p = Math.min(1, (clock.elapsedTime - start.current) / seconds)
    const e = ease(p)
    const dir = from.clone().lerp(target, e).normalize()
    const dist = 4.2 - 3.05 * Math.pow(e, 1.6)
    camera.position.copy(dir.multiplyScalar(dist))
    camera.up.set(0, 1, 0)
    camera.lookAt(target.clone().multiplyScalar(e * 0.95))
    if (phobos.current) {
      const a = clock.elapsedTime * 0.5
      phobos.current.position.set(Math.cos(a) * 2.2, Math.sin(a * 0.7) * 0.4, Math.sin(a) * 2.2)
      phobos.current.rotation.y += 0.01
    }
    if (p >= 1 && !done.current) {
      done.current = true
      onDone()
    }
  })
  return (
    <>
      <mesh rotation={[0, 0, 0]}>
        <sphereGeometry args={[1, 128, 64]} />
        <meshStandardMaterial map={tex} roughness={1} />
      </mesh>
      {!moon && (
        <mesh scale={1.025}>
          <sphereGeometry args={[1, 64, 32]} />
          <meshBasicMaterial color="#e8a070" transparent opacity={0.12} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
      {!moon && (
        <mesh ref={phobos} scale={[0.06, 0.045, 0.05]}>
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#6b5b50" roughness={1} flatShading />
        </mesh>
      )}
    </>
  )
}

/** Sunlight over the landing site, coming a little from the side so craters show. */
function Sun({ moon }: { moon: boolean }) {
  const target = moon ? latLon(-80, 0) : latLon(18.4, 77.5)
  const side = target.clone().cross(new THREE.Vector3(0, 1, 0)).normalize()
  const pos = target.clone().multiplyScalar(5).add(side.multiplyScalar(moon ? 4 : 3)).add(new THREE.Vector3(0, 1.5, 0))
  return <directionalLight position={pos.toArray()} intensity={3.2} />
}

export default function Intro({ moon, seconds, onDone }: { moon: boolean; seconds: number; onDone: () => void }) {
  return (
    <Canvas camera={{ position: [0, 0, 4.2], fov: 40, near: 0.01, far: 200 }} dpr={[1, 1.75]}>
      <color attach="background" args={['#000']} />
      <Stars radius={60} depth={30} count={3000} factor={3} fade />
      <ambientLight intensity={0.15} />
      <Sun moon={moon} />
      <Globe moon={moon} seconds={seconds} onDone={onDone} />
    </Canvas>
  )
}
