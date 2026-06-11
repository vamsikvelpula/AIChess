import { useState } from "react";
import { Link } from "react-router-dom";
import { LEVELS } from "../data/levels";

const FILTERS = [
  { key: "all", label: "All Bots" },
  { key: "easy", label: "Beginner-friendly" },
  { key: "hard", label: "Tough" },
  { key: "extreme", label: "Extreme" },
];

export default function TournamentPage() {
  const [filter, setFilter] = useState("all");

  const bots = filter === "all" ? LEVELS : LEVELS.filter((b) => b.tier === filter);

  return (
    <div>
      <div className="dashboard-header">
        <span className="dashboard-header-icon">&#9819;</span>
        <h2>Tournament: pick your opponent</h2>
      </div>
      <p className="text-muted" style={{ marginBottom: 16 }}>
        Choose any of the 100 AI bots below for a quick 10-minute game. No level lock - jump
        straight into a match against the bot that interests you.
      </p>

      <div className="tournament-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`btn ${filter === f.key ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bot-grid">
        {bots.map((bot) => (
          <Link key={bot.level} to={`/tournament/${bot.level}`} className={`bot-card bot-card--${bot.tier}`}>
            <div className="bot-card-avatar">{bot.botIcon}</div>
            <div className="bot-card-info">
              <div className="bot-card-name">{bot.label}</div>
              <div className="bot-card-meta">
                <span className="bot-card-rating">{bot.rating}</span>
                <span className="bot-card-level">Lvl {bot.level}</span>
              </div>
            </div>
            <span className="bot-card-play">Play</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
