import { create } from 'zustand'
import { SCENE_COUNT, scenes } from './content'

/** ค่าที่เปลี่ยนทุกเฟรม — อยู่นอก React เพื่อไม่ให้ re-render */
export const stage = {
  /** ตำแหน่งฉากแบบทศนิยม 0 … SCENE_COUNT-1 */
  pos: 0,
  scrollEl: null as HTMLElement | null,
  /** ปลายทาง scrollTop (px) ของการเลื่อนที่สั่งจากโค้ด — null เมื่อผู้ใช้เลื่อนเอง */
  navTarget: null as number | null,
}

const prefersReduced =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const weakDevice =
  typeof navigator !== 'undefined' &&
  ((navigator.hardwareConcurrency ?? 8) <= 4 || /Android|iPhone|iPad/i.test(navigator.userAgent))

function readLite(): boolean {
  try {
    const saved = localStorage.getItem('kru.lite')
    if (saved !== null) return saved === '1'
  } catch {
    /* ignore */
  }
  return Boolean(prefersReduced || weakDevice)
}

type State = {
  scene: number
  step: number
  pendingStep: number | null
  lite: boolean
  presenter: boolean
  menuOpen: boolean
  ready: boolean
  notFound: boolean
  setStep: (s: number) => void
  toggleLite: () => void
  togglePresenter: () => void
  setMenu: (v: boolean) => void
  setNotFound: (v: boolean) => void
}

export const useStore = create<State>((set, get) => ({
  scene: 0,
  step: 0,
  pendingStep: null,
  lite: readLite(),
  presenter: false,
  menuOpen: false,
  ready: false,
  notFound: false,
  setStep: (s) => set({ step: s }),
  toggleLite: () => {
    const v = !get().lite
    try {
      localStorage.setItem('kru.lite', v ? '1' : '0')
    } catch {
      /* ignore */
    }
    set({ lite: v })
  },
  togglePresenter: () => set((s) => ({ presenter: !s.presenter, menuOpen: false })),
  setMenu: (v) => set({ menuOpen: v }),
  setNotFound: (v) => set({ notFound: v }),
}))

/* ───────── การเลื่อน/นำทาง ───────── */

const clampScene = (i: number) => Math.max(0, Math.min(SCENE_COUNT - 1, i))

export function goTo(i: number, step?: number, instant = false) {
  const el = stage.scrollEl
  const target = clampScene(i)
  if (step !== undefined) useStore.setState({ pendingStep: step })
  if (!el) return
  const top = target * el.clientHeight
  stage.navTarget = top
  el.scrollTo({ top, behavior: instant ? 'auto' : 'smooth' })
}

/** ถัดไป: ไล่แท็บในฉากก่อน แล้วค่อยไปฉากถัดไป */
export function next() {
  const { scene, step } = useStore.getState()
  const last = Math.max(0, scenes[scene].steps.length - 1)
  if (step < last) useStore.getState().setStep(step + 1)
  else if (scene < SCENE_COUNT - 1) goTo(scene + 1)
}

export function prev() {
  const { scene, step } = useStore.getState()
  if (step > 0) useStore.getState().setStep(step - 1)
  else if (scene > 0) goTo(scene - 1, Math.max(0, scenes[scene - 1].steps.length - 1))
}
