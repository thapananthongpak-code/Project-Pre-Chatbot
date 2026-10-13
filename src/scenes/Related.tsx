import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { Glow, T, damp, useScene } from './shared'
import { Plate } from './parts'

type V3 = [number, number, number]
const P1: V3 = [-3.6, 1.9, 0]
const P2: V3 = [-3.6, -1.9, 0]
const CONCEPTS: { l: string; p: V3 }[] = [
  { l: 'กำหนดผู้ใช้', p: [0.2, 3.0, 0] },
  { l: 'กำหนดขอบเขต', p: [0.2, 1.0, 0] },
  { l: 'กำหนดแหล่งข้อมูล', p: [0.2, -1.0, 0] },
  { l: 'ทดสอบ', p: [0.2, -3.0, 0] },
]
const HUB: V3 = [4.0, 0, 0]

/** ฉาก 7 — การ์ดงานวิจัย 2 ใบ เส้นเชื่อมไปยังแนวคิดที่นำมาใช้ แล้วรวมที่ครูเอสคิว */
export default function Related() {
  const st = useScene()
  const hub = useRef<THREE.Group>(null)
  const c1 = useRef<THREE.Group>(null)
  const c2 = useRef<THREE.Group>(null)

  useFrame((s, dt) => {
    const step = st.current.step
    const bob = Math.sin(s.clock.elapsedTime * 1.2)
    if (c1.current) {
      c1.current.position.y = P1[1] + bob * 0.12
      const k = damp(c1.current.scale.x, step === 0 ? 1.12 : 1, 6, dt)
      c1.current.scale.setScalar(k)
    }
    if (c2.current) {
      c2.current.position.y = P2[1] - bob * 0.12
      const k = damp(c2.current.scale.x, step === 0 || step === 1 ? 1.12 : 1, 6, dt)
      c2.current.scale.setScalar(k)
    }
    if (hub.current) {
      hub.current.rotation.y += dt * 0.6
      hub.current.scale.setScalar(damp(hub.current.scale.x, step === 2 ? 1.25 : 1, 5, dt))
    }
  })

  return (
    <group>
      {/* เส้นเชื่อม */}
      {CONCEPTS.map((c, i) => (
        <group key={c.l}>
          <Line points={[P1, c.p]} color="#9d174d" lineWidth={1.2} transparent opacity={0.55} />
          <Line points={[P2, c.p]} color="#9d174d" lineWidth={1.2} transparent opacity={0.55} />
          <Line points={[c.p, HUB]} color={i % 2 ? '#f472b6' : '#fb7185'} lineWidth={2.2} />
        </group>
      ))}

      <group ref={c1} position={P1}>
        <Plate w={3.3} h={1.7} color="#1a0f24" emissive="#f472b6" glow={0.35}>
          <T position={[0, 0.45, 0.1]} size={0.2} color="#fbcfe8">
            ภาพรวมแชทบอท
          </T>
          <T position={[0, 0.0, 0.1]} size={0.27} bold color="#fff">
            Adamopoulou &amp;
          </T>
          <T position={[0, -0.32, 0.1]} size={0.27} bold color="#fff">
            Moussiades
          </T>
          <T position={[0, -0.66, 0.1]} size={0.22} color="#f9a8d4">
            (2020)
          </T>
        </Plate>
      </group>
      <group ref={c2} position={P2}>
        <Plate w={3.3} h={1.7} color="#1a0f24" emissive="#fb7185" glow={0.35}>
          <T position={[0, 0.45, 0.1]} size={0.2} color="#fecdd3">
            แชทบอทบริการนักศึกษา
          </T>
          <T position={[0, 0.0, 0.1]} size={0.27} bold color="#fff">
            เจษฎา และคณะ
          </T>
          <T position={[0, -0.34, 0.1]} size={0.22} color="#fda4af">
            (2567)
          </T>
          <T position={[0, -0.68, 0.1]} size={0.16} color="#fecdd3">
            PHP · Laravel · MySQL · Dialogflow
          </T>
        </Plate>
      </group>

      {CONCEPTS.map((c) => (
        <Plate key={c.l} position={c.p} w={2.6} h={0.7} color="#0f172a" emissive="#f472b6" glow={0.35} radius={0.3}>
          <T position={[0, 0, 0.1]} size={0.24} color="#fce7f3">
            {c.l}
          </T>
        </Plate>
      ))}

      <group position={HUB}>
        <group ref={hub}>
          <mesh>
            <icosahedronGeometry args={[0.95, 1]} />
            <meshStandardMaterial color="#be185d" emissive="#ec4899" emissiveIntensity={0.7} roughness={0.25} flatShading />
          </mesh>
        </group>
        <Glow color="#ec4899" size={5} opacity={0.5} />
        <T position={[0, -1.5, 0.3]} size={0.3} bold color="#fff">
          ครูเอสคิว
        </T>
      </group>
    </group>
  )
}
