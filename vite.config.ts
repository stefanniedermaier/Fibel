/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
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

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  plugins: [
    vue(),
    versionFile(),
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
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,json}'],
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
  },
})
