'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useHydrateAtoms } from 'jotai/utils'
import { queryClientAtom } from 'jotai-tanstack-query'

import { Provider } from 'jotai'
import SocketProvider from '@/contexts/Socket/Socket'
import SocketUpdatesProvider from '@/contexts/SocketUpdates/SocketUpdates'


export const queryClient = new QueryClient()


const HydrateAtoms: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useHydrateAtoms([ [ queryClientAtom, queryClient ] ])

  return children
}

const Providers: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <HydrateAtoms>
          <SocketProvider>
            <SocketUpdatesProvider>
              {children}
            </SocketUpdatesProvider>
          </SocketProvider>
        </HydrateAtoms>
      </Provider>
    </QueryClientProvider>
  )
}

export default Providers
