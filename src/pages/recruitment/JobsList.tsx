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
      <div className="bg-[#2A2A3D] rounded-2xl border border-white/5 shadow-[0_4px_20px_rgba(0,255,204,0.05)] overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#1E1E2F]/50 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Active</h2>
            <span className="bg-[#00FFCC] text-[#1E1E2F] text-xs px-2 py-0.5 rounded-full font-black">{jobs.filter(j => j.status === 'Active').length}</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/recruitment/job-posting')}
              className="flex items-center gap-2 bg-[#00FFCC] text-[#1E1E2F] px-4 py-2 rounded-lg text-sm font-black uppercase hover:bg-[#00D1FF] transition-colors shadow-[0_0_8px_rgba(0,255,204,0.4)]"
            >
              <Plus className="w-4 h-4" />
              Create Job
            </button>
            <button className="flex items-center gap-2 border border-white/10 text-[#00FFCC] px-4 py-2 rounded-lg text-sm font-black uppercase hover:bg-[#00FFCC] hover:text-[#1E1E2F] transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-[#B0B0C3]">
            <thead className="text-xs text-[#B0B0C3] uppercase bg-[#1E1E2F]/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-3 font-black">Position Name</th>
                <th className="px-6 py-3 font-black">Job Location</th>
                <th className="px-6 py-3 font-black">Salary</th>
                <th className="px-6 py-3 font-black">Job Created Date</th>
                <th className="px-6 py-3 font-black">Job Status</th>
                <th className="px-6 py-3 font-black">Candidates</th>
                <th className="px-6 py-3 font-black">Job Department</th>
                <th className="px-6 py-3 font-black">Headcount</th>
                <th className="px-6 py-3 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-[#B0B0C3]">
                    No jobs found. Click "Create Job" to start.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="border-b border-white/5 hover:bg-[#1E1E2F]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-white/10 bg-[#1E1E2F] text-[#00FFCC] focus:ring-[#00FFCC]" />
                        <button 
                          onClick={() => navigate(`/recruitment/jobs/${job.id}/candidates`)}
                          className="text-[#00FFCC] hover:underline font-black flex items-center gap-2"
                        >
                          {job.title}
                          {job.newCandidates > 0 && (
                            <span className="bg-red-500/10 text-red-500 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                              {job.newCandidates} New
                            </span>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">{job.location}</td>
                    <td className="px-6 py-4 text-white">{job.salary}</td>
                    <td className="px-6 py-4 text-white">{job.createdDate}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 font-black ${job.status === 'Active' ? 'text-[#00FFCC]' : 'text-[#B0B0C3]'}`}>
                        <span className={`w-2 h-2 rounded-full ${job.status === 'Active' ? 'bg-[#00FFCC]' : 'bg-[#B0B0C3]'}`}></span>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#B0B0C3]" />
                        <span className="font-black text-white">{job.totalCandidates}</span>
                        {job.newCandidates > 0 && (
                          <span className="bg-[#00FFCC]/10 text-[#00FFCC] text-[10px] px-2 py-0.5 rounded-full font-black">
                            +{job.newCandidates}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#00FFCC]/10 text-[#00FFCC] flex items-center justify-center text-xs font-black">
                          {job.department.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-white">{job.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">{job.headcount}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            const fullJob = originalJobs.find(j => j.id === job.id);
                            if (fullJob) {
                              navigate('/recruitment/job-posting', { state: { job: fullJob } });
                            }
                          }}
                          className="p-1.5 text-[#B0B0C3] hover:text-[#00FFCC] transition-colors"
                          title="Edit Job"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {job.status === 'Active' && (
                          <a 
                            href={`/careers/${user?.companyId || 'default'}?jobId=${job.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#B0B0C3] hover:text-[#00FFCC] transition-colors"
                            title="View on Career Page"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                        <button 
                          onClick={() => navigate(`/recruitment/jobs/${job.id}/candidates`)}
                          className="p-1.5 text-[#B0B0C3] hover:text-[#00FFCC] transition-colors"
                          title="View Candidates"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-[#B0B0C3] hover:text-white transition-colors">
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
