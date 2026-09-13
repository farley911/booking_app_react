import { expect, test } from '@playwright/test'

test('home page loads Roboto and applies the application theme typography', async ({
  page,
}) => {
  await page.goto('/')

  await expect(
    page.locator(
      'link[rel="stylesheet"][href*="fonts.googleapis.com"][href*="Roboto"]',
    ),
  ).toHaveCount(1)

  const bodyFontFamily = await page.evaluate(
    () => getComputedStyle(document.body).fontFamily,
  )

  expect(bodyFontFamily).toMatch(/Roboto/i)
})
