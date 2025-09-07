const calcMarketCap = (pair: ScannerResult) => {
  if (+pair.currentMcap > 0) {
    return pair.currentMcap
  }

  if (+pair.initialMcap > 0) {
    return pair.initialMcap
  }

  if (+pair.pairMcapUsd > 0) {
    return pair.pairMcapUsd
  }

  if (+pair.pairMcapUsdInitial > 0) {
    return pair.pairMcapUsdInitial
  }

  return '0'
}

export default calcMarketCap
