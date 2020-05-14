/*
 * @Date: 2019-08-27 14:21:32
 * @Last Modified time: 2019-08-27 14:21:32
 * canvas 操作
 */
import { EMOJI_REGEX, USER_CARD_STYLE } from './constants'
import { cssUnit2Number } from './css'
import { transform2Matrix } from './matrix'

const cacheImage = {}
export const loadImage = (url) => {
  url = /^(https?:)|(blob:)|(data:)/.test(url) ? url : `https:${url}`

  if (cacheImage[url]) return Promise.resolve(cacheImage[url])

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      cacheImage[url] = img
      resolve(img)
    }
    img.onerror = (err) => {
      window.console.error('image load', err)
      reject(err)
    }
    img.src = url
  })
}
/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {*} transform
 * @param {*} x
 * @param {*} y
 * @param {*} width
 * @param {*} height
 */
export function centerTransform(ctx, transform, x, y, width, height, dpr) {
  if (!transform) return [x, y]

  let t = {}
  if (typeof transform === 'object') t = transform

  if (typeof transform === 'string') t = transform2Matrix(transform)

  const cx = x + width / 2
  const cy = y + height / 2

  ctx.translate(cx, cy)
  ctx.transform(t.a, t.b, t.c, t.d, t.tx * dpr, t.ty * dpr)

  x = -width / 2
  y = -height / 2
  ctx.translate(x, y)
  return [0, 0]
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {*} url
 * @param {*} x
 * @param {*} y
 * @param {*} size
 */
export async function drawCircleImage(ctx, url, x, y, size) {
  const img = await loadImage(url)
  ctx.save()
  const cx = x + size / 2
  const cy = y + size / 2
  ctx.arc(cx, cy, size / 2, 0, 2 * Math.PI)
  ctx.clip()
  ctx.drawImage(img, x, y, size, size)
  ctx.restore()
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {*} text
 * @param {*} style
 * @param {*} x
 * @param {*} y
 */
export async function drawText(ctx, text, style, w, h, x, y) {
  const lineHeight = style.lineHeight || 1.35
  const fontSize = cssUnit2Number(style.fontSize)
  const fontFamily = style.fontFamily || '-apple-system-font PingFang SC Microsoft YaHei Helvetica Neue'
  const fontWeight = style.fontWeight || 400
  let textLines = replaceHTML(insertNewline(replaceSpace(ignoreSpecTag(text)))).split('\n')

  const letterSpacing = style.letterSpacing === 'normal' ? 0 : style.letterSpacing || 0
  const align = style.textAlign || 'left'

  ctx.save()

  // if (style.transform) {
  //   const t = cssMatrix2Object(style.transform)
  //   if (t.a !== 1 && t.d !== 1) {
  //     centerTransform(ctx, t, x, y, w, h, window.devicePixelRatio)
  //     ctx.transform(t.a, t.b, t.c, t.d, t.tx, t.ty)
  //   }
  // }

  ctx.textBaseline = 'ideographic'
  ctx.font = `${fontWeight} ${fontSize.value}px ${fontFamily}`
  ctx.fillStyle = style.color || '#333'
  const measureEllipsis = ctx.measureText('...')

  // 计算如果文字居中，距离文字顶部距离
  /**
   * ------- text-top ------
   * | centerSpaceY |
   * text-content
   * | centerSpaceY |
   * ------- text-bottom ----
   */
  // const centerSpaceY = (fontSize.value * lineHeight - fontSize.value) / 2
  // 获取元素最大的宽度
  const maxW = w > h ? w : h
  const maxH = w > h ? h : w
  // 这里判断是否需要自动换行，若textLines 只有一行，则走判断自动换行逻辑
  if (textLines.length === 1) {
    const measure = ctx.measureText(textLines[0])
    if (measure.width > maxW && maxH > fontSize.value * lineHeight) {
      // 预计需要分成几行
      const lines = Math.round(maxH / (fontSize.value * lineHeight))
      const chars = textLines[0].split('')
      const cw = measure.width / chars.length
      // 一行最大字数
      const lineMaxNums = Math.floor(maxW / cw)
      textLines = []
      ;[...Array(lines).keys()].forEach((ln) => {
        textLines.push(chars.slice(ln * lineMaxNums, (ln + 1) * lineMaxNums).join(''))
      })
    }
  }

  // 多行文本绘制
  textLines.forEach((txt) => {
    let txtLen = txt.length
    // 文本占据的宽度
    const measureTxt = ctx.measureText(txt).width + letterSpacing * (txtLen - 1)

    // 判断该行文本长度是否超过最大宽度
    if (measureTxt > maxW) {
      // 计算每个文字宽度
      const charWidth = measureTxt / txtLen
      // 总共宽度减去（省略符宽度+20）再次计算字体个数
      // note: 这里还有策略直接按照最大能渲染字数来做，不显示(...)
      txtLen = Math.floor((maxW - measureEllipsis.width - 20) / charWidth)
      txt = txt.slice(0, txtLen) + '...'
    }

    // 记录原始开始的x值
    const originX = x

    // 文本居中起点计算
    if (align === 'center') x += (w - measureTxt) / 2

    if (align === 'right') x += w - measureTxt

    ctx.textAlign = 'left'
    y += fontSize.value * lineHeight

    const chars = secureSplitString(txt)
    chars.forEach((char) => {
      const cw = ctx.measureText(char).width

      // 判断当前字符是否超出宽度
      // x起点+字体宽度是否超过
      if (x + cw + letterSpacing <= originX + w) {
        ctx.fillText(char, x, y)
        // 字间距计算排序
        x = x + cw + letterSpacing
      } else {
        // 换行
        // 全角字符竖排, 半角字符旋转排列
        const code = char.charCodeAt(0)
        if (code <= 256) {
          // 半角字符
        } else {
          // 全角字符
        }
        x = originX
        y += fontSize.value * lineHeight
        ctx.fillText(char, x, y)
        y += fontSize.value * lineHeight
      }
    })
    ctx.textAlign = align
    x = originX
  })

  // if (style.transform) ctx.resetTransform()

  ctx.restore()
}

// fixme: 这里待处理emoji
export function secureSplitString(str) {
  const regex = EMOJI_REGEX
  const chars = str.replace(regex, '').split('')
  return chars
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {*} userData
 * @param {*} x
 * @param {*} y
 */
export async function drawUser(ctx, userData, x, y) {
  const uavX = x + USER_CARD_STYLE.AVATAR_LEFT
  const uavY = y + USER_CARD_STYLE.AVATAR_TOP

  await drawCircleImage(ctx, userData.avatar, uavX, uavY, USER_CARD_STYLE.AVATAR_SIZE)

  if (userData.sellerWxQrCode) {
    const qr = await loadImage(`https:${userData.sellerWxQrCode}`)
    const qrX = ctx.canvas.width - USER_CARD_STYLE.QR_SIZE - USER_CARD_STYLE.QR_RIGHT
    ctx.drawImage(qr, x + qrX, y + USER_CARD_STYLE.QR_TOP, USER_CARD_STYLE.QR_SIZE, USER_CARD_STYLE.QR_SIZE)
  }

  await drawText(
    ctx,
    userData.wxName,
    USER_CARD_STYLE.USER_STYLE,
    USER_CARD_STYLE.USER_NAME_WIDTH,
    USER_CARD_STYLE.USER_NAME_HEIGHT,
    x + USER_CARD_STYLE.USER_NAME_LEFT,
    y + USER_CARD_STYLE.USER_NAME_TOP
  )

  await drawText(
    ctx,
    userData.companyName,
    USER_CARD_STYLE.COMPANY_STYLE,
    USER_CARD_STYLE.COMPANY_NAME_WIDTH,
    USER_CARD_STYLE.COMPANY_NAME_HEIGHT,
    x + USER_CARD_STYLE.COMPANY_NAME_LEFT,
    y + USER_CARD_STYLE.COMPANY_NAME_TOP
  )
}

export function replaceSpace(str) {
  return str.replace(/&nbsp;/g, ' ')
}

export function removeSpace(str) {
  return str.replace(/\s+/g, '')
}

export function insertNewline(str, tag = 'div') {
  const filtered = ['div', 'p']
  if (filtered.indexOf(tag) === -1) return str

  // if (/\n/.test(str)) return str.replace(/\n/, '<br/>')

  const reg = new RegExp(`<${tag}>`, 'g')

  return str.replace(reg, `<${tag}>\n`)
}

/**
 *
 * @param {string} str
 */
export function replaceHTML(str, tags = ['div', 'br', 'span']) {
  tags.forEach((tag) => {
    const reg = new RegExp(`<[/]?${tag}.*?>`, 'g')
    // return str.replace(/\u21B5/g, '<br />')
    str = str.replace(reg, '')
  })
  return str
}

export function ignoreSpecTag(str, tags = ['div']) {
  tags.forEach((tag) => {
    if (str.startsWith(`<${tag}>`)) str = str.replace(new RegExp(`<${tag}>`, 'g'), '')
    if (str.endsWith(`</${tag}>`)) str = str.replace(new RegExp(`</${tag}>`, 'g'), '')
  })
  // 首位标签忽略
  return str
}
