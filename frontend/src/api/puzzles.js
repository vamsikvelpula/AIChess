import { apiRequest } from "./client";

export function listPuzzles({ theme, difficulty } = {}) {
  const params = new URLSearchParams();
  if (theme) params.set("theme", theme);
  if (difficulty) params.set("difficulty", difficulty);
  const qs = params.toString();
  return apiRequest(`/puzzles${qs ? `?${qs}` : ""}`);
}

export function getPuzzle(puzzleId) {
  return apiRequest(`/puzzles/${puzzleId}`);
}

export function getPuzzleSolution(puzzleId) {
  return apiRequest(`/puzzles/${puzzleId}/solution`);
}

export function checkPuzzle(puzzleId, movesUci) {
  return apiRequest(`/puzzles/${puzzleId}/check`, {
    method: "POST",
    body: { moves_uci: movesUci },
  });
}

export function recordPuzzleAttempt(puzzleId, { solved, attemptsCount }) {
  return apiRequest(`/puzzles/${puzzleId}/attempt`, {
    method: "POST",
    body: { solved, attempts_count: attemptsCount },
  });
}

export function getDailyPuzzle() {
  return apiRequest("/puzzles/daily");
}

export function completeDailyPuzzle(solved) {
  return apiRequest("/puzzles/daily/complete", {
    method: "POST",
    body: { solved },
  });
}
