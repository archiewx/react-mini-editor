/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { createPrefixClass } from 'src/lib/string'
import styles from './styles.module.less'
import { RelieveArea } from '../../components/StickyContainer'

const prefixCls = createPrefixClass(styles, 'image-group')

function ImageGroup({ elements, render, invoke }) {
  return (
    <RelieveArea className={prefixCls()}>
      {elements.map((elem, index) => (
        <React.Fragment key={elem.keyid}>{render(elem.type, { elem, index, invoke })}</React.Fragment>
      ))}
    </RelieveArea>
  )
}

ImageGroup.Plugin = {
  mid: 'builtinImageGroup',
  type: 'image',
  text: '图片',
  mode: 'group',
  contain: ['image'],
  render(props) {
    return <ImageGroup {...props} />
  }
}

export default ImageGroup
