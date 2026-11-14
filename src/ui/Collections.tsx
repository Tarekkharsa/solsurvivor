import { useEffect, useRef, useState } from 'react'
import { badges } from '../content/badges'
import { photoById, photos } from '../content/photos'
import { getWorld, photoTitle } from '../content'
import type { Content } from '../sim/types'
import { getLang, t, tk } from '../i18n'
import { useGame } from '../state/store'

/** A dialog that takes focus, keeps Tab inside and closes on Escape. */
export function Dialog({ title, onClose, children, className = '' }: { title: string; onClose: () => void; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  // Remember the opener now: once the page behind turns inert, focus has already left it.
  const [opener] = useState(() => document.activeElement as HTMLElement | null)
  useEffect(() => {
    const back = opener
    ref.current?.querySelector<HTMLElement>('button, [href], input')?.focus()
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
      if (e.key !== 'Tab' || !ref.current) return
      const f = [...ref.current.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input')]
      if (!f.length) return
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault()
        f.at(-1)!.focus()
      } else if (!e.shiftKey && document.activeElement === f.at(-1)) {
        e.preventDefault()
        f[0].focus()
      }
    }
    addEventListener('keydown', key)
    return () => {
      removeEventListener('keydown', key)
      // After the page behind stops being inert.
      requestAnimationFrame(() => back?.focus?.())
    }
  }, [])
  return (
    <div className="modal-back" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <section ref={ref} className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-title">
          <h2>{title}</h2>
          <button className="close" onClick={onClose} aria-label={t('close')}>
            ✕
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

export function PhotoCard({ id, big, onOpen }: { id: string; big?: boolean; onOpen?: () => void }) {
  const p = photoById(id)
  if (!p) return null
  const title = photoTitle(p.id, getLang(), p.title)
  const img = <img src={p.file} alt={title} loading="lazy" />
  return (
    <figure className={big ? 'photo big' : 'photo'}>
      {onOpen ? (
        <button className="photo-open" onClick={onOpen}>
          {img}
        </button>
      ) : (
        img
      )}
      <figcaption>
        {title}
        <small>
          {p.credit} · {p.nasaId}
        </small>
      </figcaption>
    </figure>
  )
}

/** Where each photo comes from: an expedition or a lucky event, in each world. */
function photoSources(lang: ReturnType<typeof getLang>) {
  const out: Record<string, { world: Content['id']; how: string; text: string }> = {}
  for (const id of ['mars', 'moon'] as const) {
    const w = getWorld(id, lang)
    for (const p of w.projects) if (p.photo) out[p.photo] = { world: id, how: `${p.icon} ${p.label}`, text: p.text }
    for (const e of w.events) if (e.photo) out[e.photo] = { world: id, how: `🍀 ${t('luckySol')}`, text: e.text }
  }
  return out
}

export function Journal() {
  const journal = useGame((s) => s.profile.journal)
  const close = useGame((s) => s.openModal)
  const [open, setOpen] = useState<string | null>(null)
  const lang = getLang()
  const from = photoSources(lang)
  const got = photos.filter((p) => journal.includes(p.id)).length
  if (open) {
    return (
      <Dialog title={`📔 ${t('journal')}`} onClose={() => setOpen(null)} className="wide">
        <PhotoCard id={open} big />
        {from[open] && <p className="photo-story">{from[open].text}</p>}
        <button className="small" onClick={() => setOpen(null)}>
          {lang === 'ar' ? '→' : '←'} {t('allPhotos')}
        </button>
      </Dialog>
    )
  }
  return (
    <Dialog title={`📔 ${t('journal')}`} onClose={() => close(null)} className="wide">
      <div className="journal-count">
        <span>{t('journalCount', { n: got, total: photos.length })}</span>
        <span className="journal-bar" aria-hidden>
          <i style={{ width: `${(100 * got) / photos.length}%` }} />
        </span>
      </div>
      {!got && <p className="muted">{t('journalEmpty')}</p>}
      {(['mars', 'moon'] as const).map((world) => (
        <section key={world} className="journal-world">
          <h3>{world === 'mars' ? `🔴 ${t('worldMarsName')}` : `🌙 ${t('worldMoonName')}`}</h3>
          <div className="photo-grid">
            {photos
              .filter((p) => (from[p.id]?.world ?? 'mars') === world)
              .map((p) =>
                journal.includes(p.id) ? (
                  <PhotoCard key={p.id} id={p.id} onOpen={() => setOpen(p.id)} />
                ) : (
                  <figure key={p.id} className="photo locked">
                    <img src={p.file} alt="" loading="lazy" />
                    <span className="lock" aria-hidden>
                      🔒
                    </span>
                    <figcaption>{from[p.id]?.how ?? '?'}</figcaption>
                  </figure>
                ),
              )}
          </div>
        </section>
      ))}
    </Dialog>
  )
}

export function BadgeGrid({ highlight = [], only = false }: { highlight?: string[]; only?: boolean }) {
  const have = useGame((s) => s.profile.badges)
  return (
    <ul className="badge-grid">
      {[...badges.map((b) => ({ id: b.id, icon: b.icon })), { id: 'teamwork', icon: '🤝' }].filter((b) => !only || highlight.includes(b.id)).map((b) => {
        const got = have.includes(b.id)
        return (
          <li key={b.id} className={`badge ${got ? 'got' : ''} ${highlight.includes(b.id) ? 'new' : ''}`}>
            <span className="badge-icon" aria-hidden>
              {got ? b.icon : '🔒'}
            </span>
            <strong>{tk(`badge_${b.id}`)}</strong>
            <small>{tk(`badge_${b.id}_how`)}</small>
          </li>
        )
      })}
    </ul>
  )
}

export function Badges() {
  const close = useGame((s) => s.openModal)
  return (
    <Dialog title={`🏅 ${t('badges')}`} onClose={() => close(null)} className="wide">
      <BadgeGrid />
    </Dialog>
  )
}
