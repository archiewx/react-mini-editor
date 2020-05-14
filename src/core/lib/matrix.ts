export function transform2Matrix(transform) {
  if (transform) {
    if (transform.indexOf('matrix') > -1) return cssMatrix2Object(transform)

    const reg = /(rotate\(([-]?\d+)deg\)?)\s?(translate\((\d+)px,(\d+)px\))?\s?(scale\((\d+),(\d+)\))?\s?(skew\((\d+)deg,(\d+)deg\))?/g
    const res = reg.exec(transform)
    const rotate = Number(res[2] || 0)
    const radian = (res[2] * Math.PI) / 180
    const translate = [res[4] || 0, res[5] || 0]
    const scale = [res[7] || 0, res[8] || 0]
    const skew = [((res[10] || 0) * Math.PI) / 180, ((res[11] || 0) * Math.PI) / 180]

    const a1 = Math.cos(radian)
    const b1 = Math.sin(radian)
    const c1 = -b1
    const d1 = a1

    const c2 = Math.tan(skew[0]) // x倾斜
    const b2 = Math.tan(skew[1]) // y倾斜

    // const a2 = Number(scale[0]) === 1 && a1 === 1 ? 0 : Number(scale[0])
    // const d2 = Number(scale[1]) === 1 && d1 === 1 ? 0 : Number(scale[0])
    const a2 = Number(scale[0]) === 1 ? 0 : Number(scale[0])
    const d2 = Number(scale[1]) === 1 ? 0 : Number(scale[0])

    const a = a1 + a2
    const b = b1 + b2
    const c = c1 + c2
    const d = d1 + d2
    const tx = translate[0]
    const ty = translate[1]

    return { a, b, c, d, tx, ty, rotate, scale, skew, translate: [tx, ty] }
  }
  return { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0, rotate: 0, scale: [1, 1], skew: [0, 0], transform: [0, 0] }
}

export function object2CssMatrix(matrix) {
  const t = matrix
  return `matrix(${t.a}, ${t.b}, ${t.c}, ${t.d}, ${t.tx}, ${t.ty})`
}

export function matrixScale(matrix, scale = [0, 0]) {
  if (typeof matrix === 'string') matrix = cssMatrix2Object(matrix)

  matrix.a += scale[0] * matrix.a
  matrix.b += scale[1] * matrix.b
  matrix.c += scale[0] * matrix.c
  matrix.d += scale[1] * matrix.d
  return object2CssMatrix(matrix)
}

export function matrixTranslate(matrix, translate = [0, 0]) {
  if (typeof matrix === 'string') matrix = cssMatrix2Object(matrix)

  matrix.tx = translate[0]
  matrix.ty = translate[1]

  return object2CssMatrix(matrix)
}

export function matrixRotateValue(rotate = 0) {
  const radian = (rotate * Math.PI) / 180
  const a = Math.cos(radian)
  const b = Math.sin(radian)
  const c = -b
  const d = a
  return [a, b, c, d]
}

export function matrixRotate(matrix, rotate = 0, scale = 1) {
  if (typeof matrix === 'string') matrix = cssMatrix2Object(matrix)

  const [a, b, c, d] = matrixRotateValue(rotate)
  const sr = scale - 1

  matrix.a = a + a * sr
  matrix.b = b + b * sr
  matrix.c = c + c * sr
  matrix.d = d + d * sr

  return object2CssMatrix(matrix)
}

/**
 * 矩阵元素
 */
export function cssMatrix2Object(matrix) {
  const reg = /matrix\((.+)\w*,\w*(.+)\w*,\w*(.+)\w*,\w*(.+)\w*,\w*(.+)\w*,\w*(.+)\)/g
  const match = reg.exec(matrix)

  const a = Number(match[1])
  const b = Number(match[2])
  const c = Number(match[3])
  const d = Number(match[4])
  const tx = Number(match[5])
  const ty = Number(match[6])
  return { a, b, c, d, tx, ty }
}
