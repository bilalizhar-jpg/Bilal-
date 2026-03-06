import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Users, ShieldCheck, Zap, Globe, CheckCircle2, Star, TrendingUp, HeartHandshake, Building2, Terminal, Cpu, Network } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020203] text-white selection:bg-indigo-500/30">
      {/* Immersive Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/20 blur-[150px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -40, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-600/20 blur-[150px]" 
        />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020203]/50 to-[#020203]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-12"
            >
              <Terminal className="w-3 h-3" />
              <span>System Status: Optimal • 500+ Nodes Active</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl sm:text-8xl md:text-9xl font-display font-black tracking-tighter leading-[0.85] uppercase"
            >
              The Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-emerald-400">Evolution</span> <br />
              of Workforce
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-12 text-lg sm:text-xl leading-relaxed text-slate-400 max-w-2xl font-medium"
            >
              Architecting the future of human capital management. 
              Automate complexity. Scale intelligence. Empower humanity.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-16 flex flex-wrap justify-center items-center gap-6"
            >
              <Link
                to="/register"
                className="relative group px-10 py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Initialize Protocol
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                to="/login"
                className="px-10 py-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95"
              >
                Access Terminal
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="mt-24 flex flex-col items-center gap-6"
            >
              <div className="flex -space-x-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-emerald-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-500" />
                    <img 
                      src={`https://picsum.photos/seed/user${i}/100/100`} 
                      className="relative w-12 h-12 rounded-full border-2 border-black object-cover"
                      referrerPolicy="no-referrer"
                      alt=""
                    />
                  </div>
                ))}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                <span className="text-white">10,000+</span> Entities Synchronized
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: 'Efficiency Gain', value: '40%', icon: Zap, color: 'text-indigo-400' },
              { label: 'System Integrity', value: '99.9%', icon: ShieldCheck, color: 'text-emerald-400' },
              { label: 'Scale Factor', value: '2.5x', icon: TrendingUp, color: 'text-blue-400' },
              { label: 'User Resonance', value: '4.9/5', icon: HeartHandshake, color: 'text-rose-400' },
            ].map((stat, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={stat.label} 
                className="text-center group"
              >
                <div className="flex justify-center mb-6">
                  <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500 ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-4xl font-black tracking-tighter mb-2">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="relative py-32 z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24">
            <div className="max-w-2xl">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-6">Core Infrastructure</h2>
              <p className="text-5xl sm:text-7xl font-display font-black tracking-tighter uppercase leading-none">
                Unified <br />
                <span className="text-slate-500">Intelligence</span>
              </p>
            </div>
            <p className="text-slate-400 max-w-md font-medium leading-relaxed">
              Dismantle silos. HRM Pro integrates every facet of human capital management into a singular, high-performance ecosystem.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Neural Attendance', icon: Cpu, desc: 'Biometric synchronization with real-time spatial verification.' },
              { name: 'Quantum Payroll', icon: Network, desc: 'Instantaneous multi-currency processing with automated compliance.' },
              { name: 'Self-Service Node', icon: Users, desc: 'Decentralized management for autonomous employee entities.' },
              { name: 'Growth Analytics', icon: TrendingUp, desc: 'Predictive performance modeling and skill-gap visualization.' },
              { name: 'Secure Protocol', icon: ShieldCheck, desc: 'Military-grade encryption for sensitive personnel data.' },
              { name: 'Global Network', icon: Globe, desc: 'Seamless cross-border workforce orchestration.' },
            ].map((feature, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                key={feature.name} 
                className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-500"
              >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <feature.icon className="w-16 h-16" />
                </div>
                <feature.icon className="w-8 h-8 text-indigo-400 mb-8 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-lg font-black uppercase tracking-widest mb-4">{feature.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative rounded-[40px] overflow-hidden bg-white/5 border border-white/10 backdrop-blur-3xl p-12 sm:p-24 text-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-emerald-500/10" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <h2 className="text-4xl sm:text-6xl font-display font-black tracking-tighter uppercase mb-8">
                Initialize Your <br />
                <span className="text-indigo-400">Future</span> Today
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-16 font-medium leading-relaxed">
                Join the vanguard of organizations redefining the relationship between technology and talent.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Link
                  to="/register"
                  className="px-12 py-6 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all"
                >
                  Begin Onboarding
                </Link>
                <Link
                  to="/contact"
                  className="px-12 py-6 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                >
                  Consultation
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-24 z-10 border-t border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-24">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-600 p-2 rounded-xl">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="font-display font-black text-2xl tracking-tighter uppercase">HRM Pro</span>
              </Link>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs">
                Architecting the infrastructure for the next generation of human collaboration.
              </p>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">Protocol</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors font-medium">Core Modules</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors font-medium">Security Layer</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors font-medium">API Terminal</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">Organization</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors font-medium">About Mission</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors font-medium">Intelligence</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors font-medium">Connect</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">Legal</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors font-medium">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors font-medium">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">© 2026 HRM PRO • NEURAL NETWORK ARCHITECTURE</p>
            <div className="flex gap-8">
              <a href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
