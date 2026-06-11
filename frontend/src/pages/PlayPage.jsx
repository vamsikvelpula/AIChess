import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { startGame, makeMove, resignGame, completeGame } from "../api/game";
import { ApiError } from "../api/client";
import { LEVELS } from "../data/levels";
import ChessBoardWrapper from "../components/board/ChessBoardWrapper";
import MoveHistory from "../components/board/MoveHistory";
import GameStatusBar from "../components/game/GameStatusBar";
import CongratsModal from "../components/game/CongratsModal";

function describeStatus(status, result, userColor, aiThinking) {
  if (status === "checkmate") {
    const winner = result === "1-0" ? "white" : "black";
    return winner === userColor ? "Checkmate - you win!" : "Checkmate - the AI wins.";
  }
  if (status === "stalemate") return "Stalemate - the game is a draw.";
  if (status === "draw") return "Draw.";
  if (aiThinking) return "AI is thinking...";
  return "Your move";
}

export default function PlayPage() {
  const { level: levelParam } = useParams();
  const level = Number(levelParam);
  const { progress, refreshProgress } = useAuth();

  const [phase, setPhase] = useState("setup");
  const [userColor, setUserColor] = useState("white");
  const [gameId, setGameId] = useState(null);
  const [fen, setFen] = useState(null);
  const [sanHistory, setSanHistory] = useState([]);
  const [status, setStatus] = useState("in_progress");
  const [result, setResult] = useState(null);
  const [isCheck, setIsCheck] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [error, setError] = useState("");
  const [endInfo, setEndInfo] = useState(null);

  useEffect(() => {
    setPhase("setup");
    setUserColor("white");
    setGameId(null);
    setFen(null);
    setSanHistory([]);
    setStatus("in_progress");
    setResult(null);
    setIsCheck(false);
    setAiThinking(false);
    setError("");
    setEndInfo(null);
  }, [levelParam]);

  if (!Number.isInteger(level) || level < 1 || level > LEVELS.length) {
    return <Navigate to="/" replace />;
  }
  if (progress && level > progress.unlocked_max_level) {
    return <Navigate to="/" replace />;
  }

  const levelInfo = LEVELS[level - 1];

  async function handleStart() {
    setError("");
    try {
      const data = await startGame({ level, userColor });
      setGameId(data.game_id);
      setFen(data.fen);
      if (data.ai_move) {
        setSanHistory([data.ai_move.san]);
      } else {
        setSanHistory([]);
      }
      setPhase("playing");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start the game.");
    }
  }

  async function finishGame(finalResult) {
    try {
      const data = await completeGame(gameId);
      await refreshProgress();
      setEndInfo({ outcome: outcomeFor(finalResult, userColor), leveledUp: data.leveled_up });
    } catch {
      setEndInfo({ outcome: outcomeFor(finalResult, userColor), leveledUp: false });
    }
    setPhase("finished");
  }

  function outcomeFor(finalResult, color) {
    if (finalResult === "1/2-1/2") return "draw";
    if ((finalResult === "1-0" && color === "white") || (finalResult === "0-1" && color === "black")) {
      return "win";
    }
    return "loss";
  }

  async function handleMove(moveData) {
    if (aiThinking || phase !== "playing") return;

    setSanHistory((prev) => [...prev, moveData.san]);
    setFen(moveData.fen);
    setAiThinking(true);
    setError("");

    try {
      const response = await makeMove(gameId, moveData.uci);
      if (response.ai_move) {
        setSanHistory((prev) => [...prev, response.ai_move.san]);
        setFen(response.fen_after_ai);
      } else {
        setFen(response.fen);
      }
      setIsCheck(response.is_check);
      setStatus(response.status);
      setResult(response.result);

      if (response.status !== "in_progress") {
        await finishGame(response.result);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Move failed.");
    } finally {
      setAiThinking(false);
    }
  }

  async function handleResign() {
    if (phase !== "playing") return;
    if (!window.confirm("Are you sure you want to resign this game?")) return;

    try {
      const data = await resignGame(gameId);
      setStatus("resigned");
      setResult(data.result);
      await finishGame(data.result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not resign.");
    }
  }

  if (phase === "setup") {
    return (
      <div className="card" style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1 className="section-title">Level {level}: {levelInfo.label}</h1>
        <p className="text-muted">Choose your side and start the game.</p>
        {error && <div className="form-error">{error}</div>}
        <div className="field">
          <label>Play as</label>
          <div className="flex-row">
            <label className="flex-row">
              <input
                type="radio"
                name="color"
                value="white"
                checked={userColor === "white"}
                onChange={() => setUserColor("white")}
              />
              White
            </label>
            <label className="flex-row">
              <input
                type="radio"
                name="color"
                value="black"
                checked={userColor === "black"}
                onChange={() => setUserColor("black")}
              />
              Black
            </label>
          </div>
        </div>
        <button className="btn btn-primary btn-block" onClick={handleStart}>
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div>
      <GameStatusBar
        level={level}
        levelLabel={levelInfo.label}
        statusText={describeStatus(status, result, userColor, aiThinking)}
        isCheck={isCheck}
      />
      {error && <div className="form-error">{error}</div>}
      <div className="play-layout">
        <ChessBoardWrapper
          fen={fen}
          onMove={handleMove}
          boardOrientation={userColor}
          disabled={aiThinking || phase !== "playing"}
        />
        <div className="side-panel">
          <MoveHistory moves={sanHistory} />
          <button className="btn btn-danger btn-block" onClick={handleResign} disabled={phase !== "playing"}>
            Resign
          </button>
        </div>
      </div>
      {phase === "finished" && endInfo && (
        <CongratsModal
          outcome={endInfo.outcome}
          leveledUp={endInfo.leveledUp}
          level={level}
          gameId={gameId}
        />
      )}
    </div>
  );
}
