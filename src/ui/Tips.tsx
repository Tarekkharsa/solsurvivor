import { projectStatus } from '../sim/engine'
import { t, tk } from '../i18n'
import { useGame } from '../state/store'
import { load, save } from '../lib/save'
import { useState } from 'react'

/** One short tip at the right moment, once per browser: expeditions after sol 1, builds when affordable. */
export function Tips() {
  const game = useGame((s) => s.game)
  const content = useGame((s) => s.content)
  const plan = useGame((s) => s.plan)
  const screen = useGame((s) => s.screen)
  const coach = useGame((s) => s.coach)
  const open = useGame((s) => s.openModal)
  const [seen, setSeen] = useState<string[]>(() => load<{ ids: string[] }>('tips', { ids: [] }).ids)
  if (screen !== 'play' || coach !== null) return null
  const roverFree = !game.active.some((a) => content.projects.find((p) => p.id === a.id)?.kind === 'expedition') && !plan.start
  const canBuild = content.projects.some((p) => p.kind === 'upgrade' && projectStatus(p, game, content) === 'ready')
  const tips = [
    { id: 'explore', when: game.turn >= 2 && roverFree && game.done.length === 0, modal: 'explore' as const },
    { id: 'build', when: canBuild && !plan.start && game.turn >= 3, modal: 'build' as const },
    { id: 'radio', when: game.turn >= 2 && !game.history.at(-1)?.plan.units[content.forecastAction], modal: null },
  ]
  const tip = tips.find((x) => x.when && !seen.includes(x.id))
  if (!tip) return null
  const dismiss = () => {
    const ids = [...seen, tip.id]
    setSeen(ids)
    save('tips', { ids })
  }
  return (
    <div className="tip" role="status">
      <span aria-hidden>💡</span>
      <p>{tk(`tip_${tip.id}`)}</p>
      {tip.modal && (
        <button
          className="small"
          onClick={() => {
            dismiss()
            open(tip.modal)
          }}
        >
          {tk(`tipGo_${tip.id}`)}
        </button>
      )}
      <button className="small ghost" onClick={dismiss}>
        {t('gotIt')}
      </button>
    </div>
  )
}
