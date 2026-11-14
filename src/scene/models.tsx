import { Html, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const url = (name: string) => `${import.meta.env.BASE_URL}models/${name}.glb`

/** A NASA model, scaled so its longest side is `size`, standing on the ground. */
function NasaModel({ name, size }: { name: string; size: number }) {
  const { scene } = useGLTF(url(name))
  const object = useMemo(() => {
    const o = scene.clone(true)
    const box = new THREE.Box3().setFromObject(o)
    const dims = box.getSize(new THREE.Vector3())
    const k = size / Math.max(dims.x, dims.y, dims.z)
    o.scale.setScalar(k)
    const b2 = new THREE.Box3().setFromObject(o)
    const c = b2.getCenter(new THREE.Vector3())
    o.position.set(-c.x, -b2.min.y, -c.z)
    o.traverse((m) => {
      if ((m as THREE.Mesh).isMesh) {
        m.castShadow = true
        m.receiveShadow = true
      }
    })
    return o
  }, [scene, size])
  return <primitive object={object} />
}

/** NASA's Perseverance rover: parked by the base, or driving out on an expedition. */
export function Perseverance({ out }: { out: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const home = useMemo(() => new THREE.Vector3(-5.8, 0, 3.4), [])
  const away = useMemo(() => new THREE.Vector3(-17, 0, 11), [])
  useFrame(({ clock }, dt) => {
    const g = ref.current
    if (!g) return
    const target = out ? away : home
    const before = g.position.clone()
    g.position.lerp(target, Math.min(1, dt * 0.5))
    g.position.y = out && g.position.distanceTo(target) > 0.3 ? Math.abs(Math.sin(clock.elapsedTime * 7)) * 0.02 : 0
    const v = g.position.clone().sub(before)
    if (v.lengthSq() > 1e-6) g.rotation.y = Math.atan2(v.x, v.z)
  })
  return (
    <group ref={ref} position={home.toArray()} rotation={[0, 0.9, 0]}>
      <NasaModel name="perseverance" size={2.9} />
    </group>
  )
}

/** NASA's Ingenuity helicopter on its pad; it flies when a flight is under way. */
export function Ingenuity({ flying }: { flying: boolean }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }, dt) => {
    const g = ref.current
    if (!g) return
    const t = clock.elapsedTime
    const y = flying ? 3.5 + Math.sin(t * 1.4) * 0.35 : 0.06
    g.position.y += (y - g.position.y) * Math.min(1, dt * 1.2)
    g.position.x = flying ? Math.sin(t * 0.35) * 2.5 : 0
    g.rotation.y = flying ? t * 0.3 : 0
  })
  return (
    <group position={[5.6, 0, -1.4]}>
      <Helipad />
      <group ref={ref}>
        <NasaModel name="ingenuity" size={1.35} />
      </group>
    </group>
  )
}

function Helipad() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')!
    g.fillStyle = '#3b2a22'
    g.beginPath()
    g.arc(128, 128, 126, 0, Math.PI * 2)
    g.fill()
    g.strokeStyle = '#e8dccb'
    g.lineWidth = 12
    g.beginPath()
    g.arc(128, 128, 100, 0, Math.PI * 2)
    g.stroke()
    g.fillStyle = '#e8dccb'
    g.font = 'bold 120px sans-serif'
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.fillText('H', 128, 136)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }, [])
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
      <circleGeometry args={[1.1, 48]} />
      <meshStandardMaterial map={tex} transparent roughness={0.9} />
    </mesh>
  )
}

/** A name tag over a crew member. */
export function NameTag({ name, color }: { name: string; color: string }) {
  return (
    <Html position={[0, 1.45, 0]} center distanceFactor={24} zIndexRange={[10, 0]}>
      <span className="name-tag" style={{ borderColor: color }} aria-hidden>
        {name}
      </span>
    </Html>
  )
}

useGLTF.preload(url('perseverance'))
useGLTF.preload(url('ingenuity'))
