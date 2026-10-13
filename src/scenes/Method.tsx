import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { method } from '../content'
import { Glow, Pop, T, useScene } from './shared'
import { Plate, Teacher } from './parts'

const PLATFORMS: { p: [number, number, number]; c: string; l: string; s: string }[] = [
  { p: [-3.4, -2.2, 0.4], c: '#38bdf8', l: 'ศึกษา', s: 'ระยะที่ 1' },
  { p: [0, -0.5, 0], c: '#34d399', l: 'พัฒนา', s: 'ระยะที่ 2' },
  { p: [3.4, 1.2, -0.4], c: '#fb923c', l: 'ประเมิน', s: 'ระยะที่ 3' },
]

/** ฉาก 8 — แท่น 3 ระดับ (ภาพที่ 3-1), สายพาน IPO + Evaluation, เตรียมข้อมูล 6 ขั้น 134 → 172 */
export default function Method() {
  const st = useScene()
  const marker = useRef<THREE.Group>(null)
  const cubes = useRef<THREE.Group>(null)
  const prepDots = useRef<THREE.Group>(null)

  const arc = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(3.6, 1.75, 0.2),
      new THREE.Vector3(3.6, 2.8, 0.2),
      new THREE.Vector3(0, 3.55, 0.2),
      new THREE.Vector3(-3.6, 2.8, 0.2),
      new THREE.Vector3(-3.6, 1.75, 0.2),
    ])
    return c.getPoints(40).map((p) => p.toArray() as [number, number, number])
  }, [])

  useFrame(() => {
    const t = st.current.time
    // ตัวละครไต่ขึ้นทีละแท่น
    if (marker.current) {
      const cyc = (t % 6) / 6
      const k = Math.min(2, Math.floor(cyc * 3))
      const f = cyc * 3 - k
      const a = PLATFORMS[k].p
      const b = PLATFORMS[Math.min(2, k + 1)].p
      const hop = Math.sin(Math.min(1, f * 1.6) * Math.PI) * 0.7
      const e = Math.min(1, f * 1.6)
      marker.current.position.set(a[0] + (b[0] - a[0]) * (k < 2 ? e : 0), a[1] + 0.9 + (b[1] - a[1]) * (k < 2 ? e : 0) + hop, a[2] + 0.2)
    }
    // ลูกบาศก์วิ่งบนสายพาน
    if (cubes.current) {
      cubes.current.children.forEach((c, i) => {
        const p = ((t * 0.22 + i / 6) % 1)
        c.position.x = -4.6 + p * 9.2
        c.position.y = -0.1 + Math.sin(p * Math.PI) * 0.15
        const m = (c as THREE.Mesh).material as THREE.MeshBasicMaterial
        m.color.setHSL(0.55 + p * 0.3, 0.8, 0.6)
      })
    }
    if (prepDots.current) {
      prepDots.current.children.forEach((c, i) => {
        const p = ((t * 0.25 + i / 8) % 1)
        c.position.x = -4.2 + p * 8.4
      })
    }
  })

  return (
    <group>
      {/* step 0 — R&D 3 ระยะ */}
      <Pop when={(s) => s.step === 0}>
        {PLATFORMS.map((p, i) => (
          <group key={p.l} position={p.p}>
            <mesh>
              <boxGeometry args={[3.0, 0.5, 2.3]} />
              <meshStandardMaterial color={p.c} emissive={p.c} emissiveIntensity={0.3} roughness={0.35} metalness={0.3} />
            </mesh>
            <T position={[0, 0.0, 1.17]} size={0.3} bold color="#020617">
              {p.l}
            </T>
            <T position={[0, 0.9, 0.2]} size={0.2} color="#e2e8f0">
              {p.s}
            </T>
            {i < 2 && (
              <mesh position={[1.9, 0.55, 0]} rotation={[0, 0, -0.6]}>
                <coneGeometry args={[0.18, 0.4, 3]} />
                <meshBasicMaterial color="#e2e8f0" />
              </mesh>
            )}
          </group>
        ))}
        <group ref={marker}>
          <Teacher scale={0.34} wave={false} />
        </group>
      </Pop>

      {/* step 1 — IPO + Evaluation */}
      <Pop when={(s) => s.step === 1}>
        <mesh position={[0, -0.55, 0]}>
          <boxGeometry args={[10, 0.35, 1.6]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.4} />
        </mesh>
        {method.ipo.map((it, i) => (
          <group key={it.k} position={[-3.6 + i * 3.6, 0.95, 0]}>
            <Plate w={3.0} h={1.2} color="#0f172a" emissive={['#38bdf8', '#a78bfa', '#34d399'][i]} glow={0.45}>
              <T position={[0, 0.25, 0.1]} size={0.32} bold color="#fff">
                {it.k}
              </T>
              <T position={[0, -0.22, 0.1]} size={0.18} color="#cbd5e1">
                {it.v}
              </T>
            </Plate>
          </group>
        ))}
        <group ref={cubes}>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} position={[0, -0.1, 0.3]}>
              <boxGeometry args={[0.32, 0.32, 0.32]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
          ))}
        </group>
        <Line points={arc} color="#fb923c" lineWidth={2.4} dashed dashSize={0.25} gapSize={0.18} />
        <T position={[0, 4.0, 0.2]} size={0.3} bold color="#fdba74">
          Evaluation
        </T>
      </Pop>

      {/* step 2 — เตรียมข้อมูล 6 ขั้น */}
      <Pop when={(s) => s.step === 2}>
        {method.prep.map((_, i) => (
          <group key={i} position={[-4.2 + i * 1.68, 0.5, 0]}>
            <Plate w={1.35} h={1.35} color="#0f172a" emissive="#60a5fa" glow={0.4} radius={0.2}>
              <T position={[0, 0, 0.1]} size={0.6} bold color="#bfdbfe">
                {String(i + 1)}
              </T>
            </Plate>
          </group>
        ))}
        <group ref={prepDots}>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} position={[0, -0.7, 0.3]}>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshBasicMaterial color="#93c5fd" />
            </mesh>
          ))}
        </group>
        <T position={[-2.6, -2.2, 0]} size={0.7} bold color="#94a3b8">
          134
        </T>
        <T position={[0, -2.2, 0]} size={0.6} bold color="#e2e8f0">
          →
        </T>
        <T position={[2.6, -2.2, 0]} size={0.9} bold color="#34d399">
          172
        </T>
        <T position={[-2.6, -2.95, 0]} size={0.2} color="#94a3b8">
          รายการสารบัญ
        </T>
        <T position={[2.6, -2.95, 0]} size={0.2} color="#86efac">
          หัวข้อความรู้
        </T>
      </Pop>
      <Glow color="#60a5fa" size={11} opacity={0.14} position={[0, 0, -2]} />
    </group>
  )
}
