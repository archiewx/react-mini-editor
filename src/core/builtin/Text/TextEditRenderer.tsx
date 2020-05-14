/* eslint-disable react/no-danger */
/* eslint-disable react/jsx-filename-extension */
import React, { useCallback, useState, useContext } from 'react'
import classNames from 'classnames'
import { createPrefixClass } from 'src/lib/string'
import { replaceSpace, replaceHTML, insertNewline, ignoreSpecTag } from '../../lib/canvas'
import styles from './styles.module.less'
import { ThemeContext } from '../../context'

const prefixCls = createPrefixClass(styles, 'edit-renderer')

const getConvertText = (text) => {
  return replaceSpace(replaceHTML(insertNewline(ignoreSpecTag(text))))
}

const getConvertTitle = (text) => {
  return replaceSpace(replaceHTML(ignoreSpecTag(text)))
}

function TextEditRenderer({ elem, invoke }) {
  const [val, setVal] = useState(elem.data.data)
  const { editText, editTextClassName } = useContext(ThemeContext)

  const handleTextareaChange = useCallback(
    (e) => {
      let { value } = e.target
      setVal(value)

      if (/^\s+$/g.test(value)) value = ''
      invoke.updateElement(elem, { data: { data: value } })
    },
    [invoke, elem]
  )

  const handleFocus = useCallback(() => {
    invoke.updateActiveElement(elem)
  }, [invoke, elem])

  const handleClear = useCallback(() => {
    setVal('')
    invoke.updateElement(elem, { data: { data: '' } })
  }, [elem, invoke])

  return (
    <div className={classNames([prefixCls('text-edit-element'), editTextClassName])} style={editText}>
      <div className={prefixCls('text-edit-title')}>
        {getConvertTitle(elem.originData.data)}
        <span style={{ color: '#999' }}>（最多{getConvertText(elem.templateData.data).length}个字）</span>
      </div>
      <label className={prefixCls('text-edit-item')}>
        <div
          className={prefixCls('text-edit-expend')}
          dangerouslySetInnerHTML={{ __html: getConvertText(elem.data.data) }}
        />
        <textarea
          value={getConvertText(val)}
          // defaultValue={getConvertText(elem.data.data)}
          className={prefixCls('text-edit-el')}
          onChange={handleTextareaChange}
          maxLength={getConvertText(elem.templateData.data).length}
          onFocus={handleFocus}
        />
        {elem.data.data && <div className={prefixCls('text-edit-clear')} onClick={handleClear} />}
      </label>
    </div>
  )
}

export default TextEditRenderer
