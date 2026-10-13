import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { unitsPerChapter } from '../content'
import { Glow, Pop, T, clamp, lerp, smooth, useScene } from './shared'
import { rng, useGrid } from './parts'

const CYCLE = 9
const GAP = 0.2
const CUBE = 0.14
const CLUSTER = new THREE.Vector3(-0.4, 0.5, 0)
const ORB = new THREE.Vector3(3.6, 0.7, 0.4)
const ASK = new THREE.Vector3(-4.3, 0.5, 0)
const COOL = new THREE.Color('#38bdf8')
const LABELS = ['① รับคำถาม', '② ค้นหัวข้อ', '③ Gemini', '④ แสดงคำตอบ']

/** ฉาก 4 — อนุภาคคำถามวิ่งเข้าหา 172 ก้อน ก้อนคะแนนสูงสุดสว่าง แล้วส่งต่อลูกแก้ว Gemini */
export default function Rag() {
  const st = useScene()
  const grid = useGrid(unitsPerChapter, GAP)
  const N = grid.length
  const cubes = useRef<THREE.InstancedMesh>(null)
  const dots = useRef<THREE.InstancedMesh>(null)
  const packet = useRef<THREE.Mesh>(null)
  const orb = useRef<THREE.Mesh>(null)
  const answer = useRef<THREE.Group>(null)
  const labelRefs = useRef<(THREE.Group | null)[]>([])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const scores = useMemo(() => {
    const r = rng(5)
    return grid.map(() => r())
  }, [grid])
  const BEST = 97
  const DOTS = 16
  const base = useMemo(() => new THREE.Color('#1d4ed8'), [])
  const hot = useMemo(() => new THREE.Color('#fbbf24'), [])
  const tmp = useMemo(() => new THREE.Color(), [])

  useEffect(() => {
    const m = cubes.current
    if (!m) return
    grid.forEach((_, i) => m.setColorAt(i, base))
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [grid, base])

  const bestPos = useMemo(() => {
    const g = grid[BEST]
    return new THREE.Vector3(CLUSTER.x + g.x, CLUSTER.y + g.y, 0)
  }, [grid])

  useFrame(() => {
    const t = st.current.time % CYCLE
    // A 0–2 คำถามวิ่งเข้า, B 2–4 ให้คะแนน, C 4–5.5 ส่ง Gemini, D 5.5–9 คำตอบ
    const A = clamp(t / 2, 0, 1)
    const B = smooth(t, 2, 3.6)
    const Cc = smooth(t, 4, 5.5)
    const D = smooth(t, 5.5, 6.6) * (1 - smooth(t, 8.2, 9))

    const m = cubes.current
    if (m) {
      for (let i = 0; i < N; i++) {
        const g = grid[i]
        const isBest = i === BEST
        const s = scores[i]
        const lift = isBest ? B * 0.9 : 0
        dummy.position.set(CLUSTER.x + g.x, CLUSTER.y + g.y, lift)
        const sc = isBest ? 1 + B * 1.4 : 1 + B * s * 0.35
        dummy.scale.setScalar(sc)
        dummy.updateMatrix()
        m.setMatrixAt(i, dummy.matrix)
        if (isBest) tmp.copy(base).lerp(hot, B)
        else tmp.copy(base).lerp(COOL, B * s * 0.9)
        m.setColorAt(i, tmp)
      }
      m.instanceMatrix.needsUpdate = true
      if (m.instanceColor) m.instanceColor.needsUpdate = true
    }

    const d = dots.current
    if (d) {
      for (let k = 0; k < DOTS; k++) {
        const delay = (k / DOTS) * 0.5
        const p = clamp((A - delay) / 0.5, 0, 1)
        const x = lerp(ASK.x, CLUSTER.x - 2.4, p)
        const y = ASK.y + Math.sin(k * 2.1) * 0.9 * (1 - p) + Math.sin(k + t * 3) * 0.1
        dummy.position.set(x, y, Math.cos(k) * 0.4)
        dummy.scale.setScalar(p > 0 && p < 1 ? 1 : p >= 1 ? 0.0001 : 0.0001)
        dummy.updateMatrix()
        d.setMatrixAt(k, dummy.matrix)
      }
      d.instanceMatrix.needsUpdate = true
    }

    if (packet.current) {
      const p = Cc
      packet.current.visible = p > 0.001 && p < 0.999
      packet.current.position.lerpVectors(bestPos.set(bestPos.x, bestPos.y, 0.9), ORB, p)
      packet.current.position.y += Math.sin(p * Math.PI) * 0.8
    }
    if (orb.current) {
      const pulse = 1 + (Cc > 0.9 ? Math.sin(t * 8) * 0.06 : 0)
      orb.current.scale.setScalar(pulse)
      const mat = orb.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 0.5 + Cc * 0.9
    }
    if (answer.current) {
      answer.current.visible = D > 0.01
      answer.current.scale.setScalar(Math.max(0.001, D))
      answer.current.position.y = lerp(-0.2, -1.9, D)
    }
    const stage = t < 2 ? 0 : t < 4 ? 1 : t < 5.5 ? 2 : 3
    labelRefs.current.forEach((g, i) => {
      if (!g) return
      const on = i === stage ? 1.18 : 1
      g.scale.setScalar(lerp(g.scale.x, on, 0.15))
    })
  })

  return (
    <group>
      {/* ผู้ถาม */}
      <mesh position={ASK.toArray()}>
        <icosahedronGeometry args={[0.35, 1]} />
        <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={0.9} />
      </mesh>
      <T position={[ASK.x, ASK.y + 0.8, 0]} size={0.24} color="#a5f3fc">
        คำถาม
      </T>
      <instancedMesh ref={dots} args={[undefined, undefined, DOTS]} frustumCulled={false}>
        <sphereGeometry args={[0.09, 10, 10]} />
        <meshBasicMaterial color="#67e8f9" />
      </instancedMesh>

      {/* 172 ก้อน */}
      <instancedMesh ref={cubes} args={[undefined, undefined, N]} frustumCulled={false}>
        <boxGeometry args={[CUBE, CUBE, CUBE]} />
        <meshStandardMaterial roughness={0.35} metalness={0.2} emissive="#ffffff" emissiveIntensity={0.18} />
      </instancedMesh>
      <T position={[CLUSTER.x, CLUSTER.y + 2.75, 0]} size={0.24} color="#93c5fd">
        ฐานความรู้ 172 หน่วย
      </T>

      {/* ลูกแก้ว Gemini */}
      <mesh ref={orb} position={ORB.toArray()}>
        <sphereGeometry args={[0.95, 40, 40]} />
        <meshStandardMaterial color="#6d28d9" emissive="#8b5cf6" emissiveIntensity={0.6} transparent opacity={0.85} roughness={0.15} metalness={0.4} />
      </mesh>
      <Glow color="#a78bfa" size={5} opacity={0.55} position={ORB.toArray()} />
      <T position={[ORB.x, ORB.y + 1.45, 0]} size={0.26} bold color="#ddd6fe">
        Gemini
      </T>
      <mesh ref={packet}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>

      {/* การ์ดคำตอบ */}
      <group ref={answer} position={[ORB.x, -1.9, 0.6]}>
        <RoundedBox args={[2.6, 1.2, 0.06]} radius={0.12}>
          <meshStandardMaterial color="#f8fafc" roughness={0.6} />
        </RoundedBox>
        {[0.32, 0.05, -0.22, -0.42].map((y, i) => (
          <mesh key={y} position={[-0.2 + (i === 3 ? -0.5 : 0), y, 0.05]}>
            <boxGeometry args={[i === 3 ? 0.9 : 2.0 - i * 0.2, 0.09, 0.01]} />
            <meshBasicMaterial color={i === 0 ? '#2563eb' : '#94a3b8'} />
          </mesh>
        ))}
      </group>

      {/* ภาพที่ 2-2: 4 ขั้น */}
      {LABELS.map((l, i) => (
        <group key={l} ref={(el) => void (labelRefs.current[i] = el)} position={[-4.1 + i * 2.75, -3.6, 0]}>
          <T size={0.25} bold color="#e2e8f0">
            {l}
          </T>
        </group>
      ))}

      {/* Retrieval vs Generation */}
      <Pop when={(s) => s.step === 1} position={[0, 0, 0]}>
        <T position={[CLUSTER.x, CLUSTER.y - 2.85, 0.4]} size={0.36} bold color="#38bdf8" outlineWidth={0.015} outlineColor="#020617">
          Retrieval
        </T>
        <T position={[ORB.x, ORB.y - 1.5, 0.8]} size={0.36} bold color="#c4b5fd" outlineWidth={0.015} outlineColor="#020617">
          Generation
        </T>
      </Pop>
      <Glow color="#34d399" size={12} opacity={0.12} position={[0, 0, -2]} />
    </group>
  )
}
