/** Statistics for the parent area – computed from sessions and progress, nothing stored. */
import { BASE_CATALOG, getCategory } from './content'
import { BEGRIFFE, THEMEN } from '@/exercises/sache/shared'
import type { ProgressRecord, SessionRecord, Topic } from './types'

const DAY_MS = 24 * 60 * 60 * 1000

/** Local calendar day as "YYYY-MM-DD". */
export function dayKey(ms: number): string {
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export interface DayStat {
  day: string
  /** Weekday initial, e.g. "Mo". */
  label: string
  units: number
  minutes: number
}

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

/** Finished units and practice time per day, oldest day first. */
export function lastDays(
  sessions: readonly SessionRecord[],
  days = 14,
  now = Date.now(),
): DayStat[] {
  const result: DayStat[] = []
  for (let i = days - 1; i >= 0; i--) {
    const ms = now - i * DAY_MS
    result.push({ day: dayKey(ms), label: WEEKDAYS[new Date(ms).getDay()]!, units: 0, minutes: 0 })
  }
  const byDay = new Map(result.map((d) => [d.day, d]))
  for (const s of sessions) {
    const stat = byDay.get(dayKey(s.startedAt))
    if (!stat) continue
    if (s.completed) stat.units++
    stat.minutes += s.durationMs / 60_000
  }
  for (const d of result) d.minutes = Math.round(d.minutes)
  return result
}

export interface TopicStat {
  grade: number
  topic: Topic
  tasks: number
  stars: number
  /** Share of tasks with a star (0–1). */
  rate: number
}

/** Hit rate per grade and subject: tasks solved without the solution being shown. */
export function hitRates(sessions: readonly SessionRecord[]): TopicStat[] {
  const map = new Map<string, TopicStat>()
  for (const s of sessions) {
    if (s.tasks.length === 0) continue
    const key = `${s.grade}:${s.topic}`
    const stat = map.get(key) ?? { grade: s.grade, topic: s.topic, tasks: 0, stars: 0, rate: 0 }
    stat.tasks += s.tasks.length
    stat.stars += s.tasks.filter((t) => t.star).length
    map.set(key, stat)
  }
  return [...map.values()]
    .map((s) => ({ ...s, rate: s.stars / s.tasks }))
    .sort((a, b) => a.grade - b.grade || a.topic.localeCompare(b.topic))
}

export interface CategoryStat {
  grade: number
  topic: Topic
  category: string
  title: string
  icon: string
  tasks: number
  stars: number
  rate: number
}

/** Hit rate per category, from the catalog entry of each task (mixed units included). */
export function categoryRates(sessions: readonly SessionRecord[]): CategoryStat[] {
  const entries = new Map(BASE_CATALOG.map((e) => [e.id, e]))
  const map = new Map<string, CategoryStat>()
  for (const s of sessions) {
    for (const t of s.tasks) {
      const entry = entries.get(t.entryId)
      const category = entry && getCategory(entry.category)
      if (!entry || !category) continue
      const key = `${s.grade}:${category.id}`
      const stat = map.get(key) ?? {
        grade: s.grade,
        topic: entry.topic,
        category: category.id,
        title: category.title,
        icon: category.icon,
        tasks: 0,
        stars: 0,
        rate: 0,
      }
      stat.tasks++
      if (t.star) stat.stars++
      map.set(key, stat)
    }
  }
  return [...map.values()]
    .map((s) => ({ ...s, rate: s.stars / s.tasks }))
    .sort(
      (a, b) =>
        a.grade - b.grade || a.topic.localeCompare(b.topic) || a.title.localeCompare(b.title),
    )
}

export interface Stumble {
  itemKey: string
  exercise: string
  wrong: number
  correct: number
  box: number
}

/** Items that often went wrong and are not yet solid – the "Stolperwörter". */
export function stumbles(progress: readonly ProgressRecord[], limit = 10): Stumble[] {
  return progress
    .filter((p) => p.wrong >= 2 && p.box <= 3)
    .sort((a, b) => b.wrong - a.wrong || a.box - b.box || b.lastSeen - a.lastSeen)
    .slice(0, limit)
    .map((p) => ({
      itemKey: p.itemKey,
      exercise: p.itemKey.slice(0, p.itemKey.indexOf(':')),
      wrong: p.wrong,
      correct: p.correct,
      box: p.box,
    }))
}

export function exerciseTitle(moduleId: string): string {
  return BASE_CATALOG.find((e) => e.exercise === moduleId)?.title ?? moduleId
}

/** Readable label for an item key, e.g. 'rechnen.plus-minus:7-2' → '7 − 2'. */
export function itemLabel(itemKey: string, wordText: (id: string) => string | undefined): string {
  const colon = itemKey.indexOf(':')
  const module = itemKey.slice(0, colon)
  const part = itemKey.slice(colon + 1)
  switch (module) {
    case 'rechnen.mengen':
      return `${part} Punkte`
    case 'rechnen.menge-legen':
      return `${part} legen`
    case 'rechnen.vergleichen':
      return part.replace('-', ' ○ ')
    case 'rechnen.zahlenhaus': {
      const [total, known] = part.split('-')
      return `${total} = ${known} + ?`
    }
    case 'rechnen.plus-minus':
      return part.replace('+', ' + ').replace('-', ' − ')
    case 'lesen.silben-hoeren':
    case 'schreiben.nachspuren':
      return part
    case 'lesen.satz-bild':
    case 'schreiben.diktat':
      return wordText(part.slice(part.indexOf(':') + 1)) ?? part.slice(part.indexOf(':') + 1)
    case 'lesen.lautposition': {
      const cut = part.lastIndexOf('-')
      return `${part.slice(cut + 1).toUpperCase()} in ${wordText(part.slice(0, cut)) ?? part.slice(0, cut)}`
    }
    case 'sache.hoeren-bild':
      return sacheLabel(part)
    case 'sache.sortieren':
      return sacheLabel(part.slice(part.indexOf(':') + 1))
    case 'sache.stimmt-das': {
      const [thema, i] = part.split(':')
      return THEMEN.find((t) => t.id === thema)?.aussagen[Number(i)]?.text ?? part
    }
    case 'sache.paare': {
      const [thema, i] = part.split(':')
      return THEMEN.find((t) => t.id === thema)?.paare[Number(i)]?.frage ?? part
    }
    default:
      return wordText(part) ?? part
  }
}

function sacheLabel(id: string): string {
  return BEGRIFFE.find((b) => b.id === id)?.text ?? id
}
