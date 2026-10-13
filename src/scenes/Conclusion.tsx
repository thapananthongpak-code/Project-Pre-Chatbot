import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { results } from '../content'
import { Glow, Pop, T, useScene } from './shared'
import { Teacher } from './parts'

const START = new THREE.Vector3(-4.0, -2.6, 0)
const GATE = new THREE.Vector3(3.3, 1.0, 0)
const COLORS = ['#38bdf8', '#a78bfa', '#34d399']

/** ฉาก 12 — ถนนเรืองแสง 3 แยก (ข้อเสนอแนะ 3 ข้อ) ไปยังประตูเป้าหมาย 80% */
export default function Conclusion() {
  const st = useScene()
  const orbs = useRef<(THREE.Group | null)[]>([])
  const gate = useRef<THREE.Group>(null)

  const curves = useMemo(
    () =>
      [2.4, 0, -2.2].map((off, i) =>
        new THREE.CatmullRomCurve3([
          START.clone(),
          new THREE.Vector3(-2.2, -1.0 + off * 0.5, 0.4 * (i - 1)),
          new THREE.Vector3(0.6, 0.5 + off, 0.6 * (i - 1)),
          new THREE.Vector3(2.6, 1.0 + off * 0.4, 0.3 * (i - 1)),
          GATE.clone(),
        ]),
      ),
    [],
  )
  const tubes = useMemo(() => curves.map((c) => new THREE.TubeGeometry(c, 60, 0.07, 8, false)), [curves])

  useFrame((s) => {
    const t = s.clock.elapsedTime
    orbs.current.forEach((g, i) => {
      if (!g) return
      const p = (t * 0.12 + i / 3) % 1
      g.position.copy(curves[i].getPoint(p))
    })
    if (gate.current) gate.current.scale.setScalar(1 + Math.sin(t * 2) * 0.015)
    void st
  })

  const gapY = 0.0
  void gapY

  return (
    <group>
      {tubes.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshBasicMaterial color={COLORS[i]} transparent opacity={0.85} />
        </mesh>
      ))}
      {COLORS.map((c, i) => (
        <group key={i} ref={(el) => void (orbs.current[i] = el)}>
          <mesh>
            <sphereGeometry args={[0.3, 20, 20]} />
            <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} />
          </mesh>
          <T position={[0, 0, 0.32]} size={0.3} bold color="#020617">
            {String(i + 1)}
          </T>
        </group>
      ))}

      {/* ประตู 80% */}
      <group ref={gate} position={GATE.toArray()}>
        {[-0.9, 0.9].map((x) => (
          <mesh key={x} position={[x, 0.2, 0]}>
            <boxGeometry args={[0.2, 2.6, 0.2]} />
            <meshStandardMaterial color="#86efac" emissive="#22c55e" emissiveIntensity={0.7} />
          </mesh>
        ))}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[2.0, 0.2, 0.2]} />
          <meshStandardMaterial color="#86efac" emissive="#22c55e" emissiveIntensity={0.7} />
        </mesh>
        <T position={[0, 0.45, 0]} size={0.7} bold color="#bbf7d0">
          80%
        </T>
        <T position={[0, -0.25, 0]} size={0.22} color="#86efac">
          เกณฑ์ผ่าน
        </T>
        <Glow color="#22c55e" size={6} opacity={0.4} position={[0, 0.5, -0.4]} />
      </group>

      {/* ตำแหน่งปัจจุบัน 78.18% */}
      <group position={[-0.4, -3.0, 0.5]}>
        <Pop when={(s) => s.step === 0}>
          <mesh>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.9} />
          </mesh>
          <T position={[0, -0.6, 0]} size={0.34} bold color="#fde68a">
            {`${results.metrics.accuracy.toFixed(2)}%`}
          </T>
          <T position={[0, -1.0, 0]} size={0.22} color="#fcd34d">
            {`ขาดอีก ${results.gap.toFixed(2)}`}
          </T>
        </Pop>
      </group>

      <Teacher scale={0.5} position={[-4.6, -0.6, 0.8]} />
    </group>
  )
}
