// Simple Stockfish WASM helper (browser-side)
// Loads from public/stockfish/stockfish.js and resolves UCI bestmove

export async function getBestMoveWASM(
  fen: string,
  opts?: { depth?: number; skill?: number }
): Promise<string> {
  const depth = opts?.depth ?? 12;
  const skill = opts?.skill ?? 10;

  return new Promise((resolve, reject) => {
    try {
      // stockfish.js is a classic worker script; it will load stockfish.wasm from the same folder
      const engine = new Worker('/stockfish/stockfish.js');
      let settled = false;

      engine.onmessage = (e: MessageEvent) => {
        const text = typeof e.data === 'string' ? e.data : '';
        if (!text) return;
        if (text.startsWith('bestmove')) {
          const move = text.split(' ')[1];
          settled = true;
          engine.terminate();
          resolve(move);
        }
      };

      engine.onerror = (err) => {
        if (!settled) {
          settled = true;
          engine.terminate();
          reject(err);
        }
      };

      engine.postMessage('uci');
      engine.postMessage(`setoption name Skill Level value ${skill}`);
      engine.postMessage('ucinewgame');
      engine.postMessage(`position fen ${fen}`);
      engine.postMessage(`go depth ${depth}`);
    } catch (e) {
      reject(e);
    }
  });
}
