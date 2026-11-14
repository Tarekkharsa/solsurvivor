import { useState } from 'react'
import { parseCode, codeOf } from '../lib/missionCode'
import { t, tk } from '../i18n'
import { useGame } from '../state/store'
import { Dialog } from './Collections'

export function CodeEntry() {
  const start = useGame((s) => s.start)
  const close = useGame((s) => s.openModal)
  const [code, setCode] = useState('')
  const [bad, setBad] = useState(false)
  const go = (e: React.FormEvent) => {
    e.preventDefault()
    const m = parseCode(code)
    if (!m) return setBad(true)
    start(m.world, m.level, m.seed, { classMission: true })
  }
  return (
    <Dialog title={`🏫 ${t('classMission')}`} onClose={() => close(null)}>
      <form onSubmit={go} className="code-form">
        <label>
          {t('enterCode')}
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setBad(false)
            }}
            placeholder={t('codeHint')}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            dir="ltr"
            aria-invalid={bad}
            aria-describedby={bad ? 'code-bad' : undefined}
          />
        </label>
        {bad && (
          <p id="code-bad" className="end-warn" role="alert">
            {t('codeBad')}
          </p>
        )}
        <button className="primary big" type="submit">
          {t('go')} 🚀
        </button>
      </form>
    </Dialog>
  )
}

/** Discussion prompts for after a class mission, built from what actually hit the base. */
export function Discussion() {
  const game = useGame((s) => s.game)
  const content = useGame((s) => s.content)
  const classMission = useGame((s) => s.classMission)
  if (!classMission) return null
  const when = (turn: number) => t('sol', { n: turn })
  const prompts: string[] = []
  const storms = game.history.filter((h) => content.events.find((e) => e.id === h.event)?.kind === 'solar')
  if (storms.length) prompts.push(tk('discussStorm', { when: when(storms[0].turn) }))
  if (storms.some((h) => !h.warned)) prompts.push(tk('discussSurprise'))
  const dust = game.history.find((h) => content.events.find((e) => e.id === h.event)?.kind === 'dust')
  if (dust) prompts.push(tk('discussDust', { title: content.events.find((e) => e.id === dust.event)!.title }))
  const calm = game.history.find((h) => !h.event && h.turn > 1)
  if (calm) prompts.push(tk('discussCalm', { when: when(calm.turn) }))
  prompts.push(tk('discussScience'))
  return (
    <section className="discuss">
      <h3>
        💬 {t('discuss')} · <bdi dir="ltr">{codeOf({ world: content.id, level: game.level, seed: game.seed })}</bdi>
      </h3>
      <ol>
        {prompts.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ol>
    </section>
  )
}
