import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import Chess3DScene from "./Chess3DScene";
import {
  boardStyle,
  darkSquareStyle,
  lightSquareStyle,
  dropSquareStyle,
  draggingPieceStyle,
  draggingPieceGhostStyle,
  darkSquareNotationStyle,
  lightSquareNotationStyle,
  lastMoveSquareStyle,
  checkSquareStyle,
} from "./boardTheme";

const VIEW_KEY = "aichess-board-view";

function findCheckedKingSquare(fen) {
  if (!fen) return null;
  try {
    const game = new Chess(fen);
    if (!game.inCheck()) return null;
    const turn = game.turn();
    for (const row of game.board()) {
      for (const piece of row) {
        if (piece && piece.type === "k" && piece.color === turn) {
          return piece.square ?? null;
        }
      }
    }
  } catch {
    return null;
  }
  return null;
}

export default function ChessBoardWrapper({
  fen,
  onMove,
  boardOrientation = "white",
  arrows = [],
  disabled = false,
  lastMove = null,
  whiteTime = null,
  blackTime = null,
  activeColor = null,
  userColor = "white",
  status = "in_progress",
  result = null,
  isCheck = false,
  aiThinking = false,
}) {
  const [view3D, setView3D] = useState(() => {
    try {
      return localStorage.getItem(VIEW_KEY) === "3d";
    } catch {
      return false;
    }
  });

  function setView(next) {
    setView3D(next);
    try {
      localStorage.setItem(VIEW_KEY, next ? "3d" : "2d");
    } catch {
      // ignore - localStorage may be unavailable
    }
  }

  function handlePieceDrop({ piece, sourceSquare, targetSquare }) {
    if (disabled || !targetSquare) return false;

    const game = new Chess(fen);
    const isPawn = piece.pieceType?.[1]?.toUpperCase() === "P";
    const isPromotion = isPawn && (targetSquare[1] === "8" || targetSquare[1] === "1");

    let move;
    try {
      move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: isPromotion ? "q" : undefined,
      });
    } catch {
      return false;
    }
    if (!move) return false;

    onMove({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
      san: move.san,
      uci: move.lan,
      fen: game.fen(),
    });
    return true;
  }

  const squareStyles = {};
  if (lastMove?.from && lastMove?.to) {
    squareStyles[lastMove.from] = lastMoveSquareStyle;
    squareStyles[lastMove.to] = lastMoveSquareStyle;
  }
  const checkSquare = findCheckedKingSquare(fen);
  if (checkSquare) {
    squareStyles[checkSquare] = checkSquareStyle;
  }

  const options = {
    position: fen,
    onPieceDrop: handlePieceDrop,
    boardOrientation,
    arrows,
    allowDragging: !disabled,
    animationDurationInMs: 200,
    boardStyle,
    darkSquareStyle,
    lightSquareStyle,
    dropSquareStyle,
    draggingPieceStyle,
    draggingPieceGhostStyle,
    darkSquareNotationStyle,
    lightSquareNotationStyle,
    squareStyles,
  };

  return (
    <div className={`board-container${view3D ? " board-container--3d" : ""}`}>
      <div className="board-view-toggle">
        <button type="button" className={view3D ? "" : "is-active"} onClick={() => setView(false)}>
          2D Board
        </button>
        <button type="button" className={view3D ? "is-active" : ""} onClick={() => setView(true)}>
          3D Table
        </button>
      </div>
      {view3D ? (
        <Chess3DScene
          fen={fen}
          onMove={onMove}
          boardOrientation={boardOrientation}
          disabled={disabled}
          lastMove={lastMove}
          whiteTime={whiteTime}
          blackTime={blackTime}
          activeColor={activeColor}
          userColor={userColor}
          status={status}
          result={result}
          isCheck={isCheck}
          aiThinking={aiThinking}
        />
      ) : (
        <Chessboard options={options} />
      )}
    </div>
  );
}
