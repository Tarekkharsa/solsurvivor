import { expect, test } from '@playwright/test'

const shots = process.env.SHOTS

for (const world of ['mars', 'moon']) {
  test(`3D base and time-lapse (${world})`, async ({ page }, info) => {
    test.setTimeout(90_000)
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto(`/?lang=en&live=0&3d=1&seed=1004&world=${world}&level=cadet`)
    await page.getByRole('button', { name: /Start mission/ }).click()
    await page.getByRole('button', { name: 'Skip tips' }).click()
    await expect(page.locator('.stage canvas')).toBeVisible({ timeout: 20000 })
    for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'More Oxygen maker' }).click()
    await page.getByRole('button', { name: 'More Greenhouse lights' }).click()
    await page.getByRole('button', { name: 'More Storm shelter' }).click()
    await page.getByRole('button', { name: 'More Talk to Earth' }).click()
    await page.locator('[data-project="landing"] button').click()
    await page.waitForTimeout(2500)
    await page.locator('.stage').scrollIntoViewIfNeeded()
    if (shots) await page.screenshot({ path: `${shots}/${info.project.name}-${world}-stage.png` })
    await page.locator('[data-coach="end"]').click()
    await expect(page.locator('.stage.lapse')).toBeVisible()
    await page.waitForTimeout(2200)
    if (shots) await page.screenshot({ path: `${shots}/${info.project.name}-${world}-lapse-day.png` })
    await page.waitForTimeout(2600)
    if (shots) await page.screenshot({ path: `${shots}/${info.project.name}-${world}-lapse-night.png` })
    await expect(page.getByRole('dialog', { name: /report/ })).toBeVisible({ timeout: 10000 })
    await page.getByRole('button', { name: /Next/ }).click()
    await page.locator('[data-coach="end"]').click()
    await page.getByRole('button', { name: /Skip/ }).click()
    await expect(page.getByRole('dialog', { name: /report/ })).toBeVisible()
    expect(errors).toEqual([])
  })
}

for (const world of ['mars', 'moon']) {
  test(`opening shot from orbit (${world})`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'one browser is enough')
    await page.goto(`/?lang=en&live=0&3d=1&intro=1&world=${world}&seed=1003&level=cadet`)
    await page.getByRole('button', { name: /Start mission/ }).click()
    const intro = page.getByRole('dialog', { name: world === 'mars' ? 'Jezero Crater, Mars' : 'The Moon’s south pole' })
    await expect(intro).toBeVisible()
    await page.waitForTimeout(2500)
    if (shots) await page.screenshot({ path: `${shots}/${world}-intro-orbit.png` })
    await page.waitForTimeout(4200)
    if (shots) await page.screenshot({ path: `${shots}/${world}-intro-dive.png` })
    await expect(intro).toHaveCount(0, { timeout: 6000 })
    await expect(page.getByText(/Tip 1 of 4/)).toBeVisible()
  })
}
