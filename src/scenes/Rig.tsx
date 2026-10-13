import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Stars, useScroll } from '@react-three/drei'
import * as THREE from 'three'
import { SCENE_COUNT, scenes } from '../content'
import { goTo, next, prev, stage, useStore } from '../store'
import { CAM_DIST, CAM_Z, originOf } from './shared'

const BG = scenes.map((s) => new THREE.Color(s.bg))
const tmpA = new THREE.Vector3()
const tmpB = new THREE.Vector3()
const look = new THREE.Vector3()
const col = new THREE.Color()

const fifth = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)

/**
 * ผูกการเลื่อน (ScrollControls) กับกล้อง พื้นหลัง และสถานะฉากปัจจุบัน
 * รวมถึง snap เข้าฉาก, คีย์ลัด และ #hash
 */
export function Rig() {
  const scroll = useScroll()
  const { camera, scene } = useThree()
  const stars = useRef<THREE.Group>(null)
  const pointer = useRef(new THREE.Vector2())
  const lite = useStore((s) => s.lite)
  const ready = useRef(false)

  /* ผูก scroll element + snap + hash + คีย์ลัด */
  useEffect(() => {
    const el = scroll.el
    stage.scrollEl = el
    let timer: number | undefined

    const snap = () => {
      const h = el.clientHeight
      if (!h) return
      // กำลังเลื่อนไปยังฉากที่สั่งไว้ → ไปให้ถึงก่อน (กันการ snap ไปตัดกลางทาง)
      if (stage.navTarget !== null) {
        if (Math.abs(el.scrollTop - stage.navTarget) <= 2) stage.navTarget = null
        else {
          el.scrollTo({ top: stage.navTarget, behavior: 'smooth' })
          timer = window.setTimeout(snap, 220)
          return
        }
      }
      const idx = Math.round(el.scrollTop / h)
      const target = Math.max(0, Math.min(SCENE_COUNT - 1, idx)) * h
      if (Math.abs(el.scrollTop - target) > 2) el.scrollTo({ top: target, behavior: 'smooth' })
    }
    const onScroll = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(snap, 160)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    // ผู้ใช้เลื่อนเอง → ยกเลิกปลายทางที่สั่งจากโค้ด
    const cancelNav = () => {
      stage.navTarget = null
    }
    el.addEventListener('wheel', cancelNav, { passive: true })
    el.addEventListener('touchstart', cancelNav, { passive: true })

    // เริ่มที่ฉากตาม #hash
    const hash = decodeURIComponent(location.hash.replace('#', ''))
    const hi = scenes.findIndex((s) => s.key === hash)
    let hashTimer: number | undefined
    if (hi > 0) {
      // รอให้ ScrollControls ตั้งค่าเริ่มต้นเสร็จก่อน (มันข้ามเหตุการณ์ scroll แรกสุด)
      hashTimer = window.setTimeout(() => {
        el.scrollTop = hi * el.clientHeight
      }, 350)
    }

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault()
          next()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          prev()
          break
        case 'Home':
          e.preventDefault()
          goTo(0)
          break
        case 'End':
          e.preventDefault()
          goTo(SCENE_COUNT - 1)
          break
        case 'p':
        case 'P':
          useStore.getState().togglePresenter()
          break
        case 'l':
        case 'L':
          useStore.getState().toggleLite()
          break
        case 'm':
        case 'M':
          useStore.getState().setMenu(!useStore.getState().menuOpen)
          break
        case 'f':
        case 'F':
          if (document.fullscreenElement) void document.exitFullscreen()
          else void document.documentElement.requestFullscreen?.()
          break
        case 'Escape':
          useStore.getState().setMenu(false)
          break
        default:
          if (/^[1-9]$/.test(e.key)) goTo(Number(e.key) - 1)
      }
    }
    window.addEventListener('keydown', onKey)
    const onMove = (e: PointerEvent) => {
      pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
    }
    window.addEventListener('pointermove', onMove)

    useStore.setState({ ready: true })
    ready.current = true
    if (import.meta.env.DEV) (window as unknown as { __dbg: unknown }).__dbg = { stage, camera }

    return () => {
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('wheel', cancelNav)
      el.removeEventListener('touchstart', cancelNav)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointermove', onMove)
      window.clearTimeout(timer)
      window.clearTimeout(hashTimer)
    }
  }, [scroll, camera])

  useFrame((state, dt) => {
    const pos = THREE.MathUtils.clamp(scroll.offset * (SCENE_COUNT - 1), 0, SCENE_COUNT - 1)
    stage.pos = pos

    const i = Math.min(SCENE_COUNT - 1, Math.floor(pos))
    const j = Math.min(SCENE_COUNT - 1, i + 1)
    const f = pos - i
    const e = fifth(f)

    // กล้อง: ผสมตำแหน่งสองฉาก + ถอยหลัง/ยกขึ้นเล็กน้อยระหว่างบิน
    const oa = originOf(i)
    const ob = originOf(j)
    tmpA.set(oa[0], oa[1] + 0.4, oa[2] + (CAM_Z[i] ?? CAM_DIST))
    tmpB.set(ob[0], ob[1] + 0.4, ob[2] + (CAM_Z[j] ?? CAM_DIST))
    tmpA.lerp(tmpB, e)
    const bump = Math.sin(Math.PI * f)
    tmpA.z += bump * 6
    tmpA.y += bump * 1.6

    // parallax จากเมาส์ (ปิดในโหมดเบา)
    const px = lite ? 0 : pointer.current.x * 0.45
    const py = lite ? 0 : pointer.current.y * 0.28
    camera.position.x = THREE.MathUtils.damp(camera.position.x, tmpA.x + px, 4, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, tmpA.y + py, 4, dt)
    camera.position.z = tmpA.z
    look.set(oa[0], oa[1], oa[2]).lerp(tmpB.set(ob[0], ob[1], ob[2]), e)
    camera.lookAt(look)

    // พื้นหลัง/หมอกไล่สีตามฉาก
    col.copy(BG[i]).lerp(BG[j], e)
    if (scene.background instanceof THREE.Color) scene.background.copy(col)
    else scene.background = col.clone()
    if (scene.fog) (scene.fog as THREE.FogExp2).color.copy(col)

    if (stars.current) stars.current.position.copy(camera.position)

    // ฉากปัจจุบัน
    const idx = Math.round(pos)
    const s = useStore.getState()
    if (idx !== s.scene) {
      useStore.setState({ scene: idx, step: s.pendingStep ?? 0, pendingStep: null, menuOpen: false })
      if (ready.current) history.replaceState(null, '', `#${scenes[idx].key}`)
    }
  })

  return (
    <group ref={stars}>
      <Stars radius={90} depth={50} count={lite ? 600 : 2200} factor={4} saturation={0.4} fade speed={0.5} />
    </group>
  )
}
