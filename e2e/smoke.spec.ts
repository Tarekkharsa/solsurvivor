import { expect, test } from '@playwright/test'

const shots = process.env.SHOTS

test('plays a sol from the title to the report', async ({ page }, info) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /SolSurvivor/ })).toBeVisible()
  if (shots) await page.screenshot({ path: `${shots}/${info.project.name}-title.png` })
  await page.getByRole('button', { name: /Start mission/ }).click()
  await page.getByRole('button', { name: 'Skip tips' }).click()
  await page.getByRole('button', { name: 'More Oxygen maker' }).click()
  await page.getByRole('button', { name: 'More Oxygen maker' }).click()
  await page.getByRole('button', { name: 'More Greenhouse lights' }).click()
  await page.getByRole('button', { name: 'More Talk to Earth' }).click()
  await page.locator('[data-project="landing"] button').click()
  await expect(page.getByText('3 of 8 left')).toBeVisible()
  if (shots) await page.screenshot({ path: `${shots}/${info.project.name}-plan.png`, fullPage: true })
  await page.getByRole('button', { name: /End sol/ }).click()
  await expect(page.getByRole('dialog', { name: 'Sol 1 report' })).toBeVisible()
  await expect(page.getByText(/Landing site finished/)).toBeVisible()
  if (shots) await page.screenshot({ path: `${shots}/${info.project.name}-report.png` })
  await page.getByRole('button', { name: 'Next sol' }).click()
  await expect(page.getByText('Sol 2 of 10')).toBeVisible()
  await expect(page.getByRole('button', { name: /Same plan again/ })).toBeVisible()
})
