import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDailyPuzzle } from "../../api/puzzles";
import { THEME_LABELS } from "../../data/puzzleThemes";

export default function DailyPuzzleCard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDailyPuzzle()
      .then(setData)
      .catch(() => setError("Couldn't load today's puzzle."));
  }, []);

  return (
    <div className="card daily-puzzle-card">
      <h2 className="section-title">Daily Puzzle</h2>
      {error && <div className="form-error">{error}</div>}
      {!data && !error && <p className="subtitle">Loading...</p>}
      {data && (
        <>
          {data.completed && <div className="completed-badge">Solved today &#10003;</div>}
          <p className="puzzle-meta">
            {THEME_LABELS[data.puzzle.theme] || data.puzzle.theme}
            {" · "}Difficulty {data.puzzle.difficulty}
          </p>
          <Link to={`/puzzles/${data.puzzle.id}`} className="btn btn-primary">
            {data.completed ? "Solve Again" : "Solve Today's Puzzle"}
          </Link>
        </>
      )}
    </div>
  );
}
