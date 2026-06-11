import { useEffect, useState } from "react";
import { Chess } from "chess.js";

const GAMES = [
  {
    label: "Scholar's Mate",
    moves: ["e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6", "Qxf7#"],
  },
  {
    label: "Fool's Mate",
    moves: ["f3", "e5", "g4", "Qh4#"],
  },
  {
    label: "Légal's Trap",
    moves: [
      "e4", "e5", "Nf3", "d6", "Bc4", "Bg4", "Nc3", "h6",
      "Nxe5", "Bxd1", "Bxf7+", "Ke7", "Nd5#",
    ],
  },
  {
    label: "Italian Game",
    moves: [
      "e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6",
      "d3", "d6", "O-O", "O-O", "Re1", "a6",
    ],
  },
];

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

const GLYPHS = {
  w: { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔" },
  b: { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" },
};

export default function LiveChessShowcase() {
  const [gameIdx, setGameIdx] = useState(0);
  const [moveIdx, setMoveIdx] = useState(0);

  const game = GAMES[gameIdx];
  const atEnd = moveIdx >= game.moves.length;

  useEffect(() => {
    const delay = atEnd ? 2800 : moveIdx === 0 ? 1300 : 1000;
    const timer = setTimeout(() => {
      if (atEnd) {
        setGameIdx((g) => (g + 1) % GAMES.length);
        setMoveIdx(0);
      } else {
        setMoveIdx((m) => m + 1);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [gameIdx, moveIdx, atEnd]);

  const chess = new Chess();
  let lastMove = null;
  for (let i = 0; i < moveIdx && i < game.moves.length; i++) {
    lastMove = chess.move(game.moves[i]);
  }
  const board = chess.board();
  const isMate = chess.isCheckmate();

  // When the last move was a capture, fling the captured piece off the board.
  let capture = null;
  if (lastMove?.captured) {
    const capturedColor = lastMove.color === "w" ? "b" : "w";
    const col = lastMove.to.charCodeAt(0) - 97;
    const row = 8 - Number(lastMove.to[1]);
    capture = {
      key: `${gameIdx}-${moveIdx}`,
      glyph: GLYPHS[capturedColor][lastMove.captured],
      color: capturedColor,
      left: col * 12.5,
      top: row * 12.5,
      flyX: (col < 4 ? -1 : 1) * (60 + (moveIdx % 3) * 25),
      flyY: -(80 + (moveIdx % 4) * 20),
      flyRot: (moveIdx % 2 === 0 ? 1 : -1) * (180 + (moveIdx % 3) * 60),
    };
  }

  let status;
  if (moveIdx === 0) {
    status = "Setting up the position";
  } else if (isMate) {
    status = `Checkmate — ${lastMove.san}`;
  } else {
    status = `Move ${moveIdx}: ${lastMove.san}`;
  }

  return (
    <div className="chess-showcase-tilt">
      <div className="chess-showcase">
        <div className="chess-showcase-label">AI vs AI &middot; {game.label}</div>
        <div className="chess-showcase-board">
          <div className="chess-showcase-grid">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const square = `${FILES[c]}${8 - r}`;
                const isLight = (r + c) % 2 === 0;
                const isHighlight =
                  lastMove && (lastMove.from === square || lastMove.to === square);
                return (
                  <div
                    key={square}
                    className={[
                      "chess-showcase-square",
                      isLight ? "is-light" : "is-dark",
                      isHighlight ? "is-highlight" : "",
                    ].join(" ")}
                  >
                    {cell && (
                      <span className={`chess-showcase-piece piece-${cell.color}`}>
                        {GLYPHS[cell.color][cell.type]}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
          {capture && (
            <span
              key={capture.key}
              className={`chess-capture-fly piece-${capture.color}`}
              style={{
                left: `${capture.left}%`,
                top: `${capture.top}%`,
                "--fly-x": `${capture.flyX}px`,
                "--fly-y": `${capture.flyY}px`,
                "--fly-rot": `${capture.flyRot}deg`,
              }}
            >
              {capture.glyph}
            </span>
          )}
        </div>
        <div className="chess-showcase-status">
          {status}
          <span className="chess-showcase-dots">
            <span />
            <span />
            <span />
          </span>
        </div>
      </div>
    </div>
  );
}
