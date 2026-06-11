import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { analyzeGame } from "../api/game";
import { ApiError } from "../api/client";
import MistakeList from "../components/analysis/MistakeList";
import MistakeBoard from "../components/analysis/MistakeBoard";

export default function AnalysisPage() {
  const { gameId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [selectedPly, setSelectedPly] = useState(null);

  useEffect(() => {
    setData(null);
    setError("");
    setSelectedPly(null);

    analyzeGame(gameId)
      .then((d) => {
        setData(d);
        if (d.moves.length > 0) {
          const worst = [...d.moves].sort((a, b) => b.cp_loss - a.cp_loss)[0];
          setSelectedPly(worst.cp_loss > 0 ? worst.ply : d.moves[0].ply);
        }
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Could not analyze this game.")
      );
  }, [gameId]);

  if (error) {
    return <div className="form-error">{error}</div>;
  }
  if (!data) {
    return <div className="page-loading">Analyzing your game... this can take a moment.</div>;
  }

  const { summary, moves, feedback } = data;
  const selectedMove = moves.find((m) => m.ply === selectedPly) || null;

  return (
    <div>
      <h1 className="section-title">Game Analysis</h1>

      <div className="card">
        <div className="analysis-summary">
          <div className="stat-box">
            <div className="stat-value">{summary.accuracy_pct}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{summary.best}</div>
            <div className="stat-label">Best</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{summary.good}</div>
            <div className="stat-label">Good</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{summary.inaccuracies}</div>
            <div className="stat-label">Inaccuracies</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{summary.mistakes}</div>
            <div className="stat-label">Mistakes</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{summary.blunders}</div>
            <div className="stat-label">Blunders</div>
          </div>
        </div>

        <h2 className="section-title">Improvement Tips</h2>
        <ul className="feedback-list">
          {feedback.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="analysis-layout" style={{ marginTop: 20 }}>
        <div>
          <h2 className="section-title">Your Moves</h2>
          {moves.length === 0 ? (
            <div className="empty-state">No moves to analyze for this game.</div>
          ) : (
            <MistakeList moves={moves} selectedPly={selectedPly} onSelect={setSelectedPly} />
          )}
        </div>
        <MistakeBoard move={selectedMove} />
      </div>

      <p style={{ marginTop: 20 }}>
        <Link to="/history" className="btn btn-ghost">Back to History</Link>
      </p>
    </div>
  );
}
