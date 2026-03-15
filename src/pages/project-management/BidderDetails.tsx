import React, { useState } from 'react';
import { Plus, Edit3, Trash2, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { useCompanyData } from '../../context/CompanyDataContext';
import { useAuth } from '../../context/AuthContext';
import { useEmployees } from '../../context/EmployeeContext';

interface Bid {
  id: string;
  employeeName: string;
  date: string;
  source: string;
  jobTitle: string;
  jobLink: string;
  profile: string;
  bidType: string;
  bidRate: string;
  connectsToBid: number;
  boostedConnects: number;
  isViewed: boolean;
  isInterviewed: boolean;
  isHired: boolean;
  hiringRate: string;
  location: string;
  clientSpend: string;
}

export default function BidderDetails() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { bids: rawBids, addEntity, updateEntity, deleteEntity } = useCompanyData();
  const { user } = useAuth();
  const { employees } = useEmployees();
  const bids = rawBids as unknown as Bid[];

  const [isAdding, setIsAdding] = useState(false);
  const [editingBid, setEditingBid] = useState<Bid | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<Partial<Bid>>({
    employeeName: user?.name || '',
    date: new Date().toISOString().split('T')[0],
    source: '',
    jobTitle: '',
    jobLink: '',
    profile: 'Agency',
    bidType: 'Hourly',
    bidRate: '',
    connectsToBid: 0,
    boostedConnects: 0,
    isViewed: false,
    isInterviewed: false,
    isHired: false,
    hiringRate: '',
    location: '',
    clientSpend: ''
  });

  const handleSave = async () => {
    if (editingBid) {
      await updateEntity('bids', editingBid.id, formData);
    } else {
      await addEntity('bids', formData);
    }
    closeModal();
  };

  const handleEdit = (bid: Bid) => {
    setEditingBid(bid);
    setFormData(bid);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bid?')) {
      await deleteEntity('bids', id);
    }
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingBid(null);
    setFormData({
      employeeName: user?.name || '',
      date: new Date().toISOString().split('T')[0],
      source: '',
      jobTitle: '',
      jobLink: '',
      profile: 'Agency',
      bidType: 'Hourly',
      bidRate: '',
      connectsToBid: 0,
      boostedConnects: 0,
      isViewed: false,
      isInterviewed: false,
      isHired: false,
      hiringRate: '',
      location: '',
      clientSpend: ''
    });
  };

  const filteredBids = bids.filter(bid => 
    bid.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bid.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bid.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Bidder Details</h1>
            <p className="text-xs text-slate-500 mt-1">Project Management &gt; Bidder Details</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search bids..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-xl text-sm outline-none transition-all ${
                  isDark 
                    ? 'bg-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500' 
                    : 'bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
                }`}
              />
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Bid
            </button>
          </div>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={`text-xs uppercase tracking-wider ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Bidder</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Job Title</th>
                  <th className="px-4 py-3 font-medium">Job Link</th>
                  <th className="px-4 py-3 font-medium">Profile</th>
                  <th className="px-4 py-3 font-medium">Bid Type</th>
                  <th className="px-4 py-3 font-medium">Bid Rate ($)</th>
                  <th className="px-4 py-3 font-medium text-center">Connects</th>
                  <th className="px-4 py-3 font-medium text-center">Boosted</th>
                  <th className="px-4 py-3 font-medium text-center">Viewed</th>
                  <th className="px-4 py-3 font-medium text-center">Inter</th>
                  <th className="px-4 py-3 font-medium text-center">Hired</th>
                  <th className="px-4 py-3 font-medium">Hiring Rate</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Client Spend</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {filteredBids.map((bid) => (
                  <tr key={bid.id} className={`hover:${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} transition-colors`}>
                    <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{bid.date}</td>
                    <td className={`px-4 py-3 font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{bid.employeeName}</td>
                    <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{bid.source}</td>
                    <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{bid.jobTitle}</td>
                    <td className="px-4 py-3">
                      {bid.jobLink && (
                        <a href={bid.jobLink} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-400 truncate max-w-[150px] inline-block">
                          {bid.jobLink}
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                        {bid.profile}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                        {bid.bidType}
                      </span>
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{bid.bidRate}</td>
                    <td className={`px-4 py-3 text-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{bid.connectsToBid}</td>
                    <td className={`px-4 py-3 text-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{bid.boostedConnects}</td>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" checked={bid.isViewed} readOnly className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" checked={bid.isInterviewed} readOnly className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" checked={bid.isHired} readOnly className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    </td>
                    <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{bid.hiringRate}</td>
                    <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{bid.location}</td>
                    <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{bid.clientSpend}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(bid)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button onClick={() => handleDelete(bid.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredBids.length === 0 && (
                  <tr>
                    <td colSpan={16} className={`px-4 py-8 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      No bids found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}
              >
                <div className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {editingBid ? 'Edit Bid' : 'Add New Bid'}
                  </h2>
                  <button onClick={closeModal} className="text-slate-400 hover:text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bidder (Employee)</label>
                      <select
                        value={formData.employeeName || ''}
                        onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                          isDark ? 'bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
                        }`}
                      >
                        <option value="">Select Employee</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.name}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Date</label>
                      <input
                        type="date"
                        value={formData.date || ''}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                          isDark ? 'bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Source</label>
                      <input
                        type="text"
                        value={formData.source || ''}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        placeholder="e.g., Upwork, LinkedIn"
                        className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                          isDark ? 'bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Job Title</label>
                      <input
                        type="text"
                        value={formData.jobTitle || ''}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                          isDark ? 'bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Job Link</label>
                      <input
                        type="url"
                        value={formData.jobLink || ''}
                        onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                          isDark ? 'bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Profile</label>
                      <select
                        value={formData.profile || 'Agency'}
                        onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                          isDark ? 'bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
                        }`}
                      >
                        <option value="Agency">Agency</option>
                        <option value="Freelancer">Freelancer</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bid Type</label>
                      <select
                        value={formData.bidType || 'Hourly'}
                        onChange={(e) => setFormData({ ...formData, bidType: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                          isDark ? 'bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
                        }`}
                      >
                        <option value="Hourly">Hourly</option>
                        <option value="Fixed">Fixed</option>
                      </select>
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Bid Rate ($)</label>
                      <input
                        type="text"
                        value={formData.bidRate || ''}
                        onChange={(e) => setFormData({ ...formData, bidRate: e.target.value })}
                        placeholder="e.g., $45.00 - $65.00"
                        className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                          isDark ? 'bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
                        }`}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Connects</label>
                        <input
                          type="number"
                          value={formData.connectsToBid || 0}
                          onChange={(e) => setFormData({ ...formData, connectsToBid: parseInt(e.target.value) || 0 })}
                          className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                            isDark ? 'bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Boosted</label>
                        <input
                          type="number"
                          value={formData.boostedConnects || 0}
                          onChange={(e) => setFormData({ ...formData, boostedConnects: parseInt(e.target.value) || 0 })}
                          className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                            isDark ? 'bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
                          }`}
                        />
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 grid grid-cols-3 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isViewed || false}
                          onChange={(e) => setFormData({ ...formData, isViewed: e.target.checked })}
                          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Is Viewed</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isInterviewed || false}
                          onChange={(e) => setFormData({ ...formData, isInterviewed: e.target.checked })}
                          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Is Interviewed</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isHired || false}
                          onChange={(e) => setFormData({ ...formData, isHired: e.target.checked })}
                          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Is Hired</span>
                      </label>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Hiring Rate</label>
                      <input
                        type="text"
                        value={formData.hiringRate || ''}
                        onChange={(e) => setFormData({ ...formData, hiringRate: e.target.value })}
                        placeholder="e.g., 53%"
                        className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                          isDark ? 'bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Location</label>
                      <input
                        type="text"
                        value={formData.location || ''}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Ukraine, United States"
                        className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                          isDark ? 'bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
                        }`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Client Spend</label>
                      <input
                        type="text"
                        value={formData.clientSpend || ''}
                        onChange={(e) => setFormData({ ...formData, clientSpend: e.target.value })}
                        placeholder="e.g., $132K"
                        className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all ${
                          isDark ? 'bg-slate-800 text-white focus:ring-2 focus:ring-indigo-500' : 'bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-500 border border-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={closeModal}
                      className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                        isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                      Save Bid
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
