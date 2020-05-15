import React from 'react'
import TextRenderer from './TextRenderer'
import { drawText } from '../../lib/canvas'
import { cssUnit2Number } from '../../lib/css'
import TextEditRenderer from './TextEditRenderer'

const rendererConfig = {
  type: 'text',
  text: '文本',
  group: 'text',
  mode: 'element',
  mid: 'builtinText',
  render: {
    show(props) {
      return <TextRenderer {...props} />
    },
    edit(props) {
      return <TextEditRenderer {...props} />
    },
    paint({ ctx, elem, withRatio }) {
      const txtStyle = elem.data.style
      const fs = cssUnit2Number(txtStyle.fontSize)

      drawText(
        ctx,
        elem.data.data,
        {
          ...elem.data.style,
          width: withRatio(txtStyle.width),
          height: withRatio(txtStyle.height),
          fontSize: withRatio(fs.value),
          letterSpacing: withRatio(elem.data.style.letterSpacing === 'normal' ? 0 : elem.data.style.letterSpacing),
          transform: elem.style.transform
        },
        withRatio(txtStyle.width),
        withRatio(txtStyle.height),
        withRatio(elem.style.left),
        withRatio(elem.style.top)
      )
    }
  }
}

export default rendererConfig
