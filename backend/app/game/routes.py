import chess
from flask import Blueprint, g, jsonify, request

from ..auth.decorators import login_required
from ..chess_engine.analysis import analyze_game, build_summary
from ..chess_engine.levels import MAX_LEVEL
from ..chess_engine.stockfish_wrapper import get_ai_move
from ..extensions import db
from ..models import Game, GameMove, utcnow
from . import service

bp = Blueprint("game", __name__, url_prefix="/api/game")


@bp.post("/start")
@login_required
def start_game():
    user = g.current_user
    data = request.get_json(silent=True) or {}
    level = int(data.get("level", 1))
    user_color = data.get("user_color", "white")
    if user_color not in ("white", "black"):
        user_color = "white"

    if level < 1 or level > MAX_LEVEL:
        return jsonify({"error": "invalid level"}), 400
    if level > user.progress.unlocked_max_level:
        return jsonify({"error": "level locked"}), 403

    game = Game(
        user_id=user.id,
        level=level,
        user_color=user_color,
        pgn="",
        fen=chess.STARTING_FEN,
        status="in_progress",
    )
    db.session.add(game)
    db.session.flush()

    ai_move_data = None
    if user_color == "black":
        board = chess.Board()
        ai_move = get_ai_move(board, level)
        ai_san = board.san(ai_move)
        board.push(ai_move)
        game.pgn = service.append_move("", ai_move)
        game.fen = board.fen()
        ai_move_data = {"uci": ai_move.uci(), "san": ai_san}

    db.session.commit()

    return jsonify({
        "game_id": game.id,
        "fen": game.fen,
        "user_color": user_color,
        "level": level,
        "ai_move": ai_move_data,
    }), 201


@bp.post("/<int:game_id>/move")
@login_required
def make_move(game_id):
    user = g.current_user
    game = db.session.get(Game, game_id)
    if game is None or game.user_id != user.id:
        return jsonify({"error": "game not found"}), 404
    if game.status != "in_progress":
        return jsonify({"error": "game already finished"}), 400

    data = request.get_json(silent=True) or {}
    move_uci = data.get("move_uci", "")

    try:
        move = chess.Move.from_uci(move_uci)
    except (ValueError, chess.InvalidMoveError):
        return jsonify({"error": "invalid move format"}), 400

    board = service.board_from_moves(game.pgn)
    if move not in board.legal_moves:
        return jsonify({"error": "illegal move"}), 400

    move_san = board.san(move)
    board.push(move)
    game.pgn = service.append_move(game.pgn, move)

    status, result = service.game_status(board)
    response = {
        "fen": board.fen(),
        "move_san": move_san,
        "ai_move": None,
        "fen_after_ai": None,
        "status": status,
        "result": result,
        "is_check": board.is_check(),
    }

    if status == "in_progress":
        ai_move = get_ai_move(board, game.level)
        ai_san = board.san(ai_move)
        board.push(ai_move)
        game.pgn = service.append_move(game.pgn, ai_move)
        status, result = service.game_status(board)
        response.update({
            "ai_move": {"uci": ai_move.uci(), "san": ai_san},
            "fen_after_ai": board.fen(),
            "status": status,
            "result": result,
            "is_check": board.is_check(),
        })

    game.fen = board.fen()
    if status != "in_progress":
        game.status = "completed"
        game.result = result
    db.session.commit()

    return jsonify(response), 200


@bp.post("/<int:game_id>/resign")
@login_required
def resign(game_id):
    user = g.current_user
    game = db.session.get(Game, game_id)
    if game is None or game.user_id != user.id:
        return jsonify({"error": "game not found"}), 404
    if game.status != "in_progress":
        return jsonify({"error": "game already finished"}), 400

    game.status = "completed"
    game.result = "0-1" if game.user_color == "white" else "1-0"
    db.session.commit()
    return jsonify({"status": "completed", "result": game.result}), 200


@bp.post("/<int:game_id>/complete")
@login_required
def complete_game(game_id):
    user = g.current_user
    game = db.session.get(Game, game_id)
    if game is None or game.user_id != user.id:
        return jsonify({"error": "game not found"}), 404

    progress = user.progress

    if game.status == "in_progress":
        board = service.board_from_moves(game.pgn)
        status, result = service.game_status(board)
        if status == "in_progress":
            return jsonify({"error": "game not finished yet"}), 400
        game.status = "completed"
        game.result = result

    leveled_up = bool(game.level_up)

    if game.completed_at is None:
        game.completed_at = utcnow()
        progress.games_played += 1

        user_won = (game.result == "1-0" and game.user_color == "white") or (
            game.result == "0-1" and game.user_color == "black"
        )
        user_lost = (game.result == "1-0" and game.user_color == "black") or (
            game.result == "0-1" and game.user_color == "white"
        )

        if user_won:
            progress.games_won += 1
            if game.level == progress.unlocked_max_level and game.level < MAX_LEVEL:
                progress.unlocked_max_level += 1
                progress.current_level = progress.unlocked_max_level
                leveled_up = True
                game.level_up = True
        elif user_lost:
            progress.games_lost += 1
        else:
            progress.games_drawn += 1

        db.session.commit()

    return jsonify({
        "result": game.result,
        "leveled_up": leveled_up,
        "new_unlocked_max_level": progress.unlocked_max_level,
        "progress": progress.to_dict(),
    }), 200


@bp.get("/history")
@login_required
def history():
    user = g.current_user
    games = (
        db.session.query(Game)
        .filter_by(user_id=user.id, status="completed")
        .order_by(Game.created_at.desc())
        .all()
    )

    items = []
    for g_row in games:
        entry = {
            "game_id": g_row.id,
            "level": g_row.level,
            "user_color": g_row.user_color,
            "result": g_row.result,
            "level_up": bool(g_row.level_up),
            "completed_at": g_row.completed_at.isoformat() if g_row.completed_at else None,
            "created_at": g_row.created_at.isoformat() if g_row.created_at else None,
            "analyzed": len(g_row.moves) > 0,
        }
        if g_row.moves:
            cached = _serialize_cached(g_row.moves)
            entry["summary"] = cached["summary"]
            entry["feedback"] = cached["feedback"]
        items.append(entry)

    return jsonify({"games": items}), 200


@bp.post("/<int:game_id>/analyze")
@login_required
def analyze(game_id):
    user = g.current_user
    game = db.session.get(Game, game_id)
    if game is None or game.user_id != user.id:
        return jsonify({"error": "game not found"}), 404

    existing = (
        db.session.query(GameMove)
        .filter_by(game_id=game.id)
        .order_by(GameMove.ply)
        .all()
    )
    if existing:
        return jsonify(_serialize_cached(existing)), 200

    moves_uci = service.iter_moves(game.pgn)
    if not moves_uci:
        return jsonify(build_summary([])), 200

    result = analyze_game(moves_uci, game.user_color)

    for m in result["moves"]:
        db.session.add(GameMove(
            game_id=game.id,
            ply=m["ply"],
            fen_before=m["fen_before"],
            move_uci=m["move_uci"],
            move_san=m["move_san"],
            player=m["player"],
            eval_cp_before=m["eval_cp_before"],
            eval_cp_after=m["eval_cp_after"],
            best_move_uci=m["best_move_uci"],
            best_move_san=m["best_move_san"],
            cp_loss=m["cp_loss"],
            classification=m["classification"],
        ))
    db.session.commit()

    return jsonify(result), 200


def _serialize_cached(existing: list[GameMove]) -> dict:
    moves = [{
        "ply": gm.ply,
        "player": gm.player,
        "fen_before": gm.fen_before,
        "move_uci": gm.move_uci,
        "move_san": gm.move_san,
        "best_move_uci": gm.best_move_uci,
        "best_move_san": gm.best_move_san,
        "eval_cp_before": gm.eval_cp_before,
        "eval_cp_after": gm.eval_cp_after,
        "cp_loss": gm.cp_loss,
        "classification": gm.classification,
    } for gm in existing]
    return build_summary(moves)
