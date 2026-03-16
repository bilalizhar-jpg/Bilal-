import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Search, Plus, Filter, MoreVertical, ArrowUpDown, RefreshCw, Download, Columns, X, ChevronDown, ChevronRight } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useCompanyData } from '../../context/CompanyDataContext';
import { useSettings } from '../../context/SettingsContext';

const FilterModal = ({ isOpen, onClose, onApply, categories, statuses }: any) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isStatusOpen, setIsStatusOpen] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c: string) => c.toLowerCase().includes(categorySearch.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-80 p-6 rounded-xl shadow-xl bg-[#1E1E2F] border border-white/5 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight"><Filter className="w-5 h-5" /> Filter</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <button className="flex items-center gap-2 font-black mb-2 uppercase text-xs text-[#B0B0C3]" onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
              {isCategoryOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />} Category
            </button>
            {isCategoryOpen && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0C3]" />
                  <input 
                    type="text" 
                    placeholder="Search" 
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full pl-8 pr-2 py-1 rounded-md border bg-[#2A2A3D] border-white/5 text-white"
                  />
                </div>
                {filteredCategories.map((cat: string) => (
                  <label key={cat} className="flex items-center gap-2 text-sm text-white">
                    <input type="checkbox" checked={selectedCategories.includes(cat)} onChange={(e) => e.target.checked ? setSelectedCategories([...selectedCategories, cat]) : setSelectedCategories(selectedCategories.filter(c => c !== cat))} />
                    {cat}
                  </label>
                ))}
                <button className="text-[#00FFCC] text-sm font-medium">Load More</button>
              </div>
            )}
          </div>
          <div>
            <button className="flex items-center gap-2 font-black mb-2 uppercase text-xs text-[#B0B0C3]" onClick={() => setIsStatusOpen(!isStatusOpen)}>
              {isStatusOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />} Status
            </button>
            {isStatusOpen && (
              <div className="space-y-2">
                {statuses.map((status: string) => (
                  <label key={status} className="flex items-center gap-2 text-sm text-white">
                    <input type="checkbox" checked={selectedStatuses.includes(status)} onChange={(e) => e.target.checked ? setSelectedStatuses([...selectedStatuses, status]) : setSelectedStatuses(selectedStatuses.filter(s => s !== status))} />
                    {status}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={() => { setSelectedCategories([]); setSelectedStatuses([]); onApply([], []); }} className="flex-1 py-2 border border-white/10 rounded-md hover:bg-[#2A2A3D] text-[#B0B0C3]">Reset</button>
          <button onClick={() => onApply(selectedCategories, selectedStatuses)} className="flex-1 py-2 bg-[#00FFCC] text-[#1E1E2F] rounded-md font-black uppercase hover:bg-[#00D1FF]">Filter</button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-80 p-6 rounded-xl shadow-xl bg-[#1E1E2F] border border-white/5 text-white">
        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
          <h2 className="text-lg font-black flex items-center gap-2 uppercase tracking-tight"><Columns className="w-5 h-5" /> Manage Columns</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          {columns.map((col: any) => (
            <div key={col.id} className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-sm font-medium text-[#B0B0C3]"><MoreVertical className="w-4 h-4" /> {col.label}</span>
              <button 
                onClick={() => setColumns(columns.map((c: any) => c.id === col.id ? { ...c, visible: !c.visible } : c))}
                className={`w-10 h-5 rounded-full transition-colors relative ${col.visible ? 'bg-[#00FFCC]' : 'bg-[#2A2A3D]'}`}
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

export default function Products() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { formatCurrency } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);
  const [columns, setColumns] = useState([
    { id: 'productId', label: 'Product ID', visible: true },
    { id: 'name', label: 'Product Name', visible: true },
    { id: 'category', label: 'Category', visible: true },
    { id: 'sku', label: 'SKU', visible: true },
    { id: 'unitPrice', label: 'Unit Price', visible: true },
    { id: 'tax', label: 'Tax %', visible: true },
    { id: 'status', label: 'Status', visible: true },
    { id: 'action', label: 'Action', visible: true },
  ]);
  const { products, deleteEntity } = useCompanyData();

  const categories = Array.from(new Set(products.map((p: any) => p.category))).filter(Boolean) as string[];
  const statuses = Array.from(new Set(products.map((p: any) => p.status))).filter(Boolean) as string[];

  const filteredProducts = products.filter((p: any) => 
    (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (activeCategories.length === 0 || activeCategories.includes(p.category)) &&
    (activeStatuses.length === 0 || activeStatuses.includes(p.status))
  );

  return (
    <AdminLayout>
      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        onApply={(cats: string[], stats: string[]) => { setActiveCategories(cats); setActiveStatuses(stats); setIsFilterOpen(false); }}
        categories={categories}
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
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Products <span className="text-sm font-normal text-[#B0B0C3] bg-[#2A2A3D] px-2 py-0.5 rounded-full">{filteredProducts.length}</span>
            </h1>
            <p className="text-sm text-[#B0B0C3]">Home / Products</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-md hover:bg-[#2A2A3D] text-[#B0B0C3] text-sm font-black uppercase">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="p-2 border border-white/10 rounded-md hover:bg-[#2A2A3D] text-[#B0B0C3]">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => setIsColumnsOpen(true)} className="p-2 border border-white/10 rounded-md hover:bg-[#2A2A3D] text-[#B0B0C3]">
              <Columns className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B0C3]" />
            <input 
              type="text" 
              placeholder="Search" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border bg-[#1E1E2F] border-white/10 text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]"
            />
          </div>
          <button onClick={() => navigate('/crm/products/add')} className="flex items-center gap-2 px-4 py-2 bg-[#00FFCC] text-[#1E1E2F] rounded-md hover:bg-[#00D1FF] text-sm font-black uppercase shadow-[0_0_8px_rgba(0,255,204,0.4)]">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-md hover:bg-[#2A2A3D] text-[#B0B0C3] text-sm font-black uppercase">
            <ArrowUpDown className="w-4 h-4" /> Sort By
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-md hover:bg-[#2A2A3D] text-[#B0B0C3] text-sm font-black uppercase">
            10 Feb 26 - 11 Mar 26
          </button>
          <button onClick={() => setIsFilterOpen(true)} className="ml-auto flex items-center gap-2 px-4 py-2 border border-white/10 rounded-md hover:bg-[#2A2A3D] text-[#B0B0C3] text-sm font-black uppercase">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button onClick={() => setIsColumnsOpen(true)} className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-md hover:bg-[#2A2A3D] text-[#B0B0C3] text-sm font-black uppercase">
            <Columns className="w-4 h-4" /> Manage Columns
          </button>
        </div>

        <div className="rounded-xl border border-white/5 overflow-hidden bg-[#2A2A3D]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-[#1E1E2F] text-[#B0B0C3]">
              <tr>
                {columns.filter(c => c.visible).map(col => <th key={col.id} className="py-3 px-4 font-black tracking-wider">{col.label}</th>)}
              </tr>
            </thead>
            <tbody className="text-white">
              {filteredProducts.map((product: any) => (
                <tr key={product.id} className="border-b border-white/5 hover:bg-[#1E1E2F]/50 cursor-pointer" onClick={() => navigate(`/crm/products/${product.id}`)}>
                  {columns.filter(c => c.visible).map(col => (
                    <td key={col.id} className="py-3 px-4">
                      {col.id === 'productId' && `#${product.productId}`}
                      {col.id === 'name' && <span className="font-medium">{product.name}</span>}
                      {col.id === 'category' && product.category}
                      {col.id === 'sku' && product.sku}
                      {col.id === 'unitPrice' && formatCurrency(product.unitPrice)}
                      {col.id === 'tax' && `${product.tax}%`}
                      {col.id === 'status' && (
                        <span className={`px-2 py-1 rounded-full text-xs font-black uppercase tracking-wider ${product.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {product.status}
                        </span>
                      )}
                      {col.id === 'action' && (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => navigate(`/crm/products/edit/${product.id}`)}
                            className="p-1 hover:bg-[#00FFCC]/20 text-[#00FFCC] rounded"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteEntity('products', product.id)}
                            className="p-1 hover:bg-red-500/20 text-red-500 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      )}
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
