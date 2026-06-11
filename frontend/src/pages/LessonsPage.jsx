import { useEffect, useState } from "react";
import { listLessons } from "../api/lessons";
import { ApiError } from "../api/client";
import LessonCard from "../components/lessons/LessonCard";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "opening", label: "Openings" },
  { value: "tactic", label: "Tactics" },
  { value: "endgame", label: "Endgames" },
];

export default function LessonsPage() {
  const [lessons, setLessons] = useState(null);
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setLessons(null);
    listLessons(category || undefined)
      .then((data) => setLessons(data.lessons))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load lessons."));
  }, [category]);

  return (
    <div>
      <h1 className="section-title">Chess Notebooks</h1>
      <p className="text-muted">Learn openings, tactics, and endgame technique step by step.</p>

      <div className="filter-bar">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={`btn ${category === c.value ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setCategory(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && <div className="form-error">{error}</div>}
      {!lessons && !error && <div className="page-loading">Loading lessons...</div>}
      {lessons && (
        <div className="lesson-grid">
          {lessons.map((lesson) => (
            <LessonCard key={lesson.slug} lesson={lesson} />
          ))}
        </div>
      )}
    </div>
  );
}
