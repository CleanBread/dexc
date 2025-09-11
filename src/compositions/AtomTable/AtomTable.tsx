import { atomWithQuery } from 'jotai-tanstack-query'
import React, { memo, useMemo } from 'react'
import type { PrimitiveAtom } from 'jotai'
import { useAtom, atom, useAtomValue, useSetAtom } from 'jotai'
import cx from 'clsx'
import { splitAtom } from 'jotai/utils'
import dayjs from 'dayjs'
import { ArrowDownIcon, BanIcon, DatabaseBackupIcon, LoaderCircleIcon } from 'lucide-react'
import { BigNumber } from 'bignumber.js'
import type { RowComponentProps } from 'react-window'
import { List } from 'react-window'

import restApi from '@/helpers/api/restApi'
import chainIdToName from '@/helpers/chainIdToName'
import shortenAddress from '@/helpers/shortenAddress'
import toLocaleString from '@/helpers/toLocaleString'
import serializeObj from '@/helpers/serializeObj'
import calcMarketCap from '@/helpers/calcMarketCap'
import AnimatedValue from '@/components/AnimatedValue/AnimatedValue'
import { rankByToScannerKey } from '@/helpers/constants'
import Pagination from './components/Pagination/Pagination'
import Filters from './components/Filters/Filters'
import useScannerWatcher from './utils/useScannerWatcher'
import usePairWatcher from './utils/usePairWathcer'


type PairRowProps = {
  pairAtom: PrimitiveAtom<ScannerResult>
}

const PairRow: React.FC<PairRowProps> = memo(({ pairAtom }) => {
  const pair = useAtomValue(pairAtom)

  return (
    <div
      className="min-w-fit row [&>div]:p-2 w-full group [&>div]:group-odd:bg-gray-50 [&>div]:group-even:bg-gray-100 divide-border"
    >
      <div className="sticky left-0">{pair.token1Symbol} / {chainIdToName(pair.chainId)}</div>
      <div>{shortenAddress(pair.routerAddress)}</div>
      <AnimatedValue key={`${pair.pairAddress}-price`} value={+pair.price} formatter={toLocaleString} />
      <AnimatedValue key={`${pair.pairAddress}-cap`} value={+calcMarketCap(pair)} formatter={toLocaleString} />
      <AnimatedValue key={`${pair.pairAddress}-volume`} value={+pair.volume} formatter={toLocaleString} />
      <AnimatedValue key={`${pair.pairAddress}-diff5m`} value={+pair.diff5M || 0} postfix="%" />
      <AnimatedValue key={`${pair.pairAddress}-diff1H`} value={+pair.diff1H || 0} postfix="%" />
      <AnimatedValue key={`${pair.pairAddress}-diff6H`} value={+pair.diff6H || 0} postfix="%" />
      <AnimatedValue key={`${pair.pairAddress}-diff24H`} value={+pair.diff24H || 0} postfix="%" />
      <div>{dayjs(pair.age).format('DD/MM/YYYY, HH:mm')}</div>
      <AnimatedValue key={`${pair.pairAddress}-buys`} value={pair.buys || 0} />
      <AnimatedValue key={`${pair.pairAddress}-sells`} value={pair.sells || 0} />
      <AnimatedValue key={`${pair.pairAddress}-liquidity`} value={+pair.liquidity} />
    </div>
  )
})

type SortValue = {
  key: keyof ScannerResult
  type: 'desc' | 'asc'
} | undefined

type HeaderSortProps = {
  title: string
  sortKey: keyof ScannerResult
  sortAtom: PrimitiveAtom<SortValue>
}

const HeaderSort: React.FC<HeaderSortProps> = ({ title, sortKey, sortAtom }) => {
  const [ sortValue, setSortValue ] = useAtom(sortAtom)

  const handleChangeSort = () => {
    setSortValue(prev => {
      if (prev && prev.key === sortKey) {
        return {
          key: sortKey,
          type: prev.type === 'asc' ? 'desc' : 'asc',
        }
      }

      return {
        key: sortKey,
        type: 'desc',
      }
    })
  }

  return (
    <div className="cursor-pointer flex items-center text-nowrap" onClick={handleChangeSort}>
      {title}
      {
        sortValue?.key === sortKey && (
          <ArrowDownIcon
            className={
              cx('size-4 ml-1', {
                'rotate-180': sortValue.type === 'asc',
              })
            }
          />
        )
      }
    </div>
  )
}

type HeaderProps = {
  sortAtom: PrimitiveAtom<SortValue>
}

const Header: React.FC<HeaderProps> = ({ sortAtom }) => {
  return (
    <div className="h-0 sticky top-0 min-w-fit row [&>div]:bg-gray-200 [&>div]:p-1 divide-x divide-border z-10 font-semibold">
      <div className="sticky left-0 z-10">Token Symbol</div>
      <div>Exchange</div>
      <HeaderSort title="Price (USD)" sortAtom={sortAtom} sortKey="price" />
      <HeaderSort title="Market Cap" sortAtom={sortAtom} sortKey="currentMcap" />
      <HeaderSort title="Volume (24h)" sortAtom={sortAtom} sortKey="volume" />
      <HeaderSort title="5m" sortAtom={sortAtom} sortKey="diff5M" />
      <HeaderSort title="1h" sortAtom={sortAtom} sortKey="diff1H" />
      <HeaderSort title="6h" sortAtom={sortAtom} sortKey="diff6H" />
      <HeaderSort title="24h" sortAtom={sortAtom} sortKey="diff24H" />
      <HeaderSort title="Age" sortAtom={sortAtom} sortKey="age" />
      <HeaderSort title="Buys" sortAtom={sortAtom} sortKey="buys" />
      <HeaderSort title="Sells" sortAtom={sortAtom} sortKey="sells" />
      <HeaderSort title="Liquidity" sortAtom={sortAtom} sortKey="liquidity" />
    </div>
  )
}

const RowWrapper = (
  { pairsAtoms, index, style }: RowComponentProps<{
    pairsAtoms: PrimitiveAtom<ScannerResult>[]
  }>
) => {
  const pairAtom = pairsAtoms[index]

  usePairWatcher({
    pairAtom,
  })

  return (
    <div style={style}>
      <PairRow key={`${pairAtom}`} pairAtom={pairAtom} />
    </div>
  )
}

type TableContentProps = {
  data: ScannerApiResponse
  filtersAtom: PrimitiveAtom<GetScannerResultParams>
  sortAtom: PrimitiveAtom<SortValue>
}

const TableContent: React.FC<TableContentProps> = ({ data, filtersAtom, sortAtom }) => {
  const dataAtom = useMemo(() => {
    return atom(data)
  }, [ data ])

  const pairsAtom = useMemo(() => {
    return atom(
      (get) => {
        const criteria = get(sortAtom)

        if (!criteria) {
          return get(dataAtom).pairs
        }

        const { key, type } = criteria

        return [ ...get(dataAtom).pairs ].sort((a, b) => {
          if (type === 'desc') {
            return BigNumber(b[key] as string).minus(a[key] as string).toNumber()
          }
          else {
            return BigNumber(a[key] as string).minus(b[key] as string).toNumber()
          }
        })
      },
      (get, set, newPairs: ScannerResult[]) => {
        set(dataAtom, {
          pairs: newPairs,
          totalRows: get(dataAtom).totalRows,
        })
      }
    )
  }, [ dataAtom ])

  useScannerWatcher({
    pairsAtom,
    filtersAtom,
  })

  const pairsAtomsAtom = useMemo(() => splitAtom(pairsAtom), [ pairsAtom ])

  const pairsAtoms = useAtomValue(pairsAtomsAtom)

  return (
    <div className="w-full divide-y divide-border overflow-hidden">
      <div className="divide-y h-[90%] overflow-hidden divide-border rounded-xl">
        {/* {
          pairsAtoms.map((pairAtom) => (
            <PairRow key={`${pairAtom}`} pairAtom={pairAtom} />
          ))
        } */}
        <List
          rowComponent={RowWrapper}
          rowCount={pairsAtoms.length}
          rowHeight={40}
          rowProps={{ pairsAtoms }}
        >
          <Header sortAtom={sortAtom} />
        </List>
      </div>
      <Pagination filtersAtom={filtersAtom} totalRows={data.totalRows} />
    </div>
  )
}

type DataWrapperProps = {
  filtersAtom: PrimitiveAtom<GetScannerResultParams>
  sortAtom: PrimitiveAtom<SortValue>
  onResetFilters: () => void
}

const DataWrapper: React.FC<DataWrapperProps> = ({ filtersAtom, sortAtom, onResetFilters }) => {
  const scannerAtom = useMemo(() => {
    return atomWithQuery((get) => {
      return {
        queryKey: [ 'scanner', serializeObj(get(filtersAtom)) ],
        queryFn: async () => {
          const params = new URLSearchParams(Object.entries(get(filtersAtom)))

          const { data } = await restApi.get<ScannerApiResponse>('/scanner', {
            params,
          })

          const { pairs, totalRows } = data

          return {
            pairs,
            totalRows,
          }
        },
        staleTime: 5_000,
        retry: false,
        placeholderData: () => ({
          pairs: [],
          totalRows: 0,
        }),
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      }
    })
  }, [])

  const { data, error, isFetching, refetch } = useAtomValue(scannerAtom)

  if (isFetching) {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-xl bg-gray-50">
        <LoaderCircleIcon className="size-20 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-xl bg-gray-50 flex-col">
        <BanIcon className="size-20" />
        <button
          className="mt-3 button"
          onClick={
            () => {
              refetch()
            }
          }
        >Refetch
        </button>
      </div>
    )
  }

  if (!data || data.pairs.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-xl bg-gray-50 flex-col">
        <DatabaseBackupIcon className="size-20" />
        <button className="mt-3 button" onClick={onResetFilters}>Reset Filters</button>
      </div>
    )
  }

  return (
    <TableContent data={data} filtersAtom={filtersAtom} sortAtom={sortAtom} />
  )
}

type AtomTableProps = {
  title: string
  initialFilters: GetScannerResultParams
}

const AtomTable: React.FC<AtomTableProps> = ({ title, initialFilters }) => {
  const sortAtom = useMemo(() => (
    atom<SortValue>(
      initialFilters.rankBy && rankByToScannerKey[initialFilters.rankBy] ? (
        { key: rankByToScannerKey[initialFilters.rankBy]!, type: 'desc' }
      ) : undefined
    )
  ), [])

  const filtersAtom = useMemo(() => (
    atom<GetScannerResultParams>(initialFilters)
  ), [])


  const setFilters = useSetAtom(filtersAtom)
  const setSort = useSetAtom(sortAtom)

  const handleResetFilters = () => {
    setFilters(initialFilters)
  }

  const onRankByChange = (rankBy: SerdeRankBy) => {
    setSort(rankByToScannerKey[rankBy] ? (
      { key: rankByToScannerKey[rankBy], type: 'desc' }
    ) : undefined)
  }

  return (
    <div className="w-full flex flex-col">
      <div className="space-y-2 mb-2">
        <div className="text-xl font-semibold">{title}</div>
        <Filters filtersAtom={filtersAtom} onRankByChange={onRankByChange} />
      </div>
      <DataWrapper filtersAtom={filtersAtom} sortAtom={sortAtom} onResetFilters={handleResetFilters} />
    </div>
  )
}

export default AtomTable
