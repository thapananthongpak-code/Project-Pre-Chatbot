import { useMemo, useState } from 'react'
import { chapterTitles, chapters, kindLabel, outOfScope, questions } from '../content'

/** ตารางค้นหาคำถาม 110 ข้อ (กรองตามบท/ประเภท) */
export function QuestionTable() {
  const [group, setGroup] = useState<string>('all')
  const [chapter, setChapter] = useState<string>('all')
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return questions.filter((r) => {
      if (group !== 'all' && r.kind !== group) return false
      if (chapter !== 'all' && String(r.chapter ?? '') !== chapter) return false
      if (needle) {
        const hay = `${r.id} ${r.text} ${kindLabel[r.kind]} ${r.chapter ?? ''} ${r.expected}`.toLowerCase()
        if (!hay.includes(needle)) return false
      }
      return true
    })
  }, [group, chapter, q])

  const hasText = questions.some((r) => r.text)

  return (
    <div>
      <div className="filters">
        <select value={group} onChange={(e) => { setGroup(e.target.value); if (e.target.value !== 'in' && e.target.value !== 'all') setChapter('all') }} aria-label="ประเภท">
          <option value="all">ทุกประเภท (110)</option>
          <option value="in">ในขอบเขต (81)</option>
          {outOfScope.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label} ({o.n})
            </option>
          ))}
        </select>
        <select value={chapter} onChange={(e) => { setChapter(e.target.value); if (e.target.value !== 'all') setGroup('in') }} aria-label="บท">
          <option value="all">ทุกบท</option>
          {chapters.map((c) => (
            <option key={c.n} value={c.n}>
              {`บทที่ ${c.n}${chapterTitles[c.n] ? ` · ${chapterTitles[c.n]}` : ''} (${c.questions})`}
            </option>
          ))}
        </select>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหา…" aria-label="ค้นหาคำถาม" />
      </div>
      <div className="q-scroll">
        <table className="tbl">
          <thead>
            <tr>
              <th className="num">ข้อ</th>
              <th>ประเภท</th>
              <th>บท</th>
              <th>คำถาม</th>
              <th>ผลที่คาดหวัง</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="num">{r.id}</td>
                <td>
                  <span className="pill" style={{ ['--c' as string]: r.kind === 'in' ? '#38bdf8' : '#fb923c' }}>
                    {kindLabel[r.kind]}
                  </span>
                </td>
                <td>{r.chapter ?? '—'}</td>
                <td>{r.text || <span className="empty-q">ใส่ข้อความใน content.ts</span>}</td>
                <td>{r.expected}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  ไม่พบรายการ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="small muted" style={{ marginTop: 8 }}>
        แสดง {rows.length} จาก {questions.length} ข้อ{!hasText && ' · ยังไม่ได้ใส่ข้อความคำถาม (questionTexts ใน content.ts)'}
      </p>
    </div>
  )
}
