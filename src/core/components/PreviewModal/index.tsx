/* eslint-disable react/jsx-filename-extension */
/*
 * @Date: 2019-08-26 16:45:15
 * @Last Modified time: 2019-08-26 16:45:15
 * 预览盒子
 */
import { View } from '@tarojs/components'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import classNames from 'classnames'
import { noop } from 'src/lib/function'
import { createPrefixClass } from 'src/lib/string'
import FloatLayer from 'src/pages/daily/components/FloatLayer'
import Loading from 'src/components/LoadMore/Loading'

import styles from './styles.module.less'

const prefixClass = createPrefixClass(styles, 'preview')

function PreviewModal({ visible = false, onCancelLayer = noop, dataURL = null, canvas = null }) {
  const [useKey, setUseKey] = useState(Math.random())
  const [touchPos, setTouchPos] = useState({ startX: 0, startY: 0 })
  const [style, setStyle] = useState({ top: 0, left: 0 })
  const [isMoving, setMoving] = useState(false)

  useEffect(() => {
    if (!visible) setUseKey(Math.random())
  }, [visible])

  const boxStyle = useMemo(() => {
    return {
      position: 'relative',
      backgroundImage: `url(${dataURL})`,
      backgroundSize: 'auto 90%',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center 60%',
      ...style
    }
  }, [dataURL, style])

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0]
    setTouchPos({ startX: touch.clientX, startY: touch.clientY })
    setMoving(true)
  }, [])

  const handleTouchMove = useCallback(
    (e) => {
      const [touch] = e.touches
      const deltaX = touch.clientX - touchPos.startX
      const deltaY = touch.clientY - touchPos.startY
      setStyle({ left: deltaX, top: deltaY })
      e.stopPropagation()
      // e.preventDefault()
    },
    [touchPos]
  )

  const handleTouchEnd = useCallback(() => {
    setStyle({ top: 0, left: 0 })
    setMoving(false)
  }, [])

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation()
      onCancelLayer()
    },
    [onCancelLayer]
  )

  return (
    <FloatLayer visible={visible} onCancelLayer={onCancelLayer} bodyClassName={prefixClass('layer-body')}>
      <View className={classNames(['iconfont', 'icon-guanbi', prefixClass('close')])} />
      <Loading loading={!dataURL}>
        {!dataURL ? (
          <canvas ref={canvas} key={useKey} className={prefixClass('canvas-painter')} />
        ) : (
          <View
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
            style={boxStyle}
            className={classNames([prefixClass('image'), { [prefixClass('moving')]: isMoving }])}
          />
        )}
      </Loading>
      {/* {isFull || isNotBtn ? null : (
        <View className={classNames([ prefixClass('footer-corner'), prefixClass('footer') ])}>
          <Button
            color="#333"
            size="small"
            radius={50}
            className={classNames([ prefixClass('footer-btn'), prefixClass('footer-btn-override') ])}
            onClick={onCancelLayer}
          >
            取消
          </Button>
          <Button color="#fff" bgColor="#333" size="small" radius={50} className={prefixClass('footer-btn')}>
            保存
          </Button>
        </View>
      )} */}
    </FloatLayer>
  )
}
export default PreviewModal
