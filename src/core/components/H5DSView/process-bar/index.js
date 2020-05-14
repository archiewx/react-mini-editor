/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import classNames from 'classnames'

import platform from 'src/lib/platform'

import styles from './index.module.less'

function ProcessBar({ activeIndex = 1, slides = [] }) {
  return (
    <div className={styles['progress-bar']}>
      <div className={styles.bar} style={{ width: `${((activeIndex + 1) / slides.length) * 100}%` }} />
      <div className={classNames(styles.pagination, platform.isIphoneX() && styles.iphoneX)}>
        {activeIndex + 1}/{slides.length}
      </div>
      {activeIndex !== slides.length - 1 && <div className={styles.arrow} />}
    </div>
  )
}

export default ProcessBar
