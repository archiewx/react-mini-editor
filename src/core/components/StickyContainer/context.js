import React from 'react'

export const context = {
  datasetKey: 'data-relieve-sticky',
  setKey: 'relieveSticky'
}

const StickyContext = React.createContext(context)

export default StickyContext
