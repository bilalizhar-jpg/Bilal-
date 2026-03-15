import React, { useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { useCompanyData } from '../../context/CompanyDataContext';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TicketingHistoryReport() {
  const { theme } = useTheme();
  const { tickets } = useCompanyData();
  const isDark = theme === 'dark';

  const historyTickets = useMemo(() => {
    return tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed');
  }, [tickets]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <Link to="/reports" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Reports
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Ticketing History Report</h1>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className={`text-xs uppercase tracking-wider ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                <tr>
                  <th className="px-4 py-3 font-medium">Ticket ID</th>
                  <th className="px-4 py-3 font-medium">Requester</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Assigned To</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {historyTickets.map((ticket: any) => (
                  <tr key={ticket.id} className={`hover:${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} transition-colors`}>
                    <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{ticket.ticketId}</td>
                    <td className={`px-4 py-3 font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{ticket.requesterName}</td>
                    <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{ticket.priority}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{ticket.assignedTo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
