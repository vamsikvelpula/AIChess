// Chessboard theme constants — keeps the board in step with the app's
// dark, gold-accented palette defined in index.css (:root).

export const boardStyle = {
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow:
    "0 18px 48px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(217, 166, 72, 0.18)",
};

export const darkSquareStyle = {
  backgroundColor: "#3a4250", // deep slate, tuned to --bg-card / --border
};

export const lightSquareStyle = {
  backgroundColor: "#e9dcc3", // warm cream with a faint gold tint
};

export const dropSquareStyle = {
  boxShadow: "inset 0 0 0 3px rgba(240, 191, 99, 0.85)", // --accent-strong
};

export const draggingPieceStyle = {
  transform: "scale(1.12)",
  filter: "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.45))",
  cursor: "grabbing",
};

export const draggingPieceGhostStyle = {
  opacity: 0.35,
};

// Notation colors: muted on light squares, warm gold on dark squares.
export const darkSquareNotationStyle = {
  color: "#f0bf63", // --accent-strong
  fontSize: "12px",
  fontWeight: 600,
};

export const lightSquareNotationStyle = {
  color: "#6b7585", // harmonizes with --text-muted on cream squares
  fontSize: "12px",
  fontWeight: 600,
};

// Per-square highlight styles
export const lastMoveSquareStyle = {
  boxShadow: "inset 0 0 0 100px rgba(217, 166, 72, 0.28)", // --accent wash
};

export const checkSquareStyle = {
  boxShadow:
    "inset 0 0 0 100px rgba(224, 88, 79, 0.35), inset 0 0 14px rgba(224, 88, 79, 0.7)", // --red glow
};
