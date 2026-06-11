import { useEffect, useState } from "react";

const QUOTES = [
  { text: "Chess is life in miniature. Chess is a struggle, chess battles.", author: "Garry Kasparov" },
  { text: "Every chess master was once a beginner.", author: "Irving Chernev" },
  { text: "Chess is the gymnasium of the mind.", author: "Blaise Pascal" },
  { text: "When you see a good move, look for a better one.", author: "Emanuel Lasker" },
  { text: "Tactics flow from a superior position.", author: "Bobby Fischer" },
  { text: "The pin is mightier than the sword.", author: "Fred Reinfeld" },
  { text: "A good plan is one move ahead of a bad one.", author: "Siegbert Tarrasch" },
  { text: "Chess is a sea in which a gnat may drink and an elephant may bathe.", author: "Indian Proverb" },
  { text: "In life, as in chess, forethought wins.", author: "Charles Buxton" },
  { text: "The blunders are all there on the board, waiting to be made.", author: "Savielly Tartakower" },
  { text: "You may learn much more from a game you lose than from a game you win.", author: "José Raúl Capablanca" },
  { text: "Chess is not only knowledge and logic.", author: "Alexander Alekhine" },
  { text: "You must take your opponent into a deep dark forest where 2+2=5.", author: "Mikhail Tal" },
  { text: "Few things are as psychologically brutal as chess.", author: "Wilhelm Steinitz" },
  { text: "Chess is the art which expresses the science of logic.", author: "Mikhail Botvinnik" },
  { text: "Chess is, above all, a fight.", author: "Vasily Smyslov" },
  { text: "The hardest game to win is a won game.", author: "Max Euwe" },
  { text: "Chess, like love, like music, has the power to make people happy.", author: "Frank Marshall" },
  { text: "Help your pieces so they can help you.", author: "Paul Morphy" },
  { text: "Chess is a fairy tale of 1001 blunders.", author: "Savielly Tartakower" },
];

const AVATAR_COLORS = ["#d9a648", "#5b9bd5", "#4caf6e", "#e0934f", "#e0584f", "#9a7bd9"];

function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash];
}

function initials(name) {
  return name
    .split(" ")
    .filter((part) => /^[A-Za-zÀ-ÿ]/.test(part))
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

const ROTATE_MS = 30000;

export default function ChessQuote() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % QUOTES.length);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  const quote = QUOTES[index];

  return (
    <div className="chess-quote" key={index}>
      <div className="chess-quote-avatar" style={{ background: avatarColor(quote.author) }}>
        {initials(quote.author)}
      </div>
      <span className="chess-quote-mark">&#8220;</span>
      <p className="chess-quote-text">{quote.text}</p>
      <p className="chess-quote-author">&mdash; {quote.author}</p>
    </div>
  );
}
