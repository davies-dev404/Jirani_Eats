import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api"; // ✅ import your axios instance

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load stored auth data and refresh profile
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = sessionStorage.getItem("user");
      const storedToken = sessionStorage.getItem("token");

      if (storedUser && storedToken) {
        setToken(storedToken);
        // Optimistically set user from storage first to avoid flicker
        setUser(JSON.parse(storedUser));
        
        try {
          // 🔄 Verify & Refresh Profile from Backend (Cache-busted)
          const { data } = await api.get(`/users/profile?_=${Date.now()}`);
          const userData = data.user || data;
          setUser(userData);
          localStorage.removeItem("token"); // Cleanup old localStorage if exists (optional cleanup)
          localStorage.removeItem("user");
          sessionStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
          console.error("Session verification failed", error);
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // ✅ Signup Function (uses axios instance)
  const signup = async (formData) => {
    try {
      const { data } = await api.post("/auth/register", formData);
      return data; // success
    } catch (error) {
      console.error("Signup Error:", error);
      throw new Error(
        error.response?.data?.message || "Signup failed. Try again later."
      );
    }
  };

  // ✅ Login Function (uses axios instance)
  const login = async ({ email, password }) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });

      // Handle both flat and nested user response structures
      const userData = data.user || data;
      const token = data.token;

      setUser(userData);
      setToken(token);
      sessionStorage.setItem("user", JSON.stringify(userData));
      sessionStorage.setItem("token", token);

      return userData; // important for redirects
    } catch (error) {
      console.error("Login Error:", error);
      throw new Error(
        error.response?.data?.message ||
          "Login failed. Check your credentials or connection."
      );
    }
  };

  // Listen for real-time user updates (e.g. verification approval)
  useEffect(() => {
    if (!user?._id) return;
    
    // Connect to simple socket instance or reuse if feasible, but AuthContext is high in tree.
    // Ideally we should usage useSocket hook but SocketProvider is INSIDE AuthProvider? 
    // Wait, in App.jsx: AuthProvider wraps SocketProvider. So we cannot use useSocket here efficiently without circular dep or lifting.
    // Standard pattern: Listen in a child component or make SocketProvider wrap AuthProvider (but socket needs token from auth).
    // ALTERNATIVE: Just handle this inside a global layout or the SocketContext itself updates Auth?
    // Let's do it in SocketContext.jsx instead to avoid structure changes, as it has access to both.
    // Reverting this plan for AuthContext modification. 
  }, [user]);

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedData };
      sessionStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    navigate("/auth");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, signup, login, logout, updateUser, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
