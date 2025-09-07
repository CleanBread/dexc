import { type TimeframesPairStats, type ScannerPairDetails, type WsTokenSwap } from '@/contexts/SocketUpdates/SocketUpdates'
import { createWatcher } from '@/helpers/createWatcher'


export const pairWatcher = createWatcher<{
  swaps?: WsTokenSwap[]
  info?: {
    details: ScannerPairDetails
    stats: TimeframesPairStats
    migrationProgress: string
  }
}>()
