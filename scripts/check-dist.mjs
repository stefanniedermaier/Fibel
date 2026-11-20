// Checks the built app (dist/) for the promise "nothing leaves the device":
// - the Content-Security-Policy in index.html stays strict (only own resources),
// - HTML files load nothing from other hosts,
// - the JavaScript does not open connections to other hosts.
// Usage: node scripts/check-dist.mjs [dist]
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const dist = process.argv[2] ?? 'dist'
const errors = []
const fail = (file, msg) => errors.push(`${relative('.', file)}: ${msg}`)

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

const files = walk(dist)
const external = /^(?:https?:)?\/\//i

// 1. CSP: present, own origin only, no unsafe script sources.
const indexPath = join(dist, 'index.html')
const index = readFileSync(indexPath, 'utf8')
const cspMatch = index.match(
  /<meta[^>]*http-equiv=["']?Content-Security-Policy["']?[^>]*content=(?:"([^"]+)"|'([^']+)')/i,
)
if (!cspMatch) {
  fail(indexPath, 'Content-Security-Policy fehlt')
} else {
  const csp = new Map(
    (cspMatch[1] ?? cspMatch[2])
      .split(';')
      .map((d) => d.trim().split(/\s+/))
      .filter((parts) => parts[0])
      .map(([name, ...values]) => [name.toLowerCase(), values]),
  )
  const expect = (name, value) => {
    if (!csp.get(name)?.includes(value)) fail(indexPath, `CSP: ${name} muss ${value} enthalten`)
  }
  expect('default-src', "'self'")
  expect('connect-src', "'self'")
  expect('object-src', "'none'")
  for (const [name, values] of csp) {
    for (const v of values) {
      if (v === '*' || /^(?:https?|wss?):/i.test(v) || v.includes('.'))
        fail(indexPath, `CSP: ${name} erlaubt fremde Quelle ${v}`)
    }
  }
  const script = csp.get('script-src') ?? csp.get('default-src') ?? []
  for (const bad of ["'unsafe-inline'", "'unsafe-eval'"]) {
    if (script.includes(bad)) fail(indexPath, `CSP: script-src darf ${bad} nicht enthalten`)
  }
}

// 2. HTML and manifest: no resources from other hosts.
for (const file of files.filter((f) => /\.(html|webmanifest)$/.test(f))) {
  const text = readFileSync(file, 'utf8')
  for (const [, url] of text.matchAll(/\b(?:src|href)=["']?([^"'\s>]+)/gi)) {
    if (external.test(url)) fail(file, `lädt fremde Ressource ${url}`)
  }
  for (const [, url] of text.matchAll(/"(?:src|start_url|scope)"\s*:\s*"([^"]+)"/g)) {
    if (external.test(url)) fail(file, `Manifest verweist auf ${url}`)
  }
}

// 3. JavaScript: no network calls with a fixed external address.
const networkCall =
  /\b(?:fetch|importScripts|sendBeacon|WebSocket|EventSource|open)\s*\(\s*[`'"]((?:https?:|wss?:)?\/\/[^`'"]+)/g
for (const file of files.filter((f) => f.endsWith('.js'))) {
  const text = readFileSync(file, 'utf8')
  for (const [, url] of text.matchAll(networkCall)) fail(file, `Netzwerkzugriff auf ${url}`)
}

// 4. No source maps in the published app.
for (const file of files.filter((f) => f.endsWith('.map')))
  fail(file, 'Source-Map wird veröffentlicht')

if (errors.length > 0) {
  console.error(`dist-Prüfung: ${errors.length} Problem(e)\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log(`dist-Prüfung: ${files.length} Dateien geprüft, keine externen Zugriffe.`)
