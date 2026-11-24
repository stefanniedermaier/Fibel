/// <reference types="vitest/config" />
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves the app under /<repo-name>/. The deploy workflow sets BASE_PATH.
const base = process.env.BASE_PATH ?? '/'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string
}
const buildTime = new Date().toISOString()

/**
 * Writes version.json next to the app. The parent area reads it (from the same
 * server) to show whether a newer version is published. Not precached on purpose.
 */
function versionFile(): Plugin {
  return {
    name: 'fibel-version-file',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version: pkg.version, builtAt: buildTime }),
      })
    },
  }
}

/** Packages the device gets that the bundle graph does not show: font, pictures, service worker. */
const SHIPPED_EXTRAS = [
  '@fontsource/andika',
  'openmoji',
  'workbox-core',
  'workbox-precaching',
  'workbox-routing',
  'workbox-strategies',
]

/**
 * Writes THIRD-PARTY-LICENSES.txt: the licence texts of everything the app ships
 * (the MIT, ISC and OFL licences require them to travel with the copies). The packages
 * are taken from the bundle itself, so the list is always complete. Shown on "Über Fibel".
 */
function thirdPartyLicenses(): Plugin {
  return {
    name: 'fibel-third-party-licenses',
    apply: 'build',
    generateBundle(_options, bundle) {
      const names = new Set(SHIPPED_EXTRAS)
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue
        for (const id of output.moduleIds) {
          const match = /node_modules\/((?:@[^/]+\/)?[^/]+)\//.exec(id.replaceAll('\\', '/'))
          if (match?.[1]) names.add(match[1])
        }
      }
      const sections = [...names].sort().map((name) => {
        const dir = fileURLToPath(new URL(`./node_modules/${name}/`, import.meta.url))
        const meta = JSON.parse(readFileSync(`${dir}package.json`, 'utf8')) as {
          version: string
          license?: string
        }
        const file = readdirSync(dir).find((f) => /^(licen[cs]e|copying)(\.(md|txt))?$/i.test(f))
        if (!file) this.error(`Lizenztext fehlt: ${name}`)
        const text = readFileSync(dir + file, 'utf8').trim()
        return `${'='.repeat(40)}\n${name} ${meta.version} (${meta.license ?? '?'})\n${'='.repeat(40)}\n\n${text}\n`
      })
      this.emitFile({
        type: 'asset',
        fileName: 'THIRD-PARTY-LICENSES.txt',
        source:
          `Fibel ${pkg.version} – Lizenzen der verwendeten Werke (${names.size} Pakete)\n\n` +
          sections.join('\n'),
      })
    },
  }
}

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  plugins: [
    vue(),
    versionFile(),
    thirdPartyLicenses(),
    VitePWA({
      // Updates are applied only after confirmation (later: in the parent area),
      // so a running exercise is never interrupted.
      registerType: 'prompt',
      injectRegister: false,
      pwaAssets: {
        image: 'public/logo.svg',
        preset: 'minimal-2023',
        overrideManifestIcons: true,
      },
      manifest: {
        name: 'Fibel',
        short_name: 'Fibel',
        description: 'Lesen, Schreiben und Rechnen üben – offline und ohne Konto.',
        lang: 'de',
        display: 'standalone',
        orientation: 'any',
        start_url: '.',
        scope: '.',
        background_color: '#fff8ee',
        theme_color: '#ffb703',
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,json,txt}'],
        // Always fetched fresh from the server (newest version), never from the cache.
        globIgnores: ['**/node_modules/**/*', 'version.json'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/*.d.ts', 'src/main.ts'],
      reporter: ['text-summary', 'html', 'lcov'],
      // Ratchet: just below the current values. Raise them as tests are added –
      // never lower them to get a change through.
      thresholds: { statements: 47, branches: 32, functions: 46, lines: 48 },
    },
    alias: {
      'virtual:pwa-register': fileURLToPath(
        new URL('./tests/stubs/pwa-register.ts', import.meta.url),
      ),
    },
  },
})
