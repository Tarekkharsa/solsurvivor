import { crew, morningLine } from '../content/crew'
import { useEffect } from 'react'
import { getLang, isRtl, t, tk } from '../i18n'
import { speak } from '../lib/audio'
import { useGame } from '../state/store'

/** The morning message, said by the crew member it matters to. */
export function Morning() {
  const content = useGame((s) => s.content)
  const game = useGame((s) => s.game)
  const line = morningLine(game, content)
  const who = crew.find((c) => c.id === line.who)!
  const text = tk(line.key, line.vars)
  const readAloud = useGame((s) => s.settings.readAloud)
  const screen = useGame((s) => s.screen)
  useEffect(() => {
    if (readAloud && screen === 'play') speak(text, getLang())
  }, [text, readAloud, screen])
  return (
    <section className={`morning ${line.mood}`} aria-live="polite" style={{ ['--who' as string]: who.color }}>
      <span className="face" aria-hidden>
        {who.face}
      </span>
      <div>
        <strong className="who">
          {isRtl() ? who.nameAr : who.name} <span className="role">· {tk(`role_${who.id}`)}</span>
        </strong>
        <p className="line">{text}</p>
      </div>
      <button className="icon-btn read" onClick={() => speak(text, getLang())} aria-label={t('readThis')}>
        🔊
      </button>
    </section>
  )
}
