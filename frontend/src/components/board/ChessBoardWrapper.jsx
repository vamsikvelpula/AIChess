import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function ChessBoardWrapper({
  fen,
  onMove,
  boardOrientation = "white",
  arrows = [],
  disabled = false,
}) {
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

  const options = {
    position: fen,
    onPieceDrop: handlePieceDrop,
    boardOrientation,
    arrows,
    allowDragging: !disabled,
    animationDurationInMs: 200,
  };

  return (
    <div className="board-container">
      <Chessboard options={options} />
    </div>
  );
}
