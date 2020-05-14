import { SyncHook } from 'tapable'

const $cache = Symbol('cache')
class MHook {
  init = new SyncHook()
  _editor = new SyncHook(['any', 'any1'])
  error = new SyncHook(['any'])

  constructor() {
    this[$cache] = {}
  }

  installSync(key, hook) {
    this[$cache][key] = hook
  }

  editorTrigger(ev, params) {
    this._editor.call(ev, params)
  }

  editorOn(event, callback) {
    this._editor.tap('editorPlugin', (ev, params) => {
      if (event === ev) callback && callback(params)
    })
  }
}

const mHook = new MHook()

export default mHook
