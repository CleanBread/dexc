import { type RefObject, useMemo, useRef } from 'react'


type Props = {
  value: number
  nodeRef: RefObject<HTMLDivElement | null>
}

const useValueChange = ({ value, nodeRef }: Props) => {
  const prevValue = useRef<number>(undefined)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useMemo(() => {
    if (typeof value === 'number') {
      if (typeof prevValue.current === 'number') {
        if (prevValue.current === value) {
          return
        }

        nodeRef.current?.classList.remove('increased', 'decreased')
        clearTimeout(timerRef.current!)

        nodeRef.current?.classList.add(value > prevValue.current ? 'increased' : 'decreased')

        timerRef.current = setTimeout(() => {
          nodeRef.current?.classList.remove('increased', 'decreased')
        }, 1500)
      }

      prevValue.current = value
    }
  }, [ value ])
}

export default useValueChange
