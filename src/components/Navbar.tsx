import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/teevexa-logo.jpeg";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Services", path: "/services" },
  { label: "Insights", path: "/insights" },
  { label: "Careers", path: "/careers" },
  { label: "Contact", path: "/contact" },
];

function useTheme() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("teevexa_theme", isDark ? "dark" : "light");
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((v) => !v) };
}

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin } = useAuth();
  const { isDark, toggle } = useTheme();
  const portalPath = isAdmin ? "/admin" : "/client-portal";

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 nav-dark-surface border-b backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src={logo} alt="Teevexa" className="h-9 w-9 rounded-md object-cover" />
          <span className="text-xl font-display font-bold gradient-text tracking-tight">TEEVEXA</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-0.5">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-3 py-2 text-sm font-medium transition-colors hover:text-primary group ${
                isActive(link.path) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
              <span
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300 ${
                  isActive(link.path) ? "w-3/4" : "w-0 group-hover:w-1/2"
                }`}
              />
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Button variant="ghost" size="sm" asChild>
            <Link to="/book-consultation">Book Consultation</Link>
          </Button>
          <Button size="sm" className="glow-primary" asChild>
            <Link to="/start-project">Start a Project</Link>
          </Button>
          {user && (
            <Button
              size="sm"
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              asChild
            >
              <Link to={portalPath}>
                <LayoutDashboard size={14} className="mr-1.5" />
                {isAdmin ? "Admin" : "My Portal"}
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile controls */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            className="text-foreground p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden nav-dark-surface border-t backdrop-blur-xl animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border/30">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/book-consultation" onClick={() => setMobileOpen(false)}>Book Consultation</Link>
              </Button>
              <Button size="sm" className="glow-primary" asChild>
                <Link to="/start-project" onClick={() => setMobileOpen(false)}>Start a Project</Link>
              </Button>
              {user && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  asChild
                >
                  <Link to={portalPath} onClick={() => setMobileOpen(false)}>
                    <LayoutDashboard size={14} className="mr-1.5" />
                    {isAdmin ? "Admin" : "My Portal"}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
