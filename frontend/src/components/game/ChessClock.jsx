export function formatTime(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function ChessClock({ label, seconds, active }) {
  const low = seconds <= 60;
  const classes = ["chess-clock"];
  if (active) classes.push("is-active");
  if (low) classes.push("is-low");

  return (
    <div className={classes.join(" ")}>
      <span className="chess-clock-label">{label}</span>
      <span className="chess-clock-time">{formatTime(seconds)}</span>
    </div>
  );
}
