import { useEffect, useRef, useState, type CSSProperties, type WheelEvent } from 'react'
import { SCENE_COUNT, scenes } from '../content'
import { goTo, next, prev, stage, useStore } from '../store'
import { Panel } from './Panels'

function useElapsed(active: boolean) {
  const [sec, setSec] = useState(0)
  useEffect(() => {
    if (!active) return
    setSec(0)
    const t0 = performance.now()
    const id = window.setInterval(() => setSec(Math.floor((performance.now() - t0) / 1000)), 500)
    return () => window.clearInterval(id)
  }, [active])
  return sec
}

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export function Overlay() {
  const scene = useStore((s) => s.scene)
  const step = useStore((s) => s.step)
  const lite = useStore((s) => s.lite)
  const presenter = useStore((s) => s.presenter)
  const menuOpen = useStore((s) => s.menuOpen)
  const ready = useStore((s) => s.ready)
  const meta = scenes[scene]
  const bodyRef = useRef<HTMLDivElement>(null)
  const elapsed = useElapsed(presenter)
  const targetSec = SCENE_COUNT * 60

  useEffect(() => {
    document.documentElement.classList.toggle('presenter', presenter)
    document.documentElement.style.setProperty('--accent', meta.accent)
  }, [presenter, meta.accent])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [scene, step])

  // ส่งต่อล้อเมาส์ไปยังตัวเลื่อนของฉาก เมื่อการ์ดเลื่อนไม่ได้/สุดขอบแล้ว
  const onWheel = (e: WheelEvent<HTMLElement>) => {
    const el = bodyRef.current
    const target = stage.scrollEl
    if (!el || !target) return
    const canScroll = el.scrollHeight > el.clientHeight + 1
    const atTop = el.scrollTop <= 0
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
    if (!canScroll || (e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
      stage.navTarget = null
      target.scrollBy({ top: e.deltaY })
    }
  }

  const isFirst = scene === 0 && step === 0
  const isLast = scene === SCENE_COUNT - 1 && step === Math.max(0, meta.steps.length - 1)
  const cardStyle = (meta.wide ? {} : { '--w': `${meta.width ?? 440}px` }) as CSSProperties

  return (
    <>
      <div className={`splash ${ready ? 'hide' : ''}`} aria-hidden={ready}>
        <div>
          <b>ครูเอสคิว</b>
          กำลังโหลดฉาก 3 มิติ…
          <div className="bar">
            <i />
          </div>
        </div>
      </div>

      <div className="ui" role="presentation">
        <div className="brand">
          <i>SQL</i>
          <span>
            ครูเอสคิว
            <small>นำเสนอโครงงาน · ภาคเรียน 1/2569</small>
          </span>
        </div>

        <div className="toolbar">
          {presenter && (
            <span className={`btn timer ${elapsed > targetSec ? 'over' : ''}`} title="เวลาที่ใช้ / เป้าหมาย ~1 นาทีต่อฉาก">
              ⏱ {fmt(elapsed)} <span className="muted small">/ {fmt(targetSec)}</span>
            </span>
          )}
          <button className="btn" aria-pressed={presenter} onClick={() => useStore.getState().togglePresenter()} title="โหมดนำเสนอ (P)">
            ▶<span className="txt">โหมดนำเสนอ</span>
          </button>
          <button className="btn" aria-pressed={lite} onClick={() => useStore.getState().toggleLite()} title="โหมดเบา — ลดอนุภาค/ความละเอียด (L)">
            ◐<span className="txt">โหมดเบา</span>
          </button>
          <button
            className="btn"
            onClick={() => (document.fullscreenElement ? void document.exitFullscreen() : void document.documentElement.requestFullscreen?.())}
            title="เต็มจอ (F)"
            aria-label="เต็มจอ"
          >
            ⛶
          </button>
          <button className="btn" onClick={() => useStore.getState().setMenu(true)} title="เมนูบท (M)" aria-label="เมนูบท">
            ☰<span className="txt">เมนู</span>
          </button>
        </div>

        {/* การ์ดเนื้อหา */}
        <div className={`card-wrap ${meta.wide ? 'center' : ''}`}>
          <section
            key={`${scene}`}
            className={`card ${meta.wide ? 'wide' : ''}`}
            style={{ ...cardStyle, ['--accent' as string]: meta.accent }}
            onWheel={onWheel}
            aria-live="polite"
          >
            {scene !== 0 && (
              <header className="card-head">
                <span className="chip">
                  {meta.chapter} · {meta.ref}
                </span>
                <h2>{meta.title}</h2>
              </header>
            )}
            {meta.steps.length > 1 && (
              <div className="tabs" role="tablist" aria-label="หัวข้อย่อย">
                {meta.steps.map((s, i) => (
                  <button
                    key={s}
                    role="tab"
                    className="tab"
                    aria-selected={i === step}
                    onClick={() => useStore.getState().setStep(i)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="card-body" ref={bodyRef}>
              <Panel scene={meta.key} step={step} />
            </div>
          </section>
        </div>

        {/* เมนูบทด้านข้าง */}
        <nav className="dots" aria-label="เมนูบท">
          {scenes.map((s, i) => (
            <button key={s.key} className="dot hit" aria-current={i === scene} onClick={() => goTo(i)} aria-label={`ฉาก ${i} ${s.label}`}>
              <span className="label">
                {i} · {s.label}
              </span>
              <i style={i === scene ? { background: s.accent, boxShadow: `0 0 14px ${s.accent}` } : undefined} />
            </button>
          ))}
        </nav>

        {/* ปุ่มลูกศรสำหรับโหมดนำเสนอ */}
        <div className="pager">
          <div className="count">
            <b>
              {String(scene + 1).padStart(2, '0')} / {SCENE_COUNT}
            </b>
            <br />
            {meta.steps.length > 1 ? `หัวข้อย่อย ${step + 1}/${meta.steps.length}` : meta.label}
          </div>
          <button className="nav-btn" onClick={prev} disabled={isFirst} aria-label="ก่อนหน้า (←)">
            ←
          </button>
          <button className="nav-btn" onClick={next} disabled={isLast} aria-label="ถัดไป (→)">
            →
          </button>
        </div>

        <div className="progress" aria-hidden>
          <i style={{ width: `${((scene + 1) / SCENE_COUNT) * 100}%` }} />
        </div>

        {menuOpen && (
          <div className="menu" onClick={() => useStore.getState().setMenu(false)}>
            <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
              <h3>
                <span>สารบัญ · 14 ฉาก</span>
                <button className="btn" onClick={() => useStore.getState().setMenu(false)}>
                  ปิด <kbd>Esc</kbd>
                </button>
              </h3>
              {scenes.map((s, i) => (
                <button
                  key={s.key}
                  className="menu-item"
                  aria-current={i === scene}
                  style={{ ['--c' as string]: s.accent }}
                  onClick={() => {
                    useStore.getState().setMenu(false)
                    goTo(i)
                  }}
                >
                  <b>{i}</b>
                  <span>
                    {s.label}
                    <small>
                      {s.chapter} · {s.ref}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
