import { Link, useNavigate } from 'react-router-dom';
import { Building2, Menu, X, Sun, Moon, User, Briefcase, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '#about' },
    { name: 'Terms', href: '#terms' },
    { name: 'Policy', href: '#policy' },
    { name: 'Contact Us', href: '#contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass dark:bg-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">HRM Pro</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {link.name}
              </a>
            ))}
            
            <div className="flex items-center gap-3 ml-4 border-l border-slate-200 dark:border-slate-800 pl-6">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to={user?.role === 'admin' ? '/dashboard' : '/employee-portal/dashboard'}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                    {user?.avatar && (
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      Super Admin
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      Employer Login
                    </Link>
                    <Link
                      to="/employee-login"
                      className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-2 rounded-lg transition-all"
                    >
                      <User className="w-3.5 h-3.5" />
                      Employee Login
                    </Link>
                    <Link
                      to="/register"
                      className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-200 dark:shadow-none"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-indigo-600"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-3 px-3">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                      {user?.avatar && (
                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                      </div>
                    </div>
                    <Link
                      to={user?.role === 'admin' ? '/dashboard' : '/employee-portal/dashboard'}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <Briefcase className="w-4 h-4" />
                      Super Admin
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl"
                    >
                      <Briefcase className="w-4 h-4" />
                      Employer Login
                    </Link>
                    <Link
                      to="/employee-login"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 rounded-xl"
                    >
                      <User className="w-4 h-4" />
                      Employee Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="text-center py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
