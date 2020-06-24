/* eslint-disable react/jsx-filename-extension */
import React, { useState, useEffect, SFC } from 'react';
import { usePreventBodyTouch } from '../../lib/logic';
import StickyContext, { context } from './context';

interface StickyConainterProps {
  datasetKey?: string;
}

const StickyContainer: SFC<StickyConainterProps> = function ({ children, datasetKey }) {
  const [state, setState] = useState(context);
  useEffect(() => {
    if (datasetKey) {
      setState((prev) => ({ ...prev, datasetKey }));
    }
  }, [datasetKey]);

  usePreventBodyTouch(state.setKey);

  return <StickyContext.Provider value={state}>{children}</StickyContext.Provider>;
};

export default StickyContainer;

export { default as RelieveArea } from './RelieveArea';
