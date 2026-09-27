import { test, expect } from '@playwright/test'

// These E2E tests validate UI behavior without requiring a live backend.
// Auth API calls either fail gracefully (401) or are intercepted.

test.describe('Auth E2E', () => {
  test('login page renders when navigating to root', async ({ page }) => {
    // Unauthenticated users should be redirected to /login
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('unauthenticated access to /dashboard redirects to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    // Mock the API: login returns 422 (validation-like error, bypasses the 401 refresh interceptor)
    // and also mock refresh to 401 so any stray refresh attempt is handled
    await page.route('**/api/v1/auth/refresh', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { code: 'UNAUTHORIZED', message: 'No session', details: [], request_id: 'x' },
        }),
      })
    })

    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email atau password salah',
            details: [],
            request_id: 'test-req-id',
          },
        }),
      })
    })

    await page.goto('/login')
    await page.locator('input[type="email"]').fill('wrong@test.com')
    await page.locator('input[type="password"]').fill('wrongpassword')
    await page.locator('button[type="submit"]').click()

    // Error message should be visible in the login form
    await expect(
      page.locator('[role="alert"], p:has-text("salah"), p:has-text("gagal"), p:has-text("password")').first(),
    ).toBeVisible({ timeout: 10000 })
  })
})
