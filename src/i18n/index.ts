import { en, plurals as enPlurals, type Strings } from './en'

export type Lang = 'en' | 'ar'
type Key = { [K in keyof Strings]: Strings[K] extends string ? K : never }[keyof Strings]

const tables: Record<Lang, Strings> = { en, ar: en }
const pluralTables: Record<Lang, typeof enPlurals> = { en: enPlurals, ar: enPlurals }
let lang: Lang = 'en'

export const setLang = (l: Lang) => {
  lang = l
  document.documentElement.lang = l
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
}
export const getLang = () => lang
export const isRtl = () => lang === 'ar'
export const strings = () => tables[lang]

/** Translate a key and fill in {placeholders}. Numbers are formatted for the language. */
export function t(key: Key, vars: Record<string, string | number> = {}): string {
  const s = tables[lang][key] as string
  return s.replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k]
    return typeof v === 'number' ? fmt(v) : (v ?? '')
  })
}

export const fmt = (n: number) => (Math.round(n * 100) / 100).toString()

/** "1 sol", "3 sols", and the right Arabic form for any number. */
export function count(n: number, word: keyof typeof enPlurals): string {
  const forms = pluralTables[lang][word]
  const rule = new Intl.PluralRules(lang).select(n)
  return (forms[rule] ?? forms.other ?? '').replace('{n}', fmt(n))
}
