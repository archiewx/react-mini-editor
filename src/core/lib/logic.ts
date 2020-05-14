import { useCallback, useEffect, useImperativeHandle, useMemo, useReducer, useRef, useState } from 'react'
import { hideLoading, showLoading } from 'src/components/Loading'
import platform from 'src/lib/platform'
import get from 'lodash/get'

import { ELEMENT_TYPE } from './constants'
import { cssUnit2Number, rgbColor2Hex, withRatio } from './css'
import { createCanvasImage } from './image'
import { errorMark, logMark } from './log'
import performance from './performance'
import renderer from './renderer'
import { returnTransform } from './transform'

export function useComputedTextFeature(elem) {
  const fontPercentage = useMemo(() => {
    if (!elem || elem.type !== ELEMENT_TYPE.TEXT) return

    const { originStyle, data } = elem

    const originFs = cssUnit2Number(originStyle.fontSize || data.style.fontSize)
    const fs = cssUnit2Number(data.style.fontSize)
    const percentage = (fs.value - originFs.value) / (originFs.value * 0.5)
    return percentage
  }, [elem])

  const fontAlign = useMemo(() => {
    if (!elem || elem.type !== ELEMENT_TYPE.TEXT) return
    const { data } = elem

    return data.style.textAlign
  }, [elem])

  const fontColor = useMemo(() => {
    if (!elem || elem.type !== ELEMENT_TYPE.TEXT) return

    const { data } = elem
    return rgbColor2Hex(data.style.color || 'rgba(0, 0, 0, 1)')
  }, [elem])

  return { fontPercentage, fontColor, fontAlign }
}

export function useComputedScale(w, h, zoom = 1) {
  const scale = useMemo(
    () => {
      if (!w || !h) return 1

      logMark('w', w, 'h', h)
      const innerWidth = window.innerWidth
      const innerHeight = window.innerHeight * zoom
      let sc = innerWidth / w
      // 缩放后的高度
      const zH = h * sc
      if (zH > innerHeight) sc = innerHeight / h
      // 需要判断缩放后，长宽比例是否超过宽或者高
      logMark('scale', sc)
      return sc
    },
    // eslint-disable-next-line
    [w, h]
  )
  return scale
}

export function useBoolean(initialValue = false) {
  const [boolean, setBoolean] = useState(initialValue)

  const onBooleanChange = useCallback(() => {
    setBoolean((prev) => !prev)
  }, [])

  return [boolean, onBooleanChange]
}

export function useElement() {
  const [active, setActive] = useState({ el: null, index: -1 })

  const onElementClick = useCallback(
    (elem, idx) => {
      const isReset = idx === active.index && elem.type === ELEMENT_TYPE.IMAGE

      if (isReset || elem.set.lock) {
        setActive({ el: null, index: -1 })
        return
      }
      // store.setCheckedElement(el)
      setActive({ el: elem, index: idx })
    },
    [active]
  )

  useEffect(() => {
    logMark('selected', active.index, active.el)
  }, [active])

  return [active, onElementClick]
}

export function delay(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout))
}

export function useCanvas(isVisible, size, elements) {
  const [dataURL, setDataURL] = useState()
  const canvasNode = useRef()

  useEffect(() => {
    if (!isVisible || !canvasNode.current) return

    canvasNode.current.width = size.width * window.devicePixelRatio
    canvasNode.current.height = size.height * window.devicePixelRatio
  }, [isVisible, size])

  useEffect(() => {
    if (!isVisible && dataURL) {
      URL.revokeObjectURL(dataURL)
      setDataURL(null)
    }
  }, [isVisible, dataURL])

  const drawCanvas = useCallback(async () => {
    showLoading({ title: '生成预览中...' })
    const [objectURL] = await createCanvasImage(canvasNode.current, elements)
    await delay(1000)
    setDataURL(objectURL)
    hideLoading()
  }, [elements])

  useEffect(() => {
    if (!isVisible || !canvasNode.current) return
    drawCanvas()
  }, [isVisible, drawCanvas])

  return [canvasNode, dataURL, drawCanvas]
}

export function useInputAreaBehavior() {
  const focusNode = useRef(null)
  const focusTimeout = useRef(null)

  const onFocusIn = useCallback((e) => {
    focusNode.current = null
    if (focusTimeout.current) {
      clearTimeout(focusTimeout.current)
      focusTimeout.current = null
    }
  }, [])
  const onFocusOut = useCallback((e) => {
    focusNode.current = e.target
    focusTimeout.current = setTimeout(() => {
      if (focusNode.current) {
        e.target.scrollIntoView(false, { behavior: 'smooth' })
        focusNode.current = null
      }
    }, 100)
  }, [])

  const removeEventListener = useCallback(() => {
    document.body.removeEventListener('focusin', onFocusIn)
    document.body.removeEventListener('focusout', onFocusOut)
    if (focusTimeout.current) {
      clearTimeout(focusTimeout.current)
      focusTimeout.current = null
    }
  }, [onFocusIn, onFocusOut])

  const addEventListener = useCallback(() => {
    document.body.addEventListener('focusin', onFocusIn)
    document.body.addEventListener('focusout', onFocusOut)
  }, [onFocusIn, onFocusOut])

  useEffect(() => {
    if (!platform.isIOS()) return

    addEventListener()
    return removeEventListener
  }, [addEventListener, removeEventListener])

  const disposeListener = useCallback(() => {
    if (focusNode.current) removeEventListener()
  }, [removeEventListener])

  return disposeListener
}

export function useOptimizeScrollBox() {
  const boxNode = useRef()
  const onTouchStart = useCallback((e) => {
    if (boxNode.current) {
      const { scrollTop, offsetHeight, scrollHeight } = boxNode.current
      // 这里如果如果有问题，就改成1, 下同
      if (scrollTop <= 0) boxNode.current.scrollTop = 0.1

      if (scrollTop + offsetHeight >= scrollHeight) {
        boxNode.current.scrollTop = scrollHeight - offsetHeight - 0.1
      }
    }
  }, [])
  return [boxNode, onTouchStart]
}

export function usePreventBodyTouch(setKey) {
  const isListener = useRef(false)
  const onTouchMove = useCallback(
    (e) => {
      if (e.target.dataset[setKey]) return
      let pElement = e.target.parentElement

      while (pElement) {
        if (pElement.dataset[setKey]) return
        pElement = pElement.parentElement
      }
      e.preventDefault() // 阻止默认的处理方式(阻止下拉滑动的效果)
    },
    [setKey]
  )

  useEffect(() => {
    document.body.addEventListener('touchmove', onTouchMove, { passive: false })
    isListener.current = true
    return () => {
      document.body.removeEventListener('touchmove', onTouchMove, { passive: false })
      isListener.current = false
    }
  }, [onTouchMove])

  const disposeListener = useCallback(() => {
    if (isListener.current) {
      document.body.removeEventListener('touchmove', onTouchMove, { passive: false })
      isListener.current = false
    }
  }, [onTouchMove])
  return disposeListener
}

export function useForceUpdate() {
  const [, dispatch] = useReducer((x) => x + 1, 0)
  return dispatch
}

export function useInvokeUpdate(h5ds) {
  const [state, setState] = useState({ activeGroup: '', painter: null })

  useEffect(() => {
    const editables = renderer.getEditable()
    if (!editables.length) return

    const defaultTab = editables[0]
    setState((prev) => ({ ...prev, activeGroup: defaultTab.value }))
  }, [])

  const [active, onElementActive] = useElement()

  const updateActiveElement = useCallback(
    (newActiveEl) => {
      const index = h5ds.elements.findIndex((el) => el.keyid === newActiveEl.keyid)
      onElementActive(newActiveEl, index)
    },
    [h5ds.elements, onElementActive]
  )

  const updateActiveGroup = useCallback((group) => {
    setState((prev) => ({ ...prev, activeGroup: group }))
  }, [])

  const invoke = useMemo(() => ({ updateActiveElement, updateActiveGroup }), [updateActiveElement, updateActiveGroup])

  return { state, spread: { ...state, active }, invoke }
}

export function useExposeHandle(ref, { h5ds, invoke }) {
  const mPreview = useRef()

  useImperativeHandle(ref, () => ({
    async invokePaint({ page, elements } = {}) {
      performance.begin()
      if (!mPreview.current) return errorMark('painter not load')

      const paint = renderer.generate({ way: renderer.RENDER.PAINT, mode: renderer.PLUGIN_MODE.ELEMENT })
      const painter = mPreview.current.getPainter()
      if (!painter) return errorMark('painter not ready')

      if (typeof page !== 'undefined' && h5ds.pages[page]) {
        const pageData = h5ds.pages[page]
        painter.width = withRatio(pageData.style.width) || painter.width
        painter.height = withRatio(pageData.style.height) || painter.height
      }

      const ctx = painter.getContext('2d')
      ctx.clearRect(0, 0, painter.width, painter.height)

      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, painter.width, painter.height)
      performance.begin()
      if (page && !elements) {
        elements = get(h5ds, ['data', 'pages', page, 'layers'])
      }
      elements = elements || h5ds.elements

      for (const elem of elements) {
        await paint(elem.type, { ctx, elem, withRatio })
      }
      performance.end('paint')
      performance.end('invoke')
      return painter.toDataURL()
    },
    async getData() {
      performance.begin()
      const data = await returnTransform(h5ds)
      performance.end('data')
      return data
    },
    updateActiveTab(activeType) {
      if (!activeType) return

      invoke.updateActiveGroup(activeType)
    }
  }))
  return mPreview
}
