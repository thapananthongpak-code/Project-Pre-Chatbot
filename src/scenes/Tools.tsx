import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { tools } from '../content'
import { Pop, T, clamp, lerp, smooth, useScene } from './shared'
import { Plate, TAU } from './parts'

const COLORS = ['#fbbf24', '#a3e635', '#a78bfa', '#38bdf8', '#34d399', '#f472b6', '#6366f1', '#fb923c']
// ลำดับชั้นตามภาพที่ 2-4: ผู้ใช้ → Deploy → เว็บ → ค้นคืน → AI → ข้อมูล …
const ORDER = [5, 6, 1, 0, 2, 4, 3, 7]

/** ฉาก 6 — การ์ดเครื่องมือโคจรรอบแกน แล้วเรียงลงเป็นชั้นเมื่อเลื่อนเข้าฉาก */
export default function Tools() {
  const st = useScene()
  const cards = useRef<(THREE.Group | null)[]>([])
  const test = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const items = tools.items

  useFrame((s) => {
    const { t, time } = st.current
    // t<0 กำลังเข้ามา: 0=โคจร → 1=เรียงชั้น ; t>0 ออกไป: กลับไปโคจร
    const settle = t < 0 ? smooth(t, -0.9, -0.05) : 1 - smooth(t, 0.05, 0.9)
    const hold = Math.max(settle, st.current.active ? clamp(time / 1.2, 0, 1) : 0)
    const k = Math.max(settle, hold)
    ORDER.forEach((itemIdx, slot) => {
      const g = cards.current[itemIdx]
      if (!g) return
      const a = (slot / 8) * TAU + s.clock.elapsedTime * 0.55
      const ox = Math.cos(a) * 4.6
      const oy = Math.sin(a * 2) * 2.2
      const oz = Math.sin(a) * 3.2
      const sx = (slot % 2 ? 0.25 : -0.25)
      const sy = 3.2 - slot * 0.92
      g.position.set(lerp(ox, sx, k), lerp(oy, sy, k), lerp(oz, 0, k))
      g.rotation.set(0, lerp(a * 0.4, 0, k), 0)
    })
    // unittest 17
    const m = test.current
    if (m) {
      const on = st.current.step === 1
      for (let i = 0; i < 17; i++) {
        const pulse = on ? 1 + Math.max(0, Math.sin(s.clock.elapsedTime * 4 - i * 0.5)) * 0.45 : 0.0001
        dummy.position.set(-3.0 + i * 0.34, -4.15, 0.3)
        dummy.scale.setScalar(pulse * 0.19)
        dummy.updateMatrix()
        m.setMatrixAt(i, dummy.matrix)
      }
      m.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group>
      {items.map((it, i) => (
        <group key={it.k} ref={(el) => void (cards.current[i] = el)}>
          <Plate w={3.6} h={0.74} color="#0f172a" emissive={COLORS[i]} glow={0.45}>
            <T position={[0, 0.06, 0.1]} size={it.k.length > 18 ? 0.23 : 0.28} bold color="#f8fafc">
              {it.k}
            </T>
            <T position={[0, -0.22, 0.1]} size={0.15} color="#94a3b8">
              {it.v}
            </T>
          </Plate>
        </group>
      ))}

      <instancedMesh ref={test} args={[undefined, undefined, 17]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#4ade80" />
      </instancedMesh>
      <Pop when={(s) => s.step === 1} position={[-0.3, -4.7, 0.3]}>
        <T size={0.26} bold color="#86efac">
          unittest 17 รายการ ✓
        </T>
      </Pop>

      {/* error 4 กรณี */}
      <Pop when={(s) => s.step === 2} position={[0, 0, 0.4]}>
        {tools.errors.map((_, i) => (
          <group key={i} position={[3.6 + (i % 2) * 0.1, 2.6 - i * 1.6, 0]}>
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.5, 0.5, 0.18]} />
              <meshStandardMaterial color="#f59e0b" emissive="#f97316" emissiveIntensity={0.8} />
            </mesh>
            <T position={[0, 0, 0.12]} size={0.3} bold color="#451a03">
              !
            </T>
            <T position={[0.85, 0, 0]} size={0.22} color="#fde68a" anchorX="left">
              {`error ${i + 1}`}
            </T>
          </group>
        ))}
      </Pop>
    </group>
  )
}
