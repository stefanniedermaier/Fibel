/**
 * Answers typed on the device's own keyboard (NumberInput, TippenTask): a transparent
 * <input> lies over the big display. It gets the focus when the task starts and for each
 * new task, and loses it when the task is done, so the keyboard closes and the praise
 * and the solution are visible.
 */
import { nextTick, onMounted, ref, watch, type Ref, type WatchSource } from 'vue'

export function useNativeKeyboard(
  field: Ref<HTMLInputElement | undefined>,
  disabled: () => boolean,
  newTask: WatchSource,
) {
  const focused = ref(false)

  function focus() {
    if (!disabled()) field.value?.focus({ preventScroll: true })
  }

  onMounted(focus)
  watch(newTask, () => void nextTick(focus))
  watch(disabled, (off) => {
    if (off) field.value?.blur()
  })

  return { focused, focus }
}
