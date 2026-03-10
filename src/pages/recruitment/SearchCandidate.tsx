import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Search, Filter, X, Briefcase, MapPin, DollarSign, GraduationCap, Search as SearchIcon, FileText, Users, Mail, Download, ChevronRight } from 'lucide-react';
import { getCandidates, subscribeToCandidates, Candidate } from '../../utils/candidateStore';
import { useAuth } from '../../context/AuthContext';

interface CandidateSearchFilters {
  keyword: string;
  location: string;
  skills: string;
  minSalary: string;
  maxSalary: string;
  education: string;
  university: string;
  country: string;
  currentJobTitle: string;
  industry: string;
  gender: string;
  category: string;
}

export default function SearchCandidate() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<CandidateSearchFilters>({
    keyword: '',
    location: '',
    skills: '',
    minSalary: '',
    maxSalary: '',
    education: '',
    university: '',
    country: '',
    currentJobTitle: '',
    industry: '',
    gender: '',
    category: '',
  });

  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Candidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [fromEmail, setFromEmail] = useState('adamrecruiterz@gmail.com');
  const [toEmail, setToEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  useEffect(() => {
    // Load all candidates on mount
    const unsubscribe = subscribeToCandidates((apps) => {
      setAllCandidates(apps);
      // setSearchResults(apps); // Removed: Initially show all
    }, user?.companyId);

    return () => unsubscribe();
  }, [user?.companyId]);

  useEffect(() => {
    if (user?.email) {
      setFromEmail(user.email);
    }
  }, [user]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const handleSearch = () => {
    setHasSearched(true);
    let results = [...allCandidates];

    if (filters.keyword) {
      const keywordLower = filters.keyword.toLowerCase();
      results = results.filter(app => 
        app.candidateName.toLowerCase().includes(keywordLower) ||
        app.jobTitle.toLowerCase().includes(keywordLower) ||
        (app.cvText && app.cvText.toLowerCase().includes(keywordLower))
      );
    }

    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      results = results.filter(app => 
        app.location && app.location.toLowerCase().includes(locationLower)
      );
    }

    if (filters.skills) {
      const skillsArray = filters.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      if (skillsArray.length > 0) {
        results = results.filter(app => {
          if (!app.skills || app.skills.length === 0) return false;
          const appSkillsLower = app.skills.map(s => s.toLowerCase());
          // Check if candidate has AT LEAST ONE of the searched skills
          return skillsArray.some(skill => appSkillsLower.some(appSkill => appSkill.includes(skill)));
        });
      }
    }

    if (filters.education) {
      const educationLower = filters.education.toLowerCase();
      results = results.filter(app => 
        app.education && app.education.toLowerCase().includes(educationLower)
      );
    }

    if (filters.university) {
      const universityLower = filters.university.toLowerCase();
      results = results.filter(app => 
        app.university && app.university.toLowerCase().includes(universityLower)
      );
    }

    if (filters.country) {
      const countryLower = filters.country.toLowerCase();
      results = results.filter(app => 
        app.country && app.country.toLowerCase().includes(countryLower)
      );
    }

    if (filters.currentJobTitle) {
      const jobTitleLower = filters.currentJobTitle.toLowerCase();
      results = results.filter(app => 
        app.currentJobTitle && app.currentJobTitle.toLowerCase().includes(jobTitleLower)
      );
    }

    if (filters.industry) {
      const industryLower = filters.industry.toLowerCase();
      results = results.filter(app => 
        app.industry && app.industry.toLowerCase().includes(industryLower)
      );
    }

    if (filters.gender && filters.gender !== 'All') {
      results = results.filter(app => 
        app.gender === filters.gender
      );
    }

    if (filters.category) {
      const categoryLower = filters.category.toLowerCase();
      results = results.filter(app => 
        app.category && app.category.toLowerCase().includes(categoryLower)
      );
    }

    // Basic salary filtering (assuming expectedSalary is a string like "50k - 100k")
    if (filters.minSalary || filters.maxSalary) {
      const minSearch = parseInt(filters.minSalary) || 0;
      const maxSearch = parseInt(filters.maxSalary) || Infinity;

      results = results.filter(app => {
        if (!app.expectedSalary) return false;
        // Extract numbers from string
        const numbers = app.expectedSalary.match(/\d+/g);
        if (!numbers) return false;
        
        const minAppSalary = parseInt(numbers[0]) * (app.expectedSalary.toLowerCase().includes('k') ? 1000 : 1);
        const maxAppSalary = numbers.length > 1 ? parseInt(numbers[1]) * (app.expectedSalary.toLowerCase().includes('k') ? 1000 : 1) : minAppSalary;

        // Check if ranges overlap
        return minAppSalary <= maxSearch && maxAppSalary >= minSearch;
      });
    }

    setSearchResults(results);
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      location: '',
      skills: '',
      minSalary: '',
      maxSalary: '',
      education: '',
      university: '',
      country: '',
      currentJobTitle: '',
      industry: '',
      gender: '',
      category: '',
    });
    setSearchResults([]); // Changed: Clear results
    setHasSearched(false);
  };

  const openModal = (app: Candidate) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedApp(null);
    setIsModalOpen(false);
  };

  const openEmailModal = () => {
    if (selectedApp) {
      // Try to extract email from CV text if not present or if it's a placeholder
      let targetEmail = selectedApp.email;
      const isPlaceholder = targetEmail?.includes('@example.com') || targetEmail?.includes('placeholder.com');
      
      if ((!targetEmail || isPlaceholder) && selectedApp.cvText) {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const matches = selectedApp.cvText.match(emailRegex);
        if (matches && matches.length > 0) {
          // Filter out common false positives if any, or just take the first one
          targetEmail = matches[0];
        }
      }
      
      setToEmail(targetEmail || '');
      setEmailSubject(`Regarding your application for ${selectedApp.jobTitle}`);
      setEmailBody(`Dear ${selectedApp.candidateName},\n\nThank you for your application for the ${selectedApp.jobTitle} position.\n\nBest regards,\nHR Team`);
      setIsEmailModalOpen(true);
    }
  };

  const closeEmailModal = () => {
    setIsEmailModalOpen(false);
    setEmailSubject('');
    setEmailBody('');
  };

  const handleSendEmail = () => {
    // In a real application, this would send an email via an API
    alert(`Email sent from ${fromEmail} to ${toEmail} with subject: ${emailSubject}`);
    closeEmailModal();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <SearchIcon className="w-6 h-6 text-slate-500" />
              <h2 className="text-xl font-semibold text-slate-800">Search Candidates</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
              <button
                onClick={handleSearch}
                className="flex items-center gap-2 bg-[#1976d2] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#1565c0] transition-colors"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Keyword Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keyword</label>
              <div className="relative">
                <input
                  type="text"
                  name="keyword"
                  value={filters.keyword}
                  onChange={handleFilterChange}
                  placeholder="Name, Job Title, or CV text"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none transition-colors"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Location Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <div className="relative">
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Enter location"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none transition-colors"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Skills Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Skills</label>
              <div className="relative">
                <input
                  type="text"
                  name="skills"
                  value={filters.skills}
                  onChange={handleFilterChange}
                  placeholder="Enter skills (comma-separated)"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none transition-colors"
                />
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Salary Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Salary Range</label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    name="minSalary"
                    value={filters.minSalary}
                    onChange={handleFilterChange}
                    placeholder="Min Salary"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none transition-colors"
                  />
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <span className="text-slate-500">-</span>
                <div className="relative flex-1">
                  <input
                    type="number"
                    name="maxSalary"
                    value={filters.maxSalary}
                    onChange={handleFilterChange}
                    placeholder="Max Salary"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none transition-colors"
                  />
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Education Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Education</label>
              <div className="relative">
                <input
                  type="text"
                  name="education"
                  value={filters.education}
                  onChange={handleFilterChange}
                  placeholder="Enter education level"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none transition-colors"
                />
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* University Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">University</label>
              <div className="relative">
                <input
                  type="text"
                  name="university"
                  value={filters.university}
                  onChange={handleFilterChange}
                  placeholder="Enter university name"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none transition-colors"
                />
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Country Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
              <div className="relative">
                <input
                  type="text"
                  name="country"
                  value={filters.country}
                  onChange={handleFilterChange}
                  placeholder="Enter country"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none transition-colors"
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Current Job Title Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current Job Title</label>
              <div className="relative">
                <input
                  type="text"
                  name="currentJobTitle"
                  value={filters.currentJobTitle}
                  onChange={handleFilterChange}
                  placeholder="Enter current job title"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none transition-colors"
                />
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Industry Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
              <div className="relative">
                <input
                  type="text"
                  name="industry"
                  value={filters.industry}
                  onChange={handleFilterChange}
                  placeholder="Enter industry"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none transition-colors"
                />
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Gender Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select
                name="gender"
                value={filters.gender}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none transition-colors"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Category Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <div className="relative">
                <input
                  type="text"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  placeholder="Enter category"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none transition-colors"
                />
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">
              {hasSearched ? `Search Results (${searchResults.length})` : `All Candidates (${allCandidates.length})`}
            </h3>
          </div>

          {searchResults.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <SearchIcon className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-600">No candidates found</p>
              <p className="text-sm mt-1">Try adjusting your search filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {searchResults.map(app => (
                <div key={app.id} className="border border-slate-200 rounded-lg p-5 hover:border-[#1976d2] hover:shadow-md transition-all group bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-[#1976d2] flex items-center justify-center text-lg font-bold shrink-0">
                        {app.candidateName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-800 group-hover:text-[#1976d2] transition-colors">{app.candidateName}</h4>
                        <p className="text-sm text-slate-500">{app.jobTitle}</p>
                      </div>
                    </div>
                    {app.matchPercentage && (
                      <div className={`text-xs font-bold px-2 py-1 rounded-full ${
                        app.matchPercentage >= 80 ? 'bg-green-100 text-green-700' :
                        app.matchPercentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {app.matchPercentage}% Match
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{app.location || 'Location not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{app.education || 'Education not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{app.expectedSalary || 'Salary not specified'}</span>
                    </div>
                    {app.industry && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{app.industry}</span>
                      </div>
                    )}
                    {app.category && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{app.category}</span>
                      </div>
                    )}
                    {app.gender && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{app.gender}</span>
                      </div>
                    )}
                  </div>

                  {app.skills && app.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {app.skills.slice(0, 4).map((skill, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded font-medium border border-slate-200">
                            {skill}
                          </span>
                        ))}
                        {app.skills.length > 4 && (
                          <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded font-medium border border-slate-200">
                            +{app.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <FileText className="w-4 h-4" />
                      <span className="truncate max-w-[150px]">{app.cvFileName}</span>
                    </div>
                    <span className="text-xs font-medium text-[#1976d2] bg-blue-50 px-2 py-1 rounded">
                      {app.stage}
                    </span>
                  </div>
                  <button
                    onClick={() => openModal(app)}
                    className="w-full mt-4 py-2 bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    Preview Profile
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* CV Modal */}
      {isModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold">
                  {selectedApp.candidateName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{selectedApp.candidateName}</h3>
                  <p className="text-xs text-slate-500">{selectedApp.email} • {selectedApp.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={openEmailModal}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#1976d2] text-white rounded text-sm font-medium hover:bg-[#1565c0] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email Candidate
                </button>
                <button 
                  onClick={async () => {
                    if (selectedApp.cvUrl) {
                      try {
                        const response = await fetch(selectedApp.cvUrl);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = selectedApp.cvFileName || 'candidate-cv';
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Download failed:', error);
                        window.open(selectedApp.cvUrl, '_blank');
                      }
                    } else {
                      alert(`CV file not available for download.`);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download CV
                </button>
                <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full ml-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden flex">
              {/* CV Preview Area */}
              <div className="flex-1 bg-slate-200 p-6 overflow-y-auto flex items-center justify-center relative">
                {selectedApp.cvUrl ? (
                  <iframe
                    src={selectedApp.cvFileName.toLowerCase().endsWith('.pdf') ? selectedApp.cvUrl : `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(selectedApp.cvUrl)}`}
                    className="w-full h-full min-h-[800px] bg-white shadow-sm border border-slate-300"
                    title="CV Preview"
                  />
                ) : (
                  <div className="bg-white w-full max-w-2xl min-h-[800px] shadow-sm p-12 flex flex-col items-center justify-center text-slate-400 border border-slate-300">
                    <FileText className="w-16 h-16 mb-4 text-slate-300" />
                    <p className="text-lg font-medium text-slate-500">CV Preview</p>
                    <p className="text-sm mt-2">{selectedApp.cvFileName}</p>
                    <p className="text-xs mt-4 max-w-md text-center">
                      CV file is not available for preview.
                    </p>
                    {selectedApp.cvText && (
                      <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600 text-left w-full max-w-lg">
                        <h5 className="font-semibold mb-2">Extracted Content (Mock):</h5>
                        <p>{selectedApp.cvText}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {isEmailModalOpen && selectedApp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-[#1976d2] text-white">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5" />
                New Email
              </h3>
              <button onClick={closeEmailModal} className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">From</label>
                <input 
                  type="email" 
                  value={fromEmail} 
                  onChange={(e) => setFromEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To</label>
                <input 
                  type="email" 
                  value={toEmail} 
                  onChange={(e) => setToEmail(e.target.value)}
                  placeholder="Recipient Email"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job</label>
                <input type="text" value={selectedApp.jobTitle} disabled className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input 
                  type="text" 
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none text-sm" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea 
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none text-sm resize-none" 
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button 
                onClick={closeEmailModal}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendEmail}
                className="px-4 py-2 bg-[#1976d2] text-white rounded-md text-sm font-medium hover:bg-[#1565c0] transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
