export type Stage = { title: string; dates: string; status: 'done' | 'active' | 'planned'; detail: string }
export type Media = { id: string; kind: 'photo' | 'video'; src: string; poster?: string; title: string; date: string; stage: string }
export type Message = { id: string; from: 'client' | 'team'; name: string; text: string; date: string }
export type Construction = {
  name: string; project: string; area: number; location: string; contract: string;
  start: string; finish: string; progress: number; manager: string;
  stages: Stage[]; media: Media[]; messages: Message[];
}
export type CabinetData = Construction & { mode: 'demo' | 'amocrm'; updatedAt: string }
export const DEMO_PHONE = '+7 (900) 000-00-00'
export const DEMO_PASSWORD = 'Dom2026!'

export function normalizePhone(value: string) {
  let digits = value.replace(/\D/g, '')
  if (digits.length === 11 && digits[0] === '8') digits = '7' + digits.slice(1)
  return /^7\d{10}$/.test(digits) ? digits : ''
}

/** Only explicit public reports are accepted; never pass through raw CRM fields. */
export function parseConstruction(value: unknown): Construction {
  const p = value as Construction
  const text = (v: unknown, max = 3000): v is string => typeof v === 'string' && v.length > 0 && v.length <= max
  const date = (v: unknown) => typeof v === 'string' && Number.isFinite(Date.parse(v))
  if (!p || !['name', 'project', 'location', 'contract', 'manager'].every(k => text(p[k as keyof Construction], 200)) || !date(p.start) || !date(p.finish) || !Number.isFinite(p.area) || p.area <= 0 || !Number.isFinite(p.progress) || p.progress < 0 || p.progress > 100) throw new Error('Некорректные данные стройки')
  if (!Array.isArray(p.stages) || !p.stages.length || p.stages.length > 20 || !p.stages.every(s => text(s.title, 150) && text(s.dates, 150) && text(s.detail) && ['done','active','planned'].includes(s.status))) throw new Error('Некорректные этапы')
  if (!Array.isArray(p.media) || p.media.length > 100 || !p.media.every(m => text(m.id, 100) && ['photo','video'].includes(m.kind) && text(m.src, 2000) && (!m.poster || text(m.poster, 2000)) && text(m.title, 200) && date(m.date) && text(m.stage, 150))) throw new Error('Некорректные медиа')
  return { name:p.name, project:p.project, area:p.area, location:p.location, contract:p.contract, start:p.start, finish:p.finish, progress:p.progress, manager:p.manager, stages:p.stages.map(s => ({title:s.title,dates:s.dates,status:s.status,detail:s.detail})), media:p.media.map(m => ({id:m.id,kind:m.kind,src:m.src,poster:m.poster,title:m.title,date:m.date,stage:m.stage})), messages:[] }
}
