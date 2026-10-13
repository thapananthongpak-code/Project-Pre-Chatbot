import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { Glow, Pop, T, useScene } from './shared'
import { Plate, Teacher } from './parts'

type V3 = [number, number, number]
const NODES: { name: string; p: V3; color: string; w: number }[] = [
  { name: 'ผู้เรียน', p: [-3.9, 0, 0], color: '#38bdf8', w: 1.7 },
  { name: 'Flask', p: [-1.2, 0, 0], color: '#a3e635', w: 1.5 },
  { name: 'knowledge_base.py', p: [1.5, 1.95, 0], color: '#34d399', w: 3.0 },
  { name: 'ฐานความรู้', p: [4.4, 0.35, 0], color: '#fbbf24', w: 1.9 },
  { name: 'Gemini', p: [1.5, -1.8, 0], color: '#a78bfa', w: 1.7 },
]
const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [1, 4],
]
// เส้นทางแพ็กเก็ต (ดัชนีโหนด)
const FULL = [0, 1, 2, 3, 2, 1, 4, 1, 0]
const MISS = [0, 1, 2, 3, 2, 1, 0]
const SPEED = 2.6
const PAUSE = 0.45

/** ฉาก 5 — สถาปัตยกรรม 5 โหนด + แพ็กเก็ตแสง และเส้นทาง "ไม่พบข้อมูล" ที่ไม่ผ่าน Gemini */
export default function Chatbot() {
  const st = useScene()
  const packet = useRef<THREE.Group>(null)
  const nodeRefs = useRef<(THREE.Group | null)[]>([])
  const miss = useRef<THREE.Group>(null)
  const clock = useRef(0)
  const lastPath = useRef(false)

  const vec = useMemo(() => NODES.map((n) => new THREE.Vector3(...n.p)), [])

  useFrame((_, dt) => {
    const notFound = useStore.getState().notFound
    if (notFound !== lastPath.current) {
      lastPath.current = notFound
      clock.current = 0
    }
    const path = notFound ? MISS : FULL
    // ความยาวแต่ละช่วง + เวลาหยุดที่โหนด
    const seg: number[] = []
    for (let i = 0; i < path.length - 1; i++) seg.push(vec[path[i]].distanceTo(vec[path[i + 1]]) / SPEED)
    const total = seg.reduce((a, b) => a + b + PAUSE, 0) + 1.2
    clock.current = (clock.current + dt) % total
    let t = clock.current
    let current = 0
    let pos = vec[path[0]].clone()
    let done = true
    for (let i = 0; i < seg.length; i++) {
      if (t < PAUSE) {
        pos = vec[path[i]].clone()
        current = path[i]
        done = false
        break
      }
      t -= PAUSE
      if (t < seg[i]) {
        pos = vec[path[i]].clone().lerp(vec[path[i + 1]], t / seg[i])
        current = t / seg[i] > 0.5 ? path[i + 1] : path[i]
        done = false
        break
      }
      t -= seg[i]
    }
    if (done) {
      pos = vec[path[path.length - 1]].clone()
      current = path[path.length - 1]
    }
    if (packet.current) {
      packet.current.position.copy(pos)
      packet.current.position.z = 0.7
    }
    nodeRefs.current.forEach((g, i) => {
      if (!g) return
      const target = i === current ? 1.16 : 1
      g.scale.setScalar(g.scale.x + (target - g.scale.x) * 0.2)
    })
    if (miss.current) {
      miss.current.visible = notFound && done
    }
    void st
  })

  const notFound = useStore((s) => s.notFound)

  return (
    <group position={[0, 0, 0]}>
      {EDGES.map(([a, b], i) => (
        <Line
          key={i}
          points={[NODES[a].p, NODES[b].p]}
          color={notFound && b === 4 ? '#475569' : '#64748b'}
          lineWidth={2.2}
          dashed={notFound && b === 4}
          dashSize={0.2}
          gapSize={0.15}
        />
      ))}

      {NODES.map((n, i) => (
        <group key={n.name} ref={(el) => void (nodeRefs.current[i] = el)} position={n.p}>
          <Plate w={n.w} h={0.95} color="#0f172a" emissive={n.color} glow={notFound && i === 4 ? 0.02 : 0.45} opacity={notFound && i === 4 ? 0.45 : 1}>
            <T position={[0, 0, 0.1]} size={n.name.length > 12 ? 0.27 : 0.32} bold color="#f8fafc">
              {n.name}
            </T>
          </Plate>
          <group position={[-n.w / 2 + 0.05, 0.55, 0.1]}>
            <mesh>
              <circleGeometry args={[0.2, 24]} />
              <meshBasicMaterial color={n.color} />
            </mesh>
            <T position={[0, 0, 0.01]} size={0.24} bold color="#020617">
              {String(i + 1)}
            </T>
          </group>
        </group>
      ))}

      {/* แพ็กเก็ตแสง */}
      <group ref={packet}>
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial color="#fef3c7" />
        </mesh>
        <Glow color="#fbbf24" size={1.8} opacity={0.9} />
      </group>

      {/* ไม่พบข้อมูล */}
      <group ref={miss} position={[-3.9, 1.35, 0.3]} visible={false}>
        <Plate w={3.6} h={0.7} color="#3b0a1a" emissive="#fb7185" glow={0.6}>
          <T position={[0, 0, 0.1]} size={0.25} bold color="#fecdd3">
            “ไม่มีข้อมูลเรื่องนี้ในตำรา”
          </T>
        </Plate>
      </group>

      {/* แท็บ 1: 3 ประเภท → Hybrid */}
      <Pop when={(s) => s.step === 0} position={[0, 4.15, 0]}>
        {['แบบกฎ', 'แบบค้นคืน', 'แบบสร้างคำตอบ'].map((l, i) => (
          <Plate key={l} position={[(i - 1) * 2.7, 0, 0]} w={2.3} h={0.7} color="#0f172a" emissive={i === 1 || i === 2 ? '#38bdf8' : '#475569'} glow={0.35}>
            <T position={[0, 0, 0.1]} size={0.26} color="#e2e8f0">
              {l}
            </T>
          </Plate>
        ))}
        <T position={[0, -0.95, 0]} size={0.3} bold color="#fde68a">
          ครูเอสคิว = Hybrid · Closed-domain
        </T>
      </Pop>

      {/* แท็บ 2: พัฒนา 7 ขั้น */}
      <Pop when={(s) => s.step === 1} position={[0, -3.5, 0]}>
        {Array.from({ length: 7 }, (_, i) => (
          <group key={i} position={[(i - 3) * 1.25, 0, 0]}>
            <mesh>
              <circleGeometry args={[0.38, 28]} />
              <meshBasicMaterial color={i % 2 ? '#38bdf8' : '#a78bfa'} />
            </mesh>
            <T position={[0, 0, 0.02]} size={0.36} bold color="#020617">
              {String(i + 1)}
            </T>
          </group>
        ))}
      </Pop>

      <Teacher scale={0.55} position={[-4.4, -2.7, 0.5]} />
    </group>
  )
}
