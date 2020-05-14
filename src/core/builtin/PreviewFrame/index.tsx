/* eslint-disable react/jsx-filename-extension */
import classNames from 'classnames'
import React, { useContext, useImperativeHandle, useRef, useMemo } from 'react'
import { createPrefixClass } from 'src/lib/string'

import { MEditorContext, ThemeContext } from '../../context'
import MInteractiveBox from '../MInteractiveBox'
import styles from './styles.module.less'
import Painter from '../../components/Painter'
import { RelieveArea } from '../../components/StickyContainer'

const prefixClass = createPrefixClass(styles, 'm-preview-frame')

function MPreviewFrame({ senior = false }, ref) {
  const context = useContext(MEditorContext)
  const { pageLayout, renderer, elements, invoke, h5ds, swiperOption, pages, screenRatio } = context
  const { frame, frameClassName = '', bottomArea, bottomAreaClassName } = useContext(ThemeContext)

  const painter = useRef()
  useImperativeHandle(ref, () => ({
    getPainter() {
      if (!painter.current) return
      return painter.current.getPainter()
    }
  }))

  const injectProps = useMemo(
    () => ({
      pageLayout,
      renderer,
      elements,
      invoke,
      h5ds,
      pages,
      swiperOption,
      screenRatio
    }),
    [elements, h5ds, invoke, pageLayout, pages, renderer, screenRatio, swiperOption]
  )

  const previewer = useMemo(() => renderer.getPreviewer(injectProps), [injectProps, renderer])

  return useMemo(
    () => (
      <div style={frame} className={classNames([prefixClass(), frameClassName])}>
        <RelieveArea className={prefixClass('wrap-outer')}>
          {previewer}
          {!senior && (
            <div className={classNames(prefixClass('bottom-area'), bottomAreaClassName)} style={bottomArea}>
              <MInteractiveBox />
            </div>
          )}
        </RelieveArea>
        <Painter layout={pageLayout} ref={painter} />
      </div>
    ),
    [bottomArea, bottomAreaClassName, frame, frameClassName, pageLayout, previewer, senior]
  )
}

export default React.forwardRef(MPreviewFrame)
