import React, { useState} from 'react';
import { motion, AnimatePresence} from 'motion/react';
import { Plus, Search, X, Send, Save, Trash2, Mail, Edit2} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useEmployees} from '../../context/EmployeeContext';
import { useLetters} from '../../context/LetterContext';
import { useLocation} from 'react-router-dom';

export default function LetterManagement() {
  const location = useLocation();
 const { employees} = useEmployees();
 const { letters, templates, addLetter, updateLetter, updateLetterStatus, deleteLetter, addTemplate, deleteTemplate} = useLetters();

 // Determine category and type from URL
 const pathParts = location.pathname.split('/').filter(Boolean);
 const categorySlug = pathParts[0] || '';
 const typeSlug = pathParts[1] || '';
 
 const category = categorySlug === 'onboarding' ? 'Onboarding' : 'Offboarding';
 
 const getTypeName = (slug: string) => {
 switch (slug) {
 case 'fnf-letter': return 'Full & Final Settlement (FNF)';
 case 'clearance-certificate': return 'No Dues / Clearance Certificate';
 case 'exit-interview': return 'Exit Interview Form';
 case 'nda-reminder': return 'NDA / Confidentiality Reminder';
 default: return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
};
 
 const typeName = getTypeName(typeSlug);

 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingLetterId, setEditingLetterId] = useState<string | null>(null);
 const [activeTab, setActiveTab] = useState<'details' | 'template'>('details');
 const [searchTerm, setSearchTerm] = useState('');
 
 // Form State
 const [isManualUser, setIsManualUser] = useState(true);
 const [formData, setFormData] = useState({
 userId: '',
 customName: '',
 customEmail: '',
 title: '',
 date: new Date().toISOString().slice(0, 10),
 description: '',
 address: '',
 mobile: '',
 subject: '',
 itClearance: false,
 hrClearance: false,
 financeClearance: false,
 adminClearance: false,
 reasonForLeaving: '',
 feedbackOnManagement: '',
 workEnvironmentReview: '',
});

 const [templateContent, setTemplateContent] = useState('');
 const [selectedTemplateId, setSelectedTemplateId] = useState('');
 const [newTemplateName, setNewTemplateName] = useState('');

 const filteredLetters = letters.filter(l => 
 l.category === category && 
 l.type === typeName &&
 (l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
 (l.customName || '').toLowerCase().includes(searchTerm.toLowerCase()))
 );

 const handleSave = (status: 'Saved' | 'Sent') => {
 const letterData = {
 category,
 type: typeName,
 userId: isManualUser ? undefined : formData.userId,
 customName: isManualUser ? formData.customName : undefined,
 customEmail: isManualUser ? formData.customEmail : undefined,
 title: formData.title || formData.subject,
 date: formData.date,
 description: formData.description,
 status,
 address: formData.address,
 mobile: formData.mobile,
 subject: formData.subject,
 itClearance: formData.itClearance,
 hrClearance: formData.hrClearance,
 financeClearance: formData.financeClearance,
 adminClearance: formData.adminClearance,
 reasonForLeaving: formData.reasonForLeaving,
 feedbackOnManagement: formData.feedbackOnManagement,
 workEnvironmentReview: formData.workEnvironmentReview,
};

 if (editingLetterId) {
 updateLetter(editingLetterId, letterData);
} else {
 addLetter(letterData);
}
 
 setIsModalOpen(false);
 resetForm();
};

 const handleEdit = (letter: any) => {
 setEditingLetterId(letter.id);
 setIsManualUser(!!letter.customName);
 setFormData({
 userId: letter.userId || '',
 customName: letter.customName || '',
 customEmail: letter.customEmail || '',
 title: letter.title || '',
 date: letter.date || new Date().toISOString().slice(0, 10),
 description: letter.description || '',
 address: letter.address || '',
 mobile: letter.mobile || '',
 subject: letter.subject || '',
 itClearance: letter.itClearance || false,
 hrClearance: letter.hrClearance || false,
 financeClearance: letter.financeClearance || false,
 adminClearance: letter.adminClearance || false,
 reasonForLeaving: letter.reasonForLeaving || '',
 feedbackOnManagement: letter.feedbackOnManagement || '',
 workEnvironmentReview: letter.workEnvironmentReview || '',
});
 setIsModalOpen(true);
};

 const resetForm = () => {
 setEditingLetterId(null);
 setFormData({
 userId: '',
 customName: '',
 customEmail: '',
 title: '',
 date: new Date().toISOString().slice(0, 10),
 description: '',
 address: '',
 mobile: '',
 subject: '',
 itClearance: false,
 hrClearance: false,
 financeClearance: false,
 adminClearance: false,
 reasonForLeaving: '',
 feedbackOnManagement: '',
 workEnvironmentReview: '',
});
 setIsManualUser(true);
 setActiveTab('details');
 setTemplateContent('');
 setSelectedTemplateId('');
 setNewTemplateName('');
};

 const handleDownloadWord = () => {
 const header =`<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${typeName}</title></head><body>`;
 const footer ="</body></html>";
 
 let extraContent = '';
 if (typeSlug === 'clearance-certificate') {
 extraContent =`
 <h3>Clearance Checklist</h3>
 <ul>
 <li>IT Clearance: ${formData.itClearance ? 'Yes' : 'No'}</li>
 <li>HR Clearance: ${formData.hrClearance ? 'Yes' : 'No'}</li>
 <li>Finance Clearance: ${formData.financeClearance ? 'Yes' : 'No'}</li>
 <li>Admin Clearance: ${formData.adminClearance ? 'Yes' : 'No'}</li>
 </ul>
`;
} else if (typeSlug === 'exit-interview') {
 extraContent =`
 <h3>Exit Interview Details</h3>
 <p><strong>Reason for leaving:</strong> ${formData.reasonForLeaving}</p>
 <p><strong>Feedback on management:</strong> ${formData.feedbackOnManagement}</p>
 <p><strong>Work environment review:</strong> ${formData.workEnvironmentReview}</p>
`;
}

 const content =`
 <h1>${typeName.toUpperCase()}</h1>
 <p><strong>Date:</strong> ${formData.date}</p>
 <p><strong>Candidate Name:</strong> ${isManualUser ? formData.customName : (employees.find(e => e.id === formData.userId)?.name || '')}</p>
 <p><strong>Address:</strong> ${formData.address}</p>
 <p><strong>Mobile:</strong> ${formData.mobile}</p>
 <p><strong>Email ID:</strong> ${isManualUser ? formData.customEmail : (employees.find(e => e.id === formData.userId)?.email || '')}</p>
 <p><strong>Subject:</strong> ${formData.subject}</p>
 ${extraContent}
 <div style="margin-top: 20px;">
 ${formData.description.replace(/\n/g, '<br/>')}
 </div>
`;
 const sourceHTML = header + content + footer;
 const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
 const fileDownload = document.createElement("a");
 document.body.appendChild(fileDownload);
 fileDownload.href = source;
 fileDownload.download =`${typeName.replace(/\s+/g, '_')}_${formData.customName || 'Candidate'}.doc`;
 fileDownload.click();
 document.body.removeChild(fileDownload);
};

 const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
 const id = e.target.value;
 setSelectedTemplateId(id);
 const template = templates.find(t => t.id === id);
 if (template) {
 setTemplateContent(template.content);
 setFormData(prev => ({ ...prev, description: template.content}));
} else {
 setTemplateContent('');
}
};

 const handleSaveTemplate = () => {
 if (!newTemplateName || !templateContent) {
 alert('Please enter a template name and content.');
 return;
}
 addTemplate({
 name: newTemplateName,
 content: templateContent
});
 setNewTemplateName('');
 alert('Template saved successfully!');
};

 const getUserName = (letter: any) => {
 if (letter.customName) return letter.customName;
 const emp = employees.find(e => e.id === letter.userId);
 return emp ? emp.name : 'Unknown User';
};

 return (
 <AdminLayout>
 <div className="space-y-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <div>
 <h1 className={`text-2xl font-bold text-slate-900`}>{typeName}s</h1>
 <p className={`text-sm text-slate-500`}>Dashboard - {category} - {typeName}</p>
 </div>
 </div>

 <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
 <button 
 onClick={() => {
 resetForm();
 setIsModalOpen(true);
}}
 className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors w-full sm:w-auto"
 >
 <Plus className="w-4 h-4"/>
 Add New {typeName}
 </button>

 <div className="relative w-full sm:w-64">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
 <input 
 type="text"
 placeholder="Search By Title"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none ${
 'bg-white border-slate-200 text-slate-700 placeholder-slate-400'
}`}
 />
 </div>
 </div>

 <div className={`rounded-xl border overflow-hidden bg-white border-slate-200`}>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className={`border-b border-slate-100 bg-slate-50/50`}>
 <th className="px-4 py-3 w-12">
 <input type="checkbox"className="rounded border-slate-300"/>
 </th>
 <th className={`px-4 py-3 text-sm font-semibold text-slate-700`}>Title</th>
 <th className={`px-4 py-3 text-sm font-semibold text-slate-700`}>User</th>
 <th className={`px-4 py-3 text-sm font-semibold text-slate-700`}>Date</th>
 <th className={`px-4 py-3 text-sm font-semibold text-slate-700`}>Status</th>
 <th className={`px-4 py-3 text-sm font-semibold text-slate-700`}>Action</th>
 </tr>
 </thead>
 <tbody className={`divide-y divide-slate-100`}>
 {filteredLetters.map((letter) => (
 <tr key={letter.id} className={`hover:bg-slate-50 transition-colors`}>
 <td className="px-4 py-3">
 <input type="checkbox"className="rounded border-slate-300"/>
 </td>
 <td className={`px-4 py-3 text-sm text-slate-600`}>
 {letter.title}
 </td>
 <td className={`px-4 py-3 text-sm text-slate-600`}>
 {getUserName(letter)}
 </td>
 <td className={`px-4 py-3 text-sm text-slate-600`}>
 {new Date(letter.date).toLocaleString()}
 </td>
 <td className="px-4 py-3">
 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
 letter.status === 'Sent' 
 ? 'bg-emerald-100 text-emerald-700 ' 
 : 'bg-amber-100 text-amber-700 '
}`}>
 {letter.status}
 </span>
 </td>
 <td className="px-4 py-3">
 <div className="flex items-center gap-2">
 <button 
 onClick={() => handleEdit(letter)}
 className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
 title="Edit"
 >
 <Edit2 className="w-4 h-4"/>
 </button>
 {letter.status === 'Saved' && (
 <button 
 onClick={() => updateLetterStatus(letter.id, 'Sent')}
 className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
 title="Send Now"
 >
 <Send className="w-4 h-4"/>
 </button>
 )}
 <button 
 onClick={() => deleteLetter(letter.id)}
 className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
 title="Delete"
 >
 <Trash2 className="w-4 h-4"/>
 </button>
 </div>
 </td>
 </tr>
 ))}
 {filteredLetters.length === 0 && (
 <tr>
 <td colSpan={6} className={`px-4 py-12 text-center text-sm text-slate-400`}>
 <div className="flex flex-col items-center justify-center">
 <Mail className="w-12 h-12 mb-3 opacity-20"/>
 <p>No data</p>
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* Slide-over Modal */}
 <AnimatePresence>
 {isModalOpen && (
 <>
 <motion.div 
 initial={{ opacity: 0}}
 animate={{ opacity: 1}}
 exit={{ opacity: 0}}
 onClick={() => setIsModalOpen(false)}
 className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
 />
 <motion.div 
 initial={{ x: '100%'}}
 animate={{ x: 0}}
 exit={{ x: '100%'}}
 transition={{ type: 'spring', damping: 25, stiffness: 200}}
 className={`fixed inset-y-0 right-0 w-full max-w-2xl shadow-2xl z-50 flex flex-col ${
 'bg-white'
}`}
 >
 <div className={`flex items-center justify-between p-6 border-b border-slate-100`}>
 <h2 className={`text-lg font-semibold text-slate-800`}>
 {editingLetterId ? 'Edit' : 'Add New'} {typeName}
 </h2>
 <button 
 onClick={() => setIsModalOpen(false)}
 className={`p-2 rounded-full transition-colors ${
 'hover:bg-slate-100 text-slate-500'
}`}
 >
 <X className="w-5 h-5"/>
 </button>
 </div>

 <div className={`flex border-b px-6 border-slate-200`}>
 <button
 onClick={() => setActiveTab('details')}
 className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
 activeTab === 'details' 
 ? 'border-blue-500 text-blue-600 ' 
 : 'border-transparent text-slate-500 hover:text-slate-700 '
}`}
 >
 {typeName} Details
 </button>
 <button
 onClick={() => setActiveTab('template')}
 className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
 activeTab === 'template' 
 ? 'border-blue-500 text-blue-600 ' 
 : 'border-transparent text-slate-500 hover:text-slate-700 '
}`}
 >
 Letterhead Template
 </button>
 </div>

 <div className="flex-1 overflow-y-auto p-6">
 {activeTab === 'details' ? (
 <div className="space-y-6">
 <div className="flex justify-between items-start gap-6">
 <div className="flex-1 space-y-4">
 <div className="flex items-center gap-4">
 <div className="flex-1">
 <input 
 type="text"
 placeholder="Candidate Name"
 value={isManualUser ? formData.customName : (employees.find(e => e.id === formData.userId)?.name || '')}
 onChange={(e) => isManualUser ? setFormData({...formData, customName: e.target.value}) : null}
 className={`w-full px-3 py-2 rounded border outline-none transition-all ${
 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
}`}
 />
 </div>
 <span className={`text-sm font-medium w-32 text-slate-700`}>Candidate Name</span>
 </div>

 <div className="flex items-center gap-4">
 <div className="flex-1">
 <input 
 type="text"
 placeholder="Address"
 value={formData.address}
 onChange={(e) => setFormData({...formData, address: e.target.value})}
 className={`w-full px-3 py-2 rounded border outline-none transition-all ${
 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
}`}
 />
 </div>
 <span className={`text-sm font-medium w-32 text-slate-700`}>Address</span>
 </div>

 <div className="flex items-center gap-4">
 <div className="flex-1">
 <input 
 type="text"
 placeholder="Mobile"
 value={formData.mobile}
 onChange={(e) => setFormData({...formData, mobile: e.target.value})}
 className={`w-full px-3 py-2 rounded border outline-none transition-all ${
 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
}`}
 />
 </div>
 <span className={`text-sm font-medium w-32 text-slate-700`}>Mobile</span>
 </div>

 <div className="flex items-center gap-4">
 <div className="flex-1">
 <input 
 type="email"
 placeholder="email ID"
 value={isManualUser ? formData.customEmail : (employees.find(e => e.id === formData.userId)?.email || '')}
 onChange={(e) => isManualUser ? setFormData({...formData, customEmail: e.target.value}) : null}
 className={`w-full px-3 py-2 rounded border outline-none transition-all ${
 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
}`}
 />
 </div>
 <span className={`text-sm font-medium w-32 text-slate-700`}>email ID</span>
 </div>
 </div>

 <div className="w-48 space-y-2">
 <div className="flex items-center gap-2">
 <input 
 type="date"
 value={formData.date}
 onChange={(e) => setFormData({...formData, date: e.target.value})}
 className={`w-full px-3 py-2 rounded border outline-none transition-all ${
 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
}`}
 />
 <span className={`text-sm font-medium text-slate-700`}>Date</span>
 </div>
 {!isManualUser && (
 <select 
 value={formData.userId}
 onChange={(e) => setFormData({...formData, userId: e.target.value})}
 className={`w-full px-3 py-2 rounded border outline-none transition-all text-xs ${
 'bg-white border-slate-300 text-slate-900'
}`}
 >
 <option value="">Select User...</option>
 {employees.map(emp => (
 <option key={emp.id} value={emp.id}>{emp.name}</option>
 ))}
 </select>
 )}
 <button 
 type="button"
 onClick={() => setIsManualUser(!isManualUser)}
 className="text-[10px] text-blue-500 hover:underline"
 >
 {isManualUser ?"Select from existing users":"Add custom user"}
 </button>
 </div>
 </div>

 <div className="flex items-center gap-4">
 <span className={`text-sm font-bold uppercase tracking-wider text-slate-700`}>SUBJECT</span>
 <input 
 type="text"
 placeholder="Subject"
 value={formData.subject}
 onChange={(e) => setFormData({...formData, subject: e.target.value})}
 className={`flex-1 px-3 py-2 rounded border outline-none transition-all ${
 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
}`}
 />
 </div>

 {typeSlug === 'clearance-certificate' && (
 <div className="space-y-4 p-4 rounded-lg border border-slate-200 bg-slate-50">
 <h3 className={`text-sm font-semibold text-slate-800`}>Clearance Checklist</h3>
 <div className="grid grid-cols-2 gap-4">
 <label className="flex items-center gap-2 cursor-pointer">
 <input 
 type="checkbox"
 checked={formData.itClearance}
 onChange={(e) => setFormData({...formData, itClearance: e.target.checked})}
 className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
 />
 <span className={`text-sm text-slate-700`}>IT Clearance (Laptop, Email)</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer">
 <input 
 type="checkbox"
 checked={formData.hrClearance}
 onChange={(e) => setFormData({...formData, hrClearance: e.target.checked})}
 className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
 />
 <span className={`text-sm text-slate-700`}>HR Clearance</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer">
 <input 
 type="checkbox"
 checked={formData.financeClearance}
 onChange={(e) => setFormData({...formData, financeClearance: e.target.checked})}
 className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
 />
 <span className={`text-sm text-slate-700`}>Finance Clearance</span>
 </label>
 <label className="flex items-center gap-2 cursor-pointer">
 <input 
 type="checkbox"
 checked={formData.adminClearance}
 onChange={(e) => setFormData({...formData, adminClearance: e.target.checked})}
 className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
 />
 <span className={`text-sm text-slate-700`}>Admin Clearance</span>
 </label>
 </div>
 </div>
 )}

 {typeSlug === 'exit-interview' && (
 <div className="space-y-4 p-4 rounded-lg border border-slate-200 bg-slate-50">
 <h3 className={`text-sm font-semibold text-slate-800`}>Exit Interview Details</h3>
 <div className="space-y-4">
 <div>
 <label className={`block text-sm font-medium mb-1 text-slate-700`}>Reason for leaving</label>
 <input 
 type="text"
 value={formData.reasonForLeaving}
 onChange={(e) => setFormData({...formData, reasonForLeaving: e.target.value})}
 className={`w-full px-3 py-2 rounded border outline-none transition-all ${
 'bg-white border-slate-300 text-slate-900'
}`}
 />
 </div>
 <div>
 <label className={`block text-sm font-medium mb-1 text-slate-700`}>Feedback on management</label>
 <textarea 
 rows={3}
 value={formData.feedbackOnManagement}
 onChange={(e) => setFormData({...formData, feedbackOnManagement: e.target.value})}
 className={`w-full px-3 py-2 rounded border outline-none transition-all resize-none ${
 'bg-white border-slate-300 text-slate-900'
}`}
 />
 </div>
 <div>
 <label className={`block text-sm font-medium mb-1 text-slate-700`}>Work environment review</label>
 <textarea 
 rows={3}
 value={formData.workEnvironmentReview}
 onChange={(e) => setFormData({...formData, workEnvironmentReview: e.target.value})}
 className={`w-full px-3 py-2 rounded border outline-none transition-all resize-none ${
 'bg-white border-slate-300 text-slate-900'
}`}
 />
 </div>
 </div>
 </div>
 )}

 <div className="space-y-2">
 <label className={`text-sm font-medium text-slate-700`}>
 Description
 </label>
 <textarea 
 rows={12}
 placeholder="Description"
 value={formData.description}
 onChange={(e) => setFormData({...formData, description: e.target.value})}
 className={`w-full px-4 py-3 rounded border outline-none transition-all resize-none text-sm ${
 'bg-white border-slate-300 text-slate-900 focus:border-blue-500'
}`}
 />
 </div>
 </div>
 ) : (
 <div className="space-y-6">
 <div className="space-y-2">
 <label className={`text-sm font-medium text-slate-700`}>
 Select Existing Template
 </label>
 <select 
 value={selectedTemplateId}
 onChange={handleTemplateSelect}
 className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
}`}
 >
 <option value="">-- Select Template --</option>
 {templates.map(t => (
 <option key={t.id} value={t.id}>{t.name}</option>
 ))}
 </select>
 </div>

 <div className="space-y-2">
 <label className={`text-sm font-medium text-slate-700`}>
 Template Content
 </label>
 <textarea 
 rows={10}
 value={templateContent}
 onChange={(e) => {
 setTemplateContent(e.target.value);
 setFormData(prev => ({ ...prev, description: e.target.value}));
}}
 placeholder="Write or paste your template content here..."
 className={`w-full px-3 py-2 rounded-lg border outline-none transition-all resize-none font-mono text-sm ${
 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
}`}
 />
 </div>

 <div className="space-y-2 pt-4 border-t border-slate-200">
 <label className={`text-sm font-medium text-slate-700`}>
 Save as New Template
 </label>
 <div className="flex gap-2">
 <input 
 type="text"
 placeholder="New Template Name"
 value={newTemplateName}
 onChange={(e) => setNewTemplateName(e.target.value)}
 className={`flex-1 px-3 py-2 rounded-lg border outline-none transition-all ${
 'bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
}`}
 />
 <button 
 type="button"
 onClick={handleSaveTemplate}
 className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
 >
 Save Template
 </button>
 </div>
 </div>
 </div>
 )}
 </div>

 <div className={`p-6 border-t flex flex-wrap justify-between gap-3 border-slate-100 bg-white`}>
 <div className="flex gap-3">
 <button 
 type="button"
 onClick={() => handleSave('Saved')}
 className={`px-6 py-2 rounded border text-sm font-medium transition-colors ${
 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
}`}
 >
 Save
 </button>
 <button 
 type="button"
 onClick={() => handleSave('Sent')}
 className="px-6 py-2 rounded text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 transition-colors"
 >
 Save & Send
 </button>
 </div>
 <button 
 type="button"
 onClick={handleDownloadWord}
 className={`px-6 py-2 rounded border text-sm font-medium transition-colors ${
 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
}`}
 >
 Download as word file
 </button>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </div>
 </AdminLayout>
 );
}
