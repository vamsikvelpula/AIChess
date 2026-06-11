"""One-off generator for backend/data/puzzles.json.

Builds each puzzle position with python-chess (either by direct FEN construction or
by replaying a verified opening move sequence), checks the solution moves are legal,
and asserts checkmate where the theme claims a mate. Run with:

    python scripts/generate_puzzles.py
"""

import json
import os

import chess

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "puzzles.json")

MATE_THEMES = {"mate_in_1", "back_rank_mate", "smothered_mate", "mate_in_2", "mate_in_3"}


def from_fen(fen, solution_uci, **fields):
    return {"fen": fen, "solution_uci": solution_uci, **fields}


def from_moves(san_moves, solution_uci, **fields):
    board = chess.Board()
    for san in san_moves:
        board.push_san(san)
    return {"fen": board.fen(), "solution_uci": solution_uci, **fields}


RAW_PUZZLES = [
    from_fen(
        "6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1", ["a1a8"],
        id="p01", title="Back Rank Mate", theme="back_rank_mate", difficulty=1,
        explanation="Black's king is trapped behind its own pawns. Ra8# delivers mate along the open back rank.",
    ),
    from_fen(
        "6k1/5ppp/8/8/8/8/6PP/4Q1K1 w - - 0 1", ["e1e8"],
        id="p02", title="Queen to the Back Rank", theme="mate_in_1", difficulty=1,
        explanation="The e-file is wide open. Qe8# checks along the back rank with no escape squares for the king.",
    ),
    from_fen(
        "6rk/6pp/3N4/8/8/8/8/K7 w - - 0 1", ["d6f7"],
        id="p03", title="Smothered Mate", theme="smothered_mate", difficulty=3,
        explanation="Black's king is completely smothered by its own rook and pawns. Nf7# is checkmate "
        "because the king has nowhere to go and nothing can capture the knight.",
    ),
    from_fen(
        "7k/R7/8/8/8/8/8/1R2K3 w - - 0 1", ["b1b8"],
        id="p04", title="Ladder Mate", theme="mate_in_1", difficulty=1,
        explanation="The rook on a7 cuts off the 7th rank. Rb8# delivers mate on the back rank with the king "
        "unable to step onto rank 7.",
    ),
    from_moves(
        ["e4", "e5", "Bc4", "Bc5", "Qh5", "Nf6"], ["h5f7"],
        id="p05", title="Punish the Greedy Knight", theme="mate_in_1", difficulty=2,
        explanation="Black ignored the threat to f7. Qxf7# is checkmate — the queen is defended by the "
        "bishop on c4 and the king has no escape squares.",
    ),
    from_fen(
        "3q4/6k1/8/6N1/8/8/8/K7 w - - 0 1", ["g5e6"],
        id="p06", title="Royal Fork", theme="fork", difficulty=2,
        explanation="Ne6+ forks the king on g7 and the queen on d8. After the king moves, White wins the queen.",
    ),
    from_fen(
        "2r1k3/8/8/5N2/8/8/8/K7 w - - 0 1", ["f5d6"],
        id="p07", title="Knight Fork: King and Rook", theme="fork", difficulty=2,
        explanation="Nd6+ forks the king on e8 and the rook on c8. The king must move, then White captures "
        "the rook.",
    ),
    from_fen(
        "6k1/5ppp/2n1b3/8/3P4/8/8/6K1 w - - 0 1", ["d4d5"],
        id="p08", title="Pawn Fork", theme="fork", difficulty=2,
        explanation="d5! attacks both the knight on c6 and the bishop on e6 with a single pawn move. One of "
        "them will fall.",
    ),
    from_fen(
        "r5k1/5ppp/8/8/8/8/1Q6/6K1 w - - 0 1", ["b2b8"],
        id="p09", title="Queen Fork", theme="fork", difficulty=3,
        explanation="Qb8+ checks the king and simultaneously attacks the rook on a8 — a winning fork.",
    ),
    from_fen(
        "4k3/8/2n5/8/B7/8/8/4K3 w - - 0 1", ["a4b5"],
        id="p10", title="Pin the Knight", theme="pin", difficulty=2,
        explanation="Bb5 pins the knight on c6 to the king on e8. The knight cannot move without exposing "
        "the king to check.",
    ),
    from_fen(
        "3q2k1/5ppp/8/3n4/8/8/8/R5K1 w - - 0 1", ["a1d1"],
        id="p11", title="Pin the Knight to the Queen", theme="pin", difficulty=2,
        explanation="Rd1 pins the knight on d5 to the queen on d8. If the knight moves, the rook wins the "
        "queen.",
    ),
    from_fen(
        "4k3/pp6/2b5/8/8/1Q6/8/4K3 w - - 0 1", ["b3a4"],
        id="p12", title="Diagonal Pin", theme="pin", difficulty=3,
        explanation="Qa4 pins the bishop on c6 to the king on e8 along the long diagonal.",
    ),
    from_fen(
        "2k4r/8/8/8/8/8/8/R3K3 w - - 0 1", ["a1a8"],
        id="p13", title="Back Rank Skewer", theme="skewer", difficulty=2,
        explanation="Ra8+ skewers the king on c8. After the king moves off the back rank, the rook captures "
        "the rook on h8.",
    ),
    from_fen(
        "8/8/8/3k3B/8/8/q7/4K3 w - - 0 1", ["h5f7"],
        id="p14", title="Bishop Skewer", theme="skewer", difficulty=3,
        explanation="Bf7+ skewers the king on d5 and the queen on a2 along the long diagonal. Once the king "
        "moves, the bishop wins the queen.",
    ),
    from_fen(
        "k7/8/3q4/8/8/N7/8/R3K3 w - - 0 1", ["a3b5"],
        id="p15", title="Discovered Check", theme="discovered_attack", difficulty=3,
        explanation="Nb5+ uncovers an attack from the rook on a1 to the king on a8 (discovered check) while "
        "the knight itself attacks the queen on d6.",
    ),
    from_fen(
        "3q2k1/5ppp/8/8/3B4/8/8/3R2K1 w - - 0 1", ["d4e3"],
        id="p16", title="Unveil the Rook", theme="discovered_attack", difficulty=3,
        explanation="Be3 quietly steps off the d-file, revealing the rook on d1's attack on the queen on d8.",
    ),
    from_fen(
        "r3k3/8/8/7n/8/8/3Q4/4K3 w - - 0 1", ["d2a5"],
        id="p17", title="Queen Double Attack", theme="double_attack", difficulty=3,
        explanation="Qa5 attacks the rook on a8 along the file and the knight on h5 along the rank at the "
        "same time.",
    ),
    from_fen(
        "4k3/3b4/8/8/1n5R/8/8/4K3 w - - 0 1", ["h4d4"],
        id="p18", title="Rook Double Attack", theme="double_attack", difficulty=3,
        explanation="Rd4 attacks the bishop on d7 along the file and the knight on b4 along the rank at the "
        "same time.",
    ),
    from_fen(
        "7k/8/5N2/8/8/8/8/K5Q1 w - - 0 1", ["g1g8"],
        id="p19", title="Queen and Knight Mate", theme="mate_in_1", difficulty=2,
        explanation="Qg8# is checkmate: the knight on f6 defends the queen and covers g8, while the queen "
        "itself covers g7 and h7.",
    ),
    from_fen(
        "6k1/5p1p/8/8/8/8/1B6/R5K1 w - - 0 1", ["a1a8"],
        id="p20", title="Back Rank Mate with Bishop Support", theme="back_rank_mate", difficulty=2,
        explanation="Ra8# is mate — the bishop on b2 covers the only escape square on g7.",
    ),
]


def build():
    puzzles = []
    for raw in RAW_PUZZLES:
        board = chess.Board(raw["fen"])
        assert board.is_valid(), f"{raw['id']}: invalid FEN/position"

        side_to_move = "white" if board.turn == chess.WHITE else "black"

        solution_san = []
        for uci in raw["solution_uci"]:
            move = chess.Move.from_uci(uci)
            assert move in board.legal_moves, f"{raw['id']}: move {uci} illegal in {board.fen()}"
            solution_san.append(board.san(move))
            board.push(move)

        if raw["theme"] in MATE_THEMES:
            assert board.is_checkmate(), f"{raw['id']}: expected checkmate after solution"

        puzzles.append({
            "id": raw["id"],
            "title": raw["title"],
            "theme": raw["theme"],
            "difficulty": raw["difficulty"],
            "fen": raw["fen"],
            "side_to_move": side_to_move,
            "solution_uci": raw["solution_uci"],
            "solution_san": solution_san,
            "explanation": raw["explanation"],
        })

    with open(OUTPUT_PATH, "w") as f:
        json.dump({"puzzles": puzzles}, f, indent=2)
        f.write("\n")

    print(f"Wrote {len(puzzles)} puzzles to {os.path.abspath(OUTPUT_PATH)}")


if __name__ == "__main__":
    build()
