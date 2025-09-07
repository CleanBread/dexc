import React, { createContext, useCallback, useContext, useEffect, useRef } from 'react'

import { scannerWatcher } from '@/modules/scannerWatcher'
import serializeObj from '@/helpers/serializeObj'

import { pairWatcher } from '@/modules/pairWatcher'
import { useSocket } from '../Socket/Socket'


export type SocketUpdatesValue = {
  subscribePage: (filters: GetScannerResultParams) => (() => void)
  subscribeToken: (payload: PairSubscriptionPayload) => (() => void)
}

export interface WsTokenSwap {
  timestamp: string;
  addressTo: string;
  addressFrom: string;
  token0Address: string;
  amountToken0: string;
  amountToken1: string;
  priceToken0Usd: string;
  priceToken1Usd: string;
  tokenInAddress: string; // tells you which token was bought
  isOutlier: boolean; // ignore outlier swaps
}

export interface PairSubscriptionPayload {
  pair: string; // pair address
  token: string; // token address
  chain: string;
}

export interface TickEventPayload {
  pair: PairSubscriptionPayload;
  swaps: WsTokenSwap[];
}

/**
 * Pair statistics updates (migration progress, audit changes, etc.)
 */
export interface PairStatsMsgData {
  pair: ScannerPairDetails;
  pairStats: TimeframesPairStats;
  migrationProgress: string;
  callCount: number;
}

export interface ScannerPairDetails {
  token1SniperWalletToTotalSupplyRatio: string;
  token1BundlerWalletToTotalSupplyRatio: string;
  traders: number;
  bundlers: number;
  /** holdings of bundlers */
  bundlerHoldings?: string | null;
  /** The amount of liquidity burned */
  burnedAmount?: string;
  burnedSupply: string;
  chain: string;
  /** holdings of dev */
  devHoldings?: string | null;
  /** dexscreener paid status */
  dexPaid: boolean;
  /** The (token1 total supply - burned tokens) * token1 price usd */
  fdv: string;
  freezeAuthorityRenounced: boolean;
  /** holdings of insiders */
  insiderHoldings?: string | null;
  /**
   * number of insiders still holding
   * @format int64
   * @min 0
   */
  insiders: number;
  /** Used to indicate a migration is in progress */
  isMigrating?: boolean | null;
  isVerified: boolean;
  linkDiscord?: string | null;
  linkTelegram?: string | null;
  linkTwitter?: string | null;
  linkWebsite?: string | null;
  lockedAmount?: string;
  /** The previous pair address before migration */
  migratedFromPairAddress?: null | string;
  migratedFromRouterAddress?: null | string;
  /** When a pumpfun (or similar) pair successfully migrates to raydium */
  migratedToPairAddress?: null | string;
  migratedFromVirtualRouter: null | string;
  virtualRouterType: null | string;
  mintAuthorityRenounced: boolean;
  pairAddress: string;
  /** @format date-time */
  pairCreatedAt: string;
  /** The usd value of the liquidity pool */
  pairMarketcapUsd: string;
  /** The initial usd value of the liquidity pool */
  pairMarketcapUsdInitial?: string;
  /** The usd price of token0 in the pair */
  pairPrice0Usd: string;
  /** The usd price of token1 in the pair */
  pairPrice1Usd: string;
  /** The number of token0 tokens in the liquidity pool */
  pairReserves0: string;
  /** The total usd value of token0 tokens in the liquidity pool */
  pairReserves0Usd: string;
  /** The number of token1 tokens in the liquidity pool */
  pairReserves1: string;
  /** The total usd value of token1 tokens in the liquidity pool */
  pairReserves1Usd: string;
  /** The total supply of liquidity pool tokens */
  pairTotalSupply: string;
  renounced: boolean;
  routerAddress: string;
  routerType: string;
  /** total holdings of snipers */
  sniperHoldings?: string | null;
  /**
   * number of snipers still holding
   * @format int64
   * @min 0
   */
  snipers: number;
  token0Address: string;
  /** @format int32 */
  token0Decimals: number;
  token0Symbol: string;
  token1Address: string;
  /** @format float */
  token1BuyFee?: number | null;
  /** @format int32 */
  token1Decimals: number;
  token1DevWalletToTotalSupplyRatio?: string;
  /** Comes from "Token".extra_data in the "image" field */
  token1ImageUri?: string | null;
  token1IsHoneypot?: boolean | null;
  token1IsProxy: boolean;
  /** The maximum number of tokens that can be traded in a single swap */
  token1MaxTransaction?: string;
  token1MaxTransactionToTotalSupplyRatio?: string;
  /** The maximum number of tokens a wallet can hold */
  token1MaxWallet?: string;
  token1MaxWalletToTotalSupplyRatio?: string;
  token1Name: string;
  /** @format float */
  token1SellFee?: number | null;
  token1Symbol: string;
  /** The total supply of token1 */
  token1TotalSupply: string;
  /** The "formatted" total supply of token1 */
  token1TotalSupplyFormatted: string;
  /** @format float */
  token1TransferFee?: number | null;
  /** holdings of top10 */
  top10Holdings?: string | null;
  totalLockedRatio?: string;
}
export interface TimeframesPairStats {
  fiveMin: TimeFramePairStatsRef;
  oneHour: TimeFramePairStatsRef;
  sixHour: TimeFramePairStatsRef;
  twentyFourHour: TimeFramePairStatsRef;
}

export interface TimeFramePairStatsRef {
  buyVolume: string;
  /**
   * @format int64
   * @min 0
   */
  buyers: number;
  /**
   * @format int64
   * @min 0
   */
  buys: number;
  change: string;
  diff: string;
  first: string;
  last: string;
  /**
   * @format int64
   * @min 0
   */
  makers: number;
  sellVolume: string;
  /**
   * @format int64
   * @min 0
   */
  sellers: number;
  /**
   * @format int64
   * @min 0
   */
  sells: number;
  /**
   * @format int64
   * @min 0
   */
  txns: number;
  volume: string;
}

/**
 * Full dataset updates - this replaces your current data
 */
export interface ScannerPairsEventPayload {
  filter: GetScannerResultParams;
  results: {
    pairs: ScannerResult[];
  };
}

export type IncomingWebSocketMessage =
  | { event: 'tick'; data: TickEventPayload }
  | { event: 'pair-stats'; data: PairStatsMsgData }
  | { event: 'scanner-pairs'; data: ScannerPairsEventPayload }

const SocketUpdates = createContext<SocketUpdatesValue | null>(null)

export const useSocketUpdates = () => {
  return useContext(SocketUpdates) as SocketUpdatesValue
}

const SocketUpdatesProvider: React.FC<any> = ({ children }) => {
  const { socket, isSocketReady } = useSocket()

  const tokenSubscribersCount = useRef<Map<string, number>>(new Map())

  const subscribePage = useCallback((filters: GetScannerResultParams) => {
    if (!socket || !isSocketReady) {
      return () => {}
    }

    const _filters = Object.entries(filters).reduce<Record<string, string>>((acc, [ key, value ]) => {
      acc[key] = String(value)

      return acc
    }, {})

    socket.send(JSON.stringify({
      event: 'scanner-filter',
      data: _filters,
    }))

    return () => {
      if (!socket || !isSocketReady) {
        return
      }

      socket.send(JSON.stringify({
        event: 'unsubscribe-scanner-filter',
        data: _filters,
      }))
    }
  }, [ socket, isSocketReady ])

  const subscribeToken = useCallback((payload: PairSubscriptionPayload) => {
    if (!socket || !isSocketReady) {
      return () => {}
    }

    const key = serializeObj(payload)

    if (!tokenSubscribersCount.current.get(key)) {
      tokenSubscribersCount.current.set(key, 0)

      socket.send(JSON.stringify({
        event: 'subscribe-pair',
        data: payload,
      }))
    }

    tokenSubscribersCount.current.set(
      key,
      (tokenSubscribersCount.current.get(key) || 0) + 1
    )

    return () => {
      if (typeof tokenSubscribersCount.current.get(key) === 'undefined') {
        return
      }

      tokenSubscribersCount.current.set(
        key,
        (tokenSubscribersCount.current.get(key) || 0) - 1
      )

      if (tokenSubscribersCount.current.get(key)! > 0) {
        return
      }

      tokenSubscribersCount.current.delete(key)

      socket.send(JSON.stringify({
        event: 'unsubscribe-pair',
        data: payload,
      }))
    }
  }, [ socket, isSocketReady ])

  useEffect(() => {
    if (!isSocketReady || !socket) {
      return
    }

    const handleMessage = (message: MessageEvent<string>) => {
      const { event, data }: IncomingWebSocketMessage = JSON.parse(message.data)

      if (event === 'scanner-pairs') {
        const { filter, results: { pairs } } = data

        delete filter.timeFrame
        delete filter.userId

        scannerWatcher.dispatch(serializeObj(filter), pairs)
      }

      if (event === 'tick') {
        const { pair, swaps } = data

        pairWatcher.dispatch(serializeObj(pair), { swaps })
      }

      if (event === 'pair-stats') {
        const { pair, pairStats, migrationProgress } = data

        const pairInfo: PairSubscriptionPayload = {
          pair: pair.pairAddress,
          token: pair.token1Address,
          chain: pair.chain,
        }

        pairWatcher.dispatch(serializeObj(pairInfo), {
          info: {
            details: pair,
            stats: pairStats,
            migrationProgress,
          },
        })
      }
    }

    socket.addEventListener('message', handleMessage)

    return () => {
      socket.removeEventListener('message', handleMessage)
    }
  }, [ socket ])

  const value: SocketUpdatesValue = {
    subscribePage,
    subscribeToken,
  }

  return (
    <SocketUpdates.Provider value={value}>
      {children}
    </SocketUpdates.Provider>
  )
}

export default SocketUpdatesProvider
