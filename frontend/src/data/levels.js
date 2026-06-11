export const MAX_LEVEL = 100;

// Twenty named "ranks", each spanning five levels (I-V) - mirrors the
// backend's level curve in app/chess_engine/levels.py.
const RANK_NAMES = [
  "Absolute Beginner", "Beginner", "Novice", "Casual Player", "Improving Player",
  "Club Beginner", "Club Player", "Solid Club Player", "Strong Club Player",
  "Tournament Player", "Experienced Player", "Expert", "Candidate Master",
  "National Master", "FIDE Master", "International Master", "Grandmaster",
  "Super GM", "World Class", "Engine Master",
];
const ROMAN = ["I", "II", "III", "IV", "V"];

// Ranks 0-8 (levels 1-45) are beginner/club friendly, 9-13 (46-70) are
// tough, 14-19 (71-100) push toward Stockfish's maximum strength.
function tierForRank(rankIndex) {
  if (rankIndex <= 8) return "easy";
  if (rankIndex <= 13) return "hard";
  return "extreme";
}

// One bot "avatar" piece per group of four ranks - mirrors a chess.com-style
// bot ladder where the pieces get grander as the bots get stronger.
const BOT_ICONS = ["♟", "♞", "♝", "♜", "♛"];
function botIconForRank(rankIndex) {
  if (rankIndex === RANK_NAMES.length - 1) return "♚"; // king for the final rank
  return BOT_ICONS[Math.floor(rankIndex / 4)];
}

// Approximate rating shown on bot cards - mirrors the backend's UCI_Elo
// ramp for levels 1-70, then keeps climbing toward Stockfish's ~3190 cap.
function ratingForLevel(level) {
  if (level <= 70) {
    return 1320 + Math.round((level - 1) * (2850 - 1320) / 69);
  }
  return 2850 + Math.round((level - 71) * (3190 - 2850) / 29);
}

export const LEVELS = Array.from({ length: MAX_LEVEL }, (_, i) => {
  const level = i + 1;
  const rankIndex = Math.floor(i / 5);
  const roman = ROMAN[i % 5];
  return {
    level,
    label: `${RANK_NAMES[rankIndex]} ${roman}`,
    tier: tierForRank(rankIndex),
    rating: ratingForLevel(level),
    botIcon: botIconForRank(rankIndex),
  };
});
