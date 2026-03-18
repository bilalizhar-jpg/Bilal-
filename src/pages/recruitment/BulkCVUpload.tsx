import React, { useState, useRef, useEffect} from 'react';
import AdminLayout from '../../components/AdminLayout';
import { UploadCloud, X, FileText, CheckCircle, AlertCircle} from 'lucide-react';
import { getJobs, subscribeToJobs, Job} from '../../utils/jobStore';
import { saveCandidate, uploadCV} from '../../utils/candidateStore';
import { useAuth} from '../../context/AuthContext';
import { evaluateCVMatch} from '../../utils/cvMatcher';

export default function BulkCVUpload() {
 const { user} = useAuth();
 const [selectedJobId, setSelectedJobId] = useState<string>('');
 const [files, setFiles] = useState<File[]>([]);
 const [uploading, setUploading] = useState(false);
 const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
 const [errorMessage, setErrorMessage] = useState<string>('');
 const [jobs, setJobs] = useState<Job[]>([]);
 const fileInputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
 const unsubscribe = subscribeToJobs((allJobs) => {
 setJobs(allJobs);
}, user?.companyId);

 return () => unsubscribe();
}, [user?.companyId]);

 const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
 if (e.target.files) {
 const newFiles = Array.from(e.target.files);
 setFiles(prev => [...prev, ...newFiles]);
}
};

 const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 if (e.dataTransfer.files) {
 const newFiles = Array.from(e.dataTransfer.files);
 setFiles(prev => [...prev, ...newFiles]);
}
};

 const removeFile = (indexToRemove: number) => {
 setFiles(files.filter((_, index) => index !== indexToRemove));
};

 const handleUpload = async () => {
 if (files.length === 0 || !selectedJobId) return;

 setUploading(true);
 setUploadStatus('idle');

 try {
 const selectedJob = jobs.find(j => j.id === selectedJobId);
 if (!selectedJob) throw new Error('Job not found');

 for (const file of files) {
 // 1. Upload CV to Firebase Storage (or your preferred storage) to get a URL
 let cvUrl = '';
 try {
 cvUrl = await uploadCV(user?.companyId || 'default', file);
} catch (uploadError) {
 console.error("Failed to upload CV to storage for", file.name, uploadError);
}

 // 2. Call the new Node.js API for AI Parsing and Database Storage
 const formData = new FormData();
 formData.append('cv_file', file);
 formData.append('company_id', user?.companyId || 'default_company');
 formData.append('source', 'Bulk CV Upload');
 formData.append('cv_file_url', cvUrl);

 const response = await fetch('/api/candidates/upload', {
 method: 'POST',
 body: formData,
});

 if (!response.ok) {
 const contentType = response.headers.get("content-type");
 if (contentType && contentType.indexOf("application/json") !== -1) {
 const errorData = await response.json();
 console.error(`Failed to process CV ${file.name} via API:`, errorData);
 throw new Error(`Failed to process CV ${file.name}: ${errorData.details || errorData.error || 'Unknown error'}`);
} else {
 const errorText = await response.text();
 console.error(`Failed to process CV ${file.name} via API (Non-JSON response):`, errorText);
 throw new Error(`Failed to process CV ${file.name}: Server returned an error (Status: ${response.status})`);
}
}

 const result = await response.json();
 const parsedData = result.parsedData;

 // 3. (Optional) Still save to Firebase for legacy compatibility if needed
 // We will save to Firebase as well so the existing UI (JobCandidates) still works
 await saveCandidate({
 companyId: user?.companyId || 'default',
 jobId: selectedJobId,
 jobTitle: selectedJob.title,
 candidateName: parsedData.name || file.name.split('.')[0],
 email: parsedData.email ||`${file.name.split('.')[0].toLowerCase().replace(/\s+/g, '.')}@example.com`,
 phone: parsedData.phone || '+1234567890',
 cvFileName: file.name,
 cvUrl: cvUrl,
 matchPercentage: Math.floor(Math.random() * 40) + 60, // Mock match percentage
 skills: parsedData.skills || [],
 education: parsedData.education || '',
 currentJobTitle: parsedData.current_job_title || '',
 category: parsedData.category || '',
 cvText: parsedData.keywords || '' // Store keywords in cvText for legacy search
});
}
 
 console.log(`Uploaded ${files.length} files for job ${selectedJobId}`);
 
 setUploadStatus('success');
 setFiles([]);
 setTimeout(() => setUploadStatus('idle'), 3000);
} catch (error) {
 console.error('Upload error:', error);
 setErrorMessage(error instanceof Error ? error.message : 'An error occurred during upload. Please try again.');
 setUploadStatus('error');
} finally {
 setUploading(false);
}
};

 return (
 <AdminLayout>
 <div className="max-w-4xl mx-auto">
 <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
 <h2 className="text-xl font-semibold text-slate-800 mb-6">Candidate Resume Import</h2>
 
 <div className="mb-6">
 <label className="block text-sm font-medium text-slate-700 mb-2">
 Select Job Position (Required)
 </label>
 <select
 value={selectedJobId}
 onChange={(e) => setSelectedJobId(e.target.value)}
 className="w-full px-4 py-2 border border-slate-300 rounded-md focus:border-[#1976d2] focus:ring-1 focus:ring-[#1976d2] outline-none"
 required
 >
 <option value="">Select a job...</option>
 {jobs.map(job => (
 <option key={job.id} value={job.id}>
 {job.title} - {job.location}
 </option>
 ))}
 </select>
 </div>

 <div
 className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${
 files.length > 0 ? 'border-[#1976d2] bg-blue-50/50' : 'border-slate-300 hover:border-[#1976d2]'
}`}
 onDragOver={(e) => e.preventDefault()}
 onDrop={handleDrop}
 >
 <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4"/>
 <p className="text-slate-600 mb-2">
 Drag and drop resume here or
 </p>
 <button
 onClick={() => fileInputRef.current?.click()}
 className="bg-[#1976d2] text-white px-6 py-2 rounded-md font-medium hover:bg-[#1565c0] transition-colors"
 >
 Select files to upload
 </button>
 <input
 type="file"
 ref={fileInputRef}
 onChange={handleFileSelect}
 className="hidden"
 multiple
 accept=".pdf,.doc,.docx,.rtf"
 />
 <p className="text-sm text-slate-500 mt-4">
 Supported file types (max 20MB): .pdf, .doc, .docx, .rtf
 </p>
 </div>

 {files.length > 0 && (
 <div className="mt-8">
 <h3 className="text-sm font-medium text-slate-700 mb-4">
 {files.length} File{files.length !== 1 ? 's' : ''} Selected
 </h3>
 <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2">
 {files.map((file, index) => (
 <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-md border border-slate-200">
 <div className="flex items-center gap-3 overflow-hidden">
 <FileText className="w-5 h-5 text-slate-400 flex-shrink-0"/>
 <span className="text-sm text-slate-700 truncate">{file.name}</span>
 </div>
 <button
 onClick={() => removeFile(index)}
 className="text-slate-400 hover:text-red-500 transition-colors p-1"
 >
 <X className="w-4 h-4"/>
 </button>
 </div>
 ))}
 </div>

 <div className="flex justify-end">
 <button
 onClick={handleUpload}
 disabled={uploading || !selectedJobId}
 className="bg-[#1976d2] text-white px-6 py-2 rounded-md font-medium hover:bg-[#1565c0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
 >
 {uploading ? 'Uploading...' : 'Upload Resumes'}
 </button>
 </div>
 </div>
 )}

 {uploadStatus === 'success' && (
 <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-md flex items-center gap-2">
 <CheckCircle className="w-5 h-5"/>
 Successfully uploaded and processed resumes.
 </div>
 )}
 
 {uploadStatus === 'error' && (
 <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
 <AlertCircle className="w-5 h-5"/>
 {errorMessage}
 </div>
 )}
 </div>
 </div>
 </AdminLayout>
 );
}
