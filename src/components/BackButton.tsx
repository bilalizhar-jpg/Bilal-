import React from 'react';
import { ArrowLeft} from 'lucide-react';
import { useNavigate} from 'react-router-dom';

export default function BackButton() {
 const navigate = useNavigate();
 
 return (
 <button
 onClick={() => navigate(-1)}
 className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
}`}
 >
 <ArrowLeft className="w-4 h-4"/>
 <span className="font-black uppercase tracking-widest text-[10px]">Back</span>
 </button>
 );
}
