import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Building2, Upload, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Company, Invoice } from '../context/SuperAdminContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    officialEmail: '',
    officialMobile: '',
    companyAddress: '',
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        alert("Logo file size must be less than 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const companyId = Date.now().toString();
      
      // Auto-generate credentials
      const generatedUsername = formData.companyName.replace(/\s+/g, '').toLowerCase() + Math.floor(1000 + Math.random() * 9000);
      const generatedPassword = Math.random().toString(36).slice(-8);
      const generatedUniqueCode = Math.random().toString(36).substring(2, 9).toUpperCase();

      const newCompany: Company = {
        id: companyId,
        name: formData.companyName,
        email: formData.officialEmail,
        mobile: formData.officialMobile,
        subscriptionPlan: 'Basic',
        uniqueCode: generatedUniqueCode,
        logo: logoPreview || '',
        headOffice: formData.companyAddress,
        adminUsername: generatedUsername,
        adminPassword: generatedPassword,
        status: 'inactive', // Pending approval
        blockedMenus: [],
        isActive: false, // Pending approval
      };

      await setDoc(doc(db, 'companies', companyId), newCompany);
      
      // Auto-generate invoice (optional for pending companies, but keeping it for consistency)
      const plan = 'Basic';
      const rate = 100;
      const invoiceId = Date.now().toString() + '_inv';
      const newInvoice: Invoice = {
        id: invoiceId,
        companyId: companyId,
        invoiceNumber: 'INV-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [
          { id: '1', description: `Subscription Fee - ${plan}`, quantity: 1, rate: rate, amount: rate }
        ],
        total: rate,
        status: 'unpaid',
        template: 'basic',
        notes: 'Thank you for your business!',
        terms: 'Payment due within 30 days.'
      };
      await setDoc(doc(db, 'invoices', invoiceId), newInvoice);
      
      setIsLoading(false);
      alert("Registration submitted successfully! Your account is pending approval by Super Admin.");
      navigate('/login');
    } catch (err) {
      console.error("Registration failed:", err);
      setIsLoading(false);
      alert("Registration failed. Please try again. " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">HRM Pro</span>
        </Link>
        <h2 className="text-center text-3xl font-display font-bold tracking-tight text-slate-900">
          Register Your Company
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl"
      >
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">
                  Company Name
                </label>
                <div className="mt-1">
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              {/* Official Email */}
              <div>
                <label htmlFor="officialEmail" className="block text-sm font-medium text-slate-700">
                  Official Email
                </label>
                <div className="mt-1">
                  <input
                    id="officialEmail"
                    name="officialEmail"
                    type="email"
                    required
                    value={formData.officialEmail}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                    placeholder="hr@acme.com"
                  />
                </div>
              </div>

              {/* Official Mobile */}
              <div>
                <label htmlFor="officialMobile" className="block text-sm font-medium text-slate-700">
                  Official Mobile
                </label>
                <div className="mt-1">
                  <input
                    id="officialMobile"
                    name="officialMobile"
                    type="tel"
                    required
                    value={formData.officialMobile}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Company Logo */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Company Logo
                </label>
                <div className="mt-1 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-white px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <Upload className="w-4 h-4 inline-block mr-2" />
                    Upload
                    <input type="file" className="sr-only" accept="image/*" onChange={handleLogoChange} />
                  </label>
                </div>
              </div>
            </div>

            {/* Company Address */}
            <div>
              <label htmlFor="companyAddress" className="block text-sm font-medium text-slate-700">
                Company Address
              </label>
              <div className="mt-1">
                <textarea
                  id="companyAddress"
                  name="companyAddress"
                  rows={3}
                  required
                  value={formData.companyAddress}
                  onChange={handleInputChange}
                  className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border"
                  placeholder="123 Business Ave, Suite 100, City, Country"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Registering...
                  </div>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
