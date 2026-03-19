import { useState, ChangeEvent, FormEvent} from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { motion} from 'motion/react';
import { Building2, Upload, ArrowLeft, CheckCircle2} from 'lucide-react';
import { api } from '../services/api';
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
 const { name, value} = e.target;
 setFormData(prev => ({ ...prev, [name]: value}));
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
 status: 'active',
 blockedMenus: [],
 isActive: true,
};

 await api.post('companies', newCompany);

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
     { id: '1', description: `Subscription Fee - ${plan}`, quantity: 1, rate: rate, amount: rate },
   ],
   total: rate,
   status: 'unpaid',
   template: 'basic',
   notes: 'Thank you for your business!',
   terms: 'Payment due within 30 days.',
 };
 await api.post('invoices', newInvoice);
 
 setIsLoading(false);
 alert("Registration submitted successfully! Your account is pending approval by Super Admin.");
 navigate('/login');
} catch (err) {
 console.error("Registration failed:", err);
 setIsLoading(false);
 alert("Registration failed. Please try again."+ (err instanceof Error ? err.message : String(err)));
}
};

 return (
 <div className="min-h-screen bg-[#020203] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
 {/* Atmospheric Background */}
 <div className="absolute inset-0 overflow-hidden pointer-events-none">
 <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse"/>
 <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-700"/>
 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"/>
 <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"/>
 </div>

 <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
 <Link to="/"className="flex justify-center items-center gap-3 mb-8 group">
 <motion.div 
 whileHover={{ rotate: 5, scale: 1.05}}
 className="bg-gradient-to-tr from-indigo-500 to-emerald-500 p-0.5 rounded-xl shadow-lg shadow-indigo-500/20"
 >
 <div className="bg-black p-2 rounded-[10px]">
 <Building2 className="w-8 h-8 text-white"/>
 </div>
 </motion.div>
 <span className="font-display font-black text-3xl tracking-tighter text-white uppercase">HRM Pro</span>
 </Link>
 <h2 className="text-center text-4xl font-display font-black tracking-tighter text-white uppercase">
 Initialize Company
 </h2>
 <p className="mt-4 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
 Already have an account?{' '}
 <Link to="/login"className="text-indigo-400 hover:text-indigo-300 transition-colors">
 Access Terminal
 </Link>
 </p>
 </div>

 <motion.div 
 initial={{ opacity: 0, y: 20}}
 animate={{ opacity: 1, y: 0}}
 className="mt-10 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10"
 >
 <div className="glass-card py-10 px-6 sm:px-12 border border-white/5">
 <form className="space-y-8"onSubmit={handleSubmit}>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 {/* Company Name */}
 <div className="space-y-2">
 <label htmlFor="companyName"className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
 Company Designation
 </label>
 <input
 id="companyName"
 name="companyName"
 type="text"
 required
 value={formData.companyName}
 onChange={handleInputChange}
 className="block w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all py-4 px-4 text-sm"
 placeholder="ACME CORP"
 />
 </div>

 {/* Official Email */}
 <div className="space-y-2">
 <label htmlFor="officialEmail"className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
 Communication Node
 </label>
 <input
 id="officialEmail"
 name="officialEmail"
 type="email"
 required
 value={formData.officialEmail}
 onChange={handleInputChange}
 className="block w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all py-4 px-4 text-sm"
 placeholder="HR@ACME.COM"
 />
 </div>

 {/* Official Mobile */}
 <div className="space-y-2">
 <label htmlFor="officialMobile"className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
 Signal Channel
 </label>
 <input
 id="officialMobile"
 name="officialMobile"
 type="tel"
 required
 value={formData.officialMobile}
 onChange={handleInputChange}
 className="block w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all py-4 px-4 text-sm"
 placeholder="+1 (555) 000-0000"
 />
 </div>

 {/* Company Logo */}
 <div className="space-y-2">
 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
 Visual Identity
 </label>
 <div className="flex items-center gap-4">
 <div className="h-14 w-14 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10">
 {logoPreview ? (
 <img src={logoPreview} alt="Logo preview"className="h-full w-full object-cover"/>
 ) : (
 <Building2 className="h-6 w-6 text-slate-600"/>
 )}
 </div>
 <label className="cursor-pointer bg-white/5 px-4 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 hover:text-white transition-all">
 <Upload className="w-4 h-4 inline-block mr-2"/>
 Upload
 <input type="file"className="sr-only"accept="image/*"onChange={handleLogoChange} />
 </label>
 </div>
 </div>
 </div>

 {/* Company Address */}
 <div className="space-y-2">
 <label htmlFor="companyAddress"className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">
 Physical Coordinates
 </label>
 <textarea
 id="companyAddress"
 name="companyAddress"
 rows={3}
 required
 value={formData.companyAddress}
 onChange={handleInputChange}
 className="block w-full bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all py-4 px-4 text-sm"
 placeholder="123 BUSINESS AVE, SUITE 100, CITY, COUNTRY"
 />
 </div>

 <motion.button
 whileHover={{ scale: 1.01}}
 whileTap={{ scale: 0.99}}
 type="submit"
 disabled={isLoading}
 className="w-full flex justify-center py-4 px-4 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-50 transition-all disabled:opacity-50 shadow-lg shadow-white/5"
 >
 {isLoading ? (
 <div className="flex items-center gap-3">
 <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"/>
 Processing...
 </div>
 ) : (
 'Finalize Initialization'
 )}
 </motion.button>
 </form>
 </div>
 </motion.div>
 </div>
 );
}
