import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

/** Collects console errors and failed requests (CSP violations show up as errors). */
export function watchErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('requestfailed', (r) => errors.push(`${r.url()}: ${r.failure()?.errorText}`))
  return errors
}

/** Fails on accessibility violations (WCAG 2.1 A/AA) that axe can detect. */
export async function expectAccessible(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const summary = result.violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.help} – ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  )
  expect(summary, 'axe-Verstöße').toEqual([])
}

/** Passes the parent gate: hold the button, then solve the multiplication. */
export async function passParentGate(page: Page) {
  const hold = page.getByRole('button', { name: 'Gedrückt halten' })
  await hold.hover()
  await page.mouse.down()
  const question = page.getByRole('heading', { name: /Wie viel ist/ })
  await expect(question).toBeVisible({ timeout: 5000 })
  await page.mouse.up()
  const [, a, b] = (await question.textContent())!.match(/(\d+)\s*×\s*(\d+)/)!
  // Typed on the device's number keyboard (an input field), confirmed with ✓.
  await page.getByLabel('Ergebnis').fill(String(Number(a) * Number(b)))
  await page.getByRole('button', { name: 'Fertig' }).click()
}

/** Sets the app up with one profile (first start) and ends on the home screen. */
export async function createProfile(page: Page, name = 'Testkind') {
  await page.goto('./')
  await page.getByRole('link', { name: 'App einrichten' }).click()
  await passParentGate(page)
  await page.getByRole('textbox').first().fill(name)
  await page.getByRole('button', { name: 'Speichern' }).click()
  // Saving ends in the parent area; only then go to the child's home screen.
  await page.waitForURL(/#\/eltern$/)
  await page.goto('./#/')
  await expect(page.getByText(name)).toBeVisible()
}

/**
 * Opens a subject from the home page. Subjects with categories show a page with
 * "Alles gemischt" first; `check` runs the accessibility check there.
 */
export async function openTopic(page: Page, topic: string, check = false) {
  await page.getByRole('link', { name: new RegExp(topic) }).click()
  const mixed = page.getByRole('link', { name: /Alles gemischt/ })
  const reading = page.getByRole('button', { name: 'Nochmal vorlesen' })
  await expect(mixed.or(reading)).toBeVisible()
  if (await mixed.isVisible()) {
    if (check) await expectAccessible(page)
    await mixed.click()
  }
}
