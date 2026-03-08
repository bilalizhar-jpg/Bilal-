import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, MoreVertical, Eye, Users, Edit } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { subscribeToApplications, Application } from '../../utils/applicationStore';
import { subscribeToJobs, Job as StoreJob } from '../../utils/jobStore';
import { useAuth } from '../../context/AuthContext';

interface JobSummary {
  id: string;
  title: string;
  location: string;
  salary: string;
  createdDate: string;
  status: string;
  department: string;
  headcount: string;
  newCandidates: number;
  totalCandidates: number;
}

export default function JobsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [originalJobs, setOriginalJobs] = useState<StoreJob[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (!user?.companyId) return;

    const unsubscribeJobs = subscribeToJobs((storedJobs) => {
      setOriginalJobs(storedJobs);
      const unsubscribeApps = subscribeToApplications((allApps) => {
        const mappedJobs: JobSummary[] = storedJobs.map((job: StoreJob) => {
          const jobApps = allApps.filter(app => app.jobId === job.id);
          return {
            id: job.id,
            title: job.title,
            location: job.location,
            salary: job.salary,
            createdDate: new Date(job.createdAt).toLocaleDateString(),
            status: job.status === 'published' ? 'Active' : 'Draft',
            department: 'General',
            headcount: '1',
            totalCandidates: jobApps.length,
            newCandidates: jobApps.filter(app => app.stage === 'New Candidates').length
          };
        });
        setJobs(mappedJobs);
      }, user.companyId);

      return () => unsubscribeApps();
    }, user.companyId);

    return () => unsubscribeJobs();
  }, [user?.companyId]);

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-lg">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800">Active</h2>
            <span className="bg-[#1976d2] text-white text-xs px-2 py-0.5 rounded-full">{jobs.filter(j => j.status === 'Active').length}</span>
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
                <th className="px-6 py-3 font-medium">Salary</th>
                <th className="px-6 py-3 font-medium">Job Created Date</th>
                <th className="px-6 py-3 font-medium">Job Status</th>
                <th className="px-6 py-3 font-medium">Candidates</th>
                <th className="px-6 py-3 font-medium">Job Department</th>
                <th className="px-6 py-3 font-medium">Headcount</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                    No jobs found. Click "Create Job" to start.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
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
                    <td className="px-6 py-4">{job.salary}</td>
                    <td className="px-6 py-4">{job.createdDate}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 font-medium ${job.status === 'Active' ? 'text-emerald-600' : 'text-slate-500'}`}>
                        <span className={`w-2 h-2 rounded-full ${job.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-700">{job.totalCandidates}</span>
                        {job.newCandidates > 0 && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            +{job.newCandidates}
                          </span>
                        )}
                      </div>
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
                          onClick={() => {
                            const fullJob = originalJobs.find(j => j.id === job.id);
                            if (fullJob) {
                              navigate('/recruitment/job-posting', { state: { job: fullJob } });
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                          title="Edit Job"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {job.status === 'Active' && (
                          <a 
                            href={`/careers/${user?.companyId || 'default'}?jobId=${job.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                            title="View on Career Page"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                        <button 
                          onClick={() => navigate(`/recruitment/jobs/${job.id}/candidates`)}
                          className="p-1.5 text-slate-400 hover:text-[#1976d2] transition-colors"
                          title="View Candidates"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
