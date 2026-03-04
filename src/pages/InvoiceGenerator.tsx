import React, { useState, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  Plus, 
  Trash2, 
  Save, 
  Upload, 
  Download, 
  Printer, 
  FileText, 
  Settings,
  MoreHorizontal,
  Image as ImageIcon
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

type InvoiceType = 'simple' | 'tax';

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

const initialInvoiceData: InvoiceData = {
  companyName: 'Your Company Name',
  companyAddress: '123 Business Street, City, Country',
  companyPhone: '+1 234 567 890',
  companyEmail: 'contact@yourcompany.com',
  logo: null,
  
  billToName: 'Client Name',
  billToCompany: 'Client Company',
  billToAddress: '456 Client Avenue, City, Country',
  billToPhone: '+1 987 654 321',
  
  shipToName: '',
  shipToCompany: '',
  shipToAddress: '',
  shipToPhone: '',
  
  invoiceNumber: 'INV-001',
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  poNumber: '',
  
  items: [
    { id: '1', description: 'Service or Product 1', quantity: 1, rate: 100, amount: 100 },
    { id: '2', description: 'Service or Product 2', quantity: 2, rate: 50, amount: 100 },
  ],
  
  notes: 'Thank you for your business!',
  terms: 'Payment due within 14 days.',
  
  customFields: [],
  
  taxRate: 10,
  shipping: 0,
  discount: 0,
};

const presets: Record<string, InvoiceData> = {
  'Standard': initialInvoiceData,
  'Consulting': {
    ...initialInvoiceData,
    companyName: 'Tech Consulting Inc.',
    items: [
      { id: '1', description: 'Consulting Services - Week 1', quantity: 40, rate: 150, amount: 6000, taxable: true },
      { id: '2', description: 'Project Management', quantity: 10, rate: 150, amount: 1500, taxable: true },
    ]
  },
  'Product': {
    ...initialInvoiceData,
    companyName: 'Gadget Store',
    items: [
      { id: '1', description: 'Wireless Headphones', quantity: 2, rate: 199.99, amount: 399.98, taxable: true },
      { id: '2', description: 'Shipping', quantity: 1, rate: 15, amount: 15, taxable: false },
    ]
  }
};

export default function InvoiceGenerator() {
  const [activeTab, setActiveTab] = useState<InvoiceType>('simple');
  const [data, setData] = useState<InvoiceData>(initialInvoiceData);
  const [templates, setTemplates] = useState<Record<string, InvoiceData>>({});
  const invoiceRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [design, setDesign] = useState({
    color: '#4f46e5', // Indigo-600
    font: 'font-sans',
    template: 'modern'
  });

  // Calculations
  const toggleTaxable = (id: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, taxable: !item.taxable } : item
      )
    }));
  };

  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  
  const taxAmount = activeTab === 'tax' 
    ? data.items.reduce((sum, item) => sum + (item.taxable !== false ? (item.quantity * item.rate * (data.taxRate / 100)) : 0), 0)
    : 0;

  const total = subtotal + taxAmount + data.shipping - data.discount;

  const handleInputChange = (field: keyof InvoiceData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          // Recalculate amount
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const addItem = (index?: number) => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      taxable: true
    };
    
    if (index !== undefined) {
      const newItems = [...data.items];
      newItems.splice(index + 1, 0, newItem);
      setData(prev => ({ ...prev, items: newItems }));
    } else {
      setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
  };

  const deleteItem = (id: string) => {
    setData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  };

  const addCustomField = () => {
    const newField: CustomField = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'New Field',
      value: ''
    };
    setData(prev => ({ ...prev, customFields: [...prev.customFields, newField] }));
  };

  const updateCustomField = (id: string, field: keyof CustomField, value: string) => {
    setData(prev => ({
      ...prev,
      customFields: prev.customFields.map(cf => cf.id === id ? { ...cf, [field]: value } : cf)
    }));
  };

  const removeCustomField = (id: string) => {
    setData(prev => ({ ...prev, customFields: prev.customFields.filter(cf => cf.id !== id) }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setData(prev => ({ ...prev, logo: evt.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveTemplate = () => {
    const name = prompt('Enter template name:');
    if (name) {
      setTemplates(prev => ({ ...prev, [name]: data }));
      alert('Template saved!');
    }
  };

  const loadTemplate = (name: string) => {
    if (templates[name]) {
      setData(templates[name]);
    }
  };

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const importedData = JSON.parse(evt.target?.result as string);
          setData(importedData);
          alert('Invoice template loaded successfully!');
        } catch (error) {
          alert('Invalid template file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const exportTemplate = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "invoice_template.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header & Toolbar */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Invoice Generator</h1>
            <p className="text-sm text-slate-500">Create, customize, and export invoices</p>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            {/* Design Controls */}
            <div className="flex items-center gap-2 mr-4 border-r border-slate-200 pr-4">
              <div className="flex items-center gap-1">
                <label className="text-xs font-bold text-slate-500">Color:</label>
                <input 
                  type="color" 
                  value={design.color}
                  onChange={(e) => setDesign(prev => ({ ...prev, color: e.target.value }))}
                  className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                />
              </div>
              <select 
                value={design.font}
                onChange={(e) => setDesign(prev => ({ ...prev, font: e.target.value }))}
                className="text-xs border-slate-200 rounded p-1"
              >
                <option value="font-sans">Sans</option>
                <option value="font-serif">Serif</option>
                <option value="font-mono">Mono</option>
              </select>
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Load
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".json" 
              className="hidden" 
            />
            
            <button 
              onClick={saveTemplate}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            
            <button 
              onClick={exportTemplate}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
            
            <button 
              onClick={exportPDF}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print / PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('simple')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'simple' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Simple Invoice
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'tax' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sales Tax Invoice
          </button>
        </div>

        {/* Invoice Editor */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Invoice Canvas */}
          <div className="flex-1 bg-white shadow-lg rounded-xl overflow-hidden border border-slate-200">
            <div ref={invoiceRef} className={`p-8 md:p-12 min-h-[1000px] bg-white text-slate-800 ${design.font}`}>
              
              {/* Header Section */}
              <div className="flex justify-between items-start mb-12">
                <div className="w-1/2">
                  <div className="mb-4 group relative">
                    {data.logo ? (
                      <div className="relative w-40 h-20">
                        <img src={data.logo} alt="Logo" className="w-full h-full object-contain object-left" />
                        <button 
                          onClick={() => setData(prev => ({ ...prev, logo: null }))}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label 
                        className="w-40 h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                        style={{ borderColor: design.color }}
                      >
                        <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />
                        <span className="text-xs text-slate-500">Upload Logo</span>
                        <input type="file" onChange={handleLogoUpload} accept="image/*" className="hidden" />
                      </label>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <input 
                      type="text" 
                      value={data.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="text-xl font-bold w-full outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 -ml-1"
                      placeholder="Your Company Name"
                      style={{ color: design.color }}
                    />
                    <textarea 
                      value={data.companyAddress}
                      onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                      className="text-sm text-slate-500 w-full outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 -ml-1 resize-none"
                      placeholder="Address"
                      rows={2}
                    />
                    <input 
                      type="text" 
                      value={data.companyEmail}
                      onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                      className="text-sm text-slate-500 w-full outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 -ml-1"
                      placeholder="Email"
                    />
                    <input 
                      type="text" 
                      value={data.companyPhone}
                      onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                      className="text-sm text-slate-500 w-full outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 -ml-1"
                      placeholder="Phone"
                    />
                  </div>
                </div>
                
                <div className="text-right w-1/3">
                  <h2 className="text-4xl font-light text-slate-300 mb-4 uppercase tracking-widest" style={{ color: design.color }}>Invoice</h2>
                  <div className="space-y-2">
                    {/* ... (existing header fields) ... */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-600">Invoice #</span>
                      <input 
                        type="text" 
                        value={data.invoiceNumber}
                        onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                        className="text-sm text-right font-medium outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 w-32"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-600">Date</span>
                      <input 
                        type="date" 
                        value={data.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="text-sm text-right font-medium outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 w-32"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-600">Due Date</span>
                      <input 
                        type="date" 
                        value={data.dueDate}
                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                        className="text-sm text-right font-medium outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 w-32"
                      />
                    </div>
                    {activeTab === 'tax' && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-600">PO Number</span>
                        <input 
                          type="text" 
                          value={data.poNumber}
                          onChange={(e) => handleInputChange('poNumber', e.target.value)}
                          className="text-sm text-right font-medium outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 w-32"
                          placeholder="PO-000"
                        />
                      </div>
                    )}
                    
                    {/* Custom Fields in Header */}
                    {data.customFields.map((field) => (
                      <div key={field.id} className="flex justify-between items-center group">
                        <div className="flex items-center gap-1">
                          <button onClick={() => removeCustomField(field.id)} className="opacity-0 group-hover:opacity-100 text-red-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                          <input 
                            type="text"
                            value={field.label}
                            onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                            className="text-sm font-bold text-slate-600 w-24 outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1"
                          />
                        </div>
                        <input 
                          type="text" 
                          value={field.value}
                          onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                          className="text-sm text-right font-medium outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 w-32"
                        />
                      </div>
                    ))}
                    
                    <button 
                      onClick={addCustomField}
                      className="text-xs font-medium flex items-center justify-end gap-1 w-full mt-1"
                      style={{ color: design.color }}
                    >
                      <Plus className="w-3 h-3" /> Add Field
                    </button>
                  </div>
                </div>
              </div>

              {/* Bill To / Ship To */}
              <div className="flex gap-12 mb-12">
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2" style={{ color: design.color }}>Bill To</h3>
                  <div className="space-y-1">
                    <input 
                      type="text" 
                      value={data.billToName}
                      onChange={(e) => handleInputChange('billToName', e.target.value)}
                      className="font-bold w-full outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 -ml-1"
                      placeholder="Client Name"
                    />
                    <input 
                      type="text" 
                      value={data.billToCompany}
                      onChange={(e) => handleInputChange('billToCompany', e.target.value)}
                      className="text-sm w-full outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 -ml-1"
                      placeholder="Company Name"
                    />
                    <textarea 
                      value={data.billToAddress}
                      onChange={(e) => handleInputChange('billToAddress', e.target.value)}
                      className="text-sm text-slate-500 w-full outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 -ml-1 resize-none"
                      placeholder="Client Address"
                      rows={2}
                    />
                    <input 
                      type="text" 
                      value={data.billToPhone}
                      onChange={(e) => handleInputChange('billToPhone', e.target.value)}
                      className="text-sm text-slate-500 w-full outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 -ml-1"
                      placeholder="Phone"
                    />
                  </div>
                </div>
                
                {activeTab === 'tax' && (
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2" style={{ color: design.color }}>Ship To</h3>
                    <div className="space-y-1">
                      <input 
                        type="text" 
                        value={data.shipToName}
                        onChange={(e) => handleInputChange('shipToName', e.target.value)}
                        className="font-bold w-full outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 -ml-1"
                        placeholder="Recipient Name"
                      />
                      <input 
                        type="text" 
                        value={data.shipToCompany}
                        onChange={(e) => handleInputChange('shipToCompany', e.target.value)}
                        className="text-sm w-full outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 -ml-1"
                        placeholder="Company Name"
                      />
                      <textarea 
                        value={data.shipToAddress}
                        onChange={(e) => handleInputChange('shipToAddress', e.target.value)}
                        className="text-sm text-slate-500 w-full outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 -ml-1 resize-none"
                        placeholder="Shipping Address"
                        rows={2}
                      />
                      <input 
                        type="text" 
                        value={data.shipToPhone}
                        onChange={(e) => handleInputChange('shipToPhone', e.target.value)}
                        className="text-sm text-slate-500 w-full outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-1 -ml-1"
                        placeholder="Phone"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="mb-12">
                <table className="w-full">
                  <thead>
                    <tr className="text-white" style={{ backgroundColor: design.color }}>
                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider rounded-l-lg">Description</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider w-24">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider w-32">Rate</th>
                      {activeTab === 'tax' && (
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider w-20">Tax</th>
                      )}
                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider w-32 rounded-r-lg">Amount</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.items.map((item) => (
                      <tr key={item.id} className="group">
                        <td className="px-4 py-2">
                          <input 
                            type="text" 
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            className="w-full outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-2 py-1"
                            placeholder="Item description"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="number" 
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))}
                            className="w-full text-right outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-2 py-1"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="number" 
                            value={item.rate}
                            onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value))}
                            className="w-full text-right outline-none hover:bg-slate-50 focus:bg-slate-50 rounded px-2 py-1"
                          />
                        </td>
                        {activeTab === 'tax' && (
                          <td className="px-4 py-2 text-center">
                            <input 
                              type="checkbox" 
                              checked={item.taxable !== false}
                              onChange={() => toggleTaxable(item.id)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                        )}
                        <td className="px-4 py-2 text-right font-medium text-slate-700">
                          ${item.amount.toFixed(2)}
                        </td>
                        <td className="px-2 text-center">
                          <button 
                            onClick={() => deleteItem(item.id)}
                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
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
                  className="mt-4 flex items-center gap-2 text-sm font-bold px-4"
                  style={{ color: design.color }}
                >
                  <Plus className="w-4 h-4" /> Add Line Item
                </button>
              </div>

              {/* Totals & Notes */}
              <div className="flex flex-col md:flex-row gap-12">
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2" style={{ color: design.color }}>Notes</h3>
                    <textarea 
                      value={data.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full text-sm text-slate-600 outline-none hover:bg-slate-50 focus:bg-slate-50 rounded p-2 border border-transparent hover:border-slate-200 resize-none"
                      rows={4}
                      placeholder="Add notes..."
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2" style={{ color: design.color }}>Terms & Conditions</h3>
                    <textarea 
                      value={data.terms}
                      onChange={(e) => handleInputChange('terms', e.target.value)}
                      className="w-full text-sm text-slate-600 outline-none hover:bg-slate-50 focus:bg-slate-50 rounded p-2 border border-transparent hover:border-slate-200 resize-none"
                      rows={2}
                      placeholder="Add terms..."
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-1/3 space-y-3">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-medium">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {activeTab === 'tax' && (
                    <div className="flex justify-between items-center text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Tax</span>
                        <div className="flex items-center bg-slate-100 rounded px-2">
                          <input 
                            type="number" 
                            value={data.taxRate}
                            onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                            className="w-12 bg-transparent text-right outline-none text-xs py-1"
                          />
                          <span className="text-xs">%</span>
                        </div>
                      </div>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-medium">Shipping</span>
                    <div className="flex items-center bg-slate-100 rounded px-2">
                      <span className="text-xs">$</span>
                      <input 
                        type="number" 
                        value={data.shipping}
                        onChange={(e) => handleInputChange('shipping', parseFloat(e.target.value))}
                        className="w-16 bg-transparent text-right outline-none text-xs py-1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-medium">Discount</span>
                    <div className="flex items-center bg-slate-100 rounded px-2">
                      <span className="text-xs">$</span>
                      <input 
                        type="number" 
                        value={data.discount}
                        onChange={(e) => handleInputChange('discount', parseFloat(e.target.value))}
                        className="w-16 bg-transparent text-right outline-none text-xs py-1"
                      />
                    </div>
                  </div>
                  
                  <div className="h-px bg-slate-200 my-2"></div>
                  
                  <div className="flex justify-between items-center text-xl font-bold text-slate-800">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
