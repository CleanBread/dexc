function serializeObj(obj: Record<string, any>) {
  return JSON.stringify(
    Object.keys(obj)
      .sort()
      .reduce((acc, key) => {
        acc[key] = String(obj[key])

        return acc
      }, {} as Record<string, any>)
  )
}

export default serializeObj
