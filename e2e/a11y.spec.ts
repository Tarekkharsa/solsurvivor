import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from './test'

async function audit(page: Page, what: string) {
  await page.waitForTimeout(400)
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const v = r.violations.map((x) => `${what}: ${x.id} (${x.nodes.length}) ${x.nodes[0]?.target}`)
  expect(v).toEqual([])
}

for (const lang of ['en', 'ar']) {
  test(`no WCAG A/AA violations on the main screens (${lang})`, async ({ page }) => {
    await page.goto(`/?lang=${lang}&live=0`)
    await audit(page, 'title')
    await page.locator('.title-links button').nth(1).click()
    await audit(page, 'journal')
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: lang === 'en' ? /Start mission/ : /ابدأ المهمة/ }).click()
    await audit(page, 'play+coach')
    await page.locator('.coach-bubble button').click()
    await page.locator('[data-coach="end"]').click()
    await audit(page, 'report')
    await page.locator('.modal button.primary').click()
    await page.locator('.topbar .icon-btn').last().click()
    await audit(page, 'settings')
    await page.keyboard.press('Escape')
    await page.locator('.topbar button.link').click()
    await page.locator('.title-links button').first().click()
    await audit(page, 'teachers')
  })
}

test('keyboard only: skip link, dialogs trap focus and close on Escape', async ({ page }) => {
  await page.goto('/?lang=en&live=0')
  await page.getByRole('button', { name: /Start mission/ }).click()
  await page.getByRole('button', { name: 'Skip tips' }).click()
  await page.mouse.click(2, 2)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to the plan' })).toBeFocused()
  await page.getByRole('button', { name: 'Settings' }).focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: /Settings/ })
  await expect(dialog).toBeVisible()
  for (let i = 0; i < 8; i++) await page.keyboard.press('Tab')
  expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Settings' })).toBeFocused()
})
