import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { T, useLite } from './shared'
import { Plate } from './parts'

const ITEMS: { l: string; s: string; p: [number, number, number]; c: string }[] = [
  { l: 'ก', s: 'คู่มือ 5 ขั้น', p: [-6.2, 3.2, -2], c: '#38bdf8' },
  { l: 'ข', s: 'ชุดคำถาม 110 ข้อ', p: [6.4, 3.0, -2], c: '#fb923c' },
  { l: 'อ้างอิง', s: 'บรรณานุกรม', p: [6.0, -3.2, -2], c: '#94a3b8' },
]

/** ฉาก 13 — ฉากนิ่ง พื้นหลังอนุภาคเบาๆ ให้อ่านตารางง่าย */
export default function Appendix() {
  const lite = useLite()
  const refs = useRef<(THREE.Group | null)[]>([])
  useFrame((s) => {
    refs.current.forEach((g, i) => {
      if (g) g.position.y = ITEMS[i].p[1] + Math.sin(s.clock.elapsedTime * 0.6 + i) * 0.25
    })
  })
  return (
    <group>
      {ITEMS.map((it, i) => (
        <group key={it.l} ref={(el) => void (refs.current[i] = el)} position={it.p}>
          <Plate w={2.4} h={1.4} color="#0f172a" emissive={it.c} glow={0.25}>
            <T position={[0, 0.2, 0.1]} size={0.5} bold color="#f8fafc">
              {it.l}
            </T>
            <T position={[0, -0.4, 0.1]} size={0.18} color="#94a3b8">
              {it.s}
            </T>
          </Plate>
        </group>
      ))}
      <Sparkles count={lite ? 20 : 60} scale={[16, 9, 6]} size={2} speed={0.15} color="#94a3b8" />
    </group>
  )
}
