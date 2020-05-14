/* eslint-disable react/jsx-filename-extension */
import ReactDOM from 'react-dom'
import React, { useRef, useImperativeHandle, useEffect } from 'react'
import { withRatio } from '../../lib/css'

function Painter({ layout, ratio }, ref) {
  const painter = useRef()

  useImperativeHandle(ref, () => ({
    getPainter() {
      return painter.current
    }
  }))

  const dom = useRef()
  useEffect(() => {
    dom.current = document.createElement('div')
    window.document.body.appendChild(dom.current)

    return () => {
      window.document.body.removeChild(dom.current)
    }
  }, [])

  if (!dom.current) return null

  return ReactDOM.createPortal(
    <canvas
      style={{ display: 'none' }}
      width={withRatio(layout.width)}
      height={withRatio(layout.height)}
      ref={painter}
    />,
    dom.current
  )
}

export default React.forwardRef(Painter)
