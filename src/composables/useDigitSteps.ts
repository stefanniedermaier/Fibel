/**
 * Written calculations digit by digit (SchriftlichTask, ZiffernTask): the child taps the
 * digit of the current step. A wrong digit shakes, and its explanation is shown and
 * spoken; after the last step the answer counts as right.
 */
import { computed, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'

export interface DigitStep {
  digit: number
  explanation: string
}

export function useDigitSteps(
  steps: () => readonly DigitStep[],
  state: () => { revealed: boolean; locked: boolean },
  answer: (correct: boolean) => void,
) {
  const store = useAppStore()
  const solved = ref(0)
  const explanation = ref('')
  const shaking = ref(false)
  watch(steps, () => {
    solved.value = 0
    explanation.value = ''
  })
  /** Steps shown as done: all of them once the solution is revealed. */
  const done = computed(() => (state().revealed ? steps().length : solved.value))

  function tap(d: number) {
    const all = steps()
    if (state().locked || state().revealed || solved.value >= all.length) return
    const step = all[solved.value]!
    if (d === step.digit) {
      solved.value++
      explanation.value = ''
      if (solved.value === all.length) answer(true)
    } else {
      explanation.value = step.explanation
      void store.say(step.explanation)
      shaking.value = true
      setTimeout(() => (shaking.value = false), 450)
      answer(false)
    }
  }

  return { solved, done, explanation, shaking, tap }
}
