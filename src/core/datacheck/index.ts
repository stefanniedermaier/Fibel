/**
 * Quality checks for all dictionaries and state adjustments (npm run data:check).
 * Returns a list of readable problems; empty = everything fine.
 */
import { applyOverlay, BASE_CATALOG, LAENDER, OVERLAYS } from '../content'
import { applyWordOverlay, baseSyllables, baseWordEntries } from '../words'
import avatars from '@/data/common/avatars.json'
import reihenBilder from '@/data/common/reihen-bilder.json'
import { checkCatalogStructure } from './catalog'
import { checkEnglisch } from './englisch'
import { checkSache } from './sache'
import { SCRIPT_IDS, checkScripts } from './scripts'
import {
  checkGrade1Extras,
  checkGrade2Texts,
  checkGrade3Texts,
  checkGrade4Sprache,
  checkListening,
  checkSentences,
} from './texts'
import { CONTENT_GRADES, checkGrade2Words, checkLetters, checkSyllables, checkWords } from './words'

export { checkCatalogStructure }

export function checkData(images: ReadonlySet<string>): string[] {
  const problems: string[] = [...checkLetters(images), ...checkScripts(), ...checkEnglisch(images)]

  for (const a of avatars) {
    if (!images.has(a.image)) problems.push(`Avatar „${a.label}“: Bild ${a.image} fehlt`)
  }
  for (const b of reihenBilder) {
    if (!images.has(b.image)) problems.push(`Reihen-Bild „${b.name}“: Bild ${b.image} fehlt`)
  }
  if (new Set(reihenBilder.map((b) => b.image)).size !== reihenBilder.length) {
    problems.push('Reihen-Bilder: ein Bild kommt doppelt vor')
  }

  for (const grade of CONTENT_GRADES) {
    problems.push(...checkSyllables(baseSyllables(grade), grade))
    problems.push(
      ...checkWords(
        applyWordOverlay(baseWordEntries(grade), grade, undefined),
        grade,
        'Basis',
        images,
      ),
    )
  }

  problems.push(...checkCatalogStructure())

  for (const land of LAENDER.filter((l) => l.enabled)) {
    const overlay = OVERLAYS[land.code]
    if (!overlay) {
      problems.push(`${land.name}: aktiv, aber ohne overlay.json`)
      continue
    }
    try {
      applyOverlay(BASE_CATALOG, overlay)
    } catch (e) {
      problems.push(`${land.name}: Katalog – ${(e as Error).message}`)
    }
    for (const [grade, script] of Object.entries(overlay.script ?? {})) {
      if (!SCRIPT_IDS.has(script))
        problems.push(`${land.name}: unbekannte Schrift „${script}“ (Klasse ${grade})`)
    }
    for (const grade of CONTENT_GRADES) {
      try {
        const words = applyWordOverlay(baseWordEntries(grade), grade, overlay)
        problems.push(...checkWords(words, grade, land.name, images))
        problems.push(...checkSentences(grade, words, images))
        if (grade === 1) problems.push(...checkGrade1Extras(words, images), ...checkSache(images))
        if (grade === 2) problems.push(...checkGrade2Words(words, land.name), ...checkGrade2Texts())
        if (grade === 3)
          problems.push(...checkGrade2Words(words, land.name, 3), ...checkGrade3Texts())
        if (grade === 4)
          problems.push(
            ...checkGrade2Words(words, land.name, 4),
            ...checkGrade4Sprache(),
            ...checkGrade3Texts(4),
          )
        problems.push(...checkListening(land.code, grade, images))
      } catch (e) {
        problems.push(`${land.name}: Wortliste – ${(e as Error).message}`)
      }
    }
  }
  // Each problem only once (base words are checked again within every state).
  return [...new Set(problems)]
}
