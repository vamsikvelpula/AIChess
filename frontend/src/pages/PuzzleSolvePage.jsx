import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Chess } from "chess.js";
import {
  getPuzzle,
  getPuzzleSolution,
  checkPuzzle,
  recordPuzzleAttempt,
  getDailyPuzzle,
  completeDailyPuzzle,
} from "../api/puzzles";
import { ApiError } from "../api/client";
import { THEME_LABELS } from "../data/puzzleThemes";
import ChessBoardWrapper from "../components/board/ChessBoardWrapper";

const PIECE_NAMES = { K: "King", Q: "Queen", R: "Rook", B: "Bishop", N: "Knight" };

function describeFirstMove(san) {
  if (san.startsWith("O-O-O")) return "Castle queenside.";
  if (san.startsWith("O-O")) return "Castle kingside.";
  const piece = PIECE_NAMES[san[0]] || "pawn";
  const clean = san.replace(/[+#]/g, "").replace(/=.*/, "");
  const square = clean.slice(-2);
  return `Move your ${piece} to ${square}.`;
}

function applyUci(fen, uci) {
  const board = new Chess(fen);
  board.move({
    from: uci.slice(0, 2),
    to: uci.slice(2, 4),
    promotion: uci.length > 4 ? uci[4] : undefined,
  });
  return board.fen();
}

export default function PuzzleSolvePage() {
  const { puzzleId } = useParams();
  const [puzzle, setPuzzle] = useState(null);
  const [fen, setFen] = useState(null);
  const [movesUci, setMovesUci] = useState([]);
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);
  const [isDailyPuzzle, setIsDailyPuzzle] = useState(false);
  const [error, setError] = useState("");
  const [solution, setSolution] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [solutionLoading, setSolutionLoading] = useState(false);

  useEffect(() => {
    setError("");
    setSolved(false);
    setAttempts(0);
    setFeedback(null);
    setMovesUci([]);
    setIsDailyPuzzle(false);
    setSolution(null);
    setShowHint(false);
    setShowSolution(false);

    getPuzzle(puzzleId)
      .then((p) => {
        setPuzzle(p);
        setFen(p.fen);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load puzzle."));

    getDailyPuzzle()
      .then((d) => setIsDailyPuzzle(d.puzzle.id === puzzleId))
      .catch(() => {});
  }, [puzzleId]);

  async function loadSolution() {
    if (solution || solutionLoading) return solution;
    setSolutionLoading(true);
    try {
      const data = await getPuzzleSolution(puzzleId);
      setSolution(data);
      return data;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load solution.");
      return null;
    } finally {
      setSolutionLoading(false);
    }
  }

  async function handleShowHint() {
    await loadSolution();
    setShowHint(true);
  }

  async function handleShowSolution() {
    await loadSolution();
    setShowSolution(true);
  }

  function resetPuzzle() {
    if (!puzzle) return;
    setFen(puzzle.fen);
    setMovesUci([]);
    setSolved(false);
    setFeedback(null);
    setBusy(false);
  }

  async function handleMove(moveData) {
    if (busy || solved) return;

    const prevFen = fen;
    setFen(moveData.fen);
    setBusy(true);
    setFeedback(null);

    const newMoves = [...movesUci, moveData.uci];

    try {
      const res = await checkPuzzle(puzzleId, newMoves);

      if (!res.correct) {
        setAttempts((a) => a + 1);
        setFeedback({ type: "incorrect", message: "Not quite - try again." });
        setTimeout(() => {
          setFen(prevFen);
          setBusy(false);
        }, 500);
        return;
      }

      setMovesUci(newMoves);

      if (res.complete) {
        setSolved(true);
        setFeedback({ type: "correct", message: "Solved! Well done." });
        await recordPuzzleAttempt(puzzleId, { solved: true, attemptsCount: attempts + 1 });
        if (isDailyPuzzle) {
          await completeDailyPuzzle(true);
        }
        setBusy(false);
        return;
      }

      setFeedback({ type: "correct", message: "Correct! The opponent responds..." });
      setTimeout(() => {
        const nextFen = applyUci(moveData.fen, res.expected_uci);
        setFen(nextFen);
        setMovesUci((prev) => [...prev, res.expected_uci]);
        setFeedback(null);
        setBusy(false);
      }, 600);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
      setFen(prevFen);
      setBusy(false);
    }
  }

  if (error) {
    return <div className="form-error">{error}</div>;
  }
  if (!puzzle || !fen) {
    return <div className="page-loading">Loading puzzle...</div>;
  }

  return (
    <div>
      <h1 className="section-title">{puzzle.title}</h1>
      <div className="play-layout">
        <ChessBoardWrapper
          fen={fen}
          onMove={handleMove}
          boardOrientation={puzzle.side_to_move}
          disabled={busy || solved}
        />
        <div className="side-panel">
          <div className="card">
            <div className="puzzle-tags">
              <span className="category-pill tactic">{THEME_LABELS[puzzle.theme] || puzzle.theme}</span>
              <span className="category-pill">Difficulty {puzzle.difficulty}</span>
              {isDailyPuzzle && <span className="category-pill">Daily Puzzle</span>}
            </div>
            <p className="text-muted" style={{ marginTop: 10 }}>
              {puzzle.side_to_move === "white" ? "White" : "Black"} to move. Find the best continuation.
            </p>
            {feedback && (
              <div className={`puzzle-feedback ${feedback.type}`}>{feedback.message}</div>
            )}
            {showHint && solution && !showSolution && (
              <div className="puzzle-feedback hint">
                Hint: {describeFirstMove(solution.solution_san[0])}
              </div>
            )}
            {showSolution && solution && (
              <div className="puzzle-feedback solution">
                <div>
                  <strong>Solution:</strong> {solution.solution_san.join(", ")}
                </div>
                {solution.explanation && <p style={{ marginTop: 6 }}>{solution.explanation}</p>}
              </div>
            )}
            <div className="puzzle-actions" style={{ marginTop: 14 }}>
              <button
                className="btn btn-ghost btn-block"
                onClick={handleShowHint}
                disabled={solutionLoading || showHint || showSolution}
              >
                Show Hint
              </button>
              <button
                className="btn btn-ghost btn-block"
                style={{ marginTop: 8 }}
                onClick={handleShowSolution}
                disabled={solutionLoading || showSolution}
              >
                Show Solution
              </button>
            </div>
            <button className="btn btn-ghost btn-block" style={{ marginTop: 8 }} onClick={resetPuzzle}>
              Reset Puzzle
            </button>
          </div>
          <Link to="/puzzles" className="btn btn-primary btn-block">
            Back to Puzzles
          </Link>
        </div>
      </div>
    </div>
  );
}
