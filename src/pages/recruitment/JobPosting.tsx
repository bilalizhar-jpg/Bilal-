import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { Save, Plus, Trash2, MapPin } from 'lucide-react';

export default function JobPosting() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [jobTitle, setJobTitle] = useState('');
  const [locations, setLocations] = useState({
    remote: false,
    onsite: false,
    fullTime: false,
    partTime: false,
    hybrid: false
  });
  const [salary, setSalary] = useState('');
  const [isSalaryVisible, setIsSalaryVisible] = useState(true);
  const [description, setDescription] = useState('');

  const handleLocationChange = (key: keyof typeof locations) => {
    setLocations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to a database
    const newJob = {
      title: jobTitle,
      locations,
      salary: isSalaryVisible ? salary : 'Hidden',
      description
    };
    console.log('Publishing job:', newJob);
    alert('Job published successfully to the Career Page!');
    
    // Reset form
    setJobTitle('');
    setLocations({ remote: false, onsite: false, fullTime: false, partTime: false, hybrid: false });
    setSalary('');
    setIsSalaryVisible(true);
    setDescription('');
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Post a New Job
          </h1>
        </div>

        <form onSubmit={handleSubmit} className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl overflow-hidden`}>
          <div className={`p-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <h2 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Job Details</h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Fill out the details below to publish a new job opening on your career page.
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Job Title */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Job Title *
              </label>
              <input 
                type="text" 
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Location & Type */}
            <div className="space-y-3">
              <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Location & Employment Type *
              </label>
              <div className="flex flex-wrap gap-4">
                {[
                  { id: 'remote', label: 'Remote' },
                  { id: 'onsite', label: 'On-site' },
                  { id: 'hybrid', label: 'Hybrid' },
                  { id: 'fullTime', label: 'Full-time' },
                  { id: 'partTime', label: 'Part-time' },
                ].map((type) => (
                  <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={locations[type.id as keyof typeof locations]}
                      onChange={() => handleLocationChange(type.id as keyof typeof locations)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Salary */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Salary Range
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Visible on Career Page
                  </span>
                  <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isSalaryVisible ? 'bg-indigo-600' : isDark ? 'bg-slate-700' : 'bg-slate-300'}`}>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSalaryVisible}
                      onChange={() => setIsSalaryVisible(!isSalaryVisible)}
                    />
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${isSalaryVisible ? 'translate-x-4' : 'translate-x-1'}`} />
                  </div>
                </label>
              </div>
              <input 
                type="text" 
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. $80,000 - $100,000 / year"
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Job Description *
              </label>
              <textarea 
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                placeholder="Describe the role, responsibilities, requirements, and benefits..."
                className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none ${
                  isDark 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          </div>

          <div className={`p-6 border-t ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50'} flex justify-end gap-3`}>
            <button 
              type="button"
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isDark 
                  ? 'text-slate-300 hover:bg-slate-800' 
                  : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              Save as Draft
            </button>
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Publish Job
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
