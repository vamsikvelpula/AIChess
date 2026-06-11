const WHITE_PIECES = ["♔", "♕", "♖", "♗", "♘", "♙"];
const BLACK_PIECES = ["♚", "♛", "♜", "♝", "♞", "♟"];
const VARIANTS = ["rise", "diagonal", "sway"];
const PIECE_COUNT = 26;

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildPieces(count) {
  return Array.from({ length: count }, (_, i) => {
    const variant = randomItem(VARIANTS);
    const isWhite = Math.random() < 0.5;
    const duration =
      variant === "sway" ? 9 + Math.random() * 8 : 16 + Math.random() * 26;
    return {
      id: i,
      glyph: randomItem(isWhite ? WHITE_PIECES : BLACK_PIECES),
      color: isWhite ? "var(--text)" : "var(--accent)",
      left: Math.random() * 100,
      top: variant === "sway" ? Math.random() * 90 : null,
      size: 24 + Math.random() * 58,
      duration,
      delay: -Math.random() * duration,
      drift: Math.round((Math.random() - 0.5) * 260),
      sway: Math.round(20 + Math.random() * 70),
      spin: Math.round((Math.random() < 0.5 ? 1 : -1) * (180 + Math.random() * 360)),
      variant,
    };
  });
}

// Generated once at module load — purely decorative, doesn't need to vary per render.
const PIECES = buildPieces(PIECE_COUNT);

// Oversized hero pieces that anchor the page and set the chess mood.
const HERO_PIECES = [
  { glyph: "♔", color: "var(--text)", size: 380, top: "-8%", left: "-7%", duration: 26, delay: -4 },
  { glyph: "♛", color: "var(--accent)", size: 460, bottom: "-12%", right: "-8%", duration: 32, delay: -16 },
  { glyph: "♞", color: "var(--blue)", size: 300, top: "58%", right: "4%", duration: 22, delay: -10 },
];

export default function ChessBackground({ loggedIn = false }) {
  return (
    <div className={`chess-bg ${loggedIn ? "chess-bg--duel" : ""}`} aria-hidden="true">
      <div className="chess-bg-glow" />
      {loggedIn && (
        <div className="chess-bg-arena">
          <span className="chess-bg-duel-piece chess-bg-duel-piece--knight">♞</span>
          <span className="chess-bg-duel-piece chess-bg-duel-piece--queen">♛</span>
          <span className="chess-bg-clash">✦</span>
        </div>
      )}
      {!loggedIn &&
        HERO_PIECES.map((p, i) => (
          <span
            key={`hero-${i}`}
            className="chess-bg-hero"
            style={{
              top: p.top,
              left: p.left,
              right: p.right,
              bottom: p.bottom,
              fontSize: `${p.size}px`,
              color: p.color,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.glyph}
          </span>
        ))}
      {PIECES.map((p) => (
        <span
          key={p.id}
          className={`chess-bg-piece chess-bg-piece--${p.variant}`}
          style={{
            left: `${p.left}%`,
            top: p.top !== null ? `${p.top}%` : undefined,
            fontSize: `${p.size}px`,
            color: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--drift": `${p.drift}px`,
            "--sway": `${p.sway}px`,
            "--spin": `${p.spin}deg`,
          }}
        >
          {p.glyph}
        </span>
      ))}
    </div>
  );
}
