import React, { useState, useRef, useEffect } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { useParams } from 'react-router-dom';
import { 
  Plus, Trash2, Save, Upload, Download, Printer, FileText, Settings, MoreHorizontal, Image as ImageIcon
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// ... (Invoice types and interfaces from InvoiceGenerator.tsx) ...
type InvoiceType = 'simple' | 'tax';
type InvoiceTemplate = 'basic' | 'pro' | 'enterprise';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  tax?: number; // percentage
  amount: number;
  [key: string]: any; // Allow custom fields
}

interface CustomField {
  id: string;
  label: string;
  value: string;
}

interface InvoiceData {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  logo: string | null;
  
  billToName: string;
  billToCompany: string;
  billToAddress: string;
  billToPhone: string;
  billToEmail: string;
  
  shipToName: string;
  shipToCompany: string;
  shipToAddress: string;
  shipToPhone: string;
  
  invoiceNumber: string;
  date: string;
  dueDate: string;
  poNumber: string;
  
  items: InvoiceItem[];
  
  notes: string;
  terms: string;
  
  customFields: CustomField[];
  
  // Tax specific
  taxRate: number;
  shipping: number;
  discount: number;
}

export default function SuperAdminInvoiceGenerator() {
  const { companies } = useSuperAdmin();
  const { companyId } = useParams<{ companyId: string }>();
  const company = companies.find(c => c.id === companyId);
  
  const [data, setData] = useState<InvoiceData>({
    companyName: 'Super Admin System',
    companyAddress: '123 Admin St, City, Country',
    companyPhone: '+92 3074429879',
    companyEmail: 'admin@system.com',
    logo: null,
    
    billToName: company?.name || 'Client Name',
    billToCompany: company?.name || 'Client Company',
    billToAddress: company?.headOffice || 'Client Address',
    billToPhone: company?.mobile || '',
    billToEmail: company?.email || '',
    
    shipToName: '',
    shipToCompany: '',
    shipToAddress: '',
    shipToPhone: '',
    
    invoiceNumber: 'INV-' + Date.now().toString().slice(-6),
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    poNumber: '',
    
    items: [
      { id: '1', description: 'Subscription Fee - ' + (company?.subscriptionPlan || 'Basic'), quantity: 1, rate: 100, amount: 100, taxable: true },
    ],
    
    notes: 'Thank you for your business!',
    terms: 'Payment due within 14 days.',
    
    customFields: [],
    
    taxRate: 10,
    shipping: 0,
    discount: 0,
  });

  const invoiceRef = useRef<HTMLDivElement>(null);
  const [design, setDesign] = useState({ color: '#4f46e5', font: 'font-sans' });
  const [activeTab, setActiveTab] = useState<InvoiceType>('simple');
  const [template, setTemplate] = useState<InvoiceTemplate>('basic');

  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxAmount = activeTab === 'tax' ? data.items.reduce((sum, item) => sum + (item.taxable !== false ? (item.quantity * item.rate * (data.taxRate / 100)) : 0), 0) : 0;
  const total = subtotal + taxAmount + data.shipping - data.discount;

  const exportPDF = async () => {
    if (invoiceRef.current) {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`invoice_${data.invoiceNumber}.pdf`);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Generate Invoice for {company?.name}</h1>
        <div className="flex gap-2">
          <select value={template} onChange={(e) => setTemplate(e.target.value as InvoiceTemplate)} className="border rounded px-3 py-2">
            <option value="basic">Basic Template</option>
            <option value="pro">Pro Template</option>
            <option value="enterprise">Enterprise Template</option>
          </select>
          <button onClick={exportPDF} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <Printer className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>
      
      <div ref={invoiceRef} className={`bg-white p-12 rounded-xl shadow-sm border border-slate-200 ${template === 'pro' ? 'border-indigo-500' : template === 'enterprise' ? 'border-2 border-slate-900' : ''}`}>
        <h2 className={`text-xl font-bold mb-4 ${template === 'enterprise' ? 'uppercase tracking-widest' : ''}`}>Invoice</h2>
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="font-bold">{data.companyName}</p>
            <p className="text-sm text-slate-500">{data.companyAddress}</p>
            <p className="text-sm text-slate-500">{data.companyPhone}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">Bill To:</p>
            <p>{data.billToCompany}</p>
            <p className="text-sm text-slate-500">{data.billToAddress}</p>
            <p className="text-sm text-slate-500">{data.billToEmail}</p>
            <p className="text-sm text-slate-500">{data.billToPhone}</p>
          </div>
        </div>
        
        <table className={`w-full mb-8 ${template === 'pro' ? 'border-collapse' : ''}`}>
          <thead className={template === 'pro' ? 'bg-indigo-50' : ''}>
            <tr className="border-b">
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map(item => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.description}</td>
                <td className="text-right py-2">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className={`text-right text-xl font-bold ${template === 'enterprise' ? 'border-t-2 border-slate-900 pt-4' : ''}`}>
          Total: ${total.toFixed(2)}
        </div>
      </div>
    </SuperAdminLayout>
  );
}
