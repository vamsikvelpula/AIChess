"""One-off generator for backend/data/lessons.json.

Each lesson is a sequence of positions built by replaying SAN moves on a python-chess
board (either from the standard starting position for openings, or from a constructed
FEN for tactic/endgame illustrations). `parse_san`/`push` validate legality and
`board.san()` fills in the correct +/# suffixes, so every step is guaranteed to be a
real, reachable position. Run with:

    python scripts/generate_lessons.py
"""

import json
import os

import chess

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "lessons.json")


def build_lesson(slug, title, category, summary, moves, final_caption, start_fen=None):
    board = chess.Board(start_fen) if start_fen else chess.Board()
    assert board.is_valid(), f"{slug}: invalid starting FEN"

    steps = []
    for san, caption in moves:
        fen_before = board.fen()
        move = board.parse_san(san)
        actual_san = board.san(move)
        steps.append({"fen": fen_before, "caption": caption, "move_san": actual_san})
        board.push(move)

    steps.append({"fen": board.fen(), "caption": final_caption, "move_san": None})

    return {
        "slug": slug,
        "title": title,
        "category": category,
        "summary": summary,
        "steps": steps,
    }


LESSONS = [
    build_lesson(
        "opening-principles", "Opening Principles: Control, Develop, Castle", "opening",
        "The three core ideas that guide good opening play: fight for the center, "
        "develop your pieces toward active squares, and get your king to safety.",
        moves=[
            ("e4", "White's first job is to fight for the center. 1.e4 stakes a claim and "
                   "opens lines for the bishop and queen."),
            ("e5", "Black mirrors White, contesting the center immediately."),
            ("Nf3", "Nf3 develops a piece toward the center, attacks e5, and prepares to castle."),
            ("Nc6", "Nc6 develops a piece and defends the e5 pawn."),
            ("Bc4", "Bc4 develops the bishop toward the weak f7 square and clears the way to castle."),
            ("Nf6", "Nf6 develops and counterattacks the e4 pawn."),
            ("O-O", "Castling tucks the king away safely and connects the rooks - the third "
                    "opening principle."),
        ],
        final_caption="In just seven moves both sides have followed the three core opening "
        "principles: control the center, develop minor pieces toward active squares, and "
        "castle for king safety.",
    ),
    build_lesson(
        "italian-game", "The Italian Game", "opening",
        "One of the oldest openings, where both sides develop quickly and aim their "
        "bishops at the opponent's weakest pawn, f7/f2.",
        moves=[
            ("e4", "1.e4 grabs central space."),
            ("e5", "Black responds symmetrically."),
            ("Nf3", "White develops and attacks e5."),
            ("Nc6", "Black defends e5 and develops."),
            ("Bc4", "The Italian bishop aims straight at f7, Black's weakest point."),
            ("Bc5", "Black mirrors with the Italian bishop, eyeing f2."),
            ("c3", "White prepares to build a big center with d4."),
            ("Nf6", "Black counterattacks e4 and develops the last kingside minor piece."),
        ],
        final_caption="This is the main tabiya of the Italian Game (Giuoco Piano). Both sides "
        "have active bishops aimed at the opponent's weak f-pawn, and White is ready to "
        "strike in the center with d4.",
    ),
    build_lesson(
        "ruy-lopez", "The Ruy Lopez", "opening",
        "One of the oldest and most respected openings, where White pins the knight that "
        "defends e5 and applies long-term pressure.",
        moves=[
            ("e4", "White claims the center."),
            ("e5", "Black does the same."),
            ("Nf3", "White develops, attacking e5."),
            ("Nc6", "Black defends the pawn."),
            ("Bb5", "The Ruy Lopez (Spanish Opening): the bishop pins the c6 knight to the "
                    "king and adds long-term pressure on e5."),
            ("a6", "The Morphy Defense - Black asks the bishop a question immediately."),
            ("Ba4", "White retreats but keeps the pin, maintaining pressure on e5 and the "
                    "long diagonal."),
        ],
        final_caption="This is the starting point of the Ruy Lopez, one of the oldest and "
        "most respected openings. White keeps long-term pressure on Black's center while "
        "preparing to castle.",
    ),
    build_lesson(
        "sicilian-defense", "The Sicilian Defense", "opening",
        "Black's most popular and combative reply to 1.e4, leading to imbalanced "
        "positions where both sides fight for the initiative.",
        moves=[
            ("e4", "White stakes a claim in the center."),
            ("c5", "The Sicilian Defense: instead of mirroring with e5, Black creates an "
                   "asymmetrical pawn structure and fights for the d4 square."),
            ("Nf3", "White develops and prepares d4."),
            ("d6", "Black supports a future ...e5 or ...Nf6 setup and opens lines for the "
                   "dark-squared bishop."),
            ("d4", "White strikes in the center, challenging c5."),
            ("cxd4", "Black captures, opening the c-file for a future rook or queen."),
            ("Nxd4", "White recaptures, centralizing the knight."),
            ("Nf6", "Black develops and attacks the e4 pawn, a typical Sicilian motif."),
        ],
        final_caption="This is the Open Sicilian, the most fought-over battleground in chess. "
        "Black's c-file and queenside play balance White's faster development and central space.",
    ),
    build_lesson(
        "queens-gambit", "The Queen's Gambit", "opening",
        "A classical opening where White offers a wing pawn to gain a stronger center "
        "and faster development.",
        moves=[
            ("d4", "White claims the center with the queen's pawn."),
            ("d5", "Black mirrors in the center."),
            ("c4", "The Queen's Gambit: White offers the c-pawn to lure the d5 pawn away "
                   "and build a bigger center."),
            ("e6", "The Queen's Gambit Declined: Black supports d5 rather than grabbing "
                   "the c-pawn."),
            ("Nc3", "White develops and adds pressure on d5."),
            ("Nf6", "Black develops and adds defense to d5."),
        ],
        final_caption="This is the classic Queen's Gambit Declined tabiya. White typically "
        "enjoys a slight space advantage while Black aims for a solid, well-defended structure.",
    ),
    build_lesson(
        "french-defense", "The French Defense", "opening",
        "A solid, resilient defense where Black accepts a temporarily passive bishop in "
        "exchange for a sturdy pawn structure.",
        moves=[
            ("e4", "White takes the center."),
            ("e6", "The French Defense: Black prepares ...d5 while keeping the position "
                   "solid, at the cost of temporarily blocking the light-squared bishop."),
            ("d4", "White builds a full pawn center."),
            ("d5", "Black strikes back in the center immediately."),
            ("Nc3", "White defends e4 and develops, heading toward Winawer/Classical setups."),
            ("Bb4", "The Winawer Variation: Black pins the knight on c3, increasing the "
                    "pressure on e4 and White's center."),
        ],
        final_caption="This is the Winawer French, a sharp and well-respected line where "
        "Black trades the bishop pair for active piece play and pressure on White's center.",
    ),
    build_lesson(
        "fork", "Tactic: The Fork", "tactic",
        "A single move that attacks two enemy pieces at once, so the opponent can only "
        "save one of them.",
        start_fen="r3k3/8/8/3N4/8/8/8/4K3 w - - 0 1",
        moves=[
            ("Nc7", "A fork is a single move that attacks two (or more) enemy pieces at "
                    "once, so the opponent can only save one. White's knight on d5 can jump "
                    "to a square that attacks both the king and the rook."),
            ("Kd7", "Black's king must step out of check - the knight is giving check and "
                    "cannot be captured."),
            ("Nxa8", "With the king out of the way, White simply scoops up the rook."),
        ],
        final_caption="White wins a full rook for free. Forks are most often delivered by "
        "knights because of their unusual attacking pattern, but any piece can fork.",
    ),
    build_lesson(
        "pin", "Tactic: The Pin", "tactic",
        "A pin restricts an enemy piece from moving because doing so would expose a more "
        "valuable piece behind it.",
        start_fen="4k3/8/2n5/8/B7/8/8/4K3 w - - 0 1",
        moves=[
            ("Bb5", "A pin restricts an enemy piece from moving because doing so would "
                    "expose a more valuable piece behind it. White's bishop can pin the c6 "
                    "knight to the e8 king along the a4-e8 diagonal."),
            ("Kd8", "The knight on c6 is now pinned and cannot legally move - it would "
                    "expose the king to check. Black plays a waiting move with the king instead."),
        ],
        final_caption="The knight on c6 remains pinned to the king and cannot move, giving "
        "White time to bring more pieces to attack it. Pins are one of the most common ways "
        "to win material or restrict the opponent's options.",
    ),
    build_lesson(
        "skewer", "Tactic: The Skewer", "tactic",
        "Like a pin in reverse: the more valuable piece is attacked first, and when it "
        "moves, a less valuable piece behind it is won.",
        start_fen="2k4r/8/8/8/8/8/8/R3K3 w - - 0 1",
        moves=[
            ("Ra8", "A skewer is like a pin in reverse: it attacks a valuable piece that, "
                    "when it moves, exposes a less valuable piece behind it. White's rook "
                    "checks along the back rank, skewering the king and the rook on h8."),
            ("Kb7", "Black's king must move out of check, abandoning the rook on h8."),
            ("Rxh8", "White captures the now-undefended rook."),
        ],
        final_caption="The skewer forced the more valuable piece (the king) to move first, "
        "winning the rook behind it on the same rank.",
    ),
    build_lesson(
        "discovered-attack", "Tactic: Discovered Attack", "tactic",
        "Moving one piece out of the way to unleash an attack from another piece behind "
        "it - often while creating a second threat at the same time.",
        start_fen="k7/8/3q4/8/8/N7/8/R3K3 w - - 0 1",
        moves=[
            ("Nb5", "A discovered attack happens when one piece moves out of the way and "
                    "reveals an attack from another piece behind it - often while the moving "
                    "piece creates a threat of its own. Here the knight steps aside, "
                    "unleashing the rook's attack along the a-file toward the king, while "
                    "the knight itself now attacks the queen on d6."),
            ("Kb8", "Black's king must escape the discovered check from the rook."),
            ("Nxd6", "The knight, which was the piece that moved, now captures the queen "
                     "it was attacking all along."),
        ],
        final_caption="White wins the queen using a discovered check - a single move "
        "created two threats, and the opponent could only deal with one of them.",
    ),
    build_lesson(
        "double-attack", "Tactic: Double Attack", "tactic",
        "One move that creates two separate threats at once, often delivered by the queen.",
        start_fen="r3k3/8/8/7n/8/8/3Q4/4K3 w - - 0 1",
        moves=[
            ("Qa5", "A double attack is when one move creates two separate threats. The "
                    "queen moves to a square where it attacks the rook on a8 along the file "
                    "and the knight on h5 along the rank at the same time."),
        ],
        final_caption="Black cannot defend both pieces in a single move, so White will win "
        "one of them next turn. Double attacks like this are often delivered by the queen "
        "because it combines rook and bishop power.",
    ),
    build_lesson(
        "back-rank-mate", "Tactic: Back-Rank Mate", "tactic",
        "A checkmate pattern where a king trapped behind its own pawns is mated along the "
        "back rank.",
        start_fen="6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1",
        moves=[
            ("Ra8", "Back-rank weaknesses happen when a king is trapped behind its own "
                    "pawns with no escape squares. White's rook delivers checkmate along "
                    "the completely open back rank."),
        ],
        final_caption="Checkmate! The pawns on f7, g7, and h7 block every escape square, "
        "so the rook on a8 delivers mate with no possible response. Always watch out for "
        "back-rank weaknesses - both for yourself and your opponent!",
    ),
    build_lesson(
        "smothered-mate", "Tactic: Smothered Mate", "tactic",
        "A famous checkmate pattern where a knight mates a king that is completely "
        "surrounded by its own pieces.",
        start_fen="6rk/6pp/3N4/8/8/8/8/K7 w - - 0 1",
        moves=[
            ("Nf7", "A smothered mate occurs when a king is completely surrounded by its "
                    "own pieces and a knight delivers checkmate, since nothing can capture "
                    "or block it and the king has nowhere to go."),
        ],
        final_caption="Checkmate! The king on h8 is smothered by its own rook and pawns. "
        "This famous pattern is often set up with a queen sacrifice to force the king into "
        "the corner first.",
    ),
    build_lesson(
        "king-pawn-endgame", "Endgame: King and Pawn", "endgame",
        "The fundamentals of escorting a pawn to promotion with king support when the "
        "enemy king is too far away to help.",
        start_fen="6k1/8/3K4/4P3/8/8/8/8 w - - 0 1",
        moves=[
            ("e6", "White's king is beside the pawn, ready to support its advance, while "
                   "Black's king is on the wrong side of the board and can't arrive in "
                   "time. White pushes the pawn forward."),
            ("Kf8", "Black's king hurries back, but it's already too late to stop the pawn."),
            ("e7", "The pawn advances to the seventh rank, supported by the king and "
                   "giving check."),
            ("Kg8", "Black's king has nothing better than to retreat."),
            ("e8=Q", "With the enemy king cut off, White promotes the pawn to a new queen."),
        ],
        final_caption="White now has a decisive material advantage. The core idea of "
        "king-and-pawn endings: keep your king close to your pawn (ideally in front of or "
        "beside it) and march it home before the enemy king can intervene.",
    ),
    build_lesson(
        "rook-vs-king", "Endgame: King and Rook vs King", "endgame",
        "The basic technique for mating with a king and rook against a lone king: drive "
        "the king to the edge and mate along that edge.",
        start_fen="4k3/8/4K3/8/8/8/8/7R w - - 0 1",
        moves=[
            ("Rh8", "In a King and Rook vs King endgame, the technique is to drive the "
                    "enemy king to the edge of the board, bring your own king into "
                    "opposition, and then deliver mate with the rook along that edge. Here "
                    "the kings are already in opposition (two squares apart on the same "
                    "file) and the rook delivers checkmate on the back rank."),
        ],
        final_caption="Checkmate! The rook controls the entire 8th rank while White's king "
        "covers d7, e7, and f7 - Black's king has no escape squares and nothing can block "
        "or capture the rook.",
    ),
]


def build():
    with open(OUTPUT_PATH, "w") as f:
        json.dump({"lessons": LESSONS}, f, indent=2)
        f.write("\n")
    print(f"Wrote {len(LESSONS)} lessons to {os.path.abspath(OUTPUT_PATH)}")


if __name__ == "__main__":
    build()
