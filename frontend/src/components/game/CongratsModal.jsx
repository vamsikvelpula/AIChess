import { useNavigate } from "react-router-dom";
import { MAX_LEVEL } from "../../data/levels";

export default function CongratsModal({ outcome, leveledUp, level, gameId, tournamentMode }) {
  const navigate = useNavigate();

  let title;
  let message;
  if (outcome === "win") {
    title = "Congratulations!";
    message = tournamentMode
      ? "You won! Take on another bot from the lineup."
      : leveledUp
      ? `You won! Level ${level + 1} is now unlocked.`
      : "You won this game! Replay to sharpen your skills further.";
  } else if (outcome === "draw") {
    title = "Draw!";
    message = "The game ended in a draw. Well played.";
  } else {
    title = "Good Game";
    message = "The AI won this time. Review your mistakes and try again!";
  }

  const homePath = tournamentMode ? "/tournament" : "/";
  const homeLabel = tournamentMode ? "Bot List" : "Dashboard";
  const showNextLevel = !tournamentMode && outcome === "win" && leveledUp && level < MAX_LEVEL;
  const showNextOpponent = tournamentMode && level < MAX_LEVEL;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={() => navigate(`/analysis/${gameId}`)}>
            View Analysis
          </button>
          {showNextLevel && (
            <button className="btn btn-primary" onClick={() => navigate(`/play/${level + 1}`)}>
              Next Level
            </button>
          )}
          {showNextOpponent && (
            <button className="btn btn-primary" onClick={() => navigate(`/tournament/${level + 1}`)}>
              Next Opponent
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => navigate(homePath)}>
            {homeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
