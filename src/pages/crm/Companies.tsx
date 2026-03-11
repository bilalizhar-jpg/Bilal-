import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { Search, Plus, Filter, MoreVertical, Mail, Phone, MapPin, Star, MessageSquare, Share2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useCompanyData } from '../../context/CompanyDataContext';

export default function Companies() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { companies } = useCompanyData();

  const filteredCompanies = companies.filter((c: any) => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Companies <span className="text-sm font-normal text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{filteredCompanies.length}</span>
            </h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Home / Companies</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/crm/companies/add')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium">
              <Plus className="w-4 h-4" />
              Add Company
            </button>
          </div>
        </div>

        <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-md border outline-none transition-all ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500'
                }`}
              />
            </div>
            <button className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}>
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCompanies.map((company: any) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {company.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{company.name}</h3>
                      <div className="flex items-center text-yellow-500 text-sm">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="ml-1">{company.rating || '0.0'}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {company.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {company.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {company.location}
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  {company.tags?.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button className="text-slate-400 hover:text-indigo-600"><Mail className="w-4 h-4" /></button>
                  <button className="text-slate-400 hover:text-indigo-600"><Phone className="w-4 h-4" /></button>
                  <button className="text-slate-400 hover:text-indigo-600"><MessageSquare className="w-4 h-4" /></button>
                  <button className="text-slate-400 hover:text-indigo-600"><Share2 className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
