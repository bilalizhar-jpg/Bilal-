import React, { useState} from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Save, Link as LinkIcon, Copy, Settings, CheckCircle2} from 'lucide-react';

export default function CareerPageSettings() {
 const [domain, setDomain] = useState('');
 const [copied, setCopied] = useState(false);
 
 const handleCopy = (text: string) => {
 navigator.clipboard.writeText(text);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
};

 return (
 <AdminLayout>
 <div className="max-w-5xl mx-auto space-y-6">
 <div className="flex justify-between items-center">
 <h1 className="text-2xl font-bold text-gray-900">
 Career Page Settings
 </h1>
 <button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
 <Save className="w-4 h-4"/>
 Save Changes
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
 {/* Sidebar Navigation */}
 <div className="col-span-1 bg-white border-gray-200 border rounded-xl p-4 h-fit">
 <nav className="space-y-1">
 <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-gray-100 text-black">
 <Settings className="w-4 h-4"/>
 General
 </button>
 <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50">
 <LinkIcon className="w-4 h-4"/>
 Connect
 </button>
 <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50">
 <Settings className="w-4 h-4"/>
 Policy
 </button>
 </nav>
 </div>

 {/* Main Content */}
 <div className="col-span-1 md:col-span-3 space-y-6">
 {/* Connect Section */}
 <div className="bg-white border-gray-200 border rounded-xl overflow-hidden">
 <div className="p-4 border-b border-gray-100">
 <h2 className="font-bold text-gray-900">Connect</h2>
 </div>
 
 <div className="p-6 space-y-8">
 {/* Use your own domain */}
 <div className="space-y-4">
 <div className="flex items-center gap-2">
 <h3 className="font-medium text-gray-900">Use your own domain</h3>
 <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Recommended</span>
 </div>
 <p className="text-sm text-gray-500">
 Generate and add all of these records to your DNS settings.
 </p>
 
 <div className="space-y-2">
 <label className="block text-xs font-medium text-gray-700">Your own domain</label>
 <div className="flex gap-3">
 <input 
 type="text"
 placeholder="Enter your own domain here. eg. yourdomain.com"
 value={domain}
 onChange={(e) => setDomain(e.target.value)}
 className="flex-1 px-3 py-2 text-sm rounded-md border focus:ring-1 focus:ring-black outline-none transition-all bg-white border-gray-300 text-gray-900 placeholder-gray-400"
 />
 <button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
 Generate
 </button>
 </div>
 </div>
 </div>

 <hr className="border-gray-200"/>

 {/* Link to hosted career page */}
 <div className="space-y-4">
 <div className="flex items-center gap-2">
 <h3 className="font-medium text-gray-900">Link to your hosted career page</h3>
 <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Beginner</span>
 </div>
 <p className="text-sm text-gray-500">
 This method requires very little work. Simply copy-paste the link below on your organization website to direct candidates to your career page.
 </p>
 
 <div className="flex gap-3">
 <input 
 type="text"
 readOnly
 value={`${window.location.origin}/careers`}
 className="flex-1 px-3 py-2 text-sm rounded-md border outline-none font-mono bg-gray-50 border-gray-300 text-gray-600"
 />
 <button 
 onClick={() => handleCopy(`${window.location.origin}/careers`)}
 className="px-4 py-2 rounded-md text-sm font-medium border transition-colors flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
 >
 {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <Copy className="w-4 h-4"/>}
 Copy
 </button>
 <a 
 href="/careers"
 target="_blank"
 rel="noopener noreferrer"
 className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
 >
 <LinkIcon className="w-4 h-4"/>
 View Page
 </a>
 </div>
 </div>

 <hr className="border-gray-200"/>

 {/* iFrame */}
 <div className="space-y-4">
 <div className="flex items-center gap-2">
 <h3 className="font-medium text-gray-900">iFrame</h3>
 <span className="text-[10px] font-bold text-black bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Advanced</span>
 </div>
 <p className="text-sm text-gray-500">
 With the support of your IT team, add the iFrame script below to your website where you would like your jobs to be displayed. Any edits of your jobs in Career Page will automatically be reflected on your website.
 </p>
 
 <div className="grid grid-cols-3 gap-4">
 <div className="space-y-1">
 <label className="block text-xs font-medium text-gray-700">Width</label>
 <input 
 type="text"
 defaultValue="100%"
 className="w-full px-3 py-2 text-sm rounded-md border focus:ring-1 focus:ring-black outline-none transition-all bg-white border-gray-300 text-gray-900"
 />
 </div>
 <div className="space-y-1">
 <label className="block text-xs font-medium text-gray-700">Height</label>
 <input 
 type="text"
 defaultValue="100%"
 className="w-full px-3 py-2 text-sm rounded-md border focus:ring-1 focus:ring-black outline-none transition-all bg-white border-gray-300 text-gray-900"
 />
 </div>
 <div className="space-y-1">
 <label className="block text-xs font-medium text-gray-700">Border</label>
 <input 
 type="text"
 defaultValue="0"
 className="w-full px-3 py-2 text-sm rounded-md border focus:ring-1 focus:ring-black outline-none transition-all bg-white border-gray-300 text-gray-900"
 />
 </div>
 </div>

 <div className="space-y-1">
 <label className="block text-xs font-medium text-gray-700">Copy html tag</label>
 <div className="flex gap-3">
 <input 
 type="text"
 readOnly
 value={`<iframe src="${window.location.origin}/careers?include_header=true"style="width:100%; height:100%; border:0px;"></iframe>`}
 className="flex-1 px-3 py-2 text-sm rounded-md border outline-none font-mono bg-gray-50 border-gray-300 text-gray-600"
 />
 <button 
 onClick={() => handleCopy(`<iframe src="${window.location.origin}/careers?include_header=true"style="width:100%; height:100%; border:0px;"></iframe>`)}
 className="px-4 py-2 rounded-md text-sm font-medium border transition-colors flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
 >
 <Copy className="w-4 h-4"/>
 Copy
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </AdminLayout>
 );
}
