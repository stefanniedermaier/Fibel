/**
 * Puts together the content for a profile: the state-neutral base plus the
 * adjustments of the profile's state (see PLAN.md, section 4).
 */
import baseCatalog from '@/data/basis/catalog.json'
import gradeDefaults from '@/data/basis/grade-defaults.json'
import laenderList from '@/data/laender/index.json'
import type {
  CatalogEntry,
  Land,
  LandCode,
  LandOverlay,
  Profile,
  ProfileSettings,
  SettingsPatch,
  Topic,
} from './types'

export const DEFAULT_LAND: LandCode = 'DE-BY'

export const LAENDER: readonly Land[] = laenderList
export const BASE_CATALOG: readonly CatalogEntry[] = baseCatalog as CatalogEntry[]
export const BASE_SETTINGS: ProfileSettings = gradeDefaults.base as ProfileSettings
export const BASE_GRADE_DEFAULTS: Record<string, SettingsPatch> = gradeDefaults.grades

const overlayFiles = import.meta.glob<LandOverlay>('../data/laender/*/overlay.json', {
  eager: true,
  import: 'default',
})
export const OVERLAYS: Record<LandCode, LandOverlay> = Object.fromEntries(
  Object.values(overlayFiles).map((o) => [o.land, o]),
)

export function getLand(code: LandCode): Land | undefined {
  return LAENDER.find((l) => l.code === code)
}

/** Applies a state's catalog changes: remove, patch, add (in that order). */
export function applyOverlay(
  base: readonly CatalogEntry[],
  overlay: LandOverlay | undefined,
): CatalogEntry[] {
  const changes = overlay?.catalog
  if (!changes) return base.map((e) => ({ ...e }))
  const ids = new Set(base.map((e) => e.id))
  const label = overlay.land

  for (const id of [...(changes.remove ?? []), ...Object.keys(changes.patch ?? {})]) {
    if (!ids.has(id)) throw new Error(`${label}: unbekannter Katalog-Eintrag "${id}"`)
  }
  const removed = new Set(changes.remove ?? [])
  const result = base
    .filter((e) => !removed.has(e.id))
    .map((e) => {
      const patch = changes.patch?.[e.id]
      if (!patch) return { ...e }
      return { ...e, ...patch, params: { ...e.params, ...patch.params } }
    })
  for (const entry of changes.add ?? []) {
    if (ids.has(entry.id)) throw new Error(`${label}: Eintrag "${entry.id}" existiert schon`)
    result.push({ ...entry })
  }
  return result
}

const catalogCache = new Map<LandCode, CatalogEntry[]>()

export function resolveCatalog(land: LandCode): CatalogEntry[] {
  let catalog = catalogCache.get(land)
  if (!catalog) {
    catalog = applyOverlay(BASE_CATALOG, OVERLAYS[land])
    catalogCache.set(land, catalog)
  }
  return catalog
}

export function catalogFor(land: LandCode, grade: number, topic?: Topic): CatalogEntry[] {
  return resolveCatalog(land).filter((e) => e.grade === grade && (!topic || e.topic === topic))
}

/** Start values for a grade: base → base grade → state grade. */
export function resolveDefaults(land: LandCode, grade: number): ProfileSettings {
  const key = String(grade)
  return structuredClone({
    ...BASE_SETTINGS,
    ...BASE_GRADE_DEFAULTS[key],
    ...OVERLAYS[land]?.gradeDefaults?.[key],
  }) as ProfileSettings
}

/** Fills in settings that were added after the profile was saved. */
export function completeSettings(
  profile: Profile,
  stored: SettingsPatch | undefined,
): ProfileSettings {
  return { ...resolveDefaults(profile.land, profile.grade), ...stored }
}

export interface VisibleGrades {
  own: number
  /** Lower grades, for revision ("Wiederholen"). */
  lower: number[]
  /** Higher grades unlocked by the parents. */
  higher: number[]
}

export function visibleGrades(profile: Profile, settings: ProfileSettings): VisibleGrades {
  const grades = getLand(profile.land)?.grades ?? [1, 2, 3, 4]
  return {
    own: profile.grade,
    lower: grades.filter((g) => g < profile.grade),
    higher: grades.filter((g) => g > profile.grade && settings.unlockedGrades.includes(g)),
  }
}

export function gradeHasContent(land: LandCode, grade: number): boolean {
  return catalogFor(land, grade).length > 0
}
