import { useEffect, useMemo } from 'react'
import { noop } from 'src/lib/function'
import merge from 'lodash/merge'
import { logMark } from './log'
import { H5DS_ADAPTER } from './constants'

const defaultMountOption = { plugins: [], pluginHost: '', scope: 'layer' }
export function useMountedPlugin(mountOption, onStatusChange = noop) {
  const { plugins, pluginHost, scope } = useMemo(() => merge({}, defaultMountOption, mountOption), [mountOption])

  useEffect(() => {
    if (!plugins || !plugins.length) return

    const installPlugins = async () => {
      try {
        logMark('加载插件', plugins)
        await mountExtensionPlugins(plugins, pluginHost, scope)
        logMark('加载插件成功', plugins)
        onStatusChange()
      } catch (error) {
        onStatusChange(error)
      }
    }
    installPlugins()

    return () => {
      logMark('卸载插件')
      plugins.forEach(unmountPlugin)
    }
  }, [onStatusChange, pluginHost, plugins, scope])
}

// 卸载插件
export function unmountPlugin(pluginName) {
  if (window.H5DS_GLOBAL) {
    try {
      const pluginJSDom = document.getElementById(`css_${pluginName}`)
      pluginJSDom && pluginJSDom.remove()
      const pluginCSSDom = document.getElementById(`js_${pluginName}`)
      pluginCSSDom && pluginCSSDom.remove()
      delete window.H5DS_GLOBAL.plugins[pluginName]
    } catch (e) {
      window.console.error('卸载失败', e)
    }
  } else {
    window.console.warn('未挂载任何插件')
  }
}

export async function mountExtensionPlugins(plus = [], pluginHost = '', scope = 'layer') {
  // load插件，自动挂载，css可以忽略加载
  for (let i = 0; i < plus.length; i++) {
    const pid = plus[i]
    if (pid) {
      await cssLazy(`${pluginHost}/plugins/${pid}/${scope}/style.css`, `css_${pid}`)
    }
  }
  for (let i = 0; i < plus.length; i++) {
    const pid = plus[i]
    if (pid) {
      const src = `${pluginHost}/plugins/${pid}/${scope}/index.js`
      await jsLazy(src, `js_${pid}`)
      // 进度条
      if (window.pubSubLayer) {
        window.pubSubLayer.publish('h5ds.load.plugins', {
          count: plus.length,
          index: i + 1,
          progress: (i + 1) / plus.length,
          name: src,
          type: 'plugin'
        })
      }
    }
  }
}

export function jsLazy(src, id) {
  return new Promise((resolve, reject) => {
    // 加载之前先判断是否存在，如果存在，就不加载了
    if (id && document.getElementById(id)) {
      window.console.log('已经存在js资源', src, ' id:', id)
      resolve(true)
    } else {
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.charset = 'utf-8'
      script.async = 'async'
      script.id = id
      script.src = src // 防止缓存数据
      document.head.appendChild(script)
      script.onload = () => {
        resolve(script)
      }
      script.onerror = () => {
        window.console.error('js加载失败', src)
        reject(src)
      }
    }
  })
}

export function cssLazy(url, id) {
  if (!url) {
    return false
  }
  // 加载之前先判断是否存在，如果存在，就不加载了
  if (id && document.getElementById(id)) {
    window.console.log('已经存在css资源', url, ' id:', id)
    return
  }
  const head = document.getElementsByTagName('head')[0]
  const link = document.createElement('link')
  link.type = 'text/css'
  link.rel = 'stylesheet'
  link.id = id
  link.href = url
  head.appendChild(link)
}

export function getPlugin(type) {
  const { plugins } = window[H5DS_ADAPTER.H5DS_GLOBAL] || {}
  if (!type || !plugins || !plugins[type]) return { Plugin: null, pluginKeys: [] }

  const { LayerComp: Plugin } = plugins[type]
  const pluginKeys = Object.keys(plugins)
  return { Plugin, pluginKeys }
}

export function convertH5DSProperties(props) {
  return {
    appData: props.appData,
    pageData: props.data,
    layer: props.elem,
    isRender: true
  }
}
