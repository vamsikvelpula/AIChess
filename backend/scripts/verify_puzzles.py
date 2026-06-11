"""Validates backend/data/puzzles.json: every solution must be a sequence of legal
moves from the given FEN, and mate-themed puzzles must end in checkmate.

    python scripts/verify_puzzles.py
"""

import json
import os
import sys

import chess

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "puzzles.json")
MATE_THEMES = {"mate_in_1", "back_rank_mate", "smothered_mate", "mate_in_2", "mate_in_3"}


def verify_puzzle(puzzle):
    board = chess.Board(puzzle["fen"])
    if not board.is_valid():
        return False, "invalid FEN/position"

    expected_color = chess.WHITE if puzzle["side_to_move"] == "white" else chess.BLACK
    if board.turn != expected_color:
        return False, "side_to_move does not match FEN"

    for i, uci in enumerate(puzzle["solution_uci"]):
        try:
            move = chess.Move.from_uci(uci)
        except chess.InvalidMoveError:
            return False, f"solution move {i} ({uci}) is not valid UCI"
        if move not in board.legal_moves:
            return False, f"solution move {i} ({uci}) is illegal in position {board.fen()}"
        board.push(move)

    if puzzle["theme"] in MATE_THEMES and not board.is_checkmate():
        return False, "expected checkmate at end of solution but position is not checkmate"

    return True, "ok"


def main():
    with open(DATA_PATH) as f:
        data = json.load(f)

    failures = []
    for puzzle in data["puzzles"]:
        ok, msg = verify_puzzle(puzzle)
        if not ok:
            failures.append((puzzle["id"], msg))

    if failures:
        for pid, msg in failures:
            print(f"FAIL {pid}: {msg}")
        sys.exit(1)

    print(f"All {len(data['puzzles'])} puzzles verified OK")


if __name__ == "__main__":
    main()
