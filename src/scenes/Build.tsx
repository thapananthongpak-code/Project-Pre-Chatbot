import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { BOT_URL } from '../content'
import { Glow, T, damp, useScreenTexture } from './shared'
import { Plate, TAU } from './parts'

const CHIPS = [
  { l: 'Flask', c: '#a3e635', on: true },
  { l: 'knowledge_base.py', c: '#34d399', on: true },
  { l: 'Gemini', c: '#a78bfa', on: true },
  { l: 'localStorage', c: '#38bdf8', on: true },
  { l: 'Vercel', c: '#818cf8', on: true },
  { l: 'LINE', c: '#64748b', on: false },
  { l: 'Telegram', c: '#64748b', on: false },
]

/** ฉาก 9 — แล็ปท็อป 3 มิติแสดงภาพหน้าจอจริง + โมดูลที่ลอยรอบ (LINE/Telegram ยังไม่เชื่อม) */
export default function Build() {
  const tex = useScreenTexture('4-2', 1)
  const laptop = useRef<THREE.Group>(null)
  const chips = useRef<(THREE.Group | null)[]>([])

  useFrame((s, dt) => {
    const t = s.clock.elapsedTime
    if (laptop.current) {
      laptop.current.rotation.y = damp(laptop.current.rotation.y, -0.22 + Math.sin(t * 0.5) * 0.18, 3, dt)
    }
    // ชิปลอยเป็นวงรีในระนาบหน้าจอ (ไม่หมุน จึงหันหน้าเข้ากล้องตลอด)
    chips.current.forEach((g, i) => {
      if (!g) return
      const a = (i / CHIPS.length) * TAU + t * 0.18
      g.position.set(Math.cos(a) * 4.2, Math.sin(a) * 2.5 + 0.7, Math.sin(a) * 1.6 + 1.2)
    })
  })

  return (
    <group>
      <group ref={laptop} position={[0, -0.7, 0]} scale={1.1}>
        {/* ฐาน */}
        <RoundedBox args={[4.6, 0.16, 3.0]} radius={0.06} position={[0, -1.4, 0.4]}>
          <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
        </RoundedBox>
        <mesh position={[0, -1.31, 0.9]}>
          <boxGeometry args={[1.2, 0.01, 0.7]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        {/* จอ */}
        <group position={[0, -1.32, -1.0]} rotation={[-0.12, 0, 0]}>
          <RoundedBox args={[4.6, 2.95, 0.1]} radius={0.08} position={[0, 1.5, 0]}>
            <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.35} />
          </RoundedBox>
          <mesh
            position={[0, 1.5, 0.056]}
            onClick={(e) => {
              e.stopPropagation()
              window.open(BOT_URL, '_blank')
            }}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = '')}
          >
            <planeGeometry args={[4.3, 2.69]} />
            <meshBasicMaterial map={tex} toneMapped={false} />
          </mesh>
        </group>
      </group>
      <Glow color="#2dd4bf" size={8} opacity={0.22} position={[0, 0.5, -1.5]} />

      {CHIPS.map((c, i) => (
        <group key={c.l} ref={(el) => void (chips.current[i] = el)}>
          <Plate w={c.l.length > 10 ? 2.4 : 1.5} h={0.5} color={c.on ? '#0f172a' : '#111827'} emissive={c.c} glow={c.on ? 0.5 : 0.05} radius={0.25} opacity={c.on ? 1 : 0.75}>
            <T position={[0, 0, 0.1]} size={0.22} bold={c.on} color={c.on ? '#f8fafc' : '#94a3b8'}>
              {c.on ? c.l : `${c.l} ✕`}
            </T>
          </Plate>
        </group>
      ))}
    </group>
  )
}
