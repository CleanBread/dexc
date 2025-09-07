import { type PrimitiveAtom, useAtomValue, useSetAtom, type WritableAtom } from 'jotai'
import { useEffect } from 'react'

import { useSocketUpdates } from '@/contexts/SocketUpdates/SocketUpdates'
import { scannerWatcher } from '@/modules/scannerWatcher'
import serializeObj from '@/helpers/serializeObj'


type Props = {
  filtersAtom: PrimitiveAtom<GetScannerResultParams>
  pairsAtom: WritableAtom<ScannerResult[], [newPairs: ScannerResult[]], void>
}

const useScannerWatcher = ({ pairsAtom, filtersAtom }: Props) => {
  const { subscribePage } = useSocketUpdates()
  const filters = useAtomValue(filtersAtom)
  const setPairs = useSetAtom(pairsAtom)

  useEffect(() => {
    const unsubscribe = subscribePage(filters)

    return () => {
      unsubscribe()
    }
  }, [ subscribePage, filters ])

  useEffect(() => {
    const unsubscribe = scannerWatcher.subscribe(serializeObj(filters), (newData) => {
      setPairs([ ...newData ])
    })

    return () => {
      unsubscribe()
    }
  }, [ filters ])
}

export default useScannerWatcher
