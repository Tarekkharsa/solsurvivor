import { useMemo, useState } from 'react'
import { getWorld } from '../content'
import { pickMission } from '../content/goodMission'
import { teacherText } from '../content/teachers'
import { getLang, t } from '../i18n'
import { codeOf, type Mission } from '../lib/missionCode'
import { createGame } from '../sim/engine'
import type { Content, LevelId } from '../sim/types'
import { useGame } from '../state/store'

/** What hits the base on each turn of a mission, for the teacher. */
function missionKey(m: Mission) {
  const content = getWorld(m.world, getLang())
  const game = createGame(content, m.level, m.seed)
  return game.schedule.slice(1).map((id, i) => ({ turn: i + 1, event: content.events.find((e) => e.id === id) }))
}

export function Teachers() {
  const setScreen = useGame((s) => s.setScreen)
  const tx = teacherText[getLang()]
  const [world, setWorld] = useState<Content['id']>('mars')
  const [level, setLevel] = useState<LevelId>('cadet')
  const [mission, setMission] = useState<Mission>(() => pickMission('mars', 'cadet'))
  const [print, setPrint] = useState<'key' | 'log' | null>(null)
  const key = useMemo(() => missionKey(mission), [mission])
  const code = codeOf(mission)

  const make = (w = world, l = level) => setMission(pickMission(w, l))
  const doPrint = (what: 'key' | 'log') => {
    setPrint(what)
    setTimeout(() => {
      window.print()
      setPrint(null)
    }, 50)
  }

  return (
    <main className={`teachers ${print ? `printing-${print}` : ''}`}>
      <div className="teachers-inner">
        <button className="link no-print" onClick={() => setScreen('title')}>
          {tx.back}
        </button>
        <h1 className="no-print">🧑‍🏫 {tx.title}</h1>
        <p className="lead no-print">{tx.intro}</p>

        <section className="card maker">
          <h2>🏫 {tx.makerTitle}</h2>
          <p className="muted no-print">{tx.makerHow}</p>
          <div className="maker-row no-print">
            <div className="seg" role="radiogroup" aria-label={tx.world}>
              {(['mars', 'moon'] as const).map((w) => (
                <button key={w} role="radio" aria-checked={world === w} className={world === w ? 'on' : ''} onClick={() => (setWorld(w), make(w, level))}>
                  {t(w === 'mars' ? 'worldMarsName' : 'worldMoonName')}
                </button>
              ))}
            </div>
            <div className="seg" role="radiogroup" aria-label={tx.level}>
              {(['cadet', 'commander'] as const).map((l) => (
                <button key={l} role="radio" aria-checked={level === l} className={level === l ? 'on' : ''} onClick={() => (setLevel(l), make(world, l))}>
                  {t(l)}
                </button>
              ))}
            </div>
            <button onClick={() => make()}>🎲 {tx.newCode}</button>
          </div>
          <p className="big-code" aria-label={tx.code}>
            <bdi dir="ltr">{code}</bdi>
          </p>
          <div className="key-block">
            <h3>🔑 {tx.keyTitle}</h3>
            <p className="muted">{tx.keyHow}</p>
            <table className="key">
              <thead>
                <tr>
                  <th>{tx.turn}</th>
                  <th>{tx.event}</th>
                  <th>{tx.warning}</th>
                </tr>
              </thead>
              <tbody>
                {key.map(({ turn, event }) => (
                  <tr key={turn} className={event?.kind ?? 'calm'}>
                    <td>{turn}</td>
                    <td>{event ? `${event.icon} ${event.title}` : `· ${tx.calm}`}</td>
                    <td>{event ? (event.forecastable ? tx.warnYes : tx.warnNo) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="maker-row no-print">
            <button onClick={() => doPrint('key')}>🖨️ {tx.printKey}</button>
            <button onClick={() => doPrint('log')}>🖨️ {tx.printLog}</button>
          </div>
        </section>

        <section className="log-sheet">
          {[0, 1].map((copy) => (
            <div key={copy} className="log-copy">
              <h2>
                📓 {tx.logTitle} · <bdi dir="ltr">{code}</bdi>
              </h2>
              <p>{tx.logHow}</p>
              <table className="key log">
                <thead>
                  <tr>
                    {tx.logCols.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {key.map(({ turn }) => (
                    <tr key={turn}>
                      <td>{turn}</td>
                      {tx.logCols.slice(1).map((c) => (
                        <td key={c} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>

        <div className="teacher-grid no-print">
          <section className="card">
            <h2>🎯 {tx.goalsTitle}</h2>
            <ul>
              {tx.goals.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </section>
          <section className="card">
            <h2>⏱️ {tx.lessonTitle}</h2>
            <ol className="lesson">
              {tx.lesson.map(([time, step]) => (
                <li key={step}>
                  <b>{time}</b> {step}
                </li>
              ))}
            </ol>
          </section>
          <section className="card">
            <h2>💬 {tx.questionsTitle}</h2>
            <ol>
              {tx.questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </section>
          <section className="card">
            <h2>🛰️ {tx.dataTitle}</h2>
            <dl className="data">
              {tx.data.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
        <p className="muted privacy no-print">🔒 {tx.privacy}</p>
      </div>
    </main>
  )
}
