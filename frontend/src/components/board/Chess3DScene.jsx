import { useRef } from "react";
import Chess3DBoard from "./Chess3DBoard";
import { formatTime } from "../game/ChessClock";

const BASE_ROTATE_X = 60;
const BASE_ROTATE_Z = 45;
const TILT_RANGE = 12;

// Decide how the chair occupant (you) and the robot (AI) should "feel"
// about the current position - mirrors a real opponent's reaction.
function getFaces({ status, result, userColor, isCheck, activeColor, aiThinking }) {
  const gameOver = status && status !== "in_progress";
  if (gameOver) {
    if (status === "draw" || status === "stalemate") return { user: "neutral", ai: "neutral" };
    const userWon =
      (result === "1-0" && userColor === "white") || (result === "0-1" && userColor === "black");
    return userWon ? { user: "happy", ai: "shocked" } : { user: "shocked", ai: "happy" };
  }
  if (isCheck && activeColor) {
    const userInCheck = activeColor === userColor;
    return {
      user: userInCheck ? "shocked" : "neutral",
      ai: userInCheck ? "neutral" : "shocked",
    };
  }
  if (aiThinking) return { user: "neutral", ai: "thinking" };
  return { user: "neutral", ai: "neutral" };
}

function Face({ expression }) {
  return (
    <div className={`chess-3d-face chess-3d-face--${expression}`}>
      <div className="chess-3d-face-eyes">
        <span className="chess-3d-eye" />
        <span className="chess-3d-eye" />
      </div>
      <span className="chess-3d-mouth" />
    </div>
  );
}

export default function Chess3DScene({
  fen,
  onMove,
  boardOrientation = "white",
  disabled = false,
  lastMove = null,
  whiteTime = null,
  blackTime = null,
  activeColor = null,
  userColor = "white",
  status = "in_progress",
  result = null,
  isCheck = false,
  aiThinking = false,
}) {
  const faces = getFaces({ status, result, userColor, isCheck, activeColor, aiThinking });
  const showClocks = whiteTime != null && blackTime != null;
  const userTime = userColor === "white" ? whiteTime : blackTime;
  const aiTime = userColor === "white" ? blackTime : whiteTime;
  const userActive = activeColor === userColor;
  const aiActive = activeColor !== null && activeColor !== userColor;

  const tiltRef = useRef(null);

  // Subtle parallax: the table tilts slightly toward the cursor, as if
  // the viewer is leaning to look at the board from a different angle.
  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateX = BASE_ROTATE_X - py * TILT_RANGE;
    const rotateZ = BASE_ROTATE_Z + px * TILT_RANGE;
    if (tiltRef.current) {
      tiltRef.current.style.transform = `translate(-50%, -50%) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`;
    }
  }

  function handleMouseLeave() {
    if (tiltRef.current) {
      tiltRef.current.style.transform = "";
    }
  }

  return (
    <div className="chess-3d-scene" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div className={`chess-3d-player-row chess-3d-player-row--ai${aiActive ? " is-active" : ""}`}>
        <div className="chess-3d-player-info">
          <span className="chess-3d-player-name">AI Opponent</span>
          {showClocks && (
            <span className={`chess-3d-timer${aiActive ? " is-active" : ""}${aiTime <= 60 ? " is-low" : ""}`}>
              {formatTime(aiTime)}
            </span>
          )}
        </div>
      </div>

      <div className="chess-3d-table">
        <span className="chess-3d-table-leg chess-3d-table-leg--left" />
        <span className="chess-3d-table-leg chess-3d-table-leg--front" />
        <span className="chess-3d-table-leg chess-3d-table-leg--right" />

        <div className="chess-3d-table-figure chess-3d-table-figure--user">
          <div className="chess-3d-chair">
            <div className="chess-3d-chair-back">
              <div className="chess-3d-chair-occupant">
                <Face expression={faces.user} />
              </div>
            </div>
            <div className="chess-3d-chair-seat" />
            <span className="chess-3d-chair-armrest chess-3d-chair-armrest--left" />
            <span className="chess-3d-chair-armrest chess-3d-chair-armrest--right" />
          </div>
        </div>

        <div className="chess-3d-table-figure chess-3d-table-figure--ai">
          <div className="chess-3d-robot">
            <span className="chess-3d-robot-antenna" />
            <div className="chess-3d-robot-head">
              <Face expression={faces.ai} />
            </div>
            <div className="chess-3d-robot-body" />
          </div>
        </div>

        <div className="chess-3d-table-tilt" ref={tiltRef}>
          <div className="chess-3d-table-top" />
          {showClocks && (
            <div className="chess-3d-clock">
              <span className="chess-3d-clock-dial" />
              <span className="chess-3d-clock-dial" />
            </div>
          )}
          <div className="chess-3d-table-board">
            <Chess3DBoard
              fen={fen}
              onMove={onMove}
              boardOrientation={boardOrientation}
              disabled={disabled}
              lastMove={lastMove}
            />
          </div>
        </div>
      </div>

      <div className={`chess-3d-player-row chess-3d-player-row--user${userActive ? " is-active" : ""}`}>
        <div className="chess-3d-player-info">
          <span className="chess-3d-player-name">You</span>
          {showClocks && (
            <span className={`chess-3d-timer${userActive ? " is-active" : ""}${userTime <= 60 ? " is-low" : ""}`}>
              {formatTime(userTime)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
