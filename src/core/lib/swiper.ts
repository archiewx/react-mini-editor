import { useRef, useEffect } from 'react'
import Swiper from 'swiper/dist/js/swiper.min.js'
import { logMark } from './log'

const defaultOptions = {}
/**
 * @param {import('swiper').SwiperOptions} options
 * @returns {{ container: HTMLDivElement, instance: Swiper | undefined }} swiper maniplation
 */
export function useSwiper(options = defaultOptions) {
  const container = useRef()
  const instance = useRef()
  const swiperOption = useRef()
  useEffect(() => {
    swiperOption.current = options
  })

  useEffect(() => {
    const swiper = new Swiper(container.current, {
      slidesPerView: 'auto',
      centeredSlides: true,
      slidesPerGroup: 1,
      observer: true,
      observeParents: true,
      slideToClickedSlide: true,
      // longSwipesRatio: 0.1
      ...(swiperOption.current || {})
    })
    instance.current = swiper
    logMark('初始化swiper', swiper)
    return () => {
      logMark('销毁swiper')
      swiper.destroy()
    }
  }, [])

  return { container, instance: instance.current }
}
