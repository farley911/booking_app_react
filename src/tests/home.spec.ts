import { expect, test } from '@playwright/test'

test('home page shows the Booking App heading', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Booking App', level: 1 }),
  ).toBeVisible()
})
