import chess


def board_from_moves(moves_csv: str) -> chess.Board:
    board = chess.Board()
    for uci in iter_moves(moves_csv):
        board.push(chess.Move.from_uci(uci))
    return board


def iter_moves(moves_csv: str) -> list[str]:
    return moves_csv.split(",") if moves_csv else []


def append_move(moves_csv: str, move: chess.Move) -> str:
    moves = iter_moves(moves_csv)
    moves.append(move.uci())
    return ",".join(moves)


def game_status(board: chess.Board) -> tuple[str, str | None]:
    """Returns (status, result). status is one of in_progress/checkmate/stalemate/draw,
    result is a PGN-style result string ("1-0"/"0-1"/"1/2-1/2") or None if in progress."""
    if board.is_checkmate():
        result = "0-1" if board.turn == chess.WHITE else "1-0"
        return "checkmate", result
    if board.is_stalemate():
        return "stalemate", "1/2-1/2"
    if (
        board.is_insufficient_material()
        or board.is_seventyfive_moves()
        or board.is_fivefold_repetition()
    ):
        return "draw", "1/2-1/2"
    return "in_progress", None
