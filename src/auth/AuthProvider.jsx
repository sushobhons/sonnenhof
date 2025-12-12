import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("SonnenhofUser");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });
  const [token, setToken] = useState(() =>
    localStorage.getItem("SonnenhofAuthToken")
  );

  const login = (userData, token) => {
    localStorage.setItem("SonnenhofAuthToken", token);
    localStorage.setItem("SonnenhofUser", JSON.stringify(userData));
    setUser(userData);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("SonnenhofAuthToken");
    localStorage.removeItem("SonnenhofUser");
    setUser(null);
    setToken(null);
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("SonnenhofUser", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
