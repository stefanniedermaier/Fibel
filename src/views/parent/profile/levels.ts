/** Settings helpers shared by the sections of the profile form. */
import { computed, type Ref } from 'vue'
import type { ProfileSettings } from '@/core/types'

/** A level set by hand (0 = automatic), stored in settings.levels[key]. */
export function levelSetting(settings: Ref<ProfileSettings>, key: string) {
  return computed({
    get: () => settings.value.levels[key] ?? 0,
    set: (level: number) => {
      const levels = { ...settings.value.levels }
      if (level === 0) delete levels[key]
      else levels[key] = level
      settings.value.levels = levels
    },
  })
}
