import React, { createContext, useContext, useEffect, useState } from "react";
import { login as apiLogin, UserDTO, updateMe, updateUser, getMe } from "@/lib/api";
import { toast } from "sonner";

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
    // If we know the user's email, try to refresh from backend using /api/users/me?email=...
    const email = user?.email;
    if (!email) return;
    try {
      const fresh = await getMe(email);
      if (fresh) {
        setUser({ id: fresh.id, email: fresh.email, fullName: fresh.fullName, phone: fresh.phone });
        try { localStorage.setItem("currentUserProfile", JSON.stringify(fresh)); } catch {}
      }
    } catch (e) {
      // ignore network/backend errors; keep local state
    }
  };

  const updateProfile = async (p: { fullName: string; phone?: string }) => {
    // Try to persist profile to backend if available. Fall back to localStorage.
  const payload: any = { fullName: p.fullName };
    if (p.phone) payload.phone = p.phone;

    // helper to persist locally
    const persistLocal = () => {
      setUser((prev) => ({ ...(prev || {}), fullName: p.fullName, phone: p.phone }));
      try {
        localStorage.setItem("currentUserProfile", JSON.stringify({ ...(user || {}), fullName: p.fullName, phone: p.phone }));
      } catch (er) {
        // ignore
      }
    };

    try {
      // Prefer the dedicated self-update endpoint: PUT /api/users/me (requires email in body)
      if (!user?.email) {
        throw new Error("Missing user email for profile update");
      }
      const updated = await updateMe({ email: user.email, ...payload });
      if (updated) {
        setUser({ fullName: updated.fullName, email: updated.email, id: updated.id, phone: updated.phone } as any);
        try { localStorage.setItem("currentUserProfile", JSON.stringify(updated)); } catch {}
  toast.success("Successfully updated");
        return;
      }
      // If no body returned, fall through and try admin/id endpoint if we have an id
      if (user && (user as any).id) {
        const updated2 = await updateUser((user as any).id as number, payload as Partial<UserDTO>);
        if (updated2) {
          setUser({ fullName: updated2.fullName, email: updated2.email, id: updated2.id, phone: updated2.phone } as any);
          try { localStorage.setItem("currentUserProfile", JSON.stringify(updated2)); } catch {}
          toast.success("Successfully updated");
          return;
        }
      }
      // Otherwise, persist locally
  persistLocal();
  toast.success("Successfully updated");
      return;
    } catch (er: any) {
      // If /me failed with 404 or permission and we have an id, try /api/users/{id}
      try {
        if (user && (user as any).id) {
          const updated2 = await updateUser((user as any).id as number, payload as Partial<UserDTO>);
          if (updated2) {
            setUser({ fullName: updated2.fullName, email: updated2.email, id: updated2.id, phone: updated2.phone } as any);
            try { localStorage.setItem("currentUserProfile", JSON.stringify(updated2)); } catch {}
            toast.success("Profile updated");
            return;
          }
        }
      } catch (inner: any) {
        // continue to local fallback
      }
      // Final fallback: local persistence
      persistLocal();
      if (er?.status === 404) {
        toast.success("Successfully updated");
      } else {
        toast.error(er?.message || "Failed to update profile; changes saved locally");
      }
      return;
    }
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
