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
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        setToken(storedToken);
        // Optimistically set user from storage first to avoid flicker
        setUser(JSON.parse(storedUser));
        
        try {
          // 🔄 Verify & Refresh Profile from Backend (Cache-busted)
          const { data } = await api.get(`/users/profile?_=${Date.now()}`);
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
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

      setUser(data);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);

      return data; // important for redirects
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
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
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
