/* eslint-disable react/jsx-filename-extension */
import classNames from 'classnames'
import React, { useContext, useMemo } from 'react'
import { createPrefixClass } from 'src/lib/string'

import OptimizeOverflowView from '../../components/OptimizeOverflowView'
import { RelieveArea } from '../../components/StickyContainer'
import { MEditorContext, ThemeContext } from '../../context'
import { useInputAreaBehavior } from '../../lib/logic'
import styles from './styles.module.less'

const prefixCls = createPrefixClass(styles, 'm-editor-box')

function MInteractiveBox() {
  const { elements, invoke, activeGroup, renderer, pluginWhiteList } = useContext(MEditorContext)
  const { interactive = {}, interactiveClassName = '' } = useContext(ThemeContext)

  useInputAreaBehavior()

  const tabs = renderer.getEditable()

  const filterElements = useMemo(() => {
    const { contain } = tabs.find((tab) => tab.value === activeGroup) || {}
    if (!tabs.length || !contain) return []

    return elements.filter(
      (elem) => contain.includes(elem.type) && (!elem.set.lock || pluginWhiteList.includes(elem.pid))
    )
  }, [activeGroup, elements, pluginWhiteList, tabs])

  const renderGroup = useMemo(
    () => renderer.generate({ way: renderer.RENDER.EDIT, mode: renderer.PLUGIN_MODE.GROUP }),
    [renderer]
  )
  const render = useMemo(() => renderer.generate({ way: renderer.RENDER.EDIT, mode: renderer.PLUGIN_MODE.ELEMENT }), [
    renderer
  ])

  const renderTab = useMemo(() => renderer.generate({ way: renderer.RENDER.SHOW, mode: renderer.PLUGIN_MODE.MATERIAL }), [
    renderer
  ])

  return (
    <div style={interactive} className={classNames([prefixCls(), interactiveClassName])} key={activeGroup}>
      {renderTab('tab', { invoke, tabs, pluginWhiteList, activeGroup, elements })}
      <OptimizeOverflowView className={classNames([prefixCls('tab-box')])}>
        <RelieveArea>{renderGroup(activeGroup, { elements: filterElements, invoke, render })}</RelieveArea>
      </OptimizeOverflowView>
    </div>
  )
}

export default MInteractiveBox
