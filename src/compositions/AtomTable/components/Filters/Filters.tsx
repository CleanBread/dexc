import { type PrimitiveAtom, useAtom } from 'jotai'

import { RadioGroup } from '@/components/RadioGroup/RadioGroup'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select/Select'
import { Switch } from '@/components/Switch/Switch'


const chainFilter: {
  id: NonNullable<GetScannerResultParams['chain']> | 'all'
  title: string
}[] = [
  {
    id: 'all',
    title: 'All',
  },
  {
    id: 'ETH',
    title: 'ETH',
  },
  {
    id: 'SOL',
    title: 'SOL',
  },
  {
    id: 'BASE',
    title: 'BASE',
  },
  {
    id: 'BSC',
    title: 'BSC',
  },
]

type FiltersProps = {
  filtersAtom: PrimitiveAtom<GetScannerResultParams>
  onRankByChange?: (rankBy: SerdeRankBy) => void
}

const Filters: React.FC<FiltersProps> = ({ filtersAtom, onRankByChange }) => {
  const [ filters, setFilters ] = useAtom(filtersAtom)

  const { chain } = filters

  const handleChainClick = (id: NonNullable<GetScannerResultParams['chain']> | 'all') => {
    setFilters(prev => {
      const newFilters = { ...prev }

      if (id === 'all') {
        delete newFilters.chain
      }
      else {
        newFilters.chain = id
      }

      return newFilters
    })
  }

  const handleChangeFilter = (key: keyof GetScannerResultParams, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev }

      if (value === 'any') {
        delete newFilters[key]
      }
      else {
        newFilters[key] = value
      }

      return newFilters
    })
  }

  const handleRankByChange = (value: SerdeRankBy) => {
    handleChangeFilter('rankBy', value)
    onRankByChange?.(value)
  }

  return (
    <div className="flex items-center flex-wrap gap-2">
      <RadioGroup
        className="flex-none"
        items={chainFilter}
        activeItem={chain || 'all'}
        onClick={handleChainClick}
      />
      <div className="grid grid-cols-[1fr_1fr_1fr_1.5fr] gap-x-2 grow">
        <Select
          value={filters.minVol24H ? String(filters.minVol24H) : undefined}
          onValueChange={(value) => handleChangeFilter('minVol24H', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Volume" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="1000">&gt;$1K</SelectItem>
            <SelectItem value="5000">&gt;$5K</SelectItem>
            <SelectItem value="10000">&gt;$10K</SelectItem>
            <SelectItem value="50000">&gt;$50K</SelectItem>
            <SelectItem value="100000">&gt;$100K</SelectItem>
            <SelectItem value="250000">&gt;$250K</SelectItem>
            <SelectItem value="500000">&gt;$500K</SelectItem>
            <SelectItem value="1000000">&gt;$1M</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.maxAge ? String(filters.maxAge) : undefined}
          onValueChange={(value) => handleChangeFilter('maxAge', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Age" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="1">1 hour</SelectItem>
            <SelectItem value="3">3 hours</SelectItem>
            <SelectItem value="6">6 hours</SelectItem>
            <SelectItem value="12">12 hours</SelectItem>
            <SelectItem value="24">24 hours</SelectItem>
            <SelectItem value="72">3 days</SelectItem>
            <SelectItem value="168">7 days</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.maxAge ? String(filters.rankBy) : undefined}
          onValueChange={handleRankByChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Rank by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="volume">Volume</SelectItem>
            <SelectItem value="liquidity">Liquidity</SelectItem>
            <SelectItem value="age">Age</SelectItem>
            <SelectItem value="buys">Buys</SelectItem>
            <SelectItem value="sells">Sells</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center justify-between">
          <div className="text-nowrap mr-1">Exclude Honeypots</div>
          <Switch
            checked={!!filters.isNotHP}
            onCheckedChange={(value) => handleChangeFilter('isNotHP', value)}
          />
        </label>
      </div>
    </div>
  )
}

export default Filters
