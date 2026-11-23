import { expect, test } from '@playwright/test'
import { createProfile, expectAccessible, passParentGate, watchErrors } from './helpers'

test('Erster Start: Willkommen, ohne Fehler und barrierearm', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'Willkommen bei Fibel!' })).toBeVisible()
  await expectAccessible(page)
  expect(errors).toEqual([])
})

test('Nichts verlässt das Gerät: nur Anfragen an den eigenen Server', async ({ page, baseURL }) => {
  const foreign: string[] = []
  page.on('request', (r) => {
    const url = r.url()
    if (!url.startsWith(baseURL!) && !url.startsWith('data:')) foreign.push(url)
  })
  await createProfile(page)
  await page.getByRole('link', { name: /Rechnen/ }).click()
  await expect(page.getByRole('button', { name: 'Nochmal vorlesen' })).toBeVisible()
  expect(foreign).toEqual([])
})

test('Profil anlegen und eine Einheit starten', async ({ page }) => {
  const errors = watchErrors(page)
  await createProfile(page)
  await expectAccessible(page)
  for (const topic of ['Lesen', 'Schreiben', 'Rechnen']) {
    await page.goto('./#/')
    await page.getByRole('link', { name: new RegExp(topic) }).click()
    await expect(page.getByRole('button', { name: 'Nochmal vorlesen' })).toBeVisible()
    await expect(page.getByLabel('Aufhören')).toBeVisible()
    await expectAccessible(page)
  }
  expect(errors).toEqual([])
})

test('Gerätetest und Elternbereich sind erreichbar', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('./#/geraetetest')
  await expect(page.locator('main')).toBeVisible()
  await expectAccessible(page)
  expect(errors).toEqual([])
})

test('PWA: Manifest und Service Worker sind vorhanden', async ({ page, request }) => {
  await page.goto('./')
  const href = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(href).toBeTruthy()
  const manifest = await (await request.get(href!)).json()
  expect(manifest.name).toBe('Fibel')
  expect(manifest.display).toBe('standalone')
  expect((await request.get('sw.js')).ok()).toBe(true)
})

test('Datenschutz-Seite ist vom Start aus erreichbar und barrierearm', async ({ page }) => {
  const errors = watchErrors(page)
  await page.goto('./')
  await page.getByRole('link', { name: 'Datenschutz' }).click()
  await expect(page.getByRole('heading', { name: 'Datenschutz', level: 1 })).toBeVisible()
  await expectAccessible(page)
  await page.getByRole('link', { name: 'Zurück' }).click()
  await expect(page.getByRole('heading', { name: 'Willkommen bei Fibel!' })).toBeVisible()
  expect(errors).toEqual([])
})

test('Elternbereich: Statistik zeigt den Zeitraum', async ({ page }) => {
  const errors = watchErrors(page)
  await createProfile(page)
  await page.getByRole('link', { name: 'Für Eltern' }).click()
  await passParentGate(page)
  await page
    .getByRole('link', { name: /Statistik/ })
    .first()
    .click()
  await expect(page.getByText('Letzte 14 Tage')).toBeVisible()
  await expectAccessible(page)
  expect(errors).toEqual([])
})
