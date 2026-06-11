const QUOTES = [
  { text: "The beauty of a move lies not in its appearance but in the thought behind it.", author: "Aaron Nimzowitsch" },
  { text: "Chess is everything: art, science, and sport.", author: "Anatoly Karpov" },
  { text: "You can only get good at chess if you love the game.", author: "Bobby Fischer" },
  { text: "Chess is the struggle against the error.", author: "Johannes Zukertort" },
  { text: "It is not a move, even the best move, that you must seek, but a realizable plan.", author: "Eugene Znosko-Borovsky" },
  { text: "On the chessboard, lies and hypocrisy do not survive long.", author: "Emanuel Lasker" },
  { text: "Play the opening like a book, the middlegame like a magician, and the endgame like a machine.", author: "Rudolf Spielmann" },
];

// Picked once at module load — purely decorative, doesn't need to vary per render.
const QUOTE = QUOTES[Math.floor(Math.random() * QUOTES.length)];

export default function AuthQuoteBanner() {
  return (
    <div className="auth-quote-banner">
      <span className="auth-quote-glyph auth-quote-glyph--left" aria-hidden="true">&#9819;</span>
      <div className="auth-quote-body">
        <p className="auth-quote-text">{QUOTE.text}</p>
        <p className="auth-quote-author">{QUOTE.author}</p>
      </div>
      <span className="auth-quote-glyph auth-quote-glyph--right" aria-hidden="true">&#9821;</span>
    </div>
  );
}
