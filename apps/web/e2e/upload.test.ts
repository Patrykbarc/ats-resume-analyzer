import { expect, test } from '@playwright/test'

const FAKE_ANALYSIS = {
  id: 'test-analysis-id',
  title: 'Software Engineer Resume',
  overall_score: {
    label: 'Good',
    range: '70-79',
    score: '75',
    weighting_justification: {
      'ATS Compatibility': 'Good keyword coverage',
      'Job Market Alignment': 'Matches current demand',
      'Competitive Differentiation': 'Stands out in pool'
    },
    justification: 'Solid resume with room for improvement.'
  },
  sections: {
    strengths: ['Clear experience section'],
    areas_for_improvement: ['Add more metrics'],
    recommendations: ['Use action verbs']
  },
  parsed_file: 'Sample parsed resume text',
  user: null
}

test('uploads a PDF and navigates to analysis results', async ({ page }) => {
  await page.route('**/api/cv/analyze/free', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ jobId: 'test-job-id' })
    })
  })

  await page.route('**/api/cv/analyze/job/test-job-id', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'COMPLETED', result: FAKE_ANALYSIS })
    })
  })

  await page.route('**/api/cv/analysis/test-analysis-id', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FAKE_ANALYSIS)
    })
  })

  await page.goto('/')

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles({
    name: 'resume.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 minimal pdf content')
  })

  await expect(page.getByRole('button', { name: /Analyze/ })).toBeVisible()
  await page.getByRole('button', { name: /Analyze/ }).click()

  await page.waitForURL('**/analyse/test-analysis-id')

  await expect(page.getByText('75 / 100')).toBeVisible()
})
