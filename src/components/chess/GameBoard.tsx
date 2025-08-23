import { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from "react";
import { Chess, Move } from "chess.js";
import Chessboard from "@/components/chess/Chessboard";
import { API_URL } from "@/lib/api";
import { toast } from "sonner";

export type Piece = { type: string; color: "w" | "b" } | null;

type MovePayload = { from: string; to: string; san?: string; fen: string; by: "human" | "ai" };

function boardToMatrix(chess: Chess): Piece[][] {
  // chess.board() already returns 8x8 but types may vary; normalize to our Piece type
  return chess
    .board()
    .map((row) => row.map((p) => (p ? { type: p.type, color: p.color } : null)) as Piece[]);
}

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

const GameBoard = forwardRef<
  { applyMove: (moveData: any) => void },
  {
    vsAI?: boolean;
    onMove?: (m: MovePayload) => void | Promise<void>;
    onGameOver?: (result: "1-0" | "0-1" | "1/2-1/2") => void | Promise<void>;
  }
>((
  {
    vsAI = false,
    onMove,
    onGameOver,
  },
  ref
) => {
  const [chess] = useState(() => new Chess());
  const [board, setBoard] = useState<Piece[][]>(() => boardToMatrix(chess));
  const [selected, setSelected] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [thinking, setThinking] = useState(false);

  const turn = chess.turn();
  const gameOver = useMemo(() => chess.isGameOver(), [board]);

  useEffect(() => {
    document.title = `Chess ${gameOver ? "— Game Over" : "— Your Move"}`;
  }, [gameOver]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    applyMove: (moveData: any) => {
      try {
        const move = chess.move({
          from: moveData.from,
          to: moveData.to,
          promotion: moveData.promotion || 'q'
        });
        if (move) {
          setBoard(boardToMatrix(chess));
          setSelected(null);
          setLegalTargets([]);
        }
      } catch (error) {
        console.error('Failed to apply move:', error);
      }
    }
  }), [chess]);

  const computeResult = () => {
    if (chess.isCheckmate()) return chess.turn() === "w" ? "0-1" : "1-0";
    return "1/2-1/2";
  };

  const handleSquareClick = async (square: string) => {
    if (gameOver || thinking) return;

    const piece = chess.get(square as any);
    if (selected && legalTargets.includes(square)) {
      const move = chess.move({ from: selected as any, to: square as any, promotion: "q" });
      if (move) {
        setSelected(null);
        setLegalTargets([]);
        setBoard(boardToMatrix(chess));

        // Persist human move
        try {
          await onMove?.({ from: move.from, to: move.to, san: move.san, fen: chess.fen(), by: "human" });
        } catch (e: any) {
          console.error(e);
        }

        if (chess.isGameOver()) {
          const result = computeResult();
          await onGameOver?.(result);
          return;
        }

        if (vsAI && !chess.isGameOver()) {
          try {
            setThinking(true);
            // Try local WASM engine first
            let uci = "";
            try {
              const { getBestMoveWASM } = await import("@/lib/stockfish");
              uci = await getBestMoveWASM(chess.fen());
            } catch {
              // Fallback to server AI
              const res = await fetch(`${API_URL}/api/games/ai/bestmove`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fen: chess.fen() }),
              });
              if (!res.ok) throw new Error((await res.json()).message || "AI failed");
              const data = await res.json();
              const best = typeof data.best === "string" ? data.best : "";
              uci = best;
            }

            if (uci) {
              const from = uci.slice(0, 2);
              const to = uci.slice(2, 4);
              const promo = uci.length > 4 ? uci.slice(4, 5) : undefined;
              const made = chess.move({ from: from as any, to: to as any, promotion: promo as any });
              if (made) {
                setBoard(boardToMatrix(chess));
                try {
                  await onMove?.({ from: made.from, to: made.to, san: made.san, fen: chess.fen(), by: "ai" });
                } catch {}
              }
            }
          } catch (e: any) {
            toast.error(e?.message || "Failed to get AI move.");
          } finally {
            setThinking(false);
          }
        }

        if (chess.isGameOver()) {
          const result = computeResult();
          await onGameOver?.(result);
        }
      }
      return;
    }

    if (piece && piece.color === turn) {
      setSelected(square);
      const moves = chess.moves({ square: square as any, verbose: true });
      setLegalTargets(moves.map((m) => m.to));
    } else {
      setSelected(null);
      setLegalTargets([]);
    }
  };

  return (
    <div className="w-full max-w-[min(90vw,600px)]">
      <Chessboard
        board={board}
        selected={selected || undefined}
        legalTargets={legalTargets}
        onSquareClick={handleSquareClick}
      />
      <div className="mt-3 text-center text-sm text-muted-foreground">
        {gameOver ? "Game over" : thinking ? "AI is thinking..." : `Turn: ${turn === "w" ? "White" : "Black"}`}
      </div>
    </div>
  );
});

export default GameBoard;
