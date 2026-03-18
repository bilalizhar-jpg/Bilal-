import React, { useState} from 'react';
import { Upload, Plus, FolderPlus, Copy, List as ListIcon, HelpCircle, Lock, MoreVertical} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useMarketing} from '../../context/MarketingContext';

export default function EmailLists() {
 const { emailLists, addEmailList} = useMarketing();
 const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'lists'>('lists');
 const [folders, setFolders] = useState(['General']);
 const [newFolder, setNewFolder] = useState('');
 const [selectedFolder, setSelectedFolder] = useState('General');
 const [listName, setListName] = useState('');
 const [pastedData, setPastedData] = useState('');

 const handleCreateFolder = () => {
 if (newFolder && !folders.includes(newFolder)) {
 setFolders([...folders, newFolder]);
 setSelectedFolder(newFolder);
 setNewFolder('');
}
};

 const handleSaveList = async () => {
 if (!listName) return;
 
 // Count contacts from pasted data if available
 let count = 0;
 if (activeTab === 'paste' && pastedData) {
 count = pastedData.split('\n').filter(line => line.trim() !== '').length;
} else {
 // Just a random count for demo if no data pasted
 count = Math.floor(Math.random() * 1000) + 50;
}
 
 await addEmailList({
 name: listName,
 folder: selectedFolder,
 count: count,
 date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric'}) + ' ' + new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit'})
});
 
 setActiveTab('lists');
 setListName('');
 setPastedData('');
};

 return (
 <AdminLayout>
 <div className="space-y-6">
 <div className="flex justify-between items-center">
 <div>
 <h1 className="text-2xl font-bold text-slate-800">Email Database</h1>
 <p className="text-sm text-slate-500 mt-1">Manage your email lists and contacts</p>
 </div>
 <div className="flex gap-2">
 <button 
 onClick={() => setActiveTab('upload')}
 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 '}`}
 >
 <Upload className="w-4 h-4 inline-block mr-2"/>
 Upload CSV
 </button>
 <button 
 onClick={() => setActiveTab('paste')}
 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'paste' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 '}`}
 >
 <Copy className="w-4 h-4 inline-block mr-2"/>
 Copy & Paste
 </button>
 <button 
 onClick={() => setActiveTab('lists')}
 className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'lists' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 '}`}
 >
 <ListIcon className="w-4 h-4 inline-block mr-2"/>
 View Lists
 </button>
 </div>
 </div>

 {(activeTab === 'upload' || activeTab === 'paste') && (
 <div className="bg-white rounded-lg border border-slate-200 p-6 max-w-4xl">
 <div className="flex justify-between items-start mb-6">
 <div>
 <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
 <span className="flex items-center justify-center w-6 h-6 rounded-full border border-slate-300 text-sm">1</span>
 Import your data
 </h2>
 <p className="text-slate-600 mt-2">
 Copy and paste your contacts and their<br/>information from a file.
 </p>
 </div>
 <a href="#"className="text-indigo-600 hover:underline flex items-center gap-1 text-sm font-medium">
 <HelpCircle className="w-4 h-4"/>
 Show the<br/>expected syntax
 </a>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">List Name</label>
 <input 
 type="text"
 value={listName}
 onChange={(e) => setListName(e.target.value)}
 placeholder="e.g., Summer Campaign 2026"
 className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
 />
 </div>
 
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1">Select Folder</label>
 <div className="flex gap-2">
 <select 
 value={selectedFolder}
 onChange={(e) => setSelectedFolder(e.target.value)}
 className="flex-1 px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
 >
 {folders.map(f => <option key={f} value={f}>{f}</option>)}
 </select>
 </div>
 </div>
 </div>

 <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
 <label className="block text-sm font-medium text-slate-700 mb-2">Or Create New Folder</label>
 <div className="flex gap-2">
 <input 
 type="text"
 value={newFolder}
 onChange={(e) => setNewFolder(e.target.value)}
 placeholder="New folder name"
 className="flex-1 px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
 />
 <button 
 onClick={handleCreateFolder}
 className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
 >
 <FolderPlus className="w-4 h-4"/>
 </button>
 </div>
 </div>

 {activeTab === 'upload' ? (
 <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
 <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4"/>
 <h3 className="text-lg font-medium text-slate-900 mb-1">Drag and drop your CSV file</h3>
 <p className="text-sm text-slate-500 mb-4">File must contain"Name"and"Email"columns</p>
 <button className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-md font-medium hover:bg-indigo-100 transition-colors">
 Browse Files
 </button>
 </div>
 ) : (
 <div className="mb-4">
 <div className="border border-slate-300 rounded-md overflow-hidden flex bg-slate-50">
 <textarea 
 value={pastedData}
 onChange={(e) => setPastedData(e.target.value)}
 rows={8}
 className="w-full px-3 py-3 bg-transparent text-slate-900 focus:outline-none font-mono text-sm whitespace-pre overflow-x-auto"
 spellCheck="false"
 placeholder="Paste your CSV data here..."
 ></textarea>
 </div>
 
 <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
 <Lock className="w-4 h-4"/>
 <span>We don't sell, rent or use your database for any commercial purposes.</span>
 </div>
 <a href="#"className="text-sm text-slate-900 underline mt-1 inline-block">Read our Privacy Policy</a>
 </div>
 )}

 <div className="mt-6 flex justify-end">
 <button 
 onClick={handleSaveList}
 disabled={!listName && activeTab === 'upload'}
 className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Save List
 </button>
 </div>
 </div>
 )}

 {activeTab === 'lists' && (
 <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
 {emailLists.length === 0 ? (
 <div className="p-12 text-center text-slate-500">
 <ListIcon className="w-12 h-12 mx-auto mb-4 opacity-50"/>
 <h3 className="text-lg font-medium text-slate-900">No email lists found</h3>
 <p className="text-sm">Create your first email list by uploading a CSV or pasting data.</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-sm">
 <thead className="bg-white text-slate-600 border-b border-slate-200">
 <tr>
 <th className="px-6 py-4 font-semibold">Lists</th>
 <th className="px-6 py-4 font-semibold">ID</th>
 <th className="px-6 py-4 font-semibold">Folder</th>
 <th className="px-6 py-4 font-semibold">Contacts</th>
 <th className="px-6 py-4 font-semibold">Creation date</th>
 <th className="px-6 py-4 font-semibold text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100">
 {emailLists.map((list) => (
 <tr key={list.id} className="hover:bg-slate-50 transition-colors">
 <td className="px-6 py-4 font-medium text-slate-900 underline cursor-pointer">{list.name}</td>
 <td className="px-6 py-4 text-slate-500">{list.id}</td>
 <td className="px-6 py-4 text-slate-500">{list.folder}</td>
 <td className="px-6 py-4 text-slate-500">{(list.count || 0).toLocaleString()}</td>
 <td className="px-6 py-4 text-slate-500">{list.date}</td>
 <td className="px-6 py-4 text-right">
 <button className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
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
 )}
 </div>
 </AdminLayout>
 );
}
