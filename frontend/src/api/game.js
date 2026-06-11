import { apiRequest } from "./client";

export function startGame({ level, userColor, mode }) {
  return apiRequest("/game/start", {
    method: "POST",
    body: { level, user_color: userColor, mode },
  });
}

export function makeMove(gameId, moveUci) {
  return apiRequest(`/game/${gameId}/move`, {
    method: "POST",
    body: { move_uci: moveUci },
  });
}

export function resignGame(gameId) {
  return apiRequest(`/game/${gameId}/resign`, { method: "POST" });
}

export function timeoutGame(gameId, color) {
  return apiRequest(`/game/${gameId}/timeout`, {
    method: "POST",
    body: { color },
  });
}

export function completeGame(gameId) {
  return apiRequest(`/game/${gameId}/complete`, { method: "POST" });
}

export function analyzeGame(gameId) {
  return apiRequest(`/game/${gameId}/analyze`, { method: "POST" });
}

export function getGameHistory() {
  return apiRequest("/game/history");
}
