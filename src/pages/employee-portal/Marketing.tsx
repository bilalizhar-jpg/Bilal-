import React from 'react';
import EmployeeLayout from '../../components/EmployeeLayout';
import { MessageSquare, Lock} from 'lucide-react';

export default function EmployeeMarketing() {
 
 return (
 <EmployeeLayout>
 <div className="space-y-8 max-w-5xl mx-auto">
 <div>
 <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Marketing Campaigns</h1>
 <p className="text-slate-500 mt-2 text-lg">Manage email marketing and campaigns.</p>
 </div>

 <div className={`rounded-3xl border shadow-2xl shadow-indigo-500/5 flex flex-col items-center justify-center py-24 px-8 text-center transition-all ${
 'bg-white border-slate-100'
}`}>
 <div className="relative mb-8">
 <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-pulse"></div>
 <div className={`relative w-20 h-20 rounded-full flex items-center justify-center border-2 ${
 'bg-indigo-50 border-indigo-200 text-indigo-600'
}`}>
 <Lock className="w-10 h-10"/>
 </div>
 </div>
 
 <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Access Restricted</h2>
 <p className="text-slate-500 max-w-md leading-relaxed text-lg">
 You currently do not have permission to access the Marketing module. Please contact your administrator if you need access to this section.
 </p>
 
 <div className="mt-10 flex flex-col sm:flex-row gap-4">
 <button className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
 Request Access
 </button>
 <button className={`px-8 py-3 rounded-xl font-bold transition-all active:scale-95 ${
 'bg-slate-100 text-slate-900 hover:bg-slate-200'
}`}>
 Return to Dashboard
 </button>
 </div>
 </div>
 </div>
 </EmployeeLayout>
 );
}
