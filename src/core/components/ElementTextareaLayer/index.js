/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/forbid-elements */
/*
 * @Date: 2019-08-20 20:21:10
 * @Last Modified time: 2019-08-20 20:21:10
 * 输入层
 */
import { View } from '@tarojs/components'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import FloatLayer from 'src/components/FloatLayer'
import { usePrevious } from 'src/lib/custom-hooks'
import { noop } from 'src/lib/function'
import platform from 'src/lib/platform'
import storage from 'src/lib/storage'
import { createPrefixClass } from 'src/lib/string'

import { replaceHTML } from '../../lib/canvas'
import styles from './styles.module.less'

const prefixClass = createPrefixClass(styles, 'input-layer')

function ElementTextareaLayer({ visible = false, onCancelLayer = noop, onConfirm = noop, defaultValue }) {
  const [inputText, setInputText] = useState(defaultValue || '')
  const preValue = usePrevious(defaultValue)
  const textareaNode = useRef()
  const [hideTips, setHideTips] = useState(storage.get('editor-hide-tips'))

  useEffect(() => {
    if (!textareaNode.current) return

    if (visible) {
      const timer = setTimeout(() => {
        textareaNode.current.focus()
      }, 500)
      return () => {
        clearTimeout(timer)
      }
    } else textareaNode.current.blur()
  }, [visible])

  const handleInputChange = useCallback((e) => {
    storage.set('editor-hide-tips', true)
    setHideTips(true)
    setInputText(e.target.value)
  }, [])

  const handleConfirm = useCallback(
    (e) => {
      if (e.Key === 'Enter') {
        onConfirm(inputText)
      }
    },
    [inputText, onConfirm]
  )

  const handleBlur = useCallback(() => {
    if (platform.isIOS()) document.activeElement.scrollIntoViewIfNeeded(true)
  }, [])

  useEffect(() => {
    if (defaultValue && defaultValue !== preValue) {
      setInputText(replaceHTML(defaultValue))
    }
  }, [defaultValue, preValue])

  return (
    <FloatLayer className={prefixClass()} bodyClassName={prefixClass('body')} visible={visible}>
      <View
        onClick={onCancelLayer}
        className={classNames(['iconfont', 'icon-guanbi', prefixClass('icon'), prefixClass('icon-close')])}
      />
      <View
        onClick={handleConfirm}
        className={classNames(['iconfont', 'icon-duihao', prefixClass('icon'), prefixClass('icon-confirm')])}
      />
      <View className={prefixClass('input-box')}>
        <View className={prefixClass('expand-box')} dangerouslySetInnerHTML={{ __html: inputText }}>
          {inputText}
        </View>
        <textarea
          ref={textareaNode}
          autoFocus
          autoComplete="false"
          className={prefixClass('el')}
          value={inputText}
          onInput={handleInputChange}
          onKeyPress={handleConfirm}
          onBlur={handleBlur}
        />
        {platform.isIOS() && !hideTips && <View className={prefixClass('ios-tips')}>（点击文字即可修改）</View>}
      </View>
    </FloatLayer>
  )
}
export default ElementTextareaLayer
