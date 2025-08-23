// Minimal Stockfish wrapper (node-side). This uses the `stockfish` npm package.
// Note: Depending on environment, you may need additional flags or alternative engine integration.

let Stockfish
try {
  // dynamic import to avoid crash if not installed
  Stockfish = (await import('stockfish')).default
} catch (e) {
  Stockfish = null
}

export function getBestMove(fen, { depth = 12, skill = 10 } = {}) {
  if (!Stockfish) {
    // Fallback stub
    return Promise.resolve({ move: '0000', note: 'Stockfish not available in this environment' })
  }

  return new Promise((resolve) => {
    const engine = Stockfish()
    const onMessage = (line) => {
      const text = typeof line === 'string' ? line : line?.data
      if (!text) return
      if (text.startsWith('bestmove')) {
        const move = text.split(' ')[1]
        engine.postMessage('quit')
        resolve({ move })
      }
    }

    engine.onmessage = onMessage

    engine.postMessage('uci')
    engine.postMessage(`setoption name Skill Level value ${skill}`)
    engine.postMessage('ucinewgame')
    engine.postMessage(`position fen ${fen}`)
    engine.postMessage(`go depth ${depth}`)
  })
}
