// Checks the licences of everything shipped to the device (runtime dependencies,
// including their dependencies) against an allowlist. Copyleft licences would
// conflict with the MIT licence of the app; unknown licences need a look first.
// Usage: node scripts/check-licenses.mjs
import { execFileSync } from 'node:child_process'

const ALLOWED = new Set([
  'MIT',
  'ISC',
  '0BSD',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'Apache-2.0',
  'CC0-1.0',
  'BlueOak-1.0.0',
  // Fonts (Andika)
  'OFL-1.1',
  // Weak, file-based copyleft: fine as long as the files themselves are not changed
  // (lightningcss, a build tool that vue-router pulls in).
  'MPL-2.0',
])

/** SPDX expressions like "(MIT OR Apache-2.0)": one allowed alternative is enough. */
function allowed(license) {
  const alternatives = license.replace(/[()]/g, '').split(/\s+OR\s+/)
  return alternatives.some((alt) => alt.split(/\s+AND\s+/).every((l) => ALLOWED.has(l.trim())))
}

// All non-dev packages of the lock tree (npm query skips extraneous leftovers).
const packages = JSON.parse(
  execFileSync('npm', ['query', '.prod'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }),
)

const problems = []
for (const pkg of packages) {
  const raw = pkg.license ?? pkg.licenses?.map((l) => l.type ?? l).join(' OR ')
  const license = typeof raw === 'object' ? raw?.type : raw
  if (!license) problems.push(`${pkg.name}@${pkg.version}: keine Lizenzangabe`)
  else if (!allowed(license)) problems.push(`${pkg.name}@${pkg.version}: ${license}`)
}

if (problems.length > 0) {
  console.error('Lizenzprüfung fehlgeschlagen:\n' + problems.map((p) => `  - ${p}`).join('\n'))
  process.exit(1)
}
console.log(`Lizenzprüfung: ${packages.length} Laufzeit-Pakete, alle Lizenzen erlaubt.`)
