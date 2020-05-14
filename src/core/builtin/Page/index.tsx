/* eslint-disable react/jsx-filename-extension */
import React, { useMemo } from 'react'
import { createPrefixClass } from 'src/lib/string'
import classNames from 'classnames'

import MBox from '../MBox'
import styles from './styles.module.less'

const prefixCls = createPrefixClass(styles, 'm-page')

function MPage({ renderer, data, invoke, appData }) {
  const render = useMemo(() => renderer.generate({ way: renderer.RENDER.SHOW, mode: renderer.PLUGIN_MODE.ELEMENT }), [
    renderer
  ])

  return (
    <div className={classNames([prefixCls()])}>
      {render &&
        data.layers.map((elem, index) => (
          <MBox key={elem.keyid} element={elem}>
            {render(elem.type, { elem, index, invoke, data, appData })}
          </MBox>
        ))}
    </div>
  )
}

export default MPage
