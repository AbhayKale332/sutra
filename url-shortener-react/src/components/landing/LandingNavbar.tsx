import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import BrandMark from "@/components/BrandMark";

const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/#features", label: "Features" },
    ...(isAuthenticated ? [{ to: "/dashboard", label: "Dashboard" }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold tracking-tight flex items-center gap-1.5 focus:outline-none h-full">
          <BrandMark />
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to} className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          
          {isAuthenticated ? (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={logout}
              className="px-4"
            >
              <LogOut size={16} className="mr-2" /> LogOut
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="px-4 text-sm">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="px-4 text-sm font-semibold">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden border-t border-border bg-background"
          >
            <div className="flex flex-col items-center gap-5 px-6 py-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors text-lg font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-4 py-2">
                <span className="text-muted-foreground text-sm">Theme</span>
                <ThemeToggle />
              </div>
              
              {isAuthenticated ? (
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full rounded-full"
                >
                  <LogOut size={18} className="mr-2" /> LogOut
                </Button>
              ) : (
                <div className="flex flex-col w-full gap-3">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="w-full">
                    <Button variant="ghost" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="w-full">
                    <Button className="w-full font-semibold">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default LandingNavbar;
