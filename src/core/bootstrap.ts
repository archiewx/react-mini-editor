import * as Sentry from '@sentry/browser'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { isObjectKeyAllTrue, isUndefined } from 'src/lib/function'
import camelCase from 'lodash/camelCase'

import { Image, MImageGroup, MStaticPreview, MSwiperPreview, MTextGroup, Text, MTab } from './builtin'
import MMap from './builtin/MMap'
import { PLUGIN_HOST } from './lib/constants'
import { useFonts } from './lib/css'
import { useMountedPlugin } from './lib/h5ds-adapter'
import mHook from './lib/hook'
import { errorMark } from './lib/log'
import { useForceUpdate } from './lib/logic'
import renderer from './lib/renderer'

export function useBootstrap(op) {
  const forceUpdate = useForceUpdate()
  const mounted = useRef(false)
  const bootOption = useRef(op)
  useEffect(() => {
    bootOption.current = op
  })

  const computedOp = useMemo(() => {
    if (!bootOption.current) return {}
    const op2 = { ...bootOption.current }

    if (isUndefined(op2.defaultPlugins)) op2.defaultPlugins = true

    const defaultPlugins = op2.defaultPlugins
      ? [
          Text,
          Image,
          MStaticPreview.Plugin,
          MSwiperPreview.Plugin,
          MMap.Plugin,
          MTextGroup.Plugin,
          MImageGroup.Plugin,
          MTab.Plugin
          // MOtherGroup.Plugin
        ]
      : []
    op2.plugins = defaultPlugins.concat(bootOption.current.plugins || [])
    return op2
  }, [])

  useEffect(() => {
    renderer.hooks.update.tap('renderer', () => {
      if (!mounted.current) return
      forceUpdate()
    })
    return () => {
      mounted.current = false
    }
  }, [forceUpdate])

  useEffect(() => {
    const { plugins, preview } = computedOp
    plugins.forEach((plugin) => {
      renderer.install(plugin)
    })
    if (preview) renderer.setPreviewer(preview)

    mounted.current = true
  }, [computedOp])
}

export function usePlugins(h5ds) {
  const mountOption = useMemo(
    () =>
      h5ds.plugins
        ? {
            plugins: h5ds.plugins,
            pluginHost: PLUGIN_HOST
          }
        : {},
    [h5ds.plugins]
  )
  const onStatusChange = useCallback(
    (err) => {
      if (!err) {
        const filtered = h5ds.plugins.filter((plugin) => Boolean(renderer.hooks[`${camelCase(plugin)}Plugin`]))
        filtered.forEach((plugin) => {
          renderer.hooks[`${camelCase(plugin)}Plugin`].install.call()
        })
        return
      }
      errorMark(err)
    },
    [h5ds.plugins]
  )
  useMountedPlugin(mountOption, onStatusChange)
  useFonts(h5ds.fonts)
}

export function useInterceptor(props) {
  const propsValue = useRef({})
  const load = useRef(false)

  useEffect(() => {
    propsValue.current = props
  }, [props])

  useEffect(() => {
    if (!isObjectKeyAllTrue(props.h5ds, ['localImage', 'plugins', 'fonts']) || load.current) return

    load.current = true
    const onLoad = () => {
      const {
        onEditorLoad,
        h5ds: { page, pages }
      } = propsValue.current
      onEditorLoad && onEditorLoad({ page, totalPage: pages.length })
    }
    onLoad()
  }, [props.h5ds])

  useEffect(() => {
    mHook.error.tap('errorPlugin', (error) => {
      const { onError } = propsValue.current
      Sentry.withScope((scope) => {
        scope.setTag('magiceditor', 'render')
        scope.setLevel(Sentry.Severity.Error)
        scope.setExtra('props', propsValue.current)
        scope.setExtra('load', load.current)
        Sentry.captureException(error)
      })
      onError && onError(error)
    })
  }, [])

  useEffect(() => {
    mHook.editorOn('pageChange', propsValue.current.onPageChange)
  }, [])
}
