// Generates the connected handwriting templates (src/data/schriften/…/strokes.json):
// Vereinfachte Ausgangsschrift (VA) and Schulausgangsschrift (SAS).
//
// Usage: node scripts/schreibschrift.mjs   (then: npm run format, npm test)
//
// Change the letters HERE, not in the JSON files – the JSON is generated. Each small
// letter is a "body" (lines and arcs in the four-line system: top 0, middle 50, base
// 100, bottom 140) plus a curved entry and exit (cubic Béziers) that leave and arrive
// in the same direction, so the letters of a word flow into each other.
// SAS follows a school poster and exercise books (slant about 12°, see
// plaene/klasse-2.md, K2-11); VA is an own approximation that still needs a template.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const DATA = new URL('../src/data/schriften/', import.meta.url)
const rad = (d) => (d * Math.PI) / 180
const round = (v) => Math.round(v * 100) / 100

// --- Pen: builds a stroke from lines and elliptic arcs ---------------------------

class Pen {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.segs = []
  }
  line(x, y) {
    this.segs.push({ l: [this.x, this.y, x, y] })
    this.x = x
    this.y = y
    return this
  }
  arc(cx, cy, rx, ry, a0, a1) {
    const [sx, sy] = at(a0, cx, cy, rx, ry)
    if (Math.hypot(sx - this.x, sy - this.y) > 0.3) this.line(sx, sy)
    this.segs.push({ a: [cx, cy, rx, ry, a0, a1] })
    ;[this.x, this.y] = at(a1, cx, cy, rx, ry)
    return this
  }
}

const at = (a, cx, cy, rx, ry) => [cx + rx * Math.cos(rad(a)), cy + ry * Math.sin(rad(a))]
const pen = (point) => new Pen(point[0], point[1])

/** A polyline through the given points. */
function P(...pts) {
  const p = new Pen(...pts[0])
  for (const [x, y] of pts.slice(1)) p.line(x, y)
  return p
}

const OVAL = [14, 75, 14, 25] // cx, cy, rx, ry of the round body (x-height 50..100)
const ovalStart = () => pen(at(-70, ...OVAL))

/** Main stroke (Pen), extra strokes (dots, bars), body width, high exit? */
function body(ch, va) {
  const [cx, cy, rx, ry] = OVAL
  let extra = []
  let high = false
  let p
  let w
  if ('adgqä'.includes(ch)) {
    p = ovalStart().arc(cx, cy, rx, ry, -70, -430)
    if (ch === 'a' || ch === 'ä') {
      p.line(28, Math.min(p.y, 50)).line(28, 100)
      w = 30
    }
    if (ch === 'd') {
      p.line(28, 0).line(28, 100)
      w = 30
    }
    if (ch === 'g') {
      p.line(28, 50).line(28, 122).arc(17, 122, 11, 16, 0, 180)
      w = 32
    }
    if (ch === 'q') {
      p.line(28, 50).line(28, 128).arc(32, 128, 4, 7, 180, 0)
      w = 36
    }
    if (ch === 'ä') extra = [[{ p: [8, 34] }], [{ p: [22, 34] }]]
  } else if (ch === 'o' || ch === 'ö') {
    p = new Pen(14, 50).arc(cx, cy, rx, ry, -90, -450)
    w = 26
    high = true
    if (ch === 'ö') extra = [[{ p: [7, 34] }], [{ p: [21, 34] }]]
  } else if (ch === 'c' && !va) {
    // SAS (poster): the up stroke meets the c on the left, runs up along the bow to the
    // hook at the upper right and turns back down the same way – no loop as in e.
    p = new Pen(2, 76).arc(16, 76, 14, 24, 180, 300).arc(16, 76, 14, 24, 300, 40)
    w = 28
  } else if (ch === 'c') {
    p = ovalStart().arc(cx, cy, rx, ry, -70, -320)
    w = 26
  } else if (ch === 'e' && va) {
    // VA: the "Köpfchen" – a small loop at the top, then down like a c.
    p = new Pen(16, 50).arc(16, 61, 8, 11, -90, 270).arc(15, 76, 13, 26, -90, -310)
    w = 26
  } else if (ch === 'e') {
    // The up stroke rises to the upper right, curls over to the left and comes down
    // across itself: that crossing makes the loop (as in the exercise books).
    p = pen(at(35, 14, 71, 9, 15))
      .arc(14, 71, 9, 15, 35, -180)
      .arc(16, 80, 11, 20, 180, 60)
    w = 24
  } else if (ch === 'i') {
    p = new Pen(6, 52).line(6, 100)
    w = 8
    extra = [[{ p: [6, 32] }]]
  } else if ('uüy'.includes(ch)) {
    p = new Pen(4, 52).line(4, 85).arc(16, 85, 12, 15, 180, 0).line(28, 52)
    if (ch === 'y') p.line(28, 122).arc(17, 122, 11, 16, 0, 180)
    else p.line(28, 100)
    w = ch === 'y' ? 32 : 30
    if (ch === 'ü') extra = [[{ p: [8, 34] }], [{ p: [24, 34] }]]
  } else if (ch === 'j') {
    p = new Pen(8, 52).line(8, 125).arc(0, 125, 8, 12, 0, 180)
    w = 16
    extra = [[{ p: [8, 32] }]]
  } else if (ch === 'n' || ch === 'm') {
    p = new Pen(4, 52).line(4, 100).line(4, 66).arc(16, 66, 12, 14, 180, 360).line(28, 100)
    w = 30
    if (ch === 'm') {
      p.line(28, 66).arc(40, 66, 12, 14, 180, 360).line(52, 100)
      w = 54
    }
  } else if (ch === 'r') {
    p = new Pen(4, 52).line(4, 100).line(4, 70).arc(15, 70, 11, 15, 180, 300)
    w = 22
    high = true
  } else if (ch === 'v' && !va) {
    // SAS: round at the bottom, small swing to the right at the top.
    p = new Pen(3, 52).line(3, 80).arc(14, 80, 11, 20, 180, 0)
    w = 26
    high = true
  } else if (ch === 'v') {
    p = P([2, 52], [13, 100], [24, 52])
    w = 24
    high = true
  } else if (ch === 'w' && !va) {
    p = new Pen(3, 52).line(3, 82).arc(12, 82, 9, 18, 180, 0).line(21, 60).line(21, 82)
    p.arc(30, 82, 9, 18, 180, 0)
    w = 40
    high = true
  } else if (ch === 'w') {
    p = P([2, 52], [10, 100], [18, 62], [26, 100], [34, 52])
    w = 34
    high = true
  } else if (ch === 'x') {
    p = P([2, 52], [24, 100])
    w = 26
    extra = [[{ l: [24, 52, 2, 100] }]]
  } else if (ch === 'z' && !va) {
    // SAS: flat top, diagonal, then a swing below the base line (verletzt, Benzin).
    p = P([3, 55], [23, 55], [7, 97]).arc(13, 114, 11, 17, -110, 140)
    w = 26
  } else if (ch === 'z') {
    p = P([2, 54], [24, 54], [2, 100], [26, 100])
    w = 26
  } else if (ch === 's' && va) {
    // VA: s like the print form, entered from the top.
    p = new Pen(24, 57).arc(15, 64, 9, 13, -40, -270).arc(15, 87, 10, 11, -90, 150)
    w = 26
  } else if (ch === 's') {
    // Up to a point, down in a bow to the right; the exit curve closes it with a
    // small loop at the bottom. The up stroke arrives steeply (pointed top).
    p = new Pen(10, 52).arc(10, 78, 9, 26, -90, 125)
    p.cuspIn = [0.35, -1]
    w = 22
  } else if (ch === 't') {
    p = new Pen(8, 22).line(8, 100)
    w = 14
    extra = [[{ l: [0, 50, 18, 50] }]]
  } else if ('lbhkf'.includes(ch)) {
    // Loop: up on the right, down on the left.
    p = new Pen(15, 12).arc(10.5, 12, 4.5, 10, 0, -180).line(6, ch === 'f' ? 134 : 100)
    if (ch === 'l') w = 10
    if (ch === 'f') {
      p.arc(10, 128, 4, 6, 180, 0)
      w = 18
      if (va) extra = [[{ l: [0, 56, 18, 56] }]]
    }
    if (ch === 'h') {
      p.line(6, 66).arc(18, 66, 12, 14, 180, 360).line(30, 100)
      w = 32
    }
    if (ch === 'k') {
      p.line(6, 74).line(22, 54).arc(19, 62, 4, 8, -40, 140).line(28, 100)
      w = 30
    }
    if (ch === 'b') {
      p.line(6, 80).arc(17, 78, 11, 22, 180, -90)
      w = 28
      high = true
    }
  } else if (ch === 'p' && !va) {
    // SAS (poster): open at the top like an n, the first leg goes down below the line.
    p = new Pen(4, 52).line(4, 140).line(4, 66).arc(16, 66, 12, 14, 180, 360).line(28, 100)
    w = 30
  } else if (ch === 'p') {
    p = new Pen(4, 52).line(4, 140).line(4, 66).arc(16, 75, 12, 25, 220, 460)
    p.line(8, 98).line(30, 100)
    w = 30
  } else if (ch === 'ß') {
    p = new Pen(4, 140).line(4, 30).arc(14, 30, 10, 22, 180, 380).line(14, 58)
    p.arc(16, 79, 10, 21, -90, 90).line(8, 100)
    w = 28
  } else throw new Error(`Kein Buchstabe ${ch}`)
  return { p, extra, w, high }
}

// --- Connections -------------------------------------------------------------------

const E = 8 // width of the entry connection
const norm = ([x, y]) => {
  const n = Math.hypot(x, y) || 1
  return [x / n, y / n]
}

/** Unit direction of a segment at its start or end. */
function tangent(seg, atEnd) {
  if (seg.l) {
    const [x1, y1, x2, y2] = seg.l
    return norm([x2 - x1, y2 - y1])
  }
  const [, , rx, ry, a0, a1] = seg.a
  const a = atEnd ? a1 : a0
  const sg = a1 > a0 ? 1 : -1
  return norm([-rx * Math.sin(rad(a)) * sg, ry * Math.cos(rad(a)) * sg])
}

const startOf = (seg) => (seg.l ? [seg.l[0], seg.l[1]] : at(seg.a[4], ...seg.a.slice(0, 4)))
const endOf = (seg) => (seg.l ? [seg.l[2], seg.l[3]] : at(seg.a[5], ...seg.a.slice(0, 4)))

/** Pen direction where two letters meet: rising low in the up stroke, flat above. */
const joint = (y) => norm(y >= 80 ? [1, -0.9] : [1, 0.12])

/** Cubic curve from p0 (leaving in direction t0) to p3 (arriving in direction t3). */
function bezier(p0, t0, p3, t3, w0 = 0.4, w3 = 0.4) {
  const L = Math.hypot(p3[0] - p0[0], p3[1] - p0[1])
  return {
    c: [
      p0[0],
      p0[1],
      p0[0] + t0[0] * L * w0,
      p0[1] + t0[1] * L * w0,
      p3[0] - t3[0] * L * w3,
      p3[1] - t3[1] * L * w3,
      p3[0],
      p3[1],
    ],
  }
}

const shiftX = (seg, dx) =>
  seg.l
    ? { l: [seg.l[0] + dx, seg.l[1], seg.l[2] + dx, seg.l[3]] }
    : seg.a
      ? { a: [seg.a[0] + dx, ...seg.a.slice(1)] }
      : seg.c
        ? { c: seg.c.map((v, i) => (i % 2 === 0 ? v + dx : v)) }
        : { p: [seg.p[0] + dx, seg.p[1]] }

/**
 * A small letter with curved entry and exit. With `slant` the joint points are placed so
 * that they land on x = 0 and x = w after the letter is sheared.
 */
function smallLetter(ch, va, slant = 0) {
  const { p, extra, w: bw, high } = body(ch, va)
  const segs = p.segs.map((s) => ({ ...s }))
  // A down stroke that ends on the base line turns into the exit curve a little earlier.
  const last = segs.at(-1)
  if (last.l && last.l[3] >= 99 && last.l[3] - last.l[1] > 20)
    last.l = [last.l[0], last.l[1], last.l[2], 92]
  const body_ = segs.map((s) => shiftX(s, E))
  // SAS joins low in the up stroke, just above the base line (as in the exercise books).
  const ein = va ? 50 : 90
  const aus = va ? 50 : high ? 55 : 90
  const w = bw + E + 8
  const start = startOf(body_[0])
  const tStart = p.cuspIn ? norm(p.cuspIn) : tangent(body_[0], false)
  const end = endOf(body_.at(-1))
  const entry = (y) => bezier([-slant * (100 - y), y], joint(y), start, tStart, 0.45, 0.3)
  const exit = bezier(
    end,
    tangent(body_.at(-1), true),
    [w - slant * (100 - aus), aus],
    joint(aus),
    0.35,
    0.4,
  )
  const glyph = {
    w,
    ein,
    aus,
    einSegs: 1,
    strokes: [[entry(ein), ...body_, exit], ...extra.map((st) => st.map((s) => shiftX(s, E)))],
  }
  if (!va) glyph.einAlt = { 55: [entry(55)] }
  return glyph
}

// --- Slant (SAS) ---------------------------------------------------------------------

/** An elliptic arc as cubic Béziers (pieces of at most 90°). */
function arcToBeziers([cx, cy, rx, ry, a0, a1]) {
  const n = Math.max(1, Math.ceil(Math.abs(a1 - a0) / 90))
  const out = []
  for (let i = 0; i < n; i++) {
    const t0 = rad(a0 + ((a1 - a0) * i) / n)
    const t1 = rad(a0 + ((a1 - a0) * (i + 1)) / n)
    const k = (4 / 3) * Math.tan((t1 - t0) / 4)
    const [x0, y0] = [cx + rx * Math.cos(t0), cy + ry * Math.sin(t0)]
    const [x3, y3] = [cx + rx * Math.cos(t1), cy + ry * Math.sin(t1)]
    out.push({
      c: [
        x0,
        y0,
        x0 - k * rx * Math.sin(t0),
        y0 + k * ry * Math.cos(t0),
        x3 + k * rx * Math.sin(t1),
        y3 - k * ry * Math.cos(t1),
        x3,
        y3,
      ],
    })
  }
  return out
}

/** x scaled by sx, then sheared to the right: x + (100 − y) · K. Exact for lines and Béziers. */
function slantStroke(stroke, K, sx = 1) {
  const tf = (x, y) => [x * sx + (100 - y) * K, y]
  return stroke.flatMap((seg) => {
    if (seg.p) return [{ p: tf(...seg.p) }]
    if (seg.l) return [{ l: [...tf(seg.l[0], seg.l[1]), ...tf(seg.l[2], seg.l[3])] }]
    const pieces = seg.a ? arcToBeziers(seg.a) : [seg]
    return pieces.map((b) => ({
      c: [0, 2, 4, 6].flatMap((i) => tf(b.c[i], b.c[i + 1])),
    }))
  })
}

const K = 0.21 // SAS slant (about 12°), as in the exercise books

function sasSmall(ch) {
  const g = smallLetter(ch, false, K)
  g.strokes = g.strokes.map((st) => slantStroke(st, K))
  g.einAlt = Object.fromEntries(Object.entries(g.einAlt).map(([y, st]) => [y, slantStroke(st, K)]))
  return g
}

function sasCapitals(druck) {
  const cap = (strokes, w) => ({ w, strokes: strokes.map((st) => slantStroke(st, K)) })
  const G = {}
  const A = P([0, 100], [32, 0], [34, 100]).segs
  const bar = [{ l: [12, 62, 38, 62] }]
  G.A = cap([A, bar], 40)
  G['Ä'] = cap([A, bar, [{ p: [16, -12] }], [{ p: [30, -12] }]], 40)
  G.E = cap(
    [new Pen(40, 12).arc(24, 25, 16, 22, -40, -270).arc(26, 74, 22, 26, -90, -330).segs],
    50,
  )
  G.I = cap(
    [[{ l: [4, 6, 34, 4] }], new Pen(34, 4).line(28, 84).arc(16, 84, 12, 16, 0, 170).segs],
    38,
  )
  G.J = cap(
    [
      [{ l: [4, 6, 36, 4] }],
      new Pen(36, 4).line(30, 120).arc(20, 120, 10, 16, 0, 180).line(34, 98).segs,
    ],
    40,
  )
  G.L = cap(
    [
      new Pen(42, 10)
        .arc(34, 12, 8, 8, 0, -180)
        .line(18, 94)
        .arc(12, 94, 6, 6, 0, 270)
        .line(50, 100).segs,
    ],
    52,
  )
  G.M = cap([P([0, 100], [14, 0], [28, 82], [42, 0], [48, 100]).segs], 52)
  G.N = cap([P([0, 100], [14, 0], [38, 100], [48, 0]).segs], 50)
  const o = new Pen(30, 0).arc(30, 50, 26, 50, -90, -450).arc(36, 8, 6, 8, 180, 360).segs
  G.O = cap([o], 58)
  G['Ö'] = cap([o, [{ p: [22, -12] }], [{ p: [38, -12] }]], 58)
  G.Q = cap([new Pen(30, 0).arc(30, 50, 26, 50, -90, -450).segs, [{ l: [28, 70, 50, 104] }]], 58)
  const u = new Pen(2, 6).line(2, 78).arc(18, 78, 16, 22, 180, 0).line(36, 4).line(36, 100).segs
  G.U = cap([u], 40)
  G['Ü'] = cap([u, [{ p: [12, -12] }], [{ p: [26, -12] }]], 40)
  G.V = cap(
    [new Pen(2, 4).line(2, 70).arc(18, 70, 16, 30, 180, 0).line(34, 8).line(42, 4).segs],
    44,
  )
  const W = new Pen(2, 4).line(2, 80).arc(14, 80, 12, 20, 180, 0).line(26, 30).line(26, 80)
  W.arc(38, 80, 12, 20, 180, 0).line(50, 8).line(58, 4)
  G.W = cap([W.segs], 60)
  const Y = new Pen(2, 6).line(2, 78).arc(18, 78, 16, 22, 180, 0).line(34, 4).line(34, 122)
  Y.arc(24, 122, 10, 16, 0, 180).line(40, 98)
  G.Y = cap([Y.segs], 44)
  // From the print form (slanted, round ones narrower), B with both bows in one stroke.
  for (const [ch, sx] of Object.entries({
    C: 0.7,
    D: 1,
    F: 1,
    G: 0.7,
    H: 1,
    K: 1,
    P: 1,
    R: 1,
    S: 1,
    T: 1,
    X: 1,
    Z: 1,
  })) {
    const d = druck.glyphs[ch]
    G[ch] = { w: Math.round(d.w * sx), strokes: d.strokes.map((st) => slantStroke(st, K, sx)) }
  }
  const b = druck.glyphs.B.strokes
  G.B = { w: 52, strokes: [slantStroke(b[0], K), slantStroke([...b[1], ...b[2]], K)] }
  return G
}

// --- Output --------------------------------------------------------------------------

const roundSeg = (seg) => Object.fromEntries(Object.entries(seg).map(([k, v]) => [k, v.map(round)]))
function roundGlyph(g) {
  const out = { ...g, strokes: g.strokes.map((st) => st.map(roundSeg)) }
  if (g.einAlt)
    out.einAlt = Object.fromEntries(
      Object.entries(g.einAlt).map(([y, st]) => [y, st.map(roundSeg)]),
    )
  return out
}

const LOWER = [...'abcdefghijklmnopqrstuvwxyzäöüß']
const druck = JSON.parse(readFileSync(new URL('druckschrift/strokes.json', DATA), 'utf8'))
const NOTE =
  `${druck.note} c = kubische Bézierkurve [x0,y0,x1,y1,x2,y2,x3,y3]. ` +
  'Verbundene Schrift: Jeder Kleinbuchstabe beginnt bei x=0 auf der Höhe „ein“ und endet bei ' +
  'x=w auf der Höhe „aus“; so schließen die Buchstaben eines Wortes aneinander an. Der erste ' +
  'Strich ist der Hauptstrich, weitere Striche (Punkte, Querstriche) kommen nach dem Wort. ' +
  'ERZEUGT von scripts/schreibschrift.mjs – dort ändern, nicht hier.'

for (const [va, id, name] of [
  [true, 'vereinfachte-ausgangsschrift', 'Vereinfachte Ausgangsschrift'],
  [false, 'schulausgangsschrift', 'Schulausgangsschrift'],
]) {
  const glyphs = Object.fromEntries(
    Object.entries(druck.glyphs).filter(([k]) => !LOWER.includes(k)),
  )
  const out = { id, name, verbunden: true }
  if (va) {
    for (const ch of LOWER) glyphs[ch] = smallLetter(ch, true)
    out.note = `${NOTE} Großbuchstaben und Ziffern wie in der Druckschrift, nicht verbunden.`
  } else {
    for (const ch of LOWER) glyphs[ch] = sasSmall(ch)
    Object.assign(glyphs, sasCapitals(druck))
    out.neigung = K
    out.note = `${NOTE} Nach Plakat und Heftseiten der Schulausgangsschrift: alle Buchstaben um ${K} nach rechts geneigt (x + (100 − y) · ${K}); Großbuchstaben in Schreibschrift-Form, nicht verbunden. Ziffern wie in der Druckschrift.`
  }
  out.glyphs = Object.fromEntries(Object.entries(glyphs).map(([k, g]) => [k, roundGlyph(g)]))
  mkdirSync(new URL(`${id}/`, DATA), { recursive: true })
  writeFileSync(new URL(`${id}/strokes.json`, DATA), `${JSON.stringify(out)}\n`)
}
console.log('Schreibschriften erzeugt: VA, SAS.')
