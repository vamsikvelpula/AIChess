import math

import chess
import chess.engine

from .stockfish_wrapper import open_engine

ANALYSIS_DEPTH = 14
MATE_SCORE = 10000
DISPLAY_CAP = 1000


def _score_to_cp(score: chess.engine.PovScore) -> int:
    relative = score.relative
    if relative.is_mate():
        mate = relative.mate()
        if mate > 0:
            return MATE_SCORE - mate
        return -MATE_SCORE - mate
    return relative.score()


def _clamp(value: int, lo: int = -DISPLAY_CAP, hi: int = DISPLAY_CAP) -> int:
    return max(lo, min(hi, value))


def classify(cp_loss: int) -> str:
    if cp_loss <= 10:
        return "best"
    if cp_loss <= 25:
        return "good"
    if cp_loss <= 75:
        return "inaccuracy"
    if cp_loss <= 150:
        return "mistake"
    return "blunder"


def analyze_game(moves_uci: list[str], user_color: str) -> dict:
    """Replay a game and classify each of the user's moves by centipawn loss.

    moves_uci: full list of UCI moves played, in order, from the starting position.
    user_color: "white" or "black"
    """
    board = chess.Board()
    user_is_white = user_color == "white"

    analyzed_moves = []
    engine = open_engine()
    try:
        engine.configure({"Skill Level": 20, "UCI_LimitStrength": False})
        limit = chess.engine.Limit(depth=ANALYSIS_DEPTH)

        for ply, move_uci in enumerate(moves_uci, start=1):
            move = chess.Move.from_uci(move_uci)
            is_user_move = (board.turn == chess.WHITE) == user_is_white

            if not is_user_move:
                board.push(move)
                continue

            fen_before = board.fen()
            info_before = engine.analyse(board, limit)
            eval_before_raw = _score_to_cp(info_before["score"])
            best_move = info_before.get("pv", [None])[0]
            best_move_uci = best_move.uci() if best_move else None
            best_move_san = board.san(best_move) if best_move else None

            move_san = board.san(move)
            board.push(move)

            if board.is_game_over():
                eval_after_raw = MATE_SCORE if board.is_checkmate() else 0
            else:
                info_after = engine.analyse(board, limit)
                eval_after_raw = -_score_to_cp(info_after["score"])

            cp_loss = max(0, eval_before_raw - eval_after_raw)
            classification = "best" if best_move_uci == move_uci else classify(cp_loss)

            analyzed_moves.append({
                "ply": ply,
                "player": "user",
                "fen_before": fen_before,
                "move_uci": move_uci,
                "move_san": move_san,
                "best_move_uci": best_move_uci,
                "best_move_san": best_move_san,
                "eval_cp_before": _clamp(eval_before_raw),
                "eval_cp_after": _clamp(eval_after_raw),
                "cp_loss": min(cp_loss, DISPLAY_CAP),
                "classification": classification,
            })
    finally:
        engine.quit()

    return build_summary(analyzed_moves)


def generate_feedback(summary: dict, analyzed_moves: list[dict]) -> list[str]:
    """Turn the move classification summary into short, actionable improvement tips."""
    if not analyzed_moves:
        return ["No moves were played to analyze for this game."]

    tips = []

    if summary["blunders"] > 0:
        tips.append(
            f"You made {summary['blunders']} blunder(s) - moves that gave away significant "
            "material or let a strong tactic through. Before moving, scan for pieces you're "
            "leaving hanging or undefended."
        )
    if summary["mistakes"] > 0:
        tips.append(
            f"You made {summary['mistakes']} mistake(s). Take a moment to check your "
            "opponent's threats before committing to your own plan."
        )
    if summary["inaccuracies"] > 0:
        tips.append(
            f"You had {summary['inaccuracies']} inaccuracy/inaccuracies - slightly imprecise "
            "moves. Try calculating one move further before playing."
        )

    worst = max(analyzed_moves, key=lambda m: m["cp_loss"])
    if worst["cp_loss"] > 75:
        move_number = (worst["ply"] + 1) // 2
        tips.append(
            f"Your biggest slip was move {move_number} ({worst['move_san']}), which lost "
            f"about {worst['cp_loss']} centipawns. The engine preferred "
            f"{worst['best_move_san']} instead."
        )

    if summary["accuracy_pct"] >= 90:
        tips.append("Excellent accuracy this game - keep playing solid, principled moves!")
    elif summary["accuracy_pct"] < 50:
        tips.append(
            "Your overall accuracy was on the low side. Slow down and double-check for "
            "hanging pieces and common tactics (forks, pins, skewers) on every move."
        )

    if not tips:
        tips.append("Solid game with no notable mistakes - keep it up!")

    return tips


def build_summary(analyzed_moves: list[dict]) -> dict:
    counts = {"best": 0, "good": 0, "inaccuracy": 0, "mistake": 0, "blunder": 0}
    cp_losses = []
    for m in analyzed_moves:
        counts[m["classification"]] += 1
        cp_losses.append(m["cp_loss"])

    avg_cp_loss = sum(cp_losses) / len(cp_losses) if cp_losses else 0
    accuracy = 103.1668 * math.exp(-0.04354 * avg_cp_loss) - 3.1669
    accuracy = max(0.0, min(100.0, accuracy))

    summary = {
        "best": counts["best"],
        "good": counts["good"],
        "inaccuracies": counts["inaccuracy"],
        "mistakes": counts["mistake"],
        "blunders": counts["blunder"],
        "accuracy_pct": round(accuracy, 1),
    }

    return {
        "summary": summary,
        "moves": analyzed_moves,
        "feedback": generate_feedback(summary, analyzed_moves),
    }
