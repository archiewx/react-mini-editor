import React from 'react'
import mHook from './lib/hook'

class Catch extends React.Component {
  componentDidCatch(error, info) {
    mHook.error.call(error)
  }

  render() {
    const { children } = this.props
    return children
  }
}

export default Catch
