import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const { pathname } = useLocation();
  const isActive = (p: string) => pathname.startsWith(p);
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 md:col-span-3 lg:col-span-2">
            <nav className="space-y-2">
              <Link className={`block px-3 py-2 rounded ${isActive("/admin/users") ? "bg-muted" : "hover:bg-muted/50"}`} to="/admin/users">Users</Link>
              <Link className={`block px-3 py-2 rounded ${isActive("/admin/appointments") ? "bg-muted" : "hover:bg-muted/50"}`} to="/admin/appointments">Appointments</Link>
              <Link className={`block px-3 py-2 rounded ${isActive("/admin/prescriptions") ? "bg-muted" : "hover:bg-muted/50"}`} to="/admin/prescriptions">Prescriptions</Link>
              <Link className={`block px-3 py-2 rounded ${isActive("/admin/messages") ? "bg-muted" : "hover:bg-muted/50"}`} to="/admin/messages">Messages</Link>
            </nav>
          </aside>
          <section className="col-span-12 md:col-span-9 lg:col-span-10">
            <Outlet />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
