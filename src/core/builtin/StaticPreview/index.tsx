/* eslint-disable react/jsx-filename-extension */
import React, { useMemo, useContext } from 'react'
import classNames from 'classnames'
import { createPrefixClass } from 'src/lib/string'

import styles from './styles.module.less'
import { useComputedScale } from '../../lib/logic'
import MBox from '../MBox'
import { ThemeContext } from '../../context'

const prefixCls = createPrefixClass(styles, 'm-static-preview')

function MStaticPreview({ senior = false, renderer, pageLayout, elements, invoke, screenRatio }) {
  const render = useMemo(() => renderer.generate({ way: renderer.RENDER.SHOW, mode: renderer.PLUGIN_MODE.ELEMENT }), [
    renderer
  ])
  const { page = {}, pageClassName = '' } = useContext(ThemeContext)

  const scale = useComputedScale(pageLayout.width * screenRatio, pageLayout.height * screenRatio, senior ? 1 : 0.46)

  return (
    <div
      className={classNames([prefixCls(), pageClassName, { [prefixCls('senior')]: senior }])}
      style={{
        ...page,
        width: pageLayout.width,
        height: pageLayout.height,
        // zoom
        transform: `scale(${scale})`,
        WebkitTransform: `scale(${scale})`
      }}
    >
      {render &&
        elements.map((elem, index) => (
          <MBox key={elem.keyid} element={elem}>
            {render(elem.type, { elem, index, invoke })}
          </MBox>
        ))}
    </div>
  )
}

MStaticPreview.Plugin = {
  mid: 'builtinStaticPreview',
  type: 'static',
  mode: 'previewer',
  render(props) {
    return <MStaticPreview {...props} />
  }
}

export default MStaticPreview
