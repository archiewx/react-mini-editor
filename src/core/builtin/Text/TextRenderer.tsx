/* eslint-disable react/no-danger */
/* eslint-disable react/jsx-filename-extension */
import React, { useCallback } from 'react'
import classNames from 'classnames'
import { createPrefixClass } from 'src/lib/string'

import styles from './styles.module.less'

const prefixClass = createPrefixClass(styles, 'text-elem')
const ART_WORD = ['jianBian']

function TextRenderer({ elem = null, invoke }) {
  const { data: metaData, selected } = elem || {}

  const getStyle = useCallback(() => {
    if (!metaData) return {}
    let stl = { ...metaData.style }

    if (metaData.artword && ART_WORD.indexOf(metaData.artword.type) > -1) {
      stl = {
        ...stl,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundImage: `-webkit-linear-gradient(90deg, ${metaData.artword.colors.join(',')})`
      }
    }

    return stl
  }, [metaData])

  const handleClick = useCallback(
    (e) => {
      invoke.updateActiveElement(elem)
    },
    [elem, invoke]
  )

  return elem ? (
    <div
      style={getStyle()}
      className={classNames([prefixClass(), { [prefixClass('text-selected')]: selected }])}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: metaData.data }}
    />
  ) : null
}

export default TextRenderer
