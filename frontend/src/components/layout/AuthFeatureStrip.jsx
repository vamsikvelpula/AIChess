const FEATURES = [
  { icon: "♞", label: "20 AI Levels", accent: "gold" },
  { icon: "🧩", label: "Daily Puzzles", accent: "blue" },
  { icon: "📚", label: "Guided Lessons", accent: "green" },
  { icon: "📈", label: "Track Progress", accent: "orange" },
];

export default function AuthFeatureStrip() {
  return (
    <div className="auth-features">
      {FEATURES.map((f) => (
        <div key={f.label} className={`auth-feature auth-feature--${f.accent}`}>
          <span className="auth-feature-icon">{f.icon}</span>
          <span>{f.label}</span>
        </div>
      ))}
    </div>
  );
}
