import React, { useState, useEffect} from 'react';
import { useParams, useNavigate, Link} from 'react-router-dom';
import { MapPin, ChevronDown, Upload, Home, ArrowLeft, Mail, ChevronRight, FileText, Briefcase, Globe, Sparkles, CheckCircle2, Clock, User, Phone, ExternalLink} from 'lucide-react';
import { motion, AnimatePresence} from 'motion/react';
import { saveApplication, uploadCV} from '../utils/applicationStore';
import { subscribeToJobs, Job} from '../utils/jobStore';
import { api } from '../services/api';
import { evaluateCVMatch} from '../utils/cvMatcher';

export default function ApplyPage() {
 const { companyId, jobId} = useParams<{ companyId: string; jobId: string}>();
 const navigate = useNavigate();
 const [selectedJob, setSelectedJob] = useState<Job | null>(null);
 const [company, setCompany] = useState<{ 
 name: string; 
 logo?: string; 
 website?: string; 
 email?: string;
 aboutUs?: string;
} | null>(null);
 const [loading, setLoading] = useState(true);

 // Form state
 const [applicantName, setApplicantName] = useState('');
 const [applicantEmail, setApplicantEmail] = useState('');
 const [applicantPhone, setApplicantPhone] = useState('');
 const [cvFile, setCvFile] = useState<File | null>(null);
 const [customQuestionAnswer, setCustomQuestionAnswer] = useState('');
 const [customQuestionAnswers, setCustomQuestionAnswers] = useState<Record<string, string>>({});
 const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isSuccess, setIsSuccess] = useState(false);

 useEffect(() => {
 if (!companyId || !jobId) return;

 const unsubscribe = subscribeToJobs((allJobs) => {
 const job = allJobs.find(j => j.id === jobId);
 if (job) {
 setSelectedJob(job);
}
 setLoading(false);
}, companyId);

 return () => unsubscribe();
}, [companyId, jobId]);

 useEffect(() => {
   if (!companyId) return;
   api
     .getById<{ name: string; logo?: string; website?: string; email?: string; aboutUs?: string }>('companies', companyId)
     .then((data) => setCompany({ name: data.name, logo: data.logo, website: data.website, email: data.email, aboutUs: data.aboutUs }))
     .catch(() => setCompany({ name: 'Info Resume Edge' }));
 }, [companyId]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!selectedJob || !companyId) return;

 setIsSubmitting(true);
 try {
 let cvUrl = '';
 let matchPercentage = Math.floor(Math.random() * 60) + 40;
 let extractedCvText = '';
 let extractedInfo: any = {};

 if (cvFile) {
 cvUrl = await uploadCV(companyId, selectedJob.id, cvFile);
 
 // Calculate match percentage and extract info using Gemini
 try {
 const result = await evaluateCVMatch(
 cvFile, 
 selectedJob.description || '', 
 selectedJob.title
 );
 matchPercentage = result.matchPercentage;
 extractedCvText = result.cvText;
 extractedInfo = result.extractedInfo;
} catch (matchError) {
 console.error("Failed to calculate match percentage:", matchError);
}
}

 const answers = selectedJob.enableCustomQuestions && selectedJob.customQuestions?.map(q => ({
 question: q.question,
 answer: customQuestionAnswers[q.id] || ''
})) || [];

 const mcqResults = selectedJob.testMcqs?.map(q => {
 const selectedOptionId = mcqAnswers[q.id];
 const selectedOption = q.options.find(o => o.id === selectedOptionId);
 return {
 questionId: q.id,
 question: q.question,
 selectedOptionId: selectedOptionId || '',
 selectedOptionText: selectedOption?.text || '',
 isCorrect: selectedOption?.isCorrect || false
};
}) || [];

 await saveApplication({
 companyId: companyId,
 jobId: selectedJob.id,
 jobTitle: selectedJob.title,
 candidateName: applicantName,
 email: applicantEmail,
 phone: applicantPhone,
 cvFileName: cvFile ? cvFile.name : 'No CV attached',
 cvUrl: cvUrl,
 matchPercentage: matchPercentage,
 customQuestionAnswer: customQuestionAnswer,
 customQuestionAnswers: answers,
 mcqAnswers: mcqResults,
 cvText: extractedCvText,
 skills: extractedInfo.skills || [],
 education: extractedInfo.education || '',
 location: extractedInfo.location || ''
});

 setIsSuccess(true);
 setTimeout(() => {
 navigate(`/careers/${companyId}`);
}, 3000);
} catch (error) {
 console.error("Error submitting application:", error);
 alert('Failed to submit application. Please try again.');
} finally {
 setIsSubmitting(false);
}
};

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-slate-50">
 <div className="relative">
 <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
 <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600 animate-pulse"/>
 </div>
 </div>
 );
}

 if (!selectedJob) {
 return (
 <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
 <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
 <Briefcase className="w-10 h-10 text-slate-300"/>
 </div>
 <h2 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Job not found</h2>
 <Link to={`/careers/${companyId}`} className="text-indigo-600 font-bold hover:underline">Return to Career Page</Link>
 </div>
 );
}

 return (
 <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
 {/* Header */}
 <header className="flex items-center justify-between px-6 md:px-12 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50">
 <div className="flex items-center gap-4">
 <Link to={`/careers/${companyId}`} className="flex items-center gap-3">
 {company?.logo ? (
 <img src={company.logo} alt={company.name} className="h-8 w-auto object-contain"referrerPolicy="no-referrer"/>
 ) : (
 <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
 {company?.name?.charAt(0) || 'I'}
 </div>
 )}
 <h1 className="text-lg font-bold tracking-tight text-slate-800 hidden sm:block">{company?.name || 'Info Resume Edge'}</h1>
 </Link>
 </div>
 <button 
 onClick={() => {
 const website = company?.website;
 if (website) {
 window.open(website.startsWith('http') ? website :`https://${website}`, '_blank');
} else {
 alert('Company website not available');
}
}}
 className="group flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:border-indigo-600 hover:text-indigo-600 transition-all duration-300 shadow-sm"
 >
 <span>Company website</span>
 <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"/>
 </button>
 </header>

 <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
 {/* Success Overlay */}
 <AnimatePresence>
 {isSuccess && (
 <motion.div 
 initial={{ opacity: 0}}
 animate={{ opacity: 1}}
 className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-xl"
 >
 <motion.div 
 initial={{ scale: 0.9, opacity: 0, y: 20}}
 animate={{ scale: 1, opacity: 1, y: 0}}
 className="text-center"
 >
 <div className="w-24 h-24 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100">
 <CheckCircle2 className="w-12 h-12 text-emerald-600"/>
 </div>
 <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Application Sent!</h2>
 <p className="text-slate-500 font-medium">Redirecting you back to the careers page...</p>
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Breadcrumb */}
 <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-12">
 <Link to={`/careers/${companyId}`} className="hover:text-indigo-600 transition-colors">Careers</Link>
 <ChevronRight className="w-3 h-3"/>
 <span className="text-slate-800">{selectedJob.title}</span>
 <ChevronRight className="w-3 h-3"/>
 <span className="text-indigo-600">Apply</span>
 </nav>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
 {/* Job Info Sidebar */}
 <div className="lg:col-span-4 space-y-8">
 <motion.div 
 initial={{ opacity: 0, x: -20}}
 animate={{ opacity: 1, x: 0}}
 className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
 >
 <div className="flex items-center gap-3 mb-6">
 <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
 {selectedJob.type}
 </span>
 <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-100">
 {selectedJob.workplace}
 </span>
 </div>
 <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight leading-tight">{selectedJob.title}</h2>
 
 <div className="space-y-6">
 <div className="flex items-start gap-4">
 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
 <MapPin className="w-5 h-5 text-indigo-600"/>
 </div>
 <div>
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
 <p className="text-sm font-bold text-slate-700">{selectedJob.location}</p>
 </div>
 </div>
 <div className="flex items-start gap-4">
 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
 <Clock className="w-5 h-5 text-emerald-600"/>
 </div>
 <div>
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</p>
 <p className="text-sm font-bold text-slate-700">{selectedJob.experience || 'Not specified'}</p>
 </div>
 </div>
 </div>
 </motion.div>

 <motion.div 
 initial={{ opacity: 0, x: -20}}
 animate={{ opacity: 1, x: 0}}
 transition={{ delay: 0.1}}
 className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200"
 >
 <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
 <Sparkles className="w-5 h-5 text-indigo-400"/>
 Job Overview
 </h3>
 <div className="prose prose-invert prose-sm max-w-none opacity-80">
 <p className="whitespace-pre-wrap leading-relaxed text-slate-300">
 {selectedJob.description ||"No description provided."}
 </p>
 </div>
 </motion.div>
 </div>

 {/* Application Form */}
 <div className="lg:col-span-8">
 <motion.div 
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 transition={{ delay: 0.2}}
 className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50"
 >
 <div className="mb-12">
 <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Apply Now</h2>
 <p className="text-slate-500 font-medium">Complete the form below to submit your application.</p>
 </div>

 <form className="space-y-10"onSubmit={handleSubmit}>
 {/* Personal Info */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="space-y-3">
 <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Full Name</label>
 <div className="relative group">
 <input 
 type="text"
 required 
 placeholder="John Doe"
 value={applicantName}
 onChange={(e) => setApplicantName(e.target.value)}
 className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
 />
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
 <User className="w-5 h-5"/>
 </div>
 </div>
 </div>
 <div className="space-y-3">
 <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Email Address</label>
 <div className="relative group">
 <input 
 type="email"
 required 
 placeholder="john@example.com"
 value={applicantEmail}
 onChange={(e) => setApplicantEmail(e.target.value)}
 className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
 />
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
 <Mail className="w-5 h-5"/>
 </div>
 </div>
 </div>
 </div>

 <div className="space-y-3">
 <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
 <div className="relative group">
 <input 
 type="tel"
 required 
 placeholder="+1 (555) 000-0000"
 value={applicantPhone}
 onChange={(e) => setApplicantPhone(e.target.value)}
 className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium"
 />
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
 <Phone className="w-5 h-5"/>
 </div>
 </div>
 </div>

 {/* File Upload */}
 <div className="space-y-3">
 <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Resume / CV</label>
 <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-300 transition-all cursor-pointer group">
 <div className="flex flex-col items-center justify-center pt-5 pb-6">
 <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
 <Upload className="w-6 h-6 text-indigo-600"/>
 </div>
 <p className="text-sm font-bold text-slate-700">
 {cvFile ? cvFile.name : 'Click to upload or drag and drop'}
 </p>
 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">PDF, DOC, DOCX (Max 5MB)</p>
 </div>
 <input 
 type="file"
 className="hidden"
 accept=".pdf,.doc,.docx"
 required
 onChange={(e) => setCvFile(e.target.files?.[0] || null)}
 />
 </label>
 </div>

 {/* Custom Questions */}
 {(selectedJob.customQuestion || (selectedJob.enableCustomQuestions && selectedJob.customQuestions && selectedJob.customQuestions.length > 0)) && (
 <div className="space-y-8 pt-6 border-t border-slate-100">
 <h3 className="text-xl font-black text-slate-900 tracking-tight">Additional Questions</h3>
 
 {selectedJob.customQuestion && (
 <div className="space-y-3">
 <label className="block text-sm font-bold text-slate-700">{selectedJob.customQuestion}</label>
 <textarea 
 rows={4}
 required
 value={customQuestionAnswer}
 onChange={(e) => setCustomQuestionAnswer(e.target.value)}
 className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium resize-none"
 placeholder="Type your answer here..."
 ></textarea>
 </div>
 )}

 {selectedJob.enableCustomQuestions && selectedJob.customQuestions?.map((q) => (
 <div key={q.id} className="space-y-3">
 <label className="block text-sm font-bold text-slate-700">{q.question}</label>
 {q.type === 'boolean' ? (
 <div className="flex gap-4">
 {['Yes', 'No'].map(val => (
 <label key={val} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border cursor-pointer transition-all ${customQuestionAnswers[q.id] === val ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}`}>
 <input
 type="radio"
 name={`question-${q.id}`}
 value={val}
 required
 checked={customQuestionAnswers[q.id] === val}
 onChange={(e) => setCustomQuestionAnswers(prev => ({ ...prev, [q.id]: e.target.value}))}
 className="hidden"
 />
 <span className="text-sm font-bold">{val}</span>
 </label>
 ))}
 </div>
 ) : (
 <textarea
 rows={4}
 required
 value={customQuestionAnswers[q.id] || ''}
 onChange={(e) => setCustomQuestionAnswers(prev => ({ ...prev, [q.id]: e.target.value}))}
 className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-medium resize-none"
 placeholder="Type your answer here..."
 ></textarea>
 )}
 </div>
 ))}
 </div>
 )}

 {/* MCQ Assessment */}
 {selectedJob.testMcqs && selectedJob.testMcqs.length > 0 && (
 <div className="space-y-8 pt-6 border-t border-slate-100">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
 <Sparkles className="w-5 h-5 text-indigo-600"/>
 </div>
 <h3 className="text-xl font-black text-slate-900 tracking-tight">Assessment Test</h3>
 </div>
 {selectedJob.testMcqs.map((mcq, index) => (
 <div key={mcq.id} className="space-y-4">
 <label className="block text-sm font-bold text-slate-800">
 <span className="text-indigo-600 mr-2">Q{index + 1}.</span>
 {mcq.question}
 </label>
 <div className="grid grid-cols-1 gap-3">
 {mcq.options.map((option) => (
 <label key={option.id} className={`flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-all ${mcqAnswers[mcq.id] === option.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border-transparent text-slate-700 hover:bg-slate-100'}`}>
 <input
 type="radio"
 name={`mcq-${mcq.id}`}
 value={option.id}
 required
 checked={mcqAnswers[mcq.id] === option.id}
 onChange={(e) => setMcqAnswers(prev => ({ ...prev, [mcq.id]: e.target.value}))}
 className="hidden"
 />
 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${mcqAnswers[mcq.id] === option.id ? 'border-white' : 'border-slate-300'}`}>
 {mcqAnswers[mcq.id] === option.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
 </div>
 <span className="text-sm font-bold">{option.text}</span>
 </label>
 ))}
 </div>
 </div>
 ))}
 </div>
 )}

 <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
 <div className="flex items-center gap-3">
 <input type="checkbox"required className="w-5 h-5 text-indigo-600 rounded-lg border-slate-300 focus:ring-indigo-500/20"/>
 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">I agree to the terms & privacy policy</span>
 </div>
 <div className="flex items-center gap-4 w-full sm:w-auto">
 <button 
 type="button"
 onClick={() => navigate(-1)} 
 className="flex-1 sm:flex-none px-8 py-4 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-2xl transition-colors"
 >
 Cancel
 </button>
 <button 
 type="submit"
 disabled={isSubmitting}
 className={`flex-1 sm:flex-none px-12 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
 >
 {isSubmitting ? (
 <>
 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
 Sending...
 </>
 ) : (
 'Submit Application'
 )}
 </button>
 </div>
 </div>
 </form>
 </motion.div>
 </div>
 </div>
 </main>
 </div>
 );
}
