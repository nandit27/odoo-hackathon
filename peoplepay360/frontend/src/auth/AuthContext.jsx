import { createContext, useContext, useMemo, useState } from "react";
import api from "../api/axios.js";

const SESSION_KEY = "peoplepay360.session";
const AuthContext = createContext(null);

function restoreSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(restoreSession);

  async function login(email, password) {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setCurrentUser(data.user);
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
      localStorage.setItem("peoplepay360.token", data.token);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || "Email or password is incorrect." };
    }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("peoplepay360.token");
    setCurrentUser(null);
  }

  const value = useMemo(() => ({
    currentUser,
    role: currentUser?.role || null,
    employeeId: currentUser?.employeeId || null,
    login,
    logout,
  }), [currentUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
