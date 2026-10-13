import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { Glow, T, clamp, lerp, useLite, useScene } from './shared'
import { Teacher, TAU } from './parts'

const KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'GROUP BY', 'INSERT', 'UPDATE', 'PRIMARY KEY', 'COUNT()', 'ORDER BY', 'FOREIGN KEY', 'DELETE',
]

/** ฉาก 0 — ปก: ทรงกระบอกฐานข้อมูล 3 ชั้น + คีย์เวิร์ด SQL + ครูเอสคิวโผล่จากด้านล่าง */
export default function Cover() {
  const st = useScene()
  const lite = useLite()
  const db = useRef<THREE.Group>(null)
  const orbit = useRef<THREE.Group>(null)
  const teacher = useRef<THREE.Group>(null)
  const layers = [0, 1, 2]

  useFrame((s, dt) => {
    if (db.current) db.current.rotation.y += dt * 0.25
    if (orbit.current) orbit.current.rotation.y -= dt * 0.12
    if (teacher.current) {
      const k = clamp(st.current.time / 2.4, 0, 1)
      const e = 1 - Math.pow(1 - k, 3)
      teacher.current.position.y = lerp(-8, -1.7, e) + Math.sin(s.clock.elapsedTime * 1.3) * 0.08 * e
    }
  })

  return (
    <group scale={0.84}>
      <group ref={db} position={[0, 0.6, 0]}>
        {layers.map((i) => (
          <group key={i} position={[0, (i - 1) * 1.05, 0]}>
            <mesh>
              <cylinderGeometry args={[2.1, 2.1, 0.78, 48]} />
              <meshStandardMaterial color="#0f3b66" emissive="#0ea5e9" emissiveIntensity={0.22} metalness={0.55} roughness={0.28} />
            </mesh>
            <mesh position={[0, 0.395, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[2.1, 48]} />
              <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.45} transparent opacity={0.55} />
            </mesh>
            <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[2.11, 0.025, 8, 64]} />
              <meshBasicMaterial color="#7dd3fc" />
            </mesh>
            <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[2.11, 0.025, 8, 64]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          </group>
        ))}
      </group>
      <Glow color="#0ea5e9" size={9} opacity={0.35} position={[0, 0.6, -1]} />

      {/* คีย์เวิร์ด SQL ลอยรอบ */}
      <group ref={orbit} position={[0, 0.6, 0]}>
        {KEYWORDS.map((k, i) => {
          const a = (i / KEYWORDS.length) * TAU
          const r = 3.6 + (i % 3) * 0.55
          const y = Math.sin(i * 1.9) * 1.8
          return (
            <Billboard key={k} position={[Math.cos(a) * r, y, Math.sin(a) * r]}>
              <T size={0.34} bold color={i % 2 ? '#7dd3fc' : '#c4b5fd'} outlineWidth={0.012} outlineColor="#020617">
                {k}
              </T>
            </Billboard>
          )
        })}
      </group>

      <group ref={teacher} position={[2.7, -8, 2.2]}>
        <Teacher scale={0.95} />
      </group>
      <Sparkles count={lite ? 25 : 70} scale={[12, 8, 6]} size={2.4} speed={0.3} color="#7dd3fc" />
    </group>
  )
}
