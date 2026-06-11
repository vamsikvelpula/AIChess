const TAG_LABELS = {
  best: "Best",
  good: "Good",
  inaccuracy: "Inaccuracy",
  mistake: "Mistake",
  blunder: "Blunder",
};

export default function MistakeList({ moves, selectedPly, onSelect }) {
  return (
    <div className="mistake-list">
      {moves.map((m) => (
        <div
          key={m.ply}
          className={`mistake-row${m.ply === selectedPly ? " selected" : ""}`}
          onClick={() => onSelect(m.ply)}
        >
          <span className="move-no">{Math.ceil(m.ply / 2)}.</span>
          <span className="move-san">{m.move_san}</span>
          <span className="best-san">
            {m.classification !== "best" && m.best_move_san ? `Best: ${m.best_move_san}` : ""}
          </span>
          <span className={`tag tag-${m.classification}`}>{TAG_LABELS[m.classification]}</span>
        </div>
      ))}
    </div>
  );
}
