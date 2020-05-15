import Editor from './core'
import { BUILTIN_PREVIEW_MODE } from './core/lib/constants'
// import H5DSPreview from './core/components/H5DSView'
import StickyContainer, { RelieveArea } from './core/components/StickyContainer'

Editor.PREVIEW_MODE = BUILTIN_PREVIEW_MODE

// Editor.H5DSPreview = H5DSPreview
Editor.StickyContainer = StickyContainer
Editor.RelieveArea = RelieveArea

export { setPageData } from './core/lib/transform'
export { getPageData } from './core/lib/transform'

export default Editor
