import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { levels, outOfScope } from '../content'
import { Glow, Pop, T, damp, useScene } from './shared'

const CELL = 0.5

/** ฉาก 10 — 110 ข้อ (81 + 29) → ตาราง 2×2 สี่สี (ยังว่าง) + แถบเกณฑ์ 5 ระดับเป็นไม้บรรทัดสี */
export default function Evaluation() {
  const st = useScene()
  const cubes = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const spread = useRef(0)

  // 110 ก้อน: 81 ในขอบเขต (น้ำเงิน) + 29 นอกขอบเขต (10/12/7 โทนส้ม)
  const layout = useMemo(() => {
    const arr: { x: number; y: number; color: string }[] = []
    const cols = 11
    const tones = ['#fdba74', '#fb923c', '#f97316']
    let outIdx = 0
    const bounds = [outOfScope[0].n, outOfScope[0].n + outOfScope[1].n]
    for (let i = 0; i < 110; i++) {
      const c = i % cols
      const r = Math.floor(i / cols)
      let color = '#3b82f6'
      if (i >= 81) {
        const k = outIdx++
        color = tones[k < bounds[0] ? 0 : k < bounds[1] ? 1 : 2]
      }
      arr.push({ x: (c - (cols - 1) / 2) * CELL, y: (4.5 - r) * CELL - 0.6, color })
    }
    return arr
  }, [])

  useEffect(() => {
    const m = cubes.current
    if (!m) return
    const c = new THREE.Color()
    layout.forEach((l, i) => {
      c.set(l.color)
      m.setColorAt(i, c)
    })
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [layout])

  useFrame((s, dt) => {
    const target = st.current.step === 0 ? 1 : 0
    spread.current = damp(spread.current, target, 3.5, dt)
    const m = cubes.current
    if (!m) return
    const v = spread.current
    m.visible = v > 0.01
    for (let i = 0; i < 110; i++) {
      const l = layout[i]
      dummy.position.set(l.x * v, l.y * v + Math.sin(s.clock.elapsedTime + i) * 0.02, 0)
      dummy.scale.setScalar(Math.max(0.0001, v * 0.38))
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  })

  const cell = (k: string, label: string, color: string, x: number, y: number) => (
    <group position={[x, y, 0]}>
      <mesh>
        <boxGeometry args={[2.2, 2.2, 0.3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.18} transparent opacity={0.4} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.16]}>
        <planeGeometry args={[2.0, 2.0]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </mesh>
      <T position={[0, 0.25, 0.25]} size={0.62} bold color="#f8fafc">
        {k}
      </T>
      <T position={[0, -0.5, 0.25]} size={0.17} color="#e2e8f0">
        {label}
      </T>
    </group>
  )

  return (
    <group>
      {/* step 0 */}
      <instancedMesh ref={cubes} args={[undefined, undefined, 110]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.35} metalness={0.2} emissive="#ffffff" emissiveIntensity={0.12} />
      </instancedMesh>
      <Pop when={(s) => s.step === 0} position={[0, 3.7, 0]}>
        <T size={0.3} bold color="#fed7aa">
          110 ข้อ = 81 ในขอบเขต + 29 นอกขอบเขต
        </T>
      </Pop>

      {/* step 1 — Confusion Matrix (ยังว่าง) */}
      <Pop when={(s) => s.step === 1} position={[0, 0.2, 0]}>
        {cell('TP', 'ในขอบเขต · ตอบถูก', '#34d399', -1.3, 1.3)}
        {cell('FN', 'ในขอบเขต · ไม่ตอบ', '#fb923c', 1.3, 1.3)}
        {cell('FP', 'ตอบทั้งที่ไม่ควร', '#fb7185', -1.3, -1.3)}
        {cell('TN', 'นอกขอบเขต · ปฏิเสธถูก', '#38bdf8', 1.3, -1.3)}
        <T position={[-1.3, 2.75, 0]} size={0.22} color="#94a3b8">
          ระบบตอบ
        </T>
        <T position={[1.3, 2.75, 0]} size={0.22} color="#94a3b8">
          ระบบไม่ตอบ
        </T>
        <T position={[-3.05, 1.3, 0]} size={0.2} color="#94a3b8" maxWidth={1.2} textAlign="center">
          ควรตอบ
        </T>
        <T position={[-3.05, -1.3, 0]} size={0.2} color="#94a3b8" maxWidth={1.2} textAlign="center">
          ไม่ควรตอบ
        </T>
      </Pop>

      {/* step 2 — เกณฑ์ 5 ระดับ */}
      <Pop when={(s) => s.step === 2} position={[0, 0, 0]}>
        {levels
          .slice()
          .reverse()
          .map((l, i) => (
            <group key={l.key} position={[-4 + i * 2.0 + 0.0, 0, 0]}>
              <mesh>
                <boxGeometry args={[1.95, 0.8, 0.4]} />
                <meshStandardMaterial color={l.color} emissive={l.color} emissiveIntensity={0.35} roughness={0.4} />
              </mesh>
              <T position={[0, 0.08, 0.25]} size={0.2} bold color="#020617">
                {l.label}
              </T>
              <T position={[0, -0.2, 0.25]} size={0.15} color="#020617">
                {l.range}
              </T>
            </group>
          ))}
        <mesh position={[1.0, 0.8, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.2, 0.45, 3]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
        <T position={[1.0, 1.3, 0]} size={0.22} bold color="#fff">
          เกณฑ์ผ่าน 80%
        </T>
        <T position={[0, -1.4, 0]} size={0.24} color="#cbd5e1">
          Accuracy · Precision · Recall · F1
        </T>
      </Pop>
      <Glow color="#fb923c" size={10} opacity={0.12} position={[0, 0, -2]} />
    </group>
  )
}
