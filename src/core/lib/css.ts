/*
 * @Date: 2019-08-28 10:57:14
 * @Last Modified time: 2019-08-28 10:57:14
 * css 内容支持
 */

import { useEffect } from 'react'
import { logMark, errorMark } from './log'

/**
 * css 单位转换成字符串
 * @param {string} cssUnit
 */
export const cssUnit2Number = (cssUnit, extraUnit = []) => {
  if (!cssUnit) return null

  const cssUnitArray = ['em', 'rem', 'px', 'cm', 'mm', 'in', 'pt', 'pc', 'ex', 'ch', 'vw', 'vh', '%'].concat(extraUnit)
  const unitReg = new RegExp(`(-?\\d+[.|\\d]*)(${cssUnitArray.join('|')})?`, 'g')
  const match = unitReg.exec(cssUnit)
  const value = Number(match[1])
  const unit = match[2]

  return { value, unit }
}

/**
 * 16进制颜色转换成rgb
 * @param {string} hexColor
 */
export const hexColor2Rgb = (hexColor) => {
  if (hexColor.startsWith('#')) hexColor = hexColor.replace('#', '')

  if (hexColor.length === 3) hexColor = hexColor.replace(/./g, '$1$1')

  const rgbArray = []
  hexColor.replace(/../g, (hex) => {
    rgbArray.push(parseInt(hex, 0x10))
  })
  return `rgb(${rgbArray.join(',')})`
}

/**
 * rgb颜色转hex
 * @param {string} rgbColor
 */
export const rgbColor2Hex = (rgbColor, len = 3) => {
  const reg = /rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,?\s*?(\d+[.|\d]*)?\)/g
  const match = reg.exec(rgbColor)
  const rgbArray = [match[1], match[2], match[3]]
  if (match[4]) {
    let alpha = parseInt(match[4] * 255)

    if (alpha > 255) alpha = 255
    if (alpha < 0) alpha = 0

    if (len === 4) rgbArray.push(alpha)
  } else if (len === 4) rgbArray.push(255)

  const hexColor = rgbArray
    .map((n) => Number(n).toString(0x10))
    .map((n) => (n.length < 2 ? n + '0' : n))
    .join('')

  return `#${hexColor}`
}

/**
 * @param {string} transform
 */
export const transform2rotate = (transform) => {
  if (!transform) transform = 'rotate(0deg)'

  const reg = /rotate\(([-|\d]+)(.*)\)/g
  const match = reg.exec(transform)
  return { value: Number(match[1]), unit: match[2] }
}

/**
 * @param {string} transform
 * @param {number} rotate
 */
export const rotate2transform = (transform, rotate) => {
  rotate = rotate % 360

  if (!transform) return `rotate(${rotate}deg)`

  return transform.replace(/rotate\(.*\)/g, `rotate(${rotate}deg)`)
}

/**
 * 矩阵元素
 */
export function cssMatrix2Object(matrix) {
  const reg = /matrix\((.+)\w*,\w*(.+)\w*,\w*(.+)\w*,\w*(.+)\w*,\w*(.+)\w*,\w*(.+)\)/g
  const match = reg.exec(matrix)

  const a = Number(match[1])
  const b = Number(match[2])
  const c = Number(match[3])
  const d = Number(match[4])
  const tx = Number(match[5])
  const ty = Number(match[6])
  return { a, b, c, d, tx, ty }
}

export function withRatio(num: number, ratio?: number) {
  return num * (ratio || window.devicePixelRatio)
}

export async function loadCustomFont(name, url) {
  return new Promise((resolve, reject) => {
    const d = window.document

    if (d.getElementById(name)) return resolve()

    const styleDom = d.createElement('style')
    styleDom.id = name
    styleDom.innerHTML = `
      @font-face {
        font-family: ${name};
        src: url(${url});
      }
    `
    styleDom.onload = resolve
    styleDom.onerror = reject
    d.head.appendChild(styleDom)
  })
}

export function unloadCustomFont(name) {
  const d = window.document
  const dom = d.getElementById(name)
  if (dom) d.head.removeChild(dom)
}

export function useFonts(fonts = []) {
  useEffect(() => {
    Promise.all(fonts.filter((f) => !!f.url).map((f) => loadCustomFont(f.name, f.url)))
      .then(() => {
        logMark('字体加载成功')
      })
      .catch((err) => {
        errorMark('字体加载失败', err)
      })
    return () => {
      fonts.filter((f) => !!f.url).map((f) => unloadCustomFont(f.name))
      logMark('字体卸载成功')
    }
  }, [fonts])
}
