import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, UserDTO } from "@/lib/api";

type User = {
  id?: number;
  fullName?: string;
  email?: string;
  phone?: string;
};

type AuthContextValue = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (p: { fullName: string; phone?: string }) => Promise<void>;
  initialized: boolean;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("currentUserProfile");
      if (raw) return JSON.parse(raw);
    } catch (e) {
      /* ignore */
    }
    const name = localStorage.getItem("currentUserFullName");
    return name ? { fullName: name } : null;
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem("currentUserProfile", JSON.stringify(user));
      } catch (e) {
        // ignore
      }
    } else {
      localStorage.removeItem("currentUserProfile");
      localStorage.removeItem("currentUserFullName");
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    const anyRes = res as any;

    // If server returned a user in the login response, use it.
    const userObj: UserDTO | undefined = anyRes?.user ?? (anyRes && (anyRes.id || anyRes.email) ? anyRes : undefined);
    if (userObj) {
      setUser({ fullName: userObj.fullName, email: userObj.email, id: userObj.id, phone: userObj.phone } as any);
      try {
        if (!localStorage.getItem("currentUserProfile")) {
          localStorage.setItem("currentUserProfile", JSON.stringify(userObj));
        }
      } catch (e) {
        // ignore
      }
      return;
    }

    // Otherwise set a minimal fallback
    setUser({ fullName: email, email });
  };

  const refreshProfile = async () => {
    // Backend doesn't provide an authenticated profile endpoint; nothing to do here.
    return Promise.resolve();
  };

  const updateProfile = async (p: { fullName: string; phone?: string }) => {
    // Backend doesn't provide profile updates; persist locally until server supports it.
    setUser((prev) => ({ ...(prev || {}), fullName: p.fullName, phone: p.phone }));
    try {
      localStorage.setItem("currentUserProfile", JSON.stringify({ ...(user || {}), fullName: p.fullName, phone: p.phone }));
    } catch (er) {
      // ignore
    }
    return Promise.resolve();
  };

  const signOut = () => {
    setUser(null);
    setUser(null);
  };

  // Initialize auth state from localStorage only
  useEffect(() => {
    setInitialized(true);
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, refreshProfile, updateProfile, initialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default useAuth;
