import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LevelSelector from "../components/game/LevelSelector";
import DailyPuzzleCard from "../components/puzzles/DailyPuzzleCard";
import ChessQuote from "../components/layout/ChessQuote";

const QUICK_ACTIONS = [
  {
    to: "/play",
    icon: "♞",
    accent: "gold",
    title: "Play vs AI",
    desc: "Jump into your next level and battle the engine.",
  },
  {
    to: "/puzzles",
    icon: "🧩",
    accent: "blue",
    title: "Puzzles",
    desc: "Sharpen your tactics with themed puzzles.",
  },
  {
    to: "/lessons",
    icon: "📚",
    accent: "green",
    title: "Lessons",
    desc: "Learn openings, tactics, and endgames step by step.",
  },
  {
    to: "/history",
    icon: "📈",
    accent: "orange",
    title: "History",
    desc: "Review past games and your improvement over time.",
  },
];

export default function DashboardPage() {
  const { user, progress } = useAuth();

  if (!progress) {
    return <div className="page-loading">Loading your dashboard...</div>;
  }

  return (
    <div>
      <div className="dashboard-header">
        <span className="dashboard-header-icon">&#9818;</span>
        <h2>Master the game, one move at a time.</h2>
      </div>

      <ChessQuote />

      <div className="welcome-banner">
        <h1>Welcome {user.name} to AIChess!</h1>
        <p>Pick a level below and test your skills against the AI.</p>
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-value">{progress.unlocked_max_level}</div>
            <div className="stat-label">Levels Unlocked</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{progress.games_played}</div>
            <div className="stat-label">Games Played</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{progress.games_won}</div>
            <div className="stat-label">Wins</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{progress.games_lost}</div>
            <div className="stat-label">Losses</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{progress.games_drawn}</div>
            <div className="stat-label">Draws</div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.title}
            to={action.to === "/play" ? `/play/${progress.unlocked_max_level}` : action.to}
            className={`action-tile action-tile--${action.accent}`}
          >
            <span className="action-tile-icon">{action.icon}</span>
            <span className="action-tile-title">{action.title}</span>
            <span className="action-tile-desc">{action.desc}</span>
          </Link>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <LevelSelector unlockedMaxLevel={progress.unlocked_max_level} />
        </div>
        <div>
          <DailyPuzzleCard />
        </div>
      </div>
    </div>
  );
}
