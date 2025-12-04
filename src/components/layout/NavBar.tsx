import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavBarProps {
  isAuthenticated?: boolean;
  userRole?: "contributor" | "company" | "verifier" | null;
}

const NavBar = ({ isAuthenticated = false, userRole = null }: NavBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/map", label: "Map" },
    ...(isAuthenticated && userRole
      ? [{ href: `/dashboard/${userRole}`, label: "Dashboard" }]
      : []),
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-4">
        <div className="glass rounded-2xl px-6 py-4 shadow-soft">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest to-emerald flex items-center justify-center"
              >
                <Leaf className="w-5 h-5 text-teal" />
              </motion.div>
              <span className="font-display text-xl font-bold text-forest">
                AirSwap
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                    location.pathname === link.href
                      ? "bg-forest text-primary-foreground"
                      : "text-forest/70 hover:text-forest hover:bg-forest/10"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="hero" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-forest/10 transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-forest" />
              ) : (
                <Menu className="w-6 h-6 text-forest" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-forest/10"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      location.pathname === link.href
                        ? "bg-forest text-primary-foreground"
                        : "text-forest/70 hover:text-forest hover:bg-forest/10"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex gap-2 mt-2">
                  {!isAuthenticated && (
                    <>
                      <Link to="/login" className="flex-1">
                        <Button variant="ghost" className="w-full">
                          Log In
                        </Button>
                      </Link>
                      <Link to="/signup" className="flex-1">
                        <Button variant="hero" className="w-full">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default NavBar;
