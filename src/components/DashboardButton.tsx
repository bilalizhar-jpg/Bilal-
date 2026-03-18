import React from 'react';
import { Home} from 'lucide-react';
import { useNavigate} from 'react-router-dom';

export default function DashboardButton() {
 const navigate = useNavigate();
 
 return (
 <button
 onClick={() => navigate('/dashboard')}
 className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700'
}`}
 >
 <Home className="w-4 h-4"/>
 <span className="font-black uppercase tracking-widest text-[10px]">Dashboard</span>
 </button>
 );
}
