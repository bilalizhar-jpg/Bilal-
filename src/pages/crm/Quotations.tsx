import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Search, Plus, Filter, ArrowUpDown, 
  Download, RefreshCw, Columns, ChevronLeft, ChevronRight,
  ChevronDown, Calendar, X, Edit, Trash2, Bold, Italic, Underline, Link, List, ListOrdered, Type,
  GripVertical
} from 'lucide-react';
import { useCompanyData } from '../../context/CompanyDataContext';
import AdminLayout from '../../components/AdminLayout';

interface ProductRow {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  discount: number;
  amount: number;
}

export default function Quotations() {
  const { theme } = useTheme();
  const { companies, quotations, addEntity, loading } = useCompanyData();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isManageColumnsOpen, setIsManageColumnsOpen] = useState(false);

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState({
    quoteId: true,
    client: true,
    quoteDate: true,
    validTill: true,
    totalAmount: true,
    discount: true,
    finalAmount: true,
    action: true
  });

  // Filter State
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [filterQuoteDate, setFilterQuoteDate] = useState('');
  const [filterValidTill, setFilterValidTill] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');

  // Modal State
  const [customer, setCustomer] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('');
  const [date, setDate] = useState('');
  const [validTill, setValidTill] = useState('');
  const [description, setDescription] = useState('');
  const [productRows, setProductRows] = useState<ProductRow[]>([
    { id: '1', productId: '', quantity: 0, price: 0, discount: 0, amount: 0 },
    { id: '2', productId: '', quantity: 0, price: 0, discount: 0, amount: 0 },
    { id: '3', productId: '', quantity: 0, price: 0, discount: 0, amount: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [customFields, setCustomFields] = useState<{ label: string, value: string }[]>([]);

  const addProductRow = () => {
    setProductRows([...productRows, { 
      id: Math.random().toString(36).substr(2, 9), 
      productId: '', 
      quantity: 0, 
      price: 0, 
      discount: 0, 
      amount: 0 
    }]);
  };

  const removeProductRow = (id: string) => {
    if (productRows.length > 1) {
      setProductRows(productRows.filter(row => row.id !== id));
    }
  };

  const updateProductRow = (id: string, field: keyof ProductRow, value: any) => {
    setProductRows(productRows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        // Calculate amount
        if (field === 'quantity' || field === 'price' || field === 'discount') {
          const q = field === 'quantity' ? Number(value) : row.quantity;
          const p = field === 'price' ? Number(value) : row.price;
          const d = field === 'discount' ? Number(value) : row.discount;
          updatedRow.amount = q * p * (1 - d / 100);
        }
        return updatedRow;
      }
      return row;
    }));
  };

  const subtotal = productRows.reduce((acc, row) => acc + row.amount, 0);
  const tax = subtotal * 0.1; // Example 10% tax
  const total = subtotal + tax;

  const addCustomField = () => {
    setCustomFields([...customFields, { label: '', value: '' }]);
  };

  const handleSave = async () => {
    if (!customer || !amount || !currency || !date) {
      alert('Please fill in all required fields (Customer, Amount, Currency, Date).');
      return;
    }

    const newQuote = {
      quoteId: `#QOT${(quotations.length + 1).toString().padStart(4, '0')}`,
      customerId: customer,
      date,
      validTill,
      amount: Number(amount),
      currency,
      status: 'Pending',
      description,
      products: productRows.map(row => ({
        productId: row.productId,
        quantity: row.quantity,
        price: row.price,
        discount: row.discount,
        amount: row.amount
      })),
      notes,
      terms,
      customFields,
      createdAt: new Date().toISOString()
    };

    try {
      await addEntity('quotations', newQuote);
      alert('Quotation saved successfully!');
      setIsModalOpen(false);
      // Reset form
      setCustomer('');
      setAmount('');
      setCurrency('');
      setDate('');
      setValidTill('');
      setDescription('');
      setProductRows([
        { id: '1', productId: '', quantity: 0, price: 0, discount: 0, amount: 0 },
        { id: '2', productId: '', quantity: 0, price: 0, discount: 0, amount: 0 },
        { id: '3', productId: '', quantity: 0, price: 0, discount: 0, amount: 0 }
      ]);
      setNotes('');
      setTerms('');
      setCustomFields([]);
    } catch (error) {
      console.error('Error saving quotation:', error);
      alert('Failed to save quotation.');
    }
  };

  const handleSaveAndSend = async () => {
    const selectedCompany = companies.find(c => c.id === customer);
    if (!selectedCompany) {
      alert('Please select a customer first.');
      return;
    }

    const email = selectedCompany.email;
    if (!email) {
      alert('Selected customer does not have an email address.');
      return;
    }

    // Save first
    await handleSave();

    // Simulate sending email
    console.log(`Sending Quotation to: ${email}`);
    alert(`Quotation saved and sent to ${selectedCompany.name} (${email})`);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, field: 'label' | 'value', value: string) => {
    const updated = [...customFields];
    updated[index][field] = value;
    setCustomFields(updated);
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>QUOTATIONS</h1>
            <p className="text-[11px] text-slate-500 uppercase tracking-widest">Home &nbsp; &gt; &nbsp; <span className="font-medium text-[#00FFCC]">QUOTATIONS</span></p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2 border border-white/10 rounded-lg bg-[#1E1E2F] text-[#00FFCC] text-xs font-bold uppercase tracking-wider hover:bg-[#2A2A3D] transition-all">
              <Download className="w-3.5 h-3.5" /> Export <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button className="p-2 border border-white/10 rounded-lg bg-[#1E1E2F] text-slate-400 hover:text-[#00FFCC] transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2 border border-white/10 rounded-lg bg-[#1E1E2F] text-slate-400 hover:text-[#00FFCC] transition-all">
              <Columns className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Add */}
        <div className="flex items-center justify-between py-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="SEARCH QUOTATIONS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFCC]/50 ${isDark ? 'bg-[#1E1E2F] border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-200'}`}
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#00FFCC] text-[#1E1E2F] px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_15px_rgba(0,255,204,0.4)] transition-all"
          >
            <Plus className="w-4 h-4" /> Add Quotation
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-xs font-medium shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" /> Sort By <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-xs font-medium shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-slate-400" /> 11 Feb 26 - 12 Mar 26
          </button>
          <div className="flex-1" />
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-xs font-medium shadow-sm"
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setIsManageColumnsOpen(!isManageColumnsOpen)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#2A2A3D] text-[#00FFCC] border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#3A3A5A] transition-all"
            >
              <Columns className="w-3.5 h-3.5" /> Manage Columns
            </button>

            <AnimatePresence>
              {isManageColumnsOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsManageColumnsOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border z-20 p-3 space-y-1 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}
                  >
                    {[
                      { id: 'quoteId', label: 'Quote ID' },
                      { id: 'client', label: 'Client' },
                      { id: 'quoteDate', label: 'Quote Date' },
                      { id: 'validTill', label: 'Valid Till' },
                      { id: 'totalAmount', label: 'Total Amount' },
                      { id: 'discount', label: 'Discount' },
                      { id: 'finalAmount', label: 'Final Amount' },
                      { id: 'action', label: 'Action' },
                    ].map((col) => (
                      <div key={col.id} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors group">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors cursor-grab" />
                          <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{col.label}</span>
                        </div>
                        <button 
                          onClick={() => setVisibleColumns(prev => ({ ...prev, [col.id]: !prev[col.id as keyof typeof prev] }))}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${visibleColumns[col.id as keyof typeof visibleColumns] ? 'bg-[#E11D48]' : 'bg-slate-200 dark:bg-slate-700'}`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${visibleColumns[col.id as keyof typeof visibleColumns] ? 'translate-x-5' : 'translate-x-1'}`}
                          />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Table */}
        <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-[#1E1E2F] border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className={`${isDark ? 'bg-[#2A2A3D] text-[#B0B0C3]' : 'bg-slate-50 text-slate-600'} border-b border-white/10`}>
                <tr>
                  {visibleColumns.quoteId && <th className="py-4 px-4 font-bold uppercase tracking-wider">Quote ID</th>}
                  {visibleColumns.client && (
                    <th className="py-4 px-4 font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Customer</div>
                    </th>
                  )}
                  {visibleColumns.quoteDate && (
                    <th className="py-4 px-4 font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Quote Date</div>
                    </th>
                  )}
                  {visibleColumns.validTill && (
                    <th className="py-4 px-4 font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Valid Till</div>
                    </th>
                  )}
                  {visibleColumns.totalAmount && (
                    <th className="py-4 px-4 font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Total Amount</div>
                    </th>
                  )}
                  {visibleColumns.discount && (
                    <th className="py-4 px-4 font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Discount</div>
                    </th>
                  )}
                  {visibleColumns.finalAmount && (
                    <th className="py-4 px-4 font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Final Amount</div>
                    </th>
                  )}
                  {visibleColumns.action && <th className="py-4 px-4 font-bold uppercase tracking-wider text-center">Action</th>}
                </tr>
              </thead>
              <tbody className={isDark ? 'text-white' : 'text-slate-800'}>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 px-4 text-center text-slate-500 italic">
                      Loading quotations...
                    </td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="py-12 text-center text-slate-500">
                      No quotations found.
                    </td>
                  </tr>
                ) : (
                  quotations
                    .filter(quote => {
                      const company = companies.find(c => c.id === quote.customerId);
                      const matchesSearch = (company?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                          quote.quoteId.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesCustomerFilter = selectedCustomers.length === 0 || selectedCustomers.includes(company?.name || '');
                      const matchesDateFilter = !filterQuoteDate || quote.date === filterQuoteDate;
                      const matchesValidTillFilter = !filterValidTill || quote.validTill === filterValidTill;
                      return matchesSearch && matchesCustomerFilter && matchesDateFilter && matchesValidTillFilter;
                    })
                    .map((quote) => {
                      const company = companies.find(c => c.id === quote.customerId);
                      return (
                        <tr key={quote.id} className="border-b border-white/5 hover:bg-[#2A2A3D]/50 transition-colors">
                          {visibleColumns.quoteId && <td className="py-4 px-4 font-medium text-[#00FFCC]">{quote.quoteId}</td>}
                          {visibleColumns.client && (
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-[#2A2A3D] flex items-center justify-center overflow-hidden border border-white/10 text-[10px] font-bold text-[#00FFCC]">
                                  {company?.name?.charAt(0) || '?'}
                                </div>
                                <span className="font-medium">{company?.name || 'Unknown'}</span>
                              </div>
                            </td>
                          )}
                          {visibleColumns.quoteDate && <td className="py-4 px-4 text-[#B0B0C3]">{quote.date}</td>}
                          {visibleColumns.validTill && <td className="py-4 px-4 text-[#B0B0C3]">{quote.validTill}</td>}
                          {visibleColumns.totalAmount && <td className="py-4 px-4 font-medium">{quote.currency} {quote.amount?.toLocaleString()}</td>}
                          {visibleColumns.discount && <td className="py-4 px-4 font-medium text-[#00FFCC]">0%</td>}
                          {visibleColumns.finalAmount && <td className="py-4 px-4 font-bold text-white">{quote.currency} {quote.amount?.toLocaleString()}</td>}
                          {visibleColumns.action && (
                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-4 text-slate-400">
                                <button className="flex items-center gap-1 hover:text-[#00FFCC] transition-colors">
                                  <Edit className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-2 text-xs text-[#B0B0C3]">
            <span>SHOW</span>
            <select className={`px-2 py-1.5 border rounded-lg ${isDark ? 'bg-[#1E1E2F] border-white/10 text-white' : 'bg-white border-slate-200'}`}>
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>ENTRIES</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-[#2A2A3D] disabled:opacity-30 transition-all" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#00FFCC] text-[#1E1E2F] text-xs font-bold shadow-lg shadow-[#00FFCC]/20">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2A2A3D] text-xs font-bold text-[#B0B0C3] transition-all">2</button>
            <button className="p-2 rounded-lg hover:bg-[#2A2A3D] transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Quotation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h2 className={`text-lg font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>Add New Quotation</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-[#2A2A3D] transition-all"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-6 max-h-[80vh] overflow-y-auto space-y-6 custom-scrollbar">
                {/* Customer Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#B0B0C3] uppercase tracking-wider">Company</label>
                  <div className="relative">
                    <select 
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                      className={`w-full px-4 py-3 text-sm rounded-lg border appearance-none focus:outline-none focus:ring-2 focus:ring-[#00FFCC]/50 transition-all ${isDark ? 'bg-[#1E1E2F] border-white/10 text-white' : 'bg-white border-slate-200'}`}
                    >
                      <option value="">Select Company</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  {customer && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-2 p-4 rounded-lg border text-[11px] space-y-1 ${isDark ? 'bg-[#2A2A3D] border-white/10 text-[#B0B0C3]' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                    >
                      {(() => {
                        const c = companies.find(comp => comp.id === customer);
                        if (!c) return null;
                        return (
                          <>
                            <div className="flex items-center gap-2 italic">
                              <span className="font-bold text-white">Email:</span> {c.email || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 italic">
                              <span className="font-bold text-white">Phone:</span> {c.phone || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2 italic">
                              <span className="font-bold text-white">Address:</span> {c.location || 'N/A'}
                            </div>
                          </>
                        );
                      })()}
                    </motion.div>
                  )}
                </div>

                {/* Amount and Currency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#B0B0C3] uppercase tracking-wider">Amount <span className="text-[#00FFCC]">*</span></label>
                    <input 
                      type="text"
                      placeholder="ENTER AMOUNT"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full px-4 py-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFCC]/50 transition-all ${isDark ? 'bg-[#1E1E2F] border-white/10 text-white placeholder-slate-600' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#B0B0C3] uppercase tracking-wider">Currency <span className="text-[#00FFCC]">*</span></label>
                    <input 
                      type="text"
                      placeholder="USD"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className={`w-full px-4 py-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFCC]/50 transition-all ${isDark ? 'bg-[#1E1E2F] border-white/10 text-white placeholder-slate-600' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#B0B0C3] uppercase tracking-wider">Date</label>
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={`w-full px-4 py-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFCC]/50 transition-all ${isDark ? 'bg-[#1E1E2F] border-white/10 text-white' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#B0B0C3] uppercase tracking-wider">Valid Till</label>
                    <input 
                      type="date"
                      value={validTill}
                      onChange={(e) => setValidTill(e.target.value)}
                      className={`w-full px-4 py-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFCC]/50 transition-all ${isDark ? 'bg-[#1E1E2F] border-white/10 text-white' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                </div>

                {/* Description with Toolbar */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#B0B0C3] uppercase tracking-wider">Description</label>
                  <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <div className={`flex items-center gap-1 px-3 py-2 border-b ${isDark ? 'bg-[#2A2A3D] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                      <select className="text-[10px] bg-transparent border-none focus:ring-0 px-1 text-[#B0B0C3]">
                        <option>NORMAL</option>
                        <option>HEADING 1</option>
                        <option>HEADING 2</option>
                      </select>
                      <div className="w-px h-4 bg-white/10 mx-1" />
                      <button className="p-1 hover:bg-[#1E1E2F] rounded text-[#B0B0C3]"><Bold className="w-3.5 h-3.5" /></button>
                      <button className="p-1 hover:bg-[#1E1E2F] rounded text-[#B0B0C3]"><Italic className="w-3.5 h-3.5" /></button>
                      <button className="p-1 hover:bg-[#1E1E2F] rounded text-[#B0B0C3]"><Underline className="w-3.5 h-3.5" /></button>
                      <button className="p-1 hover:bg-[#1E1E2F] rounded text-[#B0B0C3]"><Link className="w-3.5 h-3.5" /></button>
                      <div className="w-px h-4 bg-white/10 mx-1" />
                      <button className="p-1 hover:bg-[#1E1E2F] rounded text-[#B0B0C3]"><ListOrdered className="w-3.5 h-3.5" /></button>
                      <button className="p-1 hover:bg-[#1E1E2F] rounded text-[#B0B0C3]"><List className="w-3.5 h-3.5" /></button>
                      <div className="w-px h-4 bg-white/10 mx-1" />
                      <button className="p-1 hover:bg-[#1E1E2F] rounded text-[#B0B0C3]"><Type className="w-3.5 h-3.5" /></button>
                    </div>
                    <textarea 
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`w-full px-4 py-3 text-sm focus:outline-none ${isDark ? 'bg-[#1E1E2F] text-white' : 'bg-white text-slate-700'}`}
                    />
                  </div>
                </div>

                {/* Product Table */}
                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-white/10 text-[#B0B0C3]">
                          <th className="py-3 font-bold uppercase tracking-wider w-1/3">Product</th>
                          <th className="py-3 font-bold uppercase tracking-wider">Quantity</th>
                          <th className="py-3 font-bold uppercase tracking-wider">Price</th>
                          <th className="py-3 font-bold uppercase tracking-wider">Discount</th>
                          <th className="py-3 font-bold uppercase tracking-wider">Amount</th>
                          <th className="py-3 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {productRows.map((row) => (
                          <tr key={row.id}>
                            <td className="py-3 pr-4">
                              <div className="relative">
                                <select 
                                  value={row.productId}
                                  onChange={(e) => updateProductRow(row.id, 'productId', e.target.value)}
                                  className={`w-full px-3 py-2 text-xs rounded border appearance-none focus:outline-none focus:ring-1 focus:ring-[#00FFCC]/50 ${isDark ? 'bg-[#1E1E2F] border-white/10 text-white' : 'bg-white border-slate-200'}`}
                                >
                                  <option value="">SELECT</option>
                                  <option value="p1">PRODUCT A</option>
                                  <option value="p2">PRODUCT B</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <input 
                                type="number"
                                value={row.quantity || ''}
                                onChange={(e) => updateProductRow(row.id, 'quantity', e.target.value)}
                                className={`w-full px-3 py-2 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-[#00FFCC]/50 ${isDark ? 'bg-[#1E1E2F] border-white/10 text-white' : 'bg-white border-slate-200'}`}
                              />
                            </td>
                            <td className="py-3 pr-4">
                              <input 
                                type="number"
                                value={row.price || ''}
                                onChange={(e) => updateProductRow(row.id, 'price', e.target.value)}
                                className={`w-full px-3 py-2 text-xs rounded border focus:outline-none focus:ring-1 focus:ring-[#00FFCC]/50 ${isDark ? 'bg-[#1E1E2F] border-white/10 text-white' : 'bg-white border-slate-200'}`}
                              />
                            </td>
                            <td className="py-3 pr-4">
                              <div className="relative">
                                <select 
                                  value={row.discount}
                                  onChange={(e) => updateProductRow(row.id, 'discount', e.target.value)}
                                  className={`w-full px-3 py-2 text-xs rounded border appearance-none focus:outline-none focus:ring-1 focus:ring-[#00FFCC]/50 ${isDark ? 'bg-[#1E1E2F] border-white/10 text-white' : 'bg-white border-slate-200'}`}
                                >
                                  <option value="0">0 %</option>
                                  <option value="5">5 %</option>
                                  <option value="10">10 %</option>
                                  <option value="20">20 %</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <input 
                                type="text"
                                readOnly
                                value={row.amount.toFixed(2)}
                                className={`w-full px-3 py-2 text-xs rounded border bg-[#2A2A3D] border-white/10 text-[#B0B0C3] font-bold`}
                              />
                            </td>
                            <td className="py-3 text-right">
                              <button 
                                onClick={() => removeProductRow(row.id)}
                                className="p-1 text-red-400 hover:text-red-600 transition-colors"
                              >
                                <X className="w-4 h-4 border border-red-900 rounded-full p-0.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button 
                    onClick={addProductRow}
                    className="text-[#00FFCC] text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-[#00D1FF] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New
                  </button>
                </div>

                {/* Totals Section */}
                <div className={`p-6 rounded-xl space-y-3 ${isDark ? 'bg-[#2A2A3D]' : 'bg-slate-50/50'}`}>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-[#B0B0C3] uppercase tracking-wider">Subtotal</span>
                    <span className="font-bold text-white">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-[#B0B0C3] uppercase tracking-wider">Tax</span>
                    <span className="font-bold text-white">${tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-3 border-t border-white/10">
                    <span className="font-bold text-white text-base uppercase tracking-wider">Total</span>
                    <span className="font-bold text-[#00FFCC] text-base">${total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Notes and Terms */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#B0B0C3] uppercase tracking-wider">Notes</label>
                    <textarea 
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className={`w-full px-4 py-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFCC]/50 transition-all ${isDark ? 'bg-[#1E1E2F] border-white/10 text-white' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#B0B0C3] uppercase tracking-wider">Terms & Conditions</label>
                    <textarea 
                      rows={3}
                      value={terms}
                      onChange={(e) => setTerms(e.target.value)}
                      className={`w-full px-4 py-3 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#00FFCC]/50 transition-all ${isDark ? 'bg-[#1E1E2F] border-white/10 text-white' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                </div>

                {/* Custom Fields Section */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Custom Fields</h3>
                    <button 
                      onClick={addCustomField}
                      className="text-[#00FFCC] text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-[#00D1FF] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Custom Field
                    </button>
                  </div>
                  {customFields.length > 0 && (
                    <div className="space-y-3">
                      {customFields.map((field, index) => (
                        <div key={index} className="flex gap-3 items-end">
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-[#B0B0C3]">Field Label</label>
                            <input 
                              type="text"
                              placeholder="e.g. Project Code"
                              value={field.label}
                              onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                              className={`w-full px-4 py-3 text-xs rounded-lg border focus:outline-none ${isDark ? 'bg-[#1E1E2F] border-white/10 text-white' : 'bg-white border-slate-200'}`}
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] uppercase tracking-wider font-bold text-[#B0B0C3]">Field Value</label>
                            <input 
                              type="text"
                              placeholder="e.g. PRJ-2024"
                              value={field.value}
                              onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                              className={`w-full px-4 py-3 text-xs rounded-lg border focus:outline-none ${isDark ? 'bg-[#1E1E2F] border-white/10 text-white' : 'bg-white border-slate-200'}`}
                            />
                          </div>
                          <button 
                            onClick={() => removeCustomField(index)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors mb-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#1E1E2F]">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isDark ? 'bg-[#2A2A3D] text-[#B0B0C3] hover:bg-[#3A3A5A]' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                  Cancel
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={handleSave}
                    className="px-6 py-2 bg-[#2A2A3D] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#3A3A5A] transition-all"
                  >
                    Save
                  </button>
                  <button 
                    onClick={handleSaveAndSend}
                    className="px-6 py-2 bg-[#00FFCC] text-[#1E1E2F] rounded-lg text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_15px_rgba(0,255,204,0.4)] transition-all"
                  >
                    Save & Send
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter Sidebar */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 h-full w-80 z-[70] shadow-2xl flex flex-col ${isDark ? 'bg-slate-900 border-l border-slate-800' : 'bg-white'}`}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-slate-900 dark:text-white" />
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Filter</h2>
                </div>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Customer Filter */}
                <div className="space-y-4">
                  <button className="flex items-center justify-between w-full text-sm font-bold text-slate-900 dark:text-white group">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="w-4 h-4" />
                      Customer
                    </div>
                  </button>
                  
                  <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      />
                    </div>

                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {companies.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase())).map((c, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={selectedCustomers.includes(c.name)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedCustomers([...selectedCustomers, c.name]);
                              else setSelectedCustomers(selectedCustomers.filter(name => name !== c.name));
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                          />
                          <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200 bg-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                            {c.name?.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{c.name}</span>
                        </label>
                      ))}
                    </div>
                    <button className="text-red-500 text-[11px] font-bold hover:underline">View More</button>
                  </div>
                </div>

                {/* Quote Date Filter */}
                <div className="space-y-4">
                  <button className="flex items-center justify-between w-full text-sm font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="w-4 h-4" />
                      Quote Date
                    </div>
                  </button>
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="relative">
                      <input 
                        type="date"
                        value={filterQuoteDate}
                        onChange={(e) => setFilterQuoteDate(e.target.value)}
                        className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Valid Till Filter */}
                <div className="space-y-4">
                  <button className="flex items-center justify-between w-full text-sm font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="w-4 h-4" />
                      Valid Till
                    </div>
                  </button>
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="relative">
                      <input 
                        type="date"
                        value={filterValidTill}
                        onChange={(e) => setFilterValidTill(e.target.value)}
                        className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    setSelectedCustomers([]);
                    setFilterQuoteDate('');
                    setFilterValidTill('');
                    setCustomerSearch('');
                  }}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                >
                  Reset
                </button>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="px-4 py-2.5 bg-[#E11D48] text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                >
                  Filter
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
