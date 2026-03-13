import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Printer, 
  Download, 
  Eye, 
  Edit3, 
  Trash2,
  Filter,
  FileText,
  Loader2
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import { getAppraisals, deleteAppraisal, AppraisalRecord } from '../../utils/appraisalStore';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Add type definition for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function PerformanceAppraisalList() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<AppraisalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await getAppraisals();
      setRecords(data);
    } catch (error) {
      console.error("Error fetching appraisals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this appraisal record?')) {
      try {
        await deleteAppraisal(id);
        setRecords(records.filter(r => r.id !== id));
      } catch (error) {
        alert("Failed to delete record");
      }
    }
  };

  const handleDownload = (format: string) => {
    if (records.length === 0) {
      alert("No data to export");
      return;
    }

    const exportData = records.map((r, idx) => ({
      'Sl': idx + 1,
      'Employee Name': r.employeeName,
      'Employee ID': r.employeeId,
      'Department': r.department,
      'Appraisal Date': r.appraisalDate,
      'Period': r.period,
      'Score': `${r.score}%`,
      'Status': r.status
    }));

    if (format === 'CSV' || format === 'Excel') {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Appraisals");
      XLSX.writeFile(wb, `Appraisal_List_${new Date().toISOString().split('T')[0]}.${format === 'CSV' ? 'csv' : 'xlsx'}`);
    } else if (format === 'PDF') {
      const doc = new jsPDF();
      doc.text("Performance Appraisal List", 14, 15);
      
      const tableColumn = ["Sl", "Employee Name", "Employee ID", "Department", "Appraisal Date", "Period", "Score", "Status"];
      const tableRows = exportData.map(item => [
        item.Sl,
        item['Employee Name'],
        item['Employee ID'],
        item.Department,
        item['Appraisal Date'],
        item.Period,
        item.Score,
        item.Status
      ]);

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
      });
      doc.save(`Appraisal_List_${new Date().toISOString().split('T')[0]}.pdf`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center no-print">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Performance Appraisal List</h2>
          <Link 
            to="/performance/appraisal-report"
            className="bg-[#00FFCC] text-[#1E1E2F] px-4 py-2 rounded-lg text-sm font-black uppercase hover:bg-[#00D1FF] shadow-[0_0_8px_rgba(0,255,204,0.4)] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Appraisal
          </Link>
        </div>

        {/* Filter Card */}
        <div className="bg-[#2A2A3D] rounded-2xl border border-white/5 shadow-[0_4px_20px_rgba(0,255,204,0.05)] overflow-hidden no-print">
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <h2 className="font-black text-white uppercase tracking-tight">Filter Appraisals</h2>
            <button className="bg-[#00FFCC] text-[#1E1E2F] px-3 py-1.5 rounded text-xs font-black uppercase hover:bg-[#00D1FF] flex items-center gap-1.5 shadow-[0_0_8px_rgba(0,255,204,0.4)]">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>
          <div className="p-6 flex items-center gap-4">
            <div className="flex-1 max-w-sm relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0C3]" />
              <input 
                type="text" 
                placeholder="Search by employee name or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-white/10 bg-[#1E1E2F] text-white rounded-lg text-sm outline-none focus:border-[#00FFCC] transition-all"
              />
            </div>
            <button className="bg-[#00FFCC] text-[#1E1E2F] px-6 py-2 rounded-lg text-sm font-black uppercase hover:bg-[#00D1FF] shadow-[0_0_8px_rgba(0,255,204,0.4)]">
              Find
            </button>
            <button className="bg-[#2A2A3D] text-[#B0B0C3] px-6 py-2 rounded-lg text-sm font-black uppercase hover:bg-[#3A3A5D] border border-white/10 transition-colors">
              Reset
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-[#2A2A3D] rounded-2xl border border-white/5 shadow-[0_4px_20px_rgba(0,255,204,0.05)] overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 no-print">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#B0B0C3]">Show</span>
                <select className="border border-white/10 bg-[#1E1E2F] text-white rounded-lg px-2 py-1 text-sm outline-none focus:border-[#00FFCC]">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
                <span className="text-sm text-[#B0B0C3]">entries</span>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => handleDownload('CSV')} className="bg-[#2A2A3D] text-[#00FFCC] px-3 py-1.5 rounded text-xs font-black uppercase hover:bg-[#3A3A5D] border border-[#00FFCC]/20">CSV</button>
                <button onClick={() => handleDownload('Excel')} className="bg-[#2A2A3D] text-[#00FFCC] px-3 py-1.5 rounded text-xs font-black uppercase hover:bg-[#3A3A5D] border border-[#00FFCC]/20">Excel</button>
                <button onClick={() => handleDownload('PDF')} className="bg-[#2A2A3D] text-[#FF4444] px-3 py-1.5 rounded text-xs font-black uppercase hover:bg-[#3A3A5D] border border-[#FF4444]/20">PDF</button>
                <button onClick={() => window.print()} className="bg-[#2A2A3D] text-[#B0B0C3] px-3 py-1.5 rounded text-xs font-black uppercase hover:bg-[#3A3A5D] border border-white/10">Print</button>
              </div>
            </div>

            <div className="overflow-x-auto border border-white/5 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1E1E2F] border-b border-white/5">
                    <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Sl</th>
                    <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Employee Name</th>
                    <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Employee ID</th>
                    <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Department</th>
                    <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Appraisal Date</th>
                    <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Period</th>
                    <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Score</th>
                    <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-[10px] font-black text-[#B0B0C3] uppercase tracking-wider no-print">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 text-[#00FFCC] animate-spin" />
                          <p className="text-sm text-[#B0B0C3]">Loading appraisals...</p>
                        </div>
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-[#B0B0C3] text-sm">
                        No appraisal records found.
                      </td>
                    </tr>
                  ) : records.filter(r => r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || r.employeeId.toLowerCase().includes(searchTerm.toLowerCase())).map((record, idx) => (
                    <tr key={record.id} className="hover:bg-[#1E1E2F]/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-[#B0B0C3]">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-black text-white">{record.employeeName}</td>
                      <td className="px-4 py-3 text-sm text-[#B0B0C3]">{record.employeeId}</td>
                      <td className="px-4 py-3 text-sm text-[#B0B0C3]">{record.department}</td>
                      <td className="px-4 py-3 text-sm text-[#B0B0C3]">{record.appraisalDate}</td>
                      <td className="px-4 py-3 text-sm text-[#B0B0C3]">{record.period}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                          record.score >= 90 ? 'bg-[#00FFCC]/20 text-[#00FFCC]' :
                          record.score >= 80 ? 'bg-blue-500/20 text-blue-400' :
                          record.score >= 70 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {record.score}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                          record.status === 'Completed' ? 'bg-[#00FFCC]/20 text-[#00FFCC]' : 'bg-[#3A3A5D] text-[#B0B0C3]'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm no-print">
                        <div className="flex gap-2">
                          <Link 
                            to={`/performance/appraisal-report?id=${record.id}`}
                            className="p-1.5 bg-[#2A2A3D] text-[#00FFCC] rounded hover:bg-[#3A3A5D] transition-colors border border-[#00FFCC]/20"
                            title="View/Edit"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(record.id)}
                            className="p-1.5 bg-[#2A2A3D] text-red-400 rounded hover:bg-[#3A3A5D] transition-colors border border-red-400/20"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
