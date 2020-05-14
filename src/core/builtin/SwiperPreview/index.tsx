/* eslint-disable react/jsx-filename-extension */
import React, { useMemo, useEffect, useContext, useCallback } from 'react'
import classNames from 'classnames'
import { createPrefixClass } from 'src/lib/string'
import 'swiper/dist/css/swiper.min.css'

import { useComputedScale } from '../../lib/logic'
import { useSwiper } from '../../lib/swiper'
import styles from './styles.module.less'
import MPage from '../MPage'
import { ThemeContext } from '../../context'

const prefixCls = createPrefixClass(styles, 'm-swiper-preview')

function MSwiperPreview({ senior, pageLayout, renderer, invoke, h5ds, pages, swiperOption, screenRatio }) {
  const scale = useComputedScale(pageLayout.width * screenRatio, pageLayout.height * screenRatio, senior ? 1 : 0.46)
  const swiper = useSwiper(swiperOption)
  const { page: pageStyle, pageClassName } = useContext(ThemeContext)

  useEffect(() => {
    if (!swiper.instance) return

    if (!swiper.instance.destroyed) {
      const onSlideChange = function(ev) {
        const acIndex = swiper.instance.activeIndex
        invoke.updateActivePage(pages[acIndex].index)
      }
      swiper.instance.on('slideChange', onSlideChange)
      return () => {
        swiper.instance && swiper.instance.off('slideChange', onSlideChange)
      }
    }
  }, [invoke, pages, swiper.instance])

  const rootStyle = useMemo(() => {
    return {
      // 这里当缩放scale之后，再让width回去
      width: `${100 / scale}%`,
      height: pageLayout.height,
      // zoom
      transform: `scale(${scale})`,
      WebkitTransform: `scale(${scale})`
    }
  }, [pageLayout, scale])
  const getPageStyle = useCallback((pg) => ({ ...pg.style, ...pageStyle }), [pageStyle])

  return (
    <div className={prefixCls()} style={rootStyle}>
      <div className={classNames(['swiper-container'])} ref={swiper.container}>
        <div className={classNames(['swiper-wrapper'])}>
          {pages.map((page) => (
            <div key={page.keyid} className={classNames(['swiper-slide', pageClassName])} style={getPageStyle(page)}>
              <MPage data={page} appData={h5ds} renderer={renderer} invoke={invoke} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

MSwiperPreview.Plugin = {
  mid: 'builtinSwiperPreview',
  type: 'swiper',
  mode: 'previewer',
  render(props) {
    return <MSwiperPreview {...props} />
  }
}

export default MSwiperPreview
