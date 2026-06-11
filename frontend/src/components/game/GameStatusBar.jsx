export default function GameStatusBar({ level, levelLabel, statusText, isCheck }) {
  return (
    <div className={`game-status-bar${isCheck ? " is-check" : ""}`}>
      <div className="flex-row">
        <span className="level-badge">Level {level}</span>
        <span>{levelLabel}</span>
      </div>
      <div className="flex-row">
        <span className="status-text">{statusText}</span>
        {isCheck && <span className="tag tag-blunder">Check!</span>}
      </div>
    </div>
  );
}
