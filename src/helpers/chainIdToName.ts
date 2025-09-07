function chainIdToName(chainId: number): string {
  switch (chainId.toString()) {
    case '1': return 'ETH'
    case '56': return 'BSC'
    case '8453': return 'BASE'
    case '900': return 'SOL'
    default: return 'ETH'
  }
}

export default chainIdToName
