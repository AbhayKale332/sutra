import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Link2, LogOut } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import linkLottie from "../../assets/lottie/Url Link.lottie";

const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/#features", label: "Features" },
    ...(isAuthenticated ? [{ to: "/dashboard", label: "Dashboard" }] : []),
  ];

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-brand-purple to-brand-blue"
    >
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="text-2xl font-bold text-primary-foreground tracking-tight flex items-center gap-1.5 focus:outline-none h-full">
          <div className="w-16 h-16">
            <DotLottieReact src={linkLottie} loop autoplay />
          </div>
          Sutra
        </Link>
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to} className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-sm font-medium">
              {link.label}
            </Link>
          ))}
          <ThemeToggle className="text-primary-foreground" />
          
          {isAuthenticated ? (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={logout}
              className="rounded-full px-5"
            >
              <LogOut size={16} className="mr-2" /> LogOut
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-primary-foreground hover:bg-white/10 rounded-full px-5 text-sm">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-white text-brand-purple hover:bg-slate-100 rounded-full px-5 text-sm font-semibold">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
        <button
          className="md:hidden text-primary-foreground"
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
            className="md:hidden overflow-hidden bg-gradient-to-r from-brand-purple to-brand-blue border-t border-white/10"
          >
            <div className="flex flex-col items-center gap-5 px-6 py-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors text-lg font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-4 py-2">
                <span className="text-primary-foreground/60 text-sm">Theme</span>
                <ThemeToggle className="text-primary-foreground" />
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
                    <Button variant="ghost" className="w-full text-primary-foreground hover:bg-white/10 rounded-full">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="w-full">
                    <Button className="w-full bg-white text-brand-purple hover:bg-slate-100 rounded-full font-semibold">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default LandingNavbar;
