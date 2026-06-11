import json
import os

_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "puzzles.json")

_PUZZLES_BY_ID: dict[str, dict] = {}
_PUZZLE_ORDER: list[str] = []


def _load():
    global _PUZZLES_BY_ID, _PUZZLE_ORDER
    with open(_DATA_PATH) as f:
        data = json.load(f)
    _PUZZLES_BY_ID = {p["id"]: p for p in data["puzzles"]}
    _PUZZLE_ORDER = [p["id"] for p in data["puzzles"]]


_load()


def public_fields(puzzle: dict) -> dict:
    return {
        "id": puzzle["id"],
        "title": puzzle["title"],
        "theme": puzzle["theme"],
        "difficulty": puzzle["difficulty"],
        "fen": puzzle["fen"],
        "side_to_move": puzzle["side_to_move"],
    }


def solution_fields(puzzle: dict) -> dict:
    return {
        "solution_san": puzzle["solution_san"],
        "explanation": puzzle.get("explanation", ""),
    }


def list_puzzles(theme: str | None = None, difficulty: int | None = None) -> list[dict]:
    puzzles = [_PUZZLES_BY_ID[pid] for pid in _PUZZLE_ORDER]
    if theme:
        puzzles = [p for p in puzzles if p["theme"] == theme]
    if difficulty is not None:
        puzzles = [p for p in puzzles if p["difficulty"] == difficulty]
    return [public_fields(p) for p in puzzles]


def get_puzzle(puzzle_id: str) -> dict | None:
    return _PUZZLES_BY_ID.get(puzzle_id)


def get_daily_puzzle_id(for_date) -> str:
    index = int(for_date.strftime("%Y%m%d")) % len(_PUZZLE_ORDER)
    return _PUZZLE_ORDER[index]
