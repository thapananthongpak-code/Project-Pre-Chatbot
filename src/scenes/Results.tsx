import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { levelOf, results } from '../content'
import { Glow, Pop, T, clamp, damp, useScene, useScreenTexture } from './shared'

const H = 6 // ความสูงของแกน (50% → 100%)
const BASE_Y = -2.9
const yOf = (acc: number) => BASE_Y + ((acc - 50) / 50) * H
const BLUE = '#38bdf8'
const ORANGE = '#fb923c'

function Screen({ name, variant, x, y, label }: { name: string; variant: number; x: number; y: number; label: string }) {
  const tex = useScreenTexture(name, variant)
  return (
    <group
      position={[x, y, 0]}
      onClick={(e) => {
        e.stopPropagation()
        window.open(`/screens/${name}.png`, '_blank')
      }}
      onPointerOver={() => (document.body.style.cursor = 'zoom-in')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      <RoundedBox args={[3.75, 2.4, 0.08]} radius={0.06}>
        <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[3.55, 2.22]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <T position={[0, -1.4, 0]} size={0.22} color="#cbd5e1">
        {label}
      </T>
    </group>
  )
}

/** แท่งกราฟที่โตขึ้นเมื่อ `on` */
function Bar({ x, acc, color, width, label, sub, on, delay = 0 }: { x: number; acc: number; color: string; width: number; label: string; sub?: string; on: () => boolean; delay?: number }) {
  const g = useRef<THREE.Group>(null)
  const k = useRef(0)
  const pass = acc >= results.threshold
  const hFull = yOf(acc) - BASE_Y
  useFrame((_, dt) => {
    k.current = damp(k.current, on() ? 1 : 0, 3.2, dt)
    const v = clamp((k.current - delay) / (1 - delay), 0, 1)
    if (g.current) g.current.scale.y = Math.max(0.0001, v)
  })
  return (
    <group position={[x, BASE_Y, 0]}>
      <group ref={g}>
        <mesh position={[0, hFull / 2, 0]}>
          <boxGeometry args={[width, hFull, width]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={pass ? 0.55 : 0.22} roughness={0.35} metalness={0.3} />
        </mesh>
        {pass && (
          <mesh position={[0, hFull + 0.04, 0]}>
            <boxGeometry args={[width * 1.04, 0.1, width * 1.04]} />
            <meshBasicMaterial color="#86efac" />
          </mesh>
        )}
      </group>
      <T position={[0, Math.max(hFull + 0.45, yOf(results.threshold) - BASE_Y + 0.5), width / 2]} size={0.27} bold color={pass ? '#86efac' : '#f8fafc'}>
        {acc.toFixed(2)}
      </T>
      <T position={[0, -0.45, width / 2]} size={0.2} color="#cbd5e1">
        {label}
      </T>
      {sub && (
        <T position={[0, -0.75, width / 2]} size={0.16} color="#94a3b8">
          {sub}
        </T>
      )}
    </group>
  )
}

function Axis({ width = 8.4 }: { width?: number }) {
  return (
    <group position={[0, 0, -0.9]}>
      {[50, 60, 70, 90, 100].map((v) => (
        <group key={v}>
          <Line points={[[-width / 2, yOf(v), 0], [width / 2, yOf(v), 0]]} color="#334155" lineWidth={1} />
          <T position={[-width / 2 - 0.45, yOf(v), 0]} size={0.18} color="#64748b">
            {`${v}%`}
          </T>
        </group>
      ))}
      <T position={[0, BASE_Y - 1.25, 0.9]} size={0.15} color="#64748b">
        แกนเริ่มที่ 50%
      </T>
    </group>
  )
}

/** ระนาบโปร่งแสงที่ 80% */
function Threshold({ width = 8.4 }: { width?: number }) {
  const y = yOf(results.threshold)
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, 2.4]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.16} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Line points={[[-width / 2, 0, 1.2], [width / 2, 0, 1.2]]} color="#4ade80" lineWidth={2.5} />
      <Line points={[[-width / 2, 0, -1.2], [width / 2, 0, -1.2]]} color="#4ade80" lineWidth={1} />
      <T position={[-width / 2 - 0.55, 0, 1.2]} size={0.22} bold color="#4ade80">
        80%
      </T>
    </group>
  )
}

/** เกจแบบวงแหวนเป็นส่วนๆ (ใช้ InstancedMesh) */
function Gauge({ value, label, x, y, on }: { value: number; label: string; x: number; y: number; on: () => boolean }) {
  const SEG = 54
  const mesh = useRef<THREE.InstancedMesh>(null)
  const k = useRef(0)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const lvl = levelOf(value)
  const col = useMemo(() => new THREE.Color(lvl.color), [lvl.color])
  const dim = useMemo(() => new THREE.Color('#1e293b'), [])
  const last = useRef(-1)

  useEffect(() => {
    const m = mesh.current
    if (!m) return
    for (let i = 0; i < SEG; i++) {
      const a = (-225 + (i / (SEG - 1)) * 270) * (Math.PI / 180)
      dummy.position.set(Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0)
      dummy.rotation.set(0, 0, a + Math.PI / 2)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
      m.setColorAt(i, dim)
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [dummy, dim])

  useFrame((_, dt) => {
    k.current = damp(k.current, on() ? 1 : 0, 2.2, dt)
    const m = mesh.current
    if (!m) return
    const fill = Math.round((value / 100) * SEG * k.current)
    if (fill !== last.current) {
      last.current = fill
      for (let i = 0; i < SEG; i++) m.setColorAt(i, i < fill ? col : dim)
      if (m.instanceColor) m.instanceColor.needsUpdate = true
    }
  })

  // ขีดเกณฑ์ 80%
  const a80 = (-225 + 0.8 * 270) * (Math.PI / 180)
  return (
    <group position={[x, y, 0]}>
      <instancedMesh ref={mesh} args={[undefined, undefined, SEG]} frustumCulled={false}>
        <boxGeometry args={[0.1, 0.26, 0.12]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <mesh position={[Math.cos(a80) * 1.5, Math.sin(a80) * 1.5, 0]} rotation={[0, 0, a80 + Math.PI / 2]}>
        <boxGeometry args={[0.06, 0.3, 0.06]} />
        <meshBasicMaterial color="#4ade80" />
      </mesh>
      <T position={[0, 0.1, 0]} size={0.46} bold color="#f8fafc">
        {value.toFixed(2)}
      </T>
      <T position={[0, -0.42, 0]} size={0.2} bold color={lvl.color}>
        {lvl.label}
      </T>
      <T position={[0, -1.7, 0]} size={0.26} bold color="#e2e8f0">
        {label}
      </T>
    </group>
  )
}

function Block({ x, y, count, label, color, on, delay }: { x: number; y: number; count: number; label: string; color: string; on: () => boolean; delay: number }) {
  const g = useRef<THREE.Group>(null)
  const k = useRef(0)
  const len = Math.max(0.55, count * 0.0055)
  useFrame((_, dt) => {
    k.current = damp(k.current, on() ? 1 : 0, 2.6, dt)
    const v = clamp((k.current - delay) / (1 - delay), 0, 1)
    if (g.current) g.current.scale.z = Math.max(0.0001, v)
  })
  return (
    <group position={[x, y, 0]}>
      <group ref={g}>
        <mesh position={[0, 0, len / 2]}>
          <boxGeometry args={[2.0, 2.0, len]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.28} roughness={0.35} metalness={0.3} />
        </mesh>
      </group>
      <T position={[0, 0.3, len + 0.02]} size={0.7} bold color="#04101f">
        {String(count)}
      </T>
      <T position={[0, -0.45, len + 0.02]} size={0.3} bold color="#04101f">
        {label}
      </T>
    </group>
  )
}

/** ฉาก 11 — หน้าเว็บจริง · แท่งรายบุคคล · 2 กลุ่ม · Confusion Matrix · เกจ 4 ตัว */
export default function Results() {
  const st = useScene()
  const is = (n: number) => () => st.current.step === n
  const when = (n: number) => (s: { step: number }) => s.step === n
  const { persons, groups, cm, metrics } = results
  const matrix = useRef<THREE.Group>(null)
  useFrame((s) => {
    if (matrix.current) {
      matrix.current.rotation.y = -0.62 + Math.sin(s.clock.elapsedTime * 0.5) * 0.1
      matrix.current.rotation.x = 0.28
    }
  })

  return (
    <group>
      {/* 4.1 หน้าจอจริง */}
      <Pop when={when(0)}>
        <Screen name="4-1" variant={0} x={-2.0} y={1.45} label="ภาพที่ 4-1" />
        <Screen name="4-2" variant={1} x={2.0} y={1.45} label="ภาพที่ 4-2" />
        <Screen name="4-3" variant={2} x={-2.0} y={-1.95} label="ภาพที่ 4-3" />
        <Screen name="4-4" variant={3} x={2.0} y={-1.95} label="ภาพที่ 4-4" />
      </Pop>

      {/* 4.2 รายบุคคล */}
      <Pop when={when(1)}>
        <Axis />
        <Threshold />
        {persons.map((p, i) => (
          <Bar key={p.n} x={(i - 2.5) * 1.35} acc={p.acc} color={p.group === 'in' ? BLUE : ORANGE} width={0.95} label={`คนที่ ${p.n}`} on={is(1)} delay={i * 0.06} />
        ))}
      </Pop>

      {/* 4.3 รายกลุ่ม */}
      <Pop when={when(2)}>
        <Axis width={6} />
        <Threshold width={6} />
        <Bar x={-1.7} acc={groups.in.acc} color={BLUE} width={1.9} label="ภายใน" sub="257 / 330" on={is(2)} />
        <Bar x={1.7} acc={groups.out.acc} color={ORANGE} width={1.9} label="ภายนอก" sub="259 / 330" on={is(2)} delay={0.15} />
        <T position={[0, yOf(80) + 1.55, 0]} size={0.3} bold color="#fde68a">
          {`ต่างกันเพียง ${groups.diff.toFixed(2)}`}
        </T>
      </Pop>

      {/* 4.4 Confusion Matrix */}
      <Pop when={when(3)}>
        <group ref={matrix} position={[0, 0.1, 0]}>
          <Block x={-1.2} y={1.2} count={cm.tp} label="TP" color="#34d399" on={is(3)} delay={0} />
          <Block x={1.2} y={1.2} count={cm.fn} label="FN" color="#fb923c" on={is(3)} delay={0.2} />
          <Block x={-1.2} y={-1.2} count={cm.fp} label="FP" color="#fb7185" on={is(3)} delay={0.15} />
          <Block x={1.2} y={-1.2} count={cm.tn} label="TN" color="#38bdf8" on={is(3)} delay={0.1} />
        </group>
        <T position={[0, -3.55, 1.2]} size={0.26} color="#cbd5e1">
          {`ถูก ${cm.correct} / ${cm.total} รายการ`}
        </T>
      </Pop>

      {/* 4.5 เกจ 4 ตัว */}
      <Pop when={when(4)}>
        <Gauge value={metrics.accuracy} label="Accuracy" x={-2.2} y={1.7} on={is(4)} />
        <Gauge value={metrics.precision} label="Precision" x={2.2} y={1.7} on={is(4)} />
        <Gauge value={metrics.recall} label="Recall" x={-2.2} y={-2.2} on={is(4)} />
        <Gauge value={metrics.f1} label="F1" x={2.2} y={-2.2} on={is(4)} />
      </Pop>
      <Glow color="#f87171" size={12} opacity={0.1} position={[0, 0, -3]} />
    </group>
  )
}
