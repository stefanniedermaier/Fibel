/** Stroke templates of the scripts. */
import { glyphProblems, lettersNeeded, SCRIPTS } from '../strokes'
import { LETTERS } from '../words'

/** Known handwriting templates (folders under src/data/schriften). */
export const SCRIPT_IDS = new Set(Object.keys(SCRIPTS))

/** Every template must cover all letters (capital and small) and be well-formed. */
export function checkScripts(): string[] {
  const problems: string[] = []
  const needed = lettersNeeded(LETTERS.map((l) => l.id))
  for (const script of Object.values(SCRIPTS)) {
    for (const ch of needed) {
      if (!script.glyphs[ch]) problems.push(`${script.name}: Vorlage für „${ch}“ fehlt`)
    }
    for (const [ch, glyph] of Object.entries(script.glyphs)) {
      for (const p of glyphProblems(glyph, 0.6, script.neigung))
        problems.push(`${script.name} „${ch}“: ${p}`)
    }
  }
  return problems
}
