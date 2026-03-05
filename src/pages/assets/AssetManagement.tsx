import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  Save, 
  Edit3, 
  Search,
  Laptop,
  Headphones,
  Smartphone,
  Cpu,
  MoreVertical,
  Filter
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { useCompanyData } from '../../context/CompanyDataContext';

interface Asset {
  id: string;
  assetType: 'Computer' | 'Headphone' | 'Mobile' | 'SIM' | 'Other';
  assetName: string;
  serialNumber: string;
  assignedTo: string;
  assignedDate: string;
  status: 'In Use' | 'In Stock' | 'Under Repair' | 'Retired';
}

export default function AssetManagement() {
  const { theme } = useTheme();
  const { assets, addEntity, updateEntity, deleteEntity } = useCompanyData();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset record?')) {
      await deleteEntity('assets', id);
    }
  };

  const handleUpdate = async (id: string, field: keyof Asset, value: string) => {
    await updateEntity('assets', id, { [field]: value });
  };

  const handleAddNew = async () => {
    const newAsset = {
      assetType: 'Other',
      assetName: 'New Asset',
      serialNumber: '',
      assignedTo: '',
      assignedDate: '',
      status: 'In Stock'
    };
    await addEntity('assets', newAsset);
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'Computer': return <Laptop className="w-4 h-4" />;
      case 'Headphone': return <Headphones className="w-4 h-4" />;
      case 'Mobile': return <Smartphone className="w-4 h-4" />;
      case 'SIM': return <Cpu className="w-4 h-4" />;
      default: return <Plus className="w-4 h-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Company Asset Management</h2>
          <div className="flex gap-2">
            <button 
              onClick={handleAddNew}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Add New Asset
            </button>
            <button className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-700">
              <Printer className="w-4 h-4" />
              Print Inventory
            </button>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Assets" value={assets.length} icon={<Laptop className="w-5 h-5" />} color="bg-blue-500" isDark={isDark} />
          <StatCard label="In Use" value={assets.filter(a => a.status === 'In Use').length} icon={<Users className="w-5 h-5" />} color="bg-emerald-500" isDark={isDark} />
          <StatCard label="In Stock" value={assets.filter(a => a.status === 'In Stock').length} icon={<Save className="w-5 h-5" />} color="bg-amber-500" isDark={isDark} />
          <StatCard label="Under Repair" value={assets.filter(a => a.status === 'Under Repair').length} icon={<Settings className="w-5 h-5" />} color="bg-red-500" isDark={isDark} />
        </div>

        {/* Search & Filter */}
        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm p-4 flex flex-wrap items-center gap-4`}>
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by asset name, serial, or employee..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
            />
          </div>
          <button className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Assets Table */}
        <div className={`rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`${isDark ? 'bg-slate-800/50' : 'bg-slate-50'} border-b border-slate-100 dark:border-slate-800`}>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Asset Type</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Asset Name</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Serial Number</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Assigned To</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Assigned Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assets.filter(a => 
                  a.assetName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  a.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-100'} text-indigo-600`}>
                          {getAssetIcon(asset.assetType)}
                        </div>
                        <span className="text-slate-600 dark:text-slate-400">{asset.assetType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-white">
                      {editingId === asset.id ? (
                        <input 
                          type="text" 
                          value={asset.assetName}
                          onChange={(e) => handleUpdate(asset.id, 'assetName', e.target.value)}
                          className={`w-full border rounded px-2 py-1 text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                        />
                      ) : asset.assetName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {editingId === asset.id ? (
                        <input 
                          type="text" 
                          value={asset.serialNumber}
                          onChange={(e) => handleUpdate(asset.id, 'serialNumber', e.target.value)}
                          className={`w-full border rounded px-2 py-1 text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                        />
                      ) : asset.serialNumber}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {editingId === asset.id ? (
                        <input 
                          type="text" 
                          value={asset.assignedTo}
                          onChange={(e) => handleUpdate(asset.id, 'assignedTo', e.target.value)}
                          placeholder="Unassigned"
                          className={`w-full border rounded px-2 py-1 text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                        />
                      ) : (asset.assignedTo || <span className="text-slate-400 font-normal italic">Unassigned</span>)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {editingId === asset.id ? (
                        <input 
                          type="date" 
                          value={asset.assignedDate}
                          onChange={(e) => handleUpdate(asset.id, 'assignedDate', e.target.value)}
                          className={`w-full border rounded px-2 py-1 text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                        />
                      ) : (asset.assignedDate || '-')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editingId === asset.id ? (
                        <select 
                          value={asset.status}
                          onChange={(e) => handleUpdate(asset.id, 'status', e.target.value as any)}
                          className={`w-full border rounded px-2 py-1 text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                        >
                          <option>In Use</option>
                          <option>In Stock</option>
                          <option>Under Repair</option>
                          <option>Retired</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          asset.status === 'In Use' ? 'bg-green-100 text-green-700' :
                          asset.status === 'In Stock' ? 'bg-blue-100 text-blue-700' :
                          asset.status === 'Under Repair' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {asset.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingId(editingId === asset.id ? null : asset.id)}
                          className={`p-1.5 rounded transition-colors ${editingId === asset.id ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-white hover:bg-amber-500'}`}
                        >
                          {editingId === asset.id ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleDelete(asset.id)}
                          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, icon, color, isDark }: any) {
  return (
    <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm flex items-center gap-4`}>
      <div className={`p-3 rounded-lg ${color} text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</p>
      </div>
    </div>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function Settings({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
