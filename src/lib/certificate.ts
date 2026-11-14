/** Draws a certificate as a PNG and downloads it. The name stays on the picture only. */
export function downloadCertificate(o: { title: string; name: string; body: string; stars: number; date: string; rtl: boolean }) {
  const c = document.createElement('canvas')
  c.width = 1600
  c.height = 1131
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 1600, 1131)
  grad.addColorStop(0, '#2a120a')
  grad.addColorStop(1, '#6b200b')
  g.fillStyle = grad
  g.fillRect(0, 0, 1600, 1131)
  for (let i = 0; i < 160; i++) {
    g.fillStyle = `rgba(255,255,255,${Math.random() * 0.6})`
    g.fillRect(Math.random() * 1600, Math.random() * 700, 2, 2)
  }
  g.fillStyle = '#c1440e'
  g.beginPath()
  g.arc(800, 1500, 760, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = '#ffb36b'
  g.lineWidth = 8
  g.strokeRect(40, 40, 1520, 1051)
  g.textAlign = 'center'
  g.direction = o.rtl ? 'rtl' : 'ltr'
  g.fillStyle = '#fbefe6'
  g.font = 'bold 76px Nunito, "Segoe UI", system-ui, sans-serif'
  g.fillText(o.title, 800, 220)
  g.font = '64px system-ui'
  g.fillText('🚀  🔴  🛰️', 800, 330)
  g.font = 'bold 96px Nunito, "Segoe UI", system-ui, sans-serif'
  g.fillStyle = '#ffd166'
  g.fillText(o.name || '⭐', 800, 500)
  g.fillStyle = '#fbefe6'
  g.font = '52px Nunito, "Segoe UI", system-ui, sans-serif'
  g.fillText(o.body, 800, 600)
  g.font = '110px system-ui'
  g.fillStyle = '#ffd166'
  g.fillText('★'.repeat(o.stars) + '☆'.repeat(3 - o.stars), 800, 760)
  g.font = '38px Nunito, "Segoe UI", system-ui, sans-serif'
  g.fillStyle = '#fbefe6'
  g.fillText(`SolSurvivor · ${o.date}`, 800, 1010)
  const a = document.createElement('a')
  a.href = c.toDataURL('image/png')
  a.download = 'solsurvivor-certificate.png'
  a.click()
}
