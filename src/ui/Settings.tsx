import { t, tk } from '../i18n'
import { useGame } from '../state/store'
import { Dialog } from './Collections'

const rows: { key: 'sound' | 'music' | 'readAloud' | 'contrast'; label: Parameters<typeof t>[0]; how?: Parameters<typeof t>[0]; icon: string }[] = [
  { key: 'sound', label: 'setSound', icon: '🔊' },
  { key: 'music', label: 'setMusic', icon: '🎵' },
  { key: 'readAloud', label: 'setRead', how: 'setReadHow', icon: '🗣️' },
  { key: 'contrast', label: 'setContrast', icon: '🌓' },
]

export function Settings() {
  const settings = useGame((s) => s.settings)
  const set = useGame((s) => s.setSetting)
  const close = useGame((s) => s.openModal)
  return (
    <Dialog title={`⚙️ ${t('settings')}`} onClose={() => close(null)}>
      <ul className="settings">
        {rows.map((r) => (
          <li key={r.key}>
            <span aria-hidden>{r.icon}</span>
            <div>
              <strong id={`set-${r.key}`}>{t(r.label)}</strong>
              {r.how && <small>{t(r.how)}</small>}
            </div>
            <button role="switch" aria-checked={settings[r.key]} aria-labelledby={`set-${r.key}`} className={settings[r.key] ? 'switch on' : 'switch'} onClick={() => set(r.key, !settings[r.key])}>
              <span />
            </button>
          </li>
        ))}
        <li>
          <span aria-hidden>🖥️</span>
          <div>
            <strong id="set-gfx">{t('setGraphics')}</strong>
            <small>{t('setGraphicsHow')}</small>
            <div className="seg" role="radiogroup" aria-labelledby="set-gfx">
              {(['auto', '3d', 'simple'] as const).map((g) => (
                <button key={g} role="radio" aria-checked={settings.graphics === g} className={settings.graphics === g ? 'on' : ''} onClick={() => set('graphics', g)}>
                  {tk(`gfx_${g}`)}
                </button>
              ))}
            </div>
          </div>
        </li>
      </ul>
    </Dialog>
  )
}
