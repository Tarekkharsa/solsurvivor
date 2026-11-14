import { expect, test } from '@playwright/test'

test('the built game works offline after one visit', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'desktop', 'one browser is enough')
  await page.goto('http://localhost:5191/?live=0')
  await expect(page.getByRole('button', { name: /Start mission/ })).toBeVisible()
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready
    return reg.active?.state
  })
  await page.reload()
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('button', { name: /Start mission/ })).toBeVisible()
  await page.getByRole('button', { name: /Start mission/ }).click()
  await expect(page.getByText('Sol 1 of 10')).toBeVisible()
  const photo = await page.evaluate(async () => (await fetch('photos/delta.jpg')).ok)
  expect(photo).toBe(true)
  await context.setOffline(false)
})
