import random

import chess
import chess.engine
from flask import current_app

from .levels import get_level_config


def open_engine() -> chess.engine.SimpleEngine:
    path = current_app.config["STOCKFISH_PATH"]
    return chess.engine.SimpleEngine.popen_uci(path)


def get_ai_move(board: chess.Board, level: int) -> chess.Move:
    """Return the AI's chosen move for the given board, tuned to the given level."""
    config = get_level_config(level)

    if config.random_move_chance > 0 and random.random() < config.random_move_chance:
        legal_moves = list(board.legal_moves)
        if legal_moves:
            return random.choice(legal_moves)

    engine = open_engine()
    try:
        options = {"Skill Level": config.skill, "UCI_LimitStrength": config.limit_strength}
        if config.limit_strength and config.elo is not None:
            options["UCI_Elo"] = config.elo
        engine.configure(options)

        limit = chess.engine.Limit(depth=config.depth, time=config.movetime_ms / 1000)
        result = engine.play(board, limit)
        return result.move
    finally:
        engine.quit()
