import { test as base } from '@playwright/test'

/** Most tests use the simple view (no 3D time-lapse); e2e/scene.spec.ts covers 3D. */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        if (!localStorage.getItem('solsurvivor.settings')) localStorage.setItem('solsurvivor.settings', JSON.stringify({ graphics: 'simple' }))
      } catch {
        // ignore
      }
    })
    await use(page)
  },
})
export { expect, type Page } from '@playwright/test'
