/* eslint-disable react/jsx-filename-extension */
import React, { useEffect } from 'react'
import { useForceUpdate } from '../../lib/logic'
import { logMark } from '../../lib/log'
import styles from './styles.module.less'
import { createPrefixClass } from 'src/lib/string'
import { getPlugin } from '../../lib/h5ds-adapter'

const prefixCls = createPrefixClass(styles, 'map-render')

function MapRenderer({ elem, data, appData, hook }) {
  const forceUpdate = useForceUpdate()
  useEffect(() => {
    hook.install.tap('install', () => {
      logMark('安装map 成功')
      forceUpdate()
      return true
    })
  }, [forceUpdate, hook])

  if (!elem) return null

  const { Plugin, pluginKeys } = getPlugin(elem.type)
  if (!Plugin) return null

  return <Plugin appData={appData} plugins={pluginKeys} pageData={data} layer={elem} isRender />
}

function MapEditRender({ elements, invoke }) {
  return (
    <div className={prefixCls('edit')}>
      {elements.map((el) => (
        <div key={el.keyid} className={prefixCls('edit-item')}>
          {el.data.location.poiaddress}
        </div>
      ))}
    </div>
  )
}

const MMap = {
  Plugin: {
    type: 'map',
    text: '地图',
    mid: 'mapPlugin',
    group: 'other',
    mode: 'element',
    render: {
      show(props) {
        return <MapRenderer {...props} />
      },
      edit(props) {
        return <MapEditRender {...props} />
      }
    }
  }
}

export default MMap
