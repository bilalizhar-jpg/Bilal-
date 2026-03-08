import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { subscribeToJobs, Job } from '../../utils/jobStore';
import { ExternalLink, Copy, Check, Globe, MapPin, Briefcase, Clock, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ViewPostedJobs() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const [jobs, setJobs] = useState<Job[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.companyId) {
      const unsubscribe = subscribeToJobs((allJobs) => {
        setJobs(allJobs.filter(j => j.status === 'published'));
      }, user.companyId);
      return () => unsubscribe();
    }
  }, [user?.companyId]);

  const careerPageUrl = `${window.location.origin}/careers/${user?.companyId || 'default'}`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              View Posted Jobs
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage and share your live job openings.
            </p>
          </div>
        </div>

        {/* Career Page Link Card */}
        <div className={`${isDark ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'} border rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6`}>
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white text-indigo-600 shadow-sm'}`}>
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Your Company Career Page</h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Share this link with candidates to view all your open positions.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className={`flex-1 md:w-80 px-4 py-2 rounded-lg border text-sm truncate ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}>
              {careerPageUrl}
            </div>
            <button 
              onClick={() => copyToClipboard(careerPageUrl, 'main')}
              className={`p-2 rounded-lg transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 shadow-sm'}`}
              title="Copy link"
            >
              {copiedId === 'main' ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
            </button>
            <a 
              href={careerPageUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-sm"
              title="Open page"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={job.id}
                  className={`${isDark ? 'bg-slate-900 border-slate-800 hover:border-indigo-500/50' : 'bg-white border-slate-200 hover:border-indigo-300'} border rounded-xl p-6 transition-all group relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => copyToClipboard(`${careerPageUrl}?jobId=${job.id}`, job.id)}
                      className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'} hover:scale-110 transition-transform`}
                      title="Copy direct job link"
                    >
                      {copiedId === job.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                      <Briefcase className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className={`font-bold text-lg leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                          Live
                        </span>
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Clock className="w-4 h-4" />
                        {job.type} • {job.workplace}
                      </div>
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                      <button 
                        onClick={() => navigate('/recruitment/job-posting', { state: { job } })}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isDark 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Job
                      </button>
                      <a 
                        href={`${careerPageUrl}?jobId=${job.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isDark 
                            ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Preview
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-700' : 'bg-slate-100 text-slate-300'}`}>
                  <Briefcase className="w-10 h-10" />
                </div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>No live jobs found</h3>
                <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  You haven't published any jobs yet. Go to Job Posting to get started.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminLayout>
  );
}
