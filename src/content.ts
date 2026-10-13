/**
 * content.ts — แหล่งข้อมูลเดียวของทั้งเว็บ (ข้อความทุกฉาก + ตัวเลขผล + ชุดคำถาม 110 ข้อ)
 * แก้ที่นี่ที่เดียว เว็บทั้งหน้าเปลี่ยนตาม
 *
 * หมายเหตุ: รายการที่ติดป้าย DRAFT คือส่วนที่แผนเว็บระบุเพียง "จำนวนข้อ"
 * (เช่น เหตุผล 4 ข้อ, ขั้นตอน 8 ขั้น) ข้อความในนี้เป็นร่างที่สรุปจากข้อมูลในแผน
 * ให้เปลี่ยนเป็นถ้อยคำจริงจากเล่มโครงงานก่อนนำเสนอ
 */

export const BOT_URL = 'https://chat-bot-eight-pied.vercel.app'
export const BOT_HOST = 'chat-bot-eight-pied.vercel.app'

/* ───────────────────────── ปก ───────────────────────── */

export const project = {
  short: 'ครูเอสคิว',
  titleTh:
    'การพัฒนาแชทบอทตอบคำถามเรื่องการจัดการระบบฐานข้อมูลและภาษา SQL (ChatBot ครูเอสคิว)',
  // แผนระบุเฉพาะส่วนท้ายของชื่ออังกฤษ "(Chatbot Kru SQL)" — ส่วนหน้าเป็นฉบับแปลจากชื่อไทย ตรวจกับเล่มอีกครั้ง
  titleEn:
    'Development of a Chatbot for Answering Questions on Database Management Systems and SQL (Chatbot Kru SQL)',
  department: 'ภาควิชาคอมพิวเตอร์ศึกษา',
  faculty: 'คณะครุศาสตร์อุตสาหกรรม',
  university: 'มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ (มจพ.)',
  term: 'ภาคเรียน 1/2569',
  author: 'นายฐปนรรฆ์ ธงภักดิ์',
  // สมาชิก 6 คน (ช่องที่ name ว่างจะแสดงเป็นกรอบประ)
  members: [
    { name: 'นางสาวณัฐวรา วิเศษทรัพย์', id: '6702041610053' },
    { name: 'นายณัฐดนัย โพธิ์ทอง', id: '6702041610215' },
    { name: 'นายอิงชิตะ บุญอาจ', id: '6702041610223' },
    { name: 'นางสาวนพวรรณ กลิ่นนิรันดร', id: '6702041610282' },
    { name: 'นายณัฐดนัย เหล่าเรือง', id: '6702041610321' },
    { name: 'นายฐปนรรฆ์ ธงภักดิ์', id: '6702041610171' },
  ],
}

/* ───────────────────────── ผลการทดลอง (บทที่ 4) ───────────────────────── */

export type Group = 'in' | 'out'

export const results = {
  threshold: 80,
  gap: 1.82,
  // รายบุคคล: 110 ข้อ/คน — คนที่ 1–3 = กลุ่มภายใน, 4–6 = กลุ่มภายนอก (ตรวจจากผลรวม 257 / 259 ตรงกับ 4.3)
  persons: [
    { n: 1, correct: 89, acc: 80.91, group: 'in' as Group },
    { n: 2, correct: 84, acc: 76.36, group: 'in' as Group },
    { n: 3, correct: 84, acc: 76.36, group: 'in' as Group },
    { n: 4, correct: 87, acc: 79.09, group: 'out' as Group },
    { n: 5, correct: 85, acc: 77.27, group: 'out' as Group },
    { n: 6, correct: 87, acc: 79.09, group: 'out' as Group },
  ],
  groups: {
    in: { label: 'ผู้ทดสอบภายใน', correct: 257, total: 330, acc: 77.88 },
    out: { label: 'ผู้ทดสอบภายนอก', correct: 259, total: 330, acc: 78.48 },
    diff: 0.6,
  },
  cm: { tp: 378, tn: 138, fp: 75, fn: 69, total: 660, correct: 516 },
  metrics: { accuracy: 78.18, precision: 83.44, recall: 84.56, f1: 84.0 },
  // FP รวม 2 แบบ (ไว้ตอบกรรมการ)
  fpSplit: { outOfScope: 36, wrongTopic: 39, outTotal: 174, outRejected: 138 },
}

export type LevelKey = 'great' | 'good' | 'fair' | 'improve' | 'poor'
export const levels: { key: LevelKey; label: string; range: string; min: number; color: string }[] = [
  { key: 'great', label: 'ดีมาก', range: '≥ 90', min: 90, color: '#34d399' },
  { key: 'good', label: 'ดี', range: '80 – 89.99', min: 80, color: '#38bdf8' },
  { key: 'fair', label: 'พอใช้', range: '70 – 79.99', min: 70, color: '#fbbf24' },
  { key: 'improve', label: 'ควรปรับปรุง', range: '60 – 69.99', min: 60, color: '#fb923c' },
  { key: 'poor', label: 'ต้องปรับปรุงมาก', range: '< 60', min: 0, color: '#fb7185' },
]
export const levelOf = (score: number) => levels.find((l) => score >= l.min) ?? levels[levels.length - 1]

/* ───────────────────────── ชุดคำถาม 110 ข้อ ───────────────────────── */

export const chapters = Array.from({ length: 12 }, (_, i) => {
  const n = i + 1
  return { n, questions: n <= 9 ? 7 : 6 }
})

// ชื่อบท (ว่างไว้ — ใส่ชื่อบทจากตำราเพื่อให้แสดงบนการ์ดและตารางภาคผนวก ข)
export const chapterTitles: Record<number, string> = {}

// จำนวนหน่วยความรู้ต่อบท (รวม 172) — ค่าเริ่มต้นกระจายเท่าๆ กัน ใส่จำนวนจริงจาก manifest.json ได้
export const unitsPerChapter = [15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14] // = 172

export const outOfScope = [
  { key: 'offtopic', label: 'นอกวิชา', n: 10 },
  { key: 'it', label: 'ไอทีนอกตำรา', n: 12 },
  { key: 'role', label: 'นอกบทบาท', n: 7 },
]

export type Question = {
  id: number
  kind: 'in' | 'offtopic' | 'it' | 'role'
  chapter?: number
  text: string
  expected: string
}

// ใส่ตัวอักษรคำถามจริงจากภาคผนวก ข ตามลำดับข้อ 1–110 (ข้อ 1–81 = ในขอบเขต เรียงตามบท, ข้อ 82–110 = นอกขอบเขต)
// เช่น questionTexts[0] = 'คีย์หลักคืออะไร'
export const questionTexts: string[] = []

export const questions: Question[] = (() => {
  const list: Question[] = []
  let id = 1
  for (const ch of chapters) {
    for (let k = 0; k < ch.questions; k++) {
      list.push({
        id,
        kind: 'in',
        chapter: ch.n,
        text: questionTexts[id - 1] ?? '',
        expected: `ตอบถูกหัวข้อในบทที่ ${ch.n}`,
      })
      id++
    }
  }
  for (const g of outOfScope) {
    for (let k = 0; k < g.n; k++) {
      list.push({
        id,
        kind: g.key as Question['kind'],
        text: questionTexts[id - 1] ?? '',
        expected: 'ปฏิเสธ — “ไม่มีข้อมูลเรื่องนี้ในตำรา”',
      })
      id++
    }
  }
  return list
})()

export const kindLabel: Record<Question['kind'], string> = {
  in: 'ในขอบเขต',
  offtopic: 'นอกวิชา',
  it: 'ไอทีนอกตำรา',
  role: 'นอกบทบาท',
}

/* ───────────────────────── บรรณานุกรม ───────────────────────── */

// รายการเต็มของเล่ม: ไทย 7 + อังกฤษ 6 — ด้านล่างคือรายการที่ระบุในแผน (ผู้แต่ง/ปี) ใส่ข้อมูลอ้างอิงเต็มได้
export const references = {
  thCount: 7,
  enCount: 6,
  th: [
    'กิตติ (2561)',
    'สุทิเทพ และคณะ (2567)',
    'ศิรัฐ (2562)',
    'ฐาปนี เพ็งสุข (2562) — ตำราหลักที่ใช้เป็นฐานความรู้',
    'เจษฎา และคณะ (2567)',
    'ชาญชัย (2568)',
  ],
  en: ['Adamopoulou & Moussiades (2020)'],
}

/* ───────────────────────── เมตาของ 14 ฉาก ───────────────────────── */

export type SceneMeta = {
  key: string
  label: string // ชื่อบนเมนู
  title: string // หัวข้อบนการ์ด
  ref: string // หัวข้อในเอกสาร
  chapter: string // บทที่
  accent: string
  bg: string // สีพื้นหลัง 3D
  steps: string[] // แท็บภายในฉาก (ว่าง = ไม่มีแท็บ)
  width?: number // ความกว้างการ์ด (px)
  wide?: boolean // การ์ดกว้างกลางจอ
}

export const scenes: SceneMeta[] = [
  { key: 'cover', label: 'ปก', title: 'ChatBot ครูเอสคิว', ref: 'หน้าปก', chapter: 'ปก', accent: '#38bdf8', bg: '#060a1c', steps: [], width: 520 },
  { key: 'problem', label: 'ปัญหา', title: 'ปัญหาของผู้เรียน SQL', ref: '1.1', chapter: 'บทที่ 1', accent: '#fb7185', bg: '#10091c', steps: [] },
  { key: 'scope', label: 'เป้าหมายและขอบเขต', title: 'เป้าหมายและขอบเขต', ref: '1.2–1.5', chapter: 'บทที่ 1', accent: '#a78bfa', bg: '#0b0a22', steps: ['วัตถุประสงค์ · สมมติฐาน', 'ขอบเขต', 'ประโยชน์'] },
  { key: 'dataset', label: 'ชุดข้อมูล', title: 'ชุดข้อมูล', ref: '2.1.1–2.1.5', chapter: 'บทที่ 2', accent: '#22d3ee', bg: '#06141f', steps: ['แหล่งข้อมูล', 'ไปป์ไลน์ 5 ขั้น', 'ชุดทดสอบ'] },
  { key: 'rag', label: 'ปัญญาประดิษฐ์และ RAG', title: 'ปัญญาประดิษฐ์และ RAG', ref: '2.2.1–2.2.4', chapter: 'บทที่ 2', accent: '#34d399', bg: '#061a17', steps: ['AI · ML · NLP', 'Retrieval vs Generation', 'เหตุผล · ข้อจำกัด', 'ขั้นตอน 8 ขั้น'] },
  { key: 'chatbot', label: 'แชทบอท', title: 'แชทบอท', ref: '2.3.1–2.3.6', chapter: 'บทที่ 2', accent: '#38bdf8', bg: '#071225', steps: ['3 ประเภท', 'พัฒนา 7 ขั้น', 'สถาปัตยกรรม', 'ไม่พบคำตอบ'] },
  { key: 'tools', label: 'เครื่องมือ', title: 'เครื่องมือที่ใช้', ref: '2.4.1–2.4.8', chapter: 'บทที่ 2', accent: '#fbbf24', bg: '#15110a', steps: ['8 รายการ', 'unittest 17', 'จัดการ error 4'] },
  { key: 'related', label: 'งานวิจัยที่เกี่ยวข้อง', title: 'งานวิจัยที่เกี่ยวข้อง', ref: '2.5–2.6', chapter: 'บทที่ 2', accent: '#f472b6', bg: '#170a18', steps: ['งานวิจัย 2 ชิ้น', 'เทียบกับครูเอสคิว', 'สังเคราะห์'], width: 520 },
  { key: 'method', label: 'การออกแบบวิจัย', title: 'การออกแบบงานวิจัย', ref: '3.1–3.2', chapter: 'บทที่ 3', accent: '#60a5fa', bg: '#071022', steps: ['R&D 3 ระยะ', 'IPO + Evaluation', 'เตรียมข้อมูล 6 ขั้น'] },
  { key: 'build', label: 'การพัฒนาและนำไปใช้', title: 'การพัฒนาและนำไปใช้', ref: '3.3–3.4', chapter: 'บทที่ 3', accent: '#2dd4bf', bg: '#051a1c', steps: ['ค้นคืน · Prompt', 'หน้าเว็บ · Deploy'] },
  { key: 'evaluation', label: 'วิธีประเมิน', title: 'วิธีประเมินผล', ref: '3.5–3.6', chapter: 'บทที่ 3', accent: '#fb923c', bg: '#170e08', steps: ['ชุดคำถาม 81 + 29', 'TP · FP · TN · FN', 'ตัวชี้วัด · เกณฑ์ 5 ระดับ'] },
  { key: 'results', label: 'ผลการทดลอง', title: 'ผลการทดลอง', ref: '4.1–4.5', chapter: 'บทที่ 4', accent: '#f87171', bg: '#12080d', steps: ['4.1 หน้าเว็บ', '4.2 รายบุคคล', '4.3 รายกลุ่ม', '4.4 ภาพรวม', '4.5 ตัวชี้วัด'], width: 480 },
  { key: 'conclusion', label: 'สรุปและข้อเสนอแนะ', title: 'สรุปและข้อเสนอแนะ', ref: '5.1–5.2', chapter: 'บทที่ 5', accent: '#a3e635', bg: '#0c1407', steps: ['5.1 สรุปผล', '5.2 ข้อเสนอแนะ 3 ข้อ'] },
  { key: 'appendix', label: 'ภาคผนวกและอ้างอิง', title: 'ภาคผนวกและอ้างอิง', ref: 'ก · ข · บรรณานุกรม', chapter: 'ภาคผนวก', accent: '#94a3b8', bg: '#080c18', steps: ['ภาคผนวก ก', 'ภาคผนวก ข', 'บรรณานุกรม'], wide: true },
]

export const SCENE_COUNT = scenes.length

/* ───────────────────────── เนื้อหาแต่ละบท ───────────────────────── */

export const problem = {
  items: [
    'จำโครงสร้างคำสั่ง SQL ไม่ได้',
    'เลือกคำสั่งผิด',
    'แก้ error ไม่เป็น',
    'ถามผู้สอนไม่ได้ทุกเวลา',
  ],
  idea: 'ใช้แชทบอท AI เป็นผู้ช่วยเรียน',
  refs: ['กิตติ (2561)', 'สุทิเทพ และคณะ (2567)', 'ศิรัฐ (2562)'],
}

export const scope = {
  objectives: ['พัฒนาแชทบอท', 'ประเมินประสิทธิภาพของแชทบอท'],
  hypothesis: 'ประสิทธิภาพของแชทบอทอยู่ในระดับดีขึ้นไป',
  passRule: 'Accuracy ≥ 80%',
  scopeItems: [
    { k: 'เนื้อหา', v: '12 หัวข้อตามตำรา' },
    { k: 'ผู้ทดสอบ', v: '6 คน (ภายใน 3 + ภายนอก 3)' },
    { k: 'ตัวแปรต้น', v: 'แชทบอท' },
    { k: 'ตัวแปรตาม', v: 'ประสิทธิภาพ' },
    { k: 'ระยะเวลา', v: 'ก.ค. – ก.ย. 2569' },
    { k: 'ชุดทดสอบ', v: '110 ข้อ × 6 คน = 660 รายการ' },
  ],
  benefits: [
    'ได้เครื่องมือช่วยเรียน',
    'ผู้เรียนทบทวนเองได้',
    'ผู้สอนใช้เป็นสื่อ',
    'เป็นต้นแบบใช้กับวิชาอื่น',
  ],
}

export const dataset = {
  source: 'ตำรา ฐาปนี เพ็งสุข (2562)',
  bookTitle: 'การจัดการระบบฐานข้อมูลเพื่องานธุรกิจ',
  stats: [
    { v: '426', l: 'หน้า' },
    { v: '12', l: 'บท' },
    { v: '172', l: 'หน่วยความรู้' },
    { v: '~3,500', l: 'ตัวอักษร / หน่วย' },
  ],
  note: 'ใช้เป็นฐานความรู้สำหรับค้นคืน ไม่ได้ใช้ฝึกโมเดล',
  pipeline: ['PDF', 'PyMuPDF', 'ตรวจทาน', 'Markdown', 'manifest.json + SHA-256'],
  testTypes: ['ตรงชื่อหัวข้อ', 'คำพ้อง', 'เลขหัวข้อ', 'ความหมายใกล้', 'นอกตำรา'],
  example: { from: 'คีย์หลัก', to: 'Primary Key' },
}

export const rag = {
  ai: [
    { k: 'AI', v: 'ปัญญาประดิษฐ์ — ให้เครื่องทำงานที่ต้องใช้ความฉลาดแบบมนุษย์' },
    { k: 'ML', v: 'การเรียนรู้ของเครื่อง — เรียนรู้รูปแบบจากข้อมูล' },
    { k: 'NLP', v: 'การประมวลผลภาษาธรรมชาติ — ให้เครื่องเข้าใจและใช้ภาษาคน' },
  ],
  approach: [
    {
      k: 'Retrieval (ค้นคืน)',
      v: 'knowledge_base.py จับคู่ชื่อหัวข้อ + ตารางคำพ้อง + ให้คะแนน แล้วเลือกหัวข้อจากตำรา',
    },
    {
      k: 'Generation (สร้างคำตอบ)',
      v: 'Gemini (Gemini Flash 3.5) เรียบเรียงเนื้อหาที่ค้นได้เป็นภาษาไทย',
    },
  ],
  // DRAFT: แผนระบุ "เหตุผล 4 ข้อ / ข้อจำกัด 2 ข้อ / ขั้นตอน 8 ขั้น" — แทนที่ด้วยถ้อยคำจากเล่ม
  reasons: [
    'คำตอบมาจากตำราเล่มเดียว ตรวจสอบย้อนกลับได้',
    'ไม่ต้องฝึกโมเดลใหม่ — ใช้ตำรา 172 หน่วยเป็นฐานความรู้',
    'ชื่อหัวข้อ/แหล่งอ้างอิงมาจากข้อมูลกำกับ ไม่ให้ Gemini แต่งเอง',
    'ปรับปรุงฐานความรู้ คำพ้อง และกฎได้ง่ายโดยไม่ต้องฝึกซ้ำ',
  ],
  limits: [
    'ค้นด้วยการจับคู่ชื่อ/คำพ้อง — ถ้าตารางคำพ้องไม่ครอบคลุมอาจตอบผิดหัวข้อ',
    'ตอบได้เฉพาะเนื้อหาในตำราเล่มเดียว (Closed-domain)',
  ],
  flow: ['รับคำถาม', 'ค้นหัวข้อ', 'Gemini', 'แสดงคำตอบ'], // ภาพที่ 2-2
  devSteps: [
    'กำหนดปัญหาและผู้ใช้',
    'รวบรวมตำราเป็นแหล่งข้อมูล',
    'เตรียมและแบ่งข้อมูลเป็นหน่วยความรู้',
    'เลือกแนวทาง RAG',
    'พัฒนาระบบค้นคืน (knowledge_base.py)',
    'เชื่อม Gemini และเขียน System Prompt',
    'พัฒนาหน้าเว็บและทดสอบระบบ',
    'ประเมินผลและปรับปรุง',
  ],
}

export const chatbot = {
  types: [
    { k: 'แบบกฎ (Rule-based)', v: 'ตอบตามกฎ/รูปแบบที่กำหนดไว้ล่วงหน้า' },
    { k: 'แบบค้นคืน (Retrieval-based)', v: 'เลือกคำตอบที่เหมาะสมจากฐานข้อมูล' },
    { k: 'แบบสร้างคำตอบ (Generative)', v: 'สร้างคำตอบใหม่ด้วยโมเดลภาษา' },
  ],
  kru: ['Hybrid', 'Closed-domain', 'ถาม–ตอบทีละข้อ'],
  // DRAFT: พัฒนา 7 ขั้น
  devSteps: [
    'กำหนดผู้ใช้และขอบเขตการตอบ',
    'จัดเตรียมฐานความรู้จากตำรา',
    'ออกแบบบทสนทนาและรูปแบบคำตอบ',
    'พัฒนาระบบค้นคืนหัวข้อ',
    'เชื่อม Gemini ผ่าน System Prompt',
    'พัฒนาหน้าเว็บแชท',
    'ทดสอบและปรับปรุง',
  ],
  // ภาพที่ 2-3 สถาปัตยกรรม 5 ขั้น
  nodes: ['ผู้เรียน', 'Flask', 'knowledge_base.py', 'ฐานความรู้', 'Gemini'],
  notFound: 'ไม่มีข้อมูลเรื่องนี้ในตำรา',
}

export const tools = {
  items: [
    { k: 'Python', v: 'ภาษาหลักของระบบ' },
    { k: 'Flask', v: 'เว็บเซิร์ฟเวอร์ (app.py)' },
    { k: 'Gemini API', v: 'เรียบเรียงคำตอบภาษาไทย' },
    { k: 'PyMuPDF', v: 'ดึงข้อความจาก PDF' },
    { k: 'Markdown / JSON / SHA-256', v: 'เก็บฐานความรู้ + manifest' },
    { k: 'เบราว์เซอร์ + localStorage', v: 'หน้าแชทและประวัติการสนทนา' },
    { k: 'Vercel', v: 'Deploy ขึ้นเว็บ' },
    { k: 'unittest', v: 'ทดสอบ 17 รายการ' },
  ],
  separation: 'แยกหน้าที่ app.py (เว็บ/API) กับ knowledge_base.py (ค้นคืน)',
  unittest: 17,
  // DRAFT: จัดการ error 4 แบบ
  errors: [
    'ไม่มี API key / ตั้งค่าไม่ครบ',
    'เรียก Gemini ไม่สำเร็จ (เครือข่าย/โควตา)',
    'คำถามว่างหรือรูปแบบไม่ถูกต้อง',
    'ไม่พบหัวข้อที่ตรงกับคำถาม',
  ],
}

export const related = {
  papers: [
    {
      who: 'Adamopoulou & Moussiades',
      year: '2020',
      what: 'ภาพรวมของแชทบอท — ความหมาย ประเภท และแนวทางการพัฒนา',
    },
    {
      who: 'เจษฎา และคณะ',
      year: '2567',
      what: 'แชทบอทบริการนักศึกษา',
      tech: 'PHP · Laravel · MySQL · Dialogflow',
      extra: 'ครอบคลุม 8 ด้านของบริการ',
    },
  ],
  compare: {
    head: ['ประเด็น', 'เจษฎา และคณะ (2567)', 'ครูเอสคิว'],
    rows: [
      ['กลุ่มผู้ใช้', 'นักศึกษา (บริการนักศึกษา)', 'ผู้เรียนวิชาฐานข้อมูลและ SQL'],
      ['เทคโนโลยี', 'PHP, Laravel, MySQL, Dialogflow', 'Python, Flask, Gemini API'],
      ['ขอบเขตข้อมูล', '8 ด้านของบริการนักศึกษา', 'ตำราเล่มเดียว 12 บท'],
      ['แนวทางตอบ', 'ตอบตามเจตนา (intent)', 'ค้นหัวข้อ + Gemini เรียบเรียง (RAG)'],
    ],
  },
  synthesis: ['กำหนดผู้ใช้', 'กำหนดขอบเขต', 'กำหนดแหล่งข้อมูล', 'ทดสอบ'],
}

export const method = {
  phases: [
    { k: 'ระยะที่ 1', v: 'ศึกษา', color: '#38bdf8' },
    { k: 'ระยะที่ 2', v: 'พัฒนา', color: '#34d399' },
    { k: 'ระยะที่ 3', v: 'ประเมิน', color: '#fb923c' },
  ],
  ipo: [
    { k: 'Input', v: 'ตำรา · คำถามทดสอบ' },
    { k: 'Process', v: 'ค้นคืนหัวข้อ + Gemini' },
    { k: 'Output', v: 'คำตอบ + แหล่งอ้างอิง' },
  ],
  evaluation: 'Evaluation — Confusion Matrix · Accuracy · Precision · Recall · F1',
  architecture: ['ผู้เรียน', 'Flask', 'knowledge_base.py', 'ฐานความรู้', 'Gemini'],
  prep: [
    'ดึงข้อความจากตำรา',
    'ตรวจทานสระ วรรณยุกต์ สัญลักษณ์ SQL',
    'ตัดภาพ ดัชนี บรรณานุกรมออก',
    'แบ่งตามสารบัญ',
    'สร้างคำพ้อง',
    'ตรวจข้อความซ้ำ / หัวข้อว่าง / รหัสซ้ำ',
  ],
  toc: 134,
  units: 172,
}

export const build = {
  // DRAFT: ค้นคืน 5 ขั้น + System Prompt 4 ข้อ
  retrieval: [
    'รับคำถามและทำความสะอาดข้อความ',
    'จับคู่ชื่อหัวข้อ / เลขหัวข้อ',
    'ตรวจตารางคำพ้อง',
    'ให้คะแนนและเลือกหัวข้อสูงสุด',
    'ส่งเนื้อหาให้ Gemini — หรือตอบ “ไม่มีข้อมูล” โดยไม่เรียก Gemini',
  ],
  prompt: [
    'ตอบจากเนื้อหาที่ได้รับเท่านั้น',
    'เรียบเรียงเป็นภาษาไทยที่ผู้เรียนเข้าใจง่าย',
    'ห้ามแต่งชื่อหัวข้อหรือแหล่งอ้างอิงเอง',
    'ถ้าไม่มีข้อมูล ให้แจ้งว่าไม่มีในตำรา',
  ],
  guard: 'ชื่อหัวข้อ/แหล่งอ้างอิงมาจากข้อมูลกำกับ ไม่ให้ Gemini แต่งเอง',
  web: ['หน้าแชท + ปรับขนาดอักษร', 'ประวัติสนทนาใน localStorage', 'Deploy บน Vercel'],
  channels: { done: 'หน้าเว็บ', pending: ['LINE', 'Telegram'] },
  channelNote: 'LINE / Telegram มีในโค้ดแต่ยังไม่เชื่อม',
}

export const evaluation = {
  split: {
    inScope: 81,
    outScope: 29,
    inNote: 'บท 1–9 บทละ 7 ข้อ · บท 10–12 บทละ 6 ข้อ',
  },
  // จากผลตัวเลขในบทที่ 4 และหมายเหตุ FP 2 แบบ
  matrix: [
    { k: 'TP', v: 'ถามในขอบเขต → ตอบหัวข้อถูกต้อง', color: '#34d399' },
    { k: 'FN', v: 'ถามในขอบเขต → ไม่ตอบ / บอกว่าไม่มีข้อมูล', color: '#fb923c' },
    { k: 'FP', v: 'ตอบทั้งที่ไม่ควรตอบ (นอกขอบเขต) หรือตอบผิดหัวข้อ', color: '#fb7185' },
    { k: 'TN', v: 'ถามนอกขอบเขต → ปฏิเสธถูกต้อง', color: '#38bdf8' },
  ],
  formulas: [
    { k: 'Accuracy', f: '(TP + TN) ÷ ทั้งหมด', main: true },
    { k: 'Precision', f: 'TP ÷ (TP + FP)' },
    { k: 'Recall', f: 'TP ÷ (TP + FN)' },
    { k: 'F1', f: '2 × P × R ÷ (P + R)' },
  ],
  levels3: ['รายบุคคล', 'รายกลุ่ม', 'ภาพรวม'],
}

export const conclusion = {
  summary: [
    { k: 'ผลการพัฒนา', v: 'ใช้สนับสนุนการเรียนรู้ SQL ได้' },
    { k: 'ผลการประเมิน', v: 'Accuracy 78.18% (ระดับพอใช้) ต่ำกว่าเกณฑ์ 80% อยู่ 1.82' },
    { k: 'สมมติฐาน', v: 'ยังไม่ผ่าน — แต่ Precision / Recall / F1 อยู่ในระดับดี' },
  ],
  suggestions: [
    'วิเคราะห์ FP / FN แล้วปรับคำพ้อง กฎ ฐานความรู้ และ prompt จากนั้นทดสอบซ้ำ',
    'บันทึกผลแยกรายบท',
    'ทดสอบกับผู้เรียนจริงให้มากขึ้น และวัดความพึงพอใจ',
  ],
}

export const appendix = {
  a: {
    title: 'ภาคผนวก ก — คู่มือสร้างแชทบอท 5 ขั้น',
    figures: 'ภาพที่ ก-1, ก-2',
    // DRAFT: 5 ขั้น
    steps: [
      'เตรียมตำราและแปลงเป็น Markdown',
      'สร้างฐานความรู้ + ตารางคำพ้อง',
      'เขียน knowledge_base.py และ app.py',
      'ตั้งค่า Gemini API และ System Prompt',
      'ทดสอบด้วย unittest แล้ว Deploy บน Vercel',
    ],
  },
  b: {
    title: 'ภาคผนวก ข — ชุดคำถามทดสอบ 110 ข้อ พร้อมผลที่คาดหวัง',
  },
}
