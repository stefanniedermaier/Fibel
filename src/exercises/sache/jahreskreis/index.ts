/**
 * S8 "Jahreskreis" (HSU 1/2, 4.1): the year as a circle, January at the top, the
 * seasons inside. The child taps a season ("Was kommt nach dem Sommer?") or a month
 * ("In welchem Monat ist Weihnachten?").
 */
import { capitalize } from '@/core/text'
import type { ExerciseModule } from '../../types'
import { MONATE } from '../../uhr/kalender'
import JahreskreisTask from './JahreskreisTask.vue'

export const JAHRESZEITEN = [
  { id: 'fruehling', title: 'der Frühling', image: '1F338', months: [2, 3, 4] },
  { id: 'sommer', title: 'der Sommer', image: '2600', months: [5, 6, 7] },
  { id: 'herbst', title: 'der Herbst', image: '1F342', months: [8, 9, 10] },
  { id: 'winter', title: 'der Winter', image: '2744', months: [11, 0, 1] },
] as const

/** Festivals with a fixed date (plaene/hsu-klasse-1.md, section 4). */
export const FESTE = [
  { id: 'weihnachten', frage: 'In welchem Monat ist Weihnachten?', month: 11 },
  { id: 'nikolaus', frage: 'In welchem Monat ist der Nikolaustag?', month: 11 },
  { id: 'silvester', frage: 'In welchem Monat ist Silvester?', month: 11 },
  { id: 'martin', frage: 'In welchem Monat ist Sankt Martin?', month: 10 },
] as const

export type JahreskreisMode = 'nach' | 'vor' | 'monat' | 'monat-jahreszeit' | 'fest'

export interface JahreskreisParams {
  modes: JahreskreisMode[]
}

export interface JahreskreisData {
  /** Which ring answers: the seasons inside or the months outside. */
  ring: 'jahreszeit' | 'monat'
  correctKey: string
}

const season = (id: string) => JAHRESZEITEN.find((s) => s.id === id)!
const seasonOf = (month: number) => JAHRESZEITEN.find((s) => s.months.includes(month as never))!

export const jahreskreis: ExerciseModule<JahreskreisParams, JahreskreisData> = {
  id: 'sache.jahreskreis',
  topic: 'sache',

  items(_ctx, params) {
    return params.modes.flatMap((mode) => {
      const ids: readonly string[] =
        mode === 'nach' || mode === 'vor'
          ? JAHRESZEITEN.map((s) => s.id)
          : mode === 'fest'
            ? FESTE.map((f) => f.id)
            : MONATE.map((_, i) => String(i))
      return ids.map((id) => `sache.jahreskreis:${mode}:${id}`)
    })
  },

  generate(_ctx, _params, itemKey) {
    const [, mode, id] = itemKey.split(':') as [string, JahreskreisMode, string]
    if (mode === 'nach' || mode === 'vor') {
      const i = JAHRESZEITEN.findIndex((s) => s.id === id)
      const answer = JAHRESZEITEN[(i + (mode === 'nach' ? 1 : 3)) % 4]!
      const name = season(id).title.replace(/^der /, 'dem ')
      const sentence =
        mode === 'nach' ? `Nach ${name} kommt ${answer.title}.` : `Vor ${name} ist ${answer.title}.`
      return {
        instruction: `Welche Jahreszeit kommt ${mode} ${name}? Tippe innen auf die Jahreszeit.`,
        caption: `Welche Jahreszeit kommt ${mode} ${name}?`,
        hint: 'Das Jahr geht im Kreis, so wie die Uhr.',
        solution: sentence,
        afterword: sentence,
        data: { ring: 'jahreszeit', correctKey: answer.id },
      }
    }
    if (mode === 'monat-jahreszeit') {
      const m = Number(id)
      const s = seasonOf(m)
      const sentence = `Der ${MONATE[m]} gehört zum ${s.title.replace(/^der /, '')}.`
      return {
        instruction: `In welcher Jahreszeit ist der ${MONATE[m]}? Tippe innen auf die Jahreszeit.`,
        caption: `In welcher Jahreszeit ist der ${MONATE[m]}?`,
        solution: sentence,
        afterword: sentence,
        data: { ring: 'jahreszeit', correctKey: s.id },
      }
    }
    if (mode === 'fest') {
      const f = FESTE.find((x) => x.id === id)
      if (!f) throw new Error(`Unbekanntes Fest: ${itemKey}`)
      const sentence = `${capitalize(f.frage.replace(/^In welchem Monat ist (.*)\?$/, '$1'))} ist im ${MONATE[f.month]}.`
      return {
        instruction: `${f.frage} Tippe außen auf den Monat.`,
        caption: f.frage,
        hint: `Es ist im ${seasonOf(f.month).title.replace(/^der /, '')}.`,
        solution: sentence,
        afterword: sentence,
        data: { ring: 'monat', correctKey: String(f.month) },
      }
    }
    const m = Number(id)
    return {
      instruction: `Tippe außen auf den Monat ${MONATE[m]}.`,
      caption: `Wo ist der ${MONATE[m]}?`,
      hint: 'Oben fängt das Jahr mit dem Januar an. Zähl im Kreis weiter.',
      solution: `Der ${MONATE[m]} ist der ${m + 1}. Monat im Jahr.`,
      data: { ring: 'monat', correctKey: String(m) },
    }
  },

  component: JahreskreisTask,
}
