import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Building2, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEmployees } from '../context/EmployeeContext';
import { useSuperAdmin } from '../context/SuperAdminContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, signInWithGoogle } = useAuth();
  const { allEmployees } = useEmployees();
  const { companies } = useSuperAdmin();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'superadmin') {
        navigate('/super-admin/dashboard');
      } else if (user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/employee-portal/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const { username, password } = formData;

    // 1. Check Super Admin Credentials
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

    // 2. Check Company Admin Credentials
    console.log("Attempting login with:", username, password);
    console.log("Available companies:", companies);
    const company = companies.find(c => 
      c.adminUsername === username && c.adminPassword === password
    );
    console.log("Found company:", company);

    if (company) {
      if (!company.isActive) {
        setError('Your account is on hold. Please contact Super Admin.');
        setIsLoading(false);
        return;
      }
      login({
        id: company.id,
        name: company.name,
        role: 'admin',
        companyId: company.id,
        avatar: company.logo || 'https://ui-avatars.com/api/?name=Admin&background=random'
      });
      navigate('/dashboard');
      return;
    }

    // 3. Check Employee Credentials
    const employee = allEmployees.find(emp => 
      (emp.username === username || emp.email === username) && emp.password === password
    );

    if (employee) {
      login({
        id: employee.id,
        name: employee.name,
        role: 'employee',
        employeeId: employee.employeeId,
        avatar: employee.avatar,
        companyId: employee.companyId
      });
      
      const from = location.state?.from?.pathname || '/employee-portal/dashboard';
      // Ensure employee doesn't get redirected to admin dashboard
      if (!from.startsWith('/employee-portal') && from !== '/') {
         navigate('/employee-portal/dashboard');
      } else {
         navigate(from);
      }
      return;
    }

    // 4. Login Failed
    setError('Invalid username or password');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020203] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Atmospheric Background */}
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
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <span className="font-display font-black text-3xl tracking-tighter text-white uppercase">HRM Pro</span>
        </Link>
        <h2 className="text-center text-4xl font-display font-black tracking-tighter text-white uppercase">
          Access Terminal
        </h2>
        <p className="mt-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
          Or{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Initialize New Company
          </Link>
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
                  placeholder="USERNAME / EMAIL"
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
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all py-4 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-white/5 border-white/10 text-indigo-500 focus:ring-indigo-500/50 rounded"
                />
                <label htmlFor="remember-me" className="ml-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Persist Session
                </label>
              </div>

              <div className="text-[10px] font-black uppercase tracking-widest">
                <a href="#" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Reset Key?
                </a>
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

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                <span className="px-4 bg-[#0a0a0b] text-slate-500">External Auth</span>
              </div>
            </div>

            <div className="mt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-4 py-4 px-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Super Admin Override
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
