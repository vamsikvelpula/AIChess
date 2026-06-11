import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";
import { getProgress } from "../api/progress";
import { getToken, setToken as persistToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshProgress = useCallback(async () => {
    const data = await getProgress();
    setProgress(data);
    return data;
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then((data) => {
        setUser(data.user);
        setProgress(data.progress);
      })
      .catch(() => {
        persistToken(null);
        setUser(null);
        setProgress(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authApi.login(credentials);
    persistToken(data.token);
    setUser(data.user);
    await refreshProgress();
    return data.user;
  }, [refreshProgress]);

  const signup = useCallback(async (details) => {
    const data = await authApi.signup(details);
    persistToken(data.token);
    setUser(data.user);
    await refreshProgress();
    return data.user;
  }, [refreshProgress]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore - we're clearing local state regardless
    }
    persistToken(null);
    setUser(null);
    setProgress(null);
  }, []);

  const value = {
    user,
    progress,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshProgress,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
