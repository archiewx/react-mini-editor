/* eslint-disable react/jsx-filename-extension */
/*
 * @Date: 2019-08-19 14:48:04
 * @Last Modified time: 2019-08-19 14:48:04
 * action sheet
 */
import { View } from '@tarojs/components'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { isUndefined } from 'src/lib/function'
import { createPrefixClass } from 'src/lib/string'
import classNames from 'classnames'

import styles from './styles.module.less'

const prefixClass = createPrefixClass(styles, 'action-sheet')

function ActionSheet(props) {
  const { visible, children } = props
  const [vis, setVis] = useState(false)
  const [destroyed, setDestroyed] = useState(true)

  useEffect(() => {
    if (!isUndefined(visible) && vis !== visible) setVis(visible)

    if (visible) setDestroyed(false)
  }, [visible, vis])

  const style = useMemo(
    () => ({
      visibility: destroyed ? 'hidden' : 'visible'
    }),
    [destroyed]
  )
  const handleTransitionEnd = useCallback(() => {
    if (!visible) setDestroyed(true)
  }, [visible])

  return (
    <View className={prefixClass()} style={style}>
      <View
        className={classNames([
          prefixClass('wrap'),
          { [prefixClass('wrap-active')]: vis, [prefixClass('wrap-inactive')]: !vis }
        ])}
        onTransitionEnd={handleTransitionEnd}
      >
        {children}
      </View>
    </View>
  )
}
export default ActionSheet
