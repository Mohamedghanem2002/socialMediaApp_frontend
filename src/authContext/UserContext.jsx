import { createContext, useContext, useEffect, useState } from "react";
import { getMeApi, logoutApi } from "../api/auth";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMeApi();

        setUser(data);
      } catch (error) {
        // console.log("Error:", error);
      }

      setLoading(false);
    })();
  }, []);

  const refreshUser = async () => {
    try {
      const data = await getMeApi();
      setUser(data);
      return data;
    } catch (error) {
      setUser(null);
    }
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, setUser, loading, logout, refreshUser }}>
      {children}
    </AuthCtx.Provider>
  );
}
