import { createContext, useContext, useMemo, useState } from "react";
import { authenticateDemoUser, getDemoUserByEmail, toSessionUser } from "./demoUsers.js";

const SESSION_KEY = "peoplepay360.demoSessionEmail";
const AuthContext = createContext(null);

function restoreSession() {
  try {
    return toSessionUser(getDemoUserByEmail(localStorage.getItem(SESSION_KEY)));
  } catch {
    return null;
  }
}

// Frontend-only demo session. Backend APIs must enforce authentication and authorization in production.
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(restoreSession);

  function login(email, password) {
    const demoUser = authenticateDemoUser(email, password);
    if (!demoUser) return { success: false, error: "Email or password is incorrect." };
    const sessionUser = toSessionUser(demoUser);
    setCurrentUser(sessionUser);
    localStorage.setItem(SESSION_KEY, sessionUser.email);
    return { success: true, user: sessionUser };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
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
