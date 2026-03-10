import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Plus, Search, Trash2, Edit2, FolderPlus, Layers } from 'lucide-react';
import { useCompanyData } from '../../../context/CompanyDataContext';
import { useTheme } from '../../../context/ThemeContext';

export default function LedgerManagement() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { ledgers, ledgerGroups, addEntity, deleteEntity } = useCompanyData();
  const [activeTab, setActiveTab] = useState<'list' | 'groups'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const [ledgerForm, setLedgerForm] = useState({
    name: '',
    groupId: '',
    openingBalance: 0
  });

  const [groupForm, setGroupForm] = useState({
    name: '',
    type: 'Asset'
  });

  const handleAddLedger = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEntity('ledgers', {
        ...ledgerForm,
        currentBalance: ledgerForm.openingBalance,
        createdAt: new Date().toISOString()
      });
      setShowAddModal(false);
      setLedgerForm({ name: '', groupId: '', openingBalance: 0 });
    } catch (error) {
      console.error('Error adding ledger:', error);
    }
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEntity('ledgerGroups', {
        ...groupForm,
        createdAt: new Date().toISOString()
      });
      setShowGroupModal(false);
      setGroupForm({ name: '', type: 'Asset' });
    } catch (error) {
      console.error('Error adding group:', error);
    }
  };

  const getGroupName = (id: string) => {
    return ledgerGroups.find(g => g.id === id)?.name || 'Unknown Group';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
            <Book className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-800'}`}>Ledger Management</h1>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Manage your chart of accounts and ledger groups</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGroupModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            Add Group
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Ledger
          </button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-white/5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'list' 
              ? (isDark ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white text-indigo-600 shadow-sm') 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Ledger List
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === 'groups' 
              ? (isDark ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white text-indigo-600 shadow-sm') 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Ledger Groups
        </button>
      </div>

      <div className={`p-6 rounded-3xl border ${isDark ? 'bg-black/40 border-white/5 backdrop-blur-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        {activeTab === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Ledger Name</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Group</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance</th>
                  <th className="px-4 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ledgers.map((ledger) => (
                  <tr key={ledger.id} className={`group transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>{ledger.name}</span>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-slate-500">{getGroupName(ledger.groupId)}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        ${ledger.currentBalance?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-600'}`}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => deleteEntity('ledgers', ledger.id)}
                          className={`p-2 rounded-lg transition-all ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-600'}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ledgerGroups.map((group) => (
              <div key={group.id} className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <button 
                    onClick={() => deleteEntity('ledgerGroups', group.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-800'}`}>{group.name}</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{group.type}</p>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {ledgers.filter(l => l.groupId === group.id).length} Ledgers
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Ledger Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-8 rounded-3xl border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-2xl'}`}
            >
              <h2 className={`text-xl font-black uppercase tracking-tighter mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Add New Ledger</h2>
              <form onSubmit={handleAddLedger} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ledger Name</label>
                  <input
                    required
                    type="text"
                    value={ledgerForm.name}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ledger Group</label>
                  <select
                    required
                    value={ledgerForm.groupId}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, groupId: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="">Select Group</option>
                    {ledgerGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Opening Balance</label>
                  <input
                    type="number"
                    value={ledgerForm.openingBalance}
                    onChange={(e) => setLedgerForm({ ...ledgerForm, openingBalance: parseFloat(e.target.value) })}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`flex-1 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                      isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Save Ledger
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Group Modal */}
      <AnimatePresence>
        {showGroupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-8 rounded-3xl border ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200 shadow-2xl'}`}
            >
              <h2 className={`text-xl font-black uppercase tracking-tighter mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Add Ledger Group</h2>
              <form onSubmit={handleAddGroup} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Group Name</label>
                  <input
                    required
                    type="text"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Group Type</label>
                  <select
                    required
                    value={groupForm.type}
                    onChange={(e) => setGroupForm({ ...groupForm, type: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Equity">Equity</option>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowGroupModal(false)}
                    className={`flex-1 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                      isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                  >
                    Save Group
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
