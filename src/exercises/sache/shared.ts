/**
 * Heimat- und Sachunterricht, grade 1 (plaene/hsu-klasse-1.md, Stufe 1). Everything is
 * done by listening and looking: the child cannot read yet. After a right answer a
 * short fact to remember (Merksatz) is spoken.
 */
import sache from '@/data/basis/klasse-1/sache.json'

export interface Begriff {
  id: string
  /** Nominative with article, e.g. "der Apfel". */
  text: string
  /** Accusative, e.g. "den Apfel" ("Tippe auf den Apfel."). */
  wen: string
  image: string
  merksatz: string
}

export interface SortGruppe {
  id: string
  title: string
  image: string
}

export interface Sortierung {
  id: string
  frage: string
  gruppen: SortGruppe[]
  /** Begriff id → group id. */
  zuordnung: Record<string, string>
  /** Speak the groups after the question ("… im Sommer oder im Herbst?"). */
  optionen?: boolean
  /** Waste bins: only the bins the family has at home are groups (settings). */
  muell?: boolean
}

/** A place in a picture search: a box to tap, drawn with pictures or a built-in form. */
export interface SuchStelle {
  key: string
  /** [x, y, width, height] in the scene's coordinates. */
  box: [number, number, number, number]
  bilder?: { image: string; x: number; y: number; size: number }[]
  /** Drawn by the component: zebra crossing, crossing at the lights, socket. */
  form?: 'zebra' | 'furt' | 'steckdose' | 'teil'
}

export interface Suchbild {
  id: string
  /** Background drawn by the component. */
  hintergrund: 'strasse' | 'kueche' | 'zimmer' | 'auge'
  stellen: SuchStelle[]
  fragen: { frage: string; richtig: string[]; regel: string }[]
}

/** "Stimmt das?": a statement with a picture, thumbs up or down, then the rule. */
export interface Aussage {
  text: string
  image: string
  richtig: boolean
  regel: string
}

export interface Paar {
  frage: string
  ziel: string
  richtig: string
  ablenker: string[]
  /** Whose Merksatz is spoken afterwards (default: the theme's). */
  merke?: 'ziel' | 'richtig'
}

export interface Thema {
  id: string
  /** Grade of the theme (default 1); grade 2 continues HSU 1/2. */
  klasse?: number
  title: string
  icon: string
  term: 1 | 2
  lehrplan: string
  quelle: string
  erkennen: string[]
  sortieren: Sortierung[]
  paare: Paar[]
  aussagen: Aussage[]
  suchbilder: Suchbild[]
  /** Offers "Welcher Turm steht sicherer?" (sache.turm). */
  turm?: boolean
  /** Tasks on the annual circle (sache.jahreskreis). */
  jahreskreis?: ('nach' | 'vor' | 'monat' | 'monat-jahreszeit' | 'fest')[]
  /** Sequences of lesen.reihenfolge for this theme. */
  ablaeufe: string[]
  merke?: 'ziel' | 'richtig'
  /** Something to do together, shown to the parents (not rated by the app). */
  forscherauftrag: string
}

/** Teaching unit of a theme: k1.sache.wiese, k2.sache.stoffe. */
export const unitOf = (t: Pick<Thema, 'id' | 'klasse'>) => `k${t.klasse ?? 1}.sache.${t.id}`

/** Waste bins a family can have; Bavaria differs from place to place. */
export const MUELLTONNEN = [
  { id: 'papier', title: 'Papiertonne (blau)' },
  { id: 'gelb', title: 'Gelbe Tonne oder Gelber Sack' },
  { id: 'bio', title: 'Biotonne (braun)' },
  { id: 'glas', title: 'Glascontainer' },
  { id: 'rest', title: 'Restmüll (schwarz oder grau)' },
] as const

/** Groups of a sorting the child sees; for waste only the bins at home. */
export function visibleGroups(sort: Sortierung, settings: { muelltonnen: string[] }) {
  return sort.muell ? sort.gruppen.filter((g) => settings.muelltonnen.includes(g.id)) : sort.gruppen
}

export const BEGRIFFE: readonly Begriff[] = sache.begriffe
export const THEMEN: readonly Thema[] = sache.themen as Thema[]

export interface SacheParams {
  thema: string
}

export function getThema(id: string): Thema {
  const thema = THEMEN.find((t) => t.id === id)
  if (!thema) throw new Error(`Unbekanntes Thema: ${id}`)
  return thema
}

export function getBegriff(id: string): Begriff {
  const begriff = BEGRIFFE.find((b) => b.id === id)
  if (!begriff) throw new Error(`Unbekannter Begriff: ${id}`)
  return begriff
}

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Data shared by the HSU components: an optional picture and picture answers. */
export interface SacheData {
  /** One picture, or two shown with a plus (Schnee + Mann). */
  prompt?: string | string[]
  correctKey: string
  /** Without a picture the label is shown big (numbers). */
  choices: { key: string; image?: string; label?: string }[]
}
