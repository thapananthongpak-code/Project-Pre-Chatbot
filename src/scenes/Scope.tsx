import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { chapters } from '../content'
import { Glow, Pop, T, damp } from './shared'
import { Person, TAU } from './parts'

const R = 3.1

function ChapterCard({
  n,
  q,
  angle,
  selected,
  onPick,
}: {
  n: number
  q: number
  angle: number
  selected: boolean
  onPick: () => void
}) {
  const flip = useRef<THREE.Group>(null)
  const [hover, setHover] = useState(false)
  const hue = new THREE.Color().setHSL(0.72 - (n / 12) * 0.2, 0.7, 0.55)
  useFrame((_, dt) => {
    if (!flip.current) return
    flip.current.rotation.y = damp(flip.current.rotation.y, selected ? Math.PI : 0, 6, dt)
    const s = damp(flip.current.scale.x, selected ? 1.35 : hover ? 1.12 : 1, 8, dt)
    flip.current.scale.setScalar(s)
  })
  return (
    <group position={[Math.sin(angle) * R, 0, Math.cos(angle) * R]} rotation={[0, angle, 0]}>
      <group
        ref={flip}
        onClick={(e) => {
          e.stopPropagation()
          onPick()
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHover(false)
          document.body.style.cursor = ''
        }}
      >
        <RoundedBox args={[0.95, 1.35, 0.08]} radius={0.12} smoothness={4}>
          <meshStandardMaterial color="#141c3a" emissive={hue} emissiveIntensity={selected ? 0.8 : 0.35} roughness={0.35} metalness={0.4} />
        </RoundedBox>
        <T position={[0, 0.2, 0.06]} size={0.6} bold color="#f8fafc">
          {String(n)}
        </T>
        <T position={[0, -0.45, 0.06]} size={0.17} color="#cbd5e1">
          {`บทที่ ${n}`}
        </T>
        <group rotation={[0, Math.PI, 0]}>
          <T position={[0, 0.25, 0.06]} size={0.17} color="#cbd5e1">
            ข้อสอบในขอบเขต
          </T>
          <T position={[0, -0.15, 0.06]} size={0.5} bold color="#fde68a">
            {String(q)}
          </T>
          <T position={[0, -0.55, 0.06]} size={0.17} color="#cbd5e1">
            ข้อ
          </T>
        </group>
      </group>
    </group>
  )
}

/** ฉาก 2 — การ์ด 12 บทเป็นวงแหวน (คลิกพลิก) + หุ่นผู้ทดสอบ 6 คน แบ่ง 2 สี */
export default function Scope() {
  const ring = useRef<THREE.Group>(null)
  const [sel, setSel] = useState<number | null>(null)
  const spin = useRef(0)

  useFrame((_, dt) => {
    if (!ring.current) return
    spin.current = damp(spin.current, sel === null ? 0.14 : 0, 3, dt)
    ring.current.rotation.y += dt * spin.current
  })

  return (
    <group>
      <group position={[0, 0.5, 0]} rotation={[0.95, 0, 0]}>
        <group ref={ring}>
          {chapters.map((c, i) => (
            <ChapterCard
              key={c.n}
              n={c.n}
              q={c.questions}
              angle={(i / 12) * TAU}
              selected={sel === c.n}
              onPick={() => setSel((p) => (p === c.n ? null : c.n))}
            />
          ))}
        </group>
      </group>

      {/* ข้อความกลางวงแหวนเปลี่ยนตามแท็บ */}
      <group position={[0, 0.5, 0.3]}>
        <Glow color="#a78bfa" size={5} opacity={0.35} />
        <Pop when={(s) => s.step === 0}>
          <T position={[0, 0.25, 0]} size={0.34} color="#c4b5fd">
            เกณฑ์ผ่าน
          </T>
          <T position={[0, -0.3, 0]} size={0.5} bold color="#f8fafc">
            Accuracy ≥ 80%
          </T>
        </Pop>
        <Pop when={(s) => s.step === 1}>
          <T position={[0, 0.25, 0]} size={0.34} color="#c4b5fd">
            ชุดทดสอบ
          </T>
          <T position={[0, -0.3, 0]} size={0.5} bold color="#f8fafc">
            110 × 6 = 660
          </T>
        </Pop>
        <Pop when={(s) => s.step === 2}>
          <T position={[0, 0, 0]} size={0.62} bold color="#f8fafc">
            4 ประโยชน์
          </T>
        </Pop>
      </group>

      {/* ผู้ทดสอบ 6 คน: 3 ภายใน (ฟ้า) + 3 ภายนอก (ส้ม) */}
      <Pop when={(s) => s.step === 1} position={[0, -3.4, 2.0]}>
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <Person key={k} color={k < 3 ? '#38bdf8' : '#fb923c'} position={[(k - 2.5) * 1.05 + (k < 3 ? -0.3 : 0.3), 0, 0]} scale={0.95} bob={k} />
        ))}
      </Pop>
      <Pop when={(s) => s.step === 2} position={[0, -3.3, 1.6]}>
        {['เครื่องมือช่วยเรียน', 'ทบทวนเอง', 'สื่อสำหรับผู้สอน', 'ต้นแบบวิชาอื่น'].map((l, k) => (
          <group key={l} position={[(k - 1.5) * 2.3, 0, 0]}>
            <mesh>
              <icosahedronGeometry args={[0.3, 0]} />
              <meshStandardMaterial color="#a78bfa" emissive="#8b5cf6" emissiveIntensity={0.7} />
            </mesh>
            <T position={[0, -0.55, 0]} size={0.2} color="#e2e8f0">
              {l}
            </T>
          </group>
        ))}
      </Pop>
    </group>
  )
}
