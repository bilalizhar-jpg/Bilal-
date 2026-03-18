import React, { useState, useEffect, useCallback} from 'react';
import { Link} from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useAuth} from '../../context/AuthContext';
import { MessageSquare, ShieldCheck, Save, ExternalLink, RefreshCw, Send, X, AlertCircle} from 'lucide-react';
import { motion, AnimatePresence} from 'motion/react';

export default function WhatsAppIntegration() {
 const { user} = useAuth();
  const companyId = user?.companyId || 'default_company';

 const [status, setStatus] = useState<'connected' | 'disconnected' | 'qr_ready' | 'loading'>('loading');
 const [qrCode, setQrCode] = useState<string | null>(null);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [testMessage, setTestMessage] = useState({ number: '', text: 'Hello from ERP!'});
 const [isSending, setIsSending] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const fetchStatus = useCallback(async () => {
 try {
 const response = await fetch(`/api/whatsapp/status?company_id=${companyId}`);
 
 if (response.status === 429) {
 console.warn('Status API rate limit exceeded. Retrying later...');
 return;
}

 if (!response.ok) {
 const text = await response.text();
 console.error(`Status API error (${response.status}):`, text.substring(0, 100));
 setStatus('disconnected');
 return;
}

 const contentType = response.headers.get('content-type');
 if (!contentType || !contentType.includes('application/json')) {
 console.error('Received non-JSON response from status API. Server might be restarting.');
 return;
}

 const data = await response.json();
 setStatus(data.status);
 if (data.qr) {
 setQrCode(data.qr);
} else {
 setQrCode(null);
}
} catch (err: any) {
 if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
 // This is expected when the server is restarting or network is down
 console.debug('WhatsApp status fetch failed (server likely restarting)');
} else {
 console.error('Failed to fetch status:', err.message);
}
 setStatus('disconnected');
}
}, [companyId]);

 useEffect(() => {
 fetchStatus();
 const interval = setInterval(fetchStatus, 10000); // Polling every 10 seconds to avoid rate limits
 return () => clearInterval(interval);
}, [fetchStatus]);

 // Auto-close modal when connected
 useEffect(() => {
 if (status === 'connected' && isModalOpen) {
 const timer = setTimeout(() => {
 setIsModalOpen(false);
 setQrCode(null);
}, 1500); // Small delay to show"Connected"state if we add it, or just close
 return () => clearTimeout(timer);
}
}, [status, isModalOpen]);

 const handleConnect = async () => {
 setStatus('loading');
 setIsModalOpen(true);
 try {
 const response = await fetch('/api/whatsapp/connect', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json'},
 body: JSON.stringify({ company_id: companyId}),
});
 const data = await response.json();
 setStatus(data.status);
 if (data.qr) setQrCode(data.qr);
} catch (err) {
 setError('Failed to initiate connection');
 setStatus('disconnected');
}
};

 const handleDisconnect = async () => {
 if (!confirm('Are you sure you want to disconnect WhatsApp?')) return;
 
 setStatus('loading');
 try {
 const response = await fetch('/api/whatsapp/disconnect', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json'},
 body: JSON.stringify({ company_id: companyId}),
});
 if (!response.ok) throw new Error('Failed to disconnect');
 setStatus('disconnected');
 setQrCode(null);
} catch (err: any) {
 setError(err.message || 'Failed to disconnect');
 fetchStatus(); // Refresh status to be sure
}
};

 const handleSendTest = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSending(true);
 setError(null);
 try {
 const response = await fetch('/api/whatsapp/send', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json'},
 body: JSON.stringify({
 company_id: companyId,
 to_number: testMessage.number,
 message: testMessage.text,
}),
});
 const data = await response.json();
 if (data.error) throw new Error(data.error);
 alert('Test message sent successfully!');
} catch (err: any) {
 setError(err.message);
} finally {
 setIsSending(false);
}
};

 return (
 <AdminLayout>
 <div className="max-w-4xl">
 <div className="mb-8">
 <h1 className={`text-2xl font-bold mb-2 text-slate-800`}>
 WhatsApp Integration
 </h1>
 <p className={`text-slate-500`}>
 Connect your WhatsApp account to send automated notifications directly from the ERP.
 </p>
 </div>

 {error && (
 <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500">
 <AlertCircle className="w-5 h-5"/>
 <p className="text-sm font-medium">{error}</p>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 <div className="md:col-span-2 space-y-6">
 {/* Connection Status Card */}
 <div className={`rounded-xl border bg-white border-slate-200 overflow-hidden`}>
 <div className="p-6">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-3">
 <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
 status === 'connected' 
 ? ('bg-emerald-50 text-emerald-600')
 : ('bg-slate-50 text-slate-600')
}`}>
 <MessageSquare className="w-6 h-6"/>
 </div>
 <div>
 <h3 className={`text-lg font-bold text-slate-800`}>WhatsApp Status</h3>
 <div className="flex items-center gap-2">
 <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
 <span className={`text-sm font-medium text-slate-500`}>
 {status === 'connected' ? 'Connected' : status === 'qr_ready' ? 'Waiting for Scan' : 'Disconnected'}
 </span>
 </div>
 </div>
 </div>
 
 <div className="flex gap-3">
 {status === 'connected' ? (
 <button
 onClick={handleDisconnect}
 className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
 'text-red-600 hover:bg-red-50'
}`}
 >
 Disconnect
 </button>
 ) : (
 <button
 onClick={handleConnect}
 className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
 >
 <RefreshCw className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
 {status === 'qr_ready' ? 'Show QR Code' : 'Connect WhatsApp'}
 </button>
 )}
 </div>
 </div>

 {status === 'connected' && (
 <div className={`mt-6 p-4 rounded-lg bg-emerald-50 border border-emerald-100`}>
 <div className="flex items-center gap-2 text-emerald-600 mb-2">
 <ShieldCheck className="w-4 h-4"/>
 <span className="text-sm font-bold">Secure Connection Active</span>
 </div>
 <p className={`text-xs text-emerald-700/70`}>
 Your session is saved and will auto-reconnect if the server restarts.
 </p>
 </div>
 )}
 </div>
 </div>

 {/* Test Message Form */}
 {status === 'connected' && (
 <div className="space-y-6">
 <div className={`rounded-xl border bg-white border-slate-200 overflow-hidden`}>
 <div className="p-6 border-b border-inherit">
 <h3 className={`text-lg font-bold mb-4 text-slate-800`}>Send Test Message</h3>
 <form onSubmit={handleSendTest} className="space-y-4">
 <div>
 <label className={`block text-sm font-medium mb-1.5 text-slate-700`}>
 Recipient Number (with country code)
 </label>
 <input
 type="text"
 value={testMessage.number}
 onChange={(e) => setTestMessage({ ...testMessage, number: e.target.value})}
 placeholder="e.g. 923001234567"
 className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
}`}
 required
 />
 </div>
 <div>
 <label className={`block text-sm font-medium mb-1.5 text-slate-700`}>
 Message
 </label>
 <textarea
 value={testMessage.text}
 onChange={(e) => setTestMessage({ ...testMessage, text: e.target.value})}
 rows={3}
 className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${
 'bg-white border-slate-200 text-slate-900'
}`}
 required
 />
 </div>
 <button
 type="submit"
 disabled={isSending}
 className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
 >
 {isSending ? (
 <RefreshCw className="w-4 h-4 animate-spin"/>
 ) : (
 <Send className="w-4 h-4"/>
 )}
 Send Message
 </button>
 </form>
 </div>
 </div>

 {/* WhatsApp Rules Subheading */}
 <div className="pt-4">
 <h2 className={`text-xl font-bold mb-4 text-slate-800`}>
 WhatsApp Rules
 </h2>
 <div className={`p-6 rounded-xl border bg-white border-slate-200`}>
 <div className="flex items-center justify-between">
 <div>
 <h4 className={`font-bold text-slate-800`}>Automated Alerts & Rules</h4>
 <p className={`text-sm text-slate-500`}>
 Configure automated attendance alerts and other business rules for WhatsApp.
 </p>
 </div>
 <Link 
 to="/setup-rules"
 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors"
 >
 Configure Rules
 </Link>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Guidelines */}
 <div className="space-y-6">
 <div className={`p-6 rounded-xl border bg-white border-slate-200`}>
 <h3 className={`font-bold mb-4 text-slate-800`}>System Limits</h3>
 <ul className="space-y-3">
 {[
 'Max 20 messages per minute',
 '2-5 second delay between messages',
 'Multi-tenant session isolation',
 'Automatic session persistence',
 ].map((limit, i) => (
 <li key={i} className="flex items-center gap-2 text-sm">
 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
 <span className={'text-slate-600'}>{limit}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 </div>
 </div>

 {/* QR Code Modal */}
 <AnimatePresence>
 {isModalOpen && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <motion.div
 initial={{ opacity: 0, scale: 0.95}}
 animate={{ opacity: 1, scale: 1}}
 exit={{ opacity: 0, scale: 0.95}}
 className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden bg-white`}
 >
 <div className="p-6">
 <div className="flex items-center justify-between mb-6">
 <h3 className={`text-xl font-bold text-slate-800`}>Scan QR Code</h3>
 <button 
 onClick={() => setIsModalOpen(false)}
 className={`p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400`}
 >
 <X className="w-5 h-5"/>
 </button>
 </div>

 <div className="flex flex-col items-center justify-center py-8">
 {status === 'connected' ? (
 <motion.div 
 initial={{ scale: 0.5, opacity: 0}}
 animate={{ scale: 1, opacity: 1}}
 className="text-center"
 >
 <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
 <ShieldCheck className="w-10 h-10 text-emerald-500"/>
 </div>
 <h3 className={`text-xl font-bold mb-2 text-slate-900`}>
 Successfully Connected!
 </h3>
 <p className={'text-slate-500'}>
 This window will close automatically...
 </p>
 </motion.div>
 ) : qrCode ? (
 <div className="p-4 bg-white rounded-xl shadow-inner mb-6">
 <img src={qrCode} alt="WhatsApp QR Code"className="w-64 h-64"/>
 </div>
 ) : (
 <div className="w-64 h-64 flex flex-col items-center justify-center gap-4 bg-slate-100 rounded-xl mb-6">
 <RefreshCw className="w-8 h-8 animate-spin text-emerald-500"/>
 <p className="text-sm text-slate-500">Generating QR Code...</p>
 </div>
 )}

 <div className="text-center space-y-2">
 <p className={`font-bold text-slate-800`}>Open WhatsApp on your phone</p>
 <p className={`text-sm text-slate-500`}>
 Go to Settings &gt; Linked Devices &gt; Link a Device
 </p>
 </div>
 </div>

 <div className={`mt-6 p-4 rounded-xl text-center text-sm bg-slate-50 text-slate-600`}>
 The QR code will automatically refresh. Once scanned, this window will close.
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </AdminLayout>
 );
}
