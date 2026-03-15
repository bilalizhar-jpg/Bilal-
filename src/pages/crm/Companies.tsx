import React, { useState, useEffect, useRef } from 'react';
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { companies, deleteEntity } = useCompanyData();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredCompanies = companies.filter((c: any) => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    setDeleteConfirmId(id);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteEntity('crm_companies', deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-[#1E1E2F] p-6 rounded-xl border border-white/10 max-w-sm w-full mx-4">
              <h3 className="text-xl font-bold text-white mb-4">Delete Company</h3>
              <p className="text-[#B0B0C3] mb-6">Are you sure you want to delete this company? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-md border border-white/10 text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Companies <span className="text-sm font-normal text-[#B0B0C3] bg-[#2A2A3D] px-2 py-0.5 rounded-full">{filteredCompanies.length}</span>
            </h1>
            <p className="text-sm text-[#B0B0C3]">Home / Companies</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/crm/companies/add')} className="flex items-center gap-2 px-4 py-2 bg-[#00FFCC] text-[#1E1E2F] rounded-md hover:bg-[#00D1FF] transition-colors text-sm font-black uppercase shadow-[0_0_8px_rgba(0,255,204,0.4)]">
              <Plus className="w-4 h-4" />
              Add Company
            </button>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-white/5 bg-[#2A2A3D] shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0C3]" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-md border outline-none transition-all bg-[#1E1E2F] border-white/10 text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-white/10 text-[#B0B0C3] hover:bg-[#1E1E2F] transition-colors">
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
                className="p-4 rounded-xl border border-white/5 bg-[#1E1E2F]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#00FFCC]/10 flex items-center justify-center text-[#00FFCC] font-bold">
                      {company.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{company.name}</h3>
                      <div className="flex items-center text-yellow-500 text-sm">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="ml-1">{company.rating || '0.0'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative" ref={openMenuId === company.id ? menuRef : null}>
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === company.id ? null : company.id)}
                      className="text-[#B0B0C3] hover:text-white p-1 rounded-md hover:bg-white/5"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {openMenuId === company.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#2A2A3D] rounded-md shadow-lg border border-white/10 z-10 overflow-hidden">
                        <button
                          onClick={() => navigate(`/crm/companies/edit/${company.id}`)}
                          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5"
                        >
                          Edit Company
                        </button>
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/5"
                        >
                          Delete Company
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-[#B0B0C3] mb-4">
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
                  {Array.isArray(company.tags) ? company.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 rounded bg-[#00FFCC]/10 text-[#00FFCC] text-xs font-medium">
                      {tag}
                    </span>
                  )) : typeof company.tags === 'string' && company.tags ? company.tags.split(',').map((tag: string) => (
                    <span key={tag.trim()} className="px-2 py-1 rounded bg-[#00FFCC]/10 text-[#00FFCC] text-xs font-medium">
                      {tag.trim()}
                    </span>
                  )) : null}
                </div>

                <div className="flex justify-between pt-4 border-t border-white/5">
                  <button className="text-[#B0B0C3] hover:text-[#00FFCC]"><Mail className="w-4 h-4" /></button>
                  <button className="text-[#B0B0C3] hover:text-[#00FFCC]"><Phone className="w-4 h-4" /></button>
                  <button className="text-[#B0B0C3] hover:text-[#00FFCC]"><MessageSquare className="w-4 h-4" /></button>
                  <button className="text-[#B0B0C3] hover:text-[#00FFCC]"><Share2 className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
