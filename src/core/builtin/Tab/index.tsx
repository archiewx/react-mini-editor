/* eslint-disable react/jsx-filename-extension */
import React, { useContext, useCallback } from 'react'
import classNames from 'classnames'
import { ThemeContext } from '../../context'
import { createPrefixClass } from 'src/lib/string'
import styles from './styles.module.less'

const prefixCls = createPrefixClass(styles, 'm-tab')

function MTab({ tabs, elements, invoke, pluginWhiteList, activeGroup }) {
  const {
    group = {},
    groupClassName = '',
    groupItem = {},
    groupItemClassName = '',
    groupItemActive = {},
    groupItemActiveClassName = ''
  } = useContext(ThemeContext)

  const handleSwitchEditType = useCallback(
    (type, length) => () => {
      invoke.updateActiveGroup(type)
    },
    [invoke]
  )

  const getFilterLength = useCallback(
    (contain) => {
      const filtered = elements.filter(
        (elem) => contain.includes(elem.type) && (!elem.set.lock || pluginWhiteList.includes(elem.pid))
      )
      return filtered.length
    },
    [elements, pluginWhiteList]
  )

  return (
    <div className={classNames([prefixCls(), groupClassName])} style={group}>
      {tabs.map((tab) => (
        <div
          key={tab.value}
          style={tab.value === activeGroup ? groupItemActive : groupItem}
          className={classNames([
            prefixCls('item'),
            groupItemClassName,
            {
              [prefixCls('item-active')]: tab.value === activeGroup,
              [groupItemActiveClassName]: tab.value === activeGroup
            }
          ])}
          onClick={handleSwitchEditType(tab.value, getFilterLength(tab.contain))}
        >
          <span>
            {tab.name}({getFilterLength(tab.contain)})
          </span>
        </div>
      ))}
    </div>
  )
}

MTab.Plugin = {
  mid: 'builtinTabPlugin',
  type: 'tab',
  text: '分类tab',
  mode: 'material',
  render(props) {
    return <MTab {...props} />
  }
}

export default MTab
