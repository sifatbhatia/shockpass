import { test, expect } from '@playwright/test'

test('home page loads with Turnstile branding', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Turnstile')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Browse events' })).toBeVisible()
})

test('events discovery page loads', async ({ page }) => {
  await page.goto('/events')
  await expect(page.locator('h1, h2').first()).toBeVisible()
})
