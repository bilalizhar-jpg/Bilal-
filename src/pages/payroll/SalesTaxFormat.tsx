import React, { useState } from 'react';
import { Printer, Download, Plus, Trash2, Edit3, Save } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';

interface TaxField {
  id: number;
  label: string;
  value: string;
}

interface TaxDetails {
  sNo: string;
  dateOfIssue: string;
  certifiedAmount: string;
  certifiedAmountWords: string;
  collectedFrom: string;
  nationalTaxNumber: string;
  cnic: string;
  periodFrom: string;
  periodTo: string;
  underSection: string;
  onAccountOf: string;
  onValueAmount: string;
  companyName: string;
  address: string;
  ntn: string;
  signatureName: string;
  designation: string;
  date: string;
}

export default function SalesTaxFormat() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isEditing, setIsEditing] = useState(false);

  const [taxDetails, setTaxDetails] = useState<TaxDetails>({
    sNo: '1',
    dateOfIssue: '2022-09-01',
    certifiedAmount: '16,408',
    certifiedAmountWords: 'Sixteen Thousand Four Hundred and Eight',
    collectedFrom: 'Muhammad Saad Khan',
    nationalTaxNumber: '',
    cnic: '36401-5216534-1',
    periodFrom: '2022-07-01',
    periodTo: '2023-06-30',
    underSection: '149',
    onAccountOf: 'Salary',
    onValueAmount: '1,094,500',
    companyName: 'ALGOREPUBLIC',
    address: '614 Siddeeq Trade Center Gulberg Lahore',
    ntn: '7389217-1',
    signatureName: '',
    designation: '',
    date: ''
  });

  const [customFields, setCustomFields] = useState<TaxField[]>([
    { id: 1, label: 'Deposit Date', value: '' },
    { id: 2, label: 'Treasury', value: '' },
    { id: 3, label: 'Branch/City', value: '' },
    { id: 4, label: 'Account', value: '' },
    { id: 5, label: 'Challan Treasury/INSTR No.', value: '' },
  ]);

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaxDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = (id: number, field: 'label' | 'value', value: string) => {
    setCustomFields(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const addCustomField = () => {
    const newId = customFields.length > 0 ? Math.max(...customFields.map(f => f.id)) + 1 : 1;
    setCustomFields(prev => [...prev, { id: newId, label: 'New Field', value: '' }]);
  };

  const removeCustomField = (id: number) => {
    setCustomFields(prev => prev.filter(f => f.id !== id));
  };

  const handleSave = () => {
    setIsEditing(false);
    alert('Saving tax format details...');
    console.log({ taxDetails, customFields });
  };

  return (
    <AdminLayout>
      <div className={`p-6 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Certificate of Collection or Deduction of Income Tax</h1>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="bg-slate-600 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-slate-700">
              <Printer size={16} /> Print
            </button>
            <button onClick={() => { isEditing ? handleSave() : setIsEditing(true) }} className={`${isEditing ? 'bg-green-600' : 'bg-indigo-600'} text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-opacity-90`}>
              {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
              {isEditing ? 'Save Changes' : 'Edit Format'}
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField label="S.No." name="sNo" value={taxDetails.sNo} onChange={handleDetailChange} isEditing={isEditing} />
            <InputField label="Original/Duplicate" value="Original/Duplicate" readOnly />
            <InputField label="Date of Issue" name="dateOfIssue" value={taxDetails.dateOfIssue} onChange={handleDetailChange} type="date" isEditing={isEditing} />
          </div>

          {/* Main Details */}
          <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Certified that the sum of Rupees <InputField inline name="certifiedAmount" value={taxDetails.certifiedAmount} onChange={handleDetailChange} isEditing={isEditing} />
              (<InputField inline name="certifiedAmountWords" value={taxDetails.certifiedAmountWords} onChange={handleDetailChange} isEditing={isEditing} />) on account of income tax has been deducted/collected from <InputField inline name="collectedFrom" value={taxDetails.collectedFrom} onChange={handleDetailChange} isEditing={isEditing} />.
            </p>
            <InputField label="having National Tax Number" name="nationalTaxNumber" value={taxDetails.nationalTaxNumber} onChange={handleDetailChange} isEditing={isEditing} />
            <InputField label="holder of CNIC No" name="cnic" value={taxDetails.cnic} onChange={handleDetailChange} isEditing={isEditing} />
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">Or during the period</span>
              <InputField label="From" name="periodFrom" value={taxDetails.periodFrom} onChange={handleDetailChange} type="date" isEditing={isEditing} />
              <InputField label="To" name="periodTo" value={taxDetails.periodTo} onChange={handleDetailChange} type="date" isEditing={isEditing} />
            </div>
            <InputField label="under section" name="underSection" value={taxDetails.underSection} onChange={handleDetailChange} isEditing={isEditing} />
            <InputField label="on account of" name="onAccountOf" value={taxDetails.onAccountOf} onChange={handleDetailChange} isEditing={isEditing} />
            <InputField label="on the value/amount of Rupee" name="onValueAmount" value={taxDetails.onValueAmount} onChange={handleDetailChange} isEditing={isEditing} />
          </div>

          {/* Custom Fields Section */}
          <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-700 dark:text-slate-300">Deposit Details</h3>
              {isEditing && (
                <button onClick={addCustomField} className="bg-emerald-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-600">
                  <Plus size={14} /> Add Field
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {customFields.map(field => (
                <div key={field.id} className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <input 
                        type="text" 
                        value={field.label}
                        onChange={(e) => handleCustomFieldChange(field.id, 'label', e.target.value)}
                        className={`flex-grow border rounded px-3 py-2 text-sm font-bold outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      />
                      <input 
                        type="text" 
                        value={field.value}
                        onChange={(e) => handleCustomFieldChange(field.id, 'value', e.target.value)}
                        className={`flex-grow border rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200'}`}
                      />
                      <button onClick={() => removeCustomField(field.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full">
                      <label className="text-xs font-bold text-slate-500 mb-1 block">{field.label}</label>
                      <p className={`w-full border rounded px-3 py-2 text-sm ${isDark ? 'bg-slate-800/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}>{field.value || 'N/A'}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Company & Signature */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
            <div className="space-y-4">
              <InputField label="Company / office etc. collecting/deducting the tax" name="companyName" value={taxDetails.companyName} onChange={handleDetailChange} isEditing={isEditing} />
              <InputField label="Address" name="address" value={taxDetails.address} onChange={handleDetailChange} isEditing={isEditing} as="textarea" />
              <InputField label="NTN (if any)" name="ntn" value={taxDetails.ntn} onChange={handleDetailChange} isEditing={isEditing} />
            </div>
            <div className="space-y-4">
              <InputField label="Signature" name="signatureName" value={taxDetails.signatureName} onChange={handleDetailChange} isEditing={isEditing} />
              <InputField label="Designation" name="designation" value={taxDetails.designation} onChange={handleDetailChange} isEditing={isEditing} />
              <InputField label="Date" name="date" value={taxDetails.date} onChange={handleDetailChange} type="date" isEditing={isEditing} />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

interface InputFieldProps {
  label?: string;
  name?: keyof TaxDetails | string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  readOnly?: boolean;
  inline?: boolean;
  isEditing?: boolean;
  as?: 'input' | 'textarea';
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, type = 'text', readOnly = false, inline = false, isEditing = false, as = 'input' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const commonClass = `border rounded px-3 py-2 text-sm outline-none ${isDark ? 'border-slate-700 text-white' : 'border-slate-200'}`;
  const editingClass = isEditing ? `focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-slate-800' : 'bg-white'}` : `${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`;
  const finalClass = `${commonClass} ${editingClass}`;

  if (inline) {
    return <input type={type} name={name} value={value} onChange={onChange} readOnly={!isEditing || readOnly} className={`${finalClass} inline-block w-auto mx-1`} />;
  }

  return (
    <div>
      {label && <label className="text-xs font-bold text-slate-500 mb-1 block">{label}</label>}
      {as === 'textarea' ? (
        <textarea name={name} value={value} onChange={onChange} readOnly={!isEditing || readOnly} className={`${finalClass} w-full h-24`}></textarea>
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} readOnly={!isEditing || readOnly} className={`${finalClass} w-full`} />
      )}
    </div>
  );
};