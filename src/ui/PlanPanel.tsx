import { count, fmt, isRtl, t } from '../i18n'
import { planCost, powerFor } from '../sim/engine'
import type { Effects } from '../sim/types'
import { useGame, usePreview } from '../state/store'
import { Projects } from './Projects'

export function EffectChips({ effects }: { effects: Effects }) {
  const content = useGame((s) => s.content)
  return (
    <>
      {Object.entries(effects).map(([id, v = 0]) => {
        const r = content.resources.find((x) => x.id === id)
        if (!r || !v) return null
        const good = r.invert ? v < 0 : v > 0
        return (
          <span key={id} className={good ? 'chip good' : 'chip bad'}>
            {r.icon}{' '}
            <bdi dir="ltr">
              {v > 0 ? '+' : '−'}
              {fmt(Math.abs(v))}
            </bdi>
          </span>
        )
      })}
    </>
  )
}

export function PlanPanel() {
  const content = useGame((s) => s.content)
  const game = useGame((s) => s.game)
  const plan = useGame((s) => s.plan)
  const plans = useGame((s) => s.plans)
  const setUnits = useGame((s) => s.setUnits)
  const endTurn = useGame((s) => s.endTurn)
  const repeatPlan = useGame((s) => s.repeatPlan)
  const preview = usePreview()

  const total = powerFor(game, content)
  const used = planCost(plan, game, content)
  const left = total - used
  const level = content.levels[game.level]
  const failing = content.resources.find((r) => r.id === preview?.game.lostOn)
  const low = failing
    ? undefined
    : content.resources.find((r) => {
        if (!r.critical || !preview) return false
        const next = preview.game.resources[r.id] ?? 0
        const now = game.resources[r.id] ?? 0
        const frac = (next - r.min) / (r.max - r.min)
        return r.invert ? frac > 0.7 && next > now : frac < 0.3 && next < now
      })
  const cheapest = Math.min(...content.actions.map((a) => a.cost))
  const empty = !Object.values(plan.units).some(Boolean) && !plan.start
  const last = plans.at(-1)
  const canRepeat = empty && !!last && Object.values(last.units).some(Boolean)
  const radio = content.actions.find((a) => a.id === content.forecastAction)!
  const deaf = !failing && !low && !empty && game.turn > 1 && game.turn < level.turns && !plan.units[radio.id] && left <= radio.cost
  const unspent = !failing && !low && game.turn > 1 && left === total && total > 0 && !canRepeat
  const ready = !failing && !low && !deaf && left < cheapest
  const mods = game.powerMods.filter((m) => m.turn === game.turn)

  return (
    <section className="dock" id="plan" aria-label={t('endTurn')}>
      <div className="dock-top">
        <div className="power">
          <strong>⚡ {t('power')}</strong>
          <span className="cells" aria-hidden>
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={i < used ? 'cell used' : 'cell'} />
            ))}
          </span>
          <span className="power-left">{t('powerLeft', { n: left, total })}</span>
          {mods.map((m, i) => {
            const e = content.events.find((x) => x.id === m.source)
            return (
              <span key={i} className={m.delta < 0 ? 'chip bad' : 'chip good'}>
                {e?.icon} <bdi dir="ltr">{m.delta > 0 ? `+${m.delta}` : `−${-m.delta}`}</bdi> ⚡
              </span>
            )
          })}
        </div>
        <div className="end-wrap">
          {failing && (
            <span className="end-warn" role="alert">
              ⚠️ {t(failing.invert ? 'willBeTooHigh' : 'willRunOut', { icon: failing.icon, label: failing.label })}
            </span>
          )}
          {low && (
            <span className="end-warn amber" role="status">
              {t(low.invert ? 'endHigh' : 'endLow', { icon: low.icon, label: low.label })}
            </span>
          )}
          {unspent && (
            <span className="end-warn amber" role="status">
              {t('endUnspent')}
            </span>
          )}
          {deaf && (
            <span className="end-warn amber" role="status">
              {t('endNoRadio', { icon: radio.icon })}
            </span>
          )}
          {ready && (
            <span className="end-ready" role="status">
              {t('planReady')}
            </span>
          )}
          {canRepeat && (
            <button className="repeat" onClick={repeatPlan}>
              ↻ {t('repeatPlan')}
            </button>
          )}
          <button className={failing ? 'primary end danger' : ready ? 'primary end ready' : 'primary end'} onClick={endTurn} data-coach="end">
            {t('endTurn')} {isRtl() ? '←' : '→'}
          </button>
        </div>
      </div>
      <ul className="actions">
        {content.actions.map((a) => {
          const units = plan.units[a.id] ?? 0
          return (
            <li key={a.id} className={units ? 'action on' : 'action'} data-units={units} data-coach={a.id}>
              <span className={units ? 'action-icon pop' : 'action-icon'} aria-hidden key={units}>
                {a.icon}
              </span>
              <div className="action-main">
                <div className="action-head">
                  <strong>{a.label}</strong>
                  <span className="cost" title={t('powerPerTap')}>
                    {a.cost}⚡
                  </span>
                </div>
                <p className="action-explain">{a.explain}</p>
                <p className="action-effects">
                  <EffectChips effects={a.perUnit} />
                  {a.delayed && (
                    <span className="later">
                      {t('inTurns', { count: count(a.delayed.turns, undefined, true) })}: <EffectChips effects={a.delayed.perUnit} />
                    </span>
                  )}
                </p>
              </div>
              <div className="stepper">
                <button onClick={() => setUnits(a.id, units - 1)} disabled={units === 0} aria-label={t('less', { label: a.label })}>
                  −
                </button>
                <output aria-live="polite" key={units} className="bump">
                  {units}
                </output>
                <button onClick={() => setUnits(a.id, units + 1)} disabled={units >= a.maxUnits || left < a.cost} aria-label={t('more', { label: a.label })}>
                  +
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      <Projects />
    </section>
  )
}
