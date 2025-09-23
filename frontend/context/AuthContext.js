import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        login: () => {
          setUser({ name: "Test User" });
        },
        logout: () => {
          setUser(null);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
