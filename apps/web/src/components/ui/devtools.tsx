import { getEnvs } from '@/lib/getEnv'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export function Devtools() {
  if (getEnvs().VITE_NODE_ENV === 'production') {
    return
  }

  return (
    <>
      <TanStackRouterDevtools />
      <ReactQueryDevtools position="bottom-right" initialIsOpen={false} />
    </>
  )
}
