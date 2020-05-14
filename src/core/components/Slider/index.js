/* eslint-disable react/jsx-filename-extension */
/*
 * @Date: 2019-08-19 18:03:17
 * @Last Modified time: 2019-08-19 18:03:17
 * 滑动输入条
 */
import { View } from '@tarojs/components'
import React, { useCallback, useMemo, useState } from 'react'
import classNames from 'classnames'
import Kpm from 'src/components/Kpm'
import { useUpdate } from 'src/lib/custom-hooks'
import { noop } from 'src/lib/function'
import { createPrefixClass } from 'src/lib/string'

import IconPlus from './images/icon-plus.png'
import IconVertical from './images/icon-vertical.png'
import styles from './styles.module.less'

const prefixClass = createPrefixClass(styles, 'slider')
const THRESHOLD = 0.1
const initialValue = 50

function Slider(props) {
  const {
    onChange = noop,
    value = 0,
    leadingText = '小',
    trailingText = '大',
    isBtn = false,
    threshold = THRESHOLD
  } = props

  const [isMoving, setMoving] = useState(false)
  const [percentage, setPercentage] = useState(value)

  const invokeChange = useCallback(
    (pct) => {
      if (pct < -1) pct = -1
      if (pct > 1) pct = 1
      onChange(pct)
    },
    [onChange]
  )

  const handleTrackClick = useCallback(
    (e) => {
      const rect = e.target.getBoundingClientRect()
      const diff = e.clientX - rect.x - rect.width * (initialValue / 100)
      invokeChange(diff / ((rect.width * initialValue) / 100))
    },
    [invokeChange]
  )

  const handleTouchStart = useCallback(() => {
    setMoving(true)
  }, [])

  const handleTouchMove = useCallback(
    (e) => {
      const touch = e.touches[0]
      const parentRect = e.target.parentElement.getBoundingClientRect()
      const diff = touch.clientX - parentRect.x - parentRect.width * (initialValue / 100)

      const percent = diff / (parentRect.width / 2)

      invokeChange(percent)
    },
    [invokeChange]
  )

  const handleTouchEnd = useCallback(() => {
    setMoving(false)
  }, [])

  useUpdate(() => {
    setPercentage(value)
  }, [value])

  const handleBtnClick = useCallback(
    (thr) => () => {
      invokeChange(value + thr)
    },
    [invokeChange, value]
  )

  const handlePrevent = useCallback((e) => {
    e.stopPropagation()
  }, [])

  const handleClickLimit = useCallback(
    (pct) => (e) => {
      handlePrevent(e)
      invokeChange(pct)
    },
    [handlePrevent, invokeChange]
  )

  const trackBtnStyle = useMemo(() => {
    return { left: `${initialValue + initialValue * percentage}%` }
  }, [percentage])

  return (
    <View className={prefixClass()}>
      <View className={prefixClass('body')}>
        {isBtn ? (
          <Kpm
            type={['show', 'click']}
            data={{ dpm: '33.5.1.1' }}
            onClick={handleBtnClick(-threshold)}
            className={classNames([prefixClass('btn')])}
            style={{ backgroundImage: `url(${IconVertical})` }}
          />
        ) : null}
        <View className={classNames([prefixClass('track')])} onClick={handleTrackClick}>
          <View
            onClick={handleClickLimit(-1)}
            className={classNames([prefixClass('track-text'), prefixClass('track-text-start')])}
          >
            <Kpm type={['show', 'click']} data={{ dpm: '33.5.1.1' }}>
              {leadingText}
            </Kpm>
          </View>
          <View
            style={trackBtnStyle}
            onClick={handlePrevent}
            className={classNames([prefixClass('track-btn'), { [prefixClass('track-btn-ans')]: !isMoving }])}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          <View
            onClick={handleClickLimit(1)}
            className={classNames([prefixClass('track-text'), prefixClass('track-text-end')])}
          >
            <Kpm type={['show', 'click']} data={{ dpm: '33.5.1.2' }}>
              {trailingText}
            </Kpm>
          </View>
        </View>
        {isBtn ? (
          <Kpm
            type={['show', 'click']}
            data={{ dpm: '33.5.1.2' }}
            onClick={handleBtnClick(threshold)}
            className={classNames([prefixClass('btn')])}
            style={{ backgroundImage: `url(${IconPlus})` }}
          />
        ) : null}
      </View>
    </View>
  )
}
export default Slider
