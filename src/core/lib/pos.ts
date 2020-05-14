import { useEffect, useRef, useState } from 'react'

import { TEXT_ACTION_TYPE } from './constants'
import { TOOLKIT_DRT } from '../components/ImageElement/constants'

export function useTextControllerPosLayout(elem, type) {
  const node = useRef()
  const [style, setStyle] = useState({})

  useEffect(() => {
    if (type && type !== TEXT_ACTION_TYPE.TEXT_CHANGE) {
      const timer = setTimeout(() => {
        const rect = node.current.getBoundingClientRect()
        // 被操作框覆盖
        if (elem.style.top > rect.top) {
          // 移动至顶部，距离操作局20px
          const translY = rect.top - elem.style.top - elem.style.height - 70
          setStyle({ transform: `translateY(${translY}px)` })
        } else setStyle({})
      }, 100)

      return () => {
        clearTimeout(timer)
      }
    } else setStyle({})
  }, [elem, type])

  return [node, style]
}

/**
 * todo: 待完成全部边界判断
 * @param {*} elem
 */
export function useImageElemToolLayout(elem, scale = 1, size) {
  const node = useRef()
  const [drt, setDrt] = useState(TOOLKIT_DRT.HT)
  const [style, setStyle] = useState({})
  useEffect(() => {
    if (!elem) return

    const { style: s } = elem
    if (s) {
      // note: 仅仅h5有用
      // 工具栏的宽高
      let tw = node.current.clientWidth
      let th = node.current.clientHeight
      // 长的始终为宽度
      ;[tw, th] = tw > th ? [tw, th] : [th, tw]
      // 元素的宽高和起点
      const ew = s.width * scale
      const eh = s.height * scale
      const et = s.top * scale
      const el = s.left * scale
      let left = el + (ew - tw) / 2
      let top = et + eh + 10
      // 整体距离顶部和右边的距离
      const innerTop = (window.innerHeight - size.height * scale) / 2
      const innerLeft = (window.innerWidth - size.width * scale) / 2
      // 默认为距离底部显示
      const isHB = window.innerHeight - eh - et - innerTop > th
      if (isHB) {
        setDrt(TOOLKIT_DRT.HB)
        left += innerLeft
        top += innerTop
      }
      // 不能放在底部才能放在其他位置
      // 如果元素的左侧left 小于工具条垂直状态宽度度则不能显示
      // 如果元素的左侧left + w 距离右侧不足垂直状态工具栏的宽度则不能显示
      // 如果元素的top， 小于工具条水平状态高度则不能显示
      // 如果元素top+h，距离底部高度小于水平工具条高度，则不能显示
      // 工具条默认显示元素下方, 其次上册，左侧，右侧的顺序

      const isHT = !isHB && th < et && th > window.innerHeight - (et + eh)
      if (isHT) {
        top = et - th - 10 - innerTop
        setDrt(TOOLKIT_DRT.HT)
      }

      const isVL = !isHT && el > th
      if (isVL) {
        top = et + (eh - tw) / 2
        left = el - th + 25 + innerLeft
        setDrt(TOOLKIT_DRT.VL)
      }

      const isVR = !isHB && !isHT && !isVL && window.innerWidth - ew - el > th
      // 边界判断
      if (isVR) {
        top = et + (eh - tw) / 2
        left = el + ew + th + 25 - innerLeft
        setDrt(TOOLKIT_DRT.VR)
      }

      setStyle({ left, top })
    }
  }, [elem, scale, size])

  return [node, style, drt]
}
