// Simple rating-based matchmaking (nearest neighbor)
const queue = new Map() // userId -> { userId, rating, socketId }

export function joinQueue({ userId, rating, socketId }) {
  queue.set(userId, { userId, rating, socketId })
}

export function leaveQueue(userId) {
  queue.delete(userId)
}

export function findMatchFor(userId) {
  const me = queue.get(userId)
  if (!me) return null
  let best = null
  for (const [uid, p] of queue) {
    if (uid === userId) continue
    const diff = Math.abs((p.rating ?? 1200) - (me.rating ?? 1200))
    if (!best || diff < best.diff) best = { other: p, diff }
  }
  if (best) {
    // Remove both from queue
    queue.delete(userId)
    queue.delete(best.other.userId)
    return { a: me, b: best.other }
  }
  return null
}
