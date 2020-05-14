/* eslint-disable react/jsx-filename-extension */
import React from 'react'
import StickyContext from '../context'

function RelieveArea({ children, ...props }, ref) {
  return (
    <StickyContext.Consumer>
      {({ datasetKey }) => (
        <div {...props} ref={ref} {...{ [datasetKey]: true }}>
          {children}
        </div>
      )}
    </StickyContext.Consumer>
  )
}

export default React.forwardRef(RelieveArea)
