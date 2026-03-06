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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-3xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="bg-gradient-to-tr from-indigo-500 to-emerald-500 p-0.5 rounded-xl shadow-lg shadow-indigo-500/20"
            >
              <div className="bg-black p-1.5 rounded-[10px]">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            <span className="font-display font-black text-2xl tracking-tighter text-white uppercase group-hover:text-indigo-400 transition-colors">HRM Pro</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full" />
                </a>
              ))}
            </div>
            
            <div className="flex items-center gap-6 ml-6 border-l border-white/10 pl-8">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </motion.button>

              <div className="flex items-center gap-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to={user?.role === 'admin' ? '/dashboard' : user?.role === 'superadmin' ? '/super-admin/dashboard' : '/employee-portal/dashboard'}
                      className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white bg-white/5 border border-white/10 px-5 py-3 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                      Terminal
                    </Link>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleLogout}
                      className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-500/5 border border-red-500/10 px-5 py-3 rounded-xl hover:bg-red-500/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Exit
                    </motion.button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                    >
                      Admin
                    </Link>
                    <Link
                      to="/employee-login"
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                    >
                      Employee
                    </Link>
                    <Link
                      to="/register"
                      className="bg-white text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-white/10"
                    >
                      Initialize
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
