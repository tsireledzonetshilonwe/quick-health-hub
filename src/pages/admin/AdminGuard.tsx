import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // Probe an admin endpoint; if unauthorized, redirect
        const res = await fetch("/api/admin/users", { method: "GET", credentials: "include" });
        if (res.status === 200) setOk(true);
        else if (res.status === 401) navigate("/login");
        else setOk(false);
      } catch {
        setOk(false);
      }
    })();
  }, []);

  if (ok === null) return null; // could show a spinner
  if (!ok) return <div className="p-6">Not authorized</div>;
  return <>{children}</>;
}
