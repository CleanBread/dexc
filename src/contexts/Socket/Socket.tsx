import React, { createContext, useContext, useEffect, useRef, useState } from 'react'


enum SocketCloseReason {
  Unmount = 3000
}

export type FeedSocketContextValue = {
  socket: WebSocket | undefined;
  isSocketReady: boolean;
};

const FeedSocketContext = createContext<FeedSocketContextValue | null>(null)

export const useSocket = () => {
  return useContext(FeedSocketContext) as FeedSocketContextValue
}

const SocketProvider: React.FC<any> = ({ children }) => {
  const [ socket, setSocket ] = useState<WebSocket>()
  const isSocketReady = socket?.readyState === WebSocket.OPEN

  const isConnectedRef = useRef(false)

  const connect = () => {
    if (isConnectedRef.current) {
      return
    }

    isConnectedRef.current = true

    const newSocket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}`)

    const handleOpen = () => {
      setSocket(newSocket)
    }

    const handleClose = (event: CloseEvent) => {
      setSocket(undefined)
      isConnectedRef.current = false

      newSocket.removeEventListener('open', handleOpen)
      newSocket.removeEventListener('close', handleClose)
      newSocket.removeEventListener('error', handleError)


      if (event.code !== SocketCloseReason.Unmount) {
        setTimeout(connect, 1000)
      }
    }
    const handleError = () => {
      isConnectedRef.current = false
    }

    newSocket.addEventListener('open', handleOpen)
    newSocket.addEventListener('close', handleClose)
    newSocket.addEventListener('error', handleError)
  }

  useEffect(() => {
    connect()

    return () => {
      socket?.close(SocketCloseReason.Unmount)
    }
  }, [])

  const value: FeedSocketContextValue = { socket, isSocketReady }

  return (
    <FeedSocketContext.Provider value={value}>
      {children}
    </FeedSocketContext.Provider>
  )
}

export default SocketProvider
