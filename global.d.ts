declare global {
  type SupportedChainName = 'ETH' | 'SOL' | 'BASE' | 'BSC';
  type SupportedChainId = '1' | '11155111' | '900' | '8453' | '56';

  type OrderBy = 'asc' | 'desc';
  type TimeFrame = '5M' | '1H' | '6H' | '24H';
  type SerdeRankBy =
    | 'price5M'
    | 'price1H'
    | 'price6H'
    | 'price24H'
    | 'volume'
    | 'txns'
    | 'buys'
    | 'sells'
    | 'trending'
    | 'age'
    | 'liquidity'
    | 'mcap'
    | 'migration';

  interface GetScannerResultParams {
    userId?: null
    // Essential filters
    chain?: null | SupportedChainName;
    orderBy?: OrderBy;
    rankBy?: SerdeRankBy;
    timeFrame?: TimeFrame;
    page?: number | null;

    // Security filters
    isNotHP?: boolean | null; // exclude honeypots
    isVerified?: boolean | null;

    // Volume filters
    minVol24H?: number | null;
    maxVol24H?: number | null;

    // Age filters (in seconds)
    minAge?: number | null;
    maxAge?: number | null;

    // Liquidity filters
    minLiq?: number | null;
    maxLiq?: number | null;

    // Transaction filters
    minBuys24H?: number | null;
    minSells24H?: number | null;
    minTxns24H?: number | null;

    // Array filters for advanced use
    dexes?: string[] | null;
    virtualDexes?: string[] | null;
  }

  interface ScannerResult {
    /** @format date-time */
    age: string;
    bundlerHoldings: string;
    /** @format float */
    buyFee?: number | null;
    /**
     * @format int64
     * @min 0
     */
    buys?: number | null;
    /**
     * @format int32
     * @min 0
     */
    callCount: number;
    /**
     * @format int64
     * @min 0
     */
    chainId: number;
    contractRenounced: boolean;
    contractVerified: boolean;
    currentMcap: string;
    devHoldings: string;
    dexPaid: boolean;
    diff1H: string;
    diff24H: string;
    diff5M: string;
    diff6H: string;
    discordLink?: string | null;
    fdv: string;
    first1H: string;
    first24H: string;
    first5M: string;
    first6H: string;
    honeyPot?: boolean | null;
    initialMcap: string;
    insiderHoldings: string;
    /**
     * @format int64
     * @min 0
     */
    insiders: number;
    isFreezeAuthDisabled: boolean;
    isMintAuthDisabled: boolean;
    liquidity: string;
    liquidityLocked: boolean;
    liquidityLockedAmount: string;
    liquidityLockedRatio: string;
    /**
     * @format int64
     * @min 0
     */
    makers?: number | null;
    migratedFromVirtualRouter: null | string;
    virtualRouterType: null | string;
    migratedFromPairAddress?: null | string;
    migratedFromRouterAddress?: null | string;
    migrationProgress?: string | null;
    pairAddress: string;
    pairMcapUsd: string;
    pairMcapUsdInitial: string;
    percentChangeInLiquidity: string;
    percentChangeInMcap: string;
    price: string;
    reserves0: string;
    reserves0Usd: string;
    reserves1: string;
    reserves1Usd: string;
    routerAddress: string;
    /** @format float */
    sellFee?: number | null;
    /**
     * @format int64
     * @min 0
     */
    sells?: number | null;
    sniperHoldings: string;
    /**
     * @format int64
     * @min 0
     */
    snipers: number;
    telegramLink?: string | null;
    /** @format int32 */
    token0Decimals: number;
    token0Symbol: string;
    token1Address: string;
    token1Decimals: string;
    token1ImageUri?: string | null;
    token1Name: string;
    token1Symbol: string;
    token1TotalSupplyFormatted: string;
    top10Holdings: string;
    twitterLink?: string | null;
    /**
     * @format int64
     * @min 0
     */
    txns?: number | null;
    volume: string;
    webLink?: string | null;
  }

  /**
   * API response structure from GET /scanner
   */
  interface ScannerApiResponse {
    pairs: ScannerResult[];
    totalRows: number;
  }
}

export {}
