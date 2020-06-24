import Editor from './core';
import { BUILTIN_PREVIEW_MODE } from './core/lib/constants';
import StickyContainer, { RelieveArea } from './core/components/StickyContainer';

type ExportEditor = typeof Editor;

interface EditorInstance extends ExportEditor {
  PREVIEW_MODE: typeof BUILTIN_PREVIEW_MODE;
  StickContainer: typeof StickyContainer;
  RelieveArea: typeof RelieveArea;
}

const EditorInstance = Editor as EditorInstance;

EditorInstance.PREVIEW_MODE = BUILTIN_PREVIEW_MODE;

EditorInstance.StickContainer = StickyContainer;
EditorInstance.RelieveArea = RelieveArea;

export default Editor;
