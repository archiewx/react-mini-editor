/* eslint-disable react/jsx-filename-extension */
import React, { useMemo, useContext, useCallback } from 'react'
import classNames from 'classnames'
import { ELEMENT_TYPE } from '../../lib/constants'
import styles from './styles.module.less'
import { createPrefixClass } from 'src/lib/string'
import { ThemeContext, MEditorContext } from '../../context'

const prefixClass = createPrefixClass(styles, 'm-box')

function MBox({ children, element }) {
  const { box = {}, boxClassName = '' } = useContext(ThemeContext)
  const style = useMemo(() => {
    const ele = element
    // const filteredKey = ['transform', 'WebkitTransform']
    // note: 初版为了使用边框切割方式来实现图片拆件，现在不必，先去掉transform 拦截
    const filteredKey = []
    return Object.keys(ele.style)
      .filter((k) => !(ele.type === ELEMENT_TYPE.IMAGE && filteredKey.includes(k)))
      .reduce(
        (acc, key) => {
          acc[key] = ele.style[key]
          return acc
        },
        { ...box, ...(element.estyle || {}), opacity: 1 }
      )
  }, [box, element])
  const { active, invoke } = useContext(MEditorContext)

  const handleClick = useCallback(
    (e) => {
      e.stopPropagation()
      invoke.updateActiveElement(element)
    },
    [element, invoke]
  )

  return (
    <div
      style={style}
      data-keyid={element.keyid}
      onClick={handleClick}
      className={classNames([
        prefixClass(),
        {
          [prefixClass('lock')]: active.el && active.el.type === ELEMENT_TYPE.TEXT ? false : element.set.lock,
          // [prefixClass('element-notice-ans')]: !element.set.lock,
          [prefixClass('selected')]: !element.set.lock && active === element
        },
        boxClassName
      ])}
    >
      {children}
    </div>
  )
}

export default MBox
