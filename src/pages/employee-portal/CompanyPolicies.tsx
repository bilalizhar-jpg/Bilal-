import React, { useState } from 'react';
import { Search, FileText, Download } from 'lucide-react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { useTheme } from '../../context/ThemeContext';
import { usePolicies } from '../../context/PolicyContext';
import jsPDF from 'jspdf';

export default function EmployeeCompanyPolicies() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { policies } = usePolicies();
  
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Company Policies</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>View and download company policies</p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none ${
                isDark 
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                  : 'bg-white border-slate-200 text-slate-700 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolicies.map((policy) => (
            <div 
              key={policy.id} 
              className={`p-6 rounded-xl border transition-all hover:shadow-md ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/30' 
                  : 'bg-white border-slate-200 hover:border-emerald-500/30'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {policy.location}
                </span>
              </div>
              
              <h3 className={`font-bold text-lg mb-2 line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {policy.title}
              </h3>
              
              <p className={`text-sm mb-6 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {policy.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Added: {policy.dateAdded}
                </span>
                <button 
                  onClick={() => handleViewPdf(policy)}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  View PDF
                </button>
              </div>
            </div>
          ))}
          
          {filteredPolicies.length === 0 && (
            <div className={`col-span-full p-12 text-center rounded-xl border border-dashed ${
              isDark ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-400'
            }`}>
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No company policies found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
}
