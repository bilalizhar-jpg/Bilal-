import React, { useState } from 'react';
import { Search, MapPin, ChevronDown, X, Upload, ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { saveApplication } from '../utils/applicationStore';

interface Job {
  id: string;
  title: string;
  location: string;
  type: string;
  workplace: string;
}

export const JOBS: Job[] = [
  { id: '1', title: 'Nurse', location: 'Dubai, United Arab Emirates', type: 'Full-Time', workplace: 'On-Site' },
  { id: '2', title: 'Sales Executive – Consumer Banking Product Sales', location: 'Dubai, United Arab Emirates', type: 'Full-Time', workplace: 'On-Site' },
  { id: '3', title: 'Registered Nurse (RN)', location: 'Dubai, United Arab Emirates', type: 'Full-Time', workplace: 'On-Site' },
  { id: '4', title: 'Call Centre Executive', location: 'Dubai, United Arab Emirates', type: 'Full-Time', workplace: 'On-Site' },
  { id: '5', title: 'Real Estate Consultants', location: 'Dubai, United Arab Emirates', type: 'Full-Time', workplace: 'On-Site' },
  { id: '6', title: 'Assistant Manager – CRM (Customer relationship)', location: 'Dubai, United Arab Emirates', type: 'Full-Time', workplace: 'On-Site' },
];

export default function CareerPage() {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Form state
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [cvFile, setCvFile] = useState<File | null>(null);

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setIsApplying(true);
    // Reset form
    setApplicantName('');
    setApplicantEmail('');
    setApplicantPhone('');
    setCvFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    saveApplication({
      jobId: selectedJob.id,
      jobTitle: selectedJob.title,
      candidateName: applicantName,
      email: applicantEmail,
      phone: applicantPhone,
      cvFileName: cvFile ? cvFile.name : 'No CV attached',
    });

    alert('Application submitted successfully!');
    setIsApplying(false);
  };

  if (isApplying && selectedJob) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800">Info Resume Edge</h1>
          <button className="bg-[#1976d2] hover:bg-[#1565c0] text-white px-4 py-2 rounded text-sm font-medium transition-colors">
            Company website
          </button>
        </header>

        <main className="max-w-4xl mx-auto px-8 py-12">
          {/* Job Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">{selectedJob.title}</h2>
            <div className="flex flex-col gap-2 text-slate-600 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {selectedJob.location}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-slate-400 rounded-sm flex items-center justify-center text-[10px]">FT</div>
                {selectedJob.type}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-slate-400 rounded-sm flex items-center justify-center text-[10px]">OS</div>
                {selectedJob.workplace}
              </div>
            </div>
          </div>

          {/* Breadcrumb & Return */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <button onClick={() => setIsApplying(false)} className="hover:text-[#1976d2] transition-colors">
                <Home className="w-4 h-4" />
              </button>
              <ChevronRight className="w-4 h-4" />
              <span>Job Openings</span>
              <ChevronRight className="w-4 h-4" />
              <span>{selectedJob.title}</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-800 font-medium">Apply</span>
            </div>
            <button 
              onClick={() => setIsApplying(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return
            </button>
          </div>

          {/* Application Form */}
          <form className="space-y-6 bg-white p-8 rounded-xl border border-slate-200 shadow-sm" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">What is your full name?</label>
              <input 
                type="text" 
                required 
                placeholder="Your full name" 
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full px-4 py-2.5 rounded border border-slate-300 focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Resume</label>
              <div className="flex items-center border border-slate-300 rounded overflow-hidden focus-within:border-[#1976d2] focus-within:ring-1 focus-within:ring-[#1976d2] transition-all">
                <div className="flex-1 px-4 py-2.5 text-slate-500 text-sm bg-white">
                  {cvFile ? cvFile.name : 'Select the attachment'}
                </div>
                <label className="px-6 py-2.5 bg-slate-50 border-l border-slate-300 text-slate-700 text-sm font-medium cursor-pointer hover:bg-slate-100 transition-colors">
                  Browse
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx" 
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Add cover letter</label>
              <textarea rows={4} className="w-full px-4 py-3 rounded border border-slate-300 focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none transition-all resize-none"></textarea>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">What is your phone number?</label>
              <div className="flex border border-slate-300 rounded focus-within:border-[#1976d2] focus-within:ring-1 focus-within:ring-[#1976d2] transition-all overflow-hidden">
                <div className="px-3 py-2.5 bg-slate-50 border-r border-slate-300 flex items-center gap-2 cursor-pointer">
                  <span className="text-lg">🇬🇧</span>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </div>
                <input 
                  type="tel" 
                  placeholder="Enter a phone number" 
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="flex-1 px-4 py-2.5 outline-none" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">What is your email address?</label>
              <div className="relative">
                <input 
                  type="email" 
                  required 
                  value={applicantEmail}
                  onChange={(e) => setApplicantEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full pl-10 pr-4 py-2.5 rounded border border-slate-300 focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none transition-all" 
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-medium text-slate-700">Privacy settings</h3>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" required className="mt-1 w-4 h-4 text-[#1976d2] rounded border-slate-300 focus:ring-[#1976d2]" />
                <span className="text-sm text-slate-600">
                  I agree to the <a href="#" className="text-[#1976d2] hover:underline">terms and conditions</a> & <a href="#" className="text-[#1976d2] hover:underline">privacy policy</a>
                </span>
              </label>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button type="submit" className="px-6 py-2.5 bg-slate-200 text-slate-500 rounded text-sm font-medium hover:bg-slate-300 transition-colors">
                Apply now
              </button>
              <button type="button" onClick={() => setIsApplying(false)} className="px-6 py-2.5 text-slate-600 rounded text-sm font-medium hover:bg-slate-100 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Info Resume Edge</h1>
        <button className="bg-[#1976d2] hover:bg-[#1565c0] text-white px-4 py-2 rounded text-sm font-medium transition-colors">
          Company website
        </button>
      </header>

      {/* Hero Section */}
      <div className="relative h-[400px] w-full bg-slate-100 overflow-hidden">
        {/* Background Image Placeholder */}
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2000" 
          alt="Team working" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Search Bar */}
      <div className="max-w-6xl mx-auto px-8 -mt-8 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-2 flex gap-4">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search by keyword" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-4 pr-4 py-3 text-sm border border-slate-200 rounded outline-none focus:border-[#1976d2] transition-colors"
            />
          </div>
          <div className="flex-1 relative">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Select location" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-4 pr-10 py-3 text-sm border border-slate-200 rounded outline-none focus:border-[#1976d2] transition-colors cursor-pointer"
                readOnly
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <button className="bg-[#1976d2] hover:bg-[#1565c0] text-white px-8 py-3 rounded text-sm font-medium flex items-center gap-2 transition-colors">
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-8 py-16">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">Come work with us</h2>
        
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Jobs at Info Resume Edge</h3>
          <p className="text-slate-500 text-sm">{JOBS.length} Open Positions</p>
        </div>

        <div className="space-y-0">
          {JOBS.map((job, index) => (
            <div key={job.id} className={`py-6 flex items-center justify-between ${index !== JOBS.length - 1 ? 'border-b border-slate-100' : ''}`}>
              <div>
                <h4 className="text-[#1976d2] text-lg font-medium mb-2 hover:underline cursor-pointer">
                  {job.title}
                </h4>
                <div className="flex items-center text-slate-500 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  {job.location}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-6 py-2 border border-slate-200 rounded text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                  Refer
                </button>
                <button 
                  onClick={() => handleApply(job)}
                  className="px-6 py-2 bg-[#1976d2] hover:bg-[#1565c0] text-white rounded text-sm font-medium transition-colors"
                >
                  Apply now
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
