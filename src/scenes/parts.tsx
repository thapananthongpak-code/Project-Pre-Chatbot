import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { T } from './shared'

/** สุ่มแบบกำหนด seed ได้ (ผลเหมือนเดิมทุกครั้ง) */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const TAU = Math.PI * 2

/** ตัวละคร "ครูเอสคิว" — หุ่นครูใส่หมวกครุศาสตร์ */
export function Teacher({
  scale = 1,
  position,
  rotation,
  wave = true,
}: {
  scale?: number
  position?: [number, number, number]
  rotation?: [number, number, number]
  wave?: boolean
}) {
  const g = useRef<THREE.Group>(null)
  const arm = useRef<THREE.Group>(null)
  const eyes = useRef<THREE.Group>(null)
  const ball = useRef<THREE.Mesh>(null)

  useFrame((s) => {
    const t = s.clock.elapsedTime
    if (g.current) g.current.rotation.y = Math.sin(t * 0.6) * 0.18
    if (arm.current) arm.current.rotation.z = wave ? -2.2 + Math.sin(t * 5) * 0.35 : -0.25
    if (eyes.current) eyes.current.scale.y = Math.sin(t * 1.3) > 0.985 ? 0.1 : 1
    if (ball.current) (ball.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 1 + Math.sin(t * 3) * 0.5
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={g}>
        {/* ตัว */}
        <mesh position={[0, 0, 0]}>
          <capsuleGeometry args={[0.5, 0.8, 8, 20]} />
          <meshStandardMaterial color="#2563eb" roughness={0.35} metalness={0.25} />
        </mesh>
        {/* ป้าย SQL */}
        <RoundedBox args={[0.7, 0.4, 0.06]} radius={0.08} position={[0, 0.05, 0.5]}>
          <meshStandardMaterial color="#0f172a" emissive="#38bdf8" emissiveIntensity={0.35} />
        </RoundedBox>
        <T position={[0, 0.05, 0.55]} size={0.22} bold color="#7dd3fc">
          SQL
        </T>
        {/* หัว */}
        <RoundedBox args={[1.35, 1.05, 1.05]} radius={0.28} smoothness={5} position={[0, 1.25, 0]}>
          <meshStandardMaterial color="#e0f2fe" roughness={0.3} metalness={0.15} />
        </RoundedBox>
        <RoundedBox args={[1.05, 0.58, 0.06]} radius={0.16} position={[0, 1.27, 0.53]}>
          <meshStandardMaterial color="#0b1226" roughness={0.2} metalness={0.6} />
        </RoundedBox>
        <group ref={eyes} position={[0, 1.34, 0.58]}>
          {[-0.26, 0.26].map((x) => (
            <mesh key={x} position={[x, 0, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshBasicMaterial color="#67e8f9" />
            </mesh>
          ))}
        </group>
        <mesh position={[0, 1.13, 0.58]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.15, 0.025, 8, 20, Math.PI]} />
          <meshBasicMaterial color="#67e8f9" />
        </mesh>
        {/* เสาอากาศ */}
        <mesh position={[0.45, 1.95, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.4, 8]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        <mesh ref={ball} position={[0.45, 2.2, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1} />
        </mesh>
        {/* หมวกครุศาสตร์ */}
        <mesh position={[0, 1.88, 0]}>
          <cylinderGeometry args={[0.45, 0.5, 0.22, 20]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.02, 0]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[1.5, 0.07, 1.5]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh position={[0.7, 1.86, 0.7]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6} />
        </mesh>
        {/* แขน */}
        <group ref={arm} position={[0.62, 0.3, 0]} rotation={[0, 0, -2.2]}>
          <mesh position={[0, -0.4, 0]}>
            <capsuleGeometry args={[0.13, 0.55, 6, 12]} />
            <meshStandardMaterial color="#3b82f6" roughness={0.4} />
          </mesh>
        </group>
        <mesh position={[-0.7, 0.05, 0]} rotation={[0, 0, 0.25]}>
          <capsuleGeometry args={[0.13, 0.6, 6, 12]} />
          <meshStandardMaterial color="#3b82f6" roughness={0.4} />
        </mesh>
        {/* ขา/ฐาน */}
        <mesh position={[0, -0.95, 0]}>
          <cylinderGeometry args={[0.55, 0.7, 0.18, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

/** คนแบบเรียบง่าย (ผู้เรียน/ผู้ทดสอบ) */
export function Person({
  color = '#38bdf8',
  position,
  scale = 1,
  bob = 0,
}: {
  color?: string
  position?: [number, number, number]
  scale?: number
  bob?: number
}) {
  const g = useRef<THREE.Group>(null)
  useFrame((s) => {
    if (g.current) g.current.position.y = Math.sin(s.clock.elapsedTime * 1.6 + bob) * 0.06
  })
  return (
    <group position={position} scale={scale}>
      <group ref={g}>
        <mesh position={[0, 0.78, 0]}>
          <sphereGeometry args={[0.26, 20, 20]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <capsuleGeometry args={[0.28, 0.5, 8, 16]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.2} emissive={color} emissiveIntensity={0.18} />
        </mesh>
      </group>
    </group>
  )
}

/** กล่องข้อความมุมมน ใช้เป็นโหนด/การ์ด */
export function Plate({
  w = 2,
  h = 0.9,
  d = 0.14,
  color = '#1e293b',
  emissive = '#38bdf8',
  glow = 0.25,
  children,
  position,
  radius = 0.16,
  opacity = 1,
}: {
  w?: number
  h?: number
  d?: number
  color?: string
  emissive?: string
  glow?: number
  children?: React.ReactNode
  position?: [number, number, number]
  radius?: number
  opacity?: number
}) {
  return (
    <group position={position}>
      <RoundedBox args={[w, h, d]} radius={radius} smoothness={4}>
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={glow}
          roughness={0.35}
          metalness={0.35}
          transparent={opacity < 1}
          opacity={opacity}
        />
      </RoundedBox>
      {children}
    </group>
  )
}

/** เรียงตำแหน่งตารางหน่วยความรู้: 12 แถว (บท) × คอลัมน์ตามจำนวนต่อบท */
export function useGrid(units: number[], gap: number) {
  return useMemo(() => {
    const out: { x: number; y: number; row: number }[] = []
    const rows = units.length
    units.forEach((cnt, r) => {
      for (let c = 0; c < cnt; c++) {
        out.push({
          x: (c - (cnt - 1) / 2) * gap,
          y: ((rows - 1) / 2 - r) * gap,
          row: r,
        })
      }
    })
    return out
  }, [units, gap])
}
