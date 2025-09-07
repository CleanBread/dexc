import { useEffect } from 'react'
import { useAtom, type PrimitiveAtom } from 'jotai'

import chainIdToName from '@/helpers/chainIdToName'
import { useSocketUpdates } from '@/contexts/SocketUpdates/SocketUpdates'
import { pairWatcher } from '@/modules/pairWatcher'
import serializeObj from '@/helpers/serializeObj'


type Props = {
  pairAtom: PrimitiveAtom<ScannerResult>
}

const usePairWatcher = ({ pairAtom }: Props) => {
  const [ pair, setPair ] = useAtom(pairAtom)
  const { pairAddress, token1Address, chainId } = pair

  const { subscribeToken } = useSocketUpdates()

  useEffect(() => {
    const payload = {
      pair: pairAddress,
      token: token1Address,
      chain: chainIdToName(chainId),
    }

    const unsubscribeSocket = subscribeToken(payload)

    return () => {
      unsubscribeSocket()
    }
  }, [ pairAddress, token1Address, chainId, subscribeToken ])

  useEffect(() => {
    const payload = {
      pair: pairAddress,
      token: token1Address,
      chain: chainIdToName(chainId),
    }

    const unsubscribeUpdates = pairWatcher.subscribe(serializeObj(payload), ({ swaps, info }) => {
      if (swaps) {
        const latestSwap = swaps.filter((swap) => !('isOutlier' in swap) || !swap.isOutlier).pop()

        if (latestSwap && 'priceToken1Usd' in latestSwap) {
          setPair(prev => {
            const newPair = {
              ...prev,
              price: latestSwap.priceToken1Usd,
              currentMcap: String(+latestSwap.priceToken1Usd * +prev.token1TotalSupplyFormatted),
            }

            swaps.forEach(({ tokenInAddress, amountToken0, amountToken1, priceToken0Usd, priceToken1Usd }) => {
              const isBuy = tokenInAddress.toLowerCase() === newPair.token1Address.toLowerCase()

              if (isBuy) {
                newPair.buys = (newPair.buys || 0) + 1
                newPair.volume = String(+newPair.volume + Number(amountToken1) * Number(priceToken1Usd))
              }
              else {
                newPair.sells = (newPair.sells || 0) + 1
                newPair.volume = String(+newPair.volume + Number(amountToken0) * Number(priceToken0Usd))
              }
            })


            return newPair
          })
        }
      }

      if (info) {
        const { details, stats, migrationProgress } = info
        setPair(prev => {
          const newPair: ScannerResult = {
            ...prev,
            honeyPot: details.token1IsHoneypot,
            dexPaid: details.dexPaid,
            discordLink: details.linkDiscord,
            telegramLink: details.linkTelegram,
            twitterLink: details.linkTwitter,
            webLink: details.linkWebsite,
            contractVerified: details.isVerified,
            isMintAuthDisabled: details.mintAuthorityRenounced,
            isFreezeAuthDisabled: details.freezeAuthorityRenounced,
            migrationProgress: migrationProgress,
            diff5M: stats.fiveMin.diff,
            diff1H: stats.oneHour.diff,
            diff6H: stats.sixHour.diff,
            diff24H: stats.twentyFourHour.diff,
          }

          return newPair
        })
      }
    })

    return () => {
      unsubscribeUpdates()
    }
  }, [ pairAddress, token1Address, chainId ])
}

export default usePairWatcher
