import type { Lang } from '../i18n'
import type { Content } from '../sim/types'
import { localize, type ContentText } from './localize'
import { mars } from './mars'
import { marsAr } from './mars/ar'
import { moon } from './moon'
import { moonAr } from './moon/ar'
import { moonStrings } from './moon/strings'
import { registerWorldStrings } from '../i18n'

/** The rules of each world, in English (used by tests and balance checks). */
export const worlds: Record<Content['id'], Content> = { mars, moon }

const text: Record<Content['id'], Partial<Record<Lang, ContentText>>> = {
  mars: { ar: marsAr },
  moon: { ar: moonAr },
}

/** A world with its text in the given language. The numbers never change. */
export const getWorld = (id: Content['id'], lang: Lang): Content => localize(worlds[id], text[id][lang])

export const photoTitle = (id: string, lang: Lang, fallback: string) =>
  Object.values(text).map((t) => t[lang]?.photos?.[id]).find(Boolean) ?? fallback

registerWorldStrings('moon', moonStrings)
