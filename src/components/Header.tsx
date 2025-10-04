import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, Activity } from "lucide-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const currentUser = localStorage.getItem("currentUserId");

  const handleLogout = () => {
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("currentUserFullName");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Activity className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            HealthCare
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/appointments" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Appointments
          </Link>
          <Link to="/prescriptions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Prescriptions
          </Link>
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-3">
          <Link to="/" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
            Home
          </Link>
          <Link to="/appointments" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
            Appointments
          </Link>
          <Link to="/prescriptions" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
            Prescriptions
          </Link>
          <Link to="/contact" className="block py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
            Contact
          </Link>
          <div className="pt-3 space-y-2">
            {currentUser ? (
              <>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
