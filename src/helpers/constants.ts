export const TRENDING_TOKENS_FILTERS: GetScannerResultParams = {
  page: 1,
  rankBy: 'volume',
  orderBy: 'desc',
  minVol24H: 1000, // minimum $1k volume
  isNotHP: true, // exclude honeypots
  maxAge: 168, // max 7 days old
}

export const NEW_TOKENS_FILTERS: GetScannerResultParams = {
  page: 1,
  rankBy: 'age',
  orderBy: 'desc', // newest first
  maxAge: 24, // max 24 hours old
  isNotHP: true,
}

export const rankByToScannerKey: Record<SerdeRankBy, keyof ScannerResult | null> = {
  price5M: 'diff5M',
  price1H: 'diff1H',
  price6H: 'diff6H',
  price24H: 'diff24H',
  volume: 'volume',
  txns: 'txns',
  buys: 'buys',
  sells: 'sells',
  trending: null,
  age: 'age',
  liquidity: 'liquidity',
  mcap: 'currentMcap',
  migration: 'migrationProgress',
}
