import { Link } from "react-router-dom";

export default function LessonCard({ lesson }) {
  return (
    <Link to={`/lessons/${lesson.slug}`} className="lesson-card">
      <span className={`category-pill lesson-category ${lesson.category}`}>{lesson.category}</span>
      <h3>{lesson.title}</h3>
      <p className="text-muted">{lesson.summary}</p>
      <span className="text-muted">{lesson.step_count} steps</span>
    </Link>
  );
}
