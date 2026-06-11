export default function GameStatusBar({ level, levelLabel, statusText, isCheck }) {
  return (
    <div className="game-status-bar">
      <div className="flex-row">
        <span className="level-badge">Level {level}</span>
        <span>{levelLabel}</span>
      </div>
      <div className="flex-row">
        <span>{statusText}</span>
        {isCheck && <span className="tag tag-blunder">Check!</span>}
      </div>
    </div>
  );
}
