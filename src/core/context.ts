import React from 'react'
import { noop } from 'src/lib/function'
import renderer from './lib/renderer'

const context = {
  elements: [],
  active: { el: null, index: -1 },
  activeGroup: '',
  pageLayout: { width: window.innerWidth, height: window.innerHeight },
  invoke: {
    updateElement: noop,
    updateActiveElement: noop,
    updateActiveGroup: noop,
    updateActivePage: noop,
    updateElements: noop
  },
  h5ds: null,
  pages: [],
  pageIndex: 0,
  painter: null,
  renderer,
  pluginWhiteList: [],
  swiperOption: {},
  hidePages: [],
  screenRatio: 1
}

const themeContext = {
  page: {},
  pageClassName: '',
  interactive: {},
  interactiveClassName: '',
  frame: {},
  frameClassName: '',
  group: {},
  groupClassName: '',
  groupItem: {},
  groupItemClassName: '',
  groupItemActive: {},
  groupItemActiveClassName: '',
  box: {},
  boxClassName: '',
  editImage: {},
  editImageClassName: '',
  editText: {},
  editTextClassName: '',
  bottomArea: {},
  bottomAreaClassName: ''
}

export const MEditorContext = React.createContext(context)
export const ThemeContext = React.createContext(themeContext)

MEditorContext.displayName = 'MEditorContext'
ThemeContext.displayName = 'MEditorThemeContext'

export default MEditorContext
