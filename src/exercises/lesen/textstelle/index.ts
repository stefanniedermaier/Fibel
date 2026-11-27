/**
 * L3-4 "Am Text belegen: Wo steht das?" (Deutsch 3/4, 2.3: "belegen Aussagen am Text"):
 * the text is shown sentence by sentence; the child taps the sentence with the answer.
 */
import { splitSentences } from '@/core/saetze'
import type { ExerciseModule } from '../../types'
import { textsFor } from '../text-fragen'
import TextstelleTask from './TextstelleTask.vue'

export interface TextstelleData {
  sentences: string[]
  question: string
  correct: number
}

/** Sentences of a text; a closing quotation mark stays with its sentence. */
export function textSentences(text: string): string[] {
  const out: string[] = []
  for (const s of splitSentences(text)) {
    const m = /^([“"])\s*(.*)$/.exec(s)
    if (m && out.length > 0) {
      out[out.length - 1] = `${out.at(-1)}${m[1]}`
      if (m[2]) out.push(m[2])
    } else out.push(s)
  }
  return out
}

export const textstelle: ExerciseModule<Record<string, never>, TextstelleData> = {
  id: 'lesen.textstelle',
  topic: 'lesen',

  items(ctx) {
    return textsFor(ctx.grade).flatMap((t) =>
      t.fragen.flatMap((f, i) => (f.beleg !== undefined ? [`lesen.textstelle:${t.id}:${i}`] : [])),
    )
  },

  generate(ctx, _params, itemKey) {
    const [, id, q] = itemKey.split(':') as [string, string, string]
    const text = textsFor(ctx.grade).find((t) => t.id === id)!
    const frage = text.fragen[Number(q)]!
    const raw = splitSentences(text.text)
    const sentences = textSentences(text.text)
    // The reference counts the raw sentences; map it onto the tidied ones.
    const target = raw[frage.beleg!]!.replace(/^[“"]\s*/, '')
    const correct = sentences.findIndex((s) => s.includes(target.slice(0, 20)))
    return {
      instruction: `Lies den Text. ${frage.frage} Tippe auf den Satz, in dem die Antwort steht.`,
      caption: `${frage.frage} Tippe auf den Satz mit der Antwort.`,
      hint: 'Such im Text nach einem Wort aus der Frage.',
      solution: `Die Antwort steht hier: ${sentences[correct]}`,
      data: { sentences, question: frage.frage, correct },
    }
  },

  component: TextstelleTask,
}
