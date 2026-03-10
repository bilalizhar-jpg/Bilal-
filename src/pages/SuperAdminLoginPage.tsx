import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Building2, Lock, User, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'superadmin') {
      navigate('/super-admin/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 800));

    const { username, password } = formData;

    // Super Admin credentials only
    if (username === 'Bilal.izhar' && password === 'KKjdu&&6e99') {
      login({
        id: 'superadmin',
        name: 'Super Admin',
        role: 'superadmin',
        avatar: 'https://ui-avatars.com/api/?name=Super+Admin&background=random'
      });
      navigate('/super-admin/dashboard');
      return;
    }

    setError('Invalid credentials. This page is for Super Admin only.');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020203] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center gap-3 mb-8 group">
          <motion.div 
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="bg-gradient-to-tr from-indigo-500 to-emerald-500 p-0.5 rounded-xl shadow-lg shadow-indigo-500/20"
          >
            <div className="bg-black p-2 rounded-[10px]">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <span className="font-display font-black text-3xl tracking-tighter text-white uppercase">HRM Pro</span>
        </Link>
        <h2 className="text-center text-4xl font-display font-black tracking-tighter text-white uppercase">
          Super Admin Terminal
        </h2>
        <p className="mt-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          System architect access only
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="glass-card py-10 px-6 sm:px-12 border border-white/5">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-400">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-2">
              <label htmlFor="username" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                Identity Token
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all py-4 text-sm"
                  placeholder="USERNAME"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
                Access Key
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-12 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all py-4 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all disabled:opacity-50 shadow-lg shadow-white/5"
            >
              {isLoading ? 'Authenticating...' : 'Initialize Session'}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
            Admin or Employee?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Admin</Link>
            {' · '}
            <Link to="/employee-login" className="text-indigo-400 hover:text-indigo-300">Employee</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
