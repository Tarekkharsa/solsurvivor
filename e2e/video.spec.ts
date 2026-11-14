import { chromium, expect, test, type Page } from '@playwright/test'
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { mars } from '../src/content/mars'
import { strategies } from '../src/content/strategies'
import { createGame, playTurn, stars, warning } from '../src/sim/engine'
import { rng } from '../src/sim/random'

/**
 * Records the demo video by playing a real mission in the browser:
 *   VIDEO=/path/demo.mp4 [VIDEO_LANG=ar] npx playwright test video --project=desktop
 * Writes demo.mp4 (about 30 s, captioned, with generated music).
 */
const OUT = process.env.VIDEO
const LANG = process.env.VIDEO_LANG === 'ar' ? 'ar' : 'en'
const SEED = 1004
const W = 1920
const H = 1080

type Mark = 'title' | 'intro' | 'plan' | 'preview' | 'lapse' | 'warn' | 'storm' | 'photo' | 'win' | 'moon' | 'end'

const captions: Record<'en' | 'ar', Record<Mark, string>> = {
  en: {
    title: 'SolSurvivor: keep a Mars base alive with real NASA data',
    intro: 'A real NASA globe, down to Jezero Crater',
    plan: 'Share out the power: air, food, shelter, science, radio',
    preview: 'Every meter shows where it will be tonight',
    lapse: 'Then watch the sol play out',
    warn: 'Radio on: Earth warns of a real solar storm',
    storm: 'Shelter up! A real solar storm hits tonight',
    photo: 'Expeditions unlock real NASA photos',
    win: 'Keep the crew safe, earn stars and badges',
    moon: 'Then try the Moon’s south pole',
    end: 'Ages 7–12 · English and Arabic · works offline · no sign-in',
  },
  ar: {
    title: 'SolSurvivor: حافظ على قاعدة على المريخ ببيانات حقيقية من ناسا',
    intro: 'كرة حقيقية من ناسا، نزولًا إلى فوهة جيزيرو',
    plan: 'وزّع الطاقة: هواء، طعام، ملجأ، علم، راديو',
    preview: 'كل مقياس يُريك أين سيكون الليلة',
    lapse: 'ثم شاهد السول يمرّ',
    warn: 'الراديو شغّال: الأرض تحذّر من عاصفة شمسية حقيقية',
    storm: 'إلى الملجأ! عاصفة شمسية حقيقية تضرب الليلة',
    photo: 'الرحلات تفتح صورًا حقيقية من ناسا',
    win: 'حافظ على الطاقم، واكسب النجوم والأوسمة',
    moon: 'ثم جرّب القطب الجنوبي للقمر',
    end: 'من 7 إلى 12 سنة · عربي وإنجليزي · يعمل دون اتصال · بلا تسجيل',
  },
}

/** [mark, seconds after the mark to start, length in seconds] */
const CUT: [Mark, number, number][] = [
  ['title', 0.6, 2.6],
  ['intro', 3.2, 3.2],
  ['plan', 0.2, 3.0],
  ['preview', 0.0, 2.4],
  ['lapse', 1.4, 3.0],
  ['warn', 0.3, 2.6],
  ['storm', 4.0, 3.0],
  ['photo', 0.4, 2.6],
  ['win', 0.8, 3.0],
  ['moon', 2.0, 2.6],
  ['end', 0.3, 2.2],
]

const ff = (args: string[]) => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { stdio: 'inherit' })

async function captionPng(page: Page, text: string, file: string) {
  await page.setViewportSize({ width: W, height: 220 })
  await page.setContent(`<!doctype html><html lang="${LANG}" dir="${LANG === 'ar' ? 'rtl' : 'ltr'}"><head>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@700&family=Nunito:wght@800&display=swap" rel="stylesheet">
    <style>html,body{margin:0;background:transparent}div{position:absolute;left:50%;bottom:40px;transform:translateX(-50%);
    max-width:1600px;padding:22px 44px;border-radius:999px;background:rgba(14,7,4,.82);color:#fff;font:800 50px/1.25 ${LANG === 'ar' ? 'Cairo' : 'Nunito'},sans-serif;
    text-align:center;white-space:nowrap;box-shadow:0 10px 40px rgba(0,0,0,.5);border:2px solid rgba(255,179,107,.6)}</style></head>
    <body><div>${text}</div></body></html>`)
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  await page.screenshot({ path: file, omitBackground: true })
}

test('record the demo video', async ({}, info) => {
  test.skip(!OUT || info.project.name !== 'desktop', 'set VIDEO=/path/demo.mp4 to record')
  test.setTimeout(8 * 60_000)
  const work = join(dirname(OUT!), `.video-${LANG}`)
  rmSync(work, { recursive: true, force: true })
  mkdirSync(work, { recursive: true })

  // A real 1.5x screen: the page lays out like 1280×720 and records sharp at 1080p.
  const browser = await chromium.launch({ channel: 'chrome', args: ['--force-device-scale-factor=1.5', '--window-size=1280,807'] })
  const context = await browser.newContext({
    viewport: null,
    deviceScaleFactor: undefined,
    isMobile: undefined,
    hasTouch: undefined,
    recordVideo: { dir: work, size: { width: W, height: H } },
    baseURL: 'http://localhost:5190',
  })
  await context.addInitScript(() => {
    try {
      localStorage.setItem('solsurvivor.settings', JSON.stringify({ graphics: '3d', music: false, sound: false }))
    } catch {
      // ignore
    }
  })
  const page = await context.newPage()
  const t0 = Date.now()
  const marks: Partial<Record<Mark, number>> = {}
  const mark = async (m: Mark) => {
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
    marks[m] ??= (Date.now() - t0) / 1000
  }
  const more = (label: string) => page.locator(`[data-coach="${label}"] .stepper button`).last()

  await page.goto(`/?lang=${LANG}&3d=1&intro=1&world=mars&level=cadet&seed=${SEED}`)
  await page.locator('.live').waitFor({ timeout: 12000 }).catch(() => {})
  await page.waitForTimeout(800)
  await mark('title')
  await page.waitForTimeout(3200)
  await page.locator('.title-card > button.primary').click()
  await mark('intro')
  await expect(page.locator('.intro')).toHaveCount(0, { timeout: 15000 })
  await page.locator('.coach-bubble button').click()
  await page.locator('.stage canvas').waitFor()
  await page.waitForTimeout(1200)

  let game = createGame(mars, 'cadet', SEED)
  const rand = rng(1)
  while (game.status === 'playing') {
    const plan = strategies.careful(game, mars, rand)
    // Stop early if the screen and the engine ever disagree.
    await expect(page.locator('.topbar .sol')).toHaveText(new RegExp(`\\b${game.turn}\\b`), { timeout: 15000 })
    await expect(page.locator('.meter').first()).toHaveAttribute('aria-valuenow', String(game.resources.air))
    const warned = !!warning(game, mars)?.storm
    if (game.turn === 1) await mark('plan')
    if (warned) {
      await page.locator('.morning').scrollIntoViewIfNeeded()
      await mark('warn')
      await page.waitForTimeout(1600)
    }
    for (const a of mars.actions) {
      for (let i = 0; i < (plan.units[a.id] ?? 0); i++) {
        await more(a.id).click()
        await page.waitForTimeout(game.turn === 1 || warned ? 260 : 60)
      }
    }
    if (game.turn === 1) {
      // Show the meters with their striped previews.
      await page.evaluate(() => scrollTo({ top: 0 }))
      await page.waitForTimeout(300)
      await mark('preview')
      await page.waitForTimeout(2600)
    }
    if (plan.start) {
      const kind = mars.projects.find((p) => p.id === plan.start)!.kind
      await page.locator('.slot').nth(kind === 'upgrade' ? 1 : 0).click()
      await page.locator(`.projects-dialog [data-project="${plan.start}"] button`).click()
      if (game.turn === 1) await page.waitForTimeout(1200)
      await page.keyboard.press('Escape')
    }
    await page.locator('[data-coach="end"]').click()
    const next = playTurn(game, mars, plan).game
    const hit = mars.events.find((e) => e.id === next.history.at(-1)!.event)
    if (game.turn === 1) await mark('lapse')
    if (hit?.kind === 'solar' && warned) await mark('storm')
    const slow = game.turn === 1 || (hit?.kind === 'solar' && warned)
    if (!slow) await page.waitForTimeout(400).then(() => page.locator('.lapse-bar button').click().catch(() => {}))
    await page.getByRole('dialog').first().waitFor({ timeout: 15000 })
    if (next.history.at(-1)!.finished.some((id) => mars.projects.find((p) => p.id === id)?.photo)) {
      await page.locator('.report .photo img').first().scrollIntoViewIfNeeded()
      await mark('photo')
      await page.waitForTimeout(2600)
    }
    game = next
    await page.locator('.report button.primary').click()
  }
  expect(stars(game, mars)).toBe(3)
  await mark('win')
  await page.waitForTimeout(3600)
  await page.locator('.end .end-buttons button.link').click()
  await page.locator('.worlds button').nth(1).click()
  await page.locator('.title-card > button.primary').click()
  await mark('moon')
  await page.waitForTimeout(5000)
  await page.goto(`/?lang=${LANG}&3d=1&intro=0`)
  await page.waitForTimeout(600)
  await mark('end')
  await page.waitForTimeout(2600)
  const video = page.video()!
  await context.close()
  const raw = await video.path()
  console.log('marks', JSON.stringify(marks))

  // Captions, rendered by the browser so Arabic is shaped correctly.
  const capPage = await browser.newPage()
  for (const [m] of CUT) await captionPng(capPage, captions[LANG][m], join(work, `cap-${m}.png`))

  // Music: the game's own chords, rendered offline; tense for the storm, bells for the win.
  const total = CUT.reduce((s, c) => s + c[2], 0)
  const stormAt = CUT.slice(0, CUT.findIndex((c) => c[0] === 'warn')).reduce((s, c) => s + c[2], 0)
  const winAt = CUT.slice(0, CUT.findIndex((c) => c[0] === 'win')).reduce((s, c) => s + c[2], 0)
  const wav = await capPage.evaluate(
    async ({ total, stormAt, winAt }) => {
      const rate = 44100
      const ctx = new OfflineAudioContext(2, Math.ceil(total * rate), rate)
      const master = ctx.createGain()
      master.gain.value = 0.5
      master.connect(ctx.destination)
      const tone = (f: number, at: number, d: number, type: OscillatorType, g: number) => {
        const o = ctx.createOscillator()
        const v = ctx.createGain()
        o.type = type
        o.frequency.value = f
        v.gain.setValueAtTime(0, at)
        v.gain.linearRampToValueAtTime(g, at + Math.min(0.4, d / 4))
        v.gain.exponentialRampToValueAtTime(0.0001, at + d)
        o.connect(v).connect(master)
        o.start(at)
        o.stop(at + d + 0.05)
      }
      const calm = [[220, 277.2, 329.6, 415.3], [196, 246.9, 293.7, 370], [174.6, 220, 261.6, 329.6], [196, 246.9, 293.7, 392]]
      const tense = [[110, 130.8, 164.8, 196], [103.8, 123.5, 155.6, 185]]
      const bells = [659.3, 740, 830.6, 987.8, 1108.7, 1318.5]
      let bar = 0
      for (let t = 0; t < total; t += 2.6) {
        const storm = t >= stormAt && t < stormAt + 5.6
        const chord = storm ? tense[bar % 2] : calm[bar % 4]
        for (const f of chord) tone(f, t, 3.2, 'sine', 0.05)
        if (storm) for (let i = 0; i < 4; i++) tone(55, t + i * 0.65, 0.5, 'sine', 0.16)
        else tone(bells[(bar * 3) % bells.length], t + 0.8, 1.8, 'sine', 0.04)
        bar++
      }
      ;[523, 659, 784, 1047].forEach((f, i) => tone(f, winAt + 0.3 + i * 0.16, 1.2, 'triangle', 0.12))
      const buf = await ctx.startRendering()
      const n = buf.length
      const out = new DataView(new ArrayBuffer(44 + n * 4))
      const s = (o: number, str: string) => [...str].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)))
      s(0, 'RIFF'); out.setUint32(4, 36 + n * 4, true); s(8, 'WAVEfmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true)
      out.setUint16(22, 2, true); out.setUint32(24, rate, true); out.setUint32(28, rate * 4, true); out.setUint16(32, 4, true); out.setUint16(34, 16, true)
      s(36, 'data'); out.setUint32(40, n * 4, true)
      const l = buf.getChannelData(0)
      const r = buf.getChannelData(1)
      for (let i = 0; i < n; i++) {
        out.setInt16(44 + i * 4, Math.max(-1, Math.min(1, l[i])) * 32767, true)
        out.setInt16(46 + i * 4, Math.max(-1, Math.min(1, r[i])) * 32767, true)
      }
      let bin = ''
      const bytes = new Uint8Array(out.buffer)
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
      return btoa(bin)
    },
    { total, stormAt, winAt },
  )
  writeFileSync(join(work, 'music.wav'), Buffer.from(wav, 'base64'))
  await browser.close()

  // Cut, caption and join.
  const parts: string[] = []
  CUT.forEach(([m, from, len], i) => {
    const at = (marks[m] ?? 0) + from
    const part = join(work, `part-${i}.mp4`)
    ff([
      '-ss', at.toFixed(2), '-t', len.toFixed(2), '-i', raw, '-loop', '1', '-t', len.toFixed(2), '-i', join(work, `cap-${m}.png`),
      '-filter_complex', `[0:v]scale=${W}:${H},fps=30,format=yuv420p[v];[1:v]scale=${W}:-1,format=rgba,fade=in:st=0:d=0.25:alpha=1[c];[v][c]overlay=0:H-h:shortest=1,fade=in:st=0:d=0.2,fade=out:st=${(len - 0.2).toFixed(2)}:d=0.2`,
      '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', part,
    ])
    parts.push(part)
  })
  writeFileSync(join(work, 'list.txt'), parts.map((p) => `file '${p}'`).join('\n'))
  ff(['-f', 'concat', '-safe', '0', '-i', join(work, 'list.txt'), '-i', join(work, 'music.wav'), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-af', `afade=out:st=${(total - 1).toFixed(2)}:d=1`, '-shortest', '-movflags', '+faststart', OUT!])
  if (!process.env.VIDEO_KEEP) rmSync(work, { recursive: true, force: true })
})
