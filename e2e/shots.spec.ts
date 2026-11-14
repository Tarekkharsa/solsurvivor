import { test } from '@playwright/test'
const S = process.env.SHOTS
test('title screenshots', async ({ page }, info) => {
  test.skip(!S)
  for (const lang of ['en', 'ar']) {
    await page.goto(`/?lang=${lang}&3d=1&intro=0`)
    await page.waitForTimeout(4000)
    await page.screenshot({ path: `${S}/${info.project.name}-title-${lang}.png` })
  }
})
