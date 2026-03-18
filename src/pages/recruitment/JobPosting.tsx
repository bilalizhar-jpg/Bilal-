import React, { useState, useEffect} from 'react';
import { useNavigate, useLocation} from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { Save, Plus, Trash2, MapPin, RotateCcw} from 'lucide-react';
import { useAuth} from '../../context/AuthContext';
import { saveJob, updateJob, CustomQuestion, MCQQuestion, MCQOption, Job} from '../../utils/jobStore';

export default function JobPosting() {
 const navigate = useNavigate();
 const location = useLocation();
 const { user} = useAuth();
 
 const [editId, setEditId] = useState<string | null>(null);
 const [jobTitle, setJobTitle] = useState('');
 const [locationString, setLocationString] = useState('');
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
 
 // New fields
 const [gender, setGender] = useState('');
 const [nationality, setNationality] = useState('');
 const [experience, setExperience] = useState('');
 const [enableCustomQuestions, setEnableCustomQuestions] = useState(false);
 const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
 const [newQuestionText, setNewQuestionText] = useState('');
 const [newQuestionType, setNewQuestionType] = useState<'text' | 'boolean'>('text');

 const [googleFormLink, setGoogleFormLink] = useState('');
 const [testMcqs, setTestMcqs] = useState<MCQQuestion[]>([]);

 useEffect(() => {
 const state = location.state as { job: Job} | null;
 if (state?.job) {
 const job = state.job;
 setEditId(job.id);
 setJobTitle(job.title);
 setLocationString(job.location);
 setLocations({
 remote: job.workplace.includes('Remote'),
 onsite: job.workplace.includes('On-Site'),
 hybrid: job.workplace.includes('Hybrid'),
 fullTime: job.type.includes('Full-Time'),
 partTime: job.type.includes('Part-Time')
});
 setSalary(job.salary === 'Hidden' ? '' : job.salary);
 setIsSalaryVisible(job.salary !== 'Hidden');
 setDescription(job.description);
 setGender(job.gender || '');
 setNationality(job.nationality || '');
 setExperience(job.experience || '');
 setEnableCustomQuestions(job.enableCustomQuestions || false);
 setCustomQuestions(job.customQuestions || []);
 setGoogleFormLink(job.googleFormLink || '');
 setTestMcqs(job.testMcqs || []);
}
}, [location.state]);

 const handleReset = () => {
 if (window.confirm('Are you sure you want to clear the form? All unsaved changes will be lost.')) {
 setEditId(null);
 setJobTitle('');
 setLocationString('');
 setLocations({
 remote: false,
 onsite: false,
 fullTime: false,
 partTime: false,
 hybrid: false
});
 setSalary('');
 setIsSalaryVisible(true);
 setDescription('');
 setGender('');
 setNationality('');
 setExperience('');
 setEnableCustomQuestions(false);
 setCustomQuestions([]);
 setNewQuestionText('');
 setNewQuestionType('text');
 setGoogleFormLink('');
 setTestMcqs([]);
}
};

 const handleAddQuestion = () => {
 if (!newQuestionText.trim()) return;
 
 const newQuestion: CustomQuestion = {
 id: Math.random().toString(36).substr(2, 9),
 question: newQuestionText,
 type: newQuestionType
};
 
 setCustomQuestions([...customQuestions, newQuestion]);
 setNewQuestionText('');
 setNewQuestionType('text');
};

 const handleRemoveQuestion = (id: string) => {
 setCustomQuestions(customQuestions.filter(q => q.id !== id));
};

 const handleLocationChange = (key: keyof typeof locations) => {
 setLocations(prev => ({ ...prev, [key]: !prev[key]}));
};

 const handleAddMcqQuestion = () => {
 const newMcq: MCQQuestion = {
 id: Math.random().toString(36).substr(2, 9),
 question: '',
 options: [
 { id: Math.random().toString(36).substr(2, 9), text: '', isCorrect: false},
 { id: Math.random().toString(36).substr(2, 9), text: '', isCorrect: false}
 ]
};
 setTestMcqs([...testMcqs, newMcq]);
};

 const handleUpdateMcqQuestion = (id: string, text: string) => {
 setTestMcqs(testMcqs.map(q => q.id === id ? { ...q, question: text} : q));
};

 const handleRemoveMcqQuestion = (id: string) => {
 setTestMcqs(testMcqs.filter(q => q.id !== id));
};

 const handleAddMcqOption = (questionId: string) => {
 setTestMcqs(testMcqs.map(q => {
 if (q.id === questionId) {
 return {
 ...q,
 options: [...q.options, { id: Math.random().toString(36).substr(2, 9), text: '', isCorrect: false}]
};
}
 return q;
}));
};

 const handleUpdateMcqOption = (questionId: string, optionId: string, text: string, isCorrect?: boolean) => {
 setTestMcqs(testMcqs.map(q => {
 if (q.id === questionId) {
 return {
 ...q,
 options: q.options.map(o => {
 if (o.id === optionId) {
 return { 
 ...o, 
 text: text !== undefined ? text : o.text, 
 isCorrect: isCorrect !== undefined ? isCorrect : o.isCorrect 
};
}
 return o;
})
};
}
 return q;
}));
};

 const handleRemoveMcqOption = (questionId: string, optionId: string) => {
 setTestMcqs(testMcqs.map(q => {
 if (q.id === questionId) {
 return {
 ...q,
 options: q.options.filter(o => o.id !== optionId)
};
}
 return q;
}));
};

 const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published' = 'published') => {
 e.preventDefault();
 
 // Map locations object to strings
 const workplaceTypes = [];
 if (locations.remote) workplaceTypes.push('Remote');
 if (locations.onsite) workplaceTypes.push('On-Site');
 if (locations.hybrid) workplaceTypes.push('Hybrid');
 
 const employmentTypes = [];
 if (locations.fullTime) employmentTypes.push('Full-Time');
 if (locations.partTime) employmentTypes.push('Part-Time');

 const newJob = {
 companyId: user?.companyId || 'default',
 title: jobTitle,
 location: locationString,
 type: employmentTypes.join(', ') || 'Full-Time',
 workplace: workplaceTypes.join(', ') || 'On-Site',
 salary: isSalaryVisible ? salary : 'Hidden',
 description,
 gender,
 nationality,
 experience,
 enableCustomQuestions,
 customQuestions, // Save the array of questions
 googleFormLink,
 testMcqs,
 status
};
 
 if (editId) {
 await updateJob(editId, newJob);
 alert(`Job updated successfully!`);
} else {
 await saveJob(newJob);
 alert(`Job ${status === 'draft' ? 'saved as draft' : 'published'} successfully!`);
}
 
 navigate('/recruitment/jobs-list');
};

 return (
 <AdminLayout>
 <div className="max-w-4xl mx-auto space-y-6">
 <div className="flex justify-between items-center">
 <h1 className="text-2xl font-bold text-gray-900">
 {editId ? 'Edit Job Posting' : 'Post a New Job'}
 </h1>
 {editId && (
 <button
 onClick={() => {
 setEditId(null);
 navigate('/recruitment/job-posting', { replace: true, state: {}});
 handleReset();
}}
 className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
 >
 <Plus className="w-4 h-4"/>
 Create New Instead
 </button>
 )}
 </div>

 <form onSubmit={(e) => handleSubmit(e, 'published')} className="bg-white border-gray-200 border rounded-xl overflow-hidden">
 <div className="p-6 border-b border-gray-100">
 <h2 className="font-bold text-gray-900">Job Details</h2>
 <p className="text-sm mt-1 text-gray-500">
 Fill out the details below to publish a new job opening on your career page.
 </p>
 </div>
 
 <div className="p-6 space-y-6">
 {/* Job Title */}
 <div className="space-y-2">
 <label className="block text-sm font-medium text-gray-700">
 Job Title *
 </label>
 <input 
 type="text"
 required
 value={jobTitle}
 onChange={(e) => setJobTitle(e.target.value)}
 placeholder="e.g. Senior Software Engineer"
 className="w-full px-4 py-2.5 rounded-md border focus:ring-1 focus:ring-black outline-none transition-all bg-white border-gray-300 text-gray-900 placeholder-gray-400"
 />
 </div>

 {/* Location String */}
 <div className="space-y-2">
 <label className="block text-sm font-medium text-gray-700">
 Location *
 </label>
 <div className="relative">
 <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
 <input 
 type="text"
 required
 value={locationString}
 onChange={(e) => setLocationString(e.target.value)}
 placeholder="e.g. New York, USA"
 className="w-full pl-10 pr-4 py-2.5 rounded-md border focus:ring-1 focus:ring-black outline-none transition-all bg-white border-gray-300 text-gray-900 placeholder-gray-400"
 />
 </div>
 </div>

 {/* Location & Type */}
 <div className="space-y-3">
 <label className="block text-sm font-medium text-gray-700">
 Employment Type & Workplace *
 </label>
 <div className="flex flex-wrap gap-4">
 {[
 { id: 'remote', label: 'Remote'},
 { id: 'onsite', label: 'On-site'},
 { id: 'hybrid', label: 'Hybrid'},
 { id: 'fullTime', label: 'Full-time'},
 { id: 'partTime', label: 'Part-time'},
 ].map((type) => (
 <label key={type.id} className="flex items-center gap-2 cursor-pointer">
 <input 
 type="checkbox"
 checked={locations[type.id as keyof typeof locations]}
 onChange={() => handleLocationChange(type.id as keyof typeof locations)}
 className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
 />
 <span className="text-sm text-gray-700">
 {type.label}
 </span>
 </label>
 ))}
 </div>
 </div>

 {/* Salary */}
 <div className="space-y-2">
 <div className="flex justify-between items-center">
 <label className="block text-sm font-medium text-gray-700">
 Salary Range
 </label>
 <label className="flex items-center gap-2 cursor-pointer">
 <span className="text-xs text-gray-500">
 Visible on Career Page
 </span>
 <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isSalaryVisible ? 'bg-black' : 'bg-gray-300'}`}>
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
 className="w-full px-4 py-2.5 rounded-md border focus:ring-1 focus:ring-black outline-none transition-all bg-white border-gray-300 text-gray-900 placeholder-gray-400"
 />
 </div>

 {/* Additional Fields */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="block text-sm font-medium text-gray-700">
 Gender (Optional)
 </label>
 <select
 value={gender}
 onChange={(e) => setGender(e.target.value)}
 className="w-full px-4 py-2.5 rounded-md border focus:ring-1 focus:ring-black outline-none transition-all bg-white border-gray-300 text-gray-900"
 >
 <option value="">Any</option>
 <option value="Male">Male</option>
 <option value="Female">Female</option>
 <option value="Other">Other</option>
 </select>
 </div>

 <div className="space-y-2">
 <label className="block text-sm font-medium text-gray-700">
 Nationality (Optional)
 </label>
 <input 
 type="text"
 value={nationality}
 onChange={(e) => setNationality(e.target.value)}
 placeholder="e.g. UAE Nationals only"
 className="w-full px-4 py-2.5 rounded-md border focus:ring-1 focus:ring-black outline-none transition-all bg-white border-gray-300 text-gray-900 placeholder-gray-400"
 />
 </div>

 <div className="space-y-2">
 <label className="block text-sm font-medium text-gray-700">
 Years of Experience (Optional)
 </label>
 <input 
 type="text"
 value={experience}
 onChange={(e) => setExperience(e.target.value)}
 placeholder="e.g. 3-5 years"
 className="w-full px-4 py-2.5 rounded-md border focus:ring-1 focus:ring-black outline-none transition-all bg-white border-gray-300 text-gray-900 placeholder-gray-400"
 />
 </div>

 <div className="space-y-2">
 <label className="block text-sm font-medium text-gray-700">
 Google Form Link (Optional)
 </label>
 <input 
 type="url"
 value={googleFormLink}
 onChange={(e) => setGoogleFormLink(e.target.value)}
 placeholder="https://forms.google.com/..."
 className="w-full px-4 py-2.5 rounded-md border focus:ring-1 focus:ring-black outline-none transition-all bg-white border-gray-300 text-gray-900 placeholder-gray-400"
 />
 </div>
 </div>

 {/* Custom Questions */}
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <label className="block text-sm font-medium text-gray-700">
 Custom Questions (Optional)
 </label>
 <div className="flex items-center gap-4">
 <label className="flex items-center gap-2 cursor-pointer">
 <input 
 type="radio"
 name="enableCustomQuestions"
 checked={enableCustomQuestions}
 onChange={() => setEnableCustomQuestions(true)}
 className="w-4 h-4 text-black focus:ring-black"
 />
 <span className="text-sm text-gray-700">Yes</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer">
 <input 
 type="radio"
 name="enableCustomQuestions"
 checked={!enableCustomQuestions}
 onChange={() => setEnableCustomQuestions(false)}
 className="w-4 h-4 text-black focus:ring-black"
 />
 <span className="text-sm text-gray-700">No</span>
 </label>
 </div>
 </div>
 
 {enableCustomQuestions && (
 <>
 {/* List of added questions */}
 {customQuestions.length > 0 && (
 <div className="space-y-2 mb-3">
 {customQuestions.map((q, index) => (
 <div key={q.id} className="flex items-center justify-between p-3 rounded-md border bg-gray-50 border-gray-200">
 <div className="flex items-center gap-3">
 <span className="text-sm font-medium text-gray-500">
 Q{index + 1}:
 </span>
 <div>
 <p className="text-sm text-gray-900">{q.question}</p>
 <span className="text-xs text-gray-500">
 Type: {q.type === 'boolean' ? 'True/False' : 'Text Answer'}
 </span>
 </div>
 </div>
 <button
 type="button"
 onClick={() => handleRemoveQuestion(q.id)}
 className="text-red-500 hover:text-red-600 transition-colors p-1"
 >
 <Trash2 className="w-4 h-4"/>
 </button>
 </div>
 ))}
 </div>
 )}

 {/* Add new question */}
 <div className="flex gap-2">
 <div className="flex-1">
 <input 
 type="text"
 value={newQuestionText}
 onChange={(e) => setNewQuestionText(e.target.value)}
 placeholder="e.g. Do you have a valid driver's license?"
 className="w-full px-4 py-2.5 rounded-md border focus:ring-1 focus:ring-black outline-none transition-all bg-white border-gray-300 text-gray-900 placeholder-gray-400"
 />
 </div>
 <div className="w-40">
 <select
 value={newQuestionType}
 onChange={(e) => setNewQuestionType(e.target.value as 'text' | 'boolean')}
 className="w-full px-4 py-2.5 rounded-md border focus:ring-1 focus:ring-black outline-none transition-all bg-white border-gray-300 text-gray-900"
 >
 <option value="text">Text Answer</option>
 <option value="boolean">True/False</option>
 </select>
 </div>
 <button
 type="button"
 onClick={handleAddQuestion}
 disabled={!newQuestionText.trim()}
 className="bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-md transition-colors flex items-center justify-center"
 >
 <Plus className="w-5 h-5"/>
 </button>
 </div>
 </>
 )}
 </div>

 {/* Create Test MCQ */}
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <label className="block text-sm font-medium text-gray-700">
 Create Test MCQ (Optional)
 </label>
 <button
 type="button"
 onClick={handleAddMcqQuestion}
 className="flex items-center gap-1 text-xs font-medium text-black hover:text-gray-700 transition-colors"
 >
 <Plus className="w-3.5 h-3.5"/>
 Add Question
 </button>
 </div>

 {testMcqs.map((mcq, qIndex) => (
 <div key={mcq.id} className="p-4 rounded-xl border bg-gray-50 border-gray-200 space-y-4">
 <div className="flex items-start gap-3">
 <div className="flex-1 space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Question {qIndex + 1}</span>
 <button
 type="button"
 onClick={() => handleRemoveMcqQuestion(mcq.id)}
 className="text-red-500 hover:text-red-600 transition-colors"
 >
 <Trash2 className="w-4 h-4"/>
 </button>
 </div>
 <input
 type="text"
 value={mcq.question}
 onChange={(e) => handleUpdateMcqQuestion(mcq.id, e.target.value)}
 placeholder="Enter question text..."
 className="w-full px-4 py-2 rounded-md border focus:ring-1 focus:ring-black outline-none transition-all bg-white border-gray-300 text-gray-900 placeholder-gray-400"
 />
 </div>
 </div>

 <div className="space-y-2 ml-4">
 <div className="flex items-center justify-between">
 <span className="text-xs font-medium text-gray-500">Options</span>
 <button
 type="button"
 onClick={() => handleAddMcqOption(mcq.id)}
 className="text-xs text-black hover:text-gray-700 font-medium flex items-center gap-1"
 >
 <Plus className="w-3 h-3"/>
 Add Option
 </button>
 </div>
 
 <div className="grid grid-cols-1 gap-2">
 {mcq.options.map((option, oIndex) => (
 <div key={option.id} className="flex items-center gap-2">
 <input
 type="text"
 value={option.text}
 onChange={(e) => handleUpdateMcqOption(mcq.id, option.id, e.target.value)}
 placeholder={`Option ${oIndex + 1}`}
 className="flex-1 px-3 py-1.5 text-sm rounded-md border focus:ring-1 focus:ring-black outline-none transition-all bg-white border-gray-200 text-gray-900 placeholder-gray-400"
 />
 <div className="flex items-center gap-2 px-2">
 <label className="flex items-center gap-1 cursor-pointer">
 <input
 type="radio"
 name={`correct-${mcq.id}`}
 checked={option.isCorrect}
 onChange={() => {
 // Set this one as correct, others as incorrect
 mcq.options.forEach(o => {
 handleUpdateMcqOption(mcq.id, o.id, o.text, o.id === option.id);
});
}}
 className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500"
 />
 <span className="text-[10px] font-bold text-emerald-600 uppercase">Correct</span>
 </label>
 <label className="flex items-center gap-1 cursor-pointer">
 <input
 type="radio"
 name={`correct-${mcq.id}`}
 checked={!option.isCorrect}
 onChange={() => handleUpdateMcqOption(mcq.id, option.id, option.text, false)}
 className="w-3.5 h-3.5 text-red-600 focus:ring-red-500"
 />
 <span className="text-[10px] font-bold text-red-600 uppercase">Incorrect</span>
 </label>
 </div>
 <button
 type="button"
 onClick={() => handleRemoveMcqOption(mcq.id, option.id)}
 disabled={mcq.options.length <= 2}
 className="text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
 >
 <Trash2 className="w-3.5 h-3.5"/>
 </button>
 </div>
 ))}
 </div>
 </div>
 </div>
 ))}
 
 {testMcqs.length === 0 && (
 <div className="text-center py-6 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
 <p className="text-sm">No test questions added yet.</p>
 </div>
 )}
 </div>

 {/* Job Description */}
 <div className="space-y-2">
 <label className="block text-sm font-medium text-gray-700">
 Job Description *
 </label>
 <textarea 
 required
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 rows={8}
 placeholder="Describe the role, responsibilities, requirements, and benefits..."
 className="w-full px-4 py-3 rounded-md border focus:ring-1 focus:ring-black outline-none transition-all resize-none bg-white border-gray-300 text-gray-900 placeholder-gray-400"
 />
 </div>
 </div>

 <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
 <button 
 type="button"
 onClick={handleReset}
 className="mr-auto flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors text-red-600 hover:bg-red-50"
 >
 <RotateCcw className="w-4 h-4"/>
 Reset Form
 </button>
 <button 
 type="button"
 onClick={(e) => handleSubmit(e as any, 'draft')}
 className="px-6 py-2.5 rounded-md text-sm font-medium transition-colors text-gray-700 hover:bg-gray-200"
 >
 {editId ? 'Keep as Draft' : 'Save as Draft'}
 </button>
 <button 
 type="submit"
 className="bg-black hover:bg-gray-800 text-white px-8 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
 >
 {editId ? <Save className="w-4 h-4"/> : <Plus className="w-4 h-4"/>}
 {editId ? 'Update Job' : 'Publish Job'}
 </button>
 </div>
 </form>
 </div>
 </AdminLayout>
 );
}
