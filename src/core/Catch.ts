import React, { ErrorInfo } from 'react';
import mHook from './lib/hook';

class Catch extends React.Component {
  componentDidCatch(error: Error, info: ErrorInfo) {
    mHook.error.call(error);
  }

  render() {
    const { children } = this.props;
    return children;
  }
}

export default Catch;
