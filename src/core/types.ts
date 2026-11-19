export type Topic = 'lesen' | 'schreiben' | 'rechnen'
export const TOPICS: readonly Topic[] = ['lesen', 'schreiben', 'rechnen']

export const TOPIC_INFO: Record<Topic, { label: string; icon: string }> = {
  lesen: { label: 'Lesen', icon: '📖' },
  schreiben: { label: 'Schreiben', icon: '✏️' },
  rechnen: { label: 'Rechnen', icon: '🔢' },
}

/** ISO 3166-2 code of a German state, e.g. 'DE-BY'. */
export type LandCode = string

export interface Land {
  code: LandCode
  name: string
  /** Only enabled states can be chosen (version 1: Bavaria only). */
  enabled: boolean
  /** Valid grades; Berlin and Brandenburg have six primary school years. */
  grades: number[]
}

export interface Profile {
  id: string
  name: string
  /** Unicode code point(s) of the avatar, e.g. '1F98A' (fox). */
  avatar: string
  land: LandCode
  grade: number
  createdAt: number
}

export interface ProfileSettings {
  /** Higher grades the parents unlocked in addition to the own one. */
  unlockedGrades: number[]
  letterFilter: boolean
  /** Unlocked graphemes, lower case (phase 3). */
  letters: string[]
  syllableColoring: boolean
  syllableArcs: boolean
  strictCase: boolean
  numberRange: number
  allowMinus: boolean
  tenCrossing: boolean
  tasksPerUnit: number
  /** Share of stars needed for the crown (0 = always). */
  crownRatio: number
  sound: boolean
  voiceURI: string | null
  speechRate: number
  /** Levels set by hand, per catalog entry id. */
  levels: Record<string, number>
}

export type SettingsPatch = Partial<ProfileSettings>

export interface CatalogEntry {
  id: string
  grade: number
  topic: Topic
  /** Module id, e.g. 'rechnen.mengen'. */
  exercise: string
  params: Record<string, unknown>
  title: string
}

export interface LandOverlay {
  land: LandCode
  gradeDefaults?: Record<string, SettingsPatch>
  catalog?: {
    add?: CatalogEntry[]
    remove?: string[]
    patch?: Record<string, Partial<Omit<CatalogEntry, 'id'>>>
  }
}

export interface ProgressRecord {
  profileId: string
  /** Grade-independent item key, e.g. 'rechnen.mengen:7'. */
  itemKey: string
  /** Leitner box 1–5 (0 = never seen). */
  box: number
  correct: number
  wrong: number
  lastSeen: number
}

export interface TaskResult {
  entryId: string
  itemKey: string
  wrongAttempts: number
  revealed: boolean
  star: boolean
}

export interface SessionRecord {
  id: string
  profileId: string
  land: LandCode
  grade: number
  topic: Topic
  startedAt: number
  durationMs: number
  total: number
  tasks: TaskResult[]
  stars: number
  crown: boolean
  completed: boolean
}
