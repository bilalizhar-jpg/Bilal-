import React, { useState } from 'react';
import { Upload, Plus, FolderPlus, Copy, List as ListIcon, Search, Trash2, Edit, MoreVertical, HelpCircle, Lock } from 'lucide-react';

export default function EmailLists() {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'lists'>('lists');
  const [folders, setFolders] = useState(['General', 'Newsletter', 'Promotions', 'Your First Folder', 'UAE', 'Conversations contacts', 'marketing_automation']);
  const [newFolder, setNewFolder] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('Your First Folder');
  const [listName, setListName] = useState('');
  const [pastedData, setPastedData] = useState('CONTACT ID,EMAIL,FIRSTNAME,LASTNAME,SMS,LANDLINE_NUMBER,W\n123456,emma@example.com,Emma,Dubois,33612345678,33612345678,336123456\n789123,mickael@example.com,Mickael,Parker,15555551234,15555551234,1555555\n456789,ethan@example.com,Jakob,Müller,4930901820,4930901820,4930901820');
  
  const [lists, setLists] = useState([
    { id: '#15', name: 'New Date UAE', folder: 'UAE', count: 28, date: 'Jun 12, 2025 11:56' },
    { id: '#13', name: 'Contacts involved in conversations', folder: 'Conversations contacts', count: 1, date: 'Jan 09, 2025 23:11' },
    { id: '#11', name: 'List 7.7', folder: 'Your First Folder', count: 0, date: 'Jul 13, 2022 18:54' },
    { id: '#10', name: 'List 7', folder: 'Your First Folder', count: 1000, date: 'Jul 13, 2022 18:43' },
    { id: '#9', name: 'List 6', folder: 'Your First Folder', count: 1987, date: 'Jul 13, 2022 11:47' },
    { id: '#8', name: 'List 5', folder: 'Your First Folder', count: 1316, date: 'Jul 11, 2022 13:58' },
    { id: '#7', name: 'List 4', folder: 'Your First Folder', count: 3671, date: 'Jul 11, 2022 13:03' },
    { id: '#6', name: 'List three', folder: 'Your First Folder', count: 1289, date: 'Jul 09, 2022 21:17' },
    { id: '#5', name: 'identified_contacts', folder: 'marketing_automation', count: 0, date: 'Jul 09, 2022 07:08' },
    { id: '#3', name: 'List 2', folder: 'Your First Folder', count: 1000, date: 'Jul 08, 2022 20:32' },
    { id: '#2', name: 'Your first list', folder: 'Your First Folder', count: 1293, date: 'Jul 06, 2022 19:19' },
  ]);

  const handleCreateFolder = () => {
    if (newFolder && !folders.includes(newFolder)) {
      setFolders([...folders, newFolder]);
      setSelectedFolder(newFolder);
      setNewFolder('');
    }
  };

  const handleSaveList = () => {
    if (!listName) return;
    
    const newList = {
      id: `#${Math.floor(Math.random() * 100) + 20}`,
      name: listName,
      folder: selectedFolder,
      count: Math.floor(Math.random() * 500) + 10, // Mock count
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };
    
    setLists([newList, ...lists]);
    setActiveTab('lists');
    setListName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Email Database</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your email lists and contacts</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <Upload className="w-4 h-4 inline-block mr-2" />
            Upload CSV
          </button>
          <button 
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'paste' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <Copy className="w-4 h-4 inline-block mr-2" />
            Copy & Paste
          </button>
          <button 
            onClick={() => setActiveTab('lists')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'lists' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <ListIcon className="w-4 h-4 inline-block mr-2" />
            View Lists
          </button>
        </div>
      </div>

      {(activeTab === 'upload' || activeTab === 'paste') && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 max-w-4xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full border border-slate-300 text-sm">1</span>
                Import your data
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Copy and paste your contacts and their<br/>information from a file.
              </p>
            </div>
            <a href="#" className="text-indigo-600 hover:underline flex items-center gap-1 text-sm font-medium">
              <HelpCircle className="w-4 h-4" />
              Show the<br/>expected syntax
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">List Name</label>
              <input 
                type="text" 
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="e.g., Summer Campaign 2026"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Folder</label>
              <div className="flex gap-2">
                <select 
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {folders.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Or Create New Folder</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                placeholder="New folder name"
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button 
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {activeTab === 'upload' ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-12 text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Drag and drop your CSV file</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">File must contain "Name" and "Email" columns</p>
              <button className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md font-medium hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                Browse Files
              </button>
            </div>
          ) : (
            <div className="mb-4">
              <div className="border border-slate-300 dark:border-slate-600 rounded-md overflow-hidden flex bg-slate-50 dark:bg-slate-900">
                <div className="bg-slate-100 dark:bg-slate-800 text-slate-400 text-right py-3 px-2 font-mono text-sm select-none border-r border-slate-300 dark:border-slate-600 min-w-[2.5rem]">
                  {pastedData.split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <textarea 
                  value={pastedData}
                  onChange={(e) => setPastedData(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-3 bg-transparent text-slate-400 dark:text-slate-400 focus:outline-none font-mono text-sm whitespace-pre overflow-x-auto"
                  spellCheck="false"
                ></textarea>
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Lock className="w-4 h-4" />
                <span>We don't sell, rent or use your database for any commercial purposes.</span>
              </div>
              <a href="#" className="text-sm text-slate-900 dark:text-white underline mt-1 inline-block">Read our Privacy Policy</a>
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
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Lists</th>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Folder</th>
                  <th className="px-6 py-4 font-semibold">Contacts</th>
                  <th className="px-6 py-4 font-semibold">
                    <div className="flex items-center gap-1">
                      Creation date
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                    </div>
                  </th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {lists.map((list) => (
                  <tr key={list.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white underline cursor-pointer">{list.name}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{list.id}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{list.folder}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{list.count.toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{list.date}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
