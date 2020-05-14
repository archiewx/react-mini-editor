/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import { RelieveArea } from '../../components/StickyContainer'

function TextGroup({ children, render, elements, invoke }) {
  return (
    <RelieveArea>
      {elements.map((elem, index) => (
        <React.Fragment key={elem.keyid}>{render(elem.type, { elem, index, invoke })}</React.Fragment>
      ))}
    </RelieveArea>
  )
}

TextGroup.Plugin = {
  mid: 'builtinTextGroup',
  type: 'text',
  text: '文本',
  mode: 'group',
  contain: ['text'],
  render(props) {
    return <TextGroup {...props} />
  }
}

export default TextGroup
