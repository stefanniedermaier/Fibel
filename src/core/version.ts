/**
 * App version: the installed one is built in, the newest one is read from
 * version.json on the same server (no external request; works only online).
 */
export const APP_VERSION: string = __APP_VERSION__
export const BUILD_TIME: string = __BUILD_TIME__

export interface VersionInfo {
  version: string
  builtAt: string
}

/** The newest published version, or null if offline/unavailable. */
export async function fetchLatestVersion(): Promise<VersionInfo | null> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}version.json`, { cache: 'no-store' })
    if (!response.ok) return null
    const data = (await response.json()) as Partial<VersionInfo>
    return typeof data.version === 'string'
      ? { version: data.version, builtAt: String(data.builtAt ?? '') }
      : null
  } catch {
    return null
  }
}

/** Semantic version comparison: is `a` newer than `b`? ("1.10.0" > "1.9.2") */
export function isNewer(a: string, b: string): boolean {
  const pa = a.split(/[.-]/).map((n) => parseInt(n, 10) || 0)
  const pb = b.split(/[.-]/).map((n) => parseInt(n, 10) || 0)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff > 0
  }
  return false
}
