// note: 这部分已移除
/* eslint-disable react/jsx-filename-extension */
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { createPrefixClass } from 'src/lib/string'
import { renderIn } from 'h5ds/h5ds-core/config/smap'
import {
  loadExtensionScripts,
  mountBasicLayerPlugins,
  mountExtensionPlugins
} from 'h5ds/h5ds-core/h5ds-app-preview/tools'
import H5dsSwiper from 'h5ds/h5ds-core/h5ds-app-preview/swiper'
import 'swiper'

import styles from './styles.module.less'
import { showLoading, hideLoading } from 'src/components/Loading'
import { PLUGIN_HOST } from '../../lib/constants'
import share from 'src/lib/share'
import ProgressBar from './process-bar'

const prefixCls = createPrefixClass(styles, 'h5ds-view')

function H5DSView({ data, onChange }) {
  const [load, setLoad] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (load) {
      share.shareInit(() => {
        setTimeout(() => {
          const audio = document.querySelector('audio')
          audio && audio.play()
        }, 500)
      })
    }
  }, [load])

  const mountPluginsEnd = useCallback(async () => {
    // 挂载后加载scripts
    await loadExtensionScripts()

    setLoad(true)
  }, [])

  const mountExtendsPlugins = useCallback(async () => {
    // 挂载基础插件
    await mountBasicLayerPlugins()

    // 按需挂载扩展插件
    const { plugins } = data
    await mountExtensionPlugins(plugins, PLUGIN_HOST, 'layer')

    // 挂载成功，加载scripts
    await mountPluginsEnd()
    hideLoading()
  }, [data, mountPluginsEnd])

  useEffect(() => {
    showLoading()
    if (!data) return

    mountExtendsPlugins()
  }, [data, mountExtendsPlugins])

  const h5dsStyle = useMemo(() => ({ width: window.innerWidth, height: window.innerHeight }), [])
  const handlePageChange = useCallback(
    (aci) => {
      setActiveIndex(aci)
      onChange && onChange(aci)
    },
    [onChange]
  )

  if (!load || !data) return null

  const { plugins } = window.H5DS_GLOBAL

  return (
    <div className={prefixCls()}>
      <H5dsSwiper
        style={h5dsStyle}
        plugins={{ pluginsKey: plugins }}
        data={data}
        // fixme: 这里待修复
        appId="2342432"
        renderIn={renderIn.RENDER_IN_PUBLISH}
        onChange={handlePageChange}
      />
      <ProgressBar activeIndex={activeIndex} slides={data.pages} />
    </div>
  )
}

export default H5DSView
