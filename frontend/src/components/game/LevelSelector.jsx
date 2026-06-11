import { Link } from "react-router-dom";
import { LEVELS } from "../../data/levels";

export default function LevelSelector({ unlockedMaxLevel }) {
  return (
    <div>
      <h2 className="section-title">Choose Your Opponent</h2>
      <div className="level-grid">
        {LEVELS.map(({ level, label, tier }) => {
          const locked = level > unlockedMaxLevel;
          const isCurrent = level === unlockedMaxLevel;
          const classes = ["level-tile"];
          if (locked) classes.push("locked");
          if (isCurrent) classes.push("unlocked-current");
          if (tier === "hard") classes.push("tier-hard");
          if (tier === "extreme") classes.push("tier-extreme");

          return (
            <Link
              key={level}
              to={`/play/${level}`}
              className={classes.join(" ")}
              title={label}
              aria-disabled={locked}
            >
              <span>{locked ? "\u{1F512}" : level}</span>
              <span className="level-tier">{label}</span>
            </Link>
          );
        })}
      </div>
      <div className="legend">
        <span><span className="legend-swatch" style={{ background: "var(--border)" }} />Levels 1-45: Beginner-friendly</span>
        <span><span className="legend-swatch" style={{ background: "var(--red)" }} />Levels 46-70: Tough</span>
        <span><span className="legend-swatch" style={{ background: "var(--orange)" }} />Levels 71-100: Extreme</span>
      </div>
    </div>
  );
}
