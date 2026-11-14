import { ar, arPlurals } from './ar'
import { en, plurals as enPlurals, type PluralForms, type Strings } from './en'

export type Lang = 'en' | 'ar'
type Key = { [K in keyof Strings]: Strings[K] extends string ? K : never }[keyof Strings]

const tables: Record<Lang, Strings> = { en, ar }
const pluralTables: Record<Lang, Record<'sol' | 'day' | 'player', PluralForms>> = { en: enPlurals, ar: arPlurals }
/** Per-world wording (the Moon counts days, not sols). */
const worldTables: Record<string, Partial<Record<Lang, Partial<Strings>>>> = {}
let lang: Lang = 'en'
let world = 'mars'

export const registerWorldStrings = (id: string, t: Partial<Record<Lang, Partial<Strings>>>) => {
  worldTables[id] = t
}

export const setLang = (l: Lang) => {
  lang = l
  if (typeof document !== 'undefined') {
    document.documentElement.lang = l
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
  }
}
export const setWorldWords = (w: string) => {
  world = w
}
export const getLang = () => lang
export const isRtl = () => lang === 'ar'
export const strings = (): Strings => ({ ...tables[lang], ...worldTables[world]?.[lang] }) as Strings

/** Translate a key and fill in {placeholders}. */
export function t(key: Key, vars: Record<string, string | number> = {}): string {
  const s = (worldTables[world]?.[lang]?.[key] ?? tables[lang][key]) as string
  return s.replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k]
    return typeof v === 'number' ? fmt(v) : (v ?? '')
  })
}

/** Like t(), for keys that come from content (crew lines, badges). */
export const tk = (key: string, vars?: Record<string, string | number>) => t(key as Key, vars)

export const fmt = (n: number) => (Math.round(n * 100) / 100).toString()

/** The turn word for the world being played. */
export const turnWord = (): 'sol' | 'day' => (world === 'moon' ? 'day' : 'sol')

/**
 * "1 sol", "3 sols", and the right Arabic form for any number. In Arabic, 1 and 2
 * take no numeral, and the dual changes after a preposition (`prep`).
 */
export function count(n: number, word: 'sol' | 'day' | 'player' = turnWord(), prep = false): string {
  const forms = pluralTables[lang][word]
  const rule = Number.isInteger(n) ? new Intl.PluralRules(lang).select(n) : 'other'
  const form = (rule === 'two' && prep ? forms.twoPrep : undefined) ?? forms[rule] ?? forms.other ?? ''
  return form.replace('{n}', fmt(n))
}
