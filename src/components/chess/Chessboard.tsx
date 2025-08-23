import { useMemo } from "react";

export type Piece = { type: string; color: "w" | "b" } | null;

const PIECE_UNICODE: Record<string, string> = {
  wK: "♔",
  wQ: "♕",
  wR: "♖",
  wB: "♗",
  wN: "♘",
  wP: "♙",
  bK: "♚",
  bQ: "♛",
  bR: "♜",
  bB: "♝",
  bN: "♞",
  bP: "♟",
};

const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

interface ChessboardProps {
  board: Piece[][]; // 8x8 matrix from chess.board()
  selected?: string;
  legalTargets?: string[];
  onSquareClick?: (square: string) => void;
  orientation?: "white" | "black";
}

const Chessboard = ({ board, selected, legalTargets = [], onSquareClick, orientation = "white" }: ChessboardProps) => {
  const legalSet = useMemo(() => new Set(legalTargets), [legalTargets]);

  const ranks = orientation === "white" ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
  const cols = orientation === "white" ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];

  return (
    <div
      className="grid aspect-square w-full max-w-[min(90vw,600px)] grid-cols-8 overflow-hidden rounded-lg border"
      role="grid"
      aria-label="Chessboard"
    >
      {ranks.map((r) =>
        cols.map((c) => {
          const dark = (r + c) % 2 === 1;
          const square = `${files[c]}${8 - r}`; // algebraic name
          const p = board?.[r]?.[c];
          const isSelected = selected === square;
          const isLegal = legalSet.has(square);
          const key = `${r}-${c}`;

          return (
            <button
              type="button"
              key={key}
              role="gridcell"
              aria-label={`Square ${square}`}
              onClick={() => onSquareClick?.(square)}
              className={`${dark ? "bg-muted" : "bg-card"} relative flex items-center justify-center text-lg text-foreground outline-none`}
            >
              {/* Highlight for selected square */}
              {isSelected && (
                <span className="pointer-events-none absolute inset-0 ring-2 ring-primary/70" />
              )}

              {/* Legal target dots */}
              {isLegal && (
                <span className="pointer-events-none absolute h-3 w-3 rounded-full bg-primary/60" />
              )}

              {/* Piece */}
              {p && (
                <span className="select-none text-2xl md:text-3xl" aria-label={`${p.color === "w" ? "White" : "Black"} ${p.type}`}>
                  {PIECE_UNICODE[`${p.color}${p.type.toUpperCase()}`]}
                </span>
              )}
            </button>
          );
        })
      )}
    </div>
  );
};

export default Chessboard;
