import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { Glow, lerp, smooth, useLite, useScene } from './shared'
import { Person, TAU, rng } from './parts'

function questionTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  g.clearRect(0, 0, 128, 128)
  g.fillStyle = '#fff'
  g.font = '700 110px system-ui, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText('?', 64, 70)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const BUBBLE = new THREE.Vector3(3.1, 0.5, 0)
const LEARNER = new THREE.Vector3(-2.4, -0.2, 0)

/** ฉาก 1 — เครื่องหมาย ? รอบผู้เรียน ถูกดูดเข้าฟองแชทที่ส่องแสง */
export default function Problem() {
  const st = useScene()
  const lite = useLite()
  const N = lite ? 26 : 56
  const pts = useRef<THREE.Points>(null)
  const bubble = useRef<THREE.Group>(null)
  const tex = useMemo(() => questionTexture(), [])

  const seeds = useMemo(() => {
    const r = rng(7)
    return Array.from({ length: N }, () => ({
      rad: 1.2 + r() * 2.6,
      a0: r() * TAU,
      h: (r() - 0.5) * 3.6,
      sp: 0.25 + r() * 0.5,
      ph: r(),
      hue: [0.97, 0.08, 0.13, 0.55][Math.floor(r() * 4)],
    }))
  }, [N])

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3))
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 3), 3))
    return g
  }, [N])

  const tmp = useMemo(() => new THREE.Color(), [])

  useFrame(() => {
    const time = st.current.time
    const c = (time % 11) / 11
    const pos = geo.attributes.position as THREE.BufferAttribute
    const colr = geo.attributes.color as THREE.BufferAttribute
    for (let k = 0; k < N; k++) {
      const s = seeds[k]
      const a = s.a0 + time * s.sp
      const ox = LEARNER.x + Math.cos(a) * s.rad
      const oy = LEARNER.y + 0.9 + s.h * 0.6 + Math.sin(a * 1.7) * 0.25
      const oz = Math.sin(a) * s.rad * 0.6
      const pull = smooth(c, 0.5 + s.ph * 0.25, 0.82 + s.ph * 0.12)
      const e = pull * pull * (3 - 2 * pull)
      const bx = BUBBLE.x + Math.cos(a * 3) * 0.25
      const by = BUBBLE.y + Math.sin(a * 2) * 0.25
      pos.setXYZ(k, lerp(ox, bx, e), lerp(oy, by, e) + Math.sin(e * Math.PI) * 0.8, lerp(oz, 0.2, e))
      const fadeIn = smooth(c, 0, 0.08)
      const fadeOut = 1 - smooth(e, 0.85, 1)
      const v = fadeIn * fadeOut
      tmp.setHSL(s.hue, 0.85, 0.62).multiplyScalar(v)
      colr.setXYZ(k, tmp.r, tmp.g, tmp.b)
    }
    pos.needsUpdate = true
    colr.needsUpdate = true
    if (bubble.current) {
      const glow = 1 + smooth(c, 0.55, 0.9) * 0.18 * Math.sin(time * 9)
      bubble.current.scale.setScalar(glow)
    }
  })

  return (
    <group>
      <Person color="#38bdf8" position={[LEARNER.x, -1.5, 0]} scale={1.7} />
      <points ref={pts} geometry={geo} frustumCulled={false}>
        <pointsMaterial
          map={tex}
          size={0.75}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      <group ref={bubble} position={BUBBLE.toArray()}>
        <RoundedBox args={[2.8, 1.7, 0.3]} radius={0.35} smoothness={5}>
          <meshStandardMaterial color="#0b3b57" emissive="#22d3ee" emissiveIntensity={0.55} roughness={0.25} metalness={0.3} />
        </RoundedBox>
        <mesh position={[-0.9, -1.0, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.32, 0.5, 3]} />
          <meshStandardMaterial color="#0b3b57" emissive="#22d3ee" emissiveIntensity={0.55} />
        </mesh>
        {[-0.55, 0, 0.55].map((x) => (
          <mesh key={x} position={[x, 0.05, 0.2]}>
            <sphereGeometry args={[0.17, 16, 16]} />
            <meshBasicMaterial color="#ecfeff" />
          </mesh>
        ))}
        <Glow color="#22d3ee" size={7} opacity={0.5} position={[0, 0, -0.5]} />
      </group>
    </group>
  )
}
