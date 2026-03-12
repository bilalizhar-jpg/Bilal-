import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { Search, Plus, Filter, MoreVertical, ArrowUpDown, Download, RefreshCw, Columns, X, ChevronDown, ChevronRight } from 'lucide-react';

const FilterModal = ({ isOpen, onClose, onApply, companies, stages, statuses }: any) => {
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [isCompanyOpen, setIsCompanyOpen] = useState(true);
  const [isStageOpen, setIsStageOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const filteredCompanies = companies.filter((c: string) => c.toLowerCase().includes(companySearch.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`w-80 p-6 rounded-xl shadow-xl ${isDark ? 'bg-slate-800 text-white' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><Filter className="w-5 h-5" /> Filter</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <button className="flex items-center gap-2 font-semibold mb-2" onClick={() => setIsCompanyOpen(!isCompanyOpen)}>
              {isCompanyOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />} Company
            </button>
            {isCompanyOpen && (
              <div className="space-y-2 ml-6">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search" 
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className={`w-full pl-8 pr-2 py-1 rounded-md border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  />
                </div>
                {filteredCompanies.map((comp: string) => (
                  <label key={comp} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedCompanies.includes(comp)} onChange={(e) => e.target.checked ? setSelectedCompanies([...selectedCompanies, comp]) : setSelectedCompanies(selectedCompanies.filter(c => c !== comp))} />
                    {comp}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div>
            <button className="flex items-center gap-2 font-semibold mb-2" onClick={() => setIsStageOpen(!isStageOpen)}>
              {isStageOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />} Stage
            </button>
            {isStageOpen && (
              <div className="space-y-2 ml-6">
                {stages.map((stage: string) => (
                  <label key={stage} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedStages.includes(stage)} onChange={(e) => e.target.checked ? setSelectedStages([...selectedStages, stage]) : setSelectedStages(selectedStages.filter(s => s !== stage))} />
                    {stage}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div>
            <button className="flex items-center gap-2 font-semibold mb-2" onClick={() => setIsStatusOpen(!isStatusOpen)}>
              {isStatusOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />} Status
            </button>
            {isStatusOpen && (
              <div className="space-y-2 ml-6">
                {statuses.map((status: string) => (
                  <label key={status} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedStatuses.includes(status)} onChange={(e) => e.target.checked ? setSelectedStatuses([...selectedStatuses, status]) : setSelectedStatuses(selectedStatuses.filter(s => s !== status))} />
                    {status}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={() => { setSelectedCompanies([]); setSelectedStages([]); setSelectedStatuses([]); onApply([], [], []); }} className="flex-1 py-2 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-700">Reset</button>
          <button onClick={() => onApply(selectedCompanies, selectedStages, selectedStatuses)} className="flex-1 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Filter</button>
        </div>
      </div>
    </div>
  );
};
const ManageColumnsModal = ({ isOpen, onClose, columns, setColumns }: any) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`w-80 p-6 rounded-xl shadow-xl ${isDark ? 'bg-slate-800 text-white' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-lg font-bold flex items-center gap-2"><Columns className="w-5 h-5" /> Manage Columns</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {columns.map((col: any) => (
            <div key={col.id} className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm font-medium">
                <MoreVertical className="w-4 h-4 text-slate-400" /> {col.label}
              </span>
              <button 
                onClick={() => setColumns(columns.map((c: any) => c.id === col.id ? { ...c, visible: !c.visible } : c))}
                className={`w-10 h-5 rounded-full transition-colors relative ${col.visible ? 'bg-red-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${col.visible ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import AdminLayout from '../../components/AdminLayout';
import { useCompanyData } from '../../context/CompanyDataContext';

export default function Opportunities() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [activeCompanies, setActiveCompanies] = useState<string[]>([]);
  const [activeStages, setActiveStages] = useState<string[]>([]);
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);
  const [columns, setColumns] = useState([
    { id: 'id', label: 'Product ID', visible: true },
    { id: 'name', label: 'Product Name', visible: true },
    { id: 'company', label: 'Company', visible: true },
    { id: 'value', label: 'Expected Value', visible: true },
    { id: 'stage', label: 'Stage', visible: true },
    { id: 'probability', label: 'Probability', visible: false },
    { id: 'owner', label: 'Owner', visible: false },
    { id: 'closeDate', label: 'Expected Close Date', visible: true },
    { id: 'status', label: 'Status', visible: true },
    { id: 'action', label: 'Action', visible: true },
  ]);
  const { sales } = useCompanyData();

  const companies = Array.from(new Set(sales.map((opp: any) => opp.account))).filter(Boolean) as string[];
  const stages = Array.from(new Set(sales.map((opp: any) => opp.stage))).filter(Boolean) as string[];
  const statuses = Array.from(new Set(sales.map((opp: any) => opp.status))).filter(Boolean) as string[];

  const filteredOpportunities = sales.filter((opp: any) =>
    (opp.name.toLowerCase().includes(searchTerm.toLowerCase()) || opp.id.toString().includes(searchTerm)) &&
    (activeCompanies.length === 0 || activeCompanies.includes(opp.account)) &&
    (activeStages.length === 0 || activeStages.includes(opp.stage)) &&
    (activeStatuses.length === 0 || activeStatuses.includes(opp.status))
  );

  return (
    <AdminLayout>
      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        onApply={(comps: string[], stages: string[], stats: string[]) => { 
          setActiveCompanies(comps); 
          setActiveStages(stages); 
          setActiveStatuses(stats); 
          setIsFilterOpen(false); 
        }}
        companies={companies}
        stages={stages}
        statuses={statuses}
      />
      <ManageColumnsModal 
        isOpen={isColumnsOpen} 
        onClose={() => setIsColumnsOpen(false)} 
        columns={columns}
        setColumns={setColumns}
      />
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Opportunities <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{filteredOpportunities.length}</span>
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Home / Opportunities</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="p-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => setIsColumnsOpen(true)} className="p-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800">
              <Columns className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-md border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
            />
          </div>
          <button onClick={() => navigate('/crm/opportunities/add')} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Opportunity
          </button>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
            <ArrowUpDown className="w-4 h-4" /> Sort By
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
            10 Feb 26 - 11 Mar 26
          </button>
          <button onClick={() => setIsFilterOpen(true)} className="ml-auto flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button onClick={() => setIsColumnsOpen(true)} className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium">
            <Columns className="w-4 h-4" /> Manage Columns
          </button>
        </div>

        <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <table className="w-full text-sm text-left">
            <thead className={`text-xs uppercase ${isDark ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
              <tr>
                {columns.filter(c => c.visible).map(col => (
                  <th key={col.id} className="py-3 px-4">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              {filteredOpportunities.map((opp: any) => (
                <tr key={opp.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  {columns.filter(c => c.visible).map(col => (
                    <td key={col.id} className="py-3 px-4">
                      {col.id === 'id' && opp.id}
                      {col.id === 'name' && <span className="font-medium">{opp.name}</span>}
                      {col.id === 'company' && opp.account}
                      {col.id === 'value' && `$${opp.value}`}
                      {col.id === 'stage' && opp.stage}
                      {col.id === 'probability' && `${opp.probability || 0}%`}
                      {col.id === 'owner' && (opp.owner || 'Unassigned')}
                      {col.id === 'closeDate' && opp.closeDate}
                      {col.id === 'status' && (
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          opp.status === 'Won' ? 'bg-green-100 text-green-700' : 
                          opp.status === 'Lost' ? 'bg-red-100 text-red-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {opp.status}
                        </span>
                      )}
                      {col.id === 'action' && <MoreVertical className="w-4 h-4" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
