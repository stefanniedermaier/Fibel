#!/usr/bin/env node
/**
 * Copies exactly the OpenMoji SVGs the app uses into public/img/openmoji/.
 * Collects every "image" value (and the codes in "scene" and "images" lists) from the
 * JSON files under src/data/.
 * Codes starting with "fibel-" are our own drawings in src/data/bilder/ (MIT, in the
 * style of OpenMoji), e.g. "fibel-ampel-rot" → src/data/bilder/ampel-rot.svg.
 * Usage: npm run data:openmoji
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = join(root, 'src', 'data')
const sourceDir = join(root, 'node_modules', 'openmoji', 'color', 'svg')
const targetDir = join(root, 'public', 'img', 'openmoji')
const ownDir = join(root, 'src', 'data', 'bilder')
const OWN = 'fibel-'

function jsonFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return jsonFiles(path)
    return entry.name.endsWith('.json') ? [path] : []
  })
}

/** Keys whose value is a list of OpenMoji codes (e.g. the picture of a sentence). */
const IMAGE_LISTS = new Set(['scene', 'images'])

function collectImages(value, found) {
  if (Array.isArray(value)) value.forEach((v) => collectImages(v, found))
  else if (value && typeof value === 'object') {
    for (const [key, v] of Object.entries(value)) {
      if (key === 'image' && typeof v === 'string') found.add(v)
      else if (IMAGE_LISTS.has(key) && Array.isArray(v) && v.every((c) => typeof c === 'string'))
        v.forEach((c) => found.add(c))
      else collectImages(v, found)
    }
  }
  return found
}

if (!existsSync(sourceDir)) {
  console.error('OpenMoji fehlt – bitte zuerst "npm install" ausführen.')
  process.exit(1)
}

const codes = new Set()
for (const file of jsonFiles(dataDir)) collectImages(JSON.parse(readFileSync(file, 'utf8')), codes)

mkdirSync(targetDir, { recursive: true })
const missing = []
for (const code of codes) {
  const source = code.startsWith(OWN)
    ? join(ownDir, `${code.slice(OWN.length)}.svg`)
    : join(sourceDir, `${code}.svg`)
  if (existsSync(source)) copyFileSync(source, join(targetDir, `${code}.svg`))
  else missing.push(code)
}

// Remove images that are no longer used.
let removed = 0
for (const file of readdirSync(targetDir)) {
  if (file.endsWith('.svg') && !codes.has(file.slice(0, -4))) {
    rmSync(join(targetDir, file))
    removed++
  }
}

console.log(
  `OpenMoji: ${codes.size - missing.length} Bilder nach ${relative(root, targetDir)} kopiert, ${removed} entfernt.`,
)
if (missing.length > 0) {
  console.error(`Nicht in OpenMoji gefunden: ${missing.join(', ')}`)
  process.exit(1)
}
