import { memo, useRef } from 'react'

import useValueChange from './utils/useValueChange'


type AnimatedValueProps = {
  value: number
  formatter?: (value: number) => string | number
  postfix?: string
}

const AnimatedValue: React.FC<AnimatedValueProps> = memo(({ value, formatter, postfix }) => {
  const nodeRef = useRef<HTMLDivElement>(null)
  useValueChange({ value, nodeRef })

  return (
    <div ref={nodeRef} className="[.increased]:text-green-500 [.decreased]:text-red-500 text-nowrap">
      {formatter ? formatter(value) : value}{postfix}
    </div>
  )
})

export default AnimatedValue
