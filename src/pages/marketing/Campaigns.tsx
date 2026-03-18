import React, { useState} from 'react';
import { Search, ChevronDown, Plus, X, MoreVertical} from 'lucide-react';
import { useNavigate, Link} from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useMarketing} from '../../context/MarketingContext';

export default function Campaigns() {
 const navigate = useNavigate();
 const { campaigns} = useMarketing();
 const [isNamePopupOpen, setIsNamePopupOpen] = useState(false);
 const [isTypePopupOpen, setIsTypePopupOpen] = useState(false);
 const [campaignName, setCampaignName] = useState('');

 const handleNameSubmit = () => {
 if (campaignName.trim()) {
 setIsNamePopupOpen(false);
 setIsTypePopupOpen(true);
}
};

 const handleCreateEmailCampaign = () => {
 setIsTypePopupOpen(false);
 navigate('/marketing/templates');
};

 return (
 <AdminLayout>
 <div className="space-y-6">
 <div className="flex justify-between items-center">
 <h1 className="text-2xl font-bold text-slate-800">Email Campaigns</h1>
 <button 
 onClick={() => setIsNamePopupOpen(true)}
 className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
 >
 <Plus className="w-4 h-4"/>
 Create campaign
 </button>
 </div>

 <div className="bg-white rounded-lg border border-slate-200 p-6">
 <div className="flex gap-4 mb-6">
 <div className="relative w-64">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
 <input 
 type="text"
 placeholder="Search for a campaign"
 className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-slate-900"
 />
 </div>
 <div className="relative w-48">
 <select className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-slate-700 appearance-none">
 <option>All statuses</option>
 </select>
 <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"/>
 </div>
 </div>

 {campaigns.length === 0 ? (
 <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center py-12">
 <h2 className="text-xl font-bold text-slate-900 mb-2">You have not created any email campaigns</h2>
 <p className="text-slate-500 mb-6 text-sm">
 Click on"Create campaign"and start designing your first email campaign.
 </p>
 <button 
 onClick={() => setIsNamePopupOpen(true)}
 className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors"
 >
 Create campaign
 </button>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm">
 <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
 <tr>
 <th className="px-6 py-3 font-medium">Campaign Name</th>
 <th className="px-6 py-3 font-medium">Status</th>
 <th className="px-6 py-3 font-medium">Date</th>
 <th className="px-6 py-3 font-medium text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200">
 {campaigns.map((campaign) => (
 <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
 <td className="px-6 py-4">
 <Link to={`/marketing/logs?campaignId=${campaign.id}`} className="font-medium text-indigo-600 hover:underline">{campaign.name}</Link>
 <div className="text-slate-500 text-xs">{campaign.subject}</div>
 </td>
 <td className="px-6 py-4">
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
 campaign.status === 'Sent' ? 'bg-emerald-100 text-emerald-800 ' :
 campaign.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 ' :
 'bg-slate-100 text-slate-800 '
}`}>
 {campaign.status}
 </span>
 </td>
 <td className="px-6 py-4 text-slate-500">
 {new Date(campaign.date).toLocaleString()}
 </td>
 <td className="px-6 py-4 text-right">
 <button className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
 <MoreVertical className="w-4 h-4"/>
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>

 {isNamePopupOpen && (
 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
 <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
 <div className="flex justify-between items-center mb-4">
 <h3 className="text-lg font-bold text-slate-900">Add Campaign Name</h3>
 <button onClick={() => setIsNamePopupOpen(false)} className="text-slate-400 hover:text-slate-600">
 <X className="w-5 h-5"/>
 </button>
 </div>
 <input 
 type="text"
 value={campaignName}
 onChange={(e) => setCampaignName(e.target.value)}
 placeholder="Enter campaign name"
 className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none mb-4"
 />
 <div className="flex justify-end gap-2">
 <button onClick={() => setIsNamePopupOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
 <button onClick={handleNameSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Create</button>
 </div>
 </div>
 </div>
 )}

 {isTypePopupOpen && (
 <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
 <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-8">
 <div className="flex justify-between items-center mb-8">
 <h2 className="text-2xl font-bold text-slate-900">Create a campaign</h2>
 <button onClick={() => setIsTypePopupOpen(false)} className="text-slate-400 hover:text-slate-600">
 <X className="w-6 h-6"/>
 </button>
 </div>
 
 <div className="mb-6">
 <h3 className="text-lg font-semibold text-slate-900 mb-2">Standard</h3>
 <p className="text-slate-500">Create a one-off campaign from scratch.</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 {/* Email Option */}
 <button 
 onClick={handleCreateEmailCampaign}
 className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group bg-white"
 >
 <div className="w-24 h-24 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
 <svg width="64"height="64"viewBox="0 0 64 64"fill="none"xmlns="http://www.w3.org/2000/svg">
 <path d="M8 16L32 32L56 16"stroke="#10B981"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round"/>
 <rect x="8"y="16"width="48"height="32"rx="2"stroke="#10B981"strokeWidth="2"strokeLinecap="round"/>
 </svg>
 </div>
 <span className="font-semibold text-slate-900">Email</span>
 </button>

 {/* SMS Option */}
 <button 
 className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group bg-white relative opacity-70 cursor-not-allowed"
 >
 <div className="w-24 h-24 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
 <svg width="64"height="64"viewBox="0 0 64 64"fill="none"xmlns="http://www.w3.org/2000/svg">
 <path d="M16 48L8 56V16C8 11.5817 11.5817 8 16 8H48C52.4183 8 56 11.5817 56 16V40C56 44.4183 52.4183 48 48 48H16Z"stroke="#6366F1"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round"/>
 <circle cx="24"cy="28"r="3"fill="#6366F1"/>
 <circle cx="32"cy="28"r="3"fill="#6366F1"/>
 <circle cx="40"cy="28"r="3"fill="#6366F1"/>
 </svg>
 </div>
 <span className="font-semibold text-slate-900">SMS</span>
 <span className="absolute bottom-4 right-4 text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-800 rounded-full">Activate</span>
 </button>

 {/* WhatsApp Option */}
 <button 
 className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group bg-white opacity-70 cursor-not-allowed"
 >
 <div className="w-24 h-24 bg-green-50 rounded-lg flex items-center justify-center mb-4">
 <svg width="64"height="64"viewBox="0 0 64 64"fill="none"xmlns="http://www.w3.org/2000/svg">
 <path d="M32 56C45.2548 56 56 45.2548 56 32C56 18.7452 45.2548 8 32 8C18.7452 8 8 18.7452 8 32C8 36.3115 9.1368 40.3572 11.1098 43.856L8 56L20.144 52.8902C23.6428 54.8632 27.6885 56 32 56Z"stroke="#22C55E"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round"/>
 <path d="M24 24C24 24 26 24 27 26C28 28 29 30 29 30C29 30 29.5 31 28.5 32C27.5 33 26 34 26 34C26 34 28 38 32 40C36 42 36 42 36 42C36 42 37 40.5 38 39.5C39 38.5 40 39 40 39C40 39 42 40 44 41C46 42 46 42 46 42C46 42 46 44 44 46C42 48 38 48 38 48C38 48 32 46 26 40C20 34 18 28 18 28C18 28 18 24 20 22C22 20 24 24 24 24Z"stroke="#22C55E"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round"/>
 </svg>
 </div>
 <span className="font-semibold text-slate-900">WhatsApp</span>
 </button>

 {/* Push Option */}
 <button 
 className="flex flex-col items-center justify-center p-6 border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all group bg-white relative opacity-70 cursor-not-allowed"
 >
 <div className="w-24 h-24 bg-teal-50 rounded-lg flex items-center justify-center mb-4">
 <svg width="64"height="64"viewBox="0 0 64 64"fill="none"xmlns="http://www.w3.org/2000/svg">
 <rect x="12"y="16"width="40"height="32"rx="4"stroke="#0F766E"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round"/>
 <path d="M12 24H52"stroke="#0F766E"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round"/>
 <circle cx="18"cy="20"r="1.5"fill="#0F766E"/>
 <circle cx="24"cy="20"r="1.5"fill="#0F766E"/>
 <circle cx="30"cy="20"r="1.5"fill="#0F766E"/>
 <path d="M32 40C32 40 36 40 36 36C36 32 32 32 32 32C32 32 28 32 28 36C28 40 32 40 32 40Z"stroke="#0F766E"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round"/>
 <path d="M30 40V42C30 43.1046 30.8954 44 32 44C33.1046 44 34 43.1046 34 42V40"stroke="#0F766E"strokeWidth="2"strokeLinecap="round"strokeLinejoin="round"/>
 </svg>
 </div>
 <span className="font-semibold text-slate-900">Push</span>
 <span className="absolute bottom-4 right-4 text-[10px] font-bold px-2 py-1 bg-amber-400 text-amber-900 rounded-full">👑</span>
 </button>
 </div>
 </div>
 </div>
 )}
 </AdminLayout>
 );
}
