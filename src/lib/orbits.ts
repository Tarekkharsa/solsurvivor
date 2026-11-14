/**
 * Where Earth and Mars are, from NASA JPL's "Approximate Positions of the
 * Planets" (Keplerian elements valid 1800–2050, E. M. Standish). Good to a
 * small fraction of a degree, which is plenty for a light delay in minutes.
 */
interface Elements {
  a: [number, number]
  e: [number, number]
  I: [number, number]
  L: [number, number]
  peri: [number, number]
  node: [number, number]
}

const earth: Elements = {
  a: [1.00000261, 0.00000562],
  e: [0.01671123, -0.00004392],
  I: [-0.00001531, -0.01294668],
  L: [100.46457166, 35999.37244981],
  peri: [102.93768193, 0.32327364],
  node: [0, 0],
}

const mars: Elements = {
  a: [1.52371034, 0.00001847],
  e: [0.0933941, 0.00007882],
  I: [1.84969142, -0.00813131],
  L: [-4.55343205, 19140.30268499],
  peri: [-23.94362959, 0.44441088],
  node: [49.55953891, -0.29257343],
}

const rad = Math.PI / 180
const AU_KM = 149597870.7
const C_KM_S = 299792.458

export const julianDay = (d: Date) => d.getTime() / 86400000 + 2440587.5

function position(el: Elements, jd: number): [number, number, number] {
  const T = (jd - 2451545) / 36525
  const at = (x: [number, number]) => x[0] + x[1] * T
  const a = at(el.a)
  const e = at(el.e)
  const I = at(el.I) * rad
  const L = at(el.L)
  const peri = at(el.peri)
  const node = at(el.node)
  const w = (peri - node) * rad
  const O = node * rad
  let M = (((L - peri) % 360) + 540) % 360 - 180
  M *= rad
  let E = M + e * Math.sin(M)
  for (let i = 0; i < 10; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E))
  const x1 = a * (Math.cos(E) - e)
  const y1 = a * Math.sqrt(1 - e * e) * Math.sin(E)
  const cw = Math.cos(w)
  const sw = Math.sin(w)
  const cO = Math.cos(O)
  const sO = Math.sin(O)
  const cI = Math.cos(I)
  const sI = Math.sin(I)
  return [
    (cw * cO - sw * sO * cI) * x1 + (-sw * cO - cw * sO * cI) * y1,
    (cw * sO + sw * cO * cI) * x1 + (-sw * sO + cw * cO * cI) * y1,
    sw * sI * x1 + cw * sI * y1,
  ]
}

/** Earth–Mars distance in astronomical units. */
export function earthMarsAU(d: Date): number {
  const jd = julianDay(d)
  const p = position(earth, jd)
  const q = position(mars, jd)
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2])
}

/** One-way radio delay to Mars, in minutes. */
export const marsDelayMinutes = (d = new Date()) => (earthMarsAU(d) * AU_KM) / C_KM_S / 60

/** One-way radio delay to the Moon, in seconds (average distance 384,400 km). */
export const moonDelaySeconds = () => 384400 / C_KM_S
