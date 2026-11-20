/** Stand-in for vite-plugin-pwa's virtual module in unit tests (no service worker there). */
export function registerSW(): (reload?: boolean) => Promise<void> {
  return async () => {}
}
