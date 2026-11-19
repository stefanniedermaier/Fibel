/**
 * Deep copy into plain data. Unlike structuredClone it also accepts Vue reactive
 * proxies (which IndexedDB cannot store). Our stored data is JSON-safe by design.
 */
export function plain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
