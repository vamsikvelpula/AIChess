import { apiRequest } from "./client";

export function listLessons(category) {
  const qs = category ? `?category=${category}` : "";
  return apiRequest(`/lessons${qs}`);
}

export function getLesson(slug) {
  return apiRequest(`/lessons/${slug}`);
}
