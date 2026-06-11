from datetime import date, datetime, timezone

from .extensions import db


def utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow)

    progress = db.relationship(
        "Progress", backref="user", uselist=False, cascade="all, delete-orphan"
    )
    sessions = db.relationship("Session", backref="user", cascade="all, delete-orphan")
    games = db.relationship("Game", backref="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email}


class Session(db.Model):
    __tablename__ = "sessions"

    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(64), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=utcnow)


class Progress(db.Model):
    __tablename__ = "progress"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    current_level = db.Column(db.Integer, default=1, nullable=False)
    unlocked_max_level = db.Column(db.Integer, default=1, nullable=False)
    games_played = db.Column(db.Integer, default=0, nullable=False)
    games_won = db.Column(db.Integer, default=0, nullable=False)
    games_lost = db.Column(db.Integer, default=0, nullable=False)
    games_drawn = db.Column(db.Integer, default=0, nullable=False)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    def to_dict(self):
        return {
            "current_level": self.current_level,
            "unlocked_max_level": self.unlocked_max_level,
            "games_played": self.games_played,
            "games_won": self.games_won,
            "games_lost": self.games_lost,
            "games_drawn": self.games_drawn,
        }


class Game(db.Model):
    __tablename__ = "games"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    level = db.Column(db.Integer, nullable=False)
    pgn = db.Column(db.Text, default="")
    fen = db.Column(db.Text, nullable=False)
    result = db.Column(db.String(10), nullable=True)
    user_color = db.Column(db.String(5), nullable=False, default="white")
    status = db.Column(db.String(20), nullable=False, default="in_progress")
    created_at = db.Column(db.DateTime, default=utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    level_up = db.Column(db.Boolean, default=False)

    moves = db.relationship(
        "GameMove", backref="game", cascade="all, delete-orphan", order_by="GameMove.ply"
    )


class GameMove(db.Model):
    __tablename__ = "game_moves"

    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey("games.id"), nullable=False)
    ply = db.Column(db.Integer, nullable=False)
    fen_before = db.Column(db.Text, nullable=False)
    move_uci = db.Column(db.String(10), nullable=False)
    move_san = db.Column(db.String(10), nullable=False)
    player = db.Column(db.String(10), nullable=False)  # "user" or "ai"
    eval_cp_before = db.Column(db.Integer, nullable=True)
    eval_cp_after = db.Column(db.Integer, nullable=True)
    best_move_uci = db.Column(db.String(10), nullable=True)
    best_move_san = db.Column(db.String(10), nullable=True)
    cp_loss = db.Column(db.Integer, nullable=True)
    classification = db.Column(db.String(15), nullable=True)


class PuzzleAttempt(db.Model):
    __tablename__ = "puzzle_attempts"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    puzzle_id = db.Column(db.String(50), nullable=False)
    solved = db.Column(db.Boolean, default=False)
    attempts_count = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=utcnow)


class DailyPuzzleCompletion(db.Model):
    __tablename__ = "daily_puzzle_completions"
    __table_args__ = (
        db.UniqueConstraint("user_id", "puzzle_date", name="uq_user_puzzle_date"),
    )

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    puzzle_date = db.Column(db.Date, default=date.today, nullable=False)
    puzzle_id = db.Column(db.String(50), nullable=False)
    solved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=utcnow)
