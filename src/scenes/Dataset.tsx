import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { unitsPerChapter } from '../content'
import { Glow, Pop, T, clamp, damp, lerp, useScene } from './shared'
import { TAU, rng, useGrid } from './parts'

const GAP = 0.43
const CUBE = 0.31
const RING_N = 72
const RING_RX = 4.75
const RING_RY = 3.55
const C_LOCK = new THREE.Color('#34d399')
const C_SPIN = new THREE.Color('#38bdf8')

/** ฉาก 3 — หนังสือ 426 หน้าแตกเป็น 172 ก้อน (InstancedMesh) เรียง 12 แถวตามบท + วงแหวนแฮชล็อก */
export default function Dataset() {
  const st = useScene()
  const grid = useGrid(unitsPerChapter, GAP)
  const N = grid.length // 172
  const mesh = useRef<THREE.InstancedMesh>(null)
  const ringMesh = useRef<THREE.InstancedMesh>(null)
  const book = useRef<THREE.Group>(null)
  const ringGroup = useRef<THREE.Group>(null)
  const formed = useRef(0)
  const lockMat = useRef<THREE.MeshBasicMaterial>(null)
  const ringAngle = useRef(0)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const src = useMemo(() => {
    const r = rng(11)
    return grid.map(() => ({
      x: (r() - 0.5) * 2.0,
      y: (r() - 0.5) * 2.8,
      z: (r() - 0.5) * 0.7,
      d: r() * 0.45,
      sw: (r() - 0.5) * 5,
      sz: r() * 3,
    }))
  }, [grid])

  useEffect(() => {
    const m = mesh.current
    if (!m) return
    const c = new THREE.Color()
    grid.forEach((g, i) => {
      c.setHSL(0.52 + (g.row / 12) * 0.42, 0.75, 0.58)
      m.setColorAt(i, c)
    })
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [grid])

  useFrame((_, dt) => {
    const target = st.current.step >= 1 ? 1 : 0
    formed.current = damp(formed.current, target, 1.4, dt)
    const f = formed.current
    const m = mesh.current
    if (m) {
      for (let i = 0; i < N; i++) {
        const s = src[i]
        const g = grid[i]
        const p = clamp((f - s.d * 0.6) / (1 - s.d * 0.6), 0, 1)
        const e = p * p * (3 - 2 * p)
        const arc = Math.sin(e * Math.PI)
        dummy.position.set(lerp(s.x, g.x, e) + arc * s.sw * 0.4, lerp(s.y, g.y, e) + arc * 0.8, lerp(s.z, 0, e) + arc * s.sz * 0.5)
        dummy.rotation.set((1 - e) * s.sw, (1 - e) * s.sz, 0)
        const sc = lerp(0.9, 1, e)
        dummy.scale.setScalar(sc)
        dummy.updateMatrix()
        m.setMatrixAt(i, dummy.matrix)
      }
      m.instanceMatrix.needsUpdate = true
      m.visible = f > 0.003
    }
    if (book.current) {
      const s = clamp(1 - f * 1.6, 0, 1)
      book.current.scale.setScalar(Math.max(s, 0.0001))
      book.current.visible = s > 0.01
      book.current.rotation.y = Math.sin(st.current.time * 0.8) * 0.4 + f * 3
    }
    // วงแหวนแฮช: หมุนจนข้อมูลเรียงครบ แล้วล็อก
    const locked = f > 0.97
    ringAngle.current += dt * (locked ? 0 : 0.9 + f * 1.4)
    if (ringGroup.current) {
      ringGroup.current.rotation.z = locked ? damp(ringGroup.current.rotation.z, Math.round(ringGroup.current.rotation.z / (TAU / RING_N)) * (TAU / RING_N), 6, dt) : ringAngle.current
      ringGroup.current.visible = f > 0.2 || st.current.step >= 1
    }
    if (lockMat.current) lockMat.current.color.lerp(locked ? C_LOCK : C_SPIN, 0.1)
  })

  const ringSet = useMemo(() => {
    const arr: THREE.Matrix4[] = []
    const o = new THREE.Object3D()
    for (let i = 0; i < RING_N; i++) {
      const a = (i / RING_N) * TAU
      o.position.set(Math.cos(a) * RING_RX, Math.sin(a) * RING_RY, 0)
      o.rotation.set(0, 0, Math.atan2(Math.cos(a) * RING_RY, -Math.sin(a) * RING_RX) )
      o.scale.set(i % 6 === 0 ? 1.6 : 1, 1, 1)
      o.updateMatrix()
      arr.push(o.matrix.clone())
    }
    return arr
  }, [])
  useEffect(() => {
    const m = ringMesh.current
    if (!m) return
    ringSet.forEach((mat, i) => m.setMatrixAt(i, mat))
    m.instanceMatrix.needsUpdate = true
  }, [ringSet])

  return (
    <group>
      {/* หนังสือ 3 มิติ */}
      <group ref={book}>
        <RoundedBox args={[2.5, 3.3, 0.95]} radius={0.08} smoothness={3}>
          <meshStandardMaterial color="#1d4ed8" roughness={0.45} metalness={0.2} emissive="#1e40af" emissiveIntensity={0.3} />
        </RoundedBox>
        <mesh position={[0.07, 0, 0]}>
          <boxGeometry args={[2.3, 3.1, 1.0]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
        </mesh>
        <T position={[0, 0.6, 0.52]} size={0.55} bold color="#1e3a8a">
          SQL
        </T>
        <T position={[0, -0.2, 0.52]} size={0.22} color="#1e3a8a">
          ฐานข้อมูล
        </T>
        <T position={[0, -1.3, 0.52]} size={0.2} color="#475569">
          426 หน้า
        </T>
      </group>

      {/* 172 ก้อน */}
      <instancedMesh ref={mesh} args={[undefined, undefined, N]} frustumCulled={false}>
        <boxGeometry args={[CUBE, CUBE, CUBE]} />
        <meshStandardMaterial roughness={0.35} metalness={0.25} emissive="#ffffff" emissiveIntensity={0.08} />
      </instancedMesh>

      {/* วงแหวนแฮช */}
      <group ref={ringGroup}>
        <instancedMesh ref={ringMesh} args={[undefined, undefined, RING_N]} frustumCulled={false}>
          <boxGeometry args={[0.1, 0.36, 0.1]} />
          <meshBasicMaterial ref={lockMat} color="#38bdf8" />
        </instancedMesh>
      </group>

      <Pop when={(s) => s.step >= 1} position={[0, -4.25, 0]}>
        <T size={0.26} bold color="#a7f3d0">
          SHA-256 · manifest.json
        </T>
      </Pop>
      <Pop when={(s) => s.step >= 1} position={[-3.45, 0, 0]}>
        {unitsPerChapter.map((_, r) => (
          <T key={r} position={[0, (5.5 - r) * GAP, 0]} size={0.15} color="#94a3b8" anchorX="right">
            {`บท ${r + 1}`}
          </T>
        ))}
      </Pop>
      <Glow color="#22d3ee" size={11} opacity={0.18} position={[0, 0, -1]} />
    </group>
  )
}
