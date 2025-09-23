import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async ({ email, password }) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Login failed and no JSON body' }));
        console.error('Login failed with status:', res.status, 'and data:', errorData);
        throw new Error(errorData.message || "Login failed");
      }

      const data = await res.json();
      await AsyncStorage.setItem("token", data.token); // save token
      setUser({ ...data.user, token: data.token });
    } catch (err) {
      console.error('Network or other error during login:', err);
      throw err;
    }
  };

  // Updated register function to use departmentName instead of communityId
  const register = async ({ email, password, username, role, departmentName }) => {
    try {
      const payload = { email, password, username, role };

      if (role === "admin" && departmentName) {
        payload.departmentName = departmentName;
      }

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Registration failed and no JSON body' }));
        console.error('Registration failed with status:', res.status, 'and data:', errorData);
        throw new Error(errorData.message || "Registration failed");
      }

      return await res.json();
    } catch (err) {
      console.error('Network or other error during registration:', err);
      throw err;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
