import merge from 'lodash/merge'
import cloneDeep from 'lodash/cloneDeep'
import pick from 'lodash/pick'
import set from 'lodash/set'
import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { uploadBase64Image } from 'src/api/upload'
import { isUndefinedDefault } from 'src/lib/function'
import { getUrlQuery } from 'src/lib/string'

import { H5DS_RELATIVE_ALIAS } from './constants'
import { errorMark, useLog, logMark } from './log'
import { transform2Matrix } from './matrix'
import performance from './performance'
import renderer from './renderer'
import mHook from './hook'
import get from 'lodash/get'
import { blobUrl2Blob, blob2Base64 } from 'src/lib/file'

export interface ICustomElement {

}

export function staticTransform(elements = [], plugins = []) {
  const fonts = {}
  const els = elements
    // .filter((elem) => H5DS_RELATIVE_ALIAS[elem.pid])
    // 按照元素顺序从上到下排序, 底图应该在最上面 h5ds 元素顺序正好相反
    //  这里后续需要再次reverse
    .reverse()
    .map((elem, index) => {
      const m = transform2Matrix(elem.style.transform)
      const transform = `matrix(${m.a}, ${m.b}, ${m.c}, ${m.d}, ${m.tx}, ${m.ty})`
      // const elemDataStyle = elem.data.style || {}
      const elemStyle = { ...(elem.style || {}), transform, WebkitTransform: transform }
      const aliasType = H5DS_RELATIVE_ALIAS[elem.pid]

      const elemData = merge({}, { style: { ...pick(elemStyle, 'width', 'height') } }, elem.data)

      const { fontFamilySet } = elemData
      if (fontFamilySet && !fonts[fontFamilySet.name]) fonts[fontFamilySet.name] = fontFamilySet.url

      const newElem = merge({}, elem, {
        index,
        isPlugin: plugins.includes(elem.pid),
        type: aliasType || elem.pid,
        rotate: m.rotate || 0,
        data: elemData,
        originData: cloneDeep(elemData),
        originStyle: cloneDeep(elemData),
        templateData: isUndefinedDefault(elem.templateData, cloneDeep(elemData)),
        templateStyle: isUndefinedDefault(elem.templateStyle, cloneDeep(elemStyle))
      })

      return newElem
    })
  return { layers: els, fonts }
}

export function normalizeTransform(elements = []) {
  return (
    elements
      .filter((elem) => H5DS_RELATIVE_ALIAS[elem.pid])
      // 按照元素顺序从上到下排序, 底图应该在最上面 h5ds 元素顺序正好相反
      .map((elem, index) => {
        const m = transform2Matrix(elem.style.transform)
        const transform = `matrix(${m.a}, ${m.b}, ${m.c}, ${m.d}, ${m.tx}, ${m.ty})`
        const elemStyle = elem.data.style || {}
        return {
          index,
          type: H5DS_RELATIVE_ALIAS[elem.pid],
          ...elem,
          style: { ...elem.style, transform, WebkitTransform: transform },
          rotate: m.rotate || 0,
          data: {
            ...elem.data,
            originValue: isUndefinedDefault(elem.data.originValue, isUndefinedDefault(elem.data.data, elem.data.src)),
            // 不可变
            templateValue: isUndefinedDefault(
              elem.data.templateValue,
              isUndefinedDefault(elem.data.data, elem.data.src)
            ),
            originStyle: isUndefinedDefault(elem.data.originStyle, {
              width: elem.style.width,
              height: elem.style.height,
              ...elemStyle
            }),
            style: {
              width: elem.style.width,
              height: elem.style.height,
              ...elemStyle,
              fontFamily:
                elemStyle.fontFamily === '默认字体'
                  ? "-apple-system-font, 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif"
                  : elemStyle.fontFamily
            }
          },
          originStyle: isUndefinedDefault(elem.originStyle, { ...(elem.originStyle || {}) }),
          originTransform: transform
        }
      })
  )
}

export function useH5DSJson(h5dsJSON, options) {
  const h5dsOption = useRef()
  const [page, setPage] = useState(0)
  const cachePage = useRef(page)
  const [data, setData] = useState()
  const [elements, setElements] = useState([])
  const cacheElements = useRef(elements)
  const [pageLayout, setPageLayout] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [localImage, setLocalImage] = useState([])
  const [plugins, setPlugins] = useState([])
  const [fonts, setFonts] = useState([])
  const [pages, setPages] = useState([])
  useEffect(() => {
    h5dsOption.current = options
  })

  const validPage = useMemo(() => (page < 0 ? 0 : page), [page])

  useLog('本地图片', localImage)
  useLog('更新h5ds', data)
  useLog('元素', elements)
  useLog('切换页面', page)

  useEffect(() => {
    if (!h5dsJSON) return
    let h5dsData = {}
    logMark('origin h5dsData', h5dsJSON)
    if (typeof h5dsJSON === 'string') h5dsData = JSON.parse(h5dsJSON)

    if (typeof h5dsJSON === 'object') h5dsData = merge({}, h5dsJSON)
    logMark('h5dsData', h5dsJSON)

    performance.begin()
    let fms = {}
    let resolvePages = []
    h5dsData.pages.forEach((page, index) => {
      const { layers, fonts: pageFonts } = staticTransform(page.layers, h5dsData.plugins)
      page.layers = layers
      page.index = index
      // Object.defineProperty(page, 'index', { value: index })
      // 收集字体
      setFonts(fms)
      resolvePages = resolvePages.concat(merge({}, page))
      fms = { ...fms, ...pageFonts }
    })
    if (h5dsOption.current && h5dsOption.current.onBeforePages) {
      resolvePages = h5dsOption.current.onBeforePages(resolvePages) || resolvePages
      logMark('onBeforePages', resolvePages)
    }
    const fmsArray = Object.keys(fms).reduce((acc, n) => acc.concat({ name: n, url: fms[n] }), [])
    setFonts(fmsArray)
    logMark('当前模板使用的字体列表', fmsArray)

    if (renderer._mode === renderer.MODE.AUTO) {
      logMark('当前mode:', renderer._mode)
      if (resolvePages.length === 1) renderer.setPreviewer(renderer.MODE.STATIC)

      if (resolvePages.length >= 3) renderer.setPreviewer(renderer.MODE.SWIPER)
    }

    performance.end('解析处理h5ds')

    const initialPage = +getUrlQuery('page') || 0
    setPage(get(resolvePages, [initialPage, 'index']))
    cachePage.current = get(resolvePages, [initialPage, 'index'])
    setPages(resolvePages)
    setPlugins(h5dsData.plugins)
    setData(h5dsData)
  }, [h5dsJSON])

  useEffect(() => {
    if (!data) return

    try {
      const pageData = merge({}, data.pages[validPage])
      // fixme: 如果这里需要单页渲染，则需要颠倒数组同时处理，待修改
      // const elements = staticTransform(pageData.layers)
      // const elements = normalizeTransform(pageData.layers)
      setElements(pageData.layers)
      cacheElements.current = pageData.layers
      setPageLayout(merge({}, pageData.style))
    } catch (error) {
      errorMark(error)
    }
  }, [data, validPage])

  const updateActivePage = useCallback((index) => {
    mHook.editorTrigger('pageChange', { page: index })
    setPage(index)
    cachePage.current = index
  }, [])

  const updateElements = useCallback((index, es) => {
    setData((prev) => ({
      ...prev,
      pages: prev.pages.map((pg) => (pg.index === index ? merge({}, { ...pg, layers: es }) : pg))
    }))
    setPages((prev) => prev.map((pg) => (pg.index === index ? merge({}, { ...pg, layers: es }) : pg)))
  }, [])

  const updateElement = useCallback(
    async (elem, upDelta) => {
      if (!elem.keyid) errorMark('keyid is uniq string')

      if (upDelta.bid) {
        const blob = await blobUrl2Blob(upDelta.data.src)
        setLocalImage((prev) =>
          prev.concat({ page: cachePage.current, index: elem.index, blob, bid: upDelta.bid, url: upDelta.data.src })
        )
      }

      if (upDelta.bid === null) {
        setLocalImage((prev) => prev.filter((item) => item.index !== elem.index))
      }
      const newElements = cacheElements.current.map((el) => (el.keyid === elem.keyid ? merge({}, elem, upDelta) : el))
      updateElements(cachePage.current, newElements)
    },
    [updateElements]
  )

  const invoke = useMemo(() => ({ updateActivePage, updateElements, updateElement }), [
    updateActivePage,
    updateElement,
    updateElements
  ])

  return {
    data,
    pages,
    fonts,
    page,
    elements,
    plugins,
    pageLayout,
    localImage,
    invoke
  }
}

// 这里主要做图片上传处理
// 应用场景: 保存，获取当前合法数据
export async function returnTransform(h5ds) {
  const data = merge({}, h5ds.data)
  const base64Array = await Promise.all(h5ds.localImage.map((img) => blob2Base64(img.blob)))
  const images = await Promise.all(base64Array.map((base64) => uploadBase64Image(base64)))
  images.forEach((img, i) => {
    const { page, index } = h5ds.localImage[i]
    set(data, ['pages', page, 'layers', index, 'data', 'src'], img)
  })
  data.pages.forEach((page) => {
    page.layers = page.layers.reverse()
  })
  return data
}

export function setPageData(pageData, id, dataKey, dataValue) {
  const index = pageData.layers.findIndex((ly) => ly.id === id)
  if (index === -1) return errorMark(`不存在 id=${id} 的元素`)

  set(pageData, `layers[${index}].${dataKey}`, dataValue)
  return pageData
}

export function getPageData(pageData, id, dataKey) {
  const index = pageData.layers.findIndex((ly) => ly.id === id)
  if (index === -1) return errorMark(`不存在 id=${id} 的元素`)

  return get(pageData, `layers[${index}].${dataKey}`)
}
