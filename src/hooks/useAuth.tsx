import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, getProfile, updateProfile as apiUpdateProfile, UserProfileDTO } from "@/lib/api";

type User = {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
};

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (p: UserProfileDTO) => Promise<void>;
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
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem("accessToken"));

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, [accessToken]);

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
    setAccessToken(res.accessToken);
    // try to load profile after login
    try {
      const profile = await getProfile();
      setUser({ fullName: profile.fullName, email: profile.email, id: profile.id });
    } catch (e) {
      setUser({ fullName: email });
    }
  };

  const refreshProfile = async () => {
    try {
      const profile = await getProfile();
      setUser({ fullName: profile.fullName, email: profile.email, id: profile.id });
    } catch (e) {
      // fallback: keep stored user
    }
  };

  const updateProfile = async (p: UserProfileDTO) => {
    try {
      const updated = await apiUpdateProfile(p);
      setUser({ fullName: updated.fullName, email: updated.email, id: updated.id, phone: updated.phone });
    } catch (e) {
      // fallback to local persistence if backend isn't available
      setUser((prev) => ({ ...(prev || {}), fullName: p.fullName, email: p.email, phone: p.phone, avatar: p.avatar }));
      try {
        localStorage.setItem("currentUserProfile", JSON.stringify({ ...(user || {}), fullName: p.fullName, email: p.email, phone: p.phone, avatar: p.avatar }));
      } catch (er) {
        // ignore
      }
    }
  };

  const signOut = () => {
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, signIn, signOut, refreshProfile, updateProfile }}>
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
