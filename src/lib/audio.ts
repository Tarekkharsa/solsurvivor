/** Sound effects and generated music with the Web Audio API. No audio files. */
let ctx: AudioContext | undefined
let master: GainNode | undefined

function audio(): AudioContext | undefined {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return undefined
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.6
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain: number, to = master) {
  const c = audio()
  if (!c || !to) return
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(0, start)
  g.gain.linearRampToValueAtTime(gain, start + Math.min(0.02, dur / 4))
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  o.connect(g).connect(to)
  o.start(start)
  o.stop(start + dur + 0.05)
}

export type Sfx = 'tap' | 'undo' | 'good' | 'bad' | 'storm' | 'win' | 'lose' | 'start' | 'photo'

let sfxOn = true
export const setSfx = (on: boolean) => {
  sfxOn = on
}

export function play(s: Sfx) {
  if (!sfxOn) return
  const c = audio()
  if (!c) return
  const t = c.currentTime + 0.01
  const seq: Record<Sfx, [number, number, number, OscillatorType, number][]> = {
    tap: [[660, 0, 0.08, 'triangle', 0.2]],
    undo: [[440, 0, 0.08, 'triangle', 0.15]],
    good: [[523, 0, 0.15, 'triangle', 0.2], [784, 0.08, 0.25, 'triangle', 0.2]],
    bad: [[220, 0, 0.25, 'sawtooth', 0.08], [196, 0.1, 0.3, 'sawtooth', 0.08]],
    storm: [[110, 0, 0.9, 'sawtooth', 0.1], [116, 0.05, 0.9, 'sawtooth', 0.08], [880, 0.2, 0.3, 'square', 0.04], [880, 0.6, 0.3, 'square', 0.04]],
    win: [[523, 0, 0.2, 'triangle', 0.22], [659, 0.15, 0.2, 'triangle', 0.22], [784, 0.3, 0.2, 'triangle', 0.22], [1047, 0.45, 0.6, 'triangle', 0.25]],
    lose: [[392, 0, 0.3, 'triangle', 0.2], [330, 0.25, 0.3, 'triangle', 0.2], [262, 0.5, 0.7, 'triangle', 0.2]],
    start: [[392, 0, 0.15, 'triangle', 0.2], [523, 0.1, 0.15, 'triangle', 0.2], [659, 0.2, 0.4, 'triangle', 0.2]],
    photo: [[1319, 0, 0.12, 'sine', 0.2], [1760, 0.06, 0.3, 'sine', 0.15]],
  }
  for (const [f, at, d, type, g] of seq[s]) tone(f, t + at, d, type, g)
}

// Music: slow ambient chords with bells. "Tense" swaps to darker chords and a low pulse.
const calm = [
  [220, 277.2, 329.6, 415.3],
  [196, 246.9, 293.7, 370],
  [174.6, 220, 261.6, 329.6],
  [196, 246.9, 293.7, 392],
]
const tense = [
  [110, 130.8, 164.8, 196],
  [103.8, 123.5, 155.6, 185],
  [98, 116.5, 146.8, 174.6],
  [103.8, 130.8, 155.6, 196],
]
const bells = [659.3, 740, 830.6, 987.8, 1108.7, 1318.5]

let musicTimer: ReturnType<typeof setInterval> | undefined
let musicBus: GainNode | undefined
let mood: 'calm' | 'tense' = 'calm'
let bar = 0

export const setMood = (m: 'calm' | 'tense') => {
  mood = m
}

export function startMusic() {
  const c = audio()
  if (!c || musicTimer) return
  musicBus = c.createGain()
  musicBus.gain.value = 0.35
  musicBus.connect(master!)
  const step = () => {
    if (!musicBus) return
    const t = c.currentTime + 0.05
    const chords = mood === 'tense' ? tense : calm
    for (const f of chords[bar % 4]) tone(f, t, 4.4, 'sine', 0.05, musicBus)
    if (mood === 'tense') for (let i = 0; i < 4; i++) tone(55, t + i, 0.5, 'sine', 0.12, musicBus)
    else for (let i = 0; i < 2; i++) if (Math.random() < 0.7) tone(bells[Math.floor(Math.random() * bells.length)], t + 0.5 + i * 1.7 + Math.random(), 1.6, 'sine', 0.035, musicBus)
    bar++
  }
  step()
  musicTimer = setInterval(step, 4000)
}

export function stopMusic() {
  if (musicTimer) clearInterval(musicTimer)
  musicTimer = undefined
  if (musicBus && ctx) {
    musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.3)
    const bus = musicBus
    setTimeout(() => bus.disconnect(), 1500)
  }
  musicBus = undefined
}

/** Reads text aloud in the game's language, if the device has a voice for it. */
export function speak(text: string, lang: string) {
  if (typeof speechSynthesis === 'undefined') return
  speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text.replace(/[\p{Extended_Pictographic}\u{FE0F}]/gu, ''))
  u.lang = lang === 'ar' ? 'ar-SA' : 'en-US'
  const v = speechSynthesis.getVoices().find((x) => x.lang.startsWith(lang))
  if (v) u.voice = v
  u.rate = 0.95
  speechSynthesis.speak(u)
}
