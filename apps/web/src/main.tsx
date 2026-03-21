import './i18n/i18n'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { queryClient } from './api/queryClient'
import { routeTree } from './routeTree.gen'
import {
  SessionStoreReturnType,
  useSessionStore
} from './stores/session/useSessionStore'

export interface RouterContext {
  sessionStore: SessionStoreReturnType
  queryClient: typeof queryClient
}

const router = createRouter({
  routeTree,
  scrollRestoration: true,
  context: {
    sessionStore: useSessionStore,
    queryClient: queryClient
  }
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const rootElement = document.getElementById('root')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  )
}
