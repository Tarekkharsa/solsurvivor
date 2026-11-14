import { expect, test, type Page } from '@playwright/test'
import { mars } from '../src/content/mars'
import { strategies } from '../src/content/strategies'
import { createGame, playTurn, stars } from '../src/sim/engine'
import { rng } from '../src/sim/random'

const shots = process.env.SHOTS
const SEED = 1004

/** Taps the UI to match an engine plan. */
async function enter(page: Page, units: Record<string, number | undefined>, start?: string) {
  for (const a of mars.actions) {
    for (let i = 0; i < (units[a.id] ?? 0); i++) await page.getByRole('button', { name: `More ${a.label}`, exact: true }).click()
  }
  if (start) await page.locator(`[data-project="${start}"] button`).click()
}

test('the guided first sol points at each step', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Start mission/ }).click()
  await expect(page.getByText('Tip 1 of 4')).toBeVisible()
  await page.getByRole('button', { name: 'More Oxygen maker' }).click()
  await page.getByRole('button', { name: 'More Oxygen maker' }).click()
  await expect(page.getByText('Tip 2 of 4')).toBeVisible()
  await page.getByRole('button', { name: 'More Greenhouse lights' }).click()
  await expect(page.getByText('Tip 3 of 4')).toBeVisible()
  await page.getByRole('button', { name: 'More Talk to Earth' }).click()
  await expect(page.getByText('Tip 4 of 4')).toBeVisible()
  await page.getByRole('button', { name: /End sol/ }).click()
  await page.getByRole('button', { name: 'Next sol' }).click()
  await expect(page.getByText(/Tip \d of 4/)).toHaveCount(0)
})

test('plays a whole mission to three stars, with badges, journal and a resumed save', async ({ page }, info) => {
  await page.goto(`/?world=mars&level=cadet&seed=${SEED}&beat=1`)
  await expect(page.getByText(/A friend challenged you/)).toBeVisible()
  await page.getByRole('button', { name: /Start mission/ }).click()
  await page.getByRole('button', { name: 'Skip tips' }).click()

  let game = createGame(mars, 'cadet', SEED)
  const rand = rng(1)
  while (game.status === 'playing') {
    const plan = strategies.careful(game, mars, rand)
    await enter(page, plan.units, plan.start)
    if (game.turn === 3) {
      // Leave and come back: the mission is saved.
      await page.getByRole('button', { name: 'Leave mission' }).click()
      await page.getByRole('button', { name: /Continue mission \(sol 3\)/ }).click()
      await enter(page, plan.units, plan.start)
    }
    if (shots && game.warned) await page.screenshot({ path: `${shots}/${info.project.name}-warned.png` })
    await page.getByRole('button', { name: /End sol/ }).click()
    game = playTurn(game, mars, plan).game
    await expect(page.getByRole('dialog', { name: `Sol ${game.history.length} report` })).toBeVisible()
    if (shots && game.history.at(-1)!.finished.includes('delta')) await page.screenshot({ path: `${shots}/${info.project.name}-photo.png` })
    await page.getByRole('button', { name: 'Next sol' }).click()
  }
  expect(stars(game, mars)).toBe(3)
  await expect(page.getByRole('heading', { name: /Mission complete/ })).toBeVisible()
  await expect(page.getByText(/You beat your friend/)).toBeVisible()
  await expect(page.getByText('New badge!')).toBeVisible()
  await page.waitForTimeout(1200)
  if (shots) await page.screenshot({ path: `${shots}/${info.project.name}-end.png` })
  await page.getByRole('dialog').getByRole('button', { name: 'Leave mission' }).click()
  await page.getByRole('button', { name: /Science journal/ }).click()
  await expect(page.getByRole('dialog', { name: /Science journal/ }).locator('img').first()).toBeVisible()
  if (shots) await page.screenshot({ path: `${shots}/${info.project.name}-journal.png` })
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
