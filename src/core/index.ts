/* eslint-disable react/jsx-filename-extension */
/* eslint-disable react/forbid-elements */
import omit from 'lodash/omit'
import React, { useMemo } from 'react'
import { getUrlQuery } from 'src/lib/string'

import { useBootstrap, useInterceptor, usePlugins } from './bootstrap'
import { MPreviewFrame } from './builtin'
import Catch from './Catch'
import StickyContainer from './components/StickyContainer'
import { MEditorContext, ThemeContext } from './context'
import { useExposeHandle, useInvokeUpdate } from './lib/logic'
import renderer from './lib/renderer'
import { useH5DSJson } from './lib/transform'

const pluginWhiteList = ['map']
// note: react 具有良好的更新算法，这里函数组件需要尽量多使用hook，保证不必要更新，
// 举例来说，组件A，B，在父级组件P内，P 里面具有控制A和B的状态，只要修改属性的时候，保证
// 保证A和B 无关值不变。例如控制A组件变量a，B的组件b。除非常量，数组，函数，对象都必须使用
// useCallback, useMemo 来包裹,这样就不会因为a的变化导致B组件的更新
function MEditor(props, ref) {
  const { h5dsJSON, swiperOption, theme, hidePages, screenRatio = 1 } = props
  const bootOptions = useMemo(() => omit(props, 'h5dsJSON'), [props])
  useBootstrap(bootOptions)

  const h5ds = useH5DSJson(h5dsJSON, props)
  usePlugins(h5ds)
  const interOp = useMemo(() => ({ ...props, h5ds }), [h5ds, props])
  useInterceptor(interOp)

  const invokeUpdate = useInvokeUpdate(h5ds)

  const invoke = useMemo(() => ({ ...invokeUpdate.invoke, ...h5ds.invoke }), [h5ds.invoke, invokeUpdate.invoke])
  const contextValue = useMemo(
    () => ({
      renderer,
      pageLayout: h5ds.pageLayout,
      h5ds: h5ds.data,
      pages: h5ds.pages,
      elements: h5ds.elements,
      pluginWhiteList,
      swiperOption: { ...(swiperOption || {}), initialSlide: +getUrlQuery('page') || 0 },
      pageIndex: h5ds.page,
      hidePages,
      invoke,
      screenRatio,
      ...invokeUpdate.spread
    }),
    [
      h5ds.pageLayout,
      h5ds.data,
      h5ds.pages,
      h5ds.elements,
      h5ds.page,
      swiperOption,
      hidePages,
      invoke,
      screenRatio,
      invokeUpdate.spread
    ]
  )

  const themeContextValue = useMemo(() => theme || {}, [theme])

  const mPreview = useExposeHandle(ref, { h5ds, invoke })

  return useMemo(
    () => (
      <Catch>
        <MEditorContext.Provider value={contextValue}>
          <ThemeContext.Provider value={themeContextValue}>
            <StickyContainer>
              <MPreviewFrame ref={mPreview} />
            </StickyContainer>
          </ThemeContext.Provider>
        </MEditorContext.Provider>
      </Catch>
    ),
    [contextValue, mPreview, themeContextValue]
  )
}

export default React.forwardRef(MEditor)
