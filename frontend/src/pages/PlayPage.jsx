import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { startGame, makeMove, resignGame, completeGame, timeoutGame } from "../api/game";
import { ApiError } from "../api/client";
import { LEVELS } from "../data/levels";
import ChessBoardWrapper from "../components/board/ChessBoardWrapper";
import MoveHistory from "../components/board/MoveHistory";
import GameStatusBar from "../components/game/GameStatusBar";
import ChessClock from "../components/game/ChessClock";
import CongratsModal from "../components/game/CongratsModal";

const CLOCK_SECONDS = 10 * 60;

function describeStatus(status, result, userColor, aiThinking) {
  if (status === "checkmate") {
    const winner = result === "1-0" ? "white" : "black";
    return winner === userColor ? "Checkmate - you win!" : "Checkmate - the AI wins.";
  }
  if (status === "stalemate") return "Stalemate - the game is a draw.";
  if (status === "draw") return "Draw.";
  if (status === "timeout") {
    const loser = result === "1-0" ? "black" : "white";
    return loser === userColor ? "Time's up - you lose!" : "Time's up - you win!";
  }
  if (aiThinking) return "AI is thinking...";
  return "Your move";
}

function moveFromUci(uci) {
  if (!uci || uci.length < 4) return null;
  return { from: uci.slice(0, 2), to: uci.slice(2, 4) };
}

export default function PlayPage({ tournamentMode = false }) {
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
  const [lastMove, setLastMove] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [error, setError] = useState("");
  const [endInfo, setEndInfo] = useState(null);
  const [whiteTime, setWhiteTime] = useState(CLOCK_SECONDS);
  const [blackTime, setBlackTime] = useState(CLOCK_SECONDS);

  useEffect(() => {
    setPhase("setup");
    setUserColor("white");
    setGameId(null);
    setFen(null);
    setSanHistory([]);
    setStatus("in_progress");
    setResult(null);
    setIsCheck(false);
    setLastMove(null);
    setAiThinking(false);
    setError("");
    setEndInfo(null);
    setWhiteTime(CLOCK_SECONDS);
    setBlackTime(CLOCK_SECONDS);
  }, [levelParam]);

  const activeColor = fen ? (new Chess(fen).turn() === "w" ? "white" : "black") : null;

  // Tick down the clock for whoever's turn it is. Tournament games only.
  useEffect(() => {
    if (!tournamentMode || phase !== "playing" || status !== "in_progress" || !activeColor) return undefined;
    const id = setInterval(() => {
      if (activeColor === "white") {
        setWhiteTime((t) => Math.max(0, t - 1));
      } else {
        setBlackTime((t) => Math.max(0, t - 1));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [activeColor, phase, status]);

  // End the game when either clock hits zero. Tournament games only.
  useEffect(() => {
    if (!tournamentMode || phase !== "playing" || status !== "in_progress") return;
    if (whiteTime === 0) handleTimeout("white");
    else if (blackTime === 0) handleTimeout("black");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [whiteTime, blackTime, phase, status]);

  if (!Number.isInteger(level) || level < 1 || level > LEVELS.length) {
    return <Navigate to={tournamentMode ? "/tournament" : "/"} replace />;
  }
  if (!tournamentMode && progress && level > progress.unlocked_max_level) {
    return <Navigate to="/" replace />;
  }

  const levelInfo = LEVELS[level - 1];

  async function handleStart() {
    setError("");
    try {
      const data = await startGame({ level, userColor, mode: tournamentMode ? "tournament" : "campaign" });
      setGameId(data.game_id);
      setFen(data.fen);
      if (data.ai_move) {
        setSanHistory([data.ai_move.san]);
        setLastMove(moveFromUci(data.ai_move.uci));
      } else {
        setSanHistory([]);
        setLastMove(null);
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
    setLastMove({ from: moveData.from, to: moveData.to });
    setAiThinking(true);
    setError("");

    try {
      const response = await makeMove(gameId, moveData.uci);
      if (response.ai_move) {
        setSanHistory((prev) => [...prev, response.ai_move.san]);
        setFen(response.fen_after_ai);
        setLastMove(moveFromUci(response.ai_move.uci));
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

  async function handleTimeout(color) {
    if (phase !== "playing") return;
    const finalResult = color === "white" ? "0-1" : "1-0";
    setStatus("timeout");
    setResult(finalResult);
    try {
      await timeoutGame(gameId, color);
    } catch {
      // Best-effort - finishGame below still wraps things up locally.
    }
    await finishGame(finalResult);
  }

  if (phase === "setup") {
    return (
      <div className="card" style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1 className="section-title">
          {tournamentMode ? `${levelInfo.botIcon} ${levelInfo.label}` : `Level ${level}: ${levelInfo.label}`}
        </h1>
        {tournamentMode && <p className="text-muted">Rating: {levelInfo.rating}</p>}
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
        levelLabel={tournamentMode ? `${levelInfo.botIcon} ${levelInfo.label}` : levelInfo.label}
        statusText={describeStatus(status, result, userColor, aiThinking)}
        isCheck={isCheck}
      />
      {error && <div className="form-error">{error}</div>}
      <div className="play-layout">
        <div className="board-column">
          {tournamentMode && (
            <ChessClock
              label="AI"
              seconds={userColor === "white" ? blackTime : whiteTime}
              active={phase === "playing" && status === "in_progress" && activeColor !== userColor}
            />
          )}
          <ChessBoardWrapper
            fen={fen}
            onMove={handleMove}
            boardOrientation={userColor}
            disabled={aiThinking || phase !== "playing"}
            lastMove={lastMove}
            whiteTime={tournamentMode ? whiteTime : null}
            blackTime={tournamentMode ? blackTime : null}
            activeColor={activeColor}
            userColor={userColor}
            status={status}
            result={result}
            isCheck={isCheck}
            aiThinking={aiThinking}
          />
          {tournamentMode && (
            <ChessClock
              label="You"
              seconds={userColor === "white" ? whiteTime : blackTime}
              active={phase === "playing" && status === "in_progress" && activeColor === userColor}
            />
          )}
        </div>
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
          tournamentMode={tournamentMode}
        />
      )}
    </div>
  );
}
