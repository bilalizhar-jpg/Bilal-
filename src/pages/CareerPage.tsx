import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown, X, Upload, ChevronRight, Home, ArrowLeft, Mail, Briefcase, Globe, ExternalLink, Building2, Sparkles, Users, Clock } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { saveApplication } from '../utils/applicationStore';
import { getJobs, subscribeToJobs, Job as StoreJob, CustomQuestion } from '../utils/jobStore';
import { doc, onSnapshot as onDocSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  workplace: string;
  description?: string;
  customQuestion?: string;
  customQuestions?: CustomQuestion[];
  testMcqs?: { id: string; question: string; options: any[] }[];
}

export default function CareerPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [company, setCompany] = useState<{ 
    name: string; 
    logo?: string; 
    website?: string; 
    email?: string;
    aboutUs?: string;
    addresses?: { id: string; label: string; address: string }[];
  } | null>(null);
  
  // Referral State
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [referralEmail, setReferralEmail] = useState('');
  const [referralJob, setReferralJob] = useState<Job | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToJobs((allJobs) => {
      const publishedJobs = allJobs
        .filter((j: StoreJob) => j.status === 'published')
        .map((j: StoreJob) => ({
          id: j.id,
          title: j.title,
          location: j.location,
          type: j.type,
          workplace: j.workplace,
          description: j.description,
          customQuestion: j.customQuestion,
          customQuestions: j.customQuestions,
          testMcqs: j.testMcqs
        }));
      setJobs(publishedJobs);

      // Handle direct job link via query param
      const params = new URLSearchParams(window.location.search);
      const jobId = params.get('jobId');
      if (jobId) {
        const job = publishedJobs.find(j => j.id === jobId);
        if (job) {
          setSelectedJob(job);
        }
      }
    }, companyId);

    return () => unsubscribe();
  }, [companyId]);

  useEffect(() => {
    if (!companyId) {
      setCompany({ name: 'Info Resume Edge' });
      return;
    }

    const unsubscribe = onDocSnapshot(doc(db, 'companies', companyId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCompany({ 
          name: data.name, 
          logo: data.logo, 
          website: data.website,
          email: data.email,
          aboutUs: data.aboutUs,
          addresses: data.addresses
        });
      } else {
        setCompany({ name: 'Info Resume Edge' });
      }
    });

    return () => unsubscribe();
  }, [companyId]);

  const handleApply = (job: Job) => {
    navigate(`/careers/${companyId || 'default'}/apply/${job.id}`);
  };

  const handleRefer = (job: Job) => {
    setReferralJob(job);
    setIsReferralOpen(true);
    setReferralEmail('');
  };

  const handleSearch = () => {
    setSearchKeyword(keyword);
    setSearchLocation(location);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesKeyword = job.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                          (job.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ?? false);
    const matchesLocation = job.location.toLowerCase().includes(searchLocation.toLowerCase());
    return matchesKeyword && matchesLocation;
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const submitReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralJob) return;
    
    alert(`Job link for "${referralJob.title}" has been sent to ${referralEmail}`);
    setIsReferralOpen(false);
    setReferralJob(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-slate-200/60 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            {company?.logo ? (
              <img src={company.logo} alt={company.name} className="h-9 w-auto object-contain" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {company?.name?.charAt(0) || 'I'}
              </div>
            )}
            <h1 className="text-xl font-bold tracking-tight text-slate-800 hidden sm:block">
              {company?.name || 'Info Resume Edge'}
            </h1>
          </motion.div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (company?.website) {
                window.open(company.website.startsWith('http') ? company.website : `https://${company.website}`, '_blank');
              } else {
                alert('Company website not available');
              }
            }}
            className="group flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:border-indigo-600 hover:text-indigo-600 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <span>Company website</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[500px] w-full bg-slate-900 overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.5 }}
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000" 
          alt="Modern Office" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/60 to-[#F8FAFC] flex items-center justify-center px-6">
          <div className="text-center max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                <Sparkles className="w-3 h-3" />
                We're Hiring
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]">
                Build the future <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-emerald-300">with us.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-medium opacity-90 leading-relaxed">
                Join a team of innovators, creators, and problem solvers dedicated to making a global impact.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Search Bar Container */}
      <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-3 md:p-4 flex flex-col md:flex-row gap-3 border border-slate-100"
        >
          <div className="flex-1 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="Search by role or keyword" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-4 py-4 text-sm font-medium bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <div className="flex-1 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
              <MapPin className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="Location" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-12 pr-4 py-4 text-sm font-medium bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <button 
            onClick={handleSearch}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.98]"
          >
            Find Jobs
          </button>
        </motion.div>
        
        <div className="mt-8 flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
            <Users className="w-4 h-4" />
            <span>{filteredJobs.length} Open Roles</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Jobs List */}
          <div className="lg:col-span-8">
            <div className="mb-12">
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Available Positions</h2>
              <div className="h-1.5 w-20 bg-indigo-600 rounded-full"></div>
            </div>

            <div className="space-y-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <motion.div 
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                            {job.type}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                            {job.workplace}
                          </span>
                          {job.testMcqs && job.testMcqs.length > 0 && (
                            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider border border-indigo-100 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Assessment
                            </span>
                          )}
                        </div>
                        <h4 
                          onClick={() => setSelectedJob(job)}
                          className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors cursor-pointer"
                        >
                          {job.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm font-medium">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            Posted recently
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button 
                          onClick={() => handleRefer(job)}
                          className="flex-1 md:flex-none px-6 py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                        >
                          Refer
                        </button>
                        <button 
                          onClick={() => handleApply(job)}
                          className="flex-1 md:flex-none px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200 hover:shadow-indigo-200 active:scale-95"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">No roles found</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your search filters to find what you're looking for.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-8">
              {/* About Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-100">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">About {company?.name || 'Info Resume Edge'}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium opacity-90">
                    {company?.aboutUs || 'We are a forward-thinking company dedicated to innovation and excellence. Join our diverse team of professionals and help us shape the future.'}
                  </p>
                </div>
              </motion.div>

              {/* Locations Card */}
              {company?.addresses && company.addresses.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200"
                >
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-400" />
                    Our Presence
                  </h3>
                  <div className="space-y-6">
                    {company.addresses.map((addr) => (
                      <div key={addr.id} className="group cursor-default">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 opacity-80">{addr.label}</p>
                        <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors leading-relaxed">
                          {addr.address}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Contact Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
              >
                <h3 className="text-xl font-bold text-slate-800 mb-6">Get in Touch</h3>
                <div className="space-y-4">
                  <a 
                    href={`mailto:${company?.email || 'hr@company.com'}`}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 group transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-200 transition-colors">
                      <Mail className="w-4 h-4 text-slate-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Us</p>
                      <p className="text-sm font-bold text-slate-700 truncate group-hover:text-indigo-700">
                        {company?.email || `hr@${company?.name?.toLowerCase().replace(/\s/g, '') || 'inforesumeedge'}.com`}
                      </p>
                    </div>
                  </a>
                  {company?.website && (
                    <a 
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 group transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-emerald-200 transition-colors">
                        <Globe className="w-4 h-4 text-slate-600 group-hover:text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Website</p>
                        <p className="text-sm font-bold text-slate-700 truncate group-hover:text-emerald-700">
                          {company.website}
                        </p>
                      </div>
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </aside>
        </div>
      </main>

      {/* Job Details Modal */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20"
            >
              <div className="p-8 md:p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase tracking-widest">
                      {selectedJob.type}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest">
                      {selectedJob.workplace}
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedJob.title}</h3>
                </div>
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="text-slate-400 hover:text-slate-900 transition-all p-3 hover:bg-white rounded-2xl shadow-sm hover:shadow-md"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 md:p-12 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <MapPin className="w-5 h-5 text-indigo-600 mb-3" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                    <p className="text-sm font-bold text-slate-800">{selectedJob.location}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <Briefcase className="w-5 h-5 text-emerald-600 mb-3" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</p>
                    <p className="text-sm font-bold text-slate-800">Engineering</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <Clock className="w-5 h-5 text-amber-600 mb-3" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                    <p className="text-sm font-bold text-slate-800">Full-time</p>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none">
                  <h4 className="text-xl font-bold text-slate-900 mb-6">Role Description</h4>
                  <p className="whitespace-pre-wrap text-slate-600 leading-relaxed text-lg opacity-90">
                    {selectedJob.description || "No description provided."}
                  </p>
                </div>
              </div>

              <div className="p-8 md:p-10 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-end gap-4">
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="px-8 py-4 text-slate-600 hover:bg-white rounded-2xl text-sm font-bold transition-all hover:shadow-sm"
                >
                  Close
                </button>
                <button 
                  onClick={() => handleApply(selectedJob)}
                  className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-[0.98]"
                >
                  Apply for this Position
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Referral Modal */}
      <AnimatePresence>
        {isReferralOpen && referralJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Refer a Talent</h3>
                <button 
                  onClick={() => setIsReferralOpen(false)}
                  className="text-slate-400 hover:text-slate-900 transition-all p-2 hover:bg-slate-50 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={submitReferral} className="p-8 space-y-6">
                <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Referral for</p>
                  <p className="text-lg font-bold text-indigo-900">{referralJob.title}</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Friend's Email Address</label>
                  <div className="relative group">
                    <input 
                      type="email" 
                      required 
                      value={referralEmail}
                      onChange={(e) => setReferralEmail(e.target.value)}
                      placeholder="talent@example.com"
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium" 
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-3">
                  <button 
                    type="submit"
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Send Referral Link
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsReferralOpen(false)}
                    className="w-full py-4 text-slate-500 hover:text-slate-700 rounded-2xl text-sm font-bold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
