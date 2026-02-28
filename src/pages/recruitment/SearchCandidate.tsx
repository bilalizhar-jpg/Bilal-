import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Search, Filter, X, Briefcase, MapPin, DollarSign, GraduationCap, Search as SearchIcon, FileText } from 'lucide-react';
import { getApplications, Application } from '../../utils/applicationStore';

interface CandidateSearchFilters {
  keyword: string;
  location: string;
  skills: string;
  minSalary: string;
  maxSalary: string;
  education: string;
}

export default function SearchCandidate() {
  const [filters, setFilters] = useState<CandidateSearchFilters>({
    keyword: '',
    location: '',
    skills: '',
    minSalary: '',
    maxSalary: '',
    education: '',
  });

  const [allCandidates, setAllCandidates] = useState<Application[]>([]);
  const [searchResults, setSearchResults] = useState<Application[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // Load all applications on mount
    const apps = getApplications();
    setAllCandidates(apps);
    setSearchResults(apps); // Initially show all
  }, []);

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
    });
    setSearchResults(allCandidates);
    setHasSearched(false);
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
