import { Devtools } from '@/components/ui/devtools.js'
import { ErrorFallbackPage } from '@/components/views/error-fallback/error-fallback-page.js'
import { Footer } from '@/components/views/navigation/footer'
import { Navigation } from '@/components/views/navigation/navigation'
import { NotFoundPage } from '@/components/views/not-found/not-found-page.js'
import { metaTags } from '@/constants/meta-tags'
import { useAuth } from '@/hooks/useAuth'
import { getEnvs } from '@/lib/getEnv'
import { RouterContext } from '@/main'
import * as Sentry from '@sentry/react'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet
} from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { Toaster } from 'react-hot-toast'
import '../config/sentry.config.js'
import '../i18n/i18n'
import '../index.css'

const RootLayout = () => {
  const { VITE_NODE_ENV } = getEnvs()
  useAuth()

  return (
    <>
      <HeadContent />

      {VITE_NODE_ENV !== 'development' && <Analytics />}
      <Toaster />

      <NuqsAdapter>
        <div className="bg-background min-h-dvh flex flex-col">
          <Navigation />
          <main className="flex-1 py-10">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <Sentry.ErrorBoundary
                fallback={({ resetError }) => (
                  <ErrorFallbackPage resetError={resetError} />
                )}
              >
                <Outlet />
                <Devtools />
              </Sentry.ErrorBoundary>
            </div>
          </main>
          <Footer />
        </div>
      </NuqsAdapter>
    </>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  head: () => ({
    title: metaTags.title,
    meta: [
      { name: 'description', content: metaTags.description },
      { name: 'keywords', content: metaTags.keywords },
      { name: 'author', content: metaTags.author },
      { name: 'robots', content: metaTags.robots },

      { property: 'og:title', content: metaTags.title },
      { property: 'og:description', content: metaTags.description },
      { property: 'og:image', content: metaTags.ogImage },
      { property: 'og:type', content: 'website' },

      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: metaTags.title },
      { name: 'twitter:description', content: metaTags.description },
      { name: 'twitter:image', content: metaTags.ogImageTwitter }
    ],
    links: [{ rel: 'icon', href: '/favicon.ico' }]
  })
})
