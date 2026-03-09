import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Download, MoreVertical, X, ChevronRight, FileText, Eye } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { subscribeToApplications, updateApplicationStage, Application } from '../../utils/applicationStore';
import { subscribeToJobs, Job as StoreJob } from '../../utils/jobStore';

const STAGES = [
  'New Candidates',
  'Interested',
  'Shortlisted',
  'Client Submission',
  'Client Interview',
  'Offered',
  'Hired',
  'Dropped'
] as const;

export default function JobCandidates() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [job, setJob] = useState<StoreJob | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [fromEmail, setFromEmail] = useState('adamrecruiterz@gmail.com');
  const [toEmail, setToEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  useEffect(() => {
    if (user?.email) {
      setFromEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.companyId || !jobId) return;

    const unsubscribeJobs = subscribeToJobs((storedJobs) => {
      const currentJob = storedJobs.find(j => j.id === jobId);
      if (currentJob) setJob(currentJob);
    }, user.companyId);

    const unsubscribeApps = subscribeToApplications((allApps) => {
      setApplications(allApps.filter(app => app.jobId === jobId));
    }, user.companyId);

    return () => {
      unsubscribeJobs();
      unsubscribeApps();
    };
  }, [jobId, user?.companyId]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('appId', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, stage: Application['stage']) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('appId');
    await updateApplicationStage(appId, stage);
  };

  const openModal = (app: Application) => {
    setSelectedApp(app);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedApp(null);
    setIsModalOpen(false);
  };

  const handleMoveStage = async (stage: Application['stage']) => {
    if (selectedApp) {
      await updateApplicationStage(selectedApp.id, stage);
      closeModal();
    }
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
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-[calc(100vh-12rem)] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-lg shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/recruitment/jobs-list')}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold">
              HD
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                {job?.title || applications[0]?.jobTitle || 'Job Position'}
                <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${job?.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                  {job?.status || 'Draft'}
                </span>
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {job?.department || 'General'}</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-200 flex items-center justify-center text-[8px]">📍</span> {job?.location || 'Remote'}</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-200 flex items-center justify-center text-[8px]">$</span> {job?.salary || 'Not specified'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href={`/careers/${user?.companyId || 'default'}?jobId=${jobId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View on Career Page
            </a>
            <div className="flex bg-white border border-slate-200 rounded-md overflow-hidden text-sm">
              <div className="px-3 py-1.5 border-r border-slate-200 text-emerald-600 font-medium bg-emerald-50">
                Hired <span className="ml-1 text-emerald-800">0</span>
              </div>
              <div className="px-3 py-1.5 border-r border-slate-200 text-[#1976d2] font-medium bg-blue-50">
                In pipeline <span className="ml-1 text-blue-800">{applications.length}</span>
              </div>
              <div className="px-3 py-1.5 text-slate-500 font-medium bg-slate-50">
                Dropped <span className="ml-1 text-slate-700">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto p-4 bg-slate-50">
          <div className="flex gap-4 h-full min-w-max">
            {STAGES.map(stage => {
              const stageApps = applications.filter(app => app.stage === stage);
              return (
                <div 
                  key={stage} 
                  className="w-72 flex flex-col bg-slate-100/50 rounded-lg border border-slate-200"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage)}
                >
                  <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white rounded-t-lg">
                    <h3 className="text-sm font-semibold text-slate-700">{stage}</h3>
                    <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                      {stageApps.length}
                    </span>
                  </div>
                  <div className="flex-1 p-2 overflow-y-auto space-y-2 custom-scrollbar">
                    {stageApps.map(app => (
                      <div 
                        key={app.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        onClick={() => openModal(app)}
                        className="bg-white p-3 rounded border border-slate-200 shadow-sm cursor-pointer hover:border-[#1976d2] hover:shadow-md transition-all group relative"
                      >
                        {app.matchPercentage && (
                          <div className={`absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded ${
                            app.matchPercentage >= 80 ? 'bg-green-100 text-green-700' :
                            app.matchPercentage >= 60 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {app.matchPercentage}% Match
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                              {app.candidateName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="pr-16">
                              <h4 className="text-sm font-bold text-[#1976d2] group-hover:underline line-clamp-1">{app.candidateName}</h4>
                              <p className="text-[10px] text-slate-500 line-clamp-1">{app.email}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-2 pt-2 border-t border-slate-100">
                          <FileText className="w-3 h-3" />
                          <span className="truncate">{app.cvFileName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
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
                  onClick={() => {
                    if (selectedApp.cvUrl) {
                      window.open(selectedApp.cvUrl, '_blank');
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
              {/* Sidebar Actions */}
              <div className="w-64 border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto shrink-0">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Move to Stage</h4>
                <div className="space-y-1">
                  {STAGES.map(stage => (
                    <button
                      key={stage}
                      onClick={() => handleMoveStage(stage)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-colors ${
                        selectedApp.stage === stage 
                          ? 'bg-[#1976d2] text-white' 
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {stage}
                      {selectedApp.stage === stage && <ChevronRight className="w-4 h-4" />}
                    </button>
                  ))}
                </div>

                <div className="mt-8">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Application Details</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="block text-slate-500 text-xs">Applied On</span>
                      <span className="text-slate-800 font-medium">{new Date(selectedApp.appliedAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-xs">Job Position</span>
                      <span className="text-slate-800 font-medium">{selectedApp.jobTitle}</span>
                    </div>
                    {selectedApp.customQuestionAnswer && (
                      <div>
                        <span className="block text-slate-500 text-xs">Custom Question Answer (Legacy)</span>
                        <div className="mt-1 p-2 bg-yellow-50 border border-yellow-100 rounded text-slate-700 italic">
                          "{selectedApp.customQuestionAnswer}"
                        </div>
                      </div>
                    )}
                    {selectedApp.customQuestionAnswers && selectedApp.customQuestionAnswers.length > 0 && (
                      <div className="space-y-2">
                        <span className="block text-slate-500 text-xs">Custom Questions</span>
                        {selectedApp.customQuestionAnswers.map((qa, index) => (
                          <div key={index} className="p-2 bg-slate-50 border border-slate-100 rounded">
                            <p className="text-xs font-medium text-slate-700 mb-1">{qa.question}</p>
                            <p className="text-sm text-slate-800 italic">"{qa.answer}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedApp.mcqAnswers && selectedApp.mcqAnswers.length > 0 && (
                      <div className="space-y-2">
                        <span className="block text-slate-500 text-xs">Assessment Results</span>
                        {selectedApp.mcqAnswers.map((answer, index) => (
                          <div key={index} className={`p-2 border rounded ${answer.isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                            <p className="text-xs font-medium text-slate-700 mb-1">{answer.question}</p>
                            <p className="text-sm text-slate-800 italic">
                              Selected: "{answer.selectedOptionText}" 
                              {answer.isCorrect ? (
                                <span className="ml-2 text-emerald-600 font-bold text-[10px] uppercase">✓ Correct</span>
                              ) : (
                                <span className="ml-2 text-red-600 font-bold text-[10px] uppercase">✗ Incorrect</span>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

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
