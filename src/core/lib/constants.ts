export const ELEMENT_TYPE = {
  IMAGE: 'image',
  TEXT: 'text'
}

export const H5DS_RELATIVE_ALIAS = {
  h5ds_text: 'text',
  h5ds_img: 'image'
}

export const H5DS_ADAPTER = {
  H5DS_GLOBAL: 'H5DS_GLOBAL'
}

export const PLUGIN_HOST =
  process.env.NODE_ENV === 'production' && ['prod', 'pre'].includes(window.runtime.env)
    ? 'https://kjj-h5we.duiba.com.cn/static'
    : 'https://kjj-h5we.duibatest.com.cn/static'

export const BUILTIN_PREVIEW_MODE = {
  SWIPER: 'swiper',
  STATIC: 'static'
}

export const TEXT_ACTION_TYPE = {
  TEXT_CHANGE: 'text_change',
  FONT_SIZE_CHANGE: 'size_change_change',
  COLOR_CHANGE: 'color_change'
}

export const IMAGE_ACTION_TYPE = {
  CHANGE_IMAGE: 'change_image',
  ROTATE_IMAGE: 'rotate_image',
  ZOOM_IN_IMAGE: 'zoom_in_image',
  ZOOM_OUT_IMAGE: 'zoom_out_image'
}

export const IMAGE_TOOLKIT_DRT = {
  HT: 'horizontal-top',
  HB: 'horizontal-bottom',
  VL: 'vertical-left',
  VR: 'vertical-right'
}

export const EMOJI_REGEX = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g

const withDpr = (num) => num * window.devicePixelRatio
export const USER_CARD_STYLE = {
  CARD_HEIGHT: withDpr(90),
  AVATAR_SIZE: withDpr(52),
  AVATAR_TOP: withDpr(19),
  AVATAR_LEFT: withDpr(20),
  USER_NAME_TOP: withDpr(23),
  USER_NAME_LEFT: withDpr(80),
  USER_NAME_WIDTH: withDpr(160),
  USER_NAME_HEIGHT: withDpr(20 * 1.2),
  USER_STYLE: {
    color: 'rgba(51, 51, 51, 1)',
    fontFamily: 'PingFangSC',
    fontWeight: 500,
    fontSize: withDpr(18),
    lineHeight: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  COMPANY_NAME_TOP: withDpr(56.6),
  COMPANY_NAME_LEFT: withDpr(80),
  COMPANY_NAME_WIDTH: withDpr(170),
  COMPANY_NAME_HEIGHT: withDpr(14 * 1.2),
  COMPANY_STYLE: {
    color: 'rgba(102, 102, 102, 1)',
    fontFamily: 'PingFangSC',
    fontWeight: 400,
    fontSize: withDpr(12),
    lineHeight: 1,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  QR_SIZE: withDpr(61),
  QR_TOP: withDpr(14.5),
  QR_RIGHT: withDpr(15.5)
}
