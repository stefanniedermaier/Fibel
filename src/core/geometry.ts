/** Small geometry helpers shared by the drawing exercises and the stroke templates. */
export const rad = (deg: number) => (deg * Math.PI) / 180

/** Corners of a regular polygon in a 100 × 100 box (rounded), starting at `start` degrees. */
export function regularPolygon(n: number, r = 42, start = -90): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const a = rad(start + (i * 360) / n)
    return [Math.round(50 + r * Math.cos(a)), Math.round(50 + r * Math.sin(a))]
  })
}
