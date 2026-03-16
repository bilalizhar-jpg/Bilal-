import React, { useState } from 'react';
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

export default function SalesOrders() {
  const { theme } = useTheme();
  const { companies, salesOrders, addEntity, loading } = useCompanyData();
  const isDark = theme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isManageColumnsOpen, setIsManageColumnsOpen] = useState(false);

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState({
    orderId: true,
    company: true,
    orderDate: true,
    orderValue: true,
    netAmount: true,
    paymentStatus: true,
    orderStatus: true,
    action: true
  });

  // Filter State
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [filterOrderDate, setFilterOrderDate] = useState('');
  const [companySearch, setCompanySearch] = useState('');

  // Modal State
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [orderValue, setOrderValue] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [date, setDate] = useState('');
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
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const addCustomField = () => {
    setCustomFields([...customFields, { label: '', value: '' }]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomField = (index: number, field: 'label' | 'value', value: string) => {
    const updated = [...customFields];
    updated[index][field] = value;
    setCustomFields(updated);
  };

  const handleSave = async () => {
    if (!selectedCompanyId || !date || !orderValue) {
      alert('Please fill in all required fields (Company, Date, Order Value).');
      return;
    }

    const newOrder = {
      orderId: `#SOR${(salesOrders.length + 1).toString().padStart(4, '0')}`,
      customerId: selectedCompanyId,
      date,
      orderValue: Number(orderValue),
      currency,
      netAmount: total,
      paymentStatus: 'Pending',
      orderStatus: 'InProgress',
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
      await addEntity('salesOrders', newOrder);
      alert('Sales Order saved successfully!');
      setIsModalOpen(false);
      // Reset form
      setSelectedCompanyId('');
      setOrderValue('');
      setDate('');
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
      console.error('Error saving sales order:', error);
      alert('Failed to save sales order.');
    }
  };

  const handleSaveAndSend = async () => {
    const selectedCompany = companies.find(c => c.id === selectedCompanyId);
    if (!selectedCompany) {
      alert('Please select a company first.');
      return;
    }

    const email = selectedCompany.email;
    if (!email) {
      alert('Selected company does not have an email address.');
      return;
    }

    // Save first
    await handleSave();

    // Simulate sending email
    console.log(`Sending Sales Order to: ${email}`);
    alert(`Sales Order saved and sent to ${selectedCompany.name} (${email})`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'inprogress': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-orange-50 text-orange-600 border border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">Sales Orders</h1>
            <p className="text-[11px] text-[#B0B0C3]">Home &nbsp; &gt; &nbsp; <span className="font-medium text-white">Sales Orders</span></p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded bg-[#2A2A3D] text-[#B0B0C3] text-xs font-black uppercase shadow-sm hover:bg-[#3A3A5D]">
              <Download className="w-3.5 h-3.5" /> Export <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 border border-white/10 rounded bg-[#2A2A3D] text-[#B0B0C3] shadow-sm hover:bg-[#3A3A5D]">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 border border-white/10 rounded bg-[#2A2A3D] text-[#B0B0C3] shadow-sm hover:bg-[#3A3A5D]">
              <Columns className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search and Add */}
        <div className="flex items-center justify-between py-2">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#B0B0C3]" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-md border bg-[#1E1E2F] border-white/10 text-white focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC]"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#00FFCC] text-[#1E1E2F] px-4 py-2 rounded-md text-sm font-black uppercase hover:bg-[#00D1FF] transition-colors shadow-[0_0_8px_rgba(0,255,204,0.4)]"
          >
            <Plus className="w-4 h-4" /> Add Sales Order
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded bg-[#2A2A3D] text-[#B0B0C3] text-xs font-black uppercase shadow-sm hover:bg-[#3A3A5D]">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort By <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded bg-[#2A2A3D] text-[#B0B0C3] text-xs font-black uppercase shadow-sm hover:bg-[#3A3A5D]">
            <Calendar className="w-3.5 h-3.5" /> 11 Feb 26 - 12 Mar 26
          </button>
          <div className="flex-1" />
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded bg-[#2A2A3D] text-[#B0B0C3] text-xs font-black uppercase shadow-sm hover:bg-[#3A3A5D]"
          >
            <Filter className="w-3.5 h-3.5" /> Filter <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setIsManageColumnsOpen(!isManageColumnsOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00FFCC]/10 text-[#00FFCC] border border-[#00FFCC]/20 rounded text-xs font-black uppercase"
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
                    className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border border-white/10 z-20 p-3 space-y-1 bg-[#1E1E2F]"
                  >
                    {[
                      { id: 'orderId', label: 'Order ID' },
                      { id: 'company', label: 'Company' },
                      { id: 'orderDate', label: 'Order Date' },
                      { id: 'orderValue', label: 'Order Value' },
                      { id: 'netAmount', label: 'Net Amount' },
                      { id: 'paymentStatus', label: 'Payment Status' },
                      { id: 'orderStatus', label: 'Order Status' },
                      { id: 'action', label: 'Action' },
                    ].map((col) => (
                      <div key={col.id} className="flex items-center justify-between p-2 hover:bg-[#2A2A3D] rounded-lg transition-colors group">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-[#B0B0C3] group-hover:text-white transition-colors cursor-grab" />
                          <span className="text-sm font-medium text-[#B0B0C3]">{col.label}</span>
                        </div>
                        <button 
                          onClick={() => setVisibleColumns(prev => ({ ...prev, [col.id]: !prev[col.id as keyof typeof prev] }))}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${visibleColumns[col.id as keyof typeof visibleColumns] ? 'bg-[#00FFCC]' : 'bg-[#2A2A3D]'}`}
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
        <div className="rounded-lg border border-white/5 overflow-hidden bg-[#2A2A3D]">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#1E1E2F] text-[#B0B0C3] border-b border-white/5">
                <tr>
                  {visibleColumns.orderId && <th className="py-3 px-4 font-black uppercase tracking-wider">Order ID</th>}
                  {visibleColumns.company && (
                    <th className="py-3 px-4 font-black uppercase tracking-wider">
                      <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Company</div>
                    </th>
                  )}
                  {visibleColumns.orderDate && (
                    <th className="py-3 px-4 font-black uppercase tracking-wider">
                      <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Order Date</div>
                    </th>
                  )}
                  {visibleColumns.orderValue && (
                    <th className="py-3 px-4 font-black uppercase tracking-wider">
                      <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Order value</div>
                    </th>
                  )}
                  {visibleColumns.netAmount && (
                    <th className="py-3 px-4 font-black uppercase tracking-wider">
                      <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Net Amount</div>
                    </th>
                  )}
                  {visibleColumns.paymentStatus && (
                    <th className="py-3 px-4 font-black uppercase tracking-wider">
                      <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Payment Status</div>
                    </th>
                  )}
                  {visibleColumns.orderStatus && (
                    <th className="py-3 px-4 font-black uppercase tracking-wider">
                      <div className="flex items-center gap-1"><ArrowUpDown className="w-3 h-3" /> Order Status</div>
                    </th>
                  )}
                  {visibleColumns.action && <th className="py-3 px-4 font-black uppercase tracking-wider text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="text-white">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 px-4 text-center text-[#B0B0C3] italic">
                      Loading sales orders...
                    </td>
                  </tr>
                ) : salesOrders.length === 0 ? (
                  <tr className="border-b border-white/5">
                    <td colSpan={8} className="py-8 px-4 text-center text-[#B0B0C3]">
                      No sales orders found. Click "Add Sales Order" to create one.
                    </td>
                  </tr>
                ) : (
                  salesOrders
                    .filter(order => {
                      const company = companies.find(c => c.id === order.customerId);
                      const matchesSearch = (company?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                          order.orderId.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesCompanyFilter = selectedCompanies.length === 0 || selectedCompanies.includes(company?.name || '');
                      const matchesDateFilter = !filterOrderDate || order.date === filterOrderDate;
                      return matchesSearch && matchesCompanyFilter && matchesDateFilter;
                    })
                    .map((order) => {
                      const company = companies.find(c => c.id === order.customerId);
                      return (
                        <tr key={order.id} className="border-b border-white/5 hover:bg-[#1E1E2F]/50 transition-colors">
                          {visibleColumns.orderId && <td className="py-3 px-4 font-medium text-[#00FFCC]">{order.orderId}</td>}
                          {visibleColumns.company && (
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#1E1E2F] flex items-center justify-center text-[10px] font-bold text-[#B0B0C3]">
                                  {company?.name?.charAt(0) || '?'}
                                </div>
                                <span>{company?.name || 'Unknown'}</span>
                              </div>
                            </td>
                          )}
                          {visibleColumns.orderDate && <td className="py-3 px-4">{order.date}</td>}
                          {visibleColumns.orderValue && <td className="py-3 px-4">{order.currency} {(order.orderValue || 0).toLocaleString()}</td>}
                          {visibleColumns.netAmount && <td className="py-3 px-4 font-bold">{order.currency} {(order.netAmount || 0).toLocaleString()}</td>}
                          {visibleColumns.paymentStatus && (
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getPaymentStatusColor(order.paymentStatus)}`}>
                                {order.paymentStatus}
                              </span>
                            </td>
                          )}
                          {visibleColumns.orderStatus && (
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                                {order.orderStatus}
                              </span>
                            </td>
                          )}
                          {visibleColumns.action && (
                            <td className="py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button className="p-1 text-[#B0B0C3] hover:text-[#00FFCC] transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                                <button className="p-1 text-[#B0B0C3] hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-[#B0B0C3]">
            <span>Show</span>
            <select className="px-1.5 py-1 border rounded bg-[#1E1E2F] border-white/5">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
            <span>entries</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-[#2A2A3D] disabled:opacity-30 text-[#B0B0C3]" disabled>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded bg-[#00FFCC] text-[#1E1E2F] text-xs font-black">1</button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#2A2A3D] text-[#B0B0C3] text-xs font-black">2</button>
            <button className="p-1.5 rounded hover:bg-[#2A2A3D] text-[#B0B0C3]">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Sales Order Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-4xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Add New Sales Order</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Company Selection */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Company</label>
                    <select 
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    >
                      <option value="">Select Company</option>
                      {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    
                    {selectedCompanyId && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-2 p-3 rounded-lg border text-[11px] space-y-1 ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                      >
                        {(() => {
                          const c = companies.find(comp => comp.id === selectedCompanyId);
                          if (!c) return null;
                          return (
                            <>
                              <div className="flex items-center gap-2 italic">
                                <span className="font-bold">Email:</span> {c.email || 'N/A'}
                              </div>
                              <div className="flex items-center gap-2 italic">
                                <span className="font-bold">Phone:</span> {c.phone || 'N/A'}
                              </div>
                              <div className="flex items-center gap-2 italic">
                                <span className="font-bold">Address:</span> {c.location || 'N/A'}
                              </div>
                            </>
                          );
                        })()}
                      </motion.div>
                    )}
                  </div>

                  {/* Order Value */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Order Value</label>
                    <input 
                      type="number"
                      placeholder="Enter Order Value"
                      value={orderValue}
                      onChange={(e) => setOrderValue(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    />
                  </div>

                  {/* Currency */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Currency</label>
                    <input 
                      type="text"
                      placeholder="e.g. USD, EUR"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Date</label>
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                    />
                  </div>
                </div>

                {/* Description with Toolbar */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Description</label>
                  <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className={`flex items-center gap-1 p-2 border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><Bold className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><Italic className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><Underline className="w-3.5 h-3.5" /></button>
                      <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
                      <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><Link className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><List className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><ListOrdered className="w-3.5 h-3.5" /></button>
                      <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
                      <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-medium">
                        <Type className="w-3 h-3" /> Font <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter description..."
                      className={`w-full p-4 text-xs min-h-[120px] focus:outline-none ${isDark ? 'bg-slate-900 text-white' : 'bg-white'}`}
                    />
                  </div>
                </div>

                {/* Products Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Products</h3>
                    <button 
                      onClick={addProductRow}
                      className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New
                    </button>
                  </div>
                  <div className={`rounded-lg border overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <table className="w-full text-xs text-left border-collapse">
                      <thead className={`${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-600'}`}>
                        <tr>
                          <th className="py-2.5 px-4 font-bold">Product</th>
                          <th className="py-2.5 px-4 font-bold w-24">Quantity</th>
                          <th className="py-2.5 px-4 font-bold w-32">Price</th>
                          <th className="py-2.5 px-4 font-bold w-24">Discount</th>
                          <th className="py-2.5 px-4 font-bold w-32">Amount</th>
                          <th className="py-2.5 px-4 font-bold w-12"></th>
                        </tr>
                      </thead>
                      <tbody className={isDark ? 'text-slate-300' : 'text-slate-800'}>
                        {productRows.map((row) => (
                          <tr key={row.id} className="border-t border-slate-100 dark:border-slate-800">
                            <td className="p-2">
                              <select 
                                value={row.productId}
                                onChange={(e) => updateProductRow(row.id, 'productId', e.target.value)}
                                className={`w-full px-2 py-1.5 text-[11px] rounded border focus:outline-none ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
                              >
                                <option value="">Select Product</option>
                                <option value="p1">Product A</option>
                                <option value="p2">Product B</option>
                              </select>
                            </td>
                            <td className="p-2">
                              <input 
                                type="number"
                                value={row.quantity}
                                onChange={(e) => updateProductRow(row.id, 'quantity', e.target.value)}
                                className={`w-full px-2 py-1.5 text-[11px] rounded border focus:outline-none ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
                              />
                            </td>
                            <td className="p-2">
                              <input 
                                type="number"
                                value={row.price}
                                onChange={(e) => updateProductRow(row.id, 'price', e.target.value)}
                                className={`w-full px-2 py-1.5 text-[11px] rounded border focus:outline-none ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
                              />
                            </td>
                            <td className="p-2">
                              <input 
                                type="number"
                                value={row.discount}
                                onChange={(e) => updateProductRow(row.id, 'discount', e.target.value)}
                                className={`w-full px-2 py-1.5 text-[11px] rounded border focus:outline-none ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
                              />
                            </td>
                            <td className="p-2 font-medium">${row.amount.toFixed(2)}</td>
                            <td className="p-2">
                              <button 
                                onClick={() => removeProductRow(row.id)}
                                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary and Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Notes</label>
                      <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Enter notes..."
                        className={`w-full p-3 text-xs rounded-lg border focus:outline-none min-h-[80px] ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Terms & Conditions</label>
                      <textarea 
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                        placeholder="Enter terms..."
                        className={`w-full p-3 text-xs rounded-lg border focus:outline-none min-h-[80px] ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className={`p-4 rounded-xl space-y-3 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-bold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Tax (10%)</span>
                        <span className="font-bold text-slate-900 dark:text-white">${tax.toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-slate-200 dark:bg-slate-700 my-1" />
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-slate-900 dark:text-white">Total</span>
                        <span className="font-black text-red-500 text-lg">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Fields */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Custom Fields</h3>
                    <button 
                      onClick={addCustomField}
                      className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Field
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customFields.map((field, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                          <input 
                            placeholder="Label"
                            value={field.label}
                            onChange={(e) => updateCustomField(index, 'label', e.target.value)}
                            className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                          />
                        </div>
                        <div className="flex-[2] space-y-1">
                          <input 
                            placeholder="Value"
                            value={field.value}
                            onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                            className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                          />
                        </div>
                        <button 
                          onClick={() => removeCustomField(index)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 text-xs font-bold bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
                <button 
                  onClick={handleSaveAndSend}
                  className="px-4 py-2 text-xs font-bold bg-[#E11D48] text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                >
                  Save & Send
                </button>
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
                {/* Company Filter */}
                <div className="space-y-4">
                  <button className="flex items-center justify-between w-full text-sm font-bold text-slate-900 dark:text-white group">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="w-4 h-4" />
                      Company
                    </div>
                  </button>
                  
                  <div className={`p-4 rounded-xl border space-y-4 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search"
                        value={companySearch}
                        onChange={(e) => setCompanySearch(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      />
                    </div>

                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {companies.filter(c => c.name.toLowerCase().includes(companySearch.toLowerCase())).map((c, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={selectedCompanies.includes(c.name)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedCompanies([...selectedCompanies, c.name]);
                              else setSelectedCompanies(selectedCompanies.filter(name => name !== c.name));
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

                {/* Order Date Filter */}
                <div className="space-y-4">
                  <button className="flex items-center justify-between w-full text-sm font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="w-4 h-4" />
                      Order Date
                    </div>
                  </button>
                  <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="relative">
                      <input 
                        type="date"
                        value={filterOrderDate}
                        onChange={(e) => setFilterOrderDate(e.target.value)}
                        className={`w-full px-3 py-2.5 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    setSelectedCompanies([]);
                    setFilterOrderDate('');
                    setCompanySearch('');
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
