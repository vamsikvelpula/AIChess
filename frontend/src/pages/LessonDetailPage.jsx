import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLesson } from "../api/lessons";
import { ApiError } from "../api/client";
import LessonStepper from "../components/lessons/LessonStepper";

export default function LessonDetailPage() {
  const { slug } = useParams();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setLesson(null);
    setError("");
    getLesson(slug)
      .then(setLesson)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load this lesson."));
  }, [slug]);

  if (error) {
    return <div className="form-error">{error}</div>;
  }
  if (!lesson) {
    return <div className="page-loading">Loading lesson...</div>;
  }

  return (
    <div>
      <span className={`category-pill ${lesson.category}`}>{lesson.category}</span>
      <h1 className="section-title">{lesson.title}</h1>
      <p className="text-muted">{lesson.summary}</p>
      <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <LessonStepper steps={lesson.steps} />
      </div>
      <p style={{ marginTop: 20 }}>
        <Link to="/lessons" className="btn btn-ghost">Back to Notebooks</Link>
      </p>
    </div>
  );
}
