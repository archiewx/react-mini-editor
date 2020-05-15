/* eslint-disable react/jsx-filename-extension */
import React from 'react'

import { useOptimizeScrollBox } from '../../lib/logic'
import { RelieveArea } from '../StickyContainer'

function OptimizeOverflowView({ children, ...props }) {
  const [boxNode, onTouchStart] = useOptimizeScrollBox()

  return (
    <RelieveArea {...props} ref={boxNode} onTouchStart={onTouchStart}>
      {children}
    </RelieveArea>
  )
}

export default OptimizeOverflowView
