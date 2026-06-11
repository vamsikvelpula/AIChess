import { apiRequest } from "./client";

export function getProgress() {
  return apiRequest("/progress");
}
