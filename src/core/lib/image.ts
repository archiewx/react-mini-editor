import { base642Blob } from 'src/lib/file'

import { centerTransform, drawText, drawUser, loadImage } from './canvas'
import { ELEMENT_TYPE, USER_CARD_STYLE } from './constants'
import { cssUnit2Number } from './css'

// 绘制画布
export const createCanvasImage = async (canvas, userData, elements, isRenderingUser = false) => {
  window.console.time('renderer')
  const withRatio = (num) => num * window.devicePixelRatio

  if (isRenderingUser) canvas.height -= USER_CARD_STYLE.CARD_HEIGHT

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // eslint-disable-next-line
  for (let elem of elements) {
    let x = withRatio(elem.style.left)
    let y = withRatio(elem.style.top)

    switch (elem.type) {
      case ELEMENT_TYPE.IMAGE: {
        const img = await loadImage(elem.data.src)
        const clipW = withRatio(elem.style.width)
        const clipH = withRatio(elem.style.height)

        ctx.save()
        // 绘制路径裁剪
        ctx.beginPath()
        ctx.rect(x, y, clipW, clipH)
        ctx.closePath()
        ctx.clip()
        const imgW = withRatio(cssUnit2Number(elem.data.style.width).value)
        const imgH = withRatio(cssUnit2Number(elem.data.style.height).value)
        ctx.save()
        ;[x, y] = centerTransform(ctx, elem.style.transform, x, y, imgW, imgH, window.devicePixelRatio)
        ctx.drawImage(img, x, y, imgW, imgH)
        ctx.restore()
        // 恢复圆点
        ctx.restore()

        break
      }
      case ELEMENT_TYPE.TEXT: {
        const txtStyle = elem.data.style
        const fs = cssUnit2Number(txtStyle.fontSize)

        await drawText(
          ctx,
          elem.data.data,
          {
            ...elem.data.style,
            width: withRatio(txtStyle.width),
            height: withRatio(txtStyle.height),
            fontSize: withRatio(fs.value),
            letterSpacing: withRatio(elem.data.style.letterSpacing === 'normal' ? 0 : elem.data.style.letterSpacing),
            transform: elem.style.transform
          },
          withRatio(txtStyle.width),
          withRatio(txtStyle.height),
          withRatio(elem.style.left),
          withRatio(elem.style.top)
        )
        break
      }
      default:
        break
    }
  }
  window.console.timeEnd('renderer')

  if (isRenderingUser) {
    ctx.save()
    await drawUser(ctx, userData, 0, canvas.height - USER_CARD_STYLE.CARD_HEIGHT)
    ctx.restore()
  }

  const base64 = canvas.toDataURL()
  const blob = base642Blob(base64)
  const objectURL = URL.createObjectURL(blob)
  return [objectURL, base64]
}
