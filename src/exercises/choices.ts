/** Answer choices shared by the exercises. */
import { shuffle, type Rng } from '@/core/random'

/** A text answer: key and label are the same text. */
export const textChoice = (text: string | number) => ({ key: String(text), label: String(text) })

/** Text answers in random order, each one once. */
export const textChoices = (labels: readonly (string | number)[], rng: Rng) =>
  shuffle([...new Set(labels.map(String))], rng).map(textChoice)
