import { HomePage } from '@/components/views/home/home-page'
import { buildPageTitle } from '@/lib/buildPageTitle'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: HomePage,
  head: () => ({
    meta: [
      {
        title: buildPageTitle()
      }
    ]
  })
})
