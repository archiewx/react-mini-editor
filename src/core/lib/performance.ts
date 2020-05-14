import { logMark, errorMark } from './log'

const beginQueue = []

function begin() {
  beginQueue.push(Date.now())
}

function end(ind) {
  const timePoint = beginQueue.pop()
  if (!timePoint) {
    errorMark('performance.begin with end in pairs')
  }

  const consume = Date.now() - timePoint
  // 上报消耗时间
  logMark(ind, consume + 'ms')
}

export default {
  begin,
  end
}
