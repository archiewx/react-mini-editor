/* eslint-disable react/jsx-filename-extension */
/*
 * @Date: 2019-08-19 14:45:27
 * @Last Modified time: 2019-08-19 14:45:27
 * 工具操作箱
 */
import { View } from '@tarojs/components'
import React, { useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'
import Kpm from 'src/components/Kpm'
import { usePrevious } from 'src/lib/custom-hooks'
import { noop } from 'src/lib/function'
import { createPrefixClass } from 'src/lib/string'

import ColorPicker from '../ColorPicker'
import Slider from '../Slider'
import TextAlign from '../TextAlign'
import styles from './styles.module.less'
import * as images from './images'
import { cssUnit2Number, rgbColor2Hex, hexColor2Rgb } from '../../lib/css'
import { TEXT_ACTION_TYPE } from '../../lib/constants'

const prefixClass = createPrefixClass(styles, 'element-text-toolkit')

function useSelectedBG(type, itemType, bgList = []) {
  const [bg, setBg] = useState(bgList[0])
  const [selected, setSelected] = useState(false)

  useEffect(() => {
    setSelected(type === itemType)

    if (type === itemType) setBg(bgList[1])
    else setBg(bgList[0])
  }, [type, itemType, bgList.length, bgList])

  return [selected, bg]
}

function TextController(props) {
  const {
    defaultType,
    align = null,
    percentage = 0,
    colorValue = null,
    onClick = noop,
    // onFontSizeChange = noop,
    element
  } = props

  const preDefaultType = usePrevious(defaultType)
  const [type, setType] = useState(null)
  const [isEdit, editIcon] = useSelectedBG(type, TEXT_ACTION_TYPE.TEXT_EDIT, [
    images.IconUnKeyboard,
    images.IconKeyboard
  ])
  const [isFont, fontIcon] = useSelectedBG(type, TEXT_ACTION_TYPE.TEXT_FONT_SIZE, [images.IconUnFont, images.IconFont])
  const [isColor, colorIcon] = useSelectedBG(type, TEXT_ACTION_TYPE.TEXT_COLOR, [images.IconUnColor, images.IconColor])

  const handleItemClick = useCallback(
    (itemType) => () => {
      setType(itemType)
      onClick(itemType)
    },
    [onClick]
  )

  useEffect(() => {
    if (defaultType !== preDefaultType) setType(defaultType)
  }, [defaultType, preDefaultType])

  const handleSliderChange = useCallback(
    (percent) => {
      if (!element.originStyle || !element.originStyle.fontSize) {
        element.originStyle = element.originStyle || {}
        element.originStyle.fontSize = element.data.style.fontSize
      }
      const fs = cssUnit2Number(element.originStyle.fontSize)
      element.data.style.fontSize = fs.value + fs.value * (percent * 0.5) + fs.unit
    },
    [element]
  )

  const handleAlignChange = useCallback(
    (aln) => {
      element.data.style = element.data.style || {}
      element.data.style[aln.key] = aln.value
      // eventEmit.emit('text:change', { type: 'align', payload: aln })
    },
    [element]
  )

  const handleColorChange = useCallback(
    (color) => {
      if (!element.originStyle || !element.originStyle.color) {
        element.originStyle = element.originStyle || {}
        element.originStyle.color = element.data.style.color
      }

      if (!color) color = rgbColor2Hex(element.originStyle.color)

      const rgbColor = hexColor2Rgb(color)
      element.data.style.color = rgbColor
    },
    [element]
  )

  return (
    <View className={prefixClass()}>
      <View className={prefixClass('wrap')}>
        <View className={prefixClass('leading')}>
          <View
            onClick={handleItemClick(TEXT_ACTION_TYPE.TEXT_EDIT)}
            className={classNames([
              prefixClass('action-item'),
              prefixClass('action-item-keyboard'),
              { [prefixClass('action-item-selected')]: isEdit }
            ])}
            style={{ backgroundImage: `url(${editIcon}` }}
          >
            编辑
          </View>
        </View>
        <View className={prefixClass('trailing')}>
          <View
            onClick={handleItemClick(TEXT_ACTION_TYPE.TEXT_FONT_SIZE)}
            className={classNames([
              prefixClass('action-item'),
              prefixClass('action-item-font'),
              { [prefixClass('action-item-selected')]: isFont }
            ])}
            style={{
              backgroundImage: `url(${fontIcon})`
            }}
          >
            <Kpm type={['show', 'click']} data={{ dpm: '33.5.1.0' }}>
              字号
            </Kpm>
          </View>
          <View
            onClick={handleItemClick(TEXT_ACTION_TYPE.TEXT_COLOR)}
            className={classNames([
              prefixClass('action-item'),
              prefixClass('action-item-color'),
              { [prefixClass('action-item-selected')]: isColor }
            ])}
            style={{ backgroundImage: `url(${colorIcon})` }}
          >
            <Kpm type={['show', 'click']} data={{ dpm: '33.5.2.0' }}>
              颜色
            </Kpm>
          </View>
        </View>
      </View>
      {isFont ? (
        <View className={prefixClass('setting-box')}>
          <Slider isBtn onChange={handleSliderChange} value={percentage} />
          <View className={prefixClass('align-box')}>
            <TextAlign onChange={handleAlignChange} value={align} />
          </View>
        </View>
      ) : null}
      {isColor ? (
        <View className={prefixClass('color-picker-box')}>
          <ColorPicker value={colorValue} onChange={handleColorChange} />
        </View>
      ) : null}
    </View>
  )
}
export default TextController
