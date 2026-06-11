import { useNavigate } from "react-router-dom";
import { MAX_LEVEL } from "../../data/levels";

export default function CongratsModal({ outcome, leveledUp, level, gameId }) {
  const navigate = useNavigate();

  let title;
  let message;
  if (outcome === "win") {
    title = "Congratulations!";
    message = leveledUp
      ? `You won! Level ${level + 1} is now unlocked.`
      : "You won this game! Replay to sharpen your skills further.";
  } else if (outcome === "draw") {
    title = "Draw!";
    message = "The game ended in a draw. Well played.";
  } else {
    title = "Good Game";
    message = "The AI won this time. Review your mistakes and try again!";
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={() => navigate(`/analysis/${gameId}`)}>
            View Analysis
          </button>
          {outcome === "win" && leveledUp && level < MAX_LEVEL && (
            <button className="btn btn-primary" onClick={() => navigate(`/play/${level + 1}`)}>
              Next Level
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => navigate("/")}>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
