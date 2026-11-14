import { chromium } from '@playwright/test'
const S = process.argv[2]
const URL = 'https://tareks-mac-mini.tailf61287.ts.net/solsurvivor/'
const b = await chromium.launch({ channel: 'chrome' })
for (const [name, vp] of [['desktop', { width: 1280, height: 800 }], ['phone', { width: 412, height: 915, isMobile: true, deviceScaleFactor: 2.6, hasTouch: true }]]) {
  const { width, height, ...rest } = vp
  const ctx = await b.newContext({ viewport: { width, height }, ...rest })
  const p = await ctx.newPage()
  await p.goto(URL + '?live=0&3d=1&intro=1&q=high')
  await p.waitForTimeout(3000)
  await p.screenshot({ path: `${S}/${name}-01-title.png` })
  const start = p.getByRole('button', { name: /start|ابدأ/i }).first()
  await start.click().catch(() => {})
  await p.waitForTimeout(3500)
  await p.screenshot({ path: `${S}/${name}-02-intro.png` })
  await p.waitForTimeout(7000)
  await p.screenshot({ path: `${S}/${name}-03-play.png` })
  await p.screenshot({ path: `${S}/${name}-04-play-full.png`, fullPage: true })
  await ctx.close()
}
await b.close()
