import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listPuzzles } from "../api/puzzles";
import { ApiError } from "../api/client";
import { THEME_LABELS } from "../data/puzzleThemes";

export default function PuzzlesPage() {
  const [puzzles, setPuzzles] = useState(null);
  const [theme, setTheme] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPuzzles(null);
    listPuzzles({ theme: theme || undefined, difficulty: difficulty || undefined })
      .then((data) => setPuzzles(data.puzzles))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load puzzles."));
  }, [theme, difficulty]);

  return (
    <div>
      <h1 className="section-title">Puzzles</h1>
      <div className="filter-bar">
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="">All Themes</option>
          {Object.entries(THEME_LABELS)
            .filter(([value]) => !["mate_in_2", "mate_in_3"].includes(value))
            .map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All Difficulties</option>
          <option value="1">Difficulty 1</option>
          <option value="2">Difficulty 2</option>
          <option value="3">Difficulty 3</option>
        </select>
      </div>

      {error && <div className="form-error">{error}</div>}
      {!puzzles && !error && <div className="page-loading">Loading puzzles...</div>}
      {puzzles && puzzles.length === 0 && (
        <div className="card empty-state">No puzzles match these filters.</div>
      )}
      {puzzles && puzzles.length > 0 && (
        <div className="puzzle-grid">
          {puzzles.map((p) => (
            <Link key={p.id} to={`/puzzles/${p.id}`} className="puzzle-card">
              <h3>{p.title}</h3>
              <div className="puzzle-tags">
                <span className="category-pill tactic">{THEME_LABELS[p.theme] || p.theme}</span>
                <span className="category-pill">Difficulty {p.difficulty}</span>
              </div>
              <p className="text-muted">{p.side_to_move === "white" ? "White" : "Black"} to move</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
