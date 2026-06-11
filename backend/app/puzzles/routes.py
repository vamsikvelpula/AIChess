from datetime import date

from flask import Blueprint, g, jsonify, request

from ..auth.decorators import login_required
from ..extensions import db
from ..models import DailyPuzzleCompletion, PuzzleAttempt
from .loader import get_daily_puzzle_id, get_puzzle, list_puzzles, public_fields, solution_fields

bp = Blueprint("puzzles", __name__, url_prefix="/api/puzzles")


@bp.get("")
@login_required
def list_all():
    theme = request.args.get("theme")
    difficulty = request.args.get("difficulty", type=int)
    return jsonify({"puzzles": list_puzzles(theme, difficulty)}), 200


@bp.get("/daily")
@login_required
def daily():
    today = date.today()
    puzzle_id = get_daily_puzzle_id(today)
    puzzle = get_puzzle(puzzle_id)

    completion = (
        db.session.query(DailyPuzzleCompletion)
        .filter_by(user_id=g.current_user.id, puzzle_date=today)
        .first()
    )
    completed = bool(completion and completion.solved)

    return jsonify({
        "date": today.isoformat(),
        "puzzle": public_fields(puzzle),
        "completed": completed,
    }), 200


@bp.post("/daily/complete")
@login_required
def daily_complete():
    today = date.today()
    puzzle_id = get_daily_puzzle_id(today)
    data = request.get_json(silent=True) or {}
    solved = bool(data.get("solved", False))

    completion = (
        db.session.query(DailyPuzzleCompletion)
        .filter_by(user_id=g.current_user.id, puzzle_date=today)
        .first()
    )
    if completion is None:
        completion = DailyPuzzleCompletion(
            user_id=g.current_user.id, puzzle_date=today, puzzle_id=puzzle_id, solved=solved
        )
        db.session.add(completion)
    else:
        completion.solved = completion.solved or solved

    db.session.commit()
    return jsonify({"recorded": True}), 200


@bp.get("/<puzzle_id>")
@login_required
def get_one(puzzle_id):
    puzzle = get_puzzle(puzzle_id)
    if puzzle is None:
        return jsonify({"error": "puzzle not found"}), 404
    return jsonify(public_fields(puzzle)), 200


@bp.get("/<puzzle_id>/solution")
@login_required
def solution(puzzle_id):
    puzzle = get_puzzle(puzzle_id)
    if puzzle is None:
        return jsonify({"error": "puzzle not found"}), 404
    return jsonify(solution_fields(puzzle)), 200


@bp.post("/<puzzle_id>/check")
@login_required
def check(puzzle_id):
    puzzle = get_puzzle(puzzle_id)
    if puzzle is None:
        return jsonify({"error": "puzzle not found"}), 404

    data = request.get_json(silent=True) or {}
    moves = data.get("moves_uci", [])
    solution = puzzle["solution_uci"]

    for i, move_uci in enumerate(moves):
        if i >= len(solution) or move_uci != solution[i]:
            expected = solution[i] if i < len(solution) else None
            return jsonify({"correct": False, "complete": False, "expected_uci": expected}), 200

    complete = len(moves) >= len(solution)
    next_expected = None if complete else solution[len(moves)]
    return jsonify({"correct": True, "complete": complete, "expected_uci": next_expected}), 200


@bp.post("/<puzzle_id>/attempt")
@login_required
def attempt(puzzle_id):
    puzzle = get_puzzle(puzzle_id)
    if puzzle is None:
        return jsonify({"error": "puzzle not found"}), 404

    data = request.get_json(silent=True) or {}
    db.session.add(PuzzleAttempt(
        user_id=g.current_user.id,
        puzzle_id=puzzle_id,
        solved=bool(data.get("solved", False)),
        attempts_count=int(data.get("attempts_count", 1)),
    ))
    db.session.commit()
    return jsonify({"recorded": True}), 200
