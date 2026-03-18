import React, { useState} from 'react';
import { Search, FileText, Download} from 'lucide-react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { usePolicies} from '../../context/PolicyContext';
import jsPDF from 'jspdf';

export default function EmployeeCompanyPolicies() {
  const { policies} = usePolicies();
 
 const [searchTerm, setSearchTerm] = useState('');

 const filteredPolicies = policies.filter(p => 
 p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
 p.description.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const handleViewPdf = (policy: any) => {
 if (policy.methodType === 'create' && policy.content) {
 const doc = new jsPDF();
 doc.setFontSize(18);
 doc.text(policy.title, 14, 22);
 
 doc.setFontSize(12);
 doc.text(`Location: ${policy.location}`, 14, 32);
 doc.text(`Date Added: ${policy.dateAdded}`, 14, 40);
 
 doc.setFontSize(10);
 const splitText = doc.splitTextToSize(policy.content, 180);
 doc.text(splitText, 14, 55);
 
 // Open PDF in a new window/tab for viewing
 window.open(doc.output('bloburl'), '_blank');
} else {
 alert(`This would download the uploaded file: ${policy.fileName}`);
}
};

 return (
 <EmployeeLayout>
 <div className="space-y-8 max-w-7xl mx-auto">
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
 <div>
 <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Company Policies</h1>
 <p className="text-slate-500 mt-2 text-lg">Access and review official company guidelines and documentation.</p>
 </div>
 
 <div className="relative w-full sm:w-64">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
 <input 
 type="text"
 placeholder="Search policies..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
 'bg-white border-slate-200 text-slate-700 placeholder-slate-400'
}`}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {filteredPolicies.map((policy) => (
 <div 
 key={policy.id} 
 className={`group p-6 rounded-2xl border transition-all hover:shadow-xl hover:-translate-y-1 ${
 'bg-white border-slate-200 hover:border-indigo-500/50'
}`}
 >
 <div className="flex items-start justify-between mb-6">
 <div className={`p-3 rounded-xl transition-colors ${
 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'
}`}>
 <FileText className="w-6 h-6"/>
 </div>
 <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
 'bg-slate-100 text-slate-600'
}`}>
 {policy.location}
 </span>
 </div>
 
 <h3 className={`font-bold text-lg mb-2 line-clamp-1 group-hover:text-indigo-500 transition-colors text-slate-900`}>
 {policy.title}
 </h3>
 
 <p className={`text-sm mb-6 line-clamp-2 leading-relaxed text-slate-600`}>
 {policy.description}
 </p>
 
 <div className="flex items-center justify-between pt-4 border-t border-slate-100">
 <span className={`text-xs font-medium text-slate-400`}>
 Added: {policy.dateAdded}
 </span>
 <button 
 onClick={() => handleViewPdf(policy)}
 className={`flex items-center gap-2 text-sm font-bold transition-colors ${
 'text-indigo-600 hover:text-indigo-700'
}`}
 >
 <Download className="w-4 h-4"/>
 View PDF
 </button>
 </div>
 </div>
 ))}
 
 {filteredPolicies.length === 0 && (
 <div className={`col-span-full py-20 text-center rounded-2xl border-2 border-dashed ${
 'border-slate-200 text-slate-400'
}`}>
 <div className="inline-flex p-4 rounded-full bg-slate-100 mb-4">
 <FileText className="w-8 h-8 opacity-50"/>
 </div>
 <h3 className="text-lg font-bold text-slate-900">No policies found</h3>
 <p className="text-sm">Try adjusting your search term to find what you're looking for.</p>
 </div>
 )}
 </div>
 </div>
 </EmployeeLayout>
 );
}
