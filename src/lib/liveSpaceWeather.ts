/**
 * Solar flares from the last 7 days, live. NASA's DONKI first; if it is down,
 * NOAA's GOES satellite feed. The card says which one answered. This is shown,
 * never mixed into the game rules, so every mission stays the same for a class.
 */
export interface Flares {
  source: 'NASA DONKI' | 'NOAA GOES'
  count: number
  biggest?: { cls: string; when: Date }
}

const rank = (cls: string) => {
  const m = cls.match(/^([ABCMX])(\d+(?:\.\d+)?)/)
  if (!m) return 0
  return 'ABCMX'.indexOf(m[1]) * 100 + Number(m[2])
}

async function getJson(url: string, ms: number): Promise<unknown> {
  const ctl = new AbortController()
  const id = setTimeout(() => ctl.abort(), ms)
  try {
    const r = await fetch(url, { signal: ctl.signal })
    if (!r.ok) throw new Error(String(r.status))
    return await r.json()
  } finally {
    clearTimeout(id)
  }
}

export function summarize(list: { cls: string; when: string }[], source: Flares['source']): Flares {
  // C class and up: the tiny A and B flares happen all the time.
  const ok = list.filter((f) => rank(f.cls) >= 200)
  const top = ok.reduce<(typeof ok)[number] | undefined>((b, f) => (!b || rank(f.cls) > rank(b.cls) ? f : b), undefined)
  return { source, count: ok.length, biggest: top && { cls: top.cls, when: new Date(top.when) } }
}

export async function fetchFlares(now = new Date()): Promise<Flares | undefined> {
  const day = (d: Date) => d.toISOString().slice(0, 10)
  const from = day(new Date(now.getTime() - 7 * 86400000))
  // Ask both at once. NASA wins if it answers in time; DONKI is often down.
  const nasa = getJson(`https://api.nasa.gov/DONKI/FLR?startDate=${from}&endDate=${day(now)}&api_key=DEMO_KEY`, 6000).then((data) =>
    Array.isArray(data) ? summarize((data as { classType: string; peakTime: string }[]).map((f) => ({ cls: f.classType, when: f.peakTime })), 'NASA DONKI') : undefined,
  )
  const noaa = getJson('https://services.swpc.noaa.gov/json/goes/primary/xray-flares-7-day.json', 6000).then((data) =>
    Array.isArray(data) ? summarize((data as { max_class: string; max_time: string }[]).map((f) => ({ cls: f.max_class, when: f.max_time })), 'NOAA GOES') : undefined,
  )
  const quick = await Promise.race([nasa.catch(() => undefined), new Promise<undefined>((r) => setTimeout(() => r(undefined), 2500))])
  if (quick) return quick
  return (await noaa.catch(() => undefined)) ?? (await nasa.catch(() => undefined))
}

/** C flares are small, M medium, X the big ones that cause radiation storms. */
export const flareSize = (cls: string): 'small' | 'medium' | 'big' => (cls.startsWith('X') ? 'big' : cls.startsWith('M') ? 'medium' : 'small')
