const shortenAddress = (address: string, countBefore: number = 6, countAfter: number = 6) =>
  `${address.substr(0, countBefore)}...${address.substr(-1 * countAfter)}`

export default shortenAddress
