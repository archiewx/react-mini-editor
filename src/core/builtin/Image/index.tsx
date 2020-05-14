/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import ImageRenderer from './ImageRenderer'
import ImageEditRenderer from './ImageEditRenderer'
import { loadImage, centerTransform } from '../../lib/canvas'
import { cssUnit2Number } from '../../lib/css'

export default {
  type: 'image',
  text: '图片',
  mid: 'builtinImage',
  mode: 'element',
  group: 'image',
  render: {
    show(props) {
      return <ImageRenderer {...props} />
    },
    edit(props) {
      return <ImageEditRenderer {...props} />
    },
    async paint({ ctx, elem, withRatio }) {
      let x = withRatio(elem.style.left)
      let y = withRatio(elem.style.top)
      const img = await loadImage(elem.data.src)
      const clipW = withRatio(elem.style.width)
      const clipH = withRatio(elem.style.height)
      const imgW = withRatio(cssUnit2Number(elem.data.style.width).value)
      const imgH = withRatio(cssUnit2Number(elem.data.style.height).value)

      ;[x, y] = centerTransform(ctx, elem.style.transform, x, y, imgW, imgH, window.devicePixelRatio)
      ctx.save()
      // 绘制路径裁剪
      ctx.beginPath()
      ctx.rect(x, y, clipW, clipH)
      ctx.closePath()
      ctx.clip()
      ctx.save()
      ctx.drawImage(img, x, y, imgW, imgH)
      ctx.restore()
      ctx.restore()
      // 恢复圆点
      ctx.setTransform(1, 0, 0, 1, 0, 0)
    }
  }
}
