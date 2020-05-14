/* eslint-disable react/jsx-filename-extension */
/*
 * @Date: 2019-08-20 15:46:00
 * @Last Modified time: 2019-08-20 15:46:00
 * 颜色选择器
 */
import { View } from '@tarojs/components'
import React, { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import { usePrevious } from 'src/lib/custom-hooks'
import { noop } from 'src/lib/function'
import { createPrefixClass } from 'src/lib/string'

import { BUILT_IN_COLOR_ARRAY as colorArray } from './constants'
import styles from './styles.module.less'

const prefixClass = createPrefixClass(styles, 'color-picker')

function ColorPicker({ value = null, onChange = noop }) {
  const [color, setColor] = useState(value)
  const prevValue = usePrevious(value)

  useEffect(() => {
    if (value !== prevValue) {
      setColor(value ? value.toUpperCase() : null)
    }
  }, [value, prevValue])

  const handleClick = useCallback(
    (clr) => () => {
      onChange(clr ? clr.value : null)
    },
    [onChange]
  )

  const getItemStyle = useCallback((clr) => {
    if (!clr.isDefault) return { color: clr.value }
  }, [])

  return (
    <View className={prefixClass()}>
      <View className={prefixClass('wrap')}>
        <View onClick={handleClick(null)} className={classNames([prefixClass('item'), prefixClass('item-default')])} />
        {colorArray.map((clr) => (
          <View
            key={clr.value}
            style={getItemStyle(clr)}
            className={classNames([
              prefixClass('item'),
              { [prefixClass('item-default')]: clr.isDefault, [prefixClass('item-selected')]: color === clr.value }
            ])}
            onClick={handleClick(clr)}
          />
        ))}
      </View>
    </View>
  )
}
export default ColorPicker
