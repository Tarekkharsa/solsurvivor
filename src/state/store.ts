import { useMemo } from 'react'
import { create } from 'zustand'
import { badges } from '../content/badges'
import { worlds } from '../content'
import { createGame, playTurn, powerLeft, previewTurn, projectStatus, replay, stars } from '../sim/engine'
import type { Content, Game, LevelId, Plan, TurnRecord } from '../sim/types'
import { drop, load, save } from '../lib/save'

export type Screen = 'title' | 'play' | 'report' | 'end'
export type Modal = 'journal' | 'badges' | null

export interface Profile {
  badges: string[]
  journal: string[]
  wins: number
  coachDone: boolean
}

export interface Challenge {
  world: Content['id']
  level: LevelId
  seed: number
  stars: number
}

interface SavedMission {
  world: Content['id']
  level: LevelId
  seed: number
  plans: Plan[]
}

interface State {
  screen: Screen
  modal: Modal
  content: Content
  game: Game
  plan: Plan
  plans: Plan[]
  last?: TurnRecord
  profile: Profile
  /** Things this mission unlocked, for the end screen. */
  fresh: { badges: string[]; photos: string[] }
  /** Guided first sol: the step shown, or null. */
  coach: number | null
  challenge?: Challenge
  saved?: SavedMission
  start: (world: Content['id'], level: LevelId, seed?: number) => void
  resume: () => void
  setUnits: (id: string, units: number) => void
  toggleProject: (id: string) => void
  repeatPlan: () => void
  endTurn: () => void
  next: () => void
  quit: () => void
  openModal: (m: Modal) => void
  skipCoach: () => void
  setChallenge: (c?: Challenge) => void
}

const emptyPlan = (): Plan => ({ units: {} })
export const randomSeed = () => 1000 + Math.floor(Math.random() * 9000)
const blankProfile: Profile = { badges: [], journal: [], wins: 0, coachDone: false }

/** Photos a record unlocks: finished expeditions and wonders like the blue sunset. */
function photosFrom(record: TurnRecord, content: Content): string[] {
  const out = record.finished.map((id) => content.projects.find((p) => p.id === id)?.photo).filter(Boolean) as string[]
  const e = content.events.find((x) => x.id === record.event)
  if (e?.photo) out.push(e.photo)
  return out
}

export const useGame = create<State>((set, get) => ({
  screen: 'title',
  modal: null,
  content: worlds.mars,
  game: createGame(worlds.mars, 'cadet', 1),
  plan: emptyPlan(),
  plans: [],
  profile: load('profile', blankProfile),
  fresh: { badges: [], photos: [] },
  coach: null,
  saved: (() => {
    const s = load<SavedMission | null>('mission', null)
    return s && s.plans?.length ? s : undefined
  })(),

  start: (world, level, seed = randomSeed()) => {
    const content = worlds[world]
    const coach = get().profile.coachDone ? null : 0
    set({ screen: 'play', modal: null, content, game: createGame(content, level, seed), plan: emptyPlan(), plans: [], last: undefined, fresh: { badges: [], photos: [] }, coach })
    save('mission', { world, level, seed, plans: [] })
  },

  resume: () => {
    const s = get().saved
    if (!s) return
    const content = worlds[s.world]
    const game = replay(content, s.level, s.seed, s.plans)
    set({ screen: game.status === 'playing' ? 'play' : 'end', content, game, plans: s.plans, plan: emptyPlan(), coach: null, fresh: { badges: [], photos: [] } })
  },

  setUnits: (id, units) => {
    const { plan, game, content } = get()
    const a = content.actions.find((x) => x.id === id)
    if (!a) return
    const next: Plan = { ...plan, units: { ...plan.units, [id]: Math.max(0, Math.min(a.maxUnits, units)) } }
    if (!next.units[id]) delete next.units[id]
    if (powerLeft(next, game, content) < 0) return
    set({ plan: next })
    // The guided first sol moves on when the step is done.
    const c = get().coach
    const u = next.units
    if (c === 0 && (u.oxygen ?? 0) >= 2) set({ coach: 1 })
    else if (c === 1 && (u.greenhouse ?? 0) >= 1) set({ coach: 2 })
    else if (c === 2 && (u[content.forecastAction] ?? 0) >= 1) set({ coach: 3 })
  },

  toggleProject: (id) => {
    const { plan, game, content } = get()
    if (plan.start === id) return set({ plan: { ...plan, start: undefined } })
    const p = content.projects.find((x) => x.id === id)
    if (!p || projectStatus(p, game, content) !== 'ready') return
    const next = { ...plan, start: id }
    if (powerLeft(next, game, content) < 0) return
    set({ plan: next })
  },

  repeatPlan: () => {
    const { content, game, plans } = get()
    const last = plans.at(-1)
    if (!last) return
    const next: Plan = { units: {} }
    for (const a of content.actions) {
      for (let u = 0; u < Math.min(last.units[a.id] ?? 0, a.maxUnits); u++) {
        const more: Plan = { units: { ...next.units, [a.id]: (next.units[a.id] ?? 0) + 1 } }
        if (powerLeft(more, game, content) < 0) break
        next.units = more.units
      }
    }
    if (Object.keys(next.units).length) set({ plan: next })
  },

  endTurn: () => {
    const { game, content, plan, plans, profile, coach } = get()
    if (game.status !== 'playing') return
    const { game: after, record } = playTurn(game, content, plan)
    const allPlans = [...plans, plan]
    let nextProfile = profile
    const fresh = { ...get().fresh }
    const newPhotos = photosFrom(record, content).filter((p) => !profile.journal.includes(p))
    if (newPhotos.length) {
      nextProfile = { ...nextProfile, journal: [...nextProfile.journal, ...newPhotos] }
      fresh.photos = [...fresh.photos, ...newPhotos]
    }
    if (after.status !== 'playing') {
      const wins = profile.wins + (after.status === 'won' ? 1 : 0)
      const earned = badges.filter((b) => !nextProfile.badges.includes(b.id) && b.test(after, content, { journal: nextProfile.journal, wins })).map((b) => b.id)
      nextProfile = { ...nextProfile, wins, badges: [...nextProfile.badges, ...earned] }
      fresh.badges = earned
      drop('mission')
    } else {
      save('mission', { world: content.id, level: after.level, seed: after.seed, plans: allPlans })
    }
    if (coach !== null) nextProfile = { ...nextProfile, coachDone: true }
    save('profile', nextProfile)
    set({ game: after, plans: allPlans, plan: emptyPlan(), last: record, screen: 'report', profile: nextProfile, fresh, coach: null, saved: undefined })
  },

  next: () => set({ screen: get().game.status === 'playing' ? 'play' : 'end' }),
  quit: () => {
    const { game, content, plans } = get()
    const saved = game.status === 'playing' && plans.length ? { world: content.id, level: game.level, seed: game.seed, plans } : undefined
    set({ screen: 'title', modal: null, saved })
  },
  openModal: (modal) => set({ modal }),
  skipCoach: () => {
    const profile = { ...get().profile, coachDone: true }
    save('profile', profile)
    set({ coach: null, profile })
  },
  setChallenge: (challenge) => set({ challenge }),
}))

/** The live preview of the plan being made. */
export const usePreview = () => {
  const game = useGame((s) => s.game)
  const content = useGame((s) => s.content)
  const plan = useGame((s) => s.plan)
  return useMemo(() => (game.status === 'playing' ? previewTurn(game, content, plan) : undefined), [game, content, plan])
}

export const missionStars = (s: State) => stars(s.game, s.content)

/** A link that opens the same mission (same seed, same storms) with the stars to beat. */
export function challengeLink(game: Game, content: Content): string {
  const url = new URL(location.href)
  url.search = ''
  url.hash = ''
  url.searchParams.set('world', content.id)
  url.searchParams.set('level', game.level)
  url.searchParams.set('seed', String(game.seed))
  url.searchParams.set('beat', String(stars(game, content)))
  return url.toString()
}

export function readChallenge(search: string): Challenge | undefined {
  const q = new URLSearchParams(search)
  const seed = Number(q.get('seed'))
  const world = q.get('world') === 'moon' ? 'moon' : 'mars'
  const level = q.get('level') === 'commander' ? 'commander' : 'cadet'
  if (!q.has('seed') || !Number.isInteger(seed) || seed <= 0) return undefined
  return { world, level, seed, stars: Math.max(0, Math.min(3, Number(q.get('beat')) || 0)) }
}
