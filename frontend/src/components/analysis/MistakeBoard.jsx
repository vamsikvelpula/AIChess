import ChessBoardWrapper from "../board/ChessBoardWrapper";

function squares(uci) {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4) };
}

export default function MistakeBoard({ move }) {
  if (!move) {
    return <div className="card empty-state">Select a move to see the board.</div>;
  }

  const arrows = [];
  const played = squares(move.move_uci);
  arrows.push({ startSquare: played.from, endSquare: played.to, color: "rgba(224, 88, 79, 0.8)" });

  const showBest = move.best_move_uci && move.best_move_uci !== move.move_uci;
  if (showBest) {
    const best = squares(move.best_move_uci);
    arrows.push({ startSquare: best.from, endSquare: best.to, color: "rgba(76, 175, 110, 0.8)" });
  }

  return (
    <div className="card">
      <h2 className="section-title">
        Move {Math.ceil(move.ply / 2)}: {move.move_san}{" "}
        <span className={`tag tag-${move.classification}`}>{move.classification}</span>
      </h2>
      <ChessBoardWrapper
        fen={move.fen_before}
        onMove={() => {}}
        boardOrientation={move.ply % 2 === 1 ? "white" : "black"}
        arrows={arrows}
        disabled
      />
      <p className="text-muted" style={{ marginTop: 12 }}>
        {showBest
          ? `Played ${move.move_san} (red arrow). The engine preferred ${move.best_move_san} (green arrow).`
          : "This was the best move available in this position."}
      </p>
    </div>
  );
}
