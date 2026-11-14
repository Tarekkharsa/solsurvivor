import { describe, expect, it } from 'vitest'
import { ar } from './ar'
import { en } from './en'
import { count, setLang, setWorldWords, t } from '.'

describe('translations', () => {
  it('Arabic has exactly the English keys', () => {
    expect(Object.keys(ar).sort()).toEqual(Object.keys(en).sort())
    expect(Object.keys(ar.lostText).sort()).toEqual(Object.keys(en.lostText).sort())
  })

  it('keeps every {placeholder}', () => {
    for (const k of Object.keys(en) as (keyof typeof en)[]) {
      if (typeof en[k] !== 'string') continue
      const holes = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort()
      expect(holes(ar[k] as string), k).toEqual(holes(en[k] as string))
    }
  })

  it('counts in English and Arabic', () => {
    setLang('en')
    setWorldWords('mars')
    expect(count(1)).toBe('1 sol')
    expect(count(3)).toBe('3 sols')
    setLang('ar')
    expect(count(1)).toBe('سول واحد')
    expect(count(2)).toBe('سولان')
    expect(count(2, 'sol', true)).toBe('سولين')
    expect(count(3)).toBe('3 سولات')
    expect(count(10)).toBe('10 سولات')
    expect(count(11)).toBe('11 سولًا')
    expect(t('inTurns', { count: count(2, 'sol', true) })).toBe('بعد سولين')
    setLang('en')
  })
})
