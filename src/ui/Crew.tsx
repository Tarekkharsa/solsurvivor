import { crew, morningLine } from '../content/crew'
import { isRtl, tk } from '../i18n'
import { useGame } from '../state/store'

/** The morning message, said by the crew member it matters to. */
export function Morning() {
  const content = useGame((s) => s.content)
  const game = useGame((s) => s.game)
  const line = morningLine(game, content)
  const who = crew.find((c) => c.id === line.who)!
  return (
    <section className={`morning ${line.mood}`} aria-live="polite" style={{ ['--who' as string]: who.color }}>
      <span className="face" aria-hidden>
        {who.face}
      </span>
      <div>
        <strong className="who">
          {isRtl() ? who.nameAr : who.name} <span className="role">· {tk(`role_${who.id}`)}</span>
        </strong>
        <p className="line">{tk(line.key, line.vars)}</p>
      </div>
    </section>
  )
}
