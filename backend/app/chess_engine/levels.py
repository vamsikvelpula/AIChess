from dataclasses import dataclass


@dataclass(frozen=True)
class LevelConfig:
    level: int
    skill: int
    limit_strength: bool
    elo: int | None
    depth: int
    movetime_ms: int
    random_move_chance: float
    label: str


# Levels 1-9 ramp gently (beginner -> club player), 10+ jumps noticeably,
# 15-20 climb toward near-full Stockfish strength.
LEVELS: dict[int, LevelConfig] = {
    1: LevelConfig(1, skill=0, limit_strength=True, elo=1320, depth=1, movetime_ms=50, random_move_chance=0.35, label="Absolute Beginner"),
    2: LevelConfig(2, skill=0, limit_strength=True, elo=1320, depth=1, movetime_ms=50, random_move_chance=0.28, label="Beginner"),
    3: LevelConfig(3, skill=1, limit_strength=True, elo=1320, depth=2, movetime_ms=80, random_move_chance=0.22, label="Novice"),
    4: LevelConfig(4, skill=2, limit_strength=True, elo=1320, depth=2, movetime_ms=100, random_move_chance=0.16, label="Casual Player"),
    5: LevelConfig(5, skill=3, limit_strength=True, elo=1320, depth=3, movetime_ms=120, random_move_chance=0.10, label="Improving Player"),
    6: LevelConfig(6, skill=4, limit_strength=True, elo=1330, depth=4, movetime_ms=150, random_move_chance=0.06, label="Club Beginner"),
    7: LevelConfig(7, skill=5, limit_strength=True, elo=1400, depth=5, movetime_ms=180, random_move_chance=0.03, label="Club Player"),
    8: LevelConfig(8, skill=6, limit_strength=True, elo=1500, depth=6, movetime_ms=220, random_move_chance=0.0, label="Solid Club Player"),
    9: LevelConfig(9, skill=7, limit_strength=True, elo=1600, depth=7, movetime_ms=260, random_move_chance=0.0, label="Strong Club Player"),
    10: LevelConfig(10, skill=8, limit_strength=True, elo=1750, depth=8, movetime_ms=350, random_move_chance=0.0, label="Tournament Player"),
    11: LevelConfig(11, skill=9, limit_strength=True, elo=1900, depth=9, movetime_ms=450, random_move_chance=0.0, label="Experienced Player"),
    12: LevelConfig(12, skill=10, limit_strength=True, elo=2000, depth=10, movetime_ms=600, random_move_chance=0.0, label="Expert"),
    13: LevelConfig(13, skill=12, limit_strength=True, elo=2150, depth=11, movetime_ms=800, random_move_chance=0.0, label="Candidate Master"),
    14: LevelConfig(14, skill=14, limit_strength=True, elo=2300, depth=12, movetime_ms=1000, random_move_chance=0.0, label="National Master"),
    15: LevelConfig(15, skill=16, limit_strength=False, elo=None, depth=14, movetime_ms=1300, random_move_chance=0.0, label="FIDE Master"),
    16: LevelConfig(16, skill=17, limit_strength=False, elo=None, depth=15, movetime_ms=1600, random_move_chance=0.0, label="International Master"),
    17: LevelConfig(17, skill=18, limit_strength=False, elo=None, depth=16, movetime_ms=2000, random_move_chance=0.0, label="Grandmaster"),
    18: LevelConfig(18, skill=19, limit_strength=False, elo=None, depth=18, movetime_ms=2500, random_move_chance=0.0, label="Super GM"),
    19: LevelConfig(19, skill=20, limit_strength=False, elo=None, depth=20, movetime_ms=3000, random_move_chance=0.0, label="World Class"),
    20: LevelConfig(20, skill=20, limit_strength=False, elo=None, depth=22, movetime_ms=4000, random_move_chance=0.0, label="Engine (Maximum)"),
}

MAX_LEVEL = 20


def get_level_config(level: int) -> LevelConfig:
    level = max(1, min(MAX_LEVEL, level))
    return LEVELS[level]
