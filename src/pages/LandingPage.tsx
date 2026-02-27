import { motion } from 'motion/react';
import { ArrowRight, Users, ShieldCheck, Zap, Globe, CheckCircle2, Star, TrendingUp, HeartHandshake, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="pt-16 dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),transparent)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.900),transparent)] opacity-20 dark:opacity-40" />
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-6"
              >
                <Star className="w-3 h-3 fill-current" />
                <span>Trusted by 500+ HR Teams Worldwide</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl sm:text-7xl font-display font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]"
              >
                Empower Your <span className="text-indigo-600 dark:text-indigo-400">Workforce</span> with HRM Pro.
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-8 text-lg leading-8 text-slate-600 dark:text-slate-400 max-w-xl"
              >
                The all-in-one HR management platform designed for modern companies. Automate payroll, track attendance, manage leaves, and foster a culture of excellence.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <Link
                  to="/register"
                  className="rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center gap-2 group"
                >
                  Start Your Free Trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="rounded-2xl bg-white dark:bg-slate-900 px-8 py-4 text-sm font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Watch Demo
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-10 flex items-center gap-6"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <img 
                      key={i}
                      src={`https://picsum.photos/seed/avatar${i}/100/100`} 
                      className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-950 object-cover"
                      referrerPolicy="no-referrer"
                      alt="User avatar"
                    />
                  ))}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white">Join 10,000+</span> employees already using HRM Pro
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="relative z-10 bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800">
                <img
                  src="https://picsum.photos/seed/dashboard/1200/800"
                  alt="HRM Dashboard Preview"
                  className="rounded-2xl w-full shadow-inner"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating UI Elements */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -top-6 -right-6 bg-emerald-500 text-white p-4 rounded-2xl shadow-xl hidden sm:block"
                >
                  <CheckCircle2 className="w-6 h-6 mb-1" />
                  <div className="text-[10px] font-bold uppercase tracking-wider">Payroll Processed</div>
                  <div className="text-lg font-bold">$42,500.00</div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                  className="absolute -bottom-6 -left-6 bg-indigo-600 text-white p-4 rounded-2xl shadow-xl hidden sm:block"
                >
                  <Users className="w-6 h-6 mb-1" />
                  <div className="text-[10px] font-bold uppercase tracking-wider">Active Employees</div>
                  <div className="text-lg font-bold">1,284</div>
                </motion.div>
              </div>
              
              {/* Background Decorative Elements */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Time Saved', value: '40%', icon: Zap },
              { label: 'Accuracy', value: '99.9%', icon: ShieldCheck },
              { label: 'Growth', value: '2.5x', icon: TrendingUp },
              { label: 'Satisfaction', value: '4.9/5', icon: HeartHandshake },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-24 bg-slate-50 dark:bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-bold leading-7 text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Core Modules</h2>
            <p className="mt-2 text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Everything you need to manage people
            </p>
            <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
              Stop juggling multiple spreadsheets. HRM Pro brings all your HR functions into one unified, secure, and intuitive dashboard.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  name: 'Smart Attendance', 
                  icon: Zap, 
                  description: 'Automated tracking with geo-fencing and biometric integration options.',
                  color: 'bg-blue-500'
                },
                { 
                  name: 'Leave Management', 
                  icon: Globe, 
                  description: 'Customizable leave policies and automated approval workflows.',
                  color: 'bg-indigo-500'
                },
                { 
                  name: 'Payroll Automation', 
                  icon: TrendingUp, 
                  description: 'One-click payroll processing with automated tax calculations.',
                  color: 'bg-emerald-500'
                },
                { 
                  name: 'Employee Self-Service', 
                  icon: Users, 
                  description: 'Empower employees to manage their own data and requests.',
                  color: 'bg-amber-500'
                },
                { 
                  name: 'Performance Tracking', 
                  icon: Star, 
                  description: 'Set goals, conduct reviews, and track employee growth over time.',
                  color: 'bg-rose-500'
                },
                { 
                  name: 'Recruitment CRM', 
                  icon: ShieldCheck, 
                  description: 'Manage the entire hiring pipeline from job posting to onboarding.',
                  color: 'bg-violet-500'
                },
              ].map((feature) => (
                <motion.div 
                  whileHover={{ y: -5 }}
                  key={feature.name} 
                  className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className={`${feature.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-current/20`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {feature.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-base font-bold leading-7 text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Testimonials</h2>
            <p className="mt-2 text-4xl font-display font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Loved by HR Professionals
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "HRM Pro has completely transformed how we handle payroll. What used to take days now takes minutes.",
                author: "Sarah Jenkins",
                role: "HR Director at TechFlow",
                avatar: "https://picsum.photos/seed/sarah/100/100"
              },
              {
                quote: "The employee self-service portal is a game changer. Our team loves the transparency and ease of use.",
                author: "Michael Chen",
                role: "People Ops at InnovateX",
                avatar: "https://picsum.photos/seed/michael/100/100"
              },
              {
                quote: "Finally, an HR tool that is actually intuitive. The recruitment CRM is the best we've ever used.",
                author: "Elena Rodriguez",
                role: "Talent Acquisition at GlobalScale",
                avatar: "https://picsum.photos/seed/elena/100/100"
              }
            ].map((testimonial, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm"
              >
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-slate-600 dark:text-slate-400 italic mb-8">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.author} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-900/50"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{testimonial.author}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-indigo-600 px-6 py-24 shadow-2xl rounded-3xl sm:px-24 xl:py-32">
            <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transform your HR operations?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-8 text-indigo-100">
              Join thousands of forward-thinking companies that use HRM Pro to build better workplaces.
            </p>
            <div className="mt-10 flex justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-xl bg-white px-8 py-4 text-sm font-bold text-indigo-600 shadow-sm hover:bg-indigo-50 transition-all"
              >
                Get Started Now
              </Link>
              <Link to="/contact" className="text-sm font-bold leading-6 text-white flex items-center gap-2">
                Contact Sales <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Decorative circles */}
            <svg viewBox="0 0 1024 1024" className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]" aria-hidden="true">
              <circle cx="512" cy="512" r="512" fill="url(#759c1415-0410-454c-8f7c-9a820de03641)" fillOpacity="0.7" />
              <defs>
                <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                  <stop stopColor="#7775D6" />
                  <stop offset={1} stopColor="#E935C1" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">HRM Pro</span>
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                Making workforce management simple, efficient, and human-centric.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Company</h3>
              <ul className="space-y-2">
                <li><a href="#about" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#policy" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">© 2024 HRM Pro. Built with love for HR professionals.</p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">Twitter</a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">LinkedIn</a>
              <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
