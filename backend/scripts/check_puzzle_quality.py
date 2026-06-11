"""Deeper sanity checks for backend/data/puzzles.json beyond legality/checkmate:

- mate puzzles: the first solution move must be the *only* move that delivers
  immediate checkmate (otherwise the puzzle has multiple valid solutions and the
  single-line solution_uci will reject correct alternatives).
- non-mate tactic puzzles (fork/pin/skewer/double_attack): the solution move must
  not be dominated by some other move that delivers immediate checkmate, and the
  claimed tactical motif (two attacked pieces / pin / skewer) must actually hold
  after the move.

    python scripts/check_puzzle_quality.py
"""

import json
import os

import chess

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "puzzles.json")
MATE_THEMES = {"mate_in_1", "back_rank_mate", "smothered_mate", "mate_in_2", "mate_in_3"}
VALUE = {chess.PAWN: 1, chess.KNIGHT: 3, chess.BISHOP: 3, chess.ROOK: 5, chess.QUEEN: 9, chess.KING: 0}


def attacked_valuable_pieces(board, attacker_square, mover_color):
    """Squares of opposite-color pieces (value >= 3) attacked from attacker_square."""
    targets = set()
    for sq in chess.SQUARES:
        piece = board.piece_at(sq)
        if piece and piece.color != mover_color and VALUE[piece.piece_type] >= 3:
            if attacker_square in board.attackers(mover_color, sq):
                targets.add(sq)
    return targets


def all_attacked_valuable_pieces(board, mover_color):
    """All opposing pieces (value >= 3) currently attacked by mover_color, regardless of attacker."""
    return {
        sq for sq in chess.SQUARES
        if (piece := board.piece_at(sq)) and piece.color != mover_color
        and VALUE[piece.piece_type] >= 3
        and board.is_attacked_by(mover_color, sq)
    }


def has_relative_pin(board, mover_color):
    """A sliding piece attacks an opposing piece that shields a more valuable
    opposing piece directly behind it on the same ray (a 'relative pin')."""
    for sq in chess.SQUARES:
        attacker = board.piece_at(sq)
        if not attacker or attacker.color != mover_color or attacker.piece_type not in (
            chess.ROOK, chess.BISHOP, chess.QUEEN
        ):
            continue
        for target_sq in board.attacks(sq):
            target = board.piece_at(target_sq)
            if not target or target.color == mover_color:
                continue
            # Walk further along the same ray looking for a more valuable piece.
            file_diff = chess.square_file(target_sq) - chess.square_file(sq)
            rank_diff = chess.square_rank(target_sq) - chess.square_rank(sq)
            step_file = (file_diff > 0) - (file_diff < 0)
            step_rank = (rank_diff > 0) - (rank_diff < 0)
            cur_file, cur_rank = chess.square_file(target_sq), chess.square_rank(target_sq)
            while True:
                cur_file += step_file
                cur_rank += step_rank
                if not (0 <= cur_file <= 7 and 0 <= cur_rank <= 7):
                    break
                behind = board.piece_at(chess.square(cur_file, cur_rank))
                if behind is None:
                    continue
                if behind.color != mover_color and VALUE[behind.piece_type] > VALUE[target.piece_type]:
                    return True
                break
    return False


def check_puzzle(puzzle):
    issues = []
    board = chess.Board(puzzle["fen"])
    mover_color = board.turn
    first_move = chess.Move.from_uci(puzzle["solution_uci"][0])
    san_first = board.san(first_move)

    # Does the puzzle's own first move deliver immediate mate?
    board.push(first_move)
    own_is_mate = board.is_checkmate()
    board.pop()

    if puzzle["theme"] in MATE_THEMES:
        if not own_is_mate:
            issues.append("mate-themed puzzle's first move is not checkmate")
        # Check uniqueness: any other legal move that also mates?
        alt_mates = []
        for mv in board.legal_moves:
            if mv == first_move:
                continue
            mv_san = board.san(mv)
            board.push(mv)
            if board.is_checkmate():
                alt_mates.append(mv_san)
            board.pop()
        if alt_mates:
            issues.append(f"multiple mate-in-1 solutions exist alongside {san_first}: {', '.join(alt_mates)}")
    else:
        # Non-mate tactics: flag if some other move mates immediately (would make
        # the labeled tactic not the "best" / expected move).
        for mv in board.legal_moves:
            if mv == first_move:
                continue
            mv_san = board.san(mv)
            board.push(mv)
            is_mate = board.is_checkmate()
            board.pop()
            if is_mate:
                issues.append(f"a different move ({mv_san}) delivers immediate mate, "
                               f"making the labeled '{puzzle['theme']}' move ({san_first}) suboptimal")
                break

        # Track valuable opposing pieces under attack before the move, so
        # discovered attacks can be detected (a target that is newly attacked).
        before_targets = all_attacked_valuable_pieces(board, mover_color)

        # Verify the tactical motif holds after the solution move.
        board.push(first_move)
        to_sq = first_move.to_square
        targets = attacked_valuable_pieces(board, to_sq, mover_color)
        gives_check = board.is_check()

        theme = puzzle["theme"]
        if theme == "fork":
            # Expect at least 2 valuable targets attacked from the landing square
            # (king counts as a target if check is given).
            count = len(targets) + (1 if gives_check else 0)
            if count < 2:
                issues.append(f"fork claim not verified: only {count} valuable target(s) attacked from {chess.square_name(to_sq)}")
        elif theme == "pin":
            absolute = [sq for sq in chess.SQUARES
                        if board.piece_at(sq) and board.piece_at(sq).color != mover_color
                        and board.is_pinned(not mover_color, sq)]
            if not absolute and not has_relative_pin(board, mover_color):
                issues.append("pin claim not verified: no opposing piece is pinned (absolute or relative) after the move")
            elif absolute:
                # Absolute pin: confirm it actually wins something — the pinned
                # piece should now be attacked and undefended.
                won = any(
                    sq in targets and not board.is_attacked_by(not mover_color, sq)
                    for sq in absolute
                )
                if not won:
                    issues.append("pin claim has no concrete payoff: pinned piece is not also attacked-and-undefended")
        elif theme == "skewer":
            if not gives_check:
                issues.append("skewer claim not verified: solution move does not give check")
        elif theme == "double_attack":
            if len(targets) < 2:
                issues.append(f"double_attack claim not verified: only {len(targets)} valuable target(s) attacked from {chess.square_name(to_sq)}")
        elif theme == "discovered_attack":
            after_targets = all_attacked_valuable_pieces(board, mover_color)
            newly_attacked = after_targets - before_targets - {to_sq}
            if not newly_attacked:
                issues.append("discovered_attack claim not verified: no new valuable piece becomes attacked by moving the piece out of the way")
            else:
                undefended = [sq for sq in newly_attacked if not board.is_attacked_by(not mover_color, sq)]
                if not undefended:
                    issues.append("discovered_attack claim has no concrete payoff: newly-attacked piece(s) are still defended")
        board.pop()

    return issues


def main():
    with open(DATA_PATH) as f:
        data = json.load(f)

    any_issue = False
    for puzzle in data["puzzles"]:
        issues = check_puzzle(puzzle)
        if issues:
            any_issue = True
            print(f"{puzzle['id']} ({puzzle['title']}):")
            for issue in issues:
                print(f"  - {issue}")

    if not any_issue:
        print(f"All {len(data['puzzles'])} puzzles passed quality checks")


if __name__ == "__main__":
    main()
