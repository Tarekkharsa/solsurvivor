import { useEffect, useRef, useState } from 'react'
import { badges } from '../content/badges'
import { photoById, photos } from '../content/photos'
import { photoTitle } from '../content'
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

export function PhotoCard({ id, big }: { id: string; big?: boolean }) {
  const p = photoById(id)
  if (!p) return null
  const title = photoTitle(p.id, getLang(), p.title)
  return (
    <figure className={big ? 'photo big' : 'photo'}>
      <img src={p.file} alt={title} loading="lazy" />
      <figcaption>
        {title}
        <small>
          {p.credit} · {p.nasaId}
        </small>
      </figcaption>
    </figure>
  )
}

export function Journal() {
  const journal = useGame((s) => s.profile.journal)
  const close = useGame((s) => s.openModal)
  return (
    <Dialog title={`📔 ${t('journal')}`} onClose={() => close(null)} className="wide">
      {!journal.length && <p className="muted">{t('journalEmpty')}</p>}
      <div className="photo-grid">
        {photos.map((p) =>
          journal.includes(p.id) ? (
            <PhotoCard key={p.id} id={p.id} />
          ) : (
            <div key={p.id} className="photo locked" aria-hidden>
              ?
            </div>
          ),
        )}
      </div>
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
