import { useEffect, useState } from "react";
import { Chess } from "chess.js";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const PROMOTION_PIECES = ["q", "r", "b", "n"];

const WHITE_GLYPHS = { p: "♙", n: "♘", b: "♗", r: "♖", q: "♕", k: "♔" };
const BLACK_GLYPHS = { p: "♟", n: "♞", b: "♝", r: "♜", q: "♛", k: "♚" };

const PIECE_SHAPES = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" };

function isDarkSquare(file, rank) {
  return (FILES.indexOf(file) + rank) % 2 === 1;
}

export default function Chess3DBoard({ fen, onMove, boardOrientation = "white", disabled = false, lastMove = null }) {
  const [selected, setSelected] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [promotionChoice, setPromotionChoice] = useState(null);

  useEffect(() => {
    setSelected(null);
    setLegalMoves([]);
    setPromotionChoice(null);
  }, [fen]);

  let game;
  try {
    game = new Chess(fen);
  } catch {
    game = new Chess();
  }

  const board = game.board();
  let displayRanks = [8, 7, 6, 5, 4, 3, 2, 1];
  let displayFiles = FILES;
  if (boardOrientation === "black") {
    displayRanks = [1, 2, 3, 4, 5, 6, 7, 8];
    displayFiles = [...FILES].reverse();
  }

  function pieceAt(file, rank) {
    return board[8 - rank]?.[FILES.indexOf(file)] ?? null;
  }

  let checkSquare = null;
  if (game.inCheck()) {
    const turn = game.turn();
    for (const row of board) {
      for (const cell of row) {
        if (cell && cell.type === "k" && cell.color === turn) {
          checkSquare = cell.square;
        }
      }
    }
  }

  function commitMove(from, to, promotion) {
    const next = new Chess(fen);
    let move;
    try {
      move = next.move({ from, to, promotion: promotion || undefined });
    } catch {
      move = null;
    }
    setSelected(null);
    setLegalMoves([]);
    setPromotionChoice(null);
    if (!move) return;
    onMove({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
      san: move.san,
      uci: move.lan,
      fen: next.fen(),
    });
  }

  function handleSquareClick(square) {
    if (disabled || promotionChoice) return;

    if (selected) {
      const move = legalMoves.find((m) => m.to === square);
      if (move) {
        if (move.promotion) {
          setPromotionChoice({ from: selected, to: square });
          return;
        }
        commitMove(selected, square);
        return;
      }
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelected(square);
      setLegalMoves(game.moves({ square, verbose: true }));
    } else {
      setSelected(null);
      setLegalMoves([]);
    }
  }

  const promoColor = game.turn();

  return (
    <div className="chess-3d-surface">
      {displayRanks.map((rank) =>
        displayFiles.map((file) => {
              const square = `${file}${rank}`;
              const piece = pieceAt(file, rank);
              const dark = isDarkSquare(file, rank);
              const moveHere = legalMoves.find((m) => m.to === square);

              const classes = ["chess-3d-square", dark ? "is-dark" : "is-light"];
              if (selected === square) classes.push("is-selected");
              if (lastMove && (lastMove.from === square || lastMove.to === square)) classes.push("is-last-move");
              if (checkSquare === square) classes.push("is-check");
              if (moveHere) {
                classes.push(moveHere.flags.includes("c") || moveHere.flags.includes("e") ? "is-capture-target" : "is-move-target");
              }

              return (
                <div key={square} data-square={square} className={classes.join(" ")} onClick={() => handleSquareClick(square)}>
                  {moveHere && <span className="chess-3d-marker" />}
                  {piece && (() => {
                    const justLanded = lastMove?.to === square;
                    const pieceClasses = ["chess-3d-piece", `chess-3d-piece--${piece.color === "w" ? "white" : "black"}`];
                    if (justLanded) pieceClasses.push("chess-3d-piece--landing");
                    return (
                      <div
                        key={justLanded ? `landed-${lastMove.from}-${lastMove.to}` : "piece"}
                        className={pieceClasses.join(" ")}
                      >
                        <span className="chess-3d-piece-shadow" />
                        <span className="chess-3d-piece-base" />
                        <div className={`chess-3d-piece-stand iso-piece iso-piece--${PIECE_SHAPES[piece.type]}`}>
                          <span className="iso-piece-body" />
                          <span className="iso-piece-top" />
                          <span className="iso-piece-accent" />
                          <span className="iso-piece-detail" />
                        </div>
                      </div>
                    );
                  })()}
                  {promotionChoice?.to === square && (
                    <div className="chess-3d-promo">
                      {PROMOTION_PIECES.map((p) => (
                        <button
                          key={p}
                          type="button"
                          className="chess-3d-promo-option"
                          onClick={(e) => {
                            e.stopPropagation();
                            commitMove(promotionChoice.from, promotionChoice.to, p);
                          }}
                        >
                          {(promoColor === "w" ? WHITE_GLYPHS : BLACK_GLYPHS)[p]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
    </div>
  );
}
