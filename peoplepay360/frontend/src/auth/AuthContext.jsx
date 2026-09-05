import { createContext, useContext, useMemo, useState } from "react";
import {
  authenticateDemoUser,
  getDemoUserByEmail,
  toSessionUser,
} from "./demoUsers.js";

const SESSION_KEY = "peoplepay360.demoSessionEmail";
const AuthContext = createContext(null);

function restoreSession() {
  try {
    const email = localStorage.getItem(SESSION_KEY);
    return toSessionUser(getDemoUserByEmail(email));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(restoreSession);

  async function login(email, password) {
    const user = authenticateDemoUser(email, password);
    if (!user) return { success: false, error: "Email or password is incorrect." };
    const sessionUser = toSessionUser(user);
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
