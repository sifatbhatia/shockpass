import { test, expect } from '@playwright/test'

test('home page loads with Willcall branding', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Willcall')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Browse events' })).toBeVisible()
})

test('events discovery page loads', async ({ page }) => {
  await page.goto('/events')
  await expect(page.locator('h1, h2').first()).toBeVisible()
})
