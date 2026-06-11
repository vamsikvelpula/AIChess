import { useState } from "react";
import { Chess } from "chess.js";
import ChessBoardWrapper from "../board/ChessBoardWrapper";

function moveArrow(fen, sanMove) {
  if (!sanMove) return [];
  const board = new Chess(fen);
  const match = board.moves({ verbose: true }).find((m) => m.san === sanMove);
  if (!match) return [];
  return [{ startSquare: match.from, endSquare: match.to, color: "rgba(91, 155, 213, 0.8)" }];
}

export default function LessonStepper({ steps }) {
  const [index, setIndex] = useState(0);
  const step = steps[index];

  return (
    <div>
      <ChessBoardWrapper
        fen={step.fen}
        onMove={() => {}}
        arrows={moveArrow(step.fen, step.move_san)}
        disabled
      />
      <div className="lesson-caption">{step.caption}</div>
      <div className="lesson-stepper-controls">
        <button
          className="btn btn-ghost"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          Previous
        </button>
        <span className="lesson-progress">Step {index + 1} of {steps.length}</span>
        <button
          className="btn btn-primary"
          onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
          disabled={index === steps.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
