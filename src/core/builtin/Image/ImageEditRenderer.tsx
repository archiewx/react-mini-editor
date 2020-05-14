/* eslint-disable react/jsx-filename-extension */
import React, { useCallback, useContext } from 'react'
import { createPrefixClass, randomBytes } from 'src/lib/string'
import classNames from 'classnames'
import { Button } from 'src/@components/src'
import styles from './styles.module.less'
import chooseImage from 'src/lib/chooseImage'
import { cssUnit2Number } from '../../lib/css'
import { loadImage } from '../../lib/canvas'
import { ThemeContext } from '../../context'

const prefixCls = createPrefixClass(styles, 'image-edit-renderer')

function ImageEditRenderer({ elem, index, invoke }) {
  const { editImage, editImageClassName } = useContext(ThemeContext)

  const handleChangeImage = useCallback(async () => {
    const file = await chooseImage({})
    const src = file.tempFilePaths[0]
    const bid = elem.bid || randomBytes(8)

    const image = await loadImage(src)

    // note: 这里以宽为准，截取部分
    const ew = cssUnit2Number(elem.style.width).value
    const eh = (ew * image.height) / image.width

    // note: 这里按照元素最短边来计算，保证图片可以完全渲染
    // let ew = cssUnit2Number(elem.style.width).value
    // let eh = (ew * image.height) / image.width
    // if (eh > cssUnit2Number(elem.style.height).value) {
    //   eh = cssUnit2Number(elem.style.height).value
    //   ew = (eh * image.width) / image.height
    // }
    const style = { width: ew, height: eh }
    invoke.updateElement(elem, { bid, data: { src, style } })
  }, [elem, invoke])

  const handleResetImage = useCallback(() => {
    invoke.updateElement(elem, {
      bid: null,
      data: { src: elem.originData.src, style: elem.originData.style || {} }
    })
  }, [elem, invoke])

  return (
    <div className={classNames([prefixCls(), editImageClassName])} style={editImage}>
      <div className={prefixCls('box')} style={{ backgroundImage: `url(${elem.data.src})` }}>
        {elem.originData.src !== elem.data.src && (
          <Button onClick={handleResetImage} className={classNames([prefixCls('action-btn')])}>
            恢复
          </Button>
        )}
        <Button
          onClick={handleChangeImage}
          className={classNames([prefixCls('action-btn'), prefixCls('action-btn-primary')])}
        >
          换图
        </Button>
      </div>
    </div>
  )
}

export default ImageEditRenderer
