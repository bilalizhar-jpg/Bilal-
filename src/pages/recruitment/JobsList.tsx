import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, MoreVertical, Eye } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { getApplications } from '../../utils/applicationStore';

interface JobSummary {
  id: string;
  title: string;
  location: string;
  minSalary: string;
  maxSalary: string;
  createdDate: string;
  status: string;
  department: string;
  headcount: string;
  newCandidates: number;
}

const MOCK_JOBS: JobSummary[] = [
  { id: '1', title: 'Nurse', location: 'Dubai, United Arab Emirates', minSalary: '1,300 USD', maxSalary: '2,000 USD', createdDate: '2026-01-29', status: 'Active', department: 'Nursing', headcount: '12 - 1', newCandidates: 0 },
  { id: '2', title: 'Sales Executive – Consumer Banking Product Sales', location: 'Dubai, United Arab Emirates', minSalary: '143,000 USD', maxSalary: '172,000 USD', createdDate: '2026-01-22', status: 'Active', department: 'Sales', headcount: '28 - 1', newCandidates: 0 },
  { id: '3', title: 'Registered Nurse (RN)', location: 'Dubai, United Arab Emirates', minSalary: '20 GBP', maxSalary: 'Negotiable', createdDate: '2026-01-28', status: 'Active', department: 'Nursing', headcount: '2 - 1', newCandidates: 0 },
  { id: '4', title: 'Call Centre Executive', location: 'Dubai, United Arab Emirates', minSalary: '40 USD', maxSalary: '45 USD', createdDate: '2025-12-27', status: 'Active', department: 'Administration', headcount: '6 - 1', newCandidates: 0 },
  { id: '5', title: 'Real Estate Consultants', location: 'Dubai, United Arab Emirates', minSalary: '45 USD', maxSalary: '47 USD', createdDate: '2025-12-23', status: 'Active', department: 'Sales', headcount: '164 - 1', newCandidates: 0 },
  { id: '6', title: 'Assistant Manager – CRM (Customer relationship)', location: 'Dubai, United Arab Emirates', minSalary: '50 USD', maxSalary: '55 USD', createdDate: '2025-12-23', status: 'Active', department: 'Human Resource', headcount: '133 - 1', newCandidates: 0 },
];

export default function JobsList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobSummary[]>(MOCK_JOBS);

  useEffect(() => {
    const applications = getApplications();
    const updatedJobs = MOCK_JOBS.map(job => {
      const jobApps = applications.filter(app => app.jobId === job.id);
      return { ...job, newCandidates: jobApps.length };
    });
    setJobs(updatedJobs);
  }, []);

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-lg">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800">Active</h2>
            <span className="bg-[#1976d2] text-white text-xs px-2 py-0.5 rounded-full">6</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/recruitment/job-posting')}
              className="flex items-center gap-2 bg-[#1976d2] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#1565c0] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Job
            </button>
            <button className="flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Position Name</th>
                <th className="px-6 py-3 font-medium">Job Location</th>
                <th className="px-6 py-3 font-medium">Minimum Salary</th>
                <th className="px-6 py-3 font-medium">Maximum Salary</th>
                <th className="px-6 py-3 font-medium">Job Created Date</th>
                <th className="px-6 py-3 font-medium">Job Status</th>
                <th className="px-6 py-3 font-medium">Job Department</th>
                <th className="px-6 py-3 font-medium">Headcount</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-slate-300 text-[#1976d2] focus:ring-[#1976d2]" />
                      <button 
                        onClick={() => navigate(`/recruitment/jobs/${job.id}/candidates`)}
                        className="text-[#1976d2] hover:underline font-medium flex items-center gap-2"
                      >
                        {job.title}
                        {job.newCandidates > 0 && (
                          <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            {job.newCandidates} New
                          </span>
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">{job.location}</td>
                  <td className="px-6 py-4">{job.minSalary}</td>
                  <td className="px-6 py-4">{job.maxSalary}</td>
                  <td className="px-6 py-4">{job.createdDate}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                        {job.department.substring(0, 2).toUpperCase()}
                      </div>
                      {job.department}
                    </div>
                  </td>
                  <td className="px-6 py-4">{job.headcount}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => navigate(`/recruitment/jobs/${job.id}/candidates`)}
                        className="p-1.5 text-slate-400 hover:text-[#1976d2] transition-colors"
                        title="View Candidates"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
