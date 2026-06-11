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


MAX_LEVEL = 100

# Twenty named "ranks", each spanning five levels (I-V), giving a smooth
# 100-step progression from absolute beginner up to near-full Stockfish
# strength.
RANK_NAMES = [
    "Absolute Beginner", "Beginner", "Novice", "Casual Player", "Improving Player",
    "Club Beginner", "Club Player", "Solid Club Player", "Strong Club Player",
    "Tournament Player", "Experienced Player", "Expert", "Candidate Master",
    "National Master", "FIDE Master", "International Master", "Grandmaster",
    "Super GM", "World Class", "Engine Master",
]
ROMAN = ["I", "II", "III", "IV", "V"]

# Levels 1-70 ramp Stockfish's limited-strength mode (skill 0-20, elo
# 1320-2850) with a shrinking dose of random moves for early beginners.
# Levels 71-100 turn off the strength limiter and instead climb search
# depth/movetime toward near-maximum Stockfish strength.
_RAMP_END = 70


def _generate_levels() -> dict[int, "LevelConfig"]:
    levels: dict[int, LevelConfig] = {}
    for level in range(1, MAX_LEVEL + 1):
        if level <= _RAMP_END:
            limit_strength = True
            skill = min(20, round((level - 1) * 20 / (_RAMP_END - 1)))
            elo = 1320 + round((level - 1) * (2850 - 1320) / (_RAMP_END - 1))
            depth = 1 + round((level - 1) * (12 - 1) / (_RAMP_END - 1))
            movetime_ms = 50 + round((level - 1) * (1000 - 50) / (_RAMP_END - 1))
        else:
            limit_strength = False
            skill = 20
            elo = None
            span = MAX_LEVEL - (_RAMP_END + 1)
            depth = 13 + round((level - (_RAMP_END + 1)) * (24 - 13) / span)
            movetime_ms = 1200 + round((level - (_RAMP_END + 1)) * (5000 - 1200) / span)

        if level <= 15:
            random_move_chance = round(max(0.0, 0.35 - (level - 1) * 0.35 / 14), 3)
        else:
            random_move_chance = 0.0

        rank_index = (level - 1) // 5
        roman = ROMAN[(level - 1) % 5]
        label = f"{RANK_NAMES[rank_index]} {roman}"

        levels[level] = LevelConfig(
            level=level,
            skill=skill,
            limit_strength=limit_strength,
            elo=elo,
            depth=depth,
            movetime_ms=movetime_ms,
            random_move_chance=random_move_chance,
            label=label,
        )
    return levels


LEVELS: dict[int, LevelConfig] = _generate_levels()


def get_level_config(level: int) -> LevelConfig:
    level = max(1, min(MAX_LEVEL, level))
    return LEVELS[level]
