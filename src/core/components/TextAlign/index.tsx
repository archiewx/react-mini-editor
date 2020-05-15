/* eslint-disable react/jsx-filename-extension */
/*
 * @Date: 2019-08-20 15:08:22
 * @Last Modified time: 2019-08-20 15:08:22
 * 文字排版
 */
import { View } from '@tarojs/components'
import React, { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import Kpm from 'src/components/Kpm'
import { usePrevious } from 'src/lib/custom-hooks'
import { noop } from 'src/lib/function'
import { createPrefixClass } from 'src/lib/string'

import { TEXT_ALIGN } from './constants'
import * as images from './images'
import styles from './styles.module.less'

const prefixClass = createPrefixClass(styles, 'text-align')
const alignList = [
  {
    name: '左对齐',
    icon: images.IconAlignLeft,
    type: TEXT_ALIGN.LEFT,
    key: 'textAlign',
    value: 'left',
    dpm: '33.5.1.3'
  },
  {
    name: '居中',
    icon: images.IconAlignCenter,
    type: TEXT_ALIGN.CENTER,
    key: 'textAlign',
    value: 'center',
    dpm: '33.5.1.4'
  },
  {
    name: '右对齐',
    icon: images.IconAlignRight,
    type: TEXT_ALIGN.RIGHT,
    key: 'textAlign',
    value: 'right',
    dpm: '33.5.1.5'
  }
]

function TextAlign({ value = null, onChange = noop }) {
  const [selected, setSelected] = useState(null)
  const prevValue = usePrevious(value)

  const handleClick = useCallback(
    (item) => () => {
      onChange(item)
    },
    [onChange]
  )

  useEffect(() => {
    if (value !== prevValue) {
      const align = alignList.find((aln) => aln.type === value)
      if (align) setSelected(align)
    }
  }, [prevValue, selected, value])

  return (
    <View className={prefixClass()}>
      <View className={prefixClass('wrap')}>
        {alignList.map((align) => (
          <Kpm
            type={['show', 'click']}
            data={{ dpm: align.dpm }}
            key={align.type}
            style={{ backgroundImage: `url(${align.icon})` }}
            onClick={handleClick(align)}
            className={classNames([
              prefixClass('item'),
              { [prefixClass('item-selected')]: selected && selected.type === align.type }
            ])}
          >
            {align.name}
          </Kpm>
        ))}
      </View>
    </View>
  )
}
export default TextAlign
