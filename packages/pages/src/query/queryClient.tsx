import {
  QueryClient,
  type QueryClientConfig,
  QueryClientProvider,
} from '@tanstack/react-query'
import React from 'react'

const defaultQueryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
}

function createBookNestQueryClient(): QueryClient {
  return new QueryClient(defaultQueryClientConfig)
}

export function BookNestQueryProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactElement {
  const [queryClient] = React.useState(() => createBookNestQueryClient())

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
