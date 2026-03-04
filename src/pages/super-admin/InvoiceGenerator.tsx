import React, { useState, useRef, useEffect } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { useSuperAdmin, Invoice, InvoiceItem } from '../../context/SuperAdminContext';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, Trash2, Save, Printer, FileText, ArrowLeft
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function SuperAdminInvoiceGenerator() {
  const { companies, invoices, updateInvoice } = useSuperAdmin();
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const company = companies.find(c => c.id === companyId);
  
  // Find existing invoice or create a default one
  const existingInvoice = invoices.find(inv => inv.companyId === companyId);
  
  const [invoice, setInvoice] = useState<Invoice>(() => {
    if (existingInvoice) return existingInvoice;
    
    const plan = company?.subscriptionPlan || 'Basic';
    const rate = plan === 'Enterprise' ? 1000 : plan === 'Pro' ? 500 : 100;
    
    return {
      id: Date.now().toString(),
      companyId: companyId || '',
      invoiceNumber: 'INV-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [
        { id: '1', description: `Subscription Fee - ${plan}`, quantity: 1, rate: rate, amount: rate }
      ],
      total: rate,
      status: 'unpaid',
      template: plan.toLowerCase() as any,
      notes: 'Thank you for your business!',
      terms: 'Payment due within 30 days.'
    };
  });

  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleUpdateField = (field: keyof Invoice, value: any) => {
    setInvoice(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => {
      const newItems = prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      });
      const newTotal = newItems.reduce((sum, item) => sum + item.amount, 0);
      return { ...prev, items: newItems, total: newTotal };
    });
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setInvoice(prev => {
      const newItems = prev.items.filter(item => item.id !== id);
      const newTotal = newItems.reduce((sum, item) => sum + item.amount, 0);
      return { ...prev, items: newItems, total: newTotal };
    });
  };

  const handleSave = () => {
    updateInvoice(invoice);
    alert('Invoice saved successfully!');
  };

  const exportPDF = async () => {
    if (invoiceRef.current) {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice_${invoice.invoiceNumber}.pdf`);
    }
  };

  if (!company) {
    return (
      <SuperAdminLayout>
        <div className="p-8 text-center">
          <p className="text-slate-500">Company not found.</p>
          <button onClick={() => navigate('/super-admin/companies')} className="mt-4 text-indigo-600 hover:underline">
            Back to Companies
          </button>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/super-admin/companies')} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">Invoice Editor</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700">
            <Save className="w-4 h-4" /> Save Changes
          </button>
          <button onClick={exportPDF} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
            <Printer className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Invoice Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Invoice Number</label>
                <input 
                  type="text" 
                  value={invoice.invoiceNumber} 
                  onChange={(e) => handleUpdateField('invoiceNumber', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Date</label>
                  <input 
                    type="date" 
                    value={invoice.date} 
                    onChange={(e) => handleUpdateField('date', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Due Date</label>
                  <input 
                    type="date" 
                    value={invoice.dueDate} 
                    onChange={(e) => handleUpdateField('dueDate', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Template</label>
                <select 
                  value={invoice.template} 
                  onChange={(e) => handleUpdateField('template', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Status</label>
                <select 
                  value={invoice.status} 
                  onChange={(e) => handleUpdateField('status', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold mb-4">Notes & Terms</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Notes</label>
                <textarea 
                  rows={3}
                  value={invoice.notes} 
                  onChange={(e) => handleUpdateField('notes', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Terms</label>
                <textarea 
                  rows={3}
                  value={invoice.terms} 
                  onChange={(e) => handleUpdateField('terms', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <div className="bg-slate-100 p-8 rounded-xl min-h-[800px] flex justify-center">
            <div 
              ref={invoiceRef} 
              className={`bg-white w-full max-w-[800px] p-12 shadow-xl flex flex-col ${
                invoice.template === 'pro' ? 'border-t-[12px] border-indigo-600' : 
                invoice.template === 'enterprise' ? 'border-l-[40px] border-slate-900' : ''
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className={`text-4xl font-bold mb-2 ${invoice.template === 'enterprise' ? 'uppercase tracking-tighter' : ''}`}>
                    INVOICE
                  </h2>
                  <p className="text-slate-500">#{invoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  {company.logo ? (
                    <img src={company.logo} alt="Logo" className="h-12 ml-auto mb-2" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl ml-auto mb-2">
                      {company.name.charAt(0)}
                    </div>
                  )}
                  <p className="font-bold">Super Admin System</p>
                  <p className="text-sm text-slate-500">123 Admin St, City, Country</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Bill To</h4>
                  <p className="font-bold text-lg">{company.name}</p>
                  <p className="text-slate-600">{company.headOffice || 'Address not provided'}</p>
                  <p className="text-slate-600">{company.email}</p>
                  <p className="text-slate-600">{company.mobile}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Date</h4>
                    <p className="font-medium">{invoice.date}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Due Date</h4>
                    <p className="font-medium">{invoice.dueDate}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="flex-grow">
                <table className="w-full mb-8">
                  <thead>
                    <tr className={`border-b-2 border-slate-200 text-left ${invoice.template === 'pro' ? 'bg-slate-50' : ''}`}>
                      <th className="py-4 px-2">Description</th>
                      <th className="py-4 px-2 text-center w-24">Qty</th>
                      <th className="py-4 px-2 text-right w-32">Rate</th>
                      <th className="py-4 px-2 text-right w-32">Amount</th>
                      <th className="py-4 px-2 w-12 print:hidden"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 group">
                        <td className="py-4 px-2">
                          <input 
                            type="text" 
                            value={item.description} 
                            onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 p-0"
                            placeholder="Item description..."
                          />
                        </td>
                        <td className="py-4 px-2 text-center">
                          <input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-center"
                          />
                        </td>
                        <td className="py-4 px-2 text-right">
                          <input 
                            type="number" 
                            value={item.rate} 
                            onChange={(e) => handleUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-right"
                          />
                        </td>
                        <td className="py-4 px-2 text-right font-medium">
                          ${item.amount.toFixed(2)}
                        </td>
                        <td className="py-4 px-2 text-right print:hidden">
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button 
                  onClick={addItem}
                  className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-700 print:hidden"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              {/* Footer / Totals */}
              <div className="mt-12 pt-8 border-t-2 border-slate-200">
                <div className="flex justify-between items-start">
                  <div className="max-w-[300px]">
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Notes</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{invoice.notes}</p>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mt-4 mb-2">Terms</h4>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{invoice.terms}</p>
                  </div>
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span>${invoice.total.toFixed(2)}</span>
                    </div>
                    <div className={`flex justify-between text-xl font-bold pt-4 border-t ${
                      invoice.template === 'pro' ? 'text-indigo-600' : ''
                    }`}>
                      <span>Total</span>
                      <span>${invoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}

import { Settings } from 'lucide-react';
