import BigNumber from 'bignumber.js'


type Options = {
  digits?: number
  replaceSymbol?: string
  floorRounding?: boolean
  cutFractionalZero?: boolean
  significantFractionInSmallValue?: boolean
}

BigNumber.config({ EXPONENTIAL_AT: 1e9 })

const toLocaleString = (value: number | string, opts?: Options) => {
  const { digits = 3, replaceSymbol = ' ', floorRounding = true, cutFractionalZero = true, significantFractionInSmallValue = true } = opts || {}

  const bn = new BigNumber(value)

  if (!bn.isFinite()) {
    return ''
  }

  let preFormattedValue = bn
  const isSmallValueFormatting = bn.abs().lt(1) && significantFractionInSmallValue

  if (bn.decimalPlaces()! > digits && floorRounding) {
    const fraction = bn.toFixed().split('.')[1]
    const significantAddition = isSmallValueFormatting
      ? (fraction?.search(/[1-9]/) ?? 0)
      : 0

    const factor = new BigNumber(10).pow(digits + significantAddition)
    preFormattedValue = bn.times(factor).integerValue(BigNumber.ROUND_FLOOR).div(factor)
  }

  const str = isSmallValueFormatting
    ? preFormattedValue.toPrecision(digits)
    : preFormattedValue.toFixed(digits)

  const [ int, fraction ] = str.split('.')

  let result = int.replace(/\B(?=(\d{3})+(?!\d))/g, replaceSymbol) + (fraction ? '.' + fraction : '')

  if (cutFractionalZero && result.includes('.')) {
    result = result.replace(/\.?0+$/, '')
  }

  return result
}

export default toLocaleString
