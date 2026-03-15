import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173'
  },
  webServer: {
    command: 'VITE_API_URL=http://localhost:3001 pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }]
})
