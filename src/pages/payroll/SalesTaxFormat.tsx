import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  FileText, 
  Save, 
  Edit3,
  X,
  Settings,
  Image as ImageIcon
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';

interface TaxField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'number' | 'date';
}

export default function SalesTaxFormat() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isEditing, setIsEditing] = useState(false);
  
  const [taxData, setTaxData] = useState({
    certificateNo: '001/2026',
    dateOfIssue: '2026-02-27',
    periodFrom: '2025-07-01',
    periodTo: '2026-06-30',
    taxPayerName: 'John Doe',
    address: '123 Business Road, Tech City',
    ntn: '1234567-8',
    cnic: '42101-1234567-1',
    status: 'Individual',
    amountOfPayment: '500000',
    taxCollected: '50000',
    section: '153(1)(b)',
    description: 'Payment for services rendered'
  });

  const [customFields, setCustomFields] = useState<TaxField[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');

  const handleAddCustomField = () => {
    if (newFieldLabel.trim()) {
      const newField: TaxField = {
        id: Math.random().toString(36).substr(2, 9),
        label: newFieldLabel,
        value: '',
        type: 'text'
      };
      setCustomFields([...customFields, newField]);
      setNewFieldLabel('');
    }
  };

  const handleRemoveCustomField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const updateCustomFieldValue = (id: string, value: string) => {
    setCustomFields(customFields.map(f => f.id === id ? { ...f, value } : f));
  };

  const handleSave = () => {
    setIsEditing(false);
    alert("Tax format saved successfully!");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Sales Tax Format / Income Tax Certificate</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                isEditing ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isEditing ? 'Save Changes' : 'Edit Format'}
            </button>
            <button className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-700">
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button className="flex items-center gap-2 bg-[#28A745] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#218838]">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Certificate Content */}
        <div className={`max-w-4xl mx-auto p-12 shadow-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-xl space-y-8 print:shadow-none print:border-none print:p-0`}>
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-wider">Certificate of Collection or Deduction of Income Tax</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">(Under Section 164 of the Income Tax Ordinance, 2001)</p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-500 uppercase text-[10px]">Certificate No.</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={taxData.certificateNo}
                    onChange={(e) => setTaxData({...taxData, certificateNo: e.target.value})}
                    className="border rounded px-2 py-1 bg-transparent dark:border-slate-700"
                  />
                ) : (
                  <span className="font-medium text-slate-800 dark:text-white">{taxData.certificateNo}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-500 uppercase text-[10px]">Date of Issue</label>
                {isEditing ? (
                  <input 
                    type="date" 
                    value={taxData.dateOfIssue}
                    onChange={(e) => setTaxData({...taxData, dateOfIssue: e.target.value})}
                    className="border rounded px-2 py-1 bg-transparent dark:border-slate-700"
                  />
                ) : (
                  <span className="font-medium text-slate-800 dark:text-white">{taxData.dateOfIssue}</span>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-500 uppercase text-[10px]">Period From</label>
                {isEditing ? (
                  <input 
                    type="date" 
                    value={taxData.periodFrom}
                    onChange={(e) => setTaxData({...taxData, periodFrom: e.target.value})}
                    className="border rounded px-2 py-1 bg-transparent dark:border-slate-700"
                  />
                ) : (
                  <span className="font-medium text-slate-800 dark:text-white">{taxData.periodFrom}</span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-500 uppercase text-[10px]">Period To</label>
                {isEditing ? (
                  <input 
                    type="date" 
                    value={taxData.periodTo}
                    onChange={(e) => setTaxData({...taxData, periodTo: e.target.value})}
                    className="border rounded px-2 py-1 bg-transparent dark:border-slate-700"
                  />
                ) : (
                  <span className="font-medium text-slate-800 dark:text-white">{taxData.periodTo}</span>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Tax Payer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Name of Tax Payer</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={taxData.taxPayerName}
                      onChange={(e) => setTaxData({...taxData, taxPayerName: e.target.value})}
                      className="border rounded px-2 py-1 bg-transparent dark:border-slate-700"
                    />
                  ) : (
                    <span className="font-medium text-slate-800 dark:text-white">{taxData.taxPayerName}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Address</label>
                  {isEditing ? (
                    <textarea 
                      value={taxData.address}
                      onChange={(e) => setTaxData({...taxData, address: e.target.value})}
                      className="border rounded px-2 py-1 bg-transparent dark:border-slate-700 h-20"
                    />
                  ) : (
                    <span className="font-medium text-slate-800 dark:text-white">{taxData.address}</span>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500 uppercase text-[10px]">NTN No.</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={taxData.ntn}
                      onChange={(e) => setTaxData({...taxData, ntn: e.target.value})}
                      className="border rounded px-2 py-1 bg-transparent dark:border-slate-700"
                    />
                  ) : (
                    <span className="font-medium text-slate-800 dark:text-white">{taxData.ntn}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500 uppercase text-[10px]">CNIC No.</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={taxData.cnic}
                      onChange={(e) => setTaxData({...taxData, cnic: e.target.value})}
                      className="border rounded px-2 py-1 bg-transparent dark:border-slate-700"
                    />
                  ) : (
                    <span className="font-medium text-slate-800 dark:text-white">{taxData.cnic}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-500 uppercase text-[10px]">Status</label>
                  {isEditing ? (
                    <select 
                      value={taxData.status}
                      onChange={(e) => setTaxData({...taxData, status: e.target.value})}
                      className="border rounded px-2 py-1 bg-transparent dark:border-slate-700"
                    >
                      <option>Individual</option>
                      <option>Company</option>
                      <option>AOP</option>
                    </select>
                  ) : (
                    <span className="font-medium text-slate-800 dark:text-white">{taxData.status}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 space-y-6">
            <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">Tax Deduction Details</h3>
            <div className="overflow-hidden border border-slate-100 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px]">Description of Payment</th>
                    <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px]">Section</th>
                    <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px]">Amount of Payment</th>
                    <th className="px-4 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px]">Tax Collected/Deducted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={taxData.description}
                          onChange={(e) => setTaxData({...taxData, description: e.target.value})}
                          className="w-full border rounded px-2 py-1 bg-transparent dark:border-slate-700"
                        />
                      ) : (
                        <span className="text-slate-800 dark:text-white">{taxData.description}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={taxData.section}
                          onChange={(e) => setTaxData({...taxData, section: e.target.value})}
                          className="w-full border rounded px-2 py-1 bg-transparent dark:border-slate-700"
                        />
                      ) : (
                        <span className="text-slate-800 dark:text-white">{taxData.section}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={taxData.amountOfPayment}
                          onChange={(e) => setTaxData({...taxData, amountOfPayment: e.target.value})}
                          className="w-full border rounded px-2 py-1 bg-transparent dark:border-slate-700 text-right"
                        />
                      ) : (
                        <span className="text-slate-800 dark:text-white font-mono text-right block">{parseFloat(taxData.amountOfPayment).toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={taxData.taxCollected}
                          onChange={(e) => setTaxData({...taxData, taxCollected: e.target.value})}
                          className="w-full border rounded px-2 py-1 bg-transparent dark:border-slate-700 text-right"
                        />
                      ) : (
                        <span className="text-slate-800 dark:text-white font-bold font-mono text-right block">{parseFloat(taxData.taxCollected).toLocaleString()}</span>
                      )}
                    </td>
                  </tr>
                  {/* Custom Fields Row */}
                  {customFields.map(field => (
                    <tr key={field.id}>
                      <td className="px-4 py-3">
                        <span className="text-slate-800 dark:text-white">{field.label}</span>
                      </td>
                      <td className="px-4 py-3">-</td>
                      <td className="px-4 py-3" colSpan={2}>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              value={field.value}
                              onChange={(e) => updateCustomFieldValue(field.id, e.target.value)}
                              className="flex-1 border rounded px-2 py-1 bg-transparent dark:border-slate-700"
                            />
                            <button onClick={() => handleRemoveCustomField(field.id)} className="text-red-500 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-800 dark:text-white">{field.value || 'N/A'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {isEditing && (
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
                <input 
                  type="text" 
                  placeholder="New field label..." 
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  className="flex-1 border rounded px-3 py-2 text-sm bg-white dark:bg-slate-900 dark:border-slate-700"
                />
                <button 
                  onClick={handleAddCustomField}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Custom Field
                </button>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-12 grid grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Authorized Signature</p>
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-800 dark:text-white">Bdtask HRM Pro</p>
                <p className="text-slate-500">Tax Withholding Agent</p>
                <p className="text-slate-500">NTN: 9876543-2</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                This is a computer generated certificate and does not require a physical signature. 
                The tax collected/deducted has been deposited in the Government Treasury.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print\:shadow-none { box-shadow: none !important; }
          .print\:border-none { border: none !important; }
          .print\:p-0 { padding: 0 !important; }
        }
      `}</style>
    </AdminLayout>
  );
}
