import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  BOT_HOST,
  BOT_URL,
  appendix,
  build,
  chatbot,
  conclusion,
  dataset,
  evaluation,
  levelOf,
  levels,
  method,
  problem,
  project,
  rag,
  references,
  related,
  results,
  scope,
  tools,
} from '../content'
import { useStore } from '../store'
import { QuestionTable } from './QuestionTable'

/* ───────── ชิ้นส่วนเล็กที่ใช้ซ้ำ ───────── */

const Flow = ({ items }: { items: string[] }) => (
  <div className="flow">
    {items.map((t, i) => (
      <span key={t} style={{ display: 'contents' }}>
        {i > 0 && <span className="arrow">→</span>}
        <span className="node">{t}</span>
      </span>
    ))}
  </div>
)

const NumList = ({ items, compact }: { items: string[]; compact?: boolean }) => (
  <ol className={`num-list ${compact ? 'compact' : ''}`}>
    {items.map((t) => (
      <li key={t}>{t}</li>
    ))}
  </ol>
)

const KV = ({ rows }: { rows: { k: string; v: ReactNode }[] }) => (
  <dl className="kv">
    {rows.map((r) => (
      <div key={r.k} style={{ display: 'contents' }}>
        <dt>{r.k}</dt>
        <dd>{r.v}</dd>
      </div>
    ))}
  </dl>
)

const Stats = ({ items }: { items: { v: string; l: string; tone?: string }[] }) => (
  <div className="stats">
    {items.map((s) => (
      <div key={s.l} className={`stat ${s.tone ?? ''}`}>
        <b>{s.v}</b>
        <span>{s.l}</span>
      </div>
    ))}
  </div>
)

const Cite = ({ children }: { children: ReactNode }) => <p className="cite">{children}</p>

/** ตัวเลขวิ่งขึ้น (count-up) */
function CountUp({ to, decimals = 2, duration = 1100, suffix = '' }: { to: number; decimals?: number; duration?: number; suffix?: string }) {
  const [v, setV] = useState(0)
  const raf = useRef(0)
  useEffect(() => {
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      setV(to * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [to, duration])
  return (
    <>
      {v.toFixed(decimals)}
      {suffix}
    </>
  )
}

function LevelPill({ score }: { score: number }) {
  const l = levelOf(score)
  return (
    <span className="pill" style={{ ['--c' as string]: l.color }}>
      {l.label}
    </span>
  )
}

/* ───────── เนื้อหาแต่ละฉาก ───────── */

function Cover() {
  return (
    <>
      <span className="chip">นำเสนอโครงงาน · {project.term}</span>
      <h1 className="cover-title">{project.titleTh}</h1>
      <p className="cover-en">{project.titleEn}</p>
      <p style={{ margin: '0 0 6px' }}>
        {project.department} · {project.faculty}
        <br />
        <span className="muted">{project.university}</span>
      </p>
      <div className="members" aria-label="สมาชิก 6 คน">
        {project.members.map((m, i) => (
          <div key={i} className={`member ${m.name ? '' : 'empty'}`}>
            {m.name || `สมาชิกคนที่ ${i + 1}`}
            <small>{m.id ? `รหัส ${m.id}` : m.name ? 'รหัส —' : 'ชื่อ – รหัส'}</small>
          </div>
        ))}
      </div>
      <p className="hint">เลื่อนลง หรือกด → เพื่อเริ่ม</p>
    </>
  )
}

function Problem() {
  return (
    <>
      <p className="lead">ผู้เรียนวิชาฐานข้อมูลพบปัญหา 4 ข้อ</p>
      <NumList items={problem.items} />
      <div className="callout good">
        <b>แนวคิด</b> → {problem.idea}
      </div>
      <Cite>อ้างอิง: {problem.refs.join(' · ')}</Cite>
    </>
  )
}

function Scope({ step }: { step: number }) {
  if (step === 0)
    return (
      <>
        <p className="lead">วัตถุประสงค์ 2 ข้อ</p>
        <NumList items={scope.objectives} />
        <div className="callout">
          <b>สมมติฐาน (1.3)</b>
          <br />
          {scope.hypothesis}
          <br />
          <span className="muted">เกณฑ์ผ่าน: </span>
          <b>{scope.passRule}</b>
        </div>
      </>
    )
  if (step === 1)
    return (
      <>
        <KV rows={scope.scopeItems.map((s) => ({ k: s.k, v: s.v }))} />
        <Stats
          items={[
            { v: '12', l: 'หัวข้อ (บท)' },
            { v: '6', l: 'ผู้ทดสอบ' },
            { v: '110', l: 'ข้อ / คน' },
            { v: '660', l: 'รายการ', tone: 'hero' },
          ]}
        />
        <p className="small">
          <span className="pill" style={{ ['--c' as string]: '#38bdf8' }}>ฟ้า = ภายใน 3 คน</span>{' '}
          <span className="pill" style={{ ['--c' as string]: '#fb923c' }}>ส้ม = ภายนอก 3 คน</span>
        </p>
        <p className="small muted">คลิกการ์ดบทในฉาก 3 มิติเพื่อพลิกดูจำนวนข้อสอบของแต่ละบท</p>
      </>
    )
  return (
    <>
      <p className="lead">ประโยชน์ที่คาดว่าจะได้รับ 4 ข้อ</p>
      <NumList items={scope.benefits} />
    </>
  )
}

function Dataset({ step }: { step: number }) {
  if (step === 0)
    return (
      <>
        <p className="lead">แหล่งข้อมูลเดียว: {dataset.source}</p>
        <p className="small muted" style={{ marginTop: -4 }}>
          “{dataset.bookTitle}”
        </p>
        <Stats items={dataset.stats} />
        <div className="callout">{dataset.note}</div>
        <p className="small muted">ตำรา 12 บท แบ่งเป็น 172 หน่วยความรู้ หน่วยละประมาณ 3,500 ตัวอักษร</p>
      </>
    )
  if (step === 1)
    return (
      <>
        <p className="lead">ไปป์ไลน์เตรียมข้อมูล 5 ขั้น (ภาพที่ 2-1)</p>
        <Flow items={dataset.pipeline} />
        <ul className="bullets">
          <li>manifest.json เก็บรายการหน่วยความรู้ พร้อมค่าแฮช SHA-256 เพื่อตรวจว่าข้อมูลไม่ถูกแก้</li>
          <li>ในฉาก 3 มิติ วงแหวนแฮชหมุนแล้วล็อกรอบตารางเมื่อข้อมูลครบ</li>
        </ul>
      </>
    )
  return (
    <>
      <p className="lead">ชุดทดสอบต้องมีคำถาม 5 แบบ</p>
      <NumList items={dataset.testTypes} compact />
      <div className="callout">
        ตัวอย่างคำพ้อง: “<b>{dataset.example.from}</b>” = “<b>{dataset.example.to}</b>”
      </div>
    </>
  )
}

function Rag({ step }: { step: number }) {
  if (step === 0)
    return (
      <>
        <KV rows={rag.ai.map((a) => ({ k: a.k, v: a.v }))} />
        <p>
          ครูเอสคิวเลือกแนว <b>Retrieval-Augmented Generation (RAG)</b> — ค้นหัวข้อจากตำราก่อน แล้วให้โมเดลภาษาเรียบเรียงคำตอบ
        </p>
        <Flow items={rag.flow} />
        <p className="small muted">ภาพที่ 2-2 · 4 ขั้น: รับคำถาม → ค้นหัวข้อ → Gemini → แสดงคำตอบ</p>
      </>
    )
  if (step === 1)
    return (
      <>
        <KV rows={rag.approach.map((a) => ({ k: a.k, v: a.v }))} />
        <div className="callout">
          ชื่อหัวข้อและแหล่งอ้างอิงมาจากข้อมูลกำกับในฐานความรู้ — <b>ไม่ให้ Gemini แต่งเอง</b>
        </div>
      </>
    )
  if (step === 2)
    return (
      <>
        <p className="lead">เหตุผลที่เลือกแนว RAG (4 ข้อ)</p>
        <NumList items={rag.reasons} compact />
        <p className="lead">ข้อจำกัด (2 ข้อ)</p>
        <NumList items={rag.limits} compact />
      </>
    )
  return (
    <>
      <p className="lead">ขั้นตอนการพัฒนา 8 ขั้น</p>
      <NumList items={rag.devSteps} compact />
    </>
  )
}

function Chatbot({ step }: { step: number }) {
  const notFound = useStore((s) => s.notFound)
  if (step === 0)
    return (
      <>
        <p className="lead">แชทบอทมี 3 ประเภท</p>
        <KV rows={chatbot.types.map((t) => ({ k: t.k, v: t.v }))} />
        <div className="callout">
          <b>ครูเอสคิว</b> = {chatbot.kru.join(' · ')}
        </div>
      </>
    )
  if (step === 1)
    return (
      <>
        <p className="lead">ขั้นตอนพัฒนาแชทบอท 7 ขั้น</p>
        <NumList items={chatbot.devSteps} compact />
      </>
    )
  if (step === 2)
    return (
      <>
        <p className="lead">สถาปัตยกรรม 5 องค์ประกอบ (ภาพที่ 2-3)</p>
        <ol className="num-list compact">
          <li>ผู้เรียน ↔ Flask</li>
          <li>Flask ↔ knowledge_base.py</li>
          <li>knowledge_base.py ↔ ฐานความรู้</li>
          <li>Flask ↔ Gemini</li>
        </ol>
        <p className="small muted">แพ็กเก็ตแสงในฉากแสดงลำดับ 1 → 5 ของการตอบหนึ่งคำถาม</p>
      </>
    )
  return (
    <>
      <p className="lead">เมื่อไม่พบหัวข้อที่ตรงกับคำถาม</p>
      <div className={`callout ${notFound ? 'bad' : ''}`}>
        ระบบตอบ “<b>{chatbot.notFound}</b>” <b>โดยไม่เรียก Gemini</b>
      </div>
      <button className="btn primary" onClick={() => useStore.getState().setNotFound(!notFound)}>
        {notFound ? 'กลับไปเส้นทางปกติ (ผ่าน Gemini)' : 'แสดงเส้นทาง “ไม่พบข้อมูล”'}
      </button>
      <p className="small muted" style={{ marginTop: 10 }}>
        เส้นทางนี้ข้าม Gemini ทั้งหมด — ผู้เรียนได้คำตอบตรงๆ ว่าตำราไม่มีเรื่องนี้
      </p>
    </>
  )
}

function Tools({ step }: { step: number }) {
  if (step === 0)
    return (
      <>
        <KV rows={tools.items.map((t) => ({ k: t.k, v: t.v }))} />
        <p className="small muted">{tools.separation}</p>
      </>
    )
  if (step === 1)
    return (
      <>
        <Stats items={[{ v: String(tools.unittest), l: 'รายการทดสอบ unittest', tone: 'good' }]} />
        <p>ชุดทดสอบอัตโนมัติด้วย unittest ใช้ตรวจว่าการแก้ระบบแต่ละครั้งไม่ทำให้ของเดิมพัง</p>
        <p className="small muted">ภาพที่ 2-4 · ชั้นของระบบ เรียงจากผู้ใช้ถึงข้อมูล</p>
      </>
    )
  return (
    <>
      <p className="lead">การจัดการ error 4 กรณี</p>
      <NumList items={tools.errors} compact />
    </>
  )
}

function Related({ step }: { step: number }) {
  if (step === 0)
    return (
      <>
        {related.papers.map((p) => (
          <div key={p.who} className="callout" style={{ marginTop: 0 }}>
            <b>
              {p.who} ({p.year})
            </b>
            <br />
            {p.what}
            {p.tech && (
              <>
                <br />
                <span className="muted">เทคโนโลยี: </span>
                {p.tech}
              </>
            )}
            {p.extra && (
              <>
                <br />
                <span className="muted">{p.extra}</span>
              </>
            )}
          </div>
        ))}
      </>
    )
  if (step === 1)
    return (
      <table className="tbl">
        <thead>
          <tr>
            {related.compare.head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {related.compare.rows.map((r) => (
            <tr key={r[0]}>
              <td className="muted">{r[0]}</td>
              <td>{r[1]}</td>
              <td>{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  return (
    <>
      <p className="lead">สังเคราะห์งานวิจัย → นำมาใช้</p>
      <Flow items={related.synthesis} />
      <div className="callout">
        สรุปทฤษฎี: <b>กำหนดผู้ใช้ ขอบเขต และแหล่งข้อมูลให้ชัด</b> แล้วทดสอบด้วยชุดคำถามที่วัดผลได้
      </div>
    </>
  )
}

function Method({ step }: { step: number }) {
  if (step === 0)
    return (
      <>
        <p className="lead">วิจัยและพัฒนา (R&amp;D) 3 ระยะ (ภาพที่ 3-1)</p>
        <ol className="num-list">
          {method.phases.map((p) => (
            <li key={p.k}>
              <span>
                <b style={{ color: p.color }}>{p.k}</b> · {p.v}
              </span>
            </li>
          ))}
        </ol>
        <p className="small muted">ตารางที่ 3-1 สรุปกิจกรรมของแต่ละระยะ</p>
      </>
    )
  if (step === 1)
    return (
      <>
        <p className="lead">กรอบ Input – Process – Output – Evaluation (ภาพที่ 3-2)</p>
        <KV rows={method.ipo.map((i) => ({ k: i.k, v: i.v }))} />
        <div className="callout warn">{method.evaluation}</div>
        <p className="small muted">สถาปัตยกรรมระบบ 5 ส่วน (ภาพที่ 3-3): {method.architecture.join(' · ')}</p>
      </>
    )
  return (
    <>
      <p className="lead">เตรียมข้อมูล 6 ขั้น (ตารางที่ 3-2)</p>
      <NumList items={method.prep} compact />
      <Stats
        items={[
          { v: String(method.toc), l: 'รายการในสารบัญ' },
          { v: String(method.units), l: 'หน่วยความรู้', tone: 'good' },
        ]}
      />
    </>
  )
}

function Build({ step }: { step: number }) {
  if (step === 0)
    return (
      <>
        <p className="lead">ขั้นตอนค้นคืน 5 ขั้น</p>
        <NumList items={build.retrieval} compact />
        <p className="lead">System Prompt 4 ข้อ</p>
        <NumList items={build.prompt} compact />
        <div className="callout">{build.guard}</div>
      </>
    )
  return (
    <>
      <ul className="bullets">
        {build.web.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      <div className="callout warn">{build.channelNote}</div>
      <p style={{ margin: '10px 0' }}>
        <span className="pill" style={{ ['--c' as string]: '#34d399' }}>
          ใช้งานจริง: {build.channels.done}
        </span>{' '}
        {build.channels.pending.map((c) => (
          <span key={c} className="pill" style={{ ['--c' as string]: '#64748b', marginRight: 4 }}>
            {c} · ยังไม่เชื่อม
          </span>
        ))}
      </p>
      <a className="btn primary" href={BOT_URL} target="_blank" rel="noreferrer">
        ลองถามครูเอสคิว ↗
      </a>
      <p className="small muted" style={{ marginTop: 8 }}>
        {BOT_HOST}
      </p>
    </>
  )
}

function Evaluation({ step }: { step: number }) {
  if (step === 0)
    return (
      <>
        <p className="lead">ผู้ทดสอบ 2 กลุ่ม · ชุดคำถาม 110 ข้อ</p>
        <Stats
          items={[
            { v: String(evaluation.split.inScope), l: 'ในขอบเขต', tone: 'hero' },
            { v: String(evaluation.split.outScope), l: 'นอกขอบเขต', tone: 'warn' },
          ]}
        />
        <p className="small">{evaluation.split.inNote}</p>
        <p className="small">
          นอกขอบเขต 29 ข้อ = นอกวิชา 10 + ไอทีนอกตำรา 12 + นอกบทบาท 7 · ผู้ทดสอบ ภายใน 3 + ภายนอก 3 (ตารางที่ 3-3)
        </p>
      </>
    )
  if (step === 1)
    return (
      <>
        <p className="lead">เกณฑ์ TP / FP / TN / FN</p>
        <dl className="kv" style={{ gridTemplateColumns: '48px 1fr' }}>
          {evaluation.matrix.map((m) => (
            <div key={m.k} style={{ display: 'contents' }}>
              <dt>
                <b style={{ color: m.color }}>{m.k}</b>
              </dt>
              <dd>{m.v}</dd>
            </div>
          ))}
        </dl>
        <p className="small muted">เกณฑ์ตัดสิน: ตารางที่ 3-4 · Confusion Matrix: ตารางที่ 3-6</p>
      </>
    )
  return (
    <>
      <div className="formula">
        {evaluation.formulas.map((f) => (
          <div key={f.k} className={f.main ? 'main' : ''}>
            <b>{f.k}</b>
            <span>{f.f}</span>
          </div>
        ))}
      </div>
      <p className="small">วิเคราะห์ 3 ระดับ: {evaluation.levels3.join(' · ')} · เกณฑ์แปลผล: ตารางที่ 3-7</p>
      <table className="tbl">
        <tbody>
          {levels.map((l) => (
            <tr key={l.key}>
              <td>
                <span className="pill" style={{ ['--c' as string]: l.color }}>
                  {l.label}
                </span>
              </td>
              <td className="num">{l.range}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

function Results({ step }: { step: number }) {
  const { persons, groups, cm, metrics } = results
  if (step === 0)
    return (
      <>
        <p className="lead">หน้าเว็บจริงของครูเอสคิว (ภาพที่ 4-1 ถึง 4-4)</p>
        <ul className="bullets">
          <li>เมนูซ้ายและประวัติการสนทนา</li>
          <li>ปรับขนาดอักษรได้</li>
          <li>ตัวอย่างคำถาม 6 ปุ่ม</li>
          <li>ช่องพิมพ์คำถาม</li>
        </ul>
        <a className="btn primary" href={BOT_URL} target="_blank" rel="noreferrer">
          เปิดเว็บจริง ↗
        </a>
        <p className="small muted" style={{ marginTop: 8 }}>
          ภาพจากเว็บจริงอยู่ที่ public/screens/4-1.png … 4-4.png — แทนที่ด้วยภาพจากเล่มได้
        </p>
      </>
    )
  if (step === 1)
    return (
      <>
        <p className="lead">Accuracy รายบุคคล (110 ข้อ / คน)</p>
        <table className="tbl">
          <thead>
            <tr>
              <th>ผู้ทดสอบ</th>
              <th className="num">ถูก</th>
              <th className="num">Accuracy</th>
              <th>ระดับ</th>
            </tr>
          </thead>
          <tbody>
            {persons.map((p) => (
              <tr key={p.n} className={p.acc >= 80 ? 'hl' : ''}>
                <td>
                  คนที่ {p.n}{' '}
                  <span className="muted small">{p.group === 'in' ? '· ภายใน' : '· ภายนอก'}</span>
                </td>
                <td className="num">{p.correct}</td>
                <td className="num">
                  <b>{p.acc.toFixed(2)}</b>
                </td>
                <td>
                  <LevelPill score={p.acc} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="small">
          คนที่ 1 สูงสุด <b>80.91%</b> (คนเดียวที่ผ่าน 80%) · คนที่ 2–3 ต่ำสุด <b>76.36%</b>
        </p>
      </>
    )
  if (step === 2)
    return (
      <>
        <Stats
          items={[
            { v: `${groups.out.acc.toFixed(2)}%`, l: `ภายนอก ${groups.out.correct}/${groups.out.total}`, tone: 'hero' },
            { v: `${groups.in.acc.toFixed(2)}%`, l: `ภายใน ${groups.in.correct}/${groups.in.total}` },
          ]}
        />
        <p>
          ภายนอกสูงกว่าภายในเพียง <b>{groups.diff.toFixed(2)}</b> — ความคุ้นเคยไม่ได้ทำให้ผลต่างกันมาก
        </p>
        <div className="callout warn">ทั้งสองกลุ่ม <b>ต่ำกว่า 80%</b></div>
      </>
    )
  if (step === 3)
    return (
      <>
        <p className="lead">
          ตอบถูก <b>{cm.correct}</b> / {cm.total} รายการ
        </p>
        <div className="cm">
          <div className="h" />
          <div className="h">ระบบตอบ</div>
          <div className="h">ระบบไม่ตอบ</div>
          <div className="h">ควรตอบ</div>
          <div className="cell" style={{ ['--c' as string]: '#34d399' }}>
            <b>{cm.tp}</b>
            <span>TP</span>
          </div>
          <div className="cell" style={{ ['--c' as string]: '#fb923c' }}>
            <b>{cm.fn}</b>
            <span>FN</span>
          </div>
          <div className="h">ไม่ควรตอบ</div>
          <div className="cell" style={{ ['--c' as string]: '#fb7185' }}>
            <b>{cm.fp}</b>
            <span>FP</span>
          </div>
          <div className="cell" style={{ ['--c' as string]: '#38bdf8' }}>
            <b>{cm.tn}</b>
            <span>TN</span>
          </div>
        </div>
        <p className="small">
          Accuracy = ({cm.tp} + {cm.tn}) ÷ {cm.total} = <b>{metrics.accuracy}%</b>
        </p>
        <div className="callout" style={{ fontSize: 14 }}>
          <b>FP {cm.fp} = 2 แบบ</b>
          <br />• ตอบคำถามนอกขอบเขต {results.fpSplit.outOfScope} (ปฏิเสธถูก {results.fpSplit.outRejected} จาก {results.fpSplit.outTotal})
          <br />• ตอบผิดหัวข้อในขอบเขต {results.fpSplit.wrongTopic} — Recall ไม่นับกรณีนี้
        </div>
      </>
    )
  const rows = [
    { k: 'Accuracy', v: metrics.accuracy, main: true },
    { k: 'Precision', v: metrics.precision },
    { k: 'Recall', v: metrics.recall },
    { k: 'F1', v: metrics.f1 },
  ]
  return (
    <>
      {rows.map((r) => {
        const l = levelOf(r.v)
        return (
          <div key={r.k} className="gauge-row" style={{ ['--c' as string]: l.color }}>
            <span className="name">
              {r.k} <LevelPill score={r.v} />
            </span>
            <span className="val">
              <CountUp to={r.v} />%
            </span>
            <div className="track">
              <div className="fill" style={{ width: `${r.v}%` }} />
              <div className="mark" />
            </div>
          </div>
        )
      })}
      <div className="callout bad">
        <b>ไม่เป็นไปตามสมมติฐาน</b> — Accuracy 78.18% ต่ำกว่าเกณฑ์ 80% อยู่ <b>{results.gap.toFixed(2)}</b>
      </div>
    </>
  )
}

function Conclusion({ step }: { step: number }) {
  if (step === 0)
    return (
      <>
        <KV rows={conclusion.summary.map((s) => ({ k: s.k, v: s.v }))} />
        <Stats
          items={[
            { v: `${results.metrics.accuracy}%`, l: 'Accuracy', tone: 'warn' },
            { v: '80%', l: 'เกณฑ์ผ่าน', tone: 'good' },
            { v: `−${results.gap}`, l: 'ที่ขาด', tone: 'bad' },
          ]}
        />
      </>
    )
  return (
    <>
      <p className="lead">ข้อเสนอแนะ 3 ข้อ — เส้นทางสู่ 80%</p>
      <NumList items={conclusion.suggestions} />
    </>
  )
}

function Appendix({ step }: { step: number }) {
  if (step === 0)
    return (
      <>
        <p className="lead">{appendix.a.title}</p>
        <NumList items={appendix.a.steps} compact />
        <p className="small muted">{appendix.a.figures}</p>
      </>
    )
  if (step === 1)
    return (
      <>
        <p className="lead">{appendix.b.title}</p>
        <QuestionTable />
      </>
    )
  return (
    <>
      <p className="lead">บรรณานุกรม</p>
      <Stats
        items={[
          { v: String(references.thCount), l: 'รายการภาษาไทย' },
          { v: String(references.enCount), l: 'รายการภาษาอังกฤษ' },
        ]}
      />
      <ul className="bullets">
        {[...references.th, ...references.en].map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <p className="small muted">รายการเต็มอยู่ในเล่มโครงงาน (ใส่เพิ่มได้ที่ references ใน content.ts)</p>
    </>
  )
}

export function Panel({ scene, step }: { scene: string; step: number }) {
  switch (scene) {
    case 'cover':
      return <Cover />
    case 'problem':
      return <Problem />
    case 'scope':
      return <Scope step={step} />
    case 'dataset':
      return <Dataset step={step} />
    case 'rag':
      return <Rag step={step} />
    case 'chatbot':
      return <Chatbot step={step} />
    case 'tools':
      return <Tools step={step} />
    case 'related':
      return <Related step={step} />
    case 'method':
      return <Method step={step} />
    case 'build':
      return <Build step={step} />
    case 'evaluation':
      return <Evaluation step={step} />
    case 'results':
      return <Results step={step} />
    case 'conclusion':
      return <Conclusion step={step} />
    case 'appendix':
      return <Appendix step={step} />
    default:
      return null
  }
}
