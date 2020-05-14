import { useEffect } from 'react'
import { getUrlQuery } from 'src/lib/string'

const isLog = () => getUrlQuery('debug') !== '1' || window.runtime.env !== 'prod'

export function logMark(...args) {
  if (!isLog()) return
  return window.console.log.call(null, 'KJY-info-->', ...args)
}

export function errorMark(...args) {
  if (!isLog()) return
  window.console.error.call(null, 'KJY-error-->', ...args)
  // throw new Error('KJY-error ' + args.join())
}

export function useLog(prefix, val) {
  useEffect(() => {
    logMark(prefix, val)
  }, [prefix, val])
}
