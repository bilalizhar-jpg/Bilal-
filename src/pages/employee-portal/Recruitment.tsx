import React from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { UserCheck, Plus, CheckCircle2, Clock, XCircle} from 'lucide-react';

export default function EmployeeRecruitment() {
 
 const referrals = [
 { id: 'REF-001', candidate: 'Jane Doe', position: 'Senior Frontend Developer', date: 'Feb 15, 2026', status: 'Hired', bonus: '$1,000'},
 { id: 'REF-002', candidate: 'John Smith', position: 'Product Manager', date: 'Mar 02, 2026', status: 'Interviewing', bonus: 'Pending'},
 { id: 'REF-003', candidate: 'Alice Johnson', position: 'UX Designer', date: 'Jan 10, 2026', status: 'Rejected', bonus: '-'},
 ];

 return (
 <EmployeeLayout>
 <div className="space-y-8 max-w-6xl mx-auto">
 <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
 <div>
 <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Employee Referrals</h1>
 <p className="text-slate-500 mt-2 text-lg">Refer candidates for open positions and track their progress.</p>
 </div>
 <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
 <Plus className="w-5 h-5"/>
 Refer Candidate
 </button>
 </div>

 <div className={`rounded-3xl border shadow-xl overflow-hidden bg-white border-slate-100`}>
 <div className="p-8 border-b border-slate-100 flex items-center justify-between">
 <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
 <UserCheck className="w-6 h-6 text-indigo-600"/>
 My Referrals
 </h3>
 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total: {referrals.length}</span>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
 <th className="p-6 border-b border-slate-100">Referral ID</th>
 <th className="p-6 border-b border-slate-100">Candidate Name</th>
 <th className="p-6 border-b border-slate-100">Position</th>
 <th className="p-6 border-b border-slate-100">Date Referred</th>
 <th className="p-6 border-b border-slate-100">Referral Bonus</th>
 <th className="p-6 border-b border-slate-100">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {referrals.map((ref) => (
 <tr key={ref.id} className="group hover:bg-slate-50/50 transition-colors">
 <td className="p-6 text-sm font-bold text-slate-900 group-hover:text-indigo-500 transition-colors">{ref.id}</td>
 <td className="p-6 text-sm font-bold text-slate-900">{ref.candidate}</td>
 <td className="p-6 text-sm text-slate-600 font-medium">{ref.position}</td>
 <td className="p-6 text-sm text-slate-600">{ref.date}</td>
 <td className="p-6 text-sm text-slate-600 font-bold">{ref.bonus}</td>
 <td className="p-6">
 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
 ref.status === 'Hired' ? 'bg-emerald-100 text-emerald-700 ' :
 ref.status === 'Interviewing' ? 'bg-blue-100 text-blue-700 ' :
 'bg-slate-100 text-slate-700 '
}`}>
 {ref.status === 'Hired' && <CheckCircle2 className="w-3.5 h-3.5"/>}
 {ref.status === 'Interviewing' && <Clock className="w-3.5 h-3.5"/>}
 {ref.status === 'Rejected' && <XCircle className="w-3.5 h-3.5"/>}
 {ref.status}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </EmployeeLayout>
 );
}
