import EventEmit from 'src/lib/EventEmit'
import invariant from 'invariant'
import { SyncHook, SyncBailHook } from 'tapable'
import { isPlainObject, noopNull } from 'src/lib/function'
import omit from 'lodash/omit'
import uniq from 'lodash/uniq'
import mHook from './hook'
import { errorMark, logMark } from './log'
import { getPlugin, convertH5DSProperties } from './h5ds-adapter'

export const evEmit = new EventEmit()

const RENDER = { SHOW: 'show', EDIT: 'edit', PAINT: 'paint' }
const MODE = { STATIC: 'static', SWIPER: 'swiper', AUTO: 'auto' }
const PLUGIN_MODE = { ELEMENT: 'element', PREVIEWER: 'previewer', GROUP: 'group', MATERIAL: 'material' }

const $render = Symbol('render')
const $cache = Symbol('cache')
const $groupCache = Symbol('groupCache')
const $previewer = Symbol('previewer')
const $blockPluginKeys = Symbol('blockPluginKeys')

class Renderer {
  RENDER = RENDER
  MODE = MODE
  PLUGIN_MODE = PLUGIN_MODE

  hooks = {
    update: new SyncHook(['reason'])
  }

  _mode = MODE.AUTO

  constructor() {
    this[$cache] = {}
    this[$groupCache] = {}
    this[$previewer] = noopNull
    this[$blockPluginKeys] = ['preview-']
  }

  install(renderer) {
    const { mid, apply, type, mode } = renderer
    const supportMode = this.getSupportedPluginMode()
    if (!supportMode.includes(mode)) {
      errorMark('not support mode, only support: ', supportMode)
    }
    logMark(type, mode, '安装成功')

    switch (mode) {
      case PLUGIN_MODE.GROUP:
        if (this[$cache][this._key(mode, type)]) {
          // 存在类型
          const { contain } = this[$cache][this._key(mode, type)]
          this[$cache][this._key(mode, type)] = { ...renderer, contain: uniq(renderer.contain.concat(contain)) }
        } else this[$cache][this._key(mode, type)] = renderer
        break
      case PLUGIN_MODE.ELEMENT: {
        // note: 如果此刻group未安装, 则先创建一个包含该类型的group
        // 存在
        const groupKey = this._key(PLUGIN_MODE.GROUP, renderer.group)
        if (this[$cache][groupKey]) {
          // 存在时候，判断当前是否存在，若存在判断该类型是否有
          const { contain } = this[$cache][groupKey]
          if (!contain.includes(type)) this[$cache][groupKey].contain = contain.concat([type])
        } else {
          this[$cache][groupKey] = { contain: [type] }
        }
        this[$cache][this._key(mode, type)] = renderer
        break
      }
      default:
        this[$cache][this._key(mode, type)] = renderer
        break
    }

    if (!mid) errorMark('the mid is a string')
    this._apply(mid, apply)
    this.hooks.update.call('renderer')
  }

  _apply(id, apply) {
    const specificHook = {
      // BUG: 待修复，有且仅有一次安装通知
      install: new SyncBailHook(),
      update: new SyncHook(),
      event: new SyncHook()
    }
    this.hooks[id] = specificHook
    mHook.installSync(id, specificHook)
    if (apply) apply({ hook: specificHook })
    specificHook.install.call()
  }

  _key(mode, type) {
    return `${mode}@@${type}`
  }

  getSupportedPluginMode() {
    return Object.values(PLUGIN_MODE)
  }

  setPreviewer(preview) {
    if (!preview) return

    if (typeof preview === 'string') {
      logMark('设置mode:', preview)
      return (this._mode = preview)
    }

    if (typeof preview === 'function') {
      logMark('设置mode: 自定义预览', preview.name)
      return (this[$previewer] = preview)
    }

    errorMark('preview is string or function')
  }

  getPreviewer(props) {
    if (!this[$cache][this._key(PLUGIN_MODE.PREVIEWER, this._mode)]) return this[$previewer](props)
    const { render } = this[$cache][this._key(PLUGIN_MODE.PREVIEWER, this._mode)]

    return render(props)
  }

  getEditable() {
    return Object.keys(this[$cache])
      .filter((key) => this[$cache][key].mode === PLUGIN_MODE.GROUP)
      .map((key) => {
        const { text, type, contain } = this[$cache][key]
        return { name: text, value: type, contain }
      })
  }

  [$render](way, mode) {
    function logicDispatch(type, props) {
      invariant(isPlainObject(props), 'props is plain object')

      const renderer = this[$cache][this._key(mode, type)]
      if (!renderer) {
        // 这里判断是否拥有插件
        const { Plugin, pluginKeys } = getPlugin(type)
        if (Plugin) {
          const h5dsProps = convertH5DSProperties(props)
          if (Plugin.prototype && Plugin.prototype.isReactComponent) {
            const Node = new Plugin({ ...h5dsProps, plugins: pluginKeys })
            return Node.render()
          } else {
            return Plugin({ ...h5dsProps, plugins: pluginKeys })
          }
        }
        return noopNull()
      }

      if (isPlainObject(renderer)) {
        const omitObject = omit(renderer, ['render'])
        if (typeof renderer.render === 'function') {
          return renderer.render({ ...props, ...omitObject, hook: this.hooks[omitObject.mid] })
        }
        return renderer.render[way]({ ...props, ...omitObject, hook: this.hooks[omitObject.mid] })
      } else {
        errorMark('invalid renderer')
      }

      return noopNull()
    }
    return logicDispatch.bind(this)
  }

  generate({ way, mode }) {
    // const render = this[r || RENDER.SHOW]()
    const render = this[$render](way || RENDER.SHOW, mode)
    return render
  }
}

const renderer = new Renderer()

export default renderer
