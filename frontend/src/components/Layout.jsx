import { useState, useRef, useEffect } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, UserCircle, Menu as MenuIcon, X } from "lucide-react";

export default function Layout({ children }) {
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMobileMenu();
      }
    }
    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 font-sans text-gray-900 dark:text-gray-100">
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 border-b border-indigo-500/30 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo on the left */}
            <RouterLink to="/" className="flex items-center gap-2 group transition-opacity hover:opacity-90">
              <span className="text-2xl drop-shadow-sm">💸</span>
              <span className="text-white drop-shadow-md font-bold text-lg tracking-tight">
                Expense Tracker
              </span>
            </RouterLink>

            {/* Everything else on the right */}
            <div className="flex items-center gap-2 sm:gap-4">
              {user && (
                <>
                  {/* Desktop Nav Links */}
                  <nav className="hidden md:flex items-center gap-1 mr-2">
                    <RouterLink
                      to="/"
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      Dashboard
                    </RouterLink>
                    <RouterLink
                      to="/expenses"
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      Expenses
                    </RouterLink>
                  </nav>

                  {/* User Email Chip */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 transition-colors rounded-full border border-white/20 shadow-sm backdrop-blur-md">
                    <UserCircle className="w-5 h-5 text-blue-100" />
                    <span className="text-sm font-medium text-white max-w-[150px] truncate" title={user.name || user.email}>
                      {user.name || user.email}
                    </span>
                  </div>

                  {/* Red Logout Button */}
                  <button
                    onClick={logout}
                    className="group flex items-center gap-2 px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-red-500/30 border border-red-500 hover:-translate-y-0.5"
                  >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>

                  {/* Mobile Hamburger Menu Icon */}
                  <div className="md:hidden flex items-center relative" ref={menuRef}>
                    <button
                      onClick={toggleMobileMenu}
                      className="p-2 ml-1 rounded-lg text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                      aria-expanded={isMobileMenuOpen}
                    >
                      {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                    </button>

                    {/* Mobile Menu Dropdown */}
                    {isMobileMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-700 py-2 origin-top-right animate-in fade-in slide-in-from-top-2">
                        <RouterLink
                          to="/"
                          className="block px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700/50"
                        >
                          Dashboard
                        </RouterLink>
                        <RouterLink
                          to="/expenses"
                          className="block px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700/50"
                        >
                          Expenses
                        </RouterLink>

                        <div className="sm:hidden px-4 py-3 mt-1 border-t border-gray-100 dark:border-zinc-700/50">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                            Signed in as
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate mt-0.5">
                            {user.name || user.email}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
}
