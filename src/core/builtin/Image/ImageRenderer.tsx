/* eslint-disable react/jsx-filename-extension */
import classNames from 'classnames'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePrevious } from 'src/lib/custom-hooks'
import { createPrefixClass } from 'src/lib/string'

import styles from './styles.module.less'
import { cssMatrix2Object, matrixTranslate } from '../../lib/matrix'

const prefixClass = createPrefixClass(styles, 'image-elem')

export default function ImageRenderer({ elem = null, index }) {
  const ref = useRef()

  const [touchPos, setTouchPos] = useState({ startX: 0, startY: 0, px: 0, py: 0 })
  const [bgPos, setBgPos] = useState({})
  const prevBgPos = usePrevious(bgPos)
  const { style: elStyle, data: metaData, selected } = elem || {}

  const stl = useMemo(() => {
    if (!metaData || !elStyle) return {}

    let s = {
      backgroundSize: '100%',
      backgroundRepeat: 'no-repeat',
      backgroundImage: `url(${metaData.src})`,
      transform: elStyle.transform,
      WebkitTransform: elStyle.WebkitTransform,
      ...metaData.style
    }
    if (prevBgPos !== bgPos) {
      s = { ...s, ...bgPos }
    }
    return s
  }, [elStyle, metaData, bgPos, prevBgPos])

  useEffect(() => {
    setBgPos({})
  }, [elem])

  const handleTouchStart = useCallback(
    (e) => {
      if (!selected) return

      const touch = e.touches[0]
      const dom = ref.current
      const mo = cssMatrix2Object(dom.style.transform)
      setTouchPos({ startX: touch.clientX, startY: touch.clientY, px: mo.tx, py: mo.ty })
    },
    [selected]
  )

  const handleTouchMove = useCallback(
    (e) => {
      if (!selected) return

      const touch = e.touches[0]

      const deltaX = touch.clientX - touchPos.startX
      const deltaY = touch.clientY - touchPos.startY
      const dom = ref.current
      const x = touchPos.px + deltaX
      const y = touchPos.py + deltaY

      setBgPos({
        WebkitTransform: matrixTranslate(dom.style.transform, [x, y]),
        transform: matrixTranslate(dom.style.transform, [x, y])
      })
      e.stopPropagation()
    },
    [selected, touchPos]
  )

  const handleTouchEnd = useCallback(() => {
    if (!selected) return
    elem.style = { ...elem.style, ...bgPos }
  }, [selected, bgPos, elem])

  return (
    <>
      <div ref={ref} style={stl} className={classNames([prefixClass()])} />
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={classNames([prefixClass('image-pointer'), { [prefixClass('image-selected')]: selected }])}
      />
    </>
  )
}
