#!/usr/bin/env node
/**
 * Copies exactly the OpenMoji SVGs the app uses into public/img/openmoji/.
 * Collects every "image" value from the JSON files under src/data/.
 * Usage: npm run data:openmoji
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = join(root, 'src', 'data')
const sourceDir = join(root, 'node_modules', 'openmoji', 'color', 'svg')
const targetDir = join(root, 'public', 'img', 'openmoji')

function jsonFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return jsonFiles(path)
    return entry.name.endsWith('.json') ? [path] : []
  })
}

function collectImages(value, found) {
  if (Array.isArray(value)) value.forEach((v) => collectImages(v, found))
  else if (value && typeof value === 'object') {
    for (const [key, v] of Object.entries(value)) {
      if (key === 'image' && typeof v === 'string') found.add(v)
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
  const source = join(sourceDir, `${code}.svg`)
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
