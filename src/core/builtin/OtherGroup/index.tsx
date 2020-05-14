/* eslint-disable react/jsx-filename-extension */
import React from 'react'

function OtherGroup({ children, ...props }) {
  return <div>Hello World</div>
}

OtherGroup.Plugin = {
  mid: 'builtinOtherGroup',
  type: 'other',
  text: '其他',
  mode: 'group',
  contain: ['map'],
  render(props) {
    return <OtherGroup {...props} />
  }
}

export default OtherGroup
