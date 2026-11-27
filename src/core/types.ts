export type Topic = 'lesen' | 'schreiben' | 'rechnen' | 'uhr'
export const TOPICS: readonly Topic[] = ['lesen', 'schreiben', 'rechnen', 'uhr']

export const TOPIC_INFO: Record<Topic, { label: string; icon: string }> = {
  lesen: { label: 'Lesen', icon: '📖' },
  schreiben: { label: 'Schreiben', icon: '✏️' },
  rechnen: { label: 'Rechnen', icon: '🔢' },
  uhr: { label: 'Uhr', icon: '🕒' },
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
  /** How exactly the finger must follow when tracing (0.7 strict, 1 normal, 1.4 easy). */
  traceTolerance: number
  /** Experiment: write words freely in boxes, with letter recognition (default off). */
  kaestchen: boolean
  /**
   * Stars, crowns and statistics cover this many days (14 or 30). Older units are
   * deleted from the device; the learning progress per item stays.
   */
  rewardDays: number
  /** How strict the recognition is (0.8 strict, 1 normal, 1.25 easy). */
  recognitionTolerance: number
  voiceURI: string | null
  speechRate: number
  /** Levels set by hand, per catalog entry id. */
  levels: Record<string, number>
  /**
   * Teaching units switched on or off by the parents (unit id → on). Units without an
   * entry follow their default: 1st half-year on, 2nd half-year off.
   */
  units: Record<string, boolean>
  /** Blitzlesen: how long the word stays visible (ms). */
  flashMs: number
  /** Lernwörter of the week, typed in by the parents (stay on the device). */
  lernwoerter: string[]
  /**
   * Focus per subject set by the parents: a teaching unit that gets about half of the
   * tasks in "Alles gemischt" until `until` (ms) – e.g. what school does this week.
   */
  focus: Partial<Record<Topic, { unit: string; until: number }>>
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
  /** Category inside the subject, e.g. 'lesen.hoeren' (the child picks it). */
  category: string
  /** Teaching unit, e.g. 'k1.lesen.laute' (the parents switch it on). */
  unit: string
  /** Share in mixed units (default 1). */
  weight?: number
}

/** A category inside a subject, shown as a tile (e.g. "Hören" in Lesen). */
export interface ExerciseCategory {
  id: string
  topic: Topic
  title: string
  /** Emoji shown on the tile. */
  icon: string
}

/** A teaching unit that the parents switch on when school gets there. */
export interface TeachingUnit {
  id: string
  grade: number
  topic: Topic
  title: string
  /** Half-year in which schools usually teach it: 1 = on by default, 2 = off. */
  term: 1 | 2
}

export interface LandOverlay {
  land: LandCode
  gradeDefaults?: Record<string, SettingsPatch>
  catalog?: {
    add?: CatalogEntry[]
    remove?: string[]
    patch?: Record<string, Partial<Omit<CatalogEntry, 'id'>>>
  }
  /** Word list changes per grade (key = grade). */
  words?: Record<
    string,
    {
      /** Path of an extra word list, relative to the state folder. */
      add?: string
      remove?: string[]
      /** Word ids that belong to the state's official basic vocabulary. */
      grundwortschatz?: string[]
    }
  >
  /** Handwriting used for tracing, per grade (e.g. 'druckschrift'). */
  script?: Record<string, string>
  /** Where the adjustments come from (curriculum reference). */
  source?: string
}

// --- Dictionaries ------------------------------------------------------------

/** A word as stored in the JSON dictionaries. */
/** Word type – decides capitalisation (nouns and names capitalised). */
export type Wortart = 'nomen' | 'verb' | 'adjektiv' | 'klein' | 'name'
export const WORTARTEN: readonly Wortart[] = ['nomen', 'verb', 'adjektiv', 'klein', 'name']

export interface WordEntry {
  id: string
  /** Written form; nouns and names capitalised. */
  text: string
  /** Spoken syllables; joined they must give `text`. */
  syllables: string[]
  wortart: Wortart
  /**
   * OpenMoji code point(s), e.g. '1F339'. Optional: picture exercises only use words
   * with a picture; the others read the word aloud instead.
   */
  image?: string
  category: string
  /** Ids of similar-looking words, used as targeted distractors. */
  similar?: string[]
  /** Rhyme group, e.g. 'ose' for Rose/Dose/Hose (set by hand). */
  reim?: string
  /** Spoken initial sound, if it differs from the derived one (Vase → 'w'). */
  anlaut?: string
  /** Different text for the speech output if the TTS mispronounces the word. */
  say?: string
  /**
   * Merkwort: a frequent word of the official basic vocabulary that is not lauttreu
   * (und, der, die …). Learnt as a whole, never written by ear (plaene, Q2).
   */
  merkwort?: boolean
  /** Short example spoken together with the word, e.g. "der Hase" for "der". */
  beispiel?: string
}

/** A word with derived data, as the exercises use it. */
export interface Word extends WordEntry {
  graphemes: string[]
  level: 1 | 2 | 3 | 4
  grundwortschatz: boolean
  /** 'basis' or the state code the word comes from. */
  source: string
}

export interface Syllable {
  text: string
  say?: string
}

export interface Letter {
  id: string
  upper: string
  type: 'vokal' | 'konsonant' | 'umlaut' | 'mehrgraph'
  example: string
  image: string
  /** Where the sound is in the example word. */
  position: 'anlaut' | 'inlaut' | 'auslaut'
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
  /** Chosen category; missing = everything mixed. */
  category?: string
  startedAt: number
  durationMs: number
  total: number
  tasks: TaskResult[]
  stars: number
  crown: boolean
  completed: boolean
}
