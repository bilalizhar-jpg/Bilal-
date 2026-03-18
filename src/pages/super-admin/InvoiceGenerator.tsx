import React, { useState, useRef, useEffect} from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { useSuperAdmin, Invoice, InvoiceItem} from '../../context/SuperAdminContext';
import { useParams, useNavigate} from 'react-router-dom';
import { 
 Plus, Trash2, Save, Printer, FileText, ArrowLeft
} from 'lucide-react';
import { jsPDF} from 'jspdf';
import { toPng} from 'html-to-image';

export default function SuperAdminInvoiceGenerator() {
 const { companies, invoices, updateInvoice} = useSuperAdmin();
 const { companyId} = useParams<{ companyId: string}>();
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
 { id: '1', description:`Subscription Fee - ${plan}`, quantity: 1, rate: rate, amount: rate}
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
 setInvoice(prev => ({ ...prev, [field]: value}));
};

 const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: any) => {
 setInvoice(prev => {
 const newItems = prev.items.map(item => {
 if (item.id === id) {
 const updatedItem = { ...item, [field]: value};
 if (field === 'quantity' || field === 'rate') {
 updatedItem.amount = updatedItem.quantity * updatedItem.rate;
}
 return updatedItem;
}
 return item;
});
 const newTotal = newItems.reduce((sum, item) => sum + item.amount, 0);
 return { ...prev, items: newItems, total: newTotal};
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
 setInvoice(prev => ({ ...prev, items: [...prev.items, newItem]}));
};

 const removeItem = (id: string) => {
 setInvoice(prev => {
 const newItems = prev.items.filter(item => item.id !== id);
 const newTotal = newItems.reduce((sum, item) => sum + item.amount, 0);
 return { ...prev, items: newItems, total: newTotal};
});
};

 const handleSave = () => {
 updateInvoice(invoice);
 alert('Invoice saved successfully!');
};

 const exportPDF = async () => {
 if (invoiceRef.current) {
 try {
 const dataUrl = await toPng(invoiceRef.current, {
 backgroundColor: '#fff',
 pixelRatio: 2,
});
 
 const pdf = new jsPDF('p', 'mm', 'a4');
 const imgProps = pdf.getImageProperties(dataUrl);
 const pdfWidth = pdf.internal.pageSize.getWidth();
 const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
 
 pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
 pdf.save(`invoice_${invoice.invoiceNumber}.pdf`);
} catch (error) {
 console.error('Error generating PDF:', error);
}
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
 <button onClick={() => navigate('/super-admin/companies')} className="p-2 hover:bg-[#2A2A3D] rounded-full text-[#B0B0C3]">
 <ArrowLeft className="w-5 h-5"/>
 </button>
 <h1 className="text-2xl font-black text-white uppercase tracking-tight">Invoice Editor</h1>
 </div>
 <div className="flex gap-2">
 <button onClick={handleSave} className="bg-[#00FFCC] text-[#1E1E2F] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#00D1FF] font-bold shadow-[0_0_8px_rgba(0,255,204,0.4)]">
 <Save className="w-4 h-4"/> Save Changes
 </button>
 <button onClick={exportPDF} className="bg-transparent border border-[#00FFCC] text-[#00FFCC] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#00FFCC] hover:text-[#1E1E2F] font-bold">
 <Printer className="w-4 h-4"/> Download PDF
 </button>
 </div>
 </div>
 
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Editor Panel */}
 <div className="lg:col-span-1 space-y-6">
 <div className="bg-[#2A2A3D] p-6 rounded-2xl border border-white/5 shadow-[0_4px_20px_rgba(0,255,204,0.05)]">
 <h3 className="font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
 <Settings className="w-4 h-4 text-[#00FFCC]"/> Invoice Details
 </h3>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-[#B0B0C3] uppercase mb-1">Invoice Number</label>
 <input 
 type="text"
 value={invoice.invoiceNumber} 
 onChange={(e) => handleUpdateField('invoiceNumber', e.target.value)}
 className="w-full px-3 py-2 bg-[#1E1E2F] border border-white/10 rounded-lg focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] text-white outline-none"
 />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-[#B0B0C3] uppercase mb-1">Date</label>
 <input 
 type="date"
 value={invoice.date} 
 onChange={(e) => handleUpdateField('date', e.target.value)}
 className="w-full px-3 py-2 bg-[#1E1E2F] border border-white/10 rounded-lg focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] text-white outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-[#B0B0C3] uppercase mb-1">Due Date</label>
 <input 
 type="date"
 value={invoice.dueDate} 
 onChange={(e) => handleUpdateField('dueDate', e.target.value)}
 className="w-full px-3 py-2 bg-[#1E1E2F] border border-white/10 rounded-lg focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] text-white outline-none"
 />
 </div>
 </div>
 <div>
 <label className="block text-xs font-bold text-[#B0B0C3] uppercase mb-1">Template</label>
 <select 
 value={invoice.template} 
 onChange={(e) => handleUpdateField('template', e.target.value)}
 className="w-full px-3 py-2 bg-[#1E1E2F] border border-white/10 rounded-lg focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] text-white outline-none"
 >
 <option value="basic">Basic</option>
 <option value="pro">Pro</option>
 <option value="enterprise">Enterprise</option>
 </select>
 </div>
 <div>
 <label className="block text-xs font-bold text-[#B0B0C3] uppercase mb-1">Status</label>
 <select 
 value={invoice.status} 
 onChange={(e) => handleUpdateField('status', e.target.value)}
 className="w-full px-3 py-2 bg-[#1E1E2F] border border-white/10 rounded-lg focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] text-white outline-none"
 >
 <option value="unpaid">Unpaid</option>
 <option value="paid">Paid</option>
 <option value="overdue">Overdue</option>
 </select>
 </div>
 </div>
 </div>

 <div className="bg-[#2A2A3D] p-6 rounded-2xl border border-white/5 shadow-[0_4px_20px_rgba(0,255,204,0.05)]">
 <h3 className="font-black text-white uppercase tracking-tight mb-4">Notes & Terms</h3>
 <div className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-[#B0B0C3] uppercase mb-1">Notes</label>
 <textarea 
 rows={3}
 value={invoice.notes} 
 onChange={(e) => handleUpdateField('notes', e.target.value)}
 className="w-full px-3 py-2 bg-[#1E1E2F] border border-white/10 rounded-lg focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] text-white outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-[#B0B0C3] uppercase mb-1">Terms</label>
 <textarea 
 rows={3}
 value={invoice.terms} 
 onChange={(e) => handleUpdateField('terms', e.target.value)}
 className="w-full px-3 py-2 bg-[#1E1E2F] border border-white/10 rounded-lg focus:border-[#00FFCC] focus:ring-1 focus:ring-[#00FFCC] text-white outline-none"
 />
 </div>
 </div>
 </div>
 </div>

 {/* Preview Panel */}
 <div className="lg:col-span-2">
 <div className="bg-[#1E1E2F] p-8 rounded-2xl min-h-[800px] flex justify-center border border-white/5">
 <div 
 ref={invoiceRef} 
 className={`bg-[#2A2A3D] w-full max-w-[800px] p-12 shadow-[0_4px_20px_rgba(0,255,204,0.05)] flex flex-col ${
 invoice.template === 'pro' ? 'border-t-[12px] border-[#00FFCC]' : 
 invoice.template === 'enterprise' ? 'border-l-[40px] border-[#00D1FF]' : ''
}`}
 >
 {/* Header */}
 <div className="flex justify-between items-start mb-12">
 <div>
 <h2 className={`text-4xl font-black mb-2 text-white ${invoice.template === 'enterprise' ? 'uppercase tracking-tighter' : ''}`}>
 INVOICE
 </h2>
 <p className="text-[#B0B0C3]">#{invoice.invoiceNumber}</p>
 </div>
 <div className="text-right">
 {company.logo ? (
 <img src={company.logo} alt="Logo"className="h-12 ml-auto mb-2"referrerPolicy="no-referrer"/>
 ) : (
 <div className="w-12 h-12 bg-[#00FFCC] rounded-lg flex items-center justify-center text-[#1E1E2F] font-black text-xl ml-auto mb-2">
 {company.name.charAt(0)}
 </div>
 )}
 <p className="font-black text-white">Super Admin System</p>
 <p className="text-sm text-[#B0B0C3]">123 Admin St, City, Country</p>
 </div>
 </div>

 {/* Info Grid */}
 <div className="grid grid-cols-2 gap-12 mb-12">
 <div>
 <h4 className="text-xs font-black text-[#00FFCC] uppercase mb-2">Bill To</h4>
 <p className="font-black text-lg text-white">{company.name}</p>
 <p className="text-[#B0B0C3]">{company.headOffice || 'Address not provided'}</p>
 <p className="text-[#B0B0C3]">{company.email}</p>
 <p className="text-[#B0B0C3]">{company.mobile}</p>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <h4 className="text-xs font-black text-[#00FFCC] uppercase mb-2">Date</h4>
 <p className="font-medium text-white">{invoice.date}</p>
 </div>
 <div>
 <h4 className="text-xs font-black text-[#00FFCC] uppercase mb-2">Due Date</h4>
 <p className="font-medium text-white">{invoice.dueDate}</p>
 </div>
 </div>
 </div>

 {/* Items Table */}
 <div className="flex-grow">
 <table className="w-full mb-8">
 <thead>
 <tr className={`border-b-2 border-white/10 text-left text-white ${invoice.template === 'pro' ? 'bg-white/5' : ''}`}>
 <th className="py-4 px-2">Description</th>
 <th className="py-4 px-2 text-center w-24">Qty</th>
 <th className="py-4 px-2 text-right w-32">Rate</th>
 <th className="py-4 px-2 text-right w-32">Amount</th>
 <th className="py-4 px-2 w-12 print:hidden"></th>
 </tr>
 </thead>
 <tbody>
 {invoice.items.map((item) => (
 <tr key={item.id} className="border-b border-white/5 group">
 <td className="py-4 px-2">
 <input 
 type="text"
 value={item.description} 
 onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
 className="w-full bg-transparent border-none focus:ring-0 p-0 text-white"
 placeholder="Item description..."
 />
 </td>
 <td className="py-4 px-2 text-center">
 <input 
 type="number"
 value={item.quantity || ''} 
 onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value ? parseInt(e.target.value) : 0)}
 className="w-full bg-transparent border-none focus:ring-0 p-0 text-center text-white"
 />
 </td>
 <td className="py-4 px-2 text-right">
 <input 
 type="number"
 value={item.rate || ''} 
 onChange={(e) => handleUpdateItem(item.id, 'rate', e.target.value ? parseFloat(e.target.value) : 0)}
 className="w-full bg-transparent border-none focus:ring-0 p-0 text-right text-white"
 />
 </td>
 <td className="py-4 px-2 text-right font-medium text-white">
 ${item.amount.toFixed(2)}
 </td>
 <td className="py-4 px-2 text-right print:hidden">
 <button 
 onClick={() => removeItem(item.id)}
 className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
 >
 <Trash2 className="w-4 h-4"/>
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 <button 
 onClick={addItem}
 className="flex items-center gap-2 text-[#00FFCC] font-black uppercase tracking-tight hover:text-[#00D1FF] print:hidden"
 >
 <Plus className="w-4 h-4"/> Add Item
 </button>
 </div>

 {/* Footer / Totals */}
 <div className="mt-12 pt-8 border-t-2 border-white/10">
 <div className="flex justify-between items-start">
 <div className="max-w-[300px]">
 <h4 className="text-xs font-black text-[#00FFCC] uppercase mb-2">Notes</h4>
 <p className="text-sm text-[#B0B0C3] whitespace-pre-wrap">{invoice.notes}</p>
 <h4 className="text-xs font-black text-[#00FFCC] uppercase mt-4 mb-2">Terms</h4>
 <p className="text-sm text-[#B0B0C3] whitespace-pre-wrap">{invoice.terms}</p>
 </div>
 <div className="w-64 space-y-2">
 <div className="flex justify-between text-[#B0B0C3]">
 <span>Subtotal</span>
 <span className="text-white">${invoice.total.toFixed(2)}</span>
 </div>
 <div className={`flex justify-between text-xl font-black pt-4 border-t border-white/10 ${
 invoice.template === 'pro' ? 'text-[#00FFCC]' : 'text-white'
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

import { Settings} from 'lucide-react';
