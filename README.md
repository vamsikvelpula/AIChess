# AIChess

AIChess is a full-stack chess web app where you play Stockfish-powered AI across 20 difficulty levels, solve daily puzzles with hints and solutions, take guided lessons, and track progress with post-game mistake-analysis reports — all in a sleek, animated dark interface.

## Features

- **20 difficulty levels** — a gentle ramp from beginner-friendly (levels 1-9, with random-move injection so the AI isn't punishing) to a noticeable jump at level 10, up to a near-maximum-strength Stockfish at level 20.
- **Level progression** — win a game to unlock the next level; your progress is saved per account.
- **Post-game analysis** — every game is reviewed move-by-move and classified as Best, Good, Inaccuracy, Mistake, or Blunder, with an overall accuracy percentage.
- **Puzzles** — a curated set of tactical puzzles (forks, pins, skewers, mates, and more), plus a daily puzzle that's the same for everyone each day.
- **Lessons** — guided openings, tactics, and endgame walkthroughs you can step through move by move.
- **Accounts & saved progress** — sign up with name/email/password; each user's level, stats, and puzzle history are stored independently.

## The 20 levels

| Level | Feel | Notes |
|---|---|---|
| 1-2 | Total beginner | Plays mostly random moves, occasional decent move |
| 3-5 | Beginner | Shallow search, frequent random moves |
| 6-9 | Casual | Shallow-to-moderate search, no random moves |
| 10 | Noticeable jump | Solid intermediate play begins |
| 11-14 | Intermediate-Advanced | Increasing search depth and strength |
| 15-19 | Hard | Full-strength search, no Elo cap |
| 20 | Maximum | Strongest available Stockfish play |

## Tech stack

- **Frontend**: React + Vite, React Router, chess.js, react-chessboard
- **Backend**: Flask + SQLite (via Flask-SQLAlchemy)
- **AI engine**: Stockfish via python-chess

## Getting started

### Prerequisites

- Node.js and npm
- Python 3
- Stockfish (`brew install stockfish` on macOS)

### Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then edit .env with your local settings
python scripts/init_db.py
python run.py           # runs on http://localhost:5001
```

### Frontend setup

```bash
cd frontend
npm install
npm run dev              # runs on http://localhost:5173
```

Then open [http://localhost:5173](http://localhost:5173), sign up for an account, and start playing.
