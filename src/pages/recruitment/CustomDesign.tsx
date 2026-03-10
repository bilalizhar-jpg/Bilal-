import React, { useState, useRef } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { Plus, Edit2, Trash2, Mail, Download, Printer, Save, X } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface Template {
  id: string;
  name: string;
  content: string;
}

export default function CustomDesign() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    if (editorRef.current && editingTemplate) {
      const newContent = editorRef.current.innerHTML;
      if (isCreating) {
        setTemplates([...templates, { ...editingTemplate, content: newContent }]);
      } else {
        setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...t, content: newContent } : t));
      }
      setEditingTemplate(null);
      setIsCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleDownloadPDF = async (template: Template) => {
    if (printRef.current) {
      printRef.current.innerHTML = template.content;
      // Ensure the hidden element is visible for capture but off-screen
      printRef.current.style.display = 'block';
      printRef.current.style.position = 'absolute';
      printRef.current.style.left = '-9999px';
      
      try {
        const dataUrl = await toPng(printRef.current, {
          backgroundColor: '#fff',
          pixelRatio: 2,
        });
        
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${template.name}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
      } finally {
        printRef.current.style.display = 'none';
      }
    }
  };

  const handleDownloadWord = (template: Template) => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + template.content + footer;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${template.name}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  const handlePrint = (template: Template) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print</title>');
      printWindow.document.write('</head><body >');
      printWindow.document.write(template.content);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleEmail = (template: Template) => {
    alert(`Emailing template: ${template.name}`);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Custom Design</h1>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Design any type of letter or document</p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingTemplate({ id: Date.now().toString(), name: 'New Custom Letter', content: '<p>Start typing here...</p>' });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Design
        </button>
      </div>

      {/* Hidden div for PDF generation */}
      <div ref={printRef} className="hidden bg-white text-black p-8 w-[800px]" />

      {editingTemplate ? (
        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              value={editingTemplate.name}
              onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
              className={`text-xl font-bold bg-transparent border-none focus:ring-0 p-0 ${isDark ? 'text-white' : 'text-slate-800'}`}
              placeholder="Design Name"
            />
            <div className="flex gap-2">
              <button onClick={() => { setEditingTemplate(null); setIsCreating(false); }} className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X className="w-5 h-5" />
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
          
          <div className={`border rounded-lg p-2 mb-4 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex gap-2 mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
              <button onClick={() => document.execCommand('bold', false)} className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded font-bold">B</button>
              <button onClick={() => document.execCommand('italic', false)} className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded italic">I</button>
              <button onClick={() => document.execCommand('underline', false)} className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded underline">U</button>
              <button onClick={() => document.execCommand('insertUnorderedList', false)} className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded">• List</button>
            </div>
            <div
              ref={editorRef}
              className={`min-h-[400px] p-4 outline-none ${isDark ? 'text-white' : 'text-slate-800'}`}
              contentEditable
              dangerouslySetInnerHTML={{ __html: editingTemplate.content }}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} flex flex-col`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{template.name}</h3>
              <div 
                className={`flex-1 overflow-hidden mb-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} line-clamp-4`}
                dangerouslySetInnerHTML={{ __html: template.content }}
              />
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex gap-1">
                  <button onClick={() => handleEmail(template)} className={`p-1.5 rounded-md ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`} title="Email">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDownloadPDF(template)} className={`p-1.5 rounded-md ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`} title="Download PDF">
                    <Download className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDownloadWord(template)} className={`p-1.5 rounded-md ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`} title="Download Word">
                    <FileTextIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handlePrint(template)} className={`p-1.5 rounded-md ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`} title="Print">
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingTemplate(template)} className={`p-1.5 rounded-md ${isDark ? 'hover:bg-slate-800 text-indigo-400' : 'hover:bg-slate-100 text-indigo-600'}`} title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(template.id)} className={`p-1.5 rounded-md ${isDark ? 'hover:bg-slate-800 text-red-400' : 'hover:bg-slate-100 text-red-600'}`} title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

function FileTextIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  )
}
