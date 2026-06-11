const WHITE_PIECES = ["♔", "♕", "♖", "♗", "♘", "♙"];
const BLACK_PIECES = ["♚", "♛", "♜", "♝", "♞", "♟"];
const PIECE_COUNT = 16;

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Each piece floats at a random depth (z) in the 3D scene and slowly
// tumbles on its own axes. Depth drives size/blur/opacity so near pieces
// read crisp and large while far ones fade into haze - real perspective
// instead of a flat layer of icons.
function buildPieces(count) {
  return Array.from({ length: count }, (_, i) => {
    const isWhite = Math.random() < 0.5;
    const z = -650 + Math.random() * 850; // far (-650) .. near (200)
    const depth = (z + 650) / 850; // 0 = far, 1 = near
    const duration = 28 + Math.random() * 36;
    return {
      id: i,
      glyph: randomItem(isWhite ? WHITE_PIECES : BLACK_PIECES),
      color: isWhite ? "var(--text)" : "var(--accent)",
      left: Math.random() * 100,
      top: Math.random() * 100,
      z,
      size: 32 + depth * 88,
      blur: Math.round((1 - depth) * 5),
      opacity: 0.05 + depth * 0.18,
      duration,
      delay: -Math.random() * duration,
      rotX: Math.round(120 + Math.random() * 300),
      rotY: Math.round((Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 300)),
      driftY: Math.round((Math.random() - 0.5) * 140),
    };
  });
}

// Generated once at module load - purely decorative, doesn't need to vary per render.
const PIECES = buildPieces(PIECE_COUNT);

// Oversized hero pieces that anchor the page and set the chess mood, slowly
// rotating toward the camera in 3D space.
const HERO_PIECES = [
  { glyph: "♔", color: "var(--text)", size: 380, top: "-8%", left: "-7%", duration: 30, delay: -4, rotY: 24 },
  { glyph: "♛", color: "var(--accent)", size: 460, bottom: "-12%", right: "-8%", duration: 36, delay: -16, rotY: -28 },
  { glyph: "♞", color: "var(--blue)", size: 300, top: "58%", right: "4%", duration: 26, delay: -10, rotY: 30 },
];

export default function ChessBackground({ loggedIn = false }) {
  return (
    <div className={`chess-bg ${loggedIn ? "chess-bg--duel" : ""}`} aria-hidden="true">
      <div className="chess-bg-floor" />
      <div className="chess-bg-glow" />
      <div className="chess-bg-scene">
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
                "--rotY": `${p.rotY}deg`,
              }}
            >
              {p.glyph}
            </span>
          ))}
        {PIECES.map((p) => (
          <span
            key={p.id}
            className="chess-bg-piece"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              fontSize: `${p.size}px`,
              color: p.color,
              opacity: p.opacity,
              filter: p.blur ? `blur(${p.blur}px)` : undefined,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--z": `${p.z}px`,
              "--driftY": `${p.driftY}px`,
              "--rotX": `${p.rotX}deg`,
              "--rotY": `${p.rotY}deg`,
            }}
          >
            {p.glyph}
          </span>
        ))}
      </div>
    </div>
  );
}
