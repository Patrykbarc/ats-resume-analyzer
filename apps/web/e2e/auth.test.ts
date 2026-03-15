import { expect, test } from '@playwright/test'

test('login submits credentials and redirects to home', async ({ page }) => {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'fake-token' })
    })
  })

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: '1',
        email: 'test@example.com',
        isPremium: false
      })
    })
  })

  await page.goto('/login')

  await page.locator('#email').fill('test@example.com')
  await page.locator('#password').fill('Password123!')
  await page.getByRole('button', { name: 'Login' }).click()

  await page.waitForURL('/')
  await expect(page).toHaveURL('/')
})

test('register shows inbox confirmation on success', async ({ page }) => {
  await page.route('**/api/auth/register', async (route) => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'User registered successfully' })
    })
  })

  await page.goto('/register')

  await page.locator('#email').fill('newuser@example.com')
  await page.locator('#password').fill('Password123!')
  await page.locator('#confirmPassword').fill('Password123!')
  await page.getByRole('button', { name: 'Register' }).click()

  await expect(page.getByText('Check Your Inbox')).toBeVisible()
  await expect(page.getByText('newuser@example.com')).toBeVisible()
})
