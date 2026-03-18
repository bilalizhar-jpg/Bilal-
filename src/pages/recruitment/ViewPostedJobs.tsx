import React, { useState, useEffect} from 'react';
import { useNavigate} from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useAuth} from '../../context/AuthContext';
import { subscribeToJobs, Job} from '../../utils/jobStore';
import { ExternalLink, Copy, Check, Globe, MapPin, Briefcase, Clock, Edit} from 'lucide-react';
import { motion, AnimatePresence} from 'motion/react';

export default function ViewPostedJobs() {
 const navigate = useNavigate();
 const { user} = useAuth();
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

 const careerPageUrl =`${window.location.origin}/careers/${user?.companyId || 'default'}`;

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
 <h1 className="text-2xl font-bold text-gray-900">
 View Posted Jobs
 </h1>
 <p className="text-sm mt-1 text-gray-500">
 Manage and share your live job openings.
 </p>
 </div>
 </div>

 {/* Career Page Link Card */}
 <div className="bg-gray-50 border-gray-200 border rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
 <div className="flex items-center gap-4 text-center md:text-left">
 <div className="p-3 rounded-xl bg-white text-black shadow-sm border border-gray-200">
 <Globe className="w-6 h-6"/>
 </div>
 <div>
 <h3 className="font-bold text-gray-900">Your Company Career Page</h3>
 <p className="text-sm text-gray-500">Share this link with candidates to view all your open positions.</p>
 </div>
 </div>
 <div className="flex items-center gap-2 w-full md:w-auto">
 <div className="flex-1 md:w-80 px-4 py-2 rounded-md border text-sm truncate bg-white border-gray-300 text-gray-600">
 {careerPageUrl}
 </div>
 <button 
 onClick={() => copyToClipboard(careerPageUrl, 'main')}
 className="p-2 rounded-md transition-all bg-white hover:bg-gray-50 border border-gray-300 text-gray-600 shadow-sm"
 title="Copy link"
 >
 {copiedId === 'main' ? <Check className="w-5 h-5 text-emerald-500"/> : <Copy className="w-5 h-5"/>}
 </button>
 <a 
 href={careerPageUrl} 
 target="_blank"
 rel="noopener noreferrer"
 className="p-2 bg-black hover:bg-gray-800 text-white rounded-md transition-all shadow-sm"
 title="Open page"
 >
 <ExternalLink className="w-5 h-5"/>
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
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 exit={{ opacity: 0, scale: 0.95}}
 key={job.id}
 className="bg-white border-gray-200 hover:border-gray-300 border rounded-xl p-6 transition-all group relative overflow-hidden"
 >
 <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
 <button 
 onClick={() => copyToClipboard(`${careerPageUrl}?jobId=${job.id}`, job.id)}
 className="p-2 rounded-md bg-gray-50 text-gray-600 hover:scale-110 transition-transform"
 title="Copy direct job link"
 >
 {copiedId === job.id ? <Check className="w-4 h-4 text-emerald-500"/> : <Copy className="w-4 h-4"/>}
 </button>
 </div>

 <div className="space-y-4">
 <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 text-black border border-gray-200">
 <Briefcase className="w-6 h-6"/>
 </div>

 <div>
 <h3 className="font-bold text-lg leading-tight text-gray-900">
 {job.title}
 </h3>
 <div className="flex items-center gap-2 mt-2">
 <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
 Live
 </span>
 <span className="text-xs text-gray-500">
 Posted {new Date(job.createdAt).toLocaleDateString()}
 </span>
 </div>
 </div>

 <div className="space-y-2">
 <div className="flex items-center gap-2 text-sm text-gray-500">
 <MapPin className="w-4 h-4"/>
 {job.location}
 </div>
 <div className="flex items-center gap-2 text-sm text-gray-500">
 <Clock className="w-4 h-4"/>
 {job.type} • {job.workplace}
 </div>
 </div>

 <div className="pt-4 flex items-center gap-3">
 <button 
 onClick={() => navigate('/recruitment/job-posting', { state: { job}})}
 className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all bg-black hover:bg-gray-800 text-white"
 >
 <Edit className="w-4 h-4"/>
 Edit Job
 </button>
 <a 
 href={`${careerPageUrl}?jobId=${job.id}`}
 target="_blank"
 rel="noopener noreferrer"
 className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all bg-gray-100 hover:bg-gray-200 text-gray-700"
 >
 <ExternalLink className="w-4 h-4"/>
 Preview
 </a>
 </div>
 </div>
 </motion.div>
 ))
 ) : (
 <div className="col-span-full py-20 text-center">
 <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-gray-100 text-gray-300">
 <Briefcase className="w-10 h-10"/>
 </div>
 <h3 className="text-lg font-bold text-gray-900">No live jobs found</h3>
 <p className="text-sm mt-2 text-gray-500">
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
