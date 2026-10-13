import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ComponentProps,
  type MutableRefObject,
  type ReactNode,
} from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { scenes } from '../content'
import { stage, useStore } from '../store'

export const FONT = '/fonts/Sarabun-Regular.ttf'
export const FONT_BOLD = '/fonts/Sarabun-Bold.ttf'

/** ระยะห่างระหว่างฉากในอวกาศ */
export const SPACING = 60
export const CAM_FOV = 45
export const CAM_DIST = 11.5
/** ระยะกล้องเฉพาะฉาก (ค่าเริ่มต้น CAM_DIST) */
export const CAM_Z: Record<number, number> = { 3: 12.5, 6: 12.5, 11: 12.5 }

export function originOf(i: number): [number, number, number] {
  return [i * SPACING, Math.sin(i * 1.3) * 7, 10 - Math.cos(i * 0.8) * 10]
}

/* ───────── สถานะของฉาก (ไม่ใช่ React state — อัปเดตทุกเฟรม) ───────── */

export type SceneState = {
  /** 1 เมื่อกล้องอยู่ที่ฉากนี้, 0 เมื่อห่างเกิน 1 ฉาก */
  focus: number
  /** pos − index (ติดลบ = กำลังเข้ามา, บวก = กำลังออกไป) */
  t: number
  /** วินาทีนับจากที่ฉากนี้ถูกเปิด */
  time: number
  active: boolean
  step: number
}

const SceneCtx = createContext<MutableRefObject<SceneState> | null>(null)

export function useScene() {
  const ctx = useContext(SceneCtx)
  if (!ctx) throw new Error('useScene must be used inside <SceneSlot>')
  return ctx
}

export const damp = THREE.MathUtils.damp
export const clamp = THREE.MathUtils.clamp
export const smooth = THREE.MathUtils.smoothstep
export const lerp = THREE.MathUtils.lerp

/** จัดวางฉากในอวกาศ + จัดตำแหน่งเนื้อหา 3D ให้พ้นการ์ดข้อความด้านซ้าย */
export function SceneSlot({ index, children }: { index: number; children: ReactNode }) {
  const outer = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const st = useRef<SceneState>({ focus: 0, t: 0, time: 0, active: false, step: 0 })
  const meta = scenes[index]
  const origin = useMemo(() => originOf(index), [index])

  useFrame((state, dt) => {
    const s = st.current
    const t = stage.pos - index
    s.t = t
    s.focus = clamp(1 - Math.abs(t), 0, 1)
    if (outer.current) outer.current.visible = Math.abs(t) < 1.2

    const active = s.focus > 0.55
    if (active && !s.active) s.time = 0
    s.active = active
    if (active) s.time += Math.min(dt, 0.05)
    const store = useStore.getState()
    s.step = store.scene === index ? store.step : 0

    // เลย์เอาต์: จอกว้าง → เนื้อหา 3D อยู่ขวาของการ์ด, จอแคบ → อยู่เหนือการ์ดแผ่นล่าง
    const { width: W, height: H } = state.size
    const aspect = W / H
    const camDist = CAM_Z[index] ?? CAM_DIST
    const visH = 2 * Math.tan((CAM_FOV * Math.PI) / 360) * camDist
    const visW = visH * aspect
    let sx = 0
    let sy = 0
    let sc = 1
    if (meta.wide) {
      sy = aspect > 1.1 ? 0 : visH * 0.18
      sc = 0.85
    } else if (aspect >= 1.05) {
      const cardRight = 24 + (meta.width ?? 440) + 24
      sx = ((cardRight - 24) / (2 * W)) * visW
      const freeW = ((W - cardRight - 64) / W) * visW
      sc = Math.min(1, freeW / 10.5)
    } else {
      const sheet = 0.5
      sy = (sheet / 2) * visH * 0.92
      sc = Math.min(1, (visW * 0.96) / 10, (visH * (1 - sheet)) / 8)
    }
    if (inner.current) {
      inner.current.position.x = damp(inner.current.position.x, sx, 6, dt)
      inner.current.position.y = damp(inner.current.position.y, sy, 6, dt)
      inner.current.scale.setScalar(damp(inner.current.scale.x, sc, 6, dt))
    }
  })

  return (
    <SceneCtx.Provider value={st}>
      <group ref={outer} position={origin}>
        <group ref={inner}>{children}</group>
      </group>
    </SceneCtx.Provider>
  )
}

/* ───────── ชิ้นส่วนที่ใช้ซ้ำ ───────── */

type TextProps = ComponentProps<typeof Text>

/** ข้อความ 3D ด้วยฟอนต์ Sarabun (รองรับสระ/วรรณยุกต์ไทย) */
export function T({ bold, size = 0.4, color = '#e2e8f0', children, ...rest }: TextProps & { bold?: boolean; size?: number }) {
  return (
    <Text
      font={bold ? FONT_BOLD : FONT}
      fontSize={size}
      color={color}
      anchorX="center"
      anchorY="middle"
      {...rest}
    >
      {children}
    </Text>
  )
}

/** วัตถุที่ขยาย/หุบตามเงื่อนไข (damped) */
export function Pop({
  when,
  children,
  position,
  speed = 5,
}: {
  when: (s: SceneState) => boolean
  children: ReactNode
  position?: [number, number, number]
  speed?: number
}) {
  const st = useScene()
  const g = useRef<THREE.Group>(null)
  const v = useRef(0)
  useFrame((_, dt) => {
    const target = when(st.current) ? 1 : 0
    v.current = damp(v.current, target, speed, dt)
    if (g.current) {
      g.current.visible = v.current > 0.01
      g.current.scale.setScalar(Math.max(0.0001, v.current))
    }
  })
  return (
    <group ref={g} position={position}>
      {children}
    </group>
  )
}

let glowTex: THREE.CanvasTexture | null = null
export function getGlowTexture() {
  if (glowTex) return glowTex
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, 'rgba(255,255,255,1)')
  grd.addColorStop(0.25, 'rgba(255,255,255,0.45)')
  grd.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  glowTex = new THREE.CanvasTexture(c)
  return glowTex
}

/** แสงฟุ้งแบบ sprite (additive) */
export function Glow({
  color = '#38bdf8',
  size = 3,
  opacity = 0.7,
  position,
}: {
  color?: string
  size?: number
  opacity?: number
  position?: [number, number, number]
}) {
  const tex = useMemo(() => getGlowTexture(), [])
  return (
    <sprite position={position} scale={[size, size, 1]}>
      <spriteMaterial map={tex} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  )
}

/** เลือกจำนวนอนุภาคตามโหมดเบา */
export function useLite() {
  return useStore((s) => s.lite)
}

/** โหลดภาพหน้าจอจริงจาก /screens/<name>.png ถ้าไม่มี → วาดหน้าจำลองด้วย canvas */
const screenCache = new Map<string, THREE.Texture>()

function drawMock(variant: number): HTMLCanvasElement {
  const W = 1280
  const H = 800
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  const F = '"Sarabun", "Noto Sans Thai", system-ui, sans-serif'
  g.fillStyle = '#0b1226'
  g.fillRect(0, 0, W, H)
  // sidebar
  g.fillStyle = '#10182f'
  g.fillRect(0, 0, 280, H)
  g.fillStyle = '#38bdf8'
  g.font = `700 30px ${F}`
  g.fillText('ครูเอสคิว', 28, 62)
  g.fillStyle = '#1e293b'
  for (let i = 0; i < 5; i++) {
    g.beginPath()
    g.roundRect(20, 100 + i * 64, 240, 48, 12)
    g.fill()
  }
  g.fillStyle = '#94a3b8'
  g.font = `400 20px ${F}`
  const hist = ['คีย์หลักคืออะไร', 'JOIN ใช้อย่างไร', 'Normalization', 'GROUP BY', 'ประวัติแชท']
  hist.forEach((h, i) => g.fillText(h, 36, 132 + i * 64))
  // header
  g.fillStyle = '#e2e8f0'
  g.font = `600 26px ${F}`
  g.fillText('ถามเรื่องฐานข้อมูลและ SQL ได้เลย', 320, 62)
  // chips
  const chips = ['SQL คืออะไร', 'คีย์หลัก', 'JOIN', 'GROUP BY', 'Normalization', 'ER Diagram']
  g.font = `500 20px ${F}`
  chips.forEach((t, i) => {
    const x = 320 + (i % 3) * 300
    const y = variant === 0 ? 120 + Math.floor(i / 3) * 70 : 560 + Math.floor(i / 3) * 70
    g.fillStyle = '#16213f'
    g.beginPath()
    g.roundRect(x, y, 280, 52, 26)
    g.fill()
    g.strokeStyle = '#38bdf855'
    g.stroke()
    g.fillStyle = '#7dd3fc'
    g.fillText(t, x + 24, y + 33)
  })
  if (variant !== 0) {
    g.fillStyle = '#1e3a8a'
    g.beginPath()
    g.roundRect(760, 150, 440, 70, 20)
    g.fill()
    g.fillStyle = '#fff'
    g.font = `500 22px ${F}`
    g.fillText(variant === 1 ? 'คีย์หลักคืออะไร' : 'ใช้ Primary Key อย่างไร', 790, 194)
    g.fillStyle = '#16213f'
    g.beginPath()
    g.roundRect(320, 250, 760, 230, 20)
    g.fill()
    g.fillStyle = '#cbd5e1'
    g.font = `400 22px ${F}`
    ;['ครูเอสคิวค้นหัวข้อจากตำรา แล้วให้ Gemini', 'เรียบเรียงคำตอบเป็นภาษาไทย พร้อมอ้างอิง', variant === 3 ? 'ไม่มีข้อมูลเรื่องนี้ในตำรา' : 'หัวข้อที่เกี่ยวข้อง: Primary Key'].forEach(
      (l, i) => g.fillText(l, 348, 306 + i * 44),
    )
  }
  // input
  g.fillStyle = '#16213f'
  g.beginPath()
  g.roundRect(320, 700, 860, 62, 31)
  g.fill()
  g.fillStyle = '#64748b'
  g.font = `400 22px ${F}`
  g.fillText('พิมพ์คำถามของคุณ…', 352, 740)
  g.fillStyle = '#38bdf8'
  g.beginPath()
  g.arc(1146, 731, 22, 0, Math.PI * 2)
  g.fill()
  return c
}

export function useScreenTexture(name: string, variant = 0) {
  const tex = useMemo(() => {
    const cached = screenCache.get(name)
    if (cached) return cached
    const t = new THREE.CanvasTexture(drawMock(variant))
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    screenCache.set(name, t)
    return t
  }, [name, variant])

  useEffect(() => {
    let dead = false
    let real = false
    const canvas = tex instanceof THREE.CanvasTexture ? (tex.image as HTMLCanvasElement) : null
    if (!canvas) return
    // วาดใหม่เมื่อฟอนต์พร้อม (กันตัวอักษรไทยเป็นฟอนต์สำรอง)
    document.fonts?.ready.then(() => {
      if (dead || real) return
      const fresh = drawMock(variant)
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(fresh, 0, 0)
      tex.needsUpdate = true
    })
    // ลองโหลดภาพจริง
    const img = new Image()
    img.onload = () => {
      if (dead || !img.naturalWidth) return
      real = true
      // แทนที่เนื้อ canvas ด้วยภาพจริง (คงขนาด canvas เดิมเพื่อไม่ต้องสร้าง texture ใหม่)
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height)
      tex.needsUpdate = true
    }
    img.src = `/screens/${name}.png`
    return () => {
      dead = true
    }
  }, [tex, name, variant])

  return tex
}

/** ใช้ใน useFrame เพื่ออ่านขนาดหน้าจอ */
export function useAspect() {
  return useThree((s) => s.size.width / s.size.height)
}
