import omit from 'lodash/omit';
import React, { forwardRef, ForwardRefExoticComponent, PropsWithoutRef, RefAttributes, SFC, useMemo } from 'react';

import { useBootstrap, useInterceptor, usePlugins } from './bootstrap';
import { PreviewFrame } from './builtin'
import Catch from './Catch';
import StickyContainer from './components/StickyContainer';
import { MEditorContext, ThemeContext } from './context';
import { useExposeHandle, useInvokeUpdate } from './lib/logic';
import renderer from './lib/renderer';
import { useH5DSJson } from './lib/transform';

const pluginWhiteList = ['map'];

export interface IMiniEditorProps {
}

const MiniEditor = forwardRef<any, IMiniEditorProps>((props, ref) => {
  const { h5dsJSON, swiperOption, theme, hidePages, screenRatio = 1 } = props;
  const bootOptions = useMemo(() => omit(props, 'h5dsJSON'), [props]);
  useBootstrap(bootOptions);

  const h5ds = useH5DSJson(h5dsJSON, props);
  usePlugins(h5ds);
  const interOp = useMemo(() => ({ ...props, h5ds }), [h5ds, props]);
  useInterceptor(interOp);

  const invokeUpdate = useInvokeUpdate(h5ds);

  const invoke = useMemo(() => ({ ...invokeUpdate.invoke, ...h5ds.invoke }), [h5ds.invoke, invokeUpdate.invoke]);
  const contextValue = useMemo(
    () => ({
      renderer,
      pageLayout: h5ds.pageLayout,
      h5ds: h5ds.data,
      pages: h5ds.pages,
      elements: h5ds.elements,
      pluginWhiteList,
      swiperOption: { ...(swiperOption || {}), initialSlide: +getUrlQuery('page') || 0 },
      pageIndex: h5ds.page,
      hidePages,
      invoke,
      screenRatio,
      ...invokeUpdate.spread,
    }),
    [
      h5ds.pageLayout,
      h5ds.data,
      h5ds.pages,
      h5ds.elements,
      h5ds.page,
      swiperOption,
      hidePages,
      invoke,
      screenRatio,
      invokeUpdate.spread,
    ]
  );

  const themeContextValue = useMemo(() => theme || {}, [theme]);

  const mPreview = useExposeHandle(ref, { h5ds, invoke });

  return useMemo(
    () => (
      <Catch>
        <MEditorContext.Provider value={contextValue}>
          <ThemeContext.Provider value={themeContextValue}>
            <StickyContainer>
              <PreviewFrame ref={mPreview} />
            </StickyContainer>
          </ThemeContext.Provider>
        </MEditorContext.Provider>
      </Catch>
    ),
    [contextValue, mPreview, themeContextValue]
  );
});

export default MiniEditor;
