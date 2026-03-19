import { expect, test } from '@playwright/test'

function mockAuthRefresh(page: import('@playwright/test').Page) {
  return page.route('**/api/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'fake-token' })
    })
  })
}

function mockAuthMe(page: import('@playwright/test').Page, isPremium = false) {
  return page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '1',
        email: 'test@example.com',
        isPremium
      })
    })
  })
}

function mockVerifyPayment(
  page: import('@playwright/test').Page,
  status = 200
) {
  return page.route('**/api/checkout/verify-payment*', async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(
        status === 200 ? { success: true } : { error: 'Invalid session' }
      )
    })
  })
}

test('valid session → success page shows payment confirmed', async ({
  page
}) => {
  await mockAuthRefresh(page)
  await mockAuthMe(page)
  await mockVerifyPayment(page, 200)

  await page.goto('/checkout/success?id=cs_test_123')

  await expect(page.getByText('Payment Successful!')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Return to home' })).toBeVisible()
})

test('invalid session on success → redirects to /pricing', async ({ page }) => {
  await mockAuthRefresh(page)
  await mockAuthMe(page)
  await mockVerifyPayment(page, 400)

  await page.goto('/checkout/success?id=cs_invalid')

  await page.waitForURL('**/pricing')
  await expect(page).toHaveURL('/pricing')
})

test('verify error after guard passes → shows error state', async ({ page }) => {
  await mockAuthRefresh(page)
  await mockAuthMe(page)

  // First call (guard in beforeLoad) → 200; subsequent calls (component hook) → 500
  let verifyCallCount = 0
  await page.route('**/api/checkout/verify-payment*', async (route) => {
    verifyCallCount++
    await route.fulfill({
      status: verifyCallCount === 1 ? 200 : 500,
      contentType: 'application/json',
      body: JSON.stringify(
        verifyCallCount === 1
          ? { success: true }
          : { error: 'Internal server error' }
      )
    })
  })

  await page.goto('/checkout/success?id=cs_test_123')

  // React Query retries 3x with exponential backoff (~7s total) before showing error
  await expect(page.getByText('Verification Error')).toBeVisible({ timeout: 15000 })
})

test('cancel page shows order cancelled (no guard)', async ({ page }) => {
  await mockAuthRefresh(page)

  await page.goto('/checkout/cancel?id=cs_test_123')

  await expect(page.getByText('Order Cancelled')).toBeVisible()
  await expect(
    page.getByRole('link', { name: /Try again or choose a different plan/i })
  ).toBeVisible()
})

test('cancel page shows even with invalid session id', async ({ page }) => {
  await mockAuthRefresh(page)

  await page.goto('/checkout/cancel?id=cs_invalid')

  await expect(page.getByText('Order Cancelled')).toBeVisible()
})
