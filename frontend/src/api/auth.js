import { apiRequest } from "./client";

export function signup({ name, email, password }) {
  return apiRequest("/auth/signup", {
    method: "POST",
    body: { name, email, password },
    auth: false,
  });
}

export function login({ email, password }) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function logout() {
  return apiRequest("/auth/logout", { method: "POST" });
}

export function getMe() {
  return apiRequest("/auth/me");
}
