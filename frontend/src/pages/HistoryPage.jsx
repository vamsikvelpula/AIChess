import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGameHistory } from "../api/game";
import { ApiError } from "../api/client";

function outcome(game) {
  if (!game.result) return { label: "-", className: "" };
  if (game.result === "1/2-1/2") return { label: "Draw", className: "result-draw" };
  const won =
    (game.result === "1-0" && game.user_color === "white") ||
    (game.result === "0-1" && game.user_color === "black");
  return won ? { label: "Win", className: "result-win" } : { label: "Loss", className: "result-loss" };
}

function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
}

export default function HistoryPage() {
  const [games, setGames] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getGameHistory()
      .then((data) => setGames(data.games))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load game history."));
  }, []);

  if (error) {
    return <div className="form-error">{error}</div>;
  }
  if (!games) {
    return <div className="page-loading">Loading game history...</div>;
  }

  return (
    <div>
      <h1 className="section-title">Game History</h1>
      {games.length === 0 ? (
        <div className="card empty-state">
          You haven't completed any games yet. Head to the dashboard and play your first match!
        </div>
      ) : (
        <div className="card">
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Level</th>
                <th>Color</th>
                <th>Result</th>
                <th>Accuracy</th>
                <th>Level Up</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => {
                const { label, className } = outcome(game);
                return (
                  <tr key={game.game_id}>
                    <td>{formatDate(game.completed_at || game.created_at)}</td>
                    <td>{game.level}</td>
                    <td>{game.user_color}</td>
                    <td className={className}>{label}</td>
                    <td>{game.summary ? `${game.summary.accuracy_pct}%` : "-"}</td>
                    <td>{game.level_up ? "↑ Unlocked next" : ""}</td>
                    <td>
                      <Link to={`/analysis/${game.game_id}`} className="btn btn-ghost">
                        View Analysis
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
