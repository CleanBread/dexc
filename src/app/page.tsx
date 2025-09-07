'use client'

import AtomTable from '@/compositions/AtomTable/AtomTable'
import { NEW_TOKENS_FILTERS, TRENDING_TOKENS_FILTERS } from '@/helpers/constants'


export default function Home() {
  return (
    <div className="h-screen overflow-hidden p-3 grid grid-cols-2 grid-rows-1 gap-x-8">
      <AtomTable title="Trending" initialFilters={TRENDING_TOKENS_FILTERS} />
      <AtomTable title="New" initialFilters={NEW_TOKENS_FILTERS} />
    </div>
  )
}
